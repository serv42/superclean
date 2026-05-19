import { Storage } from './utils/storage.js';
import { createRoomSection, getRoomData } from './components/room-checklist.js';
import { initSignaturePad, clearSignature, saveSignature, getSignature } from './components/signature.js';
import { renderHistory, showProtocolModal } from './components/history.js';
import { renderSettings } from './components/settings.js';

import { roomsData } from './data/rooms.js';

let currentTab = 'protokoll';

window.showTab = function(tab) {
    currentTab = tab;
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
            <h3 class="font-semibold text-xl mb-4">Unterschrift der Reinigungskraft</h3>
            <canvas id="signature-canvas" width="600" height="180" class="signature-canvas w-full max-w-[600px]"></canvas>
            <div class="flex gap-3 mt-4">
                <button onclick="clearSignature()" class="px-6 py-2 border rounded-2xl">Löschen</button>
                <button onclick="saveSignature()" class="px-6 py-2 bg-emerald-600 text-white rounded-2xl">Speichern</button>
            </div>
        </div>

        <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onclick="saveProtocol()" class="bg-emerald-600 text-white py-4 rounded-3xl font-semibold">Protokoll speichern</button>
            <button onclick="generatePDF()" class="border border-emerald-600 text-emerald-600 py-4 rounded-3xl font-semibold">PDF herunterladen</button>
            <button onclick="sendLiveEmail()" class="border border-slate-300 py-4 rounded-3xl font-semibold">Per E-Mail senden</button>
        </div>
    `;

    // Load properties
    const select = document.getElementById('property-select');
    const props = Storage.get('superclean_properties', ['Musterstraße 12, 10115 Berlin']);
    props.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p; opt.textContent = p;
        select.appendChild(opt);
    });

    // Render rooms
    const roomsCont = document.getElementById('rooms-container');
    Object.keys(roomsData.de).forEach(key => {
        const sec = createRoomSection(key);
        if (sec) roomsCont.appendChild(sec);
    });

    setTimeout(() => initSignaturePad(), 150);
}

function renderHistoryTab(container) {
    const listContainer = document.createElement('div');
    container.appendChild(listContainer);
    renderHistory(listContainer, showProtocolModal, deleteProtocol);
}

function renderSettingsTab(container) {
    renderSettings(container);
}

function deleteProtocol(id, element) {
    if (!confirm('Protokoll wirklich löschen?')) return;
    let protocols = Storage.get('superclean_protocols', []);
    protocols = protocols.filter(p => p.id !== id);
    Storage.set('superclean_protocols', protocols);
    element.remove();
}

window.saveProtocol = function() {
    const protocol = {
        id: Date.now(),
        property: document.getElementById('property-select').value,
        cleaner: document.getElementById('cleaner').value,
        date: document.getElementById('date').value,
        rooms: {},
        issues: document.getElementById('issues')?.value || '',
        signature: getSignature(),
        language: 'de',
        timestamp: new Date().toISOString()
    };

    Object.keys(roomsData.de).forEach(key => {
        protocol.rooms[key] = getRoomData(key);
    });

    let protocols = Storage.get('superclean_protocols', []);
    protocols.unshift(protocol);
    Storage.set('superclean_protocols', protocols);

    alert('Protokoll erfolgreich gespeichert!');
};

window.generatePDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('SuperClean Protokoll (Refactored)', 20, 20);
    doc.save('protokoll.pdf');
};

window.sendLiveEmail = async function() {
    const url = Storage.get('superclean_email_sender_url', '');
    if (!url) {
        alert('Bitte zuerst die E-Mail-Versand-URL in den Einstellungen eintragen!');
        return;
    }

    const protocol = {
        to: prompt('E-Mail-Adresse des Empfängers:'),
        subject: `Reinigungsprotokoll - ${document.getElementById('property-select').value}`,
        body: `Hallo,\n\nHier das Protokoll für ${document.getElementById('property-select').value} vom ${document.getElementById('date').value}.\n\nReinigungskraft: ${document.getElementById('cleaner').value}\n\nViele Grüße\nSuperClean Team`
    };

    if (!protocol.to) return;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(protocol)
        });
        const data = await res.json();
        if (data.success) {
            alert('E-Mail wurde erfolgreich versendet!');
        } else {
            alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
        }
    } catch (e) {
        alert('Verbindung zum Server fehlgeschlagen. Bitte URL überprüfen.');
    }
};

// Init
(function init() {
    const nav = document.getElementById('nav-tabs');
    nav.innerHTML = `
        <div onclick="window.showTab('protokoll')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer active" id="tab-protokoll">
            <i class="fa-solid fa-clipboard-list"></i> <span>Neues Protokoll</span>
        </div>
        <div onclick="window.showTab('historie')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-historie">
            <i class="fa-solid fa-history"></i> <span>Historie</span>
        </div>
        <div onclick="window.showTab('settings')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-settings">
            <i class="fa-solid fa-cog"></i> <span>Einstellungen</span>
        </div>
        <div onclick="document.documentElement.classList.toggle('dark')" class="px-3 py-2.5 cursor-pointer"><i class="fa-solid fa-moon"></i></div>
    `;

    window.showTab('protokoll');
})();