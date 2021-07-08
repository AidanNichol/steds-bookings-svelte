<script>
  import {
    editMode,
    currentMemberData as member,
    memberSubsStatus as subsStatus,
    newMember,
    isDirty,
    getDirty,
    formFields,
    viewCount,
    updateMember,
    currentMemberId as memberId,
  } from '@store/memberCurrent.js';
  import AccountMembers from './AccountMembers.svelte';
  import { ageInMonths, todaysDate } from '@utils/dateFns';
  // import { isPaidUp } from '@store/membersIndex.js';
  // import { BookingState } from '../Payments/BookingStatus';

  // import useFetch from 'fetch-suspense';

  import SuspendButtons from './SuspendButtons.svelte';
  import TextField from './TextField.svelte';
  import FormControl from './FormControl.svelte';
  import Select from 'svelte-select';
  import { getSubsStatus } from '@store/membersIndex.js';

  import TooltipButton from '@utils/TooltipButton.svelte';

  import Panel from '@utils/AJNPanel.svelte';

  import Logit from '@utils/logit';
  var logit = Logit('pages/members/EditMemberData');
  let lastrefreshCount = '';

  let refresh = false;

  $: if ($member.refreshCount !== lastrefreshCount) {
    formFields.set({ ...$member });
    lastrefreshCount = $member.refreshCount;
    refresh = true;
    logit('setData', lastrefreshCount, $formFields, $member);
  }

  const reset = () => formFields.set({ ...$member });

  const parseMemberData = (member) => ({
    ...member,
    roles: (member.roles ?? '').split(/, */),
  });

  // let deleteable = true;
  // const thisYear = todaysDate().substr(0, 4);
  // if (bookingState) {
  //   for (const field of ['Booking', 'Payment']) {
  //     const last = bookingState['last' + field] ?? '2000-01-01';
  //     const age = ageInMonths(last);
  //     bookingState['age' + field] = age;
  //     bookingState['active' + field] = last.substr(0, 4) === thisYear || age < 5;
  //   }

  //   bookingState.active = bookingState.activeBooking || bookingState.activePayment;
  //   const { debt, credit, active } = bookingState;
  //   deleteable = (debt ?? 0) === 0 && (credit ?? 0) === 0 && !active;
  //   logit('bookingState', bookingState, deleteable);
  // }

  if (member?.memberId && member?.memberId !== currMemberId.current) {
    logit('about to initialize', memberId, member, currMemberId);
    currMemberId.current = memberId;
    viewCount.set($viewCount + 1);
    initializeData(parseMemberData(member));
  }

  const saveChanges = () => {
    const changes = getDirty();
    logit('saveChanges', changes, $isDirty, member);
    if (member.newMember) updateMember({ ...member, ...changes });

    if (changes.roles) {
      changes.roles = changes.roles.map((r) => r.value).join(', ');
    }
    updateMember(changes);
    editMode.set(false);
  };

  const closeEdit = () => {
    editMode.set(false);
    if ($newMember) {
      memberId.set(undefined);
      newMember.set(false);
    }
  };
  const deleteMember = () => {
    editMode.set(false);
    const { memberId, accountId, fullName } = member;
    logit('deleteMember', memberId, accountId.accountId, fullName);
    // MS.deleteCurrentMember();
    memberId.set(undefined);
  };

  const getShowState = (subsStatus, deleteState, paidUp) => {
    logit('getShowState In:', subsStatus, deleteState, paidUp);
    let state = subsStatus === 'ok' ? '' : subsStatus?.toUpperCase()[0];
    if (!paidUp) state = 'lapsed';
    if (deleteState >= 'S') state = deleteState;
    if (deleteState === 'D') state = 'died';
    // logit('getShowState Out:', state);
    return state;
  };

  let membersAdmin = true;
  let delSettings = {};
  let suspended = false;
  $: {
    delSettings =
      {
        D: { 'data-text': 'Subs Due', style: '--color: green;' },
        G: { 'data-text': 'Guest', style: '--color: blue;' },
        L: { 'data-text': 'Subs Late', style: '--color: red;' },
        lapsed: { 'data-text': 'Lapsed', style: '--color: red;' },
        deceased: { 'data-text': 'Deceased', style: '--color: black;' },
        S: { 'data-text': 'Suspended', style: "--color: orange;--opacity': 0.3" },
        X: { 'data-text': 'Delete Me', style: "--color: red;--opacity': 0.5" },
      }[$subsStatus.showState] || {};
  }
  let setValue = (field, value) =>
    formFields.update((state) => ({ ...state, [field]: value }));

  const setDeceased = () => setValue('deceased', true);
  const setDeleteStatus = (s) => setValue('deleteStatus', s);

  let clss;
  $: {
    clss =
      `form-horizontal user-details modal-body ${$subsStatus?.status} ${$formFields.memberStatus} `.toLowerCase();
    clss += $formFields.suspended && 'suspended ' + $formFields.deleteState && 'deleted';
  }

  logit('showState@render', {
    memberId: $memberId,

    delSettings,
    susbStatus: $subsStatus,
    subsStatus: $subsStatus,
    member: $member,
  });
  const common = (name, normalizer = (x) => x) => ({
    name,
    id: name,
    disabled: !$editMode,
    value: formFields[name],
  });
  const roleOptions = ['committee', 'tester', 'uploader', 'no-receipt', 'admin', 'walks'];
  // const BookingState = (props) => {
  //   const { credit, debt, ageBooking, activeBooking, agePayment, activePayment } = props;
  //   return (
  //     <InfoBox disabled>
  //       {debt && <div>Debt: £{debt}</div>}
  //       {credit && <div>Credit: £{credit}</div>}
  //       {activeBooking && <div>Last Booking:{ageBooking}</div>}
  //       {activePayment && <div>Last Payment:{agePayment}</div>}
  //     </InfoBox>
  //   );
  // };
  // const InfoBox = styled.div`
  //   position: relative;
  //   background-color: pink;
  //   margin-bottom: auto;
  //   transition: all 200ms ease-in;
  //   font-size: 0.7em;
  //   width: 100%100%;
  //   &:hover {
  //     /* font-size: 0.9em; */
  //     z-index: 200;
  //     transform: scale(1.8);
  //     overflow: visible;
  //   }
  // `;
  const memberStatusChanged = (e) => {
    let value = e?.detail?.value;
    logit('roleChanged', value, e?.detail, e);
    if (!value) return;
    formFields.update((state) => ({ ...state, memberStatus: value }));
  };
  const roleChanged = (e) => {
    let value = e?.detail?.map((v) => v.value).join(',');
    if (!value) return;
    logit('roleChanged', value, e?.detail, e);
    formFields.update((state) => ({ ...state, roles: value }));
  };
  const currentRoles = (role) => {
    let roles = (role ?? '').split(/, */).filter((r) => r.length > 0);
    logit('currentRoles', roles);
    return roles.length > 0 ? roles : [];
  };
  const setEditMode = () => {
    editMode.set(true);
    logit('change editMode', $editMode);
  };
  const ttButtonStyle =
    ' height: 60px; margin-top: 4px; box-sizing: border-box; width 100%';
  const msItems = [
    { value: 'Member', label: 'Member' },
    { value: 'Guest', label: 'Guest' },
    { value: 'HLM', label: 'Honary Life Member' },
  ];
</script>

{#if $memberId}
  <!-- content here -->
  <Panel className={'show-member-details ' + ($editMode ? 'editmode' : 'showMode')}>
    <div style=" width: 100%" slot="header">
      {$formFields.firstName}
      {$formFields.lastName}
      {$isDirty ? '(changed)' : ''}
      <!-- {isFetching && <Loading styleI={{ width: '1em', height: '1em' }} />} -->
      <span hidden={!$editMode || $isDirty} class="closeWindow" on:click={closeEdit}>
        {!$editMode || $isDirty ? '' : 'X'}
      </span>
    </div>
    <div class={'formContainer ' + clss} {...delSettings}>
      <form class="form" autocomplete="off">
        <TextField name="lastName" properCaseName required />
        <TextField name="firstName" properCaseName required />

        <TextField multiline name="address" properCaseAddress bind:refresh />
        <TextField name="phone" normalizePhone />
        <TextField name="email" />
        <TextField name="mobile" normalizeMobile />
        <div class="twoCol" hidden={['Guest', 'HLM'].includes($formFields.memberStatus)}>
          <TextField name="subscription" class={subsStatus?.status} style="width: 99px" />
          <TooltipButton
            label={`Paid £${$subsStatus?.fee} for ${$subsStatus?.year}`}
            on:click={() => {
              formFields.update((mem) => (mem.subscription = subsStatus?.year));
            }}
            visible={$editMode &&
              $subsStatus.showState < 'S' &&
              $subsStatus?.showSubsButton &&
              $formFields.subscription !== $subsStatus?.year}
            style={{ width: 190 }}
          />
        </div>
        <div style={{ margin: 8 }}>
          <FormControl name="memberStatus">
            <Select
              name="memberStatus"
              items={msItems}
              selectedValue={$formFields.memberStatus}
              on:select={memberStatusChanged}
            />
          </FormControl>
        </div>
        <TextField multiline name="nextOfKin" bind:refresh />
        <TextField multiline name="medical" bind:refresh />
        <FormControl name="roles">
          <Select
            name="roles"
            selectedValue={currentRoles($formFields.roles)}
            isMulti={true}
            renderValue={(v) => v.join(', ')}
            on:select={roleChanged}
            items={roleOptions}
          />
        </FormControl>
        <TextField name="memberId" disable style="width: 10ch" />

        <div class="twoCol">
          <TextField name="accountId" disable={!$newMember} style="width: 10ch" />
          <AccountMembers
            member={$formFields}
            newMember={$newMember}
            editMode={$editMode}
          />
        </div>
      </form>

      <form class="edit-buttons">
        <!-- {$formFields.deleteState && <BookingState {...bookingState} />} -->
        <TooltipButton
          class={membersAdmin && $editMode ? 'edit-member ' : 'edit-member hidden'}
          label="Edit"
          onClick={setEditMode}
          visible={!$editMode}
          style={ttButtonStyle}
        />
        <TooltipButton
          label="Close"
          onClick={closeEdit}
          visible={$editMode && !$isDirty}
          style={ttButtonStyle}
        />
        <TooltipButton
          label="Discard"
          onClick={reset}
          visible={$editMode && $isDirty && $formFields.deleteState !== 'X'}
          style={ttButtonStyle}
        />
        <TooltipButton
          label="Save"
          onClick={saveChanges}
          tiptext="Save All Changes to this Member"
          visible={$editMode && $formFields.deleteState !== 'X' && $isDirty}
          style={ttButtonStyle}
        />
        <SuspendButtons
          {...{
            setDeceased,
            setDeleteStatus,
            deleteMember,
            newMember: $newMember,
            deleteState: $formFields.deleteState,
          }}
        />
      </form>
    </div>
  </Panel>
{/if}

<style lang="postcss">
  .formContainer {
    display: block;
    height: 100%;

    margin-right: 10px;
    width: 470px;
    display: grid;
    grid-template-columns: 80px auto;
    grid-template-rows: 1fr;
    grid-template-areas: 'buttons form';
    height: 100%;
  }
  .edit-button {
    grid-area: buttons;
    justify-content: flex-end;
  }

  .form {
    grid-area: form;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 3px;
  }

  .edit-buttons {
    grid-area: buttons;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
  }

  .stamp {
    grid-area: form;
    width: 80%;
  }

  [text]::before {
    /*@import './watermark2.css';*/
    cursor: default;
    display: block;
    font-family: sans-serif;
    font-style: italic;
    font-weight: bold;
    width: 7em;
    height: 4em;
    line-height: 100%;
    pointer-events: none;
    position: absolute;
    opacity: 0.1;
    text-align: center;
    user-select: none;
    z-index: 9999;

    content: attr(text);
    transform: rotate(-45deg);
    font-size: 8em;
    color: var(--color, black);
    bottom: 0;
    right: 0.5em;
    top: 1.5em;
    left: 0;
  }

  .closeWindow {
    float: right;

    cursor: 'pointer';
  }
  .twoCol[hidden] {
    display: none;
  }
  .twoCol {
    width: 35ch;
    display: flex;
    flex-direction: row;
  }

  #subscription {
    width: 110px;
  }
  #memberStatus,
  #roles {
    width: 35ch;
  }

  [data-text]::before {
    /*@import './watermark2.css';*/
    cursor: default;
    display: block;
    font-family: sans-serif;
    font-style: italic;
    font-weight: bold;
    width: 7em;
    height: 4em;
    line-height: 100%;
    pointer-events: none;
    position: absolute;
    opacity: var(--opacity, 0.1);
    text-align: center;
    user-select: none;
    z-index: 9999;

    content: attr(data-text);
    transform: rotate(-45deg);
    font-size: 8em;
    color: var(--color, black);
    bottom: 0;
    right: 0.5em;
    top: 1.5em;
    left: 0;
  }
</style>
