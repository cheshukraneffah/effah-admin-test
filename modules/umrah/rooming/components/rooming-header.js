// COMPONENT - RoomingHeader (top buttons: Print Landscape/Portrait, Download Visas/Passports, Copy Bilik) - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports


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

function getRoomOrderKey(){ const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'; return `effah_room_order_${tripId}_${activeLocation}`; }
function getRoomOrderedList(rooms){
  try{
    if(!rooms || rooms.length===0){
      console.log('getRoomOrderedList: no rooms for location', activeLocation);
      return [];
    }
    const key=getRoomOrderKey(); 
    let localOrder=[];
    try{ localOrder=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ localOrder=[]; }
    // If local order exists and matches room count, use it (user dragged in portal)
    if(localOrder.length>0 && localOrder.length>=rooms.length*0.8){ 
      const map={}; rooms.forEach(r=>{ if(r&&r.id) map[r.id]=r; }); 
      const ordered=[]; 
      localOrder.forEach(id=>{ if(map[id]){ ordered.push(map[id]); delete map[id]; } }); 
      Object.values(map).forEach(r=>ordered.push(r)); 
      console.log('getRoomOrderedList: using LOCAL order', key, ordered.length);
      return ordered; 
    }
    // Otherwise use Airtable SORT ORDER field
    const sorted = [...rooms].filter(r=>r&&r.fields).sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
    console.log('getRoomOrderedList: using AIRTABLE SORT ORDER', sorted.length, sorted.map(r=>r.fields['SORT ORDER']+'='+r.id.substring(0,6)).slice(0,7));
    return sorted;
  }catch(e){
    console.error('getRoomOrderedList error', e);
    return rooms||[];
  }
}
function saveRoomOrder(ids){ localStorage.setItem(getRoomOrderKey(), JSON.stringify(ids)); }

var draggedRoomId = window.draggedRoomId || null;
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
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    if(!base||!pat) throw new Error('Airtable config missing');
    // Try field names in order: CATATAN BILIK, CATATAN, NOTES, REMARK
    const fieldNames = ['CATATAN BILIK','CATATAN','NOTES','REMARK','Catatan Bilik','Catatan'];
    let lastError=null;
    for(let fieldName of fieldNames){
      try{
        const res=await fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{method:'PATCH',
          headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
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
function loadLocalCatatan(roomId){
  try{
    const key='effah_room_notes_'+roomId;
    return localStorage.getItem(key)||'';
  }catch(e){ return ''; }
}


document.addEventListener('dragover',e=>{ const g=document.getElementById('roomingGrid'); if(!g) return; const r=g.getBoundingClientRect(); if(e.clientY>r.bottom-100) g.scrollTop+=14; if(e.clientY<r.top+100) g.scrollTop-=14; });

