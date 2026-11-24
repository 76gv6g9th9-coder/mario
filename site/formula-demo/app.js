(() => {
const $=id=>document.getElementById(id),stage=$('stage'),film=$('film'),still=$('still');
const views={left:$('scrub-left'),right:$('scrub-right')};
let closed=false,busy=false,desired=0,angle=0,raf=0,lastTick=0,returnDone=null;
const clamp=x=>Math.max(-1,Math.min(1,x));
function status(){
 const direction=angle<-.035?'left':angle>.035?'right':'front';
 $('state-label').textContent=closed?'已收回 · 纯粹驾驶':direction==='left'?'左转 · 驾驶数据':direction==='right'?'右转 · 车辆与赛道':'正对 · 赛道计时';
 document.querySelectorAll('[data-target]').forEach(b=>b.classList.toggle('selected',!closed&&b.dataset.target===direction));
 $('xbutton').style.rotate=`${angle*13}deg`;
 $('yaw-value').textContent=(angle>0?'+':'')+angle.toFixed(2);
 $('yaw-marker').style.left=`${50+angle*48}%`;
 document.body.classList.toggle('closed',closed);
 document.body.classList.toggle('sequencing',busy);
 $('wake').hidden=!closed||busy;
 $('fold').disabled=busy;
 if(!busy)$('fold-label').textContent=closed?'唤醒 · 展开':'休眠 · 收回';
 $('fold-note').textContent=closed?'展开显示屏，唤醒座舱交互':'收起显示屏，回归纯粹驾驶';
}
function hideScrub(){Object.values(views).forEach(v=>v.classList.remove('visible'))}
function idle(){
 film.loop=true;film.src='assets/front.mp4';film.onended=null;film.onerror=null;
 film.onplaying=()=>{if(!busy&&!closed&&Math.abs(angle)<.008)film.classList.add('visible')};
 film.play().catch(()=>{});
}
function show(v,side){
 if(closed||busy&&!returnDone||Math.abs(angle)<.008||(angle<0?'left':'right')!==side)return;
 Object.values(views).forEach(other=>other.classList.toggle('visible',other===v));
}
function render(){
 if(closed||busy&&!returnDone)return;
 const side=angle<0?'left':'right',v=views[side];
 if(Math.abs(angle)<.008){
  hideScrub();if(!busy){film.classList.add('visible');if(film.paused)film.play().catch(()=>{})}return;
 }
 film.pause();film.classList.remove('visible');
 if(!Number.isFinite(v.duration)||v.readyState<2||v.seeking)return;
 const time=Math.abs(angle)*Math.max(0,v.duration-1/30);
 v.pause();
 if(Math.abs(v.currentTime-time)>1/65){v.currentTime=time;return}
 show(v,side);
}
Object.entries(views).forEach(([side,v])=>{
 // Initialize each muted decoder before using the video as a seekable frame source.
 v.addEventListener('loadeddata',()=>{v.play().then(()=>{v.pause();schedule()}).catch(schedule)},{once:true});
 v.onseeked=()=>{show(v,side);schedule()};
 for(const event of ['loadedmetadata','loadeddata','canplay'])v.addEventListener(event,schedule);
 v.onerror=()=>{$('error').hidden=false};
});
function tick(now){
 raf=0;const dt=Math.min(50,now-(lastTick||now));lastTick=now;
 angle+=(desired-angle)*(1-Math.exp(-dt/95));
 if(Math.abs(desired-angle)<.004)angle=desired;
 render();status();
 if(returnDone&&Math.abs(angle)<.008){const resolve=returnDone;returnDone=null;hideScrub();resolve()}
 if(Math.abs(desired-angle)>.001)raf=requestAnimationFrame(tick);
}
function schedule(){if(!raf){lastTick=0;raf=requestAnimationFrame(tick)}}
function setAngle(value){if(closed||busy)return;desired=clamp(value);schedule()}
function track(event,element){
 if(event.pointerType==='touch'||event.target.closest('button,input,a,label,.tuning')||closed||busy)return;
 const r=element.getBoundingClientRect(),x=clamp((event.clientX-r.left-r.width/2)/(r.width*.39));
 setAngle(Math.abs(x)<.12?0:Math.sign(x)*(Math.abs(x)-.12)/.88);
}
const interactionArea=document.querySelector('main');
interactionArea.addEventListener('pointermove',e=>track(e,interactionArea));
const controller=document.querySelector('.control-center');
// Use one coordinate system across the scene, including its surrounding space.
interactionArea.addEventListener('touchmove',e=>{if(busy||closed||!e.touches.length||e.target.closest('button,input,a,label,.tuning'))return;e.preventDefault();const r=interactionArea.getBoundingClientRect();setAngle((e.touches[0].clientX-r.left-r.width/2)/(r.width*.39))},{passive:false});
async function fold(){
 if(busy)return;busy=true;status();$('error').hidden=true;
 const wasClosed=closed;
 $('sequence').hidden=false;
 function phase(label,code,progress){
  $('phase-label').textContent=label;$('phase-code').textContent=code;
  $('phase-bar').style.width=progress+'%';$('phase-value').textContent=Math.round(progress)+'%';
  $('fold-label').textContent=label;
 }
 try{
  if(!closed&&Math.abs(angle)>.008){
   phase('校准 · 回正','ALIGNING / X-AXIS',0);
   $('motion-label').textContent='正在回正…';desired=0;await new Promise(resolve=>{returnDone=resolve;schedule()});
  }
  film.pause();hideScrub();film.classList.remove('visible');
  const clip=closed?'open':'close';still.src=`assets/${clip}-start.jpg`;
  $('motion-label').textContent=closed?'正在翻出屏幕…':'正在收回屏幕…';
  phase(closed?'苏醒 · 展开':'休眠 · 收回',closed?'AWAKENING / DEPLOY':'HIBERNATING / RETRACT',0);
  film.loop=false;film.src=`assets/${clip}.mp4`;
  film.ontimeupdate=()=>{if(Number.isFinite(film.duration)&&film.duration>0)phase(closed?'苏醒 · 展开':'休眠 · 收回',closed?'AWAKENING / DEPLOY':'HIBERNATING / RETRACT',film.currentTime/film.duration*100)};
  await new Promise((resolve,reject)=>{
   film.onplaying=()=>film.classList.add('visible');film.onended=resolve;film.onerror=reject;film.play().catch(reject);
  });
  closed=!closed;still.src=`assets/${clip}-end.jpg`;film.classList.remove('visible');
 }catch(e){closed=wasClosed;$('error').hidden=false;film.classList.remove('visible');still.src=closed?'assets/close-end.jpg':'assets/front-start.jpg'}
 finally{film.ontimeupdate=null;film.onerror=null;busy=false;desired=angle=0;$('sequence').hidden=true;status();$('motion-label').textContent=closed?'休眠就绪 · 点击 X 唤醒':'移动鼠标左右转向 · 居中回正';if(!closed)idle()}
}
$('fold').onclick=fold;
$('wake').onclick=fold;
$('retry').onclick=()=>{$('error').hidden=true;Object.values(views).forEach(v=>v.load());if(!closed)idle();schedule()};
function tuning(){
 for(const id of ['size','glow','light'])$(id+'-value').value=$(id).value+'%';
 document.documentElement.style.setProperty('--size',+$('size').value/100);
 document.documentElement.style.setProperty('--glow',+$('glow').value*.55+'px');
 document.documentElement.style.setProperty('--brightness',+$('light').value/100);
 document.documentElement.style.setProperty('--wash',Math.max(0,+$('light').value-100)/100);
}
for(const id of ['size','glow','light'])$(id).oninput=tuning;
$('reset').onclick=()=>{$('size').value=100;$('glow').value=45;$('light').value=100;tuning();setAngle(0)};
function focus(){const on=document.body.classList.toggle('immersive');$('exit-focus').hidden=!on}
$('focus').onclick=focus;$('exit-focus').onclick=focus;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){focus()}};
window.addEventListener('keydown',e=>{
 if(e.target.matches('input')||e.altKey||e.ctrlKey||e.metaKey)return;
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
 if(e.key==='ArrowLeft')setAngle(-1);if(e.key==='ArrowRight')setAngle(1);if(e.key==='ArrowUp')setAngle(0);if(e.key==='ArrowDown')fold();
 if(e.key==='Escape'&&document.body.classList.contains('immersive'))focus();
});
for(const key of ['open','close','front'])for(const end of ['start','end']){const img=new Image();img.src=`assets/${key}-${end}.jpg`}
status();tuning();idle();
})();
