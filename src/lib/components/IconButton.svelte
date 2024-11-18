<script lang="ts">
  let {
    icon,
    size = 20,
    color = "var(--text-secondary)",
    disabled = false,
    onclick,
  } = $props();
</script>

<button class="icon-button" {disabled} {onclick}>
  <svelte:component this={icon} {size} {color} />
</button>

<style lang="scss">
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

    &:not(:disabled):hover {
      background: var(--button-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
