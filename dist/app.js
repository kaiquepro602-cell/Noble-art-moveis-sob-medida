'use strict';
(() => {
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => [...document.querySelectorAll(q)];
  const config = Object.freeze({brand:'Noble Art', instagram:'https://www.instagram.com/nobleart_moveis/', whatsapp:'5547991102938'});
  // Keep the HTML fallback URL in sync when changing the WhatsApp number.
  const whatsappContact = $('#whatsapp-contact');
  if(config.whatsapp && whatsappContact){
    whatsappContact.href=`https://wa.me/${config.whatsapp}`;
  }
  const materials = Object.freeze({
    carvalho: {name:'Carvalho claro', family:'Natural · Acolhedor · Atemporal'},
    nogueira: {name:'Nogueira', family:'Profundo · Expressivo · Aconchegante'},
    offwhite: {name:'Off-white', family:'Leve · Suave · Versátil'},
    grafite: {name:'Grafite', family:'Sóbrio · Contemporâneo · Marcante'}
  });
  const projects = Object.freeze([
    {id:'sala',title:'Um lugar para ficar.',category:'SALA & CONVIVÊNCIA',room:'Sala e painel de TV',image:'assets/sala.webp',alt:'Sala com painel liso de madeira, TV, prateleira e rack claro iluminado',description:'Painel de madeira com veios verticais, prateleira com plantas e um rack de frentes claras. A iluminação indireta revela a composição e acolhe o ambiente.'},
    {id:'banheiro',title:'Beleza na rotina.',category:'BANHEIRO',room:'Banheiro',image:'assets/banheiro.webp',alt:'Banheiro com gabinete verde acinzentado, bancada branca e nichos de madeira iluminados',description:'Nichos iluminados, espelho e um gabinete verde acinzentado. Uma combinação de superfícies claras e madeira, com espaço para organizar a rotina.'},
    {id:'bancada',title:'Feito para reunir.',category:'BANCADA & INTEGRAÇÃO',room:'Bancada e integração',image:'assets/bancada.webp',alt:'Bancada clara revestida de madeira com iluminação e três banquetas escuras',description:'Uma bancada de linhas retas aproxima os ambientes. O contraste entre a superfície clara e a madeira ganha profundidade com a iluminação quente.'}
  ]);
  let currentMaterial = 'carvalho';
  let selectedProject = null;
  let galleryIndex = 0;
  let opener = null;
  let roomExplorer = null;
  let explorerLoading = null;
  function loadExplorer(){
    if(roomExplorer)return;
    if(!explorerLoading){
      explorerLoading=import('./room-explorer.mjs').then(({createRoomExplorer})=>{
        roomExplorer=createRoomExplorer($('#gallery-dialog'));
        if($('#gallery-dialog').open)roomExplorer.setProject(projects[galleryIndex]);
      }).catch(()=>{
        explorerLoading=null;
        $('#explorer-help').textContent='Fotografia original. Feche e abra o ambiente para tentar a exploração novamente.';
      });
    }
  }
  const menu = $('#mobile-menu');
  const menuToggle = $('.menu-toggle');
  function closeMenu(restoreFocus=false){
    const wasOpen = !menu.hidden;
    menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
    if(wasOpen && restoreFocus)menuToggle.focus();
  }
  menuToggle.addEventListener('click',()=>{
    const opening=menu.hidden;
    menu.hidden=!opening;menuToggle.setAttribute('aria-expanded',String(opening));
    document.body.classList.toggle('menu-open',opening);
    if(opening)menu.querySelector('a').focus();
  });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',e=>{
    if(menu.hidden)return;
    if(e.key==='Escape'){closeMenu(true);return;}
    if(e.key==='Tab'){
      const links=[...menu.querySelectorAll('a')];
      const items=[menuToggle,...links];const first=items[0],last=items.at(-1);
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  const desktop=matchMedia('(min-width:801px)');desktop.addEventListener('change',e=>{if(e.matches)closeMenu();});
  function showDialog(dialog,trigger){
    closeMenu();opener=trigger || document.activeElement;dialog.showModal();
    dialog.querySelector('[data-close]').focus();
  }
  $$('dialog').forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();});
  });
  function updateGallery(index){
    galleryIndex=(index+projects.length)%projects.length;const p=projects[galleryIndex];
    const img=$('#gallery-image');img.src=p.image;img.alt=p.alt;
    $('#gallery-title').textContent=p.title;$('#gallery-category').textContent=p.category;
    $('#gallery-description').textContent=p.description;
    $('#gallery-count').textContent=`${String(galleryIndex+1).padStart(2,'0')} / 03`;
    roomExplorer?.setProject(p);
  }
  $$('[data-project]').forEach(button=>button.addEventListener('click',()=>{
    updateGallery(projects.findIndex(p=>p.id===button.dataset.project));
    showDialog($('#gallery-dialog'),button);
    loadExplorer();
  }));
  $('#gallery-prev').addEventListener('click',()=>updateGallery(galleryIndex-1));
  $('#gallery-next').addEventListener('click',()=>updateGallery(galleryIndex+1));
  $('#gallery-dialog').addEventListener('keydown',e=>{
    if(e.target.closest('#room-stage'))return;
    if(e.key==='ArrowRight'){e.preventDefault();updateGallery(galleryIndex+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();updateGallery(galleryIndex-1);}
  });
  $('#gallery-contact').addEventListener('click',()=>{
    selectedProject=projects[galleryIndex];$('#room').value=selectedProject.room;
    $('#gallery-dialog').close();
    requestAnimationFrame(()=>$('#name').focus({preventScroll:true}));
  });
  const detailViews={
    ambiente:{scale:1,origin:'50% 50%',description:'O conjunto revela o equilíbrio entre madeira, frentes claras e iluminação acolhedora.'},
    madeira:{scale:1.55,origin:'45% 45%',description:'Os veios verticais do painel liso trazem textura e continuidade à composição.'},
    luz:{scale:1.7,origin:'50% 85%',description:'A luz sob o rack destaca o móvel e cria uma atmosfera acolhedora junto ao piso.'}
  };
  $$('[data-view]').forEach(button=>button.addEventListener('click',()=>{
    $$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const view=detailViews[button.dataset.view];const image=$('#detail-image');
    const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(window.gsap)gsap.to(image,{scale:view.scale,transformOrigin:view.origin,duration:reduced?0:.7,ease:'power2.inOut',overwrite:true});
    else{image.style.transform=`scale(${view.scale})`;image.style.transformOrigin=view.origin;}
    $('#detail-description').textContent=view.description;
  }));
  function chooseMaterial(key){
    if(!materials[key])return;
    currentMaterial=key;
    $$('[data-material].swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.material===key)));
    $('#material-name').textContent=materials[key].name;
    $('#material-family').textContent=materials[key].family;
    const art=$('#material-art');art.dataset.material=key;
    art.setAttribute('aria-label',`Composição ilustrativa de amostras de ${materials[key].name} e Off-white`);
  }
  $$('.swatch').forEach(button=>button.addEventListener('click',()=>chooseMaterial(button.dataset.material)));
  $('#project-form').addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const lines=[`Olá, ${config.brand}! Meu nome é ${String(data.get('name')).trim()}.`,`Sou de ${String(data.get('city')).trim()} e gostaria de conversar sobre um projeto.`,`Ambiente: ${data.get('room')}.`,`Referência de acabamento: ${materials[currentMaterial].name} (amostra ilustrativa).`];
    if(selectedProject && selectedProject.room===data.get('room'))lines.push(`Gostei da referência: ${selectedProject.title}`);
    lines.push('',`Minha ideia: ${String(data.get('idea')).trim()}`);
    $('#message-output').value=lines.join('\n');$('#copy-status').textContent='';
    showDialog($('#message-dialog'),form.querySelector('[type=submit]'));
  });
  $('#copy-message').addEventListener('click',async()=>{
    const text=$('#message-output').value;
    try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Mensagem copiada. Agora você pode colar no Instagram.';}
    catch{const field=$('#message-output');field.focus();field.select();$('#copy-status').textContent='Selecione e copie o texto para enviar pelo Instagram.';}
  });
  $('#privacy-button').addEventListener('click',event=>showDialog($('#privacy-dialog'),event.currentTarget));
  $('#year').textContent=String(new Date().getFullYear());
  // Content stays visible when animation libraries cannot load.
  let motion;
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);motion=gsap.matchMedia();
    motion.add('(prefers-reduced-motion:no-preference)',()=>{
      gsap.from('.hero h1',{y:20,autoAlpha:0,duration:.9,ease:'power2.out',clearProps:'all'});
      gsap.from('.hero-description, .hero .button',{y:12,autoAlpha:0,duration:.6,stagger:.08,delay:.15,ease:'power2.out',clearProps:'all'});
      $$('.reveal').forEach(element=>gsap.from(element,{y:20,autoAlpha:0,duration:.7,ease:'power2.out',scrollTrigger:{trigger:element,start:'top 92%',once:true},clearProps:'all'}));
    });
    document.fonts?.ready.then(()=>ScrollTrigger.refresh());
    $$('.project-image img').forEach(img=>img.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true}));
    $$('.process details').forEach(detail=>detail.addEventListener('toggle',()=>ScrollTrigger.refresh()));
    window.addEventListener('pagehide',()=>motion?.revert());
    window.addEventListener('pageshow',event=>{if(event.persisted)ScrollTrigger.refresh();});
  }
})();
