// core/constants.js V103.39 PROXY - FIX NOT_FOUND with fallback
window.PROXY_URL = window.PROXY_URL || 'https://effah-proxy.cheshukran-effah.workers.dev/api';
window.AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || 'appSsn4JyQD4DnYu0';
window.TABLE_IDS = window.TABLE_IDS || { STAFF: 'tblssYikTs4GOndyf', ROOMING: 'tblENHq0C677SoO8O', PAX: 'tblsiSgXa9DxX3z9v', TRIP: 'tbl5Pbn2HkVsev5Uy' };
window.TABLE_NAMES = {
  STAFF: 'STAFF LIST (ROOMING)',
  ROOMING: 'ROOMING LIST',
  PAX: 'DATA JEMAAH UMRAH',
  TRIP: 'PAKEJ UMRAH (TRIP)'
};
const EFFAH_PROXY = window.PROXY_URL;
const EFFAH_BASE = window.AIRTABLE_BASE_ID;
const EFFAH_T = window.TABLE_IDS;

async function effahProxyFetch(url, opts={}){
  const res = await fetch(url, opts);
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch(e){ 
    console.error('Proxy non-JSON', txt.slice(0,500));
    throw new Error(`Proxy ${res.status}: ${txt.slice(0,500)}`);
  }
  return data;
}

async function effahGetAll(tableKeyOrId, filterFormula){
  // tableKeyOrId can be 'STAFF' or tbl id
  let tableId = window.TABLE_IDS[tableKeyOrId] || tableKeyOrId;
  let tableName = window.TABLE_NAMES[tableKeyOrId] || tableKeyOrId;
  
  let all=[], offset='';
  let attempts = [
    {type:'ID', value: tableId},
    {type:'NAME', value: tableName}
  ];
  
  for(let attempt of attempts){
    all=[]; offset='';
    try{
      do{
        // Try both with and without base param - some workers need base, some dont
        let url = `${EFFAH_PROXY}?table=${encodeURIComponent(attempt.value)}&pageSize=100`;
        if(filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
        if(offset) url += `&offset=${encodeURIComponent(offset)}`;
        console.log(`[Proxy TRY ${attempt.type}] ${attempt.value} ->`, url);
        const data = await effahProxyFetch(url);
        if(data.error){
          if(data.error.type==='TABLE_NOT_FOUND' || data.error.message?.includes('NOT_FOUND') || JSON.stringify(data.error).includes('NOT_FOUND')){
            console.warn(`Table ${attempt.value} NOT_FOUND, trying next fallback`);
            throw new Error('NOT_FOUND');
          }
          throw new Error(JSON.stringify(data.error));
        }
        if(data.records) all = all.concat(data.records);
        offset = data.offset || '';
      }while(offset);
      console.log(`[Proxy OK ${attempt.type}] ${attempt.value} => ${all.length} records`);
      return all;
    }catch(e){
      if(e.message==='NOT_FOUND' || e.message.includes('NOT_FOUND')){
        continue; // try next attempt
      }
      throw e;
    }
  }
  // Last try with base param included (some workers expect it)
  try{
    all=[]; offset='';
    do{
      let url = `${EFFAH_PROXY}?base=${EFFAH_BASE}&table=${encodeURIComponent(tableId)}&pageSize=100`;
      if(filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
      if(offset) url += `&offset=${encodeURIComponent(offset)}`;
      console.log(`[Proxy TRY with base] ${tableId} ->`, url);
      const data = await effahProxyFetch(url);
      if(data.error) throw new Error(JSON.stringify(data.error));
      if(data.records) all = all.concat(data.records);
      offset = data.offset || '';
    }while(offset);
    return all;
  }catch(e){
    console.error('All proxy attempts failed for', tableKeyOrId, e);
    throw e;
  }
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
function getFieldAttachments(jFields, names){
  if(!jFields) return null;
  for(let n of names){ if(jFields[n] && Array.isArray(jFields[n]) && jFields[n].length>0) return jFields[n]; }
  return null;
}
function showRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.remove('hidden'); }
function hideRoomingLoading(){ const el=document.getElementById('roomingLoading'); if(el) el.classList.add('hidden'); }
function cleanTripNameForRooming(s){ return (s||'').replace(/[^a-zA-Z0-9 \-_]/g,'').substring(0,50); }
