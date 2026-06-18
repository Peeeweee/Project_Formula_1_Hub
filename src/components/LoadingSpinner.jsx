import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-8 h-8 border-4 border-f1-border border-t-f1-red rounded-full animate-spin" />
    </div>
  );
}

export default LoadingSpinner;
