const fs = require('fs');
const path = require('path');
const https = require('https');

const dataPath = path.resolve('./src/data/constructors.json');
const constructors = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const teams = ['Renault', 'Tyrrell', 'Brabham', 'Benetton', 'Cooper', 'BRM', 'Lotus', 'Brawn GP'];

async function getImageUrl(query) {
    return new Promise((resolve) => {
        const req = https.get('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query + ' F1 logo png transparent'), {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/<img class="image_thumb" src="([^"]+)"/);
                if (match && match[1]) {
                    // DDG image proxy URL
                    let proxyUrl = match[1];
                    if (proxyUrl.startsWith('//')) proxyUrl = 'https:' + proxyUrl;
                    resolve(proxyUrl);
                } else {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
    });
}

async function run() {
    for (const c of constructors) {
        if (teams.includes(c.name)) {
            const url = await getImageUrl(c.name);
            if (url) {
                console.log(`Found ${c.name}: ${url}`);
                c.logoUrl = url;
            } else {
                console.log(`Missed ${c.name}`);
            }
        }
    }
    fs.writeFileSync(dataPath, JSON.stringify(constructors, null, 2), 'utf8');
    console.log('Done');
}

run();
