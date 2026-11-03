/* Real food-photo matches for wine pairings. Images are sourced from Unsplash
   photo pages; no wine notes or named dishes are modified by this module. */
(() => {
 'use strict';
 const unsplash=(id,match,image,slug,label,backup)=>({id,matches:match,url:'https://images.unsplash.com/photo-'+image,source:'https://unsplash.com/photos/'+slug,label,backup});
 const photos=[
  unsplash('oysters',/\boysters?\b/i,'1729269524124-1645db0b0ff5','a-plate-of-oysters-with-lemon-wedges-and-a-box-of-oysters-TnZnJO4DSdQ','Oysters'),
  unsplash('sushi',/\bsushi\b|\bsashimi\b/i,'1736885978380-8d7d9f7d7880','a-variety-of-sushi-is-displayed-on-a-platter-eTMBxAvc9mc','Sushi'),
  unsplash('seafood-pasta',/\bseafood pasta\b|\bshrimp pasta\b|\bprawn pasta\b|\bcrab spaghetti\b/i,'1655279561980-c72226ffe505','a-plate-of-food-GXFZjf6B2Hc','Seafood pasta',{url:'https://images.unsplash.com/photo-1760390952355-a6b9cf50a7a2',source:'https://unsplash.com/photos/a-plate-of-pasta-with-sauce-and-toppings-hSU3YyEZ62c'}),
  unsplash('empanadas',/\bempanadas?\b/i,'1667450722909-68bce7072fec','a-plate-of-food-AW2Ybe3YjEk','Empanadas'),
  unsplash('lamb',/\b(grilled|roast|slow-cooked|braised)\s+lamb\b|\blamb chops?\b|\black of lamb\b|\blamb kebab\b/i,'1768849352371-24837caf2179','chef-plates-grilled-lamb-chops-with-couscous-and-garnish-JYn7ac7HwHM','Lamb dish',{url:'https://images.unsplash.com/photo-1766589152655-38614ce97fce',source:'https://unsplash.com/photos/grilled-lamb-chops-and-sausages-with-onion-rings-MbmU17UMkns'}),
  unsplash('steak',/\bribeye\b|\bbeef steak\b|\b(grilled|pepper)\s+steak\b|\bsirloin\b|\basado\b/i,'1563027221-46c272407e95','food-photography-of-cooked-steak-fyMhLq9ckoQ','Steak'),
  unsplash('charcuterie',/\bcharcuterie\b|\bsalumi\b|\bprosciutto\b|\bmortadella\b|\bcured (ham|meats?)\b|\bsmoked meats\b/i,'1758972573607-509448e9f3e4','charcuterie-board-with-cured-meats-cheese-and-pickles-EK9FWSXIS3k','Charcuterie'),
  unsplash('scallops',/\bscallops?\b/i,'1587116861219-230ac19df971','cooked-food-on-white-ceramic-plate-uO4R-Xn3KwE','Scallops'),
  unsplash('salmon',/\bsalmon\b|\bgravlax\b/i,'1758157836016-3f3fbc5bf796','grilled-salmon-fillet-atop-a-fresh-green-salad-hKneg1iuj2A','Salmon'),
  unsplash('shrimp',/\b(prawns?|shrimps?)\b/i,'1669385185479-8a4c0db2f896','a-pile-of-cooked-shrimp-KhFwXgWnGbU','Shrimp and prawns',{url:'https://images.unsplash.com/photo-1762631934591-8a9bf09e5dfe',source:'https://unsplash.com/photos/cooked-shrimp-and-vegetables-in-a-pan-nRo9K3rqiTM'}),
  unsplash('fish',/\b(grilled|pan-fried|white|fried)\s+(fresh\s+)?fish\b|\bbranzino\b|\bsea bass\b|\bseafood crudo\b/i,'1519708227418-c8fd9a32b7a2','grilled-fish-cooked-vegetables-and-fork-on-plate-bpPTlXWTOvg','Fish'),
  unsplash('roast-duck',/\bduck\b/i,'1759418661781-2b37f26c4573','sliced-roasted-duck-with-rice-and-pickled-vegetables-i6Z4TdUcgf8','Roast duck'),
  unsplash('chicken',/\broast(ed)? chicken\b|\broast(ed)? poultry\b|\bgrilled chicken\b|\bchicken with lemon\b/i,'1616401616927-3c81de22dfa8','roasted-chicken-on-white-ceramic-plate-hV4_DinnR_0','Chicken'),
  unsplash('curry',/\b(curr(y|ies)|masala)\b|\bindian curry\b/i,'1743525700011-afac212694d7','a-variety-of-delicious-appetizing-curry-dishes-i0Dd1oxMz6c','Curry'),
  unsplash('pizza',/\bpizza\b/i,'1651981075280-9a9e01acbff0','a-person-making-pizzas-T_PbUhfwd0U','Pizza'),
  unsplash('tapas',/\b(tapas|mezze|antipasti)\b/i,'1768497678376-ae02df826c23','a-beautifully-set-table-with-charcuterie-and-food-HkPVQ5_1fFY','Tapas and mezze'),
  unsplash('risotto',/\brisotto\b/i,'1682428617976-f25633ed8469','a-white-plate-topped-with-food-on-top-of-a-table-7TaFlRyAhSQ','Risotto'),
  unsplash('pasta',/\bpasta\b|\bspaghetti\b|\blinguine\b/i,'1760390952355-a6b9cf50a7a2','a-plate-of-pasta-with-sauce-and-toppings-hSU3YyEZ62c','Pasta',{url:'https://images.unsplash.com/photo-1458644267420-66bc8a5f21e4',source:'https://unsplash.com/photos/pasta-with-sauce-on-plate-KSXvrqKUxnc'}),
  unsplash('vegetables',/\broast(ed)?\s+(root\s+)?vegetables\b|\bgrilled vegetables\b|\broast(ed)?\s+(aubergine|eggplant|squash|peppers)\b/i,'1534441596-341c8d7d0e51','close-up-of-vegetables-asK-tikpD5A','Roasted vegetables'),
  unsplash('salad',/\bsalads?\b|\bfennel salad\b/i,'1656853834420-51980b12a920','a-plate-of-salad-epetkkA9lr0','Salad'),
  unsplash('fruit-tart',/\b(fruit|peach|apple|apricot)\s+(tart|pie|dessert)\b|\btarte tatin\b/i,'1600477064324-92a31919ffd2','fruit-salad-on-white-ceramic-plate-LpKI3oH3SLU','Fruit tart'),
  unsplash('chocolate',/\bchocolate\b|\btruffles?\b/i,'1540337706094-da10342c93d8','chocolate-cake-gRZYR210m0U','Chocolate dessert'),
  unsplash('cheese',/\bcheeses?\b|\bcheddar\b|\bgouda\b|\bbrie\b|\bparmesan\b|\bmanchego\b|\bburrata\b/i,'1750874694108-8b561331a89f','a-cheese-board-olives-bread-and-wine-are-present-Zbb9MiYDZz8','Cheese'),
  unsplash('burger',/\bburgers?\b/i,'1632552544460-055cff0d29a5','a-sandwich-sitting-on-top-of-a-plate-of-food--FWqmBtcyqo','Burger')
 ];
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function match(label){return photos.find(p=>p.matches.test(label))||null;}
 function imageUrl(s){return s.url+'?fit=crop&w=560&h=370&q=78&fm=jpg';}
 function retry(img){
  if(!img)return;
  const photo=photos.find(p=>p.id===img.dataset.photoId);
  if(!photo)return;
  if(img.dataset.attempt!=='1'&&photo.backup?.url){
   img.dataset.attempt='1';img.src=imageUrl(photo.backup);
   const link=img.closest?.('.somm-pairing-item')?.querySelector?.('[data-somm-photo-source]');
   if(link)link.href=photo.backup.source;
   return;
  }
  img.onerror=null;img.hidden=true;
  if(img.nextElementSibling)img.nextElementSibling.hidden=false;
 }
 function render(items){
  if(!Array.isArray(items)||!items.length)return '';
  const matches=items.map(label=>({label,photo:match(label)}));
  if(!matches.some(x=>x.photo))return '<div class="somm-foods">'+items.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>';
  return '<div class="somm-pairing-grid">'+matches.map(({label,photo})=>{
   if(!photo)return '<div class="somm-pairing-text"><span>'+esc(label)+'</span></div>';
   return '<div class="somm-pairing-item"><div class="somm-pairing-media">'+
    '<img src="'+esc(imageUrl(photo))+'" alt="'+esc(photo.label)+'" loading="eager" decoding="async" data-photo-id="'+esc(photo.id)+'" data-attempt="0" onerror="window.SommelierPairings.retry(this)">'+
    '<span class="somm-pairing-placeholder" hidden>Photo unavailable</span></div>'+
    '<div class="somm-pairing-caption"><strong>'+esc(label)+'</strong>'+
    '<a href="'+esc(photo.source)+'" data-somm-photo-source target="_blank" rel="noopener noreferrer" aria-label="Photo source for '+esc(label)+'">Photo ↗</a></div></div>';
  }).join('')+'</div>';
 }
 window.SommelierPairings={photos,match,retry,render};
})();