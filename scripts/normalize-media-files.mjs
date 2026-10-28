import fs from 'node:fs/promises';
const manifest=JSON.parse(await fs.readFile('src/data/mediaManifest.json','utf8'));
const paths=new Map();
for(const entry of Object.values(manifest)){
 if(!entry.path||paths.has(entry.path))continue;
 const bytes=await fs.readFile(`public/${entry.path}`);
 const extension=bytes[0]===0xff?'jpg':bytes.subarray(1,4).toString()==='PNG'?'png':bytes.subarray(0,4).toString()==='RIFF'?'webp':null;
 if(!extension)throw new Error(`Unknown image format: ${entry.path}`);
 const target=`${entry.path.split('.')[0]}.${extension}`;
 if(target!==entry.path) await fs.rename(`public/${entry.path}`,`public/${target}`);
 paths.set(entry.path,target);
}
for(const entry of Object.values(manifest))if(entry.path)entry.path=paths.get(entry.path);
await fs.writeFile('src/data/mediaManifest.json',JSON.stringify(manifest,null,2));
console.log(`Normalized ${paths.size} local photographs`);
