<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { IconLanguage, IconHeart } from "@tabler/icons-svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";

  const handleClick = async (path: string) => {
    try {
      await selectionFeedback();
    } catch {}
    goto(path);
  };
</script>

<nav class="bottom-nav">
  <button
    class="nav-button translate"
    class:active={$page.url.pathname === "/app/translate"}
    onclick={() => handleClick("/app/translate")}
  >
    <IconLanguage size={24} />
    Translate
  </button>
  <button
    class="nav-button favorites"
    class:active={$page.url.pathname === "/app/favorites"}
    onclick={() => handleClick("/app/favorites")}
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
    background: var(--surface);
    border-radius: 0.75rem;

    .nav-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: var(--primary);
      }

      &.active {
        color: var(--primary);
      }
    }
  }
</style>
