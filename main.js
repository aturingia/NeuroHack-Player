 //================= Reproductores =========================
document.addEventListener('DOMContentLoaded', function () {
    const startButtons = document.querySelectorAll('.startButton');
    const stopButtons = document.querySelectorAll('.stopButton');
    const audioFiles = document.querySelectorAll('.audioFile');
    const audioPlayers = document.querySelectorAll('.audioPlayer');
    const volumeSliders = document.querySelectorAll('.volumeSlider');
    const volumeLevels = document.querySelectorAll('.volumeLevel');

    startButtons.forEach((startButton, index) => {
        startButton.addEventListener('click', function () {
            const audioPlayer = audioPlayers[index];
            if (audioPlayer.src !== '') {
                audioPlayer.play();
            } else {
                alert('Por favor, selecciona un archivo de audio primero.');
            }
        });
    });

    stopButtons.forEach((stopButton, index) => {
        stopButton.addEventListener('click', function () {
            const audioPlayer = audioPlayers[index];
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        });
    });

    audioFiles.forEach((audioFile, index) => {
        audioFile.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                const audioPlayer = audioPlayers[index];
                audioPlayer.src = e.target.result;
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        });
    });

    volumeSliders.forEach((volumeSlider, index) => {
        volumeSlider.addEventListener('input', function () {
            const audioPlayer = audioPlayers[index];
            const volumeLevel = volumeLevels[index];
            const volumePercentage = volumeSlider.value + '%';
            audioPlayer.volume = volumeSlider.value / 100;
            volumeLevel.textContent = volumePercentage;
        });
    });
});



//================ Noise-Generator =======================
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let noiseSourceNode;
let noiseGainNode;
let noiseFilterNode;
let convolverNode;
let isNoisePlaying = false;

// Crear nodos de reverberación
function createReverb() {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2; // 2 segundos de reverberación
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    
    for (let i = 0; i < length; i++) {
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
    
    const convolver = audioContext.createConvolver();
    convolver.buffer = impulse;
    return convolver;
}

// Generadores de ruido
function generateWhiteNoise() {
    const bufferSize = 2 * audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

function generatePinkNoise() {
    const bufferSize = 2 * audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
    return buffer;
}

function generateBrownNoise() {
    const bufferSize = 2 * audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Aumentar la amplitud
    }
    return buffer;
}

// Configurar filtro según el rango de frecuencia seleccionado
function setupFilter(filterNode, frequencyRange) {
    switch(frequencyRange) {
        case 'low':
            // Filtro paso bajo para frecuencias bajas
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 250;
            break;
        case 'mid':
            // Filtro paso banda para frecuencias medias
            filterNode.type = 'bandpass';
            filterNode.frequency.value = 1125; // Frecuencia central
            filterNode.Q.value = 1;
            break;
        case 'high':
            // Filtro paso alto para frecuencias altas
            filterNode.type = 'highpass';
            filterNode.frequency.value = 2000;
            break;
        default:
            // Sin filtro para espectro completo
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 20000;
    }
}

// Iniciar o detener el ruido
document.getElementById('startNoiseBtn').addEventListener('click', () => {
    if (isNoisePlaying) return;
    
    const noiseType = document.getElementById('noiseType').value;
    const frequencyRange = document.getElementById('frequencyRange').value;
    const volume = document.getElementById('volume').value / 100;
    const reverbAmount = document.getElementById('reverb').value / 100;
    
    let buffer;
    switch(noiseType) {
        case 'white':
            buffer = generateWhiteNoise();
            break;
        case 'pink':
            buffer = generatePinkNoise();
            break;
        case 'brown':
            buffer = generateBrownNoise();
            break;
    }
    
    playNoise(buffer, frequencyRange, volume, reverbAmount);
    isNoisePlaying = true;
    document.getElementById('startNoiseBtn').disabled = true;
    document.getElementById('stopNoiseBtn').disabled = false;
});

document.getElementById('stopNoiseBtn').addEventListener('click', () => {
    stopNoise();
});

// Controladores de volumen y reverberación
document.getElementById('volume').addEventListener('input', () => {
    const volume = document.getElementById('volume').value;
    document.getElementById('volumeValue').textContent = `${volume}%`;
    if (noiseGainNode) {
        noiseGainNode.gain.value = volume / 100;
    }
});

document.getElementById('reverb').addEventListener('input', () => {
    const reverb = document.getElementById('reverb').value;
    document.getElementById('reverbValue').textContent = `${reverb}%`;
    if (convolverNode) {
        // Actualizar la reverberación en tiempo real
        // En una implementación más avanzada, podrías cambiar el impulso
    }
});

// Función para reproducir el ruido
function playNoise(buffer, frequencyRange, volume, reverbAmount) {
    stopNoise(); // Detener cualquier sonido actual
    
    // Crear nodos de audio
    noiseSourceNode = audioContext.createBufferSource();
    noiseSourceNode.buffer = buffer;
    noiseSourceNode.loop = true;
    
    noiseGainNode = audioContext.createGain();
    noiseGainNode.gain.value = volume;
    
    noiseFilterNode = audioContext.createBiquadFilter();
    setupFilter(noiseFilterNode, frequencyRange);
    
    // Configurar reverberación si está activa
    if (reverbAmount > 0) {
        convolverNode = createReverb();
        const dryGain = audioContext.createGain();
        const wetGain = audioContext.createGain();
        
        dryGain.gain.value = 1 - reverbAmount;
        wetGain.gain.value = reverbAmount;
        
        // Conectar nodos: fuente -> filtro -> dry/wet split
        noiseSourceNode.connect(noiseFilterNode);
        noiseFilterNode.connect(dryGain);
        noiseFilterNode.connect(convolverNode);
        convolverNode.connect(wetGain);
        dryGain.connect(noiseGainNode);
        wetGain.connect(noiseGainNode);
    } else {
        // Sin reverberación
        noiseSourceNode.connect(noiseFilterNode);
        noiseFilterNode.connect(noiseGainNode);
    }
    
    noiseGainNode.connect(audioContext.destination);
    noiseSourceNode.start();
}

function stopNoise() {
    if (noiseSourceNode) {
        noiseSourceNode.stop();
        noiseSourceNode.disconnect();
        noiseSourceNode = null;
    }
    isNoisePlaying = false;
    document.getElementById('startNoiseBtn').disabled = false;
    document.getElementById('stopNoiseBtn').disabled = true;
}


//================ Youtube-Player =================

// JavaScript
function loadPlaylist() {
    var playlistURL = document.getElementById('playlistURL').value;
    var playlistID = playlistURL.split('list=')[1];

    var playerDiv = document.getElementById('player');
    playerDiv.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=' + playlistID + '&autoplay=1&loop=0&mute=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
};

//================ wave - Generator ========================

const freq1Input = document.getElementById('freq1');
const freq2Input = document.getElementById('freq2');
const waveTypeSelect = document.getElementById('waveType');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtnW');
const volumeSlider = document.getElementById('volumeW');
const volumeLevel = document.getElementById('volumeLevel');
const audio = document.getElementById('audio');

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator1, oscillator2, gainNodeW;

startBtn.addEventListener('click', () => {
  const freq1 = parseFloat(freq1Input.value);
  const freq2 = parseFloat(freq2Input.value);
  const waveType = waveTypeSelect.value;

  // Stop any currently playing oscillators
  if (oscillator1) {
    oscillator1.stop();
  }
  if (oscillator2) {
    oscillator2.stop();
  }

  oscillator1 = audioCtx.createOscillator();
  oscillator1.type = waveType;
  oscillator1.frequency.setValueAtTime(freq1, audioCtx.currentTime);

  oscillator2 = audioCtx.createOscillator();
  oscillator2.type = waveType;
  oscillator2.frequency.setValueAtTime(freq2, audioCtx.currentTime);

  gainNodeW = audioCtx.createGain();
  gainNodeW.gain.setValueAtTime(volumeSlider.value, audioCtx.currentTime);

  oscillator1.connect(gainNodeW);
  oscillator2.connect(gainNodeW);
  gainNodeW.connect(audioCtx.destination);

  oscillator1.start();
  oscillator2.start();
});

stopBtnW.addEventListener('click', () => {
  if (oscillator1) {
    oscillator1.stop();
    oscillator1 = null;
  }
  if (oscillator2) {
    oscillator2.stop();
    oscillator2 = null;
  }
});

volumeSlider.addEventListener('input', () => {
  if (gainNodeW) {
    const volumeValue = volumeSlider.value * 100;
    volumeLevel.textContent = `${volumeValue.toFixed(0)}%`;
    gainNodeW.gain.setValueAtTime(volumeSlider.value, audioCtx.currentTime);
  }
});

//================ Dark - Mode ======================
function myFunction() {
   var element = document.body;
   element.classList.toggle("dark-mode");
}
