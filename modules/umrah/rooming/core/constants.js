// core/constants.js V103.44 FINAL - PATH FORMAT ONLY
window.PROXY_URL = window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api';
window.AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || 'appSsn4JyQD4DnYu0';
window.TABLE_IDS = window.TABLE_IDS || { STAFF: 'tblssYikTs4GOndyf', ROOMING: 'tblENHq0C677SoO8O', PAX: 'tblsiSgXa9DxX3z9v', TRIP: 'tbl5Pbn2HkVsev5Uy' };
const EFFAH_PROXY = window.PROXY_URL.replace(/\/$/,'');
const EFFAH_BASE = window.AIRTABLE_BASE_ID;
const EFFAH_T = window.TABLE_IDS;

async function effahProxyFetch(url, opts={}){
  const res = await fetch(url, opts);
  const txt = await res.text();
  let data;
  try{ data = JSON.parse(txt); }catch(e){ if(!res.ok) throw new Error(`Proxy ${res.status}: ${txt.slice(0,800)}`); return {records:[]}; }
  if(!res.ok && data.error){ console.error('Airtable error', data.error); throw new Error(JSON.stringify(data.error)); }
  return data;
}
function buildProxyUrl(tableKeyOrId, query=''){
  let tableId = window.TABLE_IDS[tableKeyOrId] || tableKeyOrId;
  let url = `${EFFAH_PROXY}/${EFFAH_BASE}/${encodeURIComponent(tableId)}`;
  if(query){ url += (query.startsWith('?')?'':'?') + query; }
  return url;
}
async function effahGetAll(tableKeyOrId, filterFormula){
  let all=[], offset='';
  do{
    let q = `pageSize=100`;
    if(filterFormula) q += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    if(offset) q += `&offset=${encodeURIComponent(offset)}`;
    let url = buildProxyUrl(tableKeyOrId, q);
    console.log('[Proxy GET]', url);
    const data = await effahProxyFetch(url);
    if(data.records) all = all.concat(data.records);
    offset = data.offset || '';
  }while(offset);
  console.log('[Proxy OK]', tableKeyOrId, all.length);
  return all;
}
async function effahCreate(tableKeyOrId, fields){
  let url = buildProxyUrl(tableKeyOrId, '');
  return await effahProxyFetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}
async function effahUpdate(tableKeyOrId, recordId, fields){
  let url = buildProxyUrl(tableKeyOrId, '') + '/' + recordId;
  return await effahProxyFetch(url, {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}
async function effahDelete(tableKeyOrId, recordId){
  let url = buildProxyUrl(tableKeyOrId, '') + '/' + recordId;
  return await effahProxyFetch(url, {method:'DELETE'});
}
function getJemaahName(j){ return j.fields?.['NAMA PENUH'] || j.fields?.['NAMA'] || j.fields?.['NAME'] || 'JEMAAH'; }
function showRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.remove('hidden'); }
function hideRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.add('hidden'); }
function cleanTripNameForRooming(s){ return (s||'').replace(/[^a-zA-Z0-9 \-_]/g,'').substring(0,50); }
