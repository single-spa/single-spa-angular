import singleSpaAngularWebpack from './index';

class MiniCssExtractPlugin {}

class AnotherPlugin {}

describe('Webpack config', () => {
  const defaultConfig = { entry: {}, optimization: {}, plugins: [] };

  describe('Remove MiniCssExtractPlugin', () => {
    test('should remove Mini Css Extract from plugins', () => {
      // GIVEN
      const config = { plugins: [new MiniCssExtractPlugin(), new AnotherPlugin()] };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // EXPECT
      expect(singleSpaConfig.plugins).toHaveLength(1);
      expect(singleSpaConfig.plugins[0].constructor.name).toBe('AnotherPlugin');
    });

    test('should remove Mini Css Extract from string rules and replace by style-loader', () => {
      // GIVEN
      const config = { module: { rules: [{ use: ['mini-css-extract-plugin', 'other-loader'] }] } };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // EXPECT
      expect(singleSpaConfig.module.rules[0]).toEqual({
        use: [{ loader: 'style-loader' }, 'other-loader'],
      });
    });

    test('should remove Mini Css Extract from object rules and replace by style-loader', () => {
      // GIVEN
      const config = {
        module: {
          rules: [{ use: [{ loader: 'mini-css-extract-plugin' }, { loader: 'other-loader' }] }],
        },
      };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // EXPECT
      expect(singleSpaConfig.module.rules[0]).toEqual({
        use: [{ loader: 'style-loader' }, { loader: 'other-loader' }],
      });
    });

    test('should not break if no Mini Css Extract configurations specified', () => {
      // GIVEN
      const config = {
        plugins: [new AnotherPlugin()],
        module: { rules: [{ use: ['other-loader', { loader: 'other-loader' }] }] },
      };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // EXPECT
      expect(singleSpaConfig.plugins).toHaveLength(1);
      expect(singleSpaConfig.plugins[0].constructor.name).toEqual('AnotherPlugin');
      expect(singleSpaConfig.module.rules[0]).toEqual({
        use: ['other-loader', { loader: 'other-loader' }],
      });
    });
  });

  describe("Don't remove MiniCssExtractPlugin", () => {
    test('should not remove the Mini Css Extract plugin', () => {
      // GIVEN
      const config = { plugins: [new MiniCssExtractPlugin(), new AnotherPlugin()] };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {},
        {
          removeMiniCssExtract: false,
        },
      );

      // EXPECT
      expect(singleSpaConfig.plugins).toHaveLength(2);
      expect(singleSpaConfig.plugins[0].constructor.name).toBe('MiniCssExtractPlugin');
    });
  });

  describe('Source maps', () => {
    test('should not set "devtool" option when source maps are disabled', () => {
      // GIVEN
      const config = {
        devtool: false,
      };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {
          sourceMap: false,
        },
      );

      // EXPECT
      expect(singleSpaConfig.devtool).toEqual(false);
    });

    test('should not set "devtool" option when source maps are disabled for scripts', () => {
      // GIVEN
      const config = {
        plugins: [],
        devtool: false,
      };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {
          sourceMap: {
            vendor: true,
            scripts: false,
          },
        },
      );

      // EXPECT
      expect(singleSpaConfig.devtool).toEqual(false);
    });

    test('should set "devtool" to "sourcemaps" when source maps are enabled', () => {
      // GIVEN
      const config = {
        plugins: [],
        devtool: false,
      };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {
          sourceMap: true,
        },
      );

      // EXPECT
      expect(singleSpaConfig.devtool).toEqual('sourcemap');
    });
  });
});
