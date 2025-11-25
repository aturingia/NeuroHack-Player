 //================= Audio Players =========================
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
                    alert('Please select an audio file first.');
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

    //================ Noise Generator with Frequency Control and Reverb =======================
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let sourceNode;
    let gainNode;
    let convolverNode;
    let biquadFilter;

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
            data[i] *= 3.5; // boost the volume
        }
        return buffer;
    }

    // Create reverb impulse response
    function createReverbBuffer(duration, decay) {
        const sampleRate = audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = audioContext.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            const n = i / sampleRate;
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / duration, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / duration, decay);
        }
        
        return impulse;
    }

    // Frequency control
    document.getElementById('noiseFrequency').addEventListener('input', () => {
        const frequency = document.getElementById('noiseFrequency').value;
        document.getElementById('frequencyValue').textContent = `${frequency} Hz`;
        
        // Update filter frequency if noise is playing
        if (biquadFilter) {
            biquadFilter.frequency.setValueAtTime(frequency, audioContext.currentTime);
        }
    });

    document.getElementById('volume').addEventListener('input', () => {
        const volume = document.getElementById('volume').value;
        document.getElementById('volumeValue').textContent = `${volume}%`;
    });

    document.getElementById('reverb').addEventListener('input', () => {
        const reverb = document.getElementById('reverb').value;
        document.getElementById('reverbValue').textContent = `${reverb}%`;
    });

    document.getElementById('whiteNoiseBtn').addEventListener('click', () => {
        const volume = document.getElementById('volume').value / 100;
        const reverb = document.getElementById('reverb').value / 100;
        const frequency = document.getElementById('noiseFrequency').value;
        const buffer = generateWhiteNoise();
        playSound(buffer, volume, reverb, frequency);
    });

    document.getElementById('pinkNoiseBtn').addEventListener('click', () => {
        const volume = document.getElementById('volume').value / 100;
        const reverb = document.getElementById('reverb').value / 100;
        const frequency = document.getElementById('noiseFrequency').value;
        const buffer = generatePinkNoise();
        playSound(buffer, volume, reverb, frequency);
    });

    document.getElementById('brownNoiseBtn').addEventListener('click', () => {
        const volume = document.getElementById('volume').value / 100;
        const reverb = document.getElementById('reverb').value / 100;
        const frequency = document.getElementById('noiseFrequency').value;
        const buffer = generateBrownNoise();
        playSound(buffer, volume, reverb, frequency);
    });

    document.getElementById('stopBtn').addEventListener('click', () => {
        stopSound();
    });

    function playSound(buffer, volume, reverb, frequency) {
        stopSound(); // Stop any currently playing sound
        
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true;
        
        // Create filter for frequency control
        biquadFilter = audioContext.createBiquadFilter();
        biquadFilter.type = "bandpass";
        biquadFilter.frequency.setValueAtTime(frequency, audioContext.currentTime);
        biquadFilter.Q.setValueAtTime(1, audioContext.currentTime);
        
        gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        
        // Apply reverb if needed
        if (reverb > 0) {
            convolverNode = audioContext.createConvolver();
            convolverNode.buffer = createReverbBuffer(2, 2);
            
            const dryGain = audioContext.createGain();
            const wetGain = audioContext.createGain();
            dryGain.gain.value = 1 - reverb;
            wetGain.gain.value = reverb;
            
            sourceNode.connect(biquadFilter);
            biquadFilter.connect(gainNode);
            gainNode.connect(dryGain);
            gainNode.connect(convolverNode);
            convolverNode.connect(wetGain);
            dryGain.connect(audioContext.destination);
            wetGain.connect(audioContext.destination);
        } else {
            sourceNode.connect(biquadFilter);
            biquadFilter.connect(gainNode);
            gainNode.connect(audioContext.destination);
        }
        
        sourceNode.start();
    }

    function stopSound() {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
        }
    }

    //================ Youtube Player =================
    function loadPlaylist() {
        var playlistURL = document.getElementById('playlistURL').value;
        var playlistID = playlistURL.split('list=')[1];

        var playerDiv = document.getElementById('player');
        playerDiv.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=' + playlistID + '&autoplay=1&loop=0&mute=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    };

    //================ Binaural Beats Generator ========================
    const freq1Input = document.getElementById('freq1');
    const freq2Input = document.getElementById('freq2');
    const startBtn = document.getElementById('startBtn');
    const stopBtnW = document.getElementById('stopBtnW');
    const volumeSliderW = document.getElementById('volumeW');
    const volumeLevel = document.getElementById('volumeLevel');
    const waveTypeBinaural = document.getElementById('waveTypeBinaural');

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator1, oscillator2, gainNodeW;

    startBtn.addEventListener('click', () => {
        const freq1 = parseFloat(freq1Input.value);
        const freq2 = parseFloat(freq2Input.value);
        const waveType = waveTypeBinaural.value;

        oscillator1 = audioCtx.createOscillator();
        oscillator1.type = waveType;
        oscillator1.frequency.setValueAtTime(freq1, audioCtx.currentTime);

        oscillator2 = audioCtx.createOscillator();
        oscillator2.type = waveType;
        oscillator2.frequency.setValueAtTime(freq2, audioCtx.currentTime);

        gainNodeW = audioCtx.createGain();
        gainNodeW.gain.setValueAtTime(volumeSliderW.value / 100, audioCtx.currentTime);

        // Create stereo panner for binaural effect
        const panner1 = audioCtx.createStereoPanner();
        panner1.pan.value = -0.5; // Left ear
        
        const panner2 = audioCtx.createStereoPanner();
        panner2.pan.value = 0.5; // Right ear

        oscillator1.connect(panner1);
        oscillator2.connect(panner2);
        panner1.connect(gainNodeW);
        panner2.connect(gainNodeW);
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

    volumeSliderW.addEventListener('input', () => {
        if (gainNodeW) {
            const volumeValue = volumeSliderW.value;
            volumeLevel.textContent = `${volumeValue}%`;
            gainNodeW.gain.setValueAtTime(volumeSliderW.value / 100, audioCtx.currentTime);
        }
    });

    //================ Isochronic Tones Generator ========================
    const isoFreqInput = document.getElementById('isoFreq');
    const startBtnIso = document.getElementById('startBtnIso');
    const stopBtnIso = document.getElementById('stopBtnIso');
    const volumeSliderIso = document.getElementById('volumeIso');
    const volumeLevelIso = document.getElementById('volumeLevelIso');
    const waveTypeIsochronic = document.getElementById('waveTypeIsochronic');

    let isochronicOscillator, isochronicGain, isochronicInterval;

    startBtnIso.addEventListener('click', () => {
        const freq = parseFloat(isoFreqInput.value);
        const waveType = waveTypeIsochronic.value;

        isochronicOscillator = audioCtx.createOscillator();
        isochronicOscillator.type = waveType;
        isochronicOscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

        isochronicGain = audioCtx.createGain();
        isochronicGain.gain.setValueAtTime(volumeSliderIso.value / 100, audioCtx.currentTime);

        isochronicOscillator.connect(isochronicGain);
        isochronicGain.connect(audioCtx.destination);

        isochronicOscillator.start();

        // Create isochronic pulsing effect
        let isPlaying = true;
        isochronicInterval = setInterval(() => {
            if (isPlaying) {
                isochronicGain.gain.setValueAtTime(0, audioCtx.currentTime);
                isPlaying = false;
            } else {
                isochronicGain.gain.setValueAtTime(volumeSliderIso.value / 100, audioCtx.currentTime);
                isPlaying = true;
            }
        }, 1000 / (freq * 2)); // Convert frequency to interval
    });

    stopBtnIso.addEventListener('click', () => {
        if (isochronicOscillator) {
            isochronicOscillator.stop();
        }
        if (isochronicInterval) {
            clearInterval(isochronicInterval);
        }
    });

    volumeSliderIso.addEventListener('input', () => {
        if (isochronicGain) {
            const volumeValue = volumeSliderIso.value;
            volumeLevelIso.textContent = `${volumeValue}%`;
            isochronicGain.gain.setValueAtTime(volumeSliderIso.value / 100, audioCtx.currentTime);
        }
    });

    //================ Dark Mode ======================
    function myFunction() {
        var element = document.body;
        element.classList.toggle("dark-mode");
    }