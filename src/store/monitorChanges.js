// import { writable } from 'svelte/store';

// import { fetchData } from '@utils/use-data-api';
import { refreshAccountBookings } from './accountStatus.js';
import { updateMemberIndex } from './membersList';
import Logit from '@utils/logit';

var logit = Logit('store/monitorChanges');

import { refreshedBookingStatus } from './walkBookingStatus';

const createEvents = () => {
  let events = new EventSource('http://localhost:4444/monitorChanges');

  events.onmessage = (event) => {
    let { lastEventId: id, data } = event;
    data = JSON.parse(data);
    logit('monitorChanges event', id, data, event);
    if (id === 'refreshBookingCount') refreshedBookingStatus(Object.values(data));
    if (id === 'bookingChange') refreshAccountBookings(data);
    if (id === 'refreshMemberIndex') updateMemberIndex(data);
  };
  return events;
};
let events = createEvents();
setInterval(() => {
  if (events.readyState === 2) createEvents();
}, 10000);
