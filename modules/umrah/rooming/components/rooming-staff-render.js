// components/rooming-staff-render.js V103.40 PROXY ONLY
function renderStaffList(){
  const cont=document.getElementById('staffListContainer'); const badge=document.getElementById('staffTotalBadge'); if(!cont) return; if(badge) badge.textContent=staffList.length+' Staff';
  if(staffList.length===0){ cont.innerHTML='<div class="p-2.5 text-center text-[11px] text-slate-400">Tiada staff / extra</div>'; return; }
  cont.innerHTML=staffList.map((s,idx)=>{
    const assignedInLoc = isStaffAssignedInLocation(s.id, activeLocation);
    const cls=assignedInLoc?'bg-slate-100 text-slate-400 border-slate-200':'bg-white hover:bg-slate-50 cursor-grab border-slate-200'; // V102 FIX GHOST - no opacity
    const drag=assignedInLoc?'':`draggable="true" ondragstart="dragStaff(event,'${s.id}')" ondragend="dragStaffEnd(event)"`;
    const boardArr=(typeof getStaffBoardArray==='function'? getStaffBoardArray(s) : []);
    const boardDisplay = boardArr.length? boardArr.join(', ') : '- BOARD';
    const boardCls = boardArr.length? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200';
    const trainChecked = !!(s.train||s.fields?.TRAIN);
    const trainCls = trainChecked ? 'bg-amber-300 border-amber-600 text-amber-900' : 'bg-white border-slate-300';
    const staffId = s.id||s.airtableId;
    const boardOptions = ['BOARD BASIS','BOARD BASIS (MEKAH)','BOARD BASIS (MADINAH)','BB (MEKAH)','BB (MADINAH)'];
    const boardDropHtml = boardOptions.map(opt=>`<label class="flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer text-[11px]"><input type="checkbox" ${boardArr.includes(opt)?'checked':''} onchange="toggleStaffBoardMulti('${staffId}','${opt}')" class="w-3.5 h-3.5 accent-[#7A0C2E]"> ${opt}</label>`).join('');
    return `<div ${drag} class="flex flex-col gap-1.5 px-2.5 py-2 rounded-xl border text-[11px] ${cls} relative">
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-center"><span class="text-slate-400 text-[10px]">${String(idx+1).padStart(2,'0')}</span><span class="font-medium truncate max-w-[120px]">${s.name}</span>${assignedInLoc?'<span class="ml-1 px-1 py-0.5 bg-slate-200 rounded text-[8px]">ASSIGNED di '+activeLocation+'</span>':''}</div>
        <div class="flex gap-1"><button onclick="quickAssignStaff('${staffId}')" class="w-5 h-5 rounded-full border ${assignedInLoc?'opacity-30 pointer-events-none':'hover:bg-[#7A0C2E] hover:text-white'} text-[10px]">+</button><button onclick="deleteStaff('${staffId}')" class="w-5 h-5 rounded-full border hover:bg-red-50 text-[10px]"><i class="fa-solid fa-trash text-[9px]"></i></button></div>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <button onclick="toggleStaffDropdown('${staffId}')" class="w-full text-[8px] border rounded-full px-2.5 py-1.5 font-bold ${boardCls} text-left flex items-center justify-between opacity-100"><span class="truncate">${boardDisplay}</span><span class="ml-1">▼</span></button>
          <div id="staffBoardDrop-${staffId}" class="hidden absolute z-[9999] mt-1 w-56 bg-white border border-slate-300 rounded-xl shadow-2xl p-1 max-h-52 overflow-auto" style="background:#ffffff !important; opacity:1 !important; isolation:isolate;">
            ${boardDropHtml}
            <div class="flex justify-between gap-1 mt-1 pt-1 border-t bg-white"><button onclick="clearStaffBoardMulti('${staffId}'); closeStaffDropdown('${staffId}')" class="text-[9px] px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200">Clear</button><button onclick="closeStaffDropdown('${staffId}')" class="text-[9px] px-3 py-1 rounded-full bg-[#7A0C2E] text-white hover:bg-[#9d174d]">OK</button></div>
          </div>
        </div>
        <label class="flex items-center gap-1 text-[8px] border rounded-full px-2.5 py-1.5 cursor-pointer font-bold ${trainCls} shrink-0 opacity-100"><input type="checkbox" ${trainChecked?'checked':''} onchange="updateStaffTrain('${staffId}',this.checked)" class="w-3.5 h-3.5 accent-amber-600"> TRAIN</label>
      </div>
    </div>`;
  }).join('');
}

function renderStaffList_V80(){
  const cont=document.getElementById('staffListContainer'); if(!cont) return;
  const q=(document.getElementById('searchStaff')?.value||'').toLowerCase();
  let filtered=[...staffList];
  if(q) filtered=filtered.filter(s=>(s.name||'').toLowerCase().includes(q));
  const boardOptions = ['BOARD BASIS','BOARD BASIS (MEKAH)','BB (MEKAH)','BOARD BASIS (MADINAH)','BB (MADINAH)'];
  cont.innerHTML=filtered.map((s, idx)=>{
    const staffId=s.id||s.airtableId||'staff-'+idx;
    const fbArr=getStaffBoardArray(s);
    const fbDisplay=fbArr.length?fbArr.join(', '):'- BOARD';
    let fbCls='bg-white border-slate-200 text-slate-400';
    if(fbArr.some(x=>x.includes('MEKAH'))) fbCls='bg-orange-100 border-orange-200 text-orange-800';
    else if(fbArr.some(x=>x.includes('MADINAH'))) fbCls='bg-blue-100 border-blue-200 text-blue-800';
    else if(fbArr.includes('BOARD BASIS')) fbCls='bg-emerald-100 border-emerald-200 text-emerald-800';
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