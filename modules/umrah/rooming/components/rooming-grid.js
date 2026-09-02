// components/rooming-grid.js V103.44 FINAL CLEAN - rendering only
function renderLocationTabs(){
  const cont=document.getElementById('locationTabs'); if(!cont) return;
  const locs=['MEKAH','MADINAH','JEDDAH'];
  cont.innerHTML = locs.map(l=>`<button onclick="setActiveLocation('${l}')" class="${activeLocation===l?'bg-[#7A0C2E] text-white':'bg-white text-slate-600'} px-4 py-2 rounded-full text-[11px] font-bold border">${l}</button>`).join('');
}
function setActiveLocation(loc){
  activeLocation=loc; localStorage.setItem('effah_active_location',loc);
  renderLocationTabs(); renderRoomingGrid(); renderNamelist(); renderStaffList();
  if(typeof renderRoomingOverview==='function') renderRoomingOverview(allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase()));
}
function renderRoomingGrid(){
  const grid=document.getElementById('roomingGrid'); if(!grid) return;
  const filtered = allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase());
  if(filtered.length===0){
    grid.innerHTML=`<div class="col-span-2 text-center py-10 text-[12px] text-slate-400">Tiada bilik untuk ${activeLocation}. Klik Cipta Bilik.</div>`;
    return;
  }
  grid.innerHTML = filtered.map(room=>{
    const cap=room.fields['KAPASITI']||4;
    const hotel=room.fields['HOTEL']||'-';
    const jemaahIds=[...(room.fields['JEMAAH']||[]), ...(room.fields['JEMAAH TANPA KATIL']||[])];
    const jemaahNames=jemaahIds.map(id=>getNameForAnyId(id)).join(', ');
    return `<div class="bg-white rounded-2xl border border-slate-200 p-3" data-room-id="${room.id}">
      <div class="flex justify-between items-start mb-2">
        <div><div class="font-bold text-[12px]">${hotel}</div><div class="text-[10px] text-slate-500">Kapasiti: ${cap} | ${jemaahIds.length} orang</div></div>
        <button onclick="deleteRoom('${room.id}','${hotel}')" class="text-[10px] text-red-500 border border-red-200 px-2 py-1 rounded-full">Padam</button>
      </div>
      <div class="min-h-[60px] border border-dashed border-slate-200 rounded-xl p-2 bg-slate-50 text-[11px]">${jemaahNames||'<span class=text-slate-400>Drag jemaah kesini</span>'}</div>
    </div>`;
  }).join('');
}
function renderNamelist(){
  const cont=document.getElementById('namelistContainer'); if(!cont) return;
  const unassigned = allRoomingJemaah.filter(j=> !allRoomingRecords.some(r=>{
    const loc=(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase();
    if(loc!==activeLocation.toUpperCase()) return false;
    const allIds=[...(r.fields['JEMAAH']||[]), ...(r.fields['JEMAAH TANPA KATIL']||[])];
    return allIds.includes(j.id);
  }));
  if(unassigned.length===0){ cont.innerHTML='<div class=text-[11px] text-slate-400 p-3>Semua jemaah sudah ditempatkan</div>'; return; }
  cont.innerHTML = unassigned.map(j=>`<div class="px-2.5 py-2 flex gap-2 border-b border-slate-50 text-[11px]" draggable="true" ondragstart="dragJemaah(event,'${j.id}')"><span>${getJemaahName(j)}</span></div>`).join('');
}
function dragJemaah(e,jId){ e.dataTransfer.setData('text/jemaah-id', jId); }
function allowDrop(e){ e.preventDefault(); }
function dropJemaah(e, roomId){
  e.preventDefault();
  const jId=e.dataTransfer.getData('text/jemaah-id');
  const staffId=e.dataTransfer.getData('text/staff-id');
  if(jId) assignJemaahToRoom(jId, roomId);
  if(staffId) assignStaffToRoomClean(staffId, roomId);
}
async function assignJemaahToRoom(jId, roomId){
  try{
    const room=allRoomingRecords.find(r=>r.id===roomId); if(!room) return;
    const cur=room.fields['JEMAAH']||[];
    if(cur.includes(jId)) return;
    const newVal=[...cur, jId];
    await effahUpdate('ROOMING', roomId, {'JEMAAH': newVal});
    room.fields['JEMAAH']=newVal;
    renderRoomingGrid(); renderNamelist();
  }catch(e){ console.error('assignJemaah failed', e); alert('Gagal assign: '+e.message); }
}
async function assignStaffToRoomClean(staffId, roomId){
  try{
    const staff=staffList.find(s=>s.id===staffId); if(!staff) return;
    const rec=allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
    if(!staff.roomIds) staff.roomIds=[];
    if(!staff.roomIds.includes(roomId)) staff.roomIds.push(roomId);
    await effahUpdate('STAFF', staff.airtableId, {'ROOMING LIST': staff.roomIds});
    saveStaffList(); renderStaffList(); renderRoomingGrid();
  }catch(e){ console.error('assignStaff failed', e); }
}
async function deleteRoom(roomId, roomName){
  if(!confirm(`Padam bilik ${roomName}?`)) return;
  try{
    await effahDelete('ROOMING', roomId);
    allRoomingRecords = allRoomingRecords.filter(r=>r.id!==roomId);
    renderRoomingGrid(); renderLocationTabs && renderLocationTabs();
  }catch(e){ console.error('deleteRoom failed', e); alert('Gagal padam: '+e.message); }
}
function filterNamelist(q){
  const items=document.querySelectorAll('#namelistContainer > div');
  items.forEach(el=>{ el.style.display = el.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none'; });
}
