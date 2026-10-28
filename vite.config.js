import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { parseRSS } from './src/utils/rssParser.js';
import { normaliseNewsItems } from './src/utils/newsItems.js';

function publisherNews() {
 let saved = null;
 const middleware = async (req, res, next) => {
  if (req.url?.split('?')[0] !== '/formula-dc1/api/f1-news') return next();
  try {
   if (!saved || Date.now()-saved.timestamp>60000) {
    const results=await Promise.allSettled([
     {name:'Autosport',url:'https://www.autosport.com/rss/f1/news/'},
     {name:'Motorsport.com',url:'https://www.motorsport.com/rss/f1/news/'}
    ].map(async feed=>{const response=await fetch(feed.url,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Publisher unavailable');return {...feed,f1Only:true,items:parseRSS(await response.text())};}));
    const items=normaliseNewsItems(results.filter(result=>result.status==='fulfilled').map(result=>result.value));
    if(!items.length) throw new Error('No publisher articles');
    saved={timestamp:Date.now(),items};
   }
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify(saved));
  }catch{res.statusCode=503;res.end(JSON.stringify({error:'Publisher feeds unavailable'}));}
 };
 return {name:'publisher-f1-news',configureServer(server){server.middlewares.use(middleware);},configurePreviewServer(server){server.middlewares.use(middleware);}};
}

// https://vite.dev/config/
export default defineConfig({
  base: "/formula-dc1/",
  plugins: [react(), publisherNews()],
  // Canvas providers and their hooks must share one runtime, including lazy chunks.
  resolve: { dedupe: ['react', 'react-dom', 'three', '@react-three/fiber'] },
  optimizeDeps: { include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'] },
})
