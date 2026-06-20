import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitsPath = path.join(__dirname, 'circuits.json');
const circuits = JSON.parse(fs.readFileSync(circuitsPath, 'utf8'));

// Curated array of breathtaking Unsplash IDs representing the vibe and location of every race
const AESTHETIC_IMAGES = {
  bahrain: "https://images.unsplash.com/photo-1541348263662-e06836264be8?q=80&w=1600",
  jeddah: "https://images.unsplash.com/photo-1580556557620-80a1a0bd3678?q=80&w=1600",
  albert_park: "https://images.unsplash.com/photo-1514395462725-fb4566210144?q=80&w=1600",
  suzuka: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600",
  shanghai: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=1600",
  miami: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=1600",
  imola: "https://images.unsplash.com/photo-1516483638261-f4dafaf00bc6?q=80&w=1600",
  monaco: "https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=1600",
  villeneuve: "https://images.unsplash.com/photo-1519409890989-13e83151b74c?q=80&w=1600",
  catalunya: "https://images.unsplash.com/photo-1583422409516-15eba5349202?q=80&w=1600",
  red_bull_ring: "https://images.unsplash.com/photo-1516214104703-d870798883c5?q=80&w=1600",
  silverstone: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600",
  hungaroring: "https://images.unsplash.com/photo-1515091943-9d5c0ad475af?q=80&w=1600",
  spa: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=1600",
  zandvoort: "https://images.unsplash.com/photo-1563261688-66fdbd491eb4?q=80&w=1600",
  monza: "https://images.unsplash.com/photo-1513581166358-b66b2eb238ea?q=80&w=1600",
  baku: "https://images.unsplash.com/photo-1628045952932-a5d62590bd75?q=80&w=1600",
  marina_bay: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1600",
  americas: "https://images.unsplash.com/photo-1531218150217-54595bc8bbf9?q=80&w=1600",
  rodriguez: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?q=80&w=1600",
  interlagos: "https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1600",
  las_vegas: "https://images.unsplash.com/photo-1605810731671-89c0953ee2c6?q=80&w=1600",
  losail: "https://images.unsplash.com/photo-1552554765-b7787ddf3f0e?q=80&w=1600",
  yas_marina: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600"
};

circuits.forEach(c => {
  if (AESTHETIC_IMAGES[c.id]) {
    c.imageUrl = AESTHETIC_IMAGES[c.id];
  }
});

fs.writeFileSync(circuitsPath, JSON.stringify(circuits, null, 2));
console.log('Successfully injected breathtaking Unsplash aesthetic photos!');
