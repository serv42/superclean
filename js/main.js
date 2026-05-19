import { Storage } from './utils/storage.js';
import { createRoomSection, getRoomData } from './components/room-checklist.js';
import { initSignaturePad, clearSignature, saveSignature, getSignature } from './components/signature.js';
import { renderHistory } from './components/history.js';
import { renderAdminSettings } from './components/settings.js';
import { roomsData } from './data/rooms.js';

window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-20 right-6 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-[300] ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl"></i> <span class="font-medium">${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.3s ease'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2600);
};

let currentTab = 'protokoll';

window.showTab = function(tab) {
  currentTab = tab;
  const content = document.getElementById('main-content');
  content.innerHTML = '';

  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('text-[#FF385C]'));
  const activeNav = document.getElementById(`nav-${tab}`);
  if (activeNav) activeNav.classList.add('text-[#FF385C]');

  if (tab === 'protokoll') renderProtokollTab(content);
  else if (tab === 'historie') renderHistoryTab(content);
  else if (tab === 'settings') renderSettingsTab(content);
  else if (tab === 'logout') {
    if (confirm('Wirklich ausloggen?')) window.location.reload();
    else window.showTab('protokoll');
  }
};

function renderProtokollTab(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto pb-24 bg-white">
      <div class="flex items-center gap-4 mb-10">
        <div class="w-14 h-14 bg-[#FF385C] rounded-2xl flex items-center justify-center shadow-lg">
          <i class="fa-solid fa-broom text-white text-3xl"></i>
        </div>
        <div>
          <h1 class="text-5xl font-semibold tracking-tight text-slate-900">Neues Reinigungsprotokoll</h1>
          <p class="text-xl text-slate-700 mt-1">Bitte füllen Sie alle Felder sorgfältig aus.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Wohnung</label>
          <select id="property-select" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-base focus:outline-none focus:border-[#FF385C]"></select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Datum</label>
          <input id="date" type="date" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-base focus:outline-none focus:border-[#FF385C]">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Reinigungskraft</label>
          <input id="cleaner" value="Maria Schmidt" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-base focus:outline-none focus:border-[#FF385C]">
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-10 h-10 bg-[#FF385C] bg-opacity-10 rounded-xl flex items-center justify-center">
            <i class="fa-solid fa-clipboard-list text-[#FF385C] text-2xl"></i>
          </div>
          <div>
            <h2 class="text-3xl font-semibold text-slate-900">Checkliste</h2>
            <p class="text-sm text-slate-600 mt-1">Tippe auf einen Bereich, um die Aufgaben zu sehen.</p>
          </div>
        </div>
        <div id="rooms-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <i class="fa-solid fa-box text-amber-500 text-2xl"></i>
          </div>
          <h2 class="text-3xl font-semibold text-slate-900">Vorräte &amp; Mängel</h2>
        </div>

        <div class="mb-8">
          <p class="text-sm font-medium text-slate-700 mb-3">FEHLT ETWAS?</p>
          <div class="flex flex-wrap gap-2" id="supplies"></div>
        </div>

        <div>
          <p class="text-sm font-medium text-slate-700 mb-2">GIBT ES SCHÄDEN ODER BESONDERHEITEN?</p>
          <textarea id="issues" rows="4" placeholder="Keine Schäden vorhanden..." class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-base"></textarea>
        </div>
      </div>

      <!-- SIGNATURE PAD -->
      <div class="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 bg-[#FF385C] bg-opacity-10 rounded-xl flex items-center justify-center">
            <i class="fa-solid fa-signature text-[#FF385C] text-2xl"></i>
          </div>
          <h2 class="text-3xl font-semibold text-slate-900">Unterschrift der Reinigungskraft</h2>
        </div>
        
        <canvas id="signature-canvas" width="600" height="180" 
                class="border border-slate-300 rounded-2xl w-full max-w-[600px] mx-auto touch-none bg-white cursor-crosshair"></canvas>
        
        <div class="flex justify-center gap-3 mt-5">
          <button onclick="clearSignature()" 
                  class="px-6 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors">
            Löschen
          </button>
          <button onclick="saveSignature()" 
                  class="px-6 py-2 bg-[#FF385C] text-white rounded-xl hover:bg-[#E31C5F] transition-colors">
            Unterschrift speichern
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 bg-[#FF385C] bg-opacity-10 rounded-xl flex items-center justify-center">
            <i class="fa-solid fa-camera text-[#FF385C] text-2xl"></i>
          </div>
          <h2 class="text-3xl font-semibold text-slate-900">Foto-Dokumentation</h2>
        </div>
        <div onclick="document.getElementById('photos').click()" class="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-[#FF385C] transition-all">
          <i class="fa-solid fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
          <p class="font-medium text-slate-900">Foto auswählen oder aufnehmen</p>
          <p class="text-xs text-slate-600 mt-1">PNG, JPG bis 10MB</p>
        </div>
        <input type="file" id="photos" multiple accept="image/*" class="hidden">
        <div id="photo-preview" class="flex flex-wrap gap-3 mt-4"></div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div class="flex items-start gap-3 mb-6">
          <input type="checkbox" id="confirm" class="mt-1 w-5 h-5 accent-[#FF385C]">
          <label for="confirm" class="text-base text-slate-700">Ich bestätige, dass die Reinigung ordnungsgemäß abgeschlossen wurde.</label>
        </div>

        <button id="save-protocol-btn" class="w-full py-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#FF385C]/30 transition-all active:scale-[0.985]">
          <i class="fa-solid fa-paper-plane"></i>
          <span>Protokoll absenden</span>
        </button>
      </div>
    </div>
  `;

  const select = document.getElementById('property-select');
  Storage.get('superclean_properties', ['Musterstraße 12, 10115 Berlin']).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    select.appendChild(opt);
  });

  const grid = document.getElementById('rooms-grid');
  Object.keys(roomsData.de).forEach(key => {
    const room = roomsData.de[key];
    const card = document.createElement('div');
    card.className = `bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-[#FF385C] active:scale-[0.985] transition-all room-card`;
    
    const savedState = Storage.get(`room_${key}_state`, { checked: [] });
    const completedCount = savedState.checked.length;
    
    card.innerHTML = `
      <div class="flex justify-between items-start mb-5">
        <div class="text-5xl">${getRoomIcon(key)}</div>
        <div class="text-right">
          <div class="text-xs text-slate-500">${completedCount}/${room.tasks.length}</div>
        </div>
      </div>
      <div class="font-semibold text-xl text-slate-900 mb-1">${room.name}</div>
      <div class="text-sm text-slate-600">${completedCount} von ${room.tasks.length} erledigt</div>
    `;
    card.onclick = () => showRoomPage(key, card);
    grid.appendChild(card);
  });

  const suppliesContainer = document.getElementById('supplies');
  ['Kaffee','Seife','Klopapier','Spülmaschinentabs','Küchenrolle','Duschgel'].forEach(item => {
    const div = document.createElement('div');
    div.className = 'px-4 py-2 border border-slate-200 rounded-2xl text-sm flex items-center gap-2 cursor-pointer';
    div.innerHTML = `<input type="checkbox" class="accent-[#FF385C]"> <span>${item}</span>`;
    suppliesContainer.appendChild(div);
  });

  const saveBtn = document.getElementById('save-protocol-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveProtocol);
  }

  setTimeout(() => {
    initSignaturePad();
  }, 300);

  document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

function getRoomIcon(key) {
  const icons = { kitchen: '🍳', living: '🛋️', bedroom: '🛏️', bathroom: '🚰️', hallway: '🚪', balcony: '☀️', laundry: '🧺', cellar: '🛠️' };
  return icons[key] || '🏠';
}

let currentPage = null;
let currentRoomKey = null;
let currentCard = null;

function showRoomPage(roomKey, cardElement) {
  const room = roomsData.de[roomKey];
  currentRoomKey = roomKey;
  currentCard = cardElement;
  
  const savedState = Storage.get(`room_${roomKey}_state`, { checked: [], notes: {} });
  
  const page = document.createElement('div');
  page.className = 'fixed inset-0 bg-white z-[200] transform translate-x-full transition-transform duration-300 overflow-hidden';
  page.innerHTML = `
    <div class="max-w-4xl mx-auto h-full flex flex-col">
      <div class="flex items-center justify-between px-6 py-5 border-b sticky top-0 bg-white z-10 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button class="back-btn text-3xl text-slate-400 hover:text-slate-600 w-10 h-10 flex items-center justify-center">
            ←
          </button>
          <div class="flex items-center gap-4">
            <div class="text-6xl">${getRoomIcon(roomKey)}</div>
            <div>
              <h2 class="text-3xl font-semibold text-slate-900">${room.name}</h2>
              <p class="text-sm text-slate-600" id="task-counter">0/${room.tasks.length} erledigt</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4" id="page-tasks" style="padding-bottom: 120px;"></div>

      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 z-20">
        <button class="cancel-btn flex-1 py-4 border border-slate-300 rounded-2xl font-semibold">Abbrechen</button>
        <button class="save-btn flex-1 py-4 bg-[#FF385C] text-white rounded-2xl font-semibold">Speichern</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(page);
  currentPage = page;
  
  setTimeout(() => {
    page.style.transform = 'translateX(0)';
  }, 10);

  addSwipeBackGesture(page);

  const container = page.querySelector('#page-tasks');
  const counter = page.querySelector('#task-counter');
  
  let completedCount = savedState.checked.length;
  counter.textContent = `${completedCount}/${room.tasks.length} erledigt`;
  
  room.tasks.forEach((task, i) => {
    const div = document.createElement('div');
    div.className = 'flex items-start gap-4 p-4 border border-slate-100 rounded-2xl';
    div.innerHTML = `
      <input type="checkbox" class="mt-1 w-6 h-6 accent-[#FF385C]" id="page-${roomKey}-${i}">
      <div class="flex-1">
        <label for="page-${roomKey}-${i}" class="cursor-pointer text-lg text-slate-900">${task}</label>
        <input type="text" placeholder="Notiz (optional)" class="mt-2 w-full px-4 py-2 text-sm border border-slate-200 rounded-xl note-input" data-index="${i}">
      </div>
    `;
    
    const checkbox = div.querySelector('input[type="checkbox"]');
    const noteInput = div.querySelector('.note-input');
    
    if (savedState.checked.includes(i)) {
      checkbox.checked = true;
    }
    
    if (savedState.notes && savedState.notes[i]) {
      noteInput.value = savedState.notes[i];
    }
    
    checkbox.addEventListener('change', () => {
      const currentState = Storage.get(`room_${roomKey}_state`, { checked: [], notes: {} });
      
      if (checkbox.checked) {
        if (!currentState.checked.includes(i)) currentState.checked.push(i);
      } else {
        currentState.checked = currentState.checked.filter(idx => idx !== i);
      }
      
      Storage.set(`room_${roomKey}_state`, currentState);
      
      const newCount = currentState.checked.length;
      counter.textContent = `${newCount}/${room.tasks.length} erledigt`;
      
      if (currentCard) {
        const counterEl = currentCard.querySelector('.text-xs');
        if (counterEl) counterEl.textContent = `${newCount}/${room.tasks.length}`;
        const statusEl = currentCard.querySelector('.text-sm');
        if (statusEl) statusEl.textContent = `${newCount} von ${room.tasks.length} erledigt`;
      }
    });
    
    noteInput.addEventListener('blur', () => {
      const currentState = Storage.get(`room_${roomKey}_state`, { checked: [], notes: {} });
      if (!currentState.notes) currentState.notes = {};
      currentState.notes[i] = noteInput.value;
      Storage.set(`room_${roomKey}_state`, currentState);
    });
    
    container.appendChild(div);
  });

  const backBtn = page.querySelector('.back-btn');
  const cancelBtn = page.querySelector('.cancel-btn');
  const saveBtn = page.querySelector('.save-btn');

  const closeHandler = () => closeRoomPage(page);
  
  backBtn.addEventListener('click', closeHandler);
  cancelBtn.addEventListener('click', closeHandler);
  saveBtn.addEventListener('click', () => {
    window.showToast('Aufgaben gespeichert!');
    closeRoomPage(page);
  });
}

function addSwipeBackGesture(page) {
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  page.addEventListener('touchstart', (e) => {
    if (e.touches[0].clientX < 50) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }
  });

  page.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    if (diff > 0) {
      page.style.transform = `translateX(${diff}px)`;
      e.preventDefault();
    }
  });

  page.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    
    const diff = currentX - startX;
    
    if (diff > 120) {
      closeRoomPage(page);
    } else {
      page.style.transition = 'transform 0.2s ease';
      page.style.transform = 'translateX(0)';
      setTimeout(() => {
        page.style.transition = 'transform 0.3s ease';
      }, 200);
    }
  });
}

function closeRoomPage(page) {
  if (!page) return;
  page.style.transition = 'transform 0.3s ease';
  page.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (page.parentNode) page.parentNode.removeChild(page);
  }, 300);
}

function renderHistoryTab(container) {
  const protocols = Storage.get('superclean_protocols', []);
  
  let html = `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-semibold text-slate-900">Historie</h1>
          <p class="text-slate-600 mt-1">${protocols.length} gespeicherte Protokolle</p>
        </div>
        ${protocols.length > 0 ? `<button onclick="clearAllHistory()" class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium">Alle löschen</button>` : ''}
      </div>
      
      ${protocols.length === 0 ? `
        <div class="text-center py-16">
          <i class="fa-solid fa-history text-6xl text-slate-300 mb-6"></i>
          <h3 class="text-2xl font-semibold text-slate-700 mb-2">Noch keine Protokolle</h3>
          <p class="text-slate-500">Erstelle dein erstes Protokoll im "Protokoll" Tab</p>
        </div>
      ` : protocols.map((p, index) => `
        <div class="history-item bg-white border border-slate-200 rounded-2xl p-6 mb-4 hover:border-[#FF385C] transition-all cursor-pointer" data-index="${index}">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-2xl font-semibold text-slate-900">${p.property}</h3>
              <p class="text-sm text-slate-600">${p.date} • ${p.cleaner}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-slate-500">${Object.keys(p.rooms || {}).length} Räume</div>
              <div class="text-xs text-emerald-600 font-medium">${p.completedTasks || 0} Aufgaben erledigt</div>
            </div>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <i class="fa-solid fa-clock"></i>
            <span>${new Date(p.id).toLocaleDateString('de-DE')}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  container.innerHTML = html;
  
  const items = container.querySelectorAll('.history-item');
  items.forEach(item => {
    const index = parseInt(item.getAttribute('data-index'));
    item.addEventListener('click', () => showProtocolModal(index));
  });
}

function showProtocolModal(index) {
  const protocols = Storage.get('superclean_protocols', []);
  const p = protocols[index];
  if (!p) return;
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4';
  modal.innerHTML = `
    <div class="bg-white w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-3xl font-semibold text-slate-900">${p.property}</h2>
          <p class="text-slate-600">${p.date} • ${p.cleaner}</p>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="text-4xl text-slate-400 hover:text-slate-600">&times;</button>
      </div>
      
      <div class="space-y-6">
        ${Object.keys(p.rooms || {}).map(key => {
          const room = p.rooms[key];
          const roomData = roomsData.de[key];
          if (!roomData) return '';
          
          const completed = room.checked ? room.checked.length : 0;
          return `
            <div class="border border-slate-200 rounded-2xl p-5">
              <div class="flex items-center gap-4 mb-4">
                <div class="text-4xl">${getRoomIcon(key)}</div>
                <div class="flex-1">
                  <h4 class="font-semibold text-xl">${roomData.name}</h4>
                  <p class="text-sm text-emerald-600">${completed} von ${roomData.tasks.length} erledigt</p>
                </div>
              </div>
              
              ${room.notes && Object.keys(room.notes).length > 0 ? `
                <div class="mt-4 pt-4 border-t">
                  <p class="text-sm font-medium text-slate-700 mb-2">Notizen:</p>
                  ${Object.keys(room.notes).map(i => `
                    <div class="text-sm text-slate-600 mb-1">
                      • ${roomData.tasks[i]}: <span class="font-medium">${room.notes[i]}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="mt-8 flex gap-3">
        <button onclick="downloadProtocolPDF(${index}); this.closest('.fixed').remove()" class="flex-1 py-4 border border-[#FF385C] text-[#FF385C] rounded-2xl font-semibold">
          PDF herunterladen
        </button>
        <button onclick="deleteProtocol(${p.id}, this.closest('.fixed')); this.closest('.fixed').remove()" class="flex-1 py-4 border border-red-300 text-red-600 rounded-2xl font-semibold">
          Löschen
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function downloadProtocolPDF(index) {
  const protocols = Storage.get('superclean_protocols', []);
  const p = protocols[index];
  if (!p) return;
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(255, 56, 92);
  doc.text('SuperClean Protokoll', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text(`${p.property} • ${p.date}`, 20, 35);
  doc.text(`Reinigungskraft: ${p.cleaner}`, 20, 42);
  
  let y = 55;
  
  Object.keys(p.rooms || {}).forEach(key => {
    const room = p.rooms[key];
    const roomData = roomsData.de[key];
    if (!roomData) return;
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${roomData.name}`, 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${room.checked ? room.checked.length : 0} von ${roomData.tasks.length} Aufgaben erledigt`, 20, y);
    y += 10;
    
    if (room.notes) {
      Object.keys(room.notes).forEach(i => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`- ${roomData.tasks[i]}: ${room.notes[i]}`, 25, y);
        y += 7;
      });
    }
    
    y += 8;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });
  
  doc.save(`Protokoll_${p.property.replace(/\s+/g, '_')}.pdf`);
}

function clearAllHistory() {
  if (!confirm('Wirklich alle Protokolle löschen?')) return;
  Storage.set('superclean_protocols', []);
  renderHistoryTab(document.getElementById('main-content'));
  window.showToast('Alle Protokolle gelöscht');
}

function deleteProtocol(id, modal) {
  if (!confirm('Protokoll wirklich löschen?')) return;
  
  let protocols = Storage.get('superclean_protocols', []);
  protocols = protocols.filter(p => p.id !== id);
  Storage.set('superclean_protocols', protocols);
  
  if (modal) modal.remove();
  renderHistoryTab(document.getElementById('main-content'));
  window.showToast('Protokoll gelöscht');
}

// Expose all functions to global scope
window.showProtocolModal = showProtocolModal;
window.downloadProtocolPDF = downloadProtocolPDF;
window.deleteProtocol = deleteProtocol;
window.clearAllHistory = clearAllHistory;

function saveProtocol() {
  const data = {
    id: Date.now(),
    property: document.getElementById('property-select').value,
    cleaner: document.getElementById('cleaner').value,
    date: document.getElementById('date').value,
    rooms: {},
    completedTasks: 0,
    language: 'de'
  };
  
  let totalCompleted = 0;
  
  Object.keys(roomsData.de).forEach(key => {
    const savedState = Storage.get(`room_${key}_state`, { checked: [], notes: {} });
    data.rooms[key] = {
      checked: savedState.checked || [],
      notes: savedState.notes || {}
    };
    totalCompleted += (savedState.checked || []).length;
  });
  
  data.completedTasks = totalCompleted;
  
  let protocols = Storage.get('superclean_protocols', []);
  protocols.unshift(data);
  Storage.set('superclean_protocols', protocols);
  
  window.showToast('Protokoll erfolgreich gespeichert!');
  
  Object.keys(roomsData.de).forEach(key => {
    Storage.set(`room_${key}_state`, { checked: [], notes: {} });
  });
  
  setTimeout(() => {
    const content = document.getElementById('main-content');
    content.innerHTML = '';
    renderProtokollTab(content);
  }, 500);
}

window.generatePDF = function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(255, 56, 92);
  doc.text('SuperClean Protokoll', 20, 25);
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('Erstellt mit SuperClean • shadcn Style', 20, 35);
  doc.save('protokoll.pdf');
};

window.sendLiveEmail = function() {
  window.showToast('E-Mail-Funktion in Kürze verfügbar');
};

(function init() {
  const bottomNav = document.createElement('div');
  bottomNav.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-3 z-[100]';
  bottomNav.innerHTML = `
    <div onclick="window.showTab('protokoll')" id="nav-protokoll" class="bottom-nav-item flex flex-col items-center text-[#FF385C] cursor-pointer py-1">
      <i class="fa-solid fa-file-alt text-xl"></i>
      <span class="text-[10px] mt-1 font-medium">Protokoll</span>
    </div>
    <div onclick="window.showTab('historie')" id="nav-historie" class="bottom-nav-item flex flex-col items-center text-slate-500 cursor-pointer py-1">
      <i class="fa-solid fa-history text-xl"></i>
      <span class="text-[10px] mt-1 font-medium">Historie</span>
    </div>
    <div onclick="window.showTab('settings')" id="nav-settings" class="bottom-nav-item flex flex-col items-center text-slate-500 cursor-pointer py-1">
      <i class="fa-solid fa-cog text-xl"></i>
      <span class="text-[10px] mt-1 font-medium">Optionen</span>
    </div>
    <div onclick="window.showTab('logout')" id="nav-logout" class="bottom-nav-item flex flex-col items-center text-slate-500 cursor-pointer py-1">
      <i class="fa-solid fa-sign-out-alt text-xl"></i>
      <span class="text-[10px] mt-1 font-medium">Logout</span>
    </div>
  `;
  document.body.appendChild(bottomNav);

  window.showTab('protokoll');
})();