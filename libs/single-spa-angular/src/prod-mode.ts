import * as core from '@angular/core';

export function enableProdMode(): void {
  try {
    // The `enableProdMode` will throw an error if it's called multiple times,
    // but it may be called multiple times when dependencies are shared.
    core.enableProdMode();
  } catch {
    // Nothing to do here.
  }
}
