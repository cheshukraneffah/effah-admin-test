
// FIX - missing helpers from original rooming.js
function isStaffAssignedInLocation(staffId, location){
  if(!staffId || !location) return false;
  try{
    const locUpper = location.toUpperCase();
    const roomsInLoc = (window.allRoomingRecords||allRoomingRecords||[]).filter(r=>{
      const l = (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase();
      return l===locUpper;
    });
    for(let room of roomsInLoc){
      const staffListField = room.fields['STAFF LIST (ROOMING)']||room.fields['STAFF']||[];
      if(Array.isArray(staffListField) && staffListField.includes(staffId)) return true;
      const staffExtra = (room.fields['STAFF / EXTRA']||'').toString();
      const staffRec = (window.staffList||[]).find(s=>s.id===staffId||s.airtableId===staffId);
      if(staffRec && staffExtra.includes(staffRec.name)) return true;
    }
    return false;
  }catch(e){ return false; }
}

function isJemaahAssignedInLocation(jemaahId, location){
  if(!jemaahId || !location) return false;
  try{
    const locUpper = location.toUpperCase();
    const roomsInLoc = (window.allRoomingRecords||allRoomingRecords||[]).filter(r=>{
      const l = (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase();
      return l===locUpper;
    });
    for(let room of roomsInLoc){
      const jemaahField = room.fields['JEMAAH']||room.fields['JEMAAH LIST']||[];
      if(Array.isArray(jemaahField) && jemaahField.includes(jemaahId)) return true;
    }
    return false;
  }catch(e){ return false; }
}

async function populateRoomingTripDropdown(){
  try{
    const sel = document.getElementById('roomingTripSelect');
    if(!sel) return;
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
    const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    if(!base||!pat){
      console.warn('populateRoomingTripDropdown: no airtable config');
      return;
    }
    // Try to use cached trips from localStorage or window
    let trips = [];
    try{
      const cached = localStorage.getItem('effah_trips_cache');
      if(cached){
        trips = JSON.parse(cached);
      }
    }catch(e){}
    
    if(trips.length===0){
      // Fetch TRIP table
      let allTrips=[], offset='';
      do{
        const res=await fetch(`https://api.airtable.com/v0/${base}/TRIP?pageSize=100${offset?`&offset=${offset}`:''}&sort%5B0%5D%5Bfield%5D=DATE&sort%5B0%5D%5Bdirection%5D=desc`,{headers:{Authorization:`Bearer ${pat}`}});
        if(!res.ok) break;
        const data=await res.json();
        if(data.records) allTrips=allTrips.concat(data.records);
        offset=data.offset||'';
      }while(offset);
      trips = allTrips.map(r=>({id:r.id, name: r.fields['TRIP NAME']||r.fields['NAME']||r.fields['NAMA TRIP']||r.id}));
      try{ localStorage.setItem('effah_trips_cache', JSON.stringify(trips.slice(0,50))); }catch(e){}
    }
    
    const currentVal = sel.value || localStorage.getItem('effah_active_trip_id') || '';
    sel.innerHTML = '<option value="">Pilih Trip...</option>' + trips.map(t=>{
      const cleanName = (typeof cleanTripNameForRooming==='function'? cleanTripNameForRooming(t.name) : t.name);
      return `<option value="${t.id}" ${t.id===currentVal?'selected':''}>${cleanName}</option>`;
    }).join('');
    
    console.log('populateRoomingTripDropdown done', trips.length);
  }catch(e){
    console.error('populateRoomingTripDropdown error', e);
  }
}

function onRoomingTripChange(tripId){
  if(!tripId) return;
  localStorage.setItem('effah_active_trip_id', tripId);
  localStorage.setItem('selectedTripId', tripId);
  window.selectedTripRecord = {id: tripId};
  if(typeof fetchRoomingData==='function'){
    fetchRoomingData(true).then(()=>{
      if(typeof loadStaffList==='function') loadStaffList();
    });
  }
}

window.isStaffAssignedInLocation = isStaffAssignedInLocation;
window.isJemaahAssignedInLocation = isJemaahAssignedInLocation;
window.populateRoomingTripDropdown = populateRoomingTripDropdown;
window.onRoomingTripChange = onRoomingTripChange;
console.log('FIX helpers loaded');
