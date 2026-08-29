// COMPONENT - Print - extracted from rooming.js v35
// Auto-generated modular split - keep window.* exports


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
          else if(up.includes('FULLBOARD')){ bg='#BBF7D0'; border='#065F46'; }
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
          else if(up.includes('FULLBOARD')){ bg='#BBF7D0'; border='#065F46'; }
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
      
      // FIXED LOGIC V11 - Filter by spec: MEKAH: FULLBOARD, FULLBOARD MEKAH, BB MEKAH / MADINAH: FULLBOARD, FULLBOARD MADINAH, BB MADINAH / TAIF: FULLBOARD only
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
        if(!up || up==='-'||up==='NO BOARD'||up==='NO FULLBOARD') return false;
        const isFullboard = up.includes('FULLBOARD');
        const isBB = up.includes('BB');
        const hasMekah = up.includes('MEKAH');
        const hasMadinah = up.includes('MADINAH');
        const isExactFullboard = up==='FULLBOARD';
        
        if(locUpper==='MEKAH'){
          // MEKAH: FULLBOARD, FULLBOARD MEKAH, BB MEKAH - EXCLUDE MADINAH
          if(hasMadinah) return false; // FULLBOARD MADINAH or BB MADINAH not allowed in MEKAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMekah) return true; // FULLBOARD (MEKAH)
          if(isBB && hasMekah) return true; // BB (MEKAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain FULLBOARD
          return false;
        }
        if(locUpper==='MADINAH'){
          // MADINAH: FULLBOARD, FULLBOARD MADINAH, BB MADINAH - EXCLUDE MEKAH
          if(hasMekah) return false; // FULLBOARD MEKAH or BB MEKAH not allowed in MADINAH
          if(isExactFullboard) return true;
          if(isFullboard && hasMadinah) return true; // FULLBOARD (MADINAH)
          if(isBB && hasMadinah) return true; // BB (MADINAH)
          if(isFullboard && !hasMekah && !hasMadinah) return true; // plain FULLBOARD
          return false;
        }
        // TAIF AND OTHER: FULLBOARD SHJ
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
          const isFB = x.includes('FULLBOARD');
          const isBB = x.includes('BB');
          const exactFB = x==='FULLBOARD';
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
            // TAIF AND OTHER: FULLBOARD SHJ
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
      // Add STAFF with FULLBOARD in this location
      const staffFB = staffList.filter(s=> isStaffBoardMatch(s, loc.toUpperCase()) && s.roomIds && s.roomIds.some(rid=> rooms.some(r=>r.id===rid)));
      // Convert staff to same shape as jemaah for grouping
      staffFB.forEach(s=>{ fbListForLoc.push({ id:s.id, fields:{'NAMA JEMAAH':s.name, 'BOARD': s.boardBasis||s.fields?.['BOARD']||s.board||'FULLBOARD', 'IS_STAFF':true, 'STAFF_OBJ':s}, _isStaff:true, boardBasis:s.boardBasis }); });

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
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD')).length;
        const countFBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD (MEKAH)')).length;
        const countBBMekah = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MEKAH)')).length;
        boardSummary = `FULLBOARD: ${countFB}, FULLBOARD MEKAH: ${countFBMekah}, BB MEKAH: ${countBBMekah}`;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (FULLBOARD: ${countFB} + FULLBOARD (MEKAH): ${countFBMekah} + BB (MEKAH): ${countBBMekah})`;
        else boardSummary = '-';
      } else if(loc==='MADINAH'){
        const countFB = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD')).length;
        const countFBMad = allRoomingJemaah.filter(r=> hasBoard(r,'FULLBOARD (MADINAH)')).length;
        const countBBMad = allRoomingJemaah.filter(r=> hasBoard(r,'BB (MADINAH)')).length;
        if(fbListForLoc.length>0) boardSummary = `${fbListForLoc.length} orang (FULLBOARD: ${countFB} + FULLBOARD (MADINAH): ${countFBMad} + BB (MADINAH): ${countBBMad})`;
        else boardSummary = '-';
      } else if(loc==='TAIF'){
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} FULLBOARD` : '-';
      } else {
        boardSummary = fbListForLoc.length>0 ? `${fbListForLoc.length} FULLBOARD` : '-';
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
          const cFB = countBoardForHotel(fb=>fb==='FULLBOARD');
          const cFBM = countBoardForHotel(fb=>fb==='FULLBOARD (MEKAH)');
          const cBBM = countBoardForHotel(fb=>fb==='BB (MEKAH)' || (fb.includes('MEKAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBM + cBBM;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (FULLBOARD: ${cFB} + FULLBOARD (MEKAH): ${cFBM} + BB (MEKAH): ${cBBM})`;
          else boardSummaryHotel='-';
        } else if(loc==='MADINAH'){
          const cFB = countBoardForHotel(fb=>fb==='FULLBOARD');
          const cFBMad = countBoardForHotel(fb=>fb==='FULLBOARD (MADINAH)');
          const cBBMad = countBoardForHotel(fb=>fb==='BB (MADINAH)' || (fb.includes('MADINAH') && fb.includes('BB')));
          const totalHotelBoard = cFB + cFBMad + cBBMad;
          if(totalHotelBoard>0) boardSummaryHotel = `${totalHotelBoard} orang (FULLBOARD: ${cFB} + FULLBOARD (MADINAH): ${cFBMad} + BB (MADINAH): ${cBBMad})`;
          else boardSummaryHotel='-';
        } else {
          const cFB = countBoardForHotel(fb=>fb==='FULLBOARD');
          boardSummaryHotel = cFB>0 ? `${cFB} FULLBOARD` : '-';
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
                    const fbRaw = isStaffRow ? (item.rec.fields['BOARD']||'FULLBOARD') : (getFullboardVal(item.rec.fields)||'');
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
        fbTableHTML = `<div style="margin-top:12px;border:1px dashed #000;padding:8px;text-align:center;font-size:9px;color:#666">Tiada jemaah Pakej Makan di ${loc} (Kriteria: ${loc==='TAIF' ? 'FULLBOARD sahaja' : loc+' = FULLBOARD + FULLBOARD ('+loc+') + BB ('+loc+')'})</div>`;
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

async function autoAssignRooming(){ if(!confirm('Adakah anda pasti ingin menetapkan semua jemaah yang belum ditetapkan untuk lokasi '+activeLocation+' secara automatik?')) return; let rooms=[...allRoomingRecords].filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase()); if(rooms.length===0) rooms=[...allRoomingRecords]; rooms=getRoomOrderedList(rooms); const unassigned=allRoomingJemaah.filter(j=>!isJemaahAssignedInLocation(j.id, activeLocation)); let idx=0; for(let room of rooms){ const cap=room.fields['KAPASITI']||roomingDefaultCap; const staffCount=(room.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length; let cur=[...(room.fields['JEMAAH']||[])]; while((cur.length+staffCount)<cap && idx<unassigned.length){ cur.push(unassigned[idx].id); idx++; } if(cur.length!==(room.fields['JEMAAH']||[]).length){ await updateRoomField(room.id,'JEMAAH',cur,false); } } setTimeout(fetchRoomingData,800); }
 // V80 OVERRIDE - Staff multi + Insuran multi (keeps original 1767 lines intact, overrides at end)
function renderStaffList_V80(){
  const cont=document.getElementById('staffListContainer'); if(!cont) return;
  const q=(document.getElementById('searchStaff')?.value||'').toLowerCase();
  let filtered=[...staffList];
  if(q) filtered=filtered.filter(s=>(s.name||'').toLowerCase().includes(q));
  const boardOptions = ['FULLBOARD','FULLBOARD (MEKAH)','BB (MEKAH)','FULLBOARD (MADINAH)','BB (MADINAH)'];
  cont.innerHTML=filtered.map((s, idx)=>{
    const staffId=s.id||s.airtableId||'staff-'+idx;
    const fbArr=getStaffBoardArray(s);
    const fbDisplay=fbArr.length?fbArr.join(', '):'- BOARD';
    let fbCls='bg-white border-slate-200 text-slate-400';
    if(fbArr.some(x=>x.includes('MEKAH'))) fbCls='bg-orange-100 border-orange-200 text-orange-800';
    else if(fbArr.some(x=>x.includes('MADINAH'))) fbCls='bg-blue-100 border-blue-200 text-blue-800';
    else if(fbArr.includes('FULLBOARD')) fbCls='bg-emerald-100 border-emerald-200 text-emerald-800';
    const boardCheckboxes=boardOptions.map(opt=>{
      const checked=fbArr.includes(opt);
      return `<label class="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-50 rounded text-[10px] cursor-pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleStaffBoardMulti('${staffId}','${opt}')" class="w-3 h-3 accent-[#7A0C2E]"> ${opt}</label>`;
    }).join('');
    const assigned=isStaffAssignedInLocation(staffId, activeLocation);
    const trainChecked = !!(s.train||s.fields?.TRAIN||s.board?.includes?.('TRAIN'));

    const rowCls=assigned?'bg-slate-50 text-slate-500':'bg-white hover:bg-slate-50';
    const dragStaff = assigned ? '' : `draggable="true" ondragstart="dragStaff(event,'${staffId}')" ondragend="dragEnd(event)"`;
    return `<div ${dragStaff} class="flex items-center gap-2 p-2 border-b border-slate-100 text-[11px] ${rowCls} ${!assigned?'cursor-grab active:cursor-grabbing hover:bg-amber-50':''}">
      <span class="w-5 h-5 flex items-center justify-center text-[10px] text-slate-300">${!assigned?'≡':''}</span>
      <span class="w-6 text-[9px] text-slate-400">${String(idx+1).padStart(2,'0')}</span>
      <span class="flex-1 truncate font-medium">${s.name||'-'}</span>
      <span class="text-[7px] px-1 rounded ${assigned?'bg-slate-200':''}">${assigned?'ASSIGNED di '+activeLocation:''}</span>
      <div class="relative w-[150px]">
        <button onclick="event.stopPropagation(); toggleStaffDropdown('${staffId}')" class="text-[7px] border rounded-full px-2 py-0.5 font-bold ${fbCls} w-full text-left flex justify-between items-center bg-white" style="opacity:1;"><span class="truncate">${fbDisplay}</span><span>▼</span></button>
        <div id="staffBoardDrop-${staffId}" class="hidden absolute right-0 top-full mt-1 w-[190px] bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-1">
          ${boardCheckboxes}
          <div class="border-t border-slate-100 mt-1 pt-1 flex justify-between"><button onclick="clearStaffBoardMulti('${staffId}'); closeStaffDropdown('${staffId}')" class="text-[8px] px-2 py-0.5 rounded-full bg-slate-100">Clear</button><button onclick="closeStaffDropdown('${staffId}')" class="text-[8px] px-2 py-0.5 rounded-full bg-[#7A0C2E] text-white">OK</button></div>
          <div class="text-[7px] text-slate-400 px-2 mt-1">Boleh pilih 2: BB (MEKAH) + FB (MADINAH)</div>
        </div>
      </div>
      <label class="flex items-center gap-1 text-[8px] border rounded-full px-2.5 py-1.5 cursor-pointer font-bold ${trainChecked ? 'bg-amber-300 border-amber-600 text-amber-900' : 'bg-white border-slate-300'} shrink-0" style="background:${trainChecked ? '#FDE68A' : '#fff'} !important; opacity:1 !important;">
        <input type="checkbox" ${trainChecked?'checked':''} onchange="updateStaffTrain('${staffId}',this.checked)" class="w-3.5 h-3.5 accent-amber-600"> TRAIN
      </label>
      <button onclick="quickAssignStaff('${staffId}')" class="w-5 h-5 rounded-full bg-slate-100 text-[10px]">+</button>
      <button onclick="removeStaff('${staffId}')" class="w-5 h-5 rounded-full bg-red-50 text-red-400 text-[10px]">🗑</button>
    </div>`;
  }).join('') || '<div class="p-4 text-center text-[11px] text-slate-400">Tiada staff</div>';
}
// Override original
renderStaffList = renderStaffList_V80;

// Patch renderNamelist to use insuran multi dropdown
// V80 override removed in V103.22 - fixed insToggle error
;

function findRoomingContainers(){
  const selectors={namelist:['#namelistContainer','#namelist-container','[data-testid="namelist"]','.namelist-container','#jemaahList','#jemaahListContainer'],grid:['#roomingGrid','#roomingGridContainer','#rooming-grid','.rooming-grid','#bilikGrid','#roomingListGrid']};
  let namelist=null,grid=null;
  for(let sel of selectors.namelist){ const el=document.querySelector(sel); if(el){ namelist=el; break; } }
  for(let sel of selectors.grid){ const el=document.querySelector(sel); if(el){ grid=el; break; } }
  return {namelist,grid};
}
function createMissingRoomingStructure(){
  const modul=document.getElementById('modul-rooming');
  if(!modul) return false;
  const hasNamelist=modul.querySelector('#namelistContainer');
  const hasGrid=modul.querySelector('#roomingGrid')||modul.querySelector('#roomingGridContainer');
  if(!hasNamelist || !hasGrid || modul.innerHTML.trim().length<100){
    console.log('V80 creating missing rooming structure, modul innerLen', modul.innerHTML.length);
    const existingHTML=modul.innerHTML;
    modul.innerHTML=`
      <div id="roomingHeader" class="p-4 border-b bg-white">
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-bold">Rooming List - V80 Auto-Created (Full Base)</h2>
          <div class="flex gap-2">
            <select id="roomingTripSelect" class="text-[11px] border rounded px-2 py-1"></select>
            <button onclick="fetchRoomingData(true)" class="text-[11px] bg-[#7A0C2E] text-white px-3 py-1 rounded-full">Reload</button>
          </div>
        </div>
        <div id="locationTabs" class="flex gap-2 mt-3"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl border">
            <div class="p-3 border-b flex justify-between items-center">
              <span class="text-[11px] font-bold">NAMELIST JEMAAH</span>
              <span id="topUnassignedBadge" class="text-[9px] bg-amber-100 px-2 py-0.5 rounded-full">0</span>
            </div>
            <div class="p-2"><input id="searchNamelist" placeholder="Cari jemaah..." class="w-full text-[11px] border rounded-full px-3 py-1.5 mb-2" oninput="renderNamelist()"></div>
            <div id="namelistContainer" class="max-h-[60vh] overflow-y-auto"><div class="p-6 text-center text-[11px] text-slate-400">Memuatkan jemaah...</div></div>
          </div>
          <div class="bg-white rounded-xl border mt-4">
            <div class="p-3 border-b flex justify-between"><span class="text-[11px] font-bold">STAFF / EXTRA</span><span id="staffTotalBadge" class="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full">0</span></div>
            <div class="p-2"><input id="searchStaff" placeholder="Cari staff..." class="w-full text-[11px] border rounded-full px-3 py-1.5 mb-2" oninput="renderStaffList()"></div>
            <div id="staffListContainer" class="max-h-[30vh] overflow-y-auto"></div>
          </div>
        </div>
        <div class="lg:col-span-2"><div id="roomingGrid" class="grid gap-3"></div><div id="roomingGridContainer" class="hidden"></div></div>
      </div>
      <div id="v80-existing" style="display:none;">${existingHTML}</div>
    `;
    setTimeout(()=>{ if(typeof populateRoomingTripDropdown==='function') populateRoomingTripDropdown(); if(typeof fetchRoomingData==='function') fetchRoomingData(); }, 500);
    return true;
  }
  return false;
}
setTimeout(()=>{
  const modul=document.getElementById('modul-rooming');
  console.log('V80 inspect modul-rooming exists:', !!modul, 'len', modul?.innerHTML.length, 'children', modul?.children.length);
  const {namelist,grid}=findRoomingContainers();
  console.log('V80 containers found:', !!namelist, !!grid);
  if(!namelist||!grid){ createMissingRoomingStructure(); } else { if(typeof fetchRoomingData==='function') fetchRoomingData(); }
}, 1500);

function updateStaffTrain(staffId, checked){
  const s=staffList.find(x=>x.id===staffId||x.airtableId===staffId);
  if(!s){ console.warn('updateStaffTrain staff not found', staffId); return; }
  s.train=checked;
  if(!s.fields) s.fields={};
  s.fields['TRAIN']=checked;
  if(typeof saveStaffList==='function') saveStaffList();
  renderStaffList();
  const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat&&s.airtableId){
    fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${s.airtableId}`,{
      method:'PATCH',
      headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
      body: JSON.stringify({fields:{'TRAIN': checked}})
    }).then(r=>r.json()).then(d=>console.log('V98 staff train saved', d)).catch(e=>console.error(e));
  } else {
    console.log('V98 staff train local only', staffId, checked);
  }
}

// ===== V102 RACE FIX - QUEUE PER STAFF ID =====
window._staffPatchQueue = window._staffPatchQueue || {};
window._staffPatchRunning = window._staffPatchRunning || {};

async function _patchStaffRoomIdsQueued(staffId, roomIds){
  if(!window._staffPatchQueue[staffId]) window._staffPatchQueue[staffId] = [];
  return new Promise((resolve, reject)=>{
    window._staffPatchQueue[staffId].push({roomIds, resolve, reject});
    _processStaffQueue(staffId);
  });
}
async function _processStaffQueue(staffId){
  if(window._staffPatchRunning[staffId]) return;
  window._staffPatchRunning[staffId] = true;
  const {base, pat} = (typeof getAirtableConfig==='function'? getAirtableConfig() : {base: window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base'), pat: window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat')});
  while(window._staffPatchQueue[staffId] && window._staffPatchQueue[staffId].length>0){
    const task = window._staffPatchQueue[staffId].shift();
    const staff = (typeof getStaffById==='function'? getStaffById(staffId) : staffList.find(s=>s.id===staffId||s.airtableId===staffId));
    if(!staff || !base || !pat || !staff.airtableId){ task.resolve(); continue; }
    try{
      // Always use latest roomIds from staff object at time of processing, not task.roomIds stale
      const latestIds = staff.roomIds || [];
      let res = await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${staff.airtableId}`,{
        method:'PATCH', headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
        body: JSON.stringify({fields:{'ROOMING LIST': latestIds}})
      });
      let data = await res.json();
      if(data.error){
        console.warn('Staff patch 422 retry', staffId, data.error);
        // retry once after 400ms with latest
        await new Promise(r=>setTimeout(r,400));
        res = await fetch(`https://api.airtable.com/v0/${base}/STAFF%20LIST%20%28ROOMING%29/${staff.airtableId}`,{
          method:'PATCH', headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
          body: JSON.stringify({fields:{'ROOMING LIST': latestIds}})
        });
        data = await res.json();
      }
      task.resolve(data);
    }catch(e){
      console.error('Staff queue patch failed', e);
      task.resolve();
    }
    await new Promise(r=>setTimeout(r,250)); // small gap to avoid Airtable rate limit 422
  }
  window._staffPatchRunning[staffId] = false;
}

async function assignStaffToRoom_FIXED(staffId, roomId){
  const staff = (typeof getStaffById==='function'? getStaffById(staffId) : staffList.find(s=>s.id===staffId||s.airtableId===staffId)); 
  if(!staff) return;
  const rec = allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
  if(!staff.roomIds) staff.roomIds=[];
  if(!staff.roomIds.includes(roomId)) staff.roomIds.push(roomId);
  staff.roomLink = staff.roomIds[0];
  if(typeof saveStaffList==='function') saveStaffList(); 
  if(typeof renderStaffList==='function') renderStaffList(); 
  if(typeof renderRoomingGrid==='function') renderRoomingGrid(); 
  if(typeof renderLocationTabs==='function') renderLocationTabs();
  // Queue Airtable update, don't await blocking UI
  _patchStaffRoomIdsQueued(staffId, staff.roomIds);
}

async function removeStaffFromRoom_FIXED(roomId, staffId){
  const staff = (typeof getStaffById==='function'? getStaffById(staffId) : staffList.find(s=>s.id===staffId||s.airtableId===staffId));
  if(!staff){
    // fallback: only update local room field if no staff object
    const rec = allRoomingRecords.find(r=>r.id===roomId);
    if(rec && rec.fields['STAFF LIST (ROOMING)']){
      rec.fields['STAFF LIST (ROOMING)'] = (rec.fields['STAFF LIST (ROOMING)']||[]).filter(id=>id!==staffId);
      if(typeof renderRoomingGrid==='function') renderRoomingGrid();
    }
    return;
  }
  const prevLen = (staff.roomIds||[]).length;
  staff.roomIds = (staff.roomIds||[]).filter(id=>id!==roomId);
  staff.roomLink = staff.roomIds.length? staff.roomIds[0] : null;
  console.log(`V102 RACE FIX remove ${staffId} from ${roomId}: ${prevLen} -> ${staff.roomIds.length}`);
  if(typeof saveStaffList==='function') saveStaffList();
  if(typeof renderStaffList==='function') renderStaffList();
  if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  if(typeof renderLocationTabs==='function') renderLocationTabs();
  _patchStaffRoomIdsQueued(staffId, staff.roomIds);
}

// Override original functions
window.assignStaffToRoom = assignStaffToRoom_FIXED;
window.removeStaffFromRoom = removeStaffFromRoom_FIXED;

console.log('V102 RACE FIX loaded - queue per staff');


function toggleStaffBoardMulti_FIXED(staffId, boardVal){
  const staff = (window.staffList||[]).find(s=>s.id===staffId||s.airtableId===staffId);
  if(!staff) return;
  if(!staff.board) staff.board=[];
  if(!Array.isArray(staff.board)) staff.board = staff.board ? [staff.board] : [];
  const idx = staff.board.indexOf(boardVal);
  if(idx>=0) staff.board.splice(idx,1); else staff.board.push(boardVal);
  const isTrain = staff.board.includes('TRAIN') || !!staff.train;
  staff.train = isTrain;
  staff.boardBasis = (staff.board||[]).filter(b=>b!=='TRAIN').join(',');
  if(typeof saveStaffList==='function') try{saveStaffList();}catch(e){}
  if(typeof renderStaffList==='function') renderStaffList();
  if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat&&staff.airtableId){
    const boardToSave = staff.board.filter(b=>b!=='TRAIN');
    const payload = boardToSave.length===0 ? null : boardToSave;
    fetch('https://api.airtable.com/v0/'+base+'/STAFF%20LIST%20%28ROOMING%29/'+staff.airtableId,{
      method:'PATCH', headers:{'Authorization':'Bearer '+pat,'Content-Type':'application/json'},
      body: JSON.stringify({fields:{'BOARD BASIS': payload, 'TRAIN': isTrain}})
    }).then(r=>r.json()).then(d=>console.log('STAFF BOARD saved', payload, d)).catch(e=>console.error(e));
  }
}
window.toggleStaffBoardMulti = toggleStaffBoardMulti_FIXED;
window.toggleStaffBoardMulti_FIXED = toggleStaffBoardMulti_FIXED;


function updateStaffBoardSingle_FIXED(staffId, value){
  const staff = (window.staffList||[]).find(s=>s.id===staffId||s.airtableId===staffId);
  if(!staff) return;
  const hasTrain = (staff.board||[]).includes('TRAIN') || !!staff.train;
  if(value==='-'||value===''||value===null) staff.board = hasTrain ? ['TRAIN'] : [];
  else staff.board = hasTrain ? [value,'TRAIN'] : [value];
  staff.boardBasis = (staff.board||[]).filter(b=>b!=='TRAIN').join(',');
  if(typeof saveStaffList==='function') try{saveStaffList();}catch(e){}
  if(typeof renderStaffList==='function') renderStaffList();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat&&staff.airtableId){
    const boardToSave = (staff.board||[]).filter(b=>b!=='TRAIN');
    const payload = boardToSave.length===0 ? null : boardToSave;
    console.log('Saving BOARD BASIS for', staff.name, '->', payload);
    fetch('https://api.airtable.com/v0/'+base+'/STAFF%20LIST%20%28ROOMING%29/'+staff.airtableId,{
      method:'PATCH', headers:{'Authorization':'Bearer '+pat,'Content-Type':'application/json'},
      body: JSON.stringify({fields:{'BOARD BASIS': payload}})
    }).then(r=>r.json()).then(d=>{ console.log('STAFF BOARD single saved', value, d); if(d.error) alert('Airtable error: '+JSON.stringify(d.error)); }).catch(e=>{ console.error(e); alert('Gagal save board: '+e.message); });
  }
}
window.updateStaffBoardSingle = updateStaffBoardSingle_FIXED;
window.updateStaffBoardSingle_FIXED = updateStaffBoardSingle_FIXED;






function isStaffAssignedInLocation(staffId, loc){
  loc = (loc||activeLocation||'MEKAH').toString().toUpperCase();
  const staffObj = (window.staffList||[]).find(x=>x.id===staffId||x.airtableId===staffId);
  const staffName = (staffObj?.name||staffObj?.fields?.['NAMA']||'').toString().toUpperCase();
  for(const rec of (window.allRoomingRecords||[])){
    const recLoc = (rec.fields['LOKASI / CITY']||'MEKAH').toString().toUpperCase();
    if(recLoc!==loc) continue;
    const staffExtra = rec.fields['STAFF / EXTRA']||[];
    const staffArr = rec.fields['STAFF']||[];
    const tanpa = rec.fields['JEMAAH TANPA KATIL']||[];
    const staffTanpa = rec.fields['STAFF TANPA KATIL']||[];
    const tanpaKatil2 = rec.fields['TANPA KATIL']||[];
    const infant = rec.fields['INFANT']||[];
    const allLists = [...staffExtra, ...staffArr, ...tanpa, ...staffTanpa, ...tanpaKatil2, ...infant];
    if(allLists.includes(staffId)) return true;
    // Fallback check by name - Airtable sometimes stores name
    if(staffName){
      for(const idOrName of allLists){
        if(typeof idOrName==='string' && idOrName.toUpperCase().includes(staffName.split('(')[0].trim())) return true;
      }
    }
    // Check legacy roomIds
    if(staffObj && staffObj.roomIds && staffObj.roomIds.includes(rec.id)) return true;
  }
  return false;
}

function isStaffAssignedAny(staffId){ for(const loc of ['MEKAH','MADINAH','TAIF','JEDDAH','MUMTAZ']){ if(isStaffAssignedInLocation(staffId, loc)) return true; } return false; }


// FIX REALTIME GREY FOR STAFF TANPA KATIL
const _origUpdateRoomField = window.updateRoomField;
window.updateRoomField = async function(roomId, field, value, shouldRender=true){
  // Update local cache instantly
  const rec = (window.allRoomingRecords||[]).find(r=>r.id===roomId||r.airtableId===roomId);
  if(rec){
    if(!rec.fields) rec.fields={};
    rec.fields[field]=value;
    // If staff assigned to tanpa katil, also ensure staffList roomIds updated
    if(field==='JEMAAH TANPA KATIL' || field==='STAFF / EXTRA' || field==='STAFF' || field==='STAFF TANPA KATIL' || field==='TANPA KATIL'){
      // Trigger instant grey
      if(typeof renderStaffList==='function') setTimeout(()=>renderStaffList(), 50);
      if(typeof renderNamelist==='function') setTimeout(()=>renderNamelist(), 50);
    }
  }
  if(_origUpdateRoomField) return _origUpdateRoomField(roomId, field, value, shouldRender);
  // Fallback fetch
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat){
    fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${roomId}`,{
      method:'PATCH', headers:{'Authorization':'Bearer '+pat,'Content-Type':'application/json'},
      body: JSON.stringify({fields:{[field]: value}})
    }).then(()=>{ if(shouldRender){ renderRoomingGrid(); renderStaffList(); renderNamelist(); } }).catch(()=>{});
  }
};

// Also patch drop handlers for tanpa katil to trigger instant render
const _origDropStaff = window.dropStaff;
window.dropStaff = function(e, roomId, isTanpaKatil=false){
  if(_origDropStaff) {
    const res = _origDropStaff(e, roomId, isTanpaKatil);
    setTimeout(()=>{ if(typeof renderStaffList==='function') renderStaffList(); if(typeof renderRoomingGrid==='function') renderRoomingGrid(); }, 100);
    return res;
  }
};

// Patch remove from tanpa katil
const _origRemoveStaffFromTanpa = window.removeStaffFromTanpaKatil || window.removeJemaahFromTanpaKatil;
function instantRefreshAfterRemove(){
  setTimeout(()=>{ 
    if(typeof renderStaffList==='function') renderStaffList(); 
    if(typeof renderNamelist==='function') renderNamelist();
    if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  }, 100);
}

// Hook all remove functions
['removeStaffFromRoom','removeStaffFromTanpaKatil','removeJemaahFromTanpaKatil','removeJemaahFromRoom'].forEach(fnName=>{
  const orig = window[fnName];
  if(orig){
    window[fnName] = function(){
      const res = orig.apply(this, arguments);
      instantRefreshAfterRemove();
      return res;
    };
  }
});

console.log('REALTIME GREY FIX FOR STAFF TANPA KATIL ACTIVE');

// ===== V103.2 OVERRIDES - FIX TAB CLICK =====
console.log('V103.2 OVERRIDES applying');

var _autoScrollInterval = window._autoScrollInterval || null;
window._autoScrollInterval = _autoScrollInterval;
window._roomingDragListenersAdded = window._roomingDragListenersAdded || false;
window._switchingLocation = false;

function _stopAutoScroll(){ 
  try {
    if(window._autoScrollInterval){ clearInterval(window._autoScrollInterval); window._autoScrollInterval=null; } 
    if(typeof _autoScrollInterval!=='undefined' && _autoScrollInterval){ clearInterval(_autoScrollInterval); _autoScrollInterval=null; } 
  } catch(e){}
}
function _startAutoScroll(){
  if(window._autoScrollInterval) return;
  if(typeof _autoScrollInterval!=='undefined' && _autoScrollInterval) return;
  try {
    _autoScrollInterval=setInterval(()=>{
      const y=window._lastDragY||0;
      if(y<140){ window.scrollBy(0, -22); }
      else if(y>window.innerHeight-140){ window.scrollBy(0, 22); }
    }, 35);
    window._autoScrollInterval=_autoScrollInterval;
  } catch(e){}
}
function allowDrop(e){ 
  try { e.preventDefault(); } catch(e){}
  window._lastDragY=e.clientY; 
  _startAutoScroll(); 
}
window.allowDrop = allowDrop;
window._stopAutoScroll = _stopAutoScroll;
window._startAutoScroll = _startAutoScroll;

if(!window._roomingDragListenersAdded){
  document.addEventListener('dragover', (e)=>{ window._lastDragY=e.clientY; _startAutoScroll(); }, {passive:false});
  document.addEventListener('dragend', ()=>{ _stopAutoScroll(); });
  document.addEventListener('drop', ()=>{ _stopAutoScroll(); });
  window._roomingDragListenersAdded = true;
  console.log('Drag listeners added ONCE');
}

function renderLocationTabs(){
  const container=document.getElementById('locationTabs'); 
  if(!container) return;
  if(container.dataset.rendering==='1') return;
  container.dataset.rendering='1';
  try {
    const base=['MEKAH','MADINAH','TAIF']; 
    const custom = window.customLocations || (typeof customLocations!=='undefined'?customLocations:[]);
    const all=[...base,...custom.filter(l=>!base.includes(l))];
    const allLocFromRecords = new Set();
    const records = window.allRoomingRecords || (typeof allRoomingRecords!=='undefined'?allRoomingRecords:[]);
    records.forEach(r=>{ const l=(r.fields['LOKASI / CITY']||'').trim().toUpperCase(); if(l) allLocFromRecords.add(l); });
    allLocFromRecords.forEach(l=>{ if(!all.includes(l)) all.push(l); });
    const counts={}; all.forEach(l=>counts[l]=0); 
    records.forEach(r=>{ 
      let l=(r.fields['LOKASI / CITY']||'').trim().toUpperCase(); 
      if(!l) l='MEKAH';
      if(counts[l]!==undefined) counts[l]++; 
      else { counts[l]=1; if(!all.includes(l)) all.push(l); } 
    });
    let html=all.map(loc=>{
      const c=counts[loc]||0; 
      const active=loc===(window.activeLocation|| (typeof activeLocation!=='undefined'?activeLocation:'MEKAH')); 
      const isCustom=!['MEKAH','MADINAH','TAIF'].includes(loc);
      const delBtn=isCustom?`<button type="button" onclick="event.stopPropagation(); deleteCustomLocation('${loc}')" class="ml-1 w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-[9px]">x</button>`:''; 
      const wrapCls=active?'bg-[#7A0C2E] rounded-full':'bg-white rounded-full border border-slate-200';
      return `<div class="inline-flex items-center ${wrapCls}"><button type="button" data-loc="${loc}" onclick="window.setActiveLocation('${loc}')" class="px-2.5 py-1 rounded-full text-[11px] font-bold ${active?'text-white':'text-slate-700'}">${loc} (${c})</button>${delBtn}</div>`;
    }).join('');
    html+=`<button type="button" onclick="openAddLocationModal()" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200">+ Lokasi</button>`;
    container.innerHTML=html;
  } catch(e){ console.error('renderLocationTabs error', e); }
  finally {
    setTimeout(()=>{ container.dataset.rendering='0'; }, 150);
  }
}
window.renderLocationTabs = renderLocationTabs;

function setActiveLocation(loc){
  if(!loc) return;
  if(window._switchingLocation) return;
  window._switchingLocation = true;
  try {
    const newLoc = loc.toString().toUpperCase();
    if(typeof activeLocation!=='undefined') activeLocation = newLoc;
    window.activeLocation = newLoc;
    localStorage.setItem('effah_active_location', newLoc);
    const el=document.getElementById('copyTargetLoc'); if(el) el.textContent=newLoc;
    if(typeof renderLocationTabs==='function') renderLocationTabs();
    if(typeof renderRoomingGrid==='function') renderRoomingGrid();
    if(typeof renderNamelist==='function') renderNamelist();
    if(typeof renderStaffList==='function') renderStaffList();
    console.log('Location switched to', newLoc);
  } catch(e){ console.error(e); }
  finally {
    setTimeout(()=>{ window._switchingLocation = false; }, 350);
  }
}
window.setActiveLocation = setActiveLocation;

console.log('V103.2 FIX TAB CLICK fully loaded - single listeners, debounced tabs');


// FIX 422 - prevent staff ID going into JEMAAH TANPA KATIL
(function(){
  const origUpdate = window.updateRoomField;
  if(origUpdate && !origUpdate._fixed422){
    window.updateRoomField = async function(roomId, field, value, shouldRender=true){
      // If trying to save staff into JEMAAH TANPA KATIL, redirect
      if(field==='JEMAAH TANPA KATIL' || field==='TANPA KATIL'){
        // Check if value contains staff ids
        const staffIds = (window.staffList||[]).map(s=>s.id||s.airtableId);
        const hasStaff = (Array.isArray(value) ? value.some(v=>staffIds.includes(v)) : staffIds.includes(value));
        if(hasStaff){
          console.warn('FIX 422: Redirecting staff from JEMAAH TANPA KATIL to STAFF TANPA KATIL');
          field = 'STAFF TANPA KATIL';
        }
      }
      return origUpdate.call(this, roomId, field, value, shouldRender);
    };
    window.updateRoomField._fixed422 = true;
    console.log('FIX 422 applied');
  }
})();


window.toggleBoardDropdown = window.toggleBoardDropdown || toggleBoardDropdown;
window.closeBoardDropdown = window.closeBoardDropdown || closeBoardDropdown;
window.toggleInsuranDropdown = window.toggleInsuranDropdown || toggleInsuranDropdown;
window.closeInsuranDropdown = window.closeInsuranDropdown || closeInsuranDropdown;


function handleRoomDragLeave(e){
  try {
    const el = e.currentTarget || e.target;
    if(el && el.classList) el.classList.remove('drag-over','ring-2','ring-[#7A0C2E]','bg-amber-50');
  } catch(err){}
  _stopAutoScroll();
}
function handleRoomDragEnter(e){
  try { e.preventDefault(); const el=e.currentTarget; if(el&&el.classList) el.classList.add('drag-over'); } catch(err){}
  window._lastDragY=e.clientY;
  _startAutoScroll();
}
function allowDropRoom(e){
  try { e.preventDefault(); e.dataTransfer.dropEffect='move'; } catch(err){}
  window._lastDragY=e.clientY;
  try{ _startAutoScroll(); }catch(err){}
  const el=e.currentTarget;
  if(el && el.classList) el.classList.add('drag-over','ring-2','ring-[#7A0C2E]/40');
}
function leaveDropRoom(e){
  handleRoomDragLeave(e);
}
function dropRoomReorder(e, roomId){
  // placeholder - if reordering logic exists, keep
  if(typeof window.dropRoomReorderOriginal==='function') return window.dropRoomReorderOriginal(e, roomId);
}
window.handleRoomDragLeave = handleRoomDragLeave;
window.handleRoomDragEnter = handleRoomDragEnter;
window.allowDropRoom = allowDropRoom;
window.leaveDropRoom = leaveDropRoom;
window.dropRoomReorder = dropRoomReorder;
console.log('Drag room handlers injected');



// PATCH V103.17 - Fix STATUS VISA Single Select clear - SINGLE SELECT needs null, not ""
(function(){
  const originalUpdate = window.updateJemaahField;
  window.updateJemaahField = async function(jemaahId, field, value){
    console.log('PATCHED updateJemaahField', jemaahId, field, JSON.stringify(value));
    if(field==='STATUS VISA'){
      let v = (value===null||value===undefined) ? '' : value.toString().trim();
      // If user selected "- VISA" or empty, clear it
      if(v==='' || v.toUpperCase()==='- VISA' || v.toUpperCase()==='VISA' || v==='-' || v==='--'){
        console.log('Clearing STATUS VISA -> null for', jemaahId, 'original value was', JSON.stringify(value));
        value = null;
        // Direct Airtable clear for Single Select - bypass original
        const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
        const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
        if(!base||!pat) return alert('Airtable config missing');
        const rec = allRoomingJemaah.find(r=>r.id===jemaahId);
        if(rec) rec.fields[field]=null;
        if(typeof renderNamelist==='function') renderNamelist();
        try{
          const res = await fetch(`https://api.airtable.com/v0/${base}/DATA%20JEMAAH%20UMRAH/${jemaahId}`,{
            method:'PATCH',
            headers:{Authorization:`Bearer ${pat}`,'Content-Type':'application/json'},
            body: JSON.stringify({fields:{[field]: null}})
          });
          const data = await res.json();
          if(data.error){
            console.error('Airtable clear error', data.error);
            alert('Gagal clear STATUS VISA. Error: '+data.error.message+'\n\nField ni Single Select. Kalau masih error, pergi Airtable dan delete value manual, atau tukar field ke Multiple Select.');
          }else{
            console.log('Clear success', field);
          }
        }catch(e){
          console.error('Fetch error', e);
        }
        return; // Important: don't call original
      }
      // Valid values: ensure they exist in Airtable options
      const validOptions = ['TOURIST','TOURIST (VALID)','UMRAH','UMRAH (VALID)','IQAMA (VALID)'];
      if(!validOptions.includes(v)){
        console.warn('Invalid VISA option', v, 'should be one of', validOptions);
        // If invalid like "VISA" alone, clear it
        if(v.toUpperCase()==='VISA'){
          alert('Option VISA sahaja tidak wujud di Airtable. Sila pilih TOURIST, UMRAH, etc. atau - VISA untuk clear.');
          return;
        }
      }
    }
    // For other fields or valid VISA values, call original
    if(originalUpdate && originalUpdate !== window.updateJemaahField){
      return await originalUpdate(jemaahId, field, value);
    }
  };
  console.log('V103.17 PATCH applied - STATUS VISA single select clear uses null');
})();


// CSS fix for overlap
(function(){
  const style = document.createElement('style');
  style.textContent = `
    #namelistContainer .grid-cols-12 { gap: 2px; }
    #namelistContainer .grid-cols-12 > div.col-span-1 { min-width: 0; overflow: hidden; }
    #namelistContainer select { font-size: 7px !important; padding: 2px 4px !important; max-width: 62px !important; line-height: 1.1; }
    #namelistContainer .col-span-1 select { max-width: 58px !important; }
    #namelistContainer .col-span-2 select { max-width: 80px !important; }
  `;
  document.head.appendChild(style);
  console.log('V103.22 CSS overlap fix applied');
})();

window.fetchRoomingData = fetchRoomingData;
window.onRoomingTripChange = onRoomingTripChange;


async function dropRoomReorder(e, targetRoomId){
  e.preventDefault(); e.stopPropagation();
  try{ e.currentTarget.classList.remove('ring-2','ring-[#7A0C2E]/30','ring-amber-300','drag-over','ring-[#7A0C2E]/40'); }catch(err){}
  let srcId = draggedRoomId || window.draggedRoomId || window._draggedRoomId;
  try{
    const dtRoom = e.dataTransfer.getData('text/room-id') || e.dataTransfer.getData('text/plain');
    if(dtRoom && dtRoom.startsWith('rec')) srcId = dtRoom;
  }catch(err){}
  console.log('DROP ROOM REORDER src', srcId, 'target', targetRoomId);
  if(!srcId || srcId===targetRoomId) return;
  if(!allRoomingRecords.some(r=>r.id===srcId)) return;
  const rooms=[...allRoomingRecords].filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation.toUpperCase());
  const ordered=getRoomOrderedList(rooms);
  const draggedIdx=ordered.findIndex(r=>r.id===srcId);
  const targetIdx=ordered.findIndex(r=>r.id===targetRoomId);
  if(draggedIdx===-1 || targetIdx===-1) return;
  const moved=ordered.splice(draggedIdx,1)[0];
  ordered.splice(targetIdx,0,moved);
  ordered.forEach((r,i)=>{ r.fields['SORT ORDER']=i+1; });
  saveRoomOrder(ordered.map(r=>r.id));
  console.log('ROOM ORDER SAVED', ordered.map((r,i)=>`${i+1}`));
  draggedRoomId=null; window.draggedRoomId=null; window._draggedRoomId=null;
  try{ e.dataTransfer.clearData(); }catch(err){}
  try{ e.stopImmediatePropagation(); }catch(err){}
  renderRoomingGrid();
  try{
    const base=window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id'); 
    const pat=window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
    for(let i=0;i<ordered.length;i++){
      const rec=ordered[i];
      fetch(`https://api.airtable.com/v0/${base}/ROOMING%20LIST/${rec.id}`,{
        method:'PATCH',
        headers:{'Authorization':`Bearer ${pat}`,'Content-Type':'application/json'},
        body: JSON.stringify({fields:{'SORT ORDER': i+1}})
      }).then(()=>console.log('SORT ORDER updated', rec.id.substring(0,6), i+1));
    }
  }catch(err){ console.error(err); }
}



window.generateRoomingPrint = generateRoomingPrint;
window.printLandscape = function(){ generateRoomingPrint('landscape'); };
window.printPortrait = function(){ generateRoomingPrint('portrait'); };
