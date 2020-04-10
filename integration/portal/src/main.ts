import 'zone.js';
import { registerApplication, start } from 'single-spa';

import { SHOP_APP_URL } from './config';
import { loadAngularScript } from './loaders';

registerApplication(
  'shop',
  async () => {
    await loadAngularScript(SHOP_APP_URL);
    return window.shop;
  },
  () => true,
);

start();
