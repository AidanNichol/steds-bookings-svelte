<script>
  /* jshint quotmark: false, jquery: true */

  import Logit from '@utils/logit';
  var logit = Logit('pages/Buslists/SelectWalk');
  const toJS = (x) => x;

  export let walks;
  export let currentWalk;
  export let setCurrentWalk;
  $: {
    if (!currentWalk && walks && walks.length > 0) setCurrentWalk(walks[0]);
  }
  logit('SelectWalk', toJS(walks), currentWalk, $$props);
</script>

{#if currentWalk}
  <div class="walkSelect">
    {#each walks as walk}
      <button
        class:current={currentWalk.walkId === walk.walkId}
        on:click={() => {
          setCurrentWalk(walk);
        }}
      >
        {walk.displayDate}
        <br />
        {walk.longName}
      </button>
    {/each}
  </div>
{/if}

<style lang="postcss">
  .walkSelect {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  button {
    background-color: #d9edf7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button.current {
    background-color: #87bbe7;
  }
</style>
