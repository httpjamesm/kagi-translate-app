<script lang="ts">
  import {
    IconHeart,
    IconX,
    IconArrowsExchange,
    IconVolume,
    IconPlayerStop,
    IconSettings,
    IconMicrophone,
    IconArrowsRightLeft,
  } from "@tabler/icons-svelte";
  import { invoke } from "@tauri-apps/api/core";
  import {
    type Language,
    languages,
    needsRomanization,
  } from "$lib/constants/languages";
  import { onDestroy, onMount, tick } from "svelte";
  import Database from "@tauri-apps/plugin-sql";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import LanguageSelectionModal from "$lib/components/LanguageSelectionModal.svelte";
  import IconButton from "$lib/components/IconButton.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { t } from "$lib/translations";
  import TranslationStyleModal from "$lib/components/TranslationStyleModal.svelte";
  import LockCog from "@tabler/icons-svelte/icons/lock-cog";
  import InsightDrawer from "$lib/components/InsightDrawer.svelte";

  interface SpeechResponse {
    content_type: string;
    data: number[];
  }

  interface AlternativeTranslation {
    translation: string;
    explanation: string;
  }

  interface AlternativeTranslationsResponse {
    originalDescription: string;
    elements: AlternativeTranslation[];
  }

  interface WordVariation {
    text: string;
    explanation: string;
  }

  interface WordInsight {
    id: string;
    originalText: string;
    variations: WordVariation[];
    type: string;
  }

  interface WordInsightsResponse {
    markedTranslation: string;
    insights: WordInsight[];
  }

  interface DetectedLanguage {
    iso: string;
    label: string;
  }

  interface Definition {
    word: string;
    partOfSpeech?: string[];
    usageLevel?: string[];
    primaryMeaning?: string;
    secondaryMeanings?: string[];
    examples?: string[];
    pronunciation?: string;
    etymology?: string;
    raw?: string;
  }

  interface TranslationResponse {
    translation: string;
    detectedLanguage: DetectedLanguage;
    definition?: Definition;
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
  let isUrl = $state(false);
  let definition = $state<Definition | null>(null);

  // Add state tracking for audio
  let audioState = $state<"idle" | "loading" | "playing">("idle");
  let currentPlayingText = $state<string | null>(null);

  let showStyleModal = $state(false);
  // Add new state variables after the other state declarations
  let recordingState = $state<"idle" | "recording" | "loading">("idle");
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];

  // State for alternative translations
  let isLoadingAlternatives = $state(false);
  let alternativeTranslations = $state<AlternativeTranslation[]>([]);
  let alternativeTranslationsDescription = $state("");

  // State for word insights
  let isLoadingInsights = $state(false);
  let wordInsights = $state<WordInsight[]>([]);
  let markedTranslation = $state("");
  let selectedInsight = $state<WordInsight | null>(null);
  let insightPosition = $state<{ top: number; left: number } | null>(null);

  // Add mobile detection variable
  let isMobileDevice = $state(false);

  // Function to check if text is a URL
  const isValidUrl = (text: string): boolean => {
    try {
      const urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$", // fragment locator
        "i"
      );
      return urlPattern.test(text);
    } catch (e) {
      return false;
    }
  };

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
    // Reset alternatives when doing a new translation
    alternativeTranslations = [];
    // Reset insights
    wordInsights = [];
    markedTranslation = "";
    selectedInsight = null;
    definition = null;

    // Check if source text is a URL
    isUrl = isValidUrl(sourceText);

    try {
      if (sourceText.length === 0) return;

      // Handle URLs differently
      if (isUrl) {
        // For URLs, just set the translated text to be the same as source
        translatedText = sourceText;
        isLoading = false;
        return;
      }

      // Only update if this is still the most recent translation request
      if (thisTranslationId === currentTranslationId) {
        const response: TranslationResponse = await invoke("get_translation", {
          sourceLanguage:
            sourceLanguage.apiName === "Automatic"
              ? ""
              : sourceLanguage.apiName,
          targetLanguage: targetLanguage.apiName,
          text: sourceText,
          settings: JSON.stringify({
            speaker_gender:
              window.localStorage
                .getItem("translationSpeakerGender")
                ?.toLowerCase() || "unknown",
            addressee_gender:
              window.localStorage
                .getItem("translationAddresseeGender")
                ?.toLowerCase() || "unknown",
            translation_style:
              window.localStorage.getItem("translationStyle")?.toLowerCase() ||
              "natural",
            formality_level:
              window.localStorage
                .getItem("translationFormality")
                ?.toLowerCase() || "neutral",
            context: window.localStorage.getItem("translationContext") || "",
          }),
        });

        translatedText = response.translation;
        if (response.definition) {
          definition = response.definition;
        }

        // Only get romanization for languages that need it
        if (needsRomanization(targetLanguage)) {
          romanization = await invoke("get_romanization", {
            text: translatedText,
            language: targetLanguage.apiName,
          });
        }

        // Fetch both alternative translations and word insights after a successful translation
        if (translatedText && !isUrl) {
          Promise.all([getAlternativeTranslations(), getWordInsights()]);
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

  const getAlternativeTranslations = async () => {
    if (!sourceText || !translatedText) return;

    isLoadingAlternatives = true;
    try {
      const response: AlternativeTranslationsResponse = await invoke(
        "get_alternative_translations",
        {
          sourceLanguage:
            sourceLanguage.apiName === "Automatic"
              ? detectedLanguage
              : sourceLanguage.apiName,
          targetLanguage: targetLanguage.apiName,
          originalText: sourceText,
          existingTranslation: translatedText,
          settings: JSON.stringify({
            speaker_gender:
              window.localStorage
                .getItem("translationSpeakerGender")
                ?.toLowerCase() || "unknown",
            addressee_gender:
              window.localStorage
                .getItem("translationAddresseeGender")
                ?.toLowerCase() || "unknown",
            translation_style:
              window.localStorage.getItem("translationStyle")?.toLowerCase() ||
              "natural",
            formality_level:
              window.localStorage
                .getItem("translationFormality")
                ?.toLowerCase() || "neutral",
            context: window.localStorage.getItem("translationContext") || "",
          }),
        }
      );

      alternativeTranslations = response.elements;
      alternativeTranslationsDescription = response.originalDescription;
    } catch (error) {
      console.error("Failed to get alternative translations:", error);
    } finally {
      isLoadingAlternatives = false;
    }
  };

  const getWordInsights = async () => {
    if (!sourceText || !translatedText) return;

    isLoadingInsights = true;
    try {
      const response: WordInsightsResponse = await invoke("get_word_insights", {
        originalText: sourceText,
        translatedText: translatedText,
        targetExplanationLanguage:
          sourceLanguage.apiName === "Automatic"
            ? detectedLanguage
            : sourceLanguage.apiName,
        settings: JSON.stringify({
          speaker_gender:
            window.localStorage
              .getItem("translationSpeakerGender")
              ?.toLowerCase() || "unknown",
          addressee_gender:
            window.localStorage
              .getItem("translationAddresseeGender")
              ?.toLowerCase() || "unknown",
          translation_style:
            window.localStorage.getItem("translationStyle")?.toLowerCase() ||
            "natural",
          formality_level:
            window.localStorage
              .getItem("translationFormality")
              ?.toLowerCase() || "neutral",
          context: window.localStorage.getItem("translationContext") || "",
        }),
      });

      wordInsights = response.insights;
      // Check if markedTranslation contains proper HTML or just <>
      if (response.markedTranslation.includes("<span data-insight-id=")) {
        markedTranslation = response.markedTranslation;
      } else {
        // If markedTranslation doesn't contain proper spans, generate HTML manually
        let text = translatedText;
        // Sort insights by their position in the text to process from end to beginning
        // This prevents offsets from changing when we insert HTML
        const sortedInsights = [...wordInsights].sort((a, b) => {
          const posA = text.indexOf(a.originalText);
          const posB = text.indexOf(b.originalText);
          return posB - posA; // Process from end to beginning
        });

        // Replace each word with a span
        for (const insight of sortedInsights) {
          const pos = text.indexOf(insight.originalText);
          if (pos !== -1) {
            text =
              text.substring(0, pos) +
              `<span data-insight-id="${insight.id}" class="insight-word">${insight.originalText}</span>` +
              text.substring(pos + insight.originalText.length);
          }
        }
        markedTranslation = text;
      }
    } catch (error) {
      console.error("Failed to get word insights:", error);
    } finally {
      isLoadingInsights = false;
    }
  };

  const showInsight = async (insightId: string, event: MouseEvent) => {
    const insight = wordInsights.find((i) => i.id === insightId);
    if (insight) {
      // Reset first to ensure reactivity triggers popup rendering if needed
      selectedInsight = null;
      insightPosition = null;
      await tick(); // Wait for Svelte to update the DOM

      selectedInsight = insight;

      // Only calculate position if not on mobile (drawer handles its own positioning)
      if (!isMobileDevice) {
        // Calculate initial position
        const initialTop = event.clientY + 10;
        const initialLeft = event.clientX - 100; // Center roughly under cursor

        // Popup dimensions (adjust if CSS changes)
        const popupWidth = 300 + 2 * 12 + 2 * 1; // width + padding*2 + border*2 = 326
        // Height is variable, making bottom collision harder without measuring.
        // We'll just prevent it going off the top/left/right for now.

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let finalLeft = initialLeft;
        let finalTop = initialTop;

        // Prevent going off the right edge
        if (initialLeft + popupWidth > viewportWidth) {
          finalLeft = viewportWidth - popupWidth - 10; // Adjust with margin
        }

        // Prevent going off the left edge
        if (finalLeft < 0) {
          finalLeft = 10; // Adjust with margin
        }

        // Prevent going off the top edge (unlikely with +10, but good practice)
        if (finalTop < 0) {
          finalTop = 10;
        }

        insightPosition = {
          top: finalTop,
          left: finalLeft,
        };
      }
    }
  };

  const closeInsight = () => {
    selectedInsight = null;
    insightPosition = null;
  };

  const renderMarkedTranslation = () => {
    if (!markedTranslation || wordInsights.length === 0) {
      return translatedText;
    }

    return markedTranslation;
  };

  $effect(() => {
    if (sourceText === previousText) return;
    previousText = sourceText;

    clearTimeout(debounceTimer);

    if (!sourceText) {
      translatedText = "";
      romanization = "";
      alternativeTranslations = [];
      wordInsights = [];
      markedTranslation = "";
      selectedInsight = null;
      return;
    }

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

    // Check if user is on a mobile device
    isMobileDevice = window.innerWidth < 768;

    // Listen for resize events to update mobile detection
    const handleResize = () => {
      isMobileDevice = window.innerWidth < 768;
    };

    window.addEventListener("resize", handleResize);

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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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

  const handleStyleSettingsChange = () => {
    if (sourceText) {
      doTranslation();
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

      {#if definition && !isUrl}
        <div class="definition-section">
          <div class="definition-word">
            {definition.word}
            {#if definition.pronunciation}
              <span class="pronunciation">{definition.pronunciation}</span>
            {/if}
          </div>

          {#if definition.partOfSpeech && definition.partOfSpeech.length > 0}
            <div class="part-of-speech">
              {definition.partOfSpeech.join(", ")}
              {#if definition.usageLevel && definition.usageLevel.length > 0}
                <span class="usage-level"
                  >{definition.usageLevel.join(", ")}</span
                >
              {/if}
            </div>
          {/if}

          {#if definition.primaryMeaning}
            <div class="meaning-section">
              <div class="primary-meaning">{definition.primaryMeaning}</div>

              {#if definition.secondaryMeanings && definition.secondaryMeanings.length > 0}
                <div class="secondary-meanings">
                  <ul>
                    {#each definition.secondaryMeanings as meaning}
                      <li>{meaning}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          {/if}

          {#if definition.examples && definition.examples.length > 0}
            <div class="examples-section">
              <div class="examples-heading">Examples:</div>
              <ul class="examples-list">
                {#each definition.examples as example}
                  <li>{example}</li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if definition.etymology}
            <div class="etymology">{definition.etymology}</div>
          {/if}
        </div>
      {/if}

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
              definition = null;
              window.localStorage.removeItem("sourceText");
              window.localStorage.removeItem("translatedText");
            }}
            disabled={isLoading}
          />
        {/if}
        <IconButton
          icon={IconSettings}
          onclick={() => (showStyleModal = true)}
        />
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
        <div
          class="text-content"
          onclick={(e) => {
            const target = e.target as HTMLElement;
            if (target.hasAttribute("data-insight-id")) {
              showInsight(target.getAttribute("data-insight-id")!, e);
            }
          }}
        >
          {#if translatedText}
            <div>
              {#if isUrl}
                <a
                  href="https://translate.kagi.com/translate/{targetLanguage.isoCode}/{encodeURIComponent(
                    sourceText
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translatedText}
                </a>
              {:else if wordInsights.length > 0 && markedTranslation}
                {@html renderMarkedTranslation()}
              {:else}
                {translatedText}
              {/if}
            </div>
            {#if romanization && !isUrl}
              <div class="romanization">{romanization}</div>
            {/if}

            {#if !isUrl && (isLoadingAlternatives || isLoadingInsights)}
              <div class="alternatives-section">
                <div class="skeleton-loader">
                  <div class="skeleton-line" style="width: 90%"></div>
                  <div class="skeleton-line" style="width: 60%"></div>
                </div>
                <div class="alternatives-list">
                  <div class="alternative-item skeleton">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line" style="width: 85%"></div>
                  </div>
                  <div class="alternative-item skeleton">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line" style="width: 70%"></div>
                  </div>
                  <div class="alternative-item skeleton">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line" style="width: 75%"></div>
                  </div>
                </div>
              </div>
            {:else if !isUrl && alternativeTranslations.length > 0}
              <div class="alternatives-section">
                {#if alternativeTranslationsDescription}
                  <div class="alternatives-description">
                    {alternativeTranslationsDescription}
                  </div>
                {/if}
                <div class="alternatives-list">
                  {#each alternativeTranslations as alt}
                    <div class="alternative-item">
                      <div class="alternative-translation">
                        {alt.translation}
                      </div>
                      {#if alt.explanation}
                        <div class="alternative-explanation">
                          {alt.explanation}
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
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
            isUrl ||
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
{#if isMobileDevice}
  {#if selectedInsight}
    <InsightDrawer insight={selectedInsight} onClose={closeInsight} />
  {/if}
{:else if selectedInsight}
  {#if insightPosition}
    <div
      class="insight-popup"
      style="top: {insightPosition.top}px; left: {insightPosition.left}px"
    >
      <div class="insight-header">
        <div class="insight-word-text">{selectedInsight.originalText}</div>
        <button class="insight-close" onclick={closeInsight}>
          <IconX size={16} />
        </button>
      </div>
      <div class="insight-variations">
        {#each selectedInsight.variations as variation}
          <div class="insight-variation">
            <div class="variation-text">{variation.text}</div>
            <div class="variation-explanation">{variation.explanation}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
{/if}

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

<TranslationStyleModal
  show={showStyleModal}
  onClose={() => {
    showStyleModal = false;
    handleStyleSettingsChange();
  }}
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

  .alternatives-section {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .alternatives-description {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    line-height: 1.4;
  }

  .alternatives-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .alternative-item {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--border-hover);
      background-color: var(--surface-hover);
    }
  }

  .alternative-translation {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .alternative-explanation {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .alternative-item.skeleton {
    background: var(--surface);
    border-color: var(--border);
    padding: 0.75rem;
    border-radius: 0.5rem;

    .skeleton-line {
      height: 1rem;
      margin-bottom: 0.5rem;

      &:last-child {
        height: 0.85rem;
        margin-bottom: 0;
      }
    }
  }

  .insight-popup {
    position: fixed;
    z-index: 100;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    width: 300px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    padding: 0.75rem;
  }

  .insight-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .insight-word-text {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .insight-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0.25rem;
    line-height: 0;
    border-radius: 50%;

    &:hover {
      background-color: var(--surface-hover);
    }
  }

  .insight-variations {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .insight-variation {
    padding: 0.5rem;
    background-color: var(--surface-alt);
    border-radius: 0.375rem;
  }

  .variation-text {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .variation-explanation {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .definition-section {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-primary);
  }

  .definition-word {
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;

    .pronunciation {
      font-weight: normal;
      color: var(--text-secondary);
      margin-left: 0.5rem;
      font-size: 1rem;
    }
  }

  .part-of-speech {
    font-style: italic;
    margin-bottom: 0.5rem;

    .usage-level {
      font-style: normal;
      color: var(--text-secondary);
      margin-left: 0.5rem;
      font-size: 0.9rem;
    }
  }

  .meaning-section {
    margin-bottom: 1rem;
  }

  .primary-meaning {
    margin-bottom: 0.5rem;
  }

  .secondary-meanings {
    ul {
      margin: 0;
      padding-left: 1.5rem;

      li {
        margin-bottom: 0.25rem;
      }
    }
  }

  .examples-section {
    margin-bottom: 1rem;
  }

  .examples-heading {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .examples-list {
    margin: 0;
    padding-left: 1.5rem;

    li {
      margin-bottom: 0.25rem;
      font-style: italic;
      color: var(--text-secondary);
    }
  }

  .etymology {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-style: italic;
  }
</style>
