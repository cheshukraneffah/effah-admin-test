// Ejen Tracker module for Effah portal - Vanilla JS
// Drop into: modules/ejen/ejen.js and include <script src="modules/ejen/ejen.js"></script> in index.html
// Requires: window.PROXY_URL (prefer) OR window.AIRTABLE_BASE_ID + window.AIRTABLE_API_KEY (not recommended on client).
// Expected behaviour:
//  - GET: fetch `${window.PROXY_URL}/airtable?table=${table}`
//  - PATCH: POST to `${window.PROXY_URL}/airtable/patch` with body { table, recordId, fields }

(function(){
  const ROOT_ID = 'modul-ejen';
  const JEMAAH_TABLE = 'Maklumat Jemaah';
  const EJEN_TABLE = 'Ejen';
  const PROXY = window.PROXY_URL || null;
  const BASE = window.AIRTABLE_BASE_ID || null;

  // Helper fetch wrappers - adapt to your proxy if endpoints differ
  async function apiFetchTable(table) {
    if (PROXY) {
      const url = `${PROXY.replace(/\/$/,'')}/airtable?table=${encodeURIComponent(table)}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('Fetch failed: ' + r.status);
      return r.json();
    }
    // fallback: direct Airtable (requires window.AIRTABLE_API_KEY set - insecure on client)
    if (window.AIRTABLE_API_KEY && BASE) {
      const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`;
      const r = await fetch(url, { headers: { Authorization: 'Bearer ' + window.AIRTABLE_API_KEY }});
      if (!r.ok) throw new Error('Airtable fetch failed: ' + r.status);
      return r.json();
    }
    throw new Error('No PROXY_URL or AIRTABLE_API_KEY configured.');
  }

  async function apiPatchRecord(table, recordId, fields) {
    if (PROXY) {
      const url = `${PROXY.replace(/\/$/,'')}/airtable/patch`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, recordId, fields })
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error('Patch failed: ' + r.status + ' ' + txt);
      }
      return r.json();
    }
    // fallback direct Airtable PATCH (requires AIRTABLE_API_KEY)
    if (window.AIRTABLE_API_KEY && BASE) {
      const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}/${recordId}`;
      const r = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + window.AIRTABLE_API_KEY },
        body: JSON.stringify({ fields })
      });
      if (!r.ok) throw new Error('Airtable patch failed: ' + r.status);
      return r.json();
    }
    throw new Error('No PROXY_URL or AIRTABLE_API_KEY configured for PATCH.');
  }

  // Render helpers
  function el(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    return wrapper.firstChild;
  }

  function createLayout() {
    const container = document.getElementById(ROOT_ID);
    if (!container) {
      console.warn('Ejen: missing #' + ROOT_ID);
      return;
    }
    container.innerHTML = `
      <div class="ejen-tracker grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside class="p-4 bg-white rounded-xl shadow-sm col-span-1" id="ejen-sidebar">
          <h3 class="font-bold mb-2">Ejen</h3>
          <div id="ejen-list">Loading...</div>
        </aside>
        <div class="col-span-1 md:col-span-3 bg-white p-4 rounded-xl shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold">Senarai Jemaah</h3>
            <div><input id="ejen-search" placeholder="Cari nama / IC" class="px-3 py-1 border rounded" /></div>
          </div>
          <div id="ejen-table-wrap" style="overflow:auto; max-height:70vh;">
            <table id="ejen-table" class="min-w-full text-sm">
              <thead>
                <tr class="text-left">
                  <th>#</th><th>Nama</th><th>IC</th><th>Ejen</th><th>Action</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // UI update
  function renderAgentsList(agents, records, onSelectAgent) {
    const root = document.getElementById('ejen-list');
    if (!root) return;
    const allCount = records.length;
    const parts = [];
    parts.push(`<div><button id="ejen-all-btn" class="text-sm font-semibold">All (${allCount})</button></div>`);
    parts.push('<ul class="mt-2 space-y-1">');
    agents.forEach(a => {
      const count = records.filter(r => {
        const v = r.fields?.EJEN;
        if (!v) return false;
        if (Array.isArray(v)) return v.includes(a.id) || v.includes(a.name);
        return String(v) === a.name || String(v) === a.id;
      }).length;
      parts.push(`<li><button data-agent-id="${a.id}" class="w-full text-left px-2 py-1 rounded hover:bg-slate-50">${a.name} (${count})</button></li>`);
    });
    parts.push('</ul>');
    root.innerHTML = parts.join('');
    root.querySelectorAll('[data-agent-id]').forEach(btn=>{
      btn.addEventListener('click', ()=> onSelectAgent(agents.find(x => x.id === btn.dataset.agentId)));
    });
    const allBtn = document.getElementById('ejen-all-btn');
    if (allBtn) allBtn.addEventListener('click', ()=> onSelectAgent(null));
  }

  function renderTable(records, agents, onUpdate) {
    const tbody = document.querySelector('#ejen-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    records.forEach((rec, idx) => {
      const name = rec.fields?.NAME || rec.fields?.Name || rec.fields?.nama || '';
      const ic = rec.fields?.['IC NO.'] || rec.fields?.IC || '';
      const ej = Array.isArray(rec.fields?.EJEN) ? rec.fields.EJEN.join(', ') : (rec.fields?.EJEN || '');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="pr-4 align-top">${idx+1}</td>
        <td class="pr-4 align-top">${escapeHtml(name)}</td>
        <td class="pr-4 align-top">${escapeHtml(ic)}</td>
        <td class="pr-4 align-top">${escapeHtml(ej)}</td>
        <td class="pr-4 align-top">
          <select class="ejen-select px-2 py-1 border rounded">
            <option value="">-- none --</option>
            ${agents.map(a => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`).join('')}
          </select>
          <button class="ml-2 btn-assign px-2 py-1 bg-emerald-600 text-white rounded">Save</button>
        </td>
      `;
      // pre-select current if matches id or name
      const sel = tr.querySelector('.ejen-select');
      if (sel) {
        // try to select by id or name
        const cur = rec.fields?.EJEN;
        if (Array.isArray(cur) && cur.length>0) {
          sel.value = cur[0];
        } else if (typeof cur === 'string' && cur.length>0) {
          const match = agents.find(a => a.name === cur);
          if (match) sel.value = match.id;
          else {
            // not in agents list: add as option
            const opt = document.createElement('option');
            opt.value = cur;
            opt.textContent = cur + ' (text)';
            sel.appendChild(opt);
            sel.value = cur;
          }
        }
      }

      // attach handlers
      const btn = tr.querySelector('.btn-assign');
      btn.addEventListener('click', async () => {
        const chosen = sel.value;
        // If chosen is an agent id (starts with "rec" or derived), update as linked record array
        // We don't know your EJEN field type: if it's linked record, send [id], if text, send string name.
        // Here we attempt linked-record behaviour if agents list contains chosen id
        const agentObj = agents.find(a => a.id === chosen);
        const payload = agentObj ? [chosen] : chosen; // array for linked, string for text
        btn.disabled = true;
        btn.textContent = 'Saving...';
        try {
          await onUpdate(rec.id, payload);
          btn.textContent = 'Saved';
          setTimeout(()=>btn.textContent = 'Save', 900);
          // refresh row display (simple)
          const ejCell = tr.children[3];
          ejCell.textContent = Array.isArray(payload) ? payload.join(', ') : payload;
        } catch (err) {
          alert('Gagal kemaskini EJEN: ' + err.message);
          console.error(err);
        } finally {
          btn.disabled = false;
        }
      });

      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Main flow
  async function init() {
    createLayout();
    const wrap = document.getElementById(ROOT_ID);
    if (!wrap) return;
    const loadingNode = wrap.querySelector('#ejen-table-wrap') || wrap;
    try {
      // load jemaah
      const jresp = await apiFetchTable(JEMAAH_TABLE);
      const jemaah = (jresp.records || []);
      // try load agents table
      let agents = [];
      try {
        const aresp = await apiFetchTable(EJEN_TABLE);
        agents = (aresp.records || []).map(r => ({ id: r.id, name: r.fields?.Name || r.fields?.nama || r.fields?.Ejen || r.fields?.NAME || ('Agent ' + r.id) }));
      } catch(e) {
        // ignore: derive from jemaah.EJEN
      }
      if (agents.length === 0) {
        const set = new Set();
        jemaah.forEach(r => {
          const v = r.fields?.EJEN;
          if (!v) return;
          if (Array.isArray(v)) v.forEach(x => set.add(x));
          else set.add(String(v));
        });
        agents = Array.from(set).map((name, i) => ({ id: `derived-${i}`, name }));
      }

      // render
      renderAgentsList(agents, jemaah, async (agent) => {
        // filter
        if (!agent) {
          renderTable(jemaah, agents, patchHandler);
        } else {
          const filtered = jemaah.filter(r => {
            const v = r.fields?.EJEN;
            if (!v) return false;
            if (Array.isArray(v)) return v.includes(agent.id) || v.includes(agent.name);
            return String(v) === agent.name || String(v) === agent.id;
          });
          renderTable(filtered, agents, patchHandler);
        }
      });

      renderTable(jemaah, agents, patchHandler);

      // search
      const search = document.getElementById('ejen-search');
      if (search) {
        search.addEventListener('input', (e) => {
          const q = (e.target.value||'').toLowerCase().trim();
          const filtered = jemaah.filter(r => {
            const name = (r.fields?.NAME || r.fields?.Name || '').toLowerCase();
            const ic = (r.fields?.['IC NO.'] || r.fields?.IC || '').toLowerCase();
            return name.includes(q) || ic.includes(q);
          });
          renderTable(filtered, agents, patchHandler);
        });
      }

      async function patchHandler(recordId, payload) {
        // payload: array => linked record, string => text
        // If linked record form, wrap in { EJEN: payload } (Airtable expects array of rec IDs)
        const fields = {};
        fields.EJEN = payload;
        const out = await apiPatchRecord(JEMAAH_TABLE, recordId, fields);
        return out;
      }

    } catch (err) {
      console.error('Ejen init failed', err);
      if (loadingNode) {
        loadingNode.innerHTML = `<div class="text-rose-600 font-bold">Gagal memuat data: ${escapeHtml(err.message)}</div>`;
      }
    }
  }

  // auto init when DOM loaded; module page may be hidden/shown by switchTab() in portal
  document.addEventListener('DOMContentLoaded', function(){
    // only init when modul-ejen present
    if (document.getElementById(ROOT_ID)) {
      init();
    }
  });

})();