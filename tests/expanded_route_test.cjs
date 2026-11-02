const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const adapter=fs.readFileSync(path.join(root,'shakerrr-library.js'),'utf8');
const ingredientArt=fs.readFileSync(path.join(root,'ingredient-art.js'),'utf8');
const bottleVariants=fs.readFileSync(path.join(root,'bottle-variants.js'),'utf8');
const tourSource=fs.readFileSync(path.join(root,'tour.js'),'utf8');
const measurements=fs.readFileSync(path.join(root,'recipe-measurements.js'),'utf8');
const tourStyles=fs.readFileSync(path.join(root,'tour.css'),'utf8');
const fullSearchIndex=JSON.parse(fs.readFileSync(path.join(root,'data/recipe-search-index.json'),'utf8'));
const artIndex=JSON.parse(fs.readFileSync(path.join(root,'data/ingredient-art-index.json'),'utf8'));
const shakerData=JSON.parse(fs.readFileSync(path.join(root,'data/shakerrr-recipes.json'),'utf8'));
const spiritIndex=JSON.parse(fs.readFileSync(path.join(root,'data/spirit-index.json'),'utf8'));
const glassPdt=JSON.parse(fs.readFileSync(path.join(root,'data/glass-pdt.json'),'utf8'));
const glassDeath=JSON.parse(fs.readFileSync(path.join(root,'data/glass-deathco.json'),'utf8'));
assert.equal(shakerData.recipes.length,407);
const mezcalBook=shakerData.recipes.filter(r=>r.collections.includes('Shakerrr Mezcal Library'));
assert.equal(mezcalBook.length,38,'Holy Smoke Mezcal collection count changed');
assert.equal(mezcalBook.filter(r=>!r.versions.find(v=>v.key==='holysmoke')?.instructions?.trim()).length,0,'Mezcal-book methods must not be empty');
const recipeVersion=(name)=>shakerData.recipes.find(r=>r.name===name)?.versions?.find(v=>v.key==='holysmoke');
assert.equal(recipeVersion('Exit Music').ingredients.find(i=>i.name.toLowerCase()==='fresh lemon juice').amount,'0.5 oz','Exit Music must not read 5 oz of lemon');
assert.ok(recipeVersion('Battle For Pueblo').ingredients.some(i=>i.name==='Royal Combier'),'Battle for Pueblo requires Royal Combier');
assert.ok(recipeVersion('Maximillian Affair').ingredients.some(i=>/mezcal/i.test(i.name)),'Maximillian Affair must include mezcal');
assert.ok(recipeVersion('La Otra Palabra').ingredients.some(i=>/marachino|maraschino/i.test(i.name)),'La Otra Palabra must include maraschino');
const agave=shakerData.recipes.filter(r=>r.collections.includes('Agave Companion'));
assert.ok(agave.some(r=>r.category==='Tequila'),'Agave Companion should distinguish tequila from mezcal');

assert.equal(Object.keys(spiritIndex.books).length,2);
assert.equal(Object.keys(glassPdt.glasses).length,12);
assert.equal(Object.keys(glassDeath.glasses).length,14);
new Function(source);new Function(adapter);new Function(ingredientArt);new Function(bottleVariants);new Function(tourSource);new Function(measurements);
assert.ok(tourStyles.includes('prefers-reduced-motion:reduce'),'Animation should respect reduced-motion preference');
assert.ok(!source.includes('youtube-nocookie.com'),'Old video embed must not return');
assert.ok(!source.includes('video/explainer.jpg'),'Old thumbnail must not return');
assert.equal(fullSearchIndex.books.pdt.length,304);
assert.equal(fullSearchIndex.books.deathco.length,477);
assert.ok(Object.keys(artIndex.items).length>=700);
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
   if(url.includes('recipe-search-index.json'))return fullSearchIndex;
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
vm.runInContext(ingredientArt,context,{timeout:5000});
vm.runInContext(bottleVariants,context,{timeout:5000});
assert.equal(context.window.IngredientArt.match('Orange Liqueur, Preferably Cointreau').stem,'cointreau');
assert.equal(context.window.IngredientArt.match('Fresh Lime Juice').stem,'lime_juice');
assert.ok(context.window.IngredientArt.url('Gin','tc').includes('/plymouth_gin.jpg'), 'Generic Gin should have a real bottle by default');
assert.ok(context.window.IngredientArt.url('Sweet Vermouth','tc').includes('/carpano_antica_sweet_vermouth.jpg'),'Sweet vermouth should have a default brand');
assert.ok(context.window.IngredientArt.selection('Gin').names.length>=4);
assert.ok(context.window.IngredientArt.selection('Sweet Vermouth').names.length>=4);
assert.equal(context.window.IngredientArt.selection('Cointreau'),null,'Named brand must not get a generic selector');
assert.equal(context.window.IngredientArt.url('Cointreau','tc'),context.window.IngredientArt.url('Orange Liqueur, Preferably Cointreau','tc'));
assert.ok(context.window.IngredientArt.choose('gin','Tanqueray Gin'));
assert.ok(context.window.IngredientArt.url('Gin','tc').includes('/tanqueray_gin.jpg'));
assert.ok(!context.window.IngredientArt.choose('gin','Fictional Unverified Gin'));
assert.ok(context.window.IngredientArt.url('Gin','tc').includes('/tanqueray_gin.jpg'));
assert.ok(storage.cocktailatlas_bottle_choices_v1.includes('Tanqueray Gin'));
assert.ok(context.window.IngredientArt.choose('sweet_vermouth','Dolin Sweet Vermouth'));
assert.ok(context.window.IngredientArt.url('Sweet Vermouth','tc').includes('/dolin_sweet_vermouth.jpg'));
assert.ok(context.window.IngredientArt.url('unknown ingredient without photo').startsWith('data:image/svg+xml'));
vm.runInContext(adapter,context,{timeout:5000});
vm.runInContext(tourSource,context,{timeout:5000});
assert.equal(context.window.CocktailAtlasTour.chapters.length,4);
assert.ok(context.window.CocktailAtlasTour.hero().includes('data-atlas-tour-open'));
assert.ok(context.window.CocktailAtlasTour.modalMarkup().includes('data-atlas-tour-dialog'));
assert.ok(!context.window.CocktailAtlasTour.modalMarkup().includes('<iframe'));
vm.runInContext(measurements,context,{timeout:5000});
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
 const home=await route('#/','Shakerrr Library');
 assert.ok(home.includes('data-atlas-tour-open'),'Homepage animated tour trigger missing');
 assert.ok(home.includes('Your bar.'),'Original preview missing');
 assert.ok(!home.includes('youtube-nocookie'),'Old video must not appear');
 await route('#/pdt/spirits','Whiskey');
 await route('#/pdt/spirit/gin','68 Gin cocktails');
 await route('#/deathco/spirit/rum','118 Rum cocktails');
 await route('#/pdt/glasses','Browse by glass');
 await route('#/pdt/glass/Coupe','176 cocktails');
 await route('#/deathco/glass/Rocks','85 cocktails');
 let combo=await route('#/deathco/mix/Rum/Lime','matching cocktails');
 assert.ok(!combo.includes('0 matching cocktails'),'Rum + lime must match ingredients');
 combo=await route('#/deathco/mix/Whiskey/Orange','matching cocktails');
 assert.ok(!combo.includes('0 matching cocktails'),'Whiskey + orange must match ingredients');
 let searched=await route('#/deathco/search/Whiskey%20orange','matching cocktails');
 assert.ok(!searched.includes('0 matching cocktails'),'multiword ingredient search must return full-index matches');
 await route('#/shakerrr','11 collections');
 await route('#/shakerrr/collections','Browse collections');
 await route('#/shakerrr/collection/Essential%20Cocktail%20Book','125 recipes');
 await route('#/shakerrr/spirits','Whiskey');
 await route('#/shakerrr/recipes','All recipes');
 let recipe=await route('#/shakerrr/recipe/Elderflower%20Samba%20Martini','Elderflower Samba Martini');
 assert.ok(recipe.includes('2 oz'),'volume measurements absent');
 assert.ok(recipe.includes('ingredients/tc/'),'bottle cutouts absent');
 const testCure={...mockRecipe,book:'deathco',name:'Cure for Pain',method:'Stir with ice.',ingredients:[
  {name:'Campari',role:'add',category:'liqueur',grams:5.2,amount:'1 tsp'},
  {name:'Marie Brizard White Creme de Cacao',role:'add',category:'liqueur',grams:5.4,amount:'1 tsp'},
  {name:'Rittenhouse Bonded Rye Whiskey',role:'add',category:'whiskey',grams:41.3,amount:'1.5 oz'},
  {name:'Orange Twist',role:'garnish',category:'fruit',grams:2,amount:'1'}]};
 const sourceBackup=mockRecipe.ingredients;
 mockRecipe.ingredients=testCure.ingredients;
 let cure=await route('#/deathco/recipe/Cure%20for%20Pain','Ingredients & steps');
 assert.ok(cure.includes('5.2 g')&&cure.includes('5.4 g'),'Source gram values must remain primary');
 assert.equal((cure.match(/⅙ oz/g)||[]).length,2,'Both spoon-based liqueurs should show 1/6 US fl oz');
 assert.ok(!cure.includes('1 tsp'),'Tsp labels must not remain on liquid rows');
 assert.ok(cure.includes('1½ oz'),'Regular ounce components should remain accurate');
 mockRecipe.ingredients=sourceBackup;
 const margarita=await route('#/shakerrr/recipe/Margarita','Ingredients & steps');
 assert.ok(margarita.includes('/ingredients/tc/cointreau.jpg'),'Cointreau bottle art alias is missing');
 assert.ok(recipe.includes('Gram values are not asserted'),'Shakerrr weights must not be fabricated');
const negroni=await route('#/shakerrr/recipe/Negroni','Ingredients & steps');
assert.ok(negroni.includes('data-bottle-select="gin"'),'Negroni Gin needs selector');
assert.ok(negroni.includes('data-bottle-select="sweet_vermouth"'),'Negroni sweet vermouth needs selector');
assert.ok(negroni.includes('/tanqueray_gin.jpg'),'Gin selection must appear in Negroni');
assert.ok(negroni.includes('/dolin_sweet_vermouth.jpg'),'Sweet vermouth selection must appear in Negroni');
assert.ok(negroni.includes('data-bottle-kind="t"'),'Step-list icons must also be switchable');
 await route('#/shakerrr/search/gin','matching cocktails');
 await route('#/shakerrr/glasses','Glasses');
 await route('#/shakerrr/ingredients','Ingredients');
 await route('#/shakerrr/ingredient/Fresh%20Lime%20Juice','Cocktails using');
 await route('#/saved','My lists');
 await route('#/bar','Your Bar');
 await route('#/help','Help');
 let about=await route('#/about','About Cocktail Atlas');
 assert.ok(!about.includes('Decent Espresso'),'vendor wording leaked to About');
 console.log('PASS: 26+ route and integration checks, 781 indexed source recipes, 407 Shakerrr recipes, verified bottle image aliases');
})().catch(e=>{console.error(e);process.exitCode=1});
