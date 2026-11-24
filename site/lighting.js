let caseLang='zh';
const ct=(zh,en)=>caseLang==='zh'?zh:en;
const chapters=[["launch", 31, "方程豹设计发布会动态视觉", "Launch visuals"], ["screens", 32, "发布会截图", "Launch screenshots"], ["challenge", 33, "项目挑战", "Project challenges"], ["review", 34, "后续复盘", "Retrospective"], ["ambient", 35, "氛围灯设计", "Ambient lighting"], ["background", 36, "项目背景", "Project background"], ["result", 37, "项目结果", "Project results"], ["coordination", 38, "项目难点", "Project challenges"]];
let imageTrigger,progressFrame=0;
const viewer=document.getElementById('image-viewer');
const asset=p=>`assets/lighting-full/page-${String(p).padStart(2,'0')}.jpg?v=35`;
function board(page){const chapter=chapters.find(c=>c[1]===page);const title=ct(`PDF 第 ${page} 页`,`PDF page ${page}`);return `<section class="pdf-page" data-pdf-page="${page}" ${chapter?`id="${chapter[0]}"`:''} aria-label="${title}"><button class="board-open" data-page="${page}" aria-label="${ct('放大查看完整页面','Enlarge the complete page')} · ${title}"><img src="${asset(page)}" width="3072" height="1728" alt="${title}${chapter?' · '+ct(chapter[2],chapter[3]):''}" loading="lazy"></button></section>`}
function renderCase(){
 document.documentElement.lang=caseLang==='zh'?'zh-CN':'en';
 document.querySelectorAll('[data-case-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.caseLanguage===caseLang)));
 document.getElementById('case-return').textContent=ct('← 返回作品案例','← All projects');
 document.getElementById('case-main').innerHTML=`<section class="pdf-cover" id="cover" data-pdf-page="30"><h1 class="visually-hidden">发布会视觉 & 氛围灯设计</h1><div class="cover-spread"><button class="board-open cover-open" data-page="30" aria-label="${ct('放大项目封面','Enlarge project cover')}"><img class="cover-board" src="${asset(30)}" width="3072" height="1728" alt="发布会视觉 & 氛围灯设计" fetchpriority="high"></button><div class="cover-car-anchor" aria-hidden="true"></div></div></section>`+
 Array.from({length:8},(_,i)=>board(i+31)).join('')+
 `<footer class="case-end"><a href="index.html#work">← ${ct('返回作品案例','All projects')}</a><a href="assets/Mario-Portfolio.pdf" target="_blank" rel="noopener">PDF ↗</a></footer>`;
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>openImage(b));
 progress();
}
function setZoom(zoom){viewer.classList.toggle('zoomed',zoom);const button=document.getElementById('image-zoom');button.setAttribute('aria-pressed',String(zoom));button.textContent=zoom?ct('适应窗口','Fit page'):ct('放大查看','Zoom in')}
function openImage(button){imageTrigger=button;const source=button.querySelector('img'),large=document.getElementById('image-large');large.src=source.src;large.alt=source.alt;document.getElementById('image-caption').textContent=ct(`第 ${String(button.dataset.page).padStart(2,'0')} 页`,`Page ${String(button.dataset.page).padStart(2,'0')}`);document.getElementById('image-close').setAttribute('aria-label',ct('关闭图像','Close image'));setZoom(false);viewer.showModal();const stage=viewer.querySelector('.image-stage');stage.scrollTop=0;stage.scrollLeft=0}
function progress(){progressFrame=0;const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;}
document.getElementById('image-close').onclick=()=>viewer.close();document.getElementById('image-zoom').onclick=()=>setZoom(!viewer.classList.contains('zoomed'));
viewer.addEventListener('close',()=>{setZoom(false);imageTrigger?.focus({preventScroll:true})});viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.prototype-shell.expanded'))document.querySelector('.prototype-expand').click()});
document.querySelectorAll('[data-case-language]').forEach(b=>b.onclick=()=>{if(caseLang===b.dataset.caseLanguage)return;const y=scrollY;caseLang=b.dataset.caseLanguage;renderCase();scrollTo({top:y,behavior:'instant'});progress()});
addEventListener('scroll',()=>{if(!progressFrame)progressFrame=requestAnimationFrame(progress)},{passive:true});addEventListener('resize',progress);renderCase();
if(location.hash&&!document.documentElement.classList.contains('portal-arriving')){try{requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView())}catch{}}
window.MarioPortal?.arrive(document.querySelector('.cover-spread'),'lighting');