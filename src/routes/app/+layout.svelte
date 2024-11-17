<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";

  let { children } = $props();
</script>

<div class="app-layout">
  {@render children?.()}
  <BottomNav />
</div>

<style lang="scss">
  .app-layout {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-sizing: border-box;
    height: 100vh;
  }
</style>
