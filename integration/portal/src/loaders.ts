import { IS_PRODUCTION } from './config';

type Resolve = () => void;
type Reject = (error: ErrorEvent) => void;

function createScriptElement(resolve: Resolve, reject: Reject): HTMLScriptElement {
  const script = document.createElement('script');
  script.addEventListener('load', () => resolve());
  script.addEventListener('error', error => reject(error));
  return script;
}

function loadScriptUsingDefaultFileName(url: string, resolve: Resolve, reject: Reject): void {
  const script = createScriptElement(resolve, reject);
  script.src = `${url}/main.js`;
  document.head.appendChild(script);
}

function loadAngularScriptsInProductionMode(url: string, resolve: Resolve, reject: Reject): void {
  const moduleScript = createScriptElement(resolve, reject);
  moduleScript.type = 'module';
  moduleScript.src = `${url}/main-es2015.js`;

  const noModuleScript = createScriptElement(resolve, reject);
  noModuleScript.noModule = true;
  noModuleScript.src = `${url}/main-es5.js`;

  document.head.appendChild(moduleScript);
  document.head.appendChild(noModuleScript);
}

/**
 * Since Angular supports differential loading it will emit `main.js` file
 * in the development mode and `main.(es-2015|es-5).js` files when applicaiton
 * is built in the production mode.
 */
export function loadAngularScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (IS_PRODUCTION) {
      loadAngularScriptsInProductionMode(url, resolve, reject);
    } else {
      loadScriptUsingDefaultFileName(url, resolve, reject);
    }
  });
}

export function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    loadScriptUsingDefaultFileName(url, resolve, reject);
  });
}
