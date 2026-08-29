// COMPONENT - RoomingGrid (cards) - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports


function renderRoomingGrid(){
  const grid=document.getElementById('roomingGrid'); if(!grid) return;
  let rooms=[...allRoomingRecords].filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase());
  rooms=getRoomOrderedList(rooms);
  const bilikEl=document.getElementById('roomingBiliks'); if(bilikEl) bilikEl.textContent=rooms.length+' Bilik';
  const totalJ=rooms.reduce((s,r)=>s+(r.fields['JEMAAH']?.length||0),0);
  const totalBaby=rooms.reduce((s,r)=>s+(r.fields['JEMAAH TANPA KATIL']?.length||0),0);
  const totalJFull = totalJ + totalBaby;
  // Fix: count staff from both STAFF/EXTRA text field AND staffList linked records
  const staffFromText = rooms.reduce((s,r)=>s+(r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length,0);
  const staffFromLinked = rooms.reduce((s,r)=>{ try{ return s+getStaffForRoom(r.id).length; }catch(e){ return s; } },0);
  const totalStaff = staffFromText + staffFromLinked;
  const occEl=document.getElementById('roomingOccupancy'); if(occEl) occEl.textContent=`${totalJFull} Jemaah + ${totalStaff} Staff • ${activeLocation}`;
  renderRoomingOverview(rooms);
  if(rooms.length===0){ grid.innerHTML=`<div class="col-span-2 p-6 text-center text-[11px] border border-dashed rounded-2xl bg-white">Tiada bilik untuk <b>${activeLocation}</b><br><button onclick="openNewRoomModal()" class="mt-2.5 px-3 py-1.5 bg-[#7A0C2E] text-white rounded-full text-[11px]">+ Bilik Baru untuk ${activeLocation}</button></div>`; return; }
  grid.innerHTML=rooms.map((rec, roomIdx)=>{
    const f=rec.fields; const roomId=f['Room ID / Nama Bilik']||generateRoomIdFromCap(f['KAPASITI']); const pakej=f['PAKEJ / HOTEL']||'EKONOMI'; const cap=f['KAPASITI']||4; const hotel=f['HOTEL NAME']||''; const staffForRoom=getStaffForRoom(rec.id); const staffArr=staffForRoom.map(s=>s.name); const jIds=f['JEMAAH']||[]; const count=jIds.length+staffArr.length;
    const jSlots=jIds.map(jId=>{ 
      const jRec=allRoomingJemaah.find(j=>j.id===jId); 
      const jName=getJemaahName(jRec?.fields);
      const fbArr=getBoardArray(jRec?.fields||{});
      const fb=fbArr.join(', ');
      const roomLoc = (f['LOKASI / CITY']||activeLocation||'').toUpperCase();
      let fbBadge='';
      if(fbArr.length>0){
        fbArr.forEach(raw=>{
          const up=raw.toUpperCase();
          let badge='';
          if(roomLoc==='MEKAH'){
            if(up.includes('MEKAH')) badge=`<span style="background:#FDE68A;border:1px solid #92400E;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;">${raw}</span>`;
            else if(up==='FULLBOARD') badge=`<span style="background:#BBF7D0;border:1px solid #065F46;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" font-bold">FULLBOARD</span>`;
          } else if(roomLoc==='MADINAH'){
            if(up.includes('MADINAH')) badge=`<span style="background:#BFDBFE;border:1px solid #1E40AF;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" text-blue-900 border border-blue-300 rounded-full text-[8px] font-bold">${raw}</span>`;
            else if(up==='FULLBOARD') badge=`<span style="background:#BBF7D0;border:1px solid #065F46;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" font-bold">FULLBOARD</span>`;
          } else {
            if(up.includes('MEKAH') || up.includes('MADINAH') || up==='FULLBOARD') badge=`<span style="background:#BBF7D0;border:1px solid #065F46;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" font-bold">${raw}</span>`;
            else if(up.startsWith('BB')) badge=`<span class="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-[8px] font-bold">${raw}</span>`;
          }
          fbBadge+=badge;
        });
      }
      return `<div class="flex items-center justify-between px-2.5 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px]"><span class="truncate font-medium flex items-center">${jName}${fbBadge}</span><button onclick="removeJemaahFromRoom('${rec.id}','${jId}')" class="ml-2 w-4 h-4 rounded-full bg-white hover:bg-slate-200 text-[10px]">✕</button></div>`; 
    }).join('');
    const sSlots=staffArr.map(s=>`<div class="flex items-center justify-between px-2.5 py-2 bg-[#FADBD8] text-[#7A0C2E] border border-[#F5B7B1] rounded-xl text-[11px]"><span class="truncate">👤 ${s}</span><button onclick="removeStaff('${rec.id}','${s.replace(/'/g,"\\'")}', event)" class="ml-2 w-4 h-4 rounded-full bg-white/70 text-[10px]">✕</button></div>`).join('');
    const jTanpaRaw = f['JEMAAH TANPA KATIL']||f['INFANT']||[];
    const staffTanpaLocal = (typeof getStaffTanpaKatilForRoom==='function'? getStaffTanpaKatilForRoom(rec.id) : (f['_STAFF_TANPA_KATIL']||[]));
    const combinedTanpa = [...new Set([...jTanpaRaw, ...staffTanpaLocal])];
    const tanpaKatilSlots = combinedTanpa.map(tId=>{
      const sRec = (typeof getStaffById==='function'? getStaffById(tId) : staffList.find(s=>s.id===tId||s.airtableId===tId));
      if(sRec){
        const sName=sRec.name||'Staff Unknown';
        return `<div class="flex items-center justify-between px-2.5 py-2 bg-[#FADBD8] text-[#7A0C2E] border border-[#F5B7B1] rounded-xl text-[11px] mt-1"><span class="truncate font-medium flex items-center gap-1">👤 ${sName} <span class="text-[8px] bg-white/50 px-1.5 py-0.5 rounded-full">STAFF TANPA KATIL</span></span><button onclick="removeStaffTanpaKatilFromRoom('${rec.id}','${tId}')" class="ml-2 w-4 h-4 rounded-full bg-white hover:bg-red-50 text-[10px]">✕</button></div>`;
      } else {
        const jRec=allRoomingJemaah.find(j=>j.id===tId);
        const jName=jRec? getJemaahName(jRec.fields) : null;
        if(!jName){
          return `<div class="flex items-center justify-between px-2.5 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[11px] mt-1"><span class="truncate font-medium">⚠️ ID ${tId.substring(0,8)}... tak jumpa </span><button onclick="removeTanpaKatilFromRoom('${rec.id}','${tId}')" class="ml-2 w-4 h-4 rounded-full bg-white hover:bg-slate-200 text-[10px]">✕</button></div>`;
        }
        return `<div class="flex items-center justify-between px-2.5 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[11px] mt-1"><span class="truncate font-medium">👶 ${jName}</span><button onclick="removeTanpaKatilFromRoom('${rec.id}','${tId}')" class="ml-2 w-4 h-4 rounded-full bg-white hover:bg-slate-200 text-[10px]">✕</button></div>`;
      }
    }).join('');
const emptyCount=Math.max(0,cap-count); const emptySlots=Array.from({length:emptyCount}).map((_,i)=>`<div ondragover="allowDrop(event)" ondrop="dropJemaah(event,'${rec.id}')" class="px-2.5 py-2 border border-dashed border-slate-300 rounded-xl text-[10px] text-slate-400 text-center">Slot Kosong ${count+i+1}</div>`).join('');
    const localCatatan = (typeof loadLocalCatatan==='function'? loadLocalCatatan(rec.id) : '') || '';
    const catatanVal = f['CATATAN BILIK'] || f['CATATAN'] || f['NOTES'] || f['REMARK'] || localCatatan || '';
    const catatanField = `<div class="mt-2"><div class="text-[8px] font-bold text-slate-500 mb-1">CATATAN BILIK</div><textarea id="catatan-${rec.id}" placeholder="Catatan bilik..." onblur="updateRoomCatatan('${rec.id}', this.value)" oninput="clearTimeout(window._catatanTimer); window._catatanTimer=setTimeout(()=>updateRoomCatatan('${rec.id}', this.value), 1000)" class="w-full text-[10px] px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#7A0C2E]/30 resize-none" rows="2">${catatanVal}</textarea></div>`;
    return `<div data-room-id="${rec.id}" data-sort="${f['SORT ORDER']||0}" ondragover="allowDropRoom(event)" ondragleave="handleRoomDragLeave(event)" ondrop="dropRoomReorder(event,'${rec.id}'); dropJemaah(event,'${rec.id}')" class="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-sm flex flex-col gap-2 h-fit">
      <div class="flex items-center justify-between gap-1.5">
        <div class="flex items-center gap-1.5 flex-1 min-w-0">
          <button class="w-6 h-6 rounded-full bg-slate-100 border flex items-center justify-center cursor-grab shrink-0" draggable="true" ondragstart="handleRoomDragStart(event,'${rec.id}')" ondragend="handleRoomDragEnd(event)"><i class="fa-solid fa-grip-lines text-[9px]"></i></button>
          <span class="flex items-center gap-1.5 shrink-0"><span class="w-5 h-5 rounded-full bg-[#7A0C2E] text-white flex items-center justify-center text-[9px] font-bold" title="SORT ORDER: ${f['SORT ORDER']||roomIdx+1} (Airtable)">${f['SORT ORDER']||roomIdx+1}</span><span class="font-bold text-[11px]">${roomId}</span></span>
          <input id="hotelInput-${rec.id}" value="${hotel}" placeholder="Nama Hotel" onchange="updateHotelInline('${rec.id}', this.value)" onfocus="this.select()" class="flex-1 min-w-0 px-2 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold truncate focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7A0C2E]/30" title="Klik untuk tukar nama hotel">
        </div>
        <button onclick="deleteRoom('${rec.id}','${roomId}')" class="w-6 h-6 rounded-full bg-slate-50 hover:bg-red-50 border text-[10px] shrink-0"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="flex items-center gap-1.5 text-[10px]">
        <div class="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-full border"><select onchange="updateRoomField('${rec.id}','PAKEJ / HOTEL',this.value)" class="text-[10px] border border-slate-200 rounded-full px-2 py-1 bg-white font-bold">
          <option value="JIMAT EKONOMI">JIMAT EKONOMI</option><option value="JIMAT STANDARD" ${pakej==='JIMAT STANDARD'?'selected':''}>JIMAT STANDARD</option>
          <option value="JIMAT PREMIUM" ${pakej==='JIMAT PREMIUM'?'selected':''}>JIMAT PREMIUM</option>
          <option value="EKONOMI LITE" ${pakej==='EKONOMI LITE'?'selected':''}>EKONOMI LITE</option>
          <option value="EKONOMI" ${pakej==='EKONOMI'?'selected':''}>EKONOMI</option>
          <option value="STANDARD" ${pakej==='STANDARD'?'selected':''}>STANDARD</option>
          <option value="PREMIUM" ${pakej==='PREMIUM'?'selected':''}>PREMIUM</option>
          <option value="PREMIUM PLUS" ${pakej==='PREMIUM PLUS'?'selected':''}>PREMIUM PLUS</option>
        </select></div>
        <div class="ml-auto flex items-center gap-1 bg-slate-50 rounded-full px-1 py-0.5 border"><button onclick="updateCap('${rec.id}',-1)" class="w-5 h-5 rounded-full bg-white border text-[10px]">−</button><span class="font-bold w-4 text-center text-[11px]">${cap}</span><button onclick="updateCap('${rec.id}',1)" class="w-5 h-5 rounded-full bg-white border text-[10px]">+</button><span class="text-[9px] ml-1">${count}/${cap}</span></div>
      </div>
      <div class="space-y-1">${jSlots}${sSlots}${emptySlots}${tanpaKatilSlots?`<div class="pt-2 mt-2 border-t border-dashed border-amber-300"><div class="text-[8px] font-bold text-amber-700 mb-1">TANPA KATIL / INFANT</div>${tanpaKatilSlots}</div>`:''}</div>
      <button onclick="openTanpaKatilModal('${rec.id}')" class="mt-2 w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 border-dashed text-amber-800 rounded-xl text-[10px] font-bold">+ Kanak-kanak / Infant (Tanpa Katil)</button>
      ${catatanField}
      <div class="h-1 bg-slate-100 rounded-full overflow-hidden mt-2"><div class="h-full bg-[#7A0C2E]" style="width:${Math.min(100,(count/cap)*100)}%"></div></div>
    </div>`;
  }).join('');
}



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

function dragRoomEnd(e){
  const el=e.currentTarget.closest('[data-room-id]');
  if(el) el.style.opacity='1';
  _stopAutoScroll();
}
function allowDropRoom(e){
  try { e.preventDefault(); e.dataTransfer.dropEffect='move'; } catch(err){}
  window._lastDragY=e.clientY;
  try{ _startAutoScroll(); }catch(err){}
  const el=e.currentTarget;
  if(el && el.classList) el.classList.add('drag-over','ring-2','ring-[#7A0C2E]/40');
}

function dropJemaah(e,roomId){
  e.preventDefault(); 
  try{ e.currentTarget.classList.remove('ring-2','ring-[#7A0C2E]/20'); }catch(err){}
  document.querySelectorAll('[draggable="true"]').forEach(el=>el.style.opacity='1');
  // If this is a room reorder drag (text/room-id), ignore here - let dropRoomReorder handle it
  try{
    const roomDragId = e.dataTransfer.getData('text/room-id');
    if(roomDragId && roomDragId.startsWith('rec')){
      const isRoom = allRoomingRecords.some(r=>r.id===roomDragId);
      if(isRoom){
        console.log('dropJemaah ignored - this is room reorder drag', roomDragId);
        return;
      }
    }
    // Also check if plain text is actually a room id
    const plain = e.dataTransfer.getData('text/plain');
    if(plain && plain.startsWith('rec') && allRoomingRecords.some(r=>r.id===plain)){
      // If draggedRoomId is set, this is definitely a room reorder
      if(draggedRoomId || window.draggedRoomId){
        console.log('dropJemaah ignored - plain is room id and room drag active', plain);
        return;
      }
    }
  }catch(err){}
  const staffId=e.dataTransfer.getData('text/staff-id'); const jId=e.dataTransfer.getData('text/plain');
  const id=staffId||jId; if(!id) return;
  const rec=allRoomingRecords.find(r=>r.id===roomId);
  if(rec){
    const cap=rec.fields['KAPASITI']||4;
    const curCount=(rec.fields['JEMAAH']||[]).length + getStaffForRoom(rec.id).length;
    if(curCount>=cap && !staffId){
      alert('Bilik Penuh\n\nBilik '+(rec.fields['Room ID / Nama Bilik']||roomId)+' telah mencapai kapasiti maksimum ('+curCount+'/'+cap+').\nSila pilih bilik lain.');
      const el=document.querySelector(`[data-room-id="${roomId}"]`);
      if(el){ el.classList.add('ring-2','ring-red-400'); setTimeout(()=>el.classList.remove('ring-2','ring-red-400'),800); }
      return;
    }
  }
  if(staffList.some(s=>s.id===id) || id.startsWith('staff_')){ assignStaffToRoom(id,roomId); }
  else { if(!isJemaahAssignedInLocation(id, activeLocation)) assignJemaahToRoom(id,roomId); }
}
function quickAssign(jId){ if(isJemaahAssignedInLocation(jId, activeLocation)) return; const rooms=allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation); const target=rooms.find(r=>{ const j=r.fields['JEMAAH']?.length||0; const s=(r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length; return (j+s)<(r.fields['KAPASITI']||4); }); if(target) assignJemaahToRoom(jId,target.id); }
function removeJemaahFromCurrentLoc(jId){
  const rec = allRoomingRecords.find(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation && (r.fields['JEMAAH']||[]).includes(jId));
  if(rec) removeJemaahFromRoom(rec.id, jId);
}
async function assignJemaahToRoom(jId,roomId){ 
  if(isJemaahAssignedInLocation(jId, activeLocation)) return; 
  const rec=allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
  const cap=rec.fields['KAPASITI']||4;
  const curCount=(rec.fields['JEMAAH']||[]).length + getStaffForRoom(rec.id).length;
  if(curCount>=cap){ 
    alert('Bilik '+ (rec.fields['Room ID / Nama Bilik']||rec.id) +' sudah penuh ('+curCount+'/'+cap+'). Tidak boleh tambah jemaah lagi.');
    // shake animation
    const el=document.querySelector(`[data-room-id="${roomId}"]`);
    if(el){ el.classList.add('ring-2','ring-red-400'); setTimeout(()=>el.classList.remove('ring-2','ring-red-400'),800); }
    return; 
  }
  await updateRoomField(roomId,'JEMAAH',[...(rec.fields['JEMAAH']||[]),jId],true); 
}
async function removeJemaahFromRoom(roomId,jId){ const rec=allRoomingRecords.find(r=>r.id===roomId); await updateRoomField(roomId,'JEMAAH',(rec.fields['JEMAAH']||[]).filter(id=>id!==jId),true); }
async function updateCap(roomId,delta){
  const rec=allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
  const newCap=Math.max(1,Math.min(8,(rec.fields['KAPASITI']||4)+delta));
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{
    await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{'KAPASITI':newCap}})});
    rec.fields['KAPASITI']=newCap;
    renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList();
  }catch(e){ console.error(e); alert('Gagal mengemaskini kapasiti bilik: '+e.message); }
}
async function updateRoomField(roomId,field,value,doRender=true){
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{
    await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{[field]:value}})});
    const rec=allRoomingRecords.find(r=>r.id===roomId); if(rec) rec.fields[field]=value;
    if(doRender){ renderRoomingGrid(); renderNamelist(); renderStaffList(); renderLocationTabs(); }
  }catch(e){ console.error(e); alert('Gagal mengemaskini data bilik: '+e.message); }
}

async function updateJemaahField(jemaahId, field, value){
  if(field==='STATUS VISA'){ const v=(value||'').toString().trim(); if(v==='' || v.toUpperCase()==='- VISA' || v==='-' ){ value = null; } }
  if(field==='PAKEJ' && (value==='-' || value==='')){
    value = null;
  }

  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(!base||!pat) return alert('Airtable config missing');
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId);
  if(rec){ rec.fields[field]=value; }
  // Optimistic UI already updated
  try{
    let payloadValue = value;
    // FIX for Airtable Multiple Select fields: INSURAN, BOARD BASIS, BOARD
    if(field==='INSURAN'){
      if(Array.isArray(value)) payloadValue = value.length?value:null;
      else if(typeof value==='string' && value.trim()!==''){
        payloadValue = value.split(',').map(s=>s.trim()).filter(Boolean);
        if(payloadValue.length===0) payloadValue=null;
      } else payloadValue=null;
    }
    if(field==='BOARD BASIS' || field==='BOARD'){
      if(Array.isArray(value)) payloadValue = value.length?value:[];
      else if(typeof value==='string' && value.includes(',')){
        payloadValue = value.split(',').map(s=>s.trim()).filter(Boolean);
      }
    }
    // If null, send empty array for  select to clear? Airtable needs null to clear  select
    const fieldsToSend = {};
    if(payloadValue===null || (Array.isArray(payloadValue) && payloadValue.length===0)){
      // For  select, sending [] or null clears, but Airtable docs: use [] to clear? Use null
      fieldsToSend[field] = field==='INSURAN' || field==='BOARD BASIS' ? [] : '';
    } else {
      fieldsToSend[field] = payloadValue;
    }
    console.log('V83 updateJemaahField', jemaahId, field, '->', fieldsToSend[field]);
    const res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields: fieldsToSend})});
    const data=await res.json();
    if(data.error){
      console.error('Airtable update error', data.error);
      throw new Error(data.error.message + ' (field: '+field+', type: '+data.error.type+')');
    }
  }catch(e){ console.error(e); alert('Gagal update jemaah '+field+': '+e.message+'\n\nPastikan field '+field+' di Airtable adalah Multiple Select (bukan Single Select). Jika Single Select, tukar ke Multiple Select dulu.'); if(typeof fetchRoomingData==='function') fetchRoomingData(); }
}


async function updateJemaahBoardMulti(jemaahId, selectedArr){
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(!base||!pat) return alert('Airtable config missing');
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return;
  rec.fields['BOARD BASIS']=selectedArr;
  rec.fields['BOARD']=selectedArr.join(', ');
  renderNamelist();
  try{
    // For Multiple Select, empty must be [] not null (null = 422)
    let res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields: {'BOARD BASIS': selectedArr.length?selectedArr:[]}})});
    let data=await res.json();
    if(data.error){
      console.error('BOARD BASIS save failed', data.error);
      // Check if BOARD is formula - don't try BOARD fallback if error is about BOARD
      if(data.error.type!=='INVALID_VALUE_FOR_COLUMN'){
        // Try BOARD as fallback only if BOARD BASIS field error is about type
        try{
          res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields: {'BOARD BASIS': selectedArr}})});
          data=await res.json();
        }catch(e){}
      }
      if(data.error) throw new Error(data.error.message);
    }
  }catch(e){ console.error(e); alert('Gagal update BOARD: '+e.message+'\n\nPastikan field BOARD BASIS di Airtable sudah tukar ke Multiple Select, bukan Single Select.'); fetchRoomingData(); }
}
function toggleBoardMulti(jemaahId, option){
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return;
  let arr=getBoardArray(rec.fields);
  if(arr.includes(option)){
    arr=arr.filter(x=>x!==option);
  } else {
    // Allow max 2, but allow more
    arr.push(option);
  }
  // If selects FULLBOARD generic, remove specific ones? Keep simple allow combo
  updateJemaahBoardMulti(jemaahId, arr);
}
function toggleBoardDropdown(jemaahId){ const el=document.getElementById('boardDrop-'+jemaahId); if(!el) return; // close others
  document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+jemaahId) d.classList.add('hidden'); });
  el.classList.toggle('hidden'); }
function closeBoardDropdown(jemaahId){ const el=document.getElementById('boardDrop-'+jemaahId); if(el) el.classList.add('hidden'); }
// Close on outside click
if(!window._boardDropListener){ window._boardDropListener=true; document.addEventListener('click', (e)=>{ if(!e.target.closest('[id^="boardDrop-"]') && !e.target.closest('button[onclick*="toggleBoardDropdown"]')){ document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); } }); }
function clearBoardMulti(jemaahId){
  // First update local to empty
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId);
  if(rec){ rec.fields['BOARD BASIS']=[]; rec.fields['BOARD']=''; }
  if(typeof renderNamelist==='function') renderNamelist();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat){
    // BOARD might be formula/lookup - only patch BOARD BASIS (Multiple Select)
    fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{method:'PATCH',headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{'BOARD BASIS': []}})}).then(async r=>{ const d=await r.json(); if(d.error){ console.error('Clear jemaah board FAIL', d.error); } else { console.log('Clear jemaah board OK', d.id); } }).catch(e=>console.error(e));
  }
}
window.clearBoardMulti = clearBoardMulti;

async function updateJemaahCheckbox(jemaahId, field, checked){
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(!base||!pat) return alert('Airtable config missing');
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(rec) rec.fields[field]=checked;
  renderNamelist();
  try{
    const res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields: {[field]: checked}})});
    const data=await res.json();
    if(!data.id && data.error) throw new Error(data.error.message);
  }catch(e){ console.error(e); alert('Gagal update checkbox '+field+': '+e.message); fetchRoomingData(); }
}
async function updateJemaahInsuran(jemaahId, value){
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(!base||!pat) return alert('Airtable config missing');
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); 
  if(rec){
    rec.fields['INSURAN'] = value ? [value] : [];
  }
  renderNamelist();
  try{
    const payload = value ? {[ 'INSURAN']: [value]} : {['INSURAN']: []};
    const res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields: payload})});
    const data=await res.json();
    if(!data.id && data.error) throw new Error(data.error.message);
  }catch(e){ console.error(e); alert('Gagal update INSURAN: '+e.message); fetchRoomingData(); }
}
async function toggleInsuran(jemaahId, opt){
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(!base||!pat) return alert('Airtable config missing');
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId);
  if(!rec) return;
  let curr = getInsuranArray(rec.fields);
  if(curr.includes(opt)){
    curr = curr.filter(x=>x!==opt);
  } else {
    curr.push(opt);
  }
  rec.fields['INSURAN'] = curr;
  renderNamelist();
  try{
    const res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{method:'PATCH',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields: {'INSURAN': curr}})});
    const data=await res.json();
    if(!data.id && data.error) throw new Error(data.error.message);
  }catch(e){ console.error(e); alert('Gagal update INSURAN multi: '+e.message); fetchRoomingData(); }
}
function updateHotelInline(roomId, newName){
  const name = (newName||'').trim().toUpperCase();
  if(!name){ alert('Sila masukkan nama hotel'); return; }
  updateRoomField(roomId,'HOTEL NAME',name,true);
}
async function deleteRoom(roomId,roomName){
  if(!confirm(`Adakah anda pasti ingin memadamkan bilik ${roomName}? Semua jemaah di dalam bilik ini akan menjadi tidak ditetapkan semula untuk lokasi ${activeLocation}.`)) return;
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{
    await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'DELETE',headers:{Authorization:`Bearer ${pat}`}});
    allRoomingRecords=allRoomingRecords.filter(r=>r.id!==roomId);
    renderRoomingGrid(); renderNamelist(); renderStaffList(); renderLocationTabs();
  }catch(e){ alert('Gagal memadamkan bilik: '+e.message); }
}
function openTanpaKatilModal(roomId){
  try{
    const targetRec = allRoomingRecords.find(r=>r.id===roomId);
    const currentTripId = window.selectedTripRecord?.id || localStorage.getItem('effah_active_trip_id') || '';
    console.log('openTanpaKatil FILTER UNASSIGNED IN LOC', currentTripId, activeLocation, 'total', allRoomingJemaah.length);
    const available = allRoomingJemaah.filter(j=>{
      const nameUpper = (getJemaahName(j.fields)||'').toUpperCase();
      if(nameUpper.includes('MUTAWIF') || nameUpper.includes('EFFAH')) return false;
      // Only show jemaah belum assign bilik dalam lokasi ini (activeLocation)
      const assignedNormalInLoc = isJemaahAssignedInLocation(j.id, activeLocation);
      const alreadyTanpaInLoc = allRoomingRecords.some(r=> (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase() && ((r.fields['JEMAAH TANPA KATIL']||r.fields['INFANT']||[]).includes(j.id)));
      if(assignedNormalInLoc) return false;
      if(alreadyTanpaInLoc) return false;
      if(targetRec && (targetRec.fields['JEMAAH TANPA KATIL']||[]).includes(j.id)) return false;
      if(targetRec && (targetRec.fields['JEMAAH']||[]).includes(j.id)) return false;
      return true;
    });
    console.log('available tanpa katil (BELUM ASSIGN IN LOC) list:', available.map(j=>getJemaahName(j.fields)));
    // Include unassigned STAFF as well
    const availableStaff = staffList.filter(s=>{
      const assigned = isStaffAssignedInLocation(s.id||s.airtableId, activeLocation);
      return !assigned;
    });
    console.log('available staff count', availableStaff.length);
    const combinedAvailable = [...available.map(j=>({type:'jemaah', data:j})), ...availableStaff.map(s=>({type:'staff', data:s}))];
    console.log('combined available count for', activeLocation, combinedAvailable.length);
    if(combinedAvailable.length===0){
      alert('Tiada Baki Jemaah/Staff\n\nSemua jemaah dan staff telah ada bilik di ' + activeLocation + '. Tiada baki belum assign untuk ditambah sebagai Tanpa Katil.');
      return;
    }
    const availableForModal = combinedAvailable;
    if(availableForModal.length===0){
      alert('Tiada Baki');
      return;
    }
    let existingModal = document.getElementById('tanpaKatilSelectorModal');
    if(existingModal) existingModal.remove();
    const modalHtml = `<div id="tanpaKatilSelectorModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px">
      <div style="background:#fff;border-radius:16px;max-width:420px;width:100%;max-height:75vh;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.2)">
        <div style="padding:12px 16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:bold;font-size:12px">Pilih Infant / Tanpa Katil - ${activeLocation} (${combinedAvailable.length} baki belum assign)</span>
          <button onclick="document.getElementById('tanpaKatilSelectorModal').remove()" style="w-6 h-6 rounded-full bg-slate-100">X</button>
        </div>
        <div style="padding:6px 8px;background:#fffbe6;border-bottom:1px solid #fde68a;font-size:9px;color:#92400e">Hanya jemaah yang belum ada bilik di ${activeLocation} sahaja. Infant tidak kira kapasiti.</div>
        <div style="padding:8px;max-height:50vh;overflow-y:auto" id="tanpaKatilList">
          <input type="text" id="tanpaKatilSearch" placeholder="Cari nama..." style="width:100%;padding:6px 10px;border:1px solid #ddd;border-radius:20px;font-size:11px;margin-bottom:8px" oninput="filterTanpaKatilList(this.value)">
          <div id="tanpaKatilOptions">
            ${combinedAvailable.map((item, idx)=>{ const isStaff = item.type==='staff'; const id = isStaff ? (item.data.id||item.data.airtableId) : item.data.id; const name = isStaff ? (item.data.name||'Staff') : getJemaahName(item.data.fields); const badge = isStaff ? '<span style="background:#FADBD8;color:#7A0C2E;padding:1px 6px;border-radius:10px;font-size:8px">STAFF</span>' : '<span style="background:#7A0C2E;color:#fff;padding:1px 6px;border-radius:10px;font-size:8px">JEMAAH</span>'; const onclick = isStaff ? `addStaffTanpaKatilToRoom('${roomId}','${id}');` : `addTanpaKatilToRoom('${roomId}','${id}');`; return `<button onclick="${onclick} document.getElementById('tanpaKatilSelectorModal').remove()" style="width:100%;text-align:left;padding:6px 10px;border-bottom:1px solid #f0f0f0;font-size:11px;display:flex;justify-content:space-between;align-items:center"><span>${idx+1}. ${name}</span><span style="display:flex;gap:4px;align-items:center">${badge}<span style="background:#7A0C2E;color:#fff;padding:1px 6px;border-radius:10px;font-size:8px">+</span></span></button>`; }).join('')}
          </div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    window._tanpaKatilAvailable = available;
    window._tanpaKatilRoomId = roomId;
  }catch(e){ alert('Error openTanpaKatil: '+e.message); console.error(e); }
}




async function addTanpaKatilToRoom(roomId, jId){
  const rec=allRoomingRecords.find(r=>r.id===roomId);
  if(!rec) return;
  const cur = rec.fields['JEMAAH TANPA KATIL'] || [];
  if(cur.includes(jId)) return;
  const newVal=[...cur, jId];
  rec.fields['JEMAAH TANPA KATIL']=newVal;
  renderRoomingGrid();
  renderNamelist();
  const b=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const p=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{
    const res=await fetch(`https://api.airtable.com/v0/${b}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${p}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{'JEMAAH TANPA KATIL':newVal}})});
    const d=await res.json();
    if(d.error) console.warn('Airtable save warning', d.error);
  }catch(e){ console.error(e); }
}
function addStaffTanpaKatilToRoom(roomId, staffId){
  if(typeof assignStaffAsTanpaKatil==='function') assignStaffAsTanpaKatil(staffId, roomId);
  else alert('Function assignStaffAsTanpaKatil not found');
}
function filterTanpaKatilList(q){
  const opts=document.querySelectorAll('#tanpaKatilOptions button');
  opts.forEach(btn=>{
    const txt=btn.textContent.toLowerCase();
    btn.style.display = txt.includes(q.toLowerCase()) ? 'flex' : 'none';
  });
}


function updateNewRoomIdFromCap(){ const cap=parseInt(document.getElementById('newRoomCap').value)||4; const el=document.getElementById('newRoomId'); if(el) el.value=generateRoomIdFromCap(cap); }
