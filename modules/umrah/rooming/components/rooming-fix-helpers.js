// components/rooming-fix-helpers.js V103.38 PROXY ONLY - balanced braces fixed
async function effahProxyFetch(url, opts={}

async function effahGetAll(tableId, filterFormula){
  let all=[], offset='';
  do{
    let url = `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&pageSize=100`;
    if(filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    if(offset) url += `&offset=${encodeURIComponent(offset)}`;
    const data = await effahProxyFetch(url);
    if(data.records) all = all.concat(data.records);
    offset = data.offset || '';
    if(data.error) throw new Error(JSON.stringify(data.error));
  }while(offset);
  return all;
}

async function effahGetById(tableId, recordId){
  const url = `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&recordId=${recordId}`;
  return await effahProxyFetch(url);
}

async function effahCreate(tableId, fields){
  const url = `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}`;
  return await effahProxyFetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}

async function effahUpdate(tableId, recordId, fields){
  const url = `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&recordId=${recordId}`;
  return await effahProxyFetch(url, {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}

async function effahDelete(tableId, recordId){
  const url = `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&recordId=${recordId}`;
  return await effahProxyFetch(url, {method:'DELETE'});
}

function resolveTableIdFromOldUrl(old){
  old = decodeURIComponent(old);
  if(old.includes('STAFF LIST')) return EFFAH_T.STAFF;
  if(old.includes('ROOMING LIST')) return EFFAH_T.ROOMING;
  if(old.includes('DATA JEMAAH')) return EFFAH_T.PAX;
  if(old.includes('PAKEJ UMRAH') || old.includes('TRIP')) return EFFAH_T.TRIP;
  return null;
}

function cleanTripNameForRooming(name){
  if(!name) return '';
  if(typeof cleanTripName==='function') return cleanTripName(name);
  return name.replace(/^\s*\d+\/\d+\s*\|\s*/i, '').replace(/^\s*\d+\/\d+\s*/i,'').trim();
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

function getStaffById(id){ return staffList.find(s=>s.id===id||s.airtableId===id); }

function clearInsuranMulti(jemaahId){ const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return; rec.fields['INSURAN']=[]; if(typeof updateJemaahField==='function') updateJemaahField(jemaahId, 'INSURAN', []); if(typeof renderNamelist==='function') renderNamelist(); }

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

function formatCheckbox(v){ return v ? '✓' : '-'; }

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

function loadLocalCatatan(roomId){
  try{
    const key='effah_room_notes_'+roomId;
    return localStorage.getItem(key)||'';
  }catch(e){ return ''; }
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

function onRoomingTripChange(tripId){ if(!tripId) return; const trips=window.allTripUmrahRecords||window.allTripRecords||[]; const found=trips.find(t=>t.id===tripId); if(found) window.selectedTripRecord=found; localStorage.setItem('effah_active_trip_id',tripId); localStorage.setItem('selectedTripId',tripId); localStorage.setItem('effah_last_selected_trip',tripId); fetchRoomingData(true); }

function isJemaahAssignedInLocation(jId, location){
  const loc = (location||activeLocation).toUpperCase();
  return allRoomingRecords.some(r=> (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===loc && (r.fields['JEMAAH']||[]).includes(jId));
}

function getStaffForRoom(roomId){
  const tanpaLocal = (typeof getStaffTanpaKatilForRoom==='function'? getStaffTanpaKatilForRoom(roomId) : []);
  const room = allRoomingRecords.find(r=>r.id===roomId);
  const tanpaFromField = room ? (room.fields['JEMAAH TANPA KATIL']||[]) : [];
  return staffList.filter(s=>{
    if(!s.roomIds || !s.roomIds.includes(roomId)) return false;
    const id = s.id||s.airtableId;
    // If staff is in tanpa katil list (local or field), don't count as regular staff
    if(tanpaLocal.includes(id) || tanpaFromField.includes(id)) return false;
    // Also check _STAFF_TANPA_KATIL
    if(room && room.fields['_STAFF_TANPA_KATIL'] && room.fields['_STAFF_TANPA_KATIL'].includes(id)) return false;
    return true;
  });
}

function isJemaahAssigned(jId){ return allRoomingRecords.some(r=>(r.fields['JEMAAH']||[]).includes(jId)); }

function isJemaahAssignedTanpaKatil(jId){
  try{ return allRoomingRecords.some(r=>{ const arr=r.fields['JEMAAH TANPA KATIL']||r.fields['INFANT']||[]; return arr.includes(jId); }); }catch(e){ return false; }
}

function isJemaahAssignedAny(jId){
  return isJemaahAssigned(jId) || isJemaahAssignedTanpaKatil(jId);
}

function isStaffAssigned(staffId){ const s=staffList.find(x=>x.id===staffId); if(!s) return false; return allRoomingRecords.some(r=> (r.fields['STAFF / EXTRA']||'').split(',').map(x=>x.trim()).includes(s.name)); }

function getStaffTanpaKatilForRoom(roomId){
  try{
    const key='effah_staff_tanpa_'+roomId;
    return JSON.parse(localStorage.getItem(key)||'[]');
  }catch(e){ return []; }
}

function quickAssign(jId){ if(isJemaahAssignedInLocation(jId, activeLocation)) return; const rooms=allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation); const target=rooms.find(r=>{ const j=r.fields['JEMAAH']?.length||0; const s=(r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length; return (j+s)<(r.fields['KAPASITI']||4); }); if(target) assignJemaahToRoom(jId,target.id); }

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

function updateHotelInline(roomId, newName){
  const name = (newName||'').trim().toUpperCase();
  if(!name){ alert('Sila masukkan nama hotel'); return; }
  updateRoomField(roomId,'HOTEL NAME',name,true);
}

async function addTanpaKatilToRoom(roomId, jId){
  const rec=allRoomingRecords.find(r=>r.id===roomId);
  if(!rec) return;
  const cur = rec.fields['JEMAAH TANPA KATIL'] || [];
  if(cur.includes(jId)) return;
  const newVal=[...cur, jId];
  rec.fields['JEMAAH TANPA KATIL']=newVal;
  renderRoomingGrid();
  renderNamelist();
  const b=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const p=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{
    const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'JEMAAH TANPA KATIL':newVal}})});
    const d=await res.json();
    if(d.error) console.warn('Airtable save warning', d.error);
  }catch(e){ console.error(e); }
}

function updateNewRoomIdFromCap(){ const cap=parseInt(document.getElementById('newRoomCap').value)||4; const el=document.getElementById('newRoomId'); if(el) el.value=generateRoomIdFromCap(cap); }

function changeNewRoomCap(d){ const i=document.getElementById('newRoomCap'); let v=parseInt(i.value)||4; v=Math.max(1,Math.min(8,v+d)); i.value=v; updateNewRoomIdFromCap(); }

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

function deleteCustomLocation(loc){ if(!confirm(`Adakah anda pasti ingin memadamkan lokasi ${loc}?`)) return; customLocations=customLocations.filter(l=>l!==loc); localStorage.setItem('effah_custom_locations',JSON.stringify(customLocations)); if(activeLocation===loc) activeLocation='MEKAH'; renderLocationTabs(); renderRoomingGrid(); renderNamelist(); }

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

async function addTanpaKatilToRoom(roomId, jId){
  const rec=allRoomingRecords.find(r=>r.id===roomId);
  if(!rec) return;
  const cur = rec.fields['JEMAAH TANPA KATIL'] || [];
  if(cur.includes(jId)) return;
  const newVal=[...cur, jId];
  rec.fields['JEMAAH TANPA KATIL']=newVal;
  renderRoomingGrid();
  renderNamelist();
  const b=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const p=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{
    const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'JEMAAH TANPA KATIL':newVal}})});
    const d=await res.json();
    if(d.error) console.warn('Airtable save warning', d.error);
  }catch(e){ console.error(e); }
}

async function removeTanpaKatilFromRoom(roomId, jId){
  const rec=allRoomingRecords.find(r=>r.id===roomId);
  if(!rec) return;
  const cur = rec.fields['JEMAAH TANPA KATIL'] || rec.fields['INFANT'] || [];
  const newVal=cur.filter(x=>x!==jId);
  rec.fields['JEMAAH TANPA KATIL']=newVal;
  renderRoomingGrid();
  renderNamelist();
  const b=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const p=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{ await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'JEMAAH TANPA KATIL':newVal}})}); }catch(e){}
}

async function autoAssignRooming(){ if(!confirm('Adakah anda pasti ingin menetapkan semua jemaah yang belum ditetapkan untuk lokasi '+activeLocation+' secara automatik?')) return; let rooms=[...allRoomingRecords].filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase()); if(rooms.length===0) rooms=[...allRoomingRecords]; rooms=getRoomOrderedList(rooms); const unassigned=allRoomingJemaah.filter(j=>!isJemaahAssignedInLocation(j.id, activeLocation)); let idx=0; for(let room of rooms){ const cap=room.fields['KAPASITI']||roomingDefaultCap; const staffCount=(room.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length; let cur=[...(room.fields['JEMAAH']||[])]; while((cur.length+staffCount)<cap && idx<unassigned.length){ cur.push(unassigned[idx].id); idx++; } if(cur.length!==(room.fields['JEMAAH']||[]).length){ await updateRoomField(room.id,'JEMAAH',cur,false); } } setTimeout(fetchRoomingData,800); }

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

function instantRefreshAfterRemove(){
  setTimeout(()=>{ 
    if(typeof renderStaffList==='function') renderStaffList(); 
    if(typeof renderNamelist==='function') renderNamelist();
    if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  }, 100);
}

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