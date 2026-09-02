// index.js V103.45 FINAL - auto inject template if empty
console.log('ROOMING INDEX V103.45 FINAL');
function ensureRoomingDOM(){
  if(document.getElementById('roomingGrid')) return true;
  const main = document.querySelector('[data-tab="rooming"]') || document.getElementById('roomingTab') || document.querySelector('main') || document.body;
  // If main is empty (white page), inject template
  if(main && main.innerHTML.trim().length < 200){
    main.innerHTML = `
  <div id="roomingModule" class="p-4">
    <div class="flex flex-wrap gap-3 mb-4 items-center">
      <select id="roomingTripSelect" onchange="onRoomingTripChange()" class="border rounded-full px-3 py-1.5 text-[12px]"></select>
      <div id="locationTabs" class="flex gap-2"></div>
      <button onclick="document.getElementById('newRoomModal')?.classList.remove('hidden')" class="ml-auto bg-[#7A0C2E] text-white px-4 py-1.5 rounded-full text-[11px] font-bold">+ Cipta Bilik</button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-slate-200 p-3">
          <div class="flex justify-between items-center mb-2"><span class="text-[11px] font-bold">SENARAI JEMAAH</span><span id="jemaahCountBadge" class="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full">0</span></div>
          <input id="searchNamelist" placeholder="Cari jemaah..." class="w-full text-[11px] border rounded-full px-3 py-1.5 mb-2" oninput="filterNamelist(this.value)">
          <div id="namelistContainer" class="max-h-[70vh] overflow-y-auto divide-y divide-slate-50"></div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-3 mt-3">
          <div class="flex justify-between items-center mb-2"><span class="text-[11px] font-bold">STAFF</span><span id="staffCountBadge" class="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full">0</span></div>
          <div id="staffListContainer" class="max-h-[30vh] overflow-y-auto"></div>
        </div>
      </div>
      <div class="lg:col-span-2">
        <div id="roomingGrid" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
        <div id="roomingLoading" class="hidden text-center py-10 text-[11px] text-slate-500">Memuatkan...</div>
      </div>
    </div>
  </div>`;
    return true;
  }
  return !!document.getElementById('roomingGrid');
}

document.addEventListener('DOMContentLoaded', async () => {
  setTimeout(()=>ensureRoomingDOM(), 300);
  if(typeof populateRoomingTripDropdown==='function'){ try{ await populateRoomingTripDropdown(); }catch(e){ console.error(e); } }
  const savedTrip = localStorage.getItem('effah_active_trip_id') || '';
  const sel = document.getElementById('roomingTripSelect');
  if(savedTrip && sel){ sel.value=savedTrip; window.selectedTripRecord={id:savedTrip}; if(typeof fetchRoomingData==='function') await fetchRoomingData(true); }
  setTimeout(async()=>{ 
    ensureRoomingDOM();
    if(typeof loadStaffList==='function' && (!staffList||staffList.length===0)) await loadStaffList(); 
    if(typeof updateVisaCountBadge==='function') updateVisaCountBadge();
    if(typeof renderRoomingGrid==='function') renderRoomingGrid();
    if(typeof renderLocationTabs==='function') renderLocationTabs();
  },800);
});

// Also hook when tab switched
const origSwitchTab = window.switchTab;
window.switchTab = function(tab){
  if(origSwitchTab) origSwitchTab(tab);
  if(tab==='rooming' || tab==='Rooming List'){
    setTimeout(()=>{
      ensureRoomingDOM();
      renderLocationTabs && renderLocationTabs();
      renderRoomingGrid && renderRoomingGrid();
      renderNamelist && renderNamelist();
    },200);
  }
}
