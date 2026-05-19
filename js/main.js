import { Storage } from './utils/storage.js';
import { createRoomSection, getRoomData } from './components/room-checklist.js';
import { initSignaturePad, clearSignature, saveSignature, getSignature } from './components/signature.js';
import { renderHistory, showProtocolModal } from './components/history.js';
import { renderAdminSettings } from './components/settings.js';
import { roomsData } from './data/rooms.js';

window.showTab = function(tab) {
    const content = document.getElementById('main-content');
    content.innerHTML = '';

    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    const active = document.getElementById(`tab-${tab}`);
    if (active) active.classList.add('active');

    if (tab === 'protokoll') renderProtokoll(content);
    else if (tab === 'historie') renderHistoryTab(content);
    else if (tab === 'settings') renderSettingsTab(content);
};

function renderProtokoll(container) {
    container.innerHTML = `
        <div class="mb-8"><h1 class="text-4xl font-bold">Reinigungsprotokoll</h1><p class="text-slate-600 dark:text-slate-400">Für Airbnb & Ferienwohnungen</p></div>

        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 mb-8 border">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label class="block text-sm font-semibold mb-2">Objekt</label><select id="property-select" class="w-full px-4 py-3 border rounded-2xl bg-white dark:bg-slate-700"></select></div>
                <div><label class="block text-sm font-semibold mb-2">Reinigungskraft</label><input id="cleaner" value="Maria Schmidt" class="w-full px-4 py-3 border rounded-2xl bg-white dark:bg-slate-700"></div>
                <div><label class="block text-sm font-semibold mb-2">Datum</label><input id="date" type="date" class="w-full px-4 py-3 border rounded-2xl bg-white dark:bg-slate-700"></div>
            </div>
        </div>

        <div id="rooms-container"></div>

        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 mt-8 border">
            <h3 class="font-semibold text-xl mb-4">Unterschrift</h3>
            <canvas id="signature-canvas" width="600" height="180" class="signature-canvas w-full max-w-[600px]"></canvas>
            <div class="flex gap-3 mt-4">
                <button onclick="clearSignature()" class="px-6 py-2 border rounded-2xl">Löschen</button>
                <button onclick="saveSignature()" class="px-6 py-2 bg-[#FF385C] text-white rounded-2xl">Speichern</button>
            </div>
        </div>

        <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onclick="saveProtocol()" class="bg-[#FF385C] hover:bg-[#E31C5F] text-white py-4 rounded-3xl font-semibold">Protokoll speichern</button>
            <button onclick="generatePDF()" class="border border-[#FF385C] text-[#FF385C] py-4 rounded-3xl font-semibold">PDF</button>
            <button onclick="sendLiveEmail()" class="border border-slate-300 py-4 rounded-3xl font-semibold">Per E-Mail senden (SMTP)</button>
        </div>
    `;

    const props = Storage.get('superclean_properties', ['Musterstraße 12, 10115 Berlin']);
    const select = document.getElementById('property-select');
    props.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p; opt.textContent = p;
        select.appendChild(opt);
    });

    const roomsCont = document.getElementById('rooms-container');
    Object.keys(roomsData.de).forEach(key => {
        const sec = createRoomSection(key);
        if (sec) roomsCont.appendChild(sec);
    });

    setTimeout(() => initSignaturePad(), 100);
}

function renderHistoryTab(c) { renderHistory(c, showProtocolModal, deleteProtocol); }

function renderSettingsTab(container) {
    renderAdminSettings(container);
}

function deleteProtocol(id, el) {
    if (!confirm('Wirklich löschen?')) return;
    let p = Storage.get('superclean_protocols', []);
    p = p.filter(x => x.id !== id);
    Storage.set('superclean_protocols', p);
    el.remove();
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
    alert('Protokoll gespeichert!');
};

window.generatePDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('SuperClean Protokoll', 20, 20);
    doc.save('protokoll.pdf');
};

window.sendLiveEmail = async function() {
    const phpUrl = Storage.get('superclean_php_url', '');
    if (!phpUrl) { alert('Bitte PHP Sender URL in den Einstellungen eintragen!'); return; }

    const payload = {
        to: prompt('Empfänger E-Mail:'),
        subject: `Reinigungsprotokoll - ${document.getElementById('property-select').value}`,
        body: `Hallo,\n\nProtokoll für: ${document.getElementById('property-select').value}\nDatum: ${document.getElementById('date').value}\nReinigungskraft: ${document.getElementById('cleaner').value}\n\nViele Grüße\nSuperClean`,
        from: Storage.get('superclean_smtp_user', 'noreply@deine-domain.de'),
        smtp_host: Storage.get('superclean_smtp_host', ''),
        smtp_port: Storage.get('superclean_smtp_port', 587),
        smtp_user: Storage.get('superclean_smtp_user', ''),
        smtp_pass: Storage.get('superclean_smtp_pass', ''),
        smtp_encryption: Storage.get('superclean_smtp_enc', 'tls')
    };

    if (!payload.to) return;

    try {
        const res = await fetch(phpUrl, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        const result = await res.json();
        alert(result.success ? '✅ E-Mail erfolgreich versendet!' : 'Fehler: ' + (result.error || result.warning));
    } catch(e) {
        alert('Verbindung fehlgeschlagen. Bitte URL und SMTP-Daten prüfen.');
    }
};

(function init() {
    document.getElementById('nav-tabs').innerHTML = `
        <div onclick="window.showTab('protokoll')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer active" id="tab-protokoll"><i class="fa-solid fa-clipboard-list"></i> <span>Neues Protokoll</span></div>
        <div onclick="window.showTab('historie')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-historie"><i class="fa-solid fa-history"></i> <span>Historie</span></div>
        <div onclick="window.showTab('settings')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-settings"><i class="fa-solid fa-cog"></i> <span>Einstellungen</span></div>
        <div onclick="document.documentElement.classList.toggle('dark')" class="px-3 py-2.5 cursor-pointer"><i class="fa-solid fa-moon"></i></div>
    `;
    window.showTab('protokoll');
})();