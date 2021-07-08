// import { writable } from 'svelte/store';

// import { fetchData } from '@utils/use-data-api';
import { refreshAccountBookings } from './accountStatus.js';
import { updateMemberIndex } from './membersList';
import Logit from '@utils/logit';

var logit = Logit('store/monitorChanges');

import { refreshedBookingStatus } from './walkBookingStatus';
let retry = 0;
const createEvents = () => {
  // let events = new EventSource();
  // `localhost:4444/bookingsServer/monitorChanges?who=app${retry++}`,
  const host = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4444';
  let events = new EventSource(`${host}/bookingsServer/monitorChanges?who=app${retry++}`);
  events.onerror = (error) => {
    logit('error', error);
  };
  events.onmessage = (e) => {
    let { lastEventId: id, data, type } = e;
    data = JSON.parse(data);
    logit('monitorChanges event', { id, data, type }, e);
    // if (id === 'refreshBookingCount') refreshedBookingStatus(Object.values(data));
    // if (id === 'bookingChange') refreshAccountBookings(data);
    // if (id === 'refreshMemberIndex') updateMemberIndex(data);
  };
  events.addEventListener('test', (e) =>
    console.log('test event', e.lastEventId, e.data),
  );
  events.addEventListener('bookingChange', (e) => refreshAccountBookings(e.data));
  events.addEventListener('refreshMemberIndex', (e) => updateMemberIndex(e.data));
  events.addEventListener('refreshBookingCount', (e) => {
    logit('monitorChanges refreshBookingCount', e.id, e.data, e);
    refreshedBookingStatus(Object.values(e.data));
  });
  return events;
};
createEvents();
// setInterval(() => {
//   if (events.readyState === 2) createEvents();
// }, 10000);
