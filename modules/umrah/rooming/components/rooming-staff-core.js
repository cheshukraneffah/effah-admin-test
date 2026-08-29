// COMPONENT - Staff core funcs - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports

function getStaffStorageKey(){ return `effah_staff_list_${activeLocation}_${window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'}`; }
function saveStaffList(){ try{ localStorage.setItem(getStaffStorageKey(), JSON.stringify(staffList)); localStorage.setItem('effah_staff_board_'+activeLocation, JSON.stringify(staffList)); }catch(e){} }

async function loadStaffList(){
  try{
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
    const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('selectedTripId')||'';
    if(!base||!pat){ staffList=JSON.parse(localStorage.getItem(getStaffStorageKey())||'[]'); renderStaffList(); return; }
    let allStaff=[],offset='';
    do{
      const res=await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29?pageSize=100${offset?`&offset=${offset}`:''}`,{headers:{Authorization:`Bearer ${pat}`}});
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
      const res=await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29`,{
        method:'POST',
        headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
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
    await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${s.airtableId}`,{
      method:'PATCH',
      headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
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
    let res = await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${staff.airtableId}`,{
      method:'PATCH',
      headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
      body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
    });
    let data = await res.json();
    if(data.error){
      console.error('ROOMING LIST link error 422 details:', data.error);
      // If 422, try to link rooms one by one to see which fails, keep at least first
      // Airtable sometimes rejects if field is still single-link - try overwrite with full array again after clearing
      if(data.error.type==='INVALID_VALUE_FOR_COLUMN' || data.error.message?.includes('422')){
        // Attempt to clear then set
        await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${staff.airtableId}`,{
          method:'PATCH',
          headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: []}})
        });
        await new Promise(r=>setTimeout(r,300));
        res = await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${staff.airtableId}`,{
          method:'PATCH',
          headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
        });
        data = await res.json();
        if(data.error){
          console.error('Still fails after clear:', data.error);
          // fallback to ROOM field
          fieldName = 'ROOM';
          await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${staff.airtableId}`,{
            method:'PATCH',
            headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
            body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
          });
        }
      } else {
        fieldName = 'ROOM';
        await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${staff.airtableId}`,{
          method:'PATCH',
          headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
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
    try{ await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${s.airtableId}`,{method:'DELETE', headers:{'Authorization':`Bearer ${pat}`}}); }catch(e){ console.error(e); }
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
    fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${s.airtableId}`,{
      method:'PATCH', headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
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
