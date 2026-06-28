import fs from 'fs';
import path from 'path';

// Read constructors.json
const dataPath = path.resolve('./src/data/constructors.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const constructors = JSON.parse(rawData);

const logosDir = path.resolve('./public/assets/logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

async function downloadLogos() {
  let updated = false;
  for (const c of constructors) {
    if (c.logoUrl && c.logoUrl.startsWith('http')) {
      const ext = path.extname(new URL(c.logoUrl).pathname) || '.svg';
      const fileName = `${c.id}${ext}`;
      const filePath = path.join(logosDir, fileName);
      const localUrl = `/assets/logos/${fileName}`;
      
      console.log(`Downloading ${c.name} logo from ${c.logoUrl}...`);
      
      try {
        const response = await fetch(c.logoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          fs.writeFileSync(filePath, Buffer.from(buffer));
          console.log(`Saved to ${filePath}`);
          
          c.logoUrl = localUrl;
          updated = true;
        } else {
          console.error(`Failed to download ${c.name}: ${response.status} ${response.statusText}`);
        }
      } catch (e) {
        console.error(`Error downloading ${c.name}:`, e.message);
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(dataPath, JSON.stringify(constructors, null, 2), 'utf8');
    console.log('constructors.json updated with local logo URLs.');
  }
}

downloadLogos();
