// components/rooming-print.js V103.38 PROXY ONLY - balanced braces fixed
function generateRoomingPrint(orientation){ orientation = orientation || 'landscape';
  try{
    const tripDropdownText = document.getElementById('roomingTripSelect')?.selectedOptions?.[0]?.textContent || '';
    const tripNameRaw = window.selectedTripRecord?.fields?.['TRIP NAME'] || window.selectedTripRecord?.fields?.Trip || window.selectedTripRecord?.fields?.Name || tripDropdownText || localStorage.getItem('effah_active_trip_name') || localStorage.getItem('effah_last_selected_trip_name') || 'TRIP';
    const tripName = cleanTripNameForRooming(tripNameRaw) || tripNameRaw || 'TRIP';
    const allLocations = ['MEKAH','MADINAH','TAIF','JEDDAH',...customLocations];
    const tripId = window.selectedTripRecord?.id || localStorage.getItem('effah_active_trip_id') || '';
    
    // NAMELIST ROWS - keep existing logic but ensure board badge shows actual value
    let combinedStaff = [...staffList].sort((a,b)=>{ try{ const na=(getJemaahName(a.fields)||a.fields['NAMA']||'').toString().toUpperCase(); const nb=(getJemaahName(b.fields)||b.fields['NAMA']||'').toString().toUpperCase(); return na.localeCompare(nb); }catch(e){ return 0; } });
    // FIX SORT A-Z untuk print
    let sortedJemaahForPrint = [...allRoomingJemaah].sort((a,b)=>{ try{ const na=(getJemaahName(a.fields)||a.fields['NAMA JEMAAH']||a.fields['NAMA']||'').toString().toUpperCase(); const nb=(getJemaahName(b.fields)||b.fields['NAMA JEMAAH']||b.fields['NAMA']||'').toString().toUpperCase(); return na.localeCompare(nb); }catch(e){ return 0; } });
    let namelistRows = sortedJemaahForPrint.map((r,i)=>{
      const f=r.fields;
      const name=getJemaahName(f);
      const fbArr=getBoardArray(f);
      let fbBadge = '-';
      if(fbArr.length>0){
        fbBadge=fbArr.map(raw=>{
          const up=raw.toUpperCase();
          let bg='#BBF7D0', border='#065F46';
          if(up.includes('MEKAH')){ bg='#FDE68A'; border='#92400E'; }
          else if(up.includes('MADINAH')){ bg='#BFDBFE'; border='#1E40AF'; }
          else if(up.includes('BOARD BASIS')){ bg='#BBF7D0'; border='#065F46'; }
          else if(up.includes('BB')){ bg='#FDE68A'; border='#92400E'; }
          return `<span style="background:${bg};border:1px solid ${border};padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;">${raw}</span>`;
        }).join('');
      }
      const train = isTrainChecked(f) ? '<span style="background:#FEF3C7;padding:1px 6px;border-radius:10px;font-size:8px">TRAIN</span>' : '-';
      const pakej = getPakejVal(f) || '-';
            const insArr = getInsuranArray(f);
      let insHtml = '-';
      if(insArr.length>0){
        insHtml=insArr.map(ins=>{
          const up=ins.toUpperCase();
          let bg='#BBF7D0', border='#065F46', color='#065F46';
          if(up==='TAKAFUL'){ bg='#BBF7D0'; border='#065F46'; color='#065F46'; }
          else if(up==='ETIQA'){ bg='#FEF3C7'; border='#92400E'; color='#92400E'; }
          else if(up.includes('KHAIRI')){ bg='#BFDBFE'; border='#1E40AF'; color='#1E40AF'; }
          return `<span style="background:${bg};border:1px solid ${border};color:${color};padding:2px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;">${ins}</span>`;
        }).join('');
      }
      
      return `<tr><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${i+1}</td><td style="border:1px solid #ddd;padding:3px 6px;font-weight:600">${name}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${fbBadge}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${train}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${pakej}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${insHtml}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">${getVisaVal(f)||'-'}</td></tr>`;
    }).join('');
    // --- STAFF IN NAMELIST (S1, S2...) ---
    const allStaffForPrint = [];
    const staffMap = {};
    if(typeof staffList!=='undefined') staffList.forEach(s=>{ if(s.name && !allStaffForPrint.includes(s.name)){ allStaffForPrint.push(s.name); staffMap[s.name]=s; } });
    if(typeof allRoomingRecords!=='undefined') allRoomingRecords.forEach(r=>{ (r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).forEach(sn=>{ const c=sn.trim(); if(c && !allStaffForPrint.includes(c)){ allStaffForPrint.push(c); if(!staffMap[c]) staffMap[c]={name:c, board:'', train:false}; } }); });
    if(typeof combinedStaff!=='undefined') combinedStaff.forEach(n=>{ const c=(typeof n==='string'?n:n.name||'').trim(); if(c && !allStaffForPrint.includes(c)){ allStaffForPrint.push(c); staffMap[c]= (typeof n==='object'?n:{name:c}); } });
    allStaffForPrint.forEach((sName, sIdx)=>{ const sObj = staffMap[sName]||{name:sName}; const cleanName=sName.replace(/\(EFFAH\)/i,'').trim(); if(!cleanName) return; const sBoardRaw = sObj.boardBasis||sObj.fields?.['BOARD']||sObj.fields?.['BOARD BASIS']||sObj.board||''; 
      const sBoardArr = (typeof getStaffBoardArray==='function'? getStaffBoardArray(sObj) : (Array.isArray(sBoardRaw)? sBoardRaw : String(sBoardRaw).split(',').map(x=>x.trim()).filter(Boolean)));
      let sBoardBadge='-'; 
      if(sBoardArr.length>0){
        sBoardBadge=sBoardArr.map(raw=>{
          const up=raw.toUpperCase();
          let bg='#BBF7D0', border='#065F46';
          if(up.includes('MEKAH')){ bg='#FDE68A'; border='#92400E'; }
          else if(up.includes('MADINAH')){ bg='#BFDBFE'; border='#1E40AF'; }
          else if(up.includes('BOARD BASIS')){ bg='#BBF7D0'; border='#065F46'; }
          else if(up.includes('BB')){ bg='#FDE68A'; border='#92400E'; }
          return `<span style="background:${bg};border:1px solid ${border};padding:1px 6px;border-radius:10px;font-weight:bold;font-size:7px;display:inline-block;margin:1px 2px;white-space:nowrap;">${raw}</span>`;
        }).join('');
      } const sTrain = sObj.train||sObj.fields?.TRAIN||false; const sTrainBadge = sTrain ? '<span style="background:#FEF3C7;padding:1px 6px;border-radius:10px;font-size:8px">TRAIN</span>' : '-'; namelistRows+=`<tr style="background:#FDF2F4"><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#F9D5D9;font-weight:bold;color:#7A0C2E">S${sIdx+1}</td><td style="border:1px solid #ddd;padding:3px 6px;font-weight:700;background:#FDF2F4;color:#7A0C2E">${cleanName} (EFFAH)</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4">${sBoardBadge}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4">${sTrainBadge}</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4"><span style="color:#999">-</span></td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4"><span style="color:#999">-</span></td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;background:#FDF2F4"><span style="color:#999">-</span></td></tr>`; });

    let locationPages = '';
    allLocations.forEach(loc=>{
      let rooms = allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===loc.toUpperCase());
      if(rooms.length===0) return;
      // Sort by SORT ORDER for print
      rooms = [...rooms].sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
      
      // FIXED LOGIC V11 - Filter by spec: MEKAH: BOARD BASIS, BOARD BASIS MEKAH, BB MEKAH / MADINAH: BOARD BASIS, BOARD BASIS MADINAH, BB MADINAH / TAIF: BOARD BASIS only
      function normalizeBoard(b){
        if(!b) return '';
        const s = (Array.isArray(b)? b.join(', ') : String(b)).toUpperCase().trim();
        return s;
      }
      function isStaffBoardMatch(sObj, locUpper){
        try{
        if(!sObj) return false;
        const fbRawRaw = sObj.boardBasis||sObj.board||sObj.fields?.['BOARD']||sObj.fields?.['BOARD BASIS']||'';
        const up = normalizeBoard(fbRawRaw);
        if(!up || up==='-'||up==='NO BOARD'||up==='NO BOARD BASIS') return false;
        const isFullboard = up.includes('BOARD BASIS');
        const isBB = up.includes('BB');
        const hasMekah = up.includes('MEKAH');
        const hasMadinah = up.includes('MADINAH');
        const isExactFullboard = up==='BOARD BASIS';
        
        if(locUpper==='MEKAH'){
          // MEKAH: BOARD BASIS, BOARD BASIS MEKAH, BB MEKAH - EXCLUDE MADINAH
          if(hasMadinah) return false; // BOARD BASIS MADINAH or BB MADINAH not allowed in MEKAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMekah) return true; // BOARD BASIS (MEKAH)
          if(isBB && hasMekah) return true; // BB (MEKAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain BOARD BASIS
          return false;
        }
        if(locUpper==='MADINAH'){
          // MADINAH: BOARD BASIS, BOARD BASIS MADINAH, BB MADINAH - EXCLUDE MEKAH
          if(hasMekah) return false; // BOARD BASIS MEKAH or BB MEKAH not allowed in MADINAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMadinah) return true; // BOARD BASIS (MADINAH)
          if(isBB && hasMadinah) return true; // BB (MADINAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain BOARD BASIS
          return false;
        }
        // TAIF AND OTHER: BOARD BASIS SHJ
        if(isExactFullboard) return true;
        if(isFullboard && !hasMekah && !hasMadinah) return true;
        return false;
        }catch(e){ console.warn('isStaffBoardMatch error', e); return false; }
      }
      let fbListForLoc = [];
      function jHasBoardForLoc(r, locUp){
        if(!r || !r.fields) return false;

        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase().trim());
        if(arr.length===0) return false;
        const check = (x)=>{
          const hasMekah = x.includes('MEKAH');
          const hasMadinah = x.includes('MADINAH');
          const isFB = x.includes('BOARD BASIS');
          const isBB = x.includes('BB');
          const exactFB = x==='BOARD BASIS';
          if(locUp==='MEKAH'){
            if(hasMadinah) return false; // exclude MADINAH boards in MEKAH
            if(exactFB) return true;
            if(isFB && hasMekah) return true;
            if(isBB && hasMekah) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          } else if(locUp==='MADINAH'){
            if(hasMekah) return false; // exclude MEKAH boards in MADINAH
            if(exactFB) return true;
            if(isFB && hasMadinah) return true;
            if(isBB && hasMadinah) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          } else {
            // TAIF AND OTHER: BOARD BASIS SHJ
            if(exactFB) return true;
            if(isFB && !hasMekah && !hasMadinah) return true;
            return false;
          }
        };
        return arr.some(check);
      }
      if(loc==='MEKAH'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'MEKAH'));
      } else if(loc==='MADINAH'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'MADINAH'));
      } else if(loc==='TAIF'){
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,'TAIF'));
      } else {
        fbListForLoc = allRoomingJemaah.filter(r=> jHasBoardForLoc(r,loc));
      }
      // Add STAFF with BOARD BASIS in this location
      const staffFB = staffList.filter(s=> isStaffBoardMatch(s, loc.toUpperCase()) && s.roomIds && s.roomIds.some(rid=> rooms.some(r=>r.id===rid)));
      // Convert staff to same shape as jemaah for grouping
      staffFB.forEach(s=>{ fbListForLoc.push({ id:s.id, fields:{'NAMA JEMAAH':s.name, 'BOARD': s.boardBasis||s.fields?.['BOARD']||s.board||'BOARD BASIS', 'IS_STAFF':true, 'STAFF_OBJ':s}, _isStaff:true, boardBasis:s.boardBasis }); });

      // Staff linked to rooms in this location
      const staffInLoc = staffList.filter(s=> s.roomIds && s.roomIds.some(rid=> rooms.some(r=>r.id===rid)));
      
      // Build overview - FIXED BOARD count
      const sortedRoomsForPrintEarly = [...rooms].sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
      let overviewRows = '';
      // Group by hotel
      const hotels = {};
      rooms.forEach(r=>{
        const h=r.fields['HOTEL NAME']||'TANPA HOTEL';
        if(!hotels[h]) hotels[h]=[];
        hotels[h].push(r);
      });
      
      // For overview BOARD column: show breakdown
      let boardSummary = '';
      function hasBoard(r, target){
        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase());
        return arr.includes(target);
      }
      function hasBoardIncludes(r, inc){
        const arr=getBoardArray(r.fields).map(x=>x.toUpperCase());
        return arr.some(x=>x.includes(inc));
      }
      if(loc==='MEKAH'){
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS')).length;
        const countFBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS (MEKAH)')).length;
        const countBBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MEKAH)')).length;
        boardSummary = `BOARD BASIS: ${countFB}, BOARD BASIS MEKAH: ${countFBMekah}, BB MEKAH: ${countBBMekah}`;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (BOARD BASIS: ${countFB} + BOARD BASIS (MEKAH): ${countFBMekah} + BB (MEKAH): ${countBBMekah})`;
        else boardSummary = '-';
      } else if(loc==='MADINAH'){
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS')).length;
        const countFBMad = allRoomingJemaah.filter(r=> hasBoard(r,'BOARD BASIS (MADINAH)')).length;
        const countBBMad = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MADINAH)')).length;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (BOARD BASIS: ${countFB} + BOARD BASIS (MADINAH): ${countFBMad} + BB (MADINAH): ${countBBMad})`;
        else boardSummary = '-';
      } else if(loc==='TAIF'){
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} BOARD BASIS` : '-';
      } else {
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} BOARD BASIS` : '-';
      }
      
      Object.keys(hotels).forEach(hotelName=>{
        const hRooms = hotels[hotelName];
        const capCounts = {};
        hRooms.forEach(r=>{ const c=r.fields['KAPASITI']||4; capCounts[c]=(capCounts[c]||0)+1; });
        const bilikStr = Object.keys(capCounts).map(c=>`Bilik ber-${c} (${capCounts[c]})`).join(', ');
        // --- FIX: board basis per hotel, include staff ---
        const hJemaahIds = [];
        hRooms.forEach(r=>{ (r.fields['JEMAAH']||[]).forEach(id=>hJemaahIds.push(id)); });
        const hJemaahRecs = allRoomingJemaah.filter(j=> hJemaahIds.includes(j.id));
        function countBoardForHotel(fbFilter){
          let cnt=0;
          hJemaahRecs.forEach(j=>{ const fb=(getFullboardVal(j.fields)||'').toUpperCase().trim(); if(fbFilter(fb)) cnt++; });
          // staff in this hotel
          const staffInHotel = staffList.filter(s=> s.roomIds && s.roomIds.some(rid=> hRooms.some(hr=>hr.id===rid)));
          staffInHotel.forEach(s=>{
            const fbRawRaw=s.boardBasis||s.fields?.['BOARD']||s.board||''; const fbRaw=(Array.isArray(fbRawRaw)? fbRawRaw.join(', ') : fbRawRaw).toString().toUpperCase().trim();
            if(fbFilter(fbRaw)) cnt++;
          });
          return cnt;
        }
        let boardSummaryHotel='';
        if(loc==='MEKAH'){
          const cFB = countBoardForHotel(fb=>fb==='BOARD BASIS');
          const cFBM = countBoardForHotel(fb=>fb==='BOARD BASIS (MEKAH)');
          const cBBM = countBoardForHotel(fb=>fb==='BB (MEKAH)' || (fb.includes('MEKAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBM + cBBM;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (BOARD BASIS: ${cFB} + BOARD BASIS (MEKAH): ${cFBM} + BB (MEKAH): ${cBBM})`;
          else boardSummaryHotel='-';
        } else if(loc==='MADINAH'){
          const cFB = countBoardForHotel(fb=>fb==='BOARD BASIS');
          const cFBMad = countBoardForHotel(fb=>fb==='BOARD BASIS (MADINAH)');
          const cBBMad = countBoardForHotel(fb=>fb==='BB (MADINAH)' || (fb.includes('MADINAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBMad + cBBMad;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (BOARD BASIS: ${cFB} + BOARD BASIS (MADINAH): ${cFBMad} + BB (MADINAH): ${cBBMad})`;
          else boardSummaryHotel='-';
        } else {
          const cFB = countBoardForHotel(fb=>fb==='BOARD BASIS');
          boardSummaryHotel = cFB>0 ? `${cFB} BOARD BASIS` : '-';
        }
        overviewRows += `<tr><td style="border:1px solid #ddd;padding:4px 6px;font-weight:bold">${hotelName}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${bilikStr}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${boardSummaryHotel}</td><td style="border:1px solid #ddd;padding:4px 6px;text-align:center">${hRooms.length} bilik</td></tr>`;
      });
      
      let overviewProfessionalHTML = `<table style="width:100%;border-collapse:collapse;font-size:9px"><tr style="background:#f8f8f8;font-weight:bold"><th style="border:1px solid #ddd;padding:4px 6px;text-align:left">HOTEL</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">BILIK</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">BOARD BASIS</th><th style="border:1px solid #ddd;padding:4px 6px;text-align:center">JUMLAH</th></tr>${overviewRows}</table>`;
      
      const totalJemaahLoc = rooms.reduce((sum,r)=> sum + (r.fields['JEMAAH']||[]).length, 0);
      const totalBabyLoc = rooms.reduce((sum,r)=> sum + (r.fields['JEMAAH TANPA KATIL']||[]).length, 0);
      const totalStaffLoc = rooms.reduce((sum,r)=> sum + getStaffForRoom(r.id).length, 0);
      const fbTotalLoc = fbListForLoc.length;

      // Room blocks - smaller for portrait
      const isPortrait = orientation==='portrait';
      // Ensure rooms sorted by SORT ORDER for print
      const sortedRoomsForPrint = sortedRoomsForPrintEarly;
      const roomBlocks = sortedRoomsForPrint.map((rec, idx)=>{
        const f=rec.fields;
        const roomName = f['Room ID / Nama Bilik'] || f['ROOM ID'] || `B${f['KAPASITI']||4}-${idx+1}`;
        const pakej = f['PAKEJ / HOTEL']||'';
        const hotel = f['HOTEL NAME']||'';
        const cap = f['KAPASITI']||4;
        const jIds = f['JEMAAH']||[];
        const babyIdsRaw = f['JEMAAH TANPA KATIL']||[];
        const staffTanpaLocal = (typeof getStaffTanpaKatilForRoom==='function'? getStaffTanpaKatilForRoom(rec.id) : (f['_STAFF_TANPA_KATIL']||[]));
        const babyIds = [...new Set([...babyIdsRaw, ...staffTanpaLocal])];
        const staffForRoom = getStaffForRoom(rec.id);
        
        let jemaahHtml = jIds.map((jid, jIdx)=>{
          const jRec = allRoomingJemaah.find(r=>r.id===jid);
          const name = jRec ? getJemaahName(jRec.fields) : jid;
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #ddd">${jIdx+1}. ${name}</div>`;
        }).join('');
        
        // FIX V93: Separate jemaah infant (NA) and staff tanpa katil (S numbering)
        const babyJemaahIds = [];
        const babyStaffIds = [];
        babyIds.forEach(bId=>{
          const isStaff = staffList.some(s=>s.id===bId||s.airtableId===bId) || (typeof getStaffById==='function' && getStaffById(bId));
          if(isStaff) babyStaffIds.push(bId);
          else babyJemaahIds.push(bId);
        });
        let babyHtml = babyJemaahIds.length ? babyJemaahIds.map((jid, jIdx)=>{
          const jRec = allRoomingJemaah.find(r=>r.id===jid);
          const name = jRec ? getJemaahName(jRec.fields) : (typeof getNameForAnyId==='function'? getNameForAnyId(jid) : jid);
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #92400E;color:#92400E;background:#FEF3C7;font-weight:600">NA. ${name} (Tanpa Katil)</div>`;
        }).join('') : '';
        // Staff tanpa katil will be appended to staffHtml as S numbering
        const staffTanpaIdsForPrint = babyStaffIds;

        
        let staffHtml = staffForRoom.length ? staffForRoom.map((s, sIdx)=>{
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #ddd;color:#7A0C2E;background:#FDF2F4">S${sIdx+1}. ${s.name.replace(/\(EFFAH\)/i,'').trim()} (EFFAH)</div>`;
        }).join('') : '';
        let staffTanpaHtml = staffTanpaIdsForPrint.length ? staffTanpaIdsForPrint.map((sid, stIdx)=>{
          const sRec = staffList.find(s=>s.id===sid||s.airtableId===sid) || (typeof getStaffById==='function'? getStaffById(sid) : null);
          const sName = sRec ? sRec.name : (typeof getNameForAnyId==='function'? getNameForAnyId(sid) : sid);
          const sNum = staffForRoom.length + stIdx + 1;
          return `<div style="font-size:${isPortrait ? '7.5px' : '8.5px'};padding:${isPortrait ? '1px 0' : '2px 0'};border-bottom:1px dotted #e8a838;background:#fffbe6;color:#92400E;font-weight:600">S${sNum}. ${sName.replace(/\(EFFAH\)/i,'').trim()} (Tanpa Katil)</div>`;
        }).join('') : '';
        // Combine staff regular + staff tanpa katil for display count
        const combinedStaffHtml = staffHtml + staffTanpaHtml;

        
        const catatanBilik = (f['CATATAN BILIK'] || f['CATATAN'] || '').trim();
        const catatanPrint = catatanBilik ? ` (${catatanBilik})` : '';
        return `<div style="border:1px solid #000;margin-bottom:${isPortrait ? '4px' : '6px'};background:#fff;break-inside:avoid" data-room-card="${rec.id}" ondragover="allowDropRoom(event)" ondragleave="leaveDropRoom(event)" ondrop="dropRoom(event,'${rec.id}')">
          <div draggable="true" ondragstart="dragRoom(event,'${rec.id}')" ondragend="dragRoomEnd(event)" style="background:#fff;border-bottom:1px solid #000;padding:${isPortrait ? '2px 4px' : '3px 6px'};display:flex;justify-content:space-between;align-items:center;cursor:grab" title="Drag untuk susun bilik">
            <span style="font-weight:bold;font-size:${isPortrait ? '8px' : '9px'}">${idx+1}. ${roomName} ${pakej ? '('+pakej+')' : ''} ${hotel ? '- '+hotel : ''}${catatanPrint}</span>
            <span style="font-size:${isPortrait ? '7px' : '8px'};font-weight:bold">${jIds.length + staffForRoom.length}/${cap}</span>
          </div>
          <div style="padding:${isPortrait ? '3px 4px' : '4px 6px'}">
            ${jemaahHtml}
            ${babyHtml}
            ${combinedStaffHtml}
          </div>
        </div>`;
      }).join('');

      // FB Table with actual board basis badges
      let fbTableHTML = '';
      if(fbListForLoc.length>0){
        // Group by hotel for FB list - with room number
        const roomNumberMap = {};
        sortedRoomsForPrintEarly.forEach((r, idx)=>{ roomNumberMap[r.id]=idx+1; });
        rooms.forEach((r, idx)=>{ if(!roomNumberMap[r.id]) roomNumberMap[r.id]=idx+1; });
        const grouped = {};
        fbListForLoc.forEach(jRec=>{
          let room=null;
          if(jRec._isStaff){
            const sObj=jRec.fields.STAFF_OBJ;
            room = rooms.find(r=> sObj.roomIds && sObj.roomIds.includes(r.id));
          } else {
            room = rooms.find(r=> (r.fields['JEMAAH']||[]).includes(jRec.id));
          }
          const hotel = room ? (room.fields['HOTEL NAME']||'TANPA HOTEL') : 'TANPA BILIK';
          const roomNo = room ? (roomNumberMap[room.id]||'-') : '-';
          const roomName = room ? (room.fields['Room ID / Nama Bilik']||room.fields['ROOM ID']||'B?') : '-';
          if(!grouped[hotel]) grouped[hotel]=[];
          grouped[hotel].push({rec:jRec, room:roomNo, roomLabel:roomName});
        });
        
        const fbJemaahCount = fbListForLoc.filter(x=>!x._isStaff).length;
        const fbStaffCount = fbListForLoc.filter(x=>x._isStaff).length;
        const fbBadgeText = fbStaffCount>0 ? `${fbJemaahCount} Jemaah + ${fbStaffCount} Staff` : `${fbJemaahCount} Jemaah`;
        fbTableHTML = `
          <div style="margin-top:10px;border:1px solid #000">
            <div style="background:#064E3B;color:#fff;padding:4px 8px;font-weight:bold;font-size:9px;display:flex;justify-content:space-between">
              <span>${loc} - SENARAI PAKEJ MAKAN</span>
              <span style="background:#fff;color:#065F46;padding:1px 6px;border-radius:10px;font-size:9px">${fbBadgeText}</span>
            </div>
            ${Object.keys(grouped).sort().map(hotelName=>{
              const allItems = grouped[hotelName];
              const jemaahOnly = allItems.filter(x=>!x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
              const staffOnly = allItems.filter(x=>x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
              const sortedItems = [...jemaahOnly, ...staffOnly];
              const totalPax = allItems.length;
              return '<div style="border-bottom:1px solid #000"><div style="background:#f0fdf4;padding:3px 8px;font-weight:bold;font-size:9px;border-bottom:1px solid #ddd">'+hotelName+' ('+totalPax+' pax)</div><table style="width:100%;border-collapse:collapse;font-size:9px"><tr style="background:#f8f8f8;font-weight:bold"><th style="border:1px solid #ddd;padding:3px 6px;width:30px">NO</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:left">NAMA JEMAAH</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:center">BOARD BASIS</th><th style="border:1px solid #ddd;padding:3px 6px;text-align:center">BILIK</th></tr>'+ sortedItems.map((item,i)=>{
                    const isStaffRow = item.rec._isStaff;
                    let rawStaffName = (item.rec.fields['NAMA JEMAAH']||'');
                    rawStaffName = rawStaffName.replace(/\s*\(EFFAH\)\s*/gi,'').trim();
                    rawStaffName = rawStaffName.replace(/\(EFFAH\)/i,'').trim();
                    const displayName = isStaffRow ? rawStaffName + ' (EFFAH)' : getJemaahName(item.rec.fields);
                    const fbRaw = isStaffRow ? (item.rec.fields['BOARD']||'BOARD BASIS') : (getFullboardVal(item.rec.fields)||'');
                    const up=(Array.isArray(fbRaw)? (fbRaw[0]||'') : (fbRaw||'')).toString().toUpperCase();
                    let badge='';
                    if(up.includes('MEKAH')) badge='<span style="background:#FDE68A;border:1px solid #92400E;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    else if(up.includes('MADINAH')) badge='<span style="background:#BFDBFE;border:1px solid #1E40AF;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    else badge='<span style="background:#BBF7D0;border:1px solid #065F46;padding:1px 6px;border-radius:10px;font-weight:bold;font-size:8px">'+fbRaw+'</span>';
                    let rowNo='';
                    if(isStaffRow){
                      const staffSorted = grouped[hotelName].filter(x=>x.rec._isStaff).sort((a,b)=>{ const na=parseInt(a.room)||9999; const nb=parseInt(b.room)||9999; return na-nb; });
                      const pos = staffSorted.findIndex(x=>x.rec.id===item.rec.id);
                      rowNo = 'S'+(pos+1);
                    } else {
                      rowNo = ''+(i+1);
                    }
                    const rowStyle = isStaffRow ? ' style="background:#FDF2F4"' : '';
                    const cellStyle = isStaffRow ? 'background:#F9D5D9;font-weight:bold;color:#7A0C2E' : '';
                    const nameStyle = isStaffRow ? 'color:#7A0C2E' : '';
                    return '<tr'+rowStyle+'><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;'+cellStyle+'">'+rowNo+'</td><td style="border:1px solid #ddd;padding:3px 6px;font-weight:600;'+nameStyle+'">'+displayName+'</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center">'+badge+'</td><td style="border:1px solid #ddd;padding:3px 6px;text-align:center;font-size:8px">'+item.room+'</td></tr>';
                  }).join('') + '</table></div>';
            }).join('')}
          </div>
        `;
      } else {
        fbTableHTML = `<div style="margin-top:12px;border:1px dashed #000;padding:8px;text-align:center;font-size:9px;color:#666">Tiada jemaah Pakej Makan di ${loc} (Kriteria: ${loc==='TAIF' ? 'BOARD BASIS sahaja' : loc+' = BOARD BASIS + BOARD BASIS ('+loc+') + BB ('+loc+')'})</div>`;
      }

      locationPages+=`<div style="page-break-before:always">
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:bold;font-size:13px;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px">
          <span>ROOMING LIST ${tripName} - ${loc} (${rooms.length} BILIK)</span>
        </div>
        <div style="margin-bottom:10px;border:1px solid #000;padding:0;background:#fff">
          <div style="background:#7A0C2E;color:#fff;padding:4px 8px;font-weight:bold;font-size:10px">${loc} OVERVIEW - ${rooms.length} Bilik</div>
          ${overviewProfessionalHTML}
          <div style="background:#f5f5f5;padding:5px 8px;font-size:9px;border-top:1px solid #000;display:flex;justify-content:space-between">
            <span><b>Total:</b> ${rooms.length} bilik</span>
            <span>${totalJemaahLoc+totalBabyLoc} jemaah + ${totalStaffLoc} staff</span>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:${orientation==='portrait' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'}; gap:${orientation==='portrait' ? '6px' : '8px'}; align-items:start">${roomBlocks}</div>
        ${fbTableHTML}
      </div>`;
    });

        // TRIP OVERVIEW - FIXED V103.28 - use combinedStaff and s.train
    const _staffList = (typeof combinedStaff !== 'undefined' && combinedStaff.length ? combinedStaff : (typeof staffList !== 'undefined' ? staffList : []));
    const totalStaffCount = _staffList.length;
    const totalJemaahOnly = allRoomingJemaah.length;
    const visaCounts = {};
    allRoomingJemaah.forEach(j=>{
      const v=(j.fields['STATUS VISA']||j.fields['VISA']||'').toString().trim().toUpperCase();
      if(v && v!=='-' && v!=='- VISA'){ visaCounts[v]=(visaCounts[v]||0)+1; }
    });
    let visaHtml = `
      <span style="display:inline-block;margin-right:12px;"><b>TOURIST:</b> ${visaCounts['TOURIST']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>TOURIST VALID:</b> ${visaCounts['TOURIST (VALID)']||visaCounts['TOURIST VALID']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>UMRAH:</b> ${visaCounts['UMRAH']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>UMRAH (VALID):</b> ${visaCounts['UMRAH (VALID)']||0}</span>
      <span style="display:inline-block;margin-right:12px;"><b>IQAMA (VALID):</b> ${visaCounts['IQAMA (VALID)']||0}</span>
    `;
    const _trainJemaahCount = allRoomingJemaah.filter(j=>{ try{ return typeof isTrainChecked==='function' ? isTrainChecked(j.fields) : !!j.fields['TRAIN']; }catch(e){return !!j.fields['TRAIN'];}}).length;
    const _trainStaffCount = _staffList.filter(s=>{ 
      try{ 
        // staff TRAIN can be in s.train, s.fields.TRAIN, s.fields['TRAIN STAFF']
        const f=s.fields||{};
        return !!(s.train || f['TRAIN'] || f['SPEEDTRAIN'] || f['TRAIN STAFF'] || s['TRAIN']);
      }catch(e){return false;}
    }).length;
    const _totalTrainWithStaff = _trainJemaahCount + _trainStaffCount;
    const _insJ = allRoomingJemaah.filter(j=>{ try{return getInsuranArray(j.fields).length>0;}catch(e){return false;}}).length;
    const _insS = _staffList.filter(s=>{ try{const f=s.fields||{}; return (f['INSURAN'] && f['INSURAN'].length>0) || (typeof getInsuranArray==='function' && getInsuranArray(f).length>0) || !!s.insuran; }catch(e){return false;}}).length;
    const _totalInsuranUnique = _insJ + _insS;
    const namelistOverviewHTML = '<div style="margin-top:12px;border:1px solid #000;padding:8px 10px;background:#f9fafb"><div style="font-weight:bold;font-size:10px;margin-bottom:6px">TRIP OVERVIEW</div><div style="display:flex;flex-wrap:wrap;gap:20px;font-size:9px"><div><b>Bilangan Speedtrain:</b> ' + _totalTrainWithStaff + ' orang (Jemaah: ' + _trainJemaahCount + ' + Staff: ' + _trainStaffCount + ')</div><div><b>Bilangan Insuran:</b> ' + _totalInsuranUnique + ' orang</div><div><b>Visa:</b> ' + visaHtml + '</div><div><b>Total Jemaah:</b> ' + totalJemaahOnly + '</div><div><b>Total Staff:</b> ' + totalStaffCount + '</div></div></div>';

    const html=`<html><head><title>Rooming ${tripName} - ${orientation}</title><style>body{font-family:Arial,Helvetica,sans-serif;font-size:10px;margin:12px;color:#000}table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:4px 6px;font-size:9px}th{background:#7A0C2E;color:#fff;font-weight:bold;text-transform:uppercase}.header{display:flex;justify-content:space-between;font-weight:bold;font-size:12px;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px}.page-break{page-break-before:always}.namelist-page{max-width:900px;margin:0 auto}.location-page{max-width:100%}@media print{@page{size:A4 ${orientation};margin:${orientation==='portrait' ? '8mm' : '10mm'}}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page-break{page-break-before:always}}</style></head><body>
      <div class="namelist-page"><div class="header"><span>NAMELIST ${tripName}</span><span>Total: ${allRoomingJemaah.length} Jemaah + ${combinedStaff.length} Staff</span></div><div style="font-size:9px;margin-bottom:8px"><b>Trip:</b> ${tripName} | <b>Tarikh Cetak:</b> ${new Date().toLocaleDateString('ms-MY')} | <b>Orientasi:</b> ${orientation.toUpperCase()}</div><table style="table-layout:fixed"><colgroup><col style="width:28px"><col style="width:34%"><col style="width:85px"><col style="width:40px"><col style="width:55px"><col style="width:60px"><col style="width:65px"></colgroup><tr><th>NO</th><th style="text-align:left">NAMA JEMAAH</th><th>BOARD</th><th>TRAIN</th><th>PAKEJ</th><th>INSURAN</th><th>VISA</th></tr>${namelistRows}</table>${namelistOverviewHTML}</div>
      ${locationPages||'<div style="page-break-before:always"><div style="border:1px dashed #000;padding:20px;text-align:center">Tiada bilik untuk trip ini</div></div>'}
      <script>window.onload=function(){setTimeout(()=>window.print(),600)}; window.onafterprint=function(){window.close();}; setTimeout(()=>{try{window.close();}catch(e){}},3500);<\/script>
    </body></html>`;
    const w=window.open('','_blank');
    if(!w){ alert('Popup blocked! Sila allow popup untuk print.'); return; }
    w.document.write(html);
    w.document.close();
  }catch(e){
    console.error(e);
    alert('Gagal generate print: '+e.message);
  }
}