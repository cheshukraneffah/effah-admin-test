// components/rooming-grid.js V103.40 PROXY ONLY
function cleanTripNameForRooming(name){
  if(!name) return '';
  if(typeof cleanTripName==='function') return cleanTripName(name);
  return name.replace(/^\s*\d+\/\d+\s*\|\s*/i, '').replace(/^\s*\d+\/\d+\s*/i,'').trim();
}

function toggleBoardDropdown(id){ const el=document.getElementById('boardDrop-'+id); if(!el) return; document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }

function closeStaffDropdown(id){ const el=document.getElementById('staffBoardDrop-'+id); if(el) el.classList.add('hidden'); }

function toggleInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(!el) return; document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>{ if(d.id!=='insuranDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }

function closeInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(el) el.classList.add('hidden'); }

function toggleStaffDropdown(id){
  const el=document.getElementById('staffBoardDrop-'+id); 
  if(!el) { console.warn('staffBoardDrop not found', id); return; }
  document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden'));
  document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>{ if(d.id!=='staffBoardDrop-'+id) d.classList.add('hidden'); });
  document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden'));
  el.classList.toggle('hidden');
}

function closeStaffDropdown(id){
  const el=document.getElementById('staffBoardDrop-'+id);
  if(el) el.classList.add('hidden');
}

function renderRoomingHTML(){
  const c=document.getElementById('modul-rooming'); if(!c) return;
  c.innerHTML=`
  <div class="flex flex-col gap-2.5 p-2">
    <div class="bg-white rounded-2xl border border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2.5 flex-wrap">
        <span class="font-bold tracking-widest text-slate-800 text-[11px]">ROOMING LIST</span>
        <select id="roomingTripSelect" onchange="onRoomingTripChange(this.value)" class="px-2.5 py-1 border border-slate-300 rounded-full bg-white text-[11px] font-bold min-w-[240px] max-w-[320px] truncate">
          <option value="">Pilih Trip...</option>
        </select>
      </div>
      <div class="flex items-center gap-1.5 text-[11px]">
        <span id="belumAssignTop" class="px-2 py-0.5 bg-amber-100 rounded-full font-bold text-[10px]">0 Unassigned</span>
        <span id="assignedTop" class="px-2 py-0.5 bg-emerald-50 rounded-full font-bold text-[10px]">0 Assigned</span>
        <button onclick="fetchRoomingData(true)" title="Reload data dari Airtable" class="w-6 h-6 rounded-full border bg-white hover:bg-slate-50 text-[10px]"><i class="fa-solid fa-rotate"></i></button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-2.5 items-start">
      <div class="w-full lg:w-[52%] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div class="p-2.5 border-b border-slate-200">
          <div class="flex items-center justify-between mb-2.5">
            <h3 class="font-bold text-[11px] tracking-widest text-slate-700">NAMELIST JEMAAH</h3>
            <div class="flex gap-1">
              <span id="belumAssignBadge" class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">0 Unassigned</span>
              <span id="totalJemaahBadge" class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] font-bold">0 Total</span>
            </div>
          </div>
          <div class="flex gap-1.5">
            <div class="relative flex-1">
              <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-slate-400 text-[10px]"></i>
              <input id="searchRoomingJemaah" onkeyup="filterRoomingNamelist()" placeholder="Cari nama jemaah..." class="w-full text-[11px] pl-7 pr-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none">
            </div>
            <select id="filterPakejRooming" onchange="filterRoomingNamelist()" class="text-[11px] border border-slate-200 rounded-xl px-2.5 py-2 bg-white font-medium"><option value="">Semua Pakej</option><option value="JIMAT EKONOMI">JIMAT EKONOMI</option><option value="JIMAT STANDARD">JIMAT STANDARD</option><option value="JIMAT PREMIUM">JIMAT PREMIUM</option><option value="EKONOMI LITE">EKONOMI LITE</option><option value="EKONOMI">EKONOMI</option><option value="STANDARD">STANDARD</option><option value="PREMIUM">PREMIUM</option><option value="PREMIUM PLUS">PREMIUM PLUS</option></select>
          </div>
        </div>
        <div class="px-2.5 py-1.5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-12 text-[9px] font-bold text-slate-500 tracking-wider">
          <div class="col-span-1">NO</div>
          <div class="col-span-3 flex items-center gap-1 cursor-pointer hover:text-[#7A0C2E] select-none" onclick="toggleSortNama()" title="Klik untuk sort A-Z / Z-A">
            <span id="headerNamaJemaah" class="bg-[#7A0C2E] text-white px-1.5 py-0.5 rounded text-[9px]">NAMA JEMAAH</span>
            <span id="sortIcon" class="text-[10px]">${roomingSortActive ? (roomingSortDir==='asc'?'↑':'↓') : '↕'}</span>
          </div>
          <div class="col-span-2 text-center">BOARD BASIS</div><div class="col-span-1 text-center">TRAIN</div><div class="col-span-2 text-center">INSURAN</div><div class="col-span-1 text-center">PAKEJ</div><div class="col-span-2 text-center">VISA</div>
        </div>
        <div id="namelistContainer" class="flex-1 overflow-y-auto max-h-[58vh] divide-y divide-slate-100 bg-white min-h-[180px] relative"></div>
        <div class="border-t-2 border-slate-200 bg-white relative">
          <div class="p-2.5 flex items-center justify-between">
            <h4 class="font-bold text-[11px] tracking-widest text-slate-700">STAFF / EXTRA LIST</h4>
            <span id="staffTotalBadge" class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] font-bold">0 Staff</span>
          </div>
          <div class="px-2.5 pb-2.5 flex gap-1.5">
            <input id="newStaffInput" placeholder="Taip nama staff" class="flex-1 text-[11px] px-2.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none" onkeydown="if(event.key==='Enter'){ addNewStaff(); }">
            <button onclick="addNewStaff()" class="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-bold hover:bg-slate-200">+ Add</button>
          </div>
          <div id="staffListContainer" class="px-2 pb-2.5 max-h-[34vh] overflow-y-auto space-y-1 bg-white min-h-[70px] relative"></div>
        </div>
      </div>

      <div class="w-full lg:w-[48%] flex flex-col gap-2.5">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-2.5">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 class="font-bold text-[11px] tracking-widest">ROOMING LIST</h3>
              <div class="flex items-center gap-1.5 mt-1 text-[10px]">
                <span id="roomingBiliks" class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-bold">0 Bilik</span>
                <span id="roomingOccupancy" class="text-slate-500">0 Jemaah + 0 Staff • ${activeLocation}</span>
              </div>
              <div class="hidden" id="roomingBadgesHidden"></div>
            </div>
            <div class="flex items-center gap-1 flex-wrap">
              <div class="flex gap-1"><button onclick="generateRoomingPrint('landscape')" class="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold hover:bg-slate-50">Print Landscape</button><button onclick="generateRoomingPrint('portrait')" class="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold hover:bg-slate-50">Print Portrait</button><button onclick="downloadAllVisas()" id="btnDownloadVisas" class="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold hover:bg-slate-50 flex items-center gap-1">⬇ Download Visas (<span id="visaCountBadge">0</span>)</button><button onclick="downloadAllPassports()" id="btnDownloadPassports" class="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold hover:bg-slate-50 flex items-center gap-1">⬇ Download Passports (<span id="passportCountBadge">0</span>)</button></div>
              <button onclick="openCopyRoomsModal()" class="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold hover:bg-slate-50">Copy Bilik</button>
              <button onclick="autoAssignRooming()" class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] font-bold hover:bg-slate-200">Auto Assign</button>
              <button onclick="openNewRoomModal()" class="px-2.5 py-1 bg-[#7A0C2E] text-white rounded-full text-[10px] font-bold hover:bg-[#5a0922]">+ Bilik Baru</button>
            </div>
          </div>
          <div id="roomingOverview" class="mt-2.5 p-2.5 bg-[#7A0C2E] text-white rounded-xl text-[11px]"></div>
          <div id="locationTabs" class="flex flex-wrap gap-1 mt-2.5"></div>
        </div>
        <div id="roomingGrid" class="grid grid-cols-1 lg:grid-cols-2 gap-2.5 content-start min-h-[280px]"></div>
      </div>
    </div>
  </div>

  <div id="newRoomModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl">
      <h3 class="font-bold mb-3 text-[11px]">Tambah Bilik Baru</h3>
      <div class="space-y-2.5 text-[11px]">
        <div>
          <label class="text-[9px] font-bold text-slate-500">ROOM ID (Auto)</label>
          <input id="newRoomId" readonly class="w-full p-2 border border-slate-200 rounded-xl bg-slate-100 font-bold text-slate-700 text-[11px]" value="B4">
          <p class="text-[9px] text-slate-400 mt-0.5">Dijana automatik: B + Kapasiti</p>
        </div>
        <select id="newRoomLokasi" class="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px]"><option value="MEKAH">MEKAH</option><option value="MADINAH">MADINAH</option><option value="TAIF">TAIF</option><option value="JEDDAH">JEDDAH</option></select>
        <select id="newRoomPakej" class="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px] font-bold"><option value="JIMAT EKONOMI">JIMAT EKONOMI</option><option value="JIMAT STANDARD">JIMAT STANDARD</option><option value="JIMAT PREMIUM">JIMAT PREMIUM</option><option value="EKONOMI LITE">EKONOMI LITE</option><option value="EKONOMI">EKONOMI</option><option value="STANDARD">STANDARD</option><option value="PREMIUM">PREMIUM</option><option value="PREMIUM PLUS">PREMIUM PLUS</option></select>
        <input id="newRoomHotel" placeholder="Nama Hotel" class="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px]">
        <div class="flex gap-2 items-center">
          <input id="newRoomCap" type="number" value="4" min="1" max="8" oninput="updateNewRoomIdFromCap()" class="flex-1 p-2 border border-slate-200 rounded-xl font-bold bg-white text-[11px]">
          <span class="py-2 text-slate-500 font-bold text-[10px]">Kapasiti</span>
          <button type="button" onclick="changeNewRoomCap(-1)" class="w-7 h-7 rounded-full bg-slate-100 border text-[11px]">−</button>
          <button type="button" onclick="changeNewRoomCap(1)" class="w-7 h-7 rounded-full bg-slate-100 border text-[11px]">+</button>
        </div>
        <textarea id="newRoomNote" placeholder="Catatan bilik..." class="w-full p-2 border border-slate-200 rounded-xl h-14 bg-white text-[11px]"></textarea>
        <div class="flex gap-2 pt-1">
          <button onclick="closeNewRoomModal()" class="flex-1 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[11px]">Batal</button>
          <button onclick="submitNewRoom()" id="btnCiptaBilik" class="flex-1 py-2 bg-[#7A0C2E] text-white rounded-xl font-bold text-[11px]">Cipta Bilik</button>
        </div>
      </div>
    </div>
  </div>

  <div id="copyRoomsModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl p-4 max-w-md w-full shadow-2xl">
      <h3 class="font-bold mb-2 text-[11px]">Salin Bilik Dari Lokasi Lain</h3>
      <p class="text-[10px] text-slate-500 mb-2.5">Salin bilik ke <b id="copyTargetLoc">${activeLocation}</b></p>
      <div class="mb-2.5 p-2.5 bg-slate-50 rounded-xl border">
        <div class="text-[9px] font-bold text-slate-600 mb-1.5">Pilihan Salinan:</div>
        <label class="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer">
          <input type="radio" name="copyMode" value="structure" checked class="mt-0.5">
          <div><div class="text-[11px] font-bold">Struktur bilik sahaja</div><div class="text-[9px] text-slate-500">Hanya kapasiti, pakej & hotel.</div></div>
        </label>
        <label class="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer mt-1.5">
          <input type="radio" name="copyMode" value="withJemaah" class="mt-0.5">
          <div><div class="text-[11px] font-bold">Struktur + Jemaah & Staff</div><div class="text-[9px] text-slate-500">Bilik beserta penghuni akan disalin.</div></div>
        </label>
      </div>
      <div id="copySourceList" class="space-y-1.5 mb-3 max-h-[30vh] overflow-y-auto"></div>
      <div class="flex gap-2"><button onclick="closeCopyRoomsModal()" class="flex-1 py-2 bg-slate-100 border rounded-xl font-bold text-[11px]">Batal</button><button onclick="executeCopyRooms()" class="flex-1 py-2 bg-[#7A0C2E] text-white rounded-xl font-bold text-[11px]">Salin Sekarang</button></div>
    </div>
  </div>
  `;
  populateRoomingTripDropdown();
  renderLocationTabs();
  // First render: always show loading spinner before fetch
  try{ showRoomingLoading(); }catch(e){}
  setTimeout(()=>fetchRoomingData(), 100);
}

function handleRoomDragStart(e, roomId){ 
  draggedRoomId=roomId; 
  window.draggedRoomId=roomId;
  window._draggedRoomId=roomId;
  try{ e.dataTransfer.setData('text/room-id', roomId); e.dataTransfer.setData('text/plain', roomId); }catch(err){}
  e.dataTransfer.effectAllowed='move'; 
  try{ e.target.closest('[data-room-id]')?.classList.add('opacity-50'); }catch(err){}
  console.log('DRAG START ROOM', roomId);
  e.stopPropagation();
}

function handleRoomDragEnd(e){ 
  try{ e.target.closest('[data-room-id]')?.classList.remove('opacity-50'); }catch(err){}
  setTimeout(()=>{ draggedRoomId=null; window.draggedRoomId=null; window._draggedRoomId=null; }, 200);
  console.log('DRAG END ROOM');
}

async function updateRoomCatatan(roomId, value){
  const rec=allRoomingRecords.find(r=>r.id===roomId);
  if(!rec) return;
  rec.fields['CATATAN BILIK']=value;
  rec.fields['CATATAN']=value;
  rec.fields['NOTES']=value;
  console.log('V87 updateRoomCatatan', roomId, value);
  try{
    // base from EFFAH_BASE
    // Try field names in order: CATATAN BILIK, CATATAN, NOTES, REMARK
    const fieldNames = ['CATATAN BILIK','CATATAN','NOTES','REMARK','Catatan Bilik','Catatan'];
    let lastError=null;
    for(let fieldName of fieldNames){
      try{
        const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fields:{[fieldName]: value}})
        });
        const data=await res.json();
        if(data.error){
          console.warn('Catatan field', fieldName, 'failed', data.error);
          lastError=data.error;
          continue; // try next field name
        } else {
          console.log('Catatan saved to field', fieldName, 'value', value);
          // Also save to local for instant persistence
          try{
            const key='effah_room_notes_'+roomId;
            localStorage.setItem(key, value);
          }catch(e){}
          return;
        }
      }catch(e){
        console.warn('Catatan field', fieldName, 'exception', e);
        lastError=e;
      }
    }
    throw lastError||new Error('All catatan field names failed');
  }catch(e){ console.error('Catatan update failed', e); alert('Gagal save catatan bilik: '+e.message+'\n\nField CATATAN BILIK tak wujud di Airtable? Check nama field.'); }
}

function renderNamelist(){
  const cont=document.getElementById('namelistContainer'); if(!cont) return;
  const q=(document.getElementById('searchRoomingJemaah')?.value||'').toLowerCase();
  const pakejFilter=(document.getElementById('filterPakejRooming')?.value||'').toUpperCase();
  let filtered=[...allRoomingJemaah];
  if(q) filtered=filtered.filter(r=>getJemaahName(r.fields).toLowerCase().includes(q));
  if(pakejFilter) filtered=filtered.filter(r=>getPakejVal(r.fields).toUpperCase()===pakejFilter);
  if(roomingSortActive){
    filtered.sort((a,b)=>{
      const nameA=getJemaahName(a.fields).toUpperCase();
      const nameB=getJemaahName(b.fields).toUpperCase();
      if(roomingSortDir==='asc') return nameA.localeCompare(nameB);
      else return nameB.localeCompare(nameA);
    });
  }
  const total=allRoomingJemaah.length;
  const belumGlobal=allRoomingJemaah.filter(r=>!isJemaahAssignedAny(r.id)).length;
  // V24.16: belumInLoc kira termasuk tanpa katil juga
  const belumInLoc=allRoomingJemaah.filter(r=>{
    const assignedNormal = isJemaahAssignedInLocation(r.id, activeLocation);
    const assignedTanpa = allRoomingRecords.some(rec=> (rec.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase() && ((rec.fields['JEMAAH TANPA KATIL']||[]).includes(r.id)));
    return !assignedNormal && !assignedTanpa;
  }).length;
  const totalEl=document.getElementById('totalJemaahBadge'); if(totalEl) { totalEl.textContent=total+' Total'; totalEl.style.display='none'; }
  const belumEl=document.getElementById('belumAssignBadge'); if(belumEl) { belumEl.textContent=belumInLoc+' Unassigned di '+activeLocation; belumEl.style.display='none'; }
  const topBelum=document.getElementById('belumAssignTop'); if(topBelum) { topBelum.textContent=belumGlobal+' Unassigned'; topBelum.style.display='none'; }
  const topAssign=document.getElementById('assignedTop'); if(topAssign) { topAssign.textContent=(total-belumGlobal)+' Assigned'; topAssign.style.display='none'; }
  const topUnassignedBadge=document.getElementById('topUnassignedBadge'); if(topUnassignedBadge) topUnassignedBadge.style.display='none';
  const topAssignedBadge=document.getElementById('topAssignedBadge'); if(topAssignedBadge) topAssignedBadge.style.display='none';
  if(total===0){ cont.innerHTML='<div class="p-6 text-center text-[11px] text-slate-400">Tiada jemaah untuk trip ini</div>'; return; }
  cont.innerHTML=filtered.map((r,i)=>{
        const name=getJemaahName(r.fields);
    const assignedNormalInLoc=isJemaahAssignedInLocation(r.id, activeLocation);
    const assignedTanpaInLoc=allRoomingRecords.some(rec=> (rec.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase() && ((rec.fields['JEMAAH TANPA KATIL']||[]).includes(r.id)));
    const assignedInLoc = assignedNormalInLoc || assignedTanpaInLoc;
    const assignedGlobal=isJemaahAssignedAny(r.id);
    // FIX ghost dropdown: jangan guna opacity-60 sebab child dropdown ikut transparent, guna bg saja
    const rowCls=assignedInLoc?'bg-slate-100 text-slate-500':'hover:bg-slate-50';
    const drag=assignedInLoc?'':`draggable="true" ondragstart="dragJemaah(event,'${r.id}')" ondragend="dragEnd(event)"`;
    let statusIcon = assignedInLoc? `<button onclick="removeJemaahFromCurrentLoc('${r.id}')" class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px]" title="Keluarkan dari ${activeLocation}">✕</button>` : `<button onclick="quickAssign('${r.id}')" class="w-5 h-5 rounded-full border bg-slate-100 hover:bg-slate-200 text-[10px]">+</button>`;
    if(!assignedInLoc && assignedGlobal) statusIcon = `<button onclick="quickAssign('${r.id}')" class="w-5 h-5 rounded-full border bg-amber-100 hover:bg-amber-200 text-[10px]" title="Sudah ada di lokasi lain, boleh tambah di ${activeLocation} juga">+</button>`;
    const fbArr = getBoardArray(r.fields);
    const fb = fbArr[0] || '-';
    const fbDisplay = fbArr.length ? fbArr.join(', ') : '-';
    const pk = getPakejVal(r.fields) || '-';
    const trChecked = isTrainChecked(r.fields);
    const insArr = getInsuranArray(r.fields);
    let fbCls = 'bg-white border-slate-200';
    // Determine class based on first or combined
    if(fbArr.some(x=>x.includes('MEKAH'))) fbCls='bg-orange-100 border-orange-200 text-orange-800';
    else if(fbArr.some(x=>x.includes('MADINAH'))) fbCls='bg-blue-100 border-blue-200 text-blue-800';
    else if(fbArr.includes('BOARD BASIS')) fbCls='bg-emerald-100 border-emerald-200 text-emerald-800';
    else if(fbArr.length===0) fbCls='bg-white border-dashed border-slate-300 text-slate-400';
    const boardOptions = ['BOARD BASIS','BOARD BASIS (MEKAH)','BB (MEKAH)','BOARD BASIS (MADINAH)','BB (MADINAH)'];
    const boardCheckboxes = boardOptions.map(opt=>{
      const checked = fbArr.includes(opt);
      return `<label class="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-50 rounded text-[10px] cursor-pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleBoardMulti('${r.id}','${opt}')" class="w-3 h-3 accent-[#7A0C2E]"> ${opt}</label>`;
    }).join('');
    

    const insArr2 = getInsuranArrayV2 ? getInsuranArrayV2(r.fields) : getInsuranArray(r.fields);
      const insDisplay = insArr2.length ? insArr2.join(', ') : '- INSURAN';
      const insCls = insArr2.length ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400';
      const insuranOptions = ['TAKAFUL','ETIQA','AL-KHAIRI'];
      const insCheckboxes = insuranOptions.map(opt=>{
        const checked = insArr2.includes(opt);
        return `<label class="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-50 rounded text-[10px] cursor-pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleInsuranMulti('${r.id}','${opt}')" class="w-3.5 h-3.5 accent-[#7A0C2E]"> <span class="px-1.5 py-0.5 rounded-full text-[8px] ${opt==='TAKAFUL'?'bg-emerald-100':opt==='ETIQA'?'bg-amber-100':'bg-blue-100'}">${opt}</span></label>`;
      }).join('');
      const insToggle = `<div class="relative w-full">
        <button onclick="event.stopPropagation(); toggleInsuranDropdown('${r.id}')" class="text-[7px] border rounded-full px-2 py-0.5 font-bold ${insCls} outline-none w-full truncate text-left flex items-center justify-between bg-white opacity-100" style="opacity:1;" title="INSURAN - klik untuk pilih">
          <span class="truncate">${insDisplay}</span><span class="ml-1">▼</span>
        </button>
        <div id="insuranDrop-${r.id}" class="hidden absolute left-0 top-full mt-1 w-[190px] bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-1" style="background:#ffffff !important; opacity:1 !important;">
          ${insCheckboxes}
          <div class="border-t border-slate-100 mt-1 pt-1 flex justify-between">
            <button onclick="clearInsuranMulti('${r.id}'); closeInsuranDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-slate-100">Clear</button>
            <button onclick="closeInsuranDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-[#7A0C2E] text-white">OK</button>
          </div>
        </div>
      </div>`;

        return `<div ${drag} class="grid grid-cols-12 items-center px-1.5 py-1.5 text-[11px] border-b border-slate-50 ${rowCls}">
      <div class="col-span-1 text-slate-400 text-[10px]">${String(i+1).padStart(2,'0')}</div>
      <div class="col-span-3 font-medium truncate text-[10px] ${assignedInLoc?'text-slate-500 italic':''}" title="${name}">${name}</div>
      <div class="col-span-2 flex items-center gap-0.5 relative">
        <div class="relative w-full">
          <button onclick="event.stopPropagation(); toggleBoardDropdown('${r.id}')" class="text-[7px] border rounded-full px-2 py-0.5 font-bold ${fbCls} outline-none w-full truncate text-left flex items-center justify-between bg-white opacity-100" style="opacity:1; isolation:isolate;" title="BOARD BASIS - klik untuk pilih 2">
            <span class="truncate">${fbDisplay}</span><span class="ml-1">▼</span>
          </button>
          <div id="boardDrop-${r.id}" class="hidden absolute left-0 top-full mt-1 w-[190px] bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-1" style="background:#ffffff !important; opacity:1 !important; isolation:isolate;">
            ${boardCheckboxes}
            <div class="border-t border-slate-100 mt-1 pt-1 flex justify-between">
              <button onclick="clearBoardMulti('${r.id}'); closeBoardDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-slate-100">Clear</button>
              <button onclick="closeBoardDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-[#7A0C2E] text-white">OK</button>
            </div>
            <div class="text-[7px] text-slate-400 px-2 mt-1">Boleh pilih 2: BB (MEKAH) + FB (MADINAH)</div>
          </div>
        </div>
      </div>
      <div class="col-span-1 text-center">
        <input type="checkbox" ${trChecked?'checked':''} onchange="updateJemaahCheckbox('${r.id}','TRAIN',this.checked)" class="w-3.5 h-3.5 accent-[#7A0C2E] rounded" title="TRAIN">
      </div>
      <div class="col-span-2 flex items-center gap-0.5 flex-wrap justify-center">
        ${insToggle}
      </div>
      <div class="col-span-1 flex items-center gap-0.5">
        <select onchange="updateJemaahField('${r.id}','PAKEJ',this.value)" class="text-[8px] border border-slate-200 rounded-full px-1.5 py-0.5 bg-white max-w-[55px] truncate text-[7px]">
          <option value="-" ${pk==='-'?'selected':''}>-</option>
          <option value="JIMAT EKONOMI" ${pk==='JIMAT EKONOMI'?'selected':''}>JIMAT EKONOMI</option>
          <option value="JIMAT STANDARD" ${pk==='JIMAT STANDARD'?'selected':''}>JIMAT STANDARD</option>
          <option value="JIMAT PREMIUM" ${pk==='JIMAT PREMIUM'?'selected':''}>JIMAT PREMIUM</option>
          <option value="EKONOMI LITE" ${pk==='EKONOMI LITE'?'selected':''}>EKONOMI LITE</option>
          <option value="EKONOMI" ${pk==='EKONOMI'?'selected':''}>EKONOMI</option>
          <option value="STANDARD" ${pk==='STANDARD'?'selected':''}>STANDARD</option>
          <option value="PREMIUM" ${pk==='PREMIUM'?'selected':''}>PREMIUM</option>
          <option value="PREMIUM PLUS" ${pk==='PREMIUM PLUS'?'selected':''}>PREMIUM PLUS</option>
        </select>
      </div>
      <div class="col-span-2 flex items-center justify-center" >
        <select onchange="updateJemaahField('${r.id}','STATUS VISA',this.value)" class="text-[7px] border border-slate-300 rounded-full px-2 py-0.5 bg-white w-full max-w-[60px] truncate font-bold text-[7px] ${getVisaClass(getVisaVal(r.fields))}">
          <option value="" ${getVisaVal(r.fields)===''?'selected':''}>- VISA</option>
          <option value="TOURIST" ${getVisaVal(r.fields)==='TOURIST'?'selected':''}>TOURIST</option>
          <option value="TOURIST (VALID)" ${getVisaVal(r.fields)==='TOURIST (VALID)'?'selected':''}>TOURIST (VALID)</option>
          <option value="UMRAH" ${getVisaVal(r.fields)==='UMRAH'?'selected':''}>UMRAH</option>
          <option value="UMRAH (VALID)" ${getVisaVal(r.fields)==='UMRAH (VALID)'?'selected':''}>UMRAH (VALID)</option>
          <option value="IQAMA (VALID)" ${getVisaVal(r.fields)==='IQAMA (VALID)'?'selected':''}>IQAMA (VALID)</option>
          <option value="" ${getVisaVal(r.fields)===''?'selected':''}>- VISA</option>
        </select>
      </div>
    </div>`;
  }).join('');
  makeNamelistSticky();
  const sortIconEl=document.getElementById('sortIcon');
  if(sortIconEl) sortIconEl.textContent = roomingSortActive ? (roomingSortDir==='asc'?'↑ A-Z':'↓ Z-A') : '↕';
}

function toggleSortNama(){
  if(!roomingSortActive){
    roomingSortActive=true;
    roomingSortDir='asc';
  } else {
    roomingSortDir = roomingSortDir==='asc' ? 'desc' : 'asc';
  }
  localStorage.setItem('effah_rooming_sort_dir', roomingSortDir);
  localStorage.setItem('effah_rooming_sort_active', 'true');
  renderNamelist();
}

function makeNamelistSticky(){
  try{
    const nl = document.getElementById('namelistContainer');
    if(!nl) return;
    // Find left card - the 52% width card
    let leftCard = nl.closest('[class*="lg:w-"]');
    if(!leftCard) leftCard = nl.parentElement;
    // The outer left column wrapper is the parent of leftCard's parent? Actually structure: flex-col lg:flex-row > w-[52%] card
    if(leftCard){
      leftCard.style.position='sticky';
      leftCard.style.top='12px';
      leftCard.style.alignSelf='flex-start';
      leftCard.style.zIndex='20';
      leftCard.style.display='flex';
      leftCard.style.flexDirection='column';
      leftCard.style.backgroundColor='#ffffff';
      leftCard.style.maxHeight='calc(100vh - 16px)';
      leftCard.style.overflow='hidden';
      leftCard.style.borderRadius='16px';
    }
    nl.style.flex='1 1 auto';
    nl.style.maxHeight='48vh';
    nl.style.minHeight='220px';
    nl.style.overflowY='auto';
    nl.style.overflowX='hidden';
    nl.style.backgroundColor='#ffffff';
    const staffSec = document.getElementById('staffListContainer')?.parentElement;
    if(staffSec){
      staffSec.style.flex='0 0 auto';
      staffSec.style.backgroundColor='#ffffff';
      staffSec.style.borderTop='2px solid #e2e8f0';
      staffSec.style.display='flex';
      staffSec.style.flexDirection='column';
      staffSec.style.maxHeight='38vh';
      staffSec.style.overflow='hidden';
    }
    const staffCont = document.getElementById('staffListContainer');
    if(staffCont){
      staffCont.style.flex='1';
      staffCont.style.overflowY='auto';
      staffCont.style.overflowX='hidden';
      staffCont.style.backgroundColor='#ffffff';
    }
    const rg=document.getElementById('roomingGrid');
    if(rg){
      rg.style.overflow='visible';
      rg.style.maxHeight='none';
    }
    // Ensure parent flex row allows sticky
    const flexRow = leftCard?.parentElement;
    if(flexRow){
      flexRow.style.alignItems='flex-start';
    }
  }catch(e){ console.error('sticky fail', e); }
}

function filterRoomingNamelist(){ renderNamelist(); }

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
            else if(up==='BOARD BASIS') badge=`<span style="background:#BBF7D0;border:1px solid #065F46;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" font-bold">BOARD BASIS</span>`;
          } else if(roomLoc==='MADINAH'){
            if(up.includes('MADINAH')) badge=`<span style="background:#BFDBFE;border:1px solid #1E40AF;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" text-blue-900 border border-blue-300 rounded-full text-[8px] font-bold">${raw}</span>`;
            else if(up==='BOARD BASIS') badge=`<span style="background:#BBF7D0;border:1px solid #065F46;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" font-bold">BOARD BASIS</span>`;
          } else {
            if(up.includes('MEKAH') || up.includes('MADINAH') || up==='BOARD BASIS') badge=`<span style="background:#BBF7D0;border:1px solid #065F46;padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;" font-bold">${raw}</span>`;
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
  // base from EFFAH_BASE
    await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'KAPASITI':newCap}})});
    rec.fields['KAPASITI']=newCap;
    renderRoomingGrid(); renderLocationTabs(); renderNamelist(); renderStaffList();
  }

async function updateRoomField(roomId,field,value,doRender=true){
  // base from EFFAH_BASE
    await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{[field]:value}})});
    const rec=allRoomingRecords.find(r=>r.id===roomId); if(rec) rec.fields[field]=value;
    if(doRender){ renderRoomingGrid(); renderNamelist(); renderStaffList(); renderLocationTabs(); }
  }

async function updateJemaahField(jemaahId, field, value){
  if(field==='STATUS VISA'){ const v=(value||'').toString().trim(); if(v==='' || v.toUpperCase()==='- VISA' || v==='-' ){ value = null; } }
  if(field==='PAKEJ' && (value==='-' || value==='')){
    value = null;
  }

  // base from EFFAH_BASE
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
    const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields: fieldsToSend})});
    const data=await res.json();
    if(data.error){
      console.error('Airtable update error', data.error);
      throw new Error(data.error.message + ' (field: '+field+', type: '+data.error.type+')');
    }
  }catch(e){ console.error(e); alert('Gagal update jemaah '+field+': '+e.message+'\n\nPastikan field '+field+' di Airtable adalah Multiple Select (bukan Single Select). Jika Single Select, tukar ke Multiple Select dulu.'); if(typeof fetchRoomingData==='function') fetchRoomingData(); }
}

async function updateJemaahBoardMulti(jemaahId, selectedArr){
  // base from EFFAH_BASE
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return;
  rec.fields['BOARD BASIS']=selectedArr;
  rec.fields['BOARD']=selectedArr.join(', ');
  renderNamelist();
  try{
    // For Multiple Select, empty must be [] not null (null = 422)
    let res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields: {'BOARD BASIS': selectedArr.length?selectedArr:[]}})});
    let data=await res.json();
    if(data.error){
      console.error('BOARD BASIS save failed', data.error);
      // Check if BOARD is formula - don't try BOARD fallback if error is about BOARD
      if(data.error.type!=='INVALID_VALUE_FOR_COLUMN'){
        // Try BOARD as fallback only if BOARD BASIS field error is about type
        try{
          res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields: {'BOARD BASIS': selectedArr}})});
          data=await res.json();
        }catch(e){}
      }
      if(data.error) throw new Error(data.error.message);
    }
  }catch(e){ console.error(e); alert('Gagal update BOARD: '+e.message+'\n\nPastikan field BOARD BASIS di Airtable sudah tukar ke Multiple Select, bukan Single Select.'); fetchRoomingData(); }
}

function toggleBoardDropdown(jemaahId){ const el=document.getElementById('boardDrop-'+jemaahId); if(!el) return; // close others
  document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+jemaahId) d.classList.add('hidden'); });
  el.classList.toggle('hidden'); }

function closeBoardDropdown(jemaahId){ const el=document.getElementById('boardDrop-'+jemaahId); if(el) el.classList.add('hidden'); }

async function updateJemaahCheckbox(jemaahId, field, checked){
  // base from EFFAH_BASE
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(rec) rec.fields[field]=checked;
  renderNamelist();
  try{
    const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields: {[field]: checked}})});
    const data=await res.json();
    if(!data.id && data.error) throw new Error(data.error.message);
  }catch(e){ console.error(e); alert('Gagal update checkbox '+field+': '+e.message); fetchRoomingData(); }
}

async function updateJemaahInsuran(jemaahId, value){
  // base from EFFAH_BASE
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId); 
  if(rec){
    rec.fields['INSURAN'] = value ? [value] : [];
  }
  renderNamelist();
  try{
    const payload = value ? {[ 'INSURAN']: [value]} : {['INSURAN']: []};
    const res=await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields: payload})});
    const data=await res.json();
    if(!data.id && data.error) throw new Error(data.error.message);
  }catch(e){ console.error(e); alert('Gagal update INSURAN: '+e.message); fetchRoomingData(); }
}

async function deleteRoom(roomId,roomName){
  if(!confirm(`Adakah anda pasti ingin memadamkan bilik ${roomName}? Semua jemaah di dalam bilik ini akan menjadi tidak ditetapkan semula untuk lokasi ${activeLocation}.`)) return;
  // base from EFFAH_BASE
    await fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${roomId}`,{method:'DELETE',}}

function filterTanpaKatilList(q){
  const opts=document.querySelectorAll('#tanpaKatilOptions button');
  opts.forEach(btn=>{
    const txt=btn.textContent.toLowerCase();
    btn.style.display = txt.includes(q.toLowerCase()) ? 'flex' : 'none';
  });
}

function dragStaff(e,staffId){ if(isStaffAssignedInLocation(staffId, activeLocation)) return; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/staff-id',staffId); e.dataTransfer.setData('text/plain',staffId); const row=e.currentTarget; if(row) setTimeout(()=>row.style.opacity='0.3',0); }

function dragStaffEnd(e){ e.currentTarget.style.opacity='1'; }

function _stopAutoScroll(){ 
  try {
    if(window._autoScrollInterval){ clearInterval(window._autoScrollInterval); window._autoScrollInterval=null; } 
    if(typeof _autoScrollInterval!=='undefined' && _autoScrollInterval){ clearInterval(_autoScrollInterval); _autoScrollInterval=null; } 
  } catch(e){}
}

function _startAutoScroll(){
  if(window._autoScrollInterval) return;
  if(typeof _autoScrollInterval!=='undefined' && _autoScrollInterval) return;
  try {
    _autoScrollInterval=setInterval(()=>{
      const y=window._lastDragY||0;
      if(y<140){ window.scrollBy(0, -22); }
      else if(y>window.innerHeight-140){ window.scrollBy(0, 22); }
    }, 35);
    window._autoScrollInterval=_autoScrollInterval;
  } catch(e){}
}

function allowDrop(e){ 
  try { e.preventDefault(); } catch(e){}
  window._lastDragY=e.clientY; 
  _startAutoScroll(); 
}

function handleRoomDragLeave(e){
  try {
    const el = e.currentTarget || e.target;
    if(el && el.classList) el.classList.remove('drag-over','ring-2','ring-[#7A0C2E]','bg-amber-50');
  } catch(err){}
  _stopAutoScroll();
}

function handleRoomDragEnter(e){
  try { e.preventDefault(); const el=e.currentTarget; if(el&&el.classList) el.classList.add('drag-over'); } catch(err){}
  window._lastDragY=e.clientY;
  _startAutoScroll();
}

function allowDropRoom(e){
  try { e.preventDefault(); e.dataTransfer.dropEffect='move'; } catch(err){}
  window._lastDragY=e.clientY;
  try{ _startAutoScroll(); }catch(err){}
  const el=e.currentTarget;
  if(el && el.classList) el.classList.add('drag-over','ring-2','ring-[#7A0C2E]/40');
}

function leaveDropRoom(e){
  handleRoomDragLeave(e);
}

function dropRoomReorder(e, roomId){
  // placeholder - if reordering logic exists, keep
  if(typeof window.dropRoomReorderOriginal==='function') return window.dropRoomReorderOriginal(e, roomId);
}

async function dropRoomReorder(e, targetRoomId){
  e.preventDefault(); e.stopPropagation();
  try{ e.currentTarget.classList.remove('ring-2','ring-[#7A0C2E]/30','ring-amber-300','drag-over','ring-[#7A0C2E]/40'); }catch(err){}
  let srcId = draggedRoomId || window.draggedRoomId || window._draggedRoomId;
  try{
    const dtRoom = e.dataTransfer.getData('text/room-id') || e.dataTransfer.getData('text/plain');
    if(dtRoom && dtRoom.startsWith('rec')) srcId = dtRoom;
  }catch(err){}
  console.log('DROP ROOM REORDER src', srcId, 'target', targetRoomId);
  if(!srcId || srcId===targetRoomId) return;
  if(!allRoomingRecords.some(r=>r.id===srcId)) return;
  const rooms=[...allRoomingRecords].filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase());
  const ordered=getRoomOrderedList(rooms);
  const draggedIdx=ordered.findIndex(r=>r.id===srcId);
  const targetIdx=ordered.findIndex(r=>r.id===targetRoomId);
  if(draggedIdx===-1 || targetIdx===-1) return;
  const moved=ordered.splice(draggedIdx,1)[0];
  ordered.splice(targetIdx,0,moved);
  ordered.forEach((r,i)=>{ r.fields['SORT ORDER']=i+1; });
  saveRoomOrder(ordered.map(r=>r.id));
  console.log('ROOM ORDER SAVED', ordered.map((r,i)=>`${i+1}`));
  draggedRoomId=null; window.draggedRoomId=null; window._draggedRoomId=null;
  try{ e.dataTransfer.clearData(); }catch(err){}
  try{ e.stopImmediatePropagation(); }catch(err){}
  renderRoomingGrid();
  try{
    // base from EFFAH_BASE
        for(let i=0;i<ordered.length;i++){
      const rec=ordered[i];
      fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.ROOMING}&recordId=${rec.id}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({fields:{'SORT ORDER': i+1}})
      }).then(()=>console.log('SORT ORDER updated', rec.id.substring(0,6), i+1));
    }
  }catch(err){ console.error(err); }
}