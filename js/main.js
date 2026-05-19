import { Storage } from './utils/storage.js';
import { createRoomSection, getRoomData } from './components/room-checklist.js';
import { initSignaturePad, clearSignature, saveSignature, getSignature } from './components/signature.js';
import { renderHistory, showProtocolModal } from './components/history.js';
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
          <h1 class="text-5xl font-semibold tracking-tight">Neues Reinigungsprotokoll</h1>
          <p class="text-xl text-slate-600 mt-1">Bitte füllen Sie alle Felder sorgfältig aus.</p>
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
            <h2 class="text-3xl font-semibold">Checkliste</h2>
            <p class="text-sm text-slate-500 mt-1">Tippe auf einen Bereich, um die Aufgaben zu sehen.</p>
          </div>
        </div>
        <div id="rooms-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <i class="fa-solid fa-box text-amber-500 text-2xl"></i>
          </div>
          <h2 class="text-3xl font-semibold">Vorräte &amp; Mängel</h2>
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

      <div class="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 bg-[#FF385C] bg-opacity-10 rounded-xl flex items-center justify-center">
            <i class="fa-solid fa-camera text-[#FF385C] text-2xl"></i>
          </div>
          <h2 class="text-3xl font-semibold">Foto-Dokumentation</h2>
        </div>
        <div onclick="document.getElementById('photos').click()" class="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-[#FF385C] transition-all">
          <i class="fa-solid fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
          <p class="font-medium">Foto auswählen oder aufnehmen</p>
          <p class="text-xs text-slate-500 mt-1">PNG, JPG bis 10MB</p>
        </div>
        <input type="file" id="photos" multiple accept="image/*" class="hidden">
        <div id="photo-preview" class="flex flex-wrap gap-3 mt-4"></div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div class="flex items-start gap-3 mb-6">
          <input type="checkbox" id="confirm" class="mt-1 w-5 h-5 accent-[#FF385C]">
          <label for="confirm" class="text-base text-slate-700">Ich bestätige, dass die Reinigung ordnungsgemäß abgeschlossen wurde.</label>
        </div>

        <button onclick="saveProtocol()" class="w-full py-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#FF385C]/30 transition-all active:scale-[0.985]">
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
    card.className = `bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-[#FF385C] active:scale-[0.985] transition-all`;
    card.innerHTML = `
      <div class="flex justify-between items-start mb-5">
        <div class="text-5xl">${getRoomIcon(key)}</div>
        <div class="text-right"><div class="text-xs text-slate-500">0/${room.tasks.length}</div></div>
      </div>
      <div class="font-semibold text-xl mb-1">${room.name}</div>
      <div class="text-sm text-slate-500">0 von ${room.tasks.length} erledigt</div>
    `;
    card.onclick = () => openRoomModal(key);
    grid.appendChild(card);
  });

  const suppliesContainer = document.getElementById('supplies');
  ['Kaffee','Seife','Klopapier','Spülmaschinentabs','Küchenrolle','Duschgel'].forEach(item => {
    const div = document.createElement('div');
    div.className = 'px-4 py-2 border border-slate-200 rounded-2xl text-sm flex items-center gap-2 cursor-pointer';
    div.innerHTML = `<input type="checkbox" class="accent-[#FF385C]"> <span>${item}</span>`;
    suppliesContainer.appendChild(div);
  });

  document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

function getRoomIcon(key) {
  const icons = { kitchen: '🍳', living: '🛋️', bedroom: '🛏️', bathroom: '🚰️', hallway: '🚪', balcony: '☀️', laundry: '🧺', cellar: '🛠️' };
  return icons[key] || '🏠';
}

function openRoomModal(roomKey) {
  const room = roomsData.de[roomKey];
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-[200]';
  modal.innerHTML = `
    <div class="bg-white w-full md:w-[520px] rounded-t-2xl md:rounded-2xl p-8 shadow-2xl">
      <div class="flex justify-between items-start mb-8">
        <div class="flex items-center gap-4">
          <div class="text-6xl">${getRoomIcon(roomKey)}</div>
          <div>
            <h3 class="text-2xl font-semibold">${room.name}</h3>
            <p class="text-sm text-slate-500">${room.tasks.length} Aufgaben</p>
          </div>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="text-3xl text-slate-400 hover:text-slate-600">&times;</button>
      </div>

      <div class="space-y-3 max-h-[55vh] overflow-auto pr-2" id="modal-tasks"></div>

      <div class="mt-8 flex gap-3">
        <button onclick="this.closest('.fixed').remove()" class="flex-1 py-3 border border-slate-300 rounded-xl font-semibold">Abbrechen</button>
        <button onclick="saveRoomTasks(this)" class="flex-1 py-3 bg-[#FF385C] text-white rounded-xl font-semibold">Speichern</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const container = modal.querySelector('#modal-tasks');
  room.tasks.forEach((task, i) => {
    const div = document.createElement('div');
    div.className = 'flex items-start gap-4 p-4 border border-slate-100 rounded-2xl';
    div.innerHTML = `
      <input type="checkbox" class="mt-1 w-5 h-5 accent-[#FF385C]" id="modal-${roomKey}-${i}">
      <div class="flex-1">
        <label for="modal-${roomKey}-${i}" class="cursor-pointer text-base text-slate-900">${task}</label>
        <input type="text" placeholder="Notiz (optional)" class="mt-2 w-full px-3 py-2 text-sm border border-slate-200 rounded-xl">
      </div>
    `;
    container.appendChild(div);
  });
}

function renderHistoryTab(container) {
  renderHistory(container, showProtocolModal, deleteProtocol);
}

function renderSettingsTab(container) {
  renderAdminSettings(container);
}

function deleteProtocol(id, element) {
  if (!confirm('Protokoll wirklich löschen?')) return;
  let p = Storage.get('superclean_protocols', []);
  p = p.filter(x => x.id !== id);
  Storage.set('superclean_protocols', p);
  element.remove();
  window.showToast('Protokoll gelöscht');
}

window.saveProtocol = function() {
  window.showToast('Protokoll erfolgreich gespeichert!');
};

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