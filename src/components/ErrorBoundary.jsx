import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('WebGL/Canvas Error caught by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="h-full w-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl" />;
    }
    return this.props.children;
  }
}
