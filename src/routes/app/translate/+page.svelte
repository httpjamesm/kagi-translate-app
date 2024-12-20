<script lang="ts">
  import { IconHeart, IconX, IconArrowsExchange } from "@tabler/icons-svelte";
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
      await invoke("set_session_token", {
        sessionToken: window.localStorage.getItem("kagiSession") || "",
      });

      // Only update if this is still the most recent translation request
      if (thisTranslationId === currentTranslationId) {
        translatedText = await invoke("get_translation", {
          sourceLanguage: sourceLanguage.apiName,
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

  onMount(async () => {
    loadSavedState();
    db = await Database.load("sqlite:kagi-translate.db");
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

  onDestroy(() => {
    clearTimeout(debounceTimer);
  });
</script>

<div class="translate-container">
  <div class="language-selector">
    <button
      class="language-button"
      onclick={() => (showSourceModal = true)}
      disabled={isLoading}
    >
      {sourceLanguage.apiName === "Automatic"
        ? `${$t("common.detect")} (${detectedLanguage || $t("common.auto")})`
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
</style>
