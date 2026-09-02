// core/state.js V103.38 PROXY ONLY
console.log('ROOMING STATE V103.38 loaded');
var allRoomingRecords = window.allRoomingRecords || [];
var allRoomingJemaah = window.allRoomingJemaah || [];
var activeLocation = window.activeLocation || localStorage.getItem('effah_active_location') || 'MEKAH';
var _roomingLastTripId = window._roomingLastTripId || null;
var _roomingCacheTime = window._roomingCacheTime || 0;
var _roomingIsLoading = false;
var _roomingFirstLoadDone = window._roomingFirstLoadDone || false;
var _staffCache = window._staffCache || {};
var _autoScrollInterval = window._autoScrollInterval || null;
window._roomingDragListenersAdded = window._roomingDragListenersAdded || false;
var roomingDefaultCap = 4;
var customLocations = window.customLocations || JSON.parse(localStorage.getItem('effah_custom_locations')||'[]');
var staffList = window.staffList || [];
var staffIdCounter = window.staffIdCounter || parseInt(localStorage.getItem('effah_staff_counter')||'1000');
var roomingSortDir = window.roomingSortDir || localStorage.getItem('effah_rooming_sort_dir') || 'asc';
var roomingSortActive = typeof window.roomingSortActive !== 'undefined' ? window.roomingSortActive : (localStorage.getItem('effah_rooming_sort_active') === 'true');
window.allRoomingRecords = allRoomingRecords;
window.allRoomingJemaah = allRoomingJemaah;
window.activeLocation = activeLocation;
window.staffList = staffList;
function getStaffStorageKey(){ return `effah_staff_list_${activeLocation}_${window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'}`; }
function saveStaffList(){ try{ localStorage.setItem(getStaffStorageKey(), JSON.stringify(staffList)); localStorage.setItem('effah_staff_board_'+activeLocation, JSON.stringify(staffList)); }catch(e){} }
