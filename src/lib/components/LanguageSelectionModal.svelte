<script lang="ts">
  import { IconStar, IconStarFilled, IconX } from "@tabler/icons-svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import SearchBar from "./SearchBar.svelte";
  import { fade, slide } from "svelte/transition";
  import { t } from "$lib/translations";
  import type { Language } from "$lib/constants/languages";
  import Database from "@tauri-apps/plugin-sql";
  import { onMount } from "svelte";

  let db: any;
  let starredLanguages = $state<string[]>([]);
  onMount(async () => {
    db = await Database.load("sqlite:kagi-translate.db");
    loadStarredLanguages();
  });

  let {
    show,
    languages,
    includeAutomatic,
    selectedLanguage,
    onSelect,
    onClose,
  }: {
    show: boolean;
    languages: Language[];
    includeAutomatic: boolean;
    selectedLanguage: Language;
    onSelect: (language: Language) => void;
    onClose: () => void;
  } = $props();

  let searchTerm = $state("");

  const filteredLanguages = () => {
    const languageList = includeAutomatic
      ? languages
      : languages.filter((l) => l.apiName !== "Automatic");
    if (!searchTerm)
      return languageList.sort((a, b) => {
        const isAStarred = starredLanguages.includes(a.apiName);
        const isBStarred = starredLanguages.includes(b.apiName);
        return isAStarred === isBStarred ? 0 : isAStarred ? -1 : 1;
      });
    return languageList
      .filter(
        (lang) =>
          lang.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lang.apiName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const isAStarred = starredLanguages.includes(a.apiName);
        const isBStarred = starredLanguages.includes(b.apiName);
        return isAStarred === isBStarred ? 0 : isAStarred ? -1 : 1;
      });
  };

  const handleSelect = async (language: Language) => {
    try {
      await selectionFeedback();
    } catch {}
    onSelect(language);
    searchTerm = "";
  };

  const handleClose = () => {
    searchTerm = "";
    onClose();
  };

  const handleStar = async (language: Language) => {
    try {
      if (starredLanguages.includes(language.apiName)) {
        const query = `DELETE FROM starred_languages WHERE language_api_name = $1`;
        const params = [language.apiName];
        await db.execute(query, params);
      } else {
        const query = `INSERT INTO starred_languages (language_api_name) VALUES ($1)`;
        const params = [language.apiName];
        await db.execute(query, params);
      }
      await loadStarredLanguages();
    } catch (e) {
      console.error(e);
    }
  };

  const loadStarredLanguages = async () => {
    const query = `SELECT * FROM starred_languages`;
    const _starredLanguages = await db.select(query);
    starredLanguages = _starredLanguages.map((l: any) => l.language_api_name);
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-backdrop" onclick={handleClose} transition:fade>
    <div
      transition:slide
      class="modal"
      onclick={(e) => {
        e.stopPropagation();
      }}
    >
      <div class="modal-header">
        <SearchBar
          bind:searchQuery={searchTerm}
          searchItemsName={$t("common.languages").toLowerCase()}
        />
        <button class="icon-button" onclick={handleClose}>
          <IconX size={20} />
        </button>
      </div>
      <div class="language-list">
        {#each filteredLanguages() as language}
          <div
            role="button"
            class="language-option"
            class:selected={language.apiName === selectedLanguage.apiName}
            onclick={() => handleSelect(language)}
          >
            <span>
              {language.apiName === "Automatic"
                ? "Detect"
                : language.displayName}
            </span>
            <button
              type="button"
              class="star-button"
              onclick={(e) => {
                e.stopPropagation();
                handleStar(language);
              }}
              style:color={starredLanguages.includes(language.apiName)
                ? "yellow"
                : language.apiName === selectedLanguage.apiName
                  ? "white"
                  : "var(--text-secondary)"}
            >
              {#if starredLanguages.includes(language.apiName)}
                <IconStarFilled size={20} />
              {:else}
                <IconStar size={20} />
              {/if}
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--surface);
    border-radius: 0.75rem;
    width: 100%;
    max-width: 24rem;
    height: 32rem;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
  }

  .language-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-height: 0;
  }

  .language-option {
    padding: 0.75rem;
    border: none;
    background: none;
    text-align: left;
    font-size: 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background: var(--surface-hover);
    }

    &.selected {
      background: var(--primary);
      color: white;

      &:hover {
        background: var(--primary-hover);
      }
    }
  }

  .icon-button,
  .star-button {
    background: none;
    border: none;
    $size: 2.5rem;
    width: $size;
    height: $size;
    min-width: $size;
    min-height: $size;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);

    &:hover {
      background: var(--button-hover);
    }
  }

  .star-button {
    $size: fit-content;
    width: $size;
    height: $size;
    min-width: $size;
    min-height: $size;

    &:hover {
      background: none;
    }
  }
</style>
