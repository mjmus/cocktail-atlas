/* Cocktail Atlas: manual recipe editor and personal recipe cards. */
(() => {
'use strict';
const db=()=>window.MyRecipes;
const art=()=>window.IngredientArt;
const $=s=>document.querySelector(s);
let E=null;
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const url=(...parts)=>'#/'+parts.map(p=>encodeURIComponent(p)).join('/');
const itemUrl=id=>url('my-recipes','recipe',id);
const editUrl=id=>url('my-recipes','edit',id);
const sourceLink=parent=>parent?url(parent.book,'recipe',parent.name):null;
function init(env){E=env;}
function head(title,description){return '<section class="wrap phead"><div class="crumb"><a href="#/">Home</a> / <a href="#/my-recipes">My Recipes</a></div><h1>'+safe(title)+'</h1><p class="pdesc">'+safe(description)+'</p></section>';}
function card(r){
 const img=art()?.url(r.ingredients.find(x=>x.role!=='garnish')?.name||'', 'tc')||'';
 return '<a class="my-card" href="'+itemUrl(r.id)+'"><div class="my-card-photo"><img src="'+safe(img)+'" alt="" loading="lazy" onerror="this.onerror=null;this.src=window.IngredientArt?.fallback||\'\'"><span class="my-card-index">'+(r.kind==='version'?'MY VERSION':'MY ORIGINAL')+'</span></div><div class="my-card-body"><h3>'+safe(r.name)+'</h3><p>'+safe(r.parent?('Based on '+r.parent.name):((r.ingredients||[]).length+' ingredients'))+'</p><span>Open recipe →</span></div></a>';
}
function list(){
 document.title='My Recipes · Cocktail Atlas';
 const records=db().all();
 E.set(head('My Recipes','Your own creations and variations, saved in this browser.')+
 '<section class="wrap blk my-library" style="border-top:0;padding-top:8px">'+
 '<div class="my-toolbar"><a class="my-primary" href="#/my-recipes/new">+ Create a recipe</a><button type="button" class="btn-outline" id="myExport">Export backup</button><label class="my-import-label">Import backup<input id="myImport" type="file" accept="application/json,.json" hidden></label></div>'+
 '<p class="my-private-note">Recipes stay on this device in this browser. Export a backup to keep or move them. This website does not upload your recipes.</p>'+
 (records.length?'<label class="my-search-label">Find your recipes<input id="mySearch" type="search" placeholder="Search a name or ingredient" autocomplete="off"></label><div class="my-count" id="myCount">'+records.length+' saved recipe'+(records.length===1?'':'s')+'</div><div class="my-grid" id="myGrid">'+records.map(card).join('')+'</div>':
 '<div class="my-empty"><span class="my-empty-icon">✎</span><h2>Start your cocktail notebook.</h2><p>Create a drink from scratch or open any cocktail and choose <b>Make my version</b>.</p><a class="my-primary" href="#/my-recipes/new">Write your first recipe →</a></div>')+
 '</section>');
 $('#myExport')?.addEventListener('click',downloadBackup);
 $('#myImport')?.addEventListener('change',importBackup);
 $('#mySearch')?.addEventListener('input',e=>{
   const q=e.target.value.trim().toLowerCase();
   const found=records.filter(r=>[r.name,r.notes,r.method,r.parent?.name,...r.ingredients.map(i=>i.name)].some(x=>String(x||'').toLowerCase().includes(q)));
   $('#myGrid').innerHTML=found.length?found.map(card).join(''):'<div class="my-empty">No matching personal recipes.</div>';
   $('#myCount').textContent=found.length+' matching recipe'+(found.length===1?'':'s');
 });
}
function row(i={amount:'',name:'',role:'add'}){
 return '<div class="my-ing-row" data-my-row><label>Amount<input class="my-ing-amount" name="amount" placeholder="1½ oz" maxlength="60" required value="'+safe(i.amount)+'"></label><label>Ingredient<input class="my-ing-name" name="ingredient" list="myIngredientSuggestions" placeholder="Gin, Cointreau, lime juice…" maxlength="160" required value="'+safe(i.name)+'"></label><label>Step<select class="my-ing-role" name="role"><option value="add"'+(i.role!=='garnish'?' selected':'')+'>Add</option><option value="garnish"'+(i.role==='garnish'?' selected':'')+'>Garnish</option></select></label><div class="my-row-controls"><button type="button" class="my-remove-row" title="Remove this ingredient" aria-label="Remove ingredient">×</button><span class="my-grip" aria-hidden="true">↕</span></div></div>';
}
function preview(items){
 if(!items?.length)return '<div class="my-preview-empty">Add ingredients to see bottle previews.</div>';
 return items.slice(0,12).map(i=>'<div class="my-bottle"><img src="'+safe(art()?.url(i.name,'tc')||'')+'" alt="'+safe(i.name)+' bottle" onerror="this.onerror=null;this.src=window.IngredientArt?.fallback||\'\'"><span>'+safe(i.name)+'</span><small>'+safe(i.amount)+'</small></div>').join('');
}
function gather(form){
 return [...form.querySelectorAll('[data-my-row]')].map(r=>({
    amount:r.querySelector('.my-ing-amount').value,
    name:r.querySelector('.my-ing-name').value,
    role:r.querySelector('.my-ing-role').value
 }));
}
function updatePreview(){
 const form=$('#myEditorForm');if(!form)return;
 const rows=gather(form).filter(x=>x.name);
 const area=$('#myBottlePreview');if(area)area.innerHTML=preview(rows);
}
async function editor(id=null,parent=null){
 let saved=id?db().get(id):null;
 if(id&&!saved){list();E.toast('Recipe not found');return;}
 let prefill=null;
 if(!saved&&parent){
   if(!['pdt','deathco','shakerrr'].includes(parent.book)){list();return;}
   try {
     const recipe=await E.getRecipe(parent.book,parent.name);
     prefill={name:recipe.name,method:recipe.method||'',glass:recipe.glass||'',garnish:recipe.garnish||'',notes:'',ingredients:(recipe.ingredients||[]).map(i=>({name:i.name,amount:i.amount||((i.grams!=null)?(i.grams+' g'):''),role:i.role==='garnish'?'garnish':'add'})),parent};
   } catch(e){E.toast('Could not load the original recipe.');list();return;}
 }
 const r=saved||prefill||{name:'',method:'',glass:'',garnish:'',notes:'',ingredients:[{name:'',amount:'',role:'add'},{name:'',amount:'',role:'add'},{name:'',amount:'',role:'add'}],parent:null};
 document.title=(id?'Edit':'Create')+' a recipe · Cocktail Atlas';
 E.set(head(id?'Edit my recipe':parent?'Make my version':'Create a recipe',parent?'Start from the original recipe, then change ingredients or steps to make it yours.':'Write the ingredients, amounts, and preparation steps. Bottle illustrations update as you type.')+
 '<section class="wrap blk my-edit-section" style="border-top:0;padding-top:8px"><div class="my-editor-layout"><form id="myEditorForm" class="my-editor" novalidate>'+
 (r.parent?'<div class="my-origin-label">PERSONAL VERSION OF <a href="'+sourceLink(r.parent)+'">'+safe(r.parent.name)+'</a> <span>· '+safe(r.parent.book.toUpperCase())+'</span></div>':'<div class="my-origin-label">YOUR ORIGINAL RECIPE</div>')+
 '<div class="my-field-grid"><label class="my-field my-span">Recipe name <input name="title" maxlength="120" required placeholder="My house Negroni" value="'+safe(r.name)+'"></label><label class="my-field">Glassware <input name="glass" maxlength="120" placeholder="Rocks glass" value="'+safe(r.glass)+'"></label><label class="my-field">Garnish <input name="garnish" maxlength="240" placeholder="Orange twist" value="'+safe(r.garnish)+'"></label></div>'+
 '<div class="my-editor-head"><h2>Ingredients</h2><button type="button" id="myAddIngredient" class="btn-outline">+ Add ingredient</button></div>'+
 '<div id="myIngredientRows">'+r.ingredients.map(row).join('')+'</div>'+
 '<div class="my-editor-fields"><label class="my-field">Method / directions<textarea name="method" rows="5" maxlength="5000" required placeholder="Add ingredients to a mixing glass with ice. Stir until chilled…">'+safe(r.method)+'</textarea></label><label class="my-field">My tasting notes (optional)<textarea name="notes" rows="3" maxlength="3000" placeholder="Less sweet, substitute rye, try with fresh citrus…">'+safe(r.notes)+'</textarea></label></div>'+
 '<div class="my-form-error" id="myFormError" role="alert" hidden></div><div class="my-save-bar"><button type="submit" class="my-primary">'+(id?'Save changes':'Save my recipe')+'</button><a href="'+(id?itemUrl(id):'#/my-recipes')+'" class="btn-outline my-cancel">Cancel</a></div></form>'+
 '<aside class="my-editor-aside"><div class="my-preview-panel"><div class="eye">BOTTLE PREVIEW</div><h3>Your ingredients</h3><div id="myBottlePreview" class="my-preview-bottles">'+preview(r.ingredients.filter(i=>i.name))+'</div><p>Named brands use their matching artwork. Generic spirits use your selected bottle preference.</p></div></aside></div></section>'+
 '<datalist id="myIngredientSuggestions">'+[...new Set(['Gin','Sweet Vermouth','Dry Vermouth','Rum','Tequila','Mezcal','Vodka','Bourbon','Lime Juice','Lemon Juice','Simple Syrup','Cointreau',...Object.keys(art()?.known||{})])].map(x=>'<option value="'+safe(x)+'"></option>').join('')+'</datalist>');
 const form=$('#myEditorForm');
 $('#myAddIngredient')?.addEventListener('click',()=>{
   $('#myIngredientRows').insertAdjacentHTML('beforeend',row());
   $('#myIngredientRows').lastElementChild.querySelector('.my-ing-name')?.focus();
 });
 $('#myIngredientRows')?.addEventListener('click',e=>{
   if(!e.target.closest('.my-remove-row'))return;
   const all=form.querySelectorAll('[data-my-row]');
   if(all.length<=1){E.toast('Keep at least one ingredient row');return;}
   e.target.closest('[data-my-row]').remove();updatePreview();
 });
 form?.addEventListener('input',updatePreview);
 form?.addEventListener('submit',e=>{
   e.preventDefault();
   const fd=new FormData(form);
   const entry={id:id||undefined,name:fd.get('title'),glass:fd.get('glass'),garnish:fd.get('garnish'),method:fd.get('method'),notes:fd.get('notes'),parent:r.parent||null,ingredients:gather(form)};
   const error=$('#myFormError');error.hidden=true;
   try{
     const item=db().save(entry);
     E.toast('Saved to My Recipes');
     location.hash=itemUrl(item.id);
   }catch(ex){error.hidden=false;error.textContent=ex.message;error.scrollIntoView({block:'nearest',behavior:'smooth'});}
 });
}
function detail(id){
 const r=db().get(id);
 if(!r){list();E.toast('Recipe not found');return;}
 document.title=r.name+' · My Recipes · Cocktail Atlas';
 const parts=r.ingredients.map(i=>({...i,grams:null,category:'Ingredient'}));
 const rForSteps={book:'my',name:r.name,method:r.method,glass:r.glass,ingredients:parts};
 let servings=1;
 const steps=()=>{
   const rows=[...parts];
   if(r.glass)rows.push({name:r.glass,amount:'',role:'glass'});
   return rows.map((i,idx)=>{
     const isGlass=i.role==='glass',amount=E.scaleAmount(i.amount,servings,i);
     return '<div class="step"><div class="step-number">'+String(idx+1).padStart(2,'0')+'</div><div class="step-icon"><img src="'+safe(isGlass?E.glassImg(i.name):E.ingImg(i.name))+'" '+(isGlass?'':E.bottleImageAttrs(i.name,'t'))+' alt="" loading="lazy" onerror="this.onerror=null;this.src=window.IngredientArt?.fallback||\'\'"></div><div class="step-main"><div class="step-role">'+safe(i.role==='glass'?'glass':i.role==='garnish'?'garnish':'add')+'</div><div class="step-name">'+safe(i.name)+'</div><div class="step-cat">'+(isGlass?'Glassware':r.kind==='version'?'Personal version':'My recipe')+'</div></div><div class="step-amount"><strong>'+safe(isGlass?'':amount)+'</strong><small>'+safe(isGlass?'Glass':i.role==='garnish'?'Garnish':'Measure')+'</small></div></div>';
   }).join('');
 };
 E.set('<section class="wrap blk my-detail" style="border-top:0;padding-top:25px"><div class="recipe"><div class="rmain"><div class="crumb"><a href="#/my-recipes">My Recipes</a> / '+safe(r.name)+'</div><h1>'+safe(r.name)+'</h1><p class="pdesc">'+(r.parent?'MY VERSION · Based on <a class="inline-link" href="'+sourceLink(r.parent)+'">'+safe(r.parent.name)+'</a>':'MY ORIGINAL RECIPE')+'</p>'+
 '<div class="ingredient-hero ingstrip" aria-label="Your selected bottle illustrations">'+r.ingredients.slice(0,12).map(i=>'<div class="ingredient-bottle"><div class="isi"><img class="isc" src="'+safe(E.bottleCutout(i.name))+'" alt="'+safe(i.name)+'" '+E.bottleImageAttrs(i.name,'tc')+' onerror="this.onerror=null;this.src=window.IngredientArt?.fallback||\'\'"><img class="isbig" src="'+safe(E.bottleZoom(i.name))+'" alt="" aria-hidden="true" '+E.bottleImageAttrs(i.name,'tz')+' onerror="this.style.display=\'none\'"></div>'+E.bottlePicker(i.name)+'</div>').join('')+'</div>'+
 '<div class="step-head"><h2>Ingredients & steps</h2><div class="stepper"><button id="myLess" type="button" aria-label="Fewer drinks">−</button><strong id="myServings">1 drink</strong><button id="myMore" type="button" aria-label="More drinks">+</button></div></div><div id="mySteps" class="steps">'+steps()+'</div>'+
 '<div class="method"><h3>Method</h3><p>'+safe(r.method)+'</p>'+(r.garnish?'<p><b>Garnish:</b> '+safe(r.garnish)+'</p>':'')+'</div>'+
 (r.notes?'<div class="my-notes"><h3>My tasting notes</h3><p>'+safe(r.notes)+'</p></div>':'')+
 '<div class="actionbar my-actions"><a class="my-primary" href="'+editUrl(r.id)+'">✎ Edit recipe</a><button type="button" id="myDuplicate" class="btn-outline">Duplicate</button><button type="button" id="myCopy" class="btn-outline">Copy recipe</button><button type="button" id="myGuided" class="btn-outline">Preview steps</button><button type="button" class="my-delete" id="myDelete">Delete</button></div><p class="measure-note">Your original volume and count measurements are preserved. Gram weights are not estimated.</p></div>'+
 '<aside class="aside"><div class="my-side-illustration"><div class="eye">MY COCKTAIL NOTEBOOK</div><div class="my-side-big">Made<br><em>by you.</em></div><div class="my-side-count">'+r.ingredients.length+' ingredients</div></div><div class="stat"><strong>'+safe(r.glass||'Your choice')+'</strong><span>Glassware</span></div><div class="creditbox">Saved in this browser<br>'+safe(new Date(r.updatedAt).toLocaleDateString())+'</div></aside></div></section>');
 function refresh(){ $('#mySteps').innerHTML=steps();$('#myServings').textContent=servings+' '+(servings===1?'drink':'drinks');}
 $('#myLess')?.addEventListener('click',()=>{if(servings>1){servings--;refresh();}});
 $('#myMore')?.addEventListener('click',()=>{if(servings<30){servings++;refresh();}});
 $('#myDuplicate')?.addEventListener('click',()=>{try{const copy=db().duplicate(id);location.hash=itemUrl(copy.id);E.toast('Copy created');}catch(ex){E.toast(ex.message);}});
 $('#myDelete')?.addEventListener('click',()=>{if(window.confirm('Delete "'+r.name+'"? This cannot be undone unless you have a backup.')){db().remove(id);location.hash='#/my-recipes';E.toast('Recipe deleted');}});
 $('#myCopy')?.addEventListener('click',async()=>{const text=r.name+'\n'+r.ingredients.map(i=>E.scaleAmount(i.amount,servings,i)+' '+i.name).join('\n')+'\n\n'+r.method+(r.garnish?'\nGarnish: '+r.garnish:'');try{await navigator.clipboard.writeText(text);E.toast('Recipe copied');}catch{E.toast('Clipboard unavailable');}});
 $('#myGuided')?.addEventListener('click',()=>E.previewScale({...rForSteps,book:'shakerrr'}));
}
function downloadBackup(){
 const contents=db().exportJSON();
 const blob=new Blob([contents],{type:'application/json'});
 const path=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=path;anchor.download='cocktail-atlas-my-recipes-'+new Date().toISOString().slice(0,10)+'.json';
 document.body.appendChild(anchor);anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(path),0);E.toast('Backup downloaded');
}
async function importBackup(event){
 const file=event.target.files?.[0];if(!file)return;
 try{
   if(file.size>3500000)throw Error('Backup is too large.');
   const text=await file.text();
   const mode=window.confirm('Import recipes and keep your existing ones?\n\nOK = Merge. Cancel = Review replacement options later.');
   if(!mode)return;
   const count=db().importJSON(text,'merge');
   E.toast('Imported '+count+' recipes');list();
 }catch(ex){E.toast(ex.message);}
}
window.MyRecipesUI={init,list,editor,detail,card,itemUrl};
})();
