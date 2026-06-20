import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitsPath = path.join(__dirname, 'circuits.json');
const circuits = JSON.parse(fs.readFileSync(circuitsPath, 'utf8'));

async function checkUrls() {
  console.log('Checking all 24 image URLs...');
  for (let c of circuits) {
    try {
      const res = await fetch(c.imageUrl, { method: 'HEAD' });
      if (res.status !== 200) {
        console.log(`❌ BROKEN: ${c.name} - ${c.imageUrl} (Status: ${res.status})`);
      } else {
        console.log(`✅ OK: ${c.name}`);
      }
    } catch (err) {
      console.log(`❌ ERROR: ${c.name} - ${c.imageUrl} (${err.message})`);
    }
  }
}

checkUrls();
