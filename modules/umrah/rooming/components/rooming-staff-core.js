// components/rooming-staff-core.js V103.38 PROXY ONLY - balanced braces fixed
function getStaffStorageKey(){ return `effah_staff_list_${activeLocation}_${window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'}`; }

async function addNewStaff(){
  const input=document.getElementById('newStaffInput'); if(!input) return;
  let name=input.value.trim().toUpperCase();
  if(!name){ alert('Sila masukkan nama staff.'); return; }
  if(!name.includes('(')) name=`${name} (EFFAH)`;
  const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'';
  try{
      const fields = {'NAME': name, 'TRAIN': false, 'SORT NUMBER': staffList.length+1};
      if(tripId) fields['TRIP']=[tripId];
      const data=await effahCreate(EFFAH_T.STAFF, fields);
      if(data.id){
        staffList.push({id:data.id, airtableId:data.id, name, boardBasis:'', train:false, sortNumber:staffList.length+1, trip:tripId?[tripId]:[], roomIds: [], roomLink: null});
        saveStaffList(); renderStaffList(); input.value=''; return;
      }
      // fallback if proxy returns records array
      if(data.records && data.records[0]){
        const rec=data.records[0];
        staffList.push({id:rec.id, airtableId:rec.id, name, boardBasis:'', train:false, sortNumber:staffList.length+1, trip:tripId?[tripId]:[], roomIds: [], roomLink: null});
        saveStaffList(); renderStaffList(); input.value=''; return;
      }
  }catch(e){ console.error('Add staff proxy failed', e); }
  const id=`staff_${Date.now()}_${++staffIdCounter}`;
  staffList.push({id, name, boardBasis:'', train:false, sortNumber:staffList.length+1, roomIds: [], roomLink: null});
  saveStaffList(); renderStaffList(); input.value='';
}

async function updateStaffField(staffId, field, value){
  const s=staffList.find(x=>x.id===staffId||x.airtableId===staffId); if(!s) return;
  if(field==='boardBasis') s.boardBasis=value; else s[field]=value;
  saveStaffList(); renderStaffList();
  // if clearing board, set value to null for Airtable to clear

  // base from EFFAH_BASE
    if(!base||!pat||!s.airtableId) return;
  try{
    const airtableField = field==='boardBasis' ? 'BOARD BASIS' : field.toUpperCase();
    const payloadValue = (value==='' || value===null) ? null : value;
    const bodyFields = {};
    if(payloadValue===null){ bodyFields[airtableField]=null; } else { bodyFields[airtableField]=value; }
    await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
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
  // base from EFFAH_BASE
    if(!base||!pat||!staff.airtableId) return;
  console.log('Assigning staff', staffId, 'to rooms', staff.roomIds);
  try{
    let fieldName = 'ROOMING LIST';
    let res = await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
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
        await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
          method:'PATCH',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: []}})
        });
        await new Promise(r=>setTimeout(r,300));
        res = await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
          method:'PATCH',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
        });
        data = await res.json();
        if(data.error){
          console.error('Still fails after clear:', data.error);
          // fallback to ROOM field
          fieldName = 'ROOM';
          await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
            method:'PATCH',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({fields:{[fieldName]: staff.roomIds}})
          });
        }
      } else {
        fieldName = 'ROOM';
        await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
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
  // base from EFFAH_BASE
    if(base&&pat&&s?.airtableId){
    try{ await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{method:'DELETE', headers:{}}); }catch(e){ console.error(e); }
  }
  staffList=staffList.filter(x=>x.id!==staffId&&x.airtableId!==staffId);
  saveStaffList(); renderStaffList();
}

function getStaffBoardArray(s){
  if(!s) return [];
  const raw = s.boardBasis || s.fields?.['BOARD'] || s.fields?.['BOARD BASIS'] || s.board || '';
  if(Array.isArray(raw)) return raw.filter(Boolean).map(x=>String(x).trim());
  if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(x=>x.trim()).filter(Boolean);
  if(raw && raw!=='-' && raw!=='' && raw!=='NO BOARD') return [String(raw).trim()];
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

function assignStaffAsTanpaKatil(staffId, roomId){
  const room = allRoomingRecords.find(r=>r.id===roomId);
  if(!room) return;
  const existingJTanpa = room.fields['JEMAAH TANPA KATIL']||[];
  const existingStaff = room.fields['STAFF LIST (ROOMING)']||[];
  const existingStaffText = room.fields['STAFF / EXTRA']||'';
  
  if(existingJTanpa.includes(staffId)){
    console.log('Staff already tanpa katil in this room', staffId);
    return; // already there
  }
  // FIX V90: If staff already exists as regular staff in same room, move him to tanpa katil (allow many staff per room)
  if(existingStaff.includes(staffId)){
    console.log('Staff already regular in this room, moving to tanpa katil', staffId);
    // Remove from regular staff list
    room.fields['STAFF LIST (ROOMING)'] = existingStaff.filter(id=>id!==staffId);
    // Also update staffList roomIds
    const s=getStaffById(staffId);
    if(s && s.roomIds) s.roomIds = s.roomIds.filter(rid=>rid!==roomId);
    // Continue to add as tanpa katil (don't block)
  }
  // Also check if staff name exists in STAFF / EXTRA text field
  if(existingStaffText.includes(staffId)){
    // try to remove from text field
    room.fields['STAFF / EXTRA'] = existingStaffText.split(',').filter(x=>x.trim()!==staffId).join(',');
  }
  
  // Store in local mapping for tanpa katil staff (allows many staff per room)
  const key='effah_staff_tanpa_'+roomId;
  let staffTanpaList=[];
  try{ staffTanpaList=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ staffTanpaList=[]; }
  if(!staffTanpaList.includes(staffId)) staffTanpaList.push(staffId);
  try{ localStorage.setItem(key, JSON.stringify(staffTanpaList)); }catch(e){}
  
  if(!room.fields['_STAFF_TANPA_KATIL']) room.fields['_STAFF_TANPA_KATIL']=[];
  if(!room.fields['_STAFF_TANPA_KATIL'].includes(staffId)) room.fields['_STAFF_TANPA_KATIL'].push(staffId);
  
  const newList = [...existingJTanpa.filter(id=>id!==staffId), staffId];
  room.fields['JEMAAH TANPA KATIL']=newList;
  renderRoomingGrid();
  
  // base from EFFAH_BASE
    // Save both regular staff removal and tanpa katil addition
    const payload={};
    payload['STAFF LIST (ROOMING)']=room.fields['STAFF LIST (ROOMING)']||[];
    // Try JEMAAH TANPA KATIL first
    payload['JEMAAH TANPA KATIL']=newList;
    fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields: payload})}).then(r=>r.json()).then(data=>{
      console.log('V90 staff moved to tanpa katil', data);
      if(data.error){
        console.warn('JEMAAH TANPA KATIL cannot accept staff ID, saving to STAFF TANPA KATIL field');
        // Save to custom field STAFF TANPA KATIL
        fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'STAFF TANPA KATIL': staffTanpaList, 'STAFF LIST (ROOMING)': room.fields['STAFF LIST (ROOMING)']||[]}})}).then(r=>r.json()).then(d2=>{ console.log('saved to STAFF TANPA KATIL', d2); });
      }
    }).catch(err=>{ console.error(err); });
  }

function removeStaffTanpaKatilFromRoom(roomId, staffId){
  const room=allRoomingRecords.find(r=>r.id===roomId);
  if(room){
    const key='effah_staff_tanpa_'+roomId;
    let list=[];
    try{ list=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ list=[]; }
    list=list.filter(id=>id!==staffId);
    try{ localStorage.setItem(key, JSON.stringify(list)); }catch(e){}
    if(room.fields['_STAFF_TANPA_KATIL']) room.fields['_STAFF_TANPA_KATIL']=room.fields['_STAFF_TANPA_KATIL'].filter(id=>id!==staffId);
    if(room.fields['JEMAAH TANPA KATIL']) room.fields['JEMAAH TANPA KATIL']=room.fields['JEMAAH TANPA KATIL'].filter(id=>id!==staffId);
    // FIX V91: Also remove from staffList roomIds so staff becomes unassigned, not move to regular
    const sRec = (typeof getStaffById==='function'? getStaffById(staffId) : staffList.find(s=>s.id===staffId||s.airtableId===staffId));
    if(sRec && sRec.roomIds){
      sRec.roomIds = sRec.roomIds.filter(rid=>rid!==roomId);
      // Also remove from ROOMING LIST STAFF LIST field if exists
      if(room.fields['STAFF LIST (ROOMING)']) room.fields['STAFF LIST (ROOMING)']=room.fields['STAFF LIST (ROOMING)'].filter(id=>id!==staffId);
    }
    renderRoomingGrid();
    renderStaffList();
    // base from EFFAH_BASE
      fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'JEMAAH TANPA KATIL': room.fields['JEMAAH TANPA KATIL']||[], 'STAFF LIST (ROOMING)': room.fields['STAFF LIST (ROOMING)']||[], 'STAFF TANPA KATIL': list}})}).catch(()=>{});
    }
  }

function quickAssignStaffToRoom(staffId, roomId){
  // Existing quickAssignStaff but with specific room
  if(typeof quickAssignStaff==='function' && !roomId){
    return quickAssignStaff(staffId);
  }
  const room = allRoomingRecords.find(r=>r.id===roomId);
  if(!room) return;
  // Add to STAFF / EXTRA or linked staff field
  // Try to use linked staff field if exists
  const staffField = (room.fields['STAFF LIST (ROOMING)']!==undefined) ? 'STAFF LIST (ROOMING)' : 'STAFF / EXTRA';
  if(staffField==='STAFF LIST (ROOMING)'){
    const current = room.fields[staffField]||[];
    if(current.includes(staffId)) { console.log('staff already in this room', staffId); return; }
    const newList=[...current, staffId];
    room.fields[staffField]=newList;
    renderRoomingGrid();
    // base from EFFAH_BASE
      fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{[staffField]: newList}})}).catch(()=>{});
    }
  }

function addStaffTanpaKatilToRoom(roomId, staffId){
  if(typeof assignStaffAsTanpaKatil==='function') assignStaffAsTanpaKatil(staffId, roomId);
  else alert('Function assignStaffAsTanpaKatil not found');
}

function quickAssignStaff(staffId){ if(isStaffAssignedInLocation(staffId, activeLocation)) return; const rooms=allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation); const target=rooms.find(r=>{ const j=r.fields['JEMAAH']?.length||0; const s=getStaffForRoom(r.id).length; return (j+s)<(r.fields['KAPASITI']||4); }); if(target) assignStaffToRoom(staffId,target.id); else alert('Tiada slot kosong di lokasi '+activeLocation+'.'); }

function updateStaffTrain(staffId, checked){
  const s=staffList.find(x=>x.id===staffId||x.airtableId===staffId);
  if(!s){ console.warn('updateStaffTrain staff not found', staffId); return; }
  s.train=checked;
  if(!s.fields) s.fields={};
  s.fields['TRAIN']=checked;
  if(typeof saveStaffList==='function') saveStaffList();
  renderStaffList();
  // base from EFFAH_BASE
    if(base&&pat&&s.airtableId){
    fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}&recordId=${base}/STAFF%20LIST%20%28ROOMING%29/`,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({fields:{'TRAIN': checked}})
    }).then(r=>r.json()).then(d=>console.log('V98 staff train saved', d)).catch(e=>console.error(e));
  } else {
    console.log('V98 staff train local only', staffId, checked);
  }
}

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

async function assignStaffToRoom_FIXED(staffId, roomId){
  const staff = (typeof getStaffById==='function'? getStaffById(staffId) : staffList.find(s=>s.id===staffId||s.airtableId===staffId)); 
  if(!staff) return;
  const rec = allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
  if(!staff.roomIds) staff.roomIds=[];
  if(!staff.roomIds.includes(roomId)) staff.roomIds.push(roomId);
  staff.roomLink = staff.roomIds[0];
  if(typeof saveStaffList==='function') saveStaffList(); 
  if(typeof renderStaffList==='function') renderStaffList(); 
  if(typeof renderRoomingGrid==='function') renderRoomingGrid(); 
  if(typeof renderLocationTabs==='function') renderLocationTabs();
  // Queue Airtable update, don't await blocking UI
  _patchStaffRoomIdsQueued(staffId, staff.roomIds);
}

async function removeStaffFromRoom_FIXED(roomId, staffId){
  const staff = (typeof getStaffById==='function'? getStaffById(staffId) : staffList.find(s=>s.id===staffId||s.airtableId===staffId));
  if(!staff){
    // fallback: only update local room field if no staff object
    const rec = allRoomingRecords.find(r=>r.id===roomId);
    if(rec && rec.fields['STAFF LIST (ROOMING)']){
      rec.fields['STAFF LIST (ROOMING)'] = (rec.fields['STAFF LIST (ROOMING)']||[]).filter(id=>id!==staffId);
      if(typeof renderRoomingGrid==='function') renderRoomingGrid();
    }
    return;
  }
  const prevLen = (staff.roomIds||[]).length;
  staff.roomIds = (staff.roomIds||[]).filter(id=>id!==roomId);
  staff.roomLink = staff.roomIds.length? staff.roomIds[0] : null;
  console.log(`V102 RACE FIX remove ${staffId} from ${roomId}: ${prevLen} -> ${staff.roomIds.length}`);
  if(typeof saveStaffList==='function') saveStaffList();
  if(typeof renderStaffList==='function') renderStaffList();
  if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  if(typeof renderLocationTabs==='function') renderLocationTabs();
  _patchStaffRoomIdsQueued(staffId, staff.roomIds);
}

function toggleStaffBoardMulti_FIXED(staffId, boardVal){
  const staff = (window.staffList||[]).find(s=>s.id===staffId||s.airtableId===staffId);
  if(!staff) return;
  if(!staff.board) staff.board=[];
  if(!Array.isArray(staff.board)) staff.board = staff.board ? [staff.board] : [];
  const idx = staff.board.indexOf(boardVal);
  if(idx>=0) staff.board.splice(idx,1); else staff.board.push(boardVal);
  const isTrain = staff.board.includes('TRAIN') || !!staff.train;
  staff.train = isTrain;
  staff.boardBasis = (staff.board||[]).filter(b=>b!=='TRAIN').join(',');
  if(typeof saveStaffList==='function') try{saveStaffList();}catch(e){}
  if(typeof renderStaffList==='function') renderStaffList();
  if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat&&staff.airtableId){
    const boardToSave = staff.board.filter(b=>b!=='TRAIN');
    const payload = boardToSave.length===0 ? null : boardToSave;
    fetch('${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}/'+staff.airtableId,{
      method:'PATCH', headers:{'Content-Type':'application/json','Content-Type':'application/json'},
      body: JSON.stringify({fields:{'BOARD BASIS': payload, 'TRAIN': isTrain}})
    }).then(r=>r.json()).then(d=>console.log('STAFF BOARD saved', payload, d)).catch(e=>console.error(e));
  }
}

function updateStaffBoardSingle_FIXED(staffId, value){
  const staff = (window.staffList||[]).find(s=>s.id===staffId||s.airtableId===staffId);
  if(!staff) return;
  const hasTrain = (staff.board||[]).includes('TRAIN') || !!staff.train;
  if(value==='-'||value===''||value===null) staff.board = hasTrain ? ['TRAIN'] : [];
  else staff.board = hasTrain ? [value,'TRAIN'] : [value];
  staff.boardBasis = (staff.board||[]).filter(b=>b!=='TRAIN').join(',');
  if(typeof saveStaffList==='function') try{saveStaffList();}catch(e){}
  if(typeof renderStaffList==='function') renderStaffList();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat&&staff.airtableId){
    const boardToSave = (staff.board||[]).filter(b=>b!=='TRAIN');
    const payload = boardToSave.length===0 ? null : boardToSave;
    console.log('Saving BOARD BASIS for', staff.name, '->', payload);
    fetch('${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.STAFF}/'+staff.airtableId,{
      method:'PATCH', headers:{'Content-Type':'application/json','Content-Type':'application/json'},
      body: JSON.stringify({fields:{'BOARD BASIS': payload}})
    }).then(r=>r.json()).then(d=>{ console.log('STAFF BOARD single saved', value, d); if(d.error) alert('Airtable error: '+JSON.stringify(d.error)); }).catch(e=>{ console.error(e); alert('Gagal save board: '+e.message); });
  }
}

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

function isStaffAssignedAny(staffId){ for(const loc of ['MEKAH','MADINAH','TAIF','JEDDAH','MUMTAZ']){ if(isStaffAssignedInLocation(staffId, loc)) return true; } return false; }