function getQueryParam(paramName, urlString = window.location.href) {
    // Create a URL object
    var url = new URL(urlString);

    // Get the search params from the URL
    var searchParams = url.searchParams;

    // Return the value of the specified parameter
    return searchParams.get(paramName);
}
const SIGNAL_RUN = 0;
const SIGNAL_PAUSE = 1;
const SIGNAL_READY = 2;
const PARTICLE_COUNT = ~~getQueryParam('count') || 1000_000;
// const PARTICLE_COUNT = 10_000_000;
const CPU_CORES = navigator.hardwareConcurrency;
const chunkSize = Math.floor(PARTICLE_COUNT / CPU_CORES);
const workerPool = [];
const stride = 4; // 4 floats x,y,dx,dy;
const byte_stride = stride * 4; // 4 bytes per float
const sabParticles = new SharedArrayBuffer(PARTICLE_COUNT * byte_stride);
const sabViewParticles = new Float32Array(sabParticles);
const sabSignals = new SharedArrayBuffer(CPU_CORES);
const sabViewSignals = new Uint8Array(sabSignals);
// dt + mouse x and mouse y
const sabSimData = new SharedArrayBuffer(4 + 4 + 4 + 4);
const sabViewSimData = new Float32Array(sabSimData);
const canvas = document.getElementById('renderMan');
const context = canvas.getContext('2d');
let backbuffer = new ImageData(window.innerWidth, window.innerHeight);

// windowing init
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    backbuffer = new ImageData(canvas.width, canvas.height);
});
window.addEventListener('mousemove', e => {
    sabViewSimData[1] = e.clientX;
    sabViewSimData[2] = e.clientY;
});
window.addEventListener('mousedown', e => {
    sabViewSimData[3] = 1;
});
window.addEventListener('mouseup', e => {
    sabViewSimData[3] = 0;
});
window.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    sabViewSimData[1] = touch.clientX || touch.pageX;
    sabViewSimData[2] = touch.clientY || touch.pageY;
});
window.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    sabViewSimData[1] = touch.clientX || touch.pageX;
    sabViewSimData[2] = touch.clientY || touch.pageY;
    sabViewSimData[3] = 1;
});
window.addEventListener('touchend', () => {
    sabViewSimData[3] = 0;
});
window.addEventListener('touchcancel', () => {
    sabViewSimData[3] = 0;
});

//setup workers
for (let i = 0; i < CPU_CORES; i++) {
    const worker = new Worker('./worker.js');
    workerPool.push(worker);
    worker.postMessage({
        sabParticles, sabSignals, id: i, chunkSize, chunkOffset: chunkSize * i, stride, sabSimData
    });
}

//init particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    sabViewParticles[i * stride] = Math.random() * canvas.width;
    sabViewParticles[i * stride + 1] = Math.random() * canvas.height;
    sabViewParticles[i * stride + 2] = (Math.random() * 2 - 1) * 10;
    sabViewParticles[i * stride + 3] = (Math.random() * 2 - 1) * 10;
}

// wait for worker ready signal
const handle = setInterval(() => {
    console.log('waiting for workers....', sabViewSignals);
    if (sabViewSignals[sabViewSignals.length - 1] !== SIGNAL_READY) {
        return;
    }
    clearInterval(handle);
    requestAnimationFrame(runSimulation);
}, 100);

let lastTime = 1;
function runSimulation(currentTime) {
    const dt = Math.min(1, (currentTime - lastTime) / 1000);
    lastTime = currentTime;
    sabViewSimData[0] = dt;
    for (let i = 0; i < CPU_CORES; i++) {
        sabViewSignals[i] = SIGNAL_RUN;
    }
    render();
    requestAnimationFrame(runSimulation);
}

function render() {
    const width = canvas.width;
    const height = canvas.height;
    const pixels = backbuffer.data;
    pixels.fill(0);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = sabViewParticles[i * 4];
        if (x < 0 || x >= width) continue;
        const y = sabViewParticles[i * 4 + 1];
        if (y < 0 || y >= height) continue;
        const pixelIndex = ((y | 0) * width + (x | 0)) * 4;
        const rx = x / width;
        const ry = y / height;
        pixels[pixelIndex] += 25 + (50 * rx);   // Red channel
        pixels[pixelIndex + 1] += 25 + (50 * ry); // Green channel
        pixels[pixelIndex + 2] += 25 + (50 * (1 - rx)); // Blue channel
        // pixels[pixelIndex + 2] = 200;
        pixels[pixelIndex + 3] = 255; // Alpha channel (opacity)
    }

    context.putImageData(backbuffer, 0, 0);
}