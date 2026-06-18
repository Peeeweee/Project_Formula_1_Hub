import React from 'react';

function SectionTitle({ text }) {
  return (
    <div className="border-l-2 border-f1-red pl-2 mb-4">
      <h4 className="text-[11px] font-black uppercase tracking-widest text-f1-red">
        {text}
      </h4>
    </div>
  );
}

export default SectionTitle;
