import { cachedFetch } from './cache';
import { normaliseNewsItems } from '../utils/newsItems';

const RSS_FEEDS = [
  { url: 'https://www.autosport.com/rss/f1/news/', name: 'Autosport' },
  { url: 'https://www.motorsport.com/rss/f1/news/', name: 'Motorsport.com' },
  { url: 'https://www.grandprix.com/rss.xml', name: 'GrandPrix.com' },
];

export function fetchLiveF1News(force = false) {
  return cachedFetch('rss_news', async () => {
    const results = await Promise.allSettled(RSS_FEEDS.map(async feed => {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('News provider unavailable');
      const data = await response.json();
      if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('News feed unavailable');
      return { name: feed.name, items: data.items };
    }));
    const feeds = results.filter(result => result.status === 'fulfilled').map(result => result.value);
    const items = normaliseNewsItems(feeds);
    if (!items.length) throw new Error('News feeds are unavailable. Please try again shortly.');
    return items;
  }, 1, { force });
}
