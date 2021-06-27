<script>
  import PageHeader from './PageHeader.svelte';
  import ShowBookings from './ShowBookings.svelte';
  import { onMount } from 'svelte';
  import _ from 'lodash';
  import { fetchData } from '@utils/use-data-api';
  import Logit from '@utils/logit';
  var logit = Logit('Reports/BusListRpt');
  let colsPerPage = 4;

  const linesNeeded = (list) => {
    const len = (list || []).length;
    return len === 0 ? len : len + 1;
  };
  const getBookingsByType = (walk, type) => {
    return walk.Bookings.filter((bk) => bk.status === type);
  };
  const parseWalk = (walk) => {
    const getByType = (walk, type, cmp) => {
      let bookings = getBookingsByType(walk, type);
      if (bookings.length === 0) return undefined;
      if (cmp) bookings = _.sortBy(bookings, cmp);
      return bookings;
    };
    const bus = getByType(walk, 'B', 'sortName');
    const car = getByType(walk, 'C', 'sortName');
    const wait = getByType(walk, 'W', 'updatedAt');
    const colSize = 56;
    const otherSize = linesNeeded(car) + linesNeeded(wait);
    const busSize = linesNeeded(bus) + 1;
    const noCols = busSize + otherSize > colSize ? 2 : 1;
    logit('parseWalk', { bus, car, wait, noCols, walk });
    return {
      walk,
      width: 2,
      noCols,
      cols: [
        { bus, walk },
        { car, wait, walk },
      ],
    };
  };

  const parseWalksIntoPages = (bookableWalks) => {
    let pages = [[]];

    const parsedWalks = bookableWalks.map((walk) => parseWalk(walk));
    let colsUsed = 0;
    let pageNo = 0;
    parsedWalks.forEach((parsedWalk) => {
      let { noCols, cols, walk } = parsedWalk;
      if (colsUsed + noCols > 5) {
        colsPerPage = Math.max(colsPerPage, colsUsed);
        pageNo++;
        pages[pageNo] = [];
        colsUsed = 0;
      }
      colsUsed += noCols;
      cols = cols.slice(0, noCols);
      pages[pageNo].push({ noCols, cols, walk });
    });
    colsPerPage = Math.max(colsPerPage, colsUsed);
    return pages;
  };

  let pages = [];
  // const imReady = useStoreActions((a) => a.reports.imReady);

  onMount(() => {
    fetchData(`walk/allBuslists`).then((BL) => {
      logit('allBuslists fetchData returned', BL);
      BL.forEach((walk) => {
        walk.Bookings.forEach((bkng) => {
          bkng.sortName = bkng.Member.sortName;
          bkng.fullName = bkng.Member.fullName;
          bkng.guest = bkng.Member.memberStatus === 'guest';
          delete bkng.Member;
        });
      });
      logit('allBuslists BL', BL);
      pages = parseWalksIntoPages(BL);
      logit('allBuslists pages', pages);
    });
  });
  // const colStyle = { display: 'flex', flexDirection: 'row' };

  logit('pages', pages);
  // if (pages.length > 0) imReady('busList');

  const free = (walk, bus) => walk.capacity - (bus?.length || 0);
</script>

<div>
  {#each pages as page, i}
    <div class="page">
      <PageHeader title="Bus Lists" />
      <div style={`--colsPerPage: ${colsPerPage}`} class="colStyle">
        {#each page as { noCols, cols, walk }, j}
          <div class="block" style={`--noCols: ${noCols};`}>
            <div class="walkTitle">
              <span class="dat">{walk.displayDate}</span>
              {walk.longName}
            </div>
            <div class="cols">
              {#each cols as { bus, car, wait, walk }, k}
                <div class="showCol">
                  {#if bus}
                    <ShowBookings members={bus} />
                    {#if walk}
                      <div>{'Seats available: ' + free(walk, bus)}</div>
                    {/if}
                  {/if}
                  {#if wait}
                    <ShowBookings members={wait} number title=" Waiting List " />
                  {/if}
                  {#if car}
                    <ShowBookings members={car} title=" Cars " />
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .page {
    flex-direction: column;
    background-color: #ffffff;
    justify-content: flex-start;
    font-size: 14px;
    break-before: page;
    width: 210mm;
    height: 297mm;
    box-sizing: border-box;
    padding-right: 10px;
    /* border: thin solid green; */
    /* background-color: yellow; */
  }

  .colStyle {
    display: grid;
    grid-template-columns: repeat(var(--colsPerPage), 1fr);
  }

  .showCol {
    width: 100%;
  }
  .walkTitle {
    font-size: 16px;
    font-weight: bold;
    border-bottom: thin solid #404040;
    background-color: #c0c0c0;
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 5px;
  }
  .block {
    grid-column: span var(--noCols);
    border: thin solid #404040;
    border-radius: 3px;
    font-size: 16px;
  }
  .dat {
    font-weight: normal;
    font-style: italic;
    font-size: 14px;
  }
  .cols {
    display: flex;
    flex-direction: row;
  }
</style>
