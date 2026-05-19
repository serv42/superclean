import { roomsData } from '../data/rooms.js';
import { currentLang } from '../utils/i18n.js';

export function createRoomSection(roomKey, onChange) {
    const room = roomsData[currentLang][roomKey];
    if (!room) return null;

    const section = document.createElement('div');
    section.className = `bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6`;
    
    section.innerHTML = `
        <div class="section-header px-6 py-4 flex items-center gap-x-3">
            <i class="fa-solid ${room.icon} text-white text-xl"></i>
            <span class="font-semibold text-white text-lg">${room.name}</span>
        </div>
        <div class="p-6 space-y-3" id="${roomKey}-tasks"></div>
    `;

    const tasksContainer = section.querySelector(`#${roomKey}-tasks`);
    
    room.tasks.forEach((taskText, index) => {
        const row = document.createElement('div');
        row.className = 'task-row flex items-start gap-x-3 p-3 rounded-2xl';
        row.innerHTML = `
            <div class="pt-0.5">
                <input type="checkbox" id="${roomKey}-${index}" class="w-5 h-5 accent-emerald-600 mt-0.5">
            </div>
            <div class="flex-1">
                <label for="${roomKey}-${index}" class="cursor-pointer select-none text-[15px]">${taskText}</label>
                <input type="text" placeholder="${currentLang === 'de' ? 'Notiz (optional)' : 'Note (optional)'}" 
                       class="mt-1 w-full text-sm px-3 py-1 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-emerald-400 bg-white dark:bg-slate-700" 
                       id="note-${roomKey}-${index}">
            </div>
        `;
        tasksContainer.appendChild(row);

        // Optional: Add change listener
        if (onChange) {
            row.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', onChange);
            });
        }
    });

    return section;
}

export function getRoomData(roomKey) {
    const container = document.getElementById(`${roomKey}-tasks`);
    if (!container) return [];
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const room = roomsData[currentLang][roomKey];
    const result = [];

    checkboxes.forEach((cb, i) => {
        const noteInput = document.getElementById(`note-${roomKey}-${i}`);
        result.push({
            text: room.tasks[i],
            checked: cb.checked,
            note: noteInput ? noteInput.value.trim() : ''
        });
    });
    return result;
}