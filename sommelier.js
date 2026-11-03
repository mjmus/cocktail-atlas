/* Self-contained Cocktail Atlas Sommelier guide. No changes to the cocktail data model. */
(() => {
'use strict';
let cache=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>String(v||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
const types=['All','Red','White','Rosé','Sparkling','Dessert','Fortified'];
const palette={Red:{glass:'#501b34',wine:'#77203c',tint:'#f1e6e9'},White:{glass:'#b6a45b',wine:'#dfcb7a',tint:'#f7f2df'},'Rosé':{glass:'#d57779',wine:'#dc8990',tint:'#fbebea'},Sparkling:{glass:'#b5a06e',wine:'#efe0aa',tint:'#f6f1e2'},Dessert:{glass:'#b68025',wine:'#dea13d',tint:'#fbf0d7'},Fortified:{glass:'#51213c',wine:'#8c3955',tint:'#f2e4e9'}};
async function load(){
 if(cache)return cache;
 const response=await fetch('./data/sommelier-wines.json?v=20261102-photo-fix-2',{cache:'no-cache'});
 if(!response.ok)throw Error('Sommelier guide could not load.');
 const data=await response.json();
 if(!Array.isArray(data.wines))throw Error('Invalid wine guide.');
 cache=data.wines;
 return cache;
}
function bottle(w){
 const colors=palette[w.type]||palette.Red, id=w.id.replace(/[^a-z0-9-]/g,'');
 const type=esc(w.type.toUpperCase()),name=esc(w.grape.split(' / ')[0].split(' (')[0].slice(0,19).toUpperCase());
 return '<svg class="somm-bottle" role="img" aria-label="Original illustrated '+esc(w.name)+' wine bottle; not a specific producer" viewBox="0 0 240 340" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wine-'+id+'" x1="0" x2="1"><stop stop-color="#211d1a"/><stop offset=".22" stop-color="'+colors.glass+'"/><stop offset=".58" stop-color="'+colors.wine+'"/><stop offset="1" stop-color="#211d1a"/></linearGradient></defs><ellipse cx="120" cy="317" rx="72" ry="12" fill="#b4aaa0" opacity=".2"/><path d="M106 12h28l-3 97c0 18 33 38 33 61v125c0 15-14 20-44 20s-44-5-44-20V170c0-23 33-43 33-61z" fill="url(#wine-'+id+')" stroke="#332b29" stroke-width="2"/><path d="M110 18h5v93c0 18-24 39-24 58v119" fill="none" stroke="#fff" stroke-opacity=".26" stroke-width="5" stroke-linecap="round"/><rect x="106" y="12" width="28" height="57" rx="2" fill="#1c1817"/><rect x="84" y="180" width="72" height="88" rx="4" fill="#f7f0e2" stroke="#d1c6ad"/><text x="120" y="199" font-family="Georgia,serif" font-size="7.8" text-anchor="middle" fill="#ad7756">COCKTAIL ATLAS</text><path d="M94 208h52" stroke="#b1a289"/><text x="120" y="223" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#453c34">'+type+'</text><text x="120" y="243" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#554a40">'+name+'</text><path d="M96 252h48" stroke="#b1a289"/><text x="120" y="263" text-anchor="middle" font-family="Arial" font-size="6.6" fill="#6f6359">STYLE ILLUSTRATION</text></svg>';
}
function photoCandidates(w){
  const e=w.example;
  if(!e?.imageUrl)return [];
  const original=[e.imageUrl,...(Array.isArray(e.imageAlternates)?e.imageAlternates:[])];
  // A neutral image-proxy URL is a secondary option for browsers blocking retailer hotlinks.
  const proxy='https://wsrv.nl/?url='+encodeURIComponent(e.imageUrl.replace(/^https?:\/\//,''))+'&w=700&output=webp';
  return [...new Set([...original,proxy])].filter(x=>/^https:\/\//.test(x));
}
function photoFailed(img){
  if(!img)return;
  const frame=img.closest('.somm-bottle-frame');
  if(!frame)return;
  let sources=[];
  try{sources=JSON.parse(decodeURIComponent(img.dataset.photoSources||''))}catch{}
  const i=Number(img.dataset.photoIndex||0)+1;
  if(i<sources.length){
    img.dataset.photoIndex=String(i);
    img.src=sources[i];
    return;
  }
  img.onerror=null;
  img.remove();
  frame.classList.add('is-fallback');
}
function bottleWithPhoto(w) {
  const e=w.example,photos=photoCandidates(w);
  if(!photos.length)return '<div class="somm-bottle-frame is-fallback">'+bottle(w)+'</div>';
  const name=e.brand+' '+e.wine;
  // Keep the original vector hidden until *every* real photo source has failed.
  // It must never appear underneath a still-loading product photograph.
  return '<div class="somm-bottle-frame">'+bottle(w)+
    '<img class="somm-real-bottle" src="'+esc(photos[0])+'" alt="Photograph of '+esc(name)+' bottle" loading="lazy" decoding="async" data-photo-sources="'+esc(encodeURIComponent(JSON.stringify(photos)))+'" data-photo-index="0" onerror="window.Sommelier?.photoFailed(this)">'+
    '</div>';
}
function stat(label,value,max=5){
 return '<div class="somm-score"><span>'+esc(label)+'</span><div class="somm-score-track" role="img" aria-label="'+esc(label)+' '+value+' of '+max+'"><i style="width:'+(value/max*100)+'%"></i></div><b>'+value+'/'+max+'</b></div>';
}
function card(w){
 const example=w.example;
 return '<a class="somm-card" href="#/sommelier/wine/'+encodeURIComponent(w.id)+'"><div class="somm-card-art" style="background:'+(w.example?.imageUrl?'#fff':palette[w.type].tint)+'">'+bottleWithPhoto(w)+'</div><div class="somm-card-copy"><div class="eye">'+esc(w.type)+' / '+esc(w.country)+'</div><h3>'+esc(w.name)+'</h3><div class="somm-card-brand">'+(example?'Example: '+esc(example.brand):'Wine style')+'</div><p>'+esc(w.aromas)+'</p><span>Explore this wine →</span></div></a>';
}
function pageHead(title,desc){
 return '<section class="wrap phead somm-head"><div class="crumb"><a href="#/">Home</a> / <a href="#/sommelier">Sommelier</a></div><h1>'+esc(title)+'</h1><p class="pdesc">'+esc(desc)+'</p></section>';
}
function detail(w,set){
 document.title=w.name+' · Sommelier · Cocktail Atlas';
 set(pageHead(w.name,w.country+' · '+w.region)+
 '<section class="wrap blk somm-detail" style="border-top:0;padding-top:0"><div class="somm-detail-grid"><div class="somm-detail-art" style="background:'+(w.example?.imageUrl?'#fff':palette[w.type].tint)+'">'+bottleWithPhoto(w)+'<div class="somm-art-caption">Representative bottle · actual label and vintage may differ</div></div><div class="somm-detail-copy"><div class="somm-eyebrow">'+esc(w.type)+' WINE · '+esc(w.country)+'</div><div class="somm-producer-example"><span>FEATURED PRODUCER EXAMPLE</span><strong>'+esc(w.example?.brand||'Wine style')+'</strong><div>'+esc(w.example?.wine||'')+'</div>'+(w.example?.sourceUrl?'<a href="'+esc(w.example.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Bottle photo: '+esc(w.example.imageCredit||'Source')+' ↗</a>':'')+'</div><h2>'+esc(w.grape)+'</h2><p class="somm-lead">'+esc(w.character)+'</p><div class="somm-statrow"><div><strong>'+esc(w.body)+'</strong><span>Body</span></div><div><strong>'+esc(w.serve)+'</strong><span>Serve at</span></div></div><div class="somm-scores">'+stat('Acidity',w.acidity)+stat('Tannin',w.tannin)+stat('Sweetness',w.sweetness)+'</div><div class="somm-detail-section"><h3>What you might taste</h3><p>'+esc(w.aromas)+'.</p></div><div class="somm-detail-section"><h3>What to eat with it</h3>'+window.SommelierPairings.render(w.food)+'</div><div class="somm-detail-section"><h3>Sommelier serving note</h3><p>'+esc(w.service)+'</p></div><div class="somm-detail-section"><h3>Where it comes from</h3><p>'+esc(w.region)+' · '+esc(w.country)+'</p></div><p class="somm-disclaimer">The tasting and pairing profile describes the wine style, not a verified tasting of the pictured producer or vintage. Images are third-party product references, not endorsements.</p><a class="inline-link" href="#/sommelier">← Explore more wines</a></div></div></section>');
}
function list(wines,set,bottles=[],tried=[]){
 document.title='Sommelier · Cocktail Atlas';
 set(pageHead('Sommelier','A single library of real wine bottles, tasting notes and food pairings.')+
 '<section class="wrap blk somm-list" style="border-top:0;padding-top:8px"><div class="somm-intro"><div><div class="eye">YOUR WINE GUIDE</div><h2>A little knowledge makes every glass better.</h2><p>Explore real wines from producers around the world, with tasting notes, food pairings and serving advice. Learn wine styles below.</p></div><div class="somm-intro-stamp">'+(bottles.length+tried.length)+'<span>REAL<br>BOTTLES</span></div></div>'+(bottles.length||tried.length?window.SommelierBottles.featured(bottles,wines,tried):'')+'<div class="somm-style-section-heading"><div class="eye">02 / WINE STYLES</div><h2>Explore by grape and style.</h2><p>The original wine-style guide remains available below.</p></div><div class="somm-tools"><div class="somm-tabs" aria-label="Filter wine styles">'+types.map((x,i)=>'<button type="button" data-wine-type="'+esc(x)+'" class="'+(i===0?'selected':'')+'">'+esc(x)+'</button>').join('')+'</div><label class="somm-search">Find a grape, region or food <input id="sommSearch" type="search" placeholder="Try seafood, Nebbiolo, Caymus…" autocomplete="off"></label></div><div class="somm-count" id="sommCount">25 wine styles</div><div class="somm-grid" id="sommGrid">'+wines.map(card).join('')+'</div><p class="somm-disclaimer">Bottle images link to credited third-party product photographs. Producers are representative examples, not endorsements. Vintages and labels may vary. The original illustrations remain as missing-image fallbacks.</p></section>');
 window.SommelierBottles?.bindCatalog(bottles,wines,tried);
 let active='All',q='';
 function filter(){
   const filtered=wines.filter(w=>(active==='All'||w.type===active)&&normalize([w.name,w.type,w.grape,w.region,w.country,w.aromas,w.character,w.example?.brand,w.example?.wine,...w.food].join(' ')).includes(normalize(q)));
   document.querySelector('#sommGrid').innerHTML=filtered.length?filtered.map(card).join(''):'<div class="somm-no-results">No wines match. Try another grape or food.</div>';
   document.querySelector('#sommCount').textContent=filtered.length+' wine '+(filtered.length===1?'style':'styles');
 }
 document.querySelectorAll('[data-wine-type]').forEach(btn=>btn.addEventListener('click',()=>{
   active=btn.dataset.wineType;
   document.querySelectorAll('[data-wine-type]').forEach(x=>x.classList.toggle('selected',x.dataset.wineType===active));
   filter();
 }));
 document.querySelector('#sommSearch')?.addEventListener('input',e=>{q=e.target.value;filter()});
}
async function page(parts,set,isCurrent){
 const wines=await load();
 if(typeof isCurrent==='function'&&!isCurrent())return;
 if(parts?.[1]==='tried'&&parts?.[2]){
   let journal=[];
   try{journal=await window.SommelierTried?.loadCatalog()||[];}catch{}
   if(typeof isCurrent==='function'&&!isCurrent())return;
   const entry=journal.find(w=>w.id===parts[2]);
   if(entry)return window.SommelierTried.detail(entry,set);
   set(pageHead('Wine not found','This wine is not in your journal.')+
    '<section class="wrap blk"><a href="#/sommelier" class="inline-link">Browse Sommelier →</a></section>');
   return;
 }
 if(parts?.[1]==='bottle'&&parts?.[2]){
   let individual=[];
   try { individual=await window.SommelierBottles?.load()||[]; } catch {}
   if(typeof isCurrent==='function'&&!isCurrent())return;
   const found=individual.find(x=>x.id===parts[2]);
   if(found)return window.SommelierBottles.detail(found,wines,set);
   let journal=[];
   try{journal=await window.SommelierTried?.loadCatalog()||[];}catch{}
   if(typeof isCurrent==='function'&&!isCurrent())return;
   const personal=journal.find(x=>x.id===parts[2]);
   if(personal)return window.SommelierTried.detail(personal,set);
   set(pageHead('Bottle not found','This individual wine is not available yet.')+
     '<section class="wrap blk"><a class="inline-link" href="#/sommelier">Browse the wine guide →</a></section>');
   return;
 }
 if(parts?.[1]==='wine'&&parts?.[2]){
   const wine=wines.find(w=>w.id===parts[2]);if(wine)return detail(wine,set);
   set(pageHead('Wine not found','This wine is not in the guide yet.')+'<section class="wrap blk"><a class="inline-link" href="#/sommelier">Browse the guide →</a></section>');return;
 }
 let individual=[],journal=[];
 try {individual=await window.SommelierBottles?.load()||[];} catch {}
 try {journal=await window.SommelierTried?.loadCatalog()||[];} catch {}
 if(typeof isCurrent==='function'&&!isCurrent())return;
 list(wines,set,individual,journal);
}
window.Sommelier={page,bottle,bottleWithPhoto,photoCandidates,photoFailed,stat,load,types};
})();
