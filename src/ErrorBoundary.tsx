import React from 'react';
import { track } from './analytics';

type State = { failed: boolean };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    track('app_error', { message: error.message.slice(0, 180) });
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="fatal-error">
          <div>
            <h1>Nayanmar Trails</h1>
            <p>The trail could not be opened just now.</p>
            <button onClick={() => window.location.reload()}>Try again</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
