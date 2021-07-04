import Logit from '@utils/logit';
var logit = Logit('store/useDataApi');
const db = `/bookingsServer/`;

export const getRequest = async (url) => {
  try {
    logit(`getRequest`, url);
    const res = await fetch(`${db}${url}`, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
    });
    let body = await res.json();
    logit(`getRequest ${url} returned:`, body);

    return body;
  } catch (error) {
    console.log(error);
  }
};

export const postRequest = async (url, data) => {
  try {
    logit(`postRequest`, data);
    const res = await fetch(db + url, {
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
};
// eslint-disable-next-line no-unused-vars
function sleeper(ms) {
  return function (x) {
    return new Promise((resolve) => setTimeout(() => resolve(x), ms));
  };
}
// import { promisify } from 'util';
// // eslint-disable-next-line no-unused-vars
// const sleep = promisify(setTimeout);

export const fetchData = (url) => getRequest('bookings/' + url);
export const fetchAuth = (url) => getRequest('auth/' + url);
export const postData = (data) => postRequest('bookings/patches', data);
export const postAuth = (data) => postRequest('auth/login', data);
