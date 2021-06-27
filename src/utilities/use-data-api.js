// import { useState, useEffect, useReducer } from "react";
// import axios from 'axios';
import _ from 'lodash';
import Logit from '@utils/logit';
var logit = Logit('store/useDataApi');
// let local = process.env.NODE_ENV === 'development';
let local = true;
// const proto = local ? 'http' : 'https';
const host = local ? 'localhost:4444' : 'aidan.a2hosted.com';
// export const wsUrl = `wss://${host}/testkoa`;
export const wsUrl = `wss://${host}:42424`;
const dbName = `/bookingsServer/bookings/`;
const db = `/bookingsServer/`;
// export const dbName = `${proto}://${host}/testkoa/bookings/`;
// export const db = `${proto}://${host}/testkoa/`;

const getData = _.curry(async (block, url, setState) => {
  try {
    logit(`fetchData`, url);
    const res = await fetch(db + block + url, {
      mode: 'no-cors',
      cache: 'no-cache',
      credentials: 'include',
    });
    logit('getData response', res);
    let body = await res.json();
    logit(`fetchData ${url} returned:`, body);
    if (setState) setState(body.data);
    return body;
  } catch (error) {
    console.log(error);
  }
});
export const getAuth = getData('auth/');
export const getBookings = getData('bookings/');

export const fetchData = async (url, setState) => {
  try {
    logit(`fetchData`, url);
    const res = await fetch(dbName + url, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
    });
    let body = await res.json();
    logit(`fetchData ${url} returned:`, body);
    // console.log(`fetchData ${url} post:`, body);
    if (setState) setState(body.data);
    return body;
  } catch (error) {
    console.log(error);
  }
};
export const fetchAuth = async (url, setState) => {
  try {
    let url2 = `${db}auth/${url}`;
    logit(`fetchAuth`, url, url2);
    const res = await fetch(`${db}auth/${url}`, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
    });
    let body = await res.json();
    logit(`fetchAuth ${url} returned:`, body);
    // console.log(`fetchAuth ${url} post:`, body);
    if (setState) setState(body.data);
    return body;
  } catch (error) {
    console.log(error);
  }
};
export const postRequest = _.curry(async (block, url, data) => {
  try {
    logit(`postRequest`, data);
    const res = await fetch(db + block + url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    let body = await res.json();
    logit(`postRequest ${url} returned:`, body);
    // console.log(`fetchData ${url} post:`, body);
    return body;
  } catch (error) {
    console.log(error);
  }
});
// eslint-disable-next-line no-unused-vars
function sleeper(ms) {
  return function (x) {
    return new Promise((resolve) => setTimeout(() => resolve(x), ms));
  };
}
export const postData = postRequest('bookings/', 'patches');
export const postBookings = postRequest('bookings/');
export const postAuth = postRequest('auth/');
// export const useFetchData = createUseFetch(myFetch);
// export const useBookingQuery = (queryKey) => useQuery(queryKey, myFetch2);
// export const usePaginatedBookingQuery = (queryKey) =>
// usePaginatedQuery(queryKey, myFetch2);
