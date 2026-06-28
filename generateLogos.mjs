import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('./src/data/constructors.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const constructors = JSON.parse(rawData);

const logosDir = path.resolve('./public/assets/logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

function generateSVG(name, color) {
  const initial = name.substring(0, 1).toUpperCase();
  const secondaryColor = '#0f0f18';
  const textColor = '#ffffff';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a24" />
      <stop offset="100%" stop-color="#07070a" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.5" />
    </linearGradient>
    <pattern id="carbon" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="#ffffff" fill-opacity="0.02" />
      <path d="M10 0 L20 10 L30 0 L20 -10 Z" fill="#000000" fill-opacity="0.05" />
    </pattern>
  </defs>
  
  <!-- Outer Shield -->
  <path d="M 200 20 L 360 80 L 360 220 C 360 320 200 380 200 380 C 200 380 40 320 40 220 L 40 80 Z" fill="url(#bgGradient)" stroke="#333" stroke-width="4" />
  
  <!-- Carbon Fiber Texture -->
  <path d="M 200 20 L 360 80 L 360 220 C 360 320 200 380 200 380 C 200 380 40 320 40 220 L 40 80 Z" fill="url(#carbon)" />
  
  <!-- Team Color Accent (Inner Shield) -->
  <path d="M 200 40 L 330 90 L 330 210 C 330 290 200 350 200 350 C 200 350 70 290 70 210 L 70 90 Z" fill="none" stroke="url(#accentGradient)" stroke-width="12" />
  <path d="M 200 40 L 330 90 L 330 210 C 330 290 200 350 200 350 C 200 350 70 290 70 210 L 70 90 Z" fill="none" stroke="${color}" stroke-width="3" opacity="0.8" />
  
  <!-- Checkered Flag motif (subtle) -->
  <g opacity="0.1">
    <rect x="200" y="80" width="30" height="30" fill="#fff" />
    <rect x="230" y="110" width="30" height="30" fill="#fff" />
    <rect x="200" y="140" width="30" height="30" fill="#fff" />
    <rect x="230" y="170" width="30" height="30" fill="#fff" />
  </g>
  
  <!-- Text Initial -->
  <text x="200" y="240" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="160" fill="${textColor}" text-anchor="middle" letter-spacing="-5" dominant-baseline="alphabetic">
    ${initial}
  </text>
  
  <!-- Full Name -->
  <text x="200" y="300" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="${textColor}" opacity="0.7" text-anchor="middle" letter-spacing="4">
    ${name.toUpperCase()}
  </text>
</svg>`;
}

let updated = false;

for (const c of constructors) {
  const fileName = `${c.id}.svg`;
  const filePath = path.join(logosDir, fileName);
  const localUrl = `/assets/logos/${fileName}`;
  
  const svgContent = generateSVG(c.name, c.teamColor);
  fs.writeFileSync(filePath, svgContent, 'utf8');
  console.log(`Generated HD offline placeholder logo for ${c.name} -> ${filePath}`);
  
  c.logoUrl = localUrl;
  updated = true;
}

if (updated) {
  fs.writeFileSync(dataPath, JSON.stringify(constructors, null, 2), 'utf8');
  console.log('constructors.json updated to point to generated offline local SVG files.');
}
