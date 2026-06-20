import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitsPath = path.join(__dirname, 'circuits.json');
const circuits = JSON.parse(fs.readFileSync(circuitsPath, 'utf8'));

async function fetchWikipediaImage(circuitName) {
  try {
    const searchName = encodeURIComponent(circuitName);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchName}&prop=images&format=json&imlimit=50`;
    const res = await fetch(url);
    const data = await res.json();
    
    const pages = data.query?.pages;
    if (!pages) return null;
    
    const page = Object.values(pages)[0];
    const images = page.images;
    
    if (!images) return null;
    
    const jpgs = images.filter(img => img.title.toLowerCase().endsWith('.jpg') || img.title.toLowerCase().endsWith('.jpeg'));
    
    if (jpgs.length === 0) return null;
    
    const bestImageTitle = encodeURIComponent(jpgs[0].title);
    const imgInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${bestImageTitle}&prop=imageinfo&iiprop=url&format=json`;
    
    const imgRes = await fetch(imgInfoUrl);
    const imgData = await imgRes.json();
    const imgPages = imgData.query?.pages;
    if (!imgPages) return null;
    
    const imgPage = Object.values(imgPages)[0];
    return imgPage.imageinfo?.[0]?.url || null;
  } catch (err) {
    console.error(`Error fetching for ${circuitName}:`, err.message);
    return null;
  }
}

async function updateCircuits() {
  console.log('Fetching track photos...');
  for (let circuit of circuits) {
    console.log(`Fetching photo for ${circuit.name}...`);
    let url = await fetchWikipediaImage(circuit.name);
    
    if (!url) {
        console.log(`No photo found for ${circuit.name}, trying city ${circuit.city}...`);
        url = await fetchWikipediaImage(circuit.city);
    }
    
    circuit.imageUrl = url || `https://images.unsplash.com/photo-1532983330958-4b4fcacaf649?w=1000&q=80`;
    console.log(`Assigned: ${circuit.imageUrl}`);
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  fs.writeFileSync(circuitsPath, JSON.stringify(circuits, null, 2));
  console.log('Finished updating circuits.json');
}

updateCircuits();
