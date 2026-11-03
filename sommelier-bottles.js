/* Individual winery-supported bottles within the Sommelier guide.
   Independent of cocktail catalogs and the existing wine-style library. */
(() => {
  'use strict';
  let cache = null;
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function load() {
    if(cache)return cache;
    const response = await fetch('./data/sommelier-producer-bottles.json?v=20261103-batch02',{cache:'no-cache'});
    if(!response.ok)throw Error('Individual wine profiles are unavailable.');
    const data=await response.json();
    if(data?.schemaVersion!==1||!Array.isArray(data.bottles))throw Error('Invalid individual wine profiles.');
    cache=data.bottles;
    return cache;
  }
  function findStyle(b,styles) {
    return styles.find(w=>w.id===b.styleId)||null;
  }
  function image(b,styles) {
    const parent=findStyle(b,styles);
    return parent ? window.Sommelier.bottleWithPhoto(parent) : '';
  }
  function card(b,styles) {
    const style=findStyle(b,styles);
    if(!style)return '';
    return '<a class="somm-producer-card" href="#/sommelier/bottle/'+encodeURIComponent(b.id)+'">'+
      '<div class="somm-producer-photo">'+image(b,styles)+'</div>'+
      '<div class="somm-producer-text"><div class="eye">'+esc(style.type)+' · '+esc(b.country)+'</div>'+
      '<h3>'+esc(b.producer)+'</h3><strong>'+esc(b.wine)+'</strong>'+
      '<small>'+esc(b.referenceVintage)+'</small><p>'+esc(b.flavors.slice(0,3).join(' · '))+'</p>'+
      '<span>Explore this bottle →</span></div></a>';
  }
  // One alphabetic catalog for *all* real individual bottles.
  // The two existing source files and detail routes remain intact.
  const categories=['All','Red','White','Rosé','Orange','Sparkling','Dessert / Fortified'];
  const normalize=text=>String(text||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function category(type) {
    const t=normalize(type);
    if(t.includes('sparkling')||t.includes('frizzante'))return 'Sparkling';
    if(t.includes('orange')||t.includes('skin-contact white'))return 'Orange';
    if(t.includes('rose')||t.includes('rosé'))return 'Rosé';
    if(t.includes('dessert')||t.includes('fortified')||t.includes('port'))return 'Dessert / Fortified';
    if(t.includes('red'))return 'Red';
    return 'White';
  }
  function catalogEntries(bottles,styles,tried=[]) {
    const byId=new Map(styles.map(w=>[w.id,w]));
    const first=bottles.filter(b=>byId.has(b.styleId)).map(b=>{
      const style=byId.get(b.styleId);
      return {id:b.id,producer:b.producer,wine:b.wine,
        kind:'producer',item:b,type:category(style.type),
        search:normalize([b.producer,b.wine,b.referenceVintage,b.country,b.region,b.grape,style.type,...(b.flavors||[]),...(b.food||[])].join(' '))};
    });
    const second=tried.map(w=>({
      id:w.id,producer:w.producer,wine:w.wine,
      kind:'journal',item:w,type:category(w.wineType),
      search:normalize([w.producer,w.wine,w.referenceVintage,w.country,w.region,w.grape,w.wineType,...(w.flavors||[]),...(w.food||[])].join(' '))}));
    return [...first,...second].sort((a,b)=>a.producer.localeCompare(b.producer,'en',{sensitivity:'base'})||
      a.wine.localeCompare(b.wine,'en',{sensitivity:'base'}));
  }
  function catalogMatches(entries,active='All',query='') {
    const needle=normalize(query.trim());
    return entries.filter(x=>(active==='All'||x.type===active)&&(!needle||x.search.includes(needle)));
  }
  function catalogCards(entries,styles) {
    return entries.map(x=>x.kind==='producer'?card(x.item,styles):window.SommelierTried.card(x.item)).join('');
  }
  function featured(bottles,styles,tried=[]) {
    const entries=catalogEntries(bottles,styles,tried);
    if(!entries.length)return '';
    return '<section class="somm-featured-bottles" aria-label="Explore individual wine bottles">'+
      '<div class="somm-producer-section-head"><div><div class="eye">01 / INDIVIDUAL WINES</div><h2>Explore real bottles.</h2>'+
      '<p>Real wine labels with tasting notes, grapes, regions, serving suggestions and food pairings. Browse every bottle together.</p></div>'+
      '<span class="somm-bottle-count">'+entries.length+' wines</span></div>'+
      '<div class="somm-catalog-tools"><div class="somm-tabs somm-catalog-tabs" aria-label="Filter individual wine bottles">'+
      categories.map((x,i)=>'<button type="button" data-somm-catalog-filter="'+esc(x)+'" class="'+(i===0?'selected':'')+'">'+esc(x)+'</button>').join('')+
      '</div><label class="somm-search somm-catalog-search">Find a wine, grape, place or pairing'+
      '<input id="sommCatalogSearch" type="search" placeholder="Try Pinot Noir, Italy, seafood…" autocomplete="off"></label></div>'+
      '<div class="somm-count" id="sommCatalogCount">'+entries.length+' bottles</div>'+
      '<div class="somm-producer-grid" id="sommCatalogGrid">'+catalogCards(entries,styles)+'</div>'+
      '<p class="somm-producer-caveat">Bottles are listed alphabetically. Photographs can show different label vintages. Open any wine for detailed tasting and food-pairing notes.</p>'+
      '</section>';
  }
  function bindCatalog(bottles,styles,tried=[]) {
    const grid=document.querySelector('#sommCatalogGrid');
    if(!grid)return;
    const count=document.querySelector('#sommCatalogCount');
    const entries=catalogEntries(bottles,styles,tried);
    let active='All',query='';
    function draw(){
      const matches=catalogMatches(entries,active,query);
      grid.innerHTML=matches.length?catalogCards(matches,styles):
        '<p class="somm-no-results">No matching wines. Try another grape, region or food.</p>';
      if(count)count.textContent=matches.length+' of '+entries.length+' bottles';
    }
    document.querySelectorAll('[data-somm-catalog-filter]').forEach(button=>
      button.addEventListener('click',()=>{
        active=button.dataset.sommCatalogFilter;
        document.querySelectorAll('[data-somm-catalog-filter]').forEach(b=>
          b.classList.toggle('selected',b.dataset.sommCatalogFilter===active));
        draw();
      }));
    document.querySelector('#sommCatalogSearch')?.addEventListener('input',event=>{
      query=event.target.value||'';
      draw();
    });
  }
  function section(title,body) {
    return '<div class="somm-detail-section"><h3>'+esc(title)+'</h3><p>'+esc(body)+'</p></div>';
  }
  function detail(b,styles,set) {
    const style=findStyle(b,styles);
    if(!style)return set('<section class="wrap blk"><h1>Wine not found</h1><a href="#/sommelier">Back to Sommelier</a></section>');
    document.title=b.producer+' '+b.wine+' · Cocktail Atlas Sommelier';
    const brandSource=style.example;
    set('<section class="wrap phead somm-head"><div class="crumb"><a href="#/">Home</a> / <a href="#/sommelier">Sommelier</a> / '+esc(b.producer)+'</div>'+
      '<h1>'+esc(b.producer)+'</h1><p class="pdesc">'+esc(b.wine)+' · '+esc(b.referenceVintage)+'</p></section>'+
      '<section class="wrap blk somm-detail somm-producer-detail" style="border-top:0;padding-top:0">'+
      '<div class="somm-detail-grid"><div class="somm-detail-art somm-specific-bottle-art">'+image(b,styles)+
      '<div class="somm-art-caption">Real product bottle photograph · displayed vintage may differ from the tasting reference</div></div>'+
      '<div class="somm-detail-copy"><div class="somm-eyebrow">INDIVIDUAL WINE PROFILE · '+esc(b.country)+'</div>'+
      '<h2>'+esc(b.wine)+'</h2><p class="somm-lead">'+esc(b.intro)+'</p>'+
      '<div class="somm-producer-meta"><div><span>REFERENCE</span><strong>'+esc(b.referenceVintage)+'</strong></div>'+
      '<div><span>REGION</span><strong>'+esc(b.region)+'</strong></div>'+
      '<div><span>GRAPE</span><strong>'+esc(b.grape)+'</strong></div></div>'+
      '<div class="somm-producer-flavors">'+b.flavors.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>'+
      section('On the nose',b.nose)+section('On the palate',b.palate)+section('Finish',b.finish)+
      '<div class="somm-producer-structure"><div><b>'+esc(b.body)+'</b><span>Body</span></div>'+
      '<div><b>'+esc(b.acidity)+'</b><span>Acidity</span></div>'+
      '<div><b>'+esc(b.tannins)+'</b><span>Tannins</span></div>'+
      '<div><b>'+esc(b.sweetness)+'</b><span>Sweetness</span></div></div>'+
      '<div class="somm-detail-section"><h3>Food pairings</h3><div class="somm-foods">'+b.food.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>'+
      '<p class="somm-pairing-basis">'+esc(b.pairingBasis)+'</p></div>'+
      section('Serving',b.serve+' · '+b.aeration)+
      '<div class="somm-producer-sources"><strong>Tasting reference & bottle photo</strong>'+
      '<a href="'+esc(b.producerSource)+'" rel="noopener noreferrer" target="_blank">Read '+esc(b.sourceLabel)+' ↗</a>'+
      (brandSource?.sourceUrl?'<a href="'+esc(brandSource.sourceUrl)+'" rel="noopener noreferrer" target="_blank">View the real bottle photo source ↗</a>':'')+
      '<p>'+esc(b.vintageNote)+' Flavors are source-supported tasting descriptions, not a claim that every vintage tastes identical.</p></div>'+
      '<a class="inline-link" href="#/sommelier/wine/'+encodeURIComponent(style.id)+'">Explore '+esc(style.name)+' as a wine style →</a>'+
      '<p><a class="inline-link" href="#/sommelier">← All Sommelier wines</a></p>'+
      '</div></div></section>');
  }
  window.SommelierBottles={load,featured,bindCatalog,catalogEntries,catalogMatches,category,detail,card,findStyle};
})();