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

function clearInsuranMulti(jemaahId){ const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return; rec.fields['INSURAN']=[]; if(typeof updateJemaahField==='function') updateJemaahField(jemaahId, 'INSURAN', []); if(typeof renderNamelist==='function') renderNamelist(); }

function toggleBoardDropdown(id){ const el=document.getElementById('boardDrop-'+id); if(!el) return; document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }

function closeStaffDropdown(id){ const el=document.getElementById('staffBoardDrop-'+id); if(el) el.classList.add('hidden'); }

function toggleInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(!el) return; document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>{ if(d.id!=='insuranDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }

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
  const spinner = `<div class="flex flex-col items-center justify-center gap-3 py-10"><div class="w-8 h-8 border-[3px] border-slate-200 border-t-[#7A0C2E] rounded-full animate-spin"></div><div class="text-[11px] text-slate-600 font-medium">Memuatkan jemaah...</div></div>`;
  const spinnerBilik = `<div class="col-span-2 flex flex-col items-center justify-center gap-3 py-16"><div class="w-8 h-8 border-[3px] border-slate-200 border-t-[#7A0C2E] rounded-full animate-spin"></div><div class="text-[11px] text-slate-600 font-medium">Memuatkan bilik...</div></div>`;
  const skeletonRooms = Array.from({length:4}).map(()=>`<div class="bg-white rounded-2xl border border-slate-200 p-3 animate-pulse"><div class="h-4 bg-slate-100 rounded-full w-1/3 mb-3"></div><div class="h-3 bg-slate-100 rounded-full w-2/3 mb-4"></div><div class="space-y-2"><div class="h-9 bg-slate-50 rounded-xl"></div><div class="h-9 bg-slate-50 rounded-xl"></div><div class="h-9 bg-slate-100 rounded-xl border border-dashed"></div></div></div>`).join('');
  const skeletonList = Array.from({length:6}).map(()=>`<div class="px-2.5 py-3 flex gap-2 animate-pulse"><div class="w-6 h-3 bg-slate-100 rounded"></div><div class="flex-1 h-3 bg-slate-100 rounded-full"></div><div class="w-16 h-5 bg-slate-50 rounded-full"></div></div>`).join('');
  if(g) g.innerHTML=`${spinnerBilik}<div class="grid grid-cols-1 gap-2.5 mt-2">${skeletonRooms}</div>`;
  if(l) l.innerHTML=`${spinner}<div class="divide-y divide-slate-50 border-t mt-2">${skeletonList}</div>`;
  const overview=document.getElementById('roomingOverview');
  if(overview) overview.innerHTML=`<div class="flex items-center gap-2 text-[11px]"><div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memuatkan ${activeLocation}...</div>`;
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
      cont.innerHTML='<div class="p-6 text-center text-[11px] text-slate-400">Tiada jemaah untuk trip ini<br><button onclick="fetchRoomingData(true)" class="mt-2 px-3 py-1 bg-[#7A0C2E] text-white rounded-full text-[10px]">Retry Load</button></div>';
    }
  }
}

function populateRoomingTripDropdown(){
  const sel=document.getElementById('roomingTripSelect'); if(!sel) return;
  let trips=[...(window.allTripUmrahRecords||window.allTripRecords||window.allTrips||[])];
  const currentId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('effah_last_selected_trip')||localStorage.getItem('selectedTripId')||'';
  if(trips.length===0){
    sel.innerHTML='<option value="">Memuatkan senarai trip...</option>';
    let retries=parseInt(sel.dataset.retries||'0'); if(retries<10){ sel.dataset.retries=retries+1; setTimeout(()=>{ if(typeof fetchTripUmrahData==='function') fetchTripUmrahData(); populateRoomingTripDropdown(); }, 900); }
    return;
  }
  trips.sort((a,b)=>(a.fields?.['Mula Pakej']||'').localeCompare(b.fields?.['Mula Pakej']||''));
  sel.innerHTML='<option value="">Pilih Trip...</option>'+trips.map(t=>{ const raw=t.fields?.Trip||t.fields?.['TRIP NAME']||t.id; const clean=cleanTripNameForRooming(raw); return `<option value="${t.id}" ${t.id===currentId?'selected':''}>${clean}</option>`; }).join('');
  if(currentId) sel.value=currentId; else if(trips.length>0){ sel.value=trips[0].id; onRoomingTripChange(trips[0].id); }
}

function onRoomingTripChange(tripId){ if(!tripId) return; const trips=window.allTripUmrahRecords||window.allTripRecords||[]; const found=trips.find(t=>t.id===tripId); if(found) window.selectedTripRecord=found; localStorage.setItem('effah_active_trip_id',tripId); localStorage.setItem('selectedTripId',tripId); localStorage.setItem('effah_last_selected_trip',tripId); fetchRoomingData(true); }

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

function isStaffAssigned(staffId){ const s=staffList.find(x=>x.id===staffId); if(!s) return false; return allRoomingRecords.some(r=> (r.fields['STAFF / EXTRA']||'').split(',').map(x=>x.trim()).includes(s.name)); }

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
    else if(fbArr.includes('FULLBOARD')) fbCls='bg-emerald-100 border-emerald-200 text-emerald-800';
    else if(fbArr.length===0) fbCls='bg-white border-dashed border-slate-300 text-slate-400';
    const boardOptions = ['FULLBOARD','FULLBOARD (MEKAH)','BB (MEKAH)','FULLBOARD (MADINAH)','BB (MADINAH)'];
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

function getStaffTanpaKatilForRoom(roomId){
  try{
    const key='effah_staff_tanpa_'+roomId;
    return JSON.parse(localStorage.getItem(key)||'[]');
  }catch(e){ return []; }
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

function changeNewRoomCap(d){ const i=document.getElementById('newRoomCap'); let v=parseInt(i.value)||4; v=Math.max(1,Math.min(8,v+d)); i.value=v; updateNewRoomIdFromCap(); }

function openNewRoomModal(){ const m=document.getElementById('newRoomModal'); if(!m) return; m.classList.remove('hidden'); document.getElementById('newRoomLokasi').value=activeLocation; document.getElementById('newRoomCap').value=roomingDefaultCap; updateNewRoomIdFromCap(); }

function closeNewRoomModal(){ document.getElementById('newRoomModal').classList.add('hidden'); }

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

function generateRoomingPrint(orientation){ orientation = orientation || 'landscape';
  try{
    const tripDropdownText = document.getElementById('roomingTripSelect')?.selectedOptions?.[0]?.textContent || '';
    const tripNameRaw = window.selectedTripRecord?.fields?.['TRIP NAME'] || window.selectedTripRecord?.fields?.Trip || window.selectedTripRecord?.fields?.Name || tripDropdownText || localStorage.getItem('effah_active_trip_name') || localStorage.getItem('effah_last_selected_trip_name') || 'TRIP';
    const tripName = cleanTripNameForRooming(tripNameRaw) || tripNameRaw || 'TRIP';
    const allLocations = ['MEKAH','MADINAH','TAIF','JEDDAH',...customLocations];
    const tripId = window.selectedTripRecord?.id || localStorage.getItem('effah_active_trip_id') || '';
    
    // NAMELIST ROWS - keep existing logic but ensure board badge shows actual value
    let combinedStaff = [...staffList].sort((a,b)=>{ try{ const na=(getJemaahName(a.fields)||a.fields['NAMA']||'').toString().toUpperCase(); const nb=(getJemaahName(b.fields)||b.fields['NAMA']||'').toString().toUpperCase(); return na.localeCompare(nb); }catch(e){ return 0; } });
    // FIX SORT A-Z untuk print
    let sortedJemaahForPrint = [...allRoomingJemaah].sort((a,b)=>{ try{ const na=(getJemaahName(a.fields)||a.fields['NAMA JEMAAH']||a.fields['NAMA']||'').toString().toUpperCase(); const nb=(getJemaahName(b.fields)||b.fields['NAMA JEMAAH']||b.fields['NAMA']||'').toString().toUpperCase(); return na.localeCompare(nb); }catch(e){ return 0; } });
    let namelistRows = sortedJemaahForPrint.map((r,i)=>{
      const f=r.fields;
      const name=getJemaahName(f);
      const fbArr=getBoardArray(f);
      let fbBadge = '-';
      if(fbArr.length>0){
        fbBadge=fbArr.map(raw=>{
          const up=raw.toUpperCase();
          let bg='#BBF7D0', border='#065F46';
          if(up.includes('MEKAH')){ bg='#FDE68A'; border='#92400E'; }
          else if(up.includes('MADINAH')){ bg='#BFDBFE'; border='#1E40AF'; }
          else if(up.includes('FULLBOARD')){ bg='#BBF7D0'; border='#065F46'; }
          else if(up.includes('BB')){ bg='#FDE68A'; border='#92400E'; }
          return `<span style="background:${bg};border:1px solid ${border};padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;">${raw}</span>`;
        }).join('');
      }
      const train = isTrainChecked(f) ? '<span style="background:#FEF3C7;padding:1px 6px;border-radius:10px;font-size:8px">TRAIN</span>' : '-';
      const pakej = getPakejVal(f) || '-';
            const insArr = getInsuranArray(f);
      let insHtml = '-';
      if(insArr.length>0){
        insHtml=insArr.map(ins=>{
          const up=ins.toUpperCase();
          let bg='#BBF7D0', border='#065F46', color='#065F46';
          if(up==='TAKAFUL'){ bg='#BBF7D0'; border='#065F46'; color='#065F46'; }
          else if(up==='ETIQA'){ bg='#FEF3C7'; border='#92400E'; color='#92400E'; }
          else if(up.includes('KHAIRI')){ bg='#BFDBFE'; border='#1E40AF'; color='#1E40AF'; }
          return `<span style="background:${bg};border:1px solid ${border};color:${color};padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;">${ins}</span>`;
        }).join('');
      }
      
      return `<tr><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${i+1}</td><td style="border:1px solid #ddd;padding:3px 6px;font-weight:600">${name}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${fbBadge}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${train}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${pakej}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${insHtml}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${getVisaVal(f)||'-'}</td></tr>`;
    }).join('');
    // --- STAFF IN NAMELIST (S1, S2...) ---
    const allStaffForPrint = [];
    const staffMap = {};
    if(typeof staffList!=='undefined') staffList.forEach(s=>{ if(s.name && !allStaffForPrint.includes(s.name)){ allStaffForPrint.push(s.name); staffMap[s.name]=s; } });
    if(typeof allRoomingRecords!=='undefined') allRoomingRecords.forEach(r=>{ (r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).forEach(sn=>{ const c=sn.trim(); if(c && !allStaffForPrint.includes(c)){ allStaffForPrint.push(c); if(!staffMap[c]) staffMap[c]={name:c, board:'', train:false}; } }); });
    if(typeof combinedStaff!=='undefined') combinedStaff.forEach(n=>{ const c=(typeof n==='string'?n:n.name||'').trim(); if(c && !allStaffForPrint.includes(c)){ allStaffForPrint.push(c); staffMap[c]= (typeof n==='object'?n:{name:c}); } });
    allStaffForPrint.forEach((sName, sIdx)=>{ const sObj = staffMap[sName]||{name:sName}; const cleanName=sName.replace(/\(EFFAH\)/i,'').trim(); if(!cleanName) return; const sBoardRaw = sObj.boardBasis||sObj.fields?.['BOARD']||sObj.fields?.['BOARD BASIS']||sObj.board||''; 
      const sBoardArr = (typeof getStaffBoardArray==='function'? getStaffBoardArray(sObj) : (Array.isArray(sBoardRaw)? sBoardRaw : String(sBoardRaw).split(',').map(x=>x.trim()).filter(Boolean)));
      let sBoardBadge='-'; 
      if(sBoardArr.length>0){
        sBoardBadge=sBoardArr.map(raw=>{
          const up=raw.toUpperCase();
          let bg='#BBF7D0', border='#065F46';
          if(up.includes('MEKAH')){ bg='#FDE68A'; border='#92400E'; }
          else if(up.includes('MADINAH')){ bg='#BFDBFE'; border='#1E40AF'; }
          else if(up.includes('FULLBOARD')){ bg='#BBF7D0'; border='#065F46'; }
          else if(up.includes('BB')){ bg='#FDE68A'; border='#92400E'; }
          return `<span style="background:${bg};border:1px solid ${border};padding:1px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;">${raw}</span>`;
        }).join('');
      } const sTrain = sObj.train||sObj.fields?.TRAIN||false; const sTrainBadge = sTrain ? '<span style="background:#FEF3C7;padding:1px 6px;border-radius:10px;font-size:8px">TRAIN</span>' : '-'; namelistRows+=`<tr style="background:#FDF2F4"><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#F9D5D9;font-weight:bold;color:#7A0C2E">S${sIdx+1}</td><td style="border:1px solid #ddd;padding:3px 6px;font-weight:700;background:#FDF2F4;color:#7A0C2E">${cleanName} (EFFAH)</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4">${sBoardBadge}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4">${sTrainBadge}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4"><span style="color:#999">-</span></td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4"><span style="color:#999">-</span></td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4"><span style="color:#999">-</span></td></tr>`; });

    let locationPages = '';
    allLocations.forEach(loc=>{
      let rooms = allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===loc.toUpperCase());
      if(rooms.length===0) return;
      // Sort by SORT ORDER for print
      rooms = [...rooms].sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
      
      // FIXED LOGIC V11 - Filter by spec: MEKAH: FULLBOARD, FULLBOARD MEKAH, BB MEKAH / MADINAH: FULLBOARD, FULLBOARD MADINAH, BB MADINAH / TAIF: FULLBOARD only
      function normalizeBoard(b){
        if(!b) return '';
        const s = (Array.isArray(b)? b.join(', ') : String(b)).toUpperCase().trim();
        return s;
      }
      function isStaffBoardMatch(sObj, locUpper){
        try{
        if(!sObj) return false;
        const fbRawRaw = sObj.boardBasis||sObj.board||sObj.fields?.['BOARD']||sObj.fields?.['BOARD BASIS']||'';
        const up = normalizeBoard(fbRawRaw);
        if(!up || up==='-'||up==='NO BOARD'||up==='NO FULLBOARD') return false;
        const isFullboard = up.includes('FULLBOARD');
        const isBB = up.includes('BB');
        const hasMekah = up.includes('MEKAH');
        const hasMadinah = up.includes('MADINAH');
        const isExactFullboard = up==='FULLBOARD';
        
        if(locUpper==='MEKAH'){
          // MEKAH: FULLBOARD, FULLBOARD MEKAH, BB MEKAH - EXCLUDE MADINAH
          if(hasMadinah) return false; // FULLBOARD MADINAH or BB MADINAH not allowed in MEKAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMekah) return true; // FULLBOARD (MEKAH)
          if(isBB && hasMekah) return true; // BB (MEKAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain FULLBOARD
          return false;
        }
        if(locUpper==='MADINAH'){
          // MADINAH: FULLBOARD, FULLBOARD MADINAH, BB MADINAH - EXCLUDE MEKAH
          if(hasMekah) return false; // FULLBOARD MEKAH or BB MEKAH not allowed in MADINAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMadinah) return true; // FULLBOARD (MADINAH)
          if(isBB && hasMadinah) return true; // BB (MADINAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain FULLBOARD
          return false;
        }
        // TAIF AND OTHER: FULLBOARD SHJ
        if(isExactFullboard) return true;
        if(isFullboard && !hasMekah && !hasMadinah) return true;
        return false;
        }catch(e){ console.warn('isStaffBoardMatch error', e); return false; }
      }
      let fbListForLoc = [];
      function jHasBoardForLoc(r, locUp){
        if(!r || !r.fields) return false;

        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase().trim());
        if(arr.length===0) return false;
        const check = (x)=>{
          const hasMekah = x.includes('MEKAH');
          const hasMadinah = x.includes('MADINAH');
          const isFB = x.includes('FULLBOARD');
          const isBB = x.includes('BB');
          const exactFB = x==='FULLBOARD';
          if(locUp==='MEKAH'){
            if(hasMadinah) return false; // exclude MADINAH boards in MEKAH
            if(exactFB) return true;
            if(isFB && hasMekah) return true;
            if(isBB && hasMekah) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          } else if(locUp==='MADINAH'){
            if(hasMekah) return false; // exclude MEKAH boards in MADINAH
            if(exactFB) return true;
            if(isFB && hasMadinah) return true;
            if(isBB && hasMadinah) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          } else {
            // TAIF AND OTHER: FULLBOARD SHJ
            if(exactFB) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          }
        };
        return arr.some(check);
      }
      if(loc==='MEKAH'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'MEKAH'));
      } else if(loc==='MADINAH'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'MADINAH'));
      } else if(loc==='TAIF'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'TAIF'));
      } else {
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,loc));
      }
      // Add STAFF with FULLBOARD in this location
      const staffFB = staffList.filter(s=> isStaffBoardMatch(s, loc.toUpperCase()) && s.roomIds && s.roomIds.some(rid=> rooms.some(r=>r.id===rid)));
      // Convert staff to same shape as jemaah for grouping
      staffFB.forEach(s=>{ fbListForLoc.push({ id:s.id, fields:{'NAMA JEMAAH':s.name, 'BOARD': s.boardBasis||s.fields?.['BOARD']||s.board||'FULLBOARD', 'IS_STAFF':true, 'STAFF_OBJ':s}, _isStaff:true, boardBasis:s.boardBasis }); });

      // Staff linked to rooms in this location
      const staffInLoc = staffList.filter(s=> s.roomIds && s.roomIds.some(rid=> rooms.some(r=>r.id===rid)));
      
      // Build overview - FIXED BOARD count
      const sortedRoomsForPrintEarly = [...rooms].sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
      let overviewRows = '';
      // Group by hotel
      const hotels = {};
      rooms.forEach(r=>{
        const h=r.fields['HOTEL NAME']||'TANPA HOTEL';
        if(!hotels[h]) hotels[h]=[];
        hotels[h].push(r);
      });
      
      // For overview BOARD column: show breakdown
      let boardSummary = '';
      function hasBoard(r, target){
        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase());
        return arr.includes(target);
      }
      function hasBoardIncludes(r, inc){
        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase());
        return arr.some(x=>x.includes(inc));
      }
      if(loc==='MEKAH'){
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD')).length;
        const countFBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD (MEKAH)')).length;
        const countBBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MEKAH)')).length;
        boardSummary = `FULLBOARD: ${countFB}, FULLBOARD MEKAH: ${countFBMekah}, BB MEKAH: ${countBBMekah}`;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (FULLBOARD: ${countFB} + FULLBOARD (MEKAH): ${countFBMekah} + BB (MEKAH): ${countBBMekah})`;
        else boardSummary = '-';
      } else if(loc==='MADINAH'){
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD')).length;
        const countFBMad = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD (MADINAH)')).length;
        const countBBMad = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MADINAH)')).length;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (FULLBOARD: ${countFB} + FULLBOARD (MADINAH): ${countFBMad} + BB (MADINAH): ${countBBMad})`;
        else boardSummary = '-';
      } else if(loc==='TAIF'){
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} FULLBOARD` : '-';
      } else {
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} FULLBOARD` : '-';
      }
      
      Object.keys(hotels).forEach(hotelName=>{
        const hRooms = hotels[hotelName];
        const capCounts = {};
        hRooms.forEach(r=>{ const c=r.fields['KAPASITI']||4; capCounts[c]=(capCounts[c]||0)+1; });
        const bilikStr = Object.keys(capCounts).map(c=>`Bilik ber-${c} (${capCounts[c]})`).join(', ');
        // --- FIX: board basis per hotel, include staff ---
        const hJemaahIds = [];
        hRooms.forEach(r=>{ (r.fields['JEMAAH']||[]).forEach(id=>hJemaahIds.push(id)); });
        const hJemaahRecs = allRoomingJemaah.filter(j=> hJemaahIds.includes(j.id));
        function countBoardForHotel(fbFilter){
          let cnt=0;
          hJemaahRecs.forEach(j=>{ const fb=(getFullboardVal(j.fields)||'').toUpperCase().trim(); if(fbFilter(fb)) cnt++; });
          // staff in this hotel
          const staffInHotel = staffList.filter(s=> s.roomIds && s.roomIds.some(rid=> hRooms.some(hr=>hr.id===rid)));
          staffInHotel.forEach(s=>{
            const fbRawRaw=s.boardBasis||s.fields?.['BOARD']||s.board||''; const fbRaw=(Array.isArray(fbRawRaw)? fbRawRaw.join(', ') : fbRawRaw).toString().toUpperCase().trim();
            if(fbFilter(fbRaw)) cnt++;
          });
          return cnt;
        }
        let boardSummaryHotel='';
        if(loc==='MEKAH'){
          const cFB = countBoardForHotel(fb=>fb==='FULLBOARD');
          const cFBM = countBoardForHotel(fb=>fb==='FULLBOARD (MEKAH)');
          const cBBM = countBoardForHotel(fb=>fb==='BB (MEKAH)' || (fb.includes('MEKAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBM + cBBM;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (FULLBOARD: ${cFB} + FULLBOARD (MEKAH): ${cFBM} + BB (MEKAH): ${cBBM})`;
          else boardSummaryHotel='-';
        } else if(loc==='MADINAH'){
          const cFB = countBoardForHotel(fb=>fb==='FULLBOARD');
          const cFBMad = countBoardForHotel(fb=>fb==='FULLBOARD (MADINAH)');
          const cBBMad = countBoardForHotel(fb=>fb==='BB (MADINAH)' || (fb.includes('MADINAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBMad + cBBMad;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (FULLBOARD: ${cFB} + FULLBOARD (MADINAH): ${cFBMad} + BB (MADINAH): ${cBBMad})`;
          else boardSummaryHotel='-';
        } else {
          const cFB = countBoardForHotel(fb=>fb==='FULLBOARD');
          boardSummaryHotel = cFB>0 ? `${cFB} FULLBOARD` : '-';
        }
        overviewRows += `<tr><td style="border:1px solid #ddd;padding:4px 6px;font-weight:bold">${hotelName}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${bilikStr}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${boardSummaryHotel}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${hRooms.length} bilik</td></tr>`;
      });
      
      let overviewProfessionalHTML = `<table style="width:100%;border-collapse:collapse;font-size:9px"><tr style="background:#f8f8f8;font-weight:bold"><th style="border:1px solid #ddd;padding:4px 6px;text-align:left">HOTEL</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">BILIK</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">BOARD BASIS</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">JUMLAH</th></tr>${overviewRows}</table>`;
      
      const totalJemaahLoc = rooms.reduce((sum,r)=> sum + (r.fields['JEMAAH']||[]).length, 0);
      const totalBabyLoc = rooms.reduce((sum,r)=> sum + (r.fields['JEMAAH TANPA KATIL']||[]).length, 0);
      const totalStaffLoc = rooms.reduce((sum,r)=> sum + getStaffForRoom(r.id).length, 0);
      const fbTotalLoc = fbListForLoc.length;

      // Room blocks - smaller for portrait
      const isPortrait = orientation==='portrait';
      // Ensure rooms sorted by SORT ORDER for print
      const sortedRoomsForPrint = sortedRoomsForPrintEarly;
      const roomBlocks = sortedRoomsForPrint.map((rec, idx)=>{
        const f=rec.fields;
        const roomName = f['Room ID / Nama Bilik'] || f['ROOM ID'] || `B${f['KAPASITI']||4}-${idx+1}`;
        const pakej = f['PAKEJ / HOTEL']||'';
        const hotel = f['HOTEL NAME']||'';
        const cap = f['KAPASITI']||4;
        const jIds = f['JEMAAH']||[];
        const babyIdsRaw = f['JEMAAH TANPA KATIL']||[];
        const staffTanpaLocal = (typeof getStaffTanpaKatilForRoom==='function'? getStaffTanpaKatilForRoom(rec.id) : (f['_STAFF_TANPA_KATIL']||[]));
        const babyIds = [...new Set([...babyIdsRaw, ...staffTanpaLocal])];
        const staffForRoom = getStaffForRoom(rec.id);
        
        let jemaahHtml = jIds.map((jid, jIdx)=>{
          const jRec = allRoomingJemaah.find(r=>r.id===jid);
          const name = jRec ? getJemaahName(jRec.fields) : jid;
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #ddd">${jIdx+1}. ${name}</div>`;
        }).join('');
        
        // FIX V93: Separate jemaah infant (NA) and staff tanpa katil (S numbering)
        const babyJemaahIds = [];
        const babyStaffIds = [];
        babyIds.forEach(bId=>{
          const isStaff = staffList.some(s=>s.id===bId||s.airtableId===bId) || (typeof getStaffById==='function' && getStaffById(bId));
          if(isStaff) babyStaffIds.push(bId);
          else babyJemaahIds.push(bId);
        });
        let babyHtml = babyJemaahIds.length ? babyJemaahIds.map((jid, jIdx)=>{
          const jRec = allRoomingJemaah.find(r=>r.id===jid);
          const name = jRec ? getJemaahName(jRec.fields) : (typeof getNameForAnyId==='function'? getNameForAnyId(jid) : jid);
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #92400E;color:#92400E;background:#FEF3C7;font-weight:600">NA. ${name} (Tanpa Katil)</div>`;
        }).join('') : '';
        // Staff tanpa katil will be appended to staffHtml as S numbering
        const staffTanpaIdsForPrint = babyStaffIds;

        
        let staffHtml = staffForRoom.length ? staffForRoom.map((s, sIdx)=>{
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #ddd;color:#7A0C2E;background:#FDF2F4">S${sIdx+1}. ${s.name.replace(/\(EFFAH\)/i,'').trim()} (EFFAH)</div>`;
        }).join('') : '';
        let staffTanpaHtml = staffTanpaIdsForPrint.length ? staffTanpaIdsForPrint.map((sid, stIdx)=>{
          const sRec = staffList.find(s=>s.id===sid||s.airtableId===sid) || (typeof getStaffById==='function'? getStaffById(sid) : null);
          const sName = sRec ? sRec.name : (typeof getNameForAnyId==='function'? getNameForAnyId(sid) : sid);
          const sNum = staffForRoom.length + stIdx + 1;
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #e8a838;background:#fffbe6;color:#92400E;font-weight:600">S${sNum}. ${sName.replace(/\(EFFAH\)/i,'').trim()} (Tanpa Katil)</div>`;
        }).join('') : '';
        // Combine staff regular + staff tanpa katil for display count
        const combinedStaffHtml = staffHtml + staffTanpaHtml;

        
        const catatanBilik = (f['CATATAN BILIK'] || f['CATATAN'] || '').trim();
        const catatanPrint = catatanBilik ? ` (${catatanBilik})` : '';
        return `<div style="border:1px solid #000;margin-bottom:${isPortrait ? '4px' : '6px'};background:#fff;break-inside:avoid" data-room-card="${rec.id}" ondragover="allowDropRoom(event)" ondragleave="leaveDropRoom(event)" ondrop="dropRoom(event,'${rec.id}')">
          <div draggable="true" ondragstart="dragRoom(event,'${rec.id}')" ondragend="dragRoomEnd(event)" style="background:#fff;border-bottom:1px solid #000;padding:${isPortrait ? '2px 4px' : '3px 6px'};display:flex;justify-content:space-between;align-items:center;cursor:grab" title="Drag untuk susun bilik">
            <span style="font-weight:bold;font-size:${isPortrait ? '8px' : '9px'}">${idx+1}. ${roomName} ${pakej ? '('+pakej+')' : ''} ${hotel ? '- '+hotel : ''}${catatanPrint}</span>
            <span style="font-size:${isPortrait ? '7px' : '8px'};font-weight:bold">${jIds.length + staffForRoom.length}/${cap}</span>
          </div>
          <div style="padding:${isPortrait ? '3px 4px' : '4px 6px'}">
            ${jemaahHtml}
            ${babyHtml}
            ${combinedStaffHtml}
          </div>
        </div>`;
      }).join('');

      // FB Table with actual board basis badges
      let fbTableHTML = '';
      if(fbListForLoc.length>0){
        // Group by hotel for FB list - with room number
        const roomNumberMap = {};
        sortedRoomsForPrintEarly.forEach((r, idx)=>{ roomNumberMap[r.id]=idx+1; });
        rooms.forEach((r, idx)=>{ if(!roomNumberMap[r.id]) roomNumberMap[r.id]=idx+1; });
        const grouped = {};
        fbListForLoc.forEach(jRec=>{
          let room=null;
          if(jRec._isStaff){
            const sObj=jRec.fields.STAFF_OBJ;
            room = rooms.find(r=> sObj.roomIds && sObj.roomIds.includes(r.id));
          } else {
            room = rooms.find(r=> (r.fields['JEMAAH']||[]).includes(jRec.id));
          }
          const hotel = room ? (room.fields['HOTEL NAME']||'TANPA HOTEL') : 'TANPA BILIK';
          const roomNo = room ? (roomNumberMap[room.id]||'-') : '-';
          const roomName = room ? (room.fields['Room ID / Nama Bilik']||room.fields['ROOM ID']||'B?') : '-';
          if(!grouped[hotel]) grouped[hotel]=[];
          grouped[hotel].push({rec:jRec, room:roomNo, roomLabel:roomName});
        });
        
        const fbJemaahCount = fbListForLoc.filter(x=>!x._isStaff).length;
        const fbStaffCount = fbListForLoc.filter(x=>x._isStaff).length;
        const fbBadgeText = fbStaffCount>0 ? `${fbJemaahCount} Jemaah + ${fbStaffCount} Staff` : `${fbJemaahCount} Jemaah`;
        fbTableHTML = `
          <div style="margin-top:10px;border:1px solid #000">
            <div style="background:#064E3B;color:#fff;padding:4px 8px;font-weight:bold;font-size:9px;display:flex;justify-content:space-between">
              <span>${loc} - SENARAI PAKEJ MAKAN</span>
              <span style="background:#fff;color:#065F46;padding:1px 6px;border-radius:10px;font-size:9px">${fbBadgeText}</span>
            </div>
            ${Object.keys(grouped).sort().map(hotelName=>{
              const allItems = grouped[hotelName];
              const jemaahOnly = allItems.filter(x=>!x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
              const staffOnly = allItems.filter(x=>x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
              const sortedItems = [...jemaahOnly, ...staffOnly];
              const totalPax = allItems.length;
              return '<div style="border-bottom:1px solid #000"><div style="background:#f0fdf4;padding:3px 8px;font-weight:bold;font-size:9px;border-bottom:1px solid #ddd">'+hotelName+' ('+totalPax+' pax)</div><table style="width:100%;border-collapse:collapse;font-size:9px"><tr style="background:#f8f8f8;font-weight:bold"><th style="border:1px solid #ddd;padding:3px 6px;width:30px">NO</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:left">NAMA JEMAAH</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:center">BOARD BASIS</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:center">BILIK</th></tr>'+ sortedItems.map((item,i)=>{
                    const isStaffRow = item.rec._isStaff;
                    let rawStaffName = (item.rec.fields['NAMA JEMAAH']||'');
                    rawStaffName = rawStaffName.replace(/\s*\(EFFAH\)\s*/gi,'').trim();
                    rawStaffName = rawStaffName.replace(/\(EFFAH\)/i,'').trim();
                    const displayName = isStaffRow ? rawStaffName + ' (EFFAH)' : getJemaahName(item.rec.fields);
                    const fbRaw = isStaffRow ? (item.rec.fields['BOARD']||'FULLBOARD') : (getFullboardVal(item.rec.fields)||'');
                    const up=(Array.isArray(fbRaw)? (fbRaw[0]||'') : (fbRaw||'')).toString().toUpperCase();
                    let badge='';
                    if(up.includes('MEKAH')) badge='<span style="background:#FDE68A;border:1px solid #92400E;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    else if(up.includes('MADINAH')) badge='<span style="background:#BFDBFE;border:1px solid #1E40AF;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    else badge='<span style="background:#BBF7D0;border:1px solid #065F46;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    let rowNo='';
                    if(isStaffRow){
                      const staffSorted = grouped[hotelName].filter(x=>x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
                      const pos = staffSorted.findIndex(x=>x.rec.id===item.rec.id);
                      rowNo = 'S'+(pos+1);
                    } else {
                      rowNo = ''+(i+1);
                    }
                    const rowStyle = isStaffRow ? ' style="background:#FDF2F4"' : '';
                    const cellStyle = isStaffRow ? 'background:#F9D5D9;font-weight:bold;color:#7A0C2E' : '';
                    const nameStyle = isStaffRow ? 'color:#7A0C2E' : '';
                    return '<tr'+rowStyle+'><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;'+cellStyle+'">'+rowNo+'</td><td style="border:1px solid #ddd;padding:3px 6px;font-weight:600;'+nameStyle+'">'+displayName+'</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">'+badge+'</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;font-size:8px">'+item.room+'</td></tr>';
                  }).join('') + '</table></div>';
            }).join('')}
          </div>
        `;
      } else {
        fbTableHTML = `<div style="margin-top:12px;border:1px dashed #000;padding:8px;text-align:center;font-size:9px;color:#666">Tiada jemaah Pakej Makan di ${loc} (Kriteria: ${loc==='TAIF' ? 'FULLBOARD sahaja' : loc+' = FULLBOARD + FULLBOARD ('+loc+') + BB ('+loc+')'})</div>`;
      }

      locationPages+=`<div style="page-break-before:always">
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:13px;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px">
          <span>ROOMING LIST ${tripName} - ${loc} (${rooms.length} BILIK)</span>
        </div>
        <div style="margin-bottom:10px;border:1px solid #000;padding:0;background:#fff">
          <div style="background:#7A0C2E;color:#fff;padding:4px 8px;font-weight:bold;font-size:10px">${loc} OVERVIEW - ${rooms.length} Bilik</div>
          ${overviewProfessionalHTML}
          <div style="background:#f5f5f5;padding:5px 8px;font-size:9px;border-top:1px solid #000;display:flex;justify-content:space-between">
            <span><b>Total:</b> ${rooms.length} bilik</span>
            <span>${totalJemaahLoc+totalBabyLoc} jemaah + ${totalStaffLoc} staff</span>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:${orientation==='portrait' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'}; gap:${orientation==='portrait' ? '6px' : '8px'}; align-items:start">${roomBlocks}</div>
        ${fbTableHTML}
      </div>`;
    });

        // TRIP OVERVIEW - FIXED V103.28 - use combinedStaff and s.train
    const _staffList = (typeof combinedStaff !== 'undefined' && combinedStaff.length ? combinedStaff : (typeof staffList !== 'undefined' ? staffList : []));
    const totalStaffCount = _staffList.length;
    const totalJemaahOnly = allRoomingJemaah.length;
    const visaCounts = {};
    allRoomingJemaah.forEach(j=>{
      const v=(j.fields['STATUS VISA']||j.fields['VISA']||'').toString().trim().toUpperCase();
      if(v && v!=='-' && v!=='- VISA'){ visaCounts[v]=(visaCounts[v]||0)+1; }
    });
    let visaHtml = `
      <span style="display:inline-block;margin-right:12px;"><b>TOURIST:</b> ${visaCounts['TOURIST']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>TOURIST VALID:</b> ${visaCounts['TOURIST (VALID)']||visaCounts['TOURIST VALID']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>UMRAH:</b> ${visaCounts['UMRAH']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>UMRAH (VALID):</b> ${visaCounts['UMRAH (VALID)']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>IQAMA (VALID):</b> ${visaCounts['IQAMA (VALID)']||0}</span>
    `;
    const _trainJemaahCount = allRoomingJemaah.filter(j=>{ try{ return typeof isTrainChecked==='function' ? isTrainChecked(j.fields) : !!j.fields['TRAIN']; }catch(e){return !!j.fields['TRAIN'];}}).length;
    const _trainStaffCount = _staffList.filter(s=>{ 
      try{ 
        // staff TRAIN can be in s.train, s.fields.TRAIN, s.fields['TRAIN STAFF']
        const f=s.fields||{};
        return !!(s.train || f['TRAIN'] || f['SPEEDTRAIN'] || f['TRAIN STAFF'] || s['TRAIN']);
      }catch(e){return false;}
    }).length;
    const _totalTrainWithStaff = _trainJemaahCount + _trainStaffCount;
    const _insJ = allRoomingJemaah.filter(j=>{ try{return getInsuranArray(j.fields).length>0;}catch(e){return false;}}).length;
    const _insS = _staffList.filter(s=>{ try{const f=s.fields||{}; return (f['INSURAN'] && f['INSURAN'].length>0) || (typeof getInsuranArray==='function' && getInsuranArray(f).length>0) || !!s.insuran; }catch(e){return false;}}).length;
    const _totalInsuranUnique = _insJ + _insS;
    const namelistOverviewHTML = '<div style="margin-top:12px;border:1px solid #000;padding:8px 10px;background:#f9fafb"><div style="font-weight:bold;font-size:10px;margin-bottom:6px">TRIP OVERVIEW</div><div style="display:flex;flex-wrap:wrap;gap:20px;font-size:9px"><div><b>Bilangan Speedtrain:</b> ' + _totalTrainWithStaff + ' orang (Jemaah: ' + _trainJemaahCount + ' + Staff: ' + _trainStaffCount + ')</div><div><b>Bilangan Insuran:</b> ' + _totalInsuranUnique + ' orang</div><div><b>Visa:</b> ' + visaHtml + '</div><div><b>Total Jemaah:</b> ' + totalJemaahOnly + '</div><div><b>Total Staff:</b> ' + totalStaffCount + '</div></div></div>';

    const html=`<html><head><title>Rooming ${tripName} - ${orientation}</title><style>body{font-family:Arial,Helvetica,sans-serif;font-size:10px;margin:12px;color:#000}table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:4px 6px;font-size:9px}th{background:#7A0C2E;color:#fff;font-weight:bold;text-transform:uppercase}.header{display:flex;justify-content:space-between;font-weight:bold;font-size:12px;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px}.page-break{page-break-before:always}.namelist-page{max-width:900px;margin:0 auto}.location-page{max-width:100%}@media print{@page{size:A4 ${orientation};margin:${orientation==='portrait' ? '8mm' : '10mm'}}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page-break{page-break-before:always}}</style></head><body>
      <div class="namelist-page"><div class="header"><span>NAMELIST ${tripName}</span><span>Total: ${allRoomingJemaah.length} Jemaah + ${combinedStaff.length} Staff</span></div><div style="font-size:9px;margin-bottom:8px"><b>Trip:</b> ${tripName} | <b>Tarikh Cetak:</b> ${new Date().toLocaleDateString('ms-MY')} | <b>Orientasi:</b> ${orientation.toUpperCase()}</div><table style="table-layout:fixed"><colgroup><col style="width:28px"><col style="width:34%"><col style="width:85px"><col style="width:40px"><col style="width:55px"><col style="width:60px"><col style="width:65px"></colgroup><tr><th>NO</th><th style="text-align:left">NAMA JEMAAH</th><th>BOARD</th><th>TRAIN</th><th>PAKEJ</th><th>INSURAN</th><th>VISA</th></tr>${namelistRows}</table>${namelistOverviewHTML}</div>
      ${locationPages||'<div style="page-break-before:always"><div style="border:1px dashed #000;padding:20px;text-align:center">Tiada bilik untuk trip ini</div></div>'}
      <script>window.onload=function(){setTimeout(()=>window.print(),600)}; window.onafterprint=function(){window.close();}; setTimeout(()=>{try{window.close();}catch(e){}},3500);<\/script>
    </body></html>`;
    const w=window.open('','_blank');
    if(!w){ alert('Popup blocked! Sila allow popup untuk print.'); return; }
    w.document.write(html);
    w.document.close();
  }catch(e){
    console.error(e);
    alert('Gagal generate print: '+e.message);
  }
}

async function autoAssignRooming(){ if(!confirm('Adakah anda pasti ingin menetapkan semua jemaah yang belum ditetapkan untuk lokasi '+activeLocation+' secara automatik?')) return; let rooms=[...allRoomingRecords].filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase()); if(rooms.length===0) rooms=[...allRoomingRecords]; rooms=getRoomOrderedList(rooms); const unassigned=allRoomingJemaah.filter(j=>!isJemaahAssignedInLocation(j.id, activeLocation)); let idx=0; for(let room of rooms){ const cap=room.fields['KAPASITI']||roomingDefaultCap; const staffCount=(room.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length; let cur=[...(room.fields['JEMAAH']||[])]; while((cur.length+staffCount)<cap && idx<unassigned.length){ cur.push(unassigned[idx].id); idx++; } if(cur.length!==(room.fields['JEMAAH']||[]).length){ await updateRoomField(room.id,'JEMAAH',cur,false); } } setTimeout(fetchRoomingData,800); }

function findRoomingContainers(){
  const selectors={namelist:['#namelistContainer','#namelist-container','[data-testid="namelist"]','.namelist-container','#jemaahList','#jemaahListContainer'],grid:['#roomingGrid','#roomingGridContainer','#rooming-grid','.rooming-grid','#bilikGrid','#roomingListGrid']};
  let namelist=null,grid=null;
  for(let sel of selectors.namelist){ const el=document.querySelector(sel); if(el){ namelist=el; break; } }
  for(let sel of selectors.grid){ const el=document.querySelector(sel); if(el){ grid=el; break; } }
  return {namelist,grid};
}

function createMissingRoomingStructure(){
  const modul=document.getElementById('modul-rooming');
  if(!modul) return false;
  const hasNamelist=modul.querySelector('#namelistContainer');
  const hasGrid=modul.querySelector('#roomingGrid')||modul.querySelector('#roomingGridContainer');
  if(!hasNamelist || !hasGrid || modul.innerHTML.trim().length<100){
    console.log('V80 creating missing rooming structure, modul innerLen', modul.innerHTML.length);
    const existingHTML=modul.innerHTML;
    modul.innerHTML=`
      <div id="roomingHeader" class="p-4 border-b bg-white">
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-bold">Rooming List - V80 Auto-Created (Full Base)</h2>
          <div class="flex gap-2">
            <select id="roomingTripSelect" class="text-[11px] border rounded px-2 py-1"></select>
            <button onclick="fetchRoomingData(true)" class="text-[11px] bg-[#7A0C2E] text-white px-3 py-1 rounded-full">Reload</button>
          </div>
        </div>
        <div id="locationTabs" class="flex gap-2 mt-3"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl border">
            <div class="p-3 border-b flex justify-between items-center">
              <span class="text-[11px] font-bold">NAMELIST JEMAAH</span>
              <span id="topUnassignedBadge" class="text-[9px] bg-amber-100 px-2 py-0.5 rounded-full">0</span>
            </div>
            <div class="p-2"><input id="searchNamelist" placeholder="Cari jemaah..." class="w-full text-[11px] border rounded-full px-3 py-1.5 mb-2" oninput="renderNamelist()"></div>
            <div id="namelistContainer" class="max-h-[60vh] overflow-y-auto"><div class="p-6 text-center text-[11px] text-slate-400">Memuatkan jemaah...</div></div>
          </div>
          <div class="bg-white rounded-xl border mt-4">
            <div class="p-3 border-b flex justify-between"><span class="text-[11px] font-bold">STAFF / EXTRA</span><span id="staffTotalBadge" class="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full">0</span></div>
            <div class="p-2"><input id="searchStaff" placeholder="Cari staff..." class="w-full text-[11px] border rounded-full px-3 py-1.5 mb-2" oninput="renderStaffList()"></div>
            <div id="staffListContainer" class="max-h-[30vh] overflow-y-auto"></div>
          </div>
        </div>
        <div class="lg:col-span-2"><div id="roomingGrid" class="grid gap-3"></div><div id="roomingGridContainer" class="hidden"></div></div>
      </div>
      <div id="v80-existing" style="display:none;">${existingHTML}</div>
    `;
    setTimeout(()=>{ if(typeof populateRoomingTripDropdown==='function') populateRoomingTripDropdown(); if(typeof fetchRoomingData==='function') fetchRoomingData(); }, 500);
    return true;
  }
  return false;
}

async function _patchStaffRoomIdsQueued(staffId, roomIds){
  if(!window._staffPatchQueue[staffId]) window._staffPatchQueue[staffId] = [];
  return new Promise((resolve, reject)=>{
    window._staffPatchQueue[staffId].push({roomIds, resolve, reject});
    _processStaffQueue(staffId);
  });
}

function isStaffAssignedAny(staffId){ for(const loc of ['MEKAH','MADINAH','TAIF','JEDDAH','MUMTAZ']){ if(isStaffAssignedInLocation(staffId, loc)) return true; } return false; }

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