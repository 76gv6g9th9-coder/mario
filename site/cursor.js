/* One pair of eyes follows the pointer across the page, dialogs and local demos. */
(()=>{
 const fine=matchMedia('(any-hover: hover) and (any-pointer: fine)'),forced=matchMedia('(forced-colors: active)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 root.classList.remove('pixel-cursor');document.querySelectorAll('.pixel-canvas').forEach(el=>el.remove());
 const cursor=document.createElement('div');cursor.className='eye-cursor';cursor.id='mario-eye-cursor';cursor.hidden=true;cursor.setAttribute('aria-hidden','true');
 cursor.innerHTML='<span class="eye-cursor-pair"><span class="cursor-eye"><i class="cursor-pupil"></i></span><span class="cursor-eye"><i class="cursor-pupil"></i></span></span>';
 document.body.append(cursor);
 const records=new Map(),seenFrames=new WeakSet();
 let visible=false,x=0,y=0,lastMove=0,lastFrame=0,vx=0,vy=0,gazeX=0,gazeY=0,targetX=0,targetY=0,raf=0;
 const supported=()=>fine.matches&&!forced.matches;
 function valid(doc){try{return doc===document||doc.defaultView?.document===doc&&doc.defaultView?.frameElement?.isConnected}catch{return false}}
 function syncNative(active){for(const [doc,record] of records){if(!valid(doc)){record.observer.disconnect();records.delete(doc);continue}doc.documentElement?.classList.toggle('eye-cursor-active',active)}}
 function host(){const dialogs=[...document.querySelectorAll('dialog[open]')],target=dialogs.at(-1)||document.body;if(cursor.parentElement!==target)target.append(cursor)}
 function draw(now){
  raf=0;if(!visible)return;
  const elapsed=now-lastMove;
  if(elapsed>125){targetX=0;targetY=0;vx=0;vy=0}
  const dt=Math.min(40,Math.max(1,now-lastFrame||16));lastFrame=now;
  const ease=reduced.matches?1:1-Math.exp(-dt/52);
  gazeX+=(targetX-gazeX)*ease;gazeY+=(targetY-gazeY)*ease;
  if(Math.abs(gazeX)<.01&&targetX===0)gazeX=0;if(Math.abs(gazeY)<.01&&targetY===0)gazeY=0;
  cursor.style.setProperty('--gaze-x',gazeX.toFixed(2)+'px');cursor.style.setProperty('--gaze-y',gazeY.toFixed(2)+'px');
  if(elapsed<140||Math.abs(gazeX-targetX)>.01||Math.abs(gazeY-targetY)>.01)raf=requestAnimationFrame(draw);
 }
 function wake(){if(!raf){lastFrame=performance.now()-16;raf=requestAnimationFrame(draw)}}
 function position(event,win){
  let px=event.clientX,py=event.clientY;
  try{
   while(win!==window){const frame=win.frameElement;if(!frame)return null;const r=frame.getBoundingClientRect(),sx=r.width/(frame.offsetWidth||r.width),sy=r.height/(frame.offsetHeight||r.height);px=r.left+(px+frame.clientLeft)*sx;py=r.top+(py+frame.clientTop)*sy;win=frame.ownerDocument.defaultView}
  }catch{return null}
  return {x:px,y:py};
 }
 function move(event,win){
  if(event.pointerType==='touch'||!supported()){hide();return}
  const point=position(event,win);if(!point)return;
  const now=performance.now(),dt=Math.min(50,Math.max(8,now-lastMove));
  if(visible){vx=vx*.3+(point.x-x)/dt*.7;vy=vy*.3+(point.y-y)/dt*.7}else{vx=0;vy=0;gazeX=0;gazeY=0;host();syncNative(true)}
  x=point.x;y=point.y;lastMove=now;visible=true;cursor.hidden=false;
  const speed=Math.hypot(vx,vy),strength=Math.min(1,speed/.45);
  targetX=speed?vx/speed*strength*3.2:0;targetY=speed?vy/speed*strength*3.8:0;
  cursor.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
  wake();
 }
 function hide(){visible=false;cursor.hidden=true;cursor.classList.remove('is-pressed');syncNative(false);if(raf)cancelAnimationFrame(raf);raf=0;gazeX=gazeY=targetX=targetY=vx=vy=0}
 function bindFrame(frame){
  if(seenFrames.has(frame))return;seenFrames.add(frame);
  const load=()=>{try{if(frame.contentDocument)bindDocument(frame.contentDocument,frame.contentWindow)}catch{}};
  frame.addEventListener('load',load);load();
 }
 function discover(node){if(node.nodeType!==1&&node.nodeType!==9)return;if(node.matches?.('iframe'))bindFrame(node);node.querySelectorAll?.('iframe').forEach(bindFrame)}
 function bindDocument(doc,win){
  if(records.has(doc)||!doc.documentElement)return;
  if(doc!==document){const style=doc.createElement('style');style.textContent='html.eye-cursor-active,html.eye-cursor-active *{cursor:none!important}';(doc.head||doc.documentElement).append(style)}
  doc.addEventListener('pointermove',e=>move(e,win),{passive:true});
  doc.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){hide();return}move(e,win);if(visible)cursor.classList.add('is-pressed')},{passive:true});
  doc.addEventListener('pointerup',()=>cursor.classList.remove('is-pressed'),{passive:true});
  doc.addEventListener('pointercancel',hide,{passive:true});
  doc.documentElement.addEventListener('pointerleave',e=>{try{const next=doc.elementFromPoint(e.clientX,e.clientY);if(next?.tagName==='IFRAME'&&next.contentDocument)return}catch{}hide()},{passive:true});
  const observer=new MutationObserver(changes=>{
   let modalChanged=false;
   for(const change of changes){if(change.type==='attributes'){modalChanged=true;continue}for(const node of change.addedNodes)discover(node)}
   if(doc===document&&modalChanged)host();
  });
  observer.observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
  records.set(doc,{observer});doc.documentElement.classList.toggle('eye-cursor-active',visible&&supported());discover(doc);
 }
 bindDocument(document,window);
 fine.addEventListener('change',hide);forced.addEventListener('change',hide);
 reduced.addEventListener('change',()=>{if(visible)wake()});
 addEventListener('blur',()=>setTimeout(()=>{if(!document.hasFocus())hide()},0));addEventListener('pagehide',hide);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
})();
