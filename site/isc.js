let caseLang='zh';
const ct=(zh,en)=>caseLang==='zh'?zh:en;
const chapters=[['context',5,'设计背景','Background'],['hardware',7,'硬件信息','Hardware Info'],['challenges',8,'设计挑战','Design Challenges'],['perception',9,'如何解决','How to Tackle the Challenge'],['structure',12,'结构层梳理','Structure Plane'],['interface',14,'框架层&表现层','Skeleton & Surface Plane'],['creation',18,'创意画板','Creative canvas'],['exploration',21,'在预研项目中的思考','Project Outcome']];
let imageTrigger,progressFrame=0,guideEnabled=true;
const viewer=document.getElementById('image-viewer');
const asset=p=>`assets/isc-full/page-${String(p).padStart(2,'0')}.jpg?v=35`;
function board(page){const chapter=chapters.find(c=>c[1]===page);const title=ct(`PDF 第 ${page} 页`,`PDF page ${page}`);return `<section class="pdf-page" data-pdf-page="${page}" ${chapter?`id="${chapter[0]}"`:''} aria-label="${title}"><button class="board-open" data-page="${page}" aria-label="${ct('放大查看完整页面','Enlarge the complete page')} · ${title}"><img src="${asset(page)}" width="3072" height="${page===8?1055:1728}" alt="${title}${chapter?' · '+ct(chapter[2],chapter[3]):''}" loading="lazy"></button></section>`}
function demo(){return `<section class="pdf-demo" id="prototype"><div class="prototype-shell"><div class="prototype-top"><strong class="demo-title">${ct('DEMO演示（未完善版）','DEMO · Work in progress')}</strong><div class="prototype-actions"><button class="guide-toggle" type="button" role="switch" aria-label="${ct('操作指引','Interaction guide')}" aria-checked="${guideEnabled}"><span>${ct('操作指引','Guide')}</span><i aria-hidden="true"></i></button><button class="prototype-expand" aria-expanded="false">${ct('展开体验 ↗','Expand experience ↗')}</button></div></div><iframe class="prototype-frame" src="isc-demo/index.html?embedded=1&amp;guide=${guideEnabled?1:0}" title="${ct('ISC 交互演示','ISC interactive demo')}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe></div></section>`}
function renderCase(){
 document.documentElement.lang=caseLang==='zh'?'zh-CN':'en';
 document.querySelectorAll('[data-case-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.caseLanguage===caseLang)));
 document.getElementById('case-return').textContent=ct('← 返回作品案例','← All projects');
 document.getElementById('case-main').innerHTML=`<section class="pdf-cover" id="cover" data-pdf-page="4"><h1 class="visually-hidden">方程豹 ISC体验设计</h1><div class="cover-spread"><button class="board-open cover-open" data-page="4" aria-label="${ct('放大项目封面','Enlarge project cover')}"><img class="cover-board" src="${asset(4)}" width="3072" height="1728" alt="方程豹 ISC体验设计 — User Experience Design for ISC（Intelligent Signal Communication）" fetchpriority="high"></button><div class="cover-car-anchor" aria-hidden="true"></div></div></section>`+
 Array.from({length:18},(_,i)=>{const page=i+5;return board(page)+(page===20?demo():'')}).join('')+
 `<footer class="case-end"><a href="index.html#work">← ${ct('返回作品案例','All projects')}</a><a href="assets/Mario-Portfolio.pdf" target="_blank" rel="noopener">PDF ↗</a></footer>`;
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>openImage(b));
 document.querySelector('.prototype-expand').onclick=()=>{const shell=document.querySelector('.prototype-shell'),open=shell.classList.toggle('expanded');document.body.classList.toggle('demo-open',open);const b=shell.querySelector('.prototype-expand');b.setAttribute('aria-expanded',String(open));b.textContent=open?ct('收起体验 ×','Close experience ×'):ct('展开体验 ↗','Expand experience ↗')};
 const guideButton=document.querySelector('.guide-toggle'),guideFrame=document.querySelector('.prototype-frame');
 const syncGuide=()=>guideFrame.contentWindow?.postMessage({type:'isc-guide-toggle',enabled:guideEnabled},location.origin);
 guideButton.onclick=()=>{guideEnabled=!guideEnabled;guideButton.setAttribute('aria-checked',String(guideEnabled));syncGuide()};
 guideFrame.addEventListener('load',syncGuide);
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
if(window.ISCOpening?.requested)window.ISCOpening.start();else window.MarioPortal?.arrive(document.querySelector('.cover-car-anchor'));
