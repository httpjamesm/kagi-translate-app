<script lang="ts">
  import { IconSearch, IconX } from "@tabler/icons-svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";

  let {
    show,
    languages,
    includeAutomatic,
    selectedLanguage,
    onSelect,
    onClose,
  }: {
    show: boolean;
    languages: string[];
    includeAutomatic: boolean;
    selectedLanguage: string;
    onSelect: (language: string) => void;
    onClose: () => void;
  } = $props();

  let searchTerm = $state("");

  const filteredLanguages = () => {
    const languageList = includeAutomatic
      ? languages
      : languages.filter((l) => l !== "Automatic");
    if (!searchTerm) return languageList;
    return languageList.filter((lang) =>
      lang.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSelect = async (language: string) => {
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
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-backdrop" onclick={handleClose}>
    <div
      class="modal"
      onclick={(e) => {
        e.stopPropagation();
      }}
    >
      <div class="modal-header">
        <div class="search-box">
          <IconSearch size={20} />
          <input
            type="text"
            placeholder="Search languages"
            bind:value={searchTerm}
            autofocus
          />
        </div>
        <button class="icon-button" onclick={handleClose}>
          <IconX size={20} />
        </button>
      </div>
      <div class="language-list">
        {#each filteredLanguages() as language}
          <button
            class="language-option"
            class:selected={language === selectedLanguage}
            onclick={() => handleSelect(language)}
          >
            {language === "Automatic" ? "Detect" : language}
          </button>
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
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--surface-hover);
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: var(--text-secondary);

    input {
      border: none;
      background: none;
      font-size: 1rem;
      width: 100%;
      outline: none;
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-placeholder);
      }
    }
  }

  .language-list {
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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

    &:hover {
      background: var(--button-hover);
    }
  }
</style>
