document.addEventListener('DOMContentLoaded', function () {
  // Elementos del DOM para reproductores HTML5
  const audioFile1 = document.getElementById('audio-file-1');
  const audioFile2 = document.getElementById('audio-file-2');
  const html5Audio1 = document.getElementById('html5-audio-1');
  const html5Audio2 = document.getElementById('html5-audio-2');
  const playAudio1 = document.getElementById('play-audio-1');
  const pauseAudio1 = document.getElementById('pause-audio-1');
  const stopAudio1 = document.getElementById('stop-audio-1');
  const playAudio2 = document.getElementById('play-audio-2');
  const pauseAudio2 = document.getElementById('pause-audio-2');
  const stopAudio2 = document.getElementById('stop-audio-2');
  const audioTitle1 = document.getElementById('audio-title-1');
  const audioTitle2 = document.getElementById('audio-title-2');
  const audioDuration1 = document.getElementById('audio-duration-1');
  const audioDuration2 = document.getElementById('audio-duration-2');

  // Elementos para barras de progreso
  const progressFill1 = document.getElementById('progress-fill-1');
  const progressFill2 = document.getElementById('progress-fill-2');
  const progressBar1 = document.getElementById('progress-bar-1');
  const progressBar2 = document.getElementById('progress-bar-2');
  const currentTime1 = document.getElementById('current-time-1');
  const currentTime2 = document.getElementById('current-time-2');
  const totalTime1 = document.getElementById('total-time-1');
  const totalTime2 = document.getElementById('total-time-2');

  // Elementos para generadores de tonos
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

  // Variables de audio para generadores
  let audioContext;
  let masterGain;
  let isPlaying = false;

  // Fuentes de audio activas
  let activeSources = {
    isochronic: null,
    binaural: null,
    noise: null
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

  // ========== FUNCIONALIDAD PARA REPRODUCTORES HTML5 ==========

  // Formatear tiempo en minutos:segundos
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Actualizar barra de progreso
  function updateProgressBar(audioElement, progressFill, currentTimeElement, totalTimeElement) {
    const current = audioElement.currentTime;
    const duration = audioElement.duration || 0;

    // Actualizar barra de progreso
    if (duration > 0) {
      const progressPercent = (current / duration) * 100;
      progressFill.style.width = `${progressPercent}%`;
    }

    // Actualizar tiempos
    currentTimeElement.textContent = formatTime(current);
    if (duration > 0) {
      totalTimeElement.textContent = formatTime(duration);
    }
  }

  // Configurar eventos de progreso para un reproductor
  function setupProgressEvents(audioElement, progressFill, currentTimeElement, totalTimeElement, progressBar) {
    // Actualizar progreso durante la reproducción
    audioElement.addEventListener('timeupdate', function () {
      updateProgressBar(audioElement, progressFill, currentTimeElement, totalTimeElement);
    });

    // Actualizar cuando se carga la metadata
    audioElement.addEventListener('loadedmetadata', function () {
      totalTimeElement.textContent = formatTime(audioElement.duration);
    });

    // Permitir hacer clic en la barra de progreso para saltar a una posición
    progressBar.addEventListener('click', function (e) {
      if (audioElement.duration) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = percent * audioElement.duration;
      }
    });

    // Soporte táctil para la barra de progreso
    progressBar.addEventListener('touchstart', function (e) {
      e.preventDefault();
      if (audioElement.duration) {
        const rect = progressBar.getBoundingClientRect();
        const touch = e.touches[0];
        const percent = (touch.clientX - rect.left) / rect.width;
        audioElement.currentTime = percent * audioElement.duration;
      }
    });
  }

  // Cargar archivo de audio en reproductor HTML5
  function loadHTML5Audio(file, audioElement, titleElement, durationElement, playButton, pauseButton, stopButton, playerNumber) {
    const fileURL = URL.createObjectURL(file);
    audioElement.src = fileURL;

    // Mostrar información del archivo
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    titleElement.textContent = file.name;
    durationElement.textContent = `${fileSizeMB} MB`;

    // Habilitar controles
    playButton.disabled = false;
    pauseButton.disabled = false;
    stopButton.disabled = false;

    // Actualizar estado
    const statusElement = document.getElementById(`status-audio-${playerNumber}`);
    statusElement.textContent = 'Cargado';
    statusElement.className = 'status-active';

    // Configurar evento para cuando se cargue la metadata
    audioElement.addEventListener('loadedmetadata', function () {
      durationElement.textContent = `${formatTime(audioElement.duration)} (${fileSizeMB} MB)`;
    });

    // Configurar eventos de reproducción
    audioElement.addEventListener('play', function () {
      statusElement.textContent = 'Reproduciendo';
      statusElement.className = 'status-active';
    });

    audioElement.addEventListener('pause', function () {
      statusElement.textContent = 'Pausado';
      statusElement.className = 'status-inactive';
    });

    audioElement.addEventListener('ended', function () {
      statusElement.textContent = 'Finalizado';
      statusElement.className = 'status-inactive';
    });
  }

  // Controlar volumen de reproductores HTML5
  function setupVolumeControl(volumeSlider, audioElement, valueDisplay) {
    volumeSlider.addEventListener('input', function () {
      const volume = parseInt(this.value) / 100;
      audioElement.volume = volume;
      valueDisplay.textContent = this.value + '%';

      // Actualizar configuración
      if (volumeSlider.id === 'audio-volume-1') {
        currentConfig.audio.volume1 = volume;
      } else {
        currentConfig.audio.volume2 = volume;
      }
    });
  }

  // Configurar controles de reproducción HTML5
  function setupHTML5Controls(playBtn, pauseBtn, stopBtn, audioElement) {
    playBtn.addEventListener('click', function () {
      audioElement.play();
    });

    pauseBtn.addEventListener('click', function () {
      audioElement.pause();
    });

    stopBtn.addEventListener('click', function () {
      audioElement.pause();
      audioElement.currentTime = 0;
    });

    // Añadir soporte táctil para dispositivos móviles
    [playBtn, pauseBtn, stopBtn].forEach(btn => {
      btn.addEventListener('touchstart', function (e) {
        e.preventDefault();
        this.click();
      });
    });
  }

  // Inicializar reproductores HTML5
  function initHTML5Players() {
    // Reproductor 1
    audioFile1.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 50 * 1024 * 1024) {
          alert('⚠️ Archivo muy grande. Se recomienda usar archivos menores a 50MB para mejor rendimiento.');
        }
        loadHTML5Audio(file, html5Audio1, audioTitle1, audioDuration1,
          playAudio1, pauseAudio1, stopAudio1, 1);
      }
    });

    // Reproductor 2
    audioFile2.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 50 * 1024 * 1024) {
          alert('⚠️ Archivo muy grande. Se recomienda usar archivos menores a 50MB para mejor rendimiento.');
        }
        loadHTML5Audio(file, html5Audio2, audioTitle2, audioDuration2,
          playAudio2, pauseAudio2, stopAudio2, 2);
      }
    });

    // Configurar controles de volumen
    setupVolumeControl(
      document.getElementById('audio-volume-1'),
      html5Audio1,
      document.getElementById('audio-volume-1-value')
    );

    setupVolumeControl(
      document.getElementById('audio-volume-2'),
      html5Audio2,
      document.getElementById('audio-volume-2-value')
    );

    // Configurar controles de reproducción
    setupHTML5Controls(playAudio1, pauseAudio1, stopAudio1, html5Audio1);
    setupHTML5Controls(playAudio2, pauseAudio2, stopAudio2, html5Audio2);

    // Configurar barras de progreso
    setupProgressEvents(
      html5Audio1,
      progressFill1,
      currentTime1,
      totalTime1,
      progressBar1
    );

    setupProgressEvents(
      html5Audio2,
      progressFill2,
      currentTime2,
      totalTime2,
      progressBar2
    );
  }

  // ========== FUNCIONALIDAD PARA GENERADORES DE TONOS ==========

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
  }

  // Selección de patrones
  document.querySelectorAll('.pattern-option').forEach(option => {
    option.addEventListener('click', function () {
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
    option.addEventListener('touchstart', function (e) {
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

    return {oscillator, pulseOscillator, gainNode, modulator};
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

    return {oscillatorLeft, oscillatorRight, gainLeft, gainRight};
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

    return {noiseSource, gainNode, filter};
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
    slider.addEventListener('input', function () {
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
    slider.addEventListener('touchstart', function (e) {
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
    btn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      this.click();
    });
  });

  // Inicializar
  initHTML5Players();
  initCanvas();
  updateDisplayValues();
  updateConfigFromControls();

  // Redimensionar canvas cuando cambie el tamaño de la ventana
  window.addEventListener('resize', initCanvas);

  // Manejar la suspensión/activación de la página en dispositivos móviles
  document.addEventListener('visibilitychange', function () {
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
