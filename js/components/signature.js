let canvas, ctx, signatureData = null;
let drawing = false;
let lastX = 0, lastY = 0;


export function initSignaturePad() {
    canvas = document.getElementById('signature-canvas');
    if (!canvas) return;

    // High-DPI / Retina Support für gestochen scharfe Linien
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx = canvas.getContext('2d', { alpha: true });
    ctx.scale(dpr, dpr);
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.clearRect(0, 0, rect.width, rect.height);

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: ((e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX)) - rect.left),
            y: ((e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY)) - rect.top)
        };
    }

    function start(e) {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        
        const pos = getPos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
    }

    function stop() {
        drawing = false;
    }

    // Mouse Events
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseout', stop);

    // Touch Events - optimiert mit passive: false
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stop);
    canvas.addEventListener('touchcancel', stop);
}

export function clearSignature() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    signatureData = null;
    if (window.showToast) window.showToast('Unterschrift gelöscht');
}

export function saveSignature() {
    if (!canvas) return null;
    signatureData = canvas.toDataURL('image/png', 0.92);
    if (window.showToast) window.showToast('Unterschrift gespeichert ✓');
    return signatureData;
}

export function getSignature() {
    return signatureData;
}

export function hasSignature() {
    return !!signatureData;
}