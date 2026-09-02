// components/rooming-header.js - from rooming_10.js proxy path converted
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

function isJemaahAssignedInLocation(jId, location){
  const loc = (location||activeLocation).toUpperCase();
  return allRoomingRecords.some(r=> (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===loc && (r.fields['JEMAAH']||[]).includes(jId));
}

function setActiveLocation(loc){ activeLocation=loc.toUpperCase(); localStorage.setItem('effah_active_location',activeLocation); const el=document.getElementById('copyTargetLoc'); if(el) el.textContent=activeLocation; renderLocationTabs(); renderRoomingGrid(); renderNamelist(); renderStaffList(); }

function openAddLocationModal(){ const loc=prompt('Sila masukkan nama lokasi baharu (contoh: TAIF, JEDDAH, KL):'); if(loc&&loc.trim()){ const up=loc.trim().toUpperCase(); if(!customLocations.includes(up)) customLocations.push(up); localStorage.setItem('effah_custom_locations',JSON.stringify(customLocations)); const sel=document.getElementById('newRoomLokasi'); if(sel){ const exists=[...sel.options].some(o=>o.value===up); if(!exists){ const opt=document.createElement('option'); opt.value=up; opt.textContent=up; sel.appendChild(opt); } } activeLocation=up; localStorage.setItem('effah_active_location',activeLocation); renderLocationTabs(); renderRoomingGrid(); renderNamelist(); alert('Lokasi "'+up+'" ditambah. PENTING: Tambah option "'+up+'" dalam Airtable > ROOMING LIST > LOKASI / CITY sekali sahaja.'); } }

function deleteCustomLocation(loc){ if(!confirm(`Adakah anda pasti ingin memadamkan lokasi ${loc}?`)) return; customLocations=customLocations.filter(l=>l!==loc); localStorage.setItem('effah_custom_locations',JSON.stringify(customLocations)); if(activeLocation===loc) activeLocation='MEKAH'; renderLocationTabs(); renderRoomingGrid(); renderNamelist(); }

function isStaffAssignedInLocation(staffId, loc){
  loc = (loc||activeLocation||'MEKAH').toString().toUpperCase();
  const staffObj = (window.staffList||[]).find(x=>x.id===staffId||x.airtableId===staffId);
  const staffName = (staffObj?.name||staffObj?.fields?.['NAMA']||'').toString().toUpperCase();
  for(const rec of (window.allRoomingRecords||[])){
    const recLoc = (rec.fields['LOKASI / CITY']||'MEKAH').toString().toUpperCase();
    if(recLoc!==loc) continue;
    const staffExtra = rec.fields['STAFF / EXTRA']||[];
    const staffArr = rec.fields['STAFF']||[];
    const tanpa = rec.fields['JEMAAH TANPA KATIL']||[];
    const staffTanpa = rec.fields['STAFF TANPA KATIL']||[];
    const tanpaKatil2 = rec.fields['TANPA KATIL']||[];
    const infant = rec.fields['INFANT']||[];
    const allLists = [...staffExtra, ...staffArr, ...tanpa, ...staffTanpa, ...tanpaKatil2, ...infant];
    if(allLists.includes(staffId)) return true;
    // Fallback check by name - Airtable sometimes stores name
    if(staffName){
      for(const idOrName of allLists){
        if(typeof idOrName==='string' && idOrName.toUpperCase().includes(staffName.split('(')[0].trim())) return true;
      }
    }
    // Check legacy roomIds
    if(staffObj && staffObj.roomIds && staffObj.roomIds.includes(rec.id)) return true;
  }
  return false;
}

function renderLocationTabs(){
  const container=document.getElementById('locationTabs'); 
  if(!container) return;
  if(container.dataset.rendering==='1') return;
  container.dataset.rendering='1';
  try {
    const base=['MEKAH','MADINAH','TAIF']; 
    const custom = window.customLocations || (typeof customLocations!=='undefined'?customLocations:[]);
    const all=[...base,...custom.filter(l=>!base.includes(l))];
    const allLocFromRecords = new Set();
    const records = window.allRoomingRecords || (typeof allRoomingRecords!=='undefined'?allRoomingRecords:[]);
    records.forEach(r=>{ const l=(r.fields['LOKASI / CITY']||'').trim().toUpperCase(); if(l) allLocFromRecords.add(l); });
    allLocFromRecords.forEach(l=>{ if(!all.includes(l)) all.push(l); });
    const counts={}; all.forEach(l=>counts[l]=0); 
    records.forEach(r=>{ 
      let l=(r.fields['LOKASI / CITY']||'').trim().toUpperCase(); 
      if(!l) l='MEKAH';
      if(counts[l]!==undefined) counts[l]++; 
      else { counts[l]=1; if(!all.includes(l)) all.push(l); } 
    });
    let html=all.map(loc=>{
      const c=counts[loc]||0; 
      const active=loc===(window.activeLocation|| (typeof activeLocation!=='undefined'?activeLocation:'MEKAH')); 
      const isCustom=!['MEKAH','MADINAH','TAIF'].includes(loc);
      const delBtn=isCustom?`<button type="button" onclick="event.stopPropagation(); deleteCustomLocation('${loc}')" class="ml-1 w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-[9px]">x</button>`:''; 
      const wrapCls=active?'bg-[#7A0C2E] rounded-full':'bg-white rounded-full border border-slate-200';
      return `<div class="inline-flex items-center ${wrapCls}"><button type="button" data-loc="${loc}" onclick="window.setActiveLocation('${loc}')" class="px-2.5 py-1 rounded-full text-[11px] font-bold ${active?'text-white':'text-slate-700'}">${loc} (${c})</button>${delBtn}</div>`;
    }).join('');
    html+=`<button type="button" onclick="openAddLocationModal()" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200">+ Lokasi</button>`;
    container.innerHTML=html;
  } catch(e){ console.error('renderLocationTabs error', e); }
  finally {
    setTimeout(()=>{ container.dataset.rendering='0'; }, 150);
  }
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