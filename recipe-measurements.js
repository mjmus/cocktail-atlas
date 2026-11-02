/* US bartender-volume display, kept separate from original recipe measurements.
   One US teaspoon = 1/6 US fluid ounce. One tablespoon = 1/2 US fluid ounce.
   Gram values are NEVER derived from volume amounts. */
(function(root){
'use strict';
const vulgar={ '¼':1/4,'½':1/2,'¾':3/4,'⅓':1/3,'⅔':2/3,'⅛':1/8,'⅜':3/8,'⅝':5/8,'⅞':7/8,'⅙':1/6,'⅚':5/6 };
const numeric='(?:\\d+(?:\\.\\d+)?|\\.\\d+|[¼½¾⅓⅔⅛⅜⅝⅞⅙⅚]|\\d+\\/\\d+)(?:\\s*[¼½¾⅓⅔⅛⅜⅝⅞⅙⅚]|\\s+\\d+\\/\\d+)?';
const quantity=new RegExp('^('+numeric+')$');
const amountPattern=new RegExp('^\\s*('+numeric+')\\s*(fl\\.?\\s*oz\\.?|fluid\\s+ounces?|oz\\.?|ounces?|tsp\\.?|teaspoons?|tbsp\\.?|tablespoons?|ml|milliliters?|cl)\\s*$','i');
const rangePattern=new RegExp('^\\s*('+numeric+')\\s*[-–]\\s*('+numeric+')\\s*(tsp\\.?|teaspoons?|tbsp\\.?|tablespoons?|oz\\.?|ounces?|fl\\.?\\s*oz\\.?)\\s*(per serving)?\\s*$','i');
const fractionChars={'1/2':'½','1/3':'⅓','2/3':'⅔','1/4':'¼','3/4':'¾','1/6':'⅙','5/6':'⅚','1/8':'⅛','3/8':'⅜','5/8':'⅝','7/8':'⅞'};
function parseNumber(value){
  const s=String(value||'').trim().replace(/\s+/g,' ');
  if(!s)return null;
  if(Object.prototype.hasOwnProperty.call(vulgar,s))return vulgar[s];
  if(/^\d+\/\d+$/.test(s)){const [a,b]=s.split('/').map(Number);return b?a/b:null;}
  if(/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(s))return Number(s);
  const mix=s.match(/^(\d+)\s*([¼½¾⅓⅔⅛⅜⅝⅞⅙⅚]|\d+\/\d+)$/);
  if(mix){const f=parseNumber(mix[2]);return f==null?null:Number(mix[1])+f;}
  return null;
}
function factor(unit){
  const s=unit.toLowerCase().replace(/\s+/g,' ').replace(/\.$/,'');
  if(/^tsp|^teaspoon/.test(s))return 1/6;
  if(/^tbsp|^tablespoon/.test(s))return 1/2;
  if(s==='ml'||s.startsWith('milliliter'))return 1/29.5735295625;
  if(s==='cl')return 10/29.5735295625;
  return 1;
}
function prettyOz(ounces){
  if(!Number.isFinite(ounces)||ounces<0)return null;
  const whole=Math.floor(ounces+1e-9),fraction=ounces-whole;
  // Exact common bartender fractions. Accept only negligible floating-point error.
  for(const den of [2,3,4,6,8,12,16,24,48]){
    const numerator=Math.round(fraction*den);
    if(numerator>=den)continue;
    if(Math.abs(numerator/den-fraction)>0.000001)continue;
    if(!numerator)return whole+' oz';
    const str=fractionChars[numerator+'/'+den]||numerator+'/'+den;
    return (whole?String(whole)+(str.length===1?'':' '):'')+str+' oz';
  }
  const rounded=Number(ounces.toFixed(2));
  return (Math.abs(rounded)<.005?'≈':'')+rounded.toString()+' oz';
}
function isDryIngredient(item){
  const name=String(item?.name||'').toLowerCase();
  if(/\b(syrup|liqueur|cordial|bitters|liquid|juice|infusion|vermouth)\b/.test(name))return false;
  return /\b(salt|sugar|powder|peppercorn|spice|nutmeg|cinnamon stick|tea leaves|clove|crushed ice|ground|flour|coffee beans|cocoa powder|seeds|dried)\b/.test(name);
}
function parseVolume(raw){
  const m=String(raw||'').match(amountPattern);
  if(!m)return null;
  const number=parseNumber(m[1]);
  if(number==null)return null;
  return {ounces:number*factor(m[2]),sourceUnit:m[2],number};
}
function measuredAmount(item,servings=1){
  const raw=String(typeof item==='object'?(item?.amount||''):item||'').trim();
  if(!raw)return '';
  const qty=Number(servings);
  if(!Number.isFinite(qty)||qty<=0)return raw;
  const role=String(item?.role||'').toLowerCase();
  const canConvert=role!=='garnish'&&role!=='glass'&&!isDryIngredient(item);
  const direct=canConvert&&parseVolume(raw);
  if(direct)return prettyOz(direct.ounces*qty)||raw;
  const range=canConvert&&raw.match(rangePattern);
  if(range){
    const a=parseNumber(range[1]),b=parseNumber(range[2]);
    if(a!=null&&b!=null)return prettyOz(a*factor(range[3])*qty).replace(/ oz$/,'')+'–'+prettyOz(b*factor(range[3])*qty)+(range[4]?' per serving':'');
  }
  // Preserve the method when a liquid amount is intended as a float.
  const floated=canConvert&&raw.match(/^(.+?)\s+(tsp|teaspoons?|tbsp|tablespoons?)\s+(float|to float)$/i);
  if(floated){
    const n=parseNumber(floated[1]);
    if(n!=null)return prettyOz(n*factor(floated[2])*qty)+' '+floated[3].toLowerCase();
  }
  // Unknown sizes, dashes and counts are not assigned fluid-ounce equivalents.
  if(qty===1)return raw;
  const m=raw.match(new RegExp('^('+numeric+')(.*)$'));
  if(!m)return raw;
  const v=parseNumber(m[1]);
  if(v==null)return raw;
  return Number((v*qty).toFixed(3)).toString()+m[2];
}
function amountWithOriginal(item,servings=1){
  const value=measuredAmount(item,servings);
  return {display:value,original:typeof item==='object'?String(item?.amount||''):String(item||''),changed:value!==String(item?.amount||'')};
}
root.RecipeMeasurements={parseNumber,parseVolume,prettyOz,measuredAmount,amountWithOriginal,isDryIngredient};
})(typeof window!=='undefined'?window:globalThis);
