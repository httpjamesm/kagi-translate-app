<script lang="ts">
  import { IconX } from "@tabler/icons-svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  let { insight, onClose } = $props();
</script>

<div
  class="drawer-overlay"
  onclick={onClose}
  transition:fade={{ duration: 250 }}
>
  <div
    class="insight-drawer"
    onclick={(e) => {
      e.stopPropagation();
    }}
    transition:slide={{ duration: 250, easing: quintOut }}
  >
    <div class="drawer-handle"></div>

    <div class="insight-header">
      <div class="insight-word-text">{insight.originalText}</div>
      <button class="insight-close" onclick={onClose}>
        <IconX size={16} />
      </button>
    </div>

    <div class="insight-variations">
      {#each insight.variations as variation}
        <div class="insight-variation">
          <div class="variation-text">{variation.text}</div>
          <div class="variation-explanation">{variation.explanation}</div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .drawer-overlay {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .insight-drawer {
    background: var(--surface);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    padding: 0.75rem;
    width: 100%;
    box-sizing: border-box;
    max-height: 80vh;
    overflow-y: auto;
  }

  .drawer-handle {
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background-color: var(--border);
    margin: 0 auto 1rem;
  }

  .insight-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
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
    padding-bottom: env(safe-area-inset-bottom, 0.75rem);
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
</style>
