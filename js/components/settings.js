import { Storage } from '../utils/storage.js';

export function renderAdminSettings(container) {
    container.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-4xl font-bold mb-2">Einstellungen</h1>
            <p class="text-slate-600 dark:text-slate-400 mb-8">Admin-Bereich • PIN: 12351235</p>

            <div class="bg-white dark:bg-slate-800 rounded-3xl border p-8">
                <div class="mb-8">
                    <label class="font-semibold block mb-2">Admin-PIN</label>
                    <div class="flex gap-3">
                        <input id="admin-pin" type="password" placeholder="PIN eingeben" class="flex-1 px-4 py-3 border rounded-2xl">
                        <button onclick="unlockAdmin()" class="px-8 py-3 bg-[#FF385C] text-white rounded-2xl font-medium">Entsperren</button>
                    </div>
                </div>

                <div id="admin-content" class="hidden space-y-8">
                    <div>
                        <label class="font-semibold">Firmenname</label>
                        <input id="company-name" class="w-full px-4 py-3 border rounded-2xl mt-2" value="SuperClean Pro">
                    </div>

                    <div>
                        <label class="font-semibold">PHP Sender URL</label>
                        <input id="php-sender-url" placeholder="https://deine-domain.de/php-helper/sender.php" class="w-full px-4 py-3 border rounded-2xl mt-2">
                        <p class="text-xs text-slate-500 mt-1">URL zu deiner sender.php</p>
                    </div>

                    <div class="border-t pt-6">
                        <h3 class="font-semibold mb-4 flex items-center gap-x-2">
                            <i class="fa-solid fa-server"></i> <span>SMTP Einstellungen (empfohlen)</span>
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="text-sm">SMTP Host</label>
                                <input id="smtp-host" placeholder="smtp.gmail.com" class="w-full px-4 py-2.5 border rounded-2xl mt-1 text-sm">
                            </div>
                            <div>
                                <label class="text-sm">Port</label>
                                <input id="smtp-port" placeholder="587" class="w-full px-4 py-2.5 border rounded-2xl mt-1 text-sm">
                            </div>
                            <div>
                                <label class="text-sm">Benutzername</label>
                                <input id="smtp-user" placeholder="deine@email.de" class="w-full px-4 py-2.5 border rounded-2xl mt-1 text-sm">
                            </div>
                            <div>
                                <label class="text-sm">Passwort / App-Passwort</label>
                                <input id="smtp-pass" type="password" placeholder="••••••••" class="w-full px-4 py-2.5 border rounded-2xl mt-1 text-sm">
                            </div>
                            <div class="md:col-span-2">
                                <label class="text-sm">Verschlüsselung</label>
                                <select id="smtp-encryption" class="w-full px-4 py-2.5 border rounded-2xl mt-1 text-sm">
                                    <option value="tls">TLS (empfohlen)</option>
                                    <option value="ssl">SSL</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button onclick="saveSettings()" class="w-full py-3.5 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-3xl font-semibold mt-6">Einstellungen speichern</button>
                </div>
            </div>
        </div>
    `;

    const saved = {
        url: Storage.get('superclean_php_url', ''),
        host: Storage.get('superclean_smtp_host', ''),
        port: Storage.get('superclean_smtp_port', '587'),
        user: Storage.get('superclean_smtp_user', ''),
        pass: Storage.get('superclean_smtp_pass', ''),
        enc: Storage.get('superclean_smtp_enc', 'tls')
    };

    if (saved.url) document.getElementById('php-sender-url').value = saved.url;
    if (saved.host) document.getElementById('smtp-host').value = saved.host;
    if (saved.port) document.getElementById('smtp-port').value = saved.port;
    if (saved.user) document.getElementById('smtp-user').value = saved.user;
    if (saved.enc) document.getElementById('smtp-encryption').value = saved.enc;

    window.unlockAdmin = function() {
        if (document.getElementById('admin-pin').value === '12351235') {
            document.getElementById('admin-content').classList.remove('hidden');
        } else {
            alert('Falsche PIN!');
        }
    };

    window.saveSettings = function() {
        Storage.set('superclean_php_url', document.getElementById('php-sender-url').value.trim());
        Storage.set('superclean_smtp_host', document.getElementById('smtp-host').value.trim());
        Storage.set('superclean_smtp_port', document.getElementById('smtp-port').value.trim());
        Storage.set('superclean_smtp_user', document.getElementById('smtp-user').value.trim());
        Storage.set('superclean_smtp_pass', document.getElementById('smtp-pass').value.trim());
        Storage.set('superclean_smtp_enc', document.getElementById('smtp-encryption').value);
        alert('Einstellungen gespeichert!');
    };
}