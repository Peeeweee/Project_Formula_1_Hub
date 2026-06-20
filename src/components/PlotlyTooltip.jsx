import React from 'react';

const PlotlyTooltip = ({ active, payload, label, xKey = 'x', yFormatter }) => {
  if (!active || !payload || !payload.length) return null;

  // Dynamically match left border to the primary hovered item's trace/bar/line color
  const primaryItem = payload[0];
  const borderLeftColor = primaryItem.color || primaryItem.stroke || primaryItem.fill || '#e10600';

  return (
    <div 
      className="plotly-tooltip bg-[#1f2c3f]/95 border border-white/10 rounded px-3 py-2 text-[11px] text-white shadow-2xl pointer-events-none font-mono"
      style={{
        borderLeft: `4px solid ${borderLeftColor}`,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100
      }}
    >
      {/* X variable: format like 'position=P2' */}
      <div className="border-b border-white/15 pb-1 mb-1 font-bold text-gray-300">
        {xKey}={label}
      </div>
      
      {/* Y variable(s): format like 'points=18' or 'Max Verstappen=169' */}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const itemColor = item.color || item.stroke || item.fill || '#ffffff';
          const displayValue = yFormatter ? yFormatter(item.value, item) : item.value;
          
          return (
            <div key={index} className="flex items-center gap-2">
              {payload.length > 1 && (
                <span 
                  className="w-2 h-2 rounded-sm inline-block shrink-0" 
                  style={{ backgroundColor: itemColor }}
                />
              )}
              <span>
                <span className="text-gray-400 font-semibold">{item.name || item.dataKey}</span>
                <span className="text-white">={displayValue}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlotlyTooltip;
