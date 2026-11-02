/* Cocktail Atlas image additions. Existing matched artwork and brand choices remain untouched. */
(() => {
'use strict';
const art=window.IngredientArt;if(!art)return;
const original=art.url.bind(art);
const clean=x=>String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const exact={
 'cinzano sweet vermouth':'https://cdn.shopify.com/s/files/1/0266/9992/3537/products/CinzanoVermouthRossoTransp_1024x1024.png?v=1669302945',
 'cinzano rosso':'https://cdn.shopify.com/s/files/1/0266/9992/3537/products/CinzanoVermouthRossoTransp_1024x1024.png?v=1669302945',
 'cinzano vermouth rosso':'https://cdn.shopify.com/s/files/1/0266/9992/3537/products/CinzanoVermouthRossoTransp_1024x1024.png?v=1669302945',
 'scrappy s cardamom bitters':'https://uploads-ssl.webflow.com/62c5a188e2198a60e6233605/62c5a188e2198a5b5e233711_cardamom.jpg',
 'scrappys cardamom bitters':'https://uploads-ssl.webflow.com/62c5a188e2198a60e6233605/62c5a188e2198a5b5e233711_cardamom.jpg'
};
const cardamom='./assets/original/cardamom-bitters.svg';
const palette={
 bitters:['#7f5025','#f6e8cf'],
 syrup:['#98683a','#f3e1c5'],
 juice:['#a54e50','#fae0da'],
 vermouth:['#763c4b','#f3e5e9'],
 liqueur:['#9b7432','#f6ebce'],
 garnish:['#5d8060','#eaf2df'],
 tincture:['#755546','#f2e8de'],
 ingredient:['#69767b','#e7efee']
};
function category(name){
 const n=clean(name);
 if(/cardamom.*bitters|bitters.*cardamom/.test(n))return 'cardamom';
 if(/\bbitters?\b/.test(n))return 'bitters';
 if(/\b(syrup|shrub|cordial|honey|molasses|grenadine)\b/.test(n))return 'syrup';
 if(/\b(juice|puree|fruit|pomegranate|grapefruit|lemon|lime|pineapple)\b/.test(n))return 'juice';
 if(/\bvermouth\b/.test(n))return 'vermouth';
 if(/\b(liqueur|amaro|aperitivo)\b/.test(n))return 'liqueur';
 if(/\b(twist|slice|wedge|sprig|mint|basil|leaf|peel|salt|pepper|egg|flower|berries|cherry)\b/.test(n))return 'garnish';
 if(/\b(infusion|tincture|essence)\b/.test(n))return 'tincture';
 return 'ingredient';
}
function safeLabel(name){
 const n=String(name||'').replace(/[&<>"']/g,'').replace(/\s+/g,' ').trim();
 return n.length>24?n.slice(0,22)+'…':n||'Ingredient';
}
function vector(name){
 const categoryName=category(name);
 if(categoryName==='cardamom')return cardamom;
 const [glass,label]=palette[categoryName]||palette.ingredient;
 const title=safeLabel(name).toUpperCase();
 const words=title.split(' '),mid=Math.ceil(words.length/2);
 const a=words.slice(0,mid).join(' '),b=words.slice(mid).join(' ');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280"><rect width="200" height="280" fill="#f8f8f5"/><ellipse cx="100" cy="258" rx="51" ry="8" fill="#d8d8d5"/><rect x="86" y="17" width="28" height="34" rx="4" fill="#39362e"/><path d="M85 50h30v27c0 9 28 15 28 33v122c0 14-10 20-24 20H81c-15 0-24-6-24-20V110c0-18 28-24 28-33z" fill="'+glass+'" stroke="#4c4e4c" stroke-width="3"/><path d="M72 110v120" stroke="#fff" stroke-opacity=".3" stroke-width="8"/><rect x="65" y="120" width="70" height="88" rx="4" fill="'+label+'" stroke="#d0c8b8"/><text x="100" y="146" font-family="Arial,sans-serif" font-size="9" fill="#49423c" text-anchor="middle">COCKTAIL ATLAS</text><path d="M76 154h48" stroke="#8b8178"/><text x="100" y="170" font-family="Arial,sans-serif" font-weight="bold" font-size="9" fill="#35302b" text-anchor="middle">'+a+'</text><text x="100" y="184" font-family="Arial,sans-serif" font-weight="bold" font-size="9" fill="#35302b" text-anchor="middle">'+b+'</text><path d="M76 192h48" stroke="#8b8178"/><text x="100" y="270" font-family="Arial" font-size="8" fill="#666" text-anchor="middle">CATEGORY ILLUSTRATION</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function isFallback(url){return typeof url==='string'&&url.startsWith('data:image/svg+xml');}
function upgraded(name,kind='t'){
 const n=clean(name);
 if(exact[n])return exact[n];
 const previous=original(name,kind);
 return isFallback(previous)?vector(name):previous;
}
art.url=upgraded;
art.categoryArt=vector;
art.brandOverrides=exact;
// A broken external bottle request gets a neutral illustration instead of a broken image.
window.addEventListener('error',e=>{
 const img=e.target;
 if(img?.tagName!=='IMG')return;
 const url=String(img.getAttribute('src')||'');
 if(!url.includes('cdn.shopify.com/s/files/1/0266/9992/3537/') && !url.includes('uploads-ssl.webflow.com/62c5a188e2198a60e6233605/'))return;
 img.onerror=null;
 img.src=vector(img.alt||'Ingredient');
 e.stopImmediatePropagation();
},true);
})();