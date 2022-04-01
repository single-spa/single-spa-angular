import singleSpaAngularWebpack from '../../libs/single-spa-angular/webpack';

export default (config: any, options: any) => {
  config = singleSpaAngularWebpack(config, options);
  config.externals = [
    ...config.externals,
    'rxjs',
    'rxjs/operators',
    '@angular/core',
    '@angular/common',
    '@angular/common/http',
    '@angular/compiler',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/elements',
    'single-spa-angular/internals',
    'single-spa-angular',
    'single-spa-angular/elements',
  ];
  return config;
};
