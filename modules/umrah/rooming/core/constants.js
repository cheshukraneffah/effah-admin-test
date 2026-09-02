
// PROXY PATH CONVERSION - V103.46 SINGLE FILE PROXY PATH (same base as rooming_10.js)
window.PROXY_URL = window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api';
window.AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || 'appSsn4JyQD4DnYu0';
window.TABLE_IDS = window.TABLE_IDS || { STAFF: 'tblssYikTs4GOndyf', ROOMING: 'tblENHq0C677SoO8O', PAX: 'tblsiSgXa9DxX3z9v', TRIP: 'tbl5Pbn2HkVsev5Uy' };
window.TABLE_NAMES_ENCODED = {
  STAFF: 'STAFF%20LIST%20%28ROOMING%29',
  ROOMING: 'ROOMING%20LIST',
  PAX: 'DATA%20JEMAAH%20UMRAH',
  TRIP: 'PAKEJ%20UMRAH%20%28TRIP%29'
};
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
    const data = await effahProxyFetch(url);
    if(data.records) all = all.concat(data.records);
    offset = data.offset || '';
  }while(offset);
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

function getStaffStorageKey(){ return `effah_staff_list_${activeLocation}_${window.selectedTripRecord?.id||localStorage.getItem('effah_active_trip_id')||'default'}`; }
function saveStaffList(){ try{ localStorage.setItem(getStaffStorageKey(), JSON.stringify(staffList)); }catch(e){} }
