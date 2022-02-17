import { defer, firstValueFrom, shareReplay } from 'rxjs';

import { assetUrl } from './single-spa/asset-url';

const montserrat$ = defer(() => {
  const unicodeRange =
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

  const montserrat300FontFace = new FontFace(
    'Montserrat',
    `url(${assetUrl('/fonts/Montserrat_300.woff2')})`,
    {
      weight: '300',
      style: 'normal',
      display: 'swap',
      unicodeRange,
    },
  );

  const montserrat400FontFace = new FontFace(
    'Montserrat',
    `url(${assetUrl('/fonts/Montserrat_400.woff2')})`,
    {
      weight: '400',
      style: 'normal',
      display: 'swap',
      unicodeRange,
    },
  );

  const montserrat500FontFace = new FontFace(
    'Montserrat',
    `url(${assetUrl('/fonts/Montserrat_500.woff2')})`,
    {
      weight: '500',
      style: 'normal',
      display: 'swap',
      unicodeRange,
    },
  );

  return Promise.all([
    montserrat300FontFace.load(),
    montserrat400FontFace.load(),
    montserrat500FontFace.load(),
  ]);
}).pipe(shareReplay({ bufferSize: 1, refCount: true }));

export function loadMontserrat(): Promise<FontFace[]> {
  return firstValueFrom(montserrat$);
}
