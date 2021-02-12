import * as React from 'react';
import * as ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

const ReactLogo = React.lazy(() => import('./ReactLogo'));

class ReactWidget extends React.Component<ReactWidgetProps> {
  componentDidMount(): void {
    console.log('ReactWidget.componentDidMount()');
  }

  componentWillUnmount(): void {
    console.log('ReactWidget.componentWillUnmount()');
  }

  render() {
    return (
      <React.Suspense fallback={<div>Loading ReactLogo...</div>}>
        <ReactLogo />
        <h1>{this.props.hello} world</h1>
      </React.Suspense>
    );
  }
}

export const config = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: ReactWidget,
});

interface ReactWidgetProps {
  hello: string;
}
