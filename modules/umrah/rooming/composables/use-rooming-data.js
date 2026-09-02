// V103.36 PROXY FAST - uses effah-proxy + TABLE_IDS
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
    const base=window.AIRTABLE_BASE_ID||window.DEFAULT_BASE_ID||'appSsn4JyQD4DnYu0'; 
    const proxy=window.PROXY_URL||'https://effah-proxy.cheshukran-effah.workers.dev/api';
    const tbl=window.TABLE_IDS||{ ROOMING:'tblENHq0C677SoO8O', PAX:'tblsiSgXa9DxX3z9v', STAFF:'tblssYikTs4GOndyf', TRIP:'tbl5Pbn2HkVsev5Uy' };

    // FAST FILTER: Only fetch records for this trip
    const filterFormula = `FIND("${tripId}", ARRAYJOIN({TRIP}))`;
    const fieldsRooming = ['TRIP','LOKASI / CITY','HOTEL NAME','HOTEL','BILIK','JEMAAH','STAFF LIST (ROOMING)','CATATAN BILIK','KAPASITI'].map(f=>`fields%5B%5D=${encodeURIComponent(f)}`).join('&');
    const fieldsJemaah = ['TRIP','NAME','PASSPORT NO.','FULLBOARD','BOARD BASIS','INSURAN','TRAIN','PAKEJ','STATUS VISA','VISA COPY','PASSPORT COPY','GENDER'].map(f=>`fields%5B%5D=${encodeURIComponent(f)}`).join('&');

    console.log('FAST FETCH PROXY START', tripId, new Date().toISOString());
    const startTime = performance.now();

    const fetchWithRetry = async (url, retries=3) => {
      for(let i=0;i<retries;i++){
        const res = await fetch(url);
        if(res.status===429){
          const wait = 1000 * Math.pow(2,i);
          console.log(`429 rate limit, retry in ${wait}ms`);
          await new Promise(r=>setTimeout(r, wait));
          continue;
        }
        if(!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
        return res.json();
      }
      throw new Error('Max retries');
    };

    const roomingUrl = `${proxy}/${base}/${tbl.ROOMING}?filterByFormula=${encodeURIComponent(filterFormula)}&pageSize=100&${fieldsRooming}`;
    const jemaahUrl = `${proxy}/${base}/${tbl.PAX}?filterByFormula=${encodeURIComponent(filterFormula)}&pageSize=100&${fieldsJemaah}`;
    const staffUrl = `${proxy}/${base}/${tbl.STAFF}?filterByFormula=${encodeURIComponent(filterFormula)}&pageSize=100`;

    let allRoomsData, allJemsData, allStaffData;
    try{
      [allRoomsData, allJemsData, allStaffData] = await Promise.all([
        fetchWithRetry(roomingUrl),
        fetchWithRetry(jemaahUrl),
        fetchWithRetry(staffUrl)
      ]);
    }catch(e){
      console.error('Parallel fetch failed, fallback to sequential', e);
      allRoomsData = await fetchWithRetry(roomingUrl).catch(()=>({records:[]}));
      allJemsData = await fetchWithRetry(jemaahUrl).catch(()=>({records:[]}));
      allStaffData = await fetchWithRetry(staffUrl).catch(()=>({records:[]}));
    }

    let allRooms = allRoomsData.records || [];
    let allJems = allJemsData.records || [];
    let allStaffRaw = allStaffData.records || [];

    if(allRoomsData.offset || allJemsData.offset){
      console.log('Pagination needed - large trip');
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

    window.allRoomingRecords = allRooms;
    window.allRoomingJemaah = allJems;
    allRoomingRecords = allRooms;
    allRoomingJemaah = allJems;

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

window.fetchRoomingData = fetchRoomingData_FAST;
if(typeof fetchRoomingData !== 'undefined') fetchRoomingData = fetchRoomingData_FAST;
console.log('V103.36 PROXY FAST loaded - proxy + table IDs');
