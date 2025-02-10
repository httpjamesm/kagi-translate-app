<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { IconX } from "@tabler/icons-svelte";
  import { t } from "$lib/translations";

  let {
    show,
    onClose,
  }: {
    show: boolean;
    onClose: () => void;
  } = $props();

  let style = $state(
    window.localStorage.getItem("translationStyle") || "Natural"
  );
  let formality = $state(
    window.localStorage.getItem("translationFormality") || "Standard"
  );
  let speakerGender = $state(
    window.localStorage.getItem("translationSpeakerGender") || "Unknown"
  );
  let addresseeGender = $state(
    window.localStorage.getItem("translationAddresseeGender") || "Unknown"
  );
  let context = $state(window.localStorage.getItem("translationContext") || "");

  const styles = ["Natural", "Literal"];
  const formalityLevels = ["Standard", "Formal", "Informal"];
  const genderOptions = ["Unknown", "Neutral", "Feminine", "Masculine"];

  $effect(() => {
    window.localStorage.setItem("translationStyle", style);
    window.localStorage.setItem("translationFormality", formality);
    window.localStorage.setItem("translationSpeakerGender", speakerGender);
    window.localStorage.setItem("translationAddresseeGender", addresseeGender);
    window.localStorage.setItem("translationContext", context);
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" onclick={onClose} transition:fade>
    <div
      transition:slide
      class="modal"
      onclick={(e) => {
        e.stopPropagation();
      }}
    >
      <div class="modal-header">
        <h2>{$t("common.translationStyle.title")}</h2>
        <button class="icon-button" onclick={onClose}>
          <IconX size={20} />
        </button>
      </div>

      <div class="modal-content">
        <div class="section">
          <h3>{$t("common.translationStyle.styles.title")}</h3>
          <div class="option-group">
            {#each styles as styleOption}
              <button
                class="option-button"
                class:selected={style === styleOption}
                onclick={() => (style = styleOption)}
              >
                {$t(
                  `common.translationStyle.styles.${styleOption.toLowerCase()}`
                )}
              </button>
            {/each}
          </div>
        </div>

        <div class="section">
          <h3>{$t("common.translationStyle.formality.title")}</h3>
          <div class="option-group">
            {#each formalityLevels as level}
              <button
                class="option-button"
                class:selected={formality === level}
                onclick={() => (formality = level)}
              >
                {$t(`common.translationStyle.formality.${level.toLowerCase()}`)}
              </button>
            {/each}
          </div>
        </div>

        <div class="section">
          <h3>{$t("common.translationStyle.genderPreferences.title")}</h3>
          <div class="gender-section">
            <div>
              <label
                >{$t(
                  "common.translationStyle.genderPreferences.speaker"
                )}</label
              >
              <div class="option-group">
                {#each genderOptions as gender}
                  <button
                    class="option-button"
                    class:selected={speakerGender === gender}
                    onclick={() => (speakerGender = gender)}
                  >
                    {$t(
                      `common.translationStyle.gender.${gender.toLowerCase()}`
                    )}
                  </button>
                {/each}
              </div>
            </div>

            <div>
              <label>
                {$t("common.translationStyle.genderPreferences.addressee")}
              </label>
              <div class="option-group">
                {#each genderOptions as gender}
                  <button
                    class="option-button"
                    class:selected={addresseeGender === gender}
                    onclick={() => (addresseeGender = gender)}
                  >
                    {$t(
                      `common.translationStyle.gender.${gender.toLowerCase()}`
                    )}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>{$t("common.translationStyle.context")}</h3>
          <textarea
            placeholder={$t("common.translationStyle.contextPlaceholder")}
            bind:value={context}
            maxlength="50"
          ></textarea>
          <div class="char-count">{context.length}/50</div>
        </div>
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
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    h2 {
      margin: 0;
      font-size: 1.25rem;
    }
  }

  .modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section {
    h3 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 500;
    }
  }

  .option-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .option-button {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-primary);

    &:hover {
      border-color: var(--border-hover);
      background: var(--surface-hover);
    }

    &.selected {
      background: var(--primary);
      border-color: var(--primary);
      color: white;

      &:hover {
        background: var(--primary-hover);
      }
    }
  }

  .gender-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }
  }

  textarea {
    width: 100%;
    min-height: 4rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-primary);
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  .char-count {
    text-align: right;
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .icon-button {
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
</style>
