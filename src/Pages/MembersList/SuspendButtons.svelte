<script>
  // import { isUndeleteable } from '../Payments/BookingStatus';

  import TooltipButton from '@utils/TooltipButton.svelte';
  import {
    editMode,
    formFields,
    memberSubsStatus as subsStatus,
  } from '@store/memberCurrent.js';
  import Logit from '@utils/logit';
  var logit = Logit('members/SuspendButtons');

  export let paidUp;
  export let deleteMember;
  export let newMember;
  let deceased = $subsStatus.deceased;
  export let bookingState;
  let setValue = (field, value) =>
    formFields.update((state) => ({ ...state, [field]: value }));
  export let className;
  let deleteState = $$props.deleteState || (paidUp ? 'OK' : 'L');

  // const deleteable = !isUndeleteable(bookingState);
  const deleteable = !newMember;
  logit('rendering', deleteable, bookingState);
  const newstate = (s) => {
    return () => {
      if (s === 'D') setValue('deceased', true);
      setValue('deleteState', s === 'OK' ? null : s);
      deleteState = s;
    };
  };
  // const curState = showState >= 'S' ? showState : 'OK';
  const { onClick: goPrev, ...prevState } = ((deleteState) => {
    if (deleteState === 'X')
      return {
        icon: 'user_undelete',
        onClick: newstate(deceased ? 'D' : paidUp ? 'S' : 'L'),
        tiptext: 'Clear the Delete Request',
      };
    if (deleteState === 'S')
      return {
        icon: 'user_enable',
        onClick: newstate('OK'),
        tiptext: 'Unsuspend this Member',
      };
    return { visible: false };
  })(deleteState);
  const { onClick: goNext, ...nextState } = ((deleteState) => {
    if (deleteState === 'X')
      return {
        icon: 'Delete_Member',
        onClick: deleteMember,
        tiptext: 'Permanently Delete Member',
        visible: deleteable,
      };
    if (deleteState === 'OK')
      return {
        icon: 'user_disable',
        onClick: newstate('S'),
        tiptext: 'Suspend this Member',
      };
    return {
      icon: 'user_delete',
      onClick: newstate('X'),
      tiptext: 'Request Member Deletion',
      visible: deleteable,
    };
  })(deleteState);
  const { onClick: goDeceased, ...deceasedState } = ((deleteState) => {
    if (deleteState === 'X')
      return {
        icon: 'Delete_Member',
        onClick: deleteMember,
        tiptext: 'Permanently Delete Member',
        visible: deleteable,
      };

    return {
      icon: 'user_deceased',
      onClick: newstate('D'),
      tiptext: 'Member Deceased',
      visible: deleteState !== 'D' && deleteState !== 'OK',
    };
  })(deleteState);

  logit('nextState', deleteState, nextState);
</script>

{#if $editMode}
  <div class={'suspend-buttons ' + className}>
    <TooltipButton visible onClick={goNext} {...nextState} />
    <TooltipButton visible onClick={goDeceased} {...deceasedState} />
    <TooltipButton visible onClick={goPrev} {...prevState} />
  </div>
{/if}

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 2em;
  }
</style>
