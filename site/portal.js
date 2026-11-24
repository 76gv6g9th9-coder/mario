/* One expansion ends at the destination cover; GAP uses only a fade. */
(()=>{
 const projects={isc:{key:'mario-isc-entry',url:'isc.html'},formula:{key:'mario-formula-entry',url:'formula.html',image:'assets/formula-full/portal-cover.jpg?v=35',crop:[.14375,.266666667,.78125,.611111111]},lighting:{key:'mario-lighting-entry',url:'lighting.html',image:'assets/lighting-full/page-30.jpg?v=35',crop:[0,0,1,1]},gap:{key:'mario-gap-entry',url:'gap.html',fade:true}};
 let busy=false;const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function overlay(src){const layer=document.createElement('div');layer.className='project-portal';layer.setAttribute('aria-hidden','true');const bg=document.createElement('div');bg.className='portal-backdrop';layer.append(bg);let image=null;if(src){image=new Image();image.className='portal-image';image.src=src;layer.append(image)}document.body.append(layer);return {layer,bg,image}}
 function clear(){for(const p of Object.values(projects))try{sessionStorage.removeItem(p.key);sessionStorage.removeItem(p.key+'-geometry')}catch{}document.documentElement.classList.remove('portal-arriving','portal-leaving');document.querySelectorAll('.project-portal').forEach(e=>e.remove());busy=false}
 function stamp(p,rect){try{sessionStorage.setItem(p.key,String(Date.now()));if(rect)sessionStorage.setItem(p.key+'-geometry',JSON.stringify(rect))}catch{}}
 function predictedRect(p){
  const mobile=innerWidth<=760,frame=document.documentElement.clientWidth-(mobile?0:40),w=Math.min(2200,frame)*.8,h=w*9/16,left=(frame-w)/2;
  const top=mobile?107:64+Math.max(0,(innerHeight-64-h)/2),c=p.crop;
  return {left:left+w*c[0],top:top+h*c[1],width:w*c[2],height:h*c[3]};
 }
 const box=r=>({left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
 window.MarioPortal={
  async enter(card){
   const p=projects[card.dataset.project];if(!p||busy)return;busy=true;
   if(card.dataset.project==='isc'||reduced()||!Element.prototype.animate){location.href=p.url;return}
   const end=p.fade?null:predictedRect(p),source=card.querySelector('.poster-art img'),rect=source?.getBoundingClientRect();
   const {layer,bg,image}=overlay(p.fade?null:source?.currentSrc||p.image);document.documentElement.classList.add('portal-leaving');
   const timeout=setTimeout(()=>{stamp(p,end);location.href=p.url},1500);
   try{
    if(p.fade){await layer.animate([{opacity:0},{opacity:1}],{duration:280,fill:'forwards'}).finished}
    else{
     const start={...box(rect),borderRadius:'5px'};Object.assign(image.style,start);
     bg.animate([{opacity:0},{opacity:1}],{duration:500,fill:'forwards'});
     await image.animate([start,{...box(end),borderRadius:'0px'}],{duration:720,easing:'cubic-bezier(.25,.7,.2,1)',fill:'forwards'}).finished;
    }
    clearTimeout(timeout);stamp(p,end);location.href=p.url;
   }catch{clearTimeout(timeout);clear();location.href=p.url}
  },
  async arrive(target,id='isc'){
   const p=projects[id];if(!p||!document.documentElement.classList.contains('portal-arriving'))return;
   if(reduced()||!target||!Element.prototype.animate){clear();return}
   let saved;try{saved=JSON.parse(sessionStorage.getItem(p.key+'-geometry')||'null')}catch{}
   const {layer,bg,image}=overlay(p.fade?null:p.image);if(image)Object.assign(image.style,box(saved||predictedRect(p)));
   const timeout=setTimeout(clear,2300);
   try{
    const cover=document.querySelector('.cover-board');
    await Promise.race([Promise.all([document.fonts.ready,cover?.decode().catch(()=>{}),image?.decode().catch(()=>{})]),new Promise(r=>setTimeout(r,650))]);
    scrollTo({top:0,behavior:'instant'});await new Promise(requestAnimationFrame);
    // Set the final geometry before revealing the page. Arrival only changes opacity.
    if(image)Object.assign(image.style,box(target.getBoundingClientRect()));
    document.documentElement.classList.remove('portal-arriving');
    await layer.animate([{opacity:1},{opacity:0}],{duration:p.fade?380:240,easing:'ease-out',fill:'forwards'}).finished;
   }catch{}finally{clearTimeout(timeout);clear()}
  }
 };
 addEventListener('pageshow',e=>{if(e.persisted)clear()});
})();
