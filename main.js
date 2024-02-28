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
let sourceNode;
let gainNode;

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

document.getElementById('volume').addEventListener('input', () => {
    const volume = document.getElementById('volume').value / 100;
    document.getElementById('volumeValue').textContent = `${volume * 100}%`;
});

document.getElementById('whiteNoiseBtn').addEventListener('click', () => {
    const volume = document.getElementById('volume').value / 100;
    const buffer = generateWhiteNoise();
    playSound(buffer, volume);
});

document.getElementById('pinkNoiseBtn').addEventListener('click', () => {
    const volume = document.getElementById('volume').value / 100;
    const buffer = generatePinkNoise();
    playSound(buffer, volume);
});

document.getElementById('stopBtn').addEventListener('click', () => {
    stopSound();
});

function playSound(buffer, volume) {
    stopSound(); // Stop any currently playing sound
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = true;
    gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    sourceNode.start();
}

function stopSound() {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
    }
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

  oscillator1 = audioCtx.createOscillator();
  oscillator1.type = 'sine';
  oscillator1.frequency.setValueAtTime(freq1, audioCtx.currentTime);

  oscillator2 = audioCtx.createOscillator();
  oscillator2.type = 'sine';
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
  }
  if (oscillator2) {
    oscillator2.stop();
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
