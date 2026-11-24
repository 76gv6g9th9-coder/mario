(()=>{
 const main=document.getElementById('case-main');if(!main)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),seen=new WeakSet(),active=new Set();
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
 const english=()=>document.documentElement.lang==='en';
 // Continuous zoom applies to complete PDF sheets, preserving their composition.
 const zoom=document.createElement('label');zoom.className='case-zoom';
 zoom.innerHTML='<span class="zoom-label">缩放</span><input type="range" min="70" max="180" step="5" value="80" aria-label="项目内容缩放"><output>80%</output>';
 document.querySelector('.case-header .logo').after(zoom);
 const slider=zoom.querySelector('input'),output=zoom.querySelector('output');
 function headerHeight(){return innerWidth<=760?95:64}
 function sheets(){return [...main.querySelectorAll('.pdf-cover,.pdf-page,.pdf-demo,.gap-demos,.case-panel')]}
 function currentSheet(){const h=headerHeight();return sheets().find(p=>p.getBoundingClientRect().bottom>h+40)||sheets().at(-1)}
 function alignPages(){const available=innerHeight-headerHeight();main.querySelectorAll('.pdf-page').forEach(p=>p.style.scrollMarginTop=(headerHeight()+Math.max(0,(available-p.getBoundingClientRect().height)/2))+'px')}
 function setScale(value){
  const page=currentSheet(),before=page?.getBoundingClientRect().top||0,n=Number(value);
  main.style.setProperty('--case-zoom',n/100);main.classList.toggle('is-zoomed',n!==100);slider.value=String(n);output.value=n+'%';
  main.querySelectorAll('.board-viewport').forEach(v=>v.scrollLeft=Math.max(0,(v.scrollWidth-v.clientWidth)/2));
  main.querySelectorAll('.pdf-cover').forEach(v=>v.scrollLeft=Math.max(0,(v.scrollWidth-v.clientWidth)/2));
  if(page)scrollBy({top:page.getBoundingClientRect().top-before,behavior:'instant'});alignPages();scheduleFocus();
 }
 slider.addEventListener('input',()=>setScale(slider.value));
 const viewer=document.getElementById('image-viewer'),large=document.getElementById('image-large');
 if(viewer&&large){
  const control=document.createElement('label');control.className='viewer-zoom';
  control.innerHTML='<span class="zoom-label">缩放</span><input type="range" min="70" max="300" step="5" value="80" aria-label="图片缩放"><output>80%</output>';
  viewer.querySelector('.image-toolbar>div').prepend(control);
  const range=control.querySelector('input'),out=control.querySelector('output'),stage=viewer.querySelector('.image-stage'),button=document.getElementById('image-zoom');
  function imageScale(value){
   const n=Number(value);viewer.classList.toggle('zoomed',n>100);large.style.width=n+'%';large.style.maxHeight=n===100?'':'none';
   range.value=n;out.value=n+'%';button.setAttribute('aria-pressed',String(n>100));button.textContent=english()?(n===100?'Zoom in':'Fit page'):(n===100?'放大查看':'适应窗口');
   stage.scrollLeft=Math.max(0,(stage.scrollWidth-stage.clientWidth)/2);
  }
  range.addEventListener('input',()=>imageScale(range.value));button.onclick=()=>imageScale(Number(range.value)===100?180:100);
  new MutationObserver(()=>{if(viewer.open)imageScale(80)}).observe(viewer,{attributes:true,attributeFilter:['open']});
  viewer.addEventListener('close',()=>{large.style.removeProperty('width');large.style.removeProperty('max-height')});
 }
 function labels(){
  document.querySelectorAll('.case-zoom .zoom-label,.viewer-zoom .zoom-label').forEach(el=>el.textContent=english()?'Zoom':'缩放');
  slider.setAttribute('aria-label',english()?'Project content zoom':'项目内容缩放');
  viewer?.querySelector('input[type=range]')?.setAttribute('aria-label',english()?'Image zoom':'图片缩放');
 }
 function finish(page,img,canvas){page.classList.remove('reveal-pending','reveal-running','reveal-preparing');page.classList.add('reveal-complete');img.style.removeProperty('opacity');canvas?.remove()}
 async function reveal(page){
  const img=page.querySelector('.board-open img');if(!img)return;
  if(reduced.matches){finish(page,img);return}
  const token={cancel:false};active.add(token);page.classList.add('reveal-preparing');let canvas;
  try{
   await img.decode();if(token.cancel||!page.isConnected){finish(page,img);active.delete(token);return}
   const effect=location.pathname.endsWith('/gap.html')?'glass':'brush';
   page.dataset.revealEffect=effect;page.classList.remove('reveal-preparing');page.classList.add('reveal-running');
   const w=Math.round(Math.min(1200,img.clientWidth)),h=Math.round(w*img.naturalHeight/img.naturalWidth);
   canvas=document.createElement('canvas');canvas.className='reveal-particles reveal-'+effect;canvas.setAttribute('aria-hidden','true');canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d');let seed=Number(page.dataset.pdfPage)||39;
   const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
   function sample(cols,rows){const c=document.createElement('canvas');c.width=cols;c.height=rows;const context=c.getContext('2d',{willReadFrequently:true});context.drawImage(img,0,0,cols,rows);return context.getImageData(0,0,cols,rows).data}
   const preview=sample(32,18),background=`rgb(${preview[0]},${preview[1]},${preview[2]})`;
   let paint,duration;
   if(effect==='brush'){
    // The centered page is revealed by a measured pixel sweep; its preview stays blurred until then.
    const bins=new Map();
    for(let i=0;i<preview.length;i+=4){const r=preview[i],g=preview[i+1],b=preview[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b);if(hi<35||lo>230||hi-lo<16)continue;
     const key=[r>>5,g>>5,b>>5].join(','),v=bins.get(key)||{count:0,r:0,g:0,b:0};v.count++;v.r+=r;v.g+=g;v.b+=b;bins.set(key,v)
    }
    const palette=[...bins.values()].sort((a,b)=>b.count-a.count).slice(0,3).map(v=>`rgb(${Math.round(v.r/v.count)},${Math.round(v.g/v.count)},${Math.round(v.b/v.count)})`);
    if(!palette.length)palette.push('rgb(105,115,125)');
    const cell=w<600?6:8,cols=Math.ceil(w/cell),rows=Math.ceil(h/cell),tiles=[];
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)tiles.push({x:col*cell,y:row*cell,delay:(row/Math.max(1,rows-1))*.66+random()*.16,color:palette[Math.floor(random()*palette.length)],size:cell*(.45+random()*.5)});
    duration=450;
    paint=p=>{
     ctx.clearRect(0,0,w,h);
     for(const tile of tiles){const q=ease((p-tile.delay)/.16);if(q===1)continue;
      ctx.globalAlpha=1-q;ctx.fillStyle=background;ctx.fillRect(tile.x,tile.y,cell+1,cell+1);
      if(q>0&&q<1){ctx.globalAlpha=Math.sin(q*Math.PI)*.85;ctx.fillStyle=tile.color;ctx.fillRect(tile.x,tile.y,tile.size,tile.size)}
     }ctx.globalAlpha=1;
    };
   }else{
    // GAP retains the existing stationary, locally sampled frosted tiles.
    const cell=w<600?14:20,cols=Math.ceil(w/cell),rows=Math.ceil(h/cell),colors=sample(cols,rows),tiles=[];
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
     const i=(row*cols+col)*4;tiles.push({x:col*cell,y:row*cell,color:`rgb(${colors[i]},${colors[i+1]},${colors[i+2]})`,delay:random()*.65});
    }
    duration=1150;
    paint=p=>{
     ctx.clearRect(0,0,w,h);
     for(const tile of tiles){const alpha=1-ease((p-tile.delay)/.35);if(alpha<=0)continue;
      ctx.globalAlpha=alpha;ctx.fillStyle=tile.color;ctx.fillRect(tile.x,tile.y,cell+1,cell+1);
      ctx.fillStyle='rgba(245,248,255,.055)';ctx.fillRect(tile.x,tile.y,cell,cell);
      ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(tile.x,tile.y,cell,1);
     }ctx.globalAlpha=1;
    };
   }
   paint(0);img.parentElement.append(canvas);img.style.opacity='1';const start=performance.now();
   function draw(now){
    if(token.cancel||!page.isConnected||reduced.matches){finish(page,img,canvas);active.delete(token);return}
    const p=Math.min(1,(now-start)/duration);paint(p);
    if(p<1)requestAnimationFrame(draw);else{finish(page,img,canvas);active.delete(token)}
   }
   requestAnimationFrame(draw);
  }catch{finish(page,img,canvas);active.delete(token)}
 }
 let focusFrame=0;
 function scheduleFocus(){if(!reduced.matches&&!focusFrame)focusFrame=requestAnimationFrame(()=>{focusFrame=0;revealFocusedPage()})}
 function revealFocusedPage(){
  if(document.hidden||reduced.matches||document.body.classList.contains('demo-open')||document.documentElement.classList.contains('isc-opening-active')||document.documentElement.classList.contains('portal-arriving'))return;
  const top=headerHeight(),available=innerHeight-top,center=top+available/2;
  const candidates=[...main.querySelectorAll('.reveal-pending[data-reveal-effect="brush"]:not(.reveal-running):not(.reveal-preparing)')].map(page=>{
   const r=page.querySelector('.board-open img').getBoundingClientRect(),visible=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,top))/Math.min(r.height,available);
   const distance=Math.abs((r.top+r.bottom)/2-center),centered=distance<available*.30,aligned=Math.abs(r.top-top)<30,tall=r.height>available&&r.top<=top+25&&r.bottom>=innerHeight-25;
   return {page,distance,eligible:visible>=.72&&(centered||aligned||tall)}
  }).filter(p=>p.eligible).sort((a,b)=>a.distance-b.distance);
  if(candidates.length){observer?.unobserve(candidates[0].page);reveal(candidates[0].page)}
 }
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){if(e.target.dataset.revealEffect==='glass'){observer.unobserve(e.target);reveal(e.target)}else scheduleFocus()}},{threshold:[0,.5,.9]}):null;
 addEventListener('scroll',scheduleFocus,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleFocus()});
 function scan(){
  main.querySelectorAll('.board-open').forEach(button=>{if(button.parentElement.classList.contains('board-viewport'))return;const wrap=document.createElement('div');wrap.className='board-viewport';button.before(wrap);wrap.append(button)});
  main.querySelectorAll('.pdf-page'+(location.pathname.endsWith('/gap.html')?',.pdf-cover':'')).forEach(page=>{if(seen.has(page))return;seen.add(page);if(reduced.matches||!observer)return;page.dataset.revealEffect=location.pathname.endsWith('/gap.html')?'glass':'brush';page.classList.add('reveal-pending');observer.observe(page)});
  main.querySelectorAll('.pdf-page .board-viewport').forEach(wrap=>{const img=wrap.querySelector('img'),ratio=Number(img.getAttribute('width'))/Number(img.getAttribute('height'));wrap.style.setProperty('--sheet-fit',Math.min(wrap.clientWidth,Math.max(180,innerHeight-headerHeight()-24)*ratio)+'px')});
  labels();alignPages();scheduleFocus();
 }
 addEventListener('resize',scan);scan();setScale(80);document.documentElement.classList.add('case-motion-ready');new MutationObserver(scan).observe(main,{childList:true});
 reduced.addEventListener('change',()=>{if(reduced.matches){for(const t of active)t.cancel=true;observer?.disconnect();main.querySelectorAll('.reveal-pending').forEach(p=>{const img=p.querySelector('.board-open img');if(img)finish(p,img)})}});
 addEventListener('pagehide',()=>{if(focusFrame)cancelAnimationFrame(focusFrame);focusFrame=0;for(const t of active)t.cancel=true});
 addEventListener('pageshow',e=>{if(e.persisted){main.querySelectorAll('.reveal-pending').forEach(p=>observer?.observe(p));scheduleFocus()}});
 // A wheel gesture advances one sheet. Zoomed sheets retain intermediate reading stops.
 function stops(){
  const offset=headerHeight(),available=innerHeight-offset,points=[];
  for(const page of sheets()){
   const rect=page.getBoundingClientRect(),height=rect.height;let top=Math.max(0,scrollY+rect.top-offset);if(page.classList.contains('pdf-page'))top=Math.max(0,top-Math.max(0,(available-height)/2));points.push(top);
   if(height>available+90){const remaining=height-available;for(let y=available*.86;y<remaining-40;y+=available*.86)points.push(top+y);points.push(top+remaining)}
  }
  const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  return [...new Set(points.map(y=>Math.round(Math.min(max,y))).concat(max))].sort((a,b)=>a-b);
 }
 function blocked(target){return document.querySelector('dialog[open]')||document.body.classList.contains('demo-open')||document.documentElement.classList.contains('isc-opening-active')||document.documentElement.classList.contains('portal-arriving')||target.closest('input,textarea,select,[contenteditable],.prototype-shell,.image-stage')}
 function step(direction){
  const points=stops(),next=direction>0?points.find(y=>y>scrollY+12):points.findLast(y=>y<scrollY-12);
  if(next!==undefined)scrollTo({top:next,behavior:reduced.matches?'instant':'smooth'});
 }
 // macOS trackpads send long momentum streams with no reliable gesture-end event.
 // Keep their native scrolling; a paging lock must never swallow that stream.
 const nativeMacScroll=/Mac|iPhone|iPad/.test(navigator.platform||'');
 let lastWheel=0,total=0,lockedUntil=0,lastDirection=0;
 addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||blocked(e.target))return;
  if(nativeMacScroll||(e.deltaMode===0&&(Math.abs(e.deltaY)<40||!Number.isInteger(e.deltaY))))return;
  const now=performance.now(),direction=Math.sign(e.deltaY),fresh=now-lastWheel>190||direction!==lastDirection;lastWheel=now;
  if(fresh){total=0;if(direction!==lastDirection)lockedUntil=0}lastDirection=direction;
  if(!direction)return;
  e.preventDefault();if(now<lockedUntil)return;
  total+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(Math.abs(total)<18)return;
  step(Math.sign(total));total=0;lockedUntil=now+(reduced.matches?100:600);
 },{passive:false});
 addEventListener('keydown',e=>{
  if(blocked(e.target)||e.target.closest('a,button')||e.altKey||e.ctrlKey||e.metaKey)return;
  if(['PageDown','PageUp',' '].includes(e.key)){e.preventDefault();step(e.key==='PageUp'||e.shiftKey?-1:1)}
 });
})();
