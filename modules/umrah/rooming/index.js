// index.js V103.43
console.log('ROOMING INDEX V103.43 clean');
document.addEventListener('DOMContentLoaded', async () => {
  if(typeof populateRoomingTripDropdown==='function'){ try{ await populateRoomingTripDropdown(); }catch(e){ console.error(e); } }
  const savedTrip = localStorage.getItem('effah_active_trip_id') || '';
  const sel = document.getElementById('roomingTripSelect');
  if(savedTrip && sel){ sel.value=savedTrip; window.selectedTripRecord={id:savedTrip}; if(typeof fetchRoomingData==='function') await fetchRoomingData(true); }
  setTimeout(async()=>{ if(typeof loadStaffList==='function' && (!staffList||staffList.length===0)) await loadStaffList(); if(typeof updateVisaCountBadge==='function') updateVisaCountBadge(); },600);
});
