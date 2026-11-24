(()=>{
 const stage=document.querySelector('.personal-stage');if(!stage)return;
 const layer=document.createElement('div'),windowEl=document.createElement('div'),video=document.createElement('video');
 layer.className='pointer-motion';windowEl.className='motion-window';layer.setAttribute('aria-hidden','true');
 video.src='assets/home-reveal-motion.mp4?v=48';video.poster='assets/home-reveal-motion.jpg?v=48';video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.setAttribute('playsinline','');video.setAttribute('disablepictureinpicture','');video.tabIndex=-1;
 windowEl.append(video);layer.append(windowEl);stage.prepend(layer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)'),radius=280;
 let active=false,inView=true,lastPoint=null,metrics,raf=0,previous=0,x=0,y=0,targetX=0,targetY=0,playPending=false;
 function playback(){
  const allowed=inView&&fine.matches&&!document.hidden&&!document.body.classList.contains('in-intro')&&!reduced.matches;
  if(!allowed){video.pause();return}
  if(video.paused&&!playPending){playPending=true;video.play().catch(()=>{}).finally(()=>playPending=false)}
 }
 function hide(){active=false;layer.classList.remove('is-visible');if(raf)cancelAnimationFrame(raf);raf=0;previous=0}
 function draw(now){
  raf=0;if(!active)return;
  const dt=Math.min(40,Math.max(1,now-previous||16)),ease=1-Math.exp(-dt/32);previous=now;
  x+=(targetX-x)*ease;y+=(targetY-y)*ease;
  windowEl.style.transform=`translate3d(${(x-radius).toFixed(2)}px,${(y-radius).toFixed(2)}px,0)`;
  video.style.transform=`translate3d(${(radius-x).toFixed(2)}px,${(radius-y).toFixed(2)}px,0)`;
  if(Math.abs(targetX-x)>.08||Math.abs(targetY-y)>.08)raf=requestAnimationFrame(draw);
 }
 function update(point){
  if(!point||!metrics||document.hidden||document.body.classList.contains('in-intro')||!fine.matches){hide();return}
  const r=metrics.rect;if(point.x<r.left||point.x>r.right||point.y<r.top||point.y>r.bottom){hide();return}
  targetX=(point.x-r.left)/metrics.scale;targetY=(point.y-r.top)/metrics.scale;
  if(!active){active=true;x=targetX;y=targetY;previous=0;layer.classList.add('is-visible')}
  if(!raf)raf=requestAnimationFrame(draw);playback();
 }
 function measure(){
  const rect=stage.getBoundingClientRect(),w=stage.offsetWidth,h=stage.offsetHeight;metrics={rect,scale:rect.width/(w||rect.width)};
  video.style.width=w+'px';video.style.height=h+'px';if(active)update(lastPoint);
 }
 stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch'){hide();return}lastPoint={x:e.clientX,y:e.clientY};update(lastPoint)},{passive:true});
 stage.addEventListener('pointerleave',hide);addEventListener('scroll',measure,{passive:true});addEventListener('resize',measure);
 addEventListener('blur',hide);addEventListener('pagehide',()=>{hide();video.pause()});addEventListener('pageshow',()=>{measure();playback()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();playback()});fine.addEventListener('change',()=>{hide();playback()});reduced.addEventListener('change',playback);
 new MutationObserver(()=>{if(document.body.classList.contains('in-intro'))hide();playback()}).observe(document.body,{attributes:true,attributeFilter:['class']});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting&&entries[0].intersectionRatio>.08;if(!inView)hide();playback()},{threshold:[0,.08]}).observe(stage);
 measure();playback();
})();
