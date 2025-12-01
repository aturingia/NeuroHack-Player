//================= MEJORAS PARA SLIDERS MULTIPLATAFORMA =========================
    document.addEventListener('DOMContentLoaded', function() {
      // Configuración mejorada para sliders en móvil
      const sliders = document.querySelectorAll('input[type="range"]');
      
      sliders.forEach(slider => {
        // Prevenir comportamientos no deseados en Android
        slider.addEventListener('touchstart', function(e) {
          e.stopPropagation();
          e.preventDefault();
          this.classList.add('slider-active');
          
          // Iniciar seguimiento del gesto
          const startX = e.touches[0].clientX;
          const startValue = parseFloat(this.value);
          const max = parseFloat(this.max);
          const min = parseFloat(this.min);
          const rect = this.getBoundingClientRect();
          const totalWidth = rect.width;
          
          const moveHandler = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            
            const currentX = moveEvent.touches[0].clientX;
            const diff = currentX - startX;
            const percentage = diff / totalWidth;
            const range = max - min;
            const newValue = startValue + (percentage * range);
            
            // Limitar el valor entre min y max
            const clampedValue = Math.max(min, Math.min(max, newValue));
            
            // Actualizar slider
            this.value = clampedValue;
            
            // Disparar evento input
            this.dispatchEvent(new Event('input', { bubbles: true }));
          };
          
          const endHandler = () => {
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', endHandler);
            this.classList.remove('slider-active');
            
            // Disparar evento change
            this.dispatchEvent(new Event('change', { bubbles: true }));
          };
          
          document.addEventListener('touchmove', moveHandler, { passive: false });
          document.addEventListener('touchend', endHandler, { passive: false });
        }, { passive: false });
        
        // Mejor feedback visual
        slider.addEventListener('mousedown', function() {
          this.classList.add('slider-active');
        });
        
        slider.addEventListener('mouseup', function() {
          this.classList.remove('slider-active');
        });
        
        slider.addEventListener('mouseleave', function() {
          this.classList.remove('slider-active');
        });
      });
      
      // Prevenir gestos de navegación mientras se interactúa con sliders
      document.addEventListener('touchmove', function(e) {
        if (e.target.type === 'range' || e.target.classList.contains('slider-active')) {
          e.preventDefault();
        }
      }, { passive: false });
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
            
            // Touch event optimizado
            startButton.addEventListener('touchstart', function(e) {
                e.stopPropagation();
                this.style.transform = 'scale(0.95)';
            });
            
            startButton.addEventListener('touchend', function(e) {
                e.stopPropagation();
                this.style.transform = '';
                this.click();
            });
        });

        stopButtons.forEach((stopButton, index) => {
            stopButton.addEventListener('click', function () {
                const audioPlayer = audioPlayers[index];
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                stopButton.disabled = true;
                startButtons[index].disabled = false;
            });
            
            // Touch event optimizado
            stopButton.addEventListener('touchstart', function(e) {
                e.stopPropagation();
                this.style.transform = 'scale(0.95)';
            });
            
            stopButton.addEventListener('touchend', function(e) {
                e.stopPropagation();
                this.style.transform = '';
                this.click();
            });
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
                
                // Feedback visual
                volumeLevel.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    volumeLevel.style.transform = '';
                }, 200);
            });
        });
    });

    //================ Noise Generator Continuo (Sin Loop) =======================
    let noiseAudioContext = null;
    let noiseSourceNode = null;
    let noiseGainNode = null;
    let noiseFilterNode = null;
    let convolverNode = null;
    let isNoisePlaying = false;
    let noiseBufferSize = 44100; // 1 segundo a 44.1kHz

    document.addEventListener('DOMContentLoaded', function() {
        const startNoiseBtn = document.getElementById('startNoiseBtn');
        const stopNoiseBtn = document.getElementById('stopNoiseBtn');
        const noiseVolumeSlider = document.getElementById('noiseVolumeSlider');
        const noiseVolumeValue = document.getElementById('noiseVolumeValue');
        const reverbSlider = document.getElementById('reverbSlider');
        const reverbValue = document.getElementById('reverbValue');

        // Crear buffer de ruido más largo para sonido continuo
        function generateContinuousNoise(audioContext, type) {
            // Buffer más largo para sonido continuo (10 segundos)
            const bufferSize = audioContext.sampleRate * 10; // 10 segundos
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            switch(type) {
                case 'white':
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    break;
                    
                case 'pink':
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
                    break;
                    
                case 'brown':
                    let lastOut = 0.0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        data[i] = (lastOut + (0.02 * white)) / 1.02;
                        lastOut = data[i];
                        data[i] *= 3.5;
                    }
                    break;
            }
            
            return buffer;
        }

        // Función para crear ruido en tiempo real (streaming)
        function createNoiseStream(audioContext, type) {
            const bufferSize = 4096; // Tamaño del buffer para procesamiento en tiempo real
            const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
            
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            let lastOut = 0.0;
            
            scriptNode.onaudioprocess = function(audioProcessingEvent) {
                const outputBuffer = audioProcessingEvent.outputBuffer;
                const outputData = outputBuffer.getChannelData(0);
                
                switch(type) {
                    case 'white':
                        for (let i = 0; i < bufferSize; i++) {
                            outputData[i] = Math.random() * 2 - 1;
                        }
                        break;
                        
                    case 'pink':
                        for (let i = 0; i < bufferSize; i++) {
                            const white = Math.random() * 2 - 1;
                            b0 = 0.99886 * b0 + white * 0.0555179;
                            b1 = 0.99332 * b1 + white * 0.0750759;
                            b2 = 0.96900 * b2 + white * 0.1538520;
                            b3 = 0.86650 * b3 + white * 0.3104856;
                            b4 = 0.55000 * b4 + white * 0.5329522;
                            b5 = -0.7616 * b5 - white * 0.0168980;
                            outputData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                            b6 = white * 0.115926;
                        }
                        break;
                        
                    case 'brown':
                        for (let i = 0; i < bufferSize; i++) {
                            const white = Math.random() * 2 - 1;
                            outputData[i] = (lastOut + (0.02 * white)) / 1.02;
                            lastOut = outputData[i];
                            outputData[i] *= 3.5;
                        }
                        break;
                }
            };
            
            return scriptNode;
        }

        // Setup filter
        function setupFilter(filterNode, frequencyRange) {
            switch(frequencyRange) {
                case 'low':
                    filterNode.type = 'lowpass';
                    filterNode.frequency.value = 250;
                    filterNode.Q.value = 0.7;
                    break;
                case 'mid':
                    filterNode.type = 'bandpass';
                    filterNode.frequency.value = 1125;
                    filterNode.Q.value = 1;
                    break;
                case 'high':
                    filterNode.type = 'highpass';
                    filterNode.frequency.value = 2000;
                    filterNode.Q.value = 0.7;
                    break;
                default:
                    filterNode.type = 'lowpass';
                    filterNode.frequency.value = 20000;
                    filterNode.Q.value = 0.7;
            }
        }

        // Volume control
        noiseVolumeSlider.addEventListener('input', () => {
            const volume = noiseVolumeSlider.value;
            noiseVolumeValue.textContent = `${volume}%`;
            if (noiseGainNode) {
                noiseGainNode.gain.value = volume / 100;
            }
            
            // Feedback visual
            noiseVolumeValue.style.transform = 'scale(1.1)';
            setTimeout(() => {
                noiseVolumeValue.style.transform = '';
            }, 200);
        });

        // Reverb control
        reverbSlider.addEventListener('input', () => {
            const reverb = reverbSlider.value;
            reverbValue.textContent = `${reverb}%`;
            
            // Feedback visual
            reverbValue.style.transform = 'scale(1.1)';
            setTimeout(() => {
                reverbValue.style.transform = '';
            }, 200);
        });

        // Start noise - Versión mejorada sin loop
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
            
            playContinuousNoise(noiseType, frequencyRange, volume, reverbAmount);
        });
        
        // Touch event optimizado
        startNoiseBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            this.style.transform = 'scale(0.95)';
        });
        
        startNoiseBtn.addEventListener('touchend', function(e) {
            e.stopPropagation();
            this.style.transform = '';
            this.click();
        });

        // Stop noise
        stopNoiseBtn.addEventListener('click', () => {
            stopNoise();
        });
        
        // Touch event optimizado
        stopNoiseBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            this.style.transform = 'scale(0.95)';
        });
        
        stopNoiseBtn.addEventListener('touchend', function(e) {
            e.stopPropagation();
            this.style.transform = '';
            this.click();
        });

        // Función para reproducir ruido continuo (sin loop)
        function playContinuousNoise(type, frequencyRange, volume, reverbAmount) {
            stopNoise();
            
            // Crear nodo de script para ruido en tiempo real
            const scriptNode = createNoiseStream(noiseAudioContext, type);
            
            noiseGainNode = noiseAudioContext.createGain();
            noiseGainNode.gain.value = volume;
            
            noiseFilterNode = noiseAudioContext.createBiquadFilter();
            setupFilter(noiseFilterNode, frequencyRange);
            
            // Conectar nodos
            scriptNode.connect(noiseFilterNode);
            noiseFilterNode.connect(noiseGainNode);
            noiseGainNode.connect(noiseAudioContext.destination);
            
            // Guardar referencia al scriptNode como source
            noiseSourceNode = scriptNode;
            
            isNoisePlaying = true;
            startNoiseBtn.disabled = true;
            stopNoiseBtn.disabled = false;
        }

        function stopNoise() {
            if (noiseSourceNode) {
                noiseSourceNode.disconnect();
                noiseSourceNode = null;
            }
            if (noiseGainNode) {
                noiseGainNode.disconnect();
                noiseGainNode = null;
            }
            if (noiseFilterNode) {
                noiseFilterNode.disconnect();
                noiseFilterNode = null;
            }
            if (convolverNode) {
                convolverNode.disconnect();
                convolverNode = null;
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
        e.stopPropagation();
        this.style.transform = 'scale(0.95)';
    });
    
    document.getElementById('loadPlaylistBtn').addEventListener('touchend', function(e) {
        e.stopPropagation();
        this.style.transform = '';
        this.click();
    });

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
            
            // Feedback visual
            binauralVolumeLevel.style.transform = 'scale(1.1)';
            setTimeout(() => {
                binauralVolumeLevel.style.transform = '';
            }, 200);
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
        
        // Touch event optimizado
        startBinauralBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            this.style.transform = 'scale(0.95)';
        });
        
        startBinauralBtn.addEventListener('touchend', function(e) {
            e.stopPropagation();
            this.style.transform = '';
            this.click();
        });

        // Stop binaural beats
        stopBinauralBtn.addEventListener('click', () => {
            stopBinauralBeats();
        });
        
        // Touch event optimizado
        stopBinauralBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            this.style.transform = 'scale(0.95)';
        });
        
        stopBinauralBtn.addEventListener('touchend', function(e) {
            e.stopPropagation();
            this.style.transform = '';
            this.click();
        });

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
       localStorage.setItem('darkMode', element.classList.contains('dark-mode'));
    }
    
    // Cargar preferencia de dark mode
    document.addEventListener('DOMContentLoaded', function() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    });
    
    // Touch event para dark mode
    document.getElementById('darkModeBtn').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        this.style.transform = 'scale(0.95)';
    });
    
    document.getElementById('darkModeBtn').addEventListener('touchend', function(e) {
        e.stopPropagation();
        this.style.transform = '';
        this.click();
    });