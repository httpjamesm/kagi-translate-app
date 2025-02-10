<script lang="ts">
  import { IconLoader2 } from "@tabler/icons-svelte";

  let {
    icon,
    size = 20,
    color = "var(--text-secondary)",
    disabled = false,
    loading = false,
    onclick,
  } = $props();
</script>

<button class="icon-button" {disabled} {onclick}>
  {#if loading}
    <IconLoader2 {size} {color} class="spin" />
  {:else}
    <svelte:component this={icon} {size} {color} />
  {/if}
</button>

<style lang="scss">
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

    &:not(:disabled):hover {
      background: var(--button-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
