// import { createImmerActionStore } from '../utilities/createImmerActionStore';
import { writable } from 'svelte/store';
import Logit from '@utils/logit';
const logit = Logit('store/router');

export const page = writable(null);
export const setPage = (payload) => {
  logit('setPage', payload);
  page.set(payload);
};
