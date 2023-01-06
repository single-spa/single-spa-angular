import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { findNodes } from '@schematics/angular/utility/ast-utils';
import {
  applyToUpdateRecorder,
  NoopChange,
  RemoveChange,
} from '@schematics/angular/utility/change';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as ts from 'typescript';

/** Entry point for the migration schematics with target of 5 */
export function updateToV5(): Rule {
  return () => {
    return removeAnimationWorkaround();
  };
}

function removeAnimationWorkaround() {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);

    for (const [, project] of workspace.projects) {
      const mainPath = project.targets?.get('build')?.options?.main;

      if (typeof mainPath === 'string') {
        const buffer = host.read(mainPath);
        const mainSource =
          buffer && ts.createSourceFile(mainPath, buffer.toString(), ts.ScriptTarget.Latest, true);

        if (mainSource) {
          const changes = [
            removeImport(mainSource, mainPath, 'ɵAnimationEngine', '@angular/animations/browser'),
            removeAnimationEngineProperty(mainSource, mainPath),
          ];

          const recorder = host.beginUpdate(mainPath);
          applyToUpdateRecorder(recorder, changes);
          host.commitUpdate(recorder);
        }
      }
    }
  };
}

function removeAnimationEngineProperty(source: ts.SourceFile, fileToEdit: string) {
  const rootNode = source;
  const singleSpaCall = findNodes(rootNode, ts.SyntaxKind.CallExpression)
    .map(n => n as ts.CallExpression)
    .find(n => n.expression.getText() == 'singleSpaAngular');

  if (!singleSpaCall) {
    throw new SchematicsException(`No call to singleSpaAngular found`);
  }

  const { properties } = singleSpaCall.arguments[0] as ts.ObjectLiteralExpression;
  const animationProp = properties.find(p => p.name?.getText() === 'AnimationEngine');

  return animationProp
    ? new RemoveChange(fileToEdit, animationProp.getStart(), `${animationProp.getText()},`)
    : new NoopChange();
}

/**
 * Remove symbol import. Remove entire import statement if it would be left empty
 * @param fileToEdit (file we want to remove import from)
 * @param symbolName (item to remove)
 * @param fileName (path to the file)
 * @return Change
 */
function removeImport(
  source: ts.SourceFile,
  fileToEdit: string,
  symbolName: string,
  fileName: string,
) {
  const rootNode = source;
  const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);

  const relevantImports = allImports.filter(node =>
    node
      .getChildren()
      .filter(ts.isStringLiteral)
      .map(n => n.text)
      .includes(fileName),
  );

  const importSpecifierNode = relevantImports
    .flatMap(n => findNodes(n, ts.SyntaxKind.ImportSpecifier))
    .map(n => n as ts.ImportSpecifier)
    .find(n =>
      findNodes(n, ts.SyntaxKind.Identifier)
        .map(i => i.getText())
        .includes(symbolName),
    );

  if (!importSpecifierNode) {
    return new NoopChange();
  }

  const deleteNode =
    importSpecifierNode.parent.elements.length === 1
      ? importSpecifierNode.parent.parent.parent
      : importSpecifierNode;

  return new RemoveChange(fileToEdit, deleteNode.getStart(), deleteNode.getText());
}
