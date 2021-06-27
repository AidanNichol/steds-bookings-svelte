<script>
  import Note from "./Note.svelte";
  export let annotations = [];
</script>

<style lang="postcss">
  .annoLine {
    display: flex;
    flex-direction: row;
    position: relative;
  }
</style>

{#each annotations as a, i}
  <div class="annoLine">
    <Note bkng={{ annNo: i + 1 }} style="top:0;" />
    <div>{a}</div>
  </div>
{/each}
