// composables/use-rooming-data.js V103.39 - uses TABLE KEYS with fallback
async function fetchRoomingData(force=false){
  try{
    const tripId = window.selectedTripRecord?.id || localStorage.getItem('effah_active_trip_id') || '';
    if(!tripId){ console.warn('No tripId'); return; }
    showRoomingLoading();
    const filter = `FIND("${tripId}", ARRAYJOIN({TRIP}))`;
    console.log('Fetching ROOMING & PAX with filter', filter);
    const roomingRecs = await effahGetAll('ROOMING', filter);
    const paxRecs = await effahGetAll('PAX', filter);
    allRoomingRecords = roomingRecs;
    allRoomingJemaah = paxRecs;
    window.allRoomingRecords = roomingRecs;
    window.allRoomingJemaah = paxRecs;
    _roomingLastTripId = tripId;
    _roomingCacheTime = Date.now();
    console.log(`OK ROOMING:${roomingRecs.length} PAX:${paxRecs.length}`);
    renderRoomingGrid && renderRoomingGrid();
    renderRoomingOverview && renderRoomingOverview(allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase()));
    updateVisaCountBadge && updateVisaCountBadge();
  }catch(e){ console.error('fetchRoomingData failed', e); }
  finally{ hideRoomingLoading(); }
}

async function loadStaffList(){
  try{
    const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'';
    const filter = tripId ? `FIND("${tripId}", ARRAYJOIN({TRIP}))` : '';
    const allStaff = await effahGetAll('STAFF', filter);
    staffList=allStaff.map(r=>({
      id:r.id, airtableId:r.id, name:r.fields['NAME']||'',
      boardBasis:r.fields['BOARD BASIS']||'', train:!!r.fields['TRAIN'],
      sortNumber:r.fields['SORT NUMBER']||9999, trip:r.fields['TRIP']||[],
      roomIds: r.fields['ROOMING LIST'] || [], roomLink: (r.fields['ROOMING LIST']||[])[0]||null
    }));
    staffList.sort((a,b)=>(a.sortNumber||9999)-(b.sortNumber||9999));
    renderStaffList && renderStaffList();
    renderRoomingGrid && renderRoomingGrid();
  }catch(e){ console.error('loadStaffList failed', e); }
}

function onRoomingTripChange(){ const sel=document.getElementById('roomingTripSelect'); if(sel){ localStorage.setItem('effah_active_trip_id', sel.value); window.selectedTripRecord={id:sel.value}; fetchRoomingData(true); } }

async function populateRoomingTripDropdown(){
  try{
    const trips = await effahGetAll('TRIP', '');
    const sel=document.getElementById('roomingTripSelect');
    if(!sel) return;
    sel.innerHTML='<option value="">-- Pilih Trip --</option>';
    trips.forEach(t=>{ const opt=document.createElement('option'); opt.value=t.id; opt.textContent=t.fields['TRIP NAME']||t.fields['NAMA TRIP']||t.id; sel.appendChild(opt); });
    const saved=localStorage.getItem('effah_active_trip_id'); if(saved) sel.value=saved;
  }catch(e){ console.error('populate trips failed', e); }
}
