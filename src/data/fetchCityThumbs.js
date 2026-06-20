import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitsPath = path.join(__dirname, 'circuits.json');
const circuits = JSON.parse(fs.readFileSync(circuitsPath, 'utf8'));

// Strict mapping of Wikipedia page titles that have beautiful aesthetic main images
const CITY_PAGES = {
  bahrain: "Sakhir", // Sakhir Tower
  jeddah: "Jeddah", // Jeddah Corniche
  albert_park: "Melbourne", // Melbourne skyline
  suzuka: "Suzuka_Circuit", // Ferris wheel
  shanghai: "Shanghai", // Skyline
  miami: "Miami", // Skyline
  imola: "Imola", // City
  monaco: "Monaco", // Harbor
  villeneuve: "Montreal", // Skyline
  catalunya: "Barcelona", // City
  red_bull_ring: "Spielberg,_Styria", // Mountains
  silverstone: "Silverstone_Circuit", 
  hungaroring: "Budapest",
  spa: "Spa,_Belgium", 
  zandvoort: "Zandvoort",
  monza: "Monza",
  baku: "Baku",
  marina_bay: "Singapore",
  americas: "Austin,_Texas",
  rodriguez: "Mexico_City",
  interlagos: "São_Paulo",
  las_vegas: "Las_Vegas",
  losail: "Lusail",
  yas_marina: "Yas_Island"
};

async function getAestheticImage(circuitId) {
  const title = CITY_PAGES[circuitId];
  
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1200`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'F1AppBot/3.0 (contact@example.com) Node.js' }
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
    console.log(`Fetching aesthetic image for ${c.city}...`);
    let imgUrl = await getAestheticImage(c.id);
    
    if (imgUrl) {
      c.imageUrl = imgUrl;
      console.log(`Found: ${imgUrl}`);
    } else {
      console.log(`Failed to find image for ${c.city}`);
    }
    
    // Strict 1500ms delay to prevent Wikipedia 429 / IP ban
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  fs.writeFileSync(circuitsPath, JSON.stringify(circuits, null, 2));
  console.log('Updated circuits.json with aesthetic location photos!');
}

run();
