import { writable, get } from 'svelte/store';

import { loadMembers } from '@store/membersList';
import { loadWalks } from '@store/walksList';
import { loadAccounts } from '@store/accountsList';
// import { currentMemberId } from '@store/memberCurrent';

import { getStartDate } from './accountStatus';
import Logit from '@utils/logit';

var logit = Logit('store/index');

export const loaded = writable(false);
export const loading = writable(false);
export const firstBookingDate = writable(null);

export const loadNames = async () => {
  logit('actions/loadnames', '');

  await loadMembers();
  await loadWalks();
  await loadAccounts();
};

export const hydrate = async () => {
  const isLoading = get(loading);
  const isLoaded = get(loaded);
  logit('hydrate?', isLoaded, isLoading);
  if (isLoaded || isLoading) return;
  loading.set(true);

  await loadNames();
  const fBooking = await getStartDate();
  firstBookingDate.set(fBooking);
  loading.set(false);
  loaded.set(true);
  setTimeout(() => {
    // currentMemberId.set('M825');
    // currentMemberId.set('M401');
    // currentMemberId.set('M853');
    // currentMemberId.set('M2009');
  }, 100);
};
