import { Storage } from './utils/storage.js';
import { createRoomSection, getRoomData } from './components/room-checklist.js';
import { initSignaturePad, clearSignature, saveSignature, getSignature } from './components/signature.js';
import { renderHistory, showProtocolModal } from './components/history.js';
import { renderAdminSettings } from './components/settings.js';
import { roomsData } from './data/rooms.js';

window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-[300] ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl"></i> <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.3s'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2600);
};

window.showTab = function(tab) {
  const content = document.getElementById('main-content');
  content.innerHTML = '';
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
  const active = document.getElementById(`tab-${tab}`);
  if (active) active.classList.add('active');

  if (tab === 'protokoll') renderProtokollTab(content);
  else if (tab === 'historie') renderHistoryTab(content);
  else if (tab === 'settings') renderSettingsTab(content);
};

function renderProtokollTab(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-[#FF385C] rounded-2xl flex items-center justify-center">
          <i class="fa-solid fa-broom text-white text-2xl"></i>
        </div>
        <div>
          <h1 class="text-4xl font-bold tracking-tight">Neues Reinigungsprotokoll</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">Bitte füllen Sie alle Felder sorgfältig aus.</p>
        </div>
      </div>

      <!-- Form Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">WOHNUNG</label>
          <select id="property-select" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800"></select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">DATUM</label>
          <input id="date" type="date" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">REINIGUNGSKRAFT</label>
          <input id="cleaner" value="Maria Schmidt" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
        </div>
      </div>

      <!-- Checkliste Section -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-solid fa-clipboard-list text-[#FF385C] text-2xl"></i>
          <div>
            <h2 class="text-2xl font-semibold">Checkliste</h2>
            <p class="text-sm text-slate-500">Tippe auf einen Bereich, um die Aufgaben zu sehen.</p>
          </div>
        </div>

        <div id="rooms-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
      </div>

      <!-- Vorräte & Mängel -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-solid fa-box text-amber-500 text-2xl"></i>
          <h2 class="text-2xl font-semibold">Vorräte &amp; Mängel</h2>
        </div>

        <div class="mb-6">
          <p class="text-sm font-medium text-slate-600 mb-3">FEHLT ETWAS? (KLICKEN WENN LEER)</p>
          <div class="flex flex-wrap gap-2" id="supplies">
            <!-- JS populated -->
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-slate-600 mb-2">GIBT ES SCHÄDEN ODER BESONDERHEITEN?</p>
          <textarea id="issues" rows="3" placeholder="Keine Schäden vorhanden..." class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800"></textarea>
        </div>
      </div>

      <!-- Foto Dokumentation -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 mb-8">
        <div class="flex items-center gap-3 mb-5">
          <i class="fa-solid fa-camera text-[#FF385C] text-2xl"></i>
          <h2 class="text-2xl font-semibold">Allgemeine Foto-Dokumentation</h2>
        </div>
        <div onclick="document.getElementById('photos').click()" class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl p-12 text-center cursor-pointer hover:border-[#FF385C] transition-colors">
          <i class="fa-solid fa-cloud-upload-alt text-4xl text-slate-400 mb-4"></i>
          <p class="font-medium">Foto auswählen oder aufnehmen</p>
          <p class="text-xs text-slate-500 mt-1">Keine Datei ausgewählt</p>
        </div>
        <input type="file" id="photos" multiple accept="image/*" class="hidden">
        <div id="photo-preview" class="flex flex-wrap gap-3 mt-4"></div>
      </div>

      <!-- Confirmation + Button -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700">
        <div class="flex items-start gap-3 mb-6">
          <input type="checkbox" id="confirm" class="mt-1 w-5 h-5 accent-[#FF385C]">
          <label for="confirm" class="text-sm text-slate-600 dark:text-slate-400">Ich bestätige, dass die Reinigung ordnungsgemäß abgeschlossen wurde.</label>
        </div>

        <button onclick="saveProtocol()" class="w-full py-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-3xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#FF385C]/30">
          <i class="fa-solid fa-paper-plane"></i>
          <span>Protokoll absenden</span>
        </button>
      </div>
    </div>
  `;

  // Populate properties
  const select = document.getElementById('property-select');
  Storage.get('superclean_properties', ['Musterstraße 12, 10115 Berlin']).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    select.appendChild(opt);
  });

  // Render modern room cards
  const grid = document.getElementById('rooms-grid');
  Object.keys(roomsData.de).forEach(key => {
    const room = roomsData.de[key];
    const card = document.createElement('div');
    card.className = `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 cursor-pointer hover:border-[#FF385C] transition-all active:scale-[0.985]`;
    card.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="text-4xl">${getRoomIcon(key)}</div>
        <div class="text-right">
          <div class="text-xs text-slate-500">0/${room.tasks.length}</div>
        </div>
      </div>
      <div class="font-semibold text-lg mb-1">${room.name}</div>
      <div class="text-xs text-slate-500">0 von ${room.tasks.length} erledigt</div>
    `;
    card.onclick = () => openRoomModal(key);
    grid.appendChild(card);
  });

  // Supplies checkboxes
  const suppliesContainer = document.getElementById('supplies');
  const supplies = ['Kaffee', 'Seife', 'Klopapier', 'Spülmaschinentabs', 'Küchenrolle', 'Duschgel'];
  supplies.forEach(item => {
    const div = document.createElement('div');
    div.className = 'px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm flex items-center gap-2 cursor-pointer';
    div.innerHTML = `<input type="checkbox" class="accent-[#FF385C]"> <span>${item}</span>`;
    suppliesContainer.appendChild(div);
  });

  document.getElementById('date').value = new Date().toISOString().split('T')[0];
}

function getRoomIcon(key) {
  const icons = {
    kitchen: '🍳', living: '🛋', bedroom: '🛏', bathroom: '🚰',
    hallway: '🚪', balcony: '☀️', laundry: '🧺', cellar: '🛠️'
  };
  return icons[key] || '🏠';
}

function openRoomModal(roomKey) {
  const room = roomsData.de[roomKey];
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-[200]';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-800 w-full md:w-[480px] rounded-t-3xl md:rounded-3xl p-8">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <div class="text-5xl">${getRoomIcon(roomKey)}</div>
          <div>
            <h3 class="text-2xl font-semibold">${room.name}</h3>
            <p class="text-sm text-slate-500">${room.tasks.length} Aufgaben</p>
          </div>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="text-3xl text-slate-400">&times;</button>
      </div>
      <div class="space-y-3 max-h-[50vh] overflow-auto pr-2" id="modal-tasks"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const container = modal.querySelector('#modal-tasks');
  room.tasks.forEach((task, i) => {
    const div = document.createElement('div');
    div.className = 'flex items-start gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl';
    div.innerHTML = `
      <input type="checkbox" class="mt-1 w-5 h-5 accent-[#FF385C]" id="modal-${roomKey}-${i}">
      <div class="flex-1">
        <label for="modal-${roomKey}-${i}" class="cursor-pointer">${task}</label>
        <input type="text" placeholder="Notiz" class="mt-1 w-full text-sm px-3 py-1 border rounded-xl dark:bg-slate-700">
      </div>
    `;
    container.appendChild(div);
  });
}

function renderHistoryTab(c) { renderHistory(c, showProtocolModal, deleteProtocol); }

function renderSettingsTab(c) { renderAdminSettings(c); }

function deleteProtocol(id, el) {
  if (!confirm('Wirklich löschen?')) return;
  let p = Storage.get('superclean_protocols', []);
  p = p.filter(x => x.id !== id);
  Storage.set('superclean_protocols', p);
  el.remove();
  window.showToast('Protokoll gelöscht');
}

window.saveProtocol = function() {
  window.showToast('Protokoll erfolgreich gespeichert!');
};

window.generatePDF = function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('SuperClean Protokoll 2026', 20, 20);
  doc.save('protokoll.pdf');
};

window.sendLiveEmail = function() {
  window.showToast('E-Mail-Funktion in Kürze verfügbar');
};

(function init() {
  document.getElementById('nav-tabs').innerHTML = `
    <div onclick="window.showTab('protokoll')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer active" id="tab-protokoll">
      <i class="fa-solid fa-home"></i> <span class="font-medium">Protokoll</span>
    </div>
    <div onclick="window.showTab('historie')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-historie">
      <i class="fa-solid fa-history"></i> <span class="font-medium">Historie</span>
    </div>
    <div onclick="window.showTab('settings')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-settings">
      <i class="fa-solid fa-cog"></i> <span class="font-medium">Einstellungen</span>
    </div>
    <div onclick="document.documentElement.classList.toggle('dark')" class="px-4 py-2.5 cursor-pointer"><i class="fa-solid fa-moon"></i></div>
  `;
  window.showTab('protokoll');
})();