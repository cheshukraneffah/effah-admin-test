// ejen.js - EJEN LIST + EJEN TRACKER V1.1 - FIX TABLE NAME PAKEJ UMRAH SORT + USE CACHE
console.log('EJEN V1.3 - PAKEJ UMRAH loaded - FIX TABLE NAME PAKEJ UMRAH');

var allEjenRecords = window.allEjenRecords || [];
var allEjenJemaahRecords = window.allEjenJemaahRecords || [];
var ejenMode = window.ejenMode || localStorage.getItem('effah_ejen_mode') || 'senarai';
var ejenTripCache = window.ejenTripCache || [];
var ejenActiveTripId = window.ejenActiveTripId || localStorage.getItem('effah_ejen_active_trip') || '';
var ejenSearchQuery = '';

try{
  if(typeof AIRTABLE_PAT === 'undefined' || !AIRTABLE_PAT){
    var AIRTABLE_PAT = window.AIRTABLE_PAT || localStorage.getItem('effah_api_pat') || window.DEFAULT_PAT;
    var AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || localStorage.getItem('effah_base_id') || window.DEFAULT_BASE_ID;
  }
  AIRTABLE_PAT = window.AIRTABLE_PAT || AIRTABLE_PAT || '';
  AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || AIRTABLE_BASE_ID || '';
  window.AIRTABLE_PAT = AIRTABLE_PAT;
  window.AIRTABLE_BASE_ID = AIRTABLE_BASE_ID;
}catch(e){}

function setEjenMode(mode){
  ejenMode = mode;
  window.ejenMode = mode;
  try{ localStorage.setItem('effah_ejen_mode', mode); }catch(e){}
  renderEjenHTML();
  if(mode==='senarai') fetchEjenData();
  if(mode==='tracker'){
    fetchTripForEjenDropdown();
    if(ejenActiveTripId) fetchJemaahForEjenTracker(ejenActiveTripId);
  }
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
            <button onclick="setEjenMode('senarai')" class="px-4 py-1.5 rounded-lg text-xs font-bold transition ${!isTracker ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}">
              <i class="fa-solid fa-list mr-1.5"></i> SENARAI EJEN
            </button>
            <button onclick="setEjenMode('tracker')" class="px-4 py-1.5 rounded-lg text-xs font-bold transition ${isTracker ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}">
              <i class="fa-solid fa-user-tag mr-1.5"></i> EJEN TRACKER
            </button>
          </div>
          <span id="ejenCountBadge" class="text-[11px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full font-bold text-slate-600">${allEjenRecords.length} Ejen</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-[11px]"></i>
            <input id="searchEjenInput" type="text" value="${ejenSearchQuery}" onkeyup="handleEjenSearch(this.value)" placeholder="${isTracker ? 'Cari jemaah...' : 'Cari ejen...'}" class="w-64 text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
          </div>
          ${!isTracker ? `<button onclick="openAddEjenModal()" class="bg-brand-maroon hover:bg-rose-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center shadow-2xs"><i class="fa-solid fa-plus mr-1.5"></i> Tambah Ejen</button>` : ''}
          <button onclick="${isTracker ? 'fetchJemaahForEjenTracker(ejenActiveTripId,true)' : 'fetchEjenData(true)'}" class="text-slate-500 hover:text-slate-900 p-2 border border-slate-200 rounded-xl bg-white" title="Refresh"><i id="iconRefreshEjen" class="fa-solid fa-rotate"></i></button>
        </div>
      </div>
      ${isTracker ? `
        <div class="bg-white p-3 px-4 rounded-2xl border border-slate-300 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <span class="font-bold text-slate-700"><i class="fa-solid fa-plane mr-1 text-brand-maroon"></i> Pilih Trip:</span>
          <select id="ejenTripSelect" onchange="onEjenTripChange(this.value)" class="min-w-[300px] border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold">
            <option value="">-- Pilih Trip Umrah --</option>
          </select>
          <span id="ejenTrackerStats" class="ml-auto text-[11px] text-slate-500 font-medium"></span>
        </div>
        <div id="ejenTrackerContainer" class="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
          <div class="p-8 text-center text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Pilih trip untuk lihat senarai jemaah...</div>
        </div>
      ` : `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white rounded-2xl border border-slate-300 p-3.5 shadow-xs"><div class="text-[10px] font-bold text-slate-500 uppercase">Total Ejen</div><div id="statTotalEjen" class="text-xl font-extrabold text-slate-900">${allEjenRecords.length}</div></div>
          <div class="bg-white rounded-2xl border border-slate-300 p-3.5 shadow-xs"><div class="text-[10px] font-bold text-slate-500 uppercase">Aktif</div><div id="statAktifEjen" class="text-xl font-extrabold text-emerald-600">${allEjenRecords.filter(r=>(r.fields['STATUS']||'').toUpperCase()==='AKTIF').length}</div></div>
          <div class="bg-white rounded-2xl border border-slate-300 p-3.5 shadow-xs"><div class="text-[10px] font-bold text-slate-500 uppercase">Tidak Aktif</div><div id="statTidakAktifEjen" class="text-xl font-extrabold text-slate-500">${allEjenRecords.filter(r=>(r.fields['STATUS']||'').toUpperCase()!=='AKTIF').length}</div></div>
          <div class="bg-white rounded-2xl border border-slate-300 p-3.5 shadow-xs"><div class="text-[10px] font-bold text-slate-500 uppercase">Jumlah Jemaah (Semua Ejen)</div><div id="statJmlJemaahEjen" class="text-xl font-extrabold text-brand-maroon">${allEjenRecords.reduce((s,r)=>s+ (parseInt(r.fields['JUMLAH JEMAAH'])||0),0)}</div></div>
        </div>
        <div id="ejenListContainer" class="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
          <div class="p-8 text-center text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Memuat ejen...</div>
        </div>
      `}
    </div>
    <div id="ejenModal" class="hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 id="ejenModalTitle" class="font-bold text-sm text-slate-900">Tambah Ejen</h3>
          <button onclick="closeEjenModal()" class="text-slate-400 hover:text-slate-900"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="p-4 space-y-3">
          <div><label class="text-[11px] font-bold text-slate-600 uppercase">Nama Ejen *</label><input id="ejenInputNama" type="text" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400" placeholder="ALI BIN ABU"></div>
          <div><label class="text-[11px] font-bold text-slate-600 uppercase">No Telefon</label><input id="ejenInputPhone" type="text" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400" placeholder="012-3456789"></div>
          <div><label class="text-[11px] font-bold text-slate-600 uppercase">Status</label><select id="ejenInputStatus" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white"><option value="AKTIF">AKTIF</option><option value="TIDAK AKTIF">TIDAK AKTIF</option></select></div>
          <div><label class="text-[11px] font-bold text-slate-600 uppercase">Catatan</label><textarea id="ejenInputCatatan" rows="3" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400" placeholder="Team KL etc"></textarea></div>
          <input type="hidden" id="ejenInputId">
        </div>
        <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button onclick="closeEjenModal()" class="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100">Batal</button>
          <button onclick="saveEjen()" class="px-5 py-2 rounded-xl text-xs font-bold bg-brand-maroon hover:bg-rose-900 text-white">Simpan</button>
        </div>
      </div>
    </div>
  `;
  if(isTracker){
    populateEjenTripDropdown();
    if(ejenActiveTripId){
      const sel=document.getElementById('ejenTripSelect');
      if(sel) sel.value = ejenActiveTripId;
    }
  }
  if(!isTracker) renderSenaraiEjenGrid();
  else if(allEjenJemaahRecords.length>0) renderEjenTrackerGrid();
  const searchInput=document.getElementById('searchEjenInput');
  if(searchInput && ejenSearchQuery) searchInput.value = ejenSearchQuery;
}

function handleEjenSearch(val){
  ejenSearchQuery = (val||'').toLowerCase();
  if(ejenMode==='senarai') renderSenaraiEjenGrid();
  else renderEjenTrackerGrid();
}

async function fetchEjenData(force=false){
  try{
    const icon=document.getElementById('iconRefreshEjen');
    if(icon) icon.classList.add('fa-spin');
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
    const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    if(!base||!pat) throw new Error('Config missing');
    let all=[],offset='';
    do{
      const res=await fetch(`https://api.airtable.com/v0/${base}/EJEN%20LIST?pageSize=100${offset?`&offset=${offset}`:''}`,{headers:{Authorization:`Bearer ${pat}`}});
      const data=await res.json();
      if(data.error){ console.error('Airtable EJEN LIST error', data); throw new Error(data.error.message); }
      if(data.records) all=all.concat(data.records);
      offset=data.offset||'';
    }while(offset);
    allEjenRecords = all;
    window.allEjenRecords = all;
    const badge=document.getElementById('ejenCountBadge');
    if(badge) badge.textContent = `${all.length} Ejen`;
    const totalEl=document.getElementById('statTotalEjen'); if(totalEl) totalEl.textContent = all.length;
    const aktifEl=document.getElementById('statAktifEjen'); if(aktifEl) aktifEl.textContent = all.filter(r=>(r.fields['STATUS']||'').toUpperCase()==='AKTIF').length;
    const takEl=document.getElementById('statTidakAktifEjen'); if(takEl) takEl.textContent = all.filter(r=>(r.fields['STATUS']||'').toUpperCase()!=='AKTIF').length;
    const jmlEl=document.getElementById('statJmlJemaahEjen'); if(jmlEl) jmlEl.textContent = all.reduce((s,r)=>s+(parseInt(r.fields['JUMLAH JEMAAH'])||0),0);
    renderSenaraiEjenGrid();
  }catch(e){
    console.error('fetchEjenData failed', e);
    const c=document.getElementById('ejenListContainer');
    if(c) c.innerHTML=`<div class="p-6 text-xs text-red-500">Gagal load ejen: ${e.message} - Check PAT ada akses table EJEN LIST tak.</div>`;
  }finally{
    const icon=document.getElementById('iconRefreshEjen');
    if(icon) icon.classList.remove('fa-spin');
  }
}

function renderSenaraiEjenGrid(){
  const c=document.getElementById('ejenListContainer');
  if(!c) return;
  let filtered = [...allEjenRecords];
  if(ejenSearchQuery){
    filtered = filtered.filter(r=>{
      const f=r.fields||{};
      return String(f['NAMA EJEN']||'').toLowerCase().includes(ejenSearchQuery) || String(f['NO TELEFON']||'').toLowerCase().includes(ejenSearchQuery);
    });
  }
  filtered.sort((a,b)=> String(a.fields['NAMA EJEN']||'').localeCompare(String(b.fields['NAMA EJEN']||'')));
  if(filtered.length===0){
    c.innerHTML=`<div class="p-10 text-center text-slate-400 text-xs">Tiada ejen dijumpai.</div>`;
    return;
  }
  let html=`<div class="overflow-x-auto"><table class="w-full text-xs"><thead class="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase"><tr><th class="text-left px-4 py-2.5">#</th><th class="text-left px-4 py-2.5">Nama Ejen</th><th class="text-left px-4 py-2.5">No Telefon</th><th class="text-left px-4 py-2.5">Status</th><th class="text-left px-4 py-2.5">Jumlah Jemaah</th><th class="text-left px-4 py-2.5">Catatan</th><th class="text-right px-4 py-2.5">Aksi</th></tr></thead><tbody>`;
  filtered.forEach((r,i)=>{
    const f=r.fields||{};
    const status=(f['STATUS']||'AKTIF').toUpperCase();
    const badgeClass = status==='AKTIF' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200';
    html+=`<tr class="border-b border-slate-100 hover:bg-slate-50/80">
      <td class="px-4 py-2.5 text-slate-500">${i+1}</td>
      <td class="px-4 py-2.5 font-bold text-slate-900">${escapeHtml(f['NAMA EJEN']||'-')}</td>
      <td class="px-4 py-2.5">${escapeHtml(f['NO TELEFON']||'-')}</td>
      <td class="px-4 py-2.5"><span class="px-2 py-1 rounded-full text-[10px] font-bold border ${badgeClass}">${status}</span></td>
      <td class="px-4 py-2.5"><span class="font-bold text-brand-maroon">${f['JUMLAH JEMAAH']||0}</span> <button onclick="viewJemaahByEjen('${r.id}')" class="ml-2 text-[10px] underline text-slate-500 hover:text-brand-maroon">Lihat</button></td>
      <td class="px-4 py-2.5 text-slate-500 truncate max-w-[200px]">${escapeHtml(f['CATATAN']||'')}</td>
      <td class="px-4 py-2.5 text-right"><div class="flex justify-end gap-1"><button onclick="openEditEjenModal('${r.id}')" class="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"><i class="fa-solid fa-pen text-[11px]"></i></button><button onclick="deleteEjen('${r.id}')" class="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-red-50 text-red-500"><i class="fa-solid fa-trash text-[11px]"></i></button></div></td>
    </tr>`;
  });
  html+=`</tbody></table></div>`;
  c.innerHTML=html;
}

function openAddEjenModal(){
  document.getElementById('ejenInputId').value='';
  document.getElementById('ejenInputNama').value='';
  document.getElementById('ejenInputPhone').value='';
  document.getElementById('ejenInputStatus').value='AKTIF';
  document.getElementById('ejenInputCatatan').value='';
  document.getElementById('ejenModalTitle').textContent='Tambah Ejen';
  document.getElementById('ejenModal').classList.remove('hidden');
}
function openEditEjenModal(recId){
  const rec=allEjenRecords.find(r=>r.id===recId);
  if(!rec) return;
  const f=rec.fields||{};
  document.getElementById('ejenInputId').value=rec.id;
  document.getElementById('ejenInputNama').value=f['NAMA EJEN']||'';
  document.getElementById('ejenInputPhone').value=f['NO TELEFON']||'';
  document.getElementById('ejenInputStatus').value=(f['STATUS']||'AKTIF').toUpperCase();
  document.getElementById('ejenInputCatatan').value=f['CATATAN']||'';
  document.getElementById('ejenModalTitle').textContent='Edit Ejen';
  document.getElementById('ejenModal').classList.remove('hidden');
}
function closeEjenModal(){ document.getElementById('ejenModal').classList.add('hidden'); }
async function saveEjen(){
  const id=document.getElementById('ejenInputId').value.trim();
  const nama=document.getElementById('ejenInputNama').value.trim().toUpperCase();
  const phone=document.getElementById('ejenInputPhone').value.trim();
  const status=document.getElementById('ejenInputStatus').value;
  const catatan=document.getElementById('ejenInputCatatan').value.trim();
  if(!nama){ alert('Nama ejen wajib isi'); return; }
  const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
  const fields={'NAMA EJEN':nama,'NO TELEFON':phone||null,'STATUS':status,'CATATAN':catatan||null};
  try{
    let url=`https://api.airtable.com/v0/${base}/EJEN%20LIST`, method='POST', body={fields};
    if(id){ url+=`/${id}`; method='PATCH'; }
    const res=await fetch(url,{method,headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify(id?{fields}:body)});
    const data=await res.json();
    if(data.error) throw new Error(data.error.message);
    closeEjenModal();
    fetchEjenData(true);
  }catch(e){ alert('Gagal simpan: '+e.message); }
}
async function deleteEjen(recId){
  if(!confirm('Padam ejen ni?')) return;
  const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
  try{
    const res=await fetch(`https://api.airtable.com/v0/${base}/EJEN%20LIST/${recId}`,{method:'DELETE',headers:{'Authorization':`Bearer ${pat}`}});
    if(!res.ok) throw new Error('Delete failed');
    allEjenRecords=allEjenRecords.filter(r=>r.id!==recId);
    renderSenaraiEjenGrid();
  }catch(e){ alert('Gagal padam: '+e.message); }
}

// ===== FIXED TRIP DROPDOWN - NO SORT PARAM, USE CACHE FIRST =====

async function fetchTripForEjenDropdown(){
  try{
    const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
    if(!base||!pat) return;
    console.log('Fetching PAKEJ UMRAH for ejen dropdown...');
    let all=[],offset='';
    do{
      // NO SORT to avoid 403, simple fetch
      const url=`https://api.airtable.com/v0/${base}/PAKEJ%20UMRAH?pageSize=100${offset?`&offset=${offset}`:''}`;
      const res=await fetch(url,{headers:{Authorization:`Bearer ${pat}`}});
      const data=await res.json();
      if(data.error){
        console.error('PAKEJ UMRAH fetch error', data.error);
        // fallback to cache if fails
        let cached = window.allTripUmrahRecords || window.allTripRecords || window.rawTripRecordsList || window.tripUmrahCache || [];
        if(cached && cached.length>0){
          ejenTripCache=cached;
          populateEjenTripDropdown();
          return;
        }
        throw new Error(data.error.message);
      }
      if(data.records) all=all.concat(data.records);
      offset=data.offset||'';
    }while(offset);
    // sort by date field if exists, client side
    all.sort((a,b)=>{
      const da = a.fields['TRIP DATE'] || a.fields['DATE'] || a.fields['TARIKH'] || '';
      const db = b.fields['TRIP DATE'] || b.fields['DATE'] || b.fields['TARIKH'] || '';
      return String(db).localeCompare(String(da));
    });
    ejenTripCache=all;
    window.ejenTripCache=all;
    console.log('✅ PAKEJ UMRAH loaded', all.length, all[0]?.fields);
    populateEjenTripDropdown();
  }catch(e){
    console.error('fetchTripForEjenDropdown failed', e);
    const sel=document.getElementById('ejenTripSelect');
    if(sel) sel.innerHTML=`<option value="">⚠️ ${e.message}</option>`;
  }
}






function onEjenTripChange(tripId){
  ejenActiveTripId=tripId;
  window.ejenActiveTripId=tripId;
  try{ localStorage.setItem('effah_ejen_active_trip', tripId); }catch(e){}
  if(!tripId){
    document.getElementById('ejenTrackerContainer').innerHTML=`<div class="p-8 text-center text-slate-400 text-xs">Pilih trip untuk lihat senarai jemaah...</div>`;
    return;
  }
  fetchJemaahForEjenTracker(tripId);
}


async function fetchJemaahForEjenTracker(tripId, force=false){
  if(!tripId) return;
  const container=document.getElementById('ejenTrackerContainer');
  if(container) container.innerHTML=`<div class="p-8 text-center text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Memuat jemaah trip...</div>`;
  try{
    const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
    let all=[],offset='';
    // Try filter with PAKEJ UMRAH first, fallback to TRIP, PAKEJ
    const fieldsToTry = ['PAKEJ UMRAH','PAKEJ','TRIP'];
    let successField = null;
    for(const fieldName of fieldsToTry){
      try{
        all=[]; offset='';
        const filter=`FIND("${tripId}",ARRAYJOIN({${fieldName}}))`;
        console.log('Trying filter', fieldName, filter);
        do{
          const url=`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH?filterByFormula=${encodeURIComponent(filter)}&pageSize=100${offset?`&offset=${offset}`:''}`;
          const res=await fetch(url,{headers:{Authorization:`Bearer ${pat}`}});
          const data=await res.json();
          if(data.error) throw new Error(data.error.message);
          if(data.records) all=all.concat(data.records);
          offset=data.offset||'';
        }while(offset);
        if(all.length>0){ successField=fieldName; console.log('✅ Found jemaah with field', fieldName, all.length); break; }
      }catch(err){
        console.log('Filter failed for', fieldName, err.message);
        continue;
      }
    }
    // if still 0, try without filter but log one record to see fields
    if(all.length===0){
      console.log('No jemaah with FIND, trying to fetch 1 sample to inspect fields...');
      const url=`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH?pageSize=1`;
      const res=await fetch(url,{headers:{Authorization:`Bearer ${pat}`}});
      const data=await res.json();
      console.log('Sample jemaah record fields:', data.records?.[0]?.fields);
    }
    all.sort((a,b)=> String(a.fields['NAME']||'').localeCompare(String(b.fields['NAME']||'')));
    allEjenJemaahRecords=all;
    window.allEjenJemaahRecords=all;
    if(allEjenRecords.length===0) await fetchEjenData();
    renderEjenTrackerGrid();
  }catch(e){
    console.error('fetchJemaahForEjenTracker failed', e);
    const container=document.getElementById('ejenTrackerContainer');
    if(container) container.innerHTML=`<div class="p-6 text-xs text-red-500">Gagal load jemaah: ${e.message}<br><br>Buka console (F12) untuk lihat sample fields.</div>`;
  }
}


function renderEjenTrackerGrid(){
  const container=document.getElementById('ejenTrackerContainer');
  const statsEl=document.getElementById('ejenTrackerStats');
  if(!container) return;
  let filtered=[...allEjenJemaahRecords];
  if(ejenSearchQuery){
    filtered=filtered.filter(r=> String(r.fields['NAME']||'').toLowerCase().includes(ejenSearchQuery));
  }
  const ejenMap={};
  const unassigned=[];
  filtered.forEach(j=>{
    const linked = j.fields['EJEN LIST'];
    const ejenId = Array.isArray(linked) && linked.length>0 ? linked[0] : null;
    if(!ejenId) unassigned.push(j);
    else{
      if(!ejenMap[ejenId]) ejenMap[ejenId]=[];
      ejenMap[ejenId].push(j);
    }
  });
  if(statsEl){
    const total=filtered.length;
    const withEjen=total-unassigned.length;
    statsEl.textContent=`${total} Jemaah | ${withEjen} Ada Ejen | ${unassigned.length} Tiada Ejen`;
  }
  const aktifEjen = allEjenRecords.filter(r=>(r.fields['STATUS']||'').toUpperCase()==='AKTIF').sort((a,b)=>String(a.fields['NAMA EJEN']||'').localeCompare(String(b.fields['NAMA EJEN']||'')));
  const ejenOptionsHtml = `<option value="">-- Tiada Ejen --</option>`+aktifEjen.map(e=>`<option value="${e.id}">${escapeHtml(e.fields['NAMA EJEN']||'')}</option>`).join('');
  let html=`<div class="overflow-x-auto"><table class="w-full text-xs"><thead class="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase sticky top-0"><tr><th class="text-left px-4 py-2.5 w-12">#</th><th class="text-left px-4 py-2.5">Nama Jemaah</th><th class="text-left px-4 py-2.5 w-[260px]">Ejen (grouped)</th></tr></thead><tbody>`;
  let idx=1;
  const groupedEntries = Object.entries(ejenMap).sort((a,b)=>{
    const nameA = allEjenRecords.find(r=>r.id===a[0])?.fields['NAMA EJEN']||'';
    const nameB = allEjenRecords.find(r=>r.id===b[0])?.fields['NAMA EJEN']||'';
    return nameA.localeCompare(nameB);
  });
  groupedEntries.forEach(([ejenId, list])=>{
    const ejenName = allEjenRecords.find(r=>r.id===ejenId)?.fields['NAMA EJEN']||'EJEN';
    html+=`<tr class="bg-slate-100 border-y border-slate-200"><td colspan="3" class="px-4 py-2 font-extrabold text-slate-700"><i class="fa-solid fa-user-tag mr-2 text-brand-maroon"></i>${escapeHtml(ejenName)} <span class="ml-2 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[10px]">${list.length} org</span></td></tr>`;
    list.forEach(j=>{
      const currEjenId = Array.isArray(j.fields['EJEN LIST']) ? j.fields['EJEN LIST'][0] : '';
      const opts = ejenOptionsHtml.replace(`value="${currEjenId}"`, `value="${currEjenId}" selected`);
      html+=`<tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="px-4 py-2 text-slate-500">${idx++}</td>
        <td class="px-4 py-2 font-semibold text-slate-900">${escapeHtml(j.fields['NAME']||'-')}</td>
        <td class="px-4 py-2"><select onchange="updateJemaahEjen('${j.id}', this.value)" class="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-slate-400">${opts}</select></td>
      </tr>`;
    });
  });
  if(unassigned.length>0){
    html+=`<tr class="bg-amber-50 border-y border-amber-200"><td colspan="3" class="px-4 py-2 font-extrabold text-amber-800"><i class="fa-solid fa-circle-exclamation mr-2"></i>TIADA EJEN <span class="ml-2 bg-white border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">${unassigned.length} org</span></td></tr>`;
    unassigned.forEach(j=>{
      html+=`<tr class="border-b border-slate-100 hover:bg-amber-50/50">
        <td class="px-4 py-2 text-slate-500">${idx++}</td>
        <td class="px-4 py-2 font-semibold text-slate-900">${escapeHtml(j.fields['NAME']||'-')}</td>
        <td class="px-4 py-2"><select onchange="updateJemaahEjen('${j.id}', this.value)" class="w-full border border-amber-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-amber-400">${ejenOptionsHtml}</select></td>
      </tr>`;
    });
  }
  if(filtered.length===0){
    html+=`<tr><td colspan="3" class="p-10 text-center text-slate-400">Tiada jemaah dalam trip ni.</td></tr>`;
  }
  html+=`</tbody></table></div>`;
  container.innerHTML=html;
}

async function updateJemaahEjen(jemaahRecId, ejenRecId){
  const base=window.AIRTABLE_BASE_ID, pat=window.AIRTABLE_PAT;
  const rec = allEjenJemaahRecords.find(r=>r.id===jemaahRecId);
  if(rec) rec.fields['EJEN LIST'] = ejenRecId ? [ejenRecId] : [];
  try{
    const url=`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahRecId}`;
    const fields = ejenRecId ? {'EJEN LIST':[ejenRecId]} : {'EJEN LIST':[]};
    const res=await fetch(url,{method:'PATCH',headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields})});
    const data=await res.json();
    if(data.error) throw new Error(data.error.message);
    renderEjenTrackerGrid();
  }catch(e){ alert('Gagal assign ejen: '+e.message); }
}
function viewJemaahByEjen(ejenRecId){
  const linked = allEjenRecords.find(r=>r.id===ejenRecId);
  const jml = linked?.fields['JUMLAH JEMAAH']||0;
  if(jml===0){ alert('Ejen ni belum ada jemaah linked.'); return; }
  setEjenMode('tracker');
  alert(`Ejen ${linked.fields['NAMA EJEN']} ada ${jml} jemaah. Pilih trip di EJEN TRACKER.`);
}
function escapeHtml(str){ if(!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    if(document.getElementById('modul-ejen')){
      if(window.tripUmrahCache && window.tripUmrahCache.length>0) ejenTripCache=window.tripUmrahCache;
      renderEjenHTML();
      fetchEjenData();
      fetchTripForEjenDropdown();
    }
  },1200);
});
window.renderEjenHTML = renderEjenHTML;
window.fetchEjenData = fetchEjenData;
window.fetchTripForEjenDropdown = fetchTripForEjenDropdown;
window.fetchJemaahForEjenTracker = fetchJemaahForEjenTracker;
window.setEjenMode = setEjenMode;
window.updateJemaahEjen = updateJemaahEjen;
window.handleEjenSearch = handleEjenSearch;
window.onEjenTripChange = onEjenTripChange;
window.openAddEjenModal = openAddEjenModal;
window.openEditEjenModal = openEditEjenModal;
window.closeEjenModal = closeEjenModal;
window.saveEjen = saveEjen;
window.deleteEjen = deleteEjen;
window.viewJemaahByEjen = viewJemaahByEjen;
