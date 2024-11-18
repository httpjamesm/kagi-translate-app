<script lang="ts">
  import { IconCopy, IconCheck } from "@tabler/icons-svelte";
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { selectionFeedback } from "@tauri-apps/plugin-haptics";
  import IconButton from "./IconButton.svelte";

  let { text } = $props();
  let isCopied = $state(false);

  const copyText = async () => {
    try {
      await selectionFeedback();
      await writeText(text);
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };
</script>

<IconButton
  icon={isCopied ? IconCheck : IconCopy}
  color={isCopied ? "#5ba7d1" : undefined}
  onclick={copyText}
  disabled={text.length === 0}
/>
