<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { IconLanguage, IconHeart, IconSettings } from "@tabler/icons-svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import { t } from "$lib/translations";

  const handleClick = async (path: string) => {
    try {
      await selectionFeedback();
    } catch {}
    goto(path);
  };
</script>

<div class="nav-wrapper">
  <nav class="bottom-nav">
    <button
      class="nav-button translate"
      class:active={$page.url.pathname === "/app/translate"}
      onclick={() => handleClick("/app/translate")}
    >
      <IconLanguage size={24} />
      {$t("common.bottomNav.translate")}
    </button>
    <button
      class="nav-button favorites"
      class:active={$page.url.pathname === "/app/favorites"}
      onclick={() => handleClick("/app/favorites")}
    >
      <IconHeart size={24} />
      {$t("common.bottomNav.favorites")}
    </button>
    <button
      class="nav-button settings"
      class:active={$page.url.pathname === "/app/settings"}
      onclick={() => handleClick("/app/settings")}
    >
      <IconSettings size={24} />
      {$t("common.bottomNav.settings")}
    </button>
  </nav>
</div>

<style lang="scss">
  .nav-wrapper {
    padding: 1rem;
    background: var(--background);
    flex-shrink: 0;
  }

  .bottom-nav {
    display: flex;
    justify-content: space-around;
    padding: 0.25rem 1rem;
    background: var(--surface);
    border-radius: 0.75rem;
    box-sizing: border-box;
    width: 100%;

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
      padding: 0.5rem;
      width: 100%;
      box-sizing: border-box;

      &:hover {
        color: var(--primary);
      }

      &.active {
        color: var(--primary);
      }
    }
  }
</style>
