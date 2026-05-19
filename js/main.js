import { roomsData } from './data/rooms.js';
import { Storage } from './utils/storage.js';
import { createRoomSection, getRoomData } from './components/room-checklist.js';
import { initSignaturePad, clearSignature, saveSignature, getSignature } from './components/signature.js';

// Simple state
let currentTab = 'protokoll';
let savedProperties = Storage.get('superclean_properties', ["Musterstraße 12, 10115 Berlin"]);

// Main app initialization
function initApp() {
    renderNavbar();
    showTab('protokoll');
    
    // Set default date
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

function renderNavbar() {
    const nav = document.getElementById('nav-tabs');
    nav.innerHTML = `
        <div onclick="window.showTab('protokoll')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer active" id="tab-protokoll">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Neues Protokoll</span>
        </div>
        <div onclick="window.showTab('historie')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-historie">
            <i class="fa-solid fa-history"></i>
            <span>Historie</span>
        </div>
        <div onclick="window.showTab('settings')" class="nav-tab px-5 py-2.5 flex items-center gap-x-2 cursor-pointer" id="tab-settings">
            <i class="fa-solid fa-cog"></i>
            <span>Einstellungen</span>
        </div>
        <div onclick="toggleDarkMode()" class="px-3 py-2.5 cursor-pointer">
            <i class="fa-solid fa-moon" id="dark-icon"></i>
        </div>
    `;
}

window.showTab = function(tab) {
    currentTab = tab;
    const content = document.getElementById('main-content');
    content.innerHTML = '';

    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${tab}`);
    if (activeTab) activeTab.classList.add('active');

    if (tab === 'protokoll') renderProtokollTab(content);
    else if (tab === 'historie') renderHistoryTab(content);
    else if (tab === 'settings') renderSettingsTab(content);
};

function renderProtokollTab(container) {
    container.innerHTML = `
        <div class="mb-8">
            <h1 class="text-4xl font-bold">Reinigungsprotokoll</h1>
            <p class="text-slate-600 dark:text-slate-400">Für Airbnb & Ferienwohnungen</p>
        </div>

        <!-- Property & Info -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 mb-8 border">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-semibold mb-2">Objekt</label>
                    <select id="property-select" class="w-full px-4 py-3 border rounded-2xl bg-white dark:bg-slate-700"></select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-2">Reinigungskraft</label>
                    <input id="cleaner" type="text" value="Maria Schmidt" class="w-full px-4 py-3 border rounded-2xl bg-white dark:bg-slate-700">
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-2">Datum</label>
                    <input id="date" type="date" class="w-full px-4 py-3 border rounded-2xl bg-white dark:bg-slate-700">
                </div>
            </div>
        </div>

        <!-- Rooms -->
        <div id="rooms-container"></div>

        <!-- Signature -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 mt-8 border">
            <h3 class="font-semibold text-xl mb-4">Unterschrift</h3>
            <canvas id="signature-canvas" width="600" height="180" class="signature-canvas w-full max-w-[600px]"></canvas>
            <div class="flex gap-3 mt-4">
                <button onclick="clearSignature()" class="px-6 py-2 border rounded-2xl">Löschen</button>
                <button onclick="saveSignature()" class="px-6 py-2 bg-emerald-600 text-white rounded-2xl">Speichern</button>
            </div>
        </div>

        <div class="mt-8 flex gap-4">
            <button onclick="saveProtocol()" class="flex-1 bg-emerald-600 text-white py-4 rounded-3xl font-semibold">Protokoll speichern</button>
            <button onclick="generatePDF()" class="flex-1 border border-emerald-600 text-emerald-600 py-4 rounded-3xl font-semibold">PDF</button>
        </div>
    `;

    // Load properties
    const select = document.getElementById('property-select');
    savedProperties.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });

    // Render rooms
    const roomsContainer = document.getElementById('rooms-container');
    Object.keys(roomsData.de).forEach(key => {
        const section = createRoomSection(key);
        if (section) roomsContainer.appendChild(section);
    });

    // Init signature
    setTimeout(() => {
        initSignaturePad();
    }, 100);
}

// Placeholder functions for other tabs
function renderHistoryTab(container) {
    container.innerHTML = `<div class="text-center py-20"><i class="fa-solid fa-history text-6xl text-slate-300"></i><p class="mt-4 text-xl">Historie wird in Kürze als Komponente geladen...</p></div>`;
}

function renderSettingsTab(container) {
    container.innerHTML = `<div class="text-center py-20"><i class="fa-solid fa-cog text-6xl text-slate-300"></i><p class="mt-4 text-xl">Einstellungen (Admin) als Komponente</p></div>`;
}

// Global functions for buttons
window.saveProtocol = function() {
    alert('Protokoll gespeichert! (Demo - volle Logik in nächster Iteration)') ;
};

window.generatePDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('SuperClean Protokoll - Refactored Version', 20, 20);
    doc.save('protokoll.pdf');
};

window.clearSignature = clearSignature;
window.saveSignature = saveSignature;

// Dark mode toggle
window.toggleDarkMode = function() {
    document.documentElement.classList.toggle('dark');
};

// Boot app
initApp();