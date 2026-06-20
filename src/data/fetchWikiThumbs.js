import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitsPath = path.join(__dirname, 'circuits.json');
const circuits = JSON.parse(fs.readFileSync(circuitsPath, 'utf8'));

const WIKI_TITLES = {
  bahrain: "Bahrain International Circuit",
  jeddah: "Jeddah Corniche Circuit",
  albert_park: "Albert Park Circuit",
  suzuka: "Suzuka International Racing Course",
  shanghai: "Shanghai International Circuit",
  miami: "Miami International Autodrome",
  imola: "Imola Circuit",
  monaco: "Circuit de Monaco",
  villeneuve: "Circuit Gilles Villeneuve",
  catalunya: "Circuit de Barcelona-Catalunya",
  red_bull_ring: "Red Bull Ring",
  silverstone: "Silverstone Circuit",
  hungaroring: "Hungaroring",
  spa: "Circuit de Spa-Francorchamps",
  zandvoort: "Circuit Zandvoort",
  monza: "Monza Circuit",
  baku: "Baku City Circuit",
  marina_bay: "Marina Bay Street Circuit",
  americas: "Circuit of the Americas",
  rodriguez: "Autódromo Hermanos Rodríguez",
  interlagos: "Interlagos Circuit",
  las_vegas: "Las Vegas Strip Circuit",
  losail: "Lusail International Circuit",
  yas_marina: "Yas Marina Circuit"
};

async function getWikiImage(circuitId) {
  const title = WIKI_TITLES[circuitId];
  if (!title) return null;
  
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'F1AppBot/1.0 (contact@example.com) Node.js'
      }
    });
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch (err) {
    console.error(`Error for ${title}:`, err.message);
    return null;
  }
}

async function run() {
  for (let c of circuits) {
    console.log(`Fetching image for ${c.name}...`);
    const imgUrl = await getWikiImage(c.id);
    if (imgUrl) {
      // Wikipedia often returns SVG maps for tracks. Let's make sure it's a photo if possible.
      // But pageimages usually returns the main infobox image, which is sometimes the map. 
      // Regardless, it's correct for the location.
      c.imageUrl = imgUrl;
      console.log(`Found: ${imgUrl}`);
    } else {
      console.log(`Failed to find image for ${c.name}`);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  fs.writeFileSync(circuitsPath, JSON.stringify(circuits, null, 2));
  console.log('Updated circuits.json with exact Wiki images!');
}

run();
