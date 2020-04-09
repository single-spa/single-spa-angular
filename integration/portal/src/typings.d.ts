import { LifeCycles } from 'single-spa';

declare global {
  interface Window {
    shop: LifeCycles<never>;
    navbar: LifeCycles<never>;
  }
}
