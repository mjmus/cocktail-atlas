/* Bottle variants for generic ingredients. Exact named products always retain their own image. */
(() => {
  'use strict';
  const art = window.IngredientArt;
  if (!art) throw new Error('Ingredient artwork resolver must load first');
  const groups = {
    gin: {label:'Gin', names:['Plymouth Gin','Beefeater Gin',"Hendrick's Gin",'Tanqueray Gin','Bombay London Dry Gin','Aviation Gin']},
    sweet_vermouth:{label:'Sweet vermouth',names:['Carpano Antica Sweet Vermouth','Dolin Sweet Vermouth','Cocchi Vermouth di Torino','Martini Sweet Vermouth','Vya Sweet Vermouth']},
    dry_vermouth:{label:'Dry vermouth',names:['Dolin Dry Vermouth','Noilly Prat Dry Vermouth','Vya Dry Vermouth']},
    vermouth:{label:'Vermouth',names:['Carpano Antica Sweet Vermouth','Dolin Sweet Vermouth','Dolin Dry Vermouth','Noilly Prat Dry Vermouth','Martini Sweet Vermouth']},
    whiskey:{label:'Whiskey',names:['Rittenhouse Bonded Rye Whiskey','Wild Turkey Rye Whiskey','Jameson Irish Whiskey','Sazerac 6-Year-Old Rye Whiskey']},
    bourbon:{label:'Bourbon',names:['Woodford Reserve Bourbon','Wild Turkey Russell\'s Reserve 6-Year-Old Rye Whiskey','Rittenhouse Bonded Rye Whiskey']},
    rum:{label:'Rum',names:['Bacardi 8 Rum','Appleton Estate Reserve Rum','Gosling\'s Black Seal Rum','Flor de Caña 7-Year Rum']},
    white_rum:{label:'White rum',names:['Flor de Caña Extra-Dry White Rum','Banks 5-Island White Rum','Appleton White Rum','Mount Gay Eclipse White Rum']},
    dark_rum:{label:'Dark rum',names:['Gosling\'s Black Seal Rum','Myers\'s Dark Rum','Cruzan Black Strap Rum']},
    vodka:{label:'Vodka',names:['Belvedere Vodka','Charbay Vodka','Karlsson\'s Gold Vodka','Smirnoff Black Vodka']},
    tequila:{label:'Tequila',names:['Don Julio Blanco Tequila','El Tesoro Platinum Tequila','Siembra Azul Blanco Tequila','Don Julio Reposado Tequila']},
    blanco_tequila:{label:'Blanco tequila',names:['Don Julio Blanco Tequila','Siembra Azul Blanco Tequila','El Tesoro Platinum Tequila','Cabeza Blanco Tequila']},
    mezcal:{label:'Mezcal',names:['Del Maguey Vida Mezcal','Sombra Mezcal','Los Amantes Joven Mezcal','Ilegal Reposado Mezcal']},
    brandy:{label:'Brandy',names:['Hine V.S.O.P. Cognac','Tariquet VS Classique Bas-Armagnac','Waqar Pisco']}
  };
  const normalize = input => String(input||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const aliases={
    'gin':'gin','dry gin':'gin','london dry gin':'gin','london dry':'gin',
    'sweet vermouth':'sweet_vermouth','red vermouth':'sweet_vermouth','rosso vermouth':'sweet_vermouth',
    'dry vermouth':'dry_vermouth','french vermouth':'dry_vermouth','vermouth':'vermouth',
    'whiskey':'whiskey','whisky':'whiskey','rye':'whiskey','rye whiskey':'whiskey','rye whisky':'whiskey',
    'bourbon':'bourbon','bourbon whiskey':'bourbon',
    'rum':'rum','aged rum':'rum','dark rum':'dark_rum','white rum':'white_rum','light rum':'white_rum',
    'vodka':'vodka','tequila':'tequila','blanco tequila':'blanco_tequila','tequila blanco':'blanco_tequila','silver tequila':'blanco_tequila',
    'mezcal':'mezcal','mezcal joven':'mezcal','joven mezcal':'mezcal','brandy':'brandy','cognac':'brandy'
  };
  // All selectable options are existing names in the verified source ingredient index.
  for (const [key,group] of Object.entries(groups)) {
    group.names=group.names.filter(name=>Object.hasOwn(art.known,name));
    if(!group.names.length)delete groups[key];
  }
  const storageKey='cocktailatlas_bottle_choices_v1';
  let preferences={};
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');
    if(saved && typeof saved==='object' && !Array.isArray(saved))preferences=saved;
  } catch {}
  function family(name) {return aliases[normalize(name)]||null;}
  function options(name) {return groups[family(name)]?.names||[];}
  function chosen(key) {
    const candidates=groups[key]?.names||[];
    return candidates.includes(preferences[key])?preferences[key]:candidates[0]||null;
  }
  function selected(name) {const key=family(name);return key?chosen(key):null;}
  const directUrl=art.url.bind(art);
  art.url=(name,kind='t')=>{
    const alternate=selected(name);
    return directUrl(alternate||name,kind);
  };
  function choose(key,brand) {
    if (!groups[key]?.names.includes(brand))return false;
    preferences[key]=brand;
    try{localStorage.setItem(storageKey,JSON.stringify(preferences))}catch {}
    // Update all image sizes (small step photo, gallery and enlarged hover).
    for(const image of document.querySelectorAll('[data-bottle-family]')){
      if(image.dataset.bottleFamily===key){
        image.dataset.artFallback='';
        image.src=directUrl(brand,image.dataset.bottleKind||'t');
      }
    }
    for(const select of document.querySelectorAll('[data-bottle-select]')){
      if(select.dataset.bottleSelect===key)select.value=brand;
    }
    return true;
  }
  function selection(name) {
    const key=family(name),names=options(name);
    return key && names.length>1?{key,names,selected:chosen(key),label:groups[key].label}:null;
  }
  document.addEventListener('change',event=>{
    const select=event.target;
    if(select?.dataset?.bottleSelect)choose(select.dataset.bottleSelect,select.value);
  });
  Object.assign(art,{family,options,selected,choose,selection,groups});
})();
