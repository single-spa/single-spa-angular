interface Rule {
  test: RegExp;
  rules: ChildRule[];
}

interface ChildRule {
  oneOf: ChildRuleCondition[];
}

interface ChildRuleCondition {
  exclude?: string;
  include?: string;
  use?: { loader?: string }[];
}

/**
 * The Webpack 5 schema for `config.module.rules` now looks as follows:
 * ```json
 * {
 *   test: /\\.(?:scss)$/i,
 *   rules: [
 *     {
 *       oneOf: [
 *         {
 *           include: ['apps/noop-zone/styles.scss'],
 *           use: [
 *             {
 *               loader: 'node_modules/mini-css-extract-plugin/dist/loader.js'
 *             },
 *             {
 *               loader: 'node_modules/css-loader/dist/cjs.js'
 *             },
 *             {
 *               loader: 'node_modules/@angular-builders/custom-webpack/node_modules/postcss-loader/dist/cjs.js'
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export function removeMiniCssExtractRules(config: any): void {
  const rules: Rule[] = config.module.rules.filter((rule: Rule) => Array.isArray(rule.rules));

  for (const rule of rules) {
    const childRules: ChildRule[] = rule.rules.filter(childRule => Array.isArray(childRule.oneOf));

    for (const childRule of childRules) {
      tryToRemoveMiniCssExtractThroughConditions(childRule);
    }
  }
}

function tryToRemoveMiniCssExtractThroughConditions(childRule: ChildRule): void {
  const childRuleConditions: ChildRuleCondition[] = childRule.oneOf.filter(childRuleCondition =>
    Array.isArray(childRuleCondition.use),
  );

  for (const childRuleCondition of childRuleConditions) {
    const cssMiniExtractIndex = childRuleCondition.use!.findIndex(
      (use: any) =>
        (typeof use === 'string' && use.includes('mini-css-extract-plugin')) ||
        (typeof use === 'object' && use.loader && use.loader.includes('mini-css-extract-plugin')),
    );

    if (cssMiniExtractIndex >= 0) {
      childRuleCondition.use![cssMiniExtractIndex] = { loader: 'style-loader' };
    }
  }
}
