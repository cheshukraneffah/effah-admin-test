// components/rooming-fix-helpers.js V103.43 CLEAN PROXY - 43 funcs
function resolveTableIdFromOldUrl(old){
  old = decodeURIComponent(old);
  if(old.includes('STAFF LIST')) return EFFAH_T.STAFF;
  if(old.includes('ROOMING LIST')) return EFFAH_T.ROOMING;
  if(old.includes('DATA JEMAAH')) return EFFAH_T.PAX;
  if(old.includes('PAKEJ UMRAH') || old.includes('TRIP')) return EFFAH_T.TRIP;
  return null;
}

function cleanTripNameForRooming(name){
  if(!name) return '';
  if(typeof cleanTripName==='function') return cleanTripName(name);
  return name.replace(/^\s*\d+\/\d+\s*\|\s*/i, '').replace(/^\s*\d+\/\d+\s*/i,'').trim();
}

function getBoardArray(f){
  if(!f) return [];
  try{
    const raw = f['BOARD BASIS'] || f['BOARD'] || '';
    if(!raw) return [];
    if(Array.isArray(raw)) return raw.filter(Boolean).map(s=>String(s).trim()).filter(Boolean);
    if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(s=>s.trim()).filter(Boolean);
    if(raw && raw!=='-' && raw!=='' && raw!=='NO BOARD' && raw!=='NO BOARD BASIS') return [String(raw).trim()];
  }catch(e){ console.warn('getBoardArray error', e, f); }
  return [];
}

function getNameForAnyId(id){
  const jRec=allRoomingJemaah.find(j=>j.id===id);
  if(jRec) return getJemaahName(jRec.fields);
  const sRec=staffList.find(s=>s.id===id||s.airtableId===id);
  if(sRec) return sRec.name+' (STAFF TANPA KATIL)';
  return id.substring(0,8)+'... (Unknown)';
}

function renderInsuranCell(jId, insArr){
  var opts=['TAKAFUL','ETIQA','AL-KHAIRI'];
  var display=insArr.length? insArr.join(', ') : '-';
  var cls=insArr.length? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200';
  var html='<div class="relative"><button onclick="toggleInsuranDropdown(\''+jId+'\')" class="w-full text-[8px] border rounded-full px-2.5 py-1.5 font-bold '+cls+' text-left flex items-center justify-between opacity-100"><span class="truncate">'+display+'</span><span>▼</span></button><div id="insuranDrop-'+jId+'" class="hidden absolute z-[9999] mt-1 w-48 bg-white border border-slate-300 rounded-xl shadow-2xl p-1 opacity-100" style="background:white; opacity:1;">';
  for(var i=0;i<opts.length;i++){
    var o=opts[i];
    var checked=insArr.includes(o)?'checked':'';
    html+='<label class="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer text-[11px]"><input type="checkbox" '+checked+' onchange="toggleInsuranMulti(\''+jId+'\',\''+o+'\')" class="w-3.5 h-3.5 accent-[#7A0C2E]"> '+o+'</label>';
  }
  html+='<div class="flex justify-between gap-1 mt-1 pt-1 border-t bg-white"><button onclick="clearInsuranMulti(\''+jId+'\'); closeInsuranDropdown(\''+jId+'\')" class="text-[9px] px-3 py-1 rounded-full bg-slate-100">Clear</button><button onclick="closeInsuranDropdown(\''+jId+'\')" class="text-[9px] px-3 py-1 rounded-full bg-[#7A0C2E] text-white">OK</button></div></div></div>';
  return html;
}

function getInsuranArrayV2(f){
  if(!f) return [];
  const raw = f['INSURAN'] || f['INSURANCE'] || '';
  if(Array.isArray(raw)) return raw.filter(Boolean).map(s=>String(s).trim());
  if(typeof raw === 'string' && raw.includes(',')) return raw.split(',').map(s=>s.trim()).filter(Boolean);
  if(raw && raw!=='-' && raw!=='') return [String(raw).trim()];
  return [];
}

function getStaffById(id){ return staffList.find(s=>s.id===id||s.airtableId===id); }

function clearInsuranMulti(jemaahId){ const rec=allRoomingJemaah.find(r=>r.id===jemaahId); if(!rec) return; rec.fields['INSURAN']=[]; if(typeof updateJemaahField==='function') updateJemaahField(jemaahId, 'INSURAN', []); if(typeof renderNamelist==='function') renderNamelist(); }

function getFullboardVal(f){ 
  const arr=getBoardArray(f);
  return arr[0]||'';
}

function getFullboardDisplay(f){
  const arr=getBoardArray(f);
  if(arr.length===0) return '-';
  return arr.join(', ');
}

function getPakejVal(f){ return f['PAKEJ'] || ''; }

function getVisaVal(f){ return f['STATUS VISA'] || f['VISA'] || ''; }

function getVisaClass(v){
  v=(v||'').toUpperCase();
  if(v.includes('VALID')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if(v==='TOURIST') return 'bg-amber-50 border-amber-200 text-amber-700';
  if(v==='UMRAH') return 'bg-blue-50 border-blue-200 text-blue-700';
  if(v==='IQAMA (VALID)') return 'bg-purple-50 border-purple-200 text-purple-700';
  return 'bg-white border-slate-200 text-slate-600';
}

function getInsuranVal(f){
  const v=f['INSURAN'];
  if(!v) return '';
  if(Array.isArray(v)) return v.join(', ');
  return v;
}

function getInsuranArray(f){
  const v=f['INSURAN'];
  if(!v) return [];
  if(Array.isArray(v)) return v;
  return [v];
}

function isTrainChecked(f){ return !!f['TRAIN']; }

function formatCheckbox(v){ return v ? '✓' : '-'; }

function getRoomOrderKey(){ const tripId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'; return `effah_room_order_${tripId}_${activeLocation}`; }

function getRoomOrderedList(rooms){
  try{
    if(!rooms || rooms.length===0){
      console.log('getRoomOrderedList: no rooms for location', activeLocation);
      return [];
    }
    const key=getRoomOrderKey(); 
    let localOrder=[];
    try{ localOrder=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ localOrder=[]; }
    // If local order exists and matches room count, use it (user dragged in portal)
    if(localOrder.length>0 && localOrder.length>=rooms.length*0.8){ 
      const map={}; rooms.forEach(r=>{ if(r&&r.id) map[r.id]=r; }); 
      const ordered=[]; 
      localOrder.forEach(id=>{ if(map[id]){ ordered.push(map[id]); delete map[id]; } }); 
      Object.values(map).forEach(r=>ordered.push(r)); 
      console.log('getRoomOrderedList: using LOCAL order', key, ordered.length);
      return ordered; 
    }
    // Otherwise use Airtable SORT ORDER field
    const sorted = [...rooms].filter(r=>r&&r.fields).sort((a,b)=>(a.fields['SORT ORDER']||9999)-(b.fields['SORT ORDER']||9999));
    console.log('getRoomOrderedList: using AIRTABLE SORT ORDER', sorted.length, sorted.map(r=>r.fields['SORT ORDER']+'='+r.id.substring(0,6)).slice(0,7));
    return sorted;
  }catch(e){
    console.error('getRoomOrderedList error', e);
    return rooms||[];
  }
}

function saveRoomOrder(ids){ localStorage.setItem(getRoomOrderKey(), JSON.stringify(ids)); }

function loadLocalCatatan(roomId){
  try{
    const key='effah_room_notes_'+roomId;
    return localStorage.getItem(key)||'';
  }catch(e){ return ''; }
}

function populateRoomingTripDropdown(){
  const sel=document.getElementById('roomingTripSelect'); if(!sel) return;
  let trips=[...(window.allTripUmrahRecords||window.allTripRecords||window.allTrips||[])];
  const currentId=window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||localStorage.getItem('effah_last_selected_trip')||localStorage.getItem('selectedTripId')||'';
  if(trips.length===0){
    sel.innerHTML='<option value="">Memuatkan senarai trip...</option>';
    let retries=parseInt(sel.dataset.retries||'0'); if(retries<10){ sel.dataset.retries=retries+1; setTimeout(()=>{ if(typeof fetchTripUmrahData==='function') fetchTripUmrahData(); populateRoomingTripDropdown(); }, 900); }
    return;
  }
  trips.sort((a,b)=>(a.fields?.['Mula Pakej']||'').localeCompare(b.fields?.['Mula Pakej']||''));
  sel.innerHTML='<option value="">Pilih Trip...</option>'+trips.map(t=>{ const raw=t.fields?.Trip||t.fields?.['TRIP NAME']||t.id; const clean=cleanTripNameForRooming(raw); return `<option value="${t.id}" ${t.id===currentId?'selected':''}>${clean}</option>`; }).join('');
  if(currentId) sel.value=currentId; else if(trips.length>0){ sel.value=trips[0].id; onRoomingTripChange(trips[0].id); }
}

function isJemaahAssignedInLocation(jId, location){
  const loc = (location||activeLocation).toUpperCase();
  return allRoomingRecords.some(r=> (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===loc && (r.fields['JEMAAH']||[]).includes(jId));
}

function isJemaahAssigned(jId){ return allRoomingRecords.some(r=>(r.fields['JEMAAH']||[]).includes(jId)); }

function isJemaahAssignedTanpaKatil(jId){
  try{ return allRoomingRecords.some(r=>{ const arr=r.fields['JEMAAH TANPA KATIL']||r.fields['INFANT']||[]; return arr.includes(jId); }); }catch(e){ return false; }
}

function isJemaahAssignedAny(jId){
  return isJemaahAssigned(jId) || isJemaahAssignedTanpaKatil(jId);
}

function isStaffAssigned(staffId){ const s=staffList.find(x=>x.id===staffId); if(!s) return false; return allRoomingRecords.some(r=> (r.fields['STAFF / EXTRA']||'').split(',').map(x=>x.trim()).includes(s.name)); }

function quickAssign(jId){ if(isJemaahAssignedInLocation(jId, activeLocation)) return; const rooms=allRoomingRecords.filter(r=>(r.fields['LOKASI / CITY']||'MEKAH').toUpperCase()===activeLocation); const target=rooms.find(r=>{ const j=r.fields['JEMAAH']?.length||0; const s=(r.fields['STAFF / EXTRA']||'').split(',').filter(Boolean).length; return (j+s)<(r.fields['KAPASITI']||4); }); if(target) assignJemaahToRoom(jId,target.id); }

function clearBoardMulti(jemaahId){
  // First update local to empty
  const rec=allRoomingJemaah.find(r=>r.id===jemaahId);
  if(rec){ rec.fields['BOARD BASIS']=[]; rec.fields['BOARD']=''; }
  if(typeof renderNamelist==='function') renderNamelist();
  const base = window.AIRTABLE_BASE_ID||localStorage.getItem('effah_api_base')||localStorage.getItem('effah_base_id');
  const pat = window.AIRTABLE_PAT||localStorage.getItem('effah_api_pat');
  if(base&&pat){
    // BOARD might be formula/lookup - only patch BOARD BASIS (Multiple Select)
    fetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}&recordId=${jemaahId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{'BOARD BASIS': []}})}).then(async r=>{ const d=await r.json(); if(d.error){ console.error('Clear jemaah board FAIL', d.error); } else { console.log('Clear jemaah board OK', d.id); } }).catch(e=>console.error(e));
  }
}

function updateHotelInline(roomId, newName){
  const name = (newName||'').trim().toUpperCase();
  if(!name){ alert('Sila masukkan nama hotel'); return; }
  updateRoomField(roomId,'HOTEL NAME',name,true);
}

function deleteCustomLocation(loc){ if(!confirm(`Adakah anda pasti ingin memadamkan lokasi ${loc}?`)) return; customLocations=customLocations.filter(l=>l!==loc); localStorage.setItem('effah_custom_locations',JSON.stringify(customLocations)); if(activeLocation===loc) activeLocation='MEKAH'; renderLocationTabs(); renderRoomingGrid(); renderNamelist(); }

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

function instantRefreshAfterRemove(){
  setTimeout(()=>{ 
    if(typeof renderStaffList==='function') renderStaffList(); 
    if(typeof renderNamelist==='function') renderNamelist();
    if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  }, 100);
}

async function loadPdfLib(){
  if(window.PDFLib && window.PDFLib.PDFDocument) return window.PDFLib;
  return new Promise((resolve, reject)=>{
    const existing=document.querySelector('script[src*="pdf-lib"]');
    if(existing && window.PDFLib){
      resolve(window.PDFLib);
      return;
    }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.onload=()=>{
      // UMD exposes window.PDFLib (capital L)
      const lib = window.PDFLib || window.pdfLib || window.pdf_lib;
      if(lib && lib.PDFDocument){
        window.PDFLib = lib;
        resolve(lib);
      } else {
        // Try unpkg fallback
        const script2=document.createElement('script');
        script2.src='https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
        script2.onload=()=>{
          const lib2 = window.PDFLib || window.pdfLib;
          if(lib2) resolve(lib2);
          else reject(new Error('pdf-lib loaded but PDFDocument undefined'));
        };
        script2.onerror=()=>reject(new Error('Failed to load pdf-lib from both CDNs'));
        document.head.appendChild(script2);
      }
    };
    script.onerror=()=>{
      // Try unpkg
      const script2=document.createElement('script');
      script2.src='https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
      script2.onload=()=>{
        const lib2 = window.PDFLib || window.pdfLib;
        if(lib2) resolve(lib2);
        else reject(new Error('pdf-lib fallback loaded but undefined'));
      };
      script2.onerror=()=>reject(new Error('Failed to load pdf-lib'));
      document.head.appendChild(script2);
    };
    document.head.appendChild(script);
  });
}

async function fetchWithRetry(url, retries=2){
  for(let i=0;i<=retries;i++){
    if(window._visaDownloadCancelled) throw new Error('Cancelled by user');
    try{
      const signal=window._visaAbortController?window._visaAbortController.signal:undefined;
      const res=await fetch(url, {mode:'cors', signal});
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.arrayBuffer();
    }catch(e){
      if(e.name==='AbortError' || window._visaDownloadCancelled) throw new Error('Cancelled by user');
      if(i===retries) throw e;
      await new Promise(r=>setTimeout(r, 500));
    }
  }
}

function cancelVisaDownload(){
  window._visaDownloadCancelled=true;
  if(window._visaAbortController) window._visaAbortController.abort();
  const logEl=document.getElementById('visaProgressLog');
  if(logEl){
    const div=document.createElement('div');
    div.className='text-red-500 font-bold';
    div.textContent='✕ Cancelled by user';
    logEl.appendChild(div);
  }
  document.getElementById('visaProgressName').textContent='Cancelled';
  const cancelBtn=document.getElementById('visaCancelBtn');
  const cancelBtn2=document.getElementById('visaCancelBtn2');
  const closeBtn=document.getElementById('visaCloseBtn');
  if(cancelBtn) cancelBtn.classList.add('hidden');
  if(cancelBtn2) cancelBtn2.classList.add('hidden');
  if(closeBtn) closeBtn.classList.remove('hidden');
  // Reset main button
  const mainBtn=document.getElementById('btnDownloadVisas');
  if(mainBtn){ mainBtn.disabled=false; mainBtn.innerHTML=mainBtn.getAttribute('data-original')||'⬇ Download Visas (<span id="visaCountBadge">0</span>)'; }
  setTimeout(()=>{ closeVisaModal(); }, 1500);
}

function closeVisaModal(){
  const m=document.getElementById('visaDownloadModal');
  if(m) m.classList.add('hidden');
  window._visaDownloadCancelled=false;
}

async function downloadAllVisas(){
  return _downloadAllDocs('VISA COPY', 'Visas');
}

async function downloadAllPassports(){
  return _downloadAllDocs('PASSPORT COPY', 'Passports');
}

function getFieldAttachments(jFields, names){
  if(!jFields) return null;
  for(let n of names){
    if(jFields[n] && Array.isArray(jFields[n]) && jFields[n].length>0) return jFields[n];
  }
  const keys=Object.keys(jFields);
  for(let k of keys){
    const up=k.toUpperCase().trim();
    for(let t of names){
      if(up===t.toUpperCase().trim() || up.includes(t.toUpperCase().trim())){
        const v=jFields[k];
        if(Array.isArray(v)&&v.length>0) return v;
      }
    }
  }
  return null;
}

function updateVisaCountBadge(){
  try{
    const visaNames=['VISA COPY','VISA','VISA_COPY'];
    const passNames=['PASSPORT COPY','PASSPORT','PASSPORT_COPY','PASSPORT SCAN'];
    let visaCount=0, passCount=0;
    (allRoomingJemaah||[]).forEach(j=>{
      if(getFieldAttachments(j.fields||{}, visaNames)) visaCount++;
      if(getFieldAttachments(j.fields||{}, passNames)) passCount++;
    });
    console.log(`Badge count - allRoomingJemaah: ${allRoomingJemaah?.length} Visa:${visaCount} Passport:${passCount}`);
    // Also check direct if available
    if(window._allJemaahDirect && window._allJemaahDirect.length>0){
      const dv = window._allJemaahDirect.filter(r=> getFieldAttachments(r.fields||{}, visaNames)).length;
      const dp = window._allJemaahDirect.filter(r=> getFieldAttachments(r.fields||{}, passNames)).length;
      console.log(`Badge direct: ${window._allJemaahDirect.length} Visa:${dv} Passport:${dp}`);
      if(dv>visaCount) visaCount=dv;
      if(dp>passCount) passCount=dp;
    }
    const vBadge=document.getElementById('visaCountBadge');
    const pBadge=document.getElementById('passportCountBadge');
    if(vBadge) vBadge.textContent=visaCount;
    if(pBadge) pBadge.textContent=passCount;
  }catch(e){ console.error('updateVisaCountBadge error', e); }
}

async function updatePassportCountFromDirectFetch(){
  try{
    // base from EFFAH_BASE
        const tripId=localStorage.getItem('effah_active_trip_id')||window.selectedTripRecord?.id||document.getElementById('roomingTripSelect')?.value;
    if(!tripId){ console.log('Direct fetch missing tripId'); return; }
    let allRecs=[]; let offset='';
    do{
      const filter='FIND("'+tripId+'",ARRAYJOIN({TRIP}))';
      const url='${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${EFFAH_T.PAX}?filterByFormula='+encodeURIComponent(filter)+'&pageSize=100'+(offset?'&offset='+offset:'');
      const res=await fetch(url);
      if(!res.ok){ console.error('Direct fetch fail', res.status); break; }
      const data=await res.json();
      if(data.records) allRecs=allRecs.concat(data.records);
      offset=data.offset||'';
    }while(offset);
    console.log('Direct fetch total:', allRecs.length);
    window._allJemaahDirect=allRecs;
    updateVisaCountBadge();
  }catch(e){ console.error('Direct fetch error', e); }
}