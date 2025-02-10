<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(async () => {
    try {
      await invoke("get_translate_session_token");
    } catch (e) {
      console.error(e);
    }
  });
</script>

<div class="app-container">
  <main>
    {@render children?.()}
  </main>
  <BottomNav />
</div>

<style lang="scss">
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    main {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
  }
</style>
