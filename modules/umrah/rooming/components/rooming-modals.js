// components/rooming-modals.js V103.43 CLEAN PROXY - 7 funcs
function toggleInsuranMulti(jId, opt){
  var rec=allRoomingJemaah.find(function(r){return r.id===jId;});
  if(!rec) return;
  var arr=getInsuranArray(rec.fields);
  if(arr.includes(opt)) arr=arr.filter(function(x){return x!==opt;}); else arr.push(opt);
  rec.fields['INSURAN']=arr;
  if(typeof updateJemaahField==='function') updateJemaahField(jId, 'INSURAN', arr);
}

function toggleBoardMulti(jemaahId, option){
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return;
  let arr=getBoardArray(rec.fields);
  if(arr.includes(option)) arr=arr.filter(x=>x!==option); else arr.push(option);
  updateJemaahBoardMulti(jemaahId, arr);
}

function toggleInsuranMulti(jemaahId, option){
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return;
  let arr=getInsuranArrayV2(rec.fields);
  if(arr.includes(option)) arr=arr.filter(x=>x!==option); else arr.push(option);
  rec.fields['INSURAN']=arr;
  if(typeof updateJemaahField==='function') updateJemaahField(jemaahId, 'INSURAN', arr.length?arr.join(', '):'');
  if(typeof renderNamelist==='function') renderNamelist();
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
  // If selects BOARD BASIS generic, remove specific ones? Keep simple allow combo
  updateJemaahBoardMulti(jemaahId, arr);
}

async function toggleInsuran(jemaahId, opt){
  // base from EFFAH_BASE
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
    const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields: {'INSURAN': curr}})});
    const data=await res.json();
    if(!data.id && data.error) throw new Error(data.error.message);
  }catch(e){ console.error(e); alert('Gagal update INSURAN multi: '+e.message); fetchRoomingData(); }
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

function openAddLocationModal(){ const loc=prompt('Sila masukkan nama lokasi baharu (contoh: TAIF, JEDDAH, KL):'); if(loc&&loc.trim()){ const up=loc.trim().toUpperCase(); if(!customLocations.includes(up)) customLocations.push(up); localStorage.setItem('effah_custom_locations',JSON.stringify(customLocations)); const sel=document.getElementById('newRoomLokasi'); if(sel){ const exists=[...sel.options].some(o=>o.value===up); if(!exists){ const opt=document.createElement('option'); opt.value=up; opt.textContent=up; sel.appendChild(opt); } } activeLocation=up; localStorage.setItem('effah_active_location',activeLocation); renderLocationTabs(); renderRoomingGrid(); renderNamelist(); alert('Lokasi "'+up+'" ditambah. PENTING: Tambah option "'+up+'" dalam Airtable > ROOMING LIST > LOKASI / CITY sekali sahaja.'); } }