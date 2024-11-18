<script lang="ts">
  import { IconTrash } from "@tabler/icons-svelte";
  import Database from "@tauri-apps/plugin-sql";
  import { onMount } from "svelte";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import IconButton from "$lib/components/IconButton.svelte";

  interface Favorite {
    id: number;
    source_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    created_at: string;
  }

  let favorites = $state<Favorite[]>([]);
  let db: any;

  onMount(async () => {
    db = await Database.load("sqlite:kagi-translate.db");
    loadFavorites();
  });

  const loadFavorites = async () => {
    try {
      favorites = await db.select(
        "SELECT * FROM favorites ORDER BY created_at DESC"
      );
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFavorite = async (id: number) => {
    try {
      await selectionFeedback();
    } catch {}
    try {
      await db.execute("DELETE FROM favorites WHERE id = $1", [id]);
      favorites = favorites.filter((f) => f.id !== id);
    } catch (e) {
      console.error(e);
    }
  };
</script>

<div class="favorites-list">
  {#each favorites as favorite (favorite.id)}
    <div class="favorite-item">
      <div class="item-header">
        <div class="languages">
          <span>{favorite.source_language}</span>
          <span>→</span>
          <span>{favorite.target_language}</span>
        </div>
        <IconButton
          icon={IconTrash}
          onclick={() => deleteFavorite(favorite.id)}
        />
      </div>
      <div class="texts">
        <p class="source">{favorite.source_text}</p>
        <p class="translated">{favorite.translated_text}</p>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .favorites-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0;
  }

  .favorite-item {
    background: var(--surface);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;

    .item-header {
      display: flex;
      justify-content: space-between;

      .languages {
        display: flex;
        gap: 0.5rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
    }
  }

  .texts {
    .source {
      color: var(--text-secondary);
      margin: 0 0 0.5rem 0;
    }

    .translated {
      color: var(--text-primary);
      font-size: 1.1rem;
      margin: 0;
    }
  }
</style>
