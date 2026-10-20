const plainText = value => String(value || '').replace(/<[^>]*>/g, '').trim();
const safeUrl = value => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
};

function category(text) {
  if (/crash|penalty|disqualif|steward|incident|retire/.test(text)) return 'BREAKING';
  if (/aero|floor|diffuser|wing|downforce|upgrade/.test(text)) return 'TECHNICAL';
  if (/power unit|engine|mgu|hybrid|fuel|ers|battery/.test(text)) return 'POWER UNIT';
  if (/telemetry|sector|lap time|timing|delta/.test(text)) return 'TELEMETRY';
  if (/contract|paddock|principal|signs|transfer/.test(text)) return 'PADDOCK';
  return 'DEVELOPMENT';
}

export function normaliseNewsItems(feeds) {
  const unique = new Map();
  for (const feed of feeds) {
    for (const item of feed.items) {
      const title = plainText(item.title);
      const url = safeUrl(item.link);
      if (!title || !url) continue;
      const key = title.toLowerCase().replace(/\s+/g, ' ');
      if (unique.has(key)) continue;
      const content = plainText(item.content || item.description);
      // RSS timestamps without offsets are conventionally UTC; never use the visitor's timezone.
      const rawDate = String(item.pubDate || '');
      const stamp = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(rawDate) ? `${rawDate.replace(' ', 'T')}Z` : rawDate;
      const parsedDate = Date.parse(stamp);
      unique.set(key, {
        id: url, title, url, snippet: content.slice(0, 160) + (content.length > 160 ? '…' : ''), content,
        source: feed.name, author: plainText(item.author) || feed.name,
        date: Number.isFinite(parsedDate) ? new Date(parsedDate).toISOString() : null,
        category: category(`${title} ${content}`.toLowerCase()),
        imageUrl: safeUrl(item.thumbnail || item.enclosure?.link) || `${import.meta.env?.BASE_URL || '/'}favicon.svg`,
        readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 220))} min excerpt`,
      });
    }
  }
  return [...unique.values()].sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}
