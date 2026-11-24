const $=id=>document.getElementById(id),stage=$('stage'),controls=$('controls');
const pages={home:'3D车页面',park:'驻车灯语',drive:'行车灯语',board:'创意画板',edit:'创意画板_2',mix:'创意组合',settings:'灯语设置3',settings2:'灯语设置2'};
let settingsOrigin='park';let current='home',lastEditor='mix',lastFocus=null,timer;const switches={};
function resize(){const s=Math.min(innerWidth/2560,innerHeight/1440);stage.style.transform=`scale(${s})`;stage.style.left=(innerWidth-2560*s)/2+'px';stage.style.top=(innerHeight-1440*s)/2+'px'}addEventListener('resize',resize);resize();
function hot(label,x,y,w,h,fn){const b=document.createElement('button');b.className='hot';b.setAttribute('aria-label',label);b.title=label;Object.assign(b.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});b.onclick=fn;controls.append(b);return b}
function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('toast').style.display='none',1800)}
function go(page){if(page===current)return;if(page==='home'&&['board','edit','mix'].includes(current)){cancelPageTransition();parent.postMessage({type:'cabin-scene',home:true},'*');current='home';location.hash='home';render();return}if(transitionBusy)return;if(page.startsWith('settings')&&!current.startsWith('settings'))settingsOrigin=current;const from=current;playPageTransition(from,page,()=>{current=page;location.hash=page;render()})}
function render(){requestAnimationFrame(()=>window.dispatchEvent(new Event("isc-demo-change")));syncPageMotion();controls.replaceChildren();$('modal').classList.remove('open');$('screen').src='assets/images/'+pages[current]+'.png';$('screen').alt=pages[current];$('draw').hidden=current!=='edit';$('text').hidden=current!=='mix';$('previewText').hidden=current!=='mix';
if(current==='home'){const entry=hot('进入驻车灯语',614,733,96,96,()=>go('park'));entry.classList.add('isc-entry-button');const icon=new Image();icon.src='assets/isc-entry.png';icon.alt='';icon.draggable=false;entry.append(icon);return}
hot('返回3D车界面',35,1335,115,95,()=>go('home'));
if(current.startsWith('settings')){hot('返回上一层级',65,160,90,95,()=>go(settingsOrigin));[415,569,723,877,1186].forEach((y,i)=>{const b=hot('切换灯语设置'+(i+1),186,y,96,44,()=>{switches[i]=switches[i]===false;render()});b.className='switch'+(switches[i]===false?' off':'');b.setAttribute('role','switch');b.setAttribute('aria-checked',switches[i]!==false)});return}
hot('驻车灯语',870,130,220,100,()=>go('park'));hot('行车灯语',1170,130,220,100,()=>go('drive'));hot('创意画板',1450,130,230,100,()=>go('board'));hot('灯语设置',2120,130,95,95,()=>go('settings'));

if(current==='board'){hot('开始创作',200,760,410,110,()=>go('edit'));[65,790,1510,2230].forEach(x=>hot('编辑创意画板',x,1020,640,255,()=>go('edit')))}
if(current==='edit'||current==='mix'){lastEditor=current;hot('返回创意画板',70,255,90,90,()=>go('board'));hot('创意',0,current==='mix'?551:800,241,80,()=>go('edit'));hot('组合',241,current==='mix'?551:800,240,80,()=>go('mix'));hot('保存',current==='mix'?2177:2157,current==='mix'?656:920,320,96,openSave);if(current==='edit')hot('清空画布',1970,920,115,96,()=>{ctx.clearRect(0,0,2400,236);syncDrawingLamp()});else{const symbols=['☺','☻','♡','★','✓','☀','☾','♪','⚡','✦','☂','♥','✿'];for(let row=0;row<3;row++)for(let col=0;col<13;col++)hot('插入图案'+(row*13+col+1),308+170*col,879+103*row,150,94,()=>{if(Array.from($('text').value).length<10){$('text').value+=symbols[(col+row*3)%symbols.length];updateText()}});hot('删除字符',2007,1188,150,94,()=>{$('text').value=Array.from($('text').value).slice(0,-1).join('');updateText()});hot('清空组合',1140,664,98,77,()=>{$('text').value='';updateText()});hot('确认组合',1752,1188,235,94,()=>toast('组合已更新，可点击保存'))}}
if(current==='park')renderParkingLamps();if(current==='drive')renderDrivingLamps();if(current==='edit')renderDrawingLamp();renderPowerControl()}
function openSave(){lastFocus=document.activeElement;$('modal').classList.add('open');$('name').focus();$('name').select()}
function closeSave(){$('modal').classList.remove('open');lastFocus?.focus()}
$('cancel').onclick=closeSave;$('modal').querySelector('form').onsubmit=e=>{e.preventDefault();const name=$('name').value.trim();if(!name)return;closeSave();try{localStorage.setItem('p2-last-work',JSON.stringify({name,text:$('text').value,drawing:$('draw').toDataURL()}))}catch{}go('board');toast('作品“'+name+'”已保存')};
function updateText(){let v=Array.from($('text').value).slice(0,10).join('');$('text').value=v;$('previewText').textContent=v}$('text').oninput=updateText;
const canvas=$('draw'),ctx=canvas.getContext('2d');ctx.strokeStyle='#ddd';ctx.lineWidth=8;ctx.lineCap='round';let drawing=false;function point(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*2400/r.width,(e.clientY-r.top)*236/r.height]}canvas.onpointerdown=e=>{drawing=true;canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...point(e))};canvas.onpointermove=e=>{if(drawing){ctx.lineTo(...point(e));ctx.stroke();syncDrawingLamp()}};canvas.onpointerup=canvas.onpointercancel=()=>drawing=false;
addEventListener('keydown',e=>{if(e.key==='Escape'){$('modal').classList.contains('open')?closeSave():go('home')}if(/input/i.test(e.target.tagName))return;if(e.key.toLowerCase()==='h')document.body.classList.toggle('hints');if(e.key.toLowerCase()==='f'){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{})}if(e.key==='Tab'&&$('modal').classList.contains('open')){const els=Array.from($('modal').querySelectorAll('input,button')),i=els.indexOf(document.activeElement);e.preventDefault();els[(i+(e.shiftKey?-1:1)+els.length)%els.length].focus()}});
addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(pages[p]&&p!==current){cancelPageTransition();current=p;render()}});current=pages[location.hash.slice(1)]?location.hash.slice(1):'home';render();



window.ISCGuideState=()=>({page:current,busy:transitionBusy,selected:lampState.selected,applied:lampState.applied});
warmSceneAssets();playIntro();





