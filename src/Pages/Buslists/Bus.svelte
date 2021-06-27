<script>
  import Notes from "./Note.svelte";
  export let busBookings = [];
  export let showBookings;
  export let free;
</script>

<style>
  .booked-members {
    max-height: 500px;
    display: grid;
    grid-template-rows: repeat(14, 35px);
    grid-template-columns: repeat(4, 1fr);
    row-gap: 0;
    align-items: start;
    column-gap: 8px;
    row-gap: 0;
    grid-auto-flow: column;
  }
  .seats-available {
    grid-row: 14 / span 2;
    grid-column: 4;
    width: 100%;
    border: black thin solid;
    border-radius: 5px;
    text-align: center;
    /* justify-self: end; */
    align-self: end;
  }

  .member {
    position: relative;
    color: green;
    display: flex;
    justify-content: space-between;
    padding: 0;
    cursor: pointer;
  }

  .member:hover {
    background-color: #eee;
  }
</style>

<div class="booked-members">
  {#each busBookings as bkng}
    <div class="member" key={'B' + bkng.memberId}>
      <div class="bName" onClick={() => showBookings(bkng.memberId)}>
        {bkng.Member.sortName}
        <Notes {...{ bkng }} />
      </div>
    </div>
  {/each}
  <div class="seats-available">
    Seats available
    <div>{free}</div>
  </div>
</div>
