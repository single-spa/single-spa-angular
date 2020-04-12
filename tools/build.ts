import { join } from 'path';
import { ngPackagr } from 'ng-packagr';
import { createReadStream, createWriteStream } from 'fs';

function copyReadme(): void {
  createReadStream(join(__dirname, '../README.md'))
    .pipe(createWriteStream(join(__dirname, '../lib/README.md')))
    .on('finish', () => console.log('Successfully copied README.md into lib folder!'));
}

ngPackagr()
  .forProject(join(__dirname, '../src/package.json'))
  .withTsConfig(join(__dirname, '../src/tsconfig.lib.json'))
  .build()
  .then(copyReadme)
  .catch(error => console.error(error));
