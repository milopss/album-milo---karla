const cfg = window.SUPABASE_CONFIG || {};
const hasConfig = cfg.url && cfg.publishableKey && !cfg.url.includes('TU-PROYECTO') && !cfg.publishableKey.includes('TU-PUBLISHABLE');
const supabaseClient = hasConfig ? window.supabase.createClient(cfg.url, cfg.publishableKey) : null;
const state = { memories: [], memoryIndex: 0, photoIndex: 0 };
const $ = (s) => document.querySelector(s);

$('#start').addEventListener('click', () => {
  $('#intro').classList.add('hide');
  setTimeout(() => { $('#app').classList.remove('hidden'); loadMemories(); }, 500);
});

function formatDate(date) {
  return new Intl.DateTimeFormat('es-EC', { day:'2-digit', month:'long', year:'numeric' }).format(new Date(`${date}T12:00:00`));
}
function publicUrl(path) {
  return supabaseClient.storage.from('album-fotos').getPublicUrl(path).data.publicUrl;
}
function showToast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2800); }

async function loadMemories() {
  if (!supabaseClient) {
    $('#loading').classList.add('hidden');
    $('#empty').classList.remove('hidden');
    $('#empty h3').textContent = 'Falta conectar Supabase';
    $('#empty p').textContent = 'Abre config.example.js, crea config.js y coloca la URL y Publishable Key de tu proyecto.';
    return;
  }
  const { data, error } = await supabaseClient.from('memories').select('id,title,event_date,description,quote,location,published,memory_photos(id,storage_path,caption,sort_order)').eq('published',true).order('event_date',{ascending:true});
  if (error) { console.error(error); $('#loading').textContent='No pude cargar los recuerdos. Revisa la configuración de Supabase.'; return; }
  state.memories = (data || []).map(m => ({...m, memory_photos:(m.memory_photos||[]).sort((a,b)=>a.sort_order-b.sort_order)}));
  $('#loading').classList.add('hidden');
  if (!state.memories.length) { $('#empty').classList.remove('hidden'); $('#navigation').classList.add('hidden'); renderTimeline(); return; }
  $('#memoryView').classList.remove('hidden'); $('#navigation').classList.remove('hidden');
  renderMemory(); renderTimeline(); setupSwipe();
}

function renderMemory(){
  const m=state.memories[state.memoryIndex]; state.photoIndex=Math.min(state.photoIndex,m.memory_photos.length-1); if(state.photoIndex<0)state.photoIndex=0;
  $('#counter').textContent = `${String(state.memoryIndex+1).padStart(2,'0')} / ${String(state.memories.length).padStart(2,'0')}`;
  $('#memoryDate').textContent = formatDate(m.event_date);
  $('#memoryTitle').textContent = m.title;
  $('#memoryLocation').textContent = m.location || '';
  const desc=$('#description'); desc.classList.add('hidden'); desc.textContent=m.description||'Este recuerdo todavía no tiene una descripción.';
  const quote=$('#quote'); quote.classList.toggle('hidden',!m.quote); quote.textContent=m.quote ? `“${m.quote}”` : '';
  const photos=m.memory_photos;
  const img=$('#mainPhoto');
  if(photos.length){ img.src=publicUrl(photos[state.photoIndex].storage_path); img.alt=photos[state.photoIndex].caption || m.title; }
  else { img.src='assets/snoopy-cover.png'; img.alt='Snoopy'; }
  $('#photoPrev').disabled=photos.length<2; $('#photoNext').disabled=photos.length<2;
  const dots=$('#photoDots'); dots.innerHTML=''; photos.forEach((_,i)=>{const s=document.createElement('span');s.className=i===state.photoIndex?'active':'';dots.appendChild(s)});
}
function renderTimeline(){
  const t=$('#timeline'); t.innerHTML='';
  state.memories.forEach((m,i)=>{const el=document.createElement('button');el.className='timeline-item';el.style.background='none';el.style.border='0';el.style.width='100%';el.style.textAlign='left';el.style.cursor='pointer';el.innerHTML=`<span class="timeline-dot"></span><div class="timeline-date">${formatDate(m.event_date)}</div><div class="timeline-title">${escapeHtml(m.title)}</div>`;el.addEventListener('click',()=>{state.memoryIndex=i;state.photoIndex=0;renderMemory();document.querySelector('.album').scrollIntoView({behavior:'smooth',block:'center'})});t.appendChild(el)});
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
$('#descriptionBtn').addEventListener('click',()=>$('#description').classList.toggle('hidden'));
$('#prevMemory').addEventListener('click',()=>changeMemory(-1)); $('#nextMemory').addEventListener('click',()=>changeMemory(1));
function changeMemory(dir){ if(!state.memories.length)return; state.memoryIndex=(state.memoryIndex+dir+state.memories.length)%state.memories.length;state.photoIndex=0;renderMemory();burst(); }
$('#photoPrev').addEventListener('click',()=>changePhoto(-1)); $('#photoNext').addEventListener('click',()=>changePhoto(1));
function changePhoto(dir){const p=state.memories[state.memoryIndex].memory_photos;if(p.length<2)return;state.photoIndex=(state.photoIndex+dir+p.length)%p.length;renderMemory();}
function burst(){for(let i=0;i<5;i++){const s=document.createElement('span');s.textContent=i%2?'♡':'✦';s.style.position='fixed';s.style.left=(45+Math.random()*10)+'%';s.style.top='55%';s.style.zIndex=300;s.style.color='#d68b9d';s.style.fontSize='18px';s.style.pointerEvents='none';s.animate([{opacity:0,transform:'translate(0,0)'},{opacity:1},{opacity:0,transform:`translate(${Math.random()*120-60}px,-${50+Math.random()*80}px)`}],{duration:850});document.body.appendChild(s);setTimeout(()=>s.remove(),900)}}
function setupSwipe(){let x=0;$('#album').addEventListener('touchstart',e=>x=e.changedTouches[0].clientX,{passive:true});$('#album').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x;if(Math.abs(dx)>55)changeMemory(dx<0?1:-1)},{passive:true});}
