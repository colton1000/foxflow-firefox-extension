let cfg={};
const adSelectors=['[id^="google_ads"]','[id*="google_ads"]','[class*=" ad-"]','[class^="ad-"]','[data-ad]','[data-ad-slot]','iframe[src*="doubleclick"]','iframe[src*="googlesyndication"]','.adsbygoogle','.ad-container','.advertisement'];
function apply(){
 document.documentElement.classList.toggle('foxflow-dark',!!cfg.dark);
 document.documentElement.classList.toggle('foxflow-focus',!!cfg.focus);
 if(cfg.cosmetic) for(const el of document.querySelectorAll(adSelectors.join(','))) el.classList.add('foxflow-hidden');
 if(cfg.hideSticky) for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);if((s.position==='fixed'||s.position==='sticky')&&el.id!=='foxflow-top')el.dataset.foxflowHidden='1',el.style.setProperty('display','none','important');}
 if(cfg.pauseAutoplay) for(const v of document.querySelectorAll('video[autoplay],audio[autoplay]')) if(!location.hostname.includes('youtube.com')) v.pause();
 if(cfg.youtube&&location.hostname.includes('youtube.com')){
  const video=document.querySelector('video'); const ad=document.querySelector('.ad-showing,.ytp-ad-player-overlay,.video-ads');
  if(ad&&video){video.muted=true;if(Number.isFinite(video.duration)&&video.duration>0) video.currentTime=Math.max(0,video.duration-.15);}
  document.querySelector('.ytp-skip-ad-button,.ytp-ad-skip-button-modern,.ytp-ad-skip-button')?.click();
  for(const e of document.querySelectorAll('.ytp-ad-overlay-container,.ytp-ad-message-container')) e.remove();
 }
}
function addTop(){if(document.getElementById('foxflow-top')||!document.body)return;const b=document.createElement('button');b.id='foxflow-top';b.textContent='↑';b.title='Back to top';b.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.appendChild(b);}
browser.runtime.sendMessage({type:'getSettings'}).then(v=>{cfg=v||{};apply();addTop();});
browser.storage.onChanged.addListener(ch=>{for(const[k,v]of Object.entries(ch))cfg[k]=v.newValue;apply();});
new MutationObserver(()=>{apply();addTop();}).observe(document.documentElement,{subtree:true,childList:true});

function calculateExpression(input){
 const text=String(input).replace(/[×x]/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/\s+/g,'');
 if(!text||text.length>100||!/^[0-9+\-*/().]+$/.test(text)) throw new Error('Invalid expression');
 let i=0;
 function peek(){return text[i]}
 function number(){
  const start=i; let dots=0;
  while(i<text.length&&(/[0-9.]/.test(text[i]))){if(text[i]==='.')dots++;i++}
  if(start===i||dots>1)throw new Error('Invalid number');
  const value=Number(text.slice(start,i));if(!Number.isFinite(value))throw new Error('Invalid number');return value;
 }
 function factor(){
  if(peek()==='+'){i++;return factor()}
  if(peek()==='-'){i++;return -factor()}
  if(peek()==='('){i++;const value=expression();if(peek()!==')')throw new Error('Missing parenthesis');i++;return value}
  return number();
 }
 function term(){let value=factor();while(peek()==='*'||peek()==='/'){const op=text[i++],right=factor();if(op==='/'&&right===0)throw new Error('Cannot divide by zero');value=op==='*'?value*right:value/right}return value}
 function expression(){let value=term();while(peek()==='+'||peek()==='-'){const op=text[i++],right=term();value=op==='+'?value+right:value-right}return value}
 const result=expression();if(i!==text.length||!Number.isFinite(result))throw new Error('Invalid expression');return Object.is(result,-0)?0:result;
}

// Selection math helper. Accepts only simple arithmetic, never page code or identifiers.
function foxflowMathValue(text){
 const expr=text.trim();
 if(expr.length<3||expr.length>100||!/[+*/−–-]/.test(expr))return null;
 try{return calculateExpression(expr)}catch(e){return null}
}
function removeMathTip(){document.getElementById('foxflow-math-tip')?.remove()}
document.addEventListener('mousedown',e=>{if(!e.target.closest?.('#foxflow-math-tip'))removeMathTip()},true);
document.addEventListener('mouseup',()=>{
 setTimeout(()=>{
  removeMathTip(); if(!cfg.highlightMath)return;
  const sel=getSelection(); const text=sel?.toString()||''; const value=foxflowMathValue(text); if(value===null||!sel.rangeCount)return;
  const rect=sel.getRangeAt(0).getBoundingClientRect(); if(!rect.width&&!rect.height)return;
  const tip=document.createElement('div');tip.id='foxflow-math-tip';tip.textContent='= '+value;
  tip.style.left=Math.max(8,Math.min(innerWidth-130,rect.left+rect.width/2-55))+'px';tip.style.top=Math.max(8,rect.bottom+8)+'px';
  document.documentElement.appendChild(tip);
 },0);
},true);
