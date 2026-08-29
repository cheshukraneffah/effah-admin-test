// COMPONENT - Staff render - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports


function renderStaffList(){
  const cont=document.getElementById('staffListContainer'); const badge=document.getElementById('staffTotalBadge'); if(!cont) return; if(badge) badge.textContent=staffList.length+' Staff';
  if(staffList.length===0){ cont.innerHTML='<div class="p-2.5 text-center text-[11px] text-slate-400">Tiada staff / extra</div>'; return; }
  cont.innerHTML=staffList.map((s,idx)=>{
    const assignedInLoc = isStaffAssignedInLocation(s.id, activeLocation);
    const cls=assignedInLoc?'bg-slate-100 text-slate-400 border-slate-200':'bg-white hover:bg-slate-50 cursor-grab border-slate-200'; // V102 FIX GHOST - no opacity
    const drag=assignedInLoc?'':`draggable="true" ondragstart="dragStaff(event,'${s.id}')" ondragend="dragStaffEnd(event)"`;
    const boardArr=(typeof getStaffBoardArray==='function'? getStaffBoardArray(s) : []);
    const boardDisplay = boardArr.length? boardArr.join(', ') : '- BOARD';
    const boardCls = boardArr.length? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200';
    const trainChecked = !!(s.train||s.fields?.TRAIN);
    const trainCls = trainChecked ? 'bg-amber-300 border-amber-600 text-amber-900' : 'bg-white border-slate-300';
    const staffId = s.id||s.airtableId;
    const boardOptions = ['FULLBOARD','FULLBOARD (MEKAH)','FULLBOARD (MADINAH)','BB (MEKAH)','BB (MADINAH)'];
    const boardDropHtml = boardOptions.map(opt=>`<label class="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer text-[11px]"><input type="checkbox" ${boardArr.includes(opt)?'checked':''} onchange="toggleStaffBoardMulti('${staffId}','${opt}')" class="w-3.5 h-3.5 accent-[#7A0C2E]"> ${opt}</label>`).join('');
    return `<div ${drag} class="flex flex-col gap-1.5 px-2.5 py-2 rounded-xl border text-[11px] ${cls} relative">
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center"><span class="text-slate-400 text-[10px]">${String(idx+1).padStart(2,'0')}</span><span class="font-medium truncate max-w-[120px]">${s.name}</span>${assignedInLoc?'<span class="ml-1 px-1 py-0.5 bg-slate-200 rounded text-[8px]">ASSIGNED di '+activeLocation+'</span>':''}</div>
        <div class="flex gap-1"><button onclick="quickAssignStaff('${staffId}')" class="w-5 h-5 rounded-full border ${assignedInLoc?'opacity-30 pointer-events-none':'hover:bg-[#7A0C2E] hover:text-white'} text-[10px]">+</button><button onclick="deleteStaff('${staffId}')" class="w-5 h-5 rounded-full border hover:bg-red-50 text-[10px]"><i class="fa-solid fa-trash text-[9px]"></i></button></div>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <button onclick="toggleStaffDropdown('${staffId}')" class="w-full text-[8px] border rounded-full px-2.5 py-1.5 font-bold ${boardCls} text-left flex items-center justify-between opacity-100"><span class="truncate">${boardDisplay}</span><span class="ml-1">▼</span></button>
          <div id="staffBoardDrop-${staffId}" class="hidden absolute z-[9999] mt-1 w-56 bg-white border border-slate-300 rounded-xl shadow-2xl p-1 max-h-52 overflow-auto" style="background:#ffffff !important; opacity:1 !important; isolation:isolate;">
            ${boardDropHtml}
            <div class="flex justify-between gap-1 mt-1 pt-1 border-t bg-white"><button onclick="clearStaffBoardMulti('${staffId}'); closeStaffDropdown('${staffId}')" class="text-[9px] px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200">Clear</button><button onclick="closeStaffDropdown('${staffId}')" class="text-[9px] px-3 py-1 rounded-full bg-[#7A0C2E] text-white hover:bg-[#9d174d]">OK</button></div>
          </div>
        </div>
        <label class="flex items-center gap-1 text-[8px] border rounded-full px-2.5 py-1.5 cursor-pointer font-bold ${trainCls} shrink-0 opacity-100"><input type="checkbox" ${trainChecked?'checked':''} onchange="updateStaffTrain('${staffId}',this.checked)" class="w-3.5 h-3.5 accent-amber-600"> TRAIN</label>
      </div>
    </div>`;
  }).join('');
}





function setActiveLocation(loc){ activeLocation=loc.toUpperCase(); localStorage.setItem('effah_active_location',activeLocation); const el=document.getElementById('copyTargetLoc'); if(el) el.textContent=activeLocation; renderLocationTabs(); renderRoomingGrid(); renderNamelist(); renderStaffList(); }
function _stopAutoScroll(){ if(_autoScrollInterval){ clearInterval(_autoScrollInterval); _autoScrollInterval=null; } }
function _startAutoScroll(){
  if(_autoScrollInterval) return;
  _autoScrollInterval=setInterval(()=>{
    const y=window._lastDragY||0;
    if(y<140){ window.scrollBy(0, -22); document.documentElement.scrollTop-=22; }
    else if(y>window.innerHeight-140){ window.scrollBy(0, 22); document.documentElement.scrollTop+=22; }
    // also scroll left panels if near edge
    const nl=document.getElementById('namelistContainer');
    const sl=document.getElementById('staffListContainer');
    const grid=document.getElementById('roomingGrid');
    if(nl){
      const rect=nl.getBoundingClientRect();
      if(y>rect.top && y<rect.bottom){
        if(y-rect.top<80) nl.scrollBy(0,-12);
        else if(rect.bottom-y<80) nl.scrollBy(0,12);
      }
    }
    if(grid){
      const rect=grid.getBoundingClientRect();
      if(y>rect.top){
        if(y>window.innerHeight-140) grid.scrollBy ? grid.scrollBy(0,10) : null;
      }
    }
  }, 30);
}
document.addEventListener('drop', ()=>{ _stopAutoScroll(); });
function dragJemaah(e,jId){ if(isJemaahAssignedInLocation(jId, activeLocation)) return; e.dataTransfer.setData('text/plain',jId); const r=e.currentTarget; if(r) setTimeout(()=>r.style.opacity='0.3',0); }
function dragEnd(e){ e.currentTarget.style.opacity='1'; }

function dragRoom(e,roomId){
  e.dataTransfer.setData('text/room-id', roomId);
  e.dataTransfer.effectAllowed='move';
  const el=e.currentTarget.closest('[data-room-id]');
  if(el) setTimeout(()=>el.style.opacity='0.4',0);
}
function dropStaffToRoom(e, roomId, isTanpaKatil){
  e.preventDefault();
  const staffId = e.dataTransfer.getData('application/x-staff-id') || e.dataTransfer.getData('text/plain') || window._draggedStaffId;
  console.log('dropStaffToRoom', staffId, 'to', roomId, 'tanpa', isTanpaKatil);
  if(!staffId) return;
  // Check if it's actually staff (exists in staffList)
  const isStaff = staffList.some(s=>s.id===staffId||s.airtableId===staffId);
  if(isStaff){
    if(isTanpaKatil){
      assignStaffAsTanpaKatil(staffId, roomId);
    } else {
      quickAssignStaffToRoom(staffId, roomId);
    }
  } else {
    // Might be jemaah dropped as staff? Handle as jemaah
    const jemaahId=staffId;
    if(isTanpaKatil) assignJemaahAsTanpaKatil(jemaahId, roomId);
    else quickAssignToRoom(jemaahId, roomId);
  }
  window._draggedStaffId=null;
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
  
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat){
    // Save both regular staff removal and tanpa katil addition
    const payload={};
    payload['STAFF LIST (ROOMING)']=room.fields['STAFF LIST (ROOMING)']||[];
    // Try JEMAAH TANPA KATIL first
    payload['JEMAAH TANPA KATIL']=newList;
    fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields: payload})}).then(r=>r.json()).then(data=>{
      console.log('V90 staff moved to tanpa katil', data);
      if(data.error){
        console.warn('JEMAAH TANPA KATIL cannot accept staff ID, saving to STAFF TANPA KATIL field');
        // Save to custom field STAFF TANPA KATIL
        fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{'STAFF TANPA KATIL': staffTanpaList, 'STAFF LIST (ROOMING)': room.fields['STAFF LIST (ROOMING)']||[]}})}).then(r=>r.json()).then(d2=>{ console.log('saved to STAFF TANPA KATIL', d2); });
      }
    }).catch(err=>{ console.error(err); });
  }
  const s=getStaffById(staffId);
  if(s){ 
    if(!s.roomIds) s.roomIds=[];
    if(!s.roomIds.includes(roomId)) s.roomIds.push(roomId);
  }
  console.log('V90 Staff assigned as tanpa katil (many staff per room allowed)', staffId, 'to', roomId);
}
function getStaffTanpaKatilForRoom(roomId){
  try{
    const key='effah_staff_tanpa_'+roomId;
    return JSON.parse(localStorage.getItem(key)||'[]');
  }catch(e){ return []; }
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
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    if(base&&pat){
      fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{'JEMAAH TANPA KATIL': room.fields['JEMAAH TANPA KATIL']||[], 'STAFF LIST (ROOMING)': room.fields['STAFF LIST (ROOMING)']||[], 'STAFF TANPA KATIL': list}})}).catch(()=>{});
    }
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
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    if(base&&pat){
      fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{[staffField]: newList}})}).catch(()=>{});
    }
  } else {
    // Fallback to quickAssignStaff which auto finds room
    if(typeof quickAssignStaff==='function') quickAssignStaff(staffId);
  }
}
// Override drop handlers to accept staff
var _origDropJemaahToRoom = window._origDropJemaahToRoom || (typeof dropJemaahToRoom==='function'? dropJemaahToRoom : null);
function dropJemaahToRoom(e, roomId, isTanpaKatil){
  const staffId = e.dataTransfer.getData('application/x-staff-id') || window._draggedStaffId;
  if(staffId){
    return dropStaffToRoom(e, roomId, isTanpaKatil);
  }
  if(_origDropJemaahToRoom) return _origDropJemaahToRoom(e, roomId, isTanpaKatil);
  // Fallback original logic
  e.preventDefault();
  const jemaahId = e.dataTransfer.getData('text/plain') || window._draggedJemaahId;
  if(!jemaahId) return;
  if(isTanpaKatil) assignJemaahAsTanpaKatil(jemaahId, roomId);
  else quickAssignToRoom(jemaahId, roomId);
}
