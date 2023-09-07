<script>
  // import Item from './MembersItem.svelte';
  // import { createEventDispatcher } from 'svelte';
  import { sortedByNameList as members } from '@store/membersIndex';
  import { currentMemberId } from '@store/memberCurrent';
  import Logit from '@utils/logit';

  var logit = Logit('pages/bookings/SelectMember', true);
  // const dispatch = createEventDispatcher();
  let filterText = '';
  let showList = false;
  $: regex = new RegExp(filterText, 'i');
  $: fMembers = $members.filter((mem) => regex.test(mem.fullName));

  const onFocus = () => {
    showList = true;
  };
  const onBlur = () => {
    setTimeout(() => {
      showList = false;
    }, 1000);
  };

  const _today = new Date();
  let thisYear = _today.getFullYear();
  const isDeletable = (item) => {
    if (item === 'Deceased') return true;
    if (
      item.memberStatus === 'Member' &&
      (item.suspended || item.subscription < thisYear)
    ) {
      return true;
    }
    return false;
  };
  const dispName = (name) => {
    var regex = new RegExp(`^(.*?)(${filterText})(.*)$`, 'i');
    let parts = name.match(regex);
    if (!parts) return name;
    const [, p1, p2, p3] = parts;
    return `${p1}<span style="color:blue; font-weight:bold;">${p2}</span>${p3}`;
  };

  const selectMem = (id) => {
    logit('select member', id);
    id && currentMemberId.set(id);
    showList = false;
    filterText = '';
  };
  let handleKeydown = (event) => {
    showList = true;
    if (event.which === 13 || event.which === 9) {
      selectMem(fMembers[0].memberId);
    }
  };
</script>

<div class="selectBox">
  <input
    type="text"
    bind:value={filterText}
    placeholder="Search for Member..."
    on:keydown={handleKeydown}
    on:focus={onFocus}
    on:blur={onBlur} />
  {#if showList}
    <div class="listBox">
      {#each fMembers as mem}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="member"
          class:deleteable={isDeletable(mem)}
          on:click={() => selectMem(mem.memberId)}>
          {@html dispName(mem.sortName)}
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- <div class={$$props.class ?? ''}>
  <Select items={$members} {...options} bind:selectedValue on:select={memberSelected} />
</div> -->
<style>
  :global(input) {
    margin: 0;
  }
  .selectBox {
    position: relative;
  }
  .selectBox input {
    height: 42px;
    width: 300px;
    padding: 0 16px;
  }
  /* .selectBox:focus-within .listBox {
    display: block;
  } */
  .listBox {
    /* display: none; */
    position: absolute;
    top: 44px;
    max-height: 350px;
    overflow-y: scroll;
    width: 300px;
    background-color: white;
    border: thin solid black;
    z-index: 10;
    padding: 0 20px;
    box-shadow: 10px 5px 5px grey;
  }
  .member {
    height: 42px;
    line-height: 42px;
  }
  .member:hover {
    background: #b9daff;
  }
  .deleteable {
    text-decoration: line-through;
  }
</style>
