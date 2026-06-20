import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitsPath = path.join(__dirname, 'circuits.json');
const circuits = JSON.parse(fs.readFileSync(circuitsPath, 'utf8'));

const IMAGE_MAP = {
  bahrain: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Bahrain_International_Circuit%2C_November_2%2C_2017_SkySat_%28cropped%29.jpg',
  jeddah: 'https://images.unsplash.com/photo-1574926053835-18182283dcf8?w=1200&q=80',
  albert_park: 'https://images.unsplash.com/photo-1542051812871-758502109a27?w=1200&q=80',
  suzuka: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Suzuka_Circuit_2019.jpg',
  shanghai: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Shanghai_International_Circuit_%2834272101736%29.jpg',
  miami: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200&q=80',
  imola: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Autodromo_aerea_poster.jpg',
  monaco: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=1200&q=80',
  villeneuve: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Circuit_Gilles-Villeneuve%2C_May_29%2C_2018_SkySat_%28cropped%29.jpg',
  catalunya: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Circuit_de_Catalunya.jpg',
  red_bull_ring: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Red_Bull_Ring_2018.jpg',
  silverstone: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Silverstone_Circuit.jpg',
  hungaroring: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Hungaroring_Aerial.jpg',
  spa: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Spa-Francorchamps_Eau_Rouge.jpg',
  zandvoort: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Circuit_Zandvoort_1.jpg',
  monza: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Monza_Autodrome_%281%29.jpg',
  baku: 'https://images.unsplash.com/photo-1628045952932-a5d62590bd75?w=1200&q=80',
  marina_bay: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&q=80',
  americas: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Circuit_of_the_Americas_Turn_1.jpg',
  rodriguez: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Foro_Sol_-_Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez.jpg',
  interlagos: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_-_Interlagos.jpg',
  las_vegas: 'https://images.unsplash.com/photo-1605810731671-89c0953ee2c6?w=1200&q=80',
  losail: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Losail_International_Circuit.jpg',
  yas_marina: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Yas_Marina_Circuit_%28Abu_Dhabi%29.jpg'
};

const defaultImage = 'https://images.unsplash.com/photo-1532983330958-4b4fcacaf649?w=1200&q=80';

circuits.forEach(c => {
  c.imageUrl = IMAGE_MAP[c.id] || defaultImage;
});

fs.writeFileSync(circuitsPath, JSON.stringify(circuits, null, 2));
console.log('Successfully injected curated high-res photos into circuits.json');
