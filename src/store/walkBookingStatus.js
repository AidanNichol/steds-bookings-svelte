import { writable } from 'svelte/store';

import { fetchData } from '@utils/use-data-api';
import Logit from '@utils/logit';

var logit = Logit('store/walkBookingStatus');

export const status = writable([]);
const loadBookingCount = async () => {
  const data = await fetchData('walk/bookingCount');
  // const data = res.map((w) => {
  //   w.full = w.capacity - w.booked - w.waiting <= 0;
  //   return w;
  // });
  logit('getStatus', data);
  status.set(data);
  // const createEvents = () => {
  //   let events = new EventSource(
  //     'http://localhost:4444/monitorChanges',
  //     // 'http://localhost:4444/bookings/walk/monitorBookingCount',
  //   );

  //   events.onmessage = (event) => {
  //     let { lastEventId: id, data } = event;
  //     data = JSON.parse(data);
  //     logit('monitorChanges event', id, data);
  //     if (id === 'refreshBookingCount') status.set(Object.values(data));
  //   };
  //   return events;
  // };
  // let events = createEvents();
  // setInterval(() => {
  //   if (events.readyState === 2) createEvents();
  // }, 10000);
};
export function refreshedBookingStatus(data) {
  data = Object.values(data);

  status.set(data);
}

loadBookingCount();

// export const updateStatus = ({ walkId, from, to }) => {
//   status.update((status) => {
//     const walk = status.find((w) => w.walkId === walkId);
//     if (from === 'B') walk.booked -= 1;
//     if (from === 'W') walk.waiting -= 1;
//     if (from === 'C') walk.cars -= 1;
//     if (to === 'B') walk.booked += 1;
//     if (to === 'W') walk.waiting += 1;
//     if (to === 'C') walk.cars += 1;
//     walk.full = walk.capacity - walk.booked - walk.waiting <= 0;
//   });
// };
