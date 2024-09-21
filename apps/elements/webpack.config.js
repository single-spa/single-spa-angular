const singleSpaConfig = require('../../lib/lib/webpack');

module.exports = (config, options) => {
  config = singleSpaConfig.default(config, options);

  // https://github.com/angular/angular-cli/blob/b65ef44cbe36416271521eba0ba5fc0b4442af55/packages/angular_devkit/build_angular/src/tools/webpack/configs/styles.ts#L235-L255
  const scssRule = config.module.rules.find(rule => rule.test.toString().includes('scss')).rules[0];

  scssRule.oneOf.unshift({
    resourceQuery: /\?unmountable/,
    use: [
      {
        loader: 'style-loader',
        options: {
          injectType: 'lazySingletonStyleTag',
        },
      },
      // Take the other loaders that Angular uses internally.
      // Since we replaced the `mini-css-extract-plugin` loader with the
      // `style-loader` (which is at index 0), we slice the list by 1 index.
      ...scssRule.oneOf[0].use.slice(1),
    ],
  });

  return config;
};
