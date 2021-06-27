<script>
  export let members;
  export let title = '';
  export let number = false;
  // let pos = 1;
</script>

{#if members?.length ?? 0 > 0}
  <section>
    {#if title}
      <div class="subHead">{title}</div>
    {/if}
    {#each members as bkng, pos}
      <div class="member">
        <span style="padding-left: 3px;">
          {#if number}
            <span>{pos + 1}.</span>
          {/if}
          {bkng.sortName}
        </span>
      </div>
      {#if bkng.annotation}
        <div class="annotation">({bkng.annotation})</div>
      {/if}
    {/each}
  </section>
{/if}

<style>
  .annotation {
    font-size: 0.875em;
    color: red;
    /* line-height: 1.3px; */
    padding-left: 10px;
    /* text-indent: 0; */
  }
  .subHead {
    border: thin solid black;
    width: auto;
    border-bottom-left-radius: 3px;
    background-color: #f0f0f0;
  }
  .member {
    /* font-size: 16.1px; */
    /* line-height: 1.3em; */
    padding-left: 22px;
    text-indent: -22px;
  }
</style>
