// index.js V103.38
console.log('ROOMING INDEX V103.38 modular full loaded');
document.addEventListener('DOMContentLoaded', async () => {
  if(typeof populateRoomingTripDropdown==='function'){ try{ await populateRoomingTripDropdown(); }catch(e){} }
  const savedTrip = localStorage.getItem('effah_active_trip_id') || '';
  const sel = document.getElementById('roomingTripSelect');
  if(savedTrip && sel){ sel.value=savedTrip; window.selectedTripRecord={id:savedTrip}; if(typeof fetchRoomingData==='function') await fetchRoomingData(true); }
  setTimeout(async()=>{ if(typeof loadStaffList==='function' && (!staffList||staffList.length===0)) await loadStaffList(); updateVisaCountBadge && updateVisaCountBadge(); },600);
});
document.addEventListener('DOMContentLoaded', ()=>{
  const sel=document.getElementById('roomingTripSelect');
  if(sel) sel.addEventListener('change', async(e)=>{ const tripId=e.target.value; if(!tripId) return; localStorage.setItem('effah_active_trip_id',tripId); window.selectedTripRecord={id:tripId}; if(typeof fetchRoomingData==='function'){ await fetchRoomingData(true); if(typeof loadStaffList==='function') await loadStaffList(); } });
});
