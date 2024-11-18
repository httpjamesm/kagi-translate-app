<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";

  let { children } = $props();
</script>

<div class="wrapper">
  <div class="app-layout">
    <div class="content">
      {@render children?.()}
    </div>
    <BottomNav />
  </div>
</div>

<style lang="scss">
  .wrapper {
    height: 100vh;
    max-height: 100vh;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    .app-layout {
      max-width: 800px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-sizing: border-box;
      height: calc(100% - 2rem);

      .content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }
    }
  }
</style>
