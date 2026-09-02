// core/constants.js V103.40 PROXY - FIX NOT_FOUND + 404
window.PROXY_URL = window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api';
window.AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || 'appSsn4JyQD4DnYu0';
window.TABLE_IDS = window.TABLE_IDS || { STAFF: 'tblssYikTs4GOndyf', ROOMING: 'tblENHq0C677SoO8O', PAX: 'tblsiSgXa9DxX3z9v', TRIP: 'tbl5Pbn2HkVsev5Uy' };
window.TABLE_NAMES = { STAFF: 'STAFF LIST (ROOMING)', ROOMING: 'ROOMING LIST', PAX: 'DATA JEMAAH UMRAH', TRIP: 'PAKEJ UMRAH (TRIP)' };
const EFFAH_PROXY = window.PROXY_URL;
const EFFAH_BASE = window.AIRTABLE_BASE_ID;
const EFFAH_T = window.TABLE_IDS;

async function effahProxyFetch(url, opts={}){
  const res = await fetch(url, opts);
  const txt = await res.text();
  let data;
  try{ data = JSON.parse(txt); }catch(e){
    if(!res.ok) throw new Error(`Proxy ${res.status}: ${txt.slice(0,800)}`);
    return {records:[]};
  }
  if(!res.ok && data.error){ throw new Error(JSON.stringify(data.error)); }
  return data;
}

async function effahGetAll(tableKeyOrId, filterFormula){
  let tableId = window.TABLE_IDS[tableKeyOrId] || tableKeyOrId;
  let tableName = window.TABLE_NAMES[tableKeyOrId] || tableKeyOrId;
  let tries = [
    `${EFFAH_PROXY}?table=${encodeURIComponent(tableId)}&pageSize=100`,
    `${EFFAH_PROXY}?table=${encodeURIComponent(tableName)}&pageSize=100`,
    `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${encodeURIComponent(tableId)}&pageSize=100`,
    `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${encodeURIComponent(tableName)}&pageSize=100`
  ];
  for(let baseUrl of tries){
    try{
      let all=[], offset='';
      do{
        let url = baseUrl;
        if(filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
        if(offset) url += `&offset=${encodeURIComponent(offset)}`;
        console.log('[Proxy TRY]', url);
        const data = await effahProxyFetch(url);
        if(data.records) all = all.concat(data.records);
        offset = data.offset || '';
        if(data.error) throw new Error(JSON.stringify(data.error));
      }while(offset);
      console.log('[Proxy OK]', tableKeyOrId, all.length);
      return all;
    }catch(e){
      if(e.message.includes('NOT_FOUND') || e.message.includes('TABLE_NOT_FOUND') || e.message.includes('NOT_FOUND')){
        console.warn('Try next fallback for', tableKeyOrId, e.message.slice(0,200));
        continue;
      }
      throw e;
    }
  }
  throw new Error('All proxy attempts failed for '+tableKeyOrId);
}

async function effahCreate(tableKeyOrId, fields){
  let tableId = window.TABLE_IDS[tableKeyOrId] || tableKeyOrId;
  let url = `${EFFAH_PROXY}?table=${encodeURIComponent(tableId)}`;
  return await effahProxyFetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}
async function effahUpdate(tableKeyOrId, recordId, fields){
  let tableId = window.TABLE_IDS[tableKeyOrId] || tableKeyOrId;
  let url = `${EFFAH_PROXY}?table=${encodeURIComponent(tableId)}&recordId=${recordId}`;
  return await effahProxyFetch(url, {method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({fields})});
}
async function effahDelete(tableKeyOrId, recordId){
  let tableId = window.TABLE_IDS[tableKeyOrId] || tableKeyOrId;
  let url = `${EFFAH_PROXY}?table=${encodeURIComponent(tableId)}&recordId=${recordId}`;
  return await effahProxyFetch(url, {method:'DELETE'});
}

function getJemaahName(j){ return j.fields?.['NAMA PENUH'] || j.fields?.['NAMA'] || j.fields?.['NAME'] || 'JEMAAH'; }
function showRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.remove('hidden'); }
function hideRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.add('hidden'); }
function cleanTripNameForRooming(s){ return (s||'').replace(/[^a-zA-Z0-9 \-_]/g,'').substring(0,50); }
