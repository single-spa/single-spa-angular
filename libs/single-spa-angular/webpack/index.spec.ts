import singleSpaAngularWebpack from './index';

class MiniCssExtractPlugin {}

class AnotherPlugin {}

describe('Webpack config', () => {
  const defaultConfig = { entry: {}, optimization: {}, plugins: [] };

  describe('Remove MiniCssExtractPlugin', () => {
    test('should remove Mini Css Extract from plugins', () => {
      // Arrange
      const config = { plugins: [new MiniCssExtractPlugin(), new AnotherPlugin()] };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // Assert
      expect(singleSpaConfig.plugins).toHaveLength(1);
      expect(singleSpaConfig.plugins[0].constructor.name).toBe('AnotherPlugin');
    });

    test('should remove Mini Css Extract from string rules and replace by style-loader', () => {
      // Arrange
      const config = {
        module: {
          rules: [
            {
              test: /\.scss$/,
              rules: [
                {
                  oneOf: [
                    {
                      use: ['mini-css-extract-plugin', 'other-loader'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // Assert
      expect(singleSpaConfig.module.rules).toMatchSnapshot();
    });

    test('should remove Mini Css Extract from object rules and replace by style-loader', () => {
      // Arrange
      const config = {
        module: {
          rules: [
            {
              test: /\.scss$/,
              rules: [
                {
                  oneOf: [
                    {
                      use: [{ loader: 'mini-css-extract-plugin' }, { loader: 'other-loader' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // Assert
      expect(singleSpaConfig.module.rules).toMatchSnapshot();
    });

    test('should not break if no Mini Css Extract configurations specified', () => {
      // Arrange
      const config = {
        plugins: [new AnotherPlugin()],
        module: {
          rules: [
            {
              test: /\.scss$/,
              rules: [
                {
                  oneOf: [
                    {
                      use: ['other-loader', { loader: 'other-loader' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack({ ...defaultConfig, ...config });

      // Assert
      expect(singleSpaConfig.plugins).toHaveLength(1);
      expect(singleSpaConfig.plugins[0].constructor.name).toEqual('AnotherPlugin');
      expect(singleSpaConfig.module.rules).toMatchSnapshot();
    });
  });

  describe("Don't remove MiniCssExtractPlugin", () => {
    test('should not remove the Mini Css Extract plugin', () => {
      // Arrange
      const config = { plugins: [new MiniCssExtractPlugin(), new AnotherPlugin()] };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {},
        {
          removeMiniCssExtract: false,
        },
      );

      // Assert
      expect(singleSpaConfig.plugins).toHaveLength(2);
      expect(singleSpaConfig.plugins[0].constructor.name).toBe('MiniCssExtractPlugin');
    });
  });

  describe('Source maps', () => {
    test('should not set "devtool" option when source maps are disabled', () => {
      // Arrange
      const config = {
        devtool: false,
      };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {
          sourceMap: false,
        },
      );

      // Assert
      expect(singleSpaConfig.devtool).toEqual(false);
    });

    test('should not set "devtool" option when source maps are disabled for scripts', () => {
      // Arrange
      const config = {
        plugins: [],
        devtool: false,
      };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {
          sourceMap: {
            vendor: true,
            scripts: false,
          },
        },
      );

      // Assert
      expect(singleSpaConfig.devtool).toEqual(false);
    });

    test('should set "devtool" to "sourcemaps" when source maps are enabled', () => {
      // Arrange
      const config = {
        plugins: [],
        devtool: false,
      };

      // Act
      const singleSpaConfig = singleSpaAngularWebpack(
        { ...defaultConfig, ...config },
        {
          sourceMap: true,
        },
      );

      // Assert
      expect(singleSpaConfig.devtool).toEqual('source-map');
    });
  });
});
