// components/rooming-fix-helpers.js - from rooming_10.js proxy path converted
function removeStaff(roomId,staffName, evt){ if(evt){ evt.stopPropagation(); evt.preventDefault(); }
  const s=staffList.find(x=>x.id===staffName||x.airtableId===staffName||x.name===staffName);
  if(s){ removeStaffFromRoom(roomId, s.id); return; }
  const rec=allRoomingRecords.find(r=>r.id===roomId); if(!rec) return;
  const arr=(rec.fields['STAFF / EXTRA']||'').split(',').map(x=>x.trim()).filter(x=>x&&x!==staffName);
  updateRoomField(roomId,'STAFF / EXTRA',arr.join(','),true);
}

function getNameForAnyId(id){
  const jRec=allRoomingJemaah.find(j=>j.id===id);
  if(jRec) return getJemaahName(jRec.fields);
  const sRec=staffList.find(s=>s.id===id||s.airtableId===id);
  if(sRec) return sRec.name+' (STAFF TANPA KATIL)';
  return id.substring(0,8)+'... (Unknown)';
}

function getStaffById(id){ return staffList.find(s=>s.id===id||s.airtableId===id); }

function getPakejVal(f){ return f['PAKEJ'] || ''; }

function isTrainChecked(f){ return !!f['TRAIN']; }

function formatCheckbox(v){ return v ? '✓' : '-'; }

function loadLocalCatatan(roomId){
  try{
    const key='effah_room_notes_'+roomId;
    return localStorage.getItem(key)||'';
  }catch(e){ return ''; }
}

function _stopAutoScroll(){ if(_autoScrollInterval){ clearInterval(_autoScrollInterval); _autoScrollInterval=null; } }

function _startAutoScroll(){
  if(_autoScrollInterval) return;
  _autoScrollInterval=setInterval(()=>{
    const y=window._lastDragY||0;
    if(y<140){ window.scrollBy(0, -22); document.documentElement.scrollTop-=22; }
    else if(y>window.innerHeight-140){ window.scrollBy(0, 22); document.documentElement.scrollTop+=22; }
    // also scroll left panels if near edge
    const nl=document.getElementById('namelistContainer');
    const sl=document.getElementById('staffListContainer');
    const grid=document.getElementById('roomingGrid');
    if(nl){
      const rect=nl.getBoundingClientRect();
      if(y>rect.top && y<rect.bottom){
        if(y-rect.top<80) nl.scrollBy(0,-12);
        else if(rect.bottom-y<80) nl.scrollBy(0,12);
      }
    }
    if(grid){
      const rect=grid.getBoundingClientRect();
      if(y>rect.top){
        if(y>window.innerHeight-140) grid.scrollBy ? grid.scrollBy(0,10) : null;
      }
    }
  }, 30);
}

function updateHotelInline(roomId, newName){
  const name = (newName||'').trim().toUpperCase();
  if(!name){ alert('Sila masukkan nama hotel'); return; }
  updateRoomField(roomId,'HOTEL NAME',name,true);
}

function instantRefreshAfterRemove(){
  setTimeout(()=>{ 
    if(typeof renderStaffList==='function') renderStaffList(); 
    if(typeof renderNamelist==='function') renderNamelist();
    if(typeof renderRoomingGrid==='function') renderRoomingGrid();
  }, 100);
}

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