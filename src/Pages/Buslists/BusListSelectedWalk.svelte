<script>
  /* jshint quotmark: false, jquery: true */
  import Loading from '@utils/Loading.svelte';
  // import { PrintButton } from "../utility/PrintButton";
  // import { SummaryReport } from "../../Reports/summaryReport";
  // import { useFetchData } from "@utils/use-data-api";
  import { fetchData } from '@utils/use-data-api';
  import Bus from './Bus.svelte';
  import Cars from './Cars.svelte';
  import Waitlist from './Waitlist.svelte';
  import ShowAnnotations from './ShowAnnotations.svelte';
  // import { namesIndex } from "@store/namesIndex";
  import { page } from '@store/router';
  import { status as walkBookingStatus } from '@store/walkBookingStatus.js';

  // import { setAccount } from "@store/accountStatus";

  import Logit from '@utils/logit';
  var logit = Logit('Pages/busLists/SelectedWalk');

  const bookingStatus = walkBookingStatus.status;
  logit('bookingStatus', bookingStatus);

  export let currentWalk;
  logit('currentWalk', currentWalk);

  const byNameR = (a, b) => a.Member.sortName.localeCompare(b.Member.sortName);
  const parseData = (data) => {
    const res = [[], [], []];
    data.forEach((item) => {
      const i = ['B', 'C', 'W'].indexOf(item.status);
      if (i < 0) return;
      res[i].push(item);
    });
    return res;
  };
  let bookings;
  let busBookings, carBookings, waitingList, free;
  const getParsedData = async (currentWalk) => {
    let bookings = await fetchData('booking/buslist/' + currentWalk.walkId);
    logit('useFetchData', bookings);
    let [busBookings, carBookings, waitingList] = parseData(bookings);
    const annotations = [];
    const extractAnnotations = (list) => {
      list
        .filter((m) => m.annotation)
        .forEach((m) => {
          annotations.push(m.annotation);
          m.annNo = annotations.length;
        });
    };
    extractAnnotations(busBookings);
    extractAnnotations(carBookings);
    extractAnnotations(waitingList);
    logit('extract Annotations', annotations, busBookings, waitingList);
    busBookings.sort(byNameR);
    logit('preStatus', currentWalk);
    free = currentWalk.capacity - currentWalk.booked;
    logit('getParsedData', {
      busBookings,
      carBookings,
      waitingList,
      annotations,
      free,
    });
    return { busBookings, carBookings, waitingList, annotations, free };
  };
  //     bookingsAdmin: store.signin.isBookingsAdmin,
  const showBookings = (memberId) => {
    $page.set('bookings');
    // setAccount(namesIndex.get(memberId).accountId);
  };
  $: bookings = getParsedData(currentWalk);
</script>

{#await bookings}
  <p>...waiting</p>
{:then { busBookings, carBookings, waitingList, annotations, free }}
  <div class="bus-list">
    <div class="bus">
      <Bus {...{ busBookings, showBookings, free }} />
    </div>
    <div class="nonbus">
      <ShowAnnotations {...{ annotations }} />
      <div class="others">
        <Waitlist list={waitingList} {...{ showBookings }} />
        <Cars cars={carBookings} {...{ showBookings }} />
      </div>
    </div>
  </div>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<style lang="postcss">
  .bus-list {
    display: grid;
    grid-template-rows: 50px;
    grid-template-columns: 4fr 20px 2fr;
    grid-template-areas: 'booked xx others ';
  }
  .bus {
    grid-area: booked;
  }

  .nonbus {
    grid-area: others;
    display: flex;
    flex-direction: column;
  }
  .others {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>
