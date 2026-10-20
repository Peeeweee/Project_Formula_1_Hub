export default function DataNote({ kind = 'Learning guide', source, children }) {
  return (
    <aside className="my-4 rounded-xl border border-f1-border bg-f1-panel p-4 text-sm leading-relaxed text-f1-muted">
      <span className="mr-2 inline-block rounded border border-f1-red/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-f1-light">{kind}</span>
      {children}
      {source && <a className="ml-2 underline text-f1-light" href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>}
    </aside>
  );
}
