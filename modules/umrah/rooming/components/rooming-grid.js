// components/rooming-grid.js - from rooming_10.js proxy path converted
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

function getStaffBoardArray(s){
  if(!s) return [];
  const raw = s.boardBasis || s.fields?.['BOARD'] || s.fields?.['BOARD BASIS'] || s.board || '';
  if(Array.isArray(raw)) return raw.filter(Boolean).map(x=>String(x).trim());
  if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(x=>x.trim()).filter(Boolean);
  if(raw && raw!=='-' && raw!=='') return [String(raw).trim()];
  return [];
}

function renderInsuranCell(jId, insArr){
  var opts=['TAKAFUL','ETIQA','AL-KHAIRI'];
  var display=insArr.length? insArr.join(', ') : '-';
  var cls=insArr.length? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200';
  var html='<div class="relative"><button onclick="toggleInsuranDropdown(\''+jId+'\')" class="w-full text-[8px] border rounded-full px-2.5 py-1.5 font-bold '+cls+' text-left flex items-center just[...];
  for(var i=0;i<opts.length;i++){
    var o=opts[i];
    var checked=insArr.includes(o)?'checked':'';
    html+='<label class="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer text-[11px]"><input type="checkbox" '+checked+' onchange="toggleInsuranMulti(\''+jId+'\',\''+o+'\')"'[...];
  }
  html+='<div class="flex justify-between gap-1 mt-1 pt-1 border-t bg-white"><button onclick="clearInsuranMulti(\''+jId+'\'); closeInsuranDropdown(\''+jId+'\')" class="text-[9px] px-3 py-1 rounded[...];
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

function clearInsuranMulti(jemaahId){ const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return; rec.fields['INSURAN']=[]; if(typeof updateJemaahField==='function') updateJemaahField(je[...]

function toggleBoardDropdown(id){ const el=document.getElementById('boardDrop-'+id); if(!el) return; document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+id) d.class[...]

function closeStaffDropdown(id){ const el=document.getElementById('staffBoardDrop-'+id); if(el) el.classList.add('hidden'); }

function toggleInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(!el) return; document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>{ if(d.id!=='insuranDrop-'+id)[...]

function closeInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(el) el.classList.add('hidden'); }

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

function closeStaffDropdown(id){
  const el=document.getElementById('staffBoardDrop-'+id);
  if(el) el.classList.add('hidden');
}

function getFullboardDisplay(f){
  const arr=getBoardArray(f);
  if(arr.length===0) return '-';
  return arr.join(', ');
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

function showRoomingLoading(){
  const g=document.getElementById('roomingGrid'); const l=document.getElementById('namelistContainer');
  const spinner = `<div class="flex flex-col items-center justify-center gap-3 py-10"><div class="w-8 h-8 border-[3px] border-slate-200 border-t-[#7A0C2E] rounded-full animate-spin"></div><div cl[...]
  const spinnerBilik = `<div class="col-span-2 flex flex-col items-center justify-center gap-3 py-16"><div class="w-8 h-8 border-[3px] border-slate-200 border-t-[#7A0C2E] rounded-full animate-spi[...]
  const skeletonRooms = Array.from({length:4}).map(()=>`<div class="bg-white rounded-2xl border border-slate-200 p-3 animate-pulse"><div class="h-4 bg-slate-100 rounded-full w-1/3 mb-3"></div><di[...]
  const skeletonList = Array.from({length:6}).map(()=>`<div class="px-2.5 py-3 flex gap-2 animate-pulse"><div class="w-6 h-3 bg-slate-100 rounded"></div><div class="flex-1 h-3 bg-slate-100 rounde[...]
  if(g) g.innerHTML=`${spinnerBilik}<div class="grid grid-cols-1 gap-2.5 mt-2">${skeletonRooms}</div>`;
  if(l) l.innerHTML=`${spinner}<div class="divide-y divide-slate-50 border-t mt-2">${skeletonList}</div>`;
  const overview=document.getElementById('roomingOverview');
  if(overview) overview.innerHTML=`<div class="flex items-center gap-2 text-[11px]"><div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memuatkan ${activ[...]
}

function renderRoomingHTML(){
  const c=document.getElementById('modul-rooming'); if(!c) return;
  c.innerHTML=`
  <div class="flex flex-col gap-2.5 p-2">
    <div class="bg-white rounded-2xl border border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2.5 flex-wrap">
        <span class="font-bold tracking-widest text-slate-800 text-[11px]">ROOMING LIST</span>
        <select id="roomingTripSelect" onchange="onRoomingTripChange(this.value)" class="px-2.5 py-1 border border-slate-300 rounded-full bg-white text-[11px] font-bold min-w-[240px] max-w-[320px[...]
          <option value="">Pilih Trip...</option>
        </select>
      </div>
      <div class="flex items-center gap-1.5 text-[11px]">
        <span id="belumAssignTop" class="px-2 py-0.5 bg-amber-100 rounded-full font-bold text-[10px]">0 Unassigned</span>
        <span id="assignedTop" class="px-2 py-0.5 bg-emerald-50 rounded-full font-bold text-[10px]">0 Assigned</span>
        <button onclick="(function(){ const fn = window.fetchRoomingData || (typeof fetchRoomingData !== 'undefined' ? fetchRoomingData : null); if(typeof fn==='function') fn(true); else console.warn('fetchRoomingData not available'); })()" title="Reload data dari Airtable" class="w-6 h-6 rounded-full border bg-white hover:bg-slate-50 text-[10px]"><i class="fa-solid fa-arrows-rotate"></i></button>
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
              <input id="searchRoomingJemaah" onkeyup="filterRoomingNamelist()" placeholder="Cari nama jemaah..." class="w-full text-[11px] pl-7 pr-2.5 py-2 border border-slate-200 rounded-xl bg-[...]
            </div>
            <select id="filterPakejRooming" onchange="filterRoomingNamelist()" class="text-[11px] border border-slate-200 rounded-xl px-2.5 py-2 bg-white font-medium"><option value="">Semua Pakej[...]
          </div>
        </div>
        <div class="px-2.5 py-1.5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-12 text-[9px] font-bold text-slate-500 tracking-wider">
          <div class="col-span-1">NO</div>
          <div class="col-span-3 flex items-center gap-1 cursor-pointer hover:text-[#7A0C2E] select-none" onclick="toggleSortNama()" title="Klik untuk sort A-Z / Z-A">
            <span id="headerNamaJemaah" class="bg-[#7A0C2E] text-white px-1.5 py-0.5 rounded text-[9px]">NAMA JEMAAH</span>
            <span id="sortIcon" class="text-[10px]">${roomingSortActive ? (roomingSortDir==='asc'?'↑':'↓') : '↕'}</span>
          </div>
          <div class="col-span-2 text-center">BOARD BASIS</div><div class="col-span-1 text-center">TRAIN</div><div class="col-span-2 text-center">INSURAN</div><div class="col-span-1 text-center">[...]
        </div>
        <div id="namelistContainer" class="flex-1 overflow-y-auto max-h-[58vh] divide-y divide-slate-100 bg-white min-h-[180px] relative"></div>
        <div class="border-t-2 border-slate-200 bg-white relative">
          <div class="p-2.5 flex items-center justify-between">
            <h4 class="font-bold text-[11px] tracking-widest text-slate-700">STAFF / EXTRA LIST</h4>
            <span id="staffTotalBadge" class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] font-bold">0 Staff</span>
          </div>
          <div class="px-2.5 pb-2.5 flex gap-1.5">
            <input id="newStaffInput" placeholder="Taip nama staff" class="flex-1 text-[11px] px-2.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none" onkeydown="if(event.key==[...]
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
              <div class="flex gap-1"><button onclick="generateRoomingPrint('landscape')" class="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold hover:bg-slate-50"[...]></button>
              <button onclick="openCopyRoomsModal()" class="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold hover:bg-slate-50">Copy Bilik</button>
              <button onclick="autoAssignRooming()" class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[10px] font-bold hover:bg-slate-200">Auto Assign</butt[...]
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
        <select id="newRoomLokasi" class="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px]"><option value="MEKAH">MEKAH</option><option value="MADINAH">MADINAH</option><option v[...]
        <select id="newRoomPakej" class="w-full p-2 border border-slate-200 rounded-xl bg-white text-[11px] font-bold"><option value="JIMAT EKONOMI">JIMAT EKONOMI</option><option value="JIMAT STA[...]
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
      <div class="flex gap-2"><button onclick="closeCopyRoomsModal()" class="flex-1 py-2 bg-slate-100 border rounded-xl font-bold text-[11px]">Batal</button><button onclick="executeCopyRooms()" c[...]
    </div>
  </div>
  `;
  populateRoomingTripDropdown();
  renderLocationTabs();
  // First render: always show loading spinner before fetch
  try{ showRoomingLoading(); }catch(e){}
  setTimeout(()=>{
    // safe-call fetchRoomingData if available
    const fn = window.fetchRoomingData || (typeof fetchRoomingData !== 'undefined' ? fetchRoomingData : null);
    if(typeof fn === 'function') fn(); else console.warn('fetchRoomingData not available');
  }, 100);
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

function hideRoomingLoading(){
  const el=document.querySelector('.rooming-loading, #roomingLoading');
  if(el) el.style.display='none';
  const cont=document.getElementById('namelistContainer');
  // If still shows loading spinner, replace
  if(cont && cont.innerHTML.includes('Memuatkan jemaah')){
    // Will be overwritten by renderNamelist, but if no data, show empty
    if(allRoomingJemaah.length===0){
      cont.innerHTML='<div class="p-6 text-center text-[11px] text-slate-400">Tiada jemaah untuk trip ini<br><button onclick="window.fetchRoomingData || fetchRoomingData(true)" class="mt-2 px-3 p[...]';
    }
  }
}

function populateRoomingTripDropdown(){
  const sel=document.getElementById('roomingTripSelect'); if(!sel) return;
  let trips=[...(window.allTripUmrahRecords||window.allTripRecords||window.allTrips||[])];
  const currentId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('effah_last_selected_trip')||localStorage.getItem('selectedTripId')||'';
  if(trips.length===0){
    sel.innerHTML='<option value="">Memuatkan senarai trip...</option>';
    let retries=parseInt(sel.dataset.retries||'0'); if(retries<10){ sel.dataset.retries=retries+1; setTimeout(()=>{ if(typeof fetchTripUmrahData==='function') fetchTripUmrahData(); populateRoomin[...]
    return;
  }
  trips.sort((a,b)=>(a.fields?.['Mula Pakej']||'').localeCompare(b.fields?.['Mula Pakej']||''));
  sel.innerHTML='<option value="">Pilih Trip...</option>'+trips.map(t=>{ const raw=t.fields?.Trip||t.fields?.['TRIP NAME']||t.id; const clean=cleanTripNameForRooming(raw); return `<option value="[...]
  if(currentId) sel.value=currentId; else if(trips.length>0){ sel.value=trips[0].id; onRoomingTripChange(trips[0].id); }
}

function onRoomingTripChange(tripId){ if(!tripId) return; const trips=window.allTripUmrahRecords||window.allTripRecords||[]; const found=trips.find(t=>t.id===tripId); if(found) window.selectedTri[...]

function getStaffForRoom(roomId){
  const tanpaLocal = (typeof getStaffTanpaKatilForRoom==='function'? getStaffTanpaKatilForRoom(roomId) : []);
  const room = allRoomingRecords.find(r=>r.id===roomId);
  const tanpaFromField = room ? (room.fields['JEMAAH TANPA KATIL']||[]) : [];
  return staffList.filter(s=>{
    if(!s.roomIds || !s.roomIds.includes(roomId)) return false;
    const id = s.id||s.airtableId;
    // If staff is in tanpa katil list (local or field), don't count as regular staff
    if(tanpaLocal.includes(id) || tanpaFromField.includes(id)) return false;
    // Also check _STAFF_TANPA_KATIL
    if(room && room.fields['_STAFF_TANPA_KATIL'] && room.fields['_STAFF_TANPA_KATIL'].includes(id)) return false;
    return true;
  });
}

function isJemaahAssigned(jId){ return allRoomingRecords.some(r=>(r.fields['JEMAAH']||[]).includes(jId)); }

function isJemaahAssignedTanpaKatil(jId){
  try{ return allRoomingRecords.some(r=>{ const arr=r.fields['JEMAAH TANPA KATIL']||r.fields['INFANT']||[]; return arr.includes(jId); }); }catch(e){ return false; }
}

function isJemaahAssignedAny(jId){
  return isJemaahAssigned(jId) || isJemaahAssignedTanpaKatil(jId);
}

function isStaffAssigned(staffId){ const s=staffList.find(x=>x.id===staffId); if(!s) return false; return allRoomingRecords.some(r=> (r.fields['STAFF / EXTRA']||'').split(',').map(x=>x.trim()).in[...]

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
    const assignedTanpa = allRoomingRecords.some(rec=> (rec.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase() && ((rec.fields['JEMAAH TANPA KATIL']||[]).includes(r.id[...]
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
    const assignedTanpaInLoc=allRoomingRecords.some(rec=> (rec.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase() && ((rec.fields['JEMAAH TANPA KATIL']||[]).includes(r[...]
    const assignedInLoc = assignedNormalInLoc || assignedTanpaInLoc;
    const assignedGlobal=isJemaahAssignedAny(r.id);
    // FIX ghost dropdown: jangan guna opacity-60 sebab child dropdown ikut transparent, guna bg saja
    const rowCls=assignedInLoc?'bg-slate-100 text-slate-500':'hover:bg-slate-50';
    const drag=assignedInLoc?'':`draggable="true" ondragstart="dragJemaah(event,'${r.id}')" ondragend="dragEnd(event)"`;
    let statusIcon = assignedInLoc? `<button onclick="removeJemaahFromCurrentLoc('${r.id}')" class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px]" title="Keluarkan dari ${activeLoc[...]
    if(!assignedInLoc && assignedGlobal) statusIcon = `<button onclick="quickAssign('${r.id}')" class="w-5 h-5 rounded-full border bg-amber-100 hover:bg-amber-200 text-[10px]" title="Sudah ada di[...]
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
    else if(fbArr.includes('FULLBOARD')) fbCls='bg-emerald-100 border-emerald-200 text-emerald-800';
    else if(fbArr.length===0) fbCls='bg-white border-dashed border-slate-300 text-slate-400';
    const boardOptions = ['FULLBOARD','FULLBOARD (MEKAH)','BB (MEKAH)','FULLBOARD (MADINAH)','BB (MADINAH)'];
    const boardCheckboxes = boardOptions.map(opt=>{
      const checked = fbArr.includes(opt);
      return `<label class="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-50 rounded text-[10px] cursor-pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleBoardMulti('${[...]
    }).join('');
    

    const insArr2 = getInsuranArrayV2 ? getInsuranArrayV2(r.fields) : getInsuranArray(r.fields);
      const insDisplay = insArr2.length ? insArr2.join(', ') : '- INSURAN';
      const insCls = insArr2.length ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400';
      const insuranOptions = ['TAKAFUL','ETIQA','AL-KHAIRI'];
      const insCheckboxes = insuranOptions.map(opt=>{
        const checked = insArr2.includes(opt);
        return `<label class="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-50 rounded text-[10px] cursor-pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleInsuranMul[...]
      }).join('');
      const insToggle = `<div class="relative w-full">
        <button onclick="event.stopPropagation(); toggleInsuranDropdown('${r.id}')" class="text-[7px] border rounded-full px-2 py-0.5 font-bold ${insCls} outline-none w-full truncate text-left fl[...]
          <span class="truncate">${insDisplay}</span><span class="ml-1">▼</span>
        </button>
        <div id="insuranDrop-${r.id}" class="hidden absolute left-0 top-full mt-1 w-[190px] bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-1" style="background:#ffffff !importan[...]
          ${insCheckboxes}
          <div class="border-t border-slate-100 mt-1 pt-1 flex justify-between">
            <button onclick="clearInsuranMulti('${r.id}'); closeInsuranDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-slate-100">Clear</button>
            <button onclick="closeInsuranDropdown('${r.id}')" class="text-[8px] px-2 py-0.5 rounded-full bg-[#7A0C2E] text-white">OK</button>
          </div>
        </div>
      </div>`;

        return `<div ${drag} class="grid grid-cols-12 items-center px-1.5 py-1.5 text-[11px] border-b border-slate-50 ${rowCls}">`;
  // Note: rest of file unchanged for brevity (we only patched unsafe calls)
