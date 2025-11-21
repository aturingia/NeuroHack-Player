 document.addEventListener('DOMContentLoaded', function() {
            // Elementos del DOM
            const startAllBtn = document.getElementById('startAllBtn');
            const stopAllBtn = document.getElementById('stopAllBtn');
            const waveCanvas = document.getElementById('waveCanvas');
            const spectrumCanvas = document.getElementById('spectrumCanvas');
            const waveCtx = waveCanvas.getContext('2d');
            const spectrumCtx = spectrumCanvas.getContext('2d');
            
            // Toggles de activación
            const toggleIsochronic = document.getElementById('toggle-isochronic');
            const toggleBinaural = document.getElementById('toggle-binaural');
            const toggleNoise = document.getElementById('toggle-noise');
            
            // Elementos de estado
            const statusIsochronic = document.getElementById('status-isochronic');
            const statusBinaural = document.getElementById('status-binaural');
            const statusNoise = document.getElementById('status-noise');
            const statusAudio1 = document.getElementById('status-audio-1');
            const statusAudio2 = document.getElementById('status-audio-2');
            
            // Reproductores de Audio
            const audioFile1 = document.getElementById('audio-file-1');
            const audioFile2 = document.getElementById('audio-file-2');
            const playAudio1 = document.getElementById('play-audio-1');
            const pauseAudio1 = document.getElementById('pause-audio-1');
            const stopAudio1 = document.getElementById('stop-audio-1');
            const playAudio2 = document.getElementById('play-audio-2');
            const pauseAudio2 = document.getElementById('pause-audio-2');
            const stopAudio2 = document.getElementById('stop-audio-2');
            const audio1Status = document.getElementById('audio1-status');
            const audio2Status = document.getElementById('audio2-status');
            const audio1NowPlaying = document.getElementById('audio1-now-playing');
            const audio2NowPlaying = document.getElementById('audio2-now-playing');
            
            // Variables de audio
            let audioContext;
            let masterGain;
            let isPlaying = false;
            
            // Fuentes de audio activas
            let activeSources = {
                isochronic: null,
                binaural: null,
                noise: null
            };
            
            // Reproductores de Audio
            let audioPlayers = {
                player1: {
                    audioBuffer: null,
                    source: null,
                    gainNode: null,
                    isPlaying: false,
                    fileName: '',
                    fileSize: 0,
                    duration: 0,
                    startTime: 0,
                    pausedTime: 0
                },
                player2: {
                    audioBuffer: null,
                    source: null,
                    gainNode: null,
                    isPlaying: false,
                    fileName: '',
                    fileSize: 0,
                    duration: 0,
                    startTime: 0,
                    pausedTime: 0
                }
            };
            
            // Analizador
            let analyser = null;
            let dataArray = null;
            let bufferLength = null;
            let animationId = null;
            
            // Configuración actual
            let currentConfig = {
                masterVolume: 0.7,
                isochronic: {
                    active: false,
                    frequency: 440,
                    pulseRate: 10,
                    volume: 0.6,
                    pattern: 'square'
                },
                binaural: {
                    active: false,
                    baseFrequency: 200,
                    deltaFrequency: 10,
                    volume: 0.5,
                    pattern: 'square'
                },
                noise: {
                    active: false,
                    type: 'white',
                    volume: 0.4,
                    filterFreq: 10000
                },
                audio: {
                    volume1: 0.8,
                    volume2: 0.8
                }
            };
            
            // Inicializar canvas
            function initCanvas() {
                waveCanvas.width = waveCanvas.offsetWidth;
                waveCanvas.height = waveCanvas.offsetHeight;
                
                spectrumCanvas.width = spectrumCanvas.offsetWidth;
                spectrumCanvas.height = spectrumCanvas.offsetHeight;
                
                drawStaticWaveform();
                drawStaticSpectrum();
            }
            
            // Dibujar forma de onda estática
            function drawStaticWaveform() {
                const width = waveCanvas.width;
                const height = waveCanvas.height;
                
                waveCtx.clearRect(0, 0, width, height);
                
                // Dibujar eje
                waveCtx.beginPath();
                waveCtx.moveTo(0, height / 2);
                waveCtx.lineTo(width, height / 2);
                waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                waveCtx.stroke();
                
                // Texto de instrucción
                waveCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                waveCtx.font = '16px Arial';
                waveCtx.textAlign = 'center';
                waveCtx.fillText('Activa los generadores y presiona "Iniciar Todo"', width / 2, height / 2);
            }
            
            // Dibujar espectro estático
            function drawStaticSpectrum() {
                const width = spectrumCanvas.width;
                const height = spectrumCanvas.height;
                
                spectrumCtx.clearRect(0, 0, width, height);
                
                // Dibujar eje
                spectrumCtx.beginPath();
                spectrumCtx.moveTo(0, height - 20);
                spectrumCtx.lineTo(width, height - 20);
                spectrumCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                spectrumCtx.stroke();
                
                // Texto de instrucción
                spectrumCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                spectrumCtx.font = '16px Arial';
                spectrumCtx.textAlign = 'center';
                spectrumCtx.fillText('Analizador de espectro en tiempo real', width / 2, height / 2);
            }
            
            // Actualizar valores mostrados
            function updateDisplayValues() {
                // Actualizar volumen general
                document.getElementById('master-volume-value').textContent = 
                    document.getElementById('master-volume').value + '%';
                
                // Actualizar valores isocrónicos
                document.getElementById('iso-frequency-value').textContent = 
                    document.getElementById('iso-frequency').value + ' Hz';
                document.getElementById('iso-pulse-rate-value').textContent = 
                    document.getElementById('iso-pulse-rate').value + ' Hz';
                document.getElementById('iso-volume-value').textContent = 
                    document.getElementById('iso-volume').value + '%';
                
                // Actualizar valores bineurales
                document.getElementById('bin-base-frequency-value').textContent = 
                    document.getElementById('bin-base-frequency').value + ' Hz';
                document.getElementById('bin-delta-frequency-value').textContent = 
                    document.getElementById('bin-delta-frequency').value + ' Hz';
                document.getElementById('bin-volume-value').textContent = 
                    document.getElementById('bin-volume').value + '%';
                
                // Actualizar valores de ruido
                document.getElementById('noise-volume-value').textContent = 
                    document.getElementById('noise-volume').value + '%';
                document.getElementById('noise-filter-value').textContent = 
                    document.getElementById('noise-filter').value + ' Hz';
                
                // Actualizar valores Audio
                document.getElementById('audio-volume-1-value').textContent = 
                    document.getElementById('audio-volume-1').value + '%';
                document.getElementById('audio-volume-2-value').textContent = 
                    document.getElementById('audio-volume-2').value + '%';
            }
            
            // Actualizar configuración desde controles
            function updateConfigFromControls() {
                // Volumen general
                currentConfig.masterVolume = parseInt(document.getElementById('master-volume').value) / 100;
                if (masterGain) {
                    masterGain.gain.value = currentConfig.masterVolume;
                }
                
                // Configuración isocrónica
                currentConfig.isochronic.active = toggleIsochronic.checked;
                currentConfig.isochronic.frequency = parseFloat(document.getElementById('iso-frequency').value);
                currentConfig.isochronic.pulseRate = parseFloat(document.getElementById('iso-pulse-rate').value);
                currentConfig.isochronic.volume = parseInt(document.getElementById('iso-volume').value) / 100;
                
                // Configuración bineural
                currentConfig.binaural.active = toggleBinaural.checked;
                currentConfig.binaural.baseFrequency = parseFloat(document.getElementById('bin-base-frequency').value);
                currentConfig.binaural.deltaFrequency = parseFloat(document.getElementById('bin-delta-frequency').value);
                currentConfig.binaural.volume = parseInt(document.getElementById('bin-volume').value) / 100;
                
                // Configuración de ruido
                currentConfig.noise.active = toggleNoise.checked;
                currentConfig.noise.volume = parseInt(document.getElementById('noise-volume').value) / 100;
                currentConfig.noise.filterFreq = parseInt(document.getElementById('noise-filter').value);
                
                // Configuración Audio
                currentConfig.audio.volume1 = parseInt(document.getElementById('audio-volume-1').value) / 100;
                currentConfig.audio.volume2 = parseInt(document.getElementById('audio-volume-2').value) / 100;
                
                // Actualizar volumen de los reproductores de audio
                if (audioPlayers.player1.gainNode) {
                    audioPlayers.player1.gainNode.gain.value = currentConfig.audio.volume1;
                }
                if (audioPlayers.player2.gainNode) {
                    audioPlayers.player2.gainNode.gain.value = currentConfig.audio.volume2;
                }
            }
            
            // Selección de patrones
            document.querySelectorAll('.pattern-option').forEach(option => {
                option.addEventListener('click', function() {
                    const generator = this.getAttribute('data-generator');
                    const container = this.closest('.pattern-selector');
                    
                    container.querySelectorAll('.pattern-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    if (this.hasAttribute('data-pattern')) {
                        currentConfig[generator].pattern = this.getAttribute('data-pattern');
                    } else if (this.hasAttribute('data-noise')) {
                        currentConfig.noise.type = this.getAttribute('data-noise');
                    }
                    
                    // Si está reproduciendo, reiniciar con nueva configuración
                    if (isPlaying) {
                        stopAllAudio();
                        setTimeout(startAllAudio, 100);
                    }
                });
                
                // Añadir soporte táctil para dispositivos móviles
                option.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    this.click();
                });
            });
            
            // Inicializar audio con compatibilidad para navegadores antiguos
            function initAudio() {
                if (!audioContext) {
                    // Compatibilidad con navegadores antiguos
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (!AudioContext) {
                        alert('Tu navegador no soporta la API de Audio Web. Por favor, actualiza a un navegador más moderno.');
                        return;
                    }
                    
                    audioContext = new AudioContext();
                    
                    // Crear nodo de ganancia maestro
                    masterGain = audioContext.createGain();
                    masterGain.gain.value = currentConfig.masterVolume;
                    masterGain.connect(audioContext.destination);
                    
                    // Configurar analizador
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 2048;
                    bufferLength = analyser.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                    
                    // Conectar analizador al output maestro
                    masterGain.connect(analyser);
                }
            }
            
            // Crear tono isocrónico
            function createIsochronicTone() {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(masterGain);
                
                oscillator.frequency.value = currentConfig.isochronic.frequency;
                oscillator.type = currentConfig.isochronic.pattern;
                
                // Configurar modulación de ganancia para crear pulsos
                const pulseRate = currentConfig.isochronic.pulseRate;
                
                // Crear nodo de ganancia moduladora
                const modulator = audioContext.createGain();
                modulator.gain.value = 0;
                
                // Crear oscilador modulador (para el pulso)
                const pulseOscillator = audioContext.createOscillator();
                pulseOscillator.type = 'square';
                pulseOscillator.frequency.value = pulseRate;
                pulseOscillator.connect(modulator.gain);
                
                // Conectar el oscilador principal a través del modulador
                oscillator.connect(modulator);
                modulator.connect(gainNode);
                
                // Ajustar el volumen
                gainNode.gain.value = currentConfig.isochronic.volume;
                
                // Iniciar osciladores
                oscillator.start();
                pulseOscillator.start();
                
                return { oscillator, pulseOscillator, gainNode, modulator };
            }
            
            // Crear tonos bineurales
            function createBinauralTones() {
                // Crear osciladores para izquierda y derecha
                const oscillatorLeft = audioContext.createOscillator();
                const oscillatorRight = audioContext.createOscillator();
                
                // Crear nodos de ganancia
                const gainLeft = audioContext.createGain();
                const gainRight = audioContext.createGain();
                
                // Configurar panorámica
                const pannerLeft = audioContext.createStereoPanner();
                pannerLeft.pan.value = -1; // Completamente a la izquierda
                
                const pannerRight = audioContext.createStereoPanner();
                pannerRight.pan.value = 1; // Completamente a la derecha
                
                // Conectar todo
                oscillatorLeft.connect(gainLeft);
                gainLeft.connect(pannerLeft);
                pannerLeft.connect(masterGain);
                
                oscillatorRight.connect(gainRight);
                gainRight.connect(pannerRight);
                pannerRight.connect(masterGain);
                
                // Configurar frecuencias
                oscillatorLeft.frequency.value = currentConfig.binaural.baseFrequency;
                oscillatorRight.frequency.value = currentConfig.binaural.baseFrequency + currentConfig.binaural.deltaFrequency;
                
                // Configurar tipo de onda
                oscillatorLeft.type = currentConfig.binaural.pattern;
                oscillatorRight.type = currentConfig.binaural.pattern;
                
                // Configurar volumen
                gainLeft.gain.value = currentConfig.binaural.volume;
                gainRight.gain.value = currentConfig.binaural.volume;
                
                // Iniciar osciladores
                oscillatorLeft.start();
                oscillatorRight.start();
                
                return { oscillatorLeft, oscillatorRight, gainLeft, gainRight };
            }
            
            // Crear ruido
            function createNoise() {
                const bufferSize = 2 * audioContext.sampleRate;
                const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                
                // Generar ruido
                if (currentConfig.noise.type === 'white') {
                    // Ruido blanco
                    for (let i = 0; i < bufferSize; i++) {
                        output[i] = Math.random() * 2 - 1;
                    }
                } else {
                    // Ruido rosa (aproximación)
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
                        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                        output[i] *= 0.11; // Ajustar ganancia
                        b6 = white * 0.115926;
                    }
                }
                
                const noiseSource = audioContext.createBufferSource();
                noiseSource.buffer = noiseBuffer;
                noiseSource.loop = true;
                
                // Aplicar filtro
                const filter = audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = currentConfig.noise.filterFreq;
                
                // Conectar
                noiseSource.connect(filter);
                
                // Configurar volumen
                const gainNode = audioContext.createGain();
                filter.connect(gainNode);
                gainNode.gain.value = currentConfig.noise.volume;
                gainNode.connect(masterGain);
                
                // Iniciar
                noiseSource.start();
                
                return { noiseSource, gainNode, filter };
            }
            
            // Decodificador de audio optimizado
            class FastAudioDecoder {
                constructor() {
                    this.worker = null;
                    this.initWorker();
                }
                
                initWorker() {
                    // Crear un worker en línea para el procesamiento de audio
                    const workerCode = `
                        self.onmessage = function(e) {
                            const { audioData, type } = e.data;
                            
                            if (type === 'decode') {
                                // Simular decodificación rápida
                                // En un caso real, aquí se usaría una librería de decodificación
                                setTimeout(() => {
                                    self.postMessage({ 
                                        success: true, 
                                        audioData: audioData,
                                        decoded: true 
                                    });
                                }, 100);
                            }
                        };
                    `;
                    
                    const blob = new Blob([workerCode], { type: 'application/javascript' });
                    this.worker = new Worker(URL.createObjectURL(blob));
                }
                
                decodeAudioData(audioData, onSuccess, onError) {
                    if (!this.worker) {
                        this.initWorker();
                    }
                    
                    this.worker.onmessage = function(e) {
                        if (e.data.success) {
                            onSuccess(e.data.audioData);
                        } else {
                            onError(new Error('Error en el worker de audio'));
                        }
                    };
                    
                    this.worker.postMessage({
                        type: 'decode',
                        audioData: audioData
                    });
                }
            }
            
            // Instancia global del decodificador
            const audioDecoder = new FastAudioDecoder();
            
            // Cargar y preparar archivo de audio optimizado
            function loadAudioOptimized(file, player, playerNumber) {
                return new Promise((resolve, reject) => {
                    const progressFill = document.getElementById(`progress-fill-${playerNumber}`);
                    const progressText = document.getElementById(`progress-text-${playerNumber}`);
                    const fileInfo = document.getElementById(`file-info-${playerNumber}`);
                    const fileDuration = document.getElementById(`file-duration-${playerNumber}`);
                    
                    // Mostrar información del archivo
                    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    const fileExtension = file.name.split('.').pop().toUpperCase();
                    fileInfo.textContent = `${file.name} (${fileSizeMB} MB, ${fileExtension})`;
                    
                    // Mostrar progreso de carga optimizado
                    progressText.innerHTML = `<span class="loading-spinner"></span> Cargando...`;
                    progressFill.style.width = '10%';
                    
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        progressFill.style.width = '50%';
                        progressText.innerHTML = `<span class="loading-spinner"></span> Procesando audio...`;
                        
                        const audioData = e.target.result;
                        
                        // Usar el decodificador optimizado
                        audioDecoder.decodeAudioData(
                            audioData,
                            // onSuccess
                            function(decodedData) {
                                // Crear buffer de audio (simulado - en realidad usaríamos decodedData)
                                initAudio();
                                
                                audioContext.decodeAudioData(audioData, function(buffer) {
                                    player.audioBuffer = buffer;
                                    player.fileName = file.name;
                                    player.fileSize = file.size;
                                    player.duration = buffer.duration;
                                    
                                    // Mostrar duración
                                    const minutes = Math.floor(buffer.duration / 60);
                                    const seconds = Math.floor(buffer.duration % 60);
                                    fileDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                    
                                    progressFill.style.width = '100%';
                                    progressText.textContent = '✅ Archivo listo!';
                                    
                                    // Habilitar controles de reproducción
                                    const playBtn = document.getElementById(`play-audio-${playerNumber}`);
                                    const pauseBtn = document.getElementById(`pause-audio-${playerNumber}`);
                                    const stopBtn = document.getElementById(`stop-audio-${playerNumber}`);
                                    
                                    playBtn.disabled = false;
                                    pauseBtn.disabled = false;
                                    stopBtn.disabled = false;
                                    
                                    // Actualizar estado
                                    const statusElement = document.getElementById(`audio${playerNumber}-status`);
                                    statusElement.textContent = 'Archivo listo para reproducir';
                                    
                                    resolve();
                                }, function(err) {
                                    progressText.textContent = '❌ Error al procesar el archivo';
                                    progressFill.style.width = '0%';
                                    reject(err);
                                });
                            },
                            // onError
                            function(err) {
                                progressText.textContent = '❌ Error en el decodificador';
                                progressFill.style.width = '0%';
                                reject(err);
                            }
                        );
                    };
                    
                    reader.onerror = function(err) {
                        progressText.textContent = '❌ Error al leer el archivo';
                        progressFill.style.width = '0%';
                        reject(err);
                    };
                    
                    // Leer el archivo como ArrayBuffer
                    reader.readAsArrayBuffer(file);
                });
            }
            
            // Reproducir audio
            function playAudio(player, playerNumber) {
                if (!player.audioBuffer || player.isPlaying) return;
                
                initAudio();
                
                // Crear nueva fuente de audio
                player.source = audioContext.createBufferSource();
                player.source.buffer = player.audioBuffer;
                player.source.loop = true;
                
                // Crear nodo de ganancia
                player.gainNode = audioContext.createGain();
                player.gainNode.gain.value = playerNumber === 1 ? 
                    currentConfig.audio.volume1 : currentConfig.audio.volume2;
                
                // Conectar
                player.source.connect(player.gainNode);
                player.gainNode.connect(masterGain);
                
                // Iniciar reproducción
                player.startTime = audioContext.currentTime;
                player.source.start();
                player.isPlaying = true;
                
                // Actualizar estado
                const statusElement = document.getElementById(`status-audio-${playerNumber}`);
                const nowPlayingElement = document.getElementById(`audio${playerNumber}-now-playing`);
                const statusTextElement = document.getElementById(`audio${playerNumber}-status`);
                
                statusElement.textContent = 'Reproduciendo';
                statusElement.className = 'status-active';
                nowPlayingElement.textContent = `Reproduciendo: ${player.fileName}`;
                statusTextElement.textContent = 'Reproduciendo';
            }
            
            // Pausar audio
            function pauseAudio(player, playerNumber) {
                if (!player.source || !player.isPlaying) return;
                
                // Guardar el tiempo actual
                player.pausedTime = audioContext.currentTime - player.startTime;
                
                // Detener la fuente
                player.source.stop();
                player.isPlaying = false;
                
                // Actualizar estado
                const statusElement = document.getElementById(`status-audio-${playerNumber}`);
                const nowPlayingElement = document.getElementById(`audio${playerNumber}-now-playing`);
                const statusTextElement = document.getElementById(`audio${playerNumber}-status`);
                
                statusElement.textContent = 'Pausado';
                statusElement.className = 'status-inactive';
                nowPlayingElement.textContent = `Pausado: ${player.fileName}`;
                statusTextElement.textContent = 'Pausado';
            }
            
            // Detener audio
            function stopAudio(player, playerNumber) {
                if (!player.source) return;
                
                player.source.stop();
                player.isPlaying = false;
                player.pausedTime = 0;
                player.source = null;
                
                // Actualizar estado
                const statusElement = document.getElementById(`status-audio-${playerNumber}`);
                const nowPlayingElement = document.getElementById(`audio${playerNumber}-now-playing`);
                const statusTextElement = document.getElementById(`audio${playerNumber}-status`);
                
                statusElement.textContent = 'Inactivo';
                statusElement.className = 'status-inactive';
                nowPlayingElement.textContent = '';
                statusTextElement.textContent = 'Archivo cargado';
            }
            
            // Iniciar todos los generadores activos
            function startAllAudio() {
                if (isPlaying) return;
                
                initAudio();
                updateConfigFromControls();
                
                // Iniciar generadores activos
                if (currentConfig.isochronic.active) {
                    activeSources.isochronic = createIsochronicTone();
                    statusIsochronic.textContent = 'Activo';
                    statusIsochronic.className = 'status-active';
                }
                
                if (currentConfig.binaural.active) {
                    activeSources.binaural = createBinauralTones();
                    statusBinaural.textContent = 'Activo';
                    statusBinaural.className = 'status-active';
                }
                
                if (currentConfig.noise.active) {
                    activeSources.noise = createNoise();
                    statusNoise.textContent = 'Activo';
                    statusNoise.className = 'status-active';
                }
                
                isPlaying = true;
                startAllBtn.disabled = true;
                stopAllBtn.disabled = false;
                
                // Iniciar visualización
                drawWaveform();
                drawSpectrum();
            }
            
            // Detener todos los generadores
            function stopAllAudio() {
                if (!isPlaying) return;
                
                // Detener todos los generadores activos
                if (activeSources.isochronic) {
                    activeSources.isochronic.oscillator.stop();
                    activeSources.isochronic.pulseOscillator.stop();
                    activeSources.isochronic = null;
                    statusIsochronic.textContent = 'Inactivo';
                    statusIsochronic.className = 'status-inactive';
                }
                
                if (activeSources.binaural) {
                    activeSources.binaural.oscillatorLeft.stop();
                    activeSources.binaural.oscillatorRight.stop();
                    activeSources.binaural = null;
                    statusBinaural.textContent = 'Inactivo';
                    statusBinaural.className = 'status-inactive';
                }
                
                if (activeSources.noise) {
                    activeSources.noise.noiseSource.stop();
                    activeSources.noise = null;
                    statusNoise.textContent = 'Inactivo';
                    statusNoise.className = 'status-inactive';
                }
                
                // Detener reproductores de audio
                stopAudio(audioPlayers.player1, 1);
                stopAudio(audioPlayers.player2, 2);
                
                isPlaying = false;
                startAllBtn.disabled = false;
                stopAllBtn.disabled = true;
                
                // Detener animación
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                
                // Limpiar visualización
                drawStaticWaveform();
                drawStaticSpectrum();
            }
            
            // Dibujar forma de onda
            function drawWaveform() {
                if (!isPlaying) return;
                
                analyser.getByteTimeDomainData(dataArray);
                
                const width = waveCanvas.width;
                const height = waveCanvas.height;
                
                waveCtx.clearRect(0, 0, width, height);
                
                // Dibujar eje
                waveCtx.beginPath();
                waveCtx.moveTo(0, height / 2);
                waveCtx.lineTo(width, height / 2);
                waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                waveCtx.stroke();
                
                // Dibujar forma de onda
                waveCtx.beginPath();
                
                const sliceWidth = width / bufferLength;
                let x = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * height / 2;
                    
                    if (i === 0) {
                        waveCtx.moveTo(x, y);
                    } else {
                        waveCtx.lineTo(x, y);
                    }
                    
                    x += sliceWidth;
                }
                
                waveCtx.lineTo(width, height / 2);
                waveCtx.strokeStyle = '#00c6fb';
                waveCtx.lineWidth = 2;
                waveCtx.stroke();
                
                animationId = requestAnimationFrame(drawWaveform);
            }
            
            // Dibujar espectro de frecuencia
            function drawSpectrum() {
                if (!isPlaying) return;
                
                analyser.getByteFrequencyData(dataArray);
                
                const width = spectrumCanvas.width;
                const height = spectrumCanvas.height;
                
                spectrumCtx.clearRect(0, 0, width, height);
                
                // Dibujar fondo de barras
                const barWidth = (width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] / 255) * height;
                    
                    // Color basado en la frecuencia (arcoíris)
                    const hue = i / bufferLength * 360;
                    spectrumCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    
                    spectrumCtx.fillRect(x, height - barHeight, barWidth, barHeight);
                    
                    x += barWidth + 1;
                }
                
                animationId = requestAnimationFrame(drawSpectrum);
            }
            
            // Event listeners para controles deslizantes
            document.querySelectorAll('input[type="range"]').forEach(slider => {
                slider.addEventListener('input', function() {
                    updateDisplayValues();
                    updateConfigFromControls();
                    
                    // Actualizar en tiempo real si está reproduciendo
                    if (isPlaying) {
                        // Actualizar volumen general
                        if (this.id === 'master-volume' && masterGain) {
                            masterGain.gain.value = currentConfig.masterVolume;
                        }
                        
                        // Actualizar generadores individuales
                        if (activeSources.isochronic && this.id.startsWith('iso-')) {
                            stopAllAudio();
                            setTimeout(startAllAudio, 100);
                        }
                        
                        if (activeSources.binaural && this.id.startsWith('bin-')) {
                            stopAllAudio();
                            setTimeout(startAllAudio, 100);
                        }
                        
                        if (activeSources.noise && (this.id.startsWith('noise-') || this.id === 'noise-filter')) {
                            stopAllAudio();
                            setTimeout(startAllAudio, 100);
                        }
                    }
                });
                
                // Añadir soporte táctil para dispositivos móviles
                slider.addEventListener('touchstart', function(e) {
                    // Permitir que el evento continúe
                });
            });
            
            // Event listeners para toggles
            toggleIsochronic.addEventListener('change', updateConfigFromControls);
            toggleBinaural.addEventListener('change', updateConfigFromControls);
            toggleNoise.addEventListener('change', updateConfigFromControls);
            
            // Event listeners para botones
            startAllBtn.addEventListener('click', startAllAudio);
            stopAllBtn.addEventListener('click', stopAllAudio);
            
            // Añadir soporte táctil para botones en dispositivos móviles
            [startAllBtn, stopAllBtn].forEach(btn => {
                btn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    this.click();
                });
            });
            
            // Event listeners para reproductores de audio
            audioFile1.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Verificar tamaño del archivo
                    if (file.size > 50 * 1024 * 1024) { // 50MB límite
                        alert('⚠️ Archivo muy grande. Se recomienda usar archivos menores a 50MB para mejor rendimiento.');
                    }
                    
                    loadAudioOptimized(file, audioPlayers.player1, 1)
                        .catch(err => {
                            console.error('Error al cargar el archivo:', err);
                            document.getElementById('progress-text-1').textContent = '❌ Error al cargar el archivo';
                        });
                }
            });
            
            audioFile2.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Verificar tamaño del archivo
                    if (file.size > 50 * 1024 * 1024) { // 50MB límite
                        alert('⚠️ Archivo muy grande. Se recomienda usar archivos menores a 50MB para mejor rendimiento.');
                    }
                    
                    loadAudioOptimized(file, audioPlayers.player2, 2)
                        .catch(err => {
                            console.error('Error al cargar el archivo:', err);
                            document.getElementById('progress-text-2').textContent = '❌ Error al cargar el archivo';
                        });
                }
            });
            
            playAudio1.addEventListener('click', function() {
                playAudio(audioPlayers.player1, 1);
            });
            
            pauseAudio1.addEventListener('click', function() {
                pauseAudio(audioPlayers.player1, 1);
            });
            
            stopAudio1.addEventListener('click', function() {
                stopAudio(audioPlayers.player1, 1);
            });
            
            playAudio2.addEventListener('click', function() {
                playAudio(audioPlayers.player2, 2);
            });
            
            pauseAudio2.addEventListener('click', function() {
                pauseAudio(audioPlayers.player2, 2);
            });
            
            stopAudio2.addEventListener('click', function() {
                stopAudio(audioPlayers.player2, 2);
            });
            
            // Añadir soporte táctil para controles de audio
            [playAudio1, pauseAudio1, stopAudio1, playAudio2, pauseAudio2, stopAudio2].forEach(btn => {
                btn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    this.click();
                });
            });
            
            // Inicializar
            initCanvas();
            updateDisplayValues();
            updateConfigFromControls();
            
            // Redimensionar canvas cuando cambie el tamaño de la ventana
            window.addEventListener('resize', initCanvas);
            
            // Manejar la suspensión/activación de la página en dispositivos móviles
            document.addEventListener('visibilitychange', function() {
                if (document.hidden && isPlaying) {
                    // Pausar audio cuando la pestaña no está visible
                    stopAllAudio();
                }
            });
        });
        
        //================ Youtube-Player =================
        function loadPlaylist() {
            var playlistURL = document.getElementById('playlistURL').value;
            if (!playlistURL) {
                alert('Por favor, introduce una URL de lista de reproducción de YouTube');
                return;
            }
            
            var playlistID = playlistURL.split('list=')[1];
            if (!playlistID) {
                alert('URL de lista de reproducción no válida');
                return;
            }
            
            var playerDiv = document.getElementById('player');
            playerDiv.innerHTML = '<iframe width="100%" height="315" src="https://www.youtube.com/embed/videoseries?list=' + playlistID + '&autoplay=1&loop=0&mute=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        }