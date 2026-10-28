// Works in the browser and the build-time publisher snapshot job.
const decode = value => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
export function parseRSS(xml) {
 if (!/<rss|<feed/i.test(xml)) throw new Error('Invalid RSS response');
 return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(([,body])=>{
  const tag=name=>decode(body.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]||'').trim();
  const image=body.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*url=["']([^"']+)["']/i)?.[1];
  return {title:tag('title'),link:tag('link'),description:tag('description'),pubDate:tag('pubDate'),author:tag('dc:creator'),thumbnail:image?decode(image):null};
 });
}
