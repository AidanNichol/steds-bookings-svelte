<script>
  import Select from 'svelte-select';
  import Item from './MembersItem.svelte';
  import { createEventDispatcher } from 'svelte';
  import { sortedByNameList as members } from '@store/membersIndex';
  import { currentMemberId } from '@store/memberCurrent';
  import Logit from '@utils/logit';

  var logit = Logit('pages/bookings/SelectMember', true);
  const dispatch = createEventDispatcher();

  let selectedValue = { id: null, fullName: 'Search for Member...' };
  $: options = {
    optionIdentifier: 'id',
    getOptionLabel: (option) => option.sortName,
    getSelectionLabel: (option) => option.fullName,
    placeholder: 'Search for Member...',
    isClearable: true,
    Item,
  };

  const memberSelected = (e) => {
    // const mem = e.detail;
    const { id } = selectedValue;
    logit('selected', e, selectedValue);
    id && currentMemberId.set(id);
    // selectedValue = mem;
    setTimeout(() => {
      if (id) selectedValue = { id: null, fullName: 'Search for Member...' };
    }, 100);
    dispatch('clear', undefined);
  };
</script>

<div class={$$props.class ?? ''}>
  <Select items={$members} {...options} bind:selectedValue on:select={memberSelected} />
</div>

<style>
  :global(input) {
    margin: 0;
  }

  /* 	CSS variables can be used to control theming.
			https://github.com/rob-balfre/svelte-select/blob/master/docs/theming_variables.md
	*/

  .themed {
    --border: 3px solid blue;
    --borderRadius: 10px;
    --placeholderColor: blue;
  }

  .icon {
    --selectedItemPadding: 0 10px 0 8px;
    --inputPadding: 0 10px 0 40px;
  }
</style>
