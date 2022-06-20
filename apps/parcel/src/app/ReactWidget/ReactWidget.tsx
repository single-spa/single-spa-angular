import * as React from 'react';
import * as ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

const ReactLogo = React.lazy(() => import('./ReactLogo'));

interface ReactWidgetProps {
  hello: string;
}

function ReactWidget(props: React.PropsWithChildren<ReactWidgetProps>) {
  React.useEffect(() => {
    console.log('ReactWidget.useEffect is being called');
    return () => console.log('ReactWidget.useEffect returned callback is being called');
  });

  return (
    <React.Suspense fallback={<div>Loading ReactLogo...</div>}>
      <ReactLogo />
      <h1>{props.hello} world</h1>
    </React.Suspense>
  );
}

export const config = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: ReactWidget,
});

interface ReactWidgetProps {
  hello: string;
}
