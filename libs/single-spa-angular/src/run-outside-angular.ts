declare const Zone: any;

export function runOutsideAngular<T>(fn: () => T): T {
  return typeof Zone !== 'undefined' && typeof Zone?.root?.run === 'function'
    ? Zone.root.run(fn)
    : fn();
}
