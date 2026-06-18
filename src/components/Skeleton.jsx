import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonBlock({ width = '100%', height = '1rem', rounded = 'rounded' }) {
  return (
    <div 
      className={`${rounded} overflow-hidden`}
      style={{ width, height }}
    >
      <motion.div
        className="w-full h-full"
        animate={{
          backgroundColor: ['#1a1a24', '#2a2a3a', '#1a1a24']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-f1-panel border border-f1-border p-5 rounded-lg flex flex-col gap-4 w-full">
      <SkeletonBlock width="40%" height="1.5rem" />
      <div className="flex flex-col gap-2">
        <SkeletonBlock width="100%" height="1rem" />
        <SkeletonBlock width="80%" height="1rem" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full bg-f1-panel border border-f1-border rounded-lg p-4">
      <div className="flex gap-4 mb-4 border-b border-f1-border pb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} width={`${100/cols}%`} height="1.2rem" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonBlock key={c} width={`${100/cols}%`} height="1rem" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDriverRow() {
  return (
    <div className="flex items-center gap-4 bg-f1-panel border border-f1-border p-4 rounded-lg w-full">
      <SkeletonBlock width="3rem" height="3rem" rounded="rounded-full" />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonBlock width="50%" height="1.2rem" />
        <SkeletonBlock width="30%" height="1rem" />
      </div>
      <SkeletonBlock width="2rem" height="1.5rem" />
    </div>
  );
}
