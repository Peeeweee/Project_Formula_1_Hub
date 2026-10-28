import fs from 'node:fs/promises';
await fs.mkdir('public/fonts',{recursive:true});
const fonts={
 'EurostileBoldExtended.woff2':'https://db.onlinewebfonts.com/t/007f636c4af6a332a98f32cc3cee8cb4.woff2',
 'GoodTimes.ttf':'https://www.fontmagic.com/files/good-times-rg.ttf',
 'Chrono.woff2':'https://db.onlinewebfonts.com/t/a58451cff39927de8977af1add01caa6.woff2',
};
for(const [name,url] of Object.entries(fonts)){
 const response=await fetch(url);
 if(!response.ok)throw new Error(`${name}: ${response.status}`);
 await fs.writeFile(`public/fonts/${name}`,Buffer.from(await response.arrayBuffer()));
 console.log('Saved',name);
}
