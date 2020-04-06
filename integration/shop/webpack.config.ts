import singleSpaAngularWebpack from '../../src/webpack';

export default (angularWebpackConfig, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(
    angularWebpackConfig,
    options
  );

  if (singleSpaWebpackConfig.entry['polyfills-es5']) {
    delete singleSpaWebpackConfig.entry['polyfills-es5'];
  }

  singleSpaWebpackConfig.output.library = 'shop';

  return singleSpaWebpackConfig;
};
