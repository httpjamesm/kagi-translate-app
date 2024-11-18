<script lang="ts">
  import { IconSearch } from "@tabler/icons-svelte";

  let {
    searchQuery = $bindable(""),
    searchItemsName,
  }: { searchQuery: string; searchItemsName: string } = $props();
</script>

<div class="search-container">
  <div class="search-input">
    <input
      type="text"
      placeholder="Search {searchItemsName}..."
      bind:value={searchQuery}
    />
    <IconSearch size={20} class="search-icon" />
  </div>
</div>

<style lang="scss">
  .search-container {
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
</style>
