/* Cocktail Atlas: personal wines from a supplied tasting list.
   No changes to original wine styles, supplier profiles, or cocktail recipes. */
(() => {
  'use strict';
  let cached = null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function load() {
    if(cached)return cached;
    const response = await fetch('./data/sommelier-tried-wines.json?v=20261103-photo-fix',{cache:'no-cache'});
    if(!response.ok)throw Error('Your personal wine collection is temporarily unavailable.');
    const data=await response.json();
    if(data?.schemaVersion!==1||!Array.isArray(data.wines))throw Error('Invalid personal wine collection.');
    cached=data.wines;
    return cached;
  }
  function photoFailed(img) {
    if(!img)return;
    let sources=[];
    try{sources=JSON.parse(decodeURIComponent(img.dataset.photoSources||''));}catch{}
    const next=Number(img.dataset.photoIndex||0)+1;
    if(next<sources.length){img.dataset.photoIndex=String(next);img.src=sources[next];return;}
    img.onerror=null;
    img.hidden=true;
    if(img.nextElementSibling)img.nextElementSibling.hidden=false;
  }
  function photo(w) {
    const alt='Photo of '+w.producer+' '+w.wine+' bottle';
    const sources=[w.imageUrl,...(Array.isArray(w.imageAlternates)?w.imageAlternates:[])].filter(x=>typeof x==='string'&&x.startsWith('https://'));
    return '<div class="somm-tried-image">'+
      '<img src="'+esc(sources[0]||'')+'" alt="'+esc(alt)+'" loading="lazy" decoding="async" data-photo-sources="'+esc(encodeURIComponent(JSON.stringify(sources)))+'" data-photo-index="0" onerror="window.SommelierTried?.photoFailed(this)">'+
      '<div class="somm-tried-image-missing" hidden>Photo unavailable<br><small>Open photo source below</small></div>'+
      '</div>';
  }
  function card(w) {
    return '<a class="somm-producer-card somm-tried-card" href="#/sommelier/tried/'+encodeURIComponent(w.id)+'">'+
      '<div class="somm-producer-photo">'+photo(w)+'</div>'+
      '<div class="somm-producer-text"><div class="eye">'+esc(w.wineType)+' · '+esc(w.country)+'</div>'+
      '<h3>'+esc(w.producer)+'</h3><strong>'+esc(w.wine)+'</strong>'+
      '<small>'+esc(w.referenceVintage)+'</small><p>'+w.flavors.slice(0,3).map(esc).join(' · ')+'</p>'+
      '<span>See tasting notes →</span></div></a>';
  }
  function featured(wines) {
    if(!wines.length)return '';
    return '<section class="somm-tried-section" aria-label="Wines I have tried">'+
      '<div class="somm-producer-section-head"><div><div class="eye">MY WINE JOURNAL</div>'+
      '<h2>Wines I’ve Tried.</h2>'+
      '<p>Real bottles from your wine list, with the original descriptions and added sommelier guidance.</p></div>'+
      '<span class="somm-bottle-count">'+wines.length+' bottles</span></div>'+
      '<div class="somm-producer-grid">'+wines.map(card).join('')+'</div>'+
      '<p class="somm-producer-caveat">These are the wines recorded in your list. Where the exact label year could not be confirmed, the wine page says so. Food pairings are suggestions, not quotes from your list.</p>'+
      '</section>';
  }
  function info(title,value) {
    return '<div class="somm-detail-section"><h3>'+esc(title)+'</h3><p>'+esc(value)+'</p></div>';
  }
  function detail(w,set) {
    document.title=w.wine+' · Wines I’ve Tried · Cocktail Atlas';
    set('<section class="wrap phead somm-head">'+
      '<div class="crumb"><a href="#/">Home</a> / <a href="#/sommelier">Sommelier</a> / Wines I’ve Tried</div>'+
      '<h1>'+esc(w.producer)+'</h1>'+
      '<p class="pdesc">'+esc(w.wine)+' · '+esc(w.referenceVintage)+'</p></section>'+
      '<section class="wrap blk somm-detail somm-tried-detail" style="border-top:0;padding-top:0"><div class="somm-detail-grid">'+
      '<div class="somm-detail-art somm-tried-photo">'+photo(w)+
      '<div class="somm-art-caption">'+esc(w.imageVintageNote)+'</div></div>'+
      '<div class="somm-detail-copy">'+
      '<div class="somm-eyebrow">WINES I’VE TRIED · '+esc(w.country)+' · '+esc(w.wineType.toUpperCase())+'</div>'+
      '<h2>'+esc(w.wine)+'</h2><p class="somm-lead">'+esc(w.intro)+'</p>'+
      '<div class="somm-producer-meta">'+
      '<div><span>REFERENCE</span><strong>'+esc(w.referenceVintage)+'</strong></div>'+
      '<div><span>REGION</span><strong>'+esc(w.region)+'</strong></div>'+
      '<div><span>GRAPE(S)</span><strong>'+esc(w.grape)+'</strong></div>'+
      '</div><div class="somm-producer-flavors">'+w.flavors.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>'+
      '<div class="somm-tried-original"><div class="eye">FROM YOUR WINE LIST</div><p>'+esc(w.personalNote)+'</p></div>'+
      '<div class="eye somm-tried-section-label">SOMMELIER NOTES</div>'+
      info('On the nose',w.nose)+info('On the palate',w.palate)+info('Finish',w.finish)+
      '<div class="somm-producer-structure">'+
      '<div><b>'+esc(w.body)+'</b><span>Body</span></div>'+
      '<div><b>'+esc(w.acidity)+'</b><span>Acidity</span></div>'+
      '<div><b>'+esc(w.tannins)+'</b><span>Tannin</span></div>'+
      '<div><b>'+esc(w.sweetness)+'</b><span>Sweetness</span></div></div>'+
      '<div class="somm-detail-section"><h3>Food pairings</h3><div class="somm-foods">'+w.food.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>'+
      '<p class="somm-pairing-basis">'+esc(w.pairingBasis)+'</p></div>'+
      info('Serving',w.serve+' · '+w.aeration)+
      '<div class="somm-producer-sources"><strong>Wine identification & photo sources</strong>'+
      '<a target="_blank" rel="noopener noreferrer" href="'+esc(w.producerSource)+'">Wine details: '+esc(w.sourceLabel)+' ↗</a>'+
      '<a target="_blank" rel="noopener noreferrer" href="'+esc(w.imageSource)+'">View original bottle photograph ↗</a>'+
      '<p>'+esc(w.vintageNote)+'</p></div>'+
      '<p><a class="inline-link" href="#/sommelier">← All Sommelier wines</a></p>'+
      '</div></div></section>');
  }
  window.SommelierTried={load,photo,photoFailed,card,featured,detail};
})();