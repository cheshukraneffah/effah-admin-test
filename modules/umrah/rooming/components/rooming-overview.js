// components/rooming-overview.js V103.40 PROXY ONLY
function renderRoomingOverview(rooms){
  const el=document.getElementById('roomingOverview'); if(!el) return;
  if(rooms.length===0){ el.innerHTML='<div class="flex items-center gap-2 text-[11px] opacity-70"><span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Tiada bilik untuk '+activeLocation+'</div>'; return; }
  const byHotel = {};
  rooms.forEach(r=>{
    const hotel = (r.fields['HOTEL NAME']||'TANPA HOTEL').trim().toUpperCase() || 'TANPA HOTEL';
    if(!byHotel[hotel]) byHotel[hotel]={};
    const cap=r.fields['KAPASITI']||4;
    byHotel[hotel][cap]=(byHotel[hotel][cap]||0)+1;
  });
  // count FB per hotel
  function countFBForHotel(hotelRooms, locUpper){
    let cnt=0;
    hotelRooms.forEach(r=>{
      const jIds=[...(r.fields['JEMAAH']||[]), ...(r.fields['JEMAAH TANPA KATIL']||[])];
      jIds.forEach(jId=>{
        const jRec=allRoomingJemaah.find(j=>j.id===jId);
        const fbArr=getBoardArray(jRec?.fields||{});
        const fb=fbArr.join(', ').toUpperCase();
        if(!fb || fb==='-' || fb==='NO BOARD') return;
        if(locUpper==='MEKAH'){ if(fb.includes('MEKAH')||fb==='BOARD BASIS'&&!fb.includes('MADINAH')||fb==='BOARD') cnt++; }
        else if(locUpper==='MADINAH'){ if(fb.includes('MADINAH')||fb==='BOARD BASIS'&&!fb.includes('MEKAH')||fb==='BOARD') cnt++; }
        else cnt++;
      });
    });
    return cnt;
  }
  let fbCount=0; const loc=activeLocation.toUpperCase();
  allRoomingJemaah.forEach(j=>{
    const fb=(j.fields['BOARD']||'').toUpperCase(); if(!fb || fb==='-' || fb==='NO BOARD') return;
    const assigned = rooms.some(r=> (r.fields['JEMAAH']||[]).includes(j.id) || (r.fields['JEMAAH TANPA KATIL']||[]).includes(j.id));
    if(!assigned) return;
    if(loc==='MEKAH'){ if(fb.includes('MEKAH')||fb==='BOARD') fbCount++; }
    else if(loc==='MADINAH'){ if(fb.includes('MADINAH')||fb==='BOARD') fbCount++; }
    else fbCount++;
  });
  const totalBilik=rooms.length;
  const totalJ=rooms.reduce((s,r)=>s+(r.fields['JEMAAH']?.length||0),0);
  const totalBaby=rooms.reduce((s,r)=>s+(r.fields['JEMAAH TANPA KATIL']?.length||0),0);
  // FIX: count staff from both text field and linked staffList (same as renderRoomingGrid)
  const staffFromText = rooms.reduce((s,r)=>s+(r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length,0);
  const staffFromLinked = rooms.reduce((s,r)=>{ try{ return s+getStaffForRoom(r.id).length; }catch(e){ return s; } },0);
  const totalStaff = staffFromText + staffFromLinked;
  const totalJemaahFull = totalJ + totalBaby; // infant masuk dalam jemaah count

  let hotelBlocks = Object.keys(byHotel).sort().map(hotel=>{
    const caps=byHotel[hotel];
    const hotelRooms = allRoomingRecords.filter(r=> (r.fields['HOTEL NAME']||'TANPA HOTEL').toUpperCase()===hotel && (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===loc);
    const fbHotel = countFBForHotel(hotelRooms, loc);
    const capsList = Object.keys(caps).sort((a,b)=>b-a).map(cap=>{
      const cnt=caps[cap];
      return `<span class="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full text-[10px] mr-1 mb-1"><span>Bilik ber-${cap}</span><span class="font-bold">(${cnt})</span></span>`;
    }).join('');
    const safeHotel = hotel.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const jemaahInHotel = hotelRooms.reduce((s,r)=>s+(r.fields['JEMAAH']?.length||0),0);
    return `<div class="flex flex-col gap-1.5 py-2.5 border-b border-white/10 last:border-0">
      <div class="flex items-center justify-between">
        <span class="font-bold text-[11px] truncate">${hotel} <span class="font-normal opacity-70 text-[9px]">(${jemaahInHotel} pax)</span></span>
        <div class="flex gap-1">
          <button onclick="downloadHotelDocs('${loc.replace(/'/g, "\'")}', '${safeHotel}', 'VISA COPY', 'Visas')" class="px-2 py-0.5 bg-white text-[#7A0C2E] rounded-full text-[8px] font-bold hover:bg-slate-100 border border-white/50" title="Download Visas ${hotel}">⬇ Visas</button>
          <button onclick="downloadHotelDocs('${loc.replace(/'/g, "\'")}', '${safeHotel}', 'PASSPORT COPY', 'Passports')" class="px-2 py-0.5 bg-white text-[#7A0C2E] rounded-full text-[8px] font-bold hover:bg-slate-100 border border-white/50" title="Download Passports ${hotel}">⬇ Passports</button>
        </div>
      </div>
      <div class="flex flex-wrap">${capsList}</div>
    </div>`;
  }).join('');

  let html=`<div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="font-bold text-[13px] tracking-widest">${activeLocation} • ${totalBilik} Bilik</div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold">${totalJemaahFull} Jemaah + ${totalStaff} Staff</span>
        ${fbCount?``:''}
      </div>
    </div>
    <div class="bg-white/10 rounded-xl p-2.5 max-h-[26vh] overflow-y-auto">
      ${hotelBlocks||'<div class="opacity-70 text-[11px]">Tiada data hotel</div>'}
    </div>
  </div>`;
  el.innerHTML=html;
}