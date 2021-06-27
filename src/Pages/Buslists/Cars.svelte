<script>
  import Notes from "./Note.svelte";
  export let cars = [];
</script>

{#if cars.length > 0}
  <section class="booked-cars">
    <h4>Cars</h4>
    {#each cars as bkng}
      <div
        class="member"
        key={'C' + bkng.memberId}
        onClick={() => $$props.showBookings(bkng.memberId)}>
        <div class="bName">
          {bkng.Member.sortName}
          <Notes {...{ bkng }} />
        </div>
      </div>
    {/each}
  </section>
{/if}
