import { now } from '@utils/dateFns';

import packageJson from '../../package.json';
// import { setPageFromRoles } from '../../store/user';
const version = packageJson.version;
console.warn('starting v:', version, '@', now());
