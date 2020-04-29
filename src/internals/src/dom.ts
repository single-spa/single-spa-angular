import { SingleSpaAngularOpts, DomElementGetter } from './types';

export function removeApplicationFromDOMIfIvyEnabled(opts: SingleSpaAngularOpts, props: any): void {
  if (ivyEnabled()) {
    const domElementGetter = chooseDomElementGetter(opts, props);
    const domElement = getContainerEl(domElementGetter);
    // View Engine removes all nodes automatically when calling `NgModuleRef.destroy()`,
    // which calls `ComponentRef.destroy()`.
    // Basically this will remove `app-root` or any other selector from the container element.
    while (domElement.firstChild) domElement.removeChild(domElement.firstChild);
  }
}

export function getContainerEl(domElementGetter: DomElementGetter): never | HTMLElement {
  const element = domElementGetter();

  if (!element) {
    throw Error('domElementGetter did not return a valid dom element');
  }

  return element;
}

export function chooseDomElementGetter(opts: SingleSpaAngularOpts, props: any): DomElementGetter {
  props = props?.customProps ?? props;

  if (props.domElement) {
    return () => props.domElement;
  } else if (props.domElementGetter) {
    return props.domElementGetter;
  } else if (opts.domElementGetter) {
    return opts.domElementGetter;
  } else {
    return defaultDomElementGetter(props.name);
  }
}

function defaultDomElementGetter(name: string): DomElementGetter {
  return function getDefaultDomElement() {
    const id = `single-spa-application:${name}`;
    let domElement: HTMLElement | null = document.getElementById(id);

    if (!domElement) {
      domElement = document.createElement('div');
      domElement.id = id;
      document.body.appendChild(domElement);
    }

    return domElement;
  };
}

function ivyEnabled(): boolean {
  try {
    // `ɵivyEnabled` variable is exposed starting from version 8.
    // We use `require` here except of a single `import { ɵivyEnabled }` because the
    // developer can use Angular version that doesn't expose it (all versions <8).
    // The `catch` statement will handle those cases.
    // eslint-disable-next-line
    const { ɵivyEnabled } = require('@angular/core');
    return !!ɵivyEnabled;
  } catch {
    return false;
  }
}
