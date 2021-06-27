<script>
  import { text_area_resize } from '@utils/resizeable-textarea.js';
  import { editMode, formFields } from '@store/memberCurrent.js';
  import _ from 'lodash';
  import * as normalizers from './normalizers.js';
  // import Logit from '@utils/logit.js';
  // const logit = Logit('Members/TextField');

  export let name = '';
  export let field = name;
  export let multiline = false;
  export let required = false;
  export let refresh = false;
  export let properCaseName = undefined;
  export let properCaseAddress = undefined;
  export let normalizePhone = undefined;
  export let normalizeMobile = undefined;
  let normalizer = (v) => v;
  let label;
  export let disable = false;
  let disabled;
  $: label = _.startCase(name);
  $: if (refresh) {
    setTimeout(() => {
      // logit('refresh dispatch focus', name, el);
      el?.dispatchEvent(new Event('focus', { bubbles: true }));
      refresh = false;
    }, 3);
  }
  // $: if (!field) field = name?.toLowerCase() ?? '';

  $: disabled = !$editMode || disable;
  $: {
    if (properCaseName) normalizer = normalizers.properCaseName;
    if (properCaseAddress) normalizer = normalizers.properCaseAddress;
    if (normalizePhone) normalizer = normalizers.normalizePhone;
    if (normalizeMobile) normalizer = normalizers.normalizeMobile;
  }

  const onInput = (e) => {
    let value = e.target.value;
    value = normalizer(value);
    formFields.update((state) => ({
      ...state,
      [field]: value,
    }));
    return value;
  };
  let el;
</script>

<div class={$$props.class ?? ''} style={$$props.style ?? ''} {label}>
  {#if multiline}
    <textarea
      value={$formFields[field]}
      bind:this={el}
      on:input={onInput}
      use:text_area_resize
      {required}
      {disabled}
    />
  {:else}<input
      value={$formFields[field]}
      on:input={onInput}
      {required}
      style={$$props.style ?? ''}
      {disabled}
    />{/if}
</div>

<style>
  div {
    position: relative;
  }
  input,
  textarea {
    width: 25em;
  }
  [label]:after {
    content: attr(label);
    position: absolute;
    display: inline-block;
    left: 1em;
    top: -8px;
    background-color: white;
    font-size: 0.7em;
    color: slategray;
  }
</style>
