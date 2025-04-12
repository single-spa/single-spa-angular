import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from "@angular-devkit/schematics";
import { ReplaceChange } from "@schematics/angular/utility/change";
import { applyChangesToFile } from "@schematics/angular/utility/standalone/util";
import { Schema } from "./schema.js";
import { insertImport } from "@schematics/angular/utility/ast-utils";
import ts from "typescript";
import { normalize } from "path";
import { JSONFile } from "@schematics/angular/utility/json-file";

export function ngAdd(options: Schema): Rule {
  return chain([
    updateMain(),
    createSingleSpaProps(),
    alterAngularJson(options),
  ]);
}

function alterAngularJson(options: Schema): Rule {
  return (tree: Tree) => {
    const angularJson = new JSONFile(tree, "angular.json");

    if (options.cors) {
      // Read the current value, if it exists.
      angularJson.modify(
        [
          "projects",
          options.project,
          "architect",
          "serve",
          "options",
          "headers",
          "Access-Control-Allow-Origin",
        ],
        "*",
      );
    }

    return tree;
  };
}

function createSingleSpaProps(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url("./files"), [
      applyTemplates({}),
      move(normalize("src/app")),
    ]);

    return mergeWith(templateSource);
  };
}

function updateMain(): Rule {
  const oldText = `bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));`;
  const newText = `export const { bootstrap, mount, unmount } = singleSpaAngular<SingleSpaExtraProps>({
  bootstrapApplication,
  rootComponent: AppComponent,
  appConfig,
  propsInjectionToken: SINGLE_SPA_PROPS,
});`;

  return (tree: Tree, context: SchematicContext) => {
    const sourceFile = ts.createSourceFile(
      "src/main.ts",
      tree.readText("src/main.ts"),
      ts.ScriptTarget.Latest,
      true,
    );
    const initializationChange = new ReplaceChange(
      "src/main.ts",
      165,
      oldText,
      newText,
    );
    const singleSpaAngularImportChange = insertImport(
      sourceFile,
      "src/main.ts",
      "singleSpaAngular",
      "single-spa-angular",
    );
    const propsImportChange = insertImport(
      sourceFile,
      "src/main.ts",
      "SINGLE_SPA_PROPS, SingleSpaExtraProps",
      "./app/single-spa-props",
    );
    // const extraPropsImportChange = insertImport(sourceFile, "src/main.ts", "SingleSpaPropExtraProps", "./app/single-spa-props");
    applyChangesToFile(tree, "src/main.ts", [
      initializationChange,
      singleSpaAngularImportChange,
      propsImportChange,
    ]);
  };
}
