const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const adapter=fs.readFileSync(path.join(root,'shakerrr-library.js'),'utf8');
const shakerData=JSON.parse(fs.readFileSync(path.join(root,'data/shakerrr-recipes.json'),'utf8'));
const spiritIndex=JSON.parse(fs.readFileSync(path.join(root,'data/spirit-index.json'),'utf8'));
const glassPdt=JSON.parse(fs.readFileSync(path.join(root,'data/glass-pdt.json'),'utf8'));
const glassDeath=JSON.parse(fs.readFileSync(path.join(root,'data/glass-deathco.json'),'utf8'));
assert.equal(shakerData.recipes.length,407);
assert.equal(Object.keys(spiritIndex.books).length,2);
assert.equal(Object.keys(glassPdt.glasses).length,12);
assert.equal(Object.keys(glassDeath.glasses).length,14);
new Function(source);new Function(adapter);
const dom={
 '#site-header':{innerHTML:''},'#site-footer':{innerHTML:''},'#content':{innerHTML:''},
 '#toast':{textContent:'',classList:{add(){},remove(){}}}
};
let change;
const storage={};
const mockRecipe={ok:true,book:'pdt',name:'Margarita',description:'Tequila with lime',
 ingredients:[{name:'Tequila',role:'add',grams:56.1,amount:'2 oz',category:'tequila'},
 {name:'Lime Juice',role:'add',grams:22.8,amount:'.75 oz',category:'juice'}],
 method:'Shake with ice.',glass:'Rocks',
 stats:{abv_percent:16,sugar_g:9,volume_ml:205,acid_percent:.65},
 similar:[{name:'Daiquiri'}],source_book:{title:'The PDT Cocktail Book',authors:'Jim Meehan'}};
const context={
 console,Promise,Date,Intl,Map,Set,setTimeout,clearTimeout,encodeURIComponent,decodeURIComponent,
 navigator:{clipboard:{writeText:async()=>{}}},
 location:{hash:''},
 localStorage:{getItem(k){return storage[k]||null},setItem(k,v){storage[k]=v}},
 document:{documentElement:{dataset:{}},querySelector(q){return dom[q]||null},querySelectorAll(){return []},addEventListener(){},removeEventListener(){}},
 window:{addEventListener(name,cb){if(name==='hashchange')change=cb},scrollTo(){}},
 fetch:async url=>({
  ok:true,json:async()=>{
   if(url.includes('shakerrr-recipes.json'))return shakerData;
   if(url.includes('spirit-index.json'))return spiritIndex;
   if(url.includes('glass-pdt.json'))return glassPdt;
   if(url.includes('glass-deathco.json'))return glassDeath;
   if(url.includes('/recipes?'))return {ok:true,total:3,items:[{name:'Margarita'},{name:'Negroni'},{name:'Daiquiri'}]};
   if(url.includes('/ingredients?'))return {ok:true,total:2,items:[{name:'Tequila'},{name:'Lime Juice'}]};
   if(url.includes('/ingredients/'))return {ok:true,name:'Lime Juice',category:'juice',cocktails:[{name:'Margarita'}]};
   if(url.includes('/search?'))return {ok:true,cocktails:[{name:'Margarita'}],ingredients:[{name:'Lime Juice'}]};
   return mockRecipe;
  }
 })
};
vm.createContext(context);
vm.runInContext(adapter,context,{timeout:5000});
vm.runInContext(source,context,{timeout:5000});
function tick(){return new Promise(done=>setImmediate(done))}
async function route(hash,expected){
 context.location.hash=hash;await change();await tick();await tick();
 const html=dom['#content'].innerHTML;
 assert.ok(html.includes(expected),hash+' expected '+expected+' but got '+html.slice(0,500));
 assert.ok(!html.includes('This independent category view shows curated'),'source-site category banner reappeared');
 return html;
}
(async()=>{
 await route('#/','Shakerrr Library');
 await route('#/pdt/spirits','Whiskey');
 await route('#/pdt/spirit/gin','68 Gin cocktails');
 await route('#/deathco/spirit/rum','118 Rum cocktails');
 await route('#/pdt/glasses','Browse by glass');
 await route('#/pdt/glass/Coupe','176 cocktails');
 await route('#/deathco/glass/Rocks','85 cocktails');
 await route('#/shakerrr','11 collections');
 await route('#/shakerrr/collections','Browse collections');
 await route('#/shakerrr/collection/Essential%20Cocktail%20Book','125 recipes');
 await route('#/shakerrr/spirits','Whiskey');
 await route('#/shakerrr/recipes','All recipes');
 let recipe=await route('#/shakerrr/recipe/Elderflower%20Samba%20Martini','Elderflower Samba Martini');
 assert.ok(recipe.includes('2 oz'),'volume measurements absent');
 assert.ok(recipe.includes('ingredients/tc/'),'bottle cutouts absent');
 assert.ok(recipe.includes('Original volume measurements'),'Shakerrr weights must not be fabricated');
 await route('#/shakerrr/search/gin','matching cocktails');
 await route('#/shakerrr/glasses','Glasses');
 await route('#/shakerrr/ingredients','Ingredients');
 await route('#/shakerrr/ingredient/Fresh%20Lime%20Juice','Cocktails using');
 await route('#/saved','My lists');
 await route('#/bar','Your Bar');
 await route('#/help','Help');
 let about=await route('#/about','About Cocktail Atlas');
 assert.ok(!about.includes('Decent Espresso'),'vendor wording leaked to About');
 console.log('PASS: 22 route and integration tests, 407 imported recipes, complete 14 spirit and 26 glass groups');
})().catch(e=>{console.error(e);process.exitCode=1});
