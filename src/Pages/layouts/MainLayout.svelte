<script>
  import LoginForm from './LoginForm.svelte';
  import Link from './Link.svelte';

  import MembersList from '../MembersList/MembersList.svelte';
  import Bookings from '../Bookings/BookingsStatus.svelte';
  import BusLists from '../Buslists/BusLists.svelte';
  import Payments from '../Payments/PaymentsMST.svelte';
  // import IconsPage from '../IconsPage.svelte';
  import { page } from '@store/router';
  import { loaded, loading } from '@store/store';
  import { userStore } from '@store/user';

  // import PrintReport from '@reports/PrintReport.svelte';
  import { displayReport } from '@utils/PrintButton.svelte';
  import Modal from '@utils/Modal.svelte';
  import { modal } from '@store/modal';
  import '@store/monitorChanges';

  import DebugOptions from '../Debug/DebugOptions.svelte';

  import logo from '@images/St.EdwardsLogoSimple.svg';
  const mode = process.env.NODE_ENV;

  import Logit from '@utils/logit';
  import packageJson from '../../../package.json';
  // import { setPageFromRoles } from '../../store/user';
  var logit = Logit('pages/layouts/MainLayout');
  const version = packageJson.version;
  let title = 'St.Edwards bookings';

  // let Page;

  $: logit('currentPage', { version, page: $page, user: $userStore });
  const pagemap = {
    membersList: MembersList,
    bookings: Bookings,
    payments: Payments,
    buslists: BusLists,
    // icons: IconsPage,
    debugSettings: DebugOptions,
  };

  $: {
    logit('globalStore', { loading: $loading, loaded: $loaded });
  }
  $: {
    // Page = pagemap[$page];
    logit('Pagechange', $page, $userStore);
    if (!$displayReport) document.title = `${title} - ${$page}`;
  }
  if (mode === 'development') {
    title += ' - (developmemnt)';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#8f7031');
  }
</script>

<!-- {#if $displayReport}
  <PrintReport />
{:else} -->
<Modal show={$modal}>
  <!-- <div style="height: 100%;"> -->
  <div class="mainPage">
    <img
      class="logo"
      src={logo}
      width="40px"
      alt=""
      on:click={() => {
        page.set('debugSettings');
      }} />
    <span class="version">{`v${version}`}</span>
    <div class="signin">
      <LoginForm />
    </div>
    <div class="nav">
      {#if $userStore.hasBookingsRole}
        <Link toPage="bookings" name="Bookings" />
        <Link toPage="buslists" name="Buslist" />
        <Link toPage="payments" name="Payments" />
        <!-- {#if $userStore.roles.includes('admin')}
          <Link toPage="icons" name="Icons" />
        {/if} -->
      {/if}
      {#if $userStore.hasMembersRole}
        <Link toPage="membersList" name="Members" />
      {/if}
    </div>

    <div style=" padding: 5;" class="maincontent">
      {#if $loading}
        <span>loading </span>
      {:else if !$loaded}
        <div>Welcome to St.Edwards Booking System - please login.</div>
      {:else}
        <svelte:component this={pagemap[$page]} />
      {/if}
    </div>
  </div>
  <!-- </div> -->
</Modal>

<!-- {/if} -->
<style lang="postcss">
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  img {
    margin-right: 0.5em;
  }
  .mainPage {
    height: 100%;
    width: 100%;
    display: grid;
    align-items: center;
    grid-gap: 3px;
    grid-template-columns: repeat(24, 24fr);
    grid-template-rows: 45px minmax(0, 1fr);
    background-color: white;
    color: #444;
  }

  .logo {
    grid-column: 24;
    grid-row: 1;
    align-self: center;
  }

  .version {
    grid-column: 22 / span 2;
    grid-row: 1;
    align-self: center;
  }

  .signin {
    grid-column: span 8 / 21;
    grid-row: 1;
    align-self: center;
  }

  .nav {
    grid-column: 1 / span 8;
    grid-row: 1;
    align-self: end;
    top: 11px;
    position: relative;
    z-index: 1;
    white-space: nowrap;
  }

  .maincontent {
    grid-column: 1 / span 24;
    grid-row: 2;
    align-self: start;
    min-height: 100%;
    height: 100%;

    background: #eee;
    border: 0.1em solid #aaa;
    display: block;
    margin: 0px 0 0 0;
    padding: 1em;
    border-radius: 3px;
    max-width: 100%;
    min-width: 100%;
    box-sizing: border-box;
  }
</style>
