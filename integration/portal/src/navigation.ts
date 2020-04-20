import { navigateToUrl } from 'single-spa';

const links = document.querySelectorAll<HTMLAnchorElement>('a.navbar-item');

for (const link of Array.from(links)) {
  link.addEventListener('click', event => {
    event.preventDefault();
    navigateToUrl(link.dataset.href!);
  });
}
