import { LifeCycles } from 'single-spa';

declare global {
  interface Window {
    shop: LifeCycles<never>;
    chat: LifeCycles<never>;
    navbar: LifeCycles<never>;
    elements: LifeCycles<never>;
    noopZone: LifeCycles<never>;
  }
}
