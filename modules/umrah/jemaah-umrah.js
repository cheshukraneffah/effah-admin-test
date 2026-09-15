// Variable Global Simpan Data Jemaah & Trip Map
let allJemaahUmrahRecords = [];
let rawTripRecordsList = []; 
let tripMap = {}; 
let selectedTripFilter = null;

 // AUTO-FILL GLOBAL PAT - FINAL
try{
  if(typeof AIRTABLE_PAT === 'undefined' || !AIRTABLE_PAT){
    var AIRTABLE_PAT = window.AIRTABLE_PAT || localStorage.getItem('effah_api_pat') || window.DEFAULT_PAT || 'patjxZg6G22e9OBuS.2a96ced64af7e931ee4d83f65c491adf1241813547d5d8e3a317f5bc6d9a8de7';
    var AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || localStorage.getItem('effah_base_id') || window.DEFAULT_BASE_ID || 'appSsn4JyQD4DnYu0';
  }
  AIRTABLE_PAT = window.AIRTABLE_PAT || AIRTABLE_PAT || '';
  AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || AIRTABLE_BASE_ID || '';
  window.AIRTABLE_PAT = AIRTABLE_PAT;
  window.AIRTABLE_BASE_ID = AIRTABLE_BASE_ID;
}catch(e){}

// Selected Jemaah Checkbox Tracking
let selectedJemaahIds = new Set();

// Hidden Fields Tracking
let hiddenColumns = {};

// Sort State Tracking
let currentSortField = 'NAME';
let currentSortDir = 'asc';

// Default Column Order
let columnOrder = [
    'col-idx', 'col-name', 'col-picture', 'col-ic', 'col-passport', 
    'col-gender', 'col-age', 'col-dob', 'col-dobf', 'col-nat', 
    'col-visa', 'col-passcopy', 'col-visacopy', 'col-mofabio', 
    'col-fit', 'col-trip', 'col-issue', 'col-expire', 'col-notes',
    'col-board', 'col-train', 'col-insuran', 'col-pakej', 'col-ejen'
];

// Default Column Widths
const defaultColumnWidths = {
    'col-idx': 55,
    'col-name': 240,
    'col-picture': 90,
    'col-ic': 130,
    'col-passport': 120,
    'col-gender': 100,
    'col-age': 90,
    'col-dob': 100,
    'col-dobf': 160,
    'col-nat': 110,
    'col-visa': `<td class="p-1 border-r border-slate-300 col-visa">${renderSingleSelectCell(id, 'STATUS VISA', f['STATUS VISA'])}</td>`,
            'col-name': `<td class="p-1 border-r border-slate-300 sticky left-[55px] z-10 ${isChecked ? 'bg-amber-50/80' : 'bg-white'} group-hover:bg-slate-50 col-name shadow-[3px_0_6px_-2px_rgba(0,0,0,0.15)]"><div class="flex items-center justify-between group/name"><input type="text" value="${f['NAME'] || ''}" onchange="updateJemaahField('${id}', 'NAME', this.value)" class="w-full text-xs p-1.5 font-bold uppercase rounded-lg border border-transparent hover:border-slate-300 focus:border-brand-maroon focus:bg-white bg-transparent"><button onclick="openExpandModal('${id}')" class="text-slate-400 hover:text-brand-maroon px-1 hidden group-hover/name:block" title="Buka Detail Modal"><i class="fa-solid fa-up-right-and-down-left-from-center text-[10px]"></i></button></div></td>`,
            'col-picture': `<td class="p-2 border-r border-slate-300 text-center col-picture">${renderInlineUploadCell(id, 'PICTURE', pictureFiles, 'Pic')}</td>`,
            'col-ic': `<td class="p-1 border-r border-slate-300 col-ic"><input type="text" value="${f['IC NO.'] || ''}" onchange="updateJemaahField('${id}', 'IC NO.', this.value)" class="w-full text-xs p-1.5 font-mono rounded-lg border border-transparent hover:border-slate-300 focus:border-brand-maroon focus:bg-white bg-transparent"></td>`,
            'col-passport': `<td class="p-1 border-r border-slate-300 col-passport"><input type="text" value="${f['PASSPORT NO.'] || ''}" onchange="updateJemaahField('${id}', 'PASSPORT NO.', this.value)" class="w-full text-xs p-1.5 font-mono font-bold uppercase rounded-lg border border-transparent hover:border-slate-300 focus:border-brand-maroon focus:bg-white bg-transparent"></td>`,
            'col-gender': `<td class="p-1 border-r border-slate-300 col-gender"><select onchange="updateJemaahField('${id}', 'GENDER', this.value)" class="w-full text-xs p-1.5 font-bold rounded-lg border border-transparent hover:border-slate-300 focus:bg-white bg-transparent"><option value="">--</option><option value="MALE" ${f['GENDER'] === 'MALE' ? 'selected' : ''}>MALE</option><option value="FEMALE" ${f['GENDER'] === 'FEMALE' ? 'selected' : ''}>FEMALE</option></select></td>`,
            'col-age': `<td class="p-2.5 border-r border-slate-300 bg-slate-50/50 font-semibold text-slate-600 col-age" id="age-cell-${id}">${f['AGE'] || '-'}</td>`,
            'col-dob': `<td class="p-2.5 border-r border-slate-300 bg-slate-50/50 font-semibold text-slate-600 col-dob" id="dob-cell-${id}">${f['DOB'] || '-'}</td>`,
            'col-dobf': `<td class="p-1 border-r border-slate-300 col-dobf"><input type="date" value="${f['DOB (FOREIGNER)'] || ''}" onchange="updateJemaahField('${id}', 'DOB (FOREIGNER)', this.value)" class="w-full text-xs p-1.5 rounded-lg border border-transparent hover:border-slate-300 focus:bg-white bg-transparent"></td>`,
            'col-nat': `<td class="p-1 border-r border-slate-300 col-nat">${renderSingleSelectCell(id, 'NATIONALITY', f['NATIONALITY'])}</td>`,
            'col-visa': `<td class="p-1 border-r border-slate-300 col-visa">${renderSingleSelectCell(id, 'STATUS VISA', f['STATUS VISA'])}</td>`,
            'col-passcopy': `<td class="p-2 border-r border-slate-300 text-center col-passcopy">${renderInlineUploadCell(id, 'PASSPORT COPY', passCopyFiles, 'Passport')}</td>`,
            'col-visacopy': `<td class="p-2 border-r border-slate-300 text-center col-visacopy">${renderInlineUploadCell(id, 'VISA COPY', visaCopyFiles, 'Visa')}</td>`,
            'col-mofabio': `<td class="p-2 border-r border-slate-300 text-center col-mofabio">${renderInlineUploadCell(id, 'MOFABIO', mofabioFiles, 'Mofabio')}</td>`,
            'col-fit': `<td class="p-2 border-r border-slate-300 text-center col-fit"><input type="checkbox" ${f['FIT TICKET'] ? 'checked' : ''} onchange="updateJemaahField('${id}', 'FIT TICKET', this.checked)" class="w-4 h-4 rounded text-brand-maroon focus:ring-brand-maroon"></td>`,
            'col-trip': `<td class="p-2.5 border-r border-slate-300 font-bold text-brand-maroon col-trip">${actualTripName}</td>`,
            'col-issue': `<td class="p-1 border-r border-slate-300 col-issue"><input type="date" value="${f['DATE OF ISSUE'] || ''}" onchange="updateJemaahField('${id}', 'DATE OF ISSUE', this.value)" class="w-full text-xs p-1.5 rounded-lg border border-transparent hover:border-slate-300 focus:bg-white bg-transparent"></td>`,
            'col-expire': `<td class="p-1 border-r border-slate-300 col-expire"><input type="date" value="${f['DATE OF EXPIRE'] || ''}" onchange="updateJemaahField('${id}', 'DATE OF EXPIRE', this.value)" class="w-full text-xs p-1.5 rounded-lg border border-transparent hover:border-slate-300 focus:bg-white bg-transparent"></td>`,
            'col-notes': `<td class="p-1 border-r border-slate-300 col-notes"><input type="text" value="${f['Notes'] || ''}" onchange="updateJemaahField('${id}', 'Notes', this.value)" class="w-full text-xs p-1.5 rounded-lg border border-transparent hover:border-slate-300 focus:bg-white bg-transparent"></td>`,
            'col-board': `<td class="p-1 border-r border-slate-300 col-board">${renderMultiSelectCell(id, 'BOARD BASIS', f['BOARD BASIS'])}</td>`,
            'col-train': `<td class="p-2 border-r border-slate-300 text-center col-train"><input type="checkbox" ${f['TRAIN'] ? 'checked' : ''} onchange="updateJemaahField('${id}', 'TRAIN', this.checked)" class="w-4 h-4 rounded text-brand-maroon focus:ring-brand-maroon"></td>`,
            'col-insuran': `<td class="p-1 border-r border-slate-300 col-insuran">${renderMultiSelectCell(id, 'INSURAN', f['INSURAN'])}</td>`,
            'col-pakej': `<td class="p-1 border-r border-slate-300 col-pakej">${renderSingleSelectCell(id, 'PAKEJ', f['PAKEJ'])}</td>`,
            'col-ejen': `<td class="p-1 col-ejen">${renderEjenCell(id, f['EJEN'])}</td>`
        };

        columnOrder.forEach(colKey => {
            if (cellRenderers[colKey]) {
                tr.insertAdjacentHTML('beforeend', cellRenderers[colKey]);
            }
        });

        tbody.appendChild(tr);
    });

    applyHiddenColumns();
    applySavedColumnWidths();
    updateBulkActionBar();
}

// 📁 RENDER CELL UNTUK DIRECT INLINE MULTIPLE UPLOAD WITH ANIMATED LOADING INDICATOR
function renderInlineUploadCell(recId, fieldName, fileList, labelName) {
    const files = Array.isArray(fileList) ? fileList : [];
    const cellBoxId = `cell-upload-${recId}-${fieldName.replace(/\s+/g, '_')}`;

    let filesListHtml = '';
    if (files.length > 0) {
        filesListHtml = files.map((fileObj, idx) => {
            const fileUrl = fileObj.url;
            const fileName = fileObj.filename || `${labelName} ${idx + 1}`;
            const fileId = fileObj.id || '';
            const safeFileName = fileName.replace(/'/g, "\\'");
            const isPdf = fileUrl && (fileUrl.toLowerCase().includes('.pdf') || fileName.toLowerCase().includes('.pdf'));

            return `
                <div class="flex items-center space-x-1 my-0.5">
                    ${isPdf ? `
                        <button onclick="openPreviewModal('${fileUrl}', '${safeFileName}', {recordId:'${recId}', fieldName:'${fieldName}', attachmentId:'${fileId}', filename:'${safeFileName}'})" class="bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold px-1.5 py-0.5 rounded text-[10px] border border-rose-200 truncate max-w-[70px]" title="${fileName}">PDF</button>
                    ` : `
                        <img src="${fileUrl}" onclick="openPreviewModal('${fileUrl}', '${safeFileName}', {recordId:'${recId}', fieldName:'${fieldName}', attachmentId:'${fileId}', filename:'${safeFileName}'})" class="w-6 h-6 rounded object-cover border border-slate-300 cursor-pointer hover:scale-110 transition" title="${fileName}">
                    `}
                    <button onclick="confirmDeleteAttachment('${recId}', '${fieldName}', ${idx})" class="text-slate-400 hover:text-rose-600 p-0.5" title="Padam Fail Ini"><i class="fa-solid fa-xmark text-[10px]"></i></button>
                </div>
            `;
        }).join('');
    }

    return `
        <div id="${cellBoxId}" class="inline-flex flex-wrap items-center justify-center gap-1 w-full group/cell relative p-1 rounded-lg transition" 
             ondragover="event.preventDefault(); this.classList.add('bg-rose-50', 'border-brand-maroon');" 
             ondragleave="this.classList.remove('bg-rose-50', 'border-brand-maroon');"
             ondrop="event.preventDefault(); this.classList.remove('bg-rose-50', 'border-brand-maroon'); if(event.dataTransfer.files) handleInlineFileUpload('${recId}', '${fieldName}', event.dataTransfer.files, '${cellBoxId}')">
            
            ${filesListHtml}

            <label class="cursor-pointer bg-slate-100 hover:bg-brand-maroon hover:text-white text-slate-600 px-2 py-1 rounded text-[10px] font-bold transition flex items-center shadow-2xs" title="Klik atau Drop fail banyak di sini">
                <i class="fa-solid fa-cloud-arrow-up ${files.length > 0 ? 'mr-0' : 'mr-1'}"></i>
                <span class="${files.length > 0 ? 'hidden' : 'inline'}">Upload</span>
                <input type="file" multiple class="hidden" accept="image/*,application/pdf" onchange="if(this.files.length) handleInlineFileUpload('${recId}', '${fieldName}', this.files, '${cellBoxId}')">
            </label>
        </div>
    `;
}

// 📤 PROSES UPLOAD BANYAK FAIL TERUS DARI TABLE WITH CELL LOADING INDICATOR
async function handleInlineFileUpload(recId, fieldName, fileList, cellBoxId) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const cellContainer = document.getElementById(cellBoxId);
    if (cellContainer) {
        cellContainer.innerHTML = `
            <div class="flex items-center space-x-1 bg-rose-50 text-brand-maroon font-bold text-[10px] px-2 py-1 rounded border border-rose-200 animate-pulse">
                <i class="fa-solid fa-spinner fa-spin text-xs"></i>
                <span>Uploading (${files.length})...</span>
            </div>
        `;
    }

    try {
        const cloudName = "dfb839ep"; 
        const uploadPreset = "Effah Travel";  

        // 1. Upload semua fail ke Cloudinary secara selari
        const uploadPromises = files.map(async (file) => {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("upload_preset", uploadPreset);

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: "POST",
                body: uploadFormData
            });

            const cloudData = await cloudRes.json();
            if (!cloudRes.ok || !cloudData || !cloudData.secure_url) {
                throw new Error(`Gagal muat naik: ${file.name}`);
            }

            return {
                url: cloudData.secure_url,
                filename: file.name
            };
        });

        const newUploadedFiles = await Promise.all(uploadPromises);

        // 2. Gabungkan fail sedia ada dengan fail baharu (Append)
        const targetRec = allJemaahUmrahRecords.find(r => r.id === recId);
        let currentAttachments = [];
        if (targetRec && targetRec.fields[fieldName] && Array.isArray(targetRec.fields[fieldName])) {
            currentAttachments = targetRec.fields[fieldName].map(att => ({ id: att.id, url: att.url, filename: att.filename }));
        }

        const updatedAttachments = [...currentAttachments, ...newUploadedFiles];

        // 3. Kemaskini ke Airtable
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH/${recId}`;
        const airtableRes = await fetch(airtableUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    [fieldName]: updatedAttachments
                }
            })
        });

        const resultJson = await airtableRes.json();

        if (airtableRes.ok) {
            if (targetRec) {
                targetRec.fields[fieldName] = resultJson.fields[fieldName];
            }
            filterAndRenderJemaahGrid();
        } else {
            alert("Gagal simpan ke Airtable.");
            filterAndRenderJemaahGrid();
        }
    } catch (err) {
        console.error("Inline upload exception:", err);
        alert("Ralat semasa upload fail.");
        filterAndRenderJemaahGrid();
    }
}

function toggleSelectJemaahRow(id, isChecked) {
    if (isChecked) {
        selectedJemaahIds.add(id);
    } else {
        selectedJemaahIds.delete(id);
    }

    const row = document.getElementById(`jemaah-row-${id}`);
    if (row) {
        const idxCell = row.querySelector('.idx-cell');
        if (isChecked) {
            row.classList.add('bg-amber-50/60');
            if (idxCell) idxCell.classList.add('is-checked');
        } else {
            row.classList.remove('bg-amber-50/60');
            if (idxCell) idxCell.classList.remove('is-checked');
        }
    }

    updateBulkActionBar();
}

function toggleSelectAllJemaah(isChecked) {
    const visibleCheckboxes = document.querySelectorAll('.idx-check');
    visibleCheckboxes.forEach(cb => {
        cb.checked = isChecked;
        const row = cb.closest('tr');
        if (row && row.id) {
            const recId = row.id.replace('jemaah-row-', '');
            if (isChecked) {
                selectedJemaahIds.add(recId);
            } else {
                selectedJemaahIds.delete(recId);
            }
        }
    });

    filterAndRenderJemaahGrid();
}

function updateBulkActionBar() {
    const bar = document.getElementById('bulkActionBar');
    const countText = document.getElementById('selectedCountText');
    const masterCb = document.getElementById('masterJemaahCheckbox');

    if (!bar) return;

    if (selectedJemaahIds.size > 0) {
        bar.classList.remove('hidden');
        if (countText) countText.textContent = selectedJemaahIds.size;
    } else {
        bar.classList.add('hidden');
        if (masterCb) masterCb.checked = false;
    }
}

function clearJemaahSelection() {
    selectedJemaahIds.clear();
    const masterCb = document.getElementById('masterJemaahCheckbox');
    if (masterCb) masterCb.checked = false;
    filterAndRenderJemaahGrid();
}

async function bulkDeleteJemaah() {
    if (selectedJemaahIds.size === 0) return;

    if (!confirm(`Adakah anda pasti nak padam ${selectedJemaahIds.size} rekod jemaah yang dipilih dari Airtable?`)) return;

    const idsToDelete = Array.from(selectedJemaahIds);
    const delBtn = document.getElementById('btnBulkDelete');

    if (delBtn) {
        delBtn.disabled = true;
        delBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Memadam...';
    }

    allJemaahUmrahRecords = allJemaahUmrahRecords.filter(r => !selectedJemaahIds.has(r.id));
    selectedJemaahIds.clear();

    filterAndRenderJemaahGrid();
    updateBulkActionBar();

    try {
        const deletePromises = idsToDelete.map(recId => {
            const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH/${recId}`;
            return fetch(url, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
            });
        });

        await Promise.all(deletePromises);
    } catch (e) {
        console.error("Error bulk deleting from Airtable:", e);
    } finally {
        if (delBtn) {
            delBtn.disabled = false;
            delBtn.innerHTML = '<i class="fa-solid fa-trash-can mr-1.5"></i> Padam Rekod';
        }
    }
}

function openAddTripModal() {
    const modal = document.getElementById('expandRecordModal');
    const container = document.getElementById('expandModalFormContainer');
    const titleEl = document.getElementById('expandModalTitle');
    const delBtn = document.getElementById('modalDeleteBtn');
    const saveBtn = document.getElementById('modalSaveBtn');

    if (titleEl) titleEl.textContent = 'TAMBAH PAKEJ / TRIP UMRAH';
    if (delBtn) delBtn.classList.add('hidden');
    if (saveBtn) {
        saveBtn.innerHTML = 'Simpan Trip';
        saveBtn.onclick = createNewTripFromModal;
    }

    container.innerHTML = `
        <form id="addTripModalForm" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block font-extrabold text-slate-700 mb-1">MULA PAKEJ *</label>
                    <input type="date" name="Mula Pakej" required class="w-full p-3 font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none bg-slate-50">
                </div>
                <div>
                    <label class="block font-extrabold text-slate-700 mb-1">TAMAT PAKEJ *</label>
                    <input type="date" name="Tamat Pakej" required class="w-full p-3 font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none bg-slate-50">
                </div>
            </div>
            <p class="text-[11px] text-slate-400 italic mt-1">* Nota: Nama trip akan dijana secara automatik oleh Airtable berdasarkan tarikh di atas.</p>
        </form>
    `;

    if (modal) modal.classList.remove('hidden');
}

async function createNewTripFromModal() {
    const form = document.getElementById('addTripModalForm');
    if (!form) return;

    const formData = new FormData(form);
    const mulaPakej = formData.get('Mula Pakej');
    const tamatPakej = formData.get('Tamat Pakej');

    if (!mulaPakej || !tamatPakej) {
        alert("Sila masukkan Tarikh Mula dan Tarikh Tamat Pakej!");
        return;
    }

    let payloadFields = {
        "Mula Pakej": mulaPakej,
        "Tamat Pakej": tamatPakej
    };

    const saveBtn = document.getElementById('modalSaveBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Menyimpan...';

    try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/PAKEJ%20UMRAH`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: payloadFields })
        });

        if (response.ok) {
            await fetchTripMapping();
    try{ renderJemaahHijriTabs(); renderViewsSidebar(); }catch(e){}
    fetchJemaahMetaOptions();
    fetchEjenList();
            renderViewsSidebar();
            closeExpandModal();
        } else {
            alert("Gagal menambah trip baharu.");
        }
    } catch (e) {
        console.error("Error creating trip:", e);
    } finally {
        if (saveBtn) saveBtn.innerHTML = 'Simpan Perubahan';
    }
}

function openExpandModal(recId) {
    const rec = allJemaahUmrahRecords.find(r => r.id === recId);
    if (!rec) return;

    const f = rec.fields;
    const modal = document.getElementById('expandRecordModal');
    const container = document.getElementById('expandModalFormContainer');
    const titleEl = document.getElementById('expandModalTitle');
    const delBtn = document.getElementById('modalDeleteBtn');
    const saveBtn = document.getElementById('modalSaveBtn');

    if (titleEl) titleEl.textContent = f['NAME'] || 'EXPAND RECORD';
    if (delBtn) {
        delBtn.classList.remove('hidden');
        delBtn.onclick = () => deleteJemaahFromModal(recId);
    }
    if (saveBtn) {
        saveBtn.innerHTML = 'Simpan Perubahan';
        saveBtn.onclick = () => saveJemaahFromModal(recId);
    }

    const tripOptionsHtml = rawTripRecordsList.map(t => {
        const title = tripMap[t.id] ? tripMap[t.id].title : cleanTripName(t.fields['Trip']);
        const currentTripId = Array.isArray(f['TRIP']) ? f['TRIP'][0] : f['TRIP'];
        const selected = (currentTripId === t.id || currentTripId === title) ? 'selected' : '';
        return `<option value="${t.id}" ${selected}>${title}</option>`;
    }).join('');

    container.innerHTML = `
        <form id="expandModalForm" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label class="font-bold text-slate-500 uppercase">NAME</label>
                <div class="sm:col-span-2">
                    <input type="text" name="NAME" value="${f['NAME'] || ''}" class="w-full p-2.5 font-bold text-sm text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none uppercase">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-start gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase mt-2"><i class="fa-solid fa-image mr-1"></i> PICTURE</label>
                <div class="sm:col-span-2">
                    ${renderDropZoneHtml(recId, 'PICTURE', getAttachmentArray(f['PICTURE']))}
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">IC NO.</label>
                <div class="sm:col-span-2">
                    <input type="text" name="IC NO." value="${f['IC NO.'] || ''}" class="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">PASSPORT NO.</label>
                <div class="sm:col-span-2">
                    <input type="text" name="PASSPORT NO." value="${f['PASSPORT NO.'] || ''}" class="w-full p-2.5 font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">GENDER</label>
                <div class="sm:col-span-2">
                    <select name="GENDER" class="w-full p-2.5 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                        <option value="">-- Pilih --</option>
                        <option value="MALE" ${f['GENDER'] === 'MALE' ? 'selected' : ''}>MALE</option>
                        <option value="FEMALE" ${f['GENDER'] === 'FEMALE' ? 'selected' : ''}>FEMALE</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-400 uppercase">🔒 AGE (Formula)</label>
                <div class="sm:col-span-2">
                    <input type="text" disabled value="${f['AGE'] || '-'}" class="w-full p-2.5 font-semibold bg-slate-100 border border-slate-200 text-slate-500 rounded-xl">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-400 uppercase">🔒 DOB (Formula)</label>
                <div class="sm:col-span-2">
                    <input type="text" disabled value="${f['DOB'] || '-'}" class="w-full p-2.5 font-semibold bg-slate-100 border border-slate-200 text-slate-500 rounded-xl">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">DOB (FOREIGNER)</label>
                <div class="sm:col-span-2">
                    <input type="date" name="DOB (FOREIGNER)" value="${f['DOB (FOREIGNER)'] || ''}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">NATIONALITY</label>
                <div class="sm:col-span-2">
                    <select name="NATIONALITY" class="w-full p-2.5 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                        <option value="MALAYSIA" ${(!f['NATIONALITY'] || f['NATIONALITY'] === 'MALAYSIA') ? 'selected' : ''}>MALAYSIA</option>
                        <option value="INDONESIA" ${f['NATIONALITY'] === 'INDONESIA' ? 'selected' : ''}>INDONESIA</option>
                        <option value="THAILAND" ${f['NATIONALITY'] === 'THAILAND' ? 'selected' : ''}>THAILAND</option>
                        <option value="INDIA" ${f['NATIONALITY'] === 'INDIA' ? 'selected' : ''}>INDIA</option>
                        <option value="BANGLADESH" ${f['NATIONALITY'] === 'BANGLADESH' ? 'selected' : ''}>BANGLADESH</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">STATUS VISA</label>
                <div class="sm:col-span-2">
                    <select name="STATUS VISA" class="w-full p-2.5 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                        <option value="">-- Pilih Status --</option>
                        <option value="TOURIST" ${f['STATUS VISA'] === 'TOURIST' ? 'selected' : ''}>TOURIST</option>
                        <option value="TOURIST (VALID)" ${f['STATUS VISA'] === 'TOURIST (VALID)' ? 'selected' : ''}>TOURIST (VALID)</option>
                        <option value="UMRAH" ${f['STATUS VISA'] === 'UMRAH' ? 'selected' : ''}>UMRAH</option>
                        <option value="UMRAH (VALID)" ${f['STATUS VISA'] === 'UMRAH (VALID)' ? 'selected' : ''}>UMRAH (VALID)</option>
                        <option value="IQAMA (VALID)" ${f['STATUS VISA'] === 'IQAMA (VALID)' ? 'selected' : ''}>IQAMA (VALID)</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-start gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase mt-2"><i class="fa-solid fa-file-pdf mr-1"></i> PASSPORT COPY</label>
                <div class="sm:col-span-2">
                    ${renderDropZoneHtml(recId, 'PASSPORT COPY', getAttachmentArray(f['PASSPORT COPY']))}
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-start gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase mt-2"><i class="fa-solid fa-file-pdf mr-1"></i> VISA COPY</label>
                <div class="sm:col-span-2">
                    ${renderDropZoneHtml(recId, 'VISA COPY', getAttachmentArray(f['VISA COPY']))}
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-start gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase mt-2"><i class="fa-solid fa-file-pdf mr-1"></i> MOFABIO</label>
                <div class="sm:col-span-2">
                    ${renderDropZoneHtml(recId, 'MOFABIO', getAttachmentArray(f['MOFABIO']))}
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">FIT TICKET</label>
                <div class="sm:col-span-2">
                    <label class="inline-flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" name="FIT TICKET" ${f['FIT TICKET'] ? 'checked' : ''} class="w-4 h-4 rounded text-brand-maroon focus:ring-brand-maroon">
                        <span class="font-semibold text-slate-700">Ya, Sah</span>
                    </label>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">TRIP</label>
                <div class="sm:col-span-2">
                    <select name="TRIP" class="w-full p-2.5 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                        <option value="">-- TBC / Tanpa Trip --</option>
                        ${tripOptionsHtml}
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">DATE OF ISSUE</label>
                <div class="sm:col-span-2">
                    <input type="date" name="DATE OF ISSUE" value="${f['DATE OF ISSUE'] || ''}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">DATE OF EXPIRE</label>
                <div class="sm:col-span-2">
                    <input type="date" name="DATE OF EXPIRE" value="${f['DATE OF EXPIRE'] || ''}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">NOTES</label>
                <div class="sm:col-span-2">
                    <textarea name="Notes" rows="2" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">${f['Notes'] || ''}</textarea>
                </div>
            </div>

        </form>
    `;

    setupDropZones(recId);
    if (modal) modal.classList.remove('hidden');
}

function closeExpandModal() {
    const modal = document.getElementById('expandRecordModal');
    if (modal) modal.classList.add('hidden');
}

function renderDropZoneHtml(recId, fieldName, currentFiles) {
    const files = Array.isArray(currentFiles) ? currentFiles : [];

    let listHtml = '';
    if (files.length > 0) {
        listHtml = files.map((fileObj, idx) => {
            const fileUrl = fileObj.url;
            const fileName = fileObj.filename || `${fieldName} ${idx + 1}`;
            return `
                <div class="flex items-center justify-between bg-slate-50 p-2 px-3 rounded-xl border border-slate-200 mb-1">
                    <span class="font-semibold text-slate-600 text-[11px] truncate max-w-xs" title="${fileName}">${fileName}</span>
                    <div class="flex items-center space-x-2">
                        <button type="button" onclick="openPreviewModal('${fileUrl}', '${fileName}')" class="text-brand-maroon hover:underline font-bold text-[11px]">
                            Preview / Download
                        </button>
                        <button type="button" onclick="confirmDeleteAttachment('${recId}', '${fieldName}', ${idx})" class="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition" title="Padam Fail Ini">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    return `
        <div class="space-y-2">
            ${listHtml}
            <div id="dropzone-${fieldName}" class="border-2 border-dashed border-slate-300 hover:border-brand-maroon rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-rose-50/30 transition group">
                <i class="fa-solid fa-cloud-arrow-up text-xl text-slate-400 group-hover:text-brand-maroon mb-1"></i>
                <p class="font-semibold text-slate-600 text-xs">Drop files here or click to browse (Multiple supported)</p>
                <p class="text-[10px] text-slate-400">PDF, JPG, PNG (Max 10MB per file)</p>
                <input type="file" id="fileinput-${fieldName}" multiple class="hidden" accept="image/*,application/pdf">
            </div>
        </div>
    `;
}

async function confirmDeleteAttachment(recId, fieldName, indexToDelete = null) {
    if (!confirm(`Adakah anda pasti mahu memadam fail ${fieldName} ini?`)) {
        return;
    }

    const targetRec = allJemaahUmrahRecords.find(r => r.id === recId);
    let updatedList = [];

    if (targetRec && targetRec.fields[fieldName] && Array.isArray(targetRec.fields[fieldName])) {
        if (indexToDelete !== null) {
            updatedList = targetRec.fields[fieldName].filter((_, idx) => idx !== indexToDelete);
        }
    }

    try {
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH/${recId}`;
        const res = await fetch(airtableUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    [fieldName]: updatedList
                }
            })
        });

        if (res.ok) {
            if (targetRec) targetRec.fields[fieldName] = updatedList;
            filterAndRenderJemaahGrid();
            const modal = document.getElementById('expandRecordModal');
            if (modal && !modal.classList.contains('hidden')) {
                openExpandModal(recId);
            }
        } else {
            alert("Gagal memadam fail.");
        }
    } catch (e) {
        console.error("Error deleting attachment:", e);
        alert("Ralat sambungan rangkaian.");
    }
}

function setupDropZones(recId) {
    const fields = ['PICTURE', 'PASSPORT COPY', 'VISA COPY', 'MOFABIO'];

    fields.forEach(fName => {
        const zone = document.getElementById(`dropzone-${fName}`);
        const input = document.getElementById(`fileinput-${fName}`);

        if (!zone || !input) return;

        zone.onclick = () => input.click();

        zone.ondragover = (e) => {
            e.preventDefault();
            zone.classList.add('border-brand-maroon', 'bg-rose-50/50');
        };

        zone.ondragleave = () => {
            zone.classList.remove('border-brand-maroon', 'bg-rose-50/50');
        };

        zone.ondrop = (e) => {
            e.preventDefault();
            zone.classList.remove('border-brand-maroon', 'bg-rose-50/50');
            if (e.dataTransfer.files && e.dataTransfer.files.length) {
                handleFileUpload(recId, fName, e.dataTransfer.files, zone);
            }
        };

        input.onchange = (e) => {
            if (e.target.files && e.target.files.length) {
                handleFileUpload(recId, fName, e.target.files, zone);
            }
        };
    });
}

async function handleFileUpload(recId, fieldName, fileList, zoneEl) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    zoneEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-brand-maroon text-lg mb-1"></i><p class="font-bold text-xs text-slate-700">Uploading ${files.length} fail... [1/2]</p>`;

    try {
        const cloudName = "dfb839ep"; 
        const uploadPreset = "Effah Travel";  

        const uploadPromises = files.map(async (file) => {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("upload_preset", uploadPreset);

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: "POST",
                body: uploadFormData
            });

            const cloudData = await cloudRes.json();
            if (!cloudRes.ok || !cloudData || !cloudData.secure_url) {
                throw new Error("Gagal upload Cloudinary");
            }

            return {
                url: cloudData.secure_url,
                filename: file.name
            };
        });

        const newUploadedFiles = await Promise.all(uploadPromises);

        zoneEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-brand-maroon text-lg mb-1"></i><p class="font-bold text-xs text-slate-700">Menyimpan ke Airtable... [2/2]</p>`;

        const targetRec = allJemaahUmrahRecords.find(r => r.id === recId);
        let currentAttachments = [];
        if (targetRec && targetRec.fields[fieldName] && Array.isArray(targetRec.fields[fieldName])) {
            currentAttachments = targetRec.fields[fieldName].map(att => ({ id: att.id, url: att.url, filename: att.filename }));
        }

        const updatedAttachments = [...currentAttachments, ...newUploadedFiles];

        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH/${recId}`;
        const airtableRes = await fetch(airtableUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    [fieldName]: updatedAttachments
                }
            })
        });

        const resultJson = await airtableRes.json();

        if (airtableRes.ok) {
            if (targetRec) {
                targetRec.fields[fieldName] = resultJson.fields[fieldName];
            }

            zoneEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-lg mb-1"></i><p class="font-bold text-xs text-emerald-700">Berjaya Disimpan!</p>`;
            
            setTimeout(() => {
                filterAndRenderJemaahGrid();
                openExpandModal(recId);
            }, 1000);
        } else {
            console.error("Airtable Error Detail:", resultJson);
            zoneEl.innerHTML = `<p class="text-rose-600 font-bold">Airtable Error: ${resultJson.error?.message || 'Gagal dikemaskini'}</p>`;
        }

    } catch (err) {
        console.error("Upload process exception:", err);
        zoneEl.innerHTML = `<p class="text-rose-600 font-bold">Ralat muat naik fail.</p>`;
    }
}

async function saveJemaahFromModal(recId) {
    const form = document.getElementById('expandModalForm');
    if (!form) return;

    const formData = new FormData(form);
    let updatedFields = {};

    formData.forEach((val, key) => {
        if (key === 'NAME' || key === 'PASSPORT NO.') {
            updatedFields[key] = val ? val.toUpperCase().trim() : null;
        } else if (key === 'FIT TICKET') {
            updatedFields[key] = true;
        } else if (key === 'TRIP') {
            updatedFields[key] = val ? [val] : null;
        } else {
            updatedFields[key] = val === '' ? null : val;
        }
    });

    if (!formData.has('FIT TICKET')) {
        updatedFields['FIT TICKET'] = false;
    }

    const saveBtn = document.getElementById('modalSaveBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Menyimpan...';

    const targetRec = allJemaahUmrahRecords.find(r => r.id === recId);
    if (targetRec) {
        Object.assign(targetRec.fields, updatedFields);
    }

    filterAndRenderJemaahGrid();

    try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH/${recId}`;
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: updatedFields })
        });

        if (res.ok) {
            const data = await res.json();
            if (targetRec && data.fields) {
                targetRec.fields['AGE'] = data.fields['AGE'];
                targetRec.fields['DOB'] = data.fields['DOB'];
            }
            filterAndRenderJemaahGrid();
            closeExpandModal();
        }
    } catch (e) {
        console.error("Error saving modal:", e);
    } finally {
        if (saveBtn) saveBtn.innerHTML = 'Simpan Perubahan';
    }
}

async function deleteJemaahFromModal(recId) {
    if (!confirm("Adakah anda pasti nak padam rekod jemaah ini?")) return;

    allJemaahUmrahRecords = allJemaahUmrahRecords.filter(r => r.id !== recId);
    filterAndRenderJemaahGrid();
    closeExpandModal();

    try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH/${recId}`;
        await fetch(url, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
        });
    } catch (e) {
        console.error("Error deleting record:", e);
    }
}

function openAddJemaahModal() {
    const modal = document.getElementById('expandRecordModal');
    const container = document.getElementById('expandModalFormContainer');
    const titleEl = document.getElementById('expandModalTitle');
    const delBtn = document.getElementById('modalDeleteBtn');
    const saveBtn = document.getElementById('modalSaveBtn');

    if (titleEl) titleEl.textContent = 'TAMBAH JEMAAH BAHARU';
    if (delBtn) delBtn.classList.add('hidden');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fa-solid fa-plus mr-1"></i> Tambah Jemaah';
        saveBtn.onclick = createNewJemaahFromModal;
    }

    const tripOptionsHtml = rawTripRecordsList.map(t => {
        const title = tripMap[t.id] ? tripMap[t.id].title : cleanTripName(t.fields['Trip']);
        const isCurrentActiveTrip = (selectedTripFilter !== 'ALL' && selectedTripFilter !== 'TBC' && selectedTripFilter === title);
        const selected = isCurrentActiveTrip ? 'selected' : '';
        return `<option value="${t.id}" ${selected}>${title}</option>`;
    }).join('');

    container.innerHTML = `
        <form id="addModalForm" class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label class="font-bold text-slate-500 uppercase">NAME *</label>
                <div class="sm:col-span-2">
                    <input type="text" name="NAME" required placeholder="Contoh: AHMAD BIN ABDULLAH" class="w-full p-2.5 font-bold text-sm text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none uppercase">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">IC NO.</label>
                <div class="sm:col-span-2">
                    <input type="text" name="IC NO." placeholder="900101015555" class="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">PASSPORT NO.</label>
                <div class="sm:col-span-2">
                    <input type="text" name="PASSPORT NO." placeholder="A12345678" class="w-full p-2.5 font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">GENDER</label>
                <div class="sm:col-span-2">
                    <select name="GENDER" class="w-full p-2.5 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                        <option value="">-- Pilih --</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">STATUS VISA</label>
                <div class="sm:col-span-2">
                    <select name="STATUS VISA" class="w-full p-2.5 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                        <option value="">-- Pilih --</option>
                        <option value="TOURIST">TOURIST</option>
                        <option value="TOURIST (VALID)">TOURIST (VALID)</option>
                        <option value="UMRAH">UMRAH</option>
                        <option value="UMRAH (VALID)">UMRAH (VALID)</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">TRIP</label>
                <div class="sm:col-span-2">
                    <select name="TRIP" class="w-full p-2.5 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none">
                        <option value="">-- TBC / Tanpa Trip --</option>
                        ${tripOptionsHtml}
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 border-t border-slate-100 pt-3">
                <label class="font-bold text-slate-500 uppercase">NOTES</label>
                <div class="sm:col-span-2">
                    <textarea name="Notes" rows="2" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-maroon focus:outline-none"></textarea>
                </div>
            </div>

        </form>
    `;

    if (modal) modal.classList.remove('hidden');
}

async function createNewJemaahFromModal() {
    const form = document.getElementById('addModalForm');
    if (!form) return;

    const formData = new FormData(form);
    const nameVal = formData.get('NAME');

    if (!nameVal) {
        alert("Sila masukkan NAMA Jemaah!");
        return;
    }

    let payloadFields = {};
    formData.forEach((val, key) => {
        if (key === 'NAME' || key === 'PASSPORT NO.') {
            payloadFields[key] = val ? val.toUpperCase().trim() : null;
        } else if (key === 'TRIP') {
            payloadFields[key] = val ? [val] : null;
        } else {
            payloadFields[key] = val === '' ? null : val;
        }
    });

    const saveBtn = document.getElementById('modalSaveBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Menambah...';

    try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: payloadFields })
        });

        if (response.ok) {
            const newRecord = await response.json();
            allJemaahUmrahRecords.unshift(newRecord);
            filterAndRenderJemaahGrid();
            closeExpandModal();
        } else {
            alert("Gagal menambah jemaah baharu.");
        }
    } catch (e) {
        console.error("Error creating jemaah:", e);
    } finally {
        if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-plus mr-1"></i> Tambah Jemaah';
    }
}

function initHeaderDragAndDrop() {
    let draggedCol = null;
    const headers = document.querySelectorAll('#jemaahTableHeaderRow th.draggable-header');

    headers.forEach(th => {
        th.addEventListener('dragstart', (e) => {
            draggedCol = th.getAttribute('data-col');
            e.dataTransfer.effectAllowed = 'move';
            th.classList.add('opacity-50');
        });

        th.addEventListener('dragend', () => {
            th.classList.remove('opacity-50');
            headers.forEach(h => h.classList.remove('drag-over'));
        });

        th.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            th.classList.add('drag-over');
        });

        th.addEventListener('dragleave', () => {
            th.classList.remove('drag-over');
        });

        th.addEventListener('drop', (e) => {
            e.preventDefault();
            th.classList.remove('drag-over');

            const targetCol = th.getAttribute('data-col');
            if (draggedCol && targetCol && draggedCol !== targetCol) {
                const fromIndex = columnOrder.indexOf(draggedCol);
                const toIndex = columnOrder.indexOf(targetCol);

                if (fromIndex !== -1 && toIndex !== -1) {
                    columnOrder.splice(fromIndex, 1);
                    columnOrder.splice(toIndex, 0, draggedCol);

                    localStorage.setItem('jemaahColOrder', JSON.stringify(columnOrder));

                    renderTableHeader();
                    filterAndRenderJemaahGrid();
                    initColumnResizers();
                    initHeaderDragAndDrop();
                }
            }
        });
    });
}

function toggleSortDropdown() {
    const drop = document.getElementById('sortDropdownMenu');
    if (drop) drop.classList.toggle('hidden');
}

function applySortSettings() {
    const fieldSel = document.getElementById('sortFieldSelect');
    const dirSel = document.getElementById('sortDirSelect');

    if (fieldSel && dirSel) {
        currentSortField = fieldSel.value;
        currentSortDir = dirSel.value;

        localStorage.setItem('jemaahSortSettings', JSON.stringify({
            field: currentSortField,
            dir: currentSortDir
        }));

        updateSortBtnLabel();
        toggleSortDropdown();
        filterAndRenderJemaahGrid();
    }
}

function updateSortBtnLabel() {
    const label = document.getElementById('sortBtnLabel');
    if (label) {
        label.textContent = `Sort: ${currentSortField} (${currentSortDir.toUpperCase()})`;
    }
}

function initColumnResizers() {
    injectResizerStyles();
    const headers = document.querySelectorAll('#jemaahTableHeaderRow th');

    headers.forEach(th => {
        const resizer = th.querySelector('.col-resizer');
        if (!resizer) return;

        let startX, startWidth, colClass;

        const classList = Array.from(th.classList);
        colClass = classList.find(c => c.startsWith('col-'));

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startX = e.pageX;
            startWidth = th.offsetWidth;
            resizer.classList.add('resizing');

            const onMouseMove = (e) => {
                const newWidth = Math.max(40, startWidth + (e.pageX - startX));
                if (colClass) {
                    columnWidths[colClass] = newWidth;
                    applySingleColumnWidth(colClass, newWidth);
                }
            };

            const onMouseUp = () => {
                resizer.classList.remove('resizing');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (colClass === 'col-idx') {
                    const idxWidth = columnWidths['col-idx'] || 55;
                    updateStickyNameLeftOffset(idxWidth);
                }

                localStorage.setItem('jemaahColWidths', JSON.stringify(columnWidths));
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}

function applySingleColumnWidth(colClass, width) {
    const elements = document.querySelectorAll(`.${colClass}`);
    elements.forEach(el => {
        el.style.width = `${width}px`;
        el.style.minWidth = `${width}px`;
        el.style.maxWidth = `${width}px`;
    });
}

function applySavedColumnWidths() {
    Object.keys(columnWidths).forEach(colClass => {
        applySingleColumnWidth(colClass, columnWidths[colClass]);
    });
    const idxWidth = columnWidths['col-idx'] || 55;
    updateStickyNameLeftOffset(idxWidth);
}

function updateStickyNameLeftOffset(idxWidth) {
    const nameCols = document.querySelectorAll('.col-name');
    nameCols.forEach(el => {
        el.style.left = `${idxWidth}px`;
    });
}

const columnDefinitions = [
    { key: 'col-name', label: 'NAME' },
    { key: 'col-picture', label: 'PICTURE' },
    { key: 'col-ic', label: 'IC NO.' },
    { key: 'col-passport', label: 'PASSPORT NO.' },
    { key: 'col-gender', label: 'GENDER' },
    { key: 'col-age', label: 'AGE' },
    { key: 'col-dob', label: 'DOB' },
    { key: 'col-dobf', label: 'DOB (FOREIGNER)' },
    { key: 'col-nat', label: 'NATIONALITY' },
    { key: 'col-visa', label: 'STATUS VISA' },
    { key: 'col-passcopy', label: 'PASSPORT COPY' },
    { key: 'col-visacopy', label: 'VISA COPY' },
    { key: 'col-mofabio', label: 'MOFABIO' },
    { key: 'col-fit', label: 'FIT TICKET' },
    { key: 'col-trip', label: 'TRIP' },
    { key: 'col-issue', label: 'DATE OF ISSUE' },
    { key: 'col-expire', label: 'DATE OF EXPIRE' },
    { key: 'col-notes', label: 'NOTES' }
];

function buildHideFieldsList() {
    const listContainer = document.getElementById('fieldsToggleList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    columnDefinitions.forEach(col => {
        const isHidden = hiddenColumns[col.key] || false;
        const item = document.createElement('label');
        item.className = "flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer select-none";
        item.innerHTML = `
            <input type="checkbox" ${!isHidden ? 'checked' : ''} onchange="toggleColumnVisibility('${col.key}', this.checked)" class="rounded text-brand-maroon focus:ring-brand-maroon w-3.5 h-3.5">
            <span class="text-slate-700 font-medium">${col.label}</span>
        `;
        listContainer.appendChild(item);
    });
}

function toggleHideFieldsDropdown() {
    const drop = document.getElementById('hideFieldsDropdown');
    if (drop) drop.classList.toggle('hidden');
}

function toggleColumnVisibility(colClass, isVisible) {
    hiddenColumns[colClass] = !isVisible;
    applyHiddenColumns();
}

function applyHiddenColumns() {
    columnDefinitions.forEach(col => {
        const elements = document.querySelectorAll(`.${col.key}`);
        const isHidden = hiddenColumns[col.key] || false;
        elements.forEach(el => {
            if (isHidden) {
                el.classList.add('hidden');
            } else {
                el.classList.remove('hidden');
            }
        });
    });
}

// 📦 Dapatkan Array Fail Attachment dari Airtable
function getAttachmentArray(attachmentField) {
    if (attachmentField && Array.isArray(attachmentField)) {
        return attachmentField;
    }
    return [];
}

// ==========================================
// 👁️ MODAL PREVIEW PDF & IMAGE (FIXED CLOSE & OUTSIDE CLICK)
// ==========================================

function openPreviewModal(fileUrl, title) {
    const modal = document.getElementById('attachmentPreviewModal');
    const imgEl = document.getElementById('previewImage');
    const pdfEl = document.getElementById('previewPdf');
    const titleEl = document.getElementById('previewTitle');
    const downloadBtn = document.getElementById('downloadAttachmentBtn');

    if (!modal || !fileUrl) {
        console.error("Modal atau URL fail tidak dijumpai!");
        return;
    }

    // Setkan Tajuk dan Pautan Muat Turun
    if (titleEl) titleEl.textContent = title || 'Pratonton Lampiran';
    if (downloadBtn) {
        downloadBtn.href = fileUrl;
        downloadBtn.setAttribute('download', title || 'fail_lampiran');
        downloadBtn.setAttribute('target', '_blank');
    }

    // Semak sama ada fail ini PDF atau Gambar
    const lowerUrl = fileUrl.toLowerCase();
    const lowerTitle = (title || '').toLowerCase();
    
    const isPdf = lowerUrl.endsWith('.pdf') || 
                  lowerTitle.endsWith('.pdf') || 
                  lowerUrl.includes('/pdf/') || 
                  lowerUrl.includes('application/pdf') ||
                  lowerUrl.includes('pdf');

    if (isPdf) {
        if (imgEl) {
            imgEl.src = '';
            imgEl.classList.add('hidden');
        }
        if (pdfEl) {
            pdfEl.src = fileUrl;
            pdfEl.classList.remove('hidden');
        }
    } else {
        if (pdfEl) {
            pdfEl.src = '';
            pdfEl.classList.add('hidden');
        }
        if (imgEl) {
            imgEl.src = fileUrl;
            imgEl.classList.remove('hidden');
        }
    }

    // Paparkan Modal
    modal.classList.remove('hidden');
}

/**
 * Menutup Modal Preview dan mengosongkan sumber fail
 */
function closePreviewModal() {
    const modal = document.getElementById('attachmentPreviewModal');
    const imgEl = document.getElementById('previewImage');
    const pdfEl = document.getElementById('previewPdf');

    // Resetkan src supaya fail/PDF berhenti dimuatkan
    if (pdfEl) pdfEl.src = '';
    if (imgEl) imgEl.src = '';

    if (modal) {
        modal.classList.add('hidden');
    }
}

// 🎯 TUTUP MODAL BILA KLIK LUAR KOTAK (CLICK OUTSIDE BACKDROP)
document.addEventListener('click', function (event) {
    const modal = document.getElementById('attachmentPreviewModal');
    const modalContainer = document.getElementById('previewModalContainer');

    // Jika modal sedang terbuka (tiada class hidden)
    if (modal && !modal.classList.contains('hidden')) {
        // Jika tempat yang diklik ialah background modal (di luar modalContainer)
        if (event.target === modal) {
            closePreviewModal();
        }
    }
});

// ⌨️ TUTUP MODAL BILA TEKAN KEKUNCI 'ESC'
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closePreviewModal();
    }
});

async function updateJemaahField(recId, fieldName, value) {
    try{
      if (typeof AIRTABLE_PAT === 'undefined' || !AIRTABLE_PAT) {
        AIRTABLE_PAT = window.AIRTABLE_PAT || localStorage.getItem('effah_api_pat') || window.DEFAULT_PAT || 'patjxZg6G22e9OBuS.2a96ced64af7e931ee4d83f65c491adf1241813547d5d8e3a317f5bc6d9a8de7';
        AIRTABLE_BASE_ID = window.AIRTABLE_BASE_ID || localStorage.getItem('effah_base_id') || window.DEFAULT_BASE_ID || 'appSsn4JyQD4DnYu0';
      }
    }catch(e){}

    let processedValue = value;
    if (typeof processedValue === 'string' && (fieldName === 'NAME' || fieldName === 'PASSPORT NO.')) {
        processedValue = processedValue.toUpperCase().trim();
    }

    const targetRec = allJemaahUmrahRecords.find(r => r.id === recId);
    if (targetRec) {
        targetRec.fields[fieldName] = (processedValue === '' || processedValue === undefined) ? null : processedValue;
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/DATA%20JEMAAH%20UMRAH/${recId}`;
    let fieldsData = {};
    fieldsData[fieldName] = (processedValue === '' || processedValue === undefined) ? null : processedValue;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: fieldsData })
        });

        if (response.ok) {
            const updatedRecord = await response.json();
            
            if (targetRec && updatedRecord.fields) {
                targetRec.fields['AGE'] = updatedRecord.fields['AGE'] || null;
                targetRec.fields['DOB'] = updatedRecord.fields['DOB'] || null;

                const ageCell = document.getElementById(`age-cell-${recId}`);
                const dobCell = document.getElementById(`dob-cell-${recId}`);

                if (ageCell) ageCell.textContent = updatedRecord.fields['AGE'] || '-';
                if (dobCell) dobCell.textContent = updatedRecord.fields['DOB'] || '-';
            }
        }
    } catch (err) {
        console.error("Error updating jemaah in Airtable:", err);
    }
}

function filterTripViewSidebar() {
    const query = document.getElementById('searchTripViewInput').value.toLowerCase();
    const buttons = document.querySelectorAll('#jemaahViewsSidebar button');
    
    buttons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes(query)) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
}

function filterJemaahTable() {
    filterAndRenderJemaahGrid();
}

// PATCH CSS FLOAT - ensure dropdowns float
(function(){
  const style=document.createElement('style');
  style.textContent=`
  #sortDropdownMenu, #hideFieldsPanel{position:absolute !important; right:0; top:42px; z-index:50;}
  #jemaahTripSidebar{max-height:calc(100vh - 100px);}
  #modul-maklumat-jemaah{overflow:auto;}
  `;
  document.head.appendChild(style);
})();


// ensure init called for new portal id
(function(){
  const origSwitch = window.Router && Router.switchTab ? Router.switchTab.bind(Router) : null;
  if(origSwitch){
    Router.switchTab = function(tabId,skip){
      origSwitch(tabId,skip);
      if(tabId==='maklumat-jemaah'){
        renderJemaahUmrahHTML();
        fetchJemaahUmrahData();
      }
    };
  }
  // auto render if already on that tab
  setTimeout(()=>{
    if(document.getElementById('modul-maklumat-jemaah') && !document.getElementById('modul-maklumat-jemaah').classList.contains('hidden')){
      renderJemaahUmrahHTML();
      fetchJemaahUmrahData();
    }
  },500);
})();


// PATCH V18: Robust PDF detection for Maklumat Jemaah
(function(){
  const _origOpen = window.openPreviewModal;
  window._jemaahOpenPreviewModal = function(url, title){
    const lowerUrl = (url||'').toLowerCase();
    const lowerTitle = (title||'').toLowerCase();
    let isPdf = lowerUrl.includes('.pdf') || lowerTitle.includes('.pdf');
    if(!isPdf){
      // If not image extension, treat as pdf if from Airtable docs
      const isImage = lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)/);
      if(!isImage && (lowerTitle.includes('visa') || lowerTitle.includes('passport') || lowerUrl.includes('airtable'))){
        // Check if url actually serves pdf by trying to see extension hint in filename param
        // For safety, if title has .pdf, force pdf
        if(lowerTitle.includes('.pdf')) isPdf = true;
      }
    }
    const modal = document.getElementById('attachmentPreviewModal');
    if(!modal){ window.open(url,'_blank'); return; }
    const img = document.getElementById('previewImage');
    const pdf = document.getElementById('previewPdf');
    const titleEl = document.getElementById('previewTitle');
    const dlBtn = document.getElementById('downloadAttachmentBtn');
    if(titleEl) titleEl.textContent = title || 'Preview';
    if(dlBtn) dlBtn.href = url;
    if(img){ img.classList.add('hidden'); img.src=''; }
    if(pdf){ pdf.classList.add('hidden'); pdf.src=''; }
    if(isPdf){
      if(pdf){ pdf.src = url; pdf.classList.remove('hidden'); }
    } else {
      if(img){ img.src = url; img.classList.remove('hidden'); }
    }
    modal.classList.remove('hidden');
    modal.style.display='flex';
  };
})();
