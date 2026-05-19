import { Storage } from '../utils/storage.js';
import { roomsData } from '../data/rooms.js';

export function renderHistory(container, onView, onDelete) {
    const protocols = Storage.get('superclean_protocols', []);
    container.innerHTML = '';

    if (protocols.length === 0) {
        container.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border">
                <i class="fa-solid fa-inbox text-6xl text-slate-300 mb-4"></i>
                <p class="text-xl text-slate-500">Noch keine Protokolle gespeichert.</p>
            </div>
        `;
        return;
    }

    protocols.forEach(p => {
        const totalTasks = Object.keys(roomsData[p.language || 'de']).reduce((sum, k) => sum + roomsData[p.language || 'de'][k].tasks.length, 0);
        let done = 0;
        if (p.rooms) Object.keys(p.rooms).forEach(k => { done += p.rooms[k].filter(t => t.checked).length; });

        const div = document.createElement('div');
        div.className = 'bg-white dark:bg-slate-800 border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md cursor-pointer';
        div.innerHTML = `
            <div>
                <div class="font-semibold text-lg">${p.property}</div>
                <div class="text-sm text-slate-600 dark:text-slate-400 mt-1">${p.cleaner} • ${p.date} • ${done}/${totalTasks} Aufgaben</div>
            </div>
            <div class="flex gap-2">
                <button class="view-btn px-5 py-2 border border-emerald-600 text-emerald-600 rounded-2xl text-sm">Ansehen</button>
                <button class="delete-btn px-4 py-2 text-red-600 hover:bg-red-50 rounded-2xl text-sm">Löschen</button>
            </div>
        `;

        div.querySelector('.view-btn').onclick = (e) => { e.stopImmediatePropagation(); onView(p.id); };
        div.querySelector('.delete-btn').onclick = (e) => { e.stopImmediatePropagation(); onDelete(p.id, div); };
        div.onclick = () => onView(p.id);

        container.appendChild(div);
    });
}

export function showProtocolModal(protocol) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4';
    
    let html = `<div class="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div class="p-8">
            <div class="flex justify-between mb-6">
                <div><h2 class="text-3xl font-bold">${protocol.property}</h2><p class="text-slate-600">${protocol.cleaner} • ${protocol.date}</p></div>
                <button class="close-btn text-4xl">&times;</button>
            </div>`;

    if (protocol.rooms) {
        Object.keys(protocol.rooms).forEach(key => {
            const room = protocol.rooms[key];
            const roomInfo = roomsData[protocol.language || 'de'][key];
            if (!roomInfo) return;
            const done = room.filter(t => t.checked).length;
            html += `<div class="mb-6"><div class="font-semibold text-emerald-700 mb-2">${roomInfo.name} (${done}/${room.length})</div>`;
            room.forEach(t => {
                html += `<div class="flex gap-3 py-1 text-sm ${t.checked ? '' : 'text-slate-400'}"><div class="w-5">${t.checked ? '✓' : '☐'}</div><div>${t.text} ${t.note ? `(${t.note})` : ''}</div></div>`;
            });
            html += `</div>`;
        });
    }

    if (protocol.issues) html += `<div class="bg-amber-50 p-4 rounded-2xl mt-4"><strong>Probleme:</strong> ${protocol.issues}</div>`;
    if (protocol.signature) html += `<div class="mt-6"><strong>Unterschrift:</strong><br><img src="${protocol.signature}" class="max-w-[280px] border rounded-2xl mt-2"></div>`;

    html += `</div><div class="p-6 border-t flex justify-end gap-3 bg-slate-50 dark:bg-slate-900 rounded-b-3xl">
        <button class="close-btn px-6 py-3 border rounded-2xl">Schließen</button>
        <button class="print-btn px-6 py-3 bg-emerald-600 text-white rounded-2xl">PDF / Drucken</button>
    </div></div>`;

    modal.innerHTML = html;
    document.body.appendChild(modal);

    modal.querySelectorAll('.close-btn').forEach(b => b.onclick = () => modal.remove());
    modal.querySelector('.print-btn').onclick = () => {
        modal.remove();
        // TODO: call generatePDF with protocol data
        alert('PDF-Generierung mit gespeicherten Daten kommt in Kürze!');
    };
}