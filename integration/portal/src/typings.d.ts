import { LifeCycles } from 'single-spa';

declare global {
  interface Window {
    shop: LifeCycles<never>;
    chat: LifeCycles<never>;
    noopZone: LifeCycles<never>;
  }
}
