// composables/use-rooming-download.js V103.40 PROXY ONLY
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

async function downloadAllDocs(fieldName, label){
  const field = fieldName || 'VISA COPY';
  const badgeLabel = label || field;
  return _downloadAllDocs(field, badgeLabel);
}

async function downloadAllVisas(){
  return _downloadAllDocs('VISA COPY', 'Visas');
}

async function downloadAllPassports(){
  return _downloadAllDocs('PASSPORT COPY', 'Passports');
}

async function _downloadAllDocs(fieldName, label){

  const btn=document.getElementById('btnDownloadVisas');
  const originalText=btn?.innerHTML;
  try{
    // Filter jemaah with VISA COPY
    let withVisa = allRoomingJemaah.filter(j=> j.fields && j.fields[fieldName] && Array.isArray(j.fields[fieldName]) && j.fields[fieldName].length>0);
    if(withVisa.length===0){
      alert(`Tiada ${fieldName} dalam trip ini.\n\nPastikan field ${fieldName} ada attachment PDF/Image.`);
      return;
    }
    // Sort by NAMA
    withVisa = withVisa.sort((a,b)=>{
      const na=getJemaahName(a.fields).toUpperCase();
      const nb=getJemaahName(b.fields).toUpperCase();
      return na.localeCompare(nb);
    });

    // Create progress modal
    window._visaDownloadCancelled=false;
    window._visaAbortController=new AbortController();
    let modal=document.getElementById('visaDownloadModal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='visaDownloadModal';
      modal.className='fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4';
      modal.innerHTML=`
        <div class="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-[13px]" id="visaModalTitle">Downloading ${label}...</h3>
            <button id="visaCancelBtn" onclick="cancelVisaDownload()" class="px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-full text-[10px] font-bold hover:bg-red-100">✕ Cancel</button>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden"><div id="visaProgressBar" class="h-3 bg-emerald-600 rounded-full transition-all" style="width:0%"></div></div>
          <div id="visaProgressText" class="text-[11px] text-slate-600 mb-1">0 / 0</div>
          <div id="visaProgressName" class="text-[10px] text-slate-500 truncate">-</div>
          <div id="visaProgressLog" class="mt-3 max-h-[15vh] overflow-y-auto text-[9px] text-slate-400 space-y-0.5"></div>
          <div class="flex gap-2 mt-4">
            <button id="visaCancelBtn2" onclick="cancelVisaDownload()" class="flex-1 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[11px] hover:bg-slate-200">Cancel Download</button>
            <button id="visaCloseBtn" onclick="closeVisaModal()" class="flex-1 py-2 bg-[#064E3B] text-white rounded-xl font-bold text-[11px] hidden">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      modal.classList.remove('hidden');
      window._visaDownloadCancelled=false;
      window._visaAbortController=new AbortController();
      const cancelBtn=document.getElementById('visaCancelBtn');
      const cancelBtn2=document.getElementById('visaCancelBtn2');
      const closeBtn=document.getElementById('visaCloseBtn');
      if(cancelBtn) cancelBtn.classList.remove('hidden');
      if(cancelBtn2) cancelBtn2.classList.remove('hidden');
      if(closeBtn) closeBtn.classList.add('hidden');
      document.getElementById('visaProgressLog').innerHTML='';
      document.getElementById('visaProgressBar').style.width='0%';
      const titleEl=document.getElementById('visaModalTitle'); if(titleEl) titleEl.textContent=`Downloading ${label}...`;
    }

    const updateProgress=(curr,total,name,log)=>{
      const pct=Math.round(curr/total*100);
      document.getElementById('visaProgressBar').style.width=pct+'%';
      document.getElementById('visaProgressText').textContent=curr+' / '+total+' ('+pct+'%)';
      document.getElementById('visaProgressName').textContent=name||'-';
      if(log){
        const logEl=document.getElementById('visaProgressLog');
        const div=document.createElement('div');
        div.textContent=log;
        logEl.appendChild(div);
        logEl.scrollTop=logEl.scrollHeight;
      }
    };

    if(btn){ btn.setAttribute('data-original', btn.innerHTML); btn.disabled=true; btn.innerHTML='⏳ Loading pdf-lib...'; }

    const pdfLib=await loadPdfLib();
    const {PDFDocument}=pdfLib;
    const mergedPdf=await PDFDocument.create();

    let successCount=0;
    let failList=[];

    for(let i=0;i<withVisa.length;i++){
      if(window._visaDownloadCancelled){ throw new Error('Cancelled by user'); }
      const jRec=withVisa[i];
      const nama=getJemaahName(jRec.fields);
      const mId=jRec.fields['M_ID']||jRec.fields['NO KP']||'';
      updateProgress(i, withVisa.length, nama, `Fetching: ${nama}`);

      const attachments=jRec.fields[fieldName]||[];
      // Take all attachments for this jemaah (could be 1-3 files)
      for(let attIdx=0; attIdx<attachments.length; attIdx++){
        const att=attachments[attIdx];
        if(!att||!att.url) continue;
        const url=att.url;
        const filename=att.filename||'';
        const isPdf = filename.toLowerCase().endsWith('.pdf') || (att.type && att.type.includes('pdf'));

        try{
          if(btn) btn.innerHTML=`⏳ ${i+1}/${withVisa.length} ${nama.substring(0,12)}...`;
          const buffer=await fetchWithRetry(url);
          
          if(isPdf){
            try{
              const srcPdf=await PDFDocument.load(buffer, {ignoreEncryption:true});
              const srcPages = srcPdf.getPages();
              // Standard size - A4 (595.28 x 841.89) or Letter (612 x 792) - using A4 as requested
              const A4_WIDTH = 595.28;
              const A4_HEIGHT = 841.89;
              // If user wants Letter: const LETTER_WIDTH=612, LETTER_HEIGHT=792
              
              for(let pIdx=0; pIdx<srcPdf.getPageCount(); pIdx++){
                const srcPage = srcPages[pIdx];
                const {width: origW, height: origH} = srcPage.getSize();
                
                // Copy page
                const [copiedPage] = await mergedPdf.copyPages(srcPdf, [pIdx]);
                
                // Standardize: if original not A4, create new A4 page and scale embed
                const needsResize = Math.abs(origW - A4_WIDTH) > 5 || Math.abs(origH - A4_HEIGHT) > 5;
                
                if(needsResize){
                  // Create new A4 page and embed copied page scaled to fit
                  const newPage = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]);
                  // Calculate scale to fit with margin
                  const margin = 20;
                  const availW = A4_WIDTH - margin*2;
                  const availH = A4_HEIGHT - 40; // leave footer space
                  const scale = Math.min(availW/origW, availH/origH);
                  const drawW = origW * scale;
                  const drawH = origH * scale;
                  const x = (A4_WIDTH - drawW)/2;
                  const y = (A4_HEIGHT - drawH)/2 + 10;
                  
                  // Embed the copied page as XObject
                  const embeddedPage = await mergedPdf.embedPage(copiedPage);
                  newPage.drawPage(embeddedPage, {x, y, width: drawW, height: drawH});
                  // Footer
                  newPage.drawText(`${i+1}. ${nama} ${mId? '('+mId+')':''} - ${filename} p${pIdx+1}`, {x:30, y:15, size:7, color: pdfLib.rgb(0.3,0.3,0.3)});
                } else {
                  // Already A4-ish, just add with footer
                  const newPage = mergedPdf.addPage(copiedPage);
                  // Add footer overlay - draw on top
                  try{
                    newPage.drawText(`${i+1}. ${nama} ${mId? '('+mId+')':''} - ${filename} p${pIdx+1}`, {x:30, y:15, size:7, color: pdfLib.rgb(0.3,0.3,0.3)});
                  }catch(e){}
                }
              }
              successCount++;
              updateProgress(i+1, withVisa.length, nama, `✓ PDF ${filename} - ${srcPdf.getPageCount()} pages → A4 standardized`);
            }catch(pdfErr){
              console.error('PDF load failed', filename, pdfErr);
              failList.push(`${nama} - ${filename}: PDF corrupt`);
              updateProgress(i+1, withVisa.length, nama, `✗ PDF failed ${filename}`);
            }
          } else {
            // Image - JPG/PNG
            try{
              let img;
              const lower=filename.toLowerCase();
              if(lower.endsWith('.png')){
                img=await mergedPdf.embedPng(buffer);
              } else {
                img=await mergedPdf.embedJpg(buffer);
              }
              // Standardize to A4 (or Letter) - user requested A4/Letter fit
              const A4_WIDTH = 595.28;
              const A4_HEIGHT = 841.89;
              const page=mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]); // A4 standardized
              const {width, height}=page.getSize();
              // Scale image to fit A4 with margins - maintain aspect ratio
              const margin = 30;
              const footerSpace = 30;
              const availW = width - margin*2;
              const availH = height - margin*2 - footerSpace;
              const imgDims=img.scaleToFit(availW, availH);
              page.drawImage(img, {x: (width-imgDims.width)/2, y: (height-imgDims.height)/2 + footerSpace/2 + 5, width: imgDims.width, height: imgDims.height});
              // Footer with name + border
              page.drawText(`${i+1}. ${nama} ${mId? '('+mId+')':''} - ${filename}`, {x:30, y:15, size:7, color: pdfLib.rgb(0.3,0.3,0.3)});
              // Optional thin border for neat look
              try{
                page.drawRectangle({x: margin-5, y: footerSpace, width: availW+10, height: availH+10, borderColor: pdfLib.rgb(0.9,0.9,0.9), borderWidth: 0.5});
              }catch(e){}
              successCount++;
              updateProgress(i+1, withVisa.length, nama, `✓ Image ${filename}`);
            }catch(imgErr){
              console.error('Image embed failed', filename, imgErr);
              failList.push(`${nama} - ${filename}: Image failed`);
              updateProgress(i+1, withVisa.length, nama, `✗ Image failed ${filename}`);
            }
          }
        }catch(fetchErr){
          console.error('Fetch failed', url, fetchErr);
          failList.push(`${nama} - ${filename}: Fetch failed ${fetchErr.message}`);
          updateProgress(i+1, withVisa.length, nama, `✗ Fetch failed ${filename}`);
        }
      }
    }

    updateProgress(withVisa.length, withVisa.length, 'Merging PDF...', 'Compiling final PDF...');
    if(btn) btn.innerHTML='⏳ Compiling PDF...';

    const pdfBytes=await mergedPdf.save();
    const blob=new Blob([pdfBytes], {type:'application/pdf'});
    let rawTripName = window.selectedTripRecord?.fields?.['TRIP NAME'] || window.selectedTripRecord?.fields?.['NAMA TRIP'] || window.selectedTripRecord?.fields?.['Name'] || '';
    if(!rawTripName || rawTripName.startsWith('rec')){
      const sel = document.getElementById('roomingTripSelect');
      if(sel && sel.options[sel.selectedIndex]){
        rawTripName = sel.options[sel.selectedIndex].textContent.trim();
      }
    }
    if(!rawTripName || rawTripName.startsWith('rec')){
      rawTripName = localStorage.getItem('effah_active_trip_name') || localStorage.getItem('effah_trip_name') || 'TRIP';
    }
    let tripName = rawTripName.replace(/[^a-zA-Z0-9 \-_]/g,'').replace(/\s+/g,'_').substring(0,50);
    if(!tripName || tripName.startsWith('rec')) tripName = 'TRIP';
    const now = new Date();
    const dd = String(now.getDate()).padStart(2,'0');
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const yy = String(now.getFullYear()).slice(-2);
    const dateStr = `${dd}-${mm}-${yy}`;
    const fileName=`${label.toUpperCase()}_${tripName}_${dateStr}.pdf`;
    
    // Download
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download=fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(link.href), 10000);

    document.getElementById('visaProgressLog').innerHTML+=`<div class="text-emerald-600 font-bold mt-2">✓ Done! ${successCount} files merged, ${failList.length} failed</div>`;
    if(failList.length>0){
      document.getElementById('visaProgressLog').innerHTML+=`<div class="text-red-500">${failList.join('<br>')}</div>`;
    }
    updateProgress(withVisa.length, withVisa.length, `Saved: ${fileName}`, `Total size: ${(blob.size/1024/1024).toFixed(2)} MB`);

    setTimeout(()=>{
      const m=document.getElementById('visaDownloadModal');
      if(m) m.classList.add('hidden');
    }, 4000);

    if(btn){ btn.disabled=false; btn.innerHTML=originalText; }

    if(failList.length>0){
      console.warn('Failed visas', failList);
      alert(`Selesai! ${successCount} visa berjaya, ${failList.length} gagal.\n\nGagal:\n${failList.slice(0,10).join('\n')}${failList.length>10?'\n...and '+(failList.length-10)+' more':''}`);
    } else {
      console.log(`Download All ${label} OK: ${fileName} ${(blob.size/1024/1024).toFixed(2)}MB`);
    }

  }catch(e){
    console.error('downloadAllVisas error', e);
    alert(`Gagal download ${label}: `+e.message);
    const m=document.getElementById('visaDownloadModal');
    if(m) m.classList.add('hidden');
    if(btn){ btn.disabled=false; btn.innerHTML=originalText; }
  }
}

async function downloadHotelDocs(lokasi, hotelName, fieldName, label){
  try{
    const normalizedHotel = (hotelName||'').toUpperCase().trim();
    const normalizedLokasi = (lokasi||'MEKAH').toUpperCase().trim();
    
    // Find rooms for this hotel + lokasi
    const hotelRooms = allRoomingRecords.filter(r=> {
      const h = (r.fields['HOTEL NAME']||'TANPA HOTEL').toUpperCase().trim();
      const l = (r.fields['LOKASI / CITY']||'MEKAH').toUpperCase().trim();
      return h===normalizedHotel && l===normalizedLokasi;
    });
    
    const jemaahIds = new Set();
    hotelRooms.forEach(r=>{ (r.fields['JEMAAH']||[]).forEach(id=> jemaahIds.add(id)); });
    
    let withDocs = allRoomingJemaah.filter(j=> jemaahIds.has(j.id) && j.fields && j.fields[fieldName] && Array.isArray(j.fields[fieldName]) && j.fields[fieldName].length>0);
    
    if(withDocs.length===0){
      alert(`Tiada ${fieldName} untuk hotel ${hotelName} (${lokasi}).\n\nJemaah di hotel ini: ${jemaahIds.size} orang, ada dokumen: 0`);
      return;
    }
    
    withDocs = withDocs.sort((a,b)=> getJemaahName(a.fields).toUpperCase().localeCompare(getJemaahName(b.fields).toUpperCase()));
    
    console.log(`Downloading ${label} for ${lokasi} - ${hotelName}: ${withDocs.length} pax`);
    
    // Use same logic as _downloadAllDocs but for single hotel
    window._visaDownloadCancelled=false;
    window._visaAbortController=new AbortController();
    let modal=document.getElementById('visaDownloadModal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='visaDownloadModal';
      modal.className='fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4';
      modal.innerHTML=`
        <div class="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-[13px]" id="visaModalTitle">Downloading ${label}...</h3>
            <button id="visaCancelBtn" onclick="cancelVisaDownload()" class="px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-full text-[10px] font-bold hover:bg-red-100">✕ Cancel</button>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden"><div id="visaProgressBar" class="h-3 bg-emerald-600 rounded-full transition-all" style="width:0%"></div></div>
          <div id="visaProgressText" class="text-[11px] text-slate-600 mb-1">0 / 0</div>
          <div id="visaProgressName" class="text-[10px] text-slate-500 truncate">-</div>
          <div id="visaProgressLog" class="mt-3 max-h-[15vh] overflow-y-auto text-[9px] text-slate-400 space-y-0.5"></div>
          <div class="flex gap-2 mt-4">
            <button id="visaCancelBtn2" onclick="cancelVisaDownload()" class="flex-1 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[11px] hover:bg-slate-200">Cancel</button>
            <button id="visaCloseBtn" onclick="closeVisaModal()" class="flex-1 py-2 bg-[#064E3B] text-white rounded-xl font-bold text-[11px] hidden">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      modal.classList.remove('hidden');
      window._visaDownloadCancelled=false;
      window._visaAbortController=new AbortController();
      const cancelBtn=document.getElementById('visaCancelBtn');
      const cancelBtn2=document.getElementById('visaCancelBtn2');
      const closeBtn=document.getElementById('visaCloseBtn');
      if(cancelBtn) cancelBtn.classList.remove('hidden');
      if(cancelBtn2) cancelBtn2.classList.remove('hidden');
      if(closeBtn) closeBtn.classList.add('hidden');
      const logEl2=document.getElementById('visaProgressLog');
      if(logEl2) logEl2.innerHTML='';
      const bar=document.getElementById('visaProgressBar');
      if(bar) bar.style.width='0%';
      const titleEl=document.getElementById('visaModalTitle');
      if(titleEl) titleEl.textContent=`Downloading ${label} - ${hotelName}...`;
    }

    const updateProgress=(curr,total,name,log)=>{
      const pct=Math.round(curr/total*100);
      const bar=document.getElementById('visaProgressBar');
      if(bar) bar.style.width=pct+'%';
      const txt=document.getElementById('visaProgressText');
      if(txt) txt.textContent=curr+' / '+total+' ('+pct+'%)';
      const nameEl=document.getElementById('visaProgressName');
      if(nameEl) nameEl.textContent=name||'-';
      if(log){
        const logEl=document.getElementById('visaProgressLog');
        if(logEl){
          const div=document.createElement('div');
          div.textContent=log;
          logEl.appendChild(div);
          logEl.scrollTop=logEl.scrollHeight;
        }
      }
    };

    const pdfLib=await loadPdfLib();
    const {PDFDocument}=pdfLib;
    const mergedPdf=await PDFDocument.create();
    let successCount=0;
    let failList=[];
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;

    for(let i=0;i<withDocs.length;i++){
      if(window._visaDownloadCancelled) throw new Error('Cancelled by user');
      const jRec=withDocs[i];
      const nama=getJemaahName(jRec.fields);
      const mId=jRec.fields['M_ID']||'';
      updateProgress(i, withDocs.length, nama, `Fetching: ${nama}`);

      const attachments=jRec.fields[fieldName]||[];
      for(let att of attachments){
        if(!att||!att.url) continue;
        const url=att.url;
        const filename=att.filename||'';
        const isPdf = filename.toLowerCase().endsWith('.pdf') || (att.type && att.type.includes('pdf'));
        try{
          const buffer=await fetchWithRetry(url);
          if(isPdf){
            try{
              const srcPdf=await PDFDocument.load(buffer, {ignoreEncryption:true});
              for(let pIdx=0;pIdx<srcPdf.getPageCount();pIdx++){
                if(window._visaDownloadCancelled) throw new Error('Cancelled by user');
                const [copiedPage]=await mergedPdf.copyPages(srcPdf,[pIdx]);
                const srcPage=srcPdf.getPages()[pIdx];
                const {width: origW, height: origH}=srcPage.getSize();
                const needsResize=Math.abs(origW-A4_WIDTH)>5||Math.abs(origH-A4_HEIGHT)>5;
                if(needsResize){
                  const newPage=mergedPdf.addPage([A4_WIDTH,A4_HEIGHT]);
                  const margin=20;
                  const availW=A4_WIDTH-margin*2;
                  const availH=A4_HEIGHT-40;
                  const scale=Math.min(availW/origW, availH/origH);
                  const drawW=origW*scale;
                  const drawH=origH*scale;
                  const x=(A4_WIDTH-drawW)/2;
                  const y=(A4_HEIGHT-drawH)/2+10;
                  const embeddedPage=await mergedPdf.embedPage(copiedPage);
                  newPage.drawPage(embeddedPage,{x,y,width:drawW,height:drawH});
                  newPage.drawText(`${i+1}. ${nama} ${mId? '('+mId+')':''} - ${hotelName}`,{x:30,y:15,size:7,color:pdfLib.rgb(0.3,0.3,0.3)});
                }else{
                  const newPage=mergedPdf.addPage(copiedPage);
                  try{ newPage.drawText(`${i+1}. ${nama} ${mId? '('+mId+')':''} - ${hotelName}`,{x:30,y:15,size:7,color:pdfLib.rgb(0.3,0.3,0.3)}); }catch(e){}
                }
              }
              successCount++;
              updateProgress(i+1,withDocs.length,nama,`✓ PDF ${filename}`);
            }catch(e){ failList.push(`${nama} - ${filename}: PDF corrupt`); }
          }else{
            try{
              let img;
              if(filename.toLowerCase().endsWith('.png')) img=await mergedPdf.embedPng(buffer); else img=await mergedPdf.embedJpg(buffer);
              const page=mergedPdf.addPage([A4_WIDTH,A4_HEIGHT]);
              const margin=30, footerSpace=30;
              const availW=A4_WIDTH-margin*2, availH=A4_HEIGHT-margin*2-footerSpace;
              const imgDims=img.scaleToFit(availW,availH);
              page.drawImage(img,{x:(A4_WIDTH-imgDims.width)/2,y:(A4_HEIGHT-imgDims.height)/2+footerSpace/2+5,width:imgDims.width,height:imgDims.height});
              page.drawText(`${i+1}. ${nama} ${mId? '('+mId+')':''} - ${hotelName}`,{x:30,y:15,size:7,color:pdfLib.rgb(0.3,0.3,0.3)});
              successCount++;
              updateProgress(i+1,withDocs.length,nama,`✓ Image ${filename}`);
            }catch(e){ failList.push(`${nama} - ${filename}: Image failed`); }
          }
        }catch(fetchErr){
          if(fetchErr.message==='Cancelled by user') throw fetchErr;
          failList.push(`${nama}: Fetch failed`);
        }
      }
    }

    const pdfBytes=await mergedPdf.save();
    const blob=new Blob([pdfBytes],{type:'application/pdf'});
    let rawTripName = window.selectedTripRecord?.fields?.['TRIP NAME'] || window.selectedTripRecord?.fields?.['NAMA TRIP'] || '';
    if(!rawTripName || rawTripName.startsWith('rec')){
      const sel=document.getElementById('roomingTripSelect');
      if(sel && sel.options[sel.selectedIndex]) rawTripName=sel.options[sel.selectedIndex].textContent.trim();
    }
    if(!rawTripName || rawTripName.startsWith('rec')) rawTripName=localStorage.getItem('effah_active_trip_name')||'TRIP';
    let tripName = rawTripName.replace(/[^a-zA-Z0-9 \-_]/g,'').replace(/\s+/g,'_').substring(0,50);
    if(!tripName || tripName.startsWith('rec')) tripName='TRIP';
    const now=new Date();
    const dd=String(now.getDate()).padStart(2,'0');
    const mm=String(now.getMonth()+1).padStart(2,'0');
    const yy=String(now.getFullYear()).slice(-2);
    const dateStr=`${dd}-${mm}-${yy}`;
    const hotelClean = hotelName.replace(/[^a-zA-Z0-9 \-_]/g,'').replace(/\s+/g,'_').substring(0,30) || 'HOTEL';
    const lokasiClean = lokasi.replace(/[^a-zA-Z0-9 \-_]/g,'').replace(/\s+/g,'_').substring(0,15) || 'MEKAH';
    const fileName=`${label.toUpperCase()}_${tripName}_${lokasiClean}_${hotelClean}_${dateStr}.pdf`;
    
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download=fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(link.href),10000);

    const logEl=document.getElementById('visaProgressLog');
    if(logEl){
      logEl.innerHTML+=`<div class="text-emerald-600 font-bold mt-2">✓ Done! ${successCount} files - ${(blob.size/1024/1024).toFixed(2)} MB</div>`;
      if(failList.length>0) logEl.innerHTML+=`<div class="text-red-500">${failList.join('<br>')}</div>`;
    }
    updateProgress(withDocs.length,withDocs.length,`Saved: ${fileName}`,`Size: ${(blob.size/1024/1024).toFixed(2)} MB`);
    const cancelBtn=document.getElementById('visaCancelBtn');
    const cancelBtn2=document.getElementById('visaCancelBtn2');
    const closeBtn=document.getElementById('visaCloseBtn');
    if(cancelBtn) cancelBtn.classList.add('hidden');
    if(cancelBtn2) cancelBtn2.classList.add('hidden');
    if(closeBtn) closeBtn.classList.remove('hidden');

  }catch(e){
    if(e.message==='Cancelled by user'){ console.log('Cancelled'); return; }
    console.error(e);
    alert(`Gagal download ${label}: `+e.message);
    const m=document.getElementById('visaDownloadModal');
    if(m) m.classList.add('hidden');
  }
}