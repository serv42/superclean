import { Storage } from '../utils/storage.js';

export function renderSettings(container) {
    container.innerHTML = `
        <div class="max-w-2xl">
            <h1 class="text-4xl font-bold mb-2">Einstellungen</h1>
            <p class="text-slate-600 dark:text-slate-400 mb-8">Admin-Bereich • PIN: 12351235</p>

            <div class="bg-white dark:bg-slate-800 rounded-3xl border p-8">
                <div class="mb-6">
                    <label class="font-semibold">Admin-PIN</label>
                    <div class="flex gap-3 mt-2">
                        <input id="admin-pin" type="password" placeholder="PIN eingeben" class="flex-1 px-4 py-3 border rounded-2xl">
                        <button onclick="unlockAdminSettings()" class="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-medium">Entsperren</button>
                    </div>
                </div>

                <div id="admin-panel" class="hidden space-y-8">
                    <!-- Company Name -->
                    <div>
                        <label class="font-semibold">Firmenname</label>
                        <input id="company-name" class="w-full px-4 py-3 border rounded-2xl mt-2" value="SuperClean Pro">
                    </div>

                    <!-- Email Sender URL -->
                    <div>
                        <label class="font-semibold">Live E-Mail Versand URL</label>
                        <input id="email-sender-url" placeholder="https://deine-domain.de/php-helper/sender.php" class="w-full px-4 py-3 border rounded-2xl mt-2 text-sm">
                        <p class="text-xs text-slate-500 mt-1">URL zu deiner sender.php (siehe php-helper/README.md)</p>
                    </div>

                    <!-- Properties -->
                    <div>
                        <label class="font-semibold">Gespeicherte Objekte</label>
                        <div id="admin-properties-list" class="mt-2 space-y-2"></div>
                        <div class="flex gap-2 mt-3">
                            <input id="new-prop" placeholder="Neues Objekt" class="flex-1 px-4 py-2 border rounded-2xl">
                            <button onclick="addPropertyFromSettings()" class="px-6 py-2 bg-emerald-600 text-white rounded-2xl">+</button>
                        </div>
                    </div>

                    <button onclick="saveAllSettings()" class="w-full py-3 bg-emerald-600 text-white rounded-3xl font-semibold mt-4">Alle Einstellungen speichern</button>
                </div>
            </div>
        </div>
    `;

    // Load saved values
    const urlInput = document.getElementById('email-sender-url');
    const savedUrl = Storage.get('superclean_email_sender_url', '');
    if (urlInput && savedUrl) urlInput.value = savedUrl;

    window.unlockAdminSettings = function() {
        const pin = document.getElementById('admin-pin').value;
        if (pin === '12351235') {
            document.getElementById('admin-panel').classList.remove('hidden');
            loadPropertiesList();
        } else {
            alert('Falsche PIN!');
        }
    };

    window.addPropertyFromSettings = function() {
        const input = document.getElementById('new-prop');
        if (!input.value.trim()) return;
        let props = Storage.get('superclean_properties', []);
        props.push(input.value.trim());
        Storage.set('superclean_properties', props);
        loadPropertiesList();
        input.value = '';
    };

    window.saveAllSettings = function() {
        const url = document.getElementById('email-sender-url').value.trim();
        Storage.set('superclean_email_sender_url', url);
        const company = document.getElementById('company-name').value;
        Storage.set('superclean_company', company);
        alert('Einstellungen gespeichert!');
    };

    function loadPropertiesList() {
        const container = document.getElementById('admin-properties-list');
        container.innerHTML = '';
        const props = Storage.get('superclean_properties', []);
        props.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-2xl';
            div.innerHTML = `<span>${p}</span><button class="text-red-500 px-3" onclick="removeProperty(${i})"><i class="fa-solid fa-trash"></i></button>`;
            container.appendChild(div);
        });
    }

    window.removeProperty = function(index) {
        let props = Storage.get('superclean_properties', []);
        props.splice(index, 1);
        Storage.set('superclean_properties', props);
        loadPropertiesList();
    };
}