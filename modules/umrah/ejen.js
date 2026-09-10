// ejen.js V1.7 - FIX UNKNOWN FIELD EJEN LIST + CLEAN LOADING + DROPDOWN MONTH NAME
console.log('EJEN V1.7 - FIX FIELD & DROPDOWN');

var allEjenRecords = window.allEjenRecords || [];
var allEjenJemaahRecords = window.allEjenJemaahRecords || [];
var allJemaahForFilter = [];
var ejenMode = window.ejenMode || localStorage.getItem('effah_ejen_mode') || 'senarai';
var ejenTripCache = window.ejenTripCache || [];
var ejenActiveTripId = window.ejenActiveTripId || localStorage.getItem('effah_ejen_active_trip') || '';
var ejenSearchQuery = '';
var ejenFieldName = window.ejenFieldName || localStorage.getItem('effah_ejen_field') || 'EJEN LIST'; // auto-detect

try{
  var AIRTABLE_PAT = window.AIRTABLE_PAT || localStorage.getItem('effah_api_pat') || window.DEFAULT_PAT;
  var AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || localStorage.getItem('effah_base_id') || window.DEFAULT_BASE_ID;
  window.AIRTABLE_PAT = AIRTABLE_PAT;
  window.AIRTABLE_BASE_ID = AIRTABLE_BASE_ID;
}catch(e){}

function setEjenMode(mode){
  ejenMode = mode;
  window.ejenMode = mode;
  try{ localStorage.setItem('effah_ejen_mode', mode); }catch(e){}
  renderEjenHTML();
  if(mode==='senarai') fetchEjenData();
  if(mode==='tracker'){ fetchTripForEjenDropdown(); if(ejenActiveTripId) fetchJemaahForEjenTracker(ejenActiveTripId); }
}

function renderEjenHTML(){
  const container = document.getElementById('modul-ejen');
  if(!container) return;
  const isTracker = ejenMode === 'tracker';
  container.innerHTML = `
    <div class="flex flex-col space-y-3 min-h-[calc(100vh-140px)]">
      <div class="bg-white p-3 px-4 rounded-2xl border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <div class="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button onclick="setEjenMode('senarai')" class="px-4 py-1.5 rounded-lg text-xs font-bold ${!isTracker ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}"><i class="fa-solid fa-list mr-1.5"></i> SENARAI EJEN</button>
            <button onclick="setEjenMode('tracker')" class="px-4 py-1.5 rounded-lg text-xs font-bold ${isTracker ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}"><i class="fa-solid fa-user-tag mr-1.5"></i> EJEN TRACKER</button>
          </div>
          <span id="ejenCountBadge" class="text-[11px] bg-slate-100 border px-2.5 py-1 rounded-full font-bold">${allEjenRecords.length} Ejen</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-[11px]"></i><input id="searchEjenInput" type="text" value="${ejenSearchQuery}" onkeyup="handleEjenSearch(this.value)" placeholder="${isTracker?'Cari jemaah...':'Cari ejen...'}" class="w-64 text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50"></div>
          ${!isTracker ? `<button onclick="openAddEjenModal()" class="bg-brand-maroon text-white font-bold px-4 py-2 rounded-xl text-xs"><i class="fa-solid fa-plus mr-1.5"></i> Tambah Ejen</button>` : ''}
          <button onclick="${isTracker ? 'fetchJemaahForEjenTracker(ejenActiveTripId,true)' : 'fetchEjenData(true)'}" class="p-2 border rounded-xl bg-white"><i id="iconRefreshEjen" class="fa-solid fa-rotate"></i></button>
        </div>
      </div>
      ${isTracker ? `
        <div class="bg-white p-3 px-4 rounded-2xl border border-slate-300 flex items-center gap-3 text-xs">
          <span class="font-bold"><i class="fa-solid fa-plane mr-1 text-brand-maroon"></i> Pilih Trip:</span>
          <select id="ejenTripSelect" onchange="onEjenTripChange(this.value)" class="min-w-[420px] border border-slate-300 rounded-xl px-3 py-2.5 text-xs bg-white font-semibold"><option value="">-- Pilih Trip Umrah --</option></select>
          <span id="ejenTrackerStats" class="ml-auto text-[11px] text-slate-500"></span>
        </div>
        <div id="ejenTrackerContainer" class="bg-white rounded-2xl border border-slate-300 overflow-hidden"><div class="p-8 text-center text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Pilih trip...</div></div>
      ` : `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white rounded-2xl border p-3.5"><div class="text-[10px] font-bold text-slate-500 uppercase">Total Ejen</div><div class="text-xl font-extrabold">${allEjenRecords.length}</div></div>
          <div class="bg-white rounded-2xl border p-3.5"><div class="text-[10px] font-bold uppercase">Aktif</div><div class="text-xl font-extrabold text-emerald-600">${allEjenRecords.filter(r=>(r.fields['STATUS']||'').toUpperCase()==='AKTIF').length}</div></div>
          <div class="bg-white rounded-2xl border p-3.5"><div class="text-[10px] font-bold uppercase">Tidak Aktif</div><div class="text-xl font-extrabold">${allEjenRecords.filter(r=>(r.fields['STATUS']||'').toUpperCase()!=='AKTIF').length}</div></div>
          <div class="bg-white rounded-2xl border p-3.5"><div class="text-[10px] font-bold uppercase">Jumlah Jemaah</div><div class="text-xl font-extrabold text-brand-maroon">${allEjenRecords.reduce((s,r)=>s+(parseInt(r.fields['JUMLAH JEMAAH'])||0),0)}</div></div>
        </div>
        <div id="ejenListContainer" class="bg-white rounded-2xl border overflow-hidden"><div class="p-8 text-center text-slate-400 text-xs">Memuat ejen...</div></div>
      `}
    </div>
    <div id="ejenModal" class="hidden fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"><div class="bg-white rounded-2xl border shadow-2xl w-full max-w-md overflow-hidden"><div class="p-4 border-b flex justify-between"><h3 id="ejenModalTitle" class="font-bold text-sm">Tambah Ejen</h3><button onclick="closeEjenModal()"><i class="fa-solid fa-xmark"></i></button></div><div class="p-4 space-y-3"><div><label class="text-[11px] font-bold uppercase">Nama Ejen *</label><input id="ejenInputNama" type="text" class="w-full mt-1 border rounded-xl px-3 py-2 text-xs"></div><div><label class="text-[11px] font-bold uppercase">No Telefon</label><input id="ejenInputPhone" type="text" class="w-full mt-1 border rounded-xl px-3 py-2 text-xs"></div><div><label class="text-[11px] font-bold uppercase">Status</label><select id="ejenInputStatus" class="w-full mt-1 border rounded-xl px-3 py-2 text-xs bg-white"><option value="AKTIF">AKTIF</option><option value="TIDAK AKTIF">TIDAK AKTIF</option></select></div><div><label class="text-[11px] font-bold uppercase">Catatan</label><textarea id="ejenInputCatatan" rows="3" class="w-full mt-1 border rounded-xl px-3 py-2 text-xs"></textarea></div><input type="hidden" id="ejenInputId"></div><div class="p-3 bg-slate-50 border-t flex justify-end gap-2"><button onclick="closeEjenModal()" class="px-4 py-2 rounded-xl text-xs font-bold border bg-white">Batal</button><button onclick="saveEjen()" class="px-5 py-2 rounded-xl text-xs font-bold bg-brand-maroon text-white">Simpan</button></div></div></div>
  `;
  populateEjenTripDropdown();
  if(ejenActiveTripId){ const sel=document.getElementById('ejenTripSelect'); if(sel) sel.value=ejenActiveTripId; }
  if(!isTracker) renderSenaraiEjenGrid();
  else if(allEjenJemaahRecords.length>0) renderEjenTrackerGrid();
}

function handleEjenSearch(v){ ejenSearchQuery=(v||'').toLowerCase(); if(ejenMode==='senarai') renderSenaraiEjenGrid(); else renderEjenTrackerGrid(); }

async function fetchEjenData(){
  try{
    const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
    let all=[],off='';
    do{
      const res=await fetch(`https://api.airtable.com/v0/${base}/EJEN%20LIST?pageSize=100${off?`&offset=${off}`:''}`,{headers:{Authorization:`Bearer ${pat}`}});
      const data=await res.json();
      if(data.error) throw new Error(data.error.message);
      if(data.records) all=all.concat(data.records);
      off=data.offset||'';
    }while(off);
    allEjenRecords=all; window.allEjenRecords=all;
    renderSenaraiEjenGrid();
  }catch(e){ console.error(e); }
}

function renderSenaraiEjenGrid(){
  const c=document.getElementById('ejenListContainer'); if(!c) return;
  let f=[...allEjenRecords];
  if(ejenSearchQuery) f=f.filter(r=>String(r.fields['NAMA EJEN']||'').toLowerCase().includes(ejenSearchQuery));
  f.sort((a,b)=>String(a.fields['NAMA EJEN']||'').localeCompare(String(b.fields['NAMA EJEN']||'')));
  if(!f.length){ c.innerHTML=`<div class="p-10 text-center text-slate-400 text-xs">Tiada ejen.</div>`; return; }
  let h=`<div class="overflow-x-auto"><table class="w-full text-xs"><thead class="bg-slate-50 border-b text-[10px] font-bold uppercase"><tr><th class="text-left px-4 py-2.5">#</th><th class="text-left px-4 py-2.5">Nama Ejen</th><th class="text-left px-4 py-2.5">Telefon</th><th class="text-left px-4 py-2.5">Status</th><th class="text-left px-4 py-2.5">Jemaah</th><th class="text-right px-4 py-2.5">Aksi</th></tr></thead><tbody>`;
  f.forEach((r,i)=>{ const d=r.fields||{}; h+=`<tr class="border-b"><td class="px-4 py-2">${i+1}</td><td class="px-4 py-2 font-bold">${escapeHtml(d['NAMA EJEN']||'-')}</td><td class="px-4 py-2">${escapeHtml(d['NO TELEFON']||'')}</td><td class="px-4 py-2">${d['STATUS']||''}</td><td class="px-4 py-2 font-bold text-brand-maroon">${d['JUMLAH JEMAAH']||0}</td><td class="px-4 py-2 text-right"><button onclick="openEditEjenModal('${r.id}')" class="w-7 h-7 border rounded-lg">✎</button> <button onclick="deleteEjen('${r.id}')" class="w-7 h-7 border rounded-lg text-red-500">🗑</button></td></tr>`; });
  h+=`</tbody></table></div>`; c.innerHTML=h;
}

function openAddEjenModal(){ document.getElementById('ejenInputId').value=''; document.getElementById('ejenInputNama').value=''; document.getElementById('ejenInputPhone').value=''; document.getElementById('ejenInputStatus').value='AKTIF'; document.getElementById('ejenInputCatatan').value=''; document.getElementById('ejenModalTitle').textContent='Tambah Ejen'; document.getElementById('ejenModal').classList.remove('hidden'); }
function openEditEjenModal(id){ const r=allEjenRecords.find(x=>x.id===id); if(!r) return; const f=r.fields; document.getElementById('ejenInputId').value=r.id; document.getElementById('ejenInputNama').value=f['NAMA EJEN']||''; document.getElementById('ejenInputPhone').value=f['NO TELEFON']||''; document.getElementById('ejenInputStatus').value=(f['STATUS']||'AKTIF').toUpperCase(); document.getElementById('ejenInputCatatan').value=f['CATATAN']||''; document.getElementById('ejenModalTitle').textContent='Edit Ejen'; document.getElementById('ejenModal').classList.remove('hidden'); }
function closeEjenModal(){ document.getElementById('ejenModal').classList.add('hidden'); }
async function saveEjen(){ const id=document.getElementById('ejenInputId').value.trim(); const nama=document.getElementById('ejenInputNama').value.trim().toUpperCase(); const phone=document.getElementById('ejenInputPhone').value.trim(); const status=document.getElementById('ejenInputStatus').value; const catatan=document.getElementById('ejenInputCatatan').value.trim(); if(!nama){ alert('Nama wajib'); return; } const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT; const fields={'NAMA EJEN':nama,'NO TELEFON':phone||null,'STATUS':status,'CATATAN':catatan||null}; let url=`https://api.airtable.com/v0/${base}/EJEN%20LIST`, method='POST', body={fields}; if(id){ url+=`/${id}`; method='PATCH'; } const res=await fetch(url,{method,headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify(id?{fields}:body)}); const d=await res.json(); if(d.error){ alert(d.error.message); return; } closeEjenModal(); fetchEjenData(); }
async function deleteEjen(id){ if(!confirm('Padam?')) return; const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT; await fetch(`https://api.airtable.com/v0/${base}/EJEN%20LIST/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${pat}`}}); allEjenRecords=allEjenRecords.filter(r=>r.id!==id); renderSenaraiEjenGrid(); }

async function fetchTripForEjenDropdown(){
  try{
    const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
    let all=[],off='';
    do{
      const res=await fetch(`https://api.airtable.com/v0/${base}/PAKEJ%20UMRAH?pageSize=100${off?`&offset=${off}`:''}`,{headers:{Authorization:`Bearer ${pat}`}});
      const data=await res.json();
      if(data.error) throw new Error(data.error.message);
      if(data.records) all=all.concat(data.records);
      off=data.offset||'';
    }while(off);
    if(all.length>0){
      console.log('✅ PAKEJ UMRAH loaded', all.length, 'sample:', all[0].fields);
      all.sort((a,b)=>String(b.fields['TRIP DATE']||'').localeCompare(String(a.fields['TRIP DATE']||'')));
      ejenTripCache=all; window.ejenTripCache=all;
    }
    populateEjenTripDropdown();
  }catch(e){ console.error(e); }
}

function populateEjenTripDropdown(){
  const sel=document.getElementById('ejenTripSelect'); if(!sel) return;
  const trips=ejenTripCache||[];
  if(!trips.length){ sel.innerHTML=`<option value="">-- Tiada trip --</option>`; return; }
  
  // Priority order for name field - MUST contain month name or dash format like rooming
  const first = trips[0]?.fields||{};
  const candidates = ['TRIP NAME','NAMA TRIP','NAMA PAKEJ','PAKEJ','NAMA','TITLE','Name'];
  let bestField = null;
  
  // Find field that looks like "05 - 16 NOVEMBER 2026" or "21 NOVEMBER - 02 DISEMBER"
  const monthRe = /JAN|FEB|MAC|APR|MEI|JUN|JUL|OGOS|SEPT|OKT|NOV|DIS/i;
  for(const key of candidates){
    const val = String(first[key]||'');
    if(val && monthRe.test(val) && val.length>6){ bestField = key; break; }
  }
  if(!bestField){
    for(const k of Object.keys(first)){
      const val = String(first[k]||'');
      if(monthRe.test(val) && val.length>8 && !/^\d{4}-\d{2}-\d{2}$/.test(val.trim())){
        bestField = k; break;
      }
    }
  }
  if(!bestField) bestField = candidates.find(k=>first[k]) || Object.keys(first)[0];
  
  console.log('Using trip name field:', bestField, 'value:', first[bestField]);

  sel.innerHTML=`<option value="">-- Pilih Trip Umrah (${trips.length} trip) --</option>`+trips.map(t=>{
    const f=t.fields||{};
    let name = f[bestField] || f['TRIP NAME'] || f['NAMA TRIP'] || '';
    // skip if name is just date YYYY-MM-DD
    if(/^\d{4}-\d{2}-\d{2}$/.test(String(name).trim())){
      // try fallback that has month
      for(const k of Object.keys(f)){
        const v = String(f[k]||'');
        if(monthRe.test(v) && v.length>8){ name = v; break; }
      }
    }
    if(!name || String(name).startsWith('rec')) name = f['TRIP NAME'] || f['NAMA TRIP'] || t.id;
    return `<option value="${t.id}">${escapeHtml(String(name)).substring(0,120)}</option>`;
  }).join('');
  if(ejenActiveTripId) sel.value=ejenActiveTripId;
}

function onEjenTripChange(tripId){
  ejenActiveTripId=tripId; window.ejenActiveTripId=tripId;
  try{ localStorage.setItem('effah_ejen_active_trip', tripId); }catch(e){}
  if(!tripId){ document.getElementById('ejenTrackerContainer').innerHTML=`<div class="p-8 text-center text-slate-400 text-xs">Pilih trip...</div>`; return; }
  fetchJemaahForEjenTracker(tripId);
}

async function fetchJemaahForEjenTracker(tripId){
  const container=document.getElementById('ejenTrackerContainer');
  if(container) container.innerHTML=`<div class="p-8 text-center text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Memuatkan jemaah...</div>`;
  try{
    const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
    let allJemaah = [];
    // Force full fetch if cache small
    if((window.allJemaahUmrahRecords?.length||0) > 100){
      allJemaah = window.allJemaahUmrahRecords;
    } else if((window.allRoomingJemaah?.length||0) > 100){
      allJemaah = window.allRoomingJemaah;
    } else {
      let all=[],off='';
      do{
        const url=`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH?pageSize=100${off?`&offset=${off}`:''}`;
        const res=await fetch(url,{headers:{Authorization:`Bearer ${pat}`}});
        const data=await res.json();
        if(data.error) throw new Error(data.error.message);
        if(data.records) all=all.concat(data.records);
        off=data.offset||'';
      }while(off);
      allJemaah = all;
      window.allJemaahUmrahRecords = all;
    }

    allJemaahForFilter = allJemaah;
    const filtered = allJemaah.filter(j=>{
      const f=j.fields||{};
      const tripField = f['TRIP'] || f['PAKEJ UMRAH'] || f['PAKEJ'] || [];
      if(Array.isArray(tripField)) return tripField.includes(tripId);
      return false;
    });

    console.log(`Filtered ${filtered.length} for trip ${tripId}`);
    allEjenJemaahRecords = filtered.sort((a,b)=>String(a.fields['NAME']||'').localeCompare(String(b.fields['NAME']||'')));
    window.allEjenJemaahRecords = allEjenJemaahRecords;

    // Detect ejen field name
    if(filtered.length>0){
      const sampleFields = filtered[0].fields;
      console.log('Sample jemaah fields keys:', Object.keys(sampleFields));
      // Try to find ejen field
      const possibleEjenFields = ['EJEN LIST','EJEN','AGEN','EJEN TRACKER','Ejen'];
      let found = possibleEjenFields.find(k=>k in sampleFields);
      if(found){
        ejenFieldName = found;
        console.log('Detected ejen field:', found);
        window.ejenFieldName = found;
        localStorage.setItem('effah_ejen_field', found);
      } else {
        console.warn('No EJEN field found in DATA JEMAAH UMRAH - need to create field EJEN LIST linked to EJEN LIST table');
      }
    }

    if(allEjenRecords.length===0) await fetchEjenData();
    renderEjenTrackerGrid();
  }catch(e){
    console.error(e);
    if(container) container.innerHTML=`<div class="p-6 text-xs text-red-500">${e.message}</div>`;
  }
}

function renderEjenTrackerGrid(){
  const container=document.getElementById('ejenTrackerContainer'); const statsEl=document.getElementById('ejenTrackerStats');
  if(!container) return;
  let filtered=[...allEjenJemaahRecords];
  if(ejenSearchQuery) filtered=filtered.filter(r=>String(r.fields['NAME']||'').toLowerCase().includes(ejenSearchQuery));
  
  // Use detected ejen field name
  const eField = ejenFieldName || 'EJEN LIST';
  
  const ejenMap={}; const unassigned=[];
  filtered.forEach(j=>{
    const linked=j.fields[eField] || j.fields['EJEN LIST'] || j.fields['EJEN'] || [];
    const ejenId=Array.isArray(linked)&&linked.length>0?linked[0]:null;
    if(!ejenId) unassigned.push(j); else { if(!ejenMap[ejenId]) ejenMap[ejenId]=[]; ejenMap[ejenId].push(j); }
  });
  if(statsEl){ statsEl.textContent=`${filtered.length} Jemaah | ${filtered.length-unassigned.length} Ada Ejen | ${unassigned.length} Tiada Ejen`; }
  const aktifEjen=allEjenRecords.filter(r=>(r.fields['STATUS']||'').toUpperCase()==='AKTIF').sort((a,b)=>String(a.fields['NAMA EJEN']||'').localeCompare(String(b.fields['NAMA EJEN']||'')));
  const ejenOptions=`<option value="">-- Tiada Ejen --</option>`+aktifEjen.map(e=>`<option value="${e.id}">${escapeHtml(e.fields['NAMA EJEN']||'')}</option>`).join('');
  let html=`<div class="overflow-x-auto"><table class="w-full text-xs"><thead class="bg-slate-50 border-b text-[10px] font-bold uppercase sticky top-0"><tr><th class="text-left px-4 py-2.5 w-12">#</th><th class="text-left px-4 py-2.5">Nama Jemaah</th><th class="text-left px-4 py-2.5 w-[260px]">Ejen (grouped)</th></tr></thead><tbody>`;
  let idx=1;
  Object.entries(ejenMap).sort((a,b)=>String(allEjenRecords.find(r=>r.id===a[0])?.fields['NAMA EJEN']||'').localeCompare(String(allEjenRecords.find(r=>r.id===b[0])?.fields['NAMA EJEN']||''))).forEach(([eid,list])=>{
    const ename=allEjenRecords.find(r=>r.id===eid)?.fields['NAMA EJEN']||'EJEN';
    html+=`<tr class="bg-slate-100 border-y"><td colspan="3" class="px-4 py-2 font-extrabold"><i class="fa-solid fa-user-tag mr-2 text-brand-maroon"></i>${escapeHtml(ename)} <span class="ml-2 bg-white border px-2 py-0.5 rounded-full text-[10px]">${list.length} org</span></td></tr>`;
    list.forEach(j=>{ const curr=Array.isArray(j.fields[eField]||j.fields['EJEN LIST']||j.fields['EJEN'])?(j.fields[eField]||j.fields['EJEN LIST']||j.fields['EJEN'])[0]:''; html+=`<tr class="border-b hover:bg-slate-50"><td class="px-4 py-2">${idx++}</td><td class="px-4 py-2 font-semibold">${escapeHtml(j.fields['NAME']||'-')}</td><td class="px-4 py-2"><select onchange="updateJemaahEjen('${j.id}',this.value)" class="w-full border rounded-lg px-2 py-1.5 text-xs bg-white">${ejenOptions.replace(`value="${curr}"`, `value="${curr}" selected`)}</select></td></tr>`; });
  });
  if(unassigned.length>0){
    html+=`<tr class="bg-amber-50 border-y border-amber-200"><td colspan="3" class="px-4 py-2 font-extrabold text-amber-800">TIADA EJEN <span class="ml-2 bg-white border px-2 py-0.5 rounded-full text-[10px]">${unassigned.length} org</span></td></tr>`;
    unassigned.forEach(j=>{ html+=`<tr class="border-b hover:bg-amber-50/50"><td class="px-4 py-2">${idx++}</td><td class="px-4 py-2 font-semibold">${escapeHtml(j.fields['NAME']||'-')}</td><td class="px-4 py-2"><select onchange="updateJemaahEjen('${j.id}',this.value)" class="w-full border border-amber-300 rounded-lg px-2 py-1.5 text-xs bg-white">${ejenOptions}</select></td></tr>`; });
  }
  if(!filtered.length) html+=`<tr><td colspan="3" class="p-10 text-center text-slate-400">Tiada jemaah untuk trip ni.</td></tr>`;
  html+=`</tbody></table></div>`; container.innerHTML=html;
}

async function updateJemaahEjen(jId,eId){
  const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
  const eField = ejenFieldName || 'EJEN LIST';
  const rec=allEjenJemaahRecords.find(r=>r.id===jId); if(rec) rec.fields[eField]=eId?[eId]:[];
  try{
    const url=`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jId}`;
    const fields = eId ? {[eField]:[eId]} : {[eField]:[]};
    console.log('Updating', jId, 'field', eField, '->', eId);
    const res=await fetch(url,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields})});
    const data=await res.json();
    if(data.error){
      console.error('Update error:', data.error);
      if(data.error.message.includes('Unknown field name')){
        alert(`Field "${eField}" tak wujud dalam table DATA JEMAAH UMRAH.\n\nSila create field baru:\n1. Buka Airtable > DATA JEMAAH UMRAH\n2. Add field > Type: Linked record > Link to EJEN LIST\n3. Field name: EJEN LIST\n4. Allow multiple: OFF\n\nLepas tu refresh balik.`);
        return;
      }
      throw new Error(data.error.message);
    }
    renderEjenTrackerGrid();
  }catch(e){ alert('Gagal: '+e.message); console.error(e); }
}
function viewJemaahByEjen(id){ const l=allEjenRecords.find(r=>r.id===id); alert(`Ejen ${l?.fields['NAMA EJEN']} - ${l?.fields['JUMLAH JEMAAH']||0} jemaah`); setEjenMode('tracker'); }
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

document.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{ if(document.getElementById('modul-ejen')){ renderEjenHTML(); fetchEjenData(); fetchTripForEjenDropdown(); } },1200); });

window.renderEjenHTML=renderEjenHTML; window.fetchEjenData=fetchEjenData; window.fetchTripForEjenDropdown=fetchTripForEjenDropdown; window.populateEjenTripDropdown=populateEjenTripDropdown; window.fetchJemaahForEjenTracker=fetchJemaahForEjenTracker; window.setEjenMode=setEjenMode; window.updateJemaahEjen=updateJemaahEjen; window.handleEjenSearch=handleEjenSearch; window.onEjenTripChange=onEjenTripChange; window.openAddEjenModal=openAddEjenModal; window.openEditEjenModal=openEditEjenModal; window.closeEjenModal=closeEjenModal; window.saveEjen=saveEjen; window.deleteEjen=deleteEjen; window.viewJemaahByEjen=viewJemaahByEjen;
