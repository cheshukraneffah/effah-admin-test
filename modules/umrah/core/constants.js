// core/constants.js V103.38 PROXY ONLY
window.PROXY_URL = window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api';
window.AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || 'appSsn4JyQD4DnYu0';
window.TABLE_IDS = window.TABLE_IDS || { STAFF: 'tblssYikTs4GOndyf', ROOMING: 'tblENHq0C677SoO8O', PAX: 'tblsiSgXa9DxX3z9v', TRIP: 'tbl5Pbn2HkVsev5Uy' };
const EFFAH_PROXY = window.PROXY_URL;
const EFFAH_BASE = window.AIRTABLE_BASE_ID;
const EFFAH_T = window.TABLE_IDS;

async function effahProxyFetch(url, opts={}){
  const res = await fetch(url, opts);
  const txt = await res.text();
  try { return JSON.parse(txt); } catch(e){ if(!res.ok) throw new Error(`Proxy ${res.status}: ${txt.slice(0,500)}`); return {}; }
}
async function effahGetAll(tableId, filterFormula){
  let all=[], offset='';
  do{
    let url = `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&pageSize=100`;
    if(filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    if(offset) url += `&offset=${encodeURIComponent(offset)}`;
    const data = await effahProxyFetch(url);
    if(data.records) all = all.concat(data.records);
    offset = data.offset || '';
  }while(offset);
  return all;
}
async function effahGetById(tableId, recordId){ return await effahProxyFetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&recordId=${recordId}`); }
async function effahCreate(tableId, fields){ return await effahProxyFetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})}); }
async function effahUpdate(tableId, recordId, fields){ return await effahProxyFetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&recordId=${recordId}`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})}); }
async function effahDelete(tableId, recordId){ return await effahProxyFetch(`${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${tableId}&recordId=${recordId}`, {method:'DELETE'}); }

function getJemaahName(j){ return j.fields?.['NAMA PENUH'] || j.fields?.['NAMA'] || j.fields?.['NAME'] || 'JEMAAH'; }
function getBoardArray(v){ if(!v) return []; if(Array.isArray(v)) return v; return [v]; }
function getNameForAnyId(id){ const s=staffList.find(x=>x.id===id||x.airtableId===id); if(s) return s.name; const j=allRoomingJemaah.find(x=>x.id===id); if(j) return getJemaahName(j); return id; }
function getFieldAttachments(jFields, names){
  if(!jFields) return null;
  for(let n of names){ if(jFields[n] && Array.isArray(jFields[n]) && jFields[n].length>0) return jFields[n]; }
  const keys=Object.keys(jFields);
  for(let k of keys){ const up=k.toUpperCase().trim(); for(let t of names){ if(up===t.toUpperCase().trim() || up.includes(t.toUpperCase().trim())){ const v=jFields[k]; if(Array.isArray(v)&&v.length>0) return v; }}}
  return null;
}
function cleanTripNameForRooming(s){ return (s||'').replace(/[^a-zA-Z0-9 \-_]/g,'').substring(0,50); }
