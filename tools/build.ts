import { join } from 'path';
import { ngPackagr } from 'ng-packagr';

async function buildPackage(): Promise<void> {
  try {
    await ngPackagr()
      .forProject(join(__dirname, '../src/package.json'))
      .withTsConfig(join(__dirname, '../src/tsconfig.lib.json'))
      .build();
  } catch (e) {
    console.log(e);
  }
}

buildPackage();
