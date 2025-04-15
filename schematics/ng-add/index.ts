import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks/index.js";
import { ReplaceChange } from "@schematics/angular/utility/change";
import { applyChangesToFile } from "@schematics/angular/utility/standalone/util";
import { Schema } from "./schema.js";
import { insertImport } from "@schematics/angular/utility/ast-utils";
import ts, { Expression, Identifier, VariableStatement } from "typescript";
import { normalize } from "path";
import { JSONFile } from "@schematics/angular/utility/json-file";
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from "@schematics/angular/utility/dependencies";

export function ngAdd(options: Schema): Rule {
  return chain([
    updateMain(),
    copyFiles(),
    alterAngularJson(options),
    addDependencies(),
    removeIndexHtml(),
    addEmptyRoute(options),
  ]);
}

function alterAngularJson(options: Schema): Rule {
  return (tree: Tree) => {
    const angularJson = new JSONFile(tree, "angular.json");

    angularJson.modify(
      ["projects", options.project, "architect", "build", "options", "index"],
      "./node_modules/single-spa-angular/lib/schematics/ng-add/buried-config/index.html",
    );

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

    if (options.outputMainJs) {
      angularJson.modify(
        [
          "projects",
          options.project,
          "architect",
          "build",
          "configurations",
          "outputHashing",
        ],
        "none",
      );
    }

    return tree;
  };
}

function copyFiles(): Rule {
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

function removeIndexHtml(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    tree.delete("src/index.html");
    return tree;
  };
}

function addDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: "single-spa",
      version: "^7.0.0-beta.3",
    });

    context.addTask(new NodePackageInstallTask());

    return tree;
  };
}

function addEmptyRoute(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.routing) {
      const path = "src/app/app.routes.ts";
      const sourceFile = ts.createSourceFile(
        path,
        tree.readText(path),
        ts.ScriptTarget.Latest,
        true,
      );

      const routesStatement: VariableStatement = sourceFile.statements.find(
        (s) =>
          ts.isVariableStatement(s) &&
          s.declarationList.declarations.some(
            (d) => (d.name as Identifier)?.escapedText,
          ),
      ) as VariableStatement;
      const routesInitializer: Expression =
        routesStatement.declarationList.declarations[0].initializer!;

      const newRoute = ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment(
          "path",
          ts.factory.createStringLiteral("**"),
        ),
        ts.factory.createPropertyAssignment(
          "component",
          ts.factory.createIdentifier("EmptyRouteComponent"),
        ),
      ]);

      const newRoutesExpressions: Expression[] = [];
      routesInitializer.forEachChild((child) => {
        newRoutesExpressions.push(child as Expression);
      });
      newRoutesExpressions.push(newRoute);

      const newRoutes: Expression =
        ts.factory.createArrayLiteralExpression(newRoutesExpressions);

      applyChangesToFile(tree, path, [
        insertImport(
          sourceFile,
          path,
          "EmptyRouteComponent",
          "./empty-route/empty-route.component",
        ),
        new ReplaceChange(
          path,
          routesInitializer.getStart(sourceFile),
          routesInitializer.getText(sourceFile),
          ts
            .createPrinter({})
            .printNode(ts.EmitHint.Expression, newRoutes, sourceFile),
        ),
      ]);

      return externalSchematic("@schematics/angular", "component", {
        name: "EmptyRoute",
        path: "src/app",
        style: "css",
      });
    }
  };
}
