<script>
  import { onMount } from 'svelte';
  import PageHeader from './PageHeader.svelte';
  import DataCell from './DataCell.svelte';
  import _ from 'lodash';
  import { sortBy, showAll } from '@store/membersIndex.js';

  import { isPaidUp, getSubsStatus } from '@store/memberCurrent';
  import { pcexp } from '@pages/MembersList/normalizers.js';
  import Icon from '@utils/Icon2.svelte';

  import { fetchData } from '@utils/use-data-api';

  import Logit from '@utils/logit';
  var logit = Logit('reports/membershipListRpt');
  // Create styles

  function showSubs(mem) {
    const statusMap = { Member: '', HLM: 'hlm', Guest: 'gst', '?': '' };
    const subsMap = {
      OK: ' color: green ',
      due: ' color: orange; font-weight: bold ',
      late: ' color: red; font-weight: bold ',
    };
    let stat = statusMap[mem.memberStatus || '?'];
    if (mem.memberId === 'M2087') logit('mem', mem, stat);
    if (stat !== '') return [stat, {}];

    let subs = getSubsStatus(mem);
    // let subs = mem.subsStatus;
    stat = `${mem.subscription ? "'" + (parseInt(mem.subscription) % 100) : '---'}`;
    let atts = subsMap[subs?.status];
    if (mem.memberId === 'M2087') logit('subs', subs, stat, atts);
    return [stat, atts];
  }

  const prepAddr = (addr) => {
    let result = pcexp.exec(addr);
    if (!result) return addr;
    return result[1] + result[2].toUpperCase() + ' ' + result[4].toUpperCase();
  };
  let members = [];
  let pages = [];
  $: console.log(pages, members);
  const phoneNumbers = (mem) => {
    let text = '';
    if (mem.phone) text += `H:${mem.phone}\n`;
    if (mem.mobile) text += `M:${mem.mobile}\n`;
    return text.replace('/', '\n').replace(' ', ' '); // NBSP
  };
  // Create Document Component
  onMount(async () => {
    console.time('read');
    const resp = await fetchData(`member/allMembers`);
    console.timeEnd('read');
    logit('allMembers fetchData returned', resp);
    if ((resp?.length ?? 0) <= 0) return null;
    members = _.sortBy(
      resp?.filter((m) => $showAll || isPaidUp(m)),
      [$sortBy],
    );
    // members = members.filter((m) => m.memberId === 'M2038');
    // partition the members into pages
    pages = paginate(members);
    logit('pages', pages);
  });
  let pageBody = 210 * 3.78 - 94;
  const paginate = (members) => {
    // const memPerPage = 15;
    pages = [];
    let ht = 0;
    let page = { members: [] };
    for (let i = 0; i < members.length; i += 1) {
      let mem = members[i];
      if (ht + (mem.h ?? 35) >= pageBody) {
        pages.push(page);
        ht = 0;
        page = { members: [] };
      }
      ht += mem.h ?? 35;
      page.members.push(mem);
    }
    pages.push(page);
    return pages;
  };
  // $: {
  //   console.time('paginate');
  //   pages = paginate(members);
  //   console.timeEnd('paginate');
  // }
</script>

{#if pages.length > 0}
  <div
    class="Document"
    title="St.Edward's Members"
    author="Booking System"
    subject="Membership List"
  >
    {#each pages as page, no}
      <div class="Page" bind:clientHeight={page.h}>
        <PageHeader>
          St.Edwards Fellwalkers: Membership List
          <div slot="right">Page {pages.length} of {no + 1}</div>
        </PageHeader>
        <div class="ReportBody">
          <div class="DataRow header">
            <div>Name</div>
            <div class="justify-center">£</div>
            <div>Address</div>
            <div>Phone</div>
            <div class="justify-left">No</div>
            <div>Email</div>
            <div>Next of Kin</div>
            <div>Medical</div>
          </div>
          {#each page.members as mem}
            <div class="DataRow" bind:clientHeight={mem.h}>
              <DataCell text={mem.sortName} wd="127" />
              <div class="justify-center" style={showSubs(mem)[1]}>
                {showSubs(mem)[0]}
              </div>
              <DataCell text={prepAddr(mem.address)} wd="233" />
              <DataCell text={phoneNumbers(mem)} fSize={12} wd="105" />
              <div style="justify-self: flex-end; font-size: 12px;padding-right:5px;">
                {mem.memberId.substr(1)}
              </div>
              <DataCell text={mem.email} wd="195" />
              <DataCell text={mem.nextOfKin} wd="218" />
              <DataCell text={mem.medical.replace(/,/, ', ')} wd="113" />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div class="spinner">
    <div>Building Report <Icon name="spinner" /></div>
  </div>
{/if}

<style lang="postcss">
  :global(body) {
    padding: 0;
  }
  .spinner {
    display: flex;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
    font-size: 6em;
  }
  .justify-left {
    justify-self: flex-end;
  }
  .justify-center {
    justify-self: center;
  }
  .header {
    font-weight: bold;
  }
  .Document {
    width: 297mm;
    height: 210mm;
    box-sizing: border-box;
  }
  .ReportBody {
    font-size: 10px;
    flex-direction: column;
    margin-left: 10px;
    margin-right: 0px;
    padding-right: 10px;
  }
  .Page {
    flex-direction: column;
    background-color: #ffffff;
    justify-content: flex-start;
    font-size: 14px;
    break-before: page;
  }
  .DataRow {
    font-size: 13px;
    display: grid;
    /* height: 39px; */
    grid-template-columns: 132px 37px 238px 110px 37px 200px 223px 118px;
    align-items: center;
    /* grid-column-gap: 5px; */
  }
  .DataRow {
    border-top-color: #808080;
    border-top-style: solid;
    border-top-width: 1px;
    margin-top-: 5px;
    padding-top-: 5px;
    margin-right: 3px;
  }
</style>
