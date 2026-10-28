import fs from 'node:fs/promises';
import { parseRSS } from '../src/utils/rssParser.js';
import { normaliseNewsItems } from '../src/utils/newsItems.js';
const feeds=[];
const previous=JSON.parse(await fs.readFile('public/news-snapshot.json','utf8').catch(()=>'{}'));
for(const feed of [{name:'Autosport',url:'https://www.autosport.com/rss/f1/news/'},{name:'Motorsport.com',url:'https://www.motorsport.com/rss/f1/news/'}]) {
 try {const response=await fetch(feed.url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(response.status);feeds.push({...feed,f1Only:true,items:parseRSS(await response.text())});}catch(e){console.log(feed.name,e.message);}
}
const items=normaliseNewsItems(feeds);
for(const item of items){const saved=previous.items?.find(article=>article.url===item.url);if(saved?.imagePath)item.imagePath=saved.imagePath;}
if(!items.length) throw new Error('No verified F1 articles; preserving existing snapshot');
await fs.writeFile('public/news-snapshot.json',JSON.stringify({retrievedAt:new Date().toISOString(),items},null,2));
console.log(`Saved ${items.length} F1 stories`);
