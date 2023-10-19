import * as path from 'node:path';

import singleSpaWebpackConfig from '../../libs/single-spa-angular/webpack';

export default (config: any, options?: any, extraOptions?: any) => {
  config = singleSpaWebpackConfig(config, options, extraOptions);

  config.entry['shared-library'] = path.join(
    __dirname,
    './shared-library/shared-library.component.ts',
  );

  return config;
};
