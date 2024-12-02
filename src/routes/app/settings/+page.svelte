<script lang="ts">
  import { goto } from "$app/navigation";
  import Database from "@tauri-apps/plugin-sql";
  import { invoke } from "@tauri-apps/api/core";
  import { IconTrash } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  let sessionToken = $state("");
  let isTokenVisible = $state(false);
  let db: Database | null = null;

  const loadToken = () => {
    const token = window.localStorage.getItem("kagiSession") || "";
    sessionToken = token;
  };

  const handleTokenUpdate = () => {
    window.localStorage.setItem("kagiSession", sessionToken);
    invoke("set_session_token", { sessionToken });
  };

  const resetAppData = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all app data? This will clear your favorites and settings."
      )
    ) {
      return;
    }

    try {
      if (db) {
        await db.execute("DELETE FROM favorites");
      }
      window.localStorage.clear();
      goto("/login");
    } catch (e) {
      console.error("Failed to reset app data:", e);
    }
  };

  onMount(async () => {
    loadToken();
    db = await Database.load("sqlite:kagi-translate.db");
  });
</script>

<div class="container">
  <h1>Settings</h1>

  <div class="settings-container">
    <div class="section">
      <h2>Kagi Session Token</h2>
      <p>
        Obtain your session token by navigating to the three lines menu and
        clicking "Copy" under the "Session Link" heading on
        <a href="https://kagi.com" target="_blank">kagi.com</a>.
      </p>
      <div class="input-area">
        <input
          type={isTokenVisible ? "text" : "password"}
          placeholder="Enter your Kagi session token"
          bind:value={sessionToken}
          oninput={handleTokenUpdate}
          onfocus={() => (isTokenVisible = true)}
          onblur={() => (isTokenVisible = false)}
        />
      </div>
    </div>

    <div class="section">
      <h2>Reset App Data</h2>
      <p>This will clear all your favorites and settings.</p>
      <button class="danger-button" onclick={resetAppData}>
        <IconTrash size={18} />
        Reset App Data
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  h1 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  .settings-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 0.5rem;

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      color: var(--text-primary);
    }

    p {
      margin: 0 0 1rem 0;
      color: var(--text-secondary);
    }
  }

  .input-area {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: #5ba7d1;
      box-shadow: 0 0 0 3px rgba(91, 167, 209, 0.1);
    }

    input {
      width: 100%;
      border: none;
      font-size: 1rem;
      outline: none;
      background: transparent;
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-placeholder);
      }
    }
  }

  .danger-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    background: var(--error);
    color: white;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s ease;

    &:hover {
      background: var(--error-hover);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
</style>
