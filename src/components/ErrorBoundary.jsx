import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-f1-panel border-2 border-f1-red p-6 rounded-lg shadow-xl shadow-f1-red/10 text-center max-w-lg mx-auto mt-12 flex flex-col items-center">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-f1-light mb-2">Something went wrong in this section.</h2>
          <div className="bg-black/50 p-4 rounded text-left w-full overflow-auto mb-4 border border-red-500/30">
            <p className="text-sm text-red-400 font-mono mb-2 font-bold">{this.state.error?.toString()}</p>
            <pre className="text-[10px] text-f1-muted font-mono whitespace-pre-wrap">{this.state.error?.stack}</pre>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={this.handleReload}
            className="bg-f1-red text-f1-light font-bold text-sm px-6 py-2 rounded uppercase tracking-wider hover:bg-red-700 transition"
          >
            Reload Section
          </motion.button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
