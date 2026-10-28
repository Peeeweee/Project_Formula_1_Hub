import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import media from '../src/data/mediaManifest.json' with { type: 'json' };
import champions from '../src/data/champions.json' with { type: 'json' };
import eras from '../src/data/eras.json' with { type: 'json' };
import cars from '../src/data/carVault.json' with { type: 'json' };
import logos from '../src/data/teamLogos.json' with { type: 'json' };
import teams from '../src/data/constructors.json' with { type: 'json' };
import careers from '../src/data/careerSnapshot.json' with { type: 'json' };
import { parseRSS } from '../src/utils/rssParser.js';
import { normaliseNewsItems, isF1Article } from '../src/utils/newsItems.js';
import { titleYears, seasonRange } from '../src/utils/teamProfiles.js';

test('every champion, design era and collection car has a nonempty local image',()=>{
 const titles=[...champions.map(row=>decodeURIComponent(row.DriverStandings[0].Driver.url.split('/wiki/')[1])),...eras.map(era=>era.wikiSearchTerm),...cars.flatMap(era=>era.cars.map(car=>car.wikiSearchTerm))];
 for(const title of titles){const entry=media[title.replaceAll('_',' ')];assert.ok(entry?.path,`Missing ${title}`);assert.ok(fs.statSync(`public/${entry.path}`).size>100,title);assert.ok(entry.source.startsWith('https://'));}
});
test('directory uses genuine local badges and archive-derived championship years',()=>{
 for(const team of teams){const id=({redbull:'red_bull',astonmartin:'aston_martin'})[team.id]||team.id;assert.ok(logos[id],team.id);assert.ok(fs.statSync(`public/${logos[id].path}`).size>100);}
 assert.equal(titleYears('lotus').length,7);assert.equal(titleYears('ferrari').length,16);assert.equal(titleYears('redbull').length,6);
 assert.equal(seasonRange(2026).at(-1),1950);assert.equal(seasonRange(2027)[0],2028);
});
test('champion comparisons have complete saved career totals during a provider outage',()=>{
 for(const row of champions){const id=row.DriverStandings[0].Driver.driverId;const stats=careers.drivers[id];assert.ok(stats,id);assert.ok(stats.races>=stats.podiums,id);assert.ok(stats.podiums>=stats.wins,id);}
 assert.equal(careers.drivers.michael_schumacher.wins,91);assert.equal(careers.drivers.senna.championships,3);
});
test('publisher RSS parsing preserves CDATA and rejects other racing series and lookalike domains',()=>{
 const xml='<rss><channel><item><title><![CDATA[F1 &amp; testing]]></title><link>https://www.autosport.com/f1/news/testing/123/</link><description><![CDATA[<p>News excerpt</p>]]></description><pubDate>Wed, 28 Oct 2026 01:00:00 GMT</pubDate><media:content url="https://example.com/photo.jpg"/></item><item><title>MotoGP</title><link>https://www.autosport.com/motogp/news/test/123/</link></item></channel></rss>';
 const items=normaliseNewsItems([{name:'Autosport',f1Only:true,items:parseRSS(xml)}]);
 assert.equal(items.length,1);assert.equal(items[0].title,'F1 & testing');assert.equal(items[0].snippet,'News excerpt');assert.equal(items[0].date,'2026-10-28T01:00:00.000Z');
 assert.equal(isF1Article('https://www.autosport.com.evil.example/f1/news/test'),false);
 assert.throws(()=>parseRSS('<html>Blocked</html>'),/Invalid RSS/);
});
