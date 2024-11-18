<script lang="ts">
  import { IconArrowRight, IconTrash, IconSearch } from "@tabler/icons-svelte";
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
  let searchQuery = $state("");
  let db: any;

  onMount(async () => {
    db = await Database.load("sqlite:kagi-translate.db");
    loadFavorites();
  });

  const loadFavorites = async () => {
    try {
      const query = searchQuery
        ? `SELECT * FROM favorites WHERE source_text LIKE $1 OR translated_text LIKE $1 ORDER BY created_at DESC`
        : `SELECT * FROM favorites ORDER BY created_at DESC`;

      const params = searchQuery.length > 0 ? [`%${searchQuery}%`] : [];
      favorites = await db.select(query, params);
    } catch (e) {
      console.error(e);
    }
  };

  $effect(() => {
    if (db) {
      loadFavorites();
    }
  });

  $effect(() => {
    if (searchQuery) {
      loadFavorites();
    } else {
      loadFavorites();
    }
  });

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

<div class="search-container">
  <div class="search-input">
    <input
      type="text"
      placeholder="Search favorites..."
      bind:value={searchQuery}
    />
    <IconSearch size={20} class="search-icon" />
  </div>
</div>

<div class="favorites-list">
  {#if favorites.length === 0}
    <div class="empty-state">
      <p>
        {searchQuery
          ? "No favorites found matching your search"
          : "Press the heart button on translations to add them here"}
      </p>
    </div>
  {:else}
    {#each favorites as favorite (favorite.id)}
      <div class="favorite-item">
        <div class="item-header">
          <div class="languages">
            <span>{favorite.source_language}</span>
            <span>
              <IconArrowRight size={16} />
            </span>
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
  {/if}
</div>

<style lang="scss">
  .search-container {
    padding: 1rem 0;
    box-sizing: border-box;
    width: 100%;

    .search-input {
      position: relative;
      width: 100%;
      padding: 0.5rem 1rem;

      border-radius: 0.5rem;
      box-sizing: border-box;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-primary);
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
      }

      input {
        width: 100%;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
        height: 100%;
        background: transparent;
        border: none;
        color: var(--text-primary);

        &::placeholder {
          color: var(--text-secondary);
        }
      }
    }
  }

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
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        height: fit-content;
        font-size: 0.875rem;
        span {
          display: flex;
          align-items: center;
        }
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

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    p {
      color: var(--text-secondary);
      text-align: center;
      margin: 0;
    }
  }
</style>
