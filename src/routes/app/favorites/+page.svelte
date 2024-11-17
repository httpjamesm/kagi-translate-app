<script lang="ts">
  import { IconLanguage, IconHeart, IconTrash } from "@tabler/icons-svelte";
  import Database from "@tauri-apps/plugin-sql";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

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
      await db.execute("DELETE FROM favorites WHERE id = $1", [id]);
      favorites = favorites.filter((f) => f.id !== id);
    } catch (e) {
      console.error(e);
    }
  };
</script>

<div class="favorites-list">
  {#each favorites as favorite}
    <div class="favorite-item">
      <div class="languages">
        <span>{favorite.source_language}</span>
        <span>→</span>
        <span>{favorite.target_language}</span>
      </div>
      <div class="texts">
        <p class="source">{favorite.source_text}</p>
        <p class="translated">{favorite.translated_text}</p>
      </div>
      <button
        class="delete-button"
        on:click={() => deleteFavorite(favorite.id)}
      >
        <IconTrash size={20} />
      </button>
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
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    position: relative;
  }

  .languages {
    display: flex;
    gap: 0.5rem;
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .texts {
    .source {
      color: #666;
      margin: 0 0 0.5rem 0;
    }

    .translated {
      color: #333;
      font-size: 1.1rem;
      margin: 0;
    }
  }

  .delete-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #666;
    border-radius: 50%;

    &:hover {
      background: #f0f0f0;
      color: #ff4444;
    }
  }
</style>
