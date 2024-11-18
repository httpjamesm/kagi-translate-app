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

  let sourceLanguage = $state("Automatic");
  let targetLanguage = $state("German");
  let sourceText = $state("");
  let translatedText = $state("");
  let debounceTimer: number;
  let isLoading = $state(false);
  let isFavorited = $state(false);
  let db: any;

  const doLanguageDetection = async () => {
    try {
      console.log("doLanguageDetection");
      const language = await invoke("detect_language", {
        text: sourceText,
      });
      console.log(language);
    } catch (e) {
      console.error(e);
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
      console.error(e);
    } finally {
      isLoading = false;
    }
  };

  const debounce = () => {
    console.log("debouncedDetection");
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doLanguageDetection();
      doTranslation();
    }, 500);
  };

  $effect(() => {
    if (sourceText) {
      console.log("source text detected");
      debounce();
    }
  });

  // retrieve languages from local storage on page load
  const loadLanguages = () => {
    const savedSourceLanguage = window.localStorage.getItem("sourceLanguage");
    const savedTargetLanguage = window.localStorage.getItem("targetLanguage");
    if (savedSourceLanguage) {
      sourceLanguage = savedSourceLanguage;
    }
    if (savedTargetLanguage) {
      targetLanguage = savedTargetLanguage;
    }
  };

  onMount(async () => {
    loadLanguages();
    db = await Database.load("sqlite:kagi-translate.db");
  });

  // save languages to local storage when they change
  $effect(() => {
    window.localStorage.setItem("sourceLanguage", sourceLanguage);
    window.localStorage.setItem("targetLanguage", targetLanguage);
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
      const temp = sourceLanguage;
      sourceLanguage = targetLanguage;
      targetLanguage = temp;
    }
  };
</script>

<div class="language-selector">
  <select bind:value={sourceLanguage} class="language-select">
    {#each languages as language}
      <option value={language}>
        {language === "Automatic" ? "Detect" : language}
      </option>
    {/each}
  </select>

  <button
    class="swap-button"
    onclick={swapLanguages}
    disabled={sourceLanguage === "Automatic"}
  >
    <IconArrowsExchange size={20} />
  </button>

  <select bind:value={targetLanguage} class="language-select">
    {#each languages.filter((l) => l !== "Automatic") as language}
      <option value={language}>{language}</option>
    {/each}
  </select>
</div>

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
  }

  .language-select {
    background: white;
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1.25rem;
    padding-right: 2.5rem;
    transition: all 0.2s ease;
    width: 42%;

    &:hover {
      border-color: #cbd5e0;
      background-color: #f8fafc;
    }

    &:focus {
      outline: none;
      border-color: #5ba7d1;
      box-shadow: 0 0 0 3px rgba(91, 167, 209, 0.1);
    }

    option {
      padding: 0.5rem;
      font-size: 1rem;
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
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .language-label {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .text-content {
    font-size: 1.25rem;
    line-height: 1.4;

    .placeholder {
      color: #999;
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
        color: #999;
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

    &.primary {
      background: #5ba7d1;
    }

    &:hover {
      background: #f0f0f0;

      &.primary {
        background: darken(#5ba7d1, 5%);
      }
    }
  }

  .skeleton-loader {
    padding: 0.5rem 0;
  }

  .skeleton-line {
    height: 1.25rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
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

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover {
      background: #f0f0f0;
    }

    &:active {
      transform: scale(0.95);
    }
  }
</style>
