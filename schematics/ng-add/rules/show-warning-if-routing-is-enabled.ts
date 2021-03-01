import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';

import { Schema as NgAddOptions } from '../schema';

export function showWarningIfRoutingIsEnabled(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.routing) {
      context.logger.warn(
        'Warning: Since routing is enabled, an additional manual\n' +
          'configuration will be required, see https://single-spa.js.org/docs/ecosystem-angular/#configure-routes',
      );
    }
  };
}
