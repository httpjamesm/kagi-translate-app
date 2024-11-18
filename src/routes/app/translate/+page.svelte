<script lang="ts">
  import {
    IconClipboard,
    IconCopy,
    IconHeart,
    IconX,
    IconArrowsExchange,
  } from "@tabler/icons-svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { languages } from "$lib/constants/languages";
  import { onMount } from "svelte";
  import Database from "@tauri-apps/plugin-sql";
  import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import LanguageSelectionModal from "$lib/components/LanguageSelectionModal.svelte";

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
</script>

<div class="language-selector">
  <button class="language-button" onclick={() => (showSourceModal = true)}>
    {sourceLanguage === "Automatic"
      ? `Detect (${detectedLanguage || "Auto"})`
      : sourceLanguage}
  </button>

  <button
    class="swap-button"
    onclick={swapLanguages}
    disabled={sourceLanguage === "Automatic"}
  >
    <IconArrowsExchange size={20} />
  </button>

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
        <button class="icon-button">
          <IconX
            size={20}
            onclick={async () => {
              try {
                await selectionFeedback();
              } catch {}
              sourceText = "";
              translatedText = "";
            }}
          />
        </button>
      {/if}
      <button class="icon-button">
        <IconCopy
          size={20}
          onclick={async () => {
            try {
              await selectionFeedback();
            } catch {}
            try {
              await writeText(sourceText);
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </button>
      <button
        class="icon-button"
        onclick={async () => {
          try {
            await selectionFeedback();
          } catch {}
          try {
            sourceText = await readText();
          } catch (e) {
            console.error(e);
          }
        }}
      >
        <IconClipboard size={20} />
      </button>
    </div>
  </div>

  <div class="translated-text">
    <div class="language-label">{targetLanguage}</div>
    {#if isLoading}
      <div class="skeleton-loader">
        <div class="skeleton-line" />
        <div class="skeleton-line" />
        <div class="skeleton-line" />
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
      <button class="icon-button">
        <IconCopy
          size={20}
          onclick={async () => {
            try {
              await selectionFeedback();
            } catch {}
            try {
              await writeText(translatedText);
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </button>

      <button class="icon-button" onclick={toggleFavorite}>
        <IconHeart size={20} color={isFavorited ? "#5ba7d1" : undefined} />
      </button>
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
      width: 42%;
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

  .icon-button {
    background: none;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);

    &.primary {
      background: #5ba7d1;
    }

    &:hover {
      background: var(--button-hover);

      &.primary {
        background: var(--primary-hover);
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

  .swap-button {
    background: none;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary);

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover {
      background: var(--button-hover);
    }

    &:active {
      transform: scale(0.95);
    }
  }
</style>
