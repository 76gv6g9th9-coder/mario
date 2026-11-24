(()=>{
 const rig=document.querySelector('.badge-rig'),swing=document.querySelector('.badge-swing'),strap=document.querySelector('.badge-strap'),card=document.querySelector('.profile-card'),work=document.getElementById('work');
 if(!rig||!swing||!strap||!card||!work)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let x=0,y=0,vx=0,vy=0,angle=0,spin=0,hoverAngle=0,base=67,lastTime=0,frame=0,drag=null,cooldown=0,hoverX=0,entryDrop=null,entrySpring=false;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ribbon=document.createElementNS('http://www.w3.org/2000/svg','svg'),ribbonPath=document.createElementNS('http://www.w3.org/2000/svg','path');
 ribbon.classList.add('badge-ribbon');ribbon.setAttribute('aria-hidden','true');ribbon.append(ribbonPath);strap.replaceChildren(ribbon);
 function render(){
  const pull=clamp(y/205,0,1),depth=pull*165,pitch=reduced.matches?0:pull*7,yaw=reduced.matches?0:pull*clamp(x/23,-5,5);
  const radians=angle*Math.PI/180,rx=pitch*Math.PI/180,ry=yaw*Math.PI/180;
  // Project the strap attachment through the same camera as the card and hardware.
  function project(px,py){
   const a=px*Math.cos(radians)-py*Math.sin(radians),b=px*Math.sin(radians)+py*Math.cos(radians);
   const c=a*Math.cos(ry),z=-a*Math.sin(ry),screenY=b*Math.cos(rx)-z*Math.sin(rx),screenZ=b*Math.sin(rx)+z*Math.cos(rx);
   const scale=900/(900-depth-screenZ);
   return {x:x+c*scale,y:base+21+y+screenY*scale+1};
  }
  const half=base===55?12:13,left=project(-half,-21),right=project(half,-21),middle=project(0,-21);
  const minX=Math.min(-half,left.x,right.x)-2,maxX=Math.max(half,left.x,right.x)+2,height=Math.max(20,left.y,right.y);
  swing.style.setProperty('--badge-x',x.toFixed(2)+'px');swing.style.setProperty('--badge-y',y.toFixed(2)+'px');swing.style.setProperty('--badge-angle',angle.toFixed(3)+'deg');
  swing.style.setProperty('--badge-depth',depth.toFixed(2)+'px');swing.style.setProperty('--badge-pitch',pitch.toFixed(3)+'deg');swing.style.setProperty('--badge-yaw',yaw.toFixed(3)+'deg');
  swing.style.setProperty('--strap-left',minX.toFixed(2)+'px');swing.style.setProperty('--strap-width',(maxX-minX).toFixed(2)+'px');swing.style.setProperty('--strap-height',height.toFixed(2)+'px');
  ribbon.setAttribute('viewBox',`0 0 ${maxX-minX} ${height}`);
  const f=n=>n.toFixed(2),lx=left.x-minX,rx2=right.x-minX,tl=-half-minX,tr=half-minX;
  ribbonPath.setAttribute('d',`M ${f(tl)} 0 L ${f(lx)} ${f(left.y)} L ${f(rx2)} ${f(right.y)} L ${f(tr)} 0 Z`);
 }
 function measure(){base=parseFloat(getComputedStyle(swing).getPropertyValue('--strap-base'))||67;render()}
 function draw(now){
  frame=0;
  const dt=Math.min(.03,Math.max(.001,(now-lastTime)/1000||.016));lastTime=now;
  if(!drag){
   if(reduced.matches){x=y=vx=vy=angle=spin=0}
   else if(entryDrop!==null){
    const t=clamp((now-entryDrop)/600,0,1),fall=(1-Math.cos(Math.PI*t))/2;
    y=-155+285*fall;angle=-5+7*fall;vy=285*Math.PI/1.2*Math.sin(Math.PI*t);
    if(t===1){entryDrop=null;y=130;vy=0;angle=2;spin=-22}
   }else{
    vx+=(-x*44-vx*8.5)*dt;vy+=(-y*(entrySpring?28:66)-vy*(entrySpring?5.5:9.3))*dt;x+=vx*dt;y+=vy*dt;
    spin+=((hoverAngle-angle)*(entrySpring?20:32)-spin*(entrySpring?4.4:4.8))*dt;angle+=spin*dt;
    if(y< -30){y=-30;vy=Math.max(0,vy)*.3}
    angle=clamp(angle,-12,12);
   }
  }
  render();
  const moving=Math.abs(x)>.04||Math.abs(y)>.04||Math.abs(vx)>.1||Math.abs(vy)>.1||Math.abs(angle-hoverAngle)>.01||Math.abs(spin)>.03;
  if(!drag&&moving)frame=requestAnimationFrame(draw);
  else if(!drag){entrySpring=false;x=y=vx=vy=spin=0;angle=hoverAngle;rig.classList.remove('is-rebounding');render()}
 }
 function wake(){if(!frame){lastTime=performance.now()-16;frame=requestAnimationFrame(draw)}}
 function goToWork(){
  work.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
  history.replaceState(null,'',location.pathname+location.search+'#work');
 }
 function horizontal(e){const r=rig.getBoundingClientRect();return clamp((e.clientX-r.left-r.width/2)/(r.width/2),-1,1)}
 card.tabIndex=0;card.setAttribute('aria-label','拖动工牌，松开后浏览作品案例');
 card.querySelectorAll('img').forEach(img=>img.draggable=false);
 card.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('a,button,input,textarea,[contenteditable="true"]'))return;
  entryDrop=null;entrySpring=false;entryAnimation?.cancel();rig.classList.remove('is-rebounding');rig.classList.add('is-dragging');
  drag={scale:rig.getBoundingClientRect().width/(rig.offsetWidth||rig.getBoundingClientRect().width),id:e.pointerId,startX:e.clientX,startY:e.clientY,originX:x,originY:y,lastX:e.clientX,lastY:e.clientY,lastTime:performance.now(),speedX:0,speedY:0,moved:false};
  hoverAngle=0;vx=vy=spin=0;card.setPointerCapture(e.pointerId);e.preventDefault();
 });
 card.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const now=performance.now(),dt=Math.max(.008,(now-drag.lastTime)/1000),dx=(e.clientX-drag.startX)/drag.scale,dy=(e.clientY-drag.startY)/drag.scale;
  if(Math.hypot(dx,dy)>7)drag.moved=true;
  drag.speedX=drag.speedX*.55+(e.clientX-drag.lastX)/drag.scale/dt*.45;drag.speedY=drag.speedY*.55+(e.clientY-drag.lastY)/drag.scale/dt*.45;
  const pull=dy>125?125+(dy-125)*.38:dy;
  x=clamp(drag.originX+dx*.9,-115,115);y=clamp(drag.originY+pull,-18,205);angle=clamp(-dx*.045,-8,8);
  drag.lastX=e.clientX;drag.lastY=e.clientY;drag.lastTime=now;render();
 },{passive:true});
 function release(e,cancelled=false){
  if(!drag||e.pointerId!==drag.id)return;
  const current=drag;drag=null;rig.classList.remove('is-dragging');rig.classList.add('is-rebounding');hoverAngle=0;cooldown=performance.now()+1300;
  if(card.hasPointerCapture(current.id))card.releasePointerCapture(current.id);
  vx=clamp(current.speedX*.12,-100,100);vy=clamp(current.speedY*.1,-110,110);
  spin=clamp(-current.speedX*.018,-22,22)+(x>=0?-12:12);wake();
  if(current.moved&&!cancelled)goToWork();
 }
 card.addEventListener('pointerup',e=>release(e));card.addEventListener('pointercancel',e=>release(e,true));card.addEventListener('lostpointercapture',e=>release(e,true));
 card.addEventListener('keydown',e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();hoverAngle=0;y=42;vy=-65;spin=15;rig.classList.add('is-rebounding');wake();goToWork()}});
 rig.addEventListener('pointerenter',e=>{if(drag||e.pointerType==='touch'||reduced.matches||performance.now()<cooldown)return;hoverX=e.clientX;const n=horizontal(e);hoverAngle=n*2.6;spin+=(n||.6)*21;wake()},{passive:true});
 rig.addEventListener('pointermove',e=>{if(drag||e.pointerType==='touch'||reduced.matches||performance.now()<cooldown)return;hoverAngle=horizontal(e)*3;spin=clamp(spin+(e.clientX-hoverX)*.09,-38,38);hoverX=e.clientX;wake()},{passive:true});
 rig.addEventListener('pointerleave',()=>{if(drag)return;hoverAngle=0;wake()},{passive:true});
 reduced.addEventListener('change',()=>{hoverAngle=0;wake()});addEventListener('resize',measure);
 addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;drag=null;entryDrop=null;entrySpring=false;x=y=vx=vy=angle=spin=hoverAngle=0;rig.classList.remove('is-dragging','is-rebounding');render()});
 measure();
 let entryAnimation;
 addEventListener('mario-home-enter',()=>{
  document.body.classList.remove('badge-entry-pending');entryAnimation?.cancel();
  if(reduced.matches)return;
  cooldown=performance.now()+2600;entrySpring=true;hoverAngle=0;x=vx=0;y=-155;vy=0;angle=-5;spin=0;entryDrop=performance.now();render();wake();
  entryAnimation=rig.animate([{opacity:0},{opacity:1}],{duration:110,easing:'linear'});
 });
})();
