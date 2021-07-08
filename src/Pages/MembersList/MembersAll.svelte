<script>
  import { currentMemberId, setCurrentMemberId } from '@store/memberCurrent.js';
  import { sortedListSlice } from '@store/membersIndex';

  import Logit from '@utils/logit';
  var logit = Logit('pages/members/membersAll');

  //       👇  map actions from the store
  // let i = $sortedList.findIndex((mem) => mem?.memberId === $currentMemberId);
  // logit('sync index', i, $currentMemberId, $sortedList);
  // i = i > $dispLength - 1 ? Math.max(i - 11, 0) : i;

  // const changeCurrentMember = (memId) => {
  //   logit('changeCurrentMember', memId);
  //   // setDispStart(dispStart);
  //   $currentMemberId.set(memId);
  // };

  var list = [];
  const selectMember = (id) => {
    setCurrentMemberId(id);
    logit('member selected', id);
  };

  var showMemberStatus = (member) => {
    if (member.memberStatus === 'Member') return '';
    if (member.memberStatus === 'OK') return '';
    return member.memberStatus;
  };
  const clss = (member) => {
    let subsStatus = member.suspended ? 'suspended' : member.subsStatus.status;

    let current = $currentMemberId === member.memberId ? 'current' : '';
    return `list-line ${member.memberStatus} ${current} ${subsStatus}`;
  };
  $: logit('list', list);
  $: logit('memberId', $currentMemberId);
</script>

<div class="list">
  {#each $sortedListSlice as member}
    <div class={clss(member)} on:click={() => selectMember(member.memberId)}>
      <span class="line-name">
        <span class="id">{member.memberId.substr(1)}</span>
        <span class="name">{member.lastName + ', ' + member.firstName}</span>
      </span>
      <span class="member-status"> {showMemberStatus(member)} </span>
    </div>
  {/each}
</div>

<style lang="postcss">
  .list {
    height: 100%;
    /* height: 4.3%; */
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .list-line {
    width: 100%;
    /* height: 4.3%; */
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }
  .id {
    display: inline-block;
    width: 40px;
    margin-right: 10px;
    text-align: right;
  }

  .suspended {
    background-color: azure;
    color: lightslategrey;
    text-decoration: line-through;
    opacity: 0.7;
  }

  .due {
    background-color: blanchedalmond;
  }

  .late {
    background-color: rgb(246, 213, 188);
  }

  .current {
    background-color: rgb(68, 190, 235);
    border: thin solid rgb(135, 136, 247);
    border-radius: 4px;
  }
</style>
