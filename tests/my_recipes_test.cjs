const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const storeScript=fs.readFileSync(path.join(root,'my-recipes.js'),'utf8');
const uiScript=fs.readFileSync(path.join(root,'my-recipes-ui.js'),'utf8');
const appScript=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
new Function(storeScript);new Function(uiScript);
assert.ok(html.includes('my-recipes.js')&&html.includes('my-recipes-ui.js'));
assert.ok(html.indexOf('my-recipes.js')<html.indexOf('my-recipes-ui.js'));
assert.ok(html.indexOf('my-recipes-ui.js')<html.indexOf('app.js'));
assert.ok(appScript.includes('Make my version')&&appScript.includes("parts[0]==='my-recipes'"));
const local={};
const win={};
const ctx={window:win,Date,Math,JSON,Error,
 localStorage:{getItem:k=>local[k]||null,setItem:(k,v)=>{local[k]=v}},
};
vm.createContext(ctx);
vm.runInContext(storeScript,ctx);
const db=win.MyRecipes;
assert.equal(db.all().length,0);
assert.throws(()=>db.save({name:'',method:'Shake',ingredients:[]}),/name/);
assert.throws(()=>db.save({name:'Test',method:'',ingredients:[{name:'Gin',amount:'2 oz'}]}),/preparation/);
assert.throws(()=>db.save({name:'Test',method:'Stir',ingredients:[{name:'Gin',amount:''}]}),/name and amount/);
const named=db.save({
 name:'My Negroni',glass:'Rocks glass',garnish:'Orange twist',method:'Stir with ice.',
 notes:'A little less sweet',ingredients:[{amount:'1 oz',name:'Gin'},{amount:'1 oz',name:'Campari'},{amount:'1 oz',name:'Sweet Vermouth'}]
});
assert.ok(named.id.startsWith('r-'));assert.equal(db.all().length,1);
assert.equal(db.get(named.id).ingredients[0].name,'Gin');
const adjusted=db.save({...named,ingredients:[{amount:'1¼ oz',name:'Gin'},{amount:'¾ oz',name:'Campari'}]});
assert.equal(adjusted.id,named.id);assert.equal(adjusted.createdAt,named.createdAt);assert.equal(db.get(named.id).ingredients.length,2);
const version=db.save({name:'My version of Negroni',parent:{book:'shakerrr',name:'Negroni'},method:'Stir',ingredients:[{name:'Gin',amount:'1 oz'}]});
assert.equal(version.kind,'version');assert.equal(db.forParent('shakerrr','Negroni').length,1);
assert.equal(db.forParent('pdt','Negroni').length,0);
const dupe=db.duplicate(version.id);
assert.notEqual(dupe.id,version.id);
assert.equal(db.all().length,3);
const backup=db.exportJSON();
assert.ok(backup.includes('My Negroni'));
assert.equal(db.importJSON(backup,'merge'),3);
assert.equal(db.all().length,3,'merge should not duplicate existing IDs');
assert.ok(db.remove(named.id));assert.equal(db.all().length,2);
assert.equal(db.importJSON(backup,'replace'),3);
assert.equal(db.all().length,3);
assert.throws(()=>db.importJSON('not JSON'),/Invalid JSON/);
assert.throws(()=>db.importJSON(JSON.stringify({recipes:[]})),/Not a Cocktail Atlas/);
const invalid=JSON.parse(backup);invalid.recipes[0].id='bad-id';
assert.throws(()=>db.importJSON(JSON.stringify(invalid)),/invalid recipe identifier/);
const uiCtx={window:win,document:{querySelector:()=>null},Date,Math,JSON,Error,
 localStorage:ctx.localStorage};
vm.createContext(uiCtx);vm.runInContext(uiScript,uiCtx);
assert.ok(win.MyRecipesUI.card(named).includes('My Negroni'));
assert.ok(win.MyRecipesUI.itemUrl(named.id).includes(named.id));
let markup='';
win.MyRecipesUI.init({
 set:s=>{markup=s},toast:()=>{},getRecipe:async()=>({name:'Classic Negroni',method:'Stir with ice',glass:'Rocks',ingredients:[{name:'Gin',amount:'1 oz'},{name:'Campari',amount:'1 oz'}]}),
 ingImg:()=>'image',bottleCutout:()=>'image',bottleZoom:()=>'image',bottleImageAttrs:()=>'',bottlePicker:()=>'',
 scaleAmount:(a)=>a,glassImg:()=>'glass',previewScale:()=>{}
});
win.IngredientArt={url:()=>'/img/gin.jpg',known:{'Gin':'gin','Campari':'campari'}};
win.MyRecipesUI.list();
assert.ok(markup.includes('My Negroni')&&markup.includes('Export backup')&&markup.includes('Import backup'));
win.MyRecipesUI.detail(version.id);
assert.ok(markup.includes('My version of Negroni')&&markup.includes('Ingredients & steps'));
(async()=>{
 await win.MyRecipesUI.editor(null,{book:'shakerrr',name:'Negroni'});
 assert.ok(markup.includes('Classic Negroni')&&markup.includes('PERSONAL VERSION')&&markup.includes('Gin'));
 await win.MyRecipesUI.editor();
 assert.ok(markup.includes('Create a recipe')&&markup.includes('Add ingredient'));
 console.log('PASS: custom recipe CRUD, validation, versions, edit, import/export, UI routes and bottle previews');
})().catch(e=>{console.error(e);process.exitCode=1});
