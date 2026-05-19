import { Storage } from './utils/storage.js';
import { createRoomSection, getRoomData } from './components/room-checklist.js';
import { initSignaturePad, clearSignature, saveSignature, getSignature } from './components/signature.js';
import { renderHistory, showProtocolModal } from './components/history.js';
import { renderAdminSettings } from './components/settings.js';
import { roomsData } from './data/rooms.js';

// Toast Notification System
window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[300] toast ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
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
    <div class="mb-10">
      <div class="flex items-center gap-4 mb-3">
        <div class="w-14 h-14 bg-[#FF385C] rounded-3xl flex items-center justify-center shadow-lg">
          <i class="fa-solid fa-broom text-white text-3xl"></i>
        </div>
        <div>
          <h1 class="text-5xl font-bold tracking-tight">Reinigungsprotokoll</h1>
          <p class="text-xl text-slate-600 dark:text-slate-400 mt-1">Airbnb & Ferienwohnungen • 2026</p>
        </div>
      </div>
    </div>

    <!-- Property Card -->
    <div class="glass rounded-3xl p-8 mb-8 border border-white/20 shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Objekt</label>
          <select id="property-select" class="w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-[#FF385C]"></select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Reinigungskraft</label>
          <input id="cleaner" value="Maria Schmidt" class="w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-[#FF385C]">
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Datum</label>
          <input id="date" type="date" class="w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:border-[#FF385C]">
        </div>
      </div>
    </div>

    <div id="rooms-container" class="space-y-6"></div>

    <!-- Signature -->
    <div class="glass rounded-3xl p-8 mt-8 border border-white/20 shadow-xl">
      <div class="flex items-center gap-3 mb-5">
        <i class="fa-solid fa-signature text-[#FF385C] text-2xl"></i>
        <h3 class="font-semibold text-xl">Unterschrift der Reinigungskraft</h3>
      </div>
      <canvas id="signature-canvas" width="600" height="180" class="signature-canvas w-full max-w-[600px] mx-auto touch-none"></canvas>
      <div class="flex justify-center gap-3 mt-5">
        <button onclick="clearSignature()" class="px-8 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Löschen</button>
        <button onclick="saveSignature()" class="px-8 py-3 bg-[#FF385C] text-white rounded-2xl hover:bg-[#E31C5F] transition-colors">Unterschrift speichern</button>
      </div>
    </div>

    <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button onclick="saveProtocol()" class="bg-[#FF385C] hover:bg-[#E31C5F] text-white py-4 rounded-3xl font-semibold text-lg shadow-lg shadow-[#FF385C]/30 transition-all active:scale-[0.985]">Protokoll speichern</button>
      <button onclick="generatePDF()" class="border border-[#FF385C] text-[#FF385C] hover:bg-[#FF385C] hover:text-white py-4 rounded-3xl font-semibold text-lg transition-all">PDF herunterladen</button>
      <button onclick="sendLiveEmail()" class="border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 py-4 rounded-3xl font-semibold text-lg transition-all">Per E-Mail senden</button>
    </div>
  `;

  // Load properties
  const select = document.getElementById('property-select');
  const props = Storage.get('superclean_properties', ['Musterstraße 12, 10115 Berlin']);
  props.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });

  // Render rooms with modern cards
  const roomsContainer = document.getElementById('rooms-container');
  Object.keys(roomsData.de).forEach(key => {
    const section = createRoomSection(key);
    if (section) roomsContainer.appendChild(section);
  });

  setTimeout(() => {
    initSignaturePad();
  }, 150);
}

function renderHistoryTab(container) {
  renderHistory(container, showProtocolModal, deleteProtocol);
}

function renderSettingsTab(container) {
  renderAdminSettings(container);
}

function deleteProtocol(id, element) {
  if (!confirm('Protokoll wirklich löschen?')) return;
  let protocols = Storage.get('superclean_protocols', []);
  protocols = protocols.filter(p => p.id !== id);
  Storage.set('superclean_protocols', protocols);
  element.remove();
  window.showToast('Protokoll gelöscht');
}

window.saveProtocol = function() {
  const data = {
    id: Date.now(),
    property: document.getElementById('property-select').value,
    cleaner: document.getElementById('cleaner').value,
    date: document.getElementById('date').value,
    rooms: {},
    issues: document.getElementById('issues')?.value || '',
    signature: getSignature(),
    language: 'de'
  };
  Object.keys(roomsData.de).forEach(k => data.rooms[k] = getRoomData(k));

  let protocols = Storage.get('superclean_protocols', []);
  protocols.unshift(data);
  Storage.set('superclean_protocols', protocols);

  window.showToast('Protokoll erfolgreich gespeichert!');
};

window.generatePDF = function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(255, 56, 92);
  doc.text('SuperClean Protokoll', 20, 25);
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text('Erstellt mit SuperClean • 2026', 20, 35);
  doc.save('protokoll.pdf');
  window.showToast('PDF wird heruntergeladen...');
};

window.sendLiveEmail = async function() {
  const phpUrl = Storage.get('superclean_php_url', '');
  if (!phpUrl) {
    window.showToast('Bitte zuerst die PHP-URL in den Einstellungen eintragen!', 'error');
    return;
  }

  const payload = {
    to: prompt('Empfänger-E-Mail-Adresse:'),
    subject: `Reinigungsprotokoll - ${document.getElementById('property-select').value}`,
    body: `Hallo,\n\nHier das Protokoll für ${document.getElementById('property-select').value} vom ${document.getElementById('date').value}.\n\nReinigungskraft: ${document.getElementById('cleaner').value}\n\nViele Grüße\nSuperClean Team`,
    from: Storage.get('superclean_smtp_user', 'noreply@deine-domain.de'),
    smtp_host: Storage.get('superclean_smtp_host', ''),
    smtp_port: Storage.get('superclean_smtp_port', 587),
    smtp_user: Storage.get('superclean_smtp_user', ''),
    smtp_pass: Storage.get('superclean_smtp_pass', ''),
    smtp_encryption: Storage.get('superclean_smtp_enc', 'tls')
  };

  if (!payload.to) return;

  try {
    const res = await fetch(phpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      window.showToast('E-Mail wurde erfolgreich versendet!');
    } else {
      window.showToast(result.error || 'Fehler beim Versenden', 'error');
    }
  } catch (e) {
    window.showToast('Verbindung fehlgeschlagen', 'error');
  }
};

(function init() {
  document.getElementById('nav-tabs').innerHTML = `
    <div onclick="window.showTab('protokoll')" class="nav-tab px-6 py-3 flex items-center gap-x-3 cursor-pointer active" id="tab-protokoll">
      <i class="fa-solid fa-clipboard-list text-lg"></i> <span class="font-medium">Protokoll</span>
    </div>
    <div onclick="window.showTab('historie')" class="nav-tab px-6 py-3 flex items-center gap-x-3 cursor-pointer" id="tab-historie">
      <i class="fa-solid fa-history text-lg"></i> <span class="font-medium">Historie</span>
    </div>
    <div onclick="window.showTab('settings')" class="nav-tab px-6 py-3 flex items-center gap-x-3 cursor-pointer" id="tab-settings">
      <i class="fa-solid fa-cog text-lg"></i> <span class="font-medium">Einstellungen</span>
    </div>
    <div onclick="document.documentElement.classList.toggle('dark')" class="px-4 py-3 cursor-pointer text-xl">
      <i class="fa-solid fa-moon"></i>
    </div>
  `;

  window.showTab('protokoll');
})();