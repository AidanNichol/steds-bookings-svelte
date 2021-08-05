<script>
  import TooltipButton from '@utils/TooltipButton.svelte';
  import {
    editMode,
    formFields as member,
    currentMemberData,
    newMember,
    currentMemberId as memberId,
  } from '@store/memberCurrent.js';
  import { nameIndex } from '@store/nameIndex.js';

  import Logit from '@utils/logit';
  var logit = Logit('pages/members/AccountMembers');
  let stage = '';
  let mergeInAccount = null;
  // const setCurrentId = useStoreActions((a) => a.members.setCurrentId);
  // const nameIndex = useStoreState((s) => s.names);
  // const [state, setState] = useState(defaultState);

  const checkAccount = (evt) => {
    const mAccId = evt.target.value;

    mergeInAccount = $nameIndex.get(mAccId);

    stage = mergeInAccount ? 'F' : '?';
    logit('checkAccount', { mAccId, mergeInAccount, stage });
    return mAccId;
  };
  // let show = true;
  // $: show = !$newMember;

  let thisAccount = {};
  let extraMembers = [];
  $: {
    // let thisAccount = $nameIndex.get($member.accountId);
    // logit('thisAccount', thisAccount);
    extraMembers =
      $member.Account?.Members?.filter((mem) => mem.memberId !== $member.memberId)?.map(
        ({ memberId, fullName }) => [memberId, fullName],
      ) ?? [];
    // logit('extraMembers', extraMembers);
  }

  const reset = () => {
    [stage, mergeInAccount] = ['', null];
  };
  const merge = () => {
    logit('merge', stage, thisAccount, mergeInAccount);
    thisAccount.mergeInAccount(mergeInAccount);
    reset();
  };
  const setCurrentId = (id) => memberId.set(id);
</script>

{#if !$newMember}
  <div class="account-box" hidden={$newMember}>
    {#each extraMembers as [memberId, fullName], i}
      <div class="member" on:click={() => setCurrentId(memberId)}>
        &nbsp;Also: {memberId}
        {fullName}
      </div>
    {/each}

    {#if editMode}
      <div hidden={!$editMode}>
        <TooltipButton
          label="+"
          onClick={() => (stage = '?')}
          tiptext="merge another account into this one"
          visible={editMode && stage === ''}
        />

        <div class="active" hidden={stage === ''}>
          <div class="mAcc">
            <input placeholder="Annnn" on:input={checkAccount} />
            <button on:click={reset}>❌</button>
            <button on:click={merge} hidden={stage !== 'F'}>✅</button>
          </div>
          <span hidden={stage !== 'F'}>{mergeInAccount?.name}</span>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .mAcc {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-content: center;
    height: 35px;
  }
  input {
    margin: 2px;
    width: 5em;
    padding: 0;
    /* height: 30px; */
  }
  button {
    margin: 2px;
    /* height: 30px; */
  }
  .active {
    width: 210px;
    border: thin solid black;
    margin: 1px;
  }
  .member {
    cursor: pointer;
  }
  [hidden='true'] {
    display: none;
  }
</style>
