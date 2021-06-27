<script context="module">
</script>

<script>
  import Icon from '@utils/Icon2.svelte';
  import { index, dispStart, dispLength, listLength } from '@store/membersIndex.js';
  import { editMode } from '@store/memberCurrent.js';
  import Logit from '@utils/logit.js';
  var logit = Logit('pages/members/membersIndex');

  //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  //┃   UIState                                                ┃
  //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  let indx = [];

  $: logit('booleans', {
    dispStart: $dispStart,
    editMode: $editMode,
    listLength: $listLength,
  });
  $: {
    indx = $index.key.map(({ display, start, end }) => {
      let seeStart = start >= $dispStart && start < $dispStart + $dispLength;
      let seeEnd = end >= $dispStart && end < $dispStart + $dispLength;
      let allVisible = seeStart && seeEnd;
      let partVisible = (seeStart || seeEnd) && !allVisible;
      start = Math.min(start, $listLength - $dispLength);
      let onClick = () => dispStart.set(start);
      return { display, partVisible, allVisible, onClick, seeStart, seeEnd };
    });
    logit('index', indx, $index);
  }
  const pageDown = () => {
    logit('PageDown', {
      dispStart: $dispStart,
      dispLength: $dispLength,
      length: $listLength,
    });
    dispStart.set(Math.min($dispStart + $dispLength, $listLength - $dispLength));
  };
  const pageUp = () => {
    dispStart.set(Math.max($dispStart - $dispLength, 0));
  };
  $: logit('indx', indx);
</script>

<div class="index" hidden={$editMode}>
  <div on:click={pageUp}>
    <Icon name="page_up" />
  </div>
  {#each indx as { display, partVisible, allVisible, onClick }}
    <div class="indexItem" class:partVisible class:allVisible on:click={onClick}>
      {display}
    </div>
  {/each}
  <div on:click={pageDown}>
    <Icon name="page_down" />
  </div>
</div>

<style lang="postcss">
  .index {
    grid-area: index;
    align-self: center;
    cursor: pointer;
    text-align: center;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }
  .indexItem {
    height: 100%;
  }

  div.allVisible {
    background-color: #ccc;
  }

  div.partVisible:not(.allVisible) {
    background-color: #eee;
  }

  [hidden] {
    display: none;
  }
</style>
