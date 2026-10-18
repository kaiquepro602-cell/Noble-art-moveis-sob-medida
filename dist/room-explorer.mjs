// On-demand photo exploration and an illustrative spherical 360-degree room.
import { cameraView, normalizeYaw, projectHotspot, radians } from './panorama-math.mjs';
const details = Object.freeze({
  sala: [
    {name:'Painel de madeira',x:.24,y:.49,yaw:-32,pitch:14,text:'Os veios verticais e o painel contínuo dão unidade à composição da sala.'},
    {name:'Rack de frentes claras',x:.38,y:.76,yaw:28,pitch:-16,text:'As frentes claras contrastam com a madeira e deixam o conjunto visualmente leve.'},
    {name:'Iluminação indireta',x:.48,y:.84,yaw:-30,pitch:-24,text:'A luz sob o rack valoriza o contorno do móvel e se espalha suavemente pelo piso.'}
  ],
  banheiro: [
    {name:'Nichos iluminados',x:.25,y:.33,text:'Madeira e iluminação destacam os nichos ao lado do espelho.'},
    {name:'Bancada branca',x:.65,y:.59,text:'A bancada clara cria continuidade com as superfícies do ambiente.'},
    {name:'Gabinete e puxadores',x:.63,y:.79,text:'O verde acinzentado e os puxadores dourados acrescentam personalidade ao gabinete.'}
  ],
  bancada: [
    {name:'Superfície clara',x:.45,y:.35,text:'O tampo de linhas retas valoriza a integração e o uso compartilhado do espaço.'},
    {name:'Madeira e luz',x:.48,y:.45,text:'A luz quente acompanha a madeira na frente da bancada e realça sua textura.'},
    {name:'Espaço para reunir',x:.70,y:.62,text:'As banquetas aproximam as pessoas da bancada e conectam os ambientes.'}
  ]
});
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function createRoomExplorer(dialog){
  const $=selector=>dialog.querySelector(selector);
  const stage=$('#room-stage'),surface=$('#room-surface'),image=$('#gallery-image');
  const spots=$('#room-hotspots'),list=$('#room-detail-list'),help=$('#explorer-help');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const pointers=new Map();
  const zoomOutput=$('#room-zoom-value'),zoomIn=$('#room-zoom-in'),zoomOut=$('#room-zoom-out');
  let project=null,mode='explore',zoom=1.12,x=0,y=0,rx=0,ry=0,w=0,h=0,raf=0,pinch=null;
  let yaw=0,pitch=0;
  const maximum=2;
  const canvas=$('#room-panorama-canvas');
  const sphereSpots=$('#room-panorama-hotspots');
  let panorama=null,panoramaToken=0;
  function disposePanorama(){panoramaToken++;panorama?.destroy();panorama=null;canvas.hidden=true;sphereSpots.hidden=true;$('#room-panorama').disabled=false;stage.classList.remove('is-panorama-ready');}
  async function enterPanorama(){
    if(project?.id!=='sala')return;
    const token=++panoramaToken;
    setMode('panorama');showLoadStatus('Abrindo a sala em 360°…');
    $('#room-panorama').disabled=true;
    try{
      if(!panorama){
        const {createPanoramaViewer}=await import('./panorama-viewer.mjs');
        if(token!==panoramaToken||!dialog.open)return;
        const viewer=await createPanoramaViewer(canvas,'assets/sala-360-ia.webp');
        if(token!==panoramaToken||!dialog.open){viewer.destroy();return;}
        panorama=viewer;
      }
      if(mode==='panorama'){canvas.hidden=false;sphereSpots.hidden=false;stage.classList.add('is-panorama-ready');showLoadStatus('');schedule();}
    }catch{
      if(token===panoramaToken&&dialog.open){setMode('photo');announce('Vista 360° indisponível. A fotografia original continua disponível.');showLoadStatus('');}
    }finally{if(token===panoramaToken)$('#room-panorama').disabled=false;}
  }
  $('#room-panorama').addEventListener('click',enterPanorama);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();disposePanorama();setMode('photo');
    announce('A vista panorâmica foi interrompida. A fotografia original continua disponível.');
  });
  function announce(message){help.textContent=message;}
  function bound(){if(mode==='panorama'){yaw=normalizeYaw(yaw);pitch=clamp(pitch,-80,80);return;}x=clamp(x,-w*(zoom-1)/2,w*(zoom-1)/2);y=clamp(y,-h*(zoom-1)/2,h*(zoom-1)/2);}
  function render(){
    raf=0;
    if(!dialog.open)return;
    bound();
    if(mode==='panorama'&&panorama){
      const view=panorama.draw({yaw,pitch,zoom});
      if(view)sphereSpots.querySelectorAll('button').forEach((button,index)=>{
        const point=projectHotspot(details.sala[index],view);
        button.hidden=!point.visible||point.y<72||point.y>view.height-110;
        button.style.left=`${point.x}px`;button.style.top=`${point.y}px`;
      });
    }
    const spatial=mode==='explore'&&!reduced.matches&&fine.matches;
    surface.style.transform=`translate3d(${x}px,${y}px,0) rotateX(${spatial?rx:0}deg) rotateY(${spatial?ry:0}deg) scale(${zoom})`;
    surface.style.setProperty('--inverse-zoom',String(1/zoom));
    zoomOutput.value=`${Math.round(zoom*100)}%`;
    zoomIn.disabled=mode==='photo'||zoom>=maximum;
    zoomOut.disabled=mode==='photo'||zoom<=1;
    $('#room-reset').disabled=mode==='photo';
  }
  function schedule(){if(!raf&&dialog.open)raf=requestAnimationFrame(render);}
  function fit(){
    if(!dialog.open)return;
    if(mode==='panorama'){schedule();return;}
    if(!image.naturalWidth)return;
    const r=stage.getBoundingClientRect();
    // Keep the complete portrait inside the controls and preserve its aspect ratio.
    const factor=Math.min(Math.max(1,r.width-32)/image.naturalWidth,Math.max(1,r.height-150)/image.naturalHeight);
    w=image.naturalWidth*factor;h=image.naturalHeight*factor;
    surface.style.width=`${w}px`;surface.style.height=`${h}px`;
    schedule();
  }
  function reset(){
    zoom=mode==='explore'?1.12:1;x=y=rx=ry=yaw=pitch=0;
    spots.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
    sphereSpots.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
    list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
    $('#room-detail-text').textContent='Selecione um ponto na imagem ou um detalhe acima.';
    announce(mode==='panorama'?'Arraste para girar 360° · Use + e − para aproximar':mode==='photo'?'Fotografia original, sem movimento.':'Arraste para explorar · Use + para ver de perto');
    schedule();
  }
  function endGesture(){
    for(const id of pointers.keys())if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);
    pointers.clear();pinch=null;stage.classList.remove('is-dragging');
  }
  function setMode(next){
    endGesture();mode=next;stage.dataset.mode=mode;
    canvas.hidden=mode!=='panorama'||!panorama;
    sphereSpots.hidden=mode!=='panorama'||!panorama;
    stage.classList.toggle('is-panorama-ready',mode==='panorama'&&!!panorama);
    if(mode!=='panorama')showLoadStatus('');
    $('#room-photo-note').textContent=mode==='panorama'?'Vista 360° ilustrativa criada com IA a partir da foto.':'Fotografia do ambiente fornecida pela Noble Art.';
    $('#room-view-label').textContent=mode==='panorama'?'360° · VISTA ILUSTRATIVA':mode==='photo'?'FOTO ORIGINAL':'OLHAR DE PERTO';
    stage.setAttribute('aria-label',mode==='panorama'?'Sala em 360 graus. Use as setas para olhar ao redor, mais e menos para zoom e Home para reiniciar.':`Fotografia: ${project?.room||'ambiente'}.`);
    $('#room-panorama').setAttribute('aria-pressed',String(mode==='panorama'));
    $('#room-explore').setAttribute('aria-pressed',String(mode==='explore'));
    $('#room-photo').setAttribute('aria-pressed',String(mode==='photo'));
    // Hide both pointer and keyboard hotspots in photo mode.
    spots.hidden=mode!=='explore';list.inert=mode==='photo';
    $('#room-details').hidden=mode==='photo';
    reset();
    fit();
  }
  function setZoom(next,anchor={x:0,y:0}){
    const previous=zoom;zoom=clamp(next,1,maximum);
    if(mode==='panorama'){schedule();return;}
    x=anchor.x-(anchor.x-x)*zoom/previous;y=anchor.y-(anchor.y-y)*zoom/previous;
    rx=ry=0;schedule();
  }
  function choose(index){
    if(mode==='photo')return;
    const spot=details[project?.id]?.[index];if(!spot)return;
    rx=ry=0;
    if(mode==='panorama'){yaw=spot.yaw;pitch=spot.pitch;zoom=1.35;}
    else{zoom=1.65;x=(.5-spot.x)*w*zoom;y=(.5-spot.y)*h*zoom;}
    spots.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    sphereSpots.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    list.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    $('#room-detail-text').textContent=spot.text;
    announce(`${spot.name} · Arraste para continuar explorando`);
    schedule();
  }
  function makeDetails(){
    spots.replaceChildren();sphereSpots.replaceChildren();list.replaceChildren();
    (details[project.id]||[]).forEach((spot,index)=>{
      const marker=document.createElement('button');marker.type='button';marker.className='room-hotspot';
      marker.style.left=`${spot.x*100}%`;marker.style.top=`${spot.y*100}%`;
      marker.setAttribute('aria-label',`Ver detalhe: ${spot.name}`);marker.setAttribute('aria-pressed','false');
      marker.textContent=String(index+1).padStart(2,'0');marker.addEventListener('click',()=>choose(index));
      spots.append(marker);
      if(project.id==='sala'){
        const sphereMarker=document.createElement('button');
        sphereMarker.type='button';sphereMarker.className='room-hotspot room-sphere-hotspot';
        sphereMarker.setAttribute('aria-label',`Ver em 360 graus: ${spot.name}`);
        sphereMarker.setAttribute('aria-pressed','false');sphereMarker.hidden=true;
        sphereMarker.textContent=String(index+1).padStart(2,'0');
        sphereMarker.addEventListener('click',()=>choose(index));sphereSpots.append(sphereMarker);
      }
      const item=document.createElement('button');item.type='button';item.setAttribute('aria-pressed','false');
      const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
      item.append(number,document.createTextNode(spot.name));item.addEventListener('click',()=>choose(index));list.append(item);
    });
  }
  function showLoadStatus(message){
    const status=$('#room-load-status');status.hidden=!message;status.textContent=message;
  }
  image.addEventListener('load',()=>{if(mode!=='panorama'||panorama)showLoadStatus('');fit();});
  image.addEventListener('error',()=>showLoadStatus('Não foi possível abrir a foto. Tente outro ambiente.'));
  $('#room-explore').addEventListener('click',()=>setMode('explore'));
  $('#room-photo').addEventListener('click',()=>setMode('photo'));
  zoomIn.addEventListener('click',()=>setZoom(zoom+.2));
  zoomOut.addEventListener('click',()=>setZoom(zoom-.2));
  $('#room-reset').addEventListener('click',reset);
  $('#room-expand').addEventListener('click',()=>{
    const expanded=dialog.classList.toggle('room-expanded');
    $('#room-expand').setAttribute('aria-pressed',String(expanded));
    $('#room-expand').setAttribute('aria-label',expanded?'Reduzir visualizador':'Expandir visualizador');
    $('#room-expand span').textContent=expanded?'Reduzir':'Expandir';
    fit();
  });
  stage.addEventListener('pointerdown',event=>{
    if(mode==='photo'||event.target.closest('button')||event.button!==0)return;
    stage.focus({preventScroll:true});
    rx=ry=0;stage.classList.add('is-dragging');
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});stage.setPointerCapture(event.pointerId);
    if(pointers.size===2){
      const [a,b]=[...pointers.values()];
      pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};
    }
    schedule();
  });
  stage.addEventListener('pointermove',event=>{
    if(mode==='photo')return;
    const previous=pointers.get(event.pointerId);
    if(previous){
      pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if(pointers.size===2){
        const [a,b]=[...pointers.values()],distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
        const r=stage.getBoundingClientRect();
        if(pinch)setZoom(zoom*distance/pinch.distance,{x:(a.x+b.x)/2-r.left-r.width/2,y:(a.y+b.y)/2-r.top-r.height/2});
        pinch={distance};
      }else if(pointers.size===1){
        const dx=event.clientX-previous.x,dy=event.clientY-previous.y;
        if(mode==='panorama'){
          const r=stage.getBoundingClientRect();
          const view=cameraView({width:r.width,height:r.height,yaw,pitch,zoom});
          yaw-=dx*view.hfov/radians/view.width;pitch+=dy*view.vfov/radians/view.height;
        }else{x+=dx;y+=dy;}
        schedule();
      }
    }else if(mode==='explore'&&!pointers.size&&event.pointerType==='mouse'&&fine.matches&&!reduced.matches){
      // A restrained perspective shift; no ambient animation or render loop.
      const r=stage.getBoundingClientRect();
      ry=clamp((event.clientX-r.left)/r.width-.5,-.5,.5)*2.4;
      rx=-clamp((event.clientY-r.top)/r.height-.5,-.5,.5)*2.4;
      schedule();
    }
  });
  function release(event){
    pointers.delete(event.pointerId);pinch=null;
    if(!pointers.size){stage.classList.remove('is-dragging');rx=ry=0;schedule();}
  }
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
  stage.addEventListener('lostpointercapture',release);
  stage.addEventListener('pointerleave',()=>{if(!pointers.size){rx=ry=0;schedule();}});
  stage.addEventListener('keydown',event=>{
    if(event.target!==stage||mode==='photo'||event.ctrlKey||event.metaKey||event.altKey)return;
    const directions={ArrowLeft:[36,0],ArrowRight:[-36,0],ArrowUp:[0,36],ArrowDown:[0,-36]};
    if(directions[event.key]){
      event.preventDefault();const [dx,dy]=directions[event.key];
      if(mode==='panorama'){yaw-=dx/4/zoom;pitch+=dy/4/zoom;}else{x+=dx;y+=dy;}
      schedule();
    }
    else if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(zoom+.2);}
    else if(event.key==='-'){event.preventDefault();setZoom(zoom-.2);}
    else if(event.key==='Home'||event.key==='0'){event.preventDefault();reset();}
  });
  dialog.addEventListener('close',()=>{
    endGesture();disposePanorama();if(raf)cancelAnimationFrame(raf);raf=0;
    dialog.classList.remove('room-expanded');
    $('#room-expand').setAttribute('aria-pressed','false');$('#room-expand').setAttribute('aria-label','Expandir visualizador');$('#room-expand span').textContent='Expandir';
  });
  reduced.addEventListener('change',()=>{rx=ry=0;schedule();});
  fine.addEventListener('change',()=>{rx=ry=0;schedule();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){endGesture();if(raf)cancelAnimationFrame(raf);raf=0;}else if(dialog.open)fit();});
  const observer=new ResizeObserver(()=>fit());observer.observe(stage);
  $('#room-topbar').hidden=false;$('#room-toolbar').hidden=false;$('#room-details').hidden=false;
  dialog.classList.add('has-room-explorer');
  return {setProject(next){
    endGesture();disposePanorama();$('#room-panorama').disabled=false;project=next;image.alt=next.alt;
    const isSala=next.id==='sala';
    $('#room-panorama-offer').hidden=!isSala;$('#room-panorama').hidden=!isSala;$('#room-explore').hidden=isSala;
    makeDetails();setMode('explore');
    showLoadStatus(image.complete&&image.naturalWidth?'':'Abrindo ambiente…');
    fit();
    if(isSala)enterPanorama();
  }};
}
