<script>
  const mode = process.env.NODE_ENV;

  export let header = '';
  export let body = '';

  console.log('env', mode, process.env);
</script>

<div class={`panel ${$$props.class ?? ''}  ${mode}`} style="{$$props.style ?? ''}}">
  <div class={'panel-header ' + mode}>
    <slot name="header">
      <h4>{header}</h4>
    </slot>
  </div>
  <div class={'panel-body ' + (body?.clb ?? '')}>
    <div class="panel-contents">
      <slot />
    </div>
  </div>
</div>

<style lang="postcss">
  .panel {
    /* display: flex;
    flex-direction: column; */
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    align-item: stretch;
    box-sizing: border-box;
    margin-bottom: 10px;
    border-width: 2px;
    border-style: solid;
    border-color: #bce8f1;
    border-radius: 2px;
    background-color: #fff;
    min-height: 100%;
  }
  .panel.development {
    border-color: #8f7031;
  }

  .panel-header {
    flex: 0;
    box-sizing: border-box;
    font-size: 1.5rem;
    align-items: center;
    font-weight: 600;
    border-width: 0;
    border-bottom-width: 2px;
    border-style: solid;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    padding: 5px 10px;

    color: #31708f;
    background-color: #d9edf7;
    border-color: #bce8f1;
  }

  .panel-header.development {
    color: #8f7031;
    background-color: #f0d398;
    border-color: #8f7031;
  }

  h4 {
    margin: 0;
  }

  .panel-body {
    flex: 1;
    height: 100%;
    padding: 5px 10px;
    margin: 0;
    display: flex;
    flex-direction: row;
    align-content: stretch;
    position: relative;
  }

  .panel-contents {
    width: 100%;
    height: 100%;
    max-height: 100%;
  }
</style>
