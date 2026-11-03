/* Freely licensed, verified dish photography (Unsplash). Images illustrate food
   categories; the exact named pairing remains authoritative. Original food
   suggestions are unchanged. No rankings or prices. */
(() => {
 'use strict';
 const photos=[
  {id:'oysters',matches:/\boysters?\b/i,url:'https://images.unsplash.com/photo-1729269524124-1645db0b0ff5',source:'https://unsplash.com/photos/a-plate-of-oysters-with-lemon-wedges-and-a-box-of-oysters-TnZnJO4DSdQ',label:'Oysters'},
  {id:'sushi',matches:/\bsushi\b|\bsashimi\b/i,url:'https://images.unsplash.com/photo-1736885978380-8d7d9f7d7880',source:'https://unsplash.com/photos/a-variety-of-sushi-is-displayed-on-a-platter-eTMBxAvc9mc',label:'Sushi'},
  {id:'steak',matches:/\bribeye\b|\b(beef|sirloin|pepper-crusted) steak\b/i,url:'https://images.unsplash.com/photo-1563027221-46c272407e95',source:'https://unsplash.com/photos/food-photography-of-cooked-steak-fyMhLq9ckoQ',label:'Steak'},
  {id:'charcuterie',matches:/\bcharcuterie\b|\bsalumi\b|\bprosciutto\b|\bmortadella\b|\bcured (ham|meats?)\b/i,url:'https://images.unsplash.com/photo-1758972573607-509448e9f3e4',source:'https://unsplash.com/photos/charcuterie-board-with-cured-meats-cheese-and-pickles-EK9FWSXIS3k',label:'Charcuterie'},
  {id:'risotto',matches:/\brisotto\b/i,url:'https://images.unsplash.com/photo-1682428617976-f25633ed8469',source:'https://unsplash.com/photos/a-white-plate-topped-with-food-on-top-of-a-table-7TaFlRyAhSQ',label:'Risotto'},
  {id:'fish',matches:/\bgrilled (fish|white fish|sea bass)\b|\bgrilled branzino\b|\bwhite fish\b/i,url:'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',source:'https://unsplash.com/photos/grilled-fish-cooked-vegetables-and-fork-on-plate-bpPTlXWTOvg',label:'Grilled fish'},
  {id:'chicken',matches:/\broast(ed)? chicken\b|\broast(ed)? poultry\b/i,url:'https://images.unsplash.com/photo-1616401616927-3c81de22dfa8',source:'https://unsplash.com/photos/roasted-chicken-on-white-ceramic-plate-hV4_DinnR_0',label:'Roast chicken'},
  {id:'pasta',matches:/\bpasta\b|\bspaghetti\b|\blinguine\b/i,url:'https://images.unsplash.com/photo-1760390952355-a6b9cf50a7a2',source:'https://unsplash.com/photos/a-plate-of-pasta-with-sauce-and-toppings-hSU3YyEZ62c',label:'Pasta'},
  {id:'chocolate',matches:/\bchocolate\b|\btruffle(s)?\b/i,url:'https://images.unsplash.com/photo-1540337706094-da10342c93d8',source:'https://unsplash.com/photos/chocolate-cake-gRZYR210m0U',label:'Chocolate dessert'},
  {id:'cheese',matches:/\bcheese(s)?\b|\bcheddar\b|\bgouda\b|\bbrie\b|\bparmesan\b|\bmanchego\b/i,url:'https://images.unsplash.com/photo-1750874694108-8b561331a89f',source:'https://unsplash.com/photos/a-cheese-board-olives-bread-and-wine-are-present-Zbb9MiYDZz8',label:'Cheese board'},
  {id:'vegetables',matches:/\broast(ed)? vegetables\b|\broast(ed)? root vegetables\b/i,url:'https://images.unsplash.com/photo-1534441596-341c8d7d0e51',source:'https://unsplash.com/photos/close-up-of-vegetables-asK-tikpD5A',label:'Roasted vegetables'}
 ];
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function match(label) { return photos.find(p=>p.matches.test(label))||null; }
 function render(items) {
   if(!Array.isArray(items)||!items.length)return '';
   const matched=items.map(label=>({label,photo:match(label)}));
   if(!matched.some(x=>x.photo))return '<div class="somm-foods">'+items.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>';
   return '<div class="somm-pairing-grid">'+matched.map(({label,photo})=> {
     if(!photo)return '<div class="somm-pairing-text"><span>'+esc(label)+'</span></div>';
     const src=photo.url+'?auto=format&fit=crop&w=560&h=370&q=78';
     return '<div class="somm-pairing-item"><div class="somm-pairing-media">'+
       '<img src="'+esc(src)+'" alt="Illustrative photograph of '+esc(photo.label)+'" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">'+
       '<span class="somm-pairing-placeholder" hidden>Pairing photo unavailable</span></div>'+
       '<div class="somm-pairing-caption"><strong>'+esc(label)+'</strong>'+
       '<a href="'+esc(photo.source)+'" target="_blank" rel="noopener noreferrer" aria-label="View photograph source for '+esc(label)+'">Photo ↗</a></div></div>';
   }).join('')+'</div>'+
   '<p class="somm-food-photo-note">Food photographs are illustrative. Pairings refer to the dishes named, not necessarily the exact preparation shown.</p>';
 }
 window.SommelierPairings={photos,match,render};
})();