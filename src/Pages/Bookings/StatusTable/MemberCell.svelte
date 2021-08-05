<script>
  // import StatusCell from './StatusCell.svelte';
  import { getSubsStatus } from '@store/memberCurrent';
  import Logit from '@utils/logit';
  var logit = Logit('pages/bookings/statusTable/MemberCell');
  export let member;
  // let memD;
  let name;

  let delS = {};
  let suspended = false;
  $: {
    suspended = member.suspended ? 'suspended' : '';
    name = member.firstName;
    let { showState } = getSubsStatus(member);
    delS = delSettings[showState];
    logit('delS', name, suspended, showState, delS);
  }

  const delSettings = {
    D: { 'data-text': 'Subs Due', style: '--color: green;' },
    G: { 'data-text': 'Guest', style: '--color: blue;' },
    L: { 'data-text': 'Subs Late', style: '--color: red;' },
    lapsed: { 'data-text': 'Lapsed', style: '--color: red;' },
    deceased: { 'data-text': 'Deceased', style: '--color: black;' },
    S: { 'data-text': 'Suspended', style: '--color: black;' },
    X: { 'data-text': 'Delete Me', style: '--color: red;' },
  };
</script>

<div class={`memberName avail  ${suspended} ${member.subs}`} {...delS}>
  {name}
</div>

<style>
  .memberName {
    min-width: 100px;
  }
  .memberName::after {
    /*@import './watermark2.css';*/
    cursor: default;
    display: block;
    font-family: sans-serif;
    font-style: italic;
    font-weight: bold;
    width: 6em;
    height: 1em;
    line-height: 100%;
    pointer-events: none;
    /* position: relative; */
    /* right: 0; */
    text-align: center;
    user-select: none;
    z-index: 9999;
    transform: translate(-30%, 300%) rotate(-70deg);
    opacity: 0.2;

    content: attr(data-text);
    bottom: 0;
    color: var(--color);
    font-size: 250%;
    /* left: -50%; */
    /* top: 260%; */
  }
</style>
