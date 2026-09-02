var allRoomingRecords = window.allRoomingRecords || [];
var allRoomingJemaah = window.allRoomingJemaah || [];
var activeLocation = window.activeLocation || localStorage.getItem('effah_active_location') || 'MEKAH';
// CACHE FIX FOR TAB SWITCH - prevent reload when switching tabs - V103.28 PATCH V4
var _roomingLastTripId = window._roomingLastTripId || null;
var _roomingCacheTime = window._roomingCacheTime || 0;
var _roomingIsLoading = false;
var _roomingFirstLoadDone = window._roomingFirstLoadDone || false;
var _staffCache = window._staffCache || {};
window._roomingLastTripId = _roomingLastTripId;
window._roomingFirstLoadDone = _roomingFirstLoadDone;
window._staffCache = _staffCache;
// On page reload, clear cache time to force first fetch with spinner
if(!_roomingFirstLoadDone){
  _roomingCacheTime = 0;
  window._roomingCacheTime = 0;
}
var roomingDefaultCap = 4;
var customLocations = window.customLocations || JSON.parse(localStorage.getItem('effah_custom_locations')||'[]');
var staffList = window.staffList || [];

var staffIdCounter = window.staffIdCounter || parseInt(localStorage.getItem('effah_staff_counter')||'1000');
var roomingSortDir = window.roomingSortDir || localStorage.getItem('effah_rooming_sort_dir') || 'asc';
var roomingSortActive = typeof window.roomingSortActive !== 'undefined' ? window.roomingSortActive : (localStorage.getItem('effah_rooming_sort_active') === 'true' ? true : false);
window.allRoomingRecords = allRoomingRecords;
window.allRoomingJemaah = allRoomingJemaah;
window.activeLocation = activeLocation;
window.staffList = staffList;
window.staffIdCounter = staffIdCounter;
function getStaffStorageKey(){ return `effah_staff_list_${activeLocation}_${window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'}`; }
function saveStaffList(){ try{ localStorage.setItem(getStaffStorageKey(), JSON.stringify(staffList)); localStorage.setItem('effah_staff_board_'+activeLocation, JSON.stringify(staffList)); }catch(e){} }


async function loadStaffList(){
  try{
    const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'';
    const filter = tripId ? `FIND("${tripId}", ARRAYJOIN({TRIP}))` : '';
    let allStaff = [];
    try{ allStaff = await effahGetAll('STAFF', filter); }catch(e){ console.warn('Staff proxy fail, fallback local', e); }
    let filtered=allStaff;
    staffList=filtered.map(r=>({
      id:r.id, airtableId:r.id, name:r.fields['NAME']||'', boardBasis:r.fields['BOARD BASIS']||'', train:!!r.fields['TRAIN'], sortNumber:r.fields['SORT NUMBER']||9999, trip:r.fields['TRIP']||[], roomIds: r.fields['ROOMING LIST'] || [], roomLink: (r.fields['ROOMING LIST']||[])[0]||null
    }));
    staffList.sort((a,b)=>(a.sortNumber||9999)-(b.sortNumber||9999));
    if(staffList.length===0){
      const local=JSON.parse(localStorage.getItem(getStaffStorageKey())||'[]');
      if(local.length>0) staffList=local;
    }
    try{ const cacheKey = tripId || 'default'; _staffCache[cacheKey] = JSON.parse(JSON.stringify(staffList)); window._staffCache = _staffCache; }catch(e){}
    renderStaffList(); renderRoomingGrid(); try{ updateVisaCountBadge(); }catch(e){}
    try{ renderRoomingOverview(allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase())); }catch(e){}
  }catch(e){
    console.error('loadStaffList failed', e);
    staffList=JSON.parse(localStorage.getItem(getStaffStorageKey())||'[]');
    renderStaffList();
  }
}