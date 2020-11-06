import singleSpaAngularWebpack from '../../libs/single-spa-angular/webpack';

export default (config, options) => {
  config = singleSpaAngularWebpack(config, options);
  config.externals = [/^single-spa$/];
  return config;
};
