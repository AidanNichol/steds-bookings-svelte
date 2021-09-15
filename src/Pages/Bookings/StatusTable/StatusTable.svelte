<script>
  import NewBookingCell from './NewBookingCell.svelte';
  import OldBookingCell from './OldBookingCell.svelte';
  // import NewBookingCell from '../Dummy.svelte';
  // import OldBookingCell from '../Dummy.svelte';
  import MemberCell from './MemberCell.svelte';
  import Logit from '@utils/logit';
  import { status as openWalks } from '@store/walkBookingStatus';
  import { fetchData } from '@utils/use-data-api';
  import { today } from '@utils/dateFns';
  import {
    fundsManager,
    // accountMembers as members,
    accountId,
  } from '@store/accountStatus.js';
  import { nameIndex as index } from '@store/nameIndex';
  var logit = Logit('pages/bookings/statusTable');
  let _today = 'W' + today();
  const showAvailable = (walk) => {
    let free = walk.capacity - walk.booked;
    const W = walk.waiting;
    if (W > 0) return `${free} (-${W})`;
    return `${free}`;
  };
  const closeWalk = async (walk) => {
    await fetchData('walk/closeWalk/' + walk.walkId);
    walk.closed = true;
  };

  // const [annoDialog, setAnnoDialog] = useState({ isOpen: false, booking: null });
  // const account = useStoreState((state) => state.accountStatus.bookings);
  let members = [];
  $: {
    members = $index.get($accountId)?.Members;
    logit('account things', $accountId, $index.get($accountId), $index[$accountId]);
  }
  //   let mm = index.get(m.memberId);
  //   logit('members map', debug(m), debug(mm));
  //   mm.showState = getShowState(mm);
  //   return mm;
  // });

  $: logit('account', $fundsManager, members, $accountId);
  $: logit('openWalks', $openWalks);
  // var mCl = members?.map((member, i) => {
  //   logit('member', debug(member), index);
  //   return `avail member${i} ${member.suspended ? 'suspended' : ''} ${member.subs}`;
  // });
  // const openAnno = (booking) => setAnnoDialog({ booking, isOpen: true });
  // const closeAnno = () => setAnnoDialog({ booking: null, isOpen: false });
  // // $: accountId = account.accountId;

  // const getShowState = (mem) => {
  //   if (!mem) return '?';
  //   const subsStatus = mem.subsStatus.status;
  //   logit('getShowState In:', mem, isPaidUp(mem), mem.deleteState);
  //   let state = subsStatus === 'ok' ? '' : subsStatus?.toUpperCase()[0];
  //   if (!isPaidUp(mem)) state = 'lapsed';
  //   if (mem.deleteState === 'D') state = 'deceased';
  //   if (mem.deleteState >= 'S') state = mem.deleteState;
  //   logit('getShowState Out:', state);
  //   return state;
  // };
  const booked = (walkId, memberId) => {
    let booking = $fundsManager.bookings[walkId + memberId];
    const booked = booking && booking?.status?.length === 1;
    logit('isBooked', walkId + memberId, booked, $fundsManager);
    return booked;
  };
</script>

<div class="bTable" style={`--noMembers:${(members ?? []).length + 1}`}>
  <!-- <StatusRow class={'statusRow heading bLine memsx' + members.length}> -->
  <div class="DV">Date <br /> Venue</div>
  <div class="available">Available</div>

  {#each $fundsManager.Members ?? [] as member, i}
    <div>
      <MemberCell {member} />
    </div>
  {/each}
  {#each $openWalks as walk, w}
    <div class="DV">
      {walk.walkId?.substr(1)}
      {#if walk.walkId < _today}
        <button on:click={() => closeWalk(walk)} class="closeWalk"> X </button>
      {/if}
      <br />
      {walk.venue}
    </div>
    <div class="available">{showAvailable(walk)}</div>
    {#each $fundsManager.Members ?? [] as { memberId }, i}
      <div class="bookingcell">
        {#if booked(walk.walkId, memberId)}
          <OldBookingCell booking={$fundsManager?.bookings[walk.walkId + memberId]} />
        {:else}
          <NewBookingCell {walk} {memberId} />
        {/if}
      </div>
    {/each}
  {/each}
</div>

<style lang="postcss">
  .bTable {
    grid-template-columns: minmax(120px, 120px) repeat(
        var(--noMembers),
        minmax(80px, 100px)
      );
    /* grid-template-rows: repeat(5, minmax(62px, 62px)); */
    grid-auto-rows: minmax(62px, 62px);
    display: grid;
    text-align: center;
    /* align-items: center;
    justify-content: center; */
    grid-gap: 0;
    box-sizing: border-box;
    max-width: 450px;
    border: none;
  }
  .bTable div {
    border: solid black thin;
  }

  .DV {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .DV .closeWalk {
    font-size: 0.7em;
    padding: 0.2em;
  }
  div.available {
    padding-top: 20px;
    padding-bottom: 20px;
    max-with: 80px;
  }

  .bTable div {
    border: solid black thin;
    padding-top: 10px;
    padding-bottom: 10px;
    min-height: 62px;
    max-height: 62px;
    height: 62px;
  }
</style>
