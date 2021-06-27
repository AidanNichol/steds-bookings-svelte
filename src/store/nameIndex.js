// import { createImmerActionStore } from '@utils/createImmerActionStore';
import { derived } from 'svelte/store';
import { membersList } from '@store/membersList';
import { accountsList } from '@store/accountsList';
import { walksList } from '@store/walksList';
// const accountsList = writable([]);
export const nameIndex = derived(
  [membersList, accountsList, walksList],
  ([$membersList, $accountsList, $walksList]) => {
    // const names = new Map();
    const names = {};
    [...$membersList, ...$accountsList, ...$walksList].forEach((item) => {
      const { id } = item;
      // names.set(id, item);
      names[id] = item;
    });
    // return names;
    return { names, get: (id) => names[id] };
  },
);
