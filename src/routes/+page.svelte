<script lang="ts">
  import {
    IconMicrophone,
    IconStar,
    IconPlayerPlay,
    IconLanguage,
    IconHeart,
  } from "@tabler/icons-svelte";
  import { invoke } from "@tauri-apps/api/core";

  let sourceLanguage = "English (US)";
  let targetLanguage = "German";
  let sourceText = "";
  let translatedText = "";
  let debounceTimer: NodeJS.Timeout;

  const doLanguageDetection = async () => {
    try {
      await invoke("set_session_token", {
        sessionToken: window.localStorage.getItem("kagiSession") || "",
      });
      console.log("doLanguageDetection");
      const language = await invoke("detect_language", {
        text: sourceText,
      });
      console.log(language);
    } catch (e) {
      console.error(e);
    }
  };

  const doTranslation = async () => {
    console.log("doTranslation");
    try {
      await invoke("set_session_token", {
        sessionToken: window.localStorage.getItem("kagiSession") || "",
      });

      translatedText = await invoke("get_translation", {
        sourceLanguage: "Automatic",
        targetLanguage: targetLanguage,
        text: sourceText,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const debounce = () => {
    console.log("debouncedDetection");
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doLanguageDetection();
      doTranslation();
    }, 500);
  };

  $: if (sourceText) {
    console.log("source text detected");
    debounce();
  }
</script>

<div class="container">
  <div class="language-selector">
    <button class="language-button active">
      {sourceLanguage}
      <span class="language-code">US</span>
    </button>
    <button class="language-button">
      {targetLanguage}
    </button>
  </div>

  <div class="translation-area">
    <div class="source-text">
      <div class="language-label">{sourceLanguage}</div>
      <textarea
        class="text-content"
        placeholder="Enter text"
        bind:value={sourceText}
      ></textarea>
      <div class="actions">
        <button class="icon-button mic">
          <IconMicrophone size={20} color="white" />
        </button>
      </div>
    </div>

    <div class="translated-text">
      <div class="language-label">{targetLanguage}</div>
      <div class="text-content">{translatedText}</div>
      <div class="actions">
        <button class="icon-button favorite">
          <IconStar size={20} />
        </button>
        <button class="icon-button play">
          <IconPlayerPlay size={20} />
        </button>
      </div>
    </div>
  </div>

  <nav class="bottom-nav">
    <button class="nav-button translate active">
      <IconLanguage size={24} />
      Translate
    </button>
    <button class="nav-button favorites">
      <IconHeart size={24} />
      Favorites
    </button>
  </nav>
</div>

<style lang="scss">
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-sizing: border-box;
    height: 100vh;
  }

  .language-selector {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .language-button {
    background: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &.active {
      background: #f0f0f0;
    }

    .language-code {
      color: #666;
      font-size: 0.875rem;
    }
  }

  .translation-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .source-text,
  .translated-text {
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .language-label {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .text-content {
    font-size: 1.25rem;
    line-height: 1.4;

    &:is(textarea) {
      width: 100%;
      border: none;
      resize: none;
      background: none;
      font-family: inherit;
      padding: 0;
      min-height: 100px;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: #999;
      }
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .input-area {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: white;
    border-radius: 0.5rem;
    margin-bottom: 1rem;

    input {
      flex: 1;
      border: none;
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: #999;
      }
    }
  }

  .icon-button {
    background: none;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &.mic {
      background: #5ba7d1;
    }

    &:hover {
      background: #f0f0f0;

      &.mic {
        background: darken(#5ba7d1, 5%);
      }
    }
  }

  .bottom-nav {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    background: white;
    border-radius: 0.75rem;
  }

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

  :global(body) {
    background: #f5f5f5;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>
