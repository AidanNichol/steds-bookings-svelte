import { writable, get } from 'svelte/store';
import { produce } from 'immer';

export const createImmerActionStore = (value, actions = {}) => {
  const store = writable(value);
  addActionsToStore(store, actions, store);
  addGettersSettersToStore(store, value, store);

  // Object.keys(value).forEach((key) => {
  //   Object.defineProperty(store, key, {
  //     get: () => get(store)[key],
  //     set: (value) => {
  //       store.update((state) => ({ ...state, [key]: value }));
  //       console.log('setting store', key, value, get(store));
  //     },
  //   });
  // });
  // Object.keys(actions).forEach((actionName) => {
  //   store[actionName] = (payload) =>
  //     store.update((state) => produce(actions[actionName])(state, payload));
  // });

  store.values = () => get(store);
  return store;
};
// storeD and storeB could be the same object
// if storeD is dervived from storeB then this allows
// you to add actions/setters to storeD but actually update the
// backend store storeB
export const addActionsToStore = (storeD, actions = {}, storeB = storeD) => {
  Object.keys(actions).forEach((actionName) => {
    storeD[actionName] = (payload) =>
      storeB.update((state) => produce(actions[actionName])(state, payload));
  });
};
export const addGettersSettersToStore = (storeD, value = {}, storeB = storeD) => {
  Object.keys(value).forEach((key) => {
    Object.defineProperty(storeD, key, {
      get: () => get(storeB)[key],
      set: (value) => {
        storeB.update((state) => ({ ...state, [key]: value }));
        console.log('setting updateStore', key, value, get(storeB));
      },
    });
  });
};
export const addGettersToStore = (store, getters = {}, updateStore) => {
  Object.entries(getters).forEach(([key, fn]) => {
    Object.defineProperty(store, key, {
      get: () => fn(updateStore),
    });
  });
};
