
// js/modules/ejen/ejen.js V1.0 FINAL - EJEN LIST TRACKER - proxy path format
// Table: EJEN LIST - Fields: NAMA EJEN, NO TELEFON, STATUS, DATA JEMAAH UMRAH, JUMLAH JEMAAH, CATATAN
console.log('EJEN TRACKER V1.0 FINAL loaded');

// Ensure proxy helpers exist (if constants.js from rooming not loaded)
window.PROXY_URL = window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api';
window.AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || 'appSsn4JyQD4DnYu0';
window.TABLE_IDS = window.TABLE_IDS || {};
window.TABLE_IDS['EJEN'] = window.TABLE_IDS['EJEN'] || 'EJEN LIST'; // will be replaced by tbl id if provided
window.TABLE_IDS['PAX'] = window.TABLE_IDS['PAX'] || 'tblsiSgXa9DxX3z9v';
window.TABLE_IDS['TRIP'] = window.TABLE_IDS['TRIP'] || 'tbl5Pbn2HkVsev5Uy';

const _origFetchEjen = window._origFetch || window.fetch.bind(window);
const EFFAH_PROXY_EJEN = (window.PROXY_URL || '').replace(/\/$/,'');
const EFFAH_BASE_EJEN = window.AIRTABLE_BASE_ID;

async function effahProxyFetchEjen(url, opts={}){
  const res = await _origFetchEjen(url, opts);
  const txt = await res.text();
  let data; try{ data=JSON.parse(txt); }catch(e){ if(!res.ok) throw new Error(`Proxy ${res.status}: ${txt.slice(0,800)}`); return {records:[]}; }
  if(!res.ok && data.error) throw new Error(JSON.stringify(data.error));
  return data;
}
function buildProxyUrlEjen(tableKeyOrId, query=''){
  let tableId = window.TABLE_IDS[tableKeyOrId] || tableKeyOrId;
  let url = `${EFFAH_PROXY_EJEN}/${EFFAH_BASE_EJEN}/${encodeURIComponent(tableId)}`;
  if(query){ url += (query.startsWith('?')?'':'?') + query; }
  return url;
}
async function effahGetAllEjen(tableKeyOrId, filterFormula){
  let all=[], offset='';
  do{
    let q='pageSize=100';
    if(filterFormula) q+=`&filterByFormula=${encodeURIComponent(filterFormula)}`;
    if(offset) q+=`&offset=${encodeURIComponent(offset)}`;
    let url=buildProxyUrlEjen(tableKeyOrId, q);
    console.log('[EJEN GET]', url);
    const data=await effahProxyFetchEjen(url);
    if(data.records) all=all.concat(data.records);
    offset=data.offset||'';
  }while(offset);
  console.log('[EJEN OK]', tableKeyOrId, all.length);
  return all;
}
async function effahCreateEjen(tableKeyOrId, fields){
  let url=buildProxyUrlEjen(tableKeyOrId,'');
  return await effahProxyFetchEjen(url,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({fields})});
}
async function effahUpdateEjen(tableKeyOrId, recordId, fields){
  let url=buildProxyUrlEjen(tableKeyOrId,'')+'/'+recordId;
  return await effahProxyFetchEjen(url,{method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({fields})});
}
async function effahDeleteEjen(tableKeyOrId, recordId){
  let url=buildProxyUrlEjen(tableKeyOrId,'')+'/'+recordId;
  return await effahProxyFetchEjen(url,{method:'DELETE'});
}

// State
var allEjenRecords = window.allEjenRecords || [];
var allJemaahForEjen = window.allJemaahForEjen || [];
var activeEjenTripId = window.activeEjenTripId || localStorage.getItem('effah_active_trip_id') || '';
window.allEjenRecords = allEjenRecords;

function getEjenName(r){ return r.fields?.['NAMA EJEN'] || r.fields?.['NAMA'] || 'EJEN'; }

async function fetchEjenTripDropdown(){
  try{
    const trips = await effahGetAllEjen('TRIP', '');
    const sel = document.getElementById('ejenTripSelect');
    if(!sel) return;
    // Sort by date desc
    trips.sort((a,b)=> new Date(b.fields['TARIKH']||b.fields['DATE']||0) - new Date(a.fields['TARIKH']||a.fields['DATE']||0));
    sel.innerHTML = '<option value="">Semua Trip</option>' + trips.map(t=>{
      const name = t.fields['TRIP NAME']||t.fields['NAMA TRIP']||t.id;
      return `<option value="${t.id}">${name}</option>`;
    }).join('');
    if(activeEjenTripId) sel.value = activeEjenTripId;
  }catch(e){ console.error('fetchEjenTripDropdown', e); }
}

async function fetchEjenData(){
  try{
    showEjenLoading(true);
    const tripId = document.getElementById('ejenTripSelect')?.value || activeEjenTripId || '';
    activeEjenTripId = tripId;
    // 1. Get all ejen
    allEjenRecords = await effahGetAllEjen('EJEN', '');
    // 2. Get jemaah for counting (if trip selected, filter by trip)
    let jemaahFilter = '';
    if(tripId) jemaahFilter = `FIND("${tripId}", ARRAYJOIN({TRIP}))`;
    allJemaahForEjen = await effahGetAllEjen('PAX', jemaahFilter);
    
    // Build map ejenId -> count for current trip
    window._ejenCountMap = {};
    allJemaahForEjen.forEach(j=>{
      const ejenIds = j.fields['EJEN'] || [];
      ejenIds.forEach(eId=>{
        window._ejenCountMap[eId] = (window._ejenCountMap[eId]||0)+1;
      });
    });
    
    renderEjenList();
    showEjenLoading(false);
  }catch(e){
    console.error('fetchEjenData failed', e);
    showEjenLoading(false);
    const cont = document.getElementById('ejenListContainer');
    if(cont) cont.innerHTML = `<div class="p-4 text-[11px] text-red-500">Gagal load: ${e.message}</div>`;
  }
}

function showEjenLoading(show){
  const el=document.getElementById('ejenLoading');
  if(el) el.classList.toggle('hidden', !show);
}

function renderEjenList(){
  const cont = document.getElementById('ejenListContainer');
  if(!cont) return;
  const search = (document.getElementById('searchEjen')?.value || '').toLowerCase();
  
  let filtered = allEjenRecords;
  if(search){
    filtered = filtered.filter(r=> {
      const name = (r.fields['NAMA EJEN']||'').toLowerCase();
      const kod = (r.fields['KOD EJEN']||'').toLowerCase();
      const tel = (r.fields['NO TELEFON']||'').toLowerCase();
      return name.includes(search) || kod.includes(search) || tel.includes(search);
    });
  }
  
  // Sort by jumlah jemaah in current trip desc, then name asc
  filtered.sort((a,b)=>{
    const ca = window._ejenCountMap?.[a.id] || a.fields['JUMLAH JEMAAH'] || 0;
    const cb = window._ejenCountMap?.[b.id] || b.fields['JUMLAH JEMAAH'] || 0;
    if(cb!==ca) return cb-ca;
    return (a.fields['NAMA EJEN']||'').localeCompare(b.fields['NAMA EJEN']||'');
  });
  
  if(filtered.length===0){
    cont.innerHTML = '<div class="p-6 text-center text-[11px] text-slate-400">Tiada ejen. Klik + Tambah Ejen.</div>';
    updateEjenBadge(0);
    return;
  }
  
  cont.innerHTML = filtered.map(r=>{
    const name = r.fields['NAMA EJEN']||'-';
    const tel = r.fields['NO TELEFON']||'-';
    const status = r.fields['STATUS']||'Aktif';
    const statusColor = status==='Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status==='Tidak Aktif' ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-700';
    const jumlahAll = r.fields['JUMLAH JEMAAH']||0;
    const jumlahTrip = window._ejenCountMap?.[r.id] || 0;
    const displayJumlah = activeEjenTripId ? jumlahTrip : jumlahAll;
    const catatan = r.fields['CATATAN']||'';
    return `
    <div class="bg-white rounded-2xl border border-slate-200 p-3.5 hover:border-[#7A0C2E]/20 transition">
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1">
          <div class="font-bold text-[12px] text-slate-800">${name}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">${tel} ${r.fields['KOD EJEN']? '• '+r.fields['KOD EJEN'] : ''}</div>
          ${catatan ? `<div class="text-[10px] text-slate-400 mt-1 italic">${catatan}</div>` : ''}
        </div>
        <span class="text-[9px] px-2 py-0.5 rounded-full border ${statusColor} font-bold">${status}</span>
      </div>
      <div class="flex gap-2 mt-3">
        <div class="flex-1 bg-slate-50 rounded-xl px-2.5 py-2 text-center">
          <div class="text-[16px] font-bold text-[#7A0C2E]">${displayJumlah}</div>
          <div class="text-[8px] text-slate-500 uppercase tracking-wide">${activeEjenTripId ? 'Jemaah Trip Ini' : 'Total Jemaah'}</div>
        </div>
        <div class="flex-1 bg-slate-50 rounded-xl px-2.5 py-2 text-center">
          <div class="text-[12px] font-bold text-slate-700">${jumlahAll}</div>
          <div class="text-[8px] text-slate-500 uppercase tracking-wide">Total Keseluruhan</div>
        </div>
      </div>
      <div class="flex gap-1.5 mt-3">
        <button onclick="editEjen('${r.id}')" class="flex-1 text-[10px] border border-slate-200 rounded-full py-1.5 hover:bg-slate-50">Edit</button>
        <button onclick="viewEjenJemaah('${r.id}','${name.replace(/'/g,"")}' )" class="flex-1 text-[10px] bg-[#7A0C2E] text-white rounded-full py-1.5 font-bold">Lihat Jemaah (${displayJumlah})</button>
      </div>
    </div>`;
  }).join('');
  
  updateEjenBadge(filtered.length);
}

function updateEjenBadge(n){
  const b=document.getElementById('ejenCountBadge');
  if(b) b.textContent = n + ' Ejen';
}

async function addNewEjen(){
  const nameInput=document.getElementById('newEjenName');
  const telInput=document.getElementById('newEjenTel');
  const kodInput=document.getElementById('newEjenKod');
  const statusInput=document.getElementById('newEjenStatus');
  const catatanInput=document.getElementById('newEjenCatatan');
  if(!nameInput) return;
  const name = nameInput.value.trim().toUpperCase();
  if(!name){ alert('Nama ejen wajib isi'); return; }
  try{
    const fields = {
      'NAMA EJEN': name,
      'NO TELEFON': telInput?.value.trim() || '',
      'KOD EJEN': kodInput?.value.trim().toUpperCase() || '',
      'STATUS': statusInput?.value || 'Aktif',
      'CATATAN': catatanInput?.value.trim() || ''
    };
    const res = await effahCreateEjen('EJEN', fields);
    if(res.id){
      allEjenRecords.push(res);
      renderEjenList();
      // clear
      nameInput.value=''; telInput.value=''; kodInput.value=''; catatanInput.value='';
      document.getElementById('newEjenModal')?.classList.add('hidden');
    }
  }catch(e){ console.error('addNewEjen', e); alert('Gagal tambah ejen: '+e.message); }
}

async function editEjen(ejenId){
  const rec = allEjenRecords.find(r=>r.id===ejenId);
  if(!rec) return;
  const newName = prompt('Nama Ejen:', rec.fields['NAMA EJEN']||'');
  if(newName===null) return;
  const newTel = prompt('No Telefon:', rec.fields['NO TELEFON']||'');
  if(newTel===null) return;
  const newStatus = prompt('Status (Aktif/Tidak Aktif/Blacklist):', rec.fields['STATUS']||'Aktif');
  if(newStatus===null) return;
  try{
    const fields = {'NAMA EJEN': newName.trim().toUpperCase(), 'NO TELEFON': newTel.trim(), 'STATUS': newStatus.trim()};
    await effahUpdateEjen('EJEN', ejenId, fields);
    rec.fields['NAMA EJEN']=fields['NAMA EJEN'];
    rec.fields['NO TELEFON']=fields['NO TELEFON'];
    rec.fields['STATUS']=fields['STATUS'];
    renderEjenList();
  }catch(e){ alert('Gagal update: '+e.message); }
}

async function deleteEjen(ejenId){
  if(!confirm('Padam ejen ini? Jemaah yang link dengan ejen ini akan jadi unassigned.')) return;
  try{
    await effahDeleteEjen('EJEN', ejenId);
    allEjenRecords = allEjenRecords.filter(r=>r.id!==ejenId);
    renderEjenList();
  }catch(e){ alert('Gagal padam: '+e.message); }
}

function viewEjenJemaah(ejenId, ejenName){
  const jemaah = allJemaahForEjen.filter(j=> (j.fields['EJEN']||[]).includes(ejenId));
  if(jemaah.length===0){ alert(`Tiada jemaah untuk ${ejenName} dalam trip ini.`); return; }
  const list = jemaah.map((j,i)=> `${i+1}. ${j.fields['NAMA PENUH']||j.fields['NAMA']||'-'} - ${j.fields['NO TELEFON']||''}`).join('\n');
  alert(`Jemaah bawah ${ejenName} (${jemaah.length}):\n\n${list}`);
}

function onEjenTripChange(){
  const sel=document.getElementById('ejenTripSelect');
  if(sel){
    activeEjenTripId = sel.value;
    localStorage.setItem('effah_active_trip_id', sel.value);
    fetchEjenData();
  }
}

function filterEjenList(q){
  renderEjenList();
}

// Init
document.addEventListener('DOMContentLoaded', async ()=>{
  if(document.getElementById('ejenListContainer')){
    await fetchEjenTripDropdown();
    await fetchEjenData();
  }
});

window.fetchEjenData=fetchEjenData;
window.renderEjenList=renderEjenList;
window.addNewEjen=addNewEjen;
window.editEjen=editEjen;
window.deleteEjen=deleteEjen;
window.viewEjenJemaah=viewEjenJemaah;
window.onEjenTripChange=onEjenTripChange;
window.filterEjenList=filterEjenList;
