/* Individual winery-supported bottles within the Sommelier guide.
   Independent of cocktail catalogs and the existing wine-style library. */
(() => {
  'use strict';
  let cache = null;
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function load() {
    if(cache)return cache;
    const response = await fetch('./data/sommelier-producer-bottles.json?v=20261103-batch01',{cache:'no-cache'});
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
  function featured(bottles,styles) {
    const cards=bottles.map(b=>card(b,styles)).filter(Boolean).join('');
    if(!cards)return '';
    return '<section class="somm-featured-bottles" aria-label="Individual wine bottle profiles">'+
      '<div class="somm-producer-section-head"><div><div class="eye">01 / SPECIFIC WINES</div><h2>Explore real bottles.</h2>'+
      '<p>Individual wines with producer-sourced tasting notes, original bottle photographs and food pairings.</p></div>'+
      '<span class="somm-bottle-count">'+bottles.length+' profiles</span></div>'+
      '<div class="somm-producer-grid">'+cards+'</div>'+
      '<p class="somm-producer-caveat">Tasting notes refer to the listed bottling or reference vintage. A linked bottle photograph may show a different label year.</p>'+
      '</section>';
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
      '<div class="somm-producer-sources"><strong>Producer notes & bottle photo</strong>'+
      '<a href="'+esc(b.producerSource)+'" rel="noopener noreferrer" target="_blank">Read '+esc(b.sourceLabel)+' ↗</a>'+
      (brandSource?.sourceUrl?'<a href="'+esc(brandSource.sourceUrl)+'" rel="noopener noreferrer" target="_blank">View the real bottle photo source ↗</a>':'')+
      '<p>'+esc(b.vintageNote)+' Flavors are source-supported tasting descriptions, not a claim that every vintage tastes identical.</p></div>'+
      '<a class="inline-link" href="#/sommelier/wine/'+encodeURIComponent(style.id)+'">Explore '+esc(style.name)+' as a wine style →</a>'+
      '<p><a class="inline-link" href="#/sommelier">← All Sommelier wines</a></p>'+
      '</div></div></section>');
  }
  window.SommelierBottles={load,featured,detail,findStyle};
})();