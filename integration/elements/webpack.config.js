const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

module.exports = config => {
  config = singleSpaAngularWebpack(config);
  config.output.library = 'elements';
  return config;
};
