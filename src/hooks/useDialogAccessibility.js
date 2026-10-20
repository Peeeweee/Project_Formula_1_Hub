import { useEffect, useRef } from 'react';

// Escape, initial focus, focus containment, and restoration for overlay dialogs.
export default function useDialogAccessibility(open, onClose, focusContainer = false) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open || !ref.current) return;
    const panel = ref.current;
    const previous = document.activeElement;
    const focusable = () => [...panel.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"], summary')].filter(node => node.getClientRects().length);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = requestAnimationFrame(() => (focusContainer ? panel : focusable()[0] || panel).focus());
    function onKey(event) {
      if (event.key === 'Escape') { event.stopPropagation(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) { event.preventDefault(); panel.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
    panel.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(timer);
      panel.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [open, focusContainer]);
  return ref;
}
