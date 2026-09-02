// composables/use-rooming-data.js V103.38 PROXY ONLY - FIX 422 & 403
// No fields[] filter, only filterByFormula=FIND(tripId)

async function fetchRoomingData(force=false){
  try{
    const tripId = window.selectedTripRecord?.id || localStorage.getItem('effah_active_trip_id') || '';
    if(!tripId){ console.warn('No tripId for rooming fetch'); return; }
    if(!force && _roomingLastTripId===tripId && (Date.now()-_roomingCacheTime)<60000 && allRoomingRecords.length>0){ console.log('Using cached rooming'); renderRoomingGrid(); return; }
    showRoomingLoading && showRoomingLoading();
    const filterRoom = `FIND("${tripId}", ARRAYJOIN({TRIP}))`;
    const filterPax = `FIND("${tripId}", ARRAYJOIN({TRIP}))`;
    // ROOMING LIST - KAPASITI exists here only
    const roomingRecs = await effahGetAll(EFFAH_T.ROOMING, filterRoom);
    // DATA JEMAAH - BOARD BASIS exists here, FULLBOARD does NOT, KAPASITI does NOT
    const paxRecs = await effahGetAll(EFFAH_T.PAX, filterPax);
    allRoomingRecords = roomingRecs;
    allRoomingJemaah = paxRecs;
    window.allRoomingRecords = allRoomingRecords;
    window.allRoomingJemaah = allRoomingJemaah;
    _roomingLastTripId = tripId;
    _roomingCacheTime = Date.now();
    window._roomingLastTripId = tripId;
    window._roomingCacheTime = _roomingCacheTime;
    console.log(`Fetched ROOMING:${roomingRecs.length} PAX:${paxRecs.length}`);
    renderRoomingGrid && renderRoomingGrid();
    renderRoomingOverview && renderRoomingOverview(allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase()));
    updateVisaCountBadge && updateVisaCountBadge();
  }catch(e){ console.error('fetchRoomingData proxy failed', e); }
  finally{ hideRoomingLoading && hideRoomingLoading(); }
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
    try{ const cacheKey = tripId || 'default'; _staffCache[cacheKey] = JSON.parse(JSON.stringify(staffList)); window._staffCache = _staffCache; }catch(e){}
    renderStaffList && renderStaffList();
    renderRoomingGrid && renderRoomingGrid();
  }catch(e){ console.error('loadStaffList proxy failed', e); }
}
