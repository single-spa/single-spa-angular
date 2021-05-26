import { normalize, workspaces } from '@angular-devkit/core';
import {
  apply,
  move,
  url,
  mergeWith,
  applyTemplates,
  Rule,
  Tree,
  MergeStrategy,
  SchematicContext,
} from '@angular-devkit/schematics';

import { Schema as NgAddOptions } from '../schema';

export function createMainEntry(
  project: workspaces.ProjectDefinition,
  options: NgAddOptions,
): Rule {
  project.root;
  return (host: Tree, context: SchematicContext) => {
    const path = normalize(project.root);

    const templateSource = apply(url('./_files'), [
      applyTemplates({
        prefix: project.prefix,
        routing: options.routing,
      }),
      move(path),
    ]);
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    context.logger.info(`Generated 'main.single-spa.ts`);
    context.logger.info(`Generated 'single-spa-props.ts`);
    context.logger.info(`Generated asset-url.ts`);
    context.logger.info(`Generated extra-webpack.config.js`);
    return rule(host, context);
  };
}
