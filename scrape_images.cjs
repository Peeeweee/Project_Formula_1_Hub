const fs = require('fs');
const path = require('path');
const https = require('https');

const dataPath = path.resolve('./src/data/constructors.json');
const constructors = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const dir = path.join(process.cwd(), 'public', 'assets', 'logos');

const teamsToScrape = ['Lotus', 'Tyrrell', 'Brabham', 'Benetton', 'Cooper', 'BRM'];

async function searchDDG(query) {
    return new Promise((resolve) => {
        // We use duckduckgo HTML lite version to easily scrape images
        const q = encodeURIComponent(query + ' F1 logo transparent filetype:png');
        const req = https.get('https://html.duckduckgo.com/html/?q=' + q, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Find all image sources
                const matches = [...data.matchAll(/<img class="image_thumb" src="([^"]+)"/g)];
                if (matches.length > 0) {
                    let url = matches[0][1];
                    if (url.startsWith('//')) url = 'https:' + url;
                    resolve(url);
                } else {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
    });
}

function downloadImage(url, dest) {
    return new Promise((resolve) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            } else {
                resolve(false);
            }
        });
        req.on('error', () => resolve(false));
    });
}

async function run() {
    for (const c of constructors) {
        if (teamsToScrape.includes(c.name)) {
            const url = await searchDDG(c.name);
            if (url) {
                console.log(`Found ${c.name} at DDG: ${url}`);
                const fileName = c.name.replace(/\s+/g, '_').toLowerCase() + '.png';
                const dest = path.join(dir, fileName);
                const success = await downloadImage(url, dest);
                if (success) {
                    c.logoUrl = `/assets/logos/${fileName}`;
                    console.log(`Downloaded ${c.name}`);
                } else {
                    console.log(`Failed to download ${c.name}`);
                }
            } else {
                console.log(`No DDG results for ${c.name}`);
            }
        }
        
        // Add the two working Wikipedia SVGs directly
        if (c.name === 'Renault') c.logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Renault_logo.svg';
        if (c.name === 'Brawn GP') c.logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/24/Brawn_GP_logo.svg';
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(constructors, null, 2), 'utf8');
    console.log('Finished updating constructors.json');
}

run();
