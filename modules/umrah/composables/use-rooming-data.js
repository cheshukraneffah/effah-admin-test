// COMPOSABLE - useRoomingData (fetchRoomingData, locationTabs) - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports

function renderLocationTabs(){
  const container=document.getElementById('locationTabs'); if(!container) return;
  const base=['MEKAH','MADINAH','TAIF']; 
  const all=[...base,...customLocations.filter(l=>!base.includes(l))];
  // collect all distinct locations from records
  const allLocFromRecords = new Set();
  allRoomingRecords.forEach(r=>{ const l=(r.fields['LOKASI / CITY']||'').trim().toUpperCase(); if(l) allLocFromRecords.add(l); });
  allLocFromRecords.forEach(l=>{ if(!all.includes(l)) all.push(l); });
  const counts={}; all.forEach(l=>counts[l]=0); 
  allRoomingRecords.forEach(r=>{ 
    let l=(r.fields['LOKASI / CITY']||'').trim().toUpperCase(); 
    if(!l) l='MEKAH'; // default
    if(counts[l]!==undefined) counts[l]++; 
    else { counts[l]=1; if(!all.includes(l)) all.push(l); } 
  });
  let html=all.map(loc=>{
    const label=loc; // V24.6 no emoji
    const c=counts[loc]||0; const active=loc===activeLocation; const isCustom=!['MEKAH','MADINAH','TAIF'].includes(loc);
    const delBtn=isCustom?`<button onclick="event.stopPropagation(); deleteCustomLocation('${loc}')" class="ml-1 w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 hover:text-white flex items-center justify-center text-[9px]">✕</button>`:'';
    const wrapCls=active?'bg-[#7A0C2E] rounded-full':'bg-white rounded-full border border-slate-200';
    return `<div class="inline-flex items-center ${wrapCls}"><button onclick="setActiveLocation('${loc}')" class="px-2.5 py-1 rounded-full text-[11px] font-bold ${active?'text-white':'text-slate-700'}">${label} (${c})</button>${delBtn}</div>`;
  }).join('');
  html+=`<button onclick="openAddLocationModal()" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200">+ Lokasi</button>`;
  container.innerHTML=html;
}
async function fetchRoomingData(forceReload=false){
  try{
    let tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('effah_last_selected_trip')||localStorage.getItem('selectedTripId')||'';
    if(!tripId){
      const sel=document.getElementById('roomingTripSelect');
      if(sel && sel.value) tripId=sel.value;
    }
    const now = Date.now();
    const cacheValid = (now - _roomingCacheTime) < 300000;
    // Only use cache if first load already done and not initial page load
    const canUseCache = _roomingFirstLoadDone && !forceReload && tripId && tripId===_roomingLastTripId && allRoomingJemaah.length>0 && cacheValid && !_roomingIsLoading;
    if(canUseCache){
      console.log('ROOMING CACHE HIT V103.28 - using cached data for trip', tripId, 'staff', staffList.length);
      // Restore staff from cache if empty
      try{
        if((!staffList || staffList.length===0) && _staffCache[tripId] && _staffCache[tripId].length>0){
          staffList = _staffCache[tripId];
          window.staffList = staffList;
          console.log('STAFF CACHE RESTORED', staffList.length);
        }
      }catch(e){}
      try{ populateRoomingTripDropdown(); }catch(e){}
      try{ renderNamelist(); }catch(e){}
      try{ renderStaffList(); }catch(e){ console.warn('renderStaffList cache fail', e); }
      try{ renderRoomingGrid(); }catch(e){}
      try{ renderLocationTabs(); }catch(e){}
      try{ hideRoomingLoading(); }catch(e){}
      return;
    }
    if(_roomingIsLoading && !forceReload){
      console.log('ROOMING already loading, skipping duplicate fetch');
      return;
    }
    _roomingIsLoading = true;
    showRoomingLoading(); 
    populateRoomingTripDropdown();
    // tripId already resolved above for cache check
    if(!tripId){
      const sel=document.getElementById('roomingTripSelect');
      if(sel && sel.value) tripId=sel.value;
    }
    if(!tripId){ 
      document.getElementById('namelistContainer').innerHTML='<div class="p-6 text-center text-[11px] text-slate-400">Sila pilih trip di atas (16-25 OGOS 2026).<br>Jika tracking prevention block storage, pilih manual.</div>'; 
      if(typeof hideRoomingLoading==='function') hideRoomingLoading();
      return; 
    }
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); 
    const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    if(!base||!pat){ 
      document.getElementById('namelistContainer').innerHTML='<div class="p-6 text-center text-[11px] text-red-400">Airtable config missing</div>';
      if(typeof hideRoomingLoading==='function') hideRoomingLoading();
      return;
    }
    let allRooms=[],allJems=[],offset='';
    // Fetch ROOMING LIST with retry
    try{
      do{ 
        const res=await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST?pageSize=100${offset?`&offset=${offset}`:''}`,{headers:{Authorization:`Bearer ${pat}`}}); 
        if(!res.ok){ console.warn('ROOMING LIST fetch failed', res.status); break; }
        const data=await res.json(); 
        if(data.records) allRooms=allRooms.concat(data.records); 
        offset=data.offset||''; 
      }while(offset);
    }catch(e){ console.error('ROOMING LIST error', e); }
    offset='';
    // Fetch JEMAAH with retry - ignore 410 attachment errors (they are not API errors, but data contains expired urls)
    try{
      do{ 
        const res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH?pageSize=100${offset?`&offset=${offset}`:''}`,{headers:{Authorization:`Bearer ${pat}`}}); 
        if(!res.ok){ 
          const txt=await res.text();
          console.warn('JEMAAH fetch failed', res.status, txt);
          if(res.status===429){ await new Promise(r=>setTimeout(r, 2000)); continue; }
          break; 
        }
        const data=await res.json(); 
        if(data.records) allJems=allJems.concat(data.records); 
        offset=data.offset||''; 
      }while(offset);
    }catch(e){ console.error('JEMAAH error', e); }
    console.log('fetchRoomingData done: rooms', allRooms.length, 'jemaah', allJems.length);
    allRoomingRecords=allRooms.filter(r=>{ const tf=r.fields['TRIP']||[]; return Array.isArray(tf)?tf.includes(tripId):String(tf).includes(tripId); });
    allRoomingJemaah=allJems.filter(r=>{ const tf=r.fields['TRIP']||[]; return Array.isArray(tf)?tf.includes(tripId):String(tf).includes(tripId); });
    console.log('filtered for trip', tripId, 'rooms', allRoomingRecords.length, 'jemaah', allRoomingJemaah.length);
    _roomingLastTripId = tripId;
    _roomingCacheTime = Date.now();
    _roomingFirstLoadDone = true;
    window._roomingLastTripId = _roomingLastTripId;
    window._roomingCacheTime = _roomingCacheTime;
    window._roomingFirstLoadDone = true;
    try{ await loadStaffList(); }catch(e){ console.warn('staff list fail', e); }
    renderNamelist(); 
    renderRoomingGrid(); 
    renderLocationTabs();
    if(typeof hideRoomingLoading==='function') hideRoomingLoading();
    _roomingIsLoading = false;
  }catch(e){ 
    _roomingIsLoading = false;
    console.error('fetchRoomingData fatal', e); 
    const cont=document.getElementById('namelistContainer');
    if(cont) cont.innerHTML='<div class="p-6 text-center text-[11px] text-red-400">Ralat memuatkan jemaah: '+e.message+'<br><button onclick="fetchRoomingData(true)" class="mt-2 px-3 py-1 bg-[#7A0C2E] text-white rounded-full text-[10px]">Retry</button></div>';
    if(typeof hideRoomingLoading==='function') hideRoomingLoading();
  }
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

function renderNamelist(){
  const cont=document.getElementById('namelistContainer'); if(!cont) return;
  const q=(document.getElementById('searchRoomingJemaah')?.value||'').toLowerCase();
  const pakejFilter=(document.getElementById('filterPakejRooming')?.value||'').toUpperCase();
  let filtered=[...allRoomingJemaah];
  if(q) filtered=filtered.filter(r=>getJemaahName(r.fields).toLowerCase().includes(q));
  if(pakejFilter) filtered=filtered.filter(r=>getPakejVal(r.fields).toUpperCase()===pakejFilter);
  if(roomingSortActive){
    filtered.sort((a,b)=>{
      const nameA=getJemaahName(a.fields).toUpperCase();
      const nameB=getJemaahName(b.fields).toUpperCase();
      if(roomingSortDir==='asc') return nameA.localeCompare(nameB);
      else return nameB.localeCompare(nameA);
    });
  }
  const total=allRoomingJemaah.length;
  const belumGlobal=allRoomingJemaah.filter(r=>!isJemaahAssignedAny(r.id)).length;
  // V24.16: belumInLoc kira termasuk tanpa katil juga
  const belumInLoc=allRoomingJemaah.filter(r=>{
    const assignedNormal = isJemaahAssignedInLocation(r.id, activeLocation);
    const assignedTanpa = allRoomingRecords.some(rec=> (rec.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase() && ((rec.fields['JEMAAH TANPA KATIL']||[]).includes(r.id)));
    return !assignedNormal && !assignedTanpa;
  }).length;
  const totalEl=document.getElementById('totalJemaahBadge'); if(totalEl) { totalEl.textContent=total+' Total'; totalEl.style.display='none'; }
  const belumEl=document.getElementById('belumAssignBadge'); if(belumEl) { belumEl.textContent=belumInLoc+' Unassigned di '+activeLocation; belumEl.style.display='none'; }
  const topBelum=document.getElementById('belumAssignTop'); if(topBelum) { topBelum.textContent=belumGlobal+' Unassigned'; topBelum.style.display='none'; }
  const topAssign=document.getElementById('assignedTop'); if(topAssign) { topAssign.textContent=(total-belumGlobal)+' Assigned'; topAssign.style.display='none'; }
  const topUnassignedBadge=document.getElementById('topUnassignedBadge'); if(topUnassignedBadge) topUnassignedBadge.style.display='none';
  const topAssignedBadge=document.getElementById('topAssignedBadge'); if(topAssignedBadge) topAssignedBadge.style.display='none';
  if(total===0){ cont.innerHTML='<div class="p-6 text-center text-[11px] text-slate-400">Tiada jemaah untuk trip ini</div>'; return; }
  cont.innerHTML=filtered.map((r,i)=>{
        const name=getJemaahName(r.fields);
    const assignedNormalInLoc=isJemaahAssignedInLocation(r.id, activeLocation);
    const assignedTanpaInLoc=allRoomingRecords.some(rec=> (rec.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase() && ((rec.fields['JEMAAH TANPA KATIL']||[]).includes(r.id)));
    const assignedInLoc = assignedNormalInLoc || assignedTanpaInLoc;
    const assignedGlobal=isJemaahAssignedAny(r.id);
    // FIX ghost dropdown: jangan guna opacity-60 sebab child dropdown ikut transparent, guna bg saja
    const rowCls=assignedInLoc?'bg-slate-100 text-slate-500':'hover:bg-slate-50';
    const drag=assignedInLoc?'':`draggable="true" ondragstart="dragJemaah(event,'${r.id}')" ondragend="dragEnd(event)"`;
    let statusIcon = assignedInLoc? `<button onclick="removeJemaahFromCurrentLoc('${r.id}')" class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px]" title="Keluarkan dari ${activeLocation}">✕</button>` : `<button onclick="quickAssign('${r.id}')" class="w-5 h-5 rounded-full border bg-slate-100 hover:bg-slate-200 text-[10px]">+</button>`;
    if(!assignedInLoc && assignedGlobal) statusIcon = `<button onclick="quickAssign('${r.id}')" class="w-5 h-5 rounded-full border bg-amber-100 hover:bg-amber-200 text-[10px]" title="Sudah ada di lokasi lain, boleh tambah di ${activeLocation} juga">+</button>`;
    const fbArr = getBoardArray(r.fields);
    const fb = fbArr[0] || '-';
    const fbDisplay = fbArr.length ? fbArr.join(', ') : '-';
    const pk = getPakejVal(r.fields) || '-';
    const trChecked = isTrainChecked(r.fields);
    const insArr = getInsuranArray(r.fields);
    let fbCls = 'bg-white border-slate-200';
    // Determine class based on first or combined
    if(fbArr.some(x=>x.includes('MEKAH'))) fbCls='bg-orange-100 border-orange-200 text-orange-800';
    else if(fbArr.some(x=>x.includes('MADINAH'))) fbCls='bg-blue-100 border-blue-200 text-blue-800';
    else if(fbArr.includes('FULLBOARD')) fbCls='bg-emerald-100 border-emerald-200 text-emerald-800';
    else if(fbArr.length===0) fbCls='bg-white border-dashed border-slate-300 text-slate-400';
    const boardOptions = ['FULLBOARD','FULLBOARD (MEKAH)','BB (MEKAH)','FULLBOARD (MADINAH)','BB (MADINAH)'];
    const boardCheckboxes = boardOptions.map(opt=>{
      const checked = fbArr.includes(opt);
      return `<label class="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-50 rounded text-[10px] cursor-pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleBoardMulti('${r.id}','${opt}')" class="w-3 h-3 accent-[#7A0C2E]"> ${opt}</label>`;
    }).join('');
    

    const insArr2 = getInsuranArrayV2 ? getInsuranArrayV2(r.fields) : getInsuranArray(r.fields);
      const insDisplay = insArr2.length ? insArr2.join(', ') : '- INSURAN';
      const insCls = insArr2.length ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400';
      const insuranOptions = ['TAKAFUL','ETIQA','AL-KHAIRI'];
      const insCheckboxes = insuranOptions.map(opt=>{
        const checked = insArr2.includes(opt);
        return `<label class="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-50 rounded text-[10px] cursor-pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleInsuranMulti('${r.id}','${opt}')" class="w-3.5 h-3.5 accent-[#7A0C2E]"> <span class="px-1.5 py-0.5 rounded-full text-[8px] ${opt==='TAKAFUL'?'bg-emerald-100':opt==='ETIQA'?'bg-amber-100':'bg-blue-100'}">${opt}</span></label>`;
      }).join('');
      const insToggle = `<div class="relative w-full">
        <button onclick="event.stopPropagation(); toggleInsuranDropdown('${r.id}')" class="text-[7px] border rounded-full px-2 py-0.5 font-bold ${insCls} outline-none w-full truncate text-left flex items-center justify-between bg-white opacity-100" style="opacity:1;" title="INSURAN - klik untuk pilih">
          <span class="truncate">${insDisplay}</span><span class="ml-1">▼</span>
        </button>
        <div id="insuranDrop-${r.id}" class="hidden absolute left-0 top-full mt-1 w-[190px] bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-1" style="background:#ffffff !important; opacity:1 !important;">
          ${insCheckboxes}
          <div class="border-t border-slate-100 mt-1 pt-1 flex justify-between">
            <button onclick="clearInsuranMulti('${r.id}'); closeInsuranDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-slate-100">Clear</button>
            <button onclick="closeInsuranDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-[#7A0C2E] text-white">OK</button>
          </div>
        </div>
      </div>`;

        return `<div ${drag} class="grid grid-cols-12 items-center px-1.5 py-1.5 text-[11px] border-b border-slate-50 ${rowCls}">
      <div class="col-span-1 text-slate-400 text-[10px]">${String(i+1).padStart(2,'0')}</div>
      <div class="col-span-3 font-medium truncate text-[10px] ${assignedInLoc?'text-slate-500 italic':''}" title="${name}">${name}</div>
      <div class="col-span-2 flex items-center gap-0.5 relative">
        <div class="relative w-full">
          <button onclick="event.stopPropagation(); toggleBoardDropdown('${r.id}')" class="text-[7px] border rounded-full px-2 py-0.5 font-bold ${fbCls} outline-none w-full truncate text-left flex items-center justify-between bg-white opacity-100" style="opacity:1; isolation:isolate;" title="BOARD BASIS - klik untuk pilih 2">
            <span class="truncate">${fbDisplay}</span><span class="ml-1">▼</span>
          </button>
          <div id="boardDrop-${r.id}" class="hidden absolute left-0 top-full mt-1 w-[190px] bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-1" style="background:#ffffff !important; opacity:1 !important; isolation:isolate;">
            ${boardCheckboxes}
            <div class="border-t border-slate-100 mt-1 pt-1 flex justify-between">
              <button onclick="clearBoardMulti('${r.id}'); closeBoardDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-slate-100">Clear</button>
              <button onclick="closeBoardDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-[#7A0C2E] text-white">OK</button>
            </div>
            <div class="text-[7px] text-slate-400 px-2 mt-1">Boleh pilih 2: BB (MEKAH) + FB (MADINAH)</div>
          </div>
        </div>
      </div>
      <div class="col-span-1 text-center">
        <input type="checkbox" ${trChecked?'checked':''} onchange="updateJemaahCheckbox('${r.id}','TRAIN',this.checked)" class="w-3.5 h-3.5 accent-[#7A0C2E] rounded" title="TRAIN">
      </div>
      <div class="col-span-2 flex items-center gap-0.5 flex-wrap justify-center">
        ${insToggle}
      </div>
      <div class="col-span-1 flex items-center gap-0.5">
        <select onchange="updateJemaahField('${r.id}','PAKEJ',this.value)" class="text-[8px] border border-slate-200 rounded-full px-1.5 py-0.5 bg-white max-w-[55px] truncate text-[7px]">
          <option value="-" ${pk==='-'?'selected':''}>-</option>
          <option value="JIMAT EKONOMI" ${pk==='JIMAT EKONOMI'?'selected':''}>JIMAT EKONOMI</option>
          <option value="JIMAT STANDARD" ${pk==='JIMAT STANDARD'?'selected':''}>JIMAT STANDARD</option>
          <option value="JIMAT PREMIUM" ${pk==='JIMAT PREMIUM'?'selected':''}>JIMAT PREMIUM</option>
          <option value="EKONOMI LITE" ${pk==='EKONOMI LITE'?'selected':''}>EKONOMI LITE</option>
          <option value="EKONOMI" ${pk==='EKONOMI'?'selected':''}>EKONOMI</option>
          <option value="STANDARD" ${pk==='STANDARD'?'selected':''}>STANDARD</option>
          <option value="PREMIUM" ${pk==='PREMIUM'?'selected':''}>PREMIUM</option>
          <option value="PREMIUM PLUS" ${pk==='PREMIUM PLUS'?'selected':''}>PREMIUM PLUS</option>
        </select>
      </div>
      <div class="col-span-2 flex items-center justify-center" >
        <select onchange="updateJemaahField('${r.id}','STATUS VISA',this.value)" class="text-[7px] border border-slate-300 rounded-full px-2 py-0.5 bg-white w-full max-w-[60px] truncate font-bold text-[7px] ${getVisaClass(getVisaVal(r.fields))}">
          <option value="" ${getVisaVal(r.fields)===''?'selected':''}>- VISA</option>
          <option value="TOURIST" ${getVisaVal(r.fields)==='TOURIST'?'selected':''}>TOURIST</option>
          <option value="TOURIST (VALID)" ${getVisaVal(r.fields)==='TOURIST (VALID)'?'selected':''}>TOURIST (VALID)</option>
          <option value="UMRAH" ${getVisaVal(r.fields)==='UMRAH'?'selected':''}>UMRAH</option>
          <option value="UMRAH (VALID)" ${getVisaVal(r.fields)==='UMRAH (VALID)'?'selected':''}>UMRAH (VALID)</option>
          <option value="IQAMA (VALID)" ${getVisaVal(r.fields)==='IQAMA (VALID)'?'selected':''}>IQAMA (VALID)</option>
          <option value="" ${getVisaVal(r.fields)===''?'selected':''}>- VISA</option>
        </select>
      </div>
    </div>`;
  }).join('');
  makeNamelistSticky();
  const sortIconEl=document.getElementById('sortIcon');
  if(sortIconEl) sortIconEl.textContent = roomingSortActive ? (roomingSortDir==='asc'?'↑ A-Z':'↓ Z-A') : '↕';
}

function toggleSortNama(){
  if(!roomingSortActive){
    roomingSortActive=true;
    roomingSortDir='asc';
  } else {
    roomingSortDir = roomingSortDir==='asc' ? 'desc' : 'asc';
  }
  localStorage.setItem('effah_rooming_sort_dir', roomingSortDir);
  localStorage.setItem('effah_rooming_sort_active', 'true');
  renderNamelist();
}


function makeNamelistSticky(){
  try{
    const nl = document.getElementById('namelistContainer');
    if(!nl) return;
    // Find left card - the 52% width card
    let leftCard = nl.closest('[class*="lg:w-"]');
    if(!leftCard) leftCard = nl.parentElement;
    // The outer left column wrapper is the parent of leftCard's parent? Actually structure: flex-col lg:flex-row > w-[52%] card
    if(leftCard){
      leftCard.style.position='sticky';
      leftCard.style.top='12px';
      leftCard.style.alignSelf='flex-start';
      leftCard.style.zIndex='20';
      leftCard.style.display='flex';
      leftCard.style.flexDirection='column';
      leftCard.style.backgroundColor='#ffffff';
      leftCard.style.maxHeight='calc(100vh - 16px)';
      leftCard.style.overflow='hidden';
      leftCard.style.borderRadius='16px';
    }
    nl.style.flex='1 1 auto';
    nl.style.maxHeight='48vh';
    nl.style.minHeight='220px';
    nl.style.overflowY='auto';
    nl.style.overflowX='hidden';
    nl.style.backgroundColor='#ffffff';
    const staffSec = document.getElementById('staffListContainer')?.parentElement;
    if(staffSec){
      staffSec.style.flex='0 0 auto';
      staffSec.style.backgroundColor='#ffffff';
      staffSec.style.borderTop='2px solid #e2e8f0';
      staffSec.style.display='flex';
      staffSec.style.flexDirection='column';
      staffSec.style.maxHeight='38vh';
      staffSec.style.overflow='hidden';
    }
    const staffCont = document.getElementById('staffListContainer');
    if(staffCont){
      staffCont.style.flex='1';
      staffCont.style.overflowY='auto';
      staffCont.style.overflowX='hidden';
      staffCont.style.backgroundColor='#ffffff';
    }
    const rg=document.getElementById('roomingGrid');
    if(rg){
      rg.style.overflow='visible';
      rg.style.maxHeight='none';
    }
    // Ensure parent flex row allows sticky
    const flexRow = leftCard?.parentElement;
    if(flexRow){
      flexRow.style.alignItems='flex-start';
    }
  }catch(e){ console.error('sticky fail', e); }
}


function filterRoomingNamelist(){ renderNamelist(); }
