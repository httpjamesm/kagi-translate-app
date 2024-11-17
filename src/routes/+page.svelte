<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  const checkLogin = () => {
    const sessionToken = window.localStorage.getItem("kagiSession");
    if (!sessionToken) {
      goto("/login");
    }
  };

  onMount(() => {
    checkLogin();
  });
</script>
