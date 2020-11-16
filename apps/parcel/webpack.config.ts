import singleSpaAngularWebpack from '../../libs/single-spa-angular/webpack';

export default (config: any, options: any) => {
  config = singleSpaAngularWebpack(config, options);
  config.externals = [/^single-spa$/];
  return config;
};
