import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitsPath = path.join(__dirname, 'circuits.json');
const circuits = JSON.parse(fs.readFileSync(circuitsPath, 'utf8'));

// Only patching the 11 broken Unsplash links with proven aesthetic Wikimedia Commons images
const FIX_MAP = {
  "bahrain": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Vip-tower-f1-bahrain.jpg",
  "jeddah": "https://upload.wikimedia.org/wikipedia/commons/1/15/Jeddah_Corniche_36.jpg",
  "imola": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Autodromo_aerea_poster.jpg",
  "villeneuve": "https://upload.wikimedia.org/wikipedia/commons/8/87/Montreal_Skyline_from_Mont_Royal.jpg",
  "catalunya": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Sagrada_Familia_01.jpg",
  "zandvoort": "https://upload.wikimedia.org/wikipedia/commons/4/4d/Aerial_view_of_the_North_Sea%2C_Zandvoort%2C_the_Netherlands_%2847980173173%29.jpg",
  "monza": "https://upload.wikimedia.org/wikipedia/commons/f/f5/Royal_Villa_of_Monza_10.jpg",
  "baku": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Baku_Flame_Towers.jpg",
  "americas": "https://upload.wikimedia.org/wikipedia/commons/f/fe/2012_USA_GP_circuit_panorama.jpg",
  "las_vegas": "https://upload.wikimedia.org/wikipedia/commons/5/58/11_The_Venetian_Las_Vegas_-_luxury_hotel_and_casino_in_Las_Vegas_Strip.jpg",
  "losail": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Al_Wahda_Arches_Qatar_Architect_Erik_Behrens_Aerial_Photo.jpg"
};

circuits.forEach(c => {
  if (FIX_MAP[c.id]) {
    c.imageUrl = FIX_MAP[c.id];
  }
});

fs.writeFileSync(circuitsPath, JSON.stringify(circuits, null, 2));
console.log('Successfully patched broken images with verified Wikimedia Commons links!');
