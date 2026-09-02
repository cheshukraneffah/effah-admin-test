// js/config.js - CENTRAL CONFIG - PROXY MODE
var PROXY_URL = 'https://effah-proxy.cheshukran-effah.workers.dev/api';
var DEFAULT_BASE_ID = 'appSsn4JyQD4DnYu0';

// Table IDs betul dari /tables tadi
var TABLE_IDS = {
  TRIP: 'tbl5Pbn2HkVsev5Uy',      // PAKEJ UMRAH
  PAX: 'tblsiSgXa9DxX3z9v',        // DATA JEMAAH UMRAH
  ROOMING: 'tblENHq0C677SoO8O',    // ROOMING LIST
  STAFF: 'tblssYikTs4GOndyf'
};

window.PROXY_URL = PROXY_URL;
window.AIRTABLE_BASE_ID = DEFAULT_BASE_ID;
window.TABLE_IDS = TABLE_IDS;
window.DEFAULT_BASE_ID = DEFAULT_BASE_ID;

// helper untuk semua fetch
window.airtableFetch = function(tableId, query="") {
  return fetch(`${PROXY_URL}/${DEFAULT_BASE_ID}/${tableId}${query}`);
}

console.log('✅ Config proxy-loaded - Base:', DEFAULT_BASE_ID);
