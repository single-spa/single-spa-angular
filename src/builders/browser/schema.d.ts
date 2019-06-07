/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NormalizedBrowserBuilderSchema } from '@angular-devkit/build-angular';

export interface SingleSpaBuilderSchema extends NormalizedBrowserBuilderSchema {
  libraryTarget: "var" | "assign" | "this" | "window" | "global" | "commonjs" | "commonjs2" | "amd" | "umd" | "jsonp" | undefined;  
  libraryName: string;
  singleSpaWebpackConfigPath: string;
}

export type OptimizationOptions = boolean | OptimizationObject;

export interface OptimizationObject {
  /** Enables optimization of the scripts output. */
  scripts?: boolean;
  /** Enables optimization of the styles output. */
  styles?: boolean;
}

export type SourceMapOptions = boolean | SourceMapObject;

export interface SourceMapObject {
  /** Output sourcemaps used for error reports. */
  hidden?: boolean;
  /** Resolve vendor packages sourcemaps */
  vendor?: boolean;
  /** Output sourcemaps for all scripts */
  scripts?: boolean;
  /** Output sourcemaps for all styles. */
  styles?: boolean;
}

export type AssetPattern = string | AssetPatternObject;

export interface AssetPatternObject {
  /**
   * The pattern to match.
   */
  glob: string;

  /**
   * The input path dir in which to apply 'glob'. Defaults to the project root.
   */
  input: string;

  /**
   * 	An array of globs to ignore.
   */
  ignore?: string[];

  /**
   * Absolute path within the output.
   */
  output: string;
}

export type ExtraEntryPoint = string | ExtraEntryPointObject;

export interface ExtraEntryPointObject {
  /**
   * The file to include.
   */
  input: string;

  /**
   * The bundle name for this extra entry point.
   */
  bundleName?: string;

  /**
   * If the bundle will be lazy loaded.
   */
  lazy: boolean;
}

export declare type FileReplacement = DeprecatedFileReplacment | CurrentFileReplacement;

export interface DeprecatedFileReplacment {
  /**
   * The file that should be replaced.
   */
  src: string;

  /**
   * The file that should replace.
   */
  replaceWith: string;
}

export interface CurrentFileReplacement {
  /**
   * The file that should be replaced.
   */
  replace: string;

  /**
   * The file that should replace.
   */
  with: string;
}

/**
 * Define the output filename cache-busting hashing mode.
 */
export enum OutputHashing {
  All = 'all',
  Bundles = 'bundles',
  Media = 'media',
  None = 'none',
}

/**
 * Options to pass to style preprocessors
 */
export interface StylePreprocessorOptions {
  /**
   * Paths to include. Paths will be resolved to project root.
   */
  includePaths: string[];
}

export interface Budget {
  /**
   * The type of budget.
   */
  type: BudgetType;

  /**
   * The name of the bundle.
   */
  name: string;

  /**
   * The baseline size for comparison.
   */
  baseline: string;

  /**
   * The maximum threshold for warning relative to the baseline.
   */
  maximumWarning: string;

  /**
   * The maximum threshold for error relative to the baseline.
   */
  maximumError: string;

  /**
   * The minimum threshold for warning relative to the baseline.
   */
  minimumWarning: string;

  /**
   * The minimum threshold for error relative to the baseline.
   */
  minimumError: string;

  /**
   * The threshold for warning relative to the baseline (min & max).
   */
  warning: string;

  /**
   * The threshold for error relative to the baseline (min & max).
   */
  error: string;
}

export enum BudgetType {
  Initial = 'initial',
  All = 'all',
  Any = 'any',
  AllScript = 'allScript',
  AnyScript = 'anyScript',
  Bundle = 'bundle',
}
