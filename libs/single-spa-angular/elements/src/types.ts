import { NgModuleRef } from '@angular/core';
import { NgElement } from '@angular/elements';
import { BaseSingleSpaAngularOptions } from 'single-spa-angular/internals';

// implementation from https://spin.atomicobject.com/2018/09/10/javascript-concurrency/
export class Mutex {
  private mutex = Promise.resolve();

  lock(): PromiseLike<() => void> {
    let begin: (unlock: () => void) => void;

    this.mutex = this.mutex.then(() => {
      return new Promise(begin);
    });

    return new Promise(resolve => {
      begin = resolve;
    });
  }

  async dispatch<T>(fn: (() => T) | (() => PromiseLike<T>)): Promise<T> {
    const unlock = await this.lock();
    try {
      return await Promise.resolve(fn());
    } finally {
      unlock();
    }
  }
}

export interface SingleSpaAngularElementOptions extends BaseSingleSpaAngularOptions {
  parcelCanUpdate?: boolean;
}

export interface BootstrappedSingleSpaAngularElementsOptions
  extends SingleSpaAngularElementOptions {
  ngModuleRef: NgModuleRef<any> | null;
  // This will be an actual custom element.
  element: NgElement | null;
  mutex: Mutex;
}
