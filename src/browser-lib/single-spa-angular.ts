/* eslint-disable @typescript-eslint/no-use-before-define */
import { LifeCycles } from 'single-spa';

import { SingleSpaAngularOpts } from './types';
import { bootstrap, mount, unmount } from './life-cycles';

const defaultOpts: SingleSpaAngularOpts = {
  // Required opts that will be set by the library consumer.
  NgZone: null!,
  bootstrapFunction: null!,
  template: null!,
  // optional opts
  Router: undefined,
  domElementGetter: undefined, // only optional if you provide a domElementGetter as a custom prop
  AnimationEngine: undefined,
  updateFunction: () => Promise.resolve(),
};

export default function singleSpaAngular(userOpts: SingleSpaAngularOpts): LifeCycles {
  if (typeof userOpts !== 'object') {
    throw Error('single-spa-angular requires a configuration object');
  }

  const opts: SingleSpaAngularOpts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (typeof opts.bootstrapFunction !== 'function') {
    throw Error('single-spa-angular must be passed an opts.bootstrapFunction');
  }

  if (typeof opts.template !== 'string') {
    throw Error('single-spa-angular must be passed opts.template string');
  }

  if (!opts.NgZone) {
    throw Error(`single-spa-angular must be passed the NgZone opt`);
  }

  return {
    bootstrap: bootstrap.bind(null, opts),
    mount: mount.bind(null, opts),
    unmount: unmount.bind(null, opts),
    update: opts.updateFunction,
  };
}

export * from './extra-providers';
