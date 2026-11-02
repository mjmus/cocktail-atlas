/* Shakerrr source-data adapter. No Decent API calls for these recipes. */
(() => {
  'use strict';
  const URL = './data/shakerrr-recipes.json';
  const IMAGE_ROOT = 'https://raw.githubusercontent.com/FusorXE/shakerrr-site/main/';
  const spirits = ['Whiskey', 'Gin', 'Brandy', 'Rum', 'Tequila', 'Vodka', 'Mezcal'];
  let records = null;
  let inflight = null;
  const normalized = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function isSpirit(ingredient, spirit) {
    const name = normalized(ingredient);
    const tests = {
      whiskey: /\b(whisk(?:e)?y|bourbon|rye|scotch|irish whiskey|jack daniel)\b/,
      gin: /\b(gin|genever|old tom|london dry)\b/,
      brandy: /\b(brandy|cognac|armagnac|pisco|calvados|applejack)\b/,
      rum: /\b(rum|rhum|cachaca|cachaça|aguardiente de cana)\b/,
      tequila: /\btequila\b/,
      vodka: /\bvodka\b/,
      mezcal: /\b(mezcal|mescal)\b/
    };
    return Boolean(tests[normalized(spirit)]?.test(name));
  }
  async function load() {
    if (records) return records;
    if (!inflight) inflight = (async () => {
      const response = await fetch(URL, {cache:'force-cache'});
      if (!response.ok) throw new Error('Shakerrr recipe data could not be loaded ('+response.status+')');
      const data = await response.json();
      if (!Array.isArray(data.recipes)) throw new Error('Unexpected Shakerrr data format');
      records = data.recipes;
      return records;
    })().catch(error=>{inflight=null;throw error;});
    return inflight;
  }
  function image(item) {
    if (!item?.image || !/^assets\/recipes\/[a-z0-9_-]+\.webp$/i.test(item.image)) return '';
    return IMAGE_ROOT + item.image;
  }
  function find(name) {return (records||[]).find(r=>normalized(r.name)===normalized(name));}
  function collectionGroups() {
    const groups=new Map();
    (records||[]).forEach(r=>(r.collections||['Other']).forEach(name=>{
      if (!groups.has(name)) groups.set(name,[]);
      groups.get(name).push(r);
    }));
    return [...groups].map(([name,items])=>({name,items:items.sort((a,b)=>a.name.localeCompare(b.name))})).sort((a,b)=>b.items.length-a.items.length || a.name.localeCompare(b.name));
  }
  function forSpirit(s) {return (records||[]).filter(r=>(r.ingredients||[]).some(i=>isSpirit(i.name,s)));}
  function forGlass(g) {return (records||[]).filter(r=>normalized(r.glass)===normalized(g));}
  function forIngredient(ing) {return (records||[]).filter(r=>(r.ingredients||[]).some(i=>normalized(i.name)===normalized(ing)));}
  function ingredients() {return [...new Set((records||[]).flatMap(r=>(r.ingredients||[]).map(x=>x.name)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));}
  function glasses() {return [...new Set((records||[]).map(r=>r.glass).filter(Boolean))].sort((a,b)=>a.localeCompare(b));}
  function search(q) {
    const query=normalized(q);
    return (records||[]).filter(r=>query.split(/\s+/).filter(Boolean).every(word=>[r.name,r.family,r.method,r.category,r.country,...(r.collections||[]),...(r.ingredients||[]).map(i=>i.name)].some(s=>normalized(s).includes(word))));
  }
  function details(name, index=0) {
    const src=find(name);if(!src)return null;
    const version=(src.versions||[])[index]||null;
    const values=version?.ingredients?.length?version:src;
    return {
      ok:true,book:'shakerrr',name:src.name,sourceId:src.id,
      description:[src.family,src.country].filter(Boolean).join(' · '),
      ingredients:(values.ingredients||[]).map(i=>({name:i.name,amount:i.amount,grams:null,role:/\b(salt\s+for\s+rim|lime\s+wheel|orange\s+twist|lemon\s+twist)\b/i.test(i.name)?'garnish':'add',category:'Ingredient'})),
      method:values.instructions||src.instructions||'See the ingredients and method.',
      glass:values.glass||src.glass||'',garnish:values.garnish||src.garnish||'',
      ice:values.ice||src.ice||'',category:src.category||'',family:src.family||'',
      collections:src.collections||[],country:src.country||'',image_url:image(src),
      credit:version?.label || (src.collections||[])[0] || 'Shakerrr',
      versionIndex:index,versions:src.versions||[],stats:null,similar:[],
      source_book:{title:(src.collections||[])[0]||'Shakerrr Library',authors:''},
      web_url:version?.url||''
    };
  }
  window.ShakerrrLibrary={load,find,image,details,collectionGroups,forSpirit,forGlass,forIngredient,ingredients,glasses,search,spirits};
})();