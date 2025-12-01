// Prevenir comportamiento por defecto en sliders para Android
    document.addEventListener('DOMContentLoaded', function() {
      // Prevenir gestos no deseados en sliders
      const sliders = document.querySelectorAll('input[type="range"]');
      
      sliders.forEach(slider => {
        // Prevenir el gesto de pantalla completa en Chrome para Android
        slider.addEventListener('touchstart', function(e) {
          e.stopPropagation();
          if (e.touches.length > 1) {
            e.preventDefault(); // Prevenir zoom con dos dedos
          }
        }, { passive: false });
        
        // Prevenir scroll mientras se desliza
        slider.addEventListener('touchmove', function(e) {
          if (e.touches.length === 1) {
            e.preventDefault(); // Solo prevenir con un dedo
          }
        }, { passive: false });
        
        // Mejorar feedback táctil
        slider.addEventListener('touchstart', function() {
          this.style.cursor = 'grabbing';
        });
        
        slider.addEventListener('touchend', function() {
          this.style.cursor = 'pointer';
        });
      });
      
      // Prevenir gestos en botones
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
          e.stopPropagation();
          this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('touchend', function() {
          this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('touchcancel', function() {
          this.style.transform = 'scale(1)';
        });
      });
      
      // Prevenir zoom en inputs
      const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
      inputs.forEach(input => {
        input.addEventListener('touchstart', function(e) {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        }, { passive: false });
      });
    });

    //================= Loop Players =========================
    document.addEventListener('DOMContentLoaded', function () {
        const startButtons = document.querySelectorAll('.startButton');
        const stopButtons = document.querySelectorAll('.stopButton');
        const audioFiles = document.querySelectorAll('.audioFile');
        const audioPlayers = document.querySelectorAll('.audioPlayer');
        const volumeSliders = document.querySelectorAll('.volumeSlider');
        const volumeLevels = document.querySelectorAll('.volumeLevel');

        // Initialize button states
        stopButtons.forEach(btn => {
            btn.disabled = true;
        });

        startButtons.forEach((startButton, index) => {
            startButton.addEventListener('click', function () {
                const audioPlayer = audioPlayers[index];
                if (audioPlayer.src && audioPlayer.src !== window.location.href) {
                    audioPlayer.play().catch(e => {
                        console.error("Error playing audio:", e);
                        alert("Error playing audio. Please try again.");
                    });
                    startButton.disabled = true;
                    stopButtons[index].disabled = false;
                } else {
                    alert('Please select an audio file first.');
                }
            });
            
            // Touch event para móvil
            startButton.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.click();
            }, { passive: false });
        });

        stopButtons.forEach((stopButton, index) => {
            stopButton.addEventListener('click', function () {
                const audioPlayer = audioPlayers[index];
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                stopButton.disabled = true;
                startButtons[index].disabled = false;
            });
            
            // Touch event para móvil
            stopButton.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.click();
            }, { passive: false });
        });

        audioFiles.forEach((audioFile, index) => {
            audioFile.addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    const audioPlayer = audioPlayers[index];
                    audioPlayer.src = url;
                    startButtons[index].disabled = false;
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
            
            // Touch events mejorados para móvil
            volumeSlider.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            });
            
            volumeSlider.addEventListener('touchmove', function(e) {
                e.stopPropagation();
            });
        });
    });

    //================ Noise Generator =======================
    let noiseAudioContext = null;
    let noiseSourceNode = null;
    let noiseGainNode = null;
    let noiseFilterNode = null;
    let convolverNode = null;
    let isNoisePlaying = false;

    document.addEventListener('DOMContentLoaded', function() {
        const startNoiseBtn = document.getElementById('startNoiseBtn');
        const stopNoiseBtn = document.getElementById('stopNoiseBtn');
        const noiseVolumeSlider = document.getElementById('noiseVolumeSlider');
        const noiseVolumeValue = document.getElementById('noiseVolumeValue');
        const reverbSlider = document.getElementById('reverbSlider');
        const reverbValue = document.getElementById('reverbValue');

        // Create reverb
        function createReverb(audioContext) {
            const sampleRate = audioContext.sampleRate;
            const length = sampleRate * 2;
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

        // Noise generators
        function generateWhiteNoise(audioContext) {
            const bufferSize = 2 * audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            return buffer;
        }

        function generatePinkNoise(audioContext) {
            const bufferSize = 2 * audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
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

        function generateBrownNoise(audioContext) {
            const bufferSize = 2 * audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }
            return buffer;
        }

        // Setup filter
        function setupFilter(filterNode, frequencyRange) {
            switch(frequencyRange) {
                case 'low':
                    filterNode.type = 'lowpass';
                    filterNode.frequency.value = 250;
                    break;
                case 'mid':
                    filterNode.type = 'bandpass';
                    filterNode.frequency.value = 1125;
                    filterNode.Q.value = 1;
                    break;
                case 'high':
                    filterNode.type = 'highpass';
                    filterNode.frequency.value = 2000;
                    break;
                default:
                    filterNode.type = 'lowpass';
                    filterNode.frequency.value = 20000;
            }
        }

        // Volume control
        noiseVolumeSlider.addEventListener('input', () => {
            const volume = noiseVolumeSlider.value;
            noiseVolumeValue.textContent = `${volume}%`;
            if (noiseGainNode) {
                noiseGainNode.gain.value = volume / 100;
            }
        });

        // Reverb control
        reverbSlider.addEventListener('input', () => {
            const reverb = reverbSlider.value;
            reverbValue.textContent = `${reverb}%`;
        });

        // Start noise
        startNoiseBtn.addEventListener('click', () => {
            if (isNoisePlaying) return;
            
            if (!noiseAudioContext) {
                noiseAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resumir contexto si está suspendido
            if (noiseAudioContext.state === 'suspended') {
                noiseAudioContext.resume();
            }
            
            const noiseType = document.getElementById('noiseType').value;
            const frequencyRange = document.getElementById('frequencyRange').value;
            const volume = noiseVolumeSlider.value / 100;
            const reverbAmount = reverbSlider.value / 100;
            
            let buffer;
            switch(noiseType) {
                case 'white':
                    buffer = generateWhiteNoise(noiseAudioContext);
                    break;
                case 'pink':
                    buffer = generatePinkNoise(noiseAudioContext);
                    break;
                case 'brown':
                    buffer = generateBrownNoise(noiseAudioContext);
                    break;
            }
            
            playNoise(buffer, frequencyRange, volume, reverbAmount);
        });
        
        // Touch event para móvil
        startNoiseBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });

        // Stop noise
        stopNoiseBtn.addEventListener('click', () => {
            stopNoise();
        });
        
        // Touch event para móvil
        stopNoiseBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });

        // Play noise function
        function playNoise(buffer, frequencyRange, volume, reverbAmount) {
            stopNoise();
            
            noiseSourceNode = noiseAudioContext.createBufferSource();
            noiseSourceNode.buffer = buffer;
            noiseSourceNode.loop = true;
            
            noiseGainNode = noiseAudioContext.createGain();
            noiseGainNode.gain.value = volume;
            
            noiseFilterNode = noiseAudioContext.createBiquadFilter();
            setupFilter(noiseFilterNode, frequencyRange);
            
            if (reverbAmount > 0) {
                convolverNode = createReverb(noiseAudioContext);
                const dryGain = noiseAudioContext.createGain();
                const wetGain = noiseAudioContext.createGain();
                
                dryGain.gain.value = 1 - reverbAmount;
                wetGain.gain.value = reverbAmount;
                
                noiseSourceNode.connect(noiseFilterNode);
                noiseFilterNode.connect(dryGain);
                noiseFilterNode.connect(convolverNode);
                convolverNode.connect(wetGain);
                dryGain.connect(noiseGainNode);
                wetGain.connect(noiseGainNode);
            } else {
                noiseSourceNode.connect(noiseFilterNode);
                noiseFilterNode.connect(noiseGainNode);
            }
            
            noiseGainNode.connect(noiseAudioContext.destination);
            noiseSourceNode.start();
            
            isNoisePlaying = true;
            startNoiseBtn.disabled = true;
            stopNoiseBtn.disabled = false;
        }

        function stopNoise() {
            if (noiseSourceNode) {
                try {
                    noiseSourceNode.stop();
                } catch(e) {
                    console.log("Noise already stopped");
                }
                noiseSourceNode.disconnect();
                noiseSourceNode = null;
            }
            isNoisePlaying = false;
            startNoiseBtn.disabled = false;
            stopNoiseBtn.disabled = true;
        }
    });

    //================ YouTube Player =================
    function loadPlaylist() {
        var playlistURL = document.getElementById('playlistURL').value;
        
        // Extract playlist ID
        let playlistID = '';
        try {
            const urlObj = new URL(playlistURL);
            playlistID = urlObj.searchParams.get('list');
        } catch (e) {
            // If URL parsing fails, try to extract manually
            const match = playlistURL.match(/[?&]list=([^&]+)/);
            if (match) {
                playlistID = match[1];
            }
        }

        if (!playlistID) {
            alert('Please enter a valid YouTube playlist URL');
            return;
        }

        var playerDiv = document.getElementById('player');
        playerDiv.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=' + playlistID + '&autoplay=1&loop=0&mute=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    }
    
    // Touch event para el botón de YouTube
    document.getElementById('loadPlaylistBtn').addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.click();
    }, { passive: false });

    //================ Binaural Beats Generator ========================
    document.addEventListener('DOMContentLoaded', function() {
        const freq1Input = document.getElementById('freq1');
        const freq2Input = document.getElementById('freq2');
        const waveTypeSelect = document.getElementById('waveType');
        const startBinauralBtn = document.getElementById('startBinauralBtn');
        const stopBinauralBtn = document.getElementById('stopBinauralBtn');
        const binauralVolumeSlider = document.getElementById('binauralVolumeSlider');
        const binauralVolumeLevel = document.getElementById('binauralVolumeLevel');

        let binauralAudioContext = null;
        let oscillator1 = null;
        let oscillator2 = null;
        let binauralGainNode = null;

        // Volume control
        binauralVolumeSlider.addEventListener('input', () => {
            const volumeValue = binauralVolumeSlider.value * 100;
            binauralVolumeLevel.textContent = `${volumeValue.toFixed(0)}%`;
            if (binauralGainNode) {
                binauralGainNode.gain.value = binauralVolumeSlider.value;
            }
        });

        // Start binaural beats
        startBinauralBtn.addEventListener('click', () => {
            const freq1 = parseFloat(freq1Input.value);
            const freq2 = parseFloat(freq2Input.value);
            const waveType = waveTypeSelect.value;

            // Stop any currently playing oscillators
            if (oscillator1 || oscillator2) {
                stopBinauralBeats();
            }

            if (!binauralAudioContext) {
                binauralAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resumir contexto si está suspendido
            if (binauralAudioContext.state === 'suspended') {
                binauralAudioContext.resume();
            }

            oscillator1 = binauralAudioContext.createOscillator();
            oscillator1.type = waveType;
            oscillator1.frequency.setValueAtTime(freq1, binauralAudioContext.currentTime);

            oscillator2 = binauralAudioContext.createOscillator();
            oscillator2.type = waveType;
            oscillator2.frequency.setValueAtTime(freq2, binauralAudioContext.currentTime);

            binauralGainNode = binauralAudioContext.createGain();
            binauralGainNode.gain.setValueAtTime(binauralVolumeSlider.value, binauralAudioContext.currentTime);

            oscillator1.connect(binauralGainNode);
            oscillator2.connect(binauralGainNode);
            binauralGainNode.connect(binauralAudioContext.destination);

            oscillator1.start();
            oscillator2.start();

            startBinauralBtn.disabled = true;
            stopBinauralBtn.disabled = false;
        });
        
        // Touch event para móvil
        startBinauralBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });

        // Stop binaural beats
        stopBinauralBtn.addEventListener('click', () => {
            stopBinauralBeats();
        });
        
        // Touch event para móvil
        stopBinauralBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        }, { passive: false });

        function stopBinauralBeats() {
            if (oscillator1) {
                oscillator1.stop();
                oscillator1 = null;
            }
            if (oscillator2) {
                oscillator2.stop();
                oscillator2 = null;
            }
            startBinauralBtn.disabled = false;
            stopBinauralBtn.disabled = true;
        }
    });

    //================ Dark Mode ======================
    function toggleDarkMode() {
       var element = document.body;
       element.classList.toggle("dark-mode");
    }
    
    // Touch event para dark mode
    document.getElementById('darkModeBtn').addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.click();
    }, { passive: false });