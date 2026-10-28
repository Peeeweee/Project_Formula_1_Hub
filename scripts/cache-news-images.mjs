import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const news=JSON.parse(await fs.readFile('public/news-snapshot.json','utf8'));
await fs.mkdir('public/assets/news',{recursive:true});
let cursor=0;
async function worker(){
 while(cursor<news.items.length){
  const item=news.items[cursor++];
  if(!item.imageUrl?.startsWith('https://'))continue;
  try{
   const response=await fetch(item.imageUrl,{signal:AbortSignal.timeout(12000)});
   if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw new Error(response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   const ext=response.headers.get('content-type').includes('webp')?'webp':response.headers.get('content-type').includes('png')?'png':'jpg';
   const name=createHash('sha1').update(item.imageUrl).digest('hex').slice(0,12);
   item.imagePath=`assets/news/${name}.${ext}`;
   await fs.writeFile(`public/${item.imagePath}`,bytes);
  }catch(e){console.log('Image unavailable',item.title,e.message);}
 }
}
await Promise.all([worker(),worker(),worker()]);
await fs.writeFile('public/news-snapshot.json',JSON.stringify(news,null,2));
console.log('Cached images',news.items.filter(item=>item.imagePath).length);
