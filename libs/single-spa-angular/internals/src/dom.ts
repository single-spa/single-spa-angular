import { DomElementGetter, BaseSingleSpaAngularOptions } from './types';

export function getContainerElementAndSetTemplate<T extends BaseSingleSpaAngularOptions>(
  options: T,
  props: any,
): HTMLElement {
  const domElementGetter = chooseDomElementGetter(options, props);

  if (!domElementGetter) {
    throw Error(
      `Cannot mount angular application '${
        props.name || props.appName
      }' without a domElementGetter provided either as an opt or a prop`,
    );
  }

  const containerElement = getContainerElement(domElementGetter);
  containerElement.innerHTML = options.template;
  return containerElement;
}

function getContainerElement(domElementGetter: DomElementGetter): never | HTMLElement {
  const element = domElementGetter();

  if (!element) {
    throw Error('domElementGetter did not return a valid dom element');
  }

  return element;
}

function chooseDomElementGetter<T extends BaseSingleSpaAngularOptions>(
  opts: T,
  props: any,
): DomElementGetter {
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
