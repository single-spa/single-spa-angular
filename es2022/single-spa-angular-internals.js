function getContainerElementAndSetTemplate(options, props) {
  const domElementGetter = chooseDomElementGetter(options, props);
  if ((typeof ngDevMode === 'undefined' || ngDevMode) && !domElementGetter) {
    throw Error(`Cannot mount angular application '${props.name || props.appName}' without a domElementGetter provided either as an opt or a prop`);
  }
  const containerElement = getContainerElement(domElementGetter, props);
  containerElement.innerHTML = options.template;
  return containerElement;
}
function getContainerElement(domElementGetter, props) {
  const element = domElementGetter(props);
  if ((typeof ngDevMode === 'undefined' || ngDevMode) && !element) {
    throw Error('domElementGetter did not return a valid dom element');
  }
  return element;
}
function chooseDomElementGetter(opts, props) {
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
function defaultDomElementGetter(name) {
  return function getDefaultDomElement() {
    const id = `single-spa-application:${name}`;
    let domElement = document.getElementById(id);
    if (!domElement) {
      domElement = document.createElement('div');
      domElement.id = id;
      document.body.appendChild(domElement);
    }
    return domElement;
  };
}

export { getContainerElementAndSetTemplate };
//# sourceMappingURL=single-spa-angular-internals.js.map
