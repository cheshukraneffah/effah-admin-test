// V17 FINAL - FIX hijri tabs above searchbar - 2026-05-13 - FIX: Hijri Season field added (1448H/1449H/1450H only), FILTER tabs above searchbar, FILTER not FILTER LANJUTAN
// Check this comment exists on live site to confirm deployment
// Variable Global Simpan Data & Options
let allTripUmrahRecords = [];
let selectedTripRecord = null;
let currentTripJemaahList = [];
let tripJemaahSortField = 'NAME';
let tripJemaahSortDir = 'asc';

let selectOptions = {
    hijri: ['1448H','1449H','1450H'],
    group: ['GROUP A', 'GROUP B'],
    sektor: ['KUL-JED/JED-KUL', 'KUL-JED/MED-KUL', 'KUL-MED/JED-KUL', 'KUL-MED/MED-KUL', 'KUL-TIF/MED-JED'],
    penerbangan: ['OMAN AIR', 'EMIRATES', 'QATAR AIRWAYS', 'SAUDIA'],
    musim: ['LOW SEASON', 'MID SEASON', 'HIGH SEASON'],
    tempoh: ['11H 9M', '12H 10M', '9H 7M', '13H 10M', '17H 15M', '10H 7M']
};

document.addEventListener('DOMContentLoaded', () => {
    renderTripUmrahHTML();
});

function renderTripUmrahHTML() {
    const container = document.getElementById('modul-pakej-umrah');
    if (!container) return;
    container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
            <div class="w-full lg:w-80 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col flex-shrink-0">
                <div class="mb-3">
                    <div id="hijriFilterTabs" class="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide"></div>
                    <div class="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-bold text-slate-500 tracking-widest">FILTER</span>
                            <button onclick="clearAdvancedFilters()" class="text-[10px] text-slate-400 hover:text-slate-700 font-bold">Reset</button>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <select id="filterMonth" onchange="setAdvancedFilter('month', this.value)" class="text-[11px] p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
                                <option value="All">Bulan: Semua</option>
                            </select>
                            <select id="filterAirline" onchange="setAdvancedFilter('airline', this.value)" class="text-[11px] p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
                                <option value="All">Airline: Semua</option>
                            </select>
                            <select id="filterTempoh" onchange="setAdvancedFilter('tempoh', this.value)" class="text-[11px] p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
                                <option value="All">Tempoh: Semua</option>
                            </select>
                            <select id="filterMusim" onchange="setAdvancedFilter('musim', this.value)" class="text-[11px] p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
                                <option value="All">Musim: Semua</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2 mb-4">
                    <div class="relative flex-1">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
                        <input type="text" id="searchTripSidebar" onkeyup="filterTripSidebar()" placeholder="Search trip..." 
                            class="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
                    </div>
                    <button onclick="openNewTripModal()" class="bg-slate-900 text-white w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black transition text-xs shadow-2xs" title="Tambah Trip">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <button onclick="fetchTripUmrahData()" class="bg-slate-100 text-slate-600 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-200 transition text-xs" title="Refresh">
                        <i class="fa-solid fa-rotate"></i>
                    </button>
                </div>
                <div id="tripSidebarContainer" class="space-y-1 overflow-y-auto flex-1 max-h-[60vh] pr-1">
                    <div class="text-center py-10 text-slate-400 text-xs">Sila klik 'Refresh' untuk muat turun trip...</div>
                </div>
            </div>
            <div class="flex-1 flex flex-col space-y-6 overflow-x-hidden" id="tripMainDetailWorkspace">
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-12 text-center text-slate-400 my-auto">
                    <i class="fa-solid fa-kaaba text-5xl mb-3 text-slate-200"></i>
                    <p class="text-xs font-semibold">Sila pilih mana-mana trip di senarai belah kiri untuk melihat perincian & data jemaah.</p>
                </div>
            </div>
        </div>
        <div id="newTripModal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-slate-100">
                <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                    <div class="flex items-center space-x-2.5">
                        <div class="w-9 h-9 bg-rose-50 text-brand-maroon rounded-xl flex items-center justify-center font-bold text-sm">
                            <i class="fa-solid fa-calendar-plus"></i>
                        </div>
                        <h3 class="font-extrabold text-slate-900 text-base">Tambah Trip Umrah Baru</h3>
                    </div>
                    <button onclick="closeNewTripModal()" class="text-slate-400 hover:text-slate-700 p-1"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                <form onsubmit="submitNewTripRecord(event)" class="space-y-4 text-xs font-medium text-slate-700">
                    <div><label class="block font-bold text-slate-800 mb-1.5">Tarikh Mula Pakej (Fly) *</label><input type="date" id="modalMulaPakej" onchange="handleMulaDateChange()" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-400 focus:outline-none font-semibold text-slate-800"></div>
                    <div><label class="block font-bold text-slate-800 mb-1.5">Tarikh Tamat Pakej (Balik) *</label><input type="date" id="modalTamatPakej" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-400 focus:outline-none font-semibold text-slate-800"></div>
                    <div class="flex items-center space-x-3 pt-3"><button type="button" onclick="closeNewTripModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition">Batal</button><button type="submit" class="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-xl transition shadow-xs">Cipta Trip</button></div>
                </form>
            </div>
        </div>
    `;
}




let tripFilters = { hijri: 'All', search: '', month: 'All', airline: 'All', tempoh: 'All', musim: 'All' };

function updateHijriFilterTabs(){
  const container = document.getElementById('hijriFilterTabs');
  if(!container) return;
  const counts = {};
  let total = 0;
  (allTripUmrahRecords||[]).forEach(r=>{
    const h = getHijriFieldValue(r);
    if(!h) return;
    counts[h] = (counts[h]||0)+1;
    total++;
  });
  const order = ['1448H','1449H','1450H'];
  const sortedHijri = Object.keys(counts).sort((a,b)=>{
    const ia = order.indexOf(a); const ib = order.indexOf(b);
    if(ia!==-1 && ib!==-1) return ia-ib;
    if(ia!==-1) return -1;
    if(ib!==-1) return 1;
    return a.localeCompare(b);
  });
  // Ensure all 3 options always shown even if 0
  order.forEach(o=>{ if(!(o in counts)) counts[o]=counts[o]||0; });
  const allHijri = order.filter(o=>counts[o]!==undefined || sortedHijri.includes(o));
  // Build tabs
  let html = `<button onclick="setHijriFilter('All')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${tripFilters.hijri==='All' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}">SEMUA ${total>0?`<span class="ml-1 opacity-70">(${total})</span>`:''}</button>`;
  allHijri.forEach(h=>{
    const c = counts[h]||0;
    const active = tripFilters.hijri===h;
    html += `<button onclick="setHijriFilter('${h}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}">${h} ${c>0?`<span class="ml-1 opacity-70">(${c})</span>`:''}</button>`;
  });
  container.innerHTML = html;
  updateAdvancedFilterOptions();
}

function updateAdvancedFilterOptions(){
  const monthSet = new Set(); const airlineSet = new Set(); const tempohSet = new Set(); const musimSet = new Set();
  (allTripUmrahRecords||[]).forEach(r=>{
    const f=r.fields;
    if(f['Mula Pakej']) monthSet.add(getMonthKeyLong(f['Mula Pakej']));
    if(f['Penerbangan']) airlineSet.add(f['Penerbangan']);
    if(f['Tempoh Pakej']) tempohSet.add(f['Tempoh Pakej']);
    if(f['Musim']) musimSet.add(f['Musim']);
  });
  const selMonth = document.getElementById('filterMonth');
  const selAirline = document.getElementById('filterAirline');
  const selTempoh = document.getElementById('filterTempoh');
  const selMusim = document.getElementById('filterMusim');
  if(selMonth){ const cur = tripFilters.month; let opts='<option value="All">Bulan: Semua</option>'; Array.from(monthSet).sort().forEach(m=>{ opts+=`<option value="${m}" ${cur===m?'selected':''}>${m}</option>`; }); selMonth.innerHTML=opts; }
  if(selAirline){ const cur = tripFilters.airline; let opts='<option value="All">Airline: Semua</option>'; Array.from(airlineSet).sort().forEach(a=>{ opts+=`<option value="${a}" ${cur===a?'selected':''}>${a}</option>`; }); selAirline.innerHTML=opts; }
  if(selTempoh){ const cur = tripFilters.tempoh; let opts='<option value="All">Tempoh: Semua</option>'; Array.from(tempohSet).sort().forEach(t=>{ opts+=`<option value="${t}" ${cur===t?'selected':''}>${t}</option>`; }); selTempoh.innerHTML=opts; }
  if(selMusim){ const cur = tripFilters.musim; let opts='<option value="All">Musim: Semua</option>'; Array.from(musimSet).sort().forEach(m=>{ opts+=`<option value="${m}" ${cur===m?'selected':''}>${m}</option>`; }); selMusim.innerHTML=opts; }
}

function setHijriFilter(val){ tripFilters.hijri=val; filterTripSidebar(); updateHijriFilterTabs(); }
function setAdvancedFilter(type, val){ tripFilters[type]=val; filterTripSidebar(); }
function clearAdvancedFilters(){ tripFilters={hijri:'All',search:'',month:'All',airline:'All',tempoh:'All',musim:'All'}; const s=document.getElementById('searchTripSidebar'); if(s) s.value=''; filterTripSidebar(); updateHijriFilterTabs(); }
function filterTripSidebar(){
  const searchInput = document.getElementById('searchTripSidebar');
  if(searchInput) tripFilters.search = searchInput.value.toLowerCase();
  let filtered = allTripUmrahRecords||[];
  if(tripFilters.hijri!=='All') filtered = filtered.filter(r=> getHijriFieldValue(r)===tripFilters.hijri);
  if(tripFilters.month!=='All') filtered = filtered.filter(r=> getMonthKeyLong(r.fields['Mula Pakej'])===tripFilters.month);
  if(tripFilters.airline!=='All') filtered = filtered.filter(r=> (r.fields['Penerbangan']||'')===tripFilters.airline);
  if(tripFilters.tempoh!=='All') filtered = filtered.filter(r=> (r.fields['Tempoh Pakej']||'')===tripFilters.tempoh);
  if(tripFilters.musim!=='All') filtered = filtered.filter(r=> (r.fields['Musim']||'')===tripFilters.musim);
  if(tripFilters.search) filtered = filtered.filter(r=>{ const title=(r.fields['Trip']||'').toLowerCase(); return title.includes(tripFilters.search); });
  renderTripSidebarList(filtered);
  updateHijriFilterTabs();
}


function getHijriFieldValue(rec){
  const f = rec.fields;
  let val = f['Hijri Season'] || f['Hijri Year'] || f['Musim Hijri'] || f['Hijri'] || '';
  if(val) return val.toString().trim().toUpperCase();
  const mula = f['Mula Pakej'];
  if(mula){
    const d = new Date(mula);
    if(!isNaN(d)){
      if(d < new Date('2027-05-15')) return '1448H';
      if(d < new Date('2028-05-01')) return '1449H';
      return '1450H';
    }
  }
  return '1448H';
}
function getMonthKeyLong(dateStr){
  if(!dateStr) return 'TBC';
  const d = new Date(dateStr);
  if(isNaN(d)) return 'TBC';
  const months = ['JANUARI','FEBRUARI','MAC','APRIL','MEI','JUN','JULAI','OGOS','SEPTEMBER','OKTOBER','NOVEMBER','DISEMBER'];
  return months[d.getMonth()] + ' ' + d.getFullYear();
}
function getMonthKeyFromDate(dateStr){ return getMonthKeyLong(dateStr); }
function getMonthShort(dateStr){
  if(!dateStr) return 'TBC';
  const d = new Date(dateStr);
  if(isNaN(d)) return 'TBC';
  const months = ['JAN','FEB','MAR','APR','MEI','JUN','JUL','OGOS','SEPT','OKT','NOV','DIS'];
  return months[d.getMonth()];
}
function getStatusBadgeForCard(status, occupied, total){
  const s = (status||'').toUpperCase();
  const avail = (total||0) - (occupied||0);
  if(s.includes('PAST')) return {label:'PAST TRIP', dot:'bg-slate-300', cls:'bg-slate-100 text-slate-600 border-slate-200'};
  if(s.includes('ONGOING') || s.includes('BERJALAN')) return {label:'ONGOING', dot:'bg-amber-400', cls:'bg-amber-50 text-amber-700 border-amber-200'};
  if(s.includes('CLOSED') || s.includes('FULL') || avail<=0) return {label:'CLOSED', dot:'bg-red-400', cls:'bg-red-50 text-red-700 border-red-200'};
  if(s.includes('AVAILABLE') || avail>0) return {label:'AVAILABLE', dot:'bg-green-400', cls:'bg-green-50 text-green-700 border-green-200'};
  return {label: s || 'AVAILABLE', dot:'bg-slate-300', cls:'bg-slate-50 text-slate-600 border-slate-200'};
}

function cleanTripName(tripName) { if (!tripName) return 'TBC'; return tripName.replace(/^[\d\/]+\s*\|\s*/i, '').trim(); }
function normalizeDashFormat(str) { if (!str) return ''; return str.trim().toUpperCase().replace(/KUL\s+/g, 'KUL-').replace(/\s+JED/g, '-JED').replace(/\s+MED/g, '-MED').replace(/\s+KUL/g, '-KUL').replace(/\s+TIF/g, '-TIF').replace(/--+/g, '-'); }

async function fetchTripUmrahData() {
    try{
      if(typeof AIRTABLE_PAT === 'undefined' || !AIRTABLE_PAT){
        AIRTABLE_PAT = window.AIRTABLE_PAT || localStorage.getItem('effah_api_pat') || window.DEFAULT_PAT || 'patjxZg6G22e9OBuS.2a96ced64af7e931ee4d83f65c491adf1241813547d5d8e3a317f5bc6d9a8de7';
        AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || localStorage.getItem('effah_base_id') || window.DEFAULT_BASE_ID || 'appSsn4JyQD4DnYu0';
      }
      AIRTABLE_PAT = window.AIRTABLE_PAT || localStorage.getItem('effah_api_pat') || AIRTABLE_PAT || window.DEFAULT_PAT || 'patjxZg6G22e9OBuS.2a96ced64af7e931ee4d83f65c491adf1241813547d5d8e3a317f5bc6d9a8de7';
      AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || localStorage.getItem('effah_base_id') || AIRTABLE_BASE_ID || window.DEFAULT_BASE_ID || 'appSsn4JyQD4DnYu0';
      window.AIRTABLE_PAT = AIRTABLE_PAT; window.AIRTABLE_BASE_ID = AIRTABLE_BASE_ID;
      localStorage.setItem('effah_api_pat', AIRTABLE_PAT); localStorage.setItem('effah_base_id', AIRTABLE_BASE_ID);
      if(typeof updateApiStatusBadge === 'function') updateApiStatusBadge();
      if(typeof setApiOnline === 'function') setApiOnline();
    }catch(e){ console.warn('PAT auto-fill warning', e); }
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) return;
    const container = document.getElementById('tripSidebarContainer');
    if (container) container.innerHTML = '<div class="text-center py-10 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Memuat data...</div>';
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/PAKEJ%20UMRAH?sort[0][field]=Mula%20Pakej&sort[0][direction]=asc&sort[1][field]=Tamat%20Pakej&sort[1][direction]=asc`;
    try {
        const prevSelectedId = (selectedTripRecord && selectedTripRecord.id) ? selectedTripRecord.id : localStorage.getItem('effah_last_selected_trip');
        const sidebarContainer = document.getElementById('tripSidebarContainer');
        const prevScrollTop = sidebarContainer ? sidebarContainer.scrollTop : 0;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } });
        const data = await response.json();
        allTripUmrahRecords = data.records || [];
        extractDynamicOptions(allTripUmrahRecords);
        const validTrips = allTripUmrahRecords.filter(rec => {
            const f = rec.fields;
            const tripTitle = (f['Trip'] || f['NAME'] || '').trim().toUpperCase();
            return tripTitle !== 'TBC' && !tripTitle.startsWith('TBC') && f['Mula Pakej'];
        });
        const statUmrah = document.getElementById('statUmrahCount');
        if (statUmrah) statUmrah.textContent = validTrips.length;
        renderTripSidebarList(allTripUmrahRecords);
        // sync to rooming dropdown if exists
        if(typeof populateRoomingTripDropdown === 'function') populateRoomingTripDropdown();
        if(typeof window.populateRoomingTripDropdown === 'function') window.populateRoomingTripDropdown();
        window.allTripRecords = allTripUmrahRecords; // alias for rooming
        setTimeout(()=>{ const sc = document.getElementById('tripSidebarContainer'); if(sc){ sc.scrollTop = prevScrollTop; console.log('Scroll restored to', prevScrollTop); } }, 100);
        if(prevSelectedId){
          const stillExists = allTripUmrahRecords.find(r=> r.id === prevSelectedId);
          if(stillExists){
            renderTripDetailForm(stillExists);
            if(typeof fetchJemaahUmrahData === 'function'){
              const _fetchId = stillExists.id; fetchJemaahUmrahData(true).then(()=>{ if(selectedTripRecord && selectedTripRecord.id !== _fetchId){ return; }  const curId = selectedTripRecord ? selectedTripRecord.id : null; if(curId && curId !== _fetchId){ console.log('Race guard: user switched to', curId, 'skip', _fetchId); return; } const sc=document.getElementById('tripSidebarContainer'); const savedScroll=sc?sc.scrollTop:0; const upd = allTripUmrahRecords.find(r=>r.id===_fetchId)||stillExists; renderTripDetailForm(upd); setTimeout(()=>{ const s2=document.getElementById('tripSidebarContainer'); if(s2) s2.scrollTop=savedScroll; },0); });
            }
          } else if (allTripUmrahRecords.length > 0) {
            renderTripDetailForm(allTripUmrahRecords[0]);
          }
        } else if (allTripUmrahRecords.length > 0) {
          renderTripDetailForm(allTripUmrahRecords[0]);
        }
        // After initial load, populate hijri tabs
        try{ updateHijriFilterTabs(); }catch(e){}
    } catch (err) {
        if (container) container.innerHTML = '<div class="text-center py-10 text-rose-500 text-xs">Gagal muat data. Semak API Key.</div>';
    }
}

function renderTripSidebarList(records) {
    const container = document.getElementById('tripSidebarContainer');
    if (!container) return;
    // Preserve scroll
    const prevScroll = container.scrollTop;
    container.innerHTML = '';
    if (records.length === 0) { container.innerHTML = '<div class="text-center py-10 text-slate-400 text-xs">Tiada rekod trip.</div>'; return; }
    records.forEach(rec => {
        const f = rec.fields;
        const rawTripTitle = f['Trip'] || f['NAME'] || 'TBC';
        const displayTitle = cleanTripName(rawTripTitle);
        const airline = f['Penerbangan'] || 'N/A';
        const isSelected = selectedTripRecord && selectedTripRecord.id === rec.id;
        const card = document.createElement('div');
        card.setAttribute('data-trip-id', rec.id);
        card.className = `p-3 rounded-xl border text-left cursor-pointer transition ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50/50 hover:bg-slate-100/60 border-slate-200/80'}`;
        card.onclick = () => renderTripDetailForm(rec);
        const titleColor = isSelected ? 'text-white' : 'text-slate-900';
        card.innerHTML = `<h4 class="font-bold text-xs ${titleColor} leading-snug">${displayTitle}</h4><div class="mt-2">${getAirlineBadgeHtml(airline, isSelected)}</div>`;
        container.appendChild(card);
    });
    // Restore scroll after render
    requestAnimationFrame(()=>{
      try{ updateHijriFilterTabs(); }catch(e){}
      container.scrollTop = prevScroll;
      // Also ensure selected card is visible but don't jump to top
      const selectedEl = container.querySelector('[data-trip-id="'+(selectedTripRecord?.id||'')+'"]');
      if(selectedEl){
        const rect = selectedEl.getBoundingClientRect();
        const contRect = container.getBoundingClientRect();
        if(rect.top < contRect.top || rect.bottom > contRect.bottom){
          selectedEl.scrollIntoView({block:'nearest', behavior:'auto'});
        }
      }
    });
}

let _tripDetailVersion = 0;
function renderTripDetailForm(rec) {
    _tripDetailVersion++;
    const currentVersion = _tripDetailVersion;
    window._lastTripClickTime = Date.now();
    const _sidebar = document.getElementById('tripSidebarContainer');
    const _scrollSave = _sidebar ? _sidebar.scrollTop : 0;
    selectedTripRecord = rec;
    if(rec && rec.id){ try{ localStorage.setItem('effah_last_selected_trip', rec.id); }catch(e){} }
    renderTripSidebarList(allTripUmrahRecords);
    // Restore scroll after sidebar re-render
    setTimeout(()=>{ const sc=document.getElementById('tripSidebarContainer'); if(sc) sc.scrollTop=_scrollSave; }, 0);
    const f = rec.fields; const id = rec.id;
    const rawTripTitle = f['Trip'] || f['NAME'] || 'TBC';
    const displayTitle = cleanTripName(rawTripTitle);
    const workspace = document.getElementById('tripMainDetailWorkspace');
    const isTBC = (displayTitle || '').toUpperCase() === 'TBC' || (rawTripTitle || '').toUpperCase() === 'TBC' || (rawTripTitle || '').toUpperCase().includes('TBC');
    let tripJemaah = (typeof allJemaahUmrahRecords !== 'undefined') ? allJemaahUmrahRecords.filter(j => {
        const jTripRaw = j.fields['TRIP'];
        const jTrip = Array.isArray(jTripRaw) ? jTripRaw[0] : jTripRaw;
        const jTripName = (j.fields['Trip Name'] || j.fields['TRIP_NAME'] || j.fields['Trip'] || '').toString();
        const jTripStr = (jTrip || '').toString().trim();
        const jTripNameStr = jTripName.trim();
        if(isTBC){
            const isEmptyLinked = !jTripRaw || (Array.isArray(jTripRaw) && jTripRaw.length===0) || jTripStr === '';
            const isTBCTag = jTripStr.toUpperCase() === 'TBC' || jTripNameStr.toUpperCase() === 'TBC' || jTripNameStr.toUpperCase().includes('TBC') || jTripStr.toUpperCase().includes('TBC');
            return isEmptyLinked || isTBCTag;
        } else {
            if(!jTripRaw || (Array.isArray(jTripRaw) && jTripRaw.length===0)) return false;
            return jTrip === id || jTripStr === rawTripTitle || jTripStr === displayTitle || jTripNameStr === rawTripTitle || jTripNameStr === displayTitle;
        }
    }) : [];
    currentTripJemaahList = tripJemaah;
    if(tripJemaahSortField){ currentTripJemaahList = sortJemaahArray(currentTripJemaahList, tripJemaahSortField, tripJemaahSortDir); }
    workspace.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 md:p-8">
            <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">${displayTitle}</h1>
                <button onclick="deleteTripRecord('${id}')" class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-2xs flex items-center">Delete Trip</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs font-medium text-slate-700">
                <div><label class="block font-bold text-slate-600 mb-1">Trip</label><input type="text" value="${rawTripTitle}" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-600 cursor-not-allowed"></div>
                <div><label class="block font-bold text-slate-600 mb-1">Mutawwif/Pengiring</label><input type="text" value="${f['Mutawwif/Pengiring'] || ''}" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"></div>
                <div><label class="block font-bold text-slate-600 mb-1">Group (if relevant)</label>${buildSelectDropdown(id, 'Group (if relevant)', f['Group (if relevant)'], selectOptions.group, 'group')}</div>
                <div class="grid grid-cols-2 gap-3"><div><label class="block font-bold text-slate-600 mb-1">Mula Pakej</label><input type="date" value="${f['Mula Pakej'] || ''}" onchange="updateAirtableField('${id}', 'Mula Pakej', this.value)" class="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-400 focus:outline-none"></div><div><label class="block font-bold text-slate-600 mb-1">Tamat Pakej</label><input type="date" value="${f['Tamat Pakej'] || ''}" onchange="updateAirtableField('${id}', 'Tamat Pakej', this.value)" class="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-400 focus:outline-none"></div></div>
                <div><label class="block font-bold text-slate-600 mb-1">Penerbangan</label>${buildSelectDropdown(id, 'Penerbangan', f['Penerbangan'], selectOptions.penerbangan, 'penerbangan')}</div>
                <div><label class="block font-bold text-slate-600 mb-1">Musim</label>${buildSelectDropdown(id, 'Musim', f['Musim'], selectOptions.musim, 'musim')}</div>
                <div><label class="block font-bold text-slate-600 mb-1">Hijri Season</label>${buildSelectDropdown(id, 'Hijri Season', f['Hijri Season'] || getHijriFieldValue(rec), selectOptions.hijri, 'hijri')}</div>
                <div><label class="block font-bold text-slate-600 mb-1">Tempoh Pakej</label>${buildSelectDropdown(id, 'Tempoh Pakej', f['Tempoh Pakej'], selectOptions.tempoh, 'tempoh')}</div>
                <div><label class="block font-bold text-slate-600 mb-1">Status</label><div class="pt-1.5">${getStatusBadgeHtml(f['Status'])}</div></div>
                <div><label class="block font-bold text-slate-600 mb-1">Occupied Seat</label><input type="text" value="${f['Occupied seat'] || 0}" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"></div>
                <div><label class="block font-bold text-slate-600 mb-1">Total Seat</label><input type="number" value="${f['Total Seat'] || 0}" onchange="updateAirtableField('${id}', 'Total Seat', parseInt(this.value))" class="w-full p-2.5 border border-slate-200 rounded-xl font-bold focus:ring-1 focus:ring-slate-400 focus:outline-none"></div>
                <div><label class="block font-bold text-slate-600 mb-1">Available Seat</label><input type="text" value="${f['Available Seat'] || 0}" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"></div>
                <div><label class="block font-bold text-slate-600 mb-1">Total Jemaah</label><input type="text" value="${f['Total Jemaah'] || 0}" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"></div>
                <div><label class="block font-bold text-slate-600 mb-1">FIT Tickets</label><input type="text" value="${f['FIT Tickets'] || 0}" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"></div>
                <div><label class="block font-bold text-slate-600 mb-1">Last Payment</label><input type="text" value="${f['Last Payment'] || '-'}" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"></div>
                <div class="md:col-span-2"><label class="block font-bold text-slate-600 mb-1">Sektor</label>${buildSelectDropdown(id, 'Sektor', f['Sektor'], selectOptions.sektor, 'sektor')}</div>
            </div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 md:p-8">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-5 gap-3">
                <h3 class="font-extrabold text-base text-slate-900 tracking-tight">DATA JEMAAH UMRAH</h3>
                <div class="flex items-center gap-2">
                    <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-[10px]"></i><input type="text" onkeyup="filterTripJemaahTable(this.value)" placeholder="Search..." class="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 w-24 md:w-36"></div>
                    <button onclick="printTripManifest()" class="bg-white border border-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition text-xs flex items-center shadow-xs"><i class="fa-solid fa-print mr-1.5"></i> Print</button>
                    <button onclick="exportTripPdf()" class="bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl hover:bg-emerald-700 transition text-xs flex items-center shadow-xs"><i class="fa-solid fa-file-arrow-down mr-1.5"></i> Export PDF</button>
                    <button onclick="openTripAddCustomerModal()" class="bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl hover:bg-black transition text-xs flex items-center shadow-xs"><i class="fa-solid fa-plus mr-1.5"></i> Add customer</button>
                </div>
            </div>
            <div class="overflow-x-auto border border-slate-200/80 rounded-xl">
                <table class="w-full text-left text-xs" id="tripJemaahTable">
                    <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                        <tr>
                            <th class="p-3 w-10 text-center">#</th>
                            <th class="p-3 cursor-pointer hover:text-slate-800 select-none" onclick="sortTripJemaahBy('NAME')">NAME <span class="sort-icon" data-field="NAME">↑</span></th>
                            <th class="p-3">PICTURE</th>
                            <th class="p-3">PASSPORT COPY</th>
                            <th class="p-3 cursor-pointer hover:text-slate-800 select-none" onclick="sortTripJemaahBy('PASSPORT NO.')">PASSPORT NO. <span class="sort-icon" data-field="PASSPORT NO."></span></th>
                            <th class="p-3 cursor-pointer hover:text-slate-800 select-none" onclick="sortTripJemaahBy('AGE')">AGE <span class="sort-icon" data-field="AGE"></span></th>
                            <th class="p-3 cursor-pointer hover:text-slate-800 select-none" onclick="sortTripJemaahBy('GENDER')">GENDER <span class="sort-icon" data-field="GENDER"></span></th>
                            <th class="p-3 cursor-pointer hover:text-slate-800 select-none" onclick="sortTripJemaahBy('NATIONALITY')">NATIONALITY <span class="sort-icon" data-field="NATIONALITY"></span></th>
                        </tr>
                    </thead>
                    <tbody id="tripJemaahTableBody" class="divide-y divide-slate-100 font-medium text-slate-800">
                        ${currentTripJemaahList.length === 0 ? `<tr><td colspan="8" class="p-8 text-center text-slate-400 font-normal">Tiada data jemaah berdaftar di bawah trip ini lagi.</td></tr>` : currentTripJemaahList.map((j, idx) => {
                            const jf = j.fields;
                            const picObj = (jf['PICTURE'] && jf['PICTURE'][0]) ? jf['PICTURE'][0] : null;
                            const pic = picObj ? picObj.url : '';
                            const picId = picObj ? picObj.id : '';
                            const picName = picObj ? (picObj.filename || '') : '';
                            const passObj = (jf['PASSPORT COPY'] && jf['PASSPORT COPY'][0]) ? jf['PASSPORT COPY'][0] : null;
                            const passCopy = passObj ? passObj.url : '';
                            const passId = passObj ? passObj.id : '';
                            const passName = passObj ? (passObj.filename || '') : '';
                            const genderBadge = jf['GENDER'] === 'MALE' ? 'bg-sky-100/80 text-sky-800 border-sky-200' : 'bg-rose-100/80 text-rose-800 border-rose-200';
                            const recId = j.id;
                            return `<tr class="hover:bg-slate-50/80 transition"><td class="p-3 text-center text-slate-400 font-bold">${idx + 1}</td><td class="p-3 font-bold text-slate-900 uppercase">${jf['NAME'] || '-'}</td><td class="p-3">${pic ? `<img src="${pic}" onclick="openTripPreviewModal('${pic}', '${(jf['NAME']||'').replace(/'/g, '')} - PICTURE', {recordId:'${recId}', fieldName:'PICTURE', attachmentId:'${picId}', filename:'${picName.replace(/'/g,'')}'})" class="w-9 h-9 rounded-lg object-cover border border-slate-200 cursor-pointer hover:scale-110 transition" title="Click to preview">` : `<div class="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><i class="fa-solid fa-user"></i></div>`}</td><td class="p-3">${passCopy ? `<button onclick="openTripPreviewModal('${passCopy}', '${(jf['NAME']||'').replace(/'/g, '')} - PASSPORT COPY', {recordId:'${recId}', fieldName:'PASSPORT COPY', attachmentId:'${passId}', filename:'${passName.replace(/'/g,'')}'})" class="text-sky-600 hover:text-sky-800 underline font-semibold flex items-center text-xs"><i class="fa-solid fa-file-pdf mr-1"></i> View Copy</button>` : `<span class="text-slate-300">-</span>`}</td><td class="p-3 font-mono font-bold text-slate-700">${jf['PASSPORT NO.'] || '-'}</td><td class="p-3 text-slate-600">${jf['AGE'] || '-'}</td><td class="p-3"><span class="text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase ${genderBadge}">${jf['GENDER'] || '-'}</span></td><td class="p-3"><span class="bg-sky-100/80 text-sky-900 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">${jf['NATIONALITY'] || 'MALAYSIA'}</span></td></tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function handleMulaDateChange(){ const mulaInput=document.getElementById('modalMulaPakej'); const tamatInput=document.getElementById('modalTamatPakej'); if(mulaInput&&tamatInput&&mulaInput.value){ tamatInput.min=mulaInput.value; if(tamatInput.value&&tamatInput.value<mulaInput.value){ tamatInput.value=mulaInput.value; } } }
function openNewTripModal(){ const modal=document.getElementById('newTripModal'); const mulaInput=document.getElementById('modalMulaPakej'); const tamatInput=document.getElementById('modalTamatPakej'); if(mulaInput){mulaInput.value='';mulaInput.removeAttribute('min');} if(tamatInput){tamatInput.value='';tamatInput.removeAttribute('min');} if(modal) modal.classList.remove('hidden'); }
function closeNewTripModal(){ const modal=document.getElementById('newTripModal'); if(modal) modal.classList.add('hidden'); }
async function submitNewTripRecord(e){ if(e) e.preventDefault(); if(!AIRTABLE_PAT||!AIRTABLE_BASE_ID) return; const mulaDate=document.getElementById('modalMulaPakej').value; const tamatDate=document.getElementById('modalTamatPakej').value; if(!mulaDate||!tamatDate){alert('Sila masukkan kedua-dua tarikh');return;} if(tamatDate<mulaDate){alert('Tarikh Tamat mesti selepas Mula');return;} const url=`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/PAKEJ%20UMRAH`; try{ const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${AIRTABLE_PAT}`,'Content-Type':'application/json'},body:JSON.stringify({fields:{"Mula Pakej":mulaDate,"Tamat Pakej":tamatDate}})}); if(response.ok){closeNewTripModal();fetchTripUmrahData();}else{const errData=await response.json();console.error(errData);alert("Gagal menambah trip baru.");}}catch(err){alert('Gagal menambah trip baru.');} }
function buildSelectDropdown(recId, fieldName, currentValue, optionsArray, categoryKey){ const uniqueOptions=[]; optionsArray.forEach(opt=>{ if(!opt) return; const cleanOpt=normalizeDashFormat(opt); if(cleanOpt&&!uniqueOptions.includes(cleanOpt)) uniqueOptions.push(cleanOpt); }); let optionsHtml=`<option value="">-- Pilih --</option>`; const currentNormalized=normalizeDashFormat(currentValue); uniqueOptions.forEach(opt=>{ const isSelected=currentNormalized===opt; optionsHtml+=`<option value="${opt}" ${isSelected?'selected':''}>${opt}</option>`; }); optionsHtml+=`<option value="__ADD_NEW__" class="font-bold text-brand-maroon">+ Add New Option...</option>`; return `<select onchange="handleDropdownChange('${recId}', '${fieldName}', this, '${categoryKey}')" class="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-400 focus:outline-none font-semibold text-slate-800">${optionsHtml}</select>`; }
function handleDropdownChange(recId, fieldName, selectEl, categoryKey){ const selectedVal=selectEl.value; if(selectedVal==='__ADD_NEW__'){ const newOption=prompt(`Masukkan nama pilihan baru untuk ${fieldName}:`); if(newOption&&newOption.trim()!==''){ const cleanOpt=normalizeDashFormat(newOption); if(!selectOptions[categoryKey].includes(cleanOpt)){selectOptions[categoryKey].push(cleanOpt);} selectEl.value=cleanOpt; updateAirtableField(recId, fieldName, cleanOpt);}else{selectEl.value='';}}else{updateAirtableField(recId, fieldName, selectedVal);} }
async function updateAirtableField(recId, fieldName, value){
  if(!AIRTABLE_PAT||!AIRTABLE_BASE_ID) return;
  const sidebarContainer = document.getElementById('tripSidebarContainer');
  const savedScrollTop = sidebarContainer ? sidebarContainer.scrollTop : 0;
  const savedSelectedId = selectedTripRecord ? selectedTripRecord.id : recId;
  
  // Optimistic update local data - don't wait for full reload
  const targetRec = allTripUmrahRecords.find(r=>r.id===recId);
  if(targetRec){
    targetRec.fields[fieldName] = (value===''||value===undefined)?null:value;
  }
  if(selectedTripRecord && selectedTripRecord.id===recId){
    selectedTripRecord.fields[fieldName] = (value===''||value===undefined)?null:value;
  }
  
  const url=`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/PAKEJ%20UMRAH/${recId}`;
  let fieldsData={};
  fieldsData[fieldName]=(value===''||value===undefined)?null:value;
  try{
    const response=await fetch(url,{method:'PATCH',headers:{Authorization:`Bearer ${AIRTABLE_PAT}`,'Content-Type':'application/json'},body:JSON.stringify({fields:fieldsData})});
    if(response.ok){
      // Just update sidebar without resetting scroll
      renderTripSidebarList(allTripUmrahRecords);
      // Restore scroll immediately
      setTimeout(()=>{
        const sc = document.getElementById('tripSidebarContainer');
        if(sc) sc.scrollTop = savedScrollTop;
        // Keep highlight on current trip
        if(savedSelectedId){
          const cards = sc ? sc.querySelectorAll('div[data-trip-id]') : [];
          // scroll selected card into view if needed but keep overall scroll
        }
      }, 10);
      // No full fetchTripUmrahData() - keeps you at same position
      console.log(`✅ Field ${fieldName} updated, scroll preserved at ${savedScrollTop}`);
    }else{
      const errData=await response.json();
      console.error(errData);
      alert('Gagal mengemaskini field di Airtable: ' + (errData.error?.message||''));
      // Revert optimistic update on fail
      fetchTripUmrahData();
    }
  }catch(err){
    console.error(err);
    // On network fail (ERR_NAME_NOT_RESOLVED), keep local change
    console.warn('Airtable update failed, keeping local change. Will sync on next refresh.');
    renderTripSidebarList(allTripUmrahRecords);
    setTimeout(()=>{ const sc=document.getElementById('tripSidebarContainer'); if(sc) sc.scrollTop=savedScrollTop; }, 10);
  }
}
async function deleteTripRecord(recId){ if(!confirm('Adakah anda pasti nak padam rekod Trip ini dari Airtable?')) return; const url=`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/PAKEJ%20UMRAH/${recId}`; try{ const response=await fetch(url,{method:'DELETE',headers:{Authorization:`Bearer ${AIRTABLE_PAT}`}}); if(response.ok){fetchTripUmrahData();}}catch(err){alert('Gagal memadam rekod.');} }
function extractDynamicOptions(records){ records.forEach(r=>{ const f=r.fields; const checkAndPush=(val,targetArray)=>{ if(!val) return; const clean=normalizeDashFormat(val); if(clean&&!targetArray.includes(clean)){targetArray.push(clean);} }; checkAndPush(f['Group (if relevant)'], selectOptions.group); checkAndPush(f['Sektor'], selectOptions.sektor); checkAndPush(f['Penerbangan'], selectOptions.penerbangan); checkAndPush(f['Musim'], selectOptions.musim); checkAndPush(f['Tempoh Pakej'], selectOptions.tempoh); }); }
function filterTripJemaahTable(q){ const query=(q||'').toLowerCase(); const container=document.getElementById('modul-pakej-umrah'); if(!container) return; const rows=container.querySelectorAll('table tbody tr'); rows.forEach(tr=>{ const txt=tr.textContent.toLowerCase(); tr.style.display=txt.includes(query)?'':'none'; }); }
function closeTripAddCustomerModal(){ const modal=document.getElementById('tripAddCustomerModal'); if(modal){ modal.classList.add('hidden'); modal.style.display='none'; } }
function openTripAddCustomerModal(){ let modal=document.getElementById('tripAddCustomerModal'); const tripName=(typeof selectedTripRecord!=='undefined'&&selectedTripRecord)?(selectedTripRecord.fields['Trip']||'') : ''; if(!modal){ modal=document.createElement('div'); modal.id='tripAddCustomerModal'; modal.className='fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4'; modal.innerHTML=`<div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full border border-slate-100"><div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100"><div class="flex items-center space-x-2.5"><div class="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center"><i class="fa-solid fa-user-plus"></i></div><div><h3 class="font-extrabold text-slate-900 text-base">Tambah Jemaah Baru</h3><p class="text-[11px] text-slate-500">${tripName ? 'Trip: '+tripName : ''}</p></div></div><button onclick="closeTripAddCustomerModal()" class="text-slate-400 hover:text-slate-700 p-1"><i class="fa-solid fa-xmark text-lg"></i></button></div><form onsubmit="submitTripAddCustomer(event)" class="space-y-3 text-xs"><div><label class="block font-bold text-slate-700 mb-1">Nama Penuh *</label><input type="text" id="tripAddName" required placeholder="NAMA PENUH" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-400 focus:outline-none font-semibold uppercase"></div><div class="grid grid-cols-2 gap-3"><div><label class="block font-bold text-slate-700 mb-1">No IC</label><input type="text" id="tripAddIC" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"></div><div><label class="block font-bold text-slate-700 mb-1">Passport No</label><input type="text" id="tripAddPassport" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"></div></div><div><label class="block font-bold text-slate-700 mb-1">Trip</label><input type="text" id="tripAddTrip" value="${tripName}" readonly class="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600"></div><div class="flex gap-3 pt-3"><button type="button" onclick="closeTripAddCustomerModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl">Batal</button><button type="submit" class="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-xl shadow-xs">Simpan</button></div></form></div>`; document.body.appendChild(modal); modal.addEventListener('click', (e)=>{ if(e.target===modal) closeTripAddCustomerModal(); }); } else { modal.style.display='flex'; modal.classList.remove('hidden'); const inp=modal.querySelector('#tripAddTrip'); if(inp) inp.value=tripName; } }
async function submitTripAddCustomer(e){ e.preventDefault(); const name=document.getElementById('tripAddName')?.value.trim(); const ic=document.getElementById('tripAddIC')?.value.trim(); const passport=document.getElementById('tripAddPassport')?.value.trim(); const trip=document.getElementById('tripAddTrip')?.value.trim() || (typeof selectedTripRecord!=='undefined'&&selectedTripRecord?selectedTripRecord.fields['Trip']:''); if(!name){alert('Nama wajib isi');return;} if(!trip){alert('Trip tidak dipilih');return;} const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat'); const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_base_id'); if(!pat||!base){alert('API not set');return;} const tripId=(typeof selectedTripRecord!=='undefined'&&selectedTripRecord)?selectedTripRecord.id:null; try{ const fieldsPayload={'NAME':name.toUpperCase(),'IC NO.':ic||null,'PASSPORT NO.':passport||null}; if(tripId){fieldsPayload['TRIP']=[tripId];}else if(trip){fieldsPayload['Trip']=trip;} const res=await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH`,{method:'POST',headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},body:JSON.stringify({fields:fieldsPayload})}); if(res.ok){ const newRec=await res.json(); closeTripAddCustomerModal(); const createdFields={'NAME':name.toUpperCase(),'IC NO.':ic||'','PASSPORT NO.':passport||'','AGE':'','GENDER':'','NATIONALITY':'MALAYSIA','PICTURE':[],'PASSPORT COPY':[],'TRIP':tripId?[tripId]:[],'Trip Name':trip||''}; const newJemaahObj={id:newRec.id||('temp_'+Date.now()),fields:createdFields}; if(typeof allJemaahUmrahRecords!=='undefined'){allJemaahUmrahRecords.unshift(newJemaahObj);} currentTripJemaahList.unshift(newJemaahObj); if(tripJemaahSortField){currentTripJemaahList=sortJemaahArray(currentTripJemaahList,tripJemaahSortField,tripJemaahSortDir);} const tbody=document.getElementById('tripJemaahTableBody'); if(tbody){ tbody.innerHTML=currentTripJemaahList.map((j,idx)=>{ const jf=j.fields; return `<tr><td class="p-3 text-center text-slate-400 font-bold">${idx+1}</td><td class="p-3 font-bold text-slate-900 uppercase">${jf['NAME']||'-'}</td><td class="p-3"><div class="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><i class="fa-solid fa-user"></i></div></td><td class="p-3"><span class="text-slate-300">-</span></td><td class="p-3 font-mono font-bold text-slate-700">${jf['PASSPORT NO.']||'-'}</td><td class="p-3 text-slate-600">${jf['AGE']||'-'}</td><td class="p-3"><span class="text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase">${jf['GENDER']||'-'}</span></td><td class="p-3"><span class="bg-sky-100/80 text-sky-900 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">${jf['NATIONALITY']||'MALAYSIA'}</span></td></tr>`; }).join(''); } if(typeof fetchJemaahUmrahData==='function'){setTimeout(()=>fetchJemaahUmrahData(true),2000);} }else{const err=await res.json();console.error(err);alert('Gagal tambah: '+(err.error?.message||'unknown'));} }catch(err){console.error(err);alert('Error network');} }

function sortJemaahArray(arr, field, dir){ const sorted=[...arr].sort((a,b)=>{ let av=(a.fields[field]||'').toString().toUpperCase(); let bv=(b.fields[field]||'').toString().toUpperCase(); if(field==='AGE'){ const an=parseFloat(av)||0; const bn=parseFloat(bv)||0; return dir==='asc'?an-bn:bn-an; } if(av<bv) return dir==='asc'?-1:1; if(av>bv) return dir==='asc'?1:-1; return 0; }); return sorted; }
function sortTripJemaahBy(field){ if(tripJemaahSortField===field){tripJemaahSortDir=tripJemaahSortDir==='asc'?'desc':'asc';}else{tripJemaahSortField=field;tripJemaahSortDir='asc';} currentTripJemaahList=sortJemaahArray(currentTripJemaahList,tripJemaahSortField,tripJemaahSortDir); const tbody=document.getElementById('tripJemaahTableBody'); if(!tbody) return; if(currentTripJemaahList.length===0){tbody.innerHTML='<tr><td colspan="8" class="p-8 text-center text-slate-400">Tiada data</td></tr>';return;} tbody.innerHTML=currentTripJemaahList.map((j,idx)=>{ const jf=j.fields; const picObj=(jf['PICTURE']&&jf['PICTURE'][0])?jf['PICTURE'][0]:null; const pic=picObj?picObj.url:''; const picId=picObj?picObj.id:''; const picName=picObj?(picObj.filename||'') : ''; const passObj=(jf['PASSPORT COPY']&&jf['PASSPORT COPY'][0])?jf['PASSPORT COPY'][0]:null; const passCopy=passObj?passObj.url:''; const passId=passObj?passObj.id:''; const passName=passObj?(passObj.filename||'') : ''; const genderBadge=jf['GENDER']==='MALE'?'bg-sky-100/80 text-sky-800 border-sky-200':'bg-rose-100/80 text-rose-800 border-rose-200'; const recId=j.id; return `<tr class="hover:bg-slate-50/80 transition"><td class="p-3 text-center text-slate-400 font-bold">${idx+1}</td><td class="p-3 font-bold text-slate-900 uppercase">${jf['NAME']||'-'}</td><td class="p-3">${pic?`<img src="${pic}" onclick="openTripPreviewModal('${pic}', '${(jf['NAME']||'').replace(/'/g,'')} - PICTURE', {recordId:'${recId}', fieldName:'PICTURE', attachmentId:'${picId}', filename:'${picName.replace(/'/g,'')}'})" class="w-9 h-9 rounded-lg object-cover border border-slate-200 cursor-pointer hover:scale-110 transition">`:`<div class="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><i class="fa-solid fa-user"></i></div>`}</td><td class="p-3">${passCopy?`<button onclick="openTripPreviewModal('${passCopy}', '${(jf['NAME']||'').replace(/'/g,'')} - PASSPORT COPY', {recordId:'${recId}', fieldName:'PASSPORT COPY', attachmentId:'${passId}', filename:'${passName.replace(/'/g,'')}'})" class="text-sky-600 hover:text-sky-800 underline font-semibold flex items-center text-xs"><i class="fa-solid fa-file-pdf mr-1"></i> View Copy</button>`:`<span class="text-slate-300">-</span>`}</td><td class="p-3 font-mono font-bold text-slate-700">${jf['PASSPORT NO.']||'-'}</td><td class="p-3 text-slate-600">${jf['AGE']||'-'}</td><td class="p-3"><span class="text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase ${genderBadge}">${jf['GENDER']||'-'}</span></td><td class="p-3"><span class="bg-sky-100/80 text-sky-900 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">${jf['NATIONALITY']||'MALAYSIA'}</span></td></tr>`; }).join(''); document.querySelectorAll('.sort-icon').forEach(el=>{ const f=el.getAttribute('data-field'); if(f===tripJemaahSortField){el.textContent=tripJemaahSortDir==='asc'?' ↑':' ↓'; el.classList.add('text-slate-900');}else{el.textContent='';} }); }

function formatDateMY(dateStr){ if(!dateStr) return '-'; try{ const d=new Date(dateStr); if(isNaN(d)) return dateStr; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; }catch(e){ return dateStr; } }
function getGenderBreakdown(){ let male=0,female=0,maleKids=0,femaleKids=0; currentTripJemaahList.forEach(j=>{ const g=(j.fields['GENDER']||'').toUpperCase(); const ageStr=(j.fields['AGE']||'').toString(); let ageYears=0; const m=ageStr.match(/(\d+)y/); if(m) ageYears=parseInt(m[1]); else ageYears=parseFloat(ageStr)||0; const isKid=ageYears>0&&ageYears<12; if(g==='MALE'){ if(isKid) maleKids++; else male++; } else if(g==='FEMALE'){ if(isKid) femaleKids++; else female++; } }); return {male,female,maleKids,femaleKids}; }
function buildTripManifestHTML(includeButtons=true){
  if(!selectedTripRecord) return '<p>No trip selected</p>';
  const f=selectedTripRecord.fields; const rawTrip=f['Trip']||f['NAME']||'TBC'; const displayTitle=cleanTripName(rawTrip);
  const sektor=f['Sektor']||'-'; const mutawwif=f['Mutawwif/Pengiring']||'-'; const tempoh=f['Tempoh Pakej']||'-'; const flight=f['Penerbangan']||'-'; const total=currentTripJemaahList.length; const gb=getGenderBreakdown();
  const rows=currentTripJemaahList.map((j,idx)=>{ const jf=j.fields; return `<tr><td>${idx+1}</td><td class="name-col">${jf['NAME']||''}</td><td>${jf['GENDER']||''}</td><td>${jf['PASSPORT NO.']||''}</td><td>${formatDateMY(jf['DATE OF ISSUE']||jf['Date Issue']||jf['ISSUE DATE']||'')}</td><td>${formatDateMY(jf['DATE OF EXPIRE']||jf['Date Expire']||jf['EXPIRY DATE']||'')}</td><td>${formatDateMY(jf['DOB']||jf['DATE OF BIRTH']||'')}</td><td>${jf['AGE']||''}</td><td>${jf['IC NO.']||jf['IC']||''}</td><td>${jf['NATIONALITY']||'MALAYSIA'}</td></tr>`; }).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Manifest - ${displayTitle}</title><style>*{font-family:Arial,sans-serif;box-sizing:border-box;}body{margin:0;padding:20px;background:#fff;color:#1e293b;font-size:11px;}.header-card{border:1.5px solid #cbd5e1;border-radius:12px;padding:16px 20px;margin-bottom:16px;}.header-title{font-size:11px;font-weight:700;color:#1e40af;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:4px;}.header-trip{font-size:18px;font-weight:800;color:#0f172a;margin-bottom:12px;}.info-grid{display:grid;grid-template-columns:1.2fr 1.5fr 0.8fr 1fr 0.7fr;gap:12px;border-top:1px solid #f1f5f9;border-bottom:1px dashed #e2e8f0;padding:12px 0;margin-bottom:10px;}.info-label{font-size:10px;color:#64748b;font-weight:600;display:block;}.info-value{font-size:12px;font-weight:700;color:#0f172a;margin-top:2px;}.gender-row{display:flex;gap:20px;font-size:11px;font-weight:600;padding-top:4px;}table{width:100%;border-collapse:collapse;border:1px solid #94a3b8;font-size:10.5px;}th{background:#f1f5f9;color:#334155;font-weight:700;text-align:left;padding:8px 6px;border:1px solid #94a3b8;font-size:10px;text-transform:uppercase;}td{padding:7px 6px;border:1px solid #cbd5e1;vertical-align:top;}.name-col{font-weight:600;text-transform:uppercase;max-width:160px;}@media print{body{padding:0;}.no-print{display:none !important;}@page{size:A4 landscape;margin:10mm;}}</style></head><body><div id="manifestContent"><div class="header-card"><div class="header-title">Maklumat Trip & Penerbangan</div><div class="header-trip">${displayTitle}</div><div class="info-grid"><div><span class="info-label">Sektor</span><span class="info-value">📍 ${sektor}</span></div><div><span class="info-label">Mutawwif / Pengiring</span><span class="info-value">👤 ${mutawwif}</span></div><div><span class="info-label">Tempoh Pakej</span><span class="info-value">📅 ${tempoh}</span></div><div><span class="info-label">Penerbangan (Flight)</span><span class="info-value">✈️ ${flight}</span></div><div><span class="info-label">Total Jemaah</span><span class="info-value">👥 ${total} orang</span></div></div><div class="gender-row"><span style="font-weight:700;">📊 Gender breakdown:</span><span>👨 Male: ${gb.male}</span><span>👩 Female: ${gb.female}</span><span>🧒 Male Kids: ${gb.maleKids}</span><span>👧 Female Kids: ${gb.femaleKids}</span></div></div><table><thead><tr><th style="width:28px;">#</th><th>Nama Jemaah</th><th>Gender</th><th>Passport No.</th><th>Date Issue</th><th>Date Expire</th><th>DOB</th><th>Age</th><th>IC No.</th><th>Nationality</th></tr></thead><tbody>${rows}</tbody></table></div>${includeButtons ? `<div class="no-print" style="margin-top:20px; text-align:center;"><button onclick="window.print()" style="background:#0f172a; color:#fff; padding:10px 24px; border-radius:8px; border:none; font-weight:700; cursor:pointer; margin-right:10px;">🖨️ Print</button><button onclick="window.close()" style="background:#f1f5f9; color:#334155; padding:10px 24px; border-radius:8px; border:1px solid #cbd5e1; font-weight:700; cursor:pointer;">Tutup</button></div><script>window.onafterprint=function(){ window.close(); }; window.addEventListener('keydown', function(e){ if(e.key==='Escape'){ window.close(); } });<\/script>` : ''}</body></html>`;
}
function printTripManifest(){ const html=buildTripManifestHTML(true); const w=window.open('', '_blank'); if(!w){ alert('Popup blocked'); return; } w.document.write(html); w.document.close(); w.focus(); w.onafterprint=function(){ w.close(); }; setTimeout(()=>{ w.print(); }, 500); }
async function exportTripPdf(){
  const fileName = (selectedTripRecord ? cleanTripName(selectedTripRecord.fields['Trip']||'manifest') : 'manifest').replace(/[^a-z0-9\-_]/gi,'_') + '.pdf';
  const loadScript = (src)=> new Promise((res, rej)=>{ if(document.querySelector(`script[src="${src}"]`)) return res(); const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
  if(typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined'){ await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'); }
  if(typeof window.jspdf.jsPDF !== 'undefined' && typeof window.jspdf.jsPDF.API.autoTable === 'undefined'){ await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'); }
  const { jsPDF } = window.jspdf; const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  if(!selectedTripRecord){ alert('No trip selected'); return; }
  const f = selectedTripRecord.fields; const rawTrip = f['Trip'] || f['NAME'] || 'TBC'; const displayTitle = cleanTripName(rawTrip);
  const sektor = f['Sektor'] || '-'; const mutawwif = f['Mutawwif/Pengiring'] || '-'; const tempoh = f['Tempoh Pakej'] || '-'; const flight = f['Penerbangan'] || '-'; const total = currentTripJemaahList.length; const gb = getGenderBreakdown();
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(30, 64, 175); doc.text('MAKLUMAT TRIP & PENERBANGAN', 14, 12);
  doc.setFontSize(14); doc.setTextColor(15, 23, 42); doc.text(displayTitle, 14, 20);
  doc.setFontSize(7); doc.setTextColor(100, 116, 139); doc.setFont('helvetica','normal'); let y = 26;
  doc.text('Sektor', 14, y); doc.text('Mutawwif / Pengiring', 50, y); doc.text('Tempoh Pakej', 110, y); doc.text('Penerbangan (Flight)', 145, y); doc.text('Total Jemaah', 200, y); y+=4;
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(15, 23, 42); doc.text(sektor, 14, y); doc.text(mutawwif.substring(0,30), 50, y); doc.text(tempoh, 110, y); doc.text(flight, 145, y); doc.text(total + ' orang', 200, y);
  y+=8; doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.2); doc.line(14, y, 283, y); y+=4; doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('Gender breakdown:   Male: '+gb.male+'   Female: '+gb.female+'   Male Kids: '+gb.maleKids+'   Female Kids: '+gb.femaleKids, 14, y); y+=6;
  const tableHead = [['#', 'Nama Jemaah', 'Gender', 'Passport No.', 'Date Issue', 'Date Expire', 'DOB', 'Age', 'IC No.', 'Nationality']];
  const tableBody = currentTripJemaahList.map((j, idx)=>{ const jf=j.fields; return [idx+1, (jf['NAME']||'').toString(), (jf['GENDER']||''), (jf['PASSPORT NO.']||''), formatDateMY(jf['DATE OF ISSUE']||jf['Date Issue']||jf['ISSUE DATE']||''), formatDateMY(jf['DATE OF EXPIRE']||jf['Date Expire']||jf['EXPIRY DATE']||''), formatDateMY(jf['DOB']||jf['DATE OF BIRTH']||''), (jf['AGE']||''), (jf['IC NO.']||jf['IC']||''), (jf['NATIONALITY']||'MALAYSIA')]; });
  doc.autoTable({ startY: y+2, head: tableHead, body: tableBody, theme: 'grid', styles: { font: 'helvetica', fontSize: 8, cellPadding: 2, lineColor: [203,213,225], lineWidth: 0.2 }, headStyles: { fillColor: [241,245,249], textColor: [51,65,85], fontStyle: 'bold', fontSize: 8 }, columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 45 }, 2: { cellWidth: 18 }, 3: { cellWidth: 28 }, 4: { cellWidth: 22 }, 5: { cellWidth: 22 }, 6: { cellWidth: 22 }, 7: { cellWidth: 16 }, 8: { cellWidth: 32 }, 9: { cellWidth: 22 } }, didDrawPage: function(data){ doc.setFontSize(7); doc.setTextColor(150); doc.text('Page ' + doc.internal.getNumberOfPages(), 270, 195); } });
  doc.save(fileName);
}
// ===== MODAL HANDLED BY index.html V21 - No local override =====


function getStatusBadgeHtml(status){
  if(!status) return '<span class="text-slate-500 font-bold bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs">PAST TRIP</span>';
  let s = status.toString();
  // Remove all emoji characters commonly used
  s = s.replace(/[🟢🔴🟡⚪🟣🔵🟠⚫⚪]/g, '');
  s = s.replace(/\uD83D[\uDF00-\uDFFF]|\uD83C[\uDF00-\uDFFF]/g, '');
  let clean = s.replace(/[^A-Z ]/gi, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  if(clean.includes('AVAILABLE')){ return '<span class="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs">🟢 AVAILABLE</span>'; }
  if(clean.includes('CLOSED')){ return '<span class="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg text-xs">🔴 CLOSED</span>'; }
  if(clean.includes('ONGOING')){ return '<span class="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg text-xs">🟡 ONGOING</span>'; }
  if(clean.includes('PAST')){ return '<span class="text-slate-600 font-bold bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs">⚪ PAST TRIP</span>'; }
  return '<span class="text-slate-700 font-bold bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs">'+clean+'</span>';
}




function getAirlineBadgeStyle(airline){
  const a = (airline||'').toUpperCase().trim();
  if(a.includes('EMIRATES')) return {bg:'bg-red-50', text:'text-red-700', border:'border-red-200', dot:'bg-[#D71921]', dotText:'●'};
  if(a.includes('OMAN')) return {bg:'bg-[#FFF8E7]', text:'text-[#8B6F47]', border:'border-[#E8D5B5]', dot:'bg-[#C5A880]', dotText:'●'};
  if(a.includes('QATAR')) return {bg:'bg-[#FDF0F3]', text:'text-[#5C0D2F]', border:'border-[#E8C4CC]', dot:'bg-[#5C0D2F]', dotText:'●'};
  if(a.includes('SAUDIA') || a.includes('SAUDI')) return {bg:'bg-green-50', text:'text-green-800', border:'border-green-200', dot:'bg-[#006C35]', dotText:'●'};
  if(a.includes('TURKISH')) return {bg:'bg-red-50', text:'text-red-800', border:'border-red-200', dot:'bg-[#C70A0C]', dotText:'●'};
  if(a.includes('MALAYSIA') || a==='MAS' || a.includes(' MALAYSIA AIR')) return {bg:'bg-blue-50', text:'text-blue-800', border:'border-blue-200', dot:'bg-[#003B95]', dotText:'●'};
  if(a.includes('ETIHAD')) return {bg:'bg-amber-50', text:'text-amber-900', border:'border-amber-200', dot:'bg-[#C9A86A]', dotText:'●'};
  if(a.includes('KUWAIT')) return {bg:'bg-sky-50', text:'text-sky-800', border:'border-sky-200', dot:'bg-[#0071BB]', dotText:'●'};
  
  // For any new airline - generate consistent color from name hash
  if(!a || a==='N/A') return {bg:'bg-slate-100', text:'text-slate-500', border:'border-slate-200', dot:'bg-slate-400', dotText:'●'};
  
  const palette = [
    {bg:'bg-orange-50', text:'text-orange-800', border:'border-orange-200', dot:'bg-orange-600'},
    {bg:'bg-blue-50', text:'text-blue-800', border:'border-blue-200', dot:'bg-blue-600'},
    {bg:'bg-purple-50', text:'text-purple-800', border:'border-purple-200', dot:'bg-purple-600'},
    {bg:'bg-pink-50', text:'text-pink-800', border:'border-pink-200', dot:'bg-pink-600'},
    {bg:'bg-teal-50', text:'text-teal-800', border:'border-teal-200', dot:'bg-teal-600'},
    {bg:'bg-indigo-50', text:'text-indigo-800', border:'border-indigo-200', dot:'bg-indigo-600'},
    {bg:'bg-amber-50', text:'text-amber-800', border:'border-amber-200', dot:'bg-amber-600'},
    {bg:'bg-cyan-50', text:'text-cyan-800', border:'border-cyan-200', dot:'bg-cyan-600'},
  ];
  // Simple hash
  let hash = 0;
  for(let i=0;i<a.length;i++){ hash = (hash*31 + a.charCodeAt(i)) % 100000; }
  const picked = palette[hash % palette.length];
  return {...picked, dotText:'●'};
}
function getAirlineBadgeHtml(airline, isSelected){
  const style = getAirlineBadgeStyle(airline);
  if(isSelected){
    return `<span class="bg-white/15 text-white border border-white/20 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5 w-fit"><span class="w-3.5 h-3.5 rounded-full ${style.dot} flex items-center justify-center text-[8px] text-white"></span>${airline}</span>`;
  }
  return `<span class="${style.bg} ${style.text} ${style.border} border text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5 w-fit"><span class="w-3.5 h-3.5 rounded-full ${style.dot} flex items-center justify-center text-[8px] text-white"></span>${airline}</span>`;
}

