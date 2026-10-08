import { Component } from 'react';
import Button from './Button';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI error:', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1>Something went wrong</h1>
        <p className="mt-2 max-w-md text-ink-muted">An unexpected error occurred. Reloading usually fixes it.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}
