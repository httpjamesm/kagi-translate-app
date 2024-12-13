<script lang="ts">
  import "$lib/styles/main.scss";
  import { loadTranslations } from "$lib/translations";
  import { onMount } from "svelte";

  let { children } = $props();

  onMount(() => {
    let locale = "en";
    try {
      const navigatorLanguage = navigator.language;
      const language = navigatorLanguage.split("-")[0];
      locale = language;
    } catch {}
    loadTranslations(locale);
  });
</script>

{@render children?.()}
