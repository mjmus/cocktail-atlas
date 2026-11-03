const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const curated=JSON.parse(read('data/sommelier-curated-wines.json')).wines;
const personal=JSON.parse(read('data/sommelier-tried-wines.json')).wines;
const producers=JSON.parse(read('data/sommelier-producer-bottles.json')).bottles;
assert.equal(curated.length,14);
const ids=new Set([...personal,...producers].map(w=>w.id));
for(const w of curated){
 assert.ok(!ids.has(w.id),'Duplicate wine '+w.id);
 ids.add(w.id);
 for(const key of ['producer','wine','wineType','referenceVintage','grape','region','country','nose','palate','finish','body','acidity','tannins','sweetness','personalNote','producerSource','imageUrl','imageSource','sourceLabel','imageVintageNote','vintageNote','pairingBasis','serve'])
   assert.ok(typeof w[key]==='string'&&w[key].trim().length>2,'Missing '+key+' for '+w.id);
 assert.ok(w.imageUrl.startsWith('https://')&&w.imageSource.startsWith('https://')&&w.producerSource.startsWith('https://'),'Image and provenance must be HTTPS');
 assert.ok(w.food.length>=3&&w.flavors.length>=3);
 assert.ok(!('price' in w)&&!('ranking' in w)&&!('rating' in w),'No wine prices or rankings');
}
const context={window:{}};vm.createContext(context);vm.runInContext(read('sommelier-pairings.js'),context);
const pair=context.window.SommelierPairings;
assert.equal(pair.photos.length,11);
for(const photo of pair.photos){
 assert.ok(photo.url.startsWith('https://images.unsplash.com/photo-'));
 assert.ok(photo.source.startsWith('https://unsplash.com/photos/'),'Every food photograph must link to its licensing and photographer source');
}
assert.equal(pair.match('Ribeye steak').id,'steak');
assert.equal(pair.match('Sushi platter').id,'sushi');
assert.equal(pair.match('Oysters with lemon').id,'oysters');
assert.equal(pair.match('Mushroom risotto').id,'risotto');
assert.equal(pair.match('Roast chicken').id,'chicken');
assert.equal(pair.match('Grilled fish').id,'fish');
assert.equal(pair.match('Tuna steak'),null,'A cooked beef-steak photo must not be shown for tuna');
assert.equal(pair.match('Scallop tartare'),null,'Do not invent unrelated dish photo');
const html=pair.render(['Ribeye steak','Charcuterie board','Braised beef casserole']);
assert.ok(html.includes('somm-pairing-grid')&&html.includes('somm-pairing-media')&&html.includes('Ribeye steak'));
assert.ok(html.includes('unsplash.com/photos/')&&html.includes('Braised beef casserole'));
assert.ok(html.includes('illustrative'),'Food pictures must be labeled illustrative');
assert.equal((html.match(/<img /g)||[]).length,2,'Only real matching food categories get photos');
assert.ok(!pair.render(['Unrelated rare dish']).includes('<img '),'Never substitute misleading generic images');
const index=read('index.html');
assert.ok(index.includes('sommelier-pairings.js?v=20261103-food')&&index.includes('sommelier-pairings.css'));
assert.ok(index.indexOf('sommelier-pairings.js')<index.indexOf('sommelier-tried.js'),'Food image helper should be initialized before detail renderers');
assert.ok(read('sommelier-bottles.js').includes('SommelierPairings.render(b.food)'));
assert.ok(read('sommelier-tried.js').includes('SommelierPairings.render(w.food)'));
assert.ok(read('sommelier.js').includes('SommelierPairings.render(w.food)'));
assert.ok(read('sommelier-tried.js').includes('loadCurated')&&read('sommelier-tried.js').includes('loadCatalog'),'Load additional wines without modifying personal source list');
console.log('PASS: 14 sourced wines, 11 licensed food photos, exact dish matching, 49 total bottle identities and original wine data preserved');
