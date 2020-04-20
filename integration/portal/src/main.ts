import { registerApplication, start } from 'single-spa';

import './navigation';

import { loadAngularScript } from './loaders';
import { SHOP_APP_URL, CHAT_APP_URL } from './config';

registerApplication(
  'shop',
  () => loadAngularScript(SHOP_APP_URL).then(() => window.shop),
  location => location.pathname.startsWith('/shop'),
);

registerApplication(
  'chat',
  () => loadAngularScript(CHAT_APP_URL).then(() => window.chat),
  location => location.pathname.startsWith('/chat'),
);

start();
