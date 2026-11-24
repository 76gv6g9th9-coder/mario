(()=>{
 const requested=window.iscOpeningRequested===true;
 const root=document.documentElement,layer=document.getElementById('isc-opening'),video=document.getElementById('isc-opening-video');
 const skip=document.getElementById('opening-skip'),sound=document.getElementById('opening-sound'),pause=document.getElementById('opening-pause'),play=document.getElementById('opening-play'),error=document.getElementById('opening-error'),progress=document.getElementById('opening-progress');
 const content=[...document.querySelectorAll('.case-header,.case-ruler,#case-main')];
 let done=false,started=false,stallTimer;
 function playLabel(){pause.textContent=video.paused?'继续':'暂停';pause.setAttribute('aria-label',video.paused?'继续播放开场':'暂停开场')}
 function nearEnd(){return Number.isFinite(video.duration)&&video.duration>0&&video.duration-video.currentTime<=.85}
 function showPlay(){if(done)return;if(video.ended||(started&&nearEnd())){finish(true);return}play.hidden=false;play.querySelector('b').textContent=started?'继续播放':'播放开场';playLabel()}
 async function requestPlay(){
  if(done)return;
  error.hidden=true;
  try{await video.play();if(done){video.pause();return}started=true;play.hidden=true;playLabel()}
  catch{if(!done){layer.classList.add('video-ready');showPlay()}}
 }
 function finish(keepPlaying=false){
  if(done)return;done=true;clearTimeout(stallTimer);play.hidden=true;error.hidden=true;
  if(keepPlaying!==true)video.pause();
  content.forEach(el=>el.inert=false);root.classList.remove('isc-opening-active','portal-arriving');
  window.scrollTo({top:0,behavior:'instant'});
  const main=document.getElementById('case-main');main?.setAttribute('tabindex','-1');main?.focus({preventScroll:true});
  layer.setAttribute('aria-hidden','true');layer.classList.add('closing');
  const hide=()=>{layer.hidden=true;video.pause()};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)hide();else setTimeout(hide,840);
 }
 function start(){
  if(!requested||done)return;
  try{sessionStorage.removeItem('mario-isc-entry')}catch{}
  root.classList.remove('portal-arriving');root.classList.add('isc-opening-active');
  content.forEach(el=>el.inert=true);layer.hidden=false;layer.removeAttribute('aria-hidden');
  video.muted=true;video.defaultMuted=true;video.loop=false;sound.setAttribute('aria-pressed','false');
  skip.focus({preventScroll:true});
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){layer.classList.add('video-ready');showPlay()}else requestPlay();
  stallTimer=setTimeout(()=>{if(!done&&video.readyState<2){error.hidden=false;layer.classList.add('video-ready');showPlay()}},10000);
 }
 skip.onclick=finish;play.onclick=requestPlay;
 pause.onclick=()=>{if(video.paused)requestPlay();else video.pause()};
 sound.onclick=()=>{video.muted=!video.muted;sound.textContent=video.muted?'开启声音':'静音';sound.setAttribute('aria-pressed',String(!video.muted))};
 video.addEventListener('playing',()=>{if(done)return;started=true;clearTimeout(stallTimer);layer.classList.add('video-ready');play.hidden=true;error.hidden=true;playLabel()});
 video.addEventListener('pause',()=>{if(!done)showPlay()});
 video.addEventListener('ended',finish);
 video.addEventListener('timeupdate',()=>{if(Number.isFinite(video.duration)&&video.duration>0){progress.value=Math.min(1,video.currentTime/video.duration);if(started&&!video.paused&&nearEnd())finish(true)}});
 video.addEventListener('error',()=>{if(done)return;error.hidden=false;layer.classList.add('video-ready');showPlay()});
 layer.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();finish();return}
  if(e.key==='Tab'){
   const buttons=[...layer.querySelectorAll('button')].filter(b=>!b.hidden),first=buttons[0],last=buttons.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
 });
 addEventListener('pagehide',()=>video.pause());
 addEventListener('pageshow',e=>{if(e.persisted&&requested&&!done)requestPlay()});
 window.ISCOpening={requested,ready:true,start,finish};
 if(!requested){layer.hidden=true;root.classList.remove('isc-opening-active')}
})();
