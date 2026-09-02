// CORE - globals, helpers, constants - extracted from rooming.js v35
// CORE - PROXY FIXED V103.36 - FULL 410 LINES - PRESERVED
function getProxy(){ return window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api'; }
function getBase(){ return window.AIRTABLE_BASE_ID || window.DEFAULT_BASE_ID || 'appSsn4JyQD4DnYu0'; }
function getTableIds(){ return window.TABLE_IDS || { STAFF: 'tblssYikTs4GOndyf', ROOMING: 'tblENHq0C677SoO8O', PAX: 'tblsiSgXa9DxX3z9v', TRIP: 'tbl5Pbn2HkVsev5Uy' }; }

// Auto-generated modular split - keep window.* exports

console.log('ROOMING V103.15 FINAL - VISA CLEAR FIX'); console.log('V103.15 CLEAN VISA');
var _autoScrollInterval = window._autoScrollInterval || null;
window._roomingDragListenersAdded = window._roomingDragListenersAdded || false;
// ROOMING V103 CLEAN - Deduped + Modular Ready
// Generated from V102 - Duplicate functions removed, JEDDAH bug fixed
console.log('ROOMING V103 CLEAN loaded');
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
function getStaffStorageKey(){ return `effah_staff_list_${activeLocation}_${window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'}`; }
function saveStaffList(){ try{ localStorage.setItem(getStaffStorageKey(), JSON.stringify(staffList)); localStorage.setItem('effah_staff_board_'+activeLocation, JSON.stringify(staffList)); }catch(e){} }

async function loadStaffList(){
  try{
    const base=getBase();
    // PAT removed - using proxy
    const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('selectedTripId')||'';
    if(!base||!pat){ staffList=JSON.parse(localStorage.getItem(getStaffStorageKey())||'[]'); renderStaffList(); return; }
    let allStaff=[],offset='';
    do{
      const res=await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}?pageSize=100${offset?`&offset=${offset}`:''}`);
      const data=await res.json();
      if(data.records) allStaff=allStaff.concat(data.records);
      offset=data.offset||'';
    }while(offset);
    let filtered=allStaff;
    if(tripId){
      filtered=allStaff.filter(r=>{
        const tf=r.fields['TRIP']||[];
        if(Array.isArray(tf)) return tf.includes(tripId);
        return String(tf).includes(tripId);
      });
    }
    staffList=filtered.map(r=>({
      id:r.id,
      airtableId:r.id,
      name:r.fields['NAME']||'',
      boardBasis:r.fields['BOARD BASIS']||'',
      train:!!r.fields['TRAIN'],
      sortNumber:r.fields['SORT NUMBER']||9999,
      trip:r.fields['TRIP']||[],
      roomIds: r.fields['ROOMING LIST'] || r.fields['ROOM'] || r.fields['BILIK'] || [],
      roomLink: (r.fields['ROOMING LIST']||[])[0]||null
    }));
    staffList.sort((a,b)=>(a.sortNumber||9999)-(b.sortNumber||9999));
    if(staffList.length===0){
      const local=JSON.parse(localStorage.getItem(getStaffStorageKey())||'[]');
      if(local.length>0) staffList=local;
    }
    // Save to cache for trip
    try{ const cacheKey = tripId || 'default'; _staffCache[cacheKey] = JSON.parse(JSON.stringify(staffList)); window._staffCache = _staffCache; }catch(e){}
    renderStaffList();
    renderRoomingGrid(); try{ updateVisaCountBadge(); }catch(e){}
    try{ renderRoomingOverview(allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase())); }catch(e){}
  }catch(e){
    console.error('loadStaffList Airtable failed', e);
    staffList=JSON.parse(localStorage.getItem(getStaffStorageKey())||'[]');
    renderStaffList();
  }
}

async function addNewStaff(){
  const input=document.getElementById('newStaffInput'); if(!input) return;
  let name=input.value.trim().toUpperCase();
  if(!name){ alert('Sila masukkan nama staff.'); return; }
  if(!name.includes('(')) name=`${name} (EFFAH)`;
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'';
  try{
    if(base&&pat){
      const fields = {'NAME': name, 'TRAIN': false, 'SORT NUMBER': staffList.length+1};
      if(tripId) fields['TRIP']=[tripId];
      const res=await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({fields})
      });
      const data=await res.json();
      if(data.id){
        staffList.push({id:data.id, airtableId:data.id, name, boardBasis:'', train:false, sortNumber:staffList.length+1, trip:tripId?[tripId]:[], roomIds: [], roomLink: null});
        saveStaffList(); renderStaffList(); input.value=''; return;
      }
    }
  }catch(e){ console.error('Add staff Airtable failed', e); }
  const id=`staff_${Date.now()}_${++staffIdCounter}`;
  staffList.push({id, name, boardBasis:'', train:false, sortNumber:staffList.length+1, roomIds: [], roomLink: null});
  saveStaffList(); renderStaffList(); input.value='';
}

async function updateStaffField(staffId, field, value){
  const s=staffList.find(x=>x.id===staffId||x.airtableId===staffId); if(!s) return;
  if(field==='boardBasis') s.boardBasis=value; else s[field]=value;
  saveStaffList(); renderStaffList();
  // if clearing board, set value to null for Airtable to clear

  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(!base||!pat||!s.airtableId) return;
  try{
    const airtableField = field==='boardBasis' ? 'BOARD BASIS' : field.toUpperCase();
    const payloadValue = (value==='' || value===null) ? null : value;
    const bodyFields = {};
    if(payloadValue===null){ bodyFields[airtableField]=null; } else { bodyFields[airtableField]=value; }
    await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${s.airtableId}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({fields: bodyFields})
    });
  }catch(e){ console.error('updateStaffField failed', e); }
}

async function assignStaffToRoom(staffId,roomId){
  const staff=staffList.find(s=>s.id===staffId||s.airtableId===staffId); if(!staff) return;
  const rec=allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
  // FIX: allow  rooms linking - append not overwrite
  if(!staff.roomIds) staff.roomIds=[];
  if(!staff.roomIds.includes(roomId)) staff.roomIds.push(roomId);
  staff.roomLink = staff.roomIds[0];
  saveStaffList(); renderStaffList(); renderRoomingGrid(); renderLocationTabs();
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(!base||!pat||!staff.airtableId) return;
  console.log('Assigning staff', staffId, 'to rooms', staff.roomIds);
  try{
    let fieldName = 'ROOMING LIST';
    let res = await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${staff.airtableId}`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
    });
    let data = await res.json();
    if(data.error){
      console.error('ROOMING LIST link error 422 details:', data.error);
      // If 422, try to link rooms one by one to see which fails, keep at least first
      // Airtable sometimes rejects if field is still single-link - try overwrite with full array again after clearing
      if(data.error.type==='INVALID_VALUE_FOR_COLUMN' || data.error.message?.includes('422')){
        // Attempt to clear then set
        await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${staff.airtableId}`,{
          method:'PATCH',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: []}})
        });
        await new Promise(r=>setTimeout(r,300));
        res = await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${staff.airtableId}`,{
          method:'PATCH',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
        });
        data = await res.json();
        if(data.error){
          console.error('Still fails after clear:', data.error);
          // fallback to ROOM field
          fieldName = 'ROOM';
          await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${staff.airtableId}`,{
            method:'PATCH',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
          });
        }
      } else {
        fieldName = 'ROOM';
        await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${staff.airtableId}`,{
          method:'PATCH',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
        });
      }
    }
  }catch(e){ console.error('assignStaffToRoom link failed', e); }

}
function removeStaff(roomId,staffName, evt){ if(evt){ evt.stopPropagation(); evt.preventDefault(); }
  const s=staffList.find(x=>x.id===staffName||x.airtableId===staffName||x.name===staffName);
  if(s){ removeStaffFromRoom(roomId, s.id); return; }
  const rec=allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
  const arr=(rec.fields['STAFF / EXTRA']||'').split(',').map(x=>x.trim()).filter(x=>x&&x!==staffName);
  updateRoomField(roomId,'STAFF / EXTRA',arr.join(','),true);
}

async function deleteStaff(staffId){
  const s=staffList.find(x=>x.id===staffId||x.airtableId===staffId);
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat&&s?.airtableId){
    try{ await fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${s.airtableId}`,{method:'DELETE', headers:{'Authorization':`Bearer ${pat}`}}); }catch(e){ console.error(e); }
  }
  staffList=staffList.filter(x=>x.id!==staffId&&x.airtableId!==staffId);
  saveStaffList(); renderStaffList();
}





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
function generateRoomIdFromCap(cap){ return `B${parseInt(cap)||4}`; }
function getBoardArray(f){
  if(!f) return [];
  try{
    const raw = f['BOARD BASIS'] || f['BOARD'] || '';
    if(!raw) return [];
    if(Array.isArray(raw)) return raw.filter(Boolean).map(s=>String(s).trim()).filter(Boolean);
    if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(s=>s.trim()).filter(Boolean);
    if(raw && raw!=='-' && raw!=='' && raw!=='NO BOARD' && raw!=='NO FULLBOARD') return [String(raw).trim()];
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

function getStaffBoardArray(s){
  if(!s) return [];
  const raw = s.boardBasis || s.fields?.['BOARD'] || s.fields?.['BOARD BASIS'] || s.board || '';
  if(Array.isArray(raw)) return raw.filter(Boolean).map(x=>String(x).trim());
  if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(x=>x.trim()).filter(Boolean);
  if(raw && raw!=='-' && raw!=='' && raw!=='NO BOARD') return [String(raw).trim()];
  return [];
}
function renderInsuranCell(jId, insArr){
  var opts=['TAKAFUL','ETIQA','AL-KHAIRI'];
  var display=insArr.length? insArr.join(', ') : '-';
  var cls=insArr.length? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200';
  var html='<div class="relative"><button onclick="toggleInsuranDropdown(\''+jId+'\')" class="w-full text-[8px] border rounded-full px-2.5 py-1.5 font-bold '+cls+' text-left flex items-center justify-between opacity-100"><span class="truncate">'+display+'</span><span>▼</span></button><div id="insuranDrop-'+jId+'" class="hidden absolute z-[9999] mt-1 w-48 bg-white border border-slate-300 rounded-xl shadow-2xl p-1 opacity-100" style="background:white; opacity:1;">';
  for(var i=0;i<opts.length;i++){
    var o=opts[i];
    var checked=insArr.includes(o)?'checked':'';
    html+='<label class="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer text-[11px]"><input type="checkbox" '+checked+' onchange="toggleInsuranMulti(\''+jId+'\',\''+o+'\')" class="w-3.5 h-3.5 accent-[#7A0C2E]"> '+o+'</label>';
  }
  html+='<div class="flex justify-between gap-1 mt-1 pt-1 border-t bg-white"><button onclick="clearInsuranMulti(\''+jId+'\'); closeInsuranDropdown(\''+jId+'\')" class="text-[9px] px-3 py-1 rounded-full bg-slate-100">Clear</button><button onclick="closeInsuranDropdown(\''+jId+'\')" class="text-[9px] px-3 py-1 rounded-full bg-[#7A0C2E] text-white">OK</button></div></div></div>';
  return html;
}
function toggleInsuranMulti(jId, opt){
  var rec=allRoomingJemaah.find(function(r){return r.id===jId;});
  if(!rec) return;
  var arr=getInsuranArray(rec.fields);
  if(arr.includes(opt)) arr=arr.filter(function(x){return x!==opt;}); else arr.push(opt);
  rec.fields['INSURAN']=arr;
  if(typeof updateJemaahField==='function') updateJemaahField(jId, 'INSURAN', arr);
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
function toggleBoardMulti(jemaahId, option){
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return;
  let arr=getBoardArray(rec.fields);
  if(arr.includes(option)) arr=arr.filter(x=>x!==option); else arr.push(option);
  updateJemaahBoardMulti(jemaahId, arr);
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
    fetch(`${getProxy()}/${base}/${getTableIds().STAFF}/${s.airtableId}`,{
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({fields:{'BOARD BASIS': []}})
    }).then(r=>r.json()).then(d=>console.log('Clear staff board OK', d.id)).catch(e=>console.error(e));
  }
}
window.clearStaffBoardMulti = clearStaffBoardMulti;

function toggleInsuranMulti(jemaahId, option){
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return;
  let arr=getInsuranArrayV2(rec.fields);
  if(arr.includes(option)) arr=arr.filter(x=>x!==option); else arr.push(option);
  rec.fields['INSURAN']=arr;
  if(typeof updateJemaahField==='function') updateJemaahField(jemaahId, 'INSURAN', arr.length?arr.join(', '):'');
  if(typeof renderNamelist==='function') renderNamelist();
}
function clearInsuranMulti(jemaahId){ const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return; rec.fields['INSURAN']=[]; if(typeof updateJemaahField==='function') updateJemaahField(jemaahId, 'INSURAN', []); if(typeof renderNamelist==='function') renderNamelist(); }
function toggleBoardDropdown(id){ const el=document.getElementById('boardDrop-'+id); if(!el) return; document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }
function closeStaffDropdown(id){ const el=document.getElementById('staffBoardDrop-'+id); if(el) el.classList.add('hidden'); }
function toggleInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(!el) return; document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>{ if(d.id!=='insuranDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }
function closeInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(el) el.classList.add('hidden'); }
if(!window._boardDropListener){ window._boardDropListener=true; document.addEventListener('click', (e)=>{ const isBoard=e.target.closest('[id^="boardDrop-"]')||e.target.closest('button[onclick*="toggleBoardDropdown"]'); const isStaff=e.target.closest('[id^="staffBoardDrop-"]')||e.target.closest('button[onclick*="toggleStaffDropdown"]'); const isIns=e.target.closest('[id^="insuranDrop-"]')||e.target.closest('button[onclick*="toggleInsuranDropdown"]'); if(!isBoard&&!isStaff&&!isIns){ document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden')); } }); }

function getFullboardVal(f){ 
  const arr=getBoardArray(f);
  return arr[0]||'';
}

function toggleStaffDropdown(id){
  const el=document.getElementById('staffBoardDrop-'+id); 
  if(!el) { console.warn('staffBoardDrop not found', id); return; }
  document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden'));
  document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>{ if(d.id!=='staffBoardDrop-'+id) d.classList.add('hidden'); });
  document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden'));
  el.classList.toggle('hidden');
}
window.toggleStaffDropdown = toggleStaffDropdown;

function closeStaffDropdown(id){
  const el=document.getElementById('staffBoardDrop-'+id);
  if(el) el.classList.add('hidden');
}
window.closeStaffDropdown = closeStaffDropdown;


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

document.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('modul-rooming')) renderRoomingHTML();
  setTimeout(()=>populateRoomingTripDropdown(), 600);
});

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
