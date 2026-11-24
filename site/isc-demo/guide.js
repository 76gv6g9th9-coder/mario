(()=>{
 const frame=document.getElementById('demo'),cabin=document.getElementById('cabin');
 const steps=[
  {page:'home',target:'进入驻车灯语',text:'点击图标，进入驻车灯语',done:s=>s.page==='park'},
  {page:'park',target:'选择篝火氛围',text:'选择「篝火氛围」',done:(s,clicked)=>s.page==='park'&&s.selected===1&&clicked==='选择篝火氛围'},
  {page:'park',target:'应用选中的灯语',text:'点击「应用」，预览灯语效果',done:(s,clicked)=>s.page==='park'&&s.applied===1&&clicked==='应用选中的灯语'},
  {page:'park',target:'行车灯语',text:'点击「行车灯语」',done:s=>s.page==='drive'},
  {page:'drive',target:'创意画板',text:'点击「创意画板」',done:s=>s.page==='board'},
  {page:'board',target:'开始创作',text:'点击「开始创作」',done:s=>s.page==='edit'},
  {page:'edit',target:'返回3D车界面',text:'点击主页图标，返回车辆首页',done:s=>s.page==='home'}
 ];
 const layer=document.createElement('div');layer.id='click-guide';layer.hidden=true;
 layer.innerHTML='<div class="guide-target" role="img" aria-label="当前指引点击区域"></div>';
 document.body.append(layer);
 const highlight=layer.querySelector('.guide-target');
 let enabled=new URLSearchParams(location.search).get('guide')!=='0',step=0,raf=0,child=null,clickedTarget='';
 function hide(){layer.hidden=true}
 function schedule(){if(enabled&&!raf&&!document.hidden)raf=requestAnimationFrame(update)}
 function resync(s){
  if(s.page==='home')step=0;
  else if(s.page==='park')step=s.selected!==1?1:s.applied!==1?2:3;
  else if(s.page==='drive')step=4;
  else if(s.page==='board')step=5;
  else if(['edit','mix'].includes(s.page))step=6;
 }
 function recordClick(e){if(!enabled)return;const button=e.target.closest('button');if(button)clickedTarget=button.getAttribute('aria-label')||'';schedule()}
 function update(){
  raf=0;if(!enabled||document.hidden){hide();return}
  let s;try{s=child?.ISCGuideState?.()}catch{}if(!s){hide();return}
  if(s.busy){hide();schedule();return}
  while(step<steps.length&&steps[step].done(s,clickedTarget)){step++;clickedTarget=''}
  if(step===steps.length)step=0;
  if(s.page!==steps[step].page&&!s.page.startsWith('settings'))resync(s);
  const entry=s.page.startsWith('settings')?{target:'返回上一层级',text:'返回灯语页面，继续体验'}:steps[step];
  const target=child.document.querySelector(`[aria-label="${entry.target}"]`);
  if(!target){hide();return}
  const r=target.getBoundingClientRect(),f=frame.getBoundingClientRect(),sx=f.width/child.innerWidth,sy=f.height/child.innerHeight;
  const left=f.left+r.left*sx,top=f.top+r.top*sy,width=r.width*sx,height=r.height*sy;
  if(top+height<0||left+width<0||top>innerHeight||left>innerWidth){hide();return}
  layer.hidden=false;highlight.hidden=false;
  Object.assign(highlight.style,{left:(left-5)+'px',top:(top-5)+'px',width:Math.max(20,width+10)+'px',height:Math.max(20,height+10)+'px'});
  layer.dataset.step=String(step+1);highlight.setAttribute('aria-label',entry.text);
 }
 function attach(){
  try{
   child?.removeEventListener('isc-demo-change',schedule);child?.document.removeEventListener('click',recordClick);
   child=frame.contentWindow;child.addEventListener('isc-demo-change',schedule);child.document.addEventListener('click',recordClick);schedule();
  }catch{}
 }
 frame.addEventListener('load',attach);if(frame.contentDocument?.readyState==='complete')attach();
 addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='isc-guide-toggle')return;
  enabled=Boolean(e.data.enabled);clickedTarget='';
  if(!enabled){hide();if(raf)cancelAnimationFrame(raf);raf=0;return}
  schedule();
 });
 new MutationObserver(schedule).observe(cabin,{attributes:true,attributeFilter:['style']});
 addEventListener('resize',schedule);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();else schedule()});
 addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf)});
})();
