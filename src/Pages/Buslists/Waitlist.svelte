<script>
  import Notes from './Note.svelte';
  import Logit from '@utils/logit';
  var logit = Logit('Pages/buslists/Waitlist');

  export let list = [];
  var pos = 1;
  export let showBookings;
  $: {
    logit('list', list);
  }
</script>

{#if list.length > 0}
  <div class="waiting-list">
    <h4>Waiting List</h4>
    {#each list as bkng, i}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="member" on:click={() => showBookings(bkng.memberId)}>
        <div class="wName">
          <span class="pos">{i + 1}.</span>
          {bkng.Member.sortName}
          <Notes {...{ bkng }} />
        </div>
      </div>
    {/each}
  </div>
{/if}
