import { cachedFetch } from './cache';
import { normaliseNewsItems, isF1Article } from '../utils/newsItems';
const feeds=[{url:'https://www.autosport.com/rss/f1/news/',name:'Autosport'},{url:'https://www.motorsport.com/rss/f1/news/',name:'Motorsport.com'}];
export function fetchLiveF1News(force=false) {
 return cachedFetch('rss_news',async()=>{
  const edition = await fetch(`${import.meta.env.BASE_URL}news-snapshot.json`).then(response=>response.ok?response.json():null).catch(()=>null);
  const decorate = item => {
   const saved = edition?.items?.find(article=>article.url===item.url);
   return saved?.imagePath ? {...item,imageUrl:`${import.meta.env.BASE_URL}${saved.imagePath}`} : item;
  };
  try {
   const response=await fetch(`${import.meta.env.BASE_URL}api/f1-news`,{signal:AbortSignal.timeout(12000)});
   if(!response.ok) throw new Error('Direct feed unavailable');
   const data=await response.json();
   const items=data.items?.filter(item=>isF1Article(item.url));
   if(!items?.length) throw new Error('Empty publisher feed');
   return items.map(item=>({...decorate(item),delivery:'live',retrievedAt:new Date(data.timestamp).toISOString()}));
  } catch { /* Static hosting can use the RSS relay and the saved publisher edition. */ }
  const results=await Promise.allSettled(feeds.map(async feed=>{
   const response=await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`,{signal:AbortSignal.timeout(5000)});
   if(!response.ok) throw new Error('Relay unavailable');
   const data=await response.json();
   if(data.status!=='ok'||!Array.isArray(data.items))throw new Error('Invalid feed');
   return {...feed,f1Only:true,items:data.items};
  }));
  const items=normaliseNewsItems(results.filter(result=>result.status==='fulfilled').map(result=>result.value));
  if(items.length)return items.map(item=>({...decorate(item),delivery:'live',retrievedAt:new Date().toISOString()}));
  const saved=edition;
  if(!saved)throw new Error('Publisher feeds are unavailable. Try again shortly.');
  const fallback=saved.items?.filter(item=>isF1Article(item.url));
  if(!fallback?.length)throw new Error('No verified F1 stories available');
  return fallback.map(item=>({...decorate(item),delivery:'snapshot',retrievedAt:saved.retrievedAt}));
 },1,{force});
}
