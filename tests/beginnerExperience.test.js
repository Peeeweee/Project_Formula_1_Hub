import test from 'node:test';
import assert from 'node:assert/strict';
import { searchItems, driverSearchItem } from '../src/utils/siteSearch.js';
import { CHAPTERS } from '../src/data/learningChapters.js';
import { PRIMARY_LINKS,RESOURCE_LINKS } from '../src/data/navigation.js';
test('learning path has eight distinct chapters with valid checks and actionable next destinations',()=>{
 assert.equal(CHAPTERS.length,8);assert.equal(new Set(CHAPTERS.map(c=>c.id)).size,8);
 for(const chapter of CHAPTERS){assert.ok(chapter.body.length>90);assert.ok(chapter.answers[chapter.correct]);assert.ok(chapter.why.length>30);assert.ok(chapter.path.startsWith('/'));}
});
test('every navigation destination is unique and beginner essentials are directly available',()=>{
 const paths=[...PRIMARY_LINKS,...RESOURCE_LINKS].map(item=>item.path);assert.equal(paths.length,new Set(paths).size);
 for(const path of ['/watch','/strategy','/teams','/dictionary','/garage'])assert.ok(paths.includes(path));
});
test('search normalizes accents and tire terminology, ranks exact results and deduplicates driver sources',()=>{
 const items=[{id:'1',label:'Parc Fermé',sublabel:'Restricted work'},{id:'2',label:'Tires',sublabel:'Tire guide'},{id:'3',label:'Safety Car',sublabel:'A road car'},{id:'3',label:'Safety Car',sublabel:'Updated record'}];
 assert.equal(searchItems(items,'parc ferme')[0].id,'1');assert.equal(searchItems(items,'tyres')[0].id,'2');assert.equal(searchItems(items,'sc').length,1);assert.equal(searchItems(items,'sc')[0].sublabel,'Updated record');assert.deepEqual(searchItems(items,''),[]);
});
test('driver results preserve the exact driver identity and safely encode accented names',()=>{
 const result=driverSearchItem({driverId:'test',givenName:'José',familyName:'A & B',nationality:'Example'});const params=new URLSearchParams(result.path.split('?')[1]);assert.equal(params.get('driver'),'test');assert.equal(params.get('family'),'A & B');assert.equal(params.get('section'),'driver-profile');
});
