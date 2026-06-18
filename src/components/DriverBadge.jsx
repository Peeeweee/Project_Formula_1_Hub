import React from 'react';

function DriverBadge({ position, name, team, points, teamColor }) {
  return (
    <div className="flex items-center justify-between bg-f1-panel border border-f1-border p-3 rounded-md shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-f1-muted w-5">#{position}</span>
        <div 
          className="w-1.5 h-8 rounded-sm animate-pulse" 
          style={{ backgroundColor: teamColor || '#e10600' }} 
        />
        <div>
          <span className="font-bold text-f1-light text-sm block">{name}</span>
          <span className="text-[11px] text-f1-muted block leading-none mt-0.5">{team}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="font-black text-f1-light text-md">{points}</span>
        <span className="text-[10px] text-f1-muted ml-1 uppercase">pts</span>
      </div>
    </div>
  );
}

export default DriverBadge;
