<script lang="ts">
  import {
    IconCopy,
    IconHeart,
    IconX,
    IconArrowsExchange,
  } from "@tabler/icons-svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { languages } from "$lib/constants/languages";
  import { onMount } from "svelte";
  import Database from "@tauri-apps/plugin-sql";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import LanguageSelectionModal from "$lib/components/LanguageSelectionModal.svelte";
  import IconButton from "$lib/components/IconButton.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";

  let sourceLanguage = $state("Automatic");
  let targetLanguage = $state("German");
  let sourceText = $state("");
  let translatedText = $state("");
  let debounceTimer: number;
  let isLoading = $state(false);
  let isFavorited = $state(false);
  let db: any;
  let showSourceModal = $state(false);
  let showTargetModal = $state(false);
  let detectedLanguage = $state("");

  const doLanguageDetection = async () => {
    try {
      const language: string = await invoke("detect_language", {
        text: sourceText,
      });
      detectedLanguage = language;
    } catch (e) {
      detectedLanguage = "";
    }
  };

  const doTranslation = async () => {
    isLoading = true;
    try {
      await invoke("set_session_token", {
        sessionToken: window.localStorage.getItem("kagiSession") || "",
      });

      translatedText = await invoke("get_translation", {
        sourceLanguage: "Automatic",
        targetLanguage: targetLanguage,
        text: sourceText,
      });
    } catch (e) {
      translatedText = "Failed to translate";
    } finally {
      isLoading = false;
    }
  };

  const debounce = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doLanguageDetection();
      doTranslation();
    }, 500);
  };

  $effect(() => {
    if (sourceText) {
      debounce();
    }
  });

  // retrieve languages from local storage on page load
  const loadSavedState = () => {
    const savedSourceLanguage = window.localStorage.getItem("sourceLanguage");
    const savedTargetLanguage = window.localStorage.getItem("targetLanguage");
    const savedSourceText = window.localStorage.getItem("sourceText");
    const savedTranslatedText = window.localStorage.getItem("translatedText");

    if (savedSourceLanguage) sourceLanguage = savedSourceLanguage;
    if (savedTargetLanguage) targetLanguage = savedTargetLanguage;
    if (savedSourceText) sourceText = savedSourceText;
    if (savedTranslatedText) translatedText = savedTranslatedText;
  };

  onMount(async () => {
    loadSavedState();
    db = await Database.load("sqlite:kagi-translate.db");
  });

  // save languages to local storage when they change
  $effect(() => {
    window.localStorage.setItem("sourceLanguage", sourceLanguage);
    window.localStorage.setItem("targetLanguage", targetLanguage);
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
          [sourceText, translatedText, sourceLanguage, targetLanguage]
        );
        isFavorited = true;
      } else {
        await db.execute(
          `DELETE FROM favorites 
           WHERE source_text = $1 
           AND translated_text = $2 
           AND source_language = $3 
           AND target_language = $4`,
          [sourceText, translatedText, sourceLanguage, targetLanguage]
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
      [sourceText, translatedText, sourceLanguage, targetLanguage]
    );
    isFavorited = result[0].count > 0;
  };

  // Add effect to check if current translation is favorited
  $effect(() => {
    if (db && sourceText && translatedText) {
      checkIsCurrentTranslationFavorited();
    }
  });

  const swapLanguages = () => {
    if (sourceLanguage !== "Automatic") {
      const tempSource = sourceLanguage;
      sourceLanguage = targetLanguage;
      targetLanguage = tempSource;
      // swap translations too
      sourceText = translatedText;
    }
  };

  $effect(() => {
    // re-translate on language change
    if (sourceLanguage && targetLanguage) {
      doTranslation();
    }
  });
</script>

<div class="language-selector">
  <button class="language-button" onclick={() => (showSourceModal = true)}>
    {sourceLanguage === "Automatic"
      ? `Detect (${detectedLanguage || "Auto"})`
      : sourceLanguage}
  </button>

  <IconButton
    icon={IconArrowsExchange}
    onclick={swapLanguages}
    disabled={sourceLanguage === "Automatic"}
  />

  <button class="language-button" onclick={() => (showTargetModal = true)}>
    {targetLanguage}
  </button>
</div>

<LanguageSelectionModal
  show={showSourceModal}
  {languages}
  includeAutomatic={true}
  selectedLanguage={sourceLanguage}
  onSelect={(language) => {
    sourceLanguage = language;
    showSourceModal = false;
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
  }}
  onClose={() => (showTargetModal = false)}
/>
<div class="translation-area">
  <div class="source-text">
    <div class="language-label">{sourceLanguage}</div>
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
            try {
              await selectionFeedback();
            } catch {}
            sourceText = "";
            translatedText = "";
            window.localStorage.removeItem("sourceText");
            window.localStorage.removeItem("translatedText");
          }}
        />
      {/if}
      <CopyButton text={sourceText} />
    </div>
  </div>

  <div class="translated-text">
    <div class="language-label">{targetLanguage}</div>
    {#if isLoading}
      <div class="skeleton-loader">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    {:else}
      <div class="text-content">
        {#if translatedText}
          {translatedText}
        {:else}
          <span class="placeholder">Translation will appear here</span>
        {/if}
      </div>
    {/if}
    <div class="actions">
      <CopyButton text={translatedText} />
      <IconButton
        icon={IconHeart}
        color={isFavorited ? "#5ba7d1" : undefined}
        disabled={translatedText.length === 0}
        onclick={toggleFavorite}
      />
    </div>
  </div>
</div>

<style lang="scss">
  .language-selector {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
    width: 100%;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    .language-button {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
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
    }
  }

  .translation-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media only screen and (min-width: 768px) {
      flex-direction: row;
      height: 100%;
    }
  }

  .source-text,
  .translated-text {
    background: var(--surface);
    border-radius: 0.5rem;
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;

    @media (min-width: 768px) {
      height: 100%;

      .text-content {
        flex: 1;
        max-height: none;
      }
    }

    .language-label {
      align-self: flex-start;
    }

    .actions {
      align-self: flex-end;
    }
  }

  .language-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .text-content {
    font-size: 1.25rem;
    line-height: 1.4;
    color: var(--text-primary);
    max-height: 40vh;
    overflow-y: auto;

    @media (min-width: 768px) {
      max-height: none;
      height: 100%;
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
</style>
