// import { createImmerActionStore } from '@utils/createImmerActionStore';
// import { fetchData } from '@utils/use-data-api';
import { writable, get } from 'svelte/store';

// import { loadStatus as loadBookingStatus } from '@store/walkBookingStatus';
// import { patches } from './patches';
import { loadMembers } from '@store/membersList';
import { loadWalks } from '@store/walksList';
import { loadAccounts } from '@store/accountsList';
// import { banking } from './banking';
// import { socket } from './socket';
// import { payments } from './payments';
// import { reports } from './reports';
import { getStartDate } from './accountStatus';
// import { debugSettings } from './debugSettings';
// import { router } from './router';
// // import { SW } from './SW';
// import { user } from './user';
import Logit from '@utils/logit';
// import { getWeekYearWithOptions } from 'date-fns/fp';

var logit = Logit('store/index');

// note the use of this which refers to observable instance of the store
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
  // await loadBookingStatus(true);
  // await banking.getLatestBanking();
  loading.set(false);
  loaded.set(true);
  // await socket.load();
  // await debugSettings.load();
};
