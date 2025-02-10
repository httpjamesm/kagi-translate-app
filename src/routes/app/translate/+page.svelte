<script lang="ts">
  import {
    IconHeart,
    IconX,
    IconArrowsExchange,
    IconVolume,
    IconPlayerStop,
    IconLoader2,
    IconMicrophone,
  } from "@tabler/icons-svelte";
  import { invoke } from "@tauri-apps/api/core";
  import {
    type Language,
    languages,
    needsRomanization,
  } from "$lib/constants/languages";
  import { onDestroy, onMount } from "svelte";
  import Database from "@tauri-apps/plugin-sql";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import LanguageSelectionModal from "$lib/components/LanguageSelectionModal.svelte";
  import IconButton from "$lib/components/IconButton.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { t } from "$lib/translations";

  interface SpeechResponse {
    content_type: string;
    data: number[];
  }

  let sourceLanguage = $state<Language>(languages[0]);
  let targetLanguage = $state<Language>(languages[1]);
  let sourceText = $state("");
  let translatedText = $state("");
  let romanization = $state("");
  let debounceTimer: number;
  let isLoading = $state(false);
  let isFavorited = $state(false);
  let db: any;
  let showSourceModal = $state(false);
  let showTargetModal = $state(false);
  let detectedLanguage = $state("");
  let previousText = $state("");
  let currentTranslationId = $state(0);

  // Add state tracking for audio
  let audioState = $state<"idle" | "loading" | "playing">("idle");
  let currentPlayingText = $state<string | null>(null);

  // Add new state variables after the other state declarations
  let recordingState = $state<"idle" | "recording" | "loading">("idle");
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];

  const doLanguageDetection = async () => {
    try {
      const language: string = await invoke("detect_language", {
        text: sourceText,
      });
      if (language === "undetermined") {
        throw new Error("Failed to detect language");
      } else {
        detectedLanguage = language;
      }
    } catch (e) {
      detectedLanguage = "";
    }
  };

  const doTranslation = async () => {
    const thisTranslationId = ++currentTranslationId;
    isLoading = true;
    romanization = "";

    try {
      if (sourceText.length === 0) return;
      // Only update if this is still the most recent translation request
      if (thisTranslationId === currentTranslationId) {
        translatedText = await invoke("get_translation", {
          sourceLanguage:
            sourceLanguage.apiName === "Automatic"
              ? ""
              : sourceLanguage.apiName,
          targetLanguage: targetLanguage.apiName,
          text: sourceText,
        });

        // Only get romanization for languages that need it
        if (needsRomanization(targetLanguage)) {
          romanization = await invoke("get_romanization", {
            text: translatedText,
            language: targetLanguage.apiName,
          });
        }
      }
    } catch (e) {
      console.error(e);
      if (thisTranslationId === currentTranslationId) {
        translatedText = $t("common.failedToTranslate");
        romanization = "";
      }
    } finally {
      if (thisTranslationId === currentTranslationId) {
        isLoading = false;
      }
    }
  };

  $effect(() => {
    if (sourceText === previousText) return;
    previousText = sourceText;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doLanguageDetection();
      doTranslation();
    }, 500);
  });

  // retrieve languages from local storage on page load
  const loadSavedState = () => {
    const savedSourceLanguage = window.localStorage.getItem("sourceLanguage");
    const savedTargetLanguage = window.localStorage.getItem("targetLanguage");
    const savedSourceText = window.localStorage.getItem("sourceText");
    const savedTranslatedText = window.localStorage.getItem("translatedText");

    if (savedSourceLanguage)
      sourceLanguage =
        languages.find((l) => l.apiName === savedSourceLanguage) ||
        languages[0];
    if (savedTargetLanguage)
      targetLanguage =
        languages.find((l) => l.apiName === savedTargetLanguage) ||
        languages[1];
    if (savedSourceText) sourceText = savedSourceText;
    if (savedTranslatedText) translatedText = savedTranslatedText;
  };

  const PCM_PROCESSOR = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.hasStartedPlaying = false;
    this.port.onmessage = (e) => {
      if (e.data.command === 'clear') {
        this.buffer = [];
        this.hasStartedPlaying = false;
      } else if (e.data.samples) {
        this.buffer.push(...e.data.samples);
        this.hasStartedPlaying = true;
      }
    };
  }

  process(inputs, outputs) {
    const output = outputs[0][0];
    for (let i = 0; i < output.length; i++) {
      output[i] = this.buffer.shift() || 0;
    }
    
    // Only send finished message if we've started playing and run out of samples
    if (this.hasStartedPlaying && this.buffer.length === 0) {
      this.port.postMessage({ status: 'finished' });
      this.hasStartedPlaying = false;
    }
    
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
`;

  let audioContext: AudioContext | null = null;
  let audioWorkletNode: AudioWorkletNode | null = null;

  onMount(async () => {
    loadSavedState();
    db = await Database.load("sqlite:kagi-translate.db");

    // Initialize audio context
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });

    // Add the audio worklet
    const blob = new Blob([PCM_PROCESSOR], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    await audioContext.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);

    // Create and connect the worklet node
    audioWorkletNode = new AudioWorkletNode(audioContext, "pcm-processor");
    audioWorkletNode.port.onmessage = (e) => {
      if (e.data.status === "finished") {
        audioState = "idle";
        currentPlayingText = null;
      }
    };
    audioWorkletNode.connect(audioContext.destination);
  });

  onDestroy(() => {
    clearTimeout(debounceTimer);
    stopAudio();
    if (audioContext) {
      audioContext.close();
    }
  });

  $effect(() => {
    if (sourceText || translatedText) {
      window.localStorage.setItem("sourceText", sourceText);
      window.localStorage.setItem("translatedText", translatedText);
    }
  });

  const toggleFavorite = async () => {
    try {
      await selectionFeedback();
    } catch {}
    try {
      if (!isFavorited) {
        await db.execute(
          `INSERT INTO favorites (source_text, translated_text, source_language, target_language) 
           VALUES ($1, $2, $3, $4)`,
          [
            sourceText,
            translatedText,
            sourceLanguage.apiName === "Automatic"
              ? detectedLanguage || "Unknown"
              : sourceLanguage.apiName,
            targetLanguage.apiName,
          ]
        );
        isFavorited = true;
      } else {
        await db.execute(
          `DELETE FROM favorites 
           WHERE source_text = $1 
           AND translated_text = $2 
           AND source_language = $3 
           AND target_language = $4`,
          [
            sourceText,
            translatedText,
            sourceLanguage.apiName,
            targetLanguage.apiName,
          ]
        );
        isFavorited = false;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkIsCurrentTranslationFavorited = async () => {
    const result = await db.select(
      `SELECT COUNT(*) as count FROM favorites 
         WHERE source_text = $1 
         AND translated_text = $2 
         AND source_language = $3 
         AND target_language = $4`,
      [
        sourceText,
        translatedText,
        sourceLanguage.apiName,
        targetLanguage.apiName,
      ]
    );
    isFavorited = result[0].count > 0;
  };

  // Add effect to check if current translation is favorited
  $effect(() => {
    if (sourceText && translatedText) {
      checkIsCurrentTranslationFavorited();
    }
  });

  const swapLanguages = () => {
    if (sourceLanguage.apiName !== "Automatic") {
      const tempSource = sourceLanguage;
      sourceLanguage = targetLanguage;
      targetLanguage = tempSource;
      sourceText = translatedText;
    }
  };

  $effect(() => {
    window.localStorage.setItem("sourceLanguage", sourceLanguage.apiName);
    window.localStorage.setItem("targetLanguage", targetLanguage.apiName);
  });

  const stopAudio = () => {
    if (audioWorkletNode) {
      audioWorkletNode.port.postMessage({ command: "clear" });
      audioState = "idle";
      currentPlayingText = null;
    }
  };

  const playAudio = async (text: string, language: string) => {
    // If already playing this text, stop it
    if (audioState === "playing" && currentPlayingText === text) {
      stopAudio();
      return;
    }

    try {
      await selectionFeedback();
    } catch {}

    try {
      if (!audioContext || !audioWorkletNode) {
        console.error("Audio context not initialized");
        return;
      }

      audioState = "loading";
      currentPlayingText = text;

      const response = await invoke<SpeechResponse>("get_speech", {
        text,
        language,
      });

      // If the state changed while we were loading (user clicked stop), don't play
      if (audioState !== "loading" || currentPlayingText !== text) {
        return;
      }

      // Resume audio context if suspended
      await audioContext.resume();

      // Clear any existing audio
      audioWorkletNode.port.postMessage({ command: "clear" });

      // Convert the PCM data to float32 samples
      const int16Data = new Int16Array(new Uint8Array(response.data).buffer);
      const float32Data = new Float32Array(int16Data.length);

      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768;
      }

      audioState = "playing";

      // Send the samples to the worklet
      audioWorkletNode.port.postMessage({ samples: float32Data });
    } catch (e) {
      console.error("Speech synthesis error:", e);
      audioState = "idle";
      currentPlayingText = null;
    }
  };

  // Add the recording functions after the other function declarations
  const startRecording = async () => {
    try {
      await selectionFeedback();
    } catch {}

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia not supported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingState = "recording";

      mediaRecorder = new MediaRecorder(stream);
      const currentRecorder = mediaRecorder;
      audioChunks = [];

      mediaRecorder.start();

      // Auto-stop after 4 minutes 50 seconds
      setTimeout(() => {
        if (
          currentRecorder === mediaRecorder &&
          mediaRecorder?.state === "recording"
        ) {
          stopRecording();
        }
      }, 290000);

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        recordingState = "loading";
        isLoading = true;

        try {
          const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          const transcription = await invoke<string>("get_transcription", {
            audioData: Array.from(uint8Array),
          });

          sourceText = transcription;
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          recordingState = "idle";
          isLoading = false;
        }
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      recordingState = "idle";
      isLoading = false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };
</script>

<div class="translate-container">
  <div class="language-selector">
    <button
      class="language-button"
      onclick={() => (showSourceModal = true)}
      disabled={isLoading}
    >
      {sourceLanguage.apiName === "Automatic"
        ? `${$t("common.detect")} (${languages.find((l) => l.apiName === detectedLanguage)?.displayName || $t("common.auto")})`
        : sourceLanguage.displayName}
    </button>

    <IconButton
      icon={IconArrowsExchange}
      onclick={swapLanguages}
      disabled={sourceLanguage.apiName === "Automatic" || isLoading}
    />

    <button
      class="language-button"
      onclick={() => (showTargetModal = true)}
      disabled={isLoading}
    >
      {targetLanguage.displayName}
    </button>
  </div>

  <div class="translation-area">
    <div class="source-text">
      <div class="language-label">{sourceLanguage.displayName}</div>
      <textarea
        class="text-content"
        placeholder="Enter text"
        bind:value={sourceText}
      ></textarea>
      <div class="actions">
        {#if sourceText}
          <IconButton
            icon={IconX}
            onclick={async () => {
              if (isLoading) return;
              try {
                await selectionFeedback();
              } catch {}
              sourceText = "";
              translatedText = "";
              window.localStorage.removeItem("sourceText");
              window.localStorage.removeItem("translatedText");
            }}
            disabled={isLoading}
          />
        {/if}
        <IconButton
          icon={recordingState === "recording"
            ? IconPlayerStop
            : IconMicrophone}
          onclick={() => {
            if (recordingState === "recording") {
              stopRecording();
            } else {
              startRecording();
            }
          }}
          disabled={isLoading || recordingState === "loading"}
          color={recordingState === "recording" ? "var(--primary)" : undefined}
        />
        <IconButton
          icon={audioState === "playing" && currentPlayingText === sourceText
            ? IconPlayerStop
            : IconVolume}
          loading={audioState === "loading" &&
            currentPlayingText === sourceText}
          onclick={() =>
            playAudio(
              sourceText,
              sourceLanguage.apiName === "Automatic"
                ? detectedLanguage
                : sourceLanguage.apiName
            )}
          disabled={!sourceText ||
            isLoading ||
            (sourceLanguage.apiName === "Automatic" && !detectedLanguage) ||
            (audioState === "loading" && currentPlayingText !== sourceText) ||
            (audioState === "playing" && currentPlayingText !== sourceText)}
        />
        <CopyButton text={sourceText} />
      </div>
    </div>

    <div class="translated-text">
      <div class="language-label">{targetLanguage.displayName}</div>
      {#if isLoading}
        <div class="skeleton-loader">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      {:else}
        <div class="text-content">
          {#if translatedText}
            <div>{translatedText}</div>
            {#if romanization}
              <div class="romanization">{romanization}</div>
            {/if}
          {:else}
            <span class="placeholder"
              >{$t("common.translationWillAppearHere")}</span
            >
          {/if}
        </div>
      {/if}
      <div class="actions">
        <CopyButton text={translatedText} />
        <IconButton
          icon={audioState === "playing" &&
          currentPlayingText === translatedText
            ? IconPlayerStop
            : IconVolume}
          loading={audioState === "loading" &&
            currentPlayingText === translatedText}
          onclick={() => playAudio(translatedText, targetLanguage.apiName)}
          disabled={!translatedText ||
            isLoading ||
            (audioState === "loading" &&
              currentPlayingText !== translatedText) ||
            (audioState === "playing" && currentPlayingText !== translatedText)}
        />
        <IconButton
          icon={IconHeart}
          color={isFavorited ? "var(--primary)" : undefined}
          disabled={translatedText.length === 0}
          onclick={toggleFavorite}
        />
      </div>
    </div>
  </div>
</div>

<LanguageSelectionModal
  show={showSourceModal}
  {languages}
  includeAutomatic={true}
  selectedLanguage={sourceLanguage}
  onSelect={(language) => {
    sourceLanguage = language;
    showSourceModal = false;
    doTranslation();
  }}
  onClose={() => (showSourceModal = false)}
/>

<LanguageSelectionModal
  show={showTargetModal}
  {languages}
  includeAutomatic={false}
  selectedLanguage={targetLanguage}
  onSelect={(language) => {
    targetLanguage = language;
    showTargetModal = false;
    doTranslation();
  }}
  onClose={() => (showTargetModal = false)}
/>

<style lang="scss">
  .translate-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
  }

  .language-selector {
    display: flex;
    gap: 1rem;
    width: 100%;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;

    .language-button {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
      box-sizing: border-box;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.2s ease;
      color: var(--text-primary);

      &:hover {
        border-color: var(--border-hover);
        background-color: var(--surface-hover);
      }

      &:focus {
        outline: none;
        border-color: #5ba7d1;
        box-shadow: 0 0 0 3px rgba(91, 167, 209, 0.1);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        &:hover {
          border-color: var(--border);
          background-color: var(--surface);
        }
      }
    }
  }

  .translation-area {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media only screen and (min-width: 768px) {
      flex-direction: row;
    }
  }

  .source-text,
  .translated-text {
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border-radius: 0.5rem;
    padding: 1rem;
    box-sizing: border-box;
    width: 100%;
    min-height: fit-content;

    @media only screen and (min-width: 768px) {
      height: 100%;
    }
  }

  .language-label {
    align-self: flex-start;
  }

  .text-content {
    flex: 1;
    font-size: 1.25rem;
    line-height: 1.4;
    color: var(--text-primary);
    overflow-y: auto;

    .romanization {
      color: var(--text-secondary);
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .placeholder {
      color: var(--text-placeholder);
    }

    &:is(textarea) {
      width: 100%;
      border: none;
      resize: none;
      background: none;
      font-family: inherit;
      padding: 0;
      min-height: 100px;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: var(--text-placeholder);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .input-area {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    box-sizing: border-box;

    input {
      flex: 1;
      border: none;
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: #999;
      }
    }
  }

  .skeleton-loader {
    padding: 0.5rem 0;
    flex: 1;
  }

  .skeleton-line {
    height: 1.25rem;
    background: linear-gradient(
      90deg,
      var(--skeleton-start) 25%,
      var(--skeleton-mid) 50%,
      var(--skeleton-start) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 0.25rem;
    margin-bottom: 0.75rem;

    &:nth-child(2) {
      width: 85%;
    }

    &:nth-child(3) {
      width: 65%;
    }
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
