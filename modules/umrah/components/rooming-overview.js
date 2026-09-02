// components/rooming-overview.js - V103.38 PROXY ONLY - full feature 3698 lines split
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