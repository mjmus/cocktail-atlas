const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'..','app.js'),'utf8');
const fields={
 '#content':{innerHTML:''},'#site-header':{innerHTML:''},'#site-footer':{innerHTML:''},
 '#toast':{textContent:'',classList:{add(){},remove(){}}},
};
let hashchange=null;
const mockRecipe={ok:true,book:'pdt',name:'Margarita',description:'Tequila and lime',
 ingredients:[{name:'El Tesoro Platinum Tequila',role:'add',grams:56.1,amount:'2 oz',category:'tequila'},
 {name:'Lime Juice',role:'add',grams:22.8,amount:'.75 oz',category:'juice'},
 {name:'Lime Wheel',role:'garnish',grams:null,amount:'1',category:'fruit'}],
 method:'Shake with ice and strain into a rocks glass',glass:'Rocks',
 image_url:'https://example.com/margarita.jpg',similar:[{name:'Daiquiri'}],stats:{abv_percent:16,sugar_g:9,volume_ml:205,acid_percent:.65},
 source_book:{title:'The PDT Cocktail Book',authors:'Jim Meehan'},web_url:'https://decentespresso.com/cocktails/pdt/recipes/Margarita'};
const storage={};
const context={
 console,Promise,setTimeout,clearTimeout,Date,Intl,encodeURIComponent,decodeURIComponent,
 navigator:{clipboard:{writeText:async()=>{}}},
 window:{addEventListener(event,cb){if(event==='hashchange')hashchange=cb;},scrollTo(){}},
 location:{hash:''},
 localStorage:{getItem(k){return storage[k]||null;},setItem(k,v){storage[k]=v;}},
 document:{documentElement:{dataset:{}},querySelector(sel){return fields[sel]||null;},querySelectorAll(){return []},addEventListener(){},removeEventListener(){}},
 fetch:async(url)=>({ok:true,json:async()=>{
 if(url.includes('/recipes?'))return {ok:true,total:3,items:[{name:'Margarita'},{name:'Negroni'},{name:'Daiquiri'}]};
 if(url.includes('/ingredients?'))return {ok:true,total:2,items:[{name:'Lime Juice'},{name:'Campari'}]};
 if(url.includes('/ingredients/'))return {ok:true,name:'Lime Juice',category:'juice',cocktails:[{name:'Margarita'}]};
 if(url.includes('/search?'))return {ok:true,cocktails:[{name:'Margarita'}],ingredients:[{name:'Lime Juice'}]};
 return mockRecipe;
 }})
};
vm.createContext(context);
vm.runInContext(source,context,{timeout:2000});
assert.ok(fields['#content'].innerHTML.includes('Choose a cocktail book'),'home route');
assert.ok(fields['#site-header'].innerHTML.includes('Cocktail <i>Atlas</i>'),'custom brand');
(async()=>{
 const cases=[
  ['#/pdt','300'],['#/deathco','500'],['#/pdt/spirits','Browse cocktails by their base spirit'],
  ['#/pdt/recipes','All recipes'],['#/pdt/recipe/Margarita','El Tesoro Platinum Tequila'],
  ['#/pdt/search/mezcal','Search'],['#/pdt/ingredients','Ingredients'],
  ['#/pdt/ingredient/Lime Juice','Lime Juice'],['#/pdt/glasses','Glasses'],
  ['#/bar','Your Bar'],['#/saved','My lists'],['#/help','Choose a book'],['#/about','Licence & credits']
 ];
 for(const [path,expected] of cases){context.location.hash=path;await hashchange();let html=fields['#content'].innerHTML;assert.ok(html.includes(expected),`${path} missing ${expected}, got ${html.slice(0,300)}`);
 if(path.includes('/recipe/Margarita')){assert.ok(html.includes('ingredients/tc/el_tesoro_platinum_tequila.jpg'),'cropped bottle image');assert.ok(html.includes('ingredients/tz/el_tesoro_platinum_tequila.jpg'),'hover bottle');assert.ok(html.includes('56.1 g'),'gram amount');assert.ok(html.includes('Similar cocktails'),'related drinks')}
 }
 console.log('PASS: 13 routes + bottle cutouts, attribution, source catalog, recipe ingredients, and search rendering');
})().catch(e=>{console.error(e);process.exitCode=1});
