import singleSpaAngularWebpack from './index';

class MiniCssExtractPlugin {}

class AnotherPlugin {}

describe('Webpack config', () => {
  const defaultConfig = { entry: {}, optimization: {}, plugins: [] };

  beforeEach(async () => {});

  describe('Remove MiniCssExtractPlugin', () => {
    test('should remove Mini Css Extract from plugins', async () => {
      // GIVEN
      const config = { plugins: [new MiniCssExtractPlugin(), new AnotherPlugin()] };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // EXPECT
      expect(singleSpaConfig.plugins).toHaveLength(1);
      expect(singleSpaConfig.plugins[0].constructor.name).toBe('AnotherPlugin');
    });

    test('should remove Mini Css Extract from string rules and replace by style-loader', async () => {
      // GIVEN
      const config = { module: { rules: [{ use: ['mini-css-extract-plugin', 'other-loader'] }] } };

      // TEST
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // EXPECT
      expect(singleSpaConfig.module.rules[0]).toEqual({
        use: [{ loader: 'style-loader' }, 'other-loader'],
      });
    });

    test('should remove Mini Css Extract from object rules and replace by style-loader', async () => {
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

    test('should not break if no Mini Css Extract configurations specified', async () => {
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
});
