<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { IconLanguage, IconHeart } from "@tabler/icons-svelte";
</script>

<nav class="bottom-nav">
  <button
    class="nav-button translate"
    class:active={$page.url.pathname === "/app/translate"}
    onclick={() => goto("/app/translate")}
  >
    <IconLanguage size={24} />
    Translate
  </button>
  <button
    class="nav-button favorites"
    class:active={$page.url.pathname === "/app/favorites"}
    onclick={() => goto("/app/favorites")}
  >
    <IconHeart size={24} />
    Favorites
  </button>
</nav>

<style lang="scss">
  .bottom-nav {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    background: white;
    border-radius: 0.75rem;

    .nav-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      color: #666;
      font-size: 0.875rem;
      cursor: pointer;

      &.active {
        color: #5ba7d1;
      }
    }
  }
</style>
