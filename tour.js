/* Original Cocktail Atlas animated tour. No third-party video, images, audio or embeds. */
(() => {
  'use strict';
  const chapters = [
    {eyebrow:'01 / DISCOVER',title:'Find your next favorite.',description:'Explore PDT, Death & Co and your Shakerrr collections in one home cocktail library.'},
    {eyebrow:'02 / INGREDIENTS',title:'Know what goes in.',description:'Read each ingredient and choose a bottle that suits your bar.'},
    {eyebrow:'03 / MEASURE',title:'Make one. Or make a round.',description:'Adjust the number of drinks and follow the measurements and steps.'},
    {eyebrow:'04 / KEEP',title:'Your home bar, organized.',description:'Save recipes you want to try, track what you have made, and keep your bar list handy.'}
  ];
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function bottle(color,label,extra) {
    return '<div class="at-bottle '+(extra||'')+'"><svg aria-hidden="true" viewBox="0 0 88 160" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="34" y="5" width="20" height="19" rx="3" fill="#292929"/><path d="M34 21H54V38C54 44 68 47 68 57V142C68 149 63 153 57 153H31C25 153 20 149 20 142V57C20 47 34 44 34 38V21Z" fill="'+color+'" stroke="#272727" stroke-width="2"/><path d="M30 55V139" stroke="#fff" stroke-opacity=".3" stroke-width="6" stroke-linecap="round"/><rect x="24" y="70" width="40" height="53" rx="3" fill="#FAF5E7"/><path d="M30 85H58M30 106H58" stroke="#BAAD99" stroke-width="2"/><text x="44" y="99" font-size="8" text-anchor="middle" font-family="Arial" font-weight="700" fill="#222">'+esc(label)+'</text></svg></div>';
  }
  const glass = '<div class="at-glass"><div class="at-glass-liquid"></div><i class="at-ice at-ice-one"></i><i class="at-ice at-ice-two"></i><span class="at-garnish"></span></div>';
  function scene(index) {
    if(index===0)return '<div class="at-scene at-discover"><div class="at-scene-heading"><span class="at-scene-kicker">YOUR COCKTAIL LIBRARY</span><strong>Choose your adventure</strong></div><div class="at-discover-grid"><div class="at-mini-book"><span>01</span><strong>PDT</strong><small>300 cocktails</small><i>↗</i></div><div class="at-mini-book"><span>02</span><strong>Death & Co</strong><small>500 cocktails</small><i>↗</i></div><div class="at-mini-book at-mini-active"><span>03</span><strong>Shakerrr</strong><small>407 cocktails</small><i>↗</i></div></div><div class="at-scene-note">Classic drinks, modern favorites, your own collection.</div></div>';
    if(index===1)return '<div class="at-scene at-ingredients"><div class="at-scene-heading"><span class="at-scene-kicker">A CLASSIC NEGRONI</span><strong>Three ingredients</strong></div><div class="at-bottle-line">'+bottle('#D3B699','GIN','at-delay-one')+bottle('#BB2029','CAMPARI','at-delay-two')+bottle('#8D443D','VERMOUTH','at-delay-three')+'</div><div class="at-ingredient-names"><span>Gin</span><span>Campari</span><span>Sweet vermouth</span></div><div class="at-scene-note">See what each recipe calls for.</div></div>';
    if(index===2)return '<div class="at-scene at-measure"><div class="at-measure-head"><span class="at-scene-kicker">NEGRONI / 1 DRINK</span><strong>Measure. Mix. Enjoy.</strong></div><div class="at-mixing-line"><div class="at-pour-bottle">'+bottle('#BB2029','CAMPARI')+'</div><div class="at-pour-stream"></div>'+glass+'<div class="at-measure-readout"><span>ADD</span><strong>1 oz</strong><small>Campari</small><div class="at-readout-track"><div></div></div><p>Gin · Campari · Vermouth</p></div></div><div class="at-scene-note">Recipe quantities, clearly explained.</div></div>';
    return '<div class="at-scene at-keep"><div class="at-scene-heading"><span class="at-scene-kicker">YOUR PERSONAL BAR</span><strong>Keep the good ones.</strong></div><div class="at-saved"><div class="at-saved-glass">'+glass+'</div><div class="at-saved-copy"><span>RECIPE SAVED</span><strong>Negroni</strong><small>♡ Wishlist → ♥ Saved</small><div class="at-saved-chips"><i>Made ✓</i><i>Your Bar ✓</i></div></div></div><div class="at-scene-note">Your favorites stay in this browser.</div></div>';
  }
  function hero() {
    return '<div class="at-teaser" aria-label="Original Cocktail Atlas animation preview"><div class="at-teaser-copy"><span class="at-teaser-label">COCKTAIL ATLAS / THE TOUR</span><div class="at-teaser-title">Your bar.<br><em>Your rules.</em></div><div class="at-teaser-sub">Discover · Measure · Make</div></div><div class="at-teaser-stage"><div class="at-teaser-bottle">'+bottle('#CB202A','CAMPARI')+'</div><div class="at-teaser-stream"></div>'+glass+'<div class="at-teaser-tally"><span>NEGRONI</span><strong>1 <small>oz</small></strong><div class="at-readout-track"><div></div></div></div></div><button type="button" class="at-teaser-play" data-atlas-tour-open aria-label="Play the original Cocktail Atlas animated tour"><span aria-hidden="true">▶</span> Watch our animated tour <span aria-hidden="true">↗</span></button></div>';
  }
  function modalMarkup() {
    return '<div class="at-tour-dialog" data-atlas-tour-dialog><div class="at-tour-top"><span class="at-tour-wordmark">Cocktail<span>Atlas</span></span><span class="at-tour-tag">AN ORIGINAL ANIMATED TOUR</span></div><div class="at-tour-main"><div class="at-tour-visual"><div class="at-tour-scene" data-atlas-tour-scene>'+scene(0)+'</div></div><div class="at-tour-narrative" aria-live="polite"><div class="at-tour-counter" data-atlas-tour-counter>01 / 04</div><div class="at-tour-eyebrow" data-atlas-tour-eyebrow>'+chapters[0].eyebrow+'</div><h2 data-atlas-tour-title>'+chapters[0].title+'</h2><p data-atlas-tour-description>'+chapters[0].description+'</p><div class="at-tour-dots" role="group" aria-label="Tour chapters">'+chapters.map((v,i)=>'<button type="button" data-atlas-tour-chapter="'+i+'" aria-label="Go to '+esc(v.eyebrow)+'" class="'+(i===0?'active':'')+'"></button>').join('')+'</div><div class="at-tour-controls"><button type="button" class="at-control at-control-prev" data-atlas-prev aria-label="Previous chapter">←</button><button type="button" class="at-control at-control-play" data-atlas-tour-toggle aria-label="Pause tour">Ⅱ Pause</button><button type="button" class="at-control at-control-next" data-atlas-next aria-label="Next chapter">Next →</button></div><div class="at-tour-footer">ILLUSTRATED FOR COCKTAIL ATLAS · NO VIDEO EMBEDS</div></div></div><div class="at-tour-progress"><span data-atlas-progress></span></div></div>';
  }
  function open(openModal) {
    if(typeof openModal!=='function')return;
    openModal(modalMarkup());
    const root=document.querySelector('[data-atlas-tour-dialog]');
    if(!root)return;
    let current=0;
    const reduced=Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    let playing=!reduced;
    let interval=null;
    function stopClock(){if(interval){clearInterval(interval);interval=null;}}
    function startClock(){
      stopClock();
      if(!playing)return;
      interval=setInterval(()=>{
        if(!root.isConnected){stopClock();return;}
        show((current+1)%chapters.length);
      },6200);
    }
    function show(i,reset=true) {
      current=(i+chapters.length)%chapters.length;
      const ch=chapters[current];
      root.querySelector('[data-atlas-tour-scene]').innerHTML=scene(current);
      root.querySelector('[data-atlas-tour-counter]').textContent=String(current+1).padStart(2,'0')+' / 04';
      root.querySelector('[data-atlas-tour-eyebrow]').textContent=ch.eyebrow;
      root.querySelector('[data-atlas-tour-title]').textContent=ch.title;
      root.querySelector('[data-atlas-tour-description]').textContent=ch.description;
      root.querySelector('[data-atlas-tour-toggle]').textContent=playing?'Ⅱ Pause':'▶ Play';
      root.querySelector('[data-atlas-tour-toggle]').setAttribute('aria-label',playing?'Pause tour':'Play tour');
      root.querySelector('[data-atlas-progress]').style.width=((current+1)/chapters.length*100)+'%';
      root.querySelectorAll('[data-atlas-tour-chapter]').forEach(b=>{
        const active=Number(b.dataset.atlasTourChapter)===current;
        b.classList.toggle('active',active);
        b.setAttribute('aria-current',active?'step':'false');
      });
      if(reset)startClock();
    }
    root.querySelector('[data-atlas-prev]').addEventListener('click',()=>show(current-1));
    root.querySelector('[data-atlas-next]').addEventListener('click',()=>show(current+1));
    root.querySelector('[data-atlas-tour-toggle]').addEventListener('click',()=>{
      playing=!playing;
      show(current);
    });
    root.querySelectorAll('[data-atlas-tour-chapter]').forEach(btn=>btn.addEventListener('click',()=>show(Number(btn.dataset.atlasTourChapter))));
    show(0);
  }
  window.CocktailAtlasTour={hero,modalMarkup,open,chapters};
})();
