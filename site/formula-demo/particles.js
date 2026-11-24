(() => {
const canvas=document.getElementById('particles'),ctx=canvas.getContext('2d');
const toggle=document.getElementById('effects');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let enabled=!reduced.matches,w=0,h=0,scale=1,particles=[],raf=0,last=0,lastPointer=null;
function resize(){scale=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*scale;canvas.height=h*scale;ctx.setTransform(scale,0,0,scale,0,0)}
function sync(){toggle.textContent=enabled?'粒子 ON':'粒子 OFF';toggle.setAttribute('aria-pressed',String(enabled));if(!enabled){particles=[];ctx.clearRect(0,0,w,h)}}
toggle.onclick=()=>{enabled=!enabled&&!reduced.matches;sync()};
reduced.addEventListener('change',()=>{enabled=!reduced.matches;sync()});
function draw(now){
 const dt=Math.min(40,now-(last||now));last=now;ctx.clearRect(0,0,w,h);
 particles=particles.filter(p=>p.age<p.life);
 ctx.globalCompositeOperation='lighter';
 for(const p of particles){
  p.age+=dt;const t=p.age/p.life,alpha=Math.max(0,1-t)*p.alpha;
  p.x+=p.vx*dt*.035;
  ctx.globalAlpha=alpha;ctx.strokeStyle=p.cool?'#9cbdb6':'#e8b957';ctx.fillStyle=p.cool?'#c4d4c8':'#ffcf76';
  ctx.lineWidth=p.width;ctx.shadowColor='#efba4f';ctx.shadowBlur=p.bright?8:0;
  const length=p.length*(.45+t*.9),dir=p.dir;
  if(p.kind===0){
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+length*.65*dir,p.y);ctx.lineTo(p.x+length*.65*dir,p.y+p.step);ctx.lineTo(p.x+length*dir,p.y+p.step);ctx.stroke();
   ctx.fillRect(p.x+length*dir-1,p.y+p.step-1,2,2);
  }else if(p.kind===1){
   const size=p.size*(1-t*.35);ctx.fillRect(p.x,p.y,size,size);
   if(p.bright){ctx.globalAlpha=alpha*.25;ctx.strokeRect(p.x-3,p.y-3,size+6,size+6)}
  }else{
   const grad=ctx.createLinearGradient(p.x,p.y,p.x+length*dir,p.y);grad.addColorStop(0,'#b68a3100');grad.addColorStop(.7,'#eeb343');grad.addColorStop(1,'#ffe7a0');ctx.strokeStyle=grad;
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+length*dir,p.y);ctx.stroke();
  }
 }
 ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 if(particles.length)raf=requestAnimationFrame(draw);else{raf=0;last=0;ctx.clearRect(0,0,w,h)}
}
addEventListener('pointermove',e=>{
 if(!enabled||e.pointerType==='touch')return;
 const now=performance.now(),old=lastPointer;
 if(!old){lastPointer={x:e.clientX,y:e.clientY,t:now};return}
 if(now-old.t<18||Math.hypot(e.clientX-old.x,e.clientY-old.y)<2)return;
 lastPointer={x:e.clientX,y:e.clientY,t:now};
 const speed=Math.min(30,Math.hypot(e.clientX-old.x,e.clientY-old.y));
 const dir=e.clientX>=old.x?1:-1;
 // Quiet, orthogonal circuits and metallic micro-squares echo the reference.
 for(let i=0;i<Math.min(5,2+Math.floor(speed/8));i++){
  particles.push({x:e.clientX+(Math.random()-.5)*18,y:e.clientY+(Math.random()-.5)*52,vx:-dir*(.2+Math.random()*.8),dir:-dir,age:0,life:650+Math.random()*800,alpha:.35+Math.random()*.4,width:Math.random()>.85?1.2:.55,length:12+Math.random()*75,step:Math.round((Math.random()-.5)*4)*6,kind:Math.random()<.5?0:Math.random()<.6?1:2,size:1+Math.random()*3,bright:Math.random()>.78,cool:Math.random()>.8});
 }
 if(particles.length>150)particles.splice(0,particles.length-150);
 if(!raf)raf=requestAnimationFrame(draw);
},{passive:true});
addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){particles=[];if(raf)cancelAnimationFrame(raf);raf=0;last=0;ctx.clearRect(0,0,w,h)}});
resize();sync();
})();

