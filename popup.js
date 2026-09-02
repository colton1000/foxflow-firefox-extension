const status=document.querySelector('#status');
async function load(){const s=await browser.runtime.sendMessage({type:'getSettings'});document.querySelectorAll('[data-key]').forEach(e=>e.checked=!!s[e.dataset.key]);renderSchedules();renderSounds();setDefaultTime();}
document.querySelectorAll('.menuBtn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.menuBtn,.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.panel).classList.add('active');status.textContent='';});
document.querySelectorAll('[data-key]').forEach(e=>e.onchange=()=>browser.runtime.sendMessage({type:'setSetting',key:e.dataset.key,value:e.checked}));
async function tile(count){status.textContent='Arranging tabs...';await browser.runtime.sendMessage({type:'tile',count,area:{left:screen.availLeft,top:screen.availTop,width:screen.availWidth,height:screen.availHeight}});window.close();}
three.onclick=()=>tile(3);four.onclick=()=>tile(4);gather.onclick=async()=>{await browser.runtime.sendMessage({type:'gather'});status.textContent='Tabs gathered.'};
clean.onclick=async()=>{try{const[t]=await browser.tabs.query({active:true,currentWindow:true});const u=new URL(t.url);[...u.searchParams.keys()].forEach(k=>{if(k.startsWith('utm_')||['fbclid','gclid','mc_cid','mc_eid'].includes(k))u.searchParams.delete(k)});await navigator.clipboard.writeText(u.href);status.textContent='Clean URL copied.'}catch(e){status.textContent='This page URL cannot be copied.'}};
// Calculator uses a built-in parser because Firefox extension CSP blocks eval and Function.
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
let expression=''; const display=document.getElementById('display');
function showExpression(){display.value=expression||'0'}
document.querySelectorAll('[data-c]').forEach(button=>button.addEventListener('click',()=>{
 const value=button.dataset.c;
 if(value==='C'){expression='';showExpression();return}
 if(value==='='){
  try{const result=calculateExpression(expression);expression=String(Number(result.toFixed(12)));showExpression();status.textContent=''}
  catch(error){display.value=error.message==='Cannot divide by zero'?'Cannot divide by zero':'Error';expression='';status.textContent='Check the expression and try again.'}
  return;
 }
 if(display.value==='Error'||display.value==='Cannot divide by zero')expression='';
 expression+=value;showExpression();
}));
document.addEventListener('keydown',event=>{
 if(!document.getElementById('calc').classList.contains('active'))return;
 if(/^[0-9+\-*/().]$/.test(event.key)){expression+=event.key;showExpression();event.preventDefault()}
 else if(event.key==='Enter'){document.querySelector('[data-c="="]').click();event.preventDefault()}
 else if(event.key==='Escape'){document.querySelector('[data-c="C"]').click()}
 else if(event.key==='Backspace'){expression=expression.slice(0,-1);showExpression();event.preventDefault()}
});
function normalizeUrl(raw){raw=raw.trim();if(!/^https?:\/\//i.test(raw))raw='https://'+raw;const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw Error();return u.href;}
function setDefaultTime(){const d=new Date(Date.now()+5*60000);d.setSeconds(0,0);siteTime.value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
async function renderSchedules(){const {scheduledSites=[]}=await browser.storage.local.get({scheduledSites:[]});scheduledList.textContent='';const items=scheduledSites.filter(x=>x.when>Date.now()).sort((a,b)=>a.when-b.when);if(!items.length){scheduledList.innerHTML='<div class="empty">Nothing scheduled.</div>';return}for(const item of items){const row=document.createElement('div');row.className='scheduledItem';const host=document.createElement('b');host.textContent=new URL(item.url).hostname;const when=document.createElement('span');when.textContent=new Date(item.when).toLocaleString();const remove=document.createElement('button');remove.className='removeSchedule';remove.textContent='Cancel';remove.onclick=async()=>{await browser.alarms.clear(item.id);const data=await browser.storage.local.get({scheduledSites:[]});await browser.storage.local.set({scheduledSites:data.scheduledSites.filter(x=>x.id!==item.id)});renderSchedules();};row.append(host,when,remove);scheduledList.append(row)}}
scheduleBtn.onclick=async()=>{try{const url=normalizeUrl(siteUrl.value);const when=new Date(siteTime.value).getTime();if(!Number.isFinite(when)||when<=Date.now())throw Error('Choose a future time.');const id='site-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);const data=await browser.storage.local.get({scheduledSites:[]});const scheduledSites=[...data.scheduledSites,{id,url,when}];await browser.storage.local.set({scheduledSites});browser.alarms.create(id,{when});siteUrl.value='';setDefaultTime();status.textContent='Website scheduled.';renderSchedules()}catch(e){status.textContent=e.message||'Enter a valid website and future time.'}};
load();

function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}
async function renderSounds(){
 const {soundboard=[]}=await browser.storage.local.get({soundboard:[]});soundGrid.textContent='';
 if(!soundboard.length){soundGrid.innerHTML='<div class="empty">Import audio to add your first sound.</div>';return}
 for(const sound of soundboard){
  const card=document.createElement('div');card.className='soundCard';card.title='Play '+sound.name;
  if(sound.image){const img=document.createElement('img');img.src=sound.image;img.alt='';card.append(img)}else{const p=document.createElement('div');p.className='soundPlaceholder';p.textContent='🔊';card.append(p)}
  const name=document.createElement('b');name.textContent=sound.name;card.append(name);
  const del=document.createElement('button');del.className='deleteSound';del.textContent='Delete';del.onclick=async e=>{e.stopPropagation();const data=await browser.storage.local.get({soundboard:[]});await browser.storage.local.set({soundboard:data.soundboard.filter(x=>x.id!==sound.id)});renderSounds()};card.append(del);
  card.onclick=async()=>{try{await browser.runtime.sendMessage({type:'playSound',audio:sound.audio,volume:soundVolume.value});status.textContent='Playing '+sound.name}catch(e){status.textContent='Could not play this audio format.'}};soundGrid.append(card)
 }
}
let droppedAudio=null,droppedImage=null;
function baseFileName(name){return name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim().slice(0,40)}
function validAudio(file){return file&&(file.type.startsWith('audio/')||/\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(file.name))}
function validImage(file){return file&&(file.type==='image/png'||file.type==='image/jpeg'||/\.(png|jpe?g)$/i.test(file.name))}
function selectedAudio(){return droppedAudio||soundAudio.files[0]||null}
function selectedImage(){return droppedImage||soundImage.files[0]||null}
function updateDropPreview(){
 const audio=selectedAudio(),image=selectedImage(),parts=[];
 if(audio)parts.push('Audio: '+audio.name);if(image)parts.push('Image: '+image.name);
 dropPreview.textContent=parts.join(' | ')||'No files selected';soundDropZone.classList.toggle('hasAudio',!!audio);
 if(audio&&!soundName.value.trim())soundName.value=baseFileName(audio.name);
}
function acceptDroppedFiles(files){
 let found=false;
 for(const file of files){
  if(validAudio(file)){droppedAudio=file;found=true}
  else if(validImage(file)){droppedImage=file;found=true}
 }
 if(!found)status.textContent='Drop an audio file and an optional PNG or JPG.';else status.textContent='Files ready. Click Add sound.';
 updateDropPreview();
}
['dragenter','dragover'].forEach(type=>soundDropZone.addEventListener(type,event=>{event.preventDefault();event.stopPropagation();soundDropZone.classList.add('dragOver');if(event.dataTransfer)event.dataTransfer.dropEffect='copy'}));
['dragleave','dragend'].forEach(type=>soundDropZone.addEventListener(type,event=>{event.preventDefault();soundDropZone.classList.remove('dragOver')}));
soundDropZone.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();soundDropZone.classList.remove('dragOver');acceptDroppedFiles(event.dataTransfer.files)});
soundDropZone.addEventListener('click',()=>soundDropPicker.click());
soundDropZone.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();soundDropPicker.click()}});
soundDropPicker.addEventListener('change',()=>acceptDroppedFiles(soundDropPicker.files));
soundAudio.addEventListener('change',()=>{droppedAudio=null;updateDropPreview()});
soundImage.addEventListener('change',()=>{droppedImage=null;updateDropPreview()});
addSound.onclick=async()=>{
 try{
  const audioFile=selectedAudio(),imageFile=selectedImage();let name=soundName.value.trim();
  if(!audioFile)throw Error('Choose or drop an audio file.');if(!validAudio(audioFile))throw Error('The sound must be a supported audio file.');if(imageFile&&!validImage(imageFile))throw Error('Use a PNG or JPG image.');if(!name)name=baseFileName(audioFile.name)||'Sound';
  status.textContent='Importing files...';
  const audio=await fileToDataUrl(audioFile),image=imageFile?await fileToDataUrl(imageFile):'';const data=await browser.storage.local.get({soundboard:[]});
  await browser.storage.local.set({soundboard:[...data.soundboard,{id:'sound-'+Date.now(),name,audio,image}]});
  soundName.value='';soundAudio.value='';soundImage.value='';soundDropPicker.value='';droppedAudio=null;droppedImage=null;updateDropPreview();status.textContent='Sound added.';renderSounds();
 }catch(e){status.textContent=e.message||'Could not import that sound.'}
};


function openSoundSearch(query){
 const q=(query||'sound effects').trim();
 browser.tabs.create({url:'https://pixabay.com/sound-effects/search/'+encodeURIComponent(q)+'/',active:true});
 status.textContent='Sound search opened in Firefox. Download an MP3, then drag it into FoxFlow.';
}
findSounds.addEventListener('click',()=>openSoundSearch(soundSearch.value));
airHornSearch.addEventListener('click',()=>openSoundSearch('air horn'));
soundSearch.addEventListener('keydown',event=>{if(event.key==='Enter')openSoundSearch(soundSearch.value)});
// Prevent accidental navigation when files are dragged over any part of the FoxFlow window.
window.addEventListener('dragover',event=>event.preventDefault());
window.addEventListener('drop',event=>{if(!event.target.closest('#soundDropZone'))event.preventDefault()});
