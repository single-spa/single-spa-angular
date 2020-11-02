import { registerApplication, start } from 'single-spa';

import './navigation';

import { loadAngularScript } from './loaders';
import {
  SHOP_APP_URL,
  CHAT_APP_URL,
  NOOP_ZONE_APP_URL,
  NAVBAR_URL,
  ELEMENTS_APP_URL,
} from './config';

registerApplication({
  name: 'navbar',
  app: () => loadAngularScript(NAVBAR_URL).then(() => window.navbar),
  activeWhen: () => true,
});

registerApplication({
  name: 'shop',
  app: () => loadAngularScript(SHOP_APP_URL).then(() => window.shop),
  activeWhen: location => location.pathname.startsWith('/shop'),
});

registerApplication({
  name: 'chat',
  app: () => loadAngularScript(CHAT_APP_URL).then(() => window.chat),
  activeWhen: location => location.pathname.startsWith('/chat'),
});

registerApplication({
  name: 'noop-zone',
  app: () => loadAngularScript(NOOP_ZONE_APP_URL).then(() => window.noopZone),
  activeWhen: location => location.pathname.startsWith('/noop-zone'),
});

registerApplication({
  name: 'elements',
  app: () => loadAngularScript(ELEMENTS_APP_URL).then(() => window.elements),
  activeWhen: location => location.pathname.startsWith('/elements'),
});

start();
