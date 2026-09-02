const DEFAULTS={blockAds:true,cosmetic:true,youtube:true,dark:false,focus:false,hideSticky:false,pauseAutoplay:true,highlightMath:true};
const blockedHosts=[
 'doubleclick.net','googlesyndication.com','googleadservices.com','adservice.google.com','amazon-adsystem.com',
 'adsrvr.org','adnxs.com','taboola.com','outbrain.com','scorecardresearch.com','quantserve.com','zedo.com',
 'criteo.com','criteo.net','pubmatic.com','rubiconproject.com','openx.net','casalemedia.com','moatads.com'
];
const urlFragments=['/pagead/','/adsystem/','/adserver/','/adservice/','/advertising/','/prebid','/vast?','/vast/'];
let settings={...DEFAULTS};
browser.storage.local.get(DEFAULTS).then(v=>settings={...DEFAULTS,...v});
browser.storage.onChanged.addListener(ch=>{for(const [k,v] of Object.entries(ch)) settings[k]=v.newValue;});
function hostMatches(host){return blockedHosts.some(d=>host===d||host.endsWith('.'+d));}
function shouldBlock(url){
 if(!settings.blockAds) return false;
 try{const u=new URL(url); return hostMatches(u.hostname)||urlFragments.some(x=>u.pathname.toLowerCase().includes(x)||u.href.toLowerCase().includes(x));}catch(e){return false;}
}
browser.webRequest.onBeforeRequest.addListener(d=>({cancel:shouldBlock(d.url)}),{urls:['<all_urls>'],types:['script','image','stylesheet','xmlhttprequest','sub_frame','media','object','font']},['blocking']);
async function ensureTabs(count,sourceWindow){
 let tabs=await browser.tabs.query({windowId:sourceWindow});
 let active=tabs.findIndex(t=>t.active); if(active<0) active=0;
 tabs=[...tabs.slice(active),...tabs.slice(0,active)].filter(t=>!t.pinned).slice(0,count);
 while(tabs.length<count) tabs.push(await browser.tabs.create({windowId:sourceWindow,url:'about:blank',active:false}));
 return tabs;
}
async function tile(count,area){
 const current=await browser.windows.getCurrent();
 const tabs=await ensureTabs(count,current.id);
 const x=area.left||0,y=area.top||0,w=area.width,h=area.height;
 const gap=6;
 const rects=count===3?[
  {left:x,top:y,width:Math.floor(w/2)-gap,height:h},
  {left:x+Math.floor(w/2),top:y,width:Math.ceil(w/2),height:Math.floor(h/2)-gap},
  {left:x+Math.floor(w/2),top:y+Math.floor(h/2),width:Math.ceil(w/2),height:Math.ceil(h/2)}
 ]:[
  {left:x,top:y,width:Math.floor(w/2)-gap,height:Math.floor(h/2)-gap},
  {left:x+Math.floor(w/2),top:y,width:Math.ceil(w/2),height:Math.floor(h/2)-gap},
  {left:x,top:y+Math.floor(h/2),width:Math.floor(w/2)-gap,height:Math.ceil(h/2)},
  {left:x+Math.floor(w/2),top:y+Math.floor(h/2),width:Math.ceil(w/2),height:Math.ceil(h/2)}
 ];
 for(let i=0;i<count;i++) await browser.windows.create({tabId:tabs[i].id,type:'normal',focused:i===0,...rects[i]});
}
async function gather(){
 const target=await browser.windows.getCurrent(); const wins=await browser.windows.getAll({populate:true});
 const ids=[]; for(const w of wins) if(w.id!==target.id) for(const t of w.tabs||[]) if(!t.pinned) ids.push(t.id);
 if(ids.length) await browser.tabs.move(ids,{windowId:target.id,index:-1});
 await browser.windows.update(target.id,{focused:true,state:'maximized'});
}
browser.runtime.onMessage.addListener(async m=>{
 if(m.type==='tile') return tile(m.count,m.area);
 if(m.type==='gather') return gather();
 if(m.type==='getSettings') return settings;
 if(m.type==='setSetting'){settings[m.key]=m.value; await browser.storage.local.set({[m.key]:m.value}); return true;}
 if(m.type==='playSound'){const audio=new Audio(m.audio); audio.volume=Math.max(0,Math.min(1,Number(m.volume)||1)); await audio.play(); return true;}
});

// Scheduled website opener
async function restoreWebsiteAlarms(){
 const data=await browser.storage.local.get({scheduledSites:[]});
 const now=Date.now();
 const kept=[];
 for(const item of data.scheduledSites){
  if(item.when>now){
   browser.alarms.create(item.id,{when:item.when});
   kept.push(item);
  }
 }
 if(kept.length!==data.scheduledSites.length) await browser.storage.local.set({scheduledSites:kept});
}
restoreWebsiteAlarms();
browser.runtime.onStartup.addListener(restoreWebsiteAlarms);
browser.alarms.onAlarm.addListener(async alarm=>{
 if(!alarm.name.startsWith('site-')) return;
 const data=await browser.storage.local.get({scheduledSites:[]});
 const item=data.scheduledSites.find(x=>x.id===alarm.name);
 if(!item) return;
 await browser.tabs.create({url:item.url,active:true});
 await browser.storage.local.set({scheduledSites:data.scheduledSites.filter(x=>x.id!==alarm.name)});
});


// Persistent FoxFlow window. Toolbar icon toggles it open/closed.
let foxflowWindowId=null;
async function findFoxflowWindow(){
 if(foxflowWindowId!==null){try{return await browser.windows.get(foxflowWindowId)}catch(e){foxflowWindowId=null}}
 const target=browser.runtime.getURL('popup.html');
 const wins=await browser.windows.getAll({populate:true});
 const found=wins.find(w=>(w.tabs||[]).some(t=>t.url===target));
 if(found)foxflowWindowId=found.id;
 return found||null;
}
browser.browserAction.onClicked.addListener(async()=>{
 const existing=await findFoxflowWindow();
 if(existing){await browser.windows.remove(existing.id);foxflowWindowId=null;return}
 const created=await browser.windows.create({url:browser.runtime.getURL('popup.html'),type:'popup',width:390,height:680,focused:true});
 foxflowWindowId=created.id;
});
browser.windows.onRemoved.addListener(id=>{if(id===foxflowWindowId)foxflowWindowId=null});
