import singleSpaAngularWebpack from '../../src/webpack';

export default (angularWebpackConfig, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(angularWebpackConfig, options);

  singleSpaWebpackConfig.output.library = 'shop';

  return singleSpaWebpackConfig;
};
