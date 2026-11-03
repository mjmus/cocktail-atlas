const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const journal=JSON.parse(read('data/sommelier-tried-wines.json'));
const existing=JSON.parse(read('data/sommelier-producer-bottles.json'));
const styles=JSON.parse(read('data/sommelier-wines.json'));
const cocktails=JSON.parse(read('data/shakerrr-recipes.json'));
const index=read('index.html'),app=read('app.js');
assert.equal(journal.wines.length,13,'All 13 uploaded wines should be in personal journal');
assert.equal(existing.bottles.length,22,'Original producer collection must stay intact');
assert.equal(styles.wines.length,25,'Original 25 style cards must stay intact');
assert.equal(cocktails.recipes.length,407,'Original cocktail source must remain unchanged');
assert.equal(new Set(journal.wines.map(x=>x.id)).size,13);
const expected=['denny-bini-willa-lambrusco','santa-julia-el-zorrito-2024','strange-grapes-nextdoor-rosie-2020','mortellito-viaria-2022','mortellito-cala-niuru-2022','furlani-alpino-macerato','pearl-morissette-roselana-2023','pearl-morissette-irreverence-2020','pearl-morissette-flammerole-2022','terres-dorees-le-ronsay','occhipinti-sp68-bianco-2022','grosbois-cuisine-de-ma-mere-2022','les-oliviers-grenache-cinsault-rose-2023'];
for(const id of expected)assert.ok(journal.wines.some(w=>w.id===id),'Missing original wine '+id);
for(const w of journal.wines){
 for(const k of ['id','producer','wine','referenceVintage','wineType','nose','palate','finish','body','acidity','tannins','sweetness','personalNote','pairingBasis','serve','imageUrl','imageSource','producerSource','vintageNote','imageVintageNote']){
   assert.ok(typeof w[k]==='string'&&w[k].trim().length>2,'Missing '+k+' for '+w.id);
 }
 assert.ok(w.imageUrl.startsWith('https://'),'Need a real remote wine bottle photograph: '+w.id);
 assert.ok(w.imageSource.startsWith('https://') && w.producerSource.startsWith('https://'));
 assert.ok(w.food.length>=2 && w.flavors.length>=3,'Need realistic wine tasting and pairing details');
}
assert.equal(journal.wines.find(w=>w.id==='furlani-alpino-macerato').wine,'Alpino Macerato Frizzante','Do not mistake Pinot Grigio Macerato for regular Alpino');
assert.match(journal.wines.find(w=>w.id==='pearl-morissette-roselana-2023').imageVintageNote,/2024/,'Roselana photograph displays a newer vintage');
assert.match(journal.wines.find(w=>w.id==='denny-bini-willa-lambrusco').vintageNote,/not an independently confirmed vintage/,'Do not silently assert a 2023 wine vintage');
assert.ok(index.includes('sommelier-tried.css')&&index.includes('sommelier-tried.js'));
assert.ok(index.indexOf('sommelier-tried.js')<index.indexOf('src="./sommelier.js'),'Journal dependency must load before Sommelier app');
assert.ok(app.includes("parts[0]==='sommelier'"),'Original app routing must be unchanged');
for(const file of ['sommelier-tried.js','sommelier.js','sommelier-bottles.js'])new Function(read(file));
const ctx={window:{},document:{title:'',querySelectorAll:()=>[],querySelector:()=>null},fetch:async url=>{
 if(url.includes('sommelier-tried-wines.json'))return {ok:true,json:async()=>journal};
 if(url.includes('sommelier-wines.json'))return {ok:true,json:async()=>styles};
 if(url.includes('sommelier-producer-bottles.json'))return {ok:true,json:async()=>existing};
 throw Error('Unexpected fetch '+url);
}};
vm.createContext(ctx);
for(const file of ['sommelier-bottles.js','sommelier-tried.js','sommelier.js'])vm.runInContext(read(file),ctx,{timeout:5000});
(async()=>{
 const entries=await ctx.window.SommelierTried.load();
 assert.equal(entries.length,13);
 let rendered='';
 await ctx.window.Sommelier.page(['sommelier'],s=>{rendered=s},()=>true);
 assert.equal((rendered.match(/class="somm-producer-card somm-tried-card"/g)||[]).length,13);
 assert.equal((rendered.match(/class="somm-producer-card"/g)||[]).length,22);
 assert.equal((rendered.match(/class="somm-card"/g)||[]).length,25);
 assert.ok(rendered.includes('Wines I’ve Tried')&&rendered.includes('Alpino Macerato'));
 assert.ok(rendered.includes('somm-tried-image')&&rendered.includes('Nextdoor Rosie'));
 let wine='';
 await ctx.window.Sommelier.page(['sommelier','tried','occhipinti-sp68-bianco-2022'],s=>{wine=s},()=>true);
 for(const snippet of ['Arianna Occhipinti','SP68 Bianco','FROM YOUR WINE LIST','SOMMELIER NOTES','On the palate','Food pairings','View original bottle photograph'])
  assert.ok(wine.includes(snippet),'Individual wine detail missing '+snippet);
 let old='';
 await ctx.window.Sommelier.page(['sommelier','bottle','cloudy-bay-sauvignon-2024'],s=>{old=s},()=>true);
 assert.ok(old.includes('Cloudy Bay'),'Existing producer page should still work');
 let style='';
 await ctx.window.Sommelier.page(['sommelier','wine','nebbiolo'],s=>{style=s},()=>true);
 assert.ok(style.includes('Vietti'),'Existing wine-style page should still work');
 console.log('PASS: 13 correct personal bottles with original notes and photos; 22 producers, 25 styles, 407 cocktails preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
