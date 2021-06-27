<script>
  import EditMemberData from './EditMemberData.svelte';
  import TooltipButton from '@utils/TooltipButton.svelte';
  import PrintButton from '@utils/PrintButton.svelte';
  import MembershipListReport from '@reports/membershipListRpt.svelte';
  // const MembershipListReport = {};
  import MembersIndex from './MembersIndex.svelte';
  import MembersAll from './MembersAll.svelte';
  import { setSortBy, toggleShowAll, sortBy, showAll } from '@store/membersIndex';
  import { editMode, createNewMember } from '@store/memberCurrent.js';

  import Panel from '@utils/AJNPanel.svelte';

  import Logit from '@utils/logit.js';
  var logit = Logit('pages/members/membersList');

  var title = 'Membership Lists';
  logit('renderPage');

  $: logit('changed', { showAll: $showAll, sortby: $sortBy });
</script>

<Panel header={title} class="member-list" id="steds_memberlist">
  <div class="member-list">
    <div class="sort-buttons" hidden={$editMode}>
      <TooltipButton
        key="name"
        class={$sortBy === 'sortName' ? 'active' : ''}
        onClick={() => setSortBy('sortName')}
        visible={$sortBy !== 'sortName'}>sort by Name</TooltipButton
      >
      <TooltipButton
        key="number"
        class={$sortBy === 'memNo' ? 'active' : ''}
        onClick={() => setSortBy('memNo')}
        visible={$sortBy !== 'memNo'}>sort by Number</TooltipButton
      >
      <TooltipButton key="hide" class="active" onClick={toggleShowAll} visible>
        {$showAll ? 'Hide Old' : 'Show Old'}
      </TooltipButton>
    </div>
    <div class="index">
      <MembersIndex />
    </div>
    <div class="names" hidden={$editMode}>
      <MembersAll />
    </div>
    <div class="member-details">
      <EditMemberData />
    </div>

    <span class="action-buttons" hidden={$editMode}>
      <PrintButton
        report={MembershipListReport}
        title="St.Edward's Fellwalkers - Members"
        visible
        rTiptext={`Print Membership List (Sorted by ${sortBy})`}
      />
      <TooltipButton
        icon="user_add"
        onClick={createNewMember}
        tiptext="Create a New Member"
        visible
      />
    </span>
  </div>
</Panel>

<style>
  .member-list {
    width: 1225px;
    display: grid;
    align-items: center;
    grid-gap: 0;
    grid-template-columns: 80px 240px 50px 505px;
    grid-template-rows: 1fr;
    background-color: #fff;
    color: #444;
    height: 100%;
    grid-template-areas:
      'btn1 names index details'
      'btn2 names index details';
  }
  .sort-buttons {
    grid-area: btn1;
    grid-column: 1;
    grid-row: 1;
    align-self: start;
  }

  .names {
    grid-area: names;
    align-self: start;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  [hidden] {
    display: none;
  }

  .index {
    grid-area: index;
    align-self: center;
    cursor: pointer;
    text-align: center;
    margin-left: 20px;

    height: 100%;
  }

  .member-details {
    grid-area: details;
    align-self: flex-start;
    margin-left: 10px;
    height: 100%;
    width: 100%;
  }

  .action-buttons {
    grid-area: btn2;
    align-self: flex-end;
    font-size: 2em;
  }
</style>
