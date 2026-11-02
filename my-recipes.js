/* Cocktail Atlas personal recipe store: browser-local only, no server writes. */
(() => {
 'use strict';
 const KEY='cocktailatlas_my_recipes_v1';
 const LIMIT=1500, INGREDIENT_LIMIT=80;
 const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
 const plain=object=>JSON.parse(JSON.stringify(object));
 function read(){
   try {
     const obj=JSON.parse(localStorage.getItem(KEY)||'{"schemaVersion":1,"recipes":[]}');
     return obj?.schemaVersion===1 && Array.isArray(obj.recipes)?obj.recipes:[];
   }catch{return []}
 }
 function all(){return read().slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));}
 function get(id){return read().find(x=>x.id===id)||null;}
 function forParent(book,name){return all().filter(x=>x.parent?.book===book&&x.parent?.name===name);}
 function normalize(raw,previous){
   if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid recipe.');
   const name=clean(raw.name,120),method=clean(raw.method,5000),glass=clean(raw.glass,120);
   if(!name)throw Error('Enter a recipe name.');
   if(!method)throw Error('Enter preparation instructions.');
   if(!Array.isArray(raw.ingredients))throw Error('Add at least one ingredient.');
   if(raw.ingredients.length>INGREDIENT_LIMIT)throw Error('Too many ingredients.');
   const ingredients=raw.ingredients.map(x=>({
     amount:clean(x?.amount,60),
     name:clean(x?.name,160),
     role:x?.role==='garnish'?'garnish':'add'
   })).filter(x=>x.amount||x.name);
   if(!ingredients.length)throw Error('Add at least one ingredient.');
   if(ingredients.some(x=>!x.name||!x.amount))throw Error('Every ingredient needs a name and amount.');
   const parent=raw.parent?.book&&raw.parent?.name&&['pdt','deathco','shakerrr'].includes(raw.parent.book)
     ?{book:raw.parent.book,name:clean(raw.parent.name,120)}:null;
   const id=previous?.id||clean(raw.id,100)||('r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
   const now=new Date().toISOString();
   return {
     id,name,kind:parent?'version':'original',parent,glass,garnish:clean(raw.garnish,240),
     method,notes:clean(raw.notes,3000),ingredients,
     createdAt:previous?.createdAt||now,updatedAt:now
   };
 }
 function write(records){
   if(records.length>LIMIT)throw Error('Recipe library is full.');
   try{localStorage.setItem(KEY,JSON.stringify({schemaVersion:1,recipes:records}));}
   catch{throw Error('Could not save. Browser storage may be full or disabled. Export a backup and free space.');}
 }
 function save(raw){
   const previous=raw.id?get(raw.id):null;
   if(raw.id&&!previous)throw Error('Recipe no longer exists. Open My Recipes and try again.');
   const recipe=normalize(raw,previous);
   const data=read(),index=data.findIndex(x=>x.id===recipe.id);
   if(index<0)data.push(recipe);else data[index]=recipe;
   write(data);
   return plain(recipe);
 }
 function remove(id){
   const data=read(),remaining=data.filter(x=>x.id!==id);
   if(remaining.length===data.length)return false;
   write(remaining);return true;
 }
 function duplicate(id){
   const item=get(id);if(!item)throw Error('Recipe not found.');
   return save({...item,id:null,name:item.name+' (copy)',createdAt:null,updatedAt:null});
 }
 function exportJSON(){return JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),recipes:read()},null,2);}
 function importJSON(text,mode='merge'){
   if(typeof text!=='string'||text.length>3500000)throw Error('Backup is too large or invalid.');
   let parsed;try{parsed=JSON.parse(text)}catch{throw Error('Invalid JSON backup.');}
   if(parsed?.schemaVersion!==1||!Array.isArray(parsed.recipes))throw Error('Not a Cocktail Atlas recipe backup.');
   if(parsed.recipes.length>LIMIT)throw Error('Backup contains too many recipes.');
   const now=new Date().toISOString();
   const incoming=parsed.recipes.map(x=>{
      const item=normalize(x,null);
      const candidate=clean(x.id,100);
      if(!/^r-[a-z0-9-]{6,70}$/i.test(candidate))throw Error('Backup has an invalid recipe identifier.');
      return {...item,id:candidate,createdAt:clean(x.createdAt,50)||now,updatedAt:clean(x.updatedAt,50)||now};
   });
   const ids=new Set(incoming.map(x=>x.id));
   if(ids.size!==incoming.length)throw Error('Backup contains duplicate recipe IDs.');
   const map=new Map((mode==='replace'?[]:read()).map(x=>[x.id,x]));
   incoming.forEach(x=>map.set(x.id,x));
   write([...map.values()]);
   return incoming.length;
 }
 window.MyRecipes={all,get,forParent,save,remove,duplicate,exportJSON,importJSON,normalize,storageKey:KEY};
})();
