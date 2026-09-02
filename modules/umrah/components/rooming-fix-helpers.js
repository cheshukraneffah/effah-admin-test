// components/rooming-fix-helpers.js - V103.38 PROXY ONLY - full feature 3698 lines split
function resolveTableIdFromOldUrl(old){
  old = decodeURIComponent(old);
  if(old.includes('STAFF LIST')) return EFFAH_T.STAFF;
  if(old.includes('ROOMING LIST')) return EFFAH_T.ROOMING;
  if(old.includes('DATA JEMAAH')) return EFFAH_T.PAX;
  if(old.includes('PAKEJ UMRAH') || old.includes('TRIP')) return EFFAH_T.TRIP;
  return null;
}

var _autoScrollInterval = window._autoScrollInterval || null;
window._roomingDragListenersAdded = window._roomingDragListenersAdded || false;
// ROOMING V103 CLEAN - Deduped + Modular Ready
// Generated from V102 - Duplicate functions removed, JEDDAH bug fixed

var _autoScrollInterval = window._autoScrollInterval || null;
window._autoScrollInterval = _autoScrollInterval;

window._autoScrollInterval = _autoScrollInterval;



var allRoomingRecords = window.allRoomingRecords || [];
var allRoomingJemaah = window.allRoomingJemaah || [];
var activeLocation = window.activeLocation || localStorage.getItem('effah_active_location') || 'MEKAH';
// CACHE FIX FOR TAB SWITCH - prevent reload when switching tabs - V103.28 PATCH V4
var _roomingLastTripId = window._roomingLastTripId || null;
var _roomingCacheTime = window._roomingCacheTime || 0;
var _roomingIsLoading = false;
var _roomingFirstLoadDone = window._roomingFirstLoadDone || false;
var _staffCache = window._staffCache || {};
window._roomingLastTripId = _roomingLastTripId;
window._roomingFirstLoadDone = _roomingFirstLoadDone;
window._staffCache = _staffCache;
// On page reload, clear cache time to force first fetch with spinner
if(!_roomingFirstLoadDone){
  _roomingCacheTime = 0;
  window._roomingCacheTime = 0;
}
var roomingDefaultCap = 4;
var customLocations = window.customLocations || JSON.parse(localStorage.getItem('effah_custom_locations')||'[]');
var staffList = window.staffList || [];

var staffIdCounter = window.staffIdCounter || parseInt(localStorage.getItem('effah_staff_counter')||'1000');
var roomingSortDir = window.roomingSortDir || localStorage.getItem('effah_rooming_sort_dir') || 'asc';
var roomingSortActive = typeof window.roomingSortActive !== 'undefined' ? window.roomingSortActive : (localStorage.getItem('effah_rooming_sort_active') === 'true' ? true : false);
window.allRoomingRecords = allRoomingRecords;
window.allRoomingJemaah = allRoomingJemaah;
window.activeLocation = activeLocation;
window.staffList = staffList;
window.staffIdCounter = staffIdCounter;

function cleanTripNameForRooming(name){
  if(!name) return '';
  if(typeof cleanTripName==='function') return cleanTripName(name);
  return name.replace(/^\s*\d+\/\d+\s*\|\s*/i, '').replace(/^\s*\d+\/\d+\s*/i,'').trim();
}

function getJemaahName(f){ 
  if(!f) return '-'; 
  try{
    return f['NAMA'] || f['NAME'] || f['NAMA JEMAAH'] || f['NAMA PENUH'] || f['Name'] || f['M_ID'] || '-'; 
  }catch(e){ return '-'; }
}

function getBoardArray(f){
  if(!f) return [];
  try{
    const raw = f['BOARD BASIS'] || f['BOARD'] || '';
    if(!raw) return [];
    if(Array.isArray(raw)) return raw.filter(Boolean).map(s=>String(s).trim()).filter(Boolean);
    if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(s=>s.trim()).filter(Boolean);
    if(raw && raw!=='-' && raw!=='' && raw!=='NO BOARD' && raw!=='NO BOARD BASIS') return [String(raw).trim()];
  }catch(e){ console.warn('getBoardArray error', e, f); }
  return [];
}

function getNameForAnyId(id){
  const jRec=allRoomingJemaah.find(j=>j.id===id);
  if(jRec) return getJemaahName(jRec.fields);
  const sRec=staffList.find(s=>s.id===id||s.airtableId===id);
  if(sRec) return sRec.name+' (STAFF TANPA KATIL)';
  return id.substring(0,8)+'... (Unknown)';
}


function getInsuranArrayV2(f){
  if(!f) return [];
  const raw = f['INSURAN'] || f['INSURANCE'] || '';
  if(Array.isArray(raw)) return raw.filter(Boolean).map(s=>String(s).trim());
  if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(s=>s.trim()).filter(Boolean);
  if(raw && raw!=='-' && raw!=='') return [String(raw).trim()];
  return [];
}

function clearStaffBoardMulti(staffId){ 
  const s=getStaffById(staffId); if(!s) return; 
  s.boardBasis=[]; s.board=[]; 
  if(s.fields) { s.fields['BOARD']=''; s.fields['BOARD BASIS']=''; }
  saveStaffList(); 
  if(typeof renderStaffList==='function') renderStaffList(); 
  if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat&&s.airtableId){
    fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({fields:{'BOARD BASIS': []}})
    }).then(r=>r.json()).then(d=>console.log('Clear staff board OK', d.id)).catch(e=>console.error(e));
  }
}
window.clearStaffBoardMulti = clearStaffBoardMulti;


function getFullboardVal(f){ 
  const arr=getBoardArray(f);
  return arr[0]||'';
}


function getFullboardDisplay(f){
  const arr=getBoardArray(f);
  if(arr.length===0) return '-';
  return arr.join(', ');
}

function getPakejVal(f){ return f['PAKEJ'] || ''; }


function getVisaVal(f){ return f['STATUS VISA'] || f['VISA'] || ''; }

function getVisaClass(v){
  v=(v||'').toUpperCase();
  if(v.includes('VALID')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if(v==='TOURIST') return 'bg-amber-50 border-amber-200 text-amber-700';
  if(v==='UMRAH') return 'bg-blue-50 border-blue-200 text-blue-700';
  if(v==='IQAMA (VALID)') return 'bg-purple-50 border-purple-200 text-purple-700';
  return 'bg-white border-slate-200 text-slate-600';
}


function getInsuranVal(f){
  const v=f['INSURAN'];
  if(!v) return '';
  if(Array.isArray(v)) return v.join(', ');
  return v;
}

function getInsuranArray(f){
  const v=f['INSURAN'];
  if(!v) return [];
  if(Array.isArray(v)) return v;
  return [v];
}

function isTrainChecked(f){ return !!f['TRAIN']; }

function showRoomingLoading(){
  const g=document.getElementById('roomingGrid'); const l=document.getElementById('namelistContainer');
  const spinner = `<div class="flex flex-col items-center justify-center gap-3 py-10"><div class="w-8 h-8 border-[3px] border-slate-200 border-t-[#7A0C2E] rounded-full animate-spin"></div><div class="text-[11px] text-slate-600 font-medium">Memuatkan jemaah...</div></div>`;
  const spinnerBilik = `<div class="col-span-2 flex flex-col items-center justify-center gap-3 py-16"><div class="w-8 h-8 border-[3px] border-slate-200 border-t-[#7A0C2E] rounded-full animate-spin"></div><div class="text-[11px] text-slate-600 font-medium">Memuatkan bilik...</div></div>`;
  const skeletonRooms = Array.from({length:4}).map(()=>`<div class="bg-white rounded-2xl border border-slate-200 p-3 animate-pulse"><div class="h-4 bg-slate-100 rounded-full w-1/3 mb-3"></div><div class="h-3 bg-slate-100 rounded-full w-2/3 mb-4"></div><div class="space-y-2"><div class="h-9 bg-slate-50 rounded-xl"></div><div class="h-9 bg-slate-50 rounded-xl"></div><div class="h-9 bg-slate-100 rounded-xl border border-dashed"></div></div></div>`).join('');
  const skeletonList = Array.from({length:6}).map(()=>`<div class="px-2.5 py-3 flex gap-2 animate-pulse"><div class="w-6 h-3 bg-slate-100 rounded"></div><div class="flex-1 h-3 bg-slate-100 rounded-full"></div><div class="w-16 h-5 bg-slate-50 rounded-full"></div></div>`).join('');
  if(g) g.innerHTML=`${spinnerBilik}<div class="grid grid-cols-1 gap-2.5 mt-2">${skeletonRooms}</div>`;
  if(l) l.innerHTML=`${spinner}<div class="divide-y divide-slate-50 border-t mt-2">${skeletonList}</div>`;
  const overview=document.getElementById('roomingOverview');
  if(overview) overview.innerHTML=`<div class="flex items-center gap-2 text-[11px]"><div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memuatkan ${activeLocation}...</div>`;
}


function getRoomOrderKey(){ const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'; return `effah_room_order_${tripId}_${activeLocation}`; }

function getRoomOrderedList(rooms){
  try{
    if(!rooms || rooms.length===0){
      console.log('getRoomOrderedList: no rooms for location', activeLocation);
      return [];
    }
    const key=getRoomOrderKey(); 
    let localOrder=[];
    try{ localOrder=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ localOrder=[]; }
    // If local order exists and matches room count, use it (user dragged in portal)
    if(localOrder.length>0 && localOrder.length>=rooms.length*0.8){ 
      const map={}; rooms.forEach(r=>{ if(r&&r.id) map[r.id]=r; }); 
      const ordered=[]; 
      localOrder.forEach(id=>{ if(map[id]){ ordered.push(map[id]); delete map[id]; } }); 
      Object.values(map).forEach(r=>ordered.push(r)); 
      console.log('getRoomOrderedList: using LOCAL order', key, ordered.length);
      return ordered; 
    }
    // Otherwise use Airtable SORT ORDER field
    const sorted = [...rooms].filter(r=>r&&r.fields).sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
    console.log('getRoomOrderedList: using AIRTABLE SORT ORDER', sorted.length, sorted.map(r=>r.fields['SORT ORDER']+'='+r.id.substring(0,6)).slice(0,7));
    return sorted;
  }catch(e){
    console.error('getRoomOrderedList error', e);
    return rooms||[];
  }
}

function saveRoomOrder(ids){ localStorage.setItem(getRoomOrderKey(), JSON.stringify(ids)); }

var draggedRoomId = window.draggedRoomId || null;

function loadLocalCatatan(roomId){
  try{
    const key='effah_room_notes_'+roomId;
    return localStorage.getItem(key)||'';
  }catch(e){ return ''; }
}


document.addEventListener('dragover',e=>{ const g=document.getElementById('roomingGrid'); if(!g) return; const r=g.getBoundingClientRect(); if(e.clientY>r.bottom-100) g.scrollTop+=14; if(e.clientY<r.top+100) g.scrollTop-=14; });


  function countFBForHotel(hotelRooms, locUpper){
    let cnt=0;
    hotelRooms.forEach(r=>{
      const jIds=[...(r.fields['JEMAAH']||[]), ...(r.fields['JEMAAH TANPA KATIL']||[])];
      jIds.forEach(jId=>{
        const jRec=allRoomingJemaah.find(j=>j.id===jId);
        const fbArr=getBoardArray(jRec?.fields||{});
        const fb=fbArr.join(', ').toUpperCase();
        if(!fb || fb==='-' || fb==='NO BOARD') return;
        if(locUpper==='MEKAH'){ if(fb.includes('MEKAH')||fb==='BOARD BASIS'&&!fb.includes('MADINAH')||fb==='BOARD') cnt++; }
        else if(locUpper==='MADINAH'){ if(fb.includes('MADINAH')||fb==='BOARD BASIS'&&!fb.includes('MEKAH')||fb==='BOARD') cnt++; }
        else cnt++;
      });
    });
    return cnt;
  }
  let fbCount=0; const loc=activeLocation.toUpperCase();
  allRoomingJemaah.forEach(j=>{
    const fb=(j.fields['BOARD']||'').toUpperCase(); if(!fb || fb==='-' || fb==='NO BOARD') return;
    const assigned = rooms.some(r=> (r.fields['JEMAAH']||[]).includes(j.id) || (r.fields['JEMAAH TANPA KATIL']||[]).includes(j.id));
    if(!assigned) return;
    if(loc==='MEKAH'){ if(fb.includes('MEKAH')||fb==='BOARD') fbCount++; }
    else if(loc==='MADINAH'){ if(fb.includes('MADINAH')||fb==='BOARD') fbCount++; }
    else fbCount++;
  });
  const totalBilik=rooms.length;
  const totalJ=rooms.reduce((s,r)=>s+(r.fields['JEMAAH']?.length||0),0);
  const totalBaby=rooms.reduce((s,r)=>s+(r.fields['JEMAAH TANPA KATIL']?.length||0),0);
  // FIX: count staff from both text field and linked staffList (same as renderRoomingGrid)
  const staffFromText = rooms.reduce((s,r)=>s+(r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length,0);
  const staffFromLinked = rooms.reduce((s,r)=>{ try{ return s+getStaffForRoom(r.id).length; }catch(e){ return s; } },0);
  const totalStaff = staffFromText + staffFromLinked;
  const totalJemaahFull = totalJ + totalBaby; // infant masuk dalam jemaah count

  let hotelBlocks = Object.keys(byHotel).sort().map(hotel=>{
    const caps=byHotel[hotel];
    const hotelRooms = allRoomingRecords.filter(r=> (r.fields['HOTEL NAME']||'TANPA HOTEL').toUpperCase()===hotel && (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===loc);
    const fbHotel = countFBForHotel(hotelRooms, loc);
    const capsList = Object.keys(caps).sort((a,b)=>b-a).map(cap=>{
      const cnt=caps[cap];
      return `<span class="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full text-[10px] mr-1 mb-1"><span>Bilik ber-${cap}</span><span class="font-bold">(${cnt})</span></span>`;
    }).join('');
    const safeHotel = hotel.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const jemaahInHotel = hotelRooms.reduce((s,r)=>s+(r.fields['JEMAAH']?.length||0),0);
    return `<div class="flex flex-col gap-1.5 py-2.5 border-b border-white/10 last:border-0">
      <div class="flex items-center justify-between">
        <span class="font-bold text-[11px] truncate">${hotel} <span class="font-normal opacity-70 text-[9px]">(${jemaahInHotel} pax)</span></span>
        <div class="flex gap-1">
          <button onclick="downloadHotelDocs('${loc.replace(/'/g, "\'")}', '${safeHotel}', 'VISA COPY', 'Visas')" class="px-2 py-0.5 bg-white text-[#7A0C2E] rounded-full text-[8px] font-bold hover:bg-slate-100 border border-white/50" title="Download Visas ${hotel}">⬇ Visas</button>
          <button onclick="downloadHotelDocs('${loc.replace(/'/g, "\'")}', '${safeHotel}', 'PASSPORT COPY', 'Passports')" class="px-2 py-0.5 bg-white text-[#7A0C2E] rounded-full text-[8px] font-bold hover:bg-slate-100 border border-white/50" title="Download Passports ${hotel}">⬇ Passports</button>
        </div>
      </div>
      <div class="flex flex-wrap">${capsList}</div>
    </div>`;
  }).join('');

  let html=`<div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="font-bold text-[13px] tracking-widest">${activeLocation} • ${totalBilik} Bilik</div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold">${totalJemaahFull} Jemaah + ${totalStaff} Staff</span>
        ${fbCount?``:''}
      </div>
    </div>
    <div class="bg-white/10 rounded-xl p-2.5 max-h-[26vh] overflow-y-auto">
      ${hotelBlocks||'<div class="opacity-70 text-[11px]">Tiada data hotel</div>'}
    </div>
  </div>`;
  el.innerHTML=html;
}


function hideRoomingLoading(){
  const el=document.querySelector('.rooming-loading, #roomingLoading');
  if(el) el.style.display='none';
  const cont=document.getElementById('namelistContainer');
  // If still shows loading spinner, replace
  if(cont && cont.innerHTML.includes('Memuatkan jemaah')){
    // Will be overwritten by renderNamelist, but if no data, show empty
    if(allRoomingJemaah.length===0){
      cont.innerHTML='<div class="p-6 text-center text-[11px] text-slate-400">Tiada jemaah untuk trip ini<br><button onclick="fetchRoomingData(true)" class="mt-2 px-3 py-1 bg-[#7A0C2E] text-white rounded-full text-[10px]">Retry Load</button></div>';
    }
  }
}


function populateRoomingTripDropdown(){
  const sel=document.getElementById('roomingTripSelect'); if(!sel) return;
  let trips=[...(window.allTripUmrahRecords||window.allTripRecords||window.allTrips||[])];
  const currentId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('effah_last_selected_trip')||localStorage.getItem('selectedTripId')||'';
  if(trips.length===0){
    sel.innerHTML='<option value="">Memuatkan senarai trip...</option>';
    let retries=parseInt(sel.dataset.retries||'0'); if(retries<10){ sel.dataset.retries=retries+1; setTimeout(()=>{ if(typeof fetchTripUmrahData==='function') fetchTripUmrahData(); populateRoomingTripDropdown(); }, 900); }
    return;
  }
  trips.sort((a,b)=>(a.fields?.['Mula Pakej']||'').localeCompare(b.fields?.['Mula Pakej']||''));
  sel.innerHTML='<option value="">Pilih Trip...</option>'+trips.map(t=>{ const raw=t.fields?.Trip||t.fields?.['TRIP NAME']||t.id; const clean=cleanTripNameForRooming(raw); return `<option value="${t.id}" ${t.id===currentId?'selected':''}>${clean}</option>`; }).join('');
  if(currentId) sel.value=currentId; else if(trips.length>0){ sel.value=trips[0].id; onRoomingTripChange(trips[0].id); }
}

function clearBoardMulti(jemaahId){
  // First update local to empty
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId);
  if(rec){ rec.fields['BOARD BASIS']=[]; rec.fields['BOARD']=''; }
  if(typeof renderNamelist==='function') renderNamelist();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat){
    // BOARD might be formula/lookup - only patch BOARD BASIS (Multiple Select)
    fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'BOARD BASIS': []}})}).then(async r=>{ const d=await r.json(); if(d.error){ console.error('Clear jemaah board FAIL', d.error); } else { console.log('Clear jemaah board OK', d.id); } }).catch(e=>console.error(e));
  }
}
window.clearBoardMulti = clearBoardMulti;


function filterTanpaKatilList(q){
  const opts=document.querySelectorAll('#tanpaKatilOptions button');
  opts.forEach(btn=>{
    const txt=btn.textContent.toLowerCase();
    btn.style.display = txt.includes(q.toLowerCase()) ? 'flex' : 'none';
  });
}



async function submitNewRoom(){
  const btn=document.getElementById('btnCiptaBilik'); if(btn){ btn.textContent='Mencipta...'; btn.disabled=true; }
  const lokasi=document.getElementById('newRoomLokasi').value; const pakej=document.getElementById('newRoomPakej').value;
  const hotel=document.getElementById('newRoomHotel').value.trim(); const cap=parseInt(document.getElementById('newRoomCap').value)||4;
  const note=document.getElementById('newRoomNote').value.trim(); const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('selectedTripId')||localStorage.getItem('effah_last_selected_trip');
  if(!tripId){ alert('Sila pilih trip terlebih dahulu.'); if(btn){ btn.textContent='Cipta Bilik'; btn.disabled=false; } return; }
  // base from EFFAH_BASE
  try{
    let res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}`,{method:'POST','Content-Type':'application/json'},body:JSON.stringify(payload)});
    let newRec=await res.json();
    if(newRec.id){ allRoomingRecords.push(newRec); closeNewRoomModal(); renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList(); document.getElementById('newRoomHotel').value=''; document.getElementById('newRoomNote').value=''; }
    else {
      const msg=newRec.error?.message||JSON.stringify(newRec);
      if(msg.includes('Insufficient permissions to create new select option') || msg.toLowerCase().includes('select option')){
        alert('Gagal: Lokasi "'+lokasi+'" belum ada dalam Airtable.\n\nBuka Airtable > ROOMING LIST > LOKASI / CITY > Add option: '+lokasi+'\n\nSementara tu sistem cuba cipta sebagai MEKAH.');
        payload.fields['LOKASI / CITY']='MEKAH';
        let res2=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}`,{method:'POST','Content-Type':'application/json'},body:JSON.stringify(payload)});
        let newRec2=await res2.json();
        if(newRec2.id){ allRoomingRecords.push(newRec2); closeNewRoomModal(); renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList(); }
        else alert('Gagal fallback MEKAH: '+(newRec2.error?.message||JSON.stringify(newRec2)));
      } else {
        alert('Gagal mencipta bilik: '+msg);
      }
    }
  }catch(e){ alert('Ralat semasa mencipta bilik: '+e.message); }
  finally{ if(btn){ btn.textContent='Cipta Bilik'; btn.disabled=false; } }
}

async function executeCopyRooms(){
  const sel=document.querySelector('input[name="copySource"]:checked'); if(!sel) return alert('Sila pilih lokasi sumber untuk disalin.');
  const modeEl=document.querySelector('input[name="copyMode"]:checked'); const mode=modeEl?modeEl.value:'structure';
  const src=sel.value; const srcRooms=allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===src);
  if(srcRooms.length===0) return alert('Tiada bilik di lokasi '+src+' untuk disalin.');
  const modeText=mode==='withJemaah'?'bilik beserta jemaah & staff':'struktur bilik sahaja tanpa jemaah';
  if(!confirm(`Adakah anda pasti ingin menyalin ${srcRooms.length} bilik dari ${src} ke ${activeLocation}?\n\nPilihan: ${modeText}`)) return;
  // base from EFFAH_BASE
  let created=0; let failed=0;
  for(let r of srcRooms){
    const f=r.fields; const cap=f['KAPASITI']||4;
    const payload={fields:{'PAKEJ / HOTEL':f['PAKEJ / HOTEL']||'EKONOMI','KAPASITI':cap,'HOTEL NAME':f['HOTEL NAME']||'','CATATAN BILIK':f['CATATAN BILIK']||'','TRIP':[tripId],'LOKASI / CITY':activeLocation}};
    if(mode==='withJemaah'){
      if(f['JEMAAH'] && f['JEMAAH'].length>0) payload.fields['JEMAAH']=f['JEMAAH'];
      if(f['STAFF / EXTRA']) payload.fields['STAFF / EXTRA']=f['STAFF / EXTRA'];
    }
    try{
      const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}`,{method:'POST','Content-Type':'application/json'},body:JSON.stringify(payload)});
      const newRec=await res.json();
      if(newRec.id){ allRoomingRecords.push(newRec); created++; }
      else { failed++; console.error('Copy failed', newRec); }
    }catch(e){ failed++; console.error(e); }
  }
  closeCopyRoomsModal(); renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList();
  if(created>0) alert(`Berjaya menyalin ${created} bilik dari ${src} ke ${activeLocation} (${modeText}).` + (failed>0?` ${failed} bilik gagal disalin.`:''));
  else alert('Gagal menyalin bilik. Sila cuba semula.');
}


      function normalizeBoard(b){
        if(!b) return '';
        const s = (Array.isArray(b)? b.join(', ') : String(b)).toUpperCase().trim();
        return s;
      }

      function isStaffBoardMatch(sObj, locUpper){
        try{
        if(!sObj) return false;
        const fbRawRaw = sObj.boardBasis||sObj.board||sObj.fields?.['BOARD']||sObj.fields?.['BOARD BASIS']||'';
        const up = normalizeBoard(fbRawRaw);
        if(!up || up==='-'||up==='NO BOARD'||up==='NO BOARD BASIS') return false;
        const isFullboard = up.includes('BOARD BASIS');
        const isBB = up.includes('BB');
        const hasMekah = up.includes('MEKAH');
        const hasMadinah = up.includes('MADINAH');
        const isExactFullboard = up==='BOARD BASIS';
        
        if(locUpper==='MEKAH'){
          // MEKAH: BOARD BASIS, BOARD BASIS MEKAH, BB MEKAH - EXCLUDE MADINAH
          if(hasMadinah) return false; // BOARD BASIS MADINAH or BB MADINAH not allowed in MEKAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMekah) return true; // BOARD BASIS (MEKAH)
          if(isBB && hasMekah) return true; // BB (MEKAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain BOARD BASIS
          return false;
        }
        if(locUpper==='MADINAH'){
          // MADINAH: BOARD BASIS, BOARD BASIS MADINAH, BB MADINAH - EXCLUDE MEKAH
          if(hasMekah) return false; // BOARD BASIS MEKAH or BB MEKAH not allowed in MADINAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMadinah) return true; // BOARD BASIS (MADINAH)
          if(isBB && hasMadinah) return true; // BB (MADINAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain BOARD BASIS
          return false;
        }
        // TAIF AND OTHER: BOARD BASIS SHJ
        if(isExactFullboard) return true;
        if(isFullboard && !hasMekah && !hasMadinah) return true;
        return false;
        }catch(e){ console.warn('isStaffBoardMatch error', e); return false; }
      }
      let fbListForLoc = [];

      function jHasBoardForLoc(r, locUp){
        if(!r || !r.fields) return false;

        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase().trim());
        if(arr.length===0) return false;
        const check = (x)=>{
          const hasMekah = x.includes('MEKAH');
          const hasMadinah = x.includes('MADINAH');
          const isFB = x.includes('BOARD BASIS');
          const isBB = x.includes('BB');
          const exactFB = x==='BOARD BASIS';
          if(locUp==='MEKAH'){
            if(hasMadinah) return false; // exclude MADINAH boards in MEKAH
            if(exactFB) return true;
            if(isFB && hasMekah) return true;
            if(isBB && hasMekah) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          } else if(locUp==='MADINAH'){
            if(hasMekah) return false; // exclude MEKAH boards in MADINAH
            if(exactFB) return true;
            if(isFB && hasMadinah) return true;
            if(isBB && hasMadinah) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          } else {
            // TAIF AND OTHER: BOARD BASIS SHJ
            if(exactFB) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          }
        };
        return arr.some(check);
      }
      if(loc==='MEKAH'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'MEKAH'));
      } else if(loc==='MADINAH'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'MADINAH'));
      } else if(loc==='TAIF'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'TAIF'));
      } else {
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,loc));
      }
      // Add STAFF with BOARD BASIS in this location
      const staffFB = staffList.filter(s=> isStaffBoardMatch(s, loc.toUpperCase()) && s.roomIds && s.roomIds.some(rid=> rooms.some(r=>r.id===rid)));
      // Convert staff to same shape as jemaah for grouping
      staffFB.forEach(s=>{ fbListForLoc.push({ id:s.id, fields:{'NAMA JEMAAH':s.name, 'BOARD': s.boardBasis||s.fields?.['BOARD']||s.board||'BOARD BASIS', 'IS_STAFF':true, 'STAFF_OBJ':s}, _isStaff:true, boardBasis:s.boardBasis }); });

      // Staff linked to rooms in this location
      const staffInLoc = staffList.filter(s=> s.roomIds && s.roomIds.some(rid=> rooms.some(r=>r.id===rid)));
      
      // Build overview - FIXED BOARD count
      const sortedRoomsForPrintEarly = [...rooms].sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
      let overviewRows = '';
      // Group by hotel
      const hotels = {};
      rooms.forEach(r=>{
        const h=r.fields['HOTEL NAME']||'TANPA HOTEL';
        if(!hotels[h]) hotels[h]=[];
        hotels[h].push(r);
      });
      
      // For overview BOARD column: show breakdown
      let boardSummary = '';

      function hasBoard(r, target){
        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase());
        return arr.includes(target);
      }

      function hasBoardIncludes(r, inc){
        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase());
        return arr.some(x=>x.includes(inc));
      }
      if(loc==='MEKAH'){
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS')).length;
        const countFBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS (MEKAH)')).length;
        const countBBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MEKAH)')).length;
        boardSummary = `BOARD BASIS: ${countFB}, BOARD BASIS MEKAH: ${countFBMekah}, BB MEKAH: ${countBBMekah}`;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (BOARD BASIS: ${countFB} + BOARD BASIS (MEKAH): ${countFBMekah} + BB (MEKAH): ${countBBMekah})`;
        else boardSummary = '-';
      } else if(loc==='MADINAH'){
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS')).length;
        const countFBMad = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS (MADINAH)')).length;
        const countBBMad = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MADINAH)')).length;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (BOARD BASIS: ${countFB} + BOARD BASIS (MADINAH): ${countFBMad} + BB (MADINAH): ${countBBMad})`;
        else boardSummary = '-';
      } else if(loc==='TAIF'){
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} BOARD BASIS` : '-';
      } else {
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} BOARD BASIS` : '-';
      }
      
      Object.keys(hotels).forEach(hotelName=>{
        const hRooms = hotels[hotelName];
        const capCounts = {};
        hRooms.forEach(r=>{ const c=r.fields['KAPASITI']||4; capCounts[c]=(capCounts[c]||0)+1; });
        const bilikStr = Object.keys(capCounts).map(c=>`Bilik ber-${c} (${capCounts[c]})`).join(', ');
        // --- FIX: board basis per hotel, include staff ---
        const hJemaahIds = [];
        hRooms.forEach(r=>{ (r.fields['JEMAAH']||[]).forEach(id=>hJemaahIds.push(id)); });
        const hJemaahRecs = allRoomingJemaah.filter(j=> hJemaahIds.includes(j.id));

        function countBoardForHotel(fbFilter){
          let cnt=0;
          hJemaahRecs.forEach(j=>{ const fb=(getFullboardVal(j.fields)||'').toUpperCase().trim(); if(fbFilter(fb)) cnt++; });
          // staff in this hotel
          const staffInHotel = staffList.filter(s=> s.roomIds && s.roomIds.some(rid=> hRooms.some(hr=>hr.id===rid)));
          staffInHotel.forEach(s=>{
            const fbRawRaw=s.boardBasis||s.fields?.['BOARD']||s.board||''; const fbRaw=(Array.isArray(fbRawRaw)? fbRawRaw.join(', ') : fbRawRaw).toString().toUpperCase().trim();
            if(fbFilter(fbRaw)) cnt++;
          });
          return cnt;
        }
        let boardSummaryHotel='';
        if(loc==='MEKAH'){
          const cFB = countBoardForHotel(fb=>fb==='BOARD BASIS');
          const cFBM = countBoardForHotel(fb=>fb==='BOARD BASIS (MEKAH)');
          const cBBM = countBoardForHotel(fb=>fb==='BB (MEKAH)' || (fb.includes('MEKAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBM + cBBM;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (BOARD BASIS: ${cFB} + BOARD BASIS (MEKAH): ${cFBM} + BB (MEKAH): ${cBBM})`;
          else boardSummaryHotel='-';
        } else if(loc==='MADINAH'){
          const cFB = countBoardForHotel(fb=>fb==='BOARD BASIS');
          const cFBMad = countBoardForHotel(fb=>fb==='BOARD BASIS (MADINAH)');
          const cBBMad = countBoardForHotel(fb=>fb==='BB (MADINAH)' || (fb.includes('MADINAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBMad + cBBMad;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (BOARD BASIS: ${cFB} + BOARD BASIS (MADINAH): ${cFBMad} + BB (MADINAH): ${cBBMad})`;
          else boardSummaryHotel='-';
        } else {
          const cFB = countBoardForHotel(fb=>fb==='BOARD BASIS');
          boardSummaryHotel = cFB>0 ? `${cFB} BOARD BASIS` : '-';
        }
        overviewRows += `<tr><td style="border:1px solid #ddd;padding:4px 6px;font-weight:bold">${hotelName}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${bilikStr}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${boardSummaryHotel}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${hRooms.length} bilik</td></tr>`;
      });
      
      let overviewProfessionalHTML = `<table style="width:100%;border-collapse:collapse;font-size:9px"><tr style="background:#f8f8f8;font-weight:bold"><th style="border:1px solid #ddd;padding:4px 6px;text-align:left">HOTEL</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">BILIK</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">BOARD BASIS</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">JUMLAH</th></tr>${overviewRows}</table>`;
      
      const totalJemaahLoc = rooms.reduce((sum,r)=> sum + (r.fields['JEMAAH']||[]).length, 0);
      const totalBabyLoc = rooms.reduce((sum,r)=> sum + (r.fields['JEMAAH TANPA KATIL']||[]).length, 0);
      const totalStaffLoc = rooms.reduce((sum,r)=> sum + getStaffForRoom(r.id).length, 0);
      const fbTotalLoc = fbListForLoc.length;

      // Room blocks - smaller for portrait
      const isPortrait = orientation==='portrait';
      // Ensure rooms sorted by SORT ORDER for print
      const sortedRoomsForPrint = sortedRoomsForPrintEarly;
      const roomBlocks = sortedRoomsForPrint.map((rec, idx)=>{
        const f=rec.fields;
        const roomName = f['Room ID / Nama Bilik'] || f['ROOM ID'] || `B${f['KAPASITI']||4}-${idx+1}`;
        const pakej = f['PAKEJ / HOTEL']||'';
        const hotel = f['HOTEL NAME']||'';
        const cap = f['KAPASITI']||4;
        const jIds = f['JEMAAH']||[];
        const babyIdsRaw = f['JEMAAH TANPA KATIL']||[];
        const staffTanpaLocal = (typeof getStaffTanpaKatilForRoom==='function'? getStaffTanpaKatilForRoom(rec.id) : (f['_STAFF_TANPA_KATIL']||[]));
        const babyIds = [...new Set([...babyIdsRaw, ...staffTanpaLocal])];
        const staffForRoom = getStaffForRoom(rec.id);
        
        let jemaahHtml = jIds.map((jid, jIdx)=>{
          const jRec = allRoomingJemaah.find(r=>r.id===jid);
          const name = jRec ? getJemaahName(jRec.fields) : jid;
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #ddd">${jIdx+1}. ${name}</div>`;
        }).join('');
        
        // FIX V93: Separate jemaah infant (NA) and staff tanpa katil (S numbering)
        const babyJemaahIds = [];
        const babyStaffIds = [];
        babyIds.forEach(bId=>{
          const isStaff = staffList.some(s=>s.id===bId||s.airtableId===bId) || (typeof getStaffById==='function' && getStaffById(bId));
          if(isStaff) babyStaffIds.push(bId);
          else babyJemaahIds.push(bId);
        });
        let babyHtml = babyJemaahIds.length ? babyJemaahIds.map((jid, jIdx)=>{
          const jRec = allRoomingJemaah.find(r=>r.id===jid);
          const name = jRec ? getJemaahName(jRec.fields) : (typeof getNameForAnyId==='function'? getNameForAnyId(jid) : jid);
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #92400E;color:#92400E;background:#FEF3C7;font-weight:600">NA. ${name} (Tanpa Katil)</div>`;
        }).join('') : '';
        // Staff tanpa katil will be appended to staffHtml as S numbering
        const staffTanpaIdsForPrint = babyStaffIds;

        
        let staffHtml = staffForRoom.length ? staffForRoom.map((s, sIdx)=>{
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #ddd;color:#7A0C2E;background:#FDF2F4">S${sIdx+1}. ${s.name.replace(/\(EFFAH\)/i,'').trim()} (EFFAH)</div>`;
        }).join('') : '';
        let staffTanpaHtml = staffTanpaIdsForPrint.length ? staffTanpaIdsForPrint.map((sid, stIdx)=>{
          const sRec = staffList.find(s=>s.id===sid||s.airtableId===sid) || (typeof getStaffById==='function'? getStaffById(sid) : null);
          const sName = sRec ? sRec.name : (typeof getNameForAnyId==='function'? getNameForAnyId(sid) : sid);
          const sNum = staffForRoom.length + stIdx + 1;
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #e8a838;background:#fffbe6;color:#92400E;font-weight:600">S${sNum}. ${sName.replace(/\(EFFAH\)/i,'').trim()} (Tanpa Katil)</div>`;
        }).join('') : '';
        // Combine staff regular + staff tanpa katil for display count
        const combinedStaffHtml = staffHtml + staffTanpaHtml;

        
        const catatanBilik = (f['CATATAN BILIK'] || f['CATATAN'] || '').trim();
        const catatanPrint = catatanBilik ? ` (${catatanBilik})` : '';
        return `<div style="border:1px solid #000;margin-bottom:${isPortrait ? '4px' : '6px'};background:#fff;break-inside:avoid" data-room-card="${rec.id}" ondragover="allowDropRoom(event)" ondragleave="leaveDropRoom(event)" ondrop="dropRoom(event,'${rec.id}')">
          <div draggable="true" ondragstart="dragRoom(event,'${rec.id}')" ondragend="dragRoomEnd(event)" style="background:#fff;border-bottom:1px solid #000;padding:${isPortrait ? '2px 4px' : '3px 6px'};display:flex;justify-content:space-between;align-items:center;cursor:grab" title="Drag untuk susun bilik">
            <span style="font-weight:bold;font-size:${isPortrait ? '8px' : '9px'}">${idx+1}. ${roomName} ${pakej ? '('+pakej+')' : ''} ${hotel ? '- '+hotel : ''}${catatanPrint}</span>
            <span style="font-size:${isPortrait ? '7px' : '8px'};font-weight:bold">${jIds.length + staffForRoom.length}/${cap}</span>
          </div>
          <div style="padding:${isPortrait ? '3px 4px' : '4px 6px'}">
            ${jemaahHtml}
            ${babyHtml}
            ${combinedStaffHtml}
          </div>
        </div>`;
      }).join('');

      // FB Table with actual board basis badges
      let fbTableHTML = '';
      if(fbListForLoc.length>0){
        // Group by hotel for FB list - with room number
        const roomNumberMap = {};
        sortedRoomsForPrintEarly.forEach((r, idx)=>{ roomNumberMap[r.id]=idx+1; });
        rooms.forEach((r, idx)=>{ if(!roomNumberMap[r.id]) roomNumberMap[r.id]=idx+1; });
        const grouped = {};
        fbListForLoc.forEach(jRec=>{
          let room=null;
          if(jRec._isStaff){
            const sObj=jRec.fields.STAFF_OBJ;
            room = rooms.find(r=> sObj.roomIds && sObj.roomIds.includes(r.id));
          } else {
            room = rooms.find(r=> (r.fields['JEMAAH']||[]).includes(jRec.id));
          }
          const hotel = room ? (room.fields['HOTEL NAME']||'TANPA HOTEL') : 'TANPA BILIK';
          const roomNo = room ? (roomNumberMap[room.id]||'-') : '-';
          const roomName = room ? (room.fields['Room ID / Nama Bilik']||room.fields['ROOM ID']||'B?') : '-';
          if(!grouped[hotel]) grouped[hotel]=[];
          grouped[hotel].push({rec:jRec, room:roomNo, roomLabel:roomName});
        });
        
        const fbJemaahCount = fbListForLoc.filter(x=>!x._isStaff).length;
        const fbStaffCount = fbListForLoc.filter(x=>x._isStaff).length;
        const fbBadgeText = fbStaffCount>0 ? `${fbJemaahCount} Jemaah + ${fbStaffCount} Staff` : `${fbJemaahCount} Jemaah`;
        fbTableHTML = `
          <div style="margin-top:10px;border:1px solid #000">
            <div style="background:#064E3B;color:#fff;padding:4px 8px;font-weight:bold;font-size:9px;display:flex;justify-content:space-between">
              <span>${loc} - SENARAI PAKEJ MAKAN</span>
              <span style="background:#fff;color:#065F46;padding:1px 6px;border-radius:10px;font-size:9px">${fbBadgeText}</span>
            </div>
            ${Object.keys(grouped).sort().map(hotelName=>{
              const allItems = grouped[hotelName];
              const jemaahOnly = allItems.filter(x=>!x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
              const staffOnly = allItems.filter(x=>x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
              const sortedItems = [...jemaahOnly, ...staffOnly];
              const totalPax = allItems.length;
              return '<div style="border-bottom:1px solid #000"><div style="background:#f0fdf4;padding:3px 8px;font-weight:bold;font-size:9px;border-bottom:1px solid #ddd">'+hotelName+' ('+totalPax+' pax)</div><table style="width:100%;border-collapse:collapse;font-size:9px"><tr style="background:#f8f8f8;font-weight:bold"><th style="border:1px solid #ddd;padding:3px 6px;width:30px">NO</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:left">NAMA JEMAAH</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:center">BOARD BASIS</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:center">BILIK</th></tr>'+ sortedItems.map((item,i)=>{
                    const isStaffRow = item.rec._isStaff;
                    let rawStaffName = (item.rec.fields['NAMA JEMAAH']||'');
                    rawStaffName = rawStaffName.replace(/\s*\(EFFAH\)\s*/gi,'').trim();
                    rawStaffName = rawStaffName.replace(/\(EFFAH\)/i,'').trim();
                    const displayName = isStaffRow ? rawStaffName + ' (EFFAH)' : getJemaahName(item.rec.fields);
                    const fbRaw = isStaffRow ? (item.rec.fields['BOARD']||'BOARD BASIS') : (getFullboardVal(item.rec.fields)||'');
                    const up=(Array.isArray(fbRaw)? (fbRaw[0]||'') : (fbRaw||'')).toString().toUpperCase();
                    let badge='';
                    if(up.includes('MEKAH')) badge='<span style="background:#FDE68A;border:1px solid #92400E;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    else if(up.includes('MADINAH')) badge='<span style="background:#BFDBFE;border:1px solid #1E40AF;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    else badge='<span style="background:#BBF7D0;border:1px solid #065F46;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    let rowNo='';
                    if(isStaffRow){
                      const staffSorted = grouped[hotelName].filter(x=>x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
                      const pos = staffSorted.findIndex(x=>x.rec.id===item.rec.id);
                      rowNo = 'S'+(pos+1);
                    } else {
                      rowNo = ''+(i+1);
                    }
                    const rowStyle = isStaffRow ? ' style="background:#FDF2F4"' : '';
                    const cellStyle = isStaffRow ? 'background:#F9D5D9;font-weight:bold;color:#7A0C2E' : '';
                    const nameStyle = isStaffRow ? 'color:#7A0C2E' : '';
                    return '<tr'+rowStyle+'><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;'+cellStyle+'">'+rowNo+'</td><td style="border:1px solid #ddd;padding:3px 6px;font-weight:600;'+nameStyle+'">'+displayName+'</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">'+badge+'</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;font-size:8px">'+item.room+'</td></tr>';
                  }).join('') + '</table></div>';
            }).join('')}
          </div>
        `;
      } else {
        fbTableHTML = `<div style="margin-top:12px;border:1px dashed #000;padding:8px;text-align:center;font-size:9px;color:#666">Tiada jemaah Pakej Makan di ${loc} (Kriteria: ${loc==='TAIF' ? 'BOARD BASIS sahaja' : loc+' = BOARD BASIS + BOARD BASIS ('+loc+') + BB ('+loc+')'})</div>`;
      }

      locationPages+=`<div style="page-break-before:always">
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:13px;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px">
          <span>ROOMING LIST ${tripName} - ${loc} (${rooms.length} BILIK)</span>
        </div>
        <div style="margin-bottom:10px;border:1px solid #000;padding:0;background:#fff">
          <div style="background:#7A0C2E;color:#fff;padding:4px 8px;font-weight:bold;font-size:10px">${loc} OVERVIEW - ${rooms.length} Bilik</div>
          ${overviewProfessionalHTML}
          <div style="background:#f5f5f5;padding:5px 8px;font-size:9px;border-top:1px solid #000;display:flex;justify-content:space-between">
            <span><b>Total:</b> ${rooms.length} bilik</span>
            <span>${totalJemaahLoc+totalBabyLoc} jemaah + ${totalStaffLoc} staff</span>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:${orientation==='portrait' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'}; gap:${orientation==='portrait' ? '6px' : '8px'}; align-items:start">${roomBlocks}</div>
        ${fbTableHTML}
      </div>`;
    });

        // TRIP OVERVIEW - FIXED V103.28 - use combinedStaff and s.train
    const _staffList = (typeof combinedStaff !== 'undefined' && combinedStaff.length ? combinedStaff : (typeof staffList !== 'undefined' ? staffList : []));
    const totalStaffCount = _staffList.length;
    const totalJemaahOnly = allRoomingJemaah.length;
    const visaCounts = {};
    allRoomingJemaah.forEach(j=>{
      const v=(j.fields['STATUS VISA']||j.fields['VISA']||'').toString().trim().toUpperCase();
      if(v && v!=='-' && v!=='- VISA'){ visaCounts[v]=(visaCounts[v]||0)+1; }
    });
    let visaHtml = `
      <span style="display:inline-block;margin-right:12px;"><b>TOURIST:</b> ${visaCounts['TOURIST']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>TOURIST VALID:</b> ${visaCounts['TOURIST (VALID)']||visaCounts['TOURIST VALID']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>UMRAH:</b> ${visaCounts['UMRAH']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>UMRAH (VALID):</b> ${visaCounts['UMRAH (VALID)']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>IQAMA (VALID):</b> ${visaCounts['IQAMA (VALID)']||0}</span>
    `;
    const _trainJemaahCount = allRoomingJemaah.filter(j=>{ try{ return typeof isTrainChecked==='function' ? isTrainChecked(j.fields) : !!j.fields['TRAIN']; }catch(e){return !!j.fields['TRAIN'];}}).length;
    const _trainStaffCount = _staffList.filter(s=>{ 
      try{ 
        // staff TRAIN can be in s.train, s.fields.TRAIN, s.fields['TRAIN STAFF']
        const f=s.fields||{};
        return !!(s.train || f['TRAIN'] || f['SPEEDTRAIN'] || f['TRAIN STAFF'] || s['TRAIN']);
      }catch(e){return false;}
    }).length;
    const _totalTrainWithStaff = _trainJemaahCount + _trainStaffCount;
    const _insJ = allRoomingJemaah.filter(j=>{ try{return getInsuranArray(j.fields).length>0;}catch(e){return false;}}).length;
    const _insS = _staffList.filter(s=>{ try{const f=s.fields||{}; return (f['INSURAN'] && f['INSURAN'].length>0) || (typeof getInsuranArray==='function' && getInsuranArray(f).length>0) || !!s.insuran; }catch(e){return false;}}).length;
    const _totalInsuranUnique = _insJ + _insS;
    const namelistOverviewHTML = '<div style="margin-top:12px;border:1px solid #000;padding:8px 10px;background:#f9fafb"><div style="font-weight:bold;font-size:10px;margin-bottom:6px">TRIP OVERVIEW</div><div style="display:flex;flex-wrap:wrap;gap:20px;font-size:9px"><div><b>Bilangan Speedtrain:</b> ' + _totalTrainWithStaff + ' orang (Jemaah: ' + _trainJemaahCount + ' + Staff: ' + _trainStaffCount + ')</div><div><b>Bilangan Insuran:</b> ' + _totalInsuranUnique + ' orang</div><div><b>Visa:</b> ' + visaHtml + '</div><div><b>Total Jemaah:</b> ' + totalJemaahOnly + '</div><div><b>Total Staff:</b> ' + totalStaffCount + '</div></div></div>';

    const html=`<html><head><title>Rooming ${tripName} - ${orientation}</title><style>body{font-family:Arial,Helvetica,sans-serif;font-size:10px;margin:12px;color:#000}table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:4px 6px;font-size:9px}th{background:#7A0C2E;color:#fff;font-weight:bold;text-transform:uppercase}.header{display:flex;justify-content:space-between;font-weight:bold;font-size:12px;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px}.page-break{page-break-before:always}.namelist-page{max-width:900px;margin:0 auto}.location-page{max-width:100%}@media print{@page{size:A4 ${orientation};margin:${orientation==='portrait' ? '8mm' : '10mm'}}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page-break{page-break-before:always}}</style></head><body>
      <div class="namelist-page"><div class="header"><span>NAMELIST ${tripName}</span><span>Total: ${allRoomingJemaah.length} Jemaah + ${combinedStaff.length} Staff</span></div><div style="font-size:9px;margin-bottom:8px"><b>Trip:</b> ${tripName} | <b>Tarikh Cetak:</b> ${new Date().toLocaleDateString('ms-MY')} | <b>Orientasi:</b> ${orientation.toUpperCase()}</div><table style="table-layout:fixed"><colgroup><col style="width:28px"><col style="width:34%"><col style="width:85px"><col style="width:40px"><col style="width:55px"><col style="width:60px"><col style="width:65px"></colgroup><tr><th>NO</th><th style="text-align:left">NAMA JEMAAH</th><th>BOARD</th><th>TRAIN</th><th>PAKEJ</th><th>INSURAN</th><th>VISA</th></tr>${namelistRows}</table>${namelistOverviewHTML}</div>
      ${locationPages||'<div style="page-break-before:always"><div style="border:1px dashed #000;padding:20px;text-align:center">Tiada bilik untuk trip ini</div></div>'}
      <script>window.onload=function(){setTimeout(()=>window.print(),600)}; window.onafterprint=function(){window.close();}; setTimeout(()=>{try{window.close();}catch(e){}},3500);<\/script>
    </body></html>`;
    const w=window.open('','_blank');
    if(!w){ alert('Popup blocked! Sila allow popup untuk print.'); return; }
    w.document.write(html);
    w.document.close();
  }catch(e){
    console.error(e);
    alert('Gagal generate print: '+e.message);
  }
}


function findRoomingContainers(){
  const selectors={namelist:['#namelistContainer','#namelist-container','[data-testid="namelist"]','.namelist-container','#jemaahList','#jemaahListContainer'],grid:['#roomingGrid','#roomingGridContainer','#rooming-grid','.rooming-grid','#bilikGrid','#roomingListGrid']};
  let namelist=null,grid=null;
  for(let sel of selectors.namelist){ const el=document.querySelector(sel); if(el){ namelist=el; break; } }
  for(let sel of selectors.grid){ const el=document.querySelector(sel); if(el){ grid=el; break; } }
  return {namelist,grid};
}

function createMissingRoomingStructure(){
  const modul=document.getElementById('modul-rooming');
  if(!modul) return false;
  const hasNamelist=modul.querySelector('#namelistContainer');
  const hasGrid=modul.querySelector('#roomingGrid')||modul.querySelector('#roomingGridContainer');
  if(!hasNamelist || !hasGrid || modul.innerHTML.trim().length<100){
    console.log('V80 creating missing rooming structure, modul innerLen', modul.innerHTML.length);
    const existingHTML=modul.innerHTML;
    modul.innerHTML=`
      <div id="roomingHeader" class="p-4 border-b bg-white">
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-bold">Rooming List - V80 Auto-Created (Full Base)</h2>
          <div class="flex gap-2">
            <select id="roomingTripSelect" class="text-[11px] border rounded px-2 py-1"></select>
            <button onclick="fetchRoomingData(true)" class="text-[11px] bg-[#7A0C2E] text-white px-3 py-1 rounded-full">Reload</button>
          </div>
        </div>
        <div id="locationTabs" class="flex gap-2 mt-3"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl border">
            <div class="p-3 border-b flex justify-between items-center">
              <span class="text-[11px] font-bold">NAMELIST JEMAAH</span>
              <span id="topUnassignedBadge" class="text-[9px] bg-amber-100 px-2 py-0.5 rounded-full">0</span>
            </div>
            <div class="p-2"><input id="searchNamelist" placeholder="Cari jemaah..." class="w-full text-[11px] border rounded-full px-3 py-1.5 mb-2" oninput="renderNamelist()"></div>
            <div id="namelistContainer" class="max-h-[60vh] overflow-y-auto"><div class="p-6 text-center text-[11px] text-slate-400">Memuatkan jemaah...</div></div>
          </div>
          <div class="bg-white rounded-xl border mt-4">
            <div class="p-3 border-b flex justify-between"><span class="text-[11px] font-bold">STAFF / EXTRA</span><span id="staffTotalBadge" class="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full">0</span></div>
            <div class="p-2"><input id="searchStaff" placeholder="Cari staff..." class="w-full text-[11px] border rounded-full px-3 py-1.5 mb-2" oninput="renderStaffList()"></div>
            <div id="staffListContainer" class="max-h-[30vh] overflow-y-auto"></div>
          </div>
        </div>
        <div class="lg:col-span-2"><div id="roomingGrid" class="grid gap-3"></div><div id="roomingGridContainer" class="hidden"></div></div>
      </div>
      <div id="v80-existing" style="display:none;">${existingHTML}</div>
    `;
    setTimeout(()=>{ if(typeof populateRoomingTripDropdown==='function') populateRoomingTripDropdown(); if(typeof fetchRoomingData==='function') fetchRoomingData(); }, 500);
    return true;
  }
  return false;
}
setTimeout(()=>{
  const modul=document.getElementById('modul-rooming');
  console.log('V80 inspect modul-rooming exists:', !!modul, 'len', modul?.innerHTML.length, 'children', modul?.children.length);
  const {namelist,grid}=findRoomingContainers();
  console.log('V80 containers found:', !!namelist, !!grid);
  if(!namelist||!grid){ createMissingRoomingStructure(); } else { if(typeof fetchRoomingData==='function') fetchRoomingData(); }
}, 1500);


async function _patchStaffRoomIdsQueued(staffId, roomIds){
  if(!window._staffPatchQueue[staffId]) window._staffPatchQueue[staffId] = [];
  return new Promise((resolve, reject)=>{
    window._staffPatchQueue[staffId].push({roomIds, resolve, reject});
    _processStaffQueue(staffId);
  });
}

async function _processStaffQueue(staffId){
  if(window._staffPatchRunning[staffId]) return;
  window._staffPatchRunning[staffId] = true;
  const {base, pat} = (typeof getAirtableConfig==='function'? getAirtableConfig() : {base: window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base'), pat: window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat')});
  while(window._staffPatchQueue[staffId] && window._staffPatchQueue[staffId].length>0){
    const task = window._staffPatchQueue[staffId].shift();
    const staff = (typeof getStaffById==='function'? getStaffById(staffId) : staffList.find(s=>s.id===staffId||s.airtableId===staffId));
    if(!staff || !base || !pat || !staff.airtableId){ task.resolve(); continue; }
    try{
      // Always use latest roomIds from staff object at time of processing, not task.roomIds stale
      const latestIds = staff.roomIds || [];
      let res = await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({fields:{'ROOMING LIST': latestIds}})
      });
      let data = await res.json();
      if(data.error){
        console.warn('Staff patch 422 retry', staffId, data.error);
        // retry once after 400ms with latest
        await new Promise(r=>setTimeout(r,400));
        res = await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
          method:'PATCH', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fields:{'ROOMING LIST': latestIds}})
        });
        data = await res.json();
      }
      task.resolve(data);
    }catch(e){
      console.error('Staff queue patch failed', e);
      task.resolve();
    }
    await new Promise(r=>setTimeout(r,250)); // small gap to avoid Airtable rate limit 422
  }
  window._staffPatchRunning[staffId] = false;
}


function setActiveLocation(loc){
  if(!loc) return;
  if(window._switchingLocation) return;
  window._switchingLocation = true;
  try {
    const newLoc = loc.toString().toUpperCase();
    if(typeof activeLocation!=='undefined') activeLocation = newLoc;
    window.activeLocation = newLoc;
    localStorage.setItem('effah_active_location', newLoc);
    const el=document.getElementById('copyTargetLoc'); if(el) el.textContent=newLoc;
    if(typeof renderLocationTabs==='function') renderLocationTabs();
    if(typeof renderRoomingGrid==='function') renderRoomingGrid();
    if(typeof renderNamelist==='function') renderNamelist();
    if(typeof renderStaffList==='function') renderStaffList();
    console.log('Location switched to', newLoc);
  } catch(e){ console.error(e); }
  finally {
    setTimeout(()=>{ window._switchingLocation = false; }, 350);
  }
}
window.setActiveLocation = setActiveLocation;

console.log('V103.2 FIX TAB CLICK fully loaded - single listeners, debounced tabs');


// FIX 422 - prevent staff ID going into JEMAAH TANPA KATIL
(function(){
  const origUpdate = window.updateRoomField;
  if(origUpdate && !origUpdate._fixed422){
    window.updateRoomField = async function(roomId, field, value, shouldRender=true){
      // If trying to save staff into JEMAAH TANPA KATIL, redirect
      if(field==='JEMAAH TANPA KATIL' || field==='TANPA KATIL'){
        // Check if value contains staff ids
        const staffIds = (window.staffList||[]).map(s=>s.id||s.airtableId);
        const hasStaff = (Array.isArray(value) ? value.some(v=>staffIds.includes(v)) : staffIds.includes(value));
        if(hasStaff){
          console.warn('FIX 422: Redirecting staff from JEMAAH TANPA KATIL to STAFF TANPA KATIL');
          field = 'STAFF TANPA KATIL';
        }
      }
      return origUpdate.call(this, roomId, field, value, shouldRender);
    };
    window.updateRoomField._fixed422 = true;
    console.log('FIX 422 applied');
  }
})();


window.toggleBoardDropdown = window.toggleBoardDropdown || toggleBoardDropdown;
window.closeBoardDropdown = window.closeBoardDropdown || closeBoardDropdown;
window.toggleInsuranDropdown = window.toggleInsuranDropdown || toggleInsuranDropdown;
window.closeInsuranDropdown = window.closeInsuranDropdown || closeInsuranDropdown;



async function loadPdfLib(){
  if(window.PDFLib && window.PDFLib.PDFDocument) return window.PDFLib;
  return new Promise((resolve, reject)=>{
    const existing=document.querySelector('script[src*="pdf-lib"]');
    if(existing && window.PDFLib){
      resolve(window.PDFLib);
      return;
    }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.onload=()=>{
      // UMD exposes window.PDFLib (capital L)
      const lib = window.PDFLib || window.pdfLib || window.pdf_lib;
      if(lib && lib.PDFDocument){
        window.PDFLib = lib;
        resolve(lib);
      } else {
        // Try unpkg fallback
        const script2=document.createElement('script');
        script2.src='https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
        script2.onload=()=>{
          const lib2 = window.PDFLib || window.pdfLib;
          if(lib2) resolve(lib2);
          else reject(new Error('pdf-lib loaded but PDFDocument undefined'));
        };
        script2.onerror=()=>reject(new Error('Failed to load pdf-lib from both CDNs'));
        document.head.appendChild(script2);
      }
    };
    script.onerror=()=>{
      // Try unpkg
      const script2=document.createElement('script');
      script2.src='https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
      script2.onload=()=>{
        const lib2 = window.PDFLib || window.pdfLib;
        if(lib2) resolve(lib2);
        else reject(new Error('pdf-lib fallback loaded but undefined'));
      };
      script2.onerror=()=>reject(new Error('Failed to load pdf-lib'));
      document.head.appendChild(script2);
    };
    document.head.appendChild(script);
  });
}


async function fetchWithRetry(url, retries=2){
  for(let i=0;i<=retries;i++){
    if(window._visaDownloadCancelled) throw new Error('Cancelled by user');
    try{
      const signal=window._visaAbortController?window._visaAbortController.signal:undefined;
      const res=await fetch(url, {mode:'cors', signal});
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.arrayBuffer();
    }catch(e){
      if(e.name==='AbortError' || window._visaDownloadCancelled) throw new Error('Cancelled by user');
      if(i===retries) throw e;
      await new Promise(r=>setTimeout(r, 500));
    }
  }
}


window._visaDownloadCancelled=false;
window._visaAbortController=null;

function getFieldAttachments(jFields, names){
  if(!jFields) return null;
  for(let n of names){
    if(jFields[n] && Array.isArray(jFields[n]) && jFields[n].length>0) return jFields[n];
  }
  const keys=Object.keys(jFields);
  for(let k of keys){
    const up=k.toUpperCase().trim();
    for(let t of names){
      if(up===t.toUpperCase().trim() || up.includes(t.toUpperCase().trim())){
        const v=jFields[k];
        if(Array.isArray(v)&&v.length>0) return v;
      }
    }
  }
  return null;
}

function updateVisaCountBadge(){
  try{
    const visaNames=['VISA COPY','VISA','VISA_COPY'];
    const passNames=['PASSPORT COPY','PASSPORT','PASSPORT_COPY','PASSPORT SCAN'];
    let visaCount=0, passCount=0;
    (allRoomingJemaah||[]).forEach(j=>{
      if(getFieldAttachments(j.fields||{}, visaNames)) visaCount++;
      if(getFieldAttachments(j.fields||{}, passNames)) passCount++;
    });
    console.log(`Badge count - allRoomingJemaah: ${allRoomingJemaah?.length} Visa:${visaCount} Passport:${passCount}`);
    // Also check direct if available
    if(window._allJemaahDirect && window._allJemaahDirect.length>0){
      const dv = window._allJemaahDirect.filter(r=> getFieldAttachments(r.fields||{}, visaNames)).length;
      const dp = window._allJemaahDirect.filter(r=> getFieldAttachments(r.fields||{}, passNames)).length;
      console.log(`Badge direct: ${window._allJemaahDirect.length} Visa:${dv} Passport:${dp}`);
      if(dv>visaCount) visaCount=dv;
      if(dp>passCount) passCount=dp;
    }
    const vBadge=document.getElementById('visaCountBadge');
    const pBadge=document.getElementById('passportCountBadge');
    if(vBadge) vBadge.textContent=visaCount;
    if(pBadge) pBadge.textContent=passCount;
  }catch(e){ console.error('updateVisaCountBadge error', e); }
}

async function updatePassportCountFromDirectFetch(){
  try{
    // base from EFFAH_BASE
        const tripId=localStorage.getItem('effah_active_trip_id')||window.selectedTripRecord?.id||document.getElementById('roomingTripSelect')?.value;
    if(!tripId){ console.log('Direct fetch missing tripId'); return; }
    let allRecs=[]; let offset='';
    do{
      const filter='FIND("'+tripId+'",ARRAYJOIN({TRIP}))';
      const url='${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}?filterByFormula='+encodeURIComponent(filter)+'&pageSize=100'+(offset?'&offset='+offset:'');
      const res=await fetch(url);
      if(!res.ok){ console.error('Direct fetch fail', res.status); break; }
      const data=await res.json();
      if(data.records) allRecs=allRecs.concat(data.records);
      offset=data.offset||'';
    }while(offset);
    console.log('Direct fetch total:', allRecs.length);
    window._allJemaahDirect=allRecs;
    updateVisaCountBadge();
  }catch(e){ console.error('Direct fetch error', e); }
}

window.downloadAllVisas=downloadAllVisas;
window.downloadAllPassports=downloadAllPassports;
window.downloadAllDocs=downloadAllDocs;
window.updateVisaCountBadge=updateVisaCountBadge;
setTimeout(updateVisaCountBadge, 2000);