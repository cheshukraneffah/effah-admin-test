// COMPONENT - Modals - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports

function changeNewRoomCap(d){ const i=document.getElementById('newRoomCap'); let v=parseInt(i.value)||4; v=Math.max(1,Math.min(8,v+d)); i.value=v; updateNewRoomIdFromCap(); }
function openNewRoomModal(){ const m=document.getElementById('newRoomModal'); if(!m) return; m.classList.remove('hidden'); document.getElementById('newRoomLokasi').value=activeLocation; document.getElementById('newRoomCap').value=roomingDefaultCap; updateNewRoomIdFromCap(); }
function closeNewRoomModal(){ document.getElementById('newRoomModal').classList.add('hidden'); }
async function submitNewRoom(){
  const btn=document.getElementById('btnCiptaBilik'); if(btn){ btn.textContent='Mencipta...'; btn.disabled=true; }
  const lokasi=document.getElementById('newRoomLokasi').value; const pakej=document.getElementById('newRoomPakej').value;
  const hotel=document.getElementById('newRoomHotel').value.trim(); const cap=parseInt(document.getElementById('newRoomCap').value)||4;
  const note=document.getElementById('newRoomNote').value.trim(); const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('selectedTripId')||localStorage.getItem('effah_last_selected_trip');
  if(!tripId){ alert('Sila pilih trip terlebih dahulu.'); if(btn){ btn.textContent='Cipta Bilik'; btn.disabled=false; } return; }
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  const payload={fields:{'PAKEJ / HOTEL':pakej,'KAPASITI':cap,'HOTEL NAME':hotel||'','CATATAN BILIK':note||'','TRIP':[tripId],'LOKASI / CITY':lokasi}};
  try{
    let res=await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST`,{method:'POST',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
    let newRec=await res.json();
    if(newRec.id){ allRoomingRecords.push(newRec); closeNewRoomModal(); renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList(); document.getElementById('newRoomHotel').value=''; document.getElementById('newRoomNote').value=''; }
    else {
      const msg=newRec.error?.message||JSON.stringify(newRec);
      if(msg.includes('Insufficient permissions to create new select option') || msg.toLowerCase().includes('select option')){
        alert('Gagal: Lokasi "'+lokasi+'" belum ada dalam Airtable.\n\nBuka Airtable > ROOMING LIST > LOKASI / CITY > Add option: '+lokasi+'\n\nSementara tu sistem cuba cipta sebagai MEKAH.');
        payload.fields['LOKASI / CITY']='MEKAH';
        let res2=await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST`,{method:'POST',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
        let newRec2=await res2.json();
        if(newRec2.id){ allRoomingRecords.push(newRec2); closeNewRoomModal(); renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList(); }
        else alert('Gagal fallback MEKAH: '+(newRec2.error?.message||JSON.stringify(newRec2)));
      } else {
        alert('Gagal mencipta bilik: '+msg);
      }
    }
  }catch(e){ alert('Ralat semasa mencipta bilik: '+e.message); }
  finally{ if(btn){ btn.textContent='Cipta Bilik'; btn.disabled=false; } }
}
function openAddLocationModal(){ const loc=prompt('Sila masukkan nama lokasi baharu (contoh: TAIF, JEDDAH, KL):'); if(loc&&loc.trim()){ const up=loc.trim().toUpperCase(); if(!customLocations.includes(up)) customLocations.push(up); localStorage.setItem('effah_custom_locations',JSON.stringify(customLocations)); const sel=document.getElementById('newRoomLokasi'); if(sel){ const exists=[...sel.options].some(o=>o.value===up); if(!exists){ const opt=document.createElement('option'); opt.value=up; opt.textContent=up; sel.appendChild(opt); } } activeLocation=up; localStorage.setItem('effah_active_location',activeLocation); renderLocationTabs(); renderRoomingGrid(); renderNamelist(); alert('Lokasi "'+up+'" ditambah. PENTING: Tambah option "'+up+'" dalam Airtable > ROOMING LIST > LOKASI / CITY sekali sahaja.'); } }
function deleteCustomLocation(loc){ if(!confirm(`Adakah anda pasti ingin memadamkan lokasi ${loc}?`)) return; customLocations=customLocations.filter(l=>l!==loc); localStorage.setItem('effah_custom_locations',JSON.stringify(customLocations)); if(activeLocation===loc) activeLocation='MEKAH'; renderLocationTabs(); renderRoomingGrid(); renderNamelist(); }
function openCopyRoomsModal(){
  const m=document.getElementById('copyRoomsModal'); if(!m) return; const list=document.getElementById('copySourceList');
  const allLocs=['MEKAH','MADINAH','TAIF','JEDDAH',...customLocations].filter(l=>l!==activeLocation);
  const counts={}; allRoomingRecords.forEach(r=>{ const l=(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase(); counts[l]=(counts[l]||0)+1; });
  if(allLocs.length===0 || allLocs.every(l=>(counts[l]||0)===0)){
    list.innerHTML='<div class="text-[11px] text-slate-400 p-2.5 border border-dashed rounded-xl">Tiada bilik di lokasi lain untuk disalin.</div>';
  } else {
    list.innerHTML=allLocs.map(loc=>{
      const c=counts[loc]||0; const disabled=c===0?'opacity-40 pointer-events-none':'';
      return `<label class="flex items-center justify-between gap-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 ${disabled}"><div class="flex items-center gap-2"><input type="radio" name="copySource" value="${loc}" ${c===0?'disabled':''}><span class="text-[11px] font-bold">${loc} (${c} bilik)</span></div><span class="text-[10px] text-slate-400">${c>0?'Sedia disalin':'Tiada bilik'}</span></label>`;
    }).join('');
  }
  document.getElementById('copyTargetLoc').textContent=activeLocation; m.classList.remove('hidden');
}
function closeCopyRoomsModal(){ document.getElementById('copyRoomsModal').classList.add('hidden'); }
async function executeCopyRooms(){
  const sel=document.querySelector('input[name="copySource"]:checked'); if(!sel) return alert('Sila pilih lokasi sumber untuk disalin.');
  const modeEl=document.querySelector('input[name="copyMode"]:checked'); const mode=modeEl?modeEl.value:'structure';
  const src=sel.value; const srcRooms=allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===src);
  if(srcRooms.length===0) return alert('Tiada bilik di lokasi '+src+' untuk disalin.');
  const modeText=mode==='withJemaah'?'bilik beserta jemaah & staff':'struktur bilik sahaja tanpa jemaah';
  if(!confirm(`Adakah anda pasti ingin menyalin ${srcRooms.length} bilik dari ${src} ke ${activeLocation}?\n\nPilihan: ${modeText}`)) return;
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat'); const tripId=localStorage.getItem('effah_active_trip_id')||localStorage.getItem('selectedTripId')||localStorage.getItem('effah_last_selected_trip');
  if(!tripId) return alert('Sila pilih trip terlebih dahulu.');
  let created=0; let failed=0;
  for(let r of srcRooms){
    const f=r.fields; const cap=f['KAPASITI']||4;
    const payload={fields:{'PAKEJ / HOTEL':f['PAKEJ / HOTEL']||'EKONOMI','KAPASITI':cap,'HOTEL NAME':f['HOTEL NAME']||'','CATATAN BILIK':f['CATATAN BILIK']||'','TRIP':[tripId],'LOKASI / CITY':activeLocation}};
    if(mode==='withJemaah'){
      if(f['JEMAAH'] && f['JEMAAH'].length>0) payload.fields['JEMAAH']=f['JEMAAH'];
      if(f['STAFF / EXTRA']) payload.fields['STAFF / EXTRA']=f['STAFF / EXTRA'];
    }
    try{
      const res=await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST`,{method:'POST',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const newRec=await res.json();
      if(newRec.id){ allRoomingRecords.push(newRec); created++; }
      else { failed++; console.error('Copy failed', newRec); }
    }catch(e){ failed++; console.error(e); }
  }
  closeCopyRoomsModal(); renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList();
  if(created>0) alert(`Berjaya menyalin ${created} bilik dari ${src} ke ${activeLocation} (${modeText}).` + (failed>0?` ${failed} bilik gagal disalin.`:''));
  else alert('Gagal menyalin bilik. Sila cuba semula.');
}

function dragStaff(e,staffId){ if(isStaffAssignedInLocation(staffId, activeLocation)) return; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/staff-id',staffId); e.dataTransfer.setData('text/plain',staffId); const row=e.currentTarget; if(row) setTimeout(()=>row.style.opacity='0.3',0); }
function dragStaffEnd(e){ e.currentTarget.style.opacity='1'; }
function quickAssignStaff(staffId){ if(isStaffAssignedInLocation(staffId, activeLocation)) return; const rooms=allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation); const target=rooms.find(r=>{ const j=r.fields['JEMAAH']?.length||0; const s=getStaffForRoom(r.id).length; return (j+s)<(r.fields['KAPASITI']||4); }); if(target) assignStaffToRoom(staffId,target.id); else alert('Tiada slot kosong di lokasi '+activeLocation+'.'); }
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
async function removeTanpaKatilFromRoom(roomId, jId){
  const rec=allRoomingRecords.find(r=>r.id===roomId);
  if(!rec) return;
  const cur = rec.fields['JEMAAH TANPA KATIL'] || rec.fields['INFANT'] || [];
  const newVal=cur.filter(x=>x!==jId);
  rec.fields['JEMAAH TANPA KATIL']=newVal;
  renderRoomingGrid();
  renderNamelist();
  const b=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const p=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  try{ await fetch(`https://api.airtable.com/v0/${b}/ROOMING%20LIST/${roomId}`,{method:'PATCH',headers:{Authorization:`Bearer ${p}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{'JEMAAH TANPA KATIL':newVal}})}); }catch(e){}
}




