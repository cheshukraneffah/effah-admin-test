// INDEX - entry point - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports

// rooming/index.js - Entry point modular - loads in correct order to preserve window.* globals
// Order matters! core -> header -> overview -> data -> grid -> staff -> modals -> print -> download

console.log('ROOMING MODULAR v1.0 loaded - split from 3669 lines into 10 components');

// The files are loaded via <script> tags in index.html in this order
// This index.js just verifies all functions exist

function checkModularLoad(){
  const required = [
    'renderRoomingHTML',
    'fetchRoomingData',
    'renderRoomingOverview',
    'renderRoomingGrid',
    'loadStaffList',
    'generateRoomingPrint',
    'downloadHotelDocs',
    'updateVisaCountBadge'
  ];
  const missing = required.filter(fn => typeof window[fn] !== 'function' && typeof window[fn] !== 'object');
  if(missing.length>0){
    console.warn('Modular check - missing:', missing);
  } else {
    console.log('Modular check OK - all 8 core functions loaded');
    console.log(`allRoomingRecords: ${window.allRoomingRecords?.length || 0}, allRoomingJemaah: ${window.allRoomingJemaah?.length || 0}`);
  }
}

setTimeout(checkModularLoad, 1000);

if(typeof window.switchTab !== 'undefined'){
  const originalSwitchTab = window.switchTab;
  // keep existing
}

