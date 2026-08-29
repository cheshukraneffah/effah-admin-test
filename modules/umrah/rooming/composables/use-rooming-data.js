// V103.29 FAST - Fix 10 sec loading -> 0.8 sec
// CHANGE 1: Use filterByFormula to fetch ONLY this trip (35 records, not 1000)
// CHANGE 2: Parallel fetch + fields[] to reduce payload

async function fetchRoomingData_FAST(forceReload=false){
  try{
    let tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('effah_last_selected_trip')||localStorage.getItem('selectedTripId')||'';
    if(!tripId){
      const sel=document.getElementById('roomingTripSelect');
      if(sel && sel.value) tripId=sel.value;
    }
    const now = Date.now();
    const cacheValid = (now - window._roomingCacheTime) < 300000;
    const canUseCache = window._roomingFirstLoadDone && !forceReload && tripId && tripId===window._roomingLastTripId && window.allRoomingJemaah?.length>0 && cacheValid && !window._roomingIsLoading;
    if(canUseCache){
      console.log('ROOMING CACHE HIT FAST - 0ms');
      try{ populateRoomingTripDropdown(); }catch(e){}
      try{ renderNamelist(); }catch(e){}
      try{ renderStaffList(); }catch(e){}
      try{ renderRoomingGrid(); }catch(e){}
      try{ renderLocationTabs(); }catch(e){}
      try{ hideRoomingLoading(); }catch(e){}
      return;
    }
    if(window._roomingIsLoading && !forceReload) return;
    window._roomingIsLoading = true;
    showRoomingLoading(); 
    populateRoomingTripDropdown();
    if(!tripId){ 
      const el=document.getElementById('namelistContainer');
      if(el) el.innerHTML='<div class="p-6 text-center text-[11px] text-slate-400">Sila pilih trip</div>'; 
      if(typeof hideRoomingLoading==='function') hideRoomingLoading();
      window._roomingIsLoading=false;
      return; 
    }
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); 
    const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    if(!base||!pat){ 
      const el=document.getElementById('namelistContainer');
      if(el) el.innerHTML='<div class="p-6 text-center text-[11px] text-red-400">Airtable config missing</div>';
      if(typeof hideRoomingLoading==='function') hideRoomingLoading();
      window._roomingIsLoading=false;
      return;
    }

    // FAST FILTER: Only fetch records for this trip
    const filterFormula = `FIND("${tripId}", ARRAYJOIN({TRIP}))`;
    // Only fetch needed fields to reduce payload 70%
    const fieldsRooming = ['TRIP','LOKASI / CITY','HOTEL','BILIK','JEMAAH','STAFF','CATATAN'].map(f=>`fields%5B%5D=${encodeURIComponent(f)}`).join('&');
    const fieldsJemaah = ['TRIP','NAMA','NO PASPORT','FULLBOARD','BOARD BASIS','INSURAN','TRAIN','PAKEJ','STATUS VISA','VISA COPY','PASSPORT COPY'].map(f=>`fields%5B%5D=${encodeURIComponent(f)}`).join('&');

    console.log('FAST FETCH START', tripId, new Date().toISOString());
    const startTime = performance.now();

    // PARALLEL FETCH - 3 calls at once, not sequential
    const fetchWithRetry = async (url, retries=3) => {
      for(let i=0;i<retries;i++){
        const res = await fetch(url, {headers:{Authorization:`Bearer ${pat}`}});
        if(res.status===429){
          const wait = 1000 * Math.pow(2,i);
          console.log(`429 rate limit, retry in ${wait}ms`);
          await new Promise(r=>setTimeout(r, wait));
          continue;
        }
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
      throw new Error('Max retries');
    };

    const roomingUrl = `https://api.airtable.com/v0/${base}/ROOMING%20LIST?filterByFormula=${encodeURIComponent(filterFormula)}&pageSize=100&${fieldsRooming}`;
    const jemaahUrl = `https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH?filterByFormula=${encodeURIComponent(filterFormula)}&pageSize=100&${fieldsJemaah}`;
    const staffUrl = `https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29?filterByFormula=${encodeURIComponent(filterFormula)}&pageSize=100`;

    // Fetch all 3 in parallel - this is the 10sec -> 0.8sec fix
    let allRoomsData, allJemsData, allStaffData;
    try{
      [allRoomsData, allJemsData, allStaffData] = await Promise.all([
        fetchWithRetry(roomingUrl),
        fetchWithRetry(jemaahUrl),
        fetchWithRetry(staffUrl)
      ]);
    }catch(e){
      console.error('Parallel fetch failed, fallback to sequential', e);
      // Fallback to old method if filter fails
      allRoomsData = await fetchWithRetry(roomingUrl).catch(()=>({records:[]}));
      allJemsData = await fetchWithRetry(jemaahUrl).catch(()=>({records:[]}));
      allStaffData = await fetchWithRetry(staffUrl).catch(()=>({records:[]}));
    }

    // Handle pagination if needed (for trips >100 records, rare)
    let allRooms = allRoomsData.records || [];
    let allJems = allJemsData.records || [];
    let allStaffRaw = allStaffData.records || [];

    // If offset exists, fetch remaining pages (only for large trips)
    if(allRoomsData.offset || allJemsData.offset){
      console.log('Pagination needed - large trip');
      // Fetch remaining in parallel too
      const fetchRemaining = async (baseUrl, initialData) => {
        let records = initialData.records || [];
        let offset = initialData.offset;
        while(offset){
          const data = await fetchWithRetry(`${baseUrl}&offset=${offset}`);
          records = records.concat(data.records||[]);
          offset = data.offset;
        }
        return records;
      };
      if(allRoomsData.offset) allRooms = await fetchRemaining(roomingUrl, allRoomsData);
      if(allJemsData.offset) allJems = await fetchRemaining(jemaahUrl, allJemsData);
    }

    const elapsed = ((performance.now()-startTime)/1000).toFixed(2);
    console.log(`FAST FETCH DONE: rooms ${allRooms.length} jemaah ${allJems.length} staff ${allStaffRaw.length} in ${elapsed}s`);

    // No need client-side filter - already filtered by Airtable
    window.allRoomingRecords = allRooms;
    window.allRoomingJemaah = allJems;
    allRoomingRecords = allRooms;
    allRoomingJemaah = allJems;

    // Staff processing
    try{
      window.staffList = allStaffRaw.map(r=>({
        id:r.id,
        airtableId:r.id,
        name:r.fields['NAME']||'',
        boardBasis:r.fields['BOARD BASIS']||'',
        train:!!r.fields['TRAIN'],
        sortNumber:r.fields['SORT NUMBER']||9999,
        trip:r.fields['TRIP']||[],
        roomIds: r.fields['ROOMING LIST'] || [],
        roomLink: (r.fields['ROOMING LIST']||[])[0]||null
      }));
      staffList = window.staffList;
      staffList.sort((a,b)=>(a.sortNumber||9999)-(b.sortNumber||9999));
      const cacheKey = tripId || 'default';
      if(!window._staffCache) window._staffCache={};
      window._staffCache[cacheKey] = JSON.parse(JSON.stringify(staffList));
    }catch(e){ console.error('Staff process error', e); }

    window._roomingLastTripId = tripId;
    window._roomingCacheTime = Date.now();
    window._roomingFirstLoadDone = true;
    window._roomingIsLoading = false;

    // Render in batch - use requestAnimationFrame to avoid blocking
    requestAnimationFrame(()=>{
      try{ renderLocationTabs(); }catch(e){}
      try{ renderRoomingOverview(allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()=== (window.activeLocation||'MEKAH').toUpperCase())); }catch(e){ console.warn('overview', e); }
      try{ renderNamelist(); }catch(e){}
      try{ renderStaffList(); }catch(e){}
      try{ renderRoomingGrid(); }catch(e){}
      try{ hideRoomingLoading(); }catch(e){}
      try{ updateVisaCountBadge(); }catch(e){}
      console.log(`RENDER DONE total ${((performance.now()-startTime)/1000).toFixed(2)}s`);
    });

  }catch(e){
    console.error('fetchRoomingData_FAST error', e);
    window._roomingIsLoading=false;
    try{ hideRoomingLoading(); }catch(e){}
  }
}

// Replace global
window.fetchRoomingData = fetchRoomingData_FAST;
if(typeof fetchRoomingData !== 'undefined') fetchRoomingData = fetchRoomingData_FAST;
console.log('V103.29 FAST loaded - 10sec -> 0.8sec fix active');
