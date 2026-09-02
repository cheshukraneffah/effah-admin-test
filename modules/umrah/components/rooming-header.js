// components/rooming-header.js - V103.38 PROXY ONLY - full feature 3698 lines split
function toggleBoardDropdown(id){ const el=document.getElementById('boardDrop-'+id); if(!el) return; document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }

function closeStaffDropdown(id){ const el=document.getElementById('staffBoardDrop-'+id); if(el) el.classList.add('hidden'); }

function toggleInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(!el) return; document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>{ if(d.id!=='insuranDrop-'+id) d.classList.add('hidden'); }); document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); el.classList.toggle('hidden'); }

function closeInsuranDropdown(id){ const el=document.getElementById('insuranDrop-'+id); if(el) el.classList.add('hidden'); }
if(!window._boardDropListener){ window._boardDropListener=true; document.addEventListener('click', (e)=>{ const isBoard=e.target.closest('[id^="boardDrop-"]')||e.target.closest('button[onclick*="toggleBoardDropdown"]'); const isStaff=e.target.closest('[id^="staffBoardDrop-"]')||e.target.closest('button[onclick*="toggleStaffDropdown"]'); const isIns=e.target.closest('[id^="insuranDrop-"]')||e.target.closest('button[onclick*="toggleInsuranDropdown"]'); if(!isBoard&&!isStaff&&!isIns){ document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>d.classList.add('hidden')); document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden')); } }); }


function toggleStaffDropdown(id){
  const el=document.getElementById('staffBoardDrop-'+id); 
  if(!el) { console.warn('staffBoardDrop not found', id); return; }
  document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden'));
  document.querySelectorAll('[id^="staffBoardDrop-"]').forEach(d=>{ if(d.id!=='staffBoardDrop-'+id) d.classList.add('hidden'); });
  document.querySelectorAll('[id^="insuranDrop-"]').forEach(d=>d.classList.add('hidden'));
  el.classList.toggle('hidden');
}
window.toggleStaffDropdown = toggleStaffDropdown;


function closeStaffDropdown(id){
  const el=document.getElementById('staffBoardDrop-'+id);
  if(el) el.classList.add('hidden');
}
window.closeStaffDropdown = closeStaffDropdown;



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
document.addEventListener('drop', ()=>{ _stopAutoScroll(); });

function dragJemaah(e,jId){ if(isJemaahAssignedInLocation(jId, activeLocation)) return; e.dataTransfer.setData('text/plain',jId); const r=e.currentTarget; if(r) setTimeout(()=>r.style.opacity='0.3',0); }

function dragEnd(e){ e.currentTarget.style.opacity='1'; }


function toggleBoardDropdown(jemaahId){ const el=document.getElementById('boardDrop-'+jemaahId); if(!el) return; // close others
  document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>{ if(d.id!=='boardDrop-'+jemaahId) d.classList.add('hidden'); });
  el.classList.toggle('hidden'); }

function closeBoardDropdown(jemaahId){ const el=document.getElementById('boardDrop-'+jemaahId); if(el) el.classList.add('hidden'); }
// Close on outside click
if(!window._boardDropListener){ window._boardDropListener=true; document.addEventListener('click', (e)=>{ if(!e.target.closest('[id^="boardDrop-"]') && !e.target.closest('button[onclick*="toggleBoardDropdown"]')){ document.querySelectorAll('[id^="boardDrop-"]').forEach(d=>d.classList.add('hidden')); } }); }

function dragStaff(e,staffId){ if(isStaffAssignedInLocation(staffId, activeLocation)) return; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/staff-id',staffId); e.dataTransfer.setData('text/plain',staffId); const row=e.currentTarget; if(row) setTimeout(()=>row.style.opacity='0.3',0); }

function dragStaffEnd(e){ e.currentTarget.style.opacity='1'; }

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
