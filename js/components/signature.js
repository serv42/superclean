let canvas, ctx, signatureData = null;

export function initSignaturePad() {
    canvas = document.getElementById('signature-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    let isDrawing = false;
    let lastX = 0, lastY = 0;

    function start(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = (e.clientX || e.touches?.[0].clientX) - rect.left;
        lastY = (e.clientY || e.touches?.[0].clientY) - rect.top;
    }

    function draw(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x; lastY = y;
    }

    function stop() { isDrawing = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseout', stop);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener('touchend', stop);
}

export function clearSignature() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatureData = null;
    }
}

export function saveSignature() {
    if (canvas) {
        signatureData = canvas.toDataURL('image/png');
        return signatureData;
    }
    return null;
}

export function getSignature() {
    return signatureData;
}