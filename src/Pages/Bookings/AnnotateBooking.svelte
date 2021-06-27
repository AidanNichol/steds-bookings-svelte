<script context="module">
  import Logit from '@utils/logit';
  import { writable } from 'svelte/store';
  var logit = Logit('pages/bookings/annotateBooking');

  let booking = writable({});
  let bookingId;
  let el;

  let isOpen = writable(false);
  let note = writable(null);
  // this allows an importer to do e.g.
  // `import Example, { alertTotal } from './Example.svelte'`
  export function openAnnotations(bkng) {
    booking.set(bkng);
    note.set(bkng.annotation ?? '');
    bookingId = bkng?.bookingId;
    isOpen.set(true);
    logit('openningAnnotations', bkng);
    setTimeout(() => {
      // note.set(booking.annotation ?? '');
      el?.dispatchEvent(new Event('focus', { bubbles: true }));
      logit('setting note', note);
    }, 30);
  }
  // $: if (refresh) {
  //   setTimeout(() => {
  //     // logit('refresh dispatch focus', name, el);
  //     el?.dispatchEvent(new Event('focus', { bubbles: true }));
  //     refresh = false;
  //   }, 3);
  // }
</script>

<script>
  import FormControl from '@pages/MembersList/FormControl.svelte';
  import { text_area_resize } from '@utils/resizeable-textarea.js';
  import { nameIndex } from '@store/nameIndex';
  import { applyAnnotateBooking } from '@store/accountStatus';

  let name, venue;
  $: {
    venue = $nameIndex.get($booking?.walkId)?.venue;
    name = $nameIndex.get($booking?.memberId)?.shortName;
  }
  // logit('opening?', booking, isOpen, dispatch, closeAnno);

  // logit('props', props, { bookingId, name, venue, annotation });
  const save = () => {
    logit('about to distpatch', { note: $note }, { bookingId, annotation: $note });
    applyAnnotateBooking({ bookingId, annotation: $note });
    isOpen.set(false);
  };
  const cancel = () => {
    isOpen.set(false);
    note.set(null);
  };
</script>

<div class="anno" class:isOpen={$isOpen}>
  <FormControl name={`Annotate ${name} ${venue}`} />
  <div class="area">
    <textarea bind:value={$note} bind:this={el} use:text_area_resize />
    <button on:click={save}>Save</button>
    <button on:click={cancel}>Cancel</button>
  </div>
</div>

<style>
  .anno {
    visibility: hidden;
  }
  .anno.isOpen {
    visibility: visible;
  }
  .area {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 400px;
  }
  textarea {
    width: 250px;
  }
</style>
