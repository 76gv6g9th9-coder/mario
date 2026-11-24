(()=>{
 const $=id=>document.getElementById(id),stage=$('stage'),film=$('film'),still=$('still'),views={left:$('scrub-left'),right:$('scrub-right')};
 const english=new URLSearchParams(location.search).get('lang')==='en',t=(zh,en)=>english?en:zh;
 document.documentElement.lang=english?'en':'zh-CN';
 document.querySelectorAll('[data-zh]').forEach(el=>el.textContent=el.dataset[english?'en':'zh']);
 $('fullscreen').setAttribute('aria-label',t('全屏体验','Fullscreen experience'));
 const maxYaw=18,tickStep=1.5,tickSpacing=14;
 $('scale-track').innerHTML=Array.from({length:25},(_,i)=>{const a=(i-12)*tickStep,major=i%4===0;return `<span class="tick ${major?'major':''}">${major?`<b>${a>0?'+':''}${a}°</b>`:''}</span>`}).join('');
 let state='sleeping',angle=0,desired=0,raf=0,lastTick=0,returnDone=null,readyTimer=0,readyAt=0;
 const clamp=v=>Math.max(-1,Math.min(1,v)),canTurn=()=>state==='ready';
 function status(){
  stage.dataset.state=state;
  const direction=angle<-.035?'left':angle>.035?'right':'front';
  const messages={sleeping:[t('屏幕未唤醒','Display asleep'),t('点击唤醒，开启交互','Wake the display to begin')],waking:[t('正在唤醒','Waking display'),t('屏幕正在展开','Deploying display')],settling:[t('屏幕已唤醒','Display awake'),t('即将就绪…','Almost ready…')],ready:[direction==='left'?t('向左转动','Turning left'):direction==='right'?t('向右转动','Turning right'):t('屏幕正对','Facing forward'),t('随鼠标转动，居中回正','Move across the scene; center to reset')],centering:[t('正在回正','Centering display'),t('准备收回屏幕','Preparing to retract')],closing:[t('正在收回','Retracting display'),t('回归纯粹驾驶','Returning to pure driving')]};
  const labels=messages[state];$('state-label').textContent=labels[0];$('motion-label').textContent=labels[1];
  $('wake').hidden=state!=='sleeping';$('fold').hidden=!['ready','settling','centering','closing'].includes(state);$('fold').disabled=!canTurn();
  $('rotation-guide').hidden=!canTurn();
  const degrees=angle*maxYaw;$('yaw-value').textContent=(degrees>.05?'+':'')+degrees.toFixed(0)+'°';
  $('scale-track').style.transform=`translateX(calc(-50% + 7px - ${degrees/tickStep*tickSpacing}px))`;
 }
 function setState(value){state=value;status()}
 function hideScrub(){Object.values(views).forEach(v=>v.classList.remove('visible'))}
 function idle(){
  film.pause();film.onended=null;film.ontimeupdate=null;film.onerror=()=>{$('error').hidden=false};film.loop=true;film.src='assets/front.mp4';
  film.onplaying=()=>{if(['ready','settling'].includes(state)&&Math.abs(angle)<.008)film.classList.add('visible')};
  film.play().catch(()=>{});
 }
 function show(v,side){
  if(!['ready','centering'].includes(state)||Math.abs(angle)<.008||(angle<0?'left':'right')!==side)return;
  Object.values(views).forEach(other=>other.classList.toggle('visible',other===v));
 }
 function render(){
  if(!['ready','centering'].includes(state))return;
  if(Math.abs(angle)<.008){hideScrub();if(state==='ready'){film.classList.add('visible');if(film.paused)film.play().catch(()=>{})}return}
  const side=angle<0?'left':'right',v=views[side];film.pause();film.classList.remove('visible');
  if(!Number.isFinite(v.duration)||v.readyState<2||v.seeking)return;
  const time=Math.abs(angle)*Math.max(0,v.duration-1/30);v.pause();
  if(Math.abs(v.currentTime-time)>1/65){v.currentTime=time;return}show(v,side);
 }
 Object.entries(views).forEach(([side,v])=>{
  v.addEventListener('loadeddata',()=>{v.play().then(()=>{v.pause();schedule()}).catch(schedule)},{once:true});
  v.onseeked=()=>{show(v,side);schedule()};
  for(const event of ['loadedmetadata','loadeddata','canplay'])v.addEventListener(event,schedule);
  v.onerror=()=>{$('error').hidden=false};
 });
 function tick(now){
  raf=0;const dt=Math.min(50,now-(lastTick||now));lastTick=now;
  angle+=(desired-angle)*(1-Math.exp(-dt/95));if(Math.abs(desired-angle)<.004)angle=desired;
  render();status();
  if(returnDone&&Math.abs(angle)<.008){const done=returnDone;returnDone=null;hideScrub();done()}
  if(Math.abs(desired-angle)>.001)raf=requestAnimationFrame(tick);
 }
 function schedule(){if(!raf){lastTick=0;raf=requestAnimationFrame(tick)}}
 function setAngle(value){if(!canTurn())return;desired=clamp(value);schedule()}
 function track(clientX){const r=stage.getBoundingClientRect(),a=clamp((clientX-r.left-r.width/2)/(r.width*.39));setAngle(Math.abs(a)<.12?0:Math.sign(a)*(Math.abs(a)-.12)/.88)}
 stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!canTurn()||e.target.closest('button,.demo-bottom'))return;track(e.clientX)},{passive:true});
 stage.addEventListener('touchmove',e=>{if(!canTurn()||!e.touches.length||e.target.closest('button,.demo-bottom'))return;e.preventDefault();track(e.touches[0].clientX)},{passive:false});
 async function setStill(source){still.src=source;try{await still.decode()}catch{}}
 async function sequence(){
  if(!['sleeping','ready'].includes(state))return;
  clearTimeout(readyTimer);readyAt=0;const opening=state==='sleeping';$('error').hidden=true;
  setState(opening?'waking':'centering');$('sequence').hidden=false;
  function phase(){
   const progress=Number.isFinite(film.duration)&&film.duration>0?Math.min(1,film.currentTime/film.duration):0;
   $('phase-label').textContent=opening?t('正在唤醒屏幕','Waking display'):state==='centering'?t('正在回正','Centering display'):t('正在收回屏幕','Retracting display');
   $('phase-value').textContent=Math.round(progress*100)+'%';$('phase-bar').style.width=progress*100+'%';
  }
  $('phase-bar').style.width='0%';$('phase-value').textContent='0%';phase();
  try{
   if(!opening&&Math.abs(angle)>.008){desired=0;await new Promise(resolve=>{returnDone=resolve;schedule()})}
   const clip=opening?'open':'close';setState(opening?'waking':'closing');
   film.pause();film.onplaying=null;film.onended=null;film.onerror=null;film.ontimeupdate=null;film.classList.remove('visible');hideScrub();
   await setStill(`assets/${clip}-start.jpg`);film.loop=false;film.src=`assets/${clip}.mp4`;film.ontimeupdate=phase;
   await new Promise((resolve,reject)=>{film.onplaying=()=>film.classList.add('visible');film.onended=resolve;film.onerror=reject;film.play().catch(reject)});
   await setStill(`assets/${clip}-end.jpg`);film.classList.remove('visible');film.ontimeupdate=null;film.onerror=null;film.onended=null;
   desired=angle=0;$('sequence').hidden=true;
   if(opening){
    setState('settling');idle();readyAt=performance.now()+1000;
    readyTimer=setTimeout(()=>{readyTimer=0;setState('ready')},1000);
   }else{film.pause();setState('sleeping')}
  }catch{
   film.pause();film.onended=null;film.onerror=null;film.ontimeupdate=null;film.classList.remove('visible');hideScrub();desired=angle=0;returnDone=null;
   await setStill(opening?'assets/close-end.jpg':'assets/front-start.jpg');setState(opening?'sleeping':'ready');$('sequence').hidden=true;$('error').hidden=false;
  }
 }
 $('wake').onclick=sequence;$('fold').onclick=sequence;
 $('retry').onclick=()=>{$('error').hidden=true;Object.values(views).forEach(v=>v.load());if(state==='sleeping')sequence();else{idle();schedule()}};
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
 addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||e.target.matches('input'))return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
  if(e.key==='ArrowLeft')setAngle(-1);if(e.key==='ArrowRight')setAngle(1);if(e.key==='ArrowUp')setAngle(0);if(e.key==='ArrowDown')sequence();
 });
 addEventListener('pagehide',()=>{clearTimeout(readyTimer);if(raf)cancelAnimationFrame(raf);film.pause();Object.values(views).forEach(v=>v.pause())});
 addEventListener('pageshow',e=>{if(e.persisted){if(state==='settling'){const remaining=Math.max(0,readyAt-performance.now());readyTimer=setTimeout(()=>setState('ready'),remaining)}if(['ready','settling'].includes(state))idle()}});
 for(const clip of ['open','close'])for(const end of ['start','end']){const img=new Image();img.src=`assets/${clip}-${end}.jpg`}
 status();
})();
