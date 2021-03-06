// import App from './App.svelte';
import '@utils/versionHeader.js';
import '@utils/loadIconLibrary.js';

import App from './Pages/layouts/MainLayout.svelte';
import '@styles/svg-with-js.css';

const app = new App({
  target: document.body,
  props: {},
});
// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
// if (import.meta.hot) {
//   import.meta.hot.accept();
//   import.meta.hot.dispose(() => {
//     app.$destroy();
//   });
// }
export default app;
