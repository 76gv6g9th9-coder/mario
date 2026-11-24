(()=>{
 const grid=document.querySelector('.cursor-grid');if(!grid)return;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
 canvas.setAttribute('aria-hidden','true');grid.append(canvas);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),radius=200,size=radius*2,spacing=18;
 let x=0,y=0,lastMove=0,frame=0,ratio=1,flow=[],field=[],lastPaint=0;
 function resize(){
  ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(size*ratio);canvas.height=Math.round(size*ratio);
  canvas.style.width=size+'px';canvas.style.height=size+'px';
  if(grid.classList.contains('grid-active'))draw(performance.now());
 }
 // Recent pointer movement drags the lattice; its wake drifts and relaxes in place.
 function warp(px,py){
  let dx=0,dy=0,weight=0;
  for(const f of field){
   const rx=px-f.x,ry=py-f.y,distance=Math.hypot(rx,ry),influence=Math.exp(-(rx*rx+ry*ry)/(2*66*66))*f.energy;
   const ripple=Math.sin(distance/28-f.age*.009)*1.8;
   dx+=(f.dx-f.ny*ripple)*influence;dy+=(f.dy+f.nx*ripple)*influence;weight+=influence;
  }
  dx=12*Math.tanh(dx/(12*(1+weight*.55)));dy=12*Math.tanh(dy/(12*(1+weight*.55)));
  return [px-x+radius+dx,py-y+radius+dy];
 }
 function mesh(){
  ctx.beginPath();
  for(let axis=0;axis<2;axis++){
   const center=axis?y:x,along=axis?x:y;
   for(let line=Math.floor((center-radius)/spacing)*spacing;line<=center+radius;line+=spacing){
    let first=true;
    for(let p=along-radius;p<=along+radius;p+=12){
     const point=axis?warp(p,line):warp(line,p);
     if(first){ctx.moveTo(...point);first=false}else ctx.lineTo(...point);
    }
   }
  }
 }
 function draw(now){
  if(frame)cancelAnimationFrame(frame);frame=0;
  if(!reduced.matches&&now-lastPaint<32){frame=requestAnimationFrame(draw);return}lastPaint=now;
  const age=now-lastMove,energy=reduced.matches?0:Math.max(0,1-age/900),phase=now*.0032;
  flow=flow.filter(f=>now-f.time<800);
  field=reduced.matches?[]:flow.map(f=>{
   const age=now-f.time,speed=Math.hypot(f.dx,f.dy)||1;
   return {...f,age,x:f.x+f.dx*age*.002,y:f.y+f.dy*age*.002,energy:Math.exp(-age/300),nx:f.dx/speed,ny:f.dy/speed};
  });
  canvas.style.transform=`translate3d(${x-radius}px,${y-radius}px,0)`;
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,size,size);ctx.lineWidth=.5;
  mesh();ctx.strokeStyle='rgba(90,105,120,.16)';ctx.stroke();
  const gx=radius+Math.cos(phase)*75,gy=radius+Math.sin(phase*.8)*48;
  const glow=ctx.createRadialGradient(gx,gy,0,gx,gy,100);
  glow.addColorStop(0,`rgba(110,145,185,${.20*energy})`);glow.addColorStop(1,'rgba(110,145,185,0)');
  ctx.strokeStyle=glow;ctx.stroke();
  const fade=ctx.createRadialGradient(radius,radius,25,radius,radius,radius);
  fade.addColorStop(0,'#000');fade.addColorStop(1,'transparent');
  ctx.globalCompositeOperation='destination-in';ctx.fillStyle=fade;ctx.fillRect(0,0,size,size);ctx.globalCompositeOperation='source-over';
  if(energy>0&&!reduced.matches)frame=requestAnimationFrame(draw);
 }
 function hide(){grid.classList.remove('grid-active');if(frame)cancelAnimationFrame(frame);frame=0;flow=[];field=[];lastMove=0}
 document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||document.body.classList.contains('in-intro')){hide();return}
  const zoom=Number(getComputedStyle(document.getElementById('site')).zoom)||1,px=e.clientX/zoom,py=e.clientY/zoom;
  const now=performance.now(),dt=Math.max(8,now-lastMove),dx=px-x,dy=py-y;
  if(!reduced.matches&&lastMove&&dt<180&&Math.hypot(dx,dy)>.4){
   const scale=16/dt*.75,limit=v=>Math.max(-30,Math.min(30,v));
   flow.push({x:px,y:py,dx:limit(dx*scale),dy:limit(dy*scale),time:now});
   if(flow.length>8)flow.shift();
  }
  x=px;y=py;lastMove=now;grid.classList.add('grid-active');if(!frame)frame=requestAnimationFrame(draw);
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);addEventListener('blur',hide);addEventListener('pagehide',hide);addEventListener('resize',resize);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
 reduced.addEventListener('change',()=>{if(grid.classList.contains('grid-active'))draw(performance.now())});
 resize();
})();
