import React from 'react';

function StatCard({ label, value, sub, delta }) {
  const isPositive = delta && (delta.toString().startsWith('+') || parseFloat(delta) > 0);
  return (
    <div className="bg-f1-panel border border-f1-border p-5 rounded-lg shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div>
        <span className="text-xs text-f1-muted uppercase font-bold tracking-wider block mb-1">{label}</span>
        <span className="text-3xl font-black text-f1-light block">{value}</span>
      </div>
      <div className="mt-3 flex justify-between items-center text-xs">
        <span className="text-f1-muted">{sub}</span>
        {delta && (
          <span className={`font-bold ${isPositive ? 'text-f1-red' : 'text-f1-muted'}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
