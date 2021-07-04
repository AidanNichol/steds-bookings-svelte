<script>
  export let item = undefined;
  export let isActive = false;
  export let isFirst = false;
  export let isHover = false;
  export let getOptionLabel = null;
  export let filterText = '';
  let parts;
  let deleteable;
  $: deleteable = item.deceased || item.suspended || item.subscription < '2020';
  $: {
    var regex = new RegExp(`^(.*?)(${filterText})(.*)$`, 'i');
    parts = getOptionLabel(item).match(regex);
    if (!parts) parts = [item.sortName, '', ''];
    if (item.id === 'M1012') console.log(filterText, parts, deleteable, item);
  }
</script>

<div class="item" class:deleteable class:isActive class:isFirst class:isHover>
  {parts[1]}<span class="matched">{parts[2]}</span>{parts[3]}
</div>

<style>
  .item {
    cursor: default;
    height: var(--height, 32px);
    line-height: var(--height, 32px);
    padding: var(--itemPadding, 0 10px);
    color: var(--itemColor, inherit);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .item:active {
    background: var(--itemActiveBackground, #b9daff);
  }
  .item.isActive {
    background: var(--itemIsActiveBG, #007aff);
    color: var(--itemIsActiveColor, #fff);
  }
  .item.isFirst {
    border-radius: var(--itemFirstBorderRadius, 4px 4px 0 0);
  }
  .item.isHover:not(.active) {
    background: var(--itemHoverBG, #e7f2ff);
  }
  .deleteable {
    text-decoration: line-through;
  }
  .matched {
    color: blue;
    font-weight: bold;
  }
</style>
