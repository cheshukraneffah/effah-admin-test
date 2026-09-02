// components/rooming-header.js V103.38 PROXY ONLY - balanced braces fixed
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