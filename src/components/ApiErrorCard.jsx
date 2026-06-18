import React from 'react';
import { motion } from 'framer-motion';

function ApiErrorCard({ apiName, refetch }) {
  return (
    <div className="bg-f1-panel border border-f1-red/50 p-5 rounded-lg flex flex-col items-center text-center my-4">
      <span className="text-2xl mb-2">🔌</span>
      <h3 className="text-sm font-bold text-f1-light uppercase tracking-wider mb-1">
        {apiName ? `${apiName} API Error` : 'API Error'}
      </h3>
      <p className="text-xs text-f1-muted mb-4">Could not load this data right now.</p>
      {refetch && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={refetch}
          className="bg-[#1a1a24] hover:bg-[#2a2a35] text-f1-light text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-sm border border-f1-border transition duration-200"
        >
          Try Again
        </motion.button>
      )}
    </div>
  );
}

export default ApiErrorCard;
