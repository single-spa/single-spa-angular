import typescript from 'rollup-plugin-typescript2';

import packageJson from './package.json';

const cjsConfig = {
  input: './src/browser-lib/single-spa-angular.ts',
  output: {
    file: packageJson.main,
    format: 'cjs',
    exports: 'named',
  },
  external: id => id.startsWith('@angular'),
  plugins: [
    typescript({
      tsconfig: './tsconfig.spa.json',
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          target: 'ES5',
        },
      },
    }),
  ],
};

const esmConfig = {
  input: './src/browser-lib/single-spa-angular.ts',
  output: {
    file: packageJson.module,
    format: 'esm',
    exports: 'named',
  },
  external: id => id.startsWith('@angular'),
  plugins: [
    typescript({
      tsconfig: './tsconfig.spa.json',
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          target: 'ES2015',
        },
      },
    }),
  ],
};

export default [cjsConfig, esmConfig];
