<script lang="ts">
  import { goto } from "$app/navigation";

  let sessionToken = $state("");

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    // strip the prefix if present ("https://kagi.com/search?token=")
    const token = sessionToken.replace(
      /^https:\/\/kagi\.com\/search\?token=/,
      ""
    );
    window.localStorage.setItem("kagiSession", token);
    goto("/app/translate");
  };
</script>

<div class="container">
  <div class="login-card">
    <h1>Welcome to Translator</h1>
    <p class="subtitle">Please enter your Kagi session token to continue</p>

    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-text">
          Log into <a
            href="#"
            onclick={() => {
              try {
                open("https://kagi.com");
              } catch (e) {
                console.error(e);
              }
            }}>kagi.com</a
          >
        </div>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-text">
          Open the three lines menu in the top right of the screen
        </div>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-text">
          Click "Copy" under the "Session Link" heading
        </div>
      </div>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="input-area">
        <input
          type="password"
          placeholder="Paste your session token here"
          bind:value={sessionToken}
        />
      </div>
      <button class="submit-button" type="submit" disabled={!sessionToken}>
        Continue to Translator
      </button>
    </form>
  </div>
</div>

<style lang="scss">
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .login-card {
    background: white;
    padding: 2rem;
    border-radius: 0.75rem;
    width: 100%;
    max-width: 500px;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }

  .subtitle {
    color: #666;
    margin: 0.5rem 0 2rem;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .step-number {
    background: #5ba7d1;
    color: white;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 1rem;
    color: #333;
  }

  .input-area {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
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

      &::placeholder {
        color: #999;
      }
    }
  }

  .submit-button {
    width: 100%;
    background: #5ba7d1;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: darken(#5ba7d1, 5%);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
</style>
