<script>
  import { page } from '@store/router';
  export let toPage;
  export let name;
  // let selected = $page === page;
  // export let setPage;
</script>

<!-- <span>{name}</span> -->

<span on:click={() => page.set(toPage)} class="link" class:selected={$page === toPage}>
  {name}
</span>

<style lang="postcss">
  .link {
    position: relative;
    display: inline-block;
    padding: 1.5em 1.5em 1em;
    color: inherit;
    text-decoration: none;
    &:hover {
      cursor: pointer;
      text-weight: bold;
    }
    &.selected {
      z-index: 2;
      &::before {
        margin-bottom: -1px;
        border-top-width: 1px;
        background: #eee;
      }
    }
  }
  .link::before {
    border: 0.1em solid #aaa;
    content: '';
    /* To generate the box */
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0.5em;
    left: 0;
    z-index: -1;
    border-bottom: none;
    border-radius: 10px 10px 0 0;
    background: #ddd;
    box-shadow: 0 2px hsla(0, 0%, 100%, 0.5) inset;
    transform: perspective(5px) rotateX(2deg);
    transform-origin: bottom;
  }

  /* .link {
    border: 1px solid #444;
    padding: 20px;

    color: #222;
    font-weight: bold;
    line-height: 14px;
    text-decoration: none;
    text-align: center;
  }

  .link:hover {
    color: red;
  }
  .link.selected {
    background: transparent;
    border-bottom: 4px solid #000;
    color: #000;
    padding-bottom: 0;
  } */
</style>
