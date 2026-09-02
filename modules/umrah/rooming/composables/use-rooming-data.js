// composables/use-rooming-data.js V103.38 PROXY ONLY - balanced braces fixed
// composables/use-rooming-data.js V103.38 PROXY ONLY - FIX 404 + 422
// No fields[] filter, no base param, only table + filterByFormula

async function fetchRoomingData(force=false){
  try{
    const tripId = window.selectedTripRecord?.id || localStorage.getItem('effah_active_trip_id') || '';
    if(!tripId){ console.warn('No tripId'); return; }
    if(!force && _roomingLastTripId===tripId && (Date.now()-_roomingCacheTime)<60000 && allRoomingRecords.length>0){ renderRoomingGrid && renderRoomingGrid(); return; }
    showRoomingLoading();
    const filter = `FIND("${tripId}", ARRAYJOIN({TRIP}))`;
    console.log('Proxy fetching with filter', filter);
    const roomingRecs = await effahGetAll(EFFAH_T.ROOMING, filter);
    const paxRecs = await effahGetAll(EFFAH_T.PAX, filter);
    allRoomingRecords = roomingRecs;
    allRoomingJemaah = paxRecs;
    window.allRoomingRecords = roomingRecs;
    window.allRoomingJemaah = paxRecs;
    _roomingLastTripId = tripId;
    _roomingCacheTime = Date.now();
    console.log(`ROOMING:${roomingRecs.length} PAX:${paxRecs.length}`);
    renderRoomingGrid && renderRoomingGrid();
    renderRoomingOverview && renderRoomingOverview(allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase()));
    updateVisaCountBadge && updateVisaCountBadge();
  }catch(e){ console.error('fetchRoomingData proxy failed', e); }
  finally{ hideRoomingLoading(); }
}

async function loadStaffList(){
  try{
    const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'';
    const filter = tripId ? `FIND("${tripId}", ARRAYJOIN({TRIP}))` : '';
    const allStaff = await effahGetAll(EFFAH_T.STAFF, filter);
    staffList=allStaff.map(r=>({
      id:r.id, airtableId:r.id, name:r.fields['NAME']||'',
      boardBasis:r.fields['BOARD BASIS']||'', train:!!r.fields['TRAIN'],
      sortNumber:r.fields['SORT NUMBER']||9999, trip:r.fields['TRIP']||[],
      roomIds: r.fields['ROOMING LIST'] || [], roomLink: (r.fields['ROOMING LIST']||[])[0]||null
    }));
    staffList.sort((a,b)=>(a.sortNumber||9999)-(b.sortNumber||9999));
    try{ _staffCache[tripId||'default']=JSON.parse(JSON.stringify(staffList)); }catch(e){}
    renderStaffList && renderStaffList();
    renderRoomingGrid && renderRoomingGrid();
  }catch(e){ console.error('loadStaffList proxy failed', e); }
}

function onRoomingTripChange(){ const sel=document.getElementById('roomingTripSelect'); if(sel){ localStorage.setItem('effah_active_trip_id', sel.value); window.selectedTripRecord={id:sel.value}; fetchRoomingData(true); } }
async function populateRoomingTripDropdown(){
  try{
    const trips = await effahGetAll(EFFAH_T.TRIP, '');
    const sel=document.getElementById('roomingTripSelect');
    if(!sel) return;
    sel.innerHTML='<option value="">-- Pilih Trip --</option>';
    trips.forEach(t=>{ const opt=document.createElement('option'); opt.value=t.id; opt.textContent=t.fields['TRIP NAME']||t.fields['NAMA TRIP']||t.id; sel.appendChild(opt); });
    const saved=localStorage.getItem('effah_active_trip_id'); if(saved) sel.value=saved;
  }catch(e){ console.error('populate trips failed', e); }
}
