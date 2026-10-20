import { motion, useReducedMotion } from 'framer-motion';

export default function NewsTicker({ headlines = [] }) {
  const reducedMotion = useReducedMotion();
  if (headlines.length === 0) return null;

  return (
    <div className="bg-[#0e0e14] border-b border-f1-red/30 py-2 px-4 overflow-hidden flex items-center gap-3 text-xs font-mono select-none">
      <div className="flex items-center gap-2 shrink-0 bg-f1-red text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
        FLASH NEWS
      </div>

      <div className="flex-1 overflow-hidden relative">
        <motion.div
          animate={reducedMotion ? { x: 0 } : { x: ['0%', '-50%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...headlines, ...headlines].map((item, idx) => (
            <a href={item.url} target="_blank" rel="noreferrer" key={`ticker-${idx}`} className="inline-flex items-center gap-3 text-f1-light hover:text-f1-red transition cursor-pointer">
              <span className="text-f1-red font-bold">[{item.category}]</span>
              <span>{item.title}</span>
              <span className="text-f1-muted text-[10px]">• {item.date ? new Date(item.date).toLocaleDateString() : 'Date unavailable'}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
