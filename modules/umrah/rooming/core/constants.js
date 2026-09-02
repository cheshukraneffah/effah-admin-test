// core/constants.js V103.38 PROXY ONLY - FIX 404
window.PROXY_URL = window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api';
window.AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || 'appSsn4JyQD4DnYu0';
window.TABLE_IDS = window.TABLE_IDS || { STAFF: 'tblssYikTs4GOndyf', ROOMING: 'tblENHq0C677SoO8O', PAX: 'tblsiSgXa9DxX3z9v', TRIP: 'tbl5Pbn2HkVsev5Uy' };
const EFFAH_PROXY = window.PROXY_URL;
const EFFAH_BASE = window.AIRTABLE_BASE_ID;
const EFFAH_T = window.TABLE_IDS;

// Proxy helpers - NO base param, only table + filterByFormula (worker already knows base)
async function effahProxyFetch(url, opts={}){
  const res = await fetch(url, opts);
  const txt = await res.text();
  try { return JSON.parse(txt); } catch(e){ if(!res.ok) throw new Error(`Proxy ${res.status}: ${txt.slice(0,800)}`); return {}; }
}
async function effahGetAll(tableId, filterFormula){
  let all=[], offset='';
  do{
    let url = `${EFFAH_PROXY}?table=${tableId}&pageSize=100`;
    if(filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    if(offset) url += `&offset=${encodeURIComponent(offset)}`;
    const data = await effahProxyFetch(url);
    if(data.records) all = all.concat(data.records);
    offset = data.offset || '';
    if(data.error) { console.error('Airtable error', data.error); throw new Error(JSON.stringify(data.error)); }
  }while(offset);
  return all;
}
async function effahCreate(tableId, fields){
  const url = `${EFFAH_PROXY}?table=${tableId}`;
  return await effahProxyFetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}
async function effahUpdate(tableId, recordId, fields){
  const url = `${EFFAH_PROXY}?table=${tableId}&recordId=${recordId}`;
  return await effahProxyFetch(url, {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}
async function effahDelete(tableId, recordId){
  const url = `${EFFAH_PROXY}?table=${tableId}&recordId=${recordId}`;
  return await effahProxyFetch(url, {method:'DELETE'});
}
function getJemaahName(j){ return j.fields?.['NAMA PENUH'] || j.fields?.['NAMA'] || j.fields?.['NAME'] || 'JEMAAH'; }
function getFieldAttachments(jFields, names){
  if(!jFields) return null;
  for(let n of names){ if(jFields[n] && Array.isArray(jFields[n]) && jFields[n].length>0) return jFields[n]; }
  return null;
}
function showRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.remove('hidden'); _roomingIsLoading=true; }
function hideRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.add('hidden'); _roomingIsLoading=false; }
function cleanTripNameForRooming(s){ return (s||'').replace(/[^a-zA-Z0-9 \-_]/g,'').substring(0,50); }
