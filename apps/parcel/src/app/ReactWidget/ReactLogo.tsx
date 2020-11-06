import * as React from 'react';

function assetUrl(url: string): string {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/camelcase
  const publicPath = __webpack_public_path__;
  const publicPathSuffix = publicPath.endsWith('/') ? '' : '/';
  const urlPrefix = url.startsWith('/') ? '' : '/';

  return `${publicPath}${publicPathSuffix}assets${urlPrefix}${url}`;
}

export default function ReactLogo() {
  return <img src={assetUrl('/react-logo.png')} alt="React logo" />;
}
