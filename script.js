let _treasuryTooltipEl = null;

function hideTreasuryTooltip() {
  if (_treasuryTooltipEl && _treasuryTooltipEl.parentNode) {
    _treasuryTooltipEl.parentNode.removeChild(_treasuryTooltipEl);
  }
  _treasuryTooltipEl = null;
}
/* Medieval Pixel Idle - core logic */

// ======= Background Music System =======
let musicVolume = 50; // 0-100
const MUSIC_VOLUME_KEY = 'mpi_music_volume';
// Общий множитель громкости для уменьшения изначальной громкости
// Уменьшено до 0.1 (в 10 раз) для более комфортной громкости
const MUSIC_VOLUME_MULTIPLIER = 0.1;
let backgroundMusic = null;

// ======= Sound Effects System =======
// Громкость звуковых эффектов (0-100)
let soundEffectsVolume = 50;
const SOUND_EFFECTS_VOLUME_KEY = 'mpi_sound_effects_volume';

// Звуковые эффекты для событий игры
const soundEffects = {
  spider: 'music/spider.mp3',
  barmatun: 'music/barmatun.mp3',
  barmatunBuff: 'music/barmatun baff.mp3',
  king: 'music/king.mp3',
  kingBuff: 'music/king buff.mp3',
  spiderSquish: 'music/spider squish.mp3',
  spiderBuff: 'music/spider buff.mp3',
  debuff: 'music/debuff.mp3',
  clickGold: 'music/click gold.mp3',
  clickBroken: 'music/click broken.mp3',
  archer: 'music/archer.mp3'
};

// Кэш для аудио элементов звуков
const soundCache = {};

// Загружаем настройку громкости звуковых эффектов из localStorage
function loadSoundEffectsVolume() {
  const stored = localStorage.getItem(SOUND_EFFECTS_VOLUME_KEY);
  if (stored !== null) {
    const vol = parseInt(stored, 10);
    if (!isNaN(vol) && vol >= 0 && vol <= 100) {
      soundEffectsVolume = vol;
    }
  }
}

// Сохраняем настройку громкости звуковых эффектов
function saveSoundEffectsVolume() {
  localStorage.setItem(SOUND_EFFECTS_VOLUME_KEY, String(soundEffectsVolume));
}

// Обновляем громкость всех звуковых эффектов
function updateSoundEffectsVolume() {
  // Обновляем громкость для всех закэшированных звуков
  Object.values(soundCache).forEach(audio => {
    if (audio) {
      audio.volume = soundEffectsVolume / 100;
    }
  });
}

// Воспроизведение звукового эффекта
function playSound(soundName) {
  if (!soundEffects[soundName]) {
    console.warn('Sound effect not found:', soundName);
    return;
  }
  
  try {
    // Используем кэш для избежания повторной загрузки
    let audio = soundCache[soundName];
    if (!audio) {
      audio = new Audio(soundEffects[soundName]);
      soundCache[soundName] = audio;
    }
    
    // Устанавливаем текущую громкость
    audio.volume = soundEffectsVolume / 100;
    
    // Сбрасываем время воспроизведения и играем
    audio.currentTime = 0;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Игнорируем ошибки автовоспроизведения (браузер может блокировать)
        console.warn('Sound playback failed:', error);
      });
    }
  } catch (e) {
    console.warn('Error playing sound:', e);
  }
}

// Инициализация громкости звуковых эффектов при загрузке
loadSoundEffectsVolume();

// Загружаем настройку громкости из localStorage
function loadMusicVolume() {
  const stored = localStorage.getItem(MUSIC_VOLUME_KEY);
  if (stored !== null) {
    const vol = parseInt(stored, 10);
    if (!isNaN(vol) && vol >= 0 && vol <= 100) {
      musicVolume = vol;
    }
  }
}

// Сохраняем настройку громкости
function saveMusicVolume() {
  localStorage.setItem(MUSIC_VOLUME_KEY, String(musicVolume));
}

// Инициализация музыки при загрузке
loadMusicVolume();

// Используем HTML5 Audio элемент для воспроизведения музыки
let musicAudioElement = null;
let musicIsPlaying = false;

// Список файлов музыки для циклического воспроизведения
// Поддерживаются форматы: mp3, ogg, wav
const musicFiles = [
  'music/medieval1.mp3',
  'music/medieval2.mp3',
  'music/medieval3.mp3'
];
let currentMusicIndex = 0;
let musicLoadErrorCount = 0;

function loadNextMusic() {
  if (!musicAudioElement || musicFiles.length === 0) return;
  
  // Загружаем следующий файл
  musicAudioElement.src = musicFiles[currentMusicIndex];
  musicAudioElement.load();
  console.log('Loading music:', musicFiles[currentMusicIndex]);
}

function initBackgroundMusic() {
  musicAudioElement = document.getElementById('background-music');
  if (!musicAudioElement) {
    console.warn('Background music element not found');
    return;
  }
  
  // Выбираем случайный трек для начала воспроизведения
  if (musicFiles.length > 0) {
    currentMusicIndex = Math.floor(Math.random() * musicFiles.length);
    console.log('Starting with random track:', musicFiles[currentMusicIndex]);
  }
  
  // Устанавливаем начальную громкость
  updateMusicVolume();
  
  // Обработка окончания трека - переключаем на следующий
  musicAudioElement.addEventListener('ended', () => {
    console.log('Music track ended, switching to next');
    currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length;
    loadNextMusic();
    if (musicIsPlaying) {
      startBackgroundMusic();
    }
  });
  
  // Обработка ошибок загрузки
  musicAudioElement.addEventListener('error', (e) => {
    musicLoadErrorCount++;
    console.warn('Music loading error:', musicFiles[currentMusicIndex], e);
    
    // Пытаемся загрузить следующий файл
    currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length;
    
    // Если все файлы не загрузились (прошли полный круг), используем программную генерацию
    if (musicLoadErrorCount >= musicFiles.length) {
      console.log('All music files failed, using programmatic medieval music generation');
      setTimeout(() => {
        if (!musicIsPlaying) {
          useProgrammaticMedievalMusic();
        }
      }, 1000);
      return;
    }
    
    // Пытаемся загрузить следующий файл
    loadNextMusic();
    if (musicIsPlaying) {
      startBackgroundMusic();
    }
  });
  
  // Обработка успешной загрузки
  musicAudioElement.addEventListener('canplaythrough', () => {
    console.log('Music loaded successfully:', musicFiles[currentMusicIndex]);
    musicLoadErrorCount = 0; // Сбрасываем счетчик ошибок при успешной загрузке
    if (!musicIsPlaying) {
      startBackgroundMusic();
    }
  });
  
  // Загружаем случайный файл
  loadNextMusic();
  
  // Запускаем музыку при первом взаимодействии пользователя (клик, нажатие клавиши)
  const startMusicOnInteraction = () => {
    if (!musicIsPlaying && musicAudioElement) {
      startBackgroundMusic();
    }
    // Удаляем обработчики после первого запуска
    document.removeEventListener('click', startMusicOnInteraction);
    document.removeEventListener('keydown', startMusicOnInteraction);
  };
  
  // Всегда добавляем обработчики для запуска музыки при взаимодействии
  document.addEventListener('click', startMusicOnInteraction, { once: true });
  document.addEventListener('keydown', startMusicOnInteraction, { once: true });
}

function startBackgroundMusic() {
  if (!musicAudioElement) {
    console.warn('Music audio element not available');
    return;
  }
  
  // Устанавливаем громкость перед воспроизведением (даже если она 0%)
  updateMusicVolume();
  
  // Пытаемся воспроизвести музыку (даже при громкости 0%)
  const playPromise = musicAudioElement.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        musicIsPlaying = true;
        console.log('Music started successfully (volume:', musicVolume + '%)');
        updateMusicVolume(); // Устанавливаем громкость после начала воспроизведения
      })
      .catch(error => {
        // Автовоспроизведение заблокировано браузером
        console.warn('Music autoplay blocked:', error);
        // Музыка начнется после взаимодействия пользователя
        musicIsPlaying = false;
      });
  } else {
    // Старые браузеры могут не возвращать Promise
    musicIsPlaying = true;
    console.log('Music started (legacy browser, volume:', musicVolume + '%)');
  }
}

function stopBackgroundMusic() {
  if (useProgrammaticMusicFlag) {
    // Останавливаем программную музыку
    if (musicTimeoutId) {
      clearTimeout(musicTimeoutId);
      musicTimeoutId = null;
    }
    if (musicAudioContext) {
      try {
        musicAudioContext.close();
      } catch (e) {}
      musicAudioContext = null;
    }
    useProgrammaticMusicFlag = false;
  } else if (musicAudioElement) {
    musicAudioElement.pause();
    musicAudioElement.currentTime = 0;
  }
  musicIsPlaying = false;
}

function updateMusicVolume() {
  if (musicAudioElement) {
    // Преобразуем громкость из 0-100 в 0-1 и применяем множитель для уменьшения громкости
    musicAudioElement.volume = (musicVolume / 100) * MUSIC_VOLUME_MULTIPLIER;
  }
}

// Fallback: программная генерация средневековой музыки
let musicTimeoutId = null;
let musicAudioContext = null;
let useProgrammaticMusicFlag = false;

function useProgrammaticMedievalMusic() {
  if (useProgrammaticMusicFlag) return;
  
  useProgrammaticMusicFlag = true;
  stopBackgroundMusic(); // Останавливаем HTML5 audio
  
  try {
    musicAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Аутентичная средневековая мелодия в дорийском ладу (Dorian mode)
    // Характерные интервалы и ритмы средневековой музыки
    const notes = [
      // Первая фраза - медленная и торжественная
      { freq: 196.00, duration: 1.2 }, // G3 - басовая нота
      { freq: 220.00, duration: 0.6 }, // A3
      { freq: 246.94, duration: 0.6 }, // B3
      { freq: 261.63, duration: 1.0 }, // C4
      { freq: 293.66, duration: 1.4 }, // D4 - тоника дорийского лада
      { freq: 329.63, duration: 0.8 }, // E4
      { freq: 293.66, duration: 0.8 }, // D4
      { freq: 261.63, duration: 1.0 }, // C4
      // Вторая фраза - развитие темы
      { freq: 293.66, duration: 0.8 }, // D4
      { freq: 329.63, duration: 0.8 }, // E4
      { freq: 349.23, duration: 0.6 }, // F4
      { freq: 392.00, duration: 1.6 }, // G4 - кульминация
      { freq: 349.23, duration: 0.8 }, // F4
      { freq: 329.63, duration: 0.8 }, // E4
      { freq: 293.66, duration: 1.2 }, // D4
      // Третья фраза - возврат к началу
      { freq: 261.63, duration: 0.8 }, // C4
      { freq: 246.94, duration: 0.8 }, // B3
      { freq: 220.00, duration: 1.0 }, // A3
      { freq: 196.00, duration: 1.8 }  // G3 - завершение
    ];
    
    let currentTime = musicAudioContext.currentTime;
    const totalDuration = notes.reduce((sum, note) => sum + note.duration, 0);
    const volumeMultiplier = musicVolume / 100;
    
    function playSequence() {
      if (!musicAudioContext || useProgrammaticMusicFlag === false) {
        return;
      }
      
      notes.forEach((note) => {
        const oscillator = musicAudioContext.createOscillator();
        const gainNode = musicAudioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(musicAudioContext.destination);
        
        oscillator.frequency.value = note.freq;
        // Используем более мягкий тип волны для средневекового звучания
        oscillator.type = 'triangle'; // Более мягкий звук, чем sine
        
        // Уменьшаем базовую громкость в 2 раза (0.08 -> 0.04) и применяем множитель пользователя
        const baseVolume = 0.04 * volumeMultiplier;
        // Более плавное нарастание и затухание для аутентичного звучания
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(baseVolume, currentTime + 0.15);
        gainNode.gain.linearRampToValueAtTime(baseVolume, currentTime + note.duration - 0.15);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        currentTime += note.duration;
      });
      
      musicTimeoutId = setTimeout(() => {
        if (musicAudioContext && useProgrammaticMusicFlag) {
          currentTime = musicAudioContext.currentTime;
          playSequence();
        }
      }, totalDuration * 1000);
    }
    
    playSequence();
    musicIsPlaying = true;
    console.log('Programmatic medieval music started');
  } catch (e) {
    console.warn('Programmatic music generation failed:', e);
    useProgrammaticMusicFlag = false;
  }
}

function setMusicVolume(volume) {
  musicVolume = Math.max(0, Math.min(100, volume));
  saveMusicVolume();
  
  if (useProgrammaticMusicFlag) {
    // Если используем программную генерацию, перезапускаем с новой громкостью
    // Музыка продолжает играть даже при громкости 0%
    useProgrammaticMedievalMusic();
  } else {
    // Обновляем громкость аудио элемента (даже если она 0%)
    updateMusicVolume();
    
    // Запускаем музыку, если она еще не играет (независимо от громкости)
    if (!musicIsPlaying && musicAudioElement) {
      startBackgroundMusic();
    }
  }
}

// ======= Utilities =======
// Форматирование: сокращения k, M, B, T и дальше; 4 знака после запятой для малых чисел
const fmt = (n) => {
  if (!Number.isFinite(n)) return "0.0000";
  const abs = Math.abs(n);

  // Для чисел меньше 1000 — обычный формат с 4 знаками
  if (abs < 1000) return n.toFixed(4);

  // Список суффиксов (short scale). Можно расширить при необходимости.
  const SUFFIXES = [
    { p: 3, s: ' k'  }, // thousand
    { p: 6, s: ' M'  }, // million
    { p: 9, s: ' B'  }, // billion
    { p: 12, s: ' T' }, // trillion
    { p: 15, s: ' Qa' }, // quadrillion
    { p: 18, s: ' Qi' }, // quintillion
    { p: 21, s: ' Sx' }, // sextillion
    { p: 24, s: ' Sp' }, // septillion
    { p: 27, s: ' Oc' }, // octillion
    { p: 30, s: ' No' }, // nonillion
    { p: 33, s: ' Dc' }  // decillion
  ];

  // Выбираем подходящий суффикс
  let chosen = SUFFIXES[0];
  for (let i = 0; i < SUFFIXES.length; i++) {
    if (abs >= Math.pow(10, SUFFIXES[i].p)) chosen = SUFFIXES[i];
    else break;
  }

  const base = Math.pow(10, chosen.p);
  const value = n / base;

  // Если число намного больше последнего суффикса — возвращаем научную нотацию
  const maxHandled = Math.pow(10, SUFFIXES[SUFFIXES.length - 1].p) * 1000;
  if (abs >= maxHandled) return n.toExponential(4).replace(/e\+?/, 'e');

  // Обрезаем до 4 знаков после запятой и убираем лишние нули
  let s = value.toFixed(4).replace(/\.?0+$/, '');
  return `${s}${chosen.s}`;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const now = () => Date.now();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randChance = (p) => Math.random() < p; // p in [0..1]
const sum = (arr) => arr.reduce((a,b)=>a+b,0);

// Drop-in replacement for your original `toast` function.
// - Keeps the same signature and uses your toastsEl() helper
// - Display time: 10 seconds
// - Shows HH:MM:SS timestamp next to each toast
// - Collapses duplicate messages into a single toast and shows a counter like "Сообщение (х7) 19:38:44"
// - Resets the removal timer when the same message appears again
// - Preserves existing CSS classes: .toast, .warn, .good, .bad

const TOAST_DISPLAY_MS = 15000; // 15 seconds

// Замените существующую функцию _formatTimeHHMMSS на эту — она вернёт только минуты и секунды (MM:SS)
function _formatTimeHHMMSS(ts = Date.now()) {
  try {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch (e) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}


function toast(msg, type = 'info') {
  const container = typeof toastsEl === 'function' ? toastsEl() : document.getElementById('toasts');
  if (!container) return;

  const nowTs = Date.now();
  const timeStr = _formatTimeHHMMSS(nowTs);

  // Try to find an existing toast with the same message and type
  const existing = Array.from(container.children).find(el =>
    el.dataset && el.dataset.msg === msg && el.dataset.type === type
  );

  if (existing) {
    // Increment counter
    let count = parseInt(existing.dataset.count || '1', 10);
    if (isNaN(count) || count < 1) count = 1;
    count += 1;
    existing.dataset.count = String(count);

    // Update or create .toast-count
    let countEl = existing.querySelector('.toast-count');
    if (!countEl) {
      countEl = document.createElement('span');
      countEl.className = 'toast-count';
      const msgSpan = existing.querySelector('.toast-msg');
      if (msgSpan && msgSpan.parentNode) msgSpan.after(countEl);
      else existing.appendChild(countEl);
    }
    countEl.textContent = ` (х${count})`;

    // Update or create .toast-time
    let timeEl = existing.querySelector('.toast-time');
    if (!timeEl) {
      timeEl = document.createElement('span');
      timeEl.className = 'toast-time';
      existing.appendChild(timeEl);
    }
    timeEl.textContent = ` ${timeStr}`;

    // Move to top so newest duplicates are visible
    container.prepend(existing);

    // Reset removal timer
    if (existing._toastTimeout) clearTimeout(existing._toastTimeout);
    existing._toastTimeout = setTimeout(() => {
      existing.remove();
    }, TOAST_DISPLAY_MS);

    return;
  }

  // Create new toast element (keeps same outer class pattern)
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'warn' ? ' warn' : type === 'good' ? ' good' : type === 'bad' ? ' bad' : '');
  // metadata for duplicate detection
  el.dataset.msg = msg;
  el.dataset.type = type;
  el.dataset.count = '1';

  // Build inner structure: message, count, time
  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast-msg';
  msgSpan.textContent = msg;

  const countSpan = document.createElement('span');
  countSpan.className = 'toast-count';
  countSpan.textContent = ' (х1)';

  const timeSpan = document.createElement('span');
  timeSpan.className = 'toast-time';
  timeSpan.textContent = ` ${timeStr}`;

  // Minimal inline spacing to avoid layout regressions if CSS doesn't target these spans
  msgSpan.style.marginRight = '6px';
  countSpan.style.marginRight = '6px';
  timeSpan.style.opacity = '0.85';
  timeSpan.style.fontFamily = 'monospace';
  timeSpan.style.fontSize = '0.9em';

  el.appendChild(msgSpan);
  el.appendChild(countSpan);
  el.appendChild(timeSpan);

  container.prepend(el);

  // Auto-remove after TOAST_DISPLAY_MS
  el._toastTimeout = setTimeout(() => {
    el.remove();
  }, TOAST_DISPLAY_MS);
}

// ======= Auth & Save =======
const STORAGE_KEY = 'mpi_save_v1';
let save = null;

function newSave(username) {
  return {
    meta: { username, created: now(), extendedCaps: false, endgameUnlocked: false },
    points: 0,
    ppcBase: 0.00777, // Уменьшено на 30% (было 0.0111)
    click: {
      level: 0,
      max: 1000,
      segUpgrades: {}, // key: segmentIndex (0..), value: true when bought
      pendingSegmentCost: {}, // track sum cost of the 10 levels bought per segment
      brokenUntil: 0,
      goldenUntil: 0,
      goldenMult: 1.5,
      upgradeBonus: 0, // cumulative 3% bonuses applied count
      heat: 0, // уровень перегрева (0-100)
      lastHeatUpdate: now(), // время последнего обновления перегрева
      cooldownUntil: 0, // время до окончания перегрева (когда heat >= 100)
      clickHistory: [], // массив временных меток последних кликов (для вычисления скорости)
      smoothedSpeed: 0, // сглаженная скорость кликов для плавных переходов
    },
    bulk: 1, // 1,10
    buildings: [], // filled later
    uber: {
      unlocked: false,
      level: 0,
      max: 19,
    },
    treasury: {
      value: 1000,
      max: 1000,
      regenPerSec: 1,
      lastTs: now(),
      actions: {
        repair1Cd: 0,
        repair2Cd: 0,
        repair3Cd: 0,
        repair4Cd: 0,
        repair2Upgraded: false,
        repair3Upgraded: false,
        repair4Upgraded: false,
        lazyClickCd: 0,
        lazyClickLevel: 1,
        taxFreeCd: 0,
        engineerCd: 0,
        engineerUntil: 0,
        clickMadnessCd: 0,
        clickMadnessUntil: 0,
        profitWithoutTaxUntil: 0,
        casinoCd: 0,
      }
    },
    streak: { count: 0, lastClickTs: 0, multiplier: 1.0 },
    modifiers: {
      spiderMult: 1.0,
      spiderUntil: 0,
      breakChanceMult: 1.0,
      repairTimeMult: 1.0,
      activeEffects: [],
      lazyClickUntil: 0,
      lazyClickCount: 0,
      elfArcherMult: 1.0,
      elfArcherUntil: 0,
      goodLuckMode: false, // Debug mode: buildings can't break
      kingDebuffUntil: 0,
      kingDebuffMult: 1.0,
      clickDebuffLevel: 0, // текущий уровень дебафа (-0.1% за каждый клик, накопительно)
      clickDebuffLastClickTs: 0, // время последнего клика (для восстановления дебафа)
      clickDebuffRecoveryAccumulator: 0, // накопленное время для восстановления (для плавности)
      clickDebuffRecoveryStartTs: 0, // время начала восстановления (для расчета ускорения)
      incomeTransferLevel: 0, // уровень перелива дохода (0-100%, сколько % отнято от зданий)
      incomeTransferLastClickTs: 0, // время последнего клика (для таймера 5 секунд)
      // Debuffs from buffs
      repairDebuffPPSUntil: 0, // Repair: пассивный доход -15% на 45 сек
      repairDebuffCostMult: 1.0, // Repair: стоимость зданий +25% во время эффекта
      lazyClickDebuffPPSMult: 1.0, // Lazy Click: пассивный доход -10-20% во время
      lazyClickDebuffPPCUntil: 0, // Lazy Click: доход за клик -25% на 60 сек
      profitWithoutTaxDebuffPPSUntil: 0, // Profit Without Tax: пассивный доход -30% на 60 сек
      engineerDebuffPPSUntil: 0, // Engineer: пассивный доход -25% на 90 сек
      clickMadnessDebuffPPCUntil: 0, // Click Madness: доход за клик -50% на 120 сек
      noGoldenDebuffBuildingsUntil: 0, // No Golden: здания ломаются на 120 сек
      alwaysGoldenNoGoldenUntil: 0, // Always Golden: кнопка не может стать золотой на 120 сек
      alwaysGoldenDebuffPPCUntil: 0, // Always Golden: доход за клик -35% на 90 сек
      fastRepairDebuffRepairMult: 1.0, // Fast Repair: +50% времени ремонта сломанным зданиям
      fastRepairDebuffBuildingsUntil: 0, // Fast Repair: здания ломаются на 150 сек
      passiveBoostDebuffPPSUntil: 0, // Passive Boost: пассивный доход -30% на 120 сек
      passiveBoostDebuffPPCUntil: 0, // Passive Boost: доход за клик -25% на 90 сек
      passiveBoostDebuffBuildingsUntil: 0, // Passive Boost: здания ломаются на 180 сек
      masterBuilderDebuffPPSUntil: 0, // Master Builder: пассивный доход -40% на 120 сек
      masterBuilderDebuffPPCUntil: 0, // Master Builder: доход за клик -30% на 90 сек
      spiderBuffDebuffPPSUntil: 0, // Spider Buff: пассивный доход -20% на 90 сек
      spiderBuffDebuffPPCUntil: 0, // Spider Buff: доход за клик -25% на 60 сек
      spiderBuffDebuffBuildingsUntil: 0, // Spider Buff: здания ломаются на 150 сек
    },
    achievements: {
      unlocked: {}, // key: achievementId, value: true when unlocked
      stats: {
        totalClicks: 0,
        totalPlayTime: 0, // в миллисекундах
        totalDestructions: 0, // количество разрушений зданий
        firstBuildingBought: false,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
        highestPPS: 0,
        highestPPC: 0,
        goldenClicksActivated: 0, // для совместимости с checkAchievementCondition
        goldenClickActivations: 0, // старое имя, оставляем для совместимости
        brokenClicksEncountered: 0, // для совместимости с checkAchievementCondition
        brokenClickEvents: 0, // старое имя, оставляем для совместимости
        casinoWins: 0,
        casinoLosses: 0,
        totalSegmentUpgrades: 0,
        consecutiveDaysPlayed: 0,
        longestSessionTime: 0, // в миллисекундах, для совместимости с checkAchievementCondition
        longestSession: 0, // старое имя, оставляем для совместимости
        spiderEncounters: 0,
        angryBarmatunEncounters: 0,
        elfArcherEncounters: 0,
        kingEncounters: 0,
        lastLoginDay: 0, // для consecutive days
        lastPlayDate: null, // timestamp
        currentSessionStart: null, // timestamp
      }
    },
    lastTick: now(),
    lastActivityTime: now(), // Track last activity (click or page load)
    buildingSortMode: 0, // Building sort mode (0 = default, 1-4 = various sorts)
    player: {
      level: 1,
      xp: 0,
      xpForNextLevel: 110, // XP для уровня 2 (100 + 10 + 0.5 = 110.5, округляем до 110)
      totalXP: 0,
      clicksForXP: 0 // Счетчик кликов для начисления XP
    }
  };
}

function ensureTreasury(saveObj) {
  if (!saveObj.treasury) {
    saveObj.treasury = {
      value: 1000,
      max: 1000,
      regenPerSec: 1,
      lastTs: now(),
      actions: {
        repair1Cd: 0,
        repair2Cd: 0,
        repair3Cd: 0,
        repair4Cd: 0,
        repair2Upgraded: false,
        repair3Upgraded: false,
        repair4Upgraded: false,
        lazyClickCd: 0,
        lazyClickLevel: 1,
        taxFreeCd: 0,
        engineerCd: 0,
        engineerUntil: 0,
        clickMadnessCd: 0,
        clickMadnessUntil: 0,
        profitWithoutTaxUntil: 0,
        casinoCd: 0,
        // Uber mode buffs (3 hours duration)
        noGoldenUntil: 0, // Buff 1: Click can't become golden
        alwaysGoldenUntil: 0, // Buff 2: Click always golden
        fastRepairUntil: 0, // Buff 3: Buildings repair 2x faster, break 9x more
        passiveBoostUntil: 0, // Buff 4: Passive income boost (resets on click)
        passiveBoostLevel: 0, // Current boost level (0-56%)
        passiveBoostLastTick: 0, // Last 7-second tick
        spiderBuffUntil: 0, // Buff 5: Spider buff, click gives treasury
        treasuryNoPassiveUntil: 0, // Treasury doesn't fill passively during buff 5
        noBreakUntil: 0, // Buff 6: Buildings can't break, but cost 7x more
      }
    };
  } else {
    const t = now();
    const tObj = saveObj.treasury;
    tObj.max = tObj.max || 1000;
    if (tObj.value === undefined || tObj.value === null) tObj.value = tObj.max;
    if (tObj.lastTs === undefined) tObj.lastTs = t;
    if (!tObj.actions) {
      tObj.actions = {
        repair1Cd: 0,
        repair2Cd: 0,
        repair3Cd: 0,
        repair4Cd: 0,
        repair2Upgraded: false,
        repair3Upgraded: false,
        repair4Upgraded: false,
        lazyClickCd: 0,
        lazyClickLevel: 1,
        taxFreeCd: 0,
        engineerCd: 0,
        engineerUntil: 0,
        clickMadnessCd: 0,
        clickMadnessUntil: 0,
        profitWithoutTaxUntil: 0,
        casinoCd: 0,
        // Uber mode buffs (3 hours duration)
        noGoldenUntil: 0,
        alwaysGoldenUntil: 0,
        fastRepairUntil: 0,
        passiveBoostUntil: 0,
        passiveBoostLevel: 0,
        passiveBoostLastTick: 0,
        spiderBuffUntil: 0,
        treasuryNoPassiveUntil: 0,
      };
    }
    // Ensure new uber mode buff fields exist
    const act = tObj.actions;
    if (act.noGoldenUntil === undefined) act.noGoldenUntil = 0;
    if (act.alwaysGoldenUntil === undefined) act.alwaysGoldenUntil = 0;
    if (act.fastRepairUntil === undefined) act.fastRepairUntil = 0;
    if (act.passiveBoostUntil === undefined) act.passiveBoostUntil = 0;
    if (act.passiveBoostLevel === undefined) act.passiveBoostLevel = 0;
    if (act.passiveBoostLastTick === undefined) act.passiveBoostLastTick = 0;
    if (act.spiderBuffUntil === undefined) act.spiderBuffUntil = 0;
    if (act.treasuryNoPassiveUntil === undefined) act.treasuryNoPassiveUntil = 0;
    if (act.noBreakUntil === undefined) act.noBreakUntil = 0;
  }
  // Modifiers defaults
  if (!saveObj.modifiers) saveObj.modifiers = {};
  if (saveObj.modifiers.breakChanceMult === undefined) saveObj.modifiers.breakChanceMult = 1.0;
  if (saveObj.modifiers.repairTimeMult === undefined) saveObj.modifiers.repairTimeMult = 1.0;
  if (!saveObj.modifiers.activeEffects) saveObj.modifiers.activeEffects = [];
  if (saveObj.modifiers.lazyClickUntil === undefined) saveObj.modifiers.lazyClickUntil = 0;
  if (saveObj.modifiers.lazyClickCount === undefined) saveObj.modifiers.lazyClickCount = 0;
  if (saveObj.modifiers.goodLuckMode === undefined) saveObj.modifiers.goodLuckMode = false;
  if (saveObj.modifiers.angryBarmatunMult === undefined) saveObj.modifiers.angryBarmatunMult = 1.0;
  if (saveObj.modifiers.angryBarmatunUntil === undefined) saveObj.modifiers.angryBarmatunUntil = 0;
  if (saveObj.modifiers.angryBarmatunIncomeReduction === undefined) saveObj.modifiers.angryBarmatunIncomeReduction = 0;
  if (saveObj.modifiers.kingDebuffUntil === undefined) saveObj.modifiers.kingDebuffUntil = 0;
  if (saveObj.modifiers.kingDebuffMult === undefined) saveObj.modifiers.kingDebuffMult = 1.0;
  if (saveObj.modifiers.clickDebuffLevel === undefined) saveObj.modifiers.clickDebuffLevel = 0;
  if (saveObj.modifiers.clickDebuffLastClickTs === undefined) saveObj.modifiers.clickDebuffLastClickTs = 0;
  if (saveObj.modifiers.clickDebuffRecoveryAccumulator === undefined) saveObj.modifiers.clickDebuffRecoveryAccumulator = 0;
  if (saveObj.modifiers.incomeTransferLevel === undefined) saveObj.modifiers.incomeTransferLevel = 0;
  if (saveObj.modifiers.incomeTransferLastClickTs === undefined) saveObj.modifiers.incomeTransferLastClickTs = 0;
  // Debuffs from buffs - migration
  if (saveObj.modifiers.repairDebuffPPSUntil === undefined) saveObj.modifiers.repairDebuffPPSUntil = 0;
  if (saveObj.modifiers.repairDebuffCostMult === undefined) saveObj.modifiers.repairDebuffCostMult = 1.0;
  if (saveObj.modifiers.lazyClickDebuffPPSMult === undefined) saveObj.modifiers.lazyClickDebuffPPSMult = 1.0;
  if (saveObj.modifiers.lazyClickDebuffPPCUntil === undefined) saveObj.modifiers.lazyClickDebuffPPCUntil = 0;
  if (saveObj.modifiers.profitWithoutTaxDebuffPPSUntil === undefined) saveObj.modifiers.profitWithoutTaxDebuffPPSUntil = 0;
  if (saveObj.modifiers.engineerDebuffPPSUntil === undefined) saveObj.modifiers.engineerDebuffPPSUntil = 0;
  if (saveObj.modifiers.clickMadnessDebuffPPCUntil === undefined) saveObj.modifiers.clickMadnessDebuffPPCUntil = 0;
  if (saveObj.modifiers.noGoldenDebuffBuildingsUntil === undefined) saveObj.modifiers.noGoldenDebuffBuildingsUntil = 0;
  if (saveObj.modifiers.alwaysGoldenNoGoldenUntil === undefined) saveObj.modifiers.alwaysGoldenNoGoldenUntil = 0;
  if (saveObj.modifiers.alwaysGoldenDebuffPPCUntil === undefined) saveObj.modifiers.alwaysGoldenDebuffPPCUntil = 0;
  if (saveObj.modifiers.fastRepairDebuffRepairMult === undefined) saveObj.modifiers.fastRepairDebuffRepairMult = 1.0;
  if (saveObj.modifiers.fastRepairDebuffBuildingsUntil === undefined) saveObj.modifiers.fastRepairDebuffBuildingsUntil = 0;
  if (saveObj.modifiers.passiveBoostDebuffPPSUntil === undefined) saveObj.modifiers.passiveBoostDebuffPPSUntil = 0;
  if (saveObj.modifiers.passiveBoostDebuffPPCUntil === undefined) saveObj.modifiers.passiveBoostDebuffPPCUntil = 0;
  if (saveObj.modifiers.passiveBoostDebuffBuildingsUntil === undefined) saveObj.modifiers.passiveBoostDebuffBuildingsUntil = 0;
  if (saveObj.modifiers.masterBuilderDebuffPPSUntil === undefined) saveObj.modifiers.masterBuilderDebuffPPSUntil = 0;
  if (saveObj.modifiers.masterBuilderDebuffPPCUntil === undefined) saveObj.modifiers.masterBuilderDebuffPPCUntil = 0;
  if (saveObj.modifiers.spiderBuffDebuffPPSUntil === undefined) saveObj.modifiers.spiderBuffDebuffPPSUntil = 0;
  if (saveObj.modifiers.spiderBuffDebuffPPCUntil === undefined) saveObj.modifiers.spiderBuffDebuffPPCUntil = 0;
  if (saveObj.modifiers.spiderBuffDebuffBuildingsUntil === undefined) saveObj.modifiers.spiderBuffDebuffBuildingsUntil = 0;
  if (saveObj.treasury && saveObj.treasury.actions && saveObj.treasury.actions.lazyClickLevel === undefined) {
    saveObj.treasury.actions.lazyClickLevel = 1;
  }
  
  // Миграция для системы XP и уровней
  if (typeof initXPSystem === 'function') {
    initXPSystem(saveObj);
  } else {
      // Fallback если xp-system.js еще не загружен
      if (!saveObj.player) {
        saveObj.player = {
          level: 1,
          xp: 0,
          xpForNextLevel: 110,
          totalXP: 0,
          clicksForXP: 0
        };
      } else {
        // Убеждаемся что все поля существуют
        if (saveObj.player.level === undefined) saveObj.player.level = 1;
        if (saveObj.player.xp === undefined) saveObj.player.xp = 0;
        if (saveObj.player.totalXP === undefined) saveObj.player.totalXP = 0;
        if (saveObj.player.clicksForXP === undefined) saveObj.player.clicksForXP = 0;
        if (saveObj.player.xpForNextLevel === undefined) {
          // Пересчитываем XP для следующего уровня (новая формула)
          saveObj.player.xpForNextLevel = 100 + (saveObj.player.level * 10) + (saveObj.player.level * saveObj.player.level * 0.5);
        }
      }
  }
  
  // Инициализация новых систем
  if (typeof initSoulsSystem === 'function') {
    initSoulsSystem(saveObj);
  }
  if (typeof initBattlefieldSystem === 'function' && saveObj) {
    initBattlefieldSystem(saveObj);
    // Планируем первый спавн генерала если нужно
    if (saveObj && saveObj.battlefield && (!saveObj.battlefield.nextGeneralSpawn || saveObj.battlefield.nextGeneralSpawn === 0)) {
      if (typeof scheduleNextGeneral === 'function') {
        scheduleNextGeneral();
      }
    }
  }
  if (typeof initInventorySystem === 'function') {
    initInventorySystem(saveObj);
  }
  if (typeof updateBuffModifiers === 'function') {
    updateBuffModifiers();
  }
  
  
  // Миграция для новых функций: убеждаемся, что bulk существует (для старых сохранений)
  if (saveObj.bulk === undefined || saveObj.bulk === null) {
    saveObj.bulk = 1;
  }
  
  // Убеждаемся, что убер здание имеет все необходимые поля
  if (!saveObj.uber) {
    saveObj.uber = {
      unlocked: false,
      level: 0,
      max: 19,
    };
  }
  if (saveObj.uber.max === undefined) {
    saveObj.uber.max = 19;
  }
  
  // Миграция для системы перегрева кнопки клика
  if (saveObj.click) {
    if (saveObj.click.heat === undefined) {
      saveObj.click.heat = 0;
    }
    if (saveObj.click.lastHeatUpdate === undefined) {
      saveObj.click.lastHeatUpdate = now();
    }
    if (saveObj.click.cooldownUntil === undefined) {
      saveObj.click.cooldownUntil = 0;
    }
    if (!saveObj.click.clickHistory) {
      saveObj.click.clickHistory = [];
    }
    if (saveObj.click.smoothedSpeed === undefined) {
      saveObj.click.smoothedSpeed = 0;
    }
  }
  
  // Миграция: уменьшаем baseCost всех зданий в 2 раза (если еще не мигрировано)
  // Проверяем, нужно ли мигрировать (если baseCost первого здания > 0.31, значит еще не мигрировано до /4)
  if (saveObj.buildings && saveObj.buildings.length > 0 && saveObj.buildings[0].baseCost > 0.31) {
    saveObj.buildings.forEach(b => {
      if (b.baseCost) {
        // Если baseCost > 0.62, значит еще старое значение, делим на 4
        // Если baseCost > 0.31, значит уже было /2, делим еще на 2
        if (b.baseCost > 0.62) {
          b.baseCost = b.baseCost / 4;
        } else {
          b.baseCost = b.baseCost / 2;
        }
      }
    });
  }
}


const buildingNames = [
  "Hamlet (1)","Cottage (2)","Hut (3)","Lodge (4)","Cabin (5)","Homestead (6)","House (7)","Manor (8)","Villa (9)","Hall (10)",
  "Forge (11)","Mill (12)","Bakery (13)","Tannery (14)","Smithy (15)","Granary (16)","Barn (17)","Stable (18)","Barracks (19)","Keep (20)",
  "Tower (21)","Chapel (22)","Abbey (23)","Market (24)","Guild (25)","Tavern (26)","Inn (27)","Workshop (28)","Foundry (29)","Mine (30)",
  "Quarry (31)","Harbor (32)","Port (33)","Farmstead (34)","Pasture (35)","Vineyard (36)","Orchard (37)","Garden (38)","Sanctum (39)","Library (40)",
  "Archive (41)","Courtyard (42)","Outpost (43)","Watch (44)","Gatehouse (45)","Parlor (46)","Kitchen (47)","Armory (48)","Vault (49)","Cloister (50) "
];

function initBuildings(saveObj) {
  // Base cost/income for first building
  const baseCost = 1.2345 / 4; // Базовая цена уменьшена в 4 раза (2x2)
  const baseIncome = 0.00861; // Уменьшено на 30% (было 0.0123)
  const costStep = 1.015;   // "slightly more expensive"
  const incomeStep = 1.06; // "slightly more income"

  saveObj.buildings = buildingNames.map((name, i) => {
    const cost0 = baseCost * Math.pow(costStep, i);
    const inc0 = baseIncome * Math.pow(incomeStep, i);
    return {
      name,
      level: 0,
      max: 1000,
      baseCost: cost0,
      baseIncome: inc0,
      segUpgrades: {},
      pendingSegmentCost: {},
      blockedUntil: 0, // for 164s downtime on failure
      upgradeBonus: 0,
    };
  });
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Support both old format (with user) and new format (data only)
    if (parsed.data) {
      return parsed.data;
    }
    return parsed;
  } catch(e) { return null; }
}

async function saveNow() {
  if (!save) return;
  // Save to localStorage
  save.lastTick = now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: save }));
}

function autosaveLoop() {
  setInterval(saveNow, 1000);
}

// --- Autosave: надежный автосейв каждую секунду ---
const AUTOSAVE_INTERVAL_MS = 1000;
let _autosaveTimer = null;

function startAutosave() {
  if (_autosaveTimer) return;
  // Сохраняем сразу при старте
  try { 
    if (save) { 
      save.lastTick = now(); 
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: save }));
    } 
  } catch(e){}
  _autosaveTimer = setInterval(() => {
    try {
      if (!save) return;
      save.lastTick = now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: save }));
    } catch (e) {
      console.error('Autosave failed', e);
    }
  }, AUTOSAVE_INTERVAL_MS);
}

function stopAutosave() {
  if (_autosaveTimer) {
    clearInterval(_autosaveTimer);
    _autosaveTimer = null;
  }
}

// Сохраняем при закрытии вкладки/перезагрузке
window.addEventListener('beforeunload', () => {
  try {
    if (!save) return;
    save.lastTick = now();
    // Update lastActivityTime when leaving/closing the page
    save.lastActivityTime = now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: save }));
  } catch (e) {}
});

// Сохраняем при уходе вкладки в фон
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveNow();
    // Сохраняем время ухода в сон для проверки при возврате
    if (save) {
      save.lastVisibilityChange = now();
      // Update lastActivityTime when tab becomes hidden
      save.lastActivityTime = now();
      // Save immediately to preserve the timestamp
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: save }));
    }
  } else if (document.visibilityState === 'visible' && save) {
    // Check for offline earnings when page becomes visible again
    checkOfflineEarnings();
    
    // Проверяем, не прошло ли слишком много времени
    const timeAway = save.lastVisibilityChange ? (now() - save.lastVisibilityChange) / 1000 : 0;
    const MAX_AWAY_TIME = 300; // 5 минут в секундах
    
    if (timeAway > MAX_AWAY_TIME) {
      // Сбрасываем таймеры спавна, чтобы не спавнить все события сразу
      const t = now();
      const resetDelay = _randInt(60000, 180000); // 1-3 минуты задержка
      nextSpiderTs = t + resetDelay;
      nextAngryBarmatunTs = t + resetDelay + _randInt(60000, 120000); // Разносим по времени
      nextElfArcherTs = t + resetDelay + _randInt(120000, 180000);
      
      // Сбрасываем таймер короля
      if (_kingState.spawnTimer) {
        clearTimeout(_kingState.spawnTimer);
        scheduleNextKing();
      }
      
      // Обновляем lastTick, чтобы избежать большого dt в следующем тике
      save.lastTick = t;
      
      console.log('Page became visible after long absence, reset spawn timers');
    }
  }
});

let _countdownInterval = null;

// Обновляет все заметки ремонта каждую секунду и перерендеривает UI, если что-то закончилось
function _updateBuildingCountdowns() {
  const nodes = document.querySelectorAll('.building-downnote');
  const t = now();
  let removedAny = false;
  const repairedBuildings = []; // Список зданий, которые только что отремонтировались

  // Проверяем все здания на завершение ремонта (до удаления нот)
  if (save && save.buildings) {
    save.buildings.forEach((b, index) => {
      // Если здание было сломано (blockedUntil > 0) и теперь отремонтировано (blockedUntil <= t)
      // И еще не было отмечено как отремонтированное (нет флага _repaired)
      if (b.blockedUntil && b.blockedUntil > 0 && b.blockedUntil <= t && !b._repaired) {
        repairedBuildings.push({ building: b, index: index });
        b._repaired = true; // Помечаем как отремонтированное, чтобы не давать XP повторно
      }
      // Сбрасываем флаг если здание снова сломалось
      if (b.blockedUntil && b.blockedUntil > t) {
        b._repaired = false;
      }
    });
  }

  nodes.forEach(node => {
    const blockedUntil = parseInt(node.dataset.blockedUntil || '0', 10);
    if (!blockedUntil || t >= blockedUntil) {
      // время истекло — удаляем ноту
      node.remove();
      removedAny = true;
      return;
    }
    const remain = Math.ceil((blockedUntil - t) / 1000);
    node.textContent = `Under repair: ${remain}s`;
  });
  
  // XP за завершение ремонта (только один раз для каждого здания)
  if (repairedBuildings.length > 0 && typeof addXPForRepair === 'function') {
    repairedBuildings.forEach(({ building }) => {
      addXPForRepair(building.level);
    });
  }

  // Если хотя бы одна нота исчезла — перерендерим интерфейс, чтобы восстановить кнопки/статусы
  if (removedAny) {
    renderAll();
  }
}

function startCountdownLoop() {
  if (_countdownInterval) return;
  _countdownInterval = setInterval(() => {
    _updateBuildingCountdowns();
    // Проверяем что функция renderEffects существует перед вызовом
    if (typeof renderEffects === 'function') {
      renderEffects(); // обновляем эффекты (если там тоже есть оставшееся время)
    }
    // при необходимости можно обновлять верхнюю панель:
    renderTopStats();
  }, 1000);
}
// Запускаем цикл
startCountdownLoop();

// ======= UI Elements =======
const gameScreen = document.getElementById('game-screen');
const usernameDisplay = document.getElementById('username-display');
const pointsEl = document.getElementById('points');
const ppsEl = document.getElementById('pps');
const ppcEl = document.getElementById('ppc');
const treasuryValueEl = document.getElementById('treasury-value');
const treasuryRegenEl = document.getElementById('treasury-regen');
const treasuryFillEl = document.getElementById('treasury-progress-fill');
const treasuryActionsEl = document.getElementById('treasury-actions');
const gameTitleEl = document.querySelector('.game-title');

const clickBtn = document.getElementById('click-btn');
const clickStatus = document.getElementById('click-status');
const clickLevelEl = document.getElementById('click-level');
const clickMaxEl = document.getElementById('click-max');
const clickIncomeEl = document.getElementById('click-income');
const clickCostEl = document.getElementById('click-cost');
const clickSegInfo = document.getElementById('click-seg-info');
const clickSegBtn = document.getElementById('click-seg-upgrade');
const clickBuyBtn = document.getElementById('click-buy');


// Casino modal elements
const casinoModal = document.getElementById('casino-modal');
const casinoCloseBtn = document.getElementById('casino-close');
const casinoCancelBtn = document.getElementById('casino-cancel-btn');
const casinoRollBtn = document.getElementById('casino-roll-btn');
const casinoStakePercentEl = document.getElementById('casino-stake-percent');
const casinoStakeAmountEl = document.getElementById('casino-stake-amount');
const casinoFaceSelectedEl = document.getElementById('casino-face-selected');

const bulkButtons = Array.from(document.querySelectorAll('#bulk-buttons .bulk'));

const buildingsList = document.getElementById('buildings-list');

// Sort elements
const sortBuildingsBtn = document.getElementById('sort-buildings-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const hintsToggleBtn = document.getElementById('hints-toggle-btn');

const endgameBtn = document.getElementById('endgame-btn');
const uberModeBtn = document.getElementById('uber-mode-btn');

const uberCard = document.getElementById('uber-card');
const uberBuyBtn = document.getElementById('uber-buy');
const uberLevelEl = document.getElementById('uber-level');
const uberMaxEl = document.getElementById('uber-max');
const uberIncomeEl = document.getElementById('uber-income');
const uberCostEl = document.getElementById('uber-cost');

const spiderEl = document.getElementById('spider');
const angryBarmatunEl = document.getElementById('angry-barmatun');
const elfArcherEl = document.getElementById('elf-archer');

const statsBtn = document.getElementById('stats-btn');

ensureTreasury(save || {});
const statsModal = document.getElementById('stats-modal');
const statsBody = document.getElementById('stats-body');
const statsClose = document.getElementById('stats-close');

// Проверка инициализации элементов статистики
if (!statsModal) console.warn('stats-modal element not found');
if (!statsBody) console.warn('stats-body element not found');
if (!statsClose) console.warn('stats-close element not found');
if (!statsBtn) console.warn('stats-btn element not found');

// Debug
const debugOpen = document.getElementById('debug-open');
const debugModal = document.getElementById('debug-modal');
const debugClose = document.getElementById('debug-close');
const debugPass = document.getElementById('debug-pass');
const debugUnlockBtn = document.getElementById('debug-unlock-btn');
const debugLock = document.getElementById('debug-lock');
const debugTools = document.getElementById('debug-tools');


// Local save elements
const localPanel = document.getElementById('local-panel');
const localLoadBtn = document.getElementById('local-load-btn');
const localDownloadBtn = document.getElementById('local-download-btn');
const localUploadInput = document.getElementById('local-upload-input');
const localUploadBtn = document.getElementById('local-upload-btn');



// ======= Core math: cost & income scaling =======
function segmentIndex(level) {
  return Math.floor(level / 10);
}
function withinSegment(level) {
  return level % 10; // 0..9
}
function nextSegmentGate(level) {
  // levels advance, but each 10-level segment requires an upgrade to proceed further
  const seg = segmentIndex(level);
  return { seg, within: withinSegment(level) };
}

// ======= Унифицированная система для всех блоков (Click, Buildings, Uber) =======
// Типы блоков: 'click', 'building', 'uber'
function getBlockData(type, index = null) {
  if (type === 'click') {
    return save.click;
  } else if (type === 'building') {
    return save.buildings[index];
  } else if (type === 'uber') {
    return save.uber;
  }
  return null;
}

function getBlockCostAt(type, level, index = null) {
  if (type === 'click') {
    return clickLevelCostAt(level);
  } else if (type === 'building') {
    const b = save.buildings[index];
    return buildingLevelCostAt(b, level);
  } else if (type === 'uber') {
    return uberCostAt(level);
  }
  return 0;
}

function getBlockIncomeAt(type, level, upgradesCount = 0, index = null) {
  if (type === 'click') {
    return clickIncomeAt(level, upgradesCount);
  } else if (type === 'building') {
    const b = save.buildings[index];
    return buildingIncomeAt(b, level, upgradesCount);
  } else if (type === 'uber') {
    return uberIncomeAt(level);
  }
  return 0;
}

function canProgressSegment(level, segUpgrades) {
  // Если segUpgrades не передан или null/undefined, значит апгрейды не требуются (например, для uber)
  // ВАЖНО: typeof null === 'object' в JavaScript (это баг языка), поэтому нужна явная проверка на null
  if (segUpgrades === null || segUpgrades === undefined) {
    return true; // Для убер здания и других объектов без апгрейдов всегда разрешаем прогресс
  }
  const seg = segmentIndex(level);
  if (seg === 0) return true; // Первый сегмент всегда доступен
  // Проверяем, что segUpgrades является объектом (но не null) перед обращением к элементу
  // typeof null === 'object' в JavaScript, поэтому проверяем явно
  if (segUpgrades === null || typeof segUpgrades !== 'object') return true;
  return !!segUpgrades[seg - 1];
}

function hasSegmentUpgrades(type) {
  return type === 'click' || type === 'building';
}

// Универсальная функция для вычисления стоимости bulk покупки
function computeBulkCostForBlock(type, bulk, index = null) {
  const block = getBlockData(type, index);
  if (!block) return { totalCost: 0, totalLevels: 0 };
  
  let needLevels = 0;
  if (bulk === 'max') {
    needLevels = block.max - block.level;
  } else {
    needLevels = typeof bulk === 'number' ? bulk : parseInt(bulk, 10);
    if (isNaN(needLevels) || needLevels < 1) {
      needLevels = 1;
    }
  }
  
  let allowedLevels = 0;
  // Для убер здания segUpgrades всегда null, так как у него нет апгрейдов
  const segUpgrades = hasSegmentUpgrades(type) ? (block.segUpgrades || null) : null;
  // Для убер здания не нужно проверять сегменты - оно всегда может прогрессировать
  const isUber = type === 'uber';
  
  for (let i = 0; i < needLevels; i++) {
    const lvl = block.level + i;
    // Проверяем, не превысили ли максимальный уровень
    if (lvl >= block.max) break;
    // Для убер здания пропускаем проверку сегментов, для остальных проверяем
    if (!isUber) {
      const canProgress = canProgressSegment(lvl, segUpgrades);
      if (!canProgress) {
        break;
      }
    }
    allowedLevels++;
  }
  
  let totalCost = 0;
  for (let i = 0; i < allowedLevels; i++) {
    totalCost += getBlockCostAt(type, block.level + i, index);
  }
  
  return { totalCost, totalLevels: allowedLevels };
}

// Level cost/income for Click
function clickLevelCostAt(level) {
  // base upgrade price for click is 7.772 for first level (level 0->1)
  const base = 0.0737 / 4; // Уменьшено в 4 раза (2x2)
  // smooth price growth
  // Множитель изменен с 1.055 на 1.05 для снижения прироста цены
  return base * Math.pow(1.05, level);
}
function clickIncomeAt(level, upgradesCount) {
  const basePpc = save.ppcBase;
  const upgradeMult = Math.pow(1.03, upgradesCount || 0);
  // Smooth per-level ppc growth (gentle) - reduced by 2x, прирост уменьшен на 20% (дважды по 10%)
  // Было: 1.024695 (+2.4695% за уровень), стало: 1.02222951 (+2.222951% за уровень)
  return basePpc * Math.pow(1.02222951, level) * upgradeMult;
}

// Building cost/income per level
function buildingLevelCostAt(b, level) {
  // baseCost scales gently with level
  // baseCost уже уменьшен в 2 раза при инициализации, поэтому просто используем его
  const baseCost = b.baseCost * Math.pow(1.06, level);
  // Buff 6: Buildings can't break, but cost 2x more
  const act = save.treasury?.actions;
  const noBreakActive = act && act.noBreakUntil > now();
  let cost = noBreakActive ? baseCost * 7 : baseCost;
  // Repair debuff: стоимость зданий +25% во время эффекта
  cost *= save.modifiers.repairDebuffCostMult || 1.0;
  return cost;
}
function buildingIncomeAt(b, level, upgradesCount) {
  const upgradeMult = Math.pow(1.03, upgradesCount || 0);
  // Прирост за уровень уменьшен на 20% (дважды по 10%)
  // Было: 1.045 (+4.5% за уровень), стало: 1.03645 (+3.645% за уровень, уменьшение на 20%)
  return b.baseIncome * Math.pow(1.03645, level) * upgradeMult;
}

// Uber building
function uberCostAt(level) {
  // Cost should be proportional to income
  // For regular buildings: baseCost/baseIncome ≈ 100 (1.2345/0.0123)
  // For uber building, use income at level 1 and apply similar ratio
  // But make it more reasonable - use cost proportional to income with a multiplier
  const incomeAtLevel1 = uberIncomeAt(1);
  // Use a cost-to-income ratio similar to regular buildings
  // Regular building ratio is ~100, so we use the same for balance
  const costToIncomeRatio = 100; // Balanced to match regular buildings
  const base = (incomeAtLevel1 * costToIncomeRatio) / 2; // Уменьшено в 2 раза
  
  // Cost multiplier reduced from 1.35 to 1.19 to be closer to income growth (1.1782)
  return base * Math.pow(1.19, level);
}
function uberIncomeAt(level) {
  // Calculate total income of all buildings at level 800 with 80 upgrades (3% each 10 levels)
  // Each building i: baseIncome_i = 0.00861 * 1.06^i (уменьшено на 30%)
  // At level 800 with 80 upgrades: income_i = baseIncome_i * 1.03645^800 * 1.03^80
  // Total = sum of all 50 buildings, divided by 2
  const baseIncome = 0.00861; // Уменьшено на 30% (было 0.0123)
  const incomeStep = 1.06;
  const levelMult = Math.pow(1.03645, 800); // Прирост на уровне 800
  const upgradeMult = Math.pow(1.03, 80); // 80 upgrades (800/10 = 80 segments)
  
  // Calculate sum of geometric series: sum(i=0 to 49) of 1.06^i
  const numBuildings = 50;
  let sumBaseIncomes = 0;
  for (let i = 0; i < numBuildings; i++) {
    sumBaseIncomes += baseIncome * Math.pow(incomeStep, i);
  }
  
  // Total income at level 800 with all upgrades
  const totalAt800 = sumBaseIncomes * levelMult * upgradeMult;
  
  // Uber building base income = total income at level 800 (увеличено в 2 раза, убрано деление на 2)
  const baseInc = totalAt800;
  
  // Прирост за уровень уменьшен на 20% (дважды по 10%)
  // Было: 1.22 (+22% за уровень), стало: 1.1782 (+17.82% за уровень, уменьшение на 20%)
  return baseInc * Math.pow(1.1782, level);
}

// ======= Achievements system =======
const ACHIEVEMENTS = [
  // ===== EXISTING ACHIEVEMENTS (updated rewards to 0.005) =====
  // Clicks: 1, 46, 103, 542, 1084, 5844, 11111 (+0.5%)
  { id: 'clicks_1', type: 'clicks', value: 1, reward: 0.005, name: 'First Click', icon: '👆' },
  { id: 'clicks_46', type: 'clicks', value: 46, reward: 0.005, name: '46 Clicks', icon: '🖱️' },
  { id: 'clicks_103', type: 'clicks', value: 103, reward: 0.005, name: '103 Clicks', icon: '👆' },
  { id: 'clicks_542', type: 'clicks', value: 542, reward: 0.005, name: '542 Clicks', icon: '🖱️' },
  { id: 'clicks_1084', type: 'clicks', value: 1084, reward: 0.005, name: '1084 Clicks', icon: '👆' },
  { id: 'clicks_5844', type: 'clicks', value: 5844, reward: 0.005, name: '5844 Clicks', icon: '🖱️' },
  { id: 'clicks_11111', type: 'clicks', value: 11111, reward: 0.005, name: '11111 Clicks', icon: '👆' },
  // Clicks: 25678, 54321, 101101, 333333 (+0.5%)
  { id: 'clicks_25678', type: 'clicks', value: 25678, reward: 0.005, name: '25678 Clicks', icon: '⚡' },
  { id: 'clicks_54321', type: 'clicks', value: 54321, reward: 0.005, name: '54321 Clicks', icon: '⚡' },
  { id: 'clicks_101101', type: 'clicks', value: 101101, reward: 0.005, name: '101101 Clicks', icon: '⚡' },
  { id: 'clicks_333333', type: 'clicks', value: 333333, reward: 0.005, name: '333333 Clicks', icon: '⚡' },
  // Clicks: 666666, 1000011 (+0.5%)
  { id: 'clicks_666666', type: 'clicks', value: 666666, reward: 0.005, name: '666666 Clicks', icon: '🔥' },
  { id: 'clicks_1000011', type: 'clicks', value: 1000011, reward: 0.005, name: '1M Clicks', icon: '🔥' },
  // Clicks: 5553535, 10000000 (+0.5%)
  { id: 'clicks_5553535', type: 'clicks', value: 5553535, reward: 0.005, name: '5.5M Clicks', icon: '💎' },
  { id: 'clicks_10000000', type: 'clicks', value: 10000000, reward: 0.005, name: '10M Clicks', icon: '💎' },
  
  // Buildings: buy first (+0.5%)
  { id: 'building_first', type: 'first_building', value: 1, reward: 0.005, name: 'First Building', icon: '🏠' },
  
  // Buildings: level 10 (1, 7, 16, 37, 50 buildings) (+0.5%)
  { id: 'buildings_10_1', type: 'buildings_level', level: 10, count: 1, reward: 0.005, name: '1 Building Lv10', icon: '🏘️' },
  { id: 'buildings_10_7', type: 'buildings_level', level: 10, count: 7, reward: 0.005, name: '7 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_16', type: 'buildings_level', level: 10, count: 16, reward: 0.005, name: '16 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_37', type: 'buildings_level', level: 10, count: 37, reward: 0.005, name: '37 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_50', type: 'buildings_level', level: 10, count: 50, reward: 0.005, name: '50 Buildings Lv10', icon: '🏘️' },
  
  // Buildings: level 40 (+0.5%)
  { id: 'buildings_40_1', type: 'buildings_level', level: 40, count: 1, reward: 0.005, name: '1 Building Lv40', icon: '🏛️' },
  { id: 'buildings_40_7', type: 'buildings_level', level: 40, count: 7, reward: 0.005, name: '7 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_16', type: 'buildings_level', level: 40, count: 16, reward: 0.005, name: '16 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_37', type: 'buildings_level', level: 40, count: 37, reward: 0.005, name: '37 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_50', type: 'buildings_level', level: 40, count: 50, reward: 0.005, name: '50 Buildings Lv40', icon: '🏛️' },
  
  // Buildings: level 90 (+0.5%)
  { id: 'buildings_90_1', type: 'buildings_level', level: 90, count: 1, reward: 0.005, name: '1 Building Lv90', icon: '🏰' },
  { id: 'buildings_90_7', type: 'buildings_level', level: 90, count: 7, reward: 0.005, name: '7 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_16', type: 'buildings_level', level: 90, count: 16, reward: 0.005, name: '16 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_37', type: 'buildings_level', level: 90, count: 37, reward: 0.005, name: '37 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_50', type: 'buildings_level', level: 90, count: 50, reward: 0.005, name: '50 Buildings Lv90', icon: '🏰' },
  
  // Buildings: level 170 (+0.5%)
  { id: 'buildings_170_1', type: 'buildings_level', level: 170, count: 1, reward: 0.005, name: '1 Building Lv170', icon: '🏯' },
  { id: 'buildings_170_7', type: 'buildings_level', level: 170, count: 7, reward: 0.005, name: '7 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_16', type: 'buildings_level', level: 170, count: 16, reward: 0.005, name: '16 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_37', type: 'buildings_level', level: 170, count: 37, reward: 0.005, name: '37 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_50', type: 'buildings_level', level: 170, count: 50, reward: 0.005, name: '50 Buildings Lv170', icon: '🏯' },
  
  // Buildings: level 310 (+0.5%)
  { id: 'buildings_310_1', type: 'buildings_level', level: 310, count: 1, reward: 0.005, name: '1 Building Lv310', icon: '🗼' },
  { id: 'buildings_310_7', type: 'buildings_level', level: 310, count: 7, reward: 0.005, name: '7 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_16', type: 'buildings_level', level: 310, count: 16, reward: 0.005, name: '16 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_37', type: 'buildings_level', level: 310, count: 37, reward: 0.005, name: '37 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_50', type: 'buildings_level', level: 310, count: 50, reward: 0.005, name: '50 Buildings Lv310', icon: '🗼' },
  
  // Buildings: level 520 (+0.5%)
  { id: 'buildings_520_1', type: 'buildings_level', level: 520, count: 1, reward: 0.005, name: '1 Building Lv520', icon: '🏗️' },
  { id: 'buildings_520_7', type: 'buildings_level', level: 520, count: 7, reward: 0.005, name: '7 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_16', type: 'buildings_level', level: 520, count: 16, reward: 0.005, name: '16 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_37', type: 'buildings_level', level: 520, count: 37, reward: 0.005, name: '37 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_50', type: 'buildings_level', level: 520, count: 50, reward: 0.005, name: '50 Buildings Lv520', icon: '🏗️' },
  
  // Buildings: level 800 (+0.5%)
  { id: 'buildings_800_1', type: 'buildings_level', level: 800, count: 1, reward: 0.005, name: '1 Building Lv800', icon: '🏛️' },
  { id: 'buildings_800_7', type: 'buildings_level', level: 800, count: 7, reward: 0.005, name: '7 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_16', type: 'buildings_level', level: 800, count: 16, reward: 0.005, name: '16 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_37', type: 'buildings_level', level: 800, count: 37, reward: 0.005, name: '37 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_50', type: 'buildings_level', level: 800, count: 50, reward: 0.005, name: '50 Buildings Lv800', icon: '🏛️' },
  
  // Buildings: level 1000 (+0.5%)
  { id: 'buildings_1000_1', type: 'buildings_level', level: 1000, count: 1, reward: 0.005, name: '1 Building Lv1000', icon: '👑' },
  { id: 'buildings_1000_7', type: 'buildings_level', level: 1000, count: 7, reward: 0.005, name: '7 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_16', type: 'buildings_level', level: 1000, count: 16, reward: 0.005, name: '16 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_37', type: 'buildings_level', level: 1000, count: 37, reward: 0.005, name: '37 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_50', type: 'buildings_level', level: 1000, count: 50, reward: 0.005, name: '50 Buildings Lv1000', icon: '👑' },
  
  // Uber: unlock (+0.5%)
  { id: 'uber_unlock', type: 'uber_unlock', value: 1, reward: 0.005, name: 'Citadel Unlocked', icon: '🏰' },
  // Uber: level 10 (+0.5%)
  { id: 'uber_level_10', type: 'uber_level', value: 10, reward: 0.005, name: 'Citadel Lv10', icon: '👑' },
  
  // Destructions: 1, 6, 26, 44, 72, 147, 502, 1033 (+0.5%)
  { id: 'destructions_1', type: 'destructions', value: 1, reward: 0.005, name: '1 Destruction', icon: '💥' },
  { id: 'destructions_6', type: 'destructions', value: 6, reward: 0.005, name: '6 Destructions', icon: '💥' },
  { id: 'destructions_26', type: 'destructions', value: 26, reward: 0.005, name: '26 Destructions', icon: '💥' },
  { id: 'destructions_44', type: 'destructions', value: 44, reward: 0.005, name: '44 Destructions', icon: '💥' },
  { id: 'destructions_72', type: 'destructions', value: 72, reward: 0.005, name: '72 Destructions', icon: '💥' },
  { id: 'destructions_147', type: 'destructions', value: 147, reward: 0.005, name: '147 Destructions', icon: '💥' },
  { id: 'destructions_502', type: 'destructions', value: 502, reward: 0.005, name: '502 Destructions', icon: '💥' },
  { id: 'destructions_1033', type: 'destructions', value: 1033, reward: 0.005, name: '1033 Destructions', icon: '💥' },
  
  // Playtime: 8, 17, 39, 189, 455, 987, 1337, 2025, 5050, 9999 minutes (+0.5%)
  { id: 'playtime_8', type: 'playtime', value: 8 * 60 * 1000, reward: 0.005, name: '8 Minutes', icon: '⏱️' },
  { id: 'playtime_17', type: 'playtime', value: 17 * 60 * 1000, reward: 0.005, name: '17 Minutes', icon: '⏱️' },
  { id: 'playtime_39', type: 'playtime', value: 39 * 60 * 1000, reward: 0.005, name: '39 Minutes', icon: '⏱️' },
  { id: 'playtime_189', type: 'playtime', value: 189 * 60 * 1000, reward: 0.005, name: '189 Minutes', icon: '⏱️' },
  { id: 'playtime_455', type: 'playtime', value: 455 * 60 * 1000, reward: 0.005, name: '455 Minutes', icon: '⏱️' },
  { id: 'playtime_987', type: 'playtime', value: 987 * 60 * 1000, reward: 0.005, name: '987 Minutes', icon: '⏱️' },
  { id: 'playtime_1337', type: 'playtime', value: 1337 * 60 * 1000, reward: 0.005, name: '1337 Minutes', icon: '⏱️' },
  { id: 'playtime_2025', type: 'playtime', value: 2025 * 60 * 1000, reward: 0.005, name: '2025 Minutes', icon: '⏱️' },
  { id: 'playtime_5050', type: 'playtime', value: 5050 * 60 * 1000, reward: 0.005, name: '5050 Minutes', icon: '⏱️' },
  { id: 'playtime_9999', type: 'playtime', value: 9999 * 60 * 1000, reward: 0.005, name: '9999 Minutes', icon: '⏱️' },
  
  // Special achievement: click on title (keep 0.03)
  { id: 'honored_player', type: 'manual', value: 1, reward: 0.03, name: 'Honored Player', icon: '⭐' },
  
  // ===== NEW ACHIEVEMENTS =====
  // Extended Clicks milestones
  { id: 'clicks_25000000', type: 'clicks', value: 25000000, reward: 0.005, name: '25M Clicks', icon: '💎' },
  { id: 'clicks_50000000', type: 'clicks', value: 50000000, reward: 0.005, name: '50M Clicks', icon: '💎' },
  { id: 'clicks_100000000', type: 'clicks', value: 100000000, reward: 0.005, name: '100M Clicks', icon: '💎' },
  { id: 'clicks_250000000', type: 'clicks', value: 250000000, reward: 0.005, name: '250M Clicks', icon: '💎' },
  { id: 'clicks_500000000', type: 'clicks', value: 500000000, reward: 0.005, name: '500M Clicks', icon: '💎' },
  { id: 'clicks_1000000000', type: 'clicks', value: 1000000000, reward: 0.005, name: '1B Clicks', icon: '💎' },
  { id: 'clicks_5000000000', type: 'clicks', value: 5000000000, reward: 0.005, name: '5B Clicks', icon: '💎' },
  { id: 'clicks_10000000000', type: 'clicks', value: 10000000000, reward: 0.005, name: '10B Clicks', icon: '💎' },
  { id: 'clicks_25000000000', type: 'clicks', value: 25000000000, reward: 0.005, name: '25B Clicks', icon: '💎' },
  { id: 'clicks_50000000000', type: 'clicks', value: 50000000000, reward: 0.005, name: '50B Clicks', icon: '💎' },
  { id: 'clicks_100000000000', type: 'clicks', value: 100000000000, reward: 0.005, name: '100B Clicks', icon: '💎' },
  
  // Click Button Level
  { id: 'click_level_10', type: 'click_level', value: 10, reward: 0.005, name: 'Click Lv10', icon: '👆' },
  { id: 'click_level_25', type: 'click_level', value: 25, reward: 0.005, name: 'Click Lv25', icon: '👆' },
  { id: 'click_level_50', type: 'click_level', value: 50, reward: 0.005, name: 'Click Lv50', icon: '👆' },
  { id: 'click_level_100', type: 'click_level', value: 100, reward: 0.005, name: 'Click Lv100', icon: '👆' },
  { id: 'click_level_250', type: 'click_level', value: 250, reward: 0.005, name: 'Click Lv250', icon: '👆' },
  { id: 'click_level_500', type: 'click_level', value: 500, reward: 0.005, name: 'Click Lv500', icon: '👆' },
  { id: 'click_level_750', type: 'click_level', value: 750, reward: 0.005, name: 'Click Lv750', icon: '👆' },
  { id: 'click_level_1000', type: 'click_level', value: 1000, reward: 0.005, name: 'Click Lv1000', icon: '👆' },
  
  // Click Upgrade Bonuses
  { id: 'click_upgrade_1', type: 'click_upgrade', value: 1, reward: 0.005, name: '1 Click UP', icon: '⚡' },
  { id: 'click_upgrade_5', type: 'click_upgrade', value: 5, reward: 0.005, name: '5 Click UPs', icon: '⚡' },
  { id: 'click_upgrade_10', type: 'click_upgrade', value: 10, reward: 0.005, name: '10 Click UPs', icon: '⚡' },
  { id: 'click_upgrade_25', type: 'click_upgrade', value: 25, reward: 0.005, name: '25 Click UPs', icon: '⚡' },
  { id: 'click_upgrade_50', type: 'click_upgrade', value: 50, reward: 0.005, name: '50 Click UPs', icon: '⚡' },
  { id: 'click_upgrade_100', type: 'click_upgrade', value: 100, reward: 0.005, name: '100 Click UPs', icon: '⚡' },
  { id: 'click_upgrade_250', type: 'click_upgrade', value: 250, reward: 0.005, name: '250 Click UPs', icon: '⚡' },
  { id: 'click_upgrade_500', type: 'click_upgrade', value: 500, reward: 0.005, name: '500 Click UPs', icon: '⚡' },
  
  // Points Earned milestones
  { id: 'points_earned_1k', type: 'points_earned', value: 1000, reward: 0.005, name: '1K Points Earned', icon: '💰' },
  { id: 'points_earned_10k', type: 'points_earned', value: 10000, reward: 0.005, name: '10K Points Earned', icon: '💰' },
  { id: 'points_earned_100k', type: 'points_earned', value: 100000, reward: 0.005, name: '100K Points Earned', icon: '💰' },
  { id: 'points_earned_1m', type: 'points_earned', value: 1000000, reward: 0.005, name: '1M Points Earned', icon: '💰' },
  { id: 'points_earned_10m', type: 'points_earned', value: 10000000, reward: 0.005, name: '10M Points Earned', icon: '💰' },
  { id: 'points_earned_100m', type: 'points_earned', value: 100000000, reward: 0.005, name: '100M Points Earned', icon: '💰' },
  { id: 'points_earned_1b', type: 'points_earned', value: 1000000000, reward: 0.005, name: '1B Points Earned', icon: '💰' },
  { id: 'points_earned_10b', type: 'points_earned', value: 10000000000, reward: 0.005, name: '10B Points Earned', icon: '💰' },
  { id: 'points_earned_100b', type: 'points_earned', value: 100000000000, reward: 0.005, name: '100B Points Earned', icon: '💰' },
  { id: 'points_earned_1t', type: 'points_earned', value: 1000000000000, reward: 0.005, name: '1T Points Earned', icon: '💰' },
  
  // Points Spent milestones
  { id: 'points_spent_1k', type: 'points_spent', value: 1000, reward: 0.005, name: '1K Points Spent', icon: '💸' },
  { id: 'points_spent_10k', type: 'points_spent', value: 10000, reward: 0.005, name: '10K Points Spent', icon: '💸' },
  { id: 'points_spent_100k', type: 'points_spent', value: 100000, reward: 0.005, name: '100K Points Spent', icon: '💸' },
  { id: 'points_spent_1m', type: 'points_spent', value: 1000000, reward: 0.005, name: '1M Points Spent', icon: '💸' },
  { id: 'points_spent_10m', type: 'points_spent', value: 10000000, reward: 0.005, name: '10M Points Spent', icon: '💸' },
  { id: 'points_spent_100m', type: 'points_spent', value: 100000000, reward: 0.005, name: '100M Points Spent', icon: '💸' },
  { id: 'points_spent_1b', type: 'points_spent', value: 1000000000, reward: 0.005, name: '1B Points Spent', icon: '💸' },
  { id: 'points_spent_10b', type: 'points_spent', value: 10000000000, reward: 0.005, name: '10B Points Spent', icon: '💸' },
  
  // PPS Milestones (current)
  { id: 'pps_current_1', type: 'pps_current', value: 1, reward: 0.005, name: '1 PPS', icon: '📈' },
  { id: 'pps_current_10', type: 'pps_current', value: 10, reward: 0.005, name: '10 PPS', icon: '📈' },
  { id: 'pps_current_100', type: 'pps_current', value: 100, reward: 0.005, name: '100 PPS', icon: '📈' },
  { id: 'pps_current_1k', type: 'pps_current', value: 1000, reward: 0.005, name: '1K PPS', icon: '📈' },
  { id: 'pps_current_10k', type: 'pps_current', value: 10000, reward: 0.005, name: '10K PPS', icon: '📈' },
  { id: 'pps_current_100k', type: 'pps_current', value: 100000, reward: 0.005, name: '100K PPS', icon: '📈' },
  { id: 'pps_current_1m', type: 'pps_current', value: 1000000, reward: 0.005, name: '1M PPS', icon: '📈' },
  { id: 'pps_current_10m', type: 'pps_current', value: 10000000, reward: 0.005, name: '10M PPS', icon: '📈' },
  { id: 'pps_current_100m', type: 'pps_current', value: 100000000, reward: 0.005, name: '100M PPS', icon: '📈' },
  
  // PPS Milestones (highest)
  { id: 'pps_highest_1', type: 'pps_highest', value: 1, reward: 0.005, name: 'Highest 1 PPS', icon: '📊' },
  { id: 'pps_highest_10', type: 'pps_highest', value: 10, reward: 0.005, name: 'Highest 10 PPS', icon: '📊' },
  { id: 'pps_highest_100', type: 'pps_highest', value: 100, reward: 0.005, name: 'Highest 100 PPS', icon: '📊' },
  { id: 'pps_highest_1k', type: 'pps_highest', value: 1000, reward: 0.005, name: 'Highest 1K PPS', icon: '📊' },
  { id: 'pps_highest_10k', type: 'pps_highest', value: 10000, reward: 0.005, name: 'Highest 10K PPS', icon: '📊' },
  { id: 'pps_highest_100k', type: 'pps_highest', value: 100000, reward: 0.005, name: 'Highest 100K PPS', icon: '📊' },
  { id: 'pps_highest_1m', type: 'pps_highest', value: 1000000, reward: 0.005, name: 'Highest 1M PPS', icon: '📊' },
  { id: 'pps_highest_10m', type: 'pps_highest', value: 10000000, reward: 0.005, name: 'Highest 10M PPS', icon: '📊' },
  { id: 'pps_highest_100m', type: 'pps_highest', value: 100000000, reward: 0.005, name: 'Highest 100M PPS', icon: '📊' },
  
  // PPC Milestones (current)
  { id: 'ppc_current_1', type: 'ppc_current', value: 1, reward: 0.005, name: '1 PPC', icon: '👆' },
  { id: 'ppc_current_10', type: 'ppc_current', value: 10, reward: 0.005, name: '10 PPC', icon: '👆' },
  { id: 'ppc_current_100', type: 'ppc_current', value: 100, reward: 0.005, name: '100 PPC', icon: '👆' },
  { id: 'ppc_current_1k', type: 'ppc_current', value: 1000, reward: 0.005, name: '1K PPC', icon: '👆' },
  { id: 'ppc_current_10k', type: 'ppc_current', value: 10000, reward: 0.005, name: '10K PPC', icon: '👆' },
  { id: 'ppc_current_100k', type: 'ppc_current', value: 100000, reward: 0.005, name: '100K PPC', icon: '👆' },
  { id: 'ppc_current_1m', type: 'ppc_current', value: 1000000, reward: 0.005, name: '1M PPC', icon: '👆' },
  { id: 'ppc_current_10m', type: 'ppc_current', value: 10000000, reward: 0.005, name: '10M PPC', icon: '👆' },
  
  // PPC Milestones (highest)
  { id: 'ppc_highest_1', type: 'ppc_highest', value: 1, reward: 0.005, name: 'Highest 1 PPC', icon: '👆' },
  { id: 'ppc_highest_10', type: 'ppc_highest', value: 10, reward: 0.005, name: 'Highest 10 PPC', icon: '👆' },
  { id: 'ppc_highest_100', type: 'ppc_highest', value: 100, reward: 0.005, name: 'Highest 100 PPC', icon: '👆' },
  { id: 'ppc_highest_1k', type: 'ppc_highest', value: 1000, reward: 0.005, name: 'Highest 1K PPC', icon: '👆' },
  { id: 'ppc_highest_10k', type: 'ppc_highest', value: 10000, reward: 0.005, name: 'Highest 10K PPC', icon: '👆' },
  { id: 'ppc_highest_100k', type: 'ppc_highest', value: 100000, reward: 0.005, name: 'Highest 100K PPC', icon: '👆' },
  { id: 'ppc_highest_1m', type: 'ppc_highest', value: 1000000, reward: 0.005, name: 'Highest 1M PPC', icon: '👆' },
  { id: 'ppc_highest_10m', type: 'ppc_highest', value: 10000000, reward: 0.005, name: 'Highest 10M PPC', icon: '👆' },
  
  
  // Total Building Levels
  { id: 'total_building_levels_100', type: 'total_building_levels', value: 100, reward: 0.005, name: '100 Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_500', type: 'total_building_levels', value: 500, reward: 0.005, name: '500 Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_1k', type: 'total_building_levels', value: 1000, reward: 0.005, name: '1K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_5k', type: 'total_building_levels', value: 5000, reward: 0.005, name: '5K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_10k', type: 'total_building_levels', value: 10000, reward: 0.005, name: '10K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_25k', type: 'total_building_levels', value: 25000, reward: 0.005, name: '25K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_50k', type: 'total_building_levels', value: 50000, reward: 0.005, name: '50K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_100k', type: 'total_building_levels', value: 100000, reward: 0.005, name: '100K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_250k', type: 'total_building_levels', value: 250000, reward: 0.005, name: '250K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_500k', type: 'total_building_levels', value: 500000, reward: 0.005, name: '500K Total Building Levels', icon: '🏗️' },
  
  // Unlocked Buildings Count
  { id: 'unlocked_buildings_5', type: 'unlocked_buildings', value: 5, reward: 0.005, name: '5 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_10', type: 'unlocked_buildings', value: 10, reward: 0.005, name: '10 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_15', type: 'unlocked_buildings', value: 15, reward: 0.005, name: '15 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_20', type: 'unlocked_buildings', value: 20, reward: 0.005, name: '20 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_25', type: 'unlocked_buildings', value: 25, reward: 0.005, name: '25 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_30', type: 'unlocked_buildings', value: 30, reward: 0.005, name: '30 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_35', type: 'unlocked_buildings', value: 35, reward: 0.005, name: '35 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_40', type: 'unlocked_buildings', value: 40, reward: 0.005, name: '40 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_45', type: 'unlocked_buildings', value: 45, reward: 0.005, name: '45 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_50', type: 'unlocked_buildings', value: 50, reward: 0.005, name: '50 Unlocked Buildings', icon: '🏠' },
  
  // Extended Citadel Levels
  { id: 'uber_level_1', type: 'uber_level', value: 1, reward: 0.005, name: 'Citadel Lv1', icon: '🏰' },
  { id: 'uber_level_2', type: 'uber_level', value: 2, reward: 0.005, name: 'Citadel Lv2', icon: '🏰' },
  { id: 'uber_level_3', type: 'uber_level', value: 3, reward: 0.005, name: 'Citadel Lv3', icon: '🏰' },
  { id: 'uber_level_4', type: 'uber_level', value: 4, reward: 0.005, name: 'Citadel Lv4', icon: '🏰' },
  { id: 'uber_level_5', type: 'uber_level', value: 5, reward: 0.005, name: 'Citadel Lv5', icon: '🏰' },
  { id: 'uber_level_6', type: 'uber_level', value: 6, reward: 0.005, name: 'Citadel Lv6', icon: '🏰' },
  { id: 'uber_level_7', type: 'uber_level', value: 7, reward: 0.005, name: 'Citadel Lv7', icon: '🏰' },
  { id: 'uber_level_8', type: 'uber_level', value: 8, reward: 0.005, name: 'Citadel Lv8', icon: '🏰' },
  { id: 'uber_level_9', type: 'uber_level', value: 9, reward: 0.005, name: 'Citadel Lv9', icon: '🏰' },
  { id: 'uber_level_11', type: 'uber_level', value: 11, reward: 0.005, name: 'Citadel Lv11', icon: '👑' },
  { id: 'uber_level_12', type: 'uber_level', value: 12, reward: 0.005, name: 'Citadel Lv12', icon: '👑' },
  { id: 'uber_level_13', type: 'uber_level', value: 13, reward: 0.005, name: 'Citadel Lv13', icon: '👑' },
  { id: 'uber_level_14', type: 'uber_level', value: 14, reward: 0.005, name: 'Citadel Lv14', icon: '👑' },
  { id: 'uber_level_15', type: 'uber_level', value: 15, reward: 0.005, name: 'Citadel Lv15', icon: '👑' },
  { id: 'uber_level_16', type: 'uber_level', value: 16, reward: 0.005, name: 'Citadel Lv16', icon: '👑' },
  { id: 'uber_level_17', type: 'uber_level', value: 17, reward: 0.005, name: 'Citadel Lv17', icon: '👑' },
  { id: 'uber_level_18', type: 'uber_level', value: 18, reward: 0.005, name: 'Citadel Lv18', icon: '👑' },
  { id: 'uber_level_19', type: 'uber_level', value: 19, reward: 0.005, name: 'Citadel Lv19', icon: '👑' },
  
  // Extended Destructions
  { id: 'destructions_2000', type: 'destructions', value: 2000, reward: 0.005, name: '2K Destructions', icon: '💥' },
  { id: 'destructions_5000', type: 'destructions', value: 5000, reward: 0.005, name: '5K Destructions', icon: '💥' },
  { id: 'destructions_10000', type: 'destructions', value: 10000, reward: 0.005, name: '10K Destructions', icon: '💥' },
  { id: 'destructions_25000', type: 'destructions', value: 25000, reward: 0.005, name: '25K Destructions', icon: '💥' },
  { id: 'destructions_50000', type: 'destructions', value: 50000, reward: 0.005, name: '50K Destructions', icon: '💥' },
  { id: 'destructions_100000', type: 'destructions', value: 100000, reward: 0.005, name: '100K Destructions', icon: '💥' },
  { id: 'destructions_250000', type: 'destructions', value: 250000, reward: 0.005, name: '250K Destructions', icon: '💥' },
  { id: 'destructions_500000', type: 'destructions', value: 500000, reward: 0.005, name: '500K Destructions', icon: '💥' },
  { id: 'destructions_1000000', type: 'destructions', value: 1000000, reward: 0.005, name: '1M Destructions', icon: '💥' },
  
  // Extended Playtime
  { id: 'playtime_10000', type: 'playtime', value: 10000 * 60 * 1000, reward: 0.005, name: '10K Minutes', icon: '⏱️' },
  { id: 'playtime_20000', type: 'playtime', value: 20000 * 60 * 1000, reward: 0.005, name: '20K Minutes', icon: '⏱️' },
  { id: 'playtime_50000', type: 'playtime', value: 50000 * 60 * 1000, reward: 0.005, name: '50K Minutes', icon: '⏱️' },
  { id: 'playtime_100000', type: 'playtime', value: 100000 * 60 * 1000, reward: 0.005, name: '100K Minutes', icon: '⏱️' },
  { id: 'playtime_200000', type: 'playtime', value: 200000 * 60 * 1000, reward: 0.005, name: '200K Minutes', icon: '⏱️' },
  { id: 'playtime_500000', type: 'playtime', value: 500000 * 60 * 1000, reward: 0.005, name: '500K Minutes', icon: '⏱️' },
  
  // Streak Count
  { id: 'streak_10', type: 'streak_count', value: 10, reward: 0.005, name: '10 Click Streak', icon: '🔥' },
  { id: 'streak_25', type: 'streak_count', value: 25, reward: 0.005, name: '25 Click Streak', icon: '🔥' },
  { id: 'streak_50', type: 'streak_count', value: 50, reward: 0.005, name: '50 Click Streak', icon: '🔥' },
  { id: 'streak_100', type: 'streak_count', value: 100, reward: 0.005, name: '100 Click Streak', icon: '🔥' },
  { id: 'streak_200', type: 'streak_count', value: 200, reward: 0.005, name: '200 Click Streak', icon: '🔥' },
  { id: 'streak_300', type: 'streak_count', value: 300, reward: 0.005, name: '300 Click Streak', icon: '🔥' },
  { id: 'streak_400', type: 'streak_count', value: 400, reward: 0.005, name: '400 Click Streak', icon: '🔥' },
  { id: 'streak_500', type: 'streak_count', value: 500, reward: 0.005, name: '500 Click Streak', icon: '🔥' },
  { id: 'streak_750', type: 'streak_count', value: 750, reward: 0.005, name: '750 Click Streak', icon: '🔥' },
  { id: 'streak_1000', type: 'streak_count', value: 1000, reward: 0.005, name: '1K Click Streak', icon: '🔥' },
  { id: 'streak_2000', type: 'streak_count', value: 2000, reward: 0.005, name: '2K Click Streak', icon: '🔥' },
  { id: 'streak_5000', type: 'streak_count', value: 5000, reward: 0.005, name: '5K Click Streak', icon: '🔥' },
  
  // Streak Multiplier
  { id: 'streak_mult_1_01', type: 'streak_multiplier', value: 1.01, reward: 0.005, name: '1.01x Streak', icon: '⚡' },
  { id: 'streak_mult_1_03', type: 'streak_multiplier', value: 1.03, reward: 0.005, name: '1.03x Streak', icon: '⚡' },
  { id: 'streak_mult_1_06', type: 'streak_multiplier', value: 1.06, reward: 0.005, name: '1.06x Streak', icon: '⚡' },
  { id: 'streak_mult_1_10', type: 'streak_multiplier', value: 1.10, reward: 0.005, name: '1.10x Streak', icon: '⚡' },
  { id: 'streak_mult_1_15', type: 'streak_multiplier', value: 1.15, reward: 0.005, name: '1.15x Streak', icon: '⚡' },
  { id: 'streak_mult_1_20', type: 'streak_multiplier', value: 1.20, reward: 0.005, name: '1.20x Streak', icon: '⚡' },
  { id: 'streak_mult_1_25', type: 'streak_multiplier', value: 1.25, reward: 0.005, name: '1.25x Streak', icon: '⚡' },
  { id: 'streak_mult_1_30', type: 'streak_multiplier', value: 1.30, reward: 0.005, name: '1.30x Streak', icon: '⚡' },
  
  // Building Segment Upgrades
  { id: 'segment_upgrades_1', type: 'segment_upgrades', value: 1, reward: 0.005, name: '1 Segment UP', icon: '🔧' },
  { id: 'segment_upgrades_5', type: 'segment_upgrades', value: 5, reward: 0.005, name: '5 Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_10', type: 'segment_upgrades', value: 10, reward: 0.005, name: '10 Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_25', type: 'segment_upgrades', value: 25, reward: 0.005, name: '25 Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_50', type: 'segment_upgrades', value: 50, reward: 0.005, name: '50 Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_100', type: 'segment_upgrades', value: 100, reward: 0.005, name: '100 Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_250', type: 'segment_upgrades', value: 250, reward: 0.005, name: '250 Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_500', type: 'segment_upgrades', value: 500, reward: 0.005, name: '500 Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_1000', type: 'segment_upgrades', value: 1000, reward: 0.005, name: '1K Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_2500', type: 'segment_upgrades', value: 2500, reward: 0.005, name: '2.5K Segment UPs', icon: '🔧' },
  { id: 'segment_upgrades_5000', type: 'segment_upgrades', value: 5000, reward: 0.005, name: '5K Segment UPs', icon: '🔧' },
  
  // Golden Click Activations
  { id: 'golden_clicks_1', type: 'golden_clicks', value: 1, reward: 0.005, name: '1 Golden Click', icon: '✨' },
  { id: 'golden_clicks_5', type: 'golden_clicks', value: 5, reward: 0.005, name: '5 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_10', type: 'golden_clicks', value: 10, reward: 0.005, name: '10 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_25', type: 'golden_clicks', value: 25, reward: 0.005, name: '25 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_50', type: 'golden_clicks', value: 50, reward: 0.005, name: '50 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_100', type: 'golden_clicks', value: 100, reward: 0.005, name: '100 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_250', type: 'golden_clicks', value: 250, reward: 0.005, name: '250 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_500', type: 'golden_clicks', value: 500, reward: 0.005, name: '500 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_1000', type: 'golden_clicks', value: 1000, reward: 0.005, name: '1K Golden Clicks', icon: '✨' },
  
  // Broken Click Events
  { id: 'broken_clicks_1', type: 'broken_clicks', value: 1, reward: 0.005, name: '1 Broken Click', icon: '💔' },
  { id: 'broken_clicks_5', type: 'broken_clicks', value: 5, reward: 0.005, name: '5 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_10', type: 'broken_clicks', value: 10, reward: 0.005, name: '10 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_25', type: 'broken_clicks', value: 25, reward: 0.005, name: '25 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_50', type: 'broken_clicks', value: 50, reward: 0.005, name: '50 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_100', type: 'broken_clicks', value: 100, reward: 0.005, name: '100 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_250', type: 'broken_clicks', value: 250, reward: 0.005, name: '250 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_500', type: 'broken_clicks', value: 500, reward: 0.005, name: '500 Broken Clicks', icon: '💔' },
  
  // Casino Wins
  { id: 'casino_wins_1', type: 'casino_wins', value: 1, reward: 0.005, name: '1 Casino Win', icon: '🎰' },
  { id: 'casino_wins_5', type: 'casino_wins', value: 5, reward: 0.005, name: '5 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_10', type: 'casino_wins', value: 10, reward: 0.005, name: '10 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_25', type: 'casino_wins', value: 25, reward: 0.005, name: '25 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_50', type: 'casino_wins', value: 50, reward: 0.005, name: '50 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_100', type: 'casino_wins', value: 100, reward: 0.005, name: '100 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_250', type: 'casino_wins', value: 250, reward: 0.005, name: '250 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_500', type: 'casino_wins', value: 500, reward: 0.005, name: '500 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_1000', type: 'casino_wins', value: 1000, reward: 0.005, name: '1K Casino Wins', icon: '🎰' },
  
  // Casino Losses
  { id: 'casino_losses_1', type: 'casino_losses', value: 1, reward: 0.005, name: '1 Casino Loss', icon: '🎲' },
  { id: 'casino_losses_5', type: 'casino_losses', value: 5, reward: 0.005, name: '5 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_10', type: 'casino_losses', value: 10, reward: 0.005, name: '10 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_25', type: 'casino_losses', value: 25, reward: 0.005, name: '25 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_50', type: 'casino_losses', value: 50, reward: 0.005, name: '50 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_100', type: 'casino_losses', value: 100, reward: 0.005, name: '100 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_250', type: 'casino_losses', value: 250, reward: 0.005, name: '250 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_500', type: 'casino_losses', value: 500, reward: 0.005, name: '500 Casino Losses', icon: '🎲' },
  
  // Special Events
  { id: 'spider_encounter', type: 'spider_encounter', value: 1, reward: 0.005, name: 'Spider Encounter', icon: '🕷️' },
  { id: 'angry_barmatun_encounter', type: 'angry_barmatun_encounter', value: 1, reward: 0.005, name: 'Angry Barmatun Encounter', icon: '😠' },
  { id: 'elf_archer_encounter', type: 'elf_archer_encounter', value: 1, reward: 0.005, name: 'Elf Archer Encounter', icon: '🏹' },
  { id: 'king_encounter', type: 'king_encounter', value: 1, reward: 0.005, name: 'King Encounter', icon: '👑' },
  
  // Time-based Achievements
  { id: 'consecutive_days_1', type: 'consecutive_days', value: 1, reward: 0.005, name: '1 Day Streak', icon: '📅' },
  { id: 'consecutive_days_3', type: 'consecutive_days', value: 3, reward: 0.005, name: '3 Day Streak', icon: '📅' },
  { id: 'consecutive_days_7', type: 'consecutive_days', value: 7, reward: 0.005, name: '7 Day Streak', icon: '📅' },
  { id: 'consecutive_days_14', type: 'consecutive_days', value: 14, reward: 0.005, name: '14 Day Streak', icon: '📅' },
  { id: 'consecutive_days_30', type: 'consecutive_days', value: 30, reward: 0.005, name: '30 Day Streak', icon: '📅' },
  { id: 'consecutive_days_60', type: 'consecutive_days', value: 60, reward: 0.005, name: '60 Day Streak', icon: '📅' },
  { id: 'consecutive_days_90', type: 'consecutive_days', value: 90, reward: 0.005, name: '90 Day Streak', icon: '📅' },
  { id: 'consecutive_days_180', type: 'consecutive_days', value: 180, reward: 0.005, name: '180 Day Streak', icon: '📅' },
  { id: 'consecutive_days_365', type: 'consecutive_days', value: 365, reward: 0.005, name: '365 Day Streak', icon: '📅' },
  
  // Longest Session Achievements
  { id: 'longest_session_1h', type: 'longest_session', value: 60 * 60 * 1000, reward: 0.005, name: '1 Hour Session', icon: '⏰' },
  { id: 'longest_session_2h', type: 'longest_session', value: 2 * 60 * 60 * 1000, reward: 0.005, name: '2 Hour Session', icon: '⏰' },
  { id: 'longest_session_4h', type: 'longest_session', value: 4 * 60 * 60 * 1000, reward: 0.005, name: '4 Hour Session', icon: '⏰' },
  { id: 'longest_session_6h', type: 'longest_session', value: 6 * 60 * 60 * 1000, reward: 0.005, name: '6 Hour Session', icon: '⏰' },
  { id: 'longest_session_8h', type: 'longest_session', value: 8 * 60 * 60 * 1000, reward: 0.005, name: '8 Hour Session', icon: '⏰' },
  { id: 'longest_session_12h', type: 'longest_session', value: 12 * 60 * 60 * 1000, reward: 0.005, name: '12 Hour Session', icon: '⏰' },
  { id: 'longest_session_24h', type: 'longest_session', value: 24 * 60 * 60 * 1000, reward: 0.005, name: '24 Hour Session', icon: '⏰' },
  
  // Milestone Combinations - Clicks + Buildings
  { id: 'milestone_clicks_1m_buildings_10', type: 'milestone_combination', clicks: 1000000, buildings: 10, reward: 0.005, name: '1M Clicks + 10 Buildings', icon: '🎯' },
  { id: 'milestone_clicks_10m_buildings_25', type: 'milestone_combination', clicks: 10000000, buildings: 25, reward: 0.005, name: '10M Clicks + 25 Buildings', icon: '🎯' },
  { id: 'milestone_clicks_100m_buildings_50', type: 'milestone_combination', clicks: 100000000, buildings: 50, reward: 0.005, name: '100M Clicks + 50 Buildings', icon: '🎯' },
  { id: 'milestone_points_1m_time_1h', type: 'milestone_combination_points_time', points: 1000000, time: 60 * 60 * 1000, reward: 0.005, name: '1M Points in 1 Hour', icon: '⚡' },
  { id: 'milestone_points_10m_time_1h', type: 'milestone_combination_points_time', points: 10000000, time: 60 * 60 * 1000, reward: 0.005, name: '10M Points in 1 Hour', icon: '⚡' },
  { id: 'milestone_points_100m_time_1h', type: 'milestone_combination_points_time', points: 100000000, time: 60 * 60 * 1000, reward: 0.005, name: '100M Points in 1 Hour', icon: '⚡' },
];

// Получить общий бонус от всех достижений
function getAchievementBonus() {
  if (!save || !save.achievements) return 1.0;
  let bonus = 1.0;
  ACHIEVEMENTS.forEach(ach => {
    if (save.achievements.unlocked[ach.id]) {
      bonus += ach.reward;
    }
  });
  return bonus;
}

// Проверить условие достижения
function checkAchievementCondition(ach) {
  if (!save || !save.achievements) return false;
  
  const stats = save.achievements.stats;
  const currentPPS = totalPPS();
  const currentPPC = totalPPC();
  
  switch(ach.type) {
    case 'clicks':
      return stats.totalClicks >= ach.value;
    case 'first_building':
      return stats.firstBuildingBought;
    case 'buildings_level':
      const count = save.buildings.filter(b => b.level >= ach.level).length;
      return count >= ach.count;
    case 'uber_unlock':
      return save.uber.unlocked;
    case 'uber_level':
      return save.uber.level >= ach.value;
    case 'destructions':
      return stats.totalDestructions >= ach.value;
    case 'playtime':
      return stats.totalPlayTime >= ach.value;
    case 'manual':
      return save.achievements.unlocked[ach.id] || false;
    case 'click_level':
      return save.click.level >= ach.value;
    case 'click_upgrade':
      return (save.click.upgradeBonus || 0) >= ach.value;
    case 'points_earned':
      return (stats.totalPointsEarned || 0) >= ach.value;
    case 'points_spent':
      return (stats.totalPointsSpent || 0) >= ach.value;
    case 'pps_current':
      return currentPPS >= ach.value;
    case 'pps_highest':
      return (stats.highestPPS || 0) >= ach.value;
    case 'ppc_current':
      return currentPPC >= ach.value;
    case 'ppc_highest':
      return (stats.highestPPC || 0) >= ach.value;
    case 'total_building_levels':
      const totalLevels = save.buildings.reduce((sum, b) => sum + (b.level || 0), 0);
      return totalLevels >= ach.value;
    case 'unlocked_buildings':
      const unlockedCount = save.buildings.filter(b => (b.level || 0) > 0).length;
      return unlockedCount >= ach.value;
    case 'streak_count':
      return (save.streak.count || 0) >= ach.value;
    case 'streak_multiplier':
      return (save.streak.multiplier || 1) >= ach.value;
    case 'segment_upgrades':
      return (stats.totalSegmentUpgrades || 0) >= ach.value;
    case 'golden_clicks':
      // Синхронизируем старые и новые имена
      const goldenClicks = stats.goldenClicksActivated || stats.goldenClickActivations || 0;
      return goldenClicks >= ach.value;
    case 'broken_clicks':
      // Синхронизируем старые и новые имена
      const brokenClicks = stats.brokenClicksEncountered || stats.brokenClickEvents || 0;
      return brokenClicks >= ach.value;
    case 'casino_wins':
      return (stats.casinoWins || 0) >= ach.value;
    case 'casino_losses':
      return (stats.casinoLosses || 0) >= ach.value;
    case 'spider_encounter':
      return (stats.spiderEncounters || 0) >= ach.value;
    case 'angry_barmatun_encounter':
      return (stats.angryBarmatunEncounters || 0) >= ach.value;
    case 'elf_archer_encounter':
      return (stats.elfArcherEncounters || 0) >= ach.value;
    case 'king_encounter':
      return (stats.kingEncounters || 0) >= ach.value;
    case 'consecutive_days':
      return (stats.consecutiveDaysPlayed || 0) >= ach.value;
    case 'longest_session':
      // Синхронизируем старые и новые имена
      const longestSession = stats.longestSessionTime || stats.longestSession || 0;
      return longestSession >= ach.value;
    case 'milestone_combination':
      return stats.totalClicks >= ach.clicks && save.buildings.filter(b => (b.level || 0) > 0).length >= ach.buildings;
    case 'milestone_combination_points_time':
      return (stats.totalPointsEarned || 0) >= ach.points && (stats.totalPlayTime || 0) >= ach.time;
    default:
      return false;
  }
}

// Проверить и разблокировать достижения
function checkAchievements() {
  if (!save || !save.achievements) return;
  
  let anyUnlocked = false;
  ACHIEVEMENTS.forEach(ach => {
    if (!save.achievements.unlocked[ach.id] && checkAchievementCondition(ach)) {
      save.achievements.unlocked[ach.id] = true;
      anyUnlocked = true;
      toast(`Achievement unlocked: ${ach.name} (+${(ach.reward * 100).toFixed(0)}% income)!`, 'good');
      
      // XP за достижение (определяем tier на основе типа)
      if (typeof addXPForAchievement === 'function') {
        let tier = 0; // Простые по умолчанию
        let achievementValue = 0;
        
        if (ach.type === 'clicks') {
          achievementValue = ach.value || 0;
          if (achievementValue >= 1000000) tier = 2; // Сложные
          else if (achievementValue >= 10000) tier = 1; // Средние
        } else if (ach.type === 'buildings_level') {
          achievementValue = ach.level || 0;
          if (achievementValue >= 800) tier = 2; // Сложные
          else if (achievementValue >= 100) tier = 1; // Средние
        } else if (ach.type === 'playtime') {
          achievementValue = ach.value || 0;
          if (achievementValue >= 3600000) tier = 2; // Сложные (1 час+)
          else if (achievementValue >= 300000) tier = 1; // Средние (5 минут+)
        } else {
          // Для других типов используем значение если есть
          achievementValue = ach.value || 0;
        }
        
        addXPForAchievement(tier, achievementValue);
      }
    }
  });
  
  if (anyUnlocked) {
    renderAchievements();
  }
}

// Миграция старых сохранений: восстановление статистики и разблокировка достижений
function migrateAchievements() {
  if (!save || !save.achievements) return;
  
  // Восстанавливаем статистику из текущего состояния игры
  // Время игры - если не было отслеживания, вычисляем из даты создания
  if (save.achievements.stats.totalPlayTime === 0 && save.meta && save.meta.created) {
    const estimatedPlayTime = Math.max(0, now() - save.meta.created);
    save.achievements.stats.totalPlayTime = estimatedPlayTime;
  }
  
  // Проверяем, было ли куплено первое здание
  if (!save.achievements.stats.firstBuildingBought) {
    const hasAnyBuilding = save.buildings && save.buildings.some(b => b && b.level >= 1);
    if (hasAnyBuilding) {
      save.achievements.stats.firstBuildingBought = true;
    }
  }
  
  // Проверяем и разблокируем все достижения, которые уже должны быть получены
  // (без показа toast, так как это миграция старых сохранений)
  let migratedCount = 0;
  ACHIEVEMENTS.forEach(ach => {
    if (!save.achievements.unlocked[ach.id] && checkAchievementCondition(ach)) {
      save.achievements.unlocked[ach.id] = true;
      migratedCount++;
    }
  });
  
  // Если были разблокированы достижения при миграции, обновляем рендер
  if (migratedCount > 0) {
    // Не показываем toast для миграции, но обновляем UI
    renderAchievements();
  }
}

// ======= Game state helpers =======

// Система восстановления дебафа от кликов (работает параллельно с переливом дохода)
// Восстановление происходит ТОЛЬКО в tick() с dt для плавности
// Использует тот же таймер что и перелив дохода (incomeTransferLastClickTs)
let _lastDebuffUpdateTs = 0;
function updateClickDebuff(dt = null, updateOnly = false) {
  if (!save || !save.modifiers) return;
  
  const tNow = now();
  // Используем тот же таймер что и перелив дохода для синхронизации
  const lastClickTs = save.modifiers.incomeTransferLastClickTs || 0;
  
  // Если дебаф есть и прошло хотя бы 5 секунд с последнего клика
  if (save.modifiers.clickDebuffLevel > 0 && lastClickTs > 0) {
    const timeSinceLastClick = (tNow - lastClickTs) / 1000; // время в секундах
    
    // Восстанавливаем за 15 секунд (как и перелив дохода)
    // Восстановление начинается через 5 секунд после последнего клика
    // Восстановление происходит ТОЛЬКО если передан dt (в tick())
    if (timeSinceLastClick >= 5.0) {
      if (dt !== null && dt > 0 && dt < 1.0 && !updateOnly) {
        // Возвращаем дебаф обратно за 15 секунд (как и перелив)
        // Скорость возврата: текущий уровень / 15 сек
        const currentDebuffLevel = save.modifiers.clickDebuffLevel;
        const returnRatePerSecond = currentDebuffLevel / 15.0; // % в секунду (динамически)
        const returnAmount = dt * returnRatePerSecond;
        save.modifiers.clickDebuffLevel = Math.max(0, save.modifiers.clickDebuffLevel - returnAmount);
        
        // Если дебаф обнулился, сбрасываем (таймер сбрасывается в updateIncomeTransfer)
        if (save.modifiers.clickDebuffLevel <= 0) {
          save.modifiers.clickDebuffLevel = 0;
        }
      }
    }
  }
}

// Система перелива дохода: при клике отнимается 1% от дохода зданий, 5% от отнятого добавляется к клику
function updateIncomeTransfer(dt = null) {
  if (!save || !save.modifiers) return;
  
  const tNow = now();
  const lastClickTs = save.modifiers.incomeTransferLastClickTs || 0;
  
  if (save.modifiers.incomeTransferLevel > 0) {
    const timeSinceLastClick = (tNow - lastClickTs) / 1000; // время в секундах
    
    // Если прошло больше 5 секунд без кликов, начинаем возвращать доход
    if (timeSinceLastClick > 5.0) {
      if (dt !== null && dt > 0 && dt < 1.0) {
        // Возвращаем доход обратно за 15 секунд
        // Скорость возврата: 100% / 15 сек = 6.666...% в секунду
        const returnRatePerSecond = 100.0 / 15.0; // 6.666...% в секунду
        const returnAmount = dt * returnRatePerSecond;
        save.modifiers.incomeTransferLevel = Math.max(0, save.modifiers.incomeTransferLevel - returnAmount);
        
        // Если уровень обнулился, сбрасываем таймер
        if (save.modifiers.incomeTransferLevel <= 0) {
          save.modifiers.incomeTransferLevel = 0;
          save.modifiers.incomeTransferLastClickTs = 0;
        }
      }
    }
  }
}

// ======= Система перегрева и дебафа кнопки клика =======
// Производительность: 
// - updateClickHeat() и updateClickDebuff() вызываются ~2.86 раз/сек (каждые 350мс в tick())
// - Простые математические операции, минимальная нагрузка на CPU
// - getClickSpeed() использует экспоненциальное сглаживание для плавности
// - DOM обновления дебаунсятся через requestAnimationFrame

// Система перегрева кнопки клика на основе скорости кликов
function getClickSpeed() {
  if (!save || !save.click || !save.click.clickHistory) return 0;
  
  const tNow = now();
  const twoSecondsAgo = tNow - 2000; // Используем 2 секунды для более стабильного расчета
  
  // Очищаем старые клики (старше 2 секунд)
  save.click.clickHistory = save.click.clickHistory.filter(ts => ts > twoSecondsAgo);
  
  // Вычисляем среднюю скорость за последние 2 секунды (более стабильно)
  const clicksIn2Seconds = save.click.clickHistory.length;
  const rawSpeed = clicksIn2Seconds / 2; // кликов в секунду
  
  // Применяем экспоненциальное сглаживание для плавных переходов
  // Используем коэффициент сглаживания 0.3 (чем меньше, тем плавнее, но медленнее реакция)
  const smoothingFactor = 0.3;
  if (!save.click.smoothedSpeed) {
    save.click.smoothedSpeed = rawSpeed;
  } else {
    // Экспоненциальное сглаживание: новое = старое + (новое - старое) * коэффициент
    save.click.smoothedSpeed = save.click.smoothedSpeed + (rawSpeed - save.click.smoothedSpeed) * smoothingFactor;
  }
  
  // Возвращаем сглаженную скорость, округленную до 1 знака после запятой
  return Math.round(save.click.smoothedSpeed * 10) / 10;
}

function updateClickHeat() {
  if (!save || !save.click) return;
  
  const tNow = now();
  const lastUpdate = save.click.lastHeatUpdate || tNow;
  const timePassed = (tNow - lastUpdate) / 1000; // время в секундах
  
  // Если кнопка в перегреве (cooldown), не уменьшаем heat
  if (save.click.cooldownUntil > tNow) {
    save.click.lastHeatUpdate = tNow;
    return;
  }
  
  // Если перегрев закончился, сбрасываем heat
  if (save.click.cooldownUntil > 0 && save.click.cooldownUntil <= tNow) {
    const wasOverheated = save.click.cooldownUntil > 0;
    save.click.heat = 0;
    save.click.cooldownUntil = 0;
    // XP за успешное охлаждение
    if (wasOverheated && typeof addXPForCooldown === 'function') {
      addXPForCooldown();
    }
  }
  
  // Охлаждение: уменьшаем heat на 1 единицу в секунду (только если скорость < 21)
  const clickSpeed = getClickSpeed();
  if (clickSpeed < 21) {
    const cooldownRate = 1.0; // единиц в секунду
    const heatReduction = cooldownRate * timePassed;
    save.click.heat = Math.max(0, save.click.heat - heatReduction);
  }
  
  save.click.lastHeatUpdate = tNow;
}

function addClickToHistory() {
  if (!save || !save.click) return;
  
  if (!save.click.clickHistory) {
    save.click.clickHistory = [];
  }
  
  const tNow = now();
  save.click.clickHistory.push(tNow);
  
  // Очищаем старые клики (старше 2 секунд для более стабильного расчета)
  const twoSecondsAgo = tNow - 2000;
  save.click.clickHistory = save.click.clickHistory.filter(ts => ts > twoSecondsAgo);
  
  // Вычисляем сглаженную скорость кликов
  const clickSpeed = getClickSpeed();
  
  // Если скорость 21+ кликов/сек, начинаем накапливать перегрев
  if (clickSpeed >= 21) {
    updateClickHeat(); // обновляем охлаждение перед добавлением
    save.click.heat = Math.min(100, save.click.heat + 5);
    
    // Если достигли максимума, активируем перегрев
    if (save.click.heat >= 100) {
      save.click.heat = 100;
      save.click.cooldownUntil = now() + 16000; // 16 секунд перегрева
      toast('Click button overheated! Cooling down...', 'warn');
    }
  }
}

function isClickOverheated() {
  if (!save || !save.click) return false;
  updateClickHeat(); // обновляем перед проверкой
  return save.click.cooldownUntil > now();
}

function getHeatBarColor(clickSpeed) {
  // Плавные переходы между цветами на основе интерполяции
  if (clickSpeed <= 5) {
    return '#00ff00'; // зеленый - нормально
  } else if (clickSpeed < 9) {
    // Плавный переход от зеленого к желтоватому (5-9)
    const t = (clickSpeed - 5) / 4; // 0-1
    return interpolateColor('#00ff00', '#ccff00', t);
  } else if (clickSpeed < 13) {
    // Плавный переход от желтоватого к желтому (9-13)
    const t = (clickSpeed - 9) / 4; // 0-1
    return interpolateColor('#ccff00', '#ffcc00', t);
  } else if (clickSpeed < 16) {
    // Плавный переход от желтого к оранжевому (13-16)
    const t = (clickSpeed - 13) / 3; // 0-1
    return interpolateColor('#ffcc00', '#ff6600', t);
  } else if (clickSpeed < 21) {
    // Плавный переход от оранжевого к красному (16-21)
    const t = (clickSpeed - 16) / 5; // 0-1
    return interpolateColor('#ff6600', '#ff0000', t);
  } else {
    return '#ff0000'; // красный (21+)
  }
}

// Функция для плавной интерполяции между цветами
function interpolateColor(color1, color2, t) {
  // t от 0 до 1
  t = Math.max(0, Math.min(1, t)); // Ограничиваем t в диапазоне 0-1
  
  // Парсим hex цвета в RGB
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  // Интерполируем каждый канал
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  
  // Возвращаем hex цвет
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function totalPPC() {
  // Используем кэш если значение еще актуально
  const t = now();
  if (_cachedPPC !== null && (t - _cachedPPCTime) < CACHE_TTL) {
    return _cachedPPC;
  }
  
  let ppc = clickIncomeAt(save.click.level, save.click.upgradeBonus);
  const tNow = t; // Кэшируем now() для всех проверок
  // Madness modifier
  if (save.treasury?.actions?.clickMadnessUntil > tNow) {
    ppc *= 99.9999;
  }
  // Golden modifier
  const goldenActive = save.click.goldenUntil > tNow;
  const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
  // Spider modifier
  const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
  // Achievement bonus
  const achievementMult = getAchievementBonus();
  // Streak multiplier
  const streakMult = save.streak ? save.streak.multiplier : 1.0;
  // Buff 1: No Golden Click - 17% less income
  const act = save.treasury?.actions;
  const noGoldenMult = (act && act.noGoldenUntil > tNow) ? 0.17 : 1.0;
  // Angry Barmatun: Income reduction (50% less) - applied to all income
  const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
  // Elf Archer: x33 multiplier for 11 seconds on hit
  const elfArcherMult = save.modifiers.elfArcherUntil > tNow ? save.modifiers.elfArcherMult : 1.0;
  // King debuff: Passive income reduction
  const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
  
  // Система перелива дохода: добавляем 5% от перелитого дохода к клику
  // НЕ вызываем updateIncomeTransfer() здесь - он уже вызван в tick() с правильным dt
  // Это избегает дублирующих вызовов и улучшает производительность
  
  let incomeTransferBonus = 0;
  if (save.modifiers.incomeTransferLevel > 0) {
    // Вычисляем базовый доход зданий (без перелива и других модификаторов, влияющих на перелив)
    let basePPS = 0;
    for (const b of save.buildings) {
      if (tNow < b.blockedUntil) continue;
      if (b.level < 1) continue;
      basePPS += buildingIncomeAt(b, b.level, b.upgradeBonus);
    }
    if (save.uber.unlocked) {
      basePPS += uberIncomeAt(save.uber.level);
    }
    
    // Применяем только те модификаторы, которые не зависят от перелива
    // ВАЖНО: clickDebuffMult НЕ применяется к переливу, так как дебаф влияет только на пассивный доход зданий, а не на перелив к клику
    const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
    const act = save.treasury?.actions;
    const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
    const basePPSWithMods = basePPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
    
    // Вычисляем сколько дохода перелито
    const transferPercent = Math.min(100, save.modifiers.incomeTransferLevel);
    const transferedIncome = basePPSWithMods * (transferPercent / 100);
    
    // Добавляем 5% от перелитого дохода к клику
    incomeTransferBonus = transferedIncome * 0.05;
  }
  
  // Note: Random click multiplier is applied per-click in clickBtn event handler, not here
  
  // Debuffs from buffs
  const lazyClickDebuffPPCMult = save.modifiers.lazyClickDebuffPPCUntil > tNow ? 0.75 : 1.0; // -25%
  const clickMadnessDebuffPPCMult = save.modifiers.clickMadnessDebuffPPCUntil > tNow ? 0.50 : 1.0; // -50%
  const alwaysGoldenDebuffPPCMult = save.modifiers.alwaysGoldenDebuffPPCUntil > tNow ? 0.65 : 1.0; // -35%
  const passiveBoostDebuffPPCMult = save.modifiers.passiveBoostDebuffPPCUntil > tNow ? 0.75 : 1.0; // -25%
  const masterBuilderDebuffPPCMult = save.modifiers.masterBuilderDebuffPPCUntil > tNow ? 0.70 : 1.0; // -30%
  const spiderBuffDebuffPPCMult = save.modifiers.spiderBuffDebuffPPCUntil > tNow ? 0.75 : 1.0; // -25%
  
  const result = ppc * goldenMult * spiderMult * achievementMult * streakMult * noGoldenMult * angryBarmatunIncomeReduction * elfArcherMult * kingDebuffMult * lazyClickDebuffPPCMult * clickMadnessDebuffPPCMult * alwaysGoldenDebuffPPCMult * passiveBoostDebuffPPCMult * masterBuilderDebuffPPCMult * spiderBuffDebuffPPCMult + incomeTransferBonus;
  
  // Сохраняем в кэш
  _cachedPPC = result;
  _cachedPPCTime = t;
  
  return result;
}

function totalPPS() {
  // Используем кэш если значение еще актуально
  const t = now();
  if (_cachedPPS !== null && (t - _cachedPPSTime) < CACHE_TTL) {
    return _cachedPPS;
  }
  
  let pps = 0;
  const tNow = t; // Кэшируем now() для всех проверок
  for (const b of save.buildings) {
    if (tNow < b.blockedUntil) continue; // downtime disabled
    if (b.level < 1) continue;            // no income if level < 1
    pps += buildingIncomeAt(b, b.level, b.upgradeBonus);
  }

  // Uber income
  if (save.uber.unlocked) {
    pps += uberIncomeAt(save.uber.level);
  }
  // Spider modifier
  const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
  // Achievement bonus
  const achievementMult = getAchievementBonus();
  const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0; // x11
  // Buff 4: Passive income boost
  const act = save.treasury?.actions;
  const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
  // Angry Barmatun: Income reduction (50% less)
  const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
  // King debuff: Passive income reduction
  const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
  // Click debuff: -0.1% пассивного дохода за каждый клик (накопительно, не влияет на клики, максимум -100%)
  // НЕ восстанавливаем здесь - восстановление происходит только в tick() для плавности
  // Просто читаем текущее значение
  let clickDebuffMult = 1.0;
  if (save.modifiers.clickDebuffLevel > 0) {
    // Ограничиваем дебаф максимумом -100%
    const debuffPercent = Math.min(100, save.modifiers.clickDebuffLevel);
    clickDebuffMult = Math.max(0, 1 - (debuffPercent / 100)); // Минимум 0 (не может быть отрицательным)
  }
  // Система перелива дохода: отнимаем процент от дохода зданий
  // НЕ вызываем updateIncomeTransfer() здесь - он уже вызван в tick() с правильным dt
  // Это избегает дублирующих вызовов и улучшает производительность
  
  let incomeTransferMult = 1.0;
  if (save.modifiers.incomeTransferLevel > 0) {
    // Отнимаем процент от дохода зданий (0-100%)
    const transferPercent = Math.min(100, save.modifiers.incomeTransferLevel);
    incomeTransferMult = 1 - (transferPercent / 100); // Например, 10% = 0.9 множитель
  }
  
  // Buff 5: Spider Buff - не обнуляет доход, только изменяет поведение клика (клик дает казну вместо поинтов)
  // Доход от зданий продолжает работать нормально
  
  // Debuffs from buffs
  const repairDebuffPPSMult = save.modifiers.repairDebuffPPSUntil > tNow ? 0.85 : 1.0; // -15%
  const lazyClickDebuffPPSMult = save.modifiers.lazyClickDebuffPPSMult || 1.0;
  const profitWithoutTaxDebuffPPSMult = save.modifiers.profitWithoutTaxDebuffPPSUntil > tNow ? 0.70 : 1.0; // -30%
  const engineerDebuffPPSMult = save.modifiers.engineerDebuffPPSUntil > tNow ? 0.75 : 1.0; // -25%
  const passiveBoostDebuffPPSMult = save.modifiers.passiveBoostDebuffPPSUntil > tNow ? 0.70 : 1.0; // -30%
  const masterBuilderDebuffPPSMult = save.modifiers.masterBuilderDebuffPPSUntil > tNow ? 0.60 : 1.0; // -40%
  const spiderBuffDebuffPPSMult = save.modifiers.spiderBuffDebuffPPSUntil > tNow ? 0.80 : 1.0; // -20%
  
  const result = pps * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult * clickDebuffMult * incomeTransferMult * repairDebuffPPSMult * lazyClickDebuffPPSMult * profitWithoutTaxDebuffPPSMult * engineerDebuffPPSMult * passiveBoostDebuffPPSMult * masterBuilderDebuffPPSMult * spiderBuffDebuffPPSMult;
  
  // Сохраняем в кэш
  _cachedPPS = result;
  _cachedPPSTime = t;
  
  return result;
}

// Calculate offline earnings for buildings (excluding uber)
function calculateBuildingOfflineEarnings(timeAwaySeconds) {
  if (!save || timeAwaySeconds <= 0) return 0;
  
  let buildingPPS = 0;
  for (const b of save.buildings) {
    // For offline calculation, we assume buildings weren't blocked
    // (blockedUntil is a real-time mechanic)
    if (b.level < 1) continue;
    buildingPPS += buildingIncomeAt(b, b.level, b.upgradeBonus);
  }
  
  // Apply modifiers that would have been active (simplified - use current state)
  const spiderMult = save.modifiers.spiderUntil > now() ? save.modifiers.spiderMult : 1.0;
  const achievementMult = getAchievementBonus();
  const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > now() ? 11 : 1.0;
  const act = save.treasury?.actions;
  const passiveBoostMult = (act && act.passiveBoostUntil > now() && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
  const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > now() ? 0.5 : 1.0;
  const kingDebuffMult = save.modifiers.kingDebuffUntil > now() ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
  // Click debuff: -0.1% пассивного дохода за каждый клик (накопительно, максимум -100%)
  // Обновляем дебаф перед вычислением (восстановление за прошедшее время)
  // Восстановление дебафа происходит только в tick() для плавности
  let clickDebuffMult = 1.0;
  if (save.modifiers.clickDebuffLevel > 0) {
    // Ограничиваем дебаф максимумом -100%
    const debuffPercent = Math.min(100, save.modifiers.clickDebuffLevel);
    clickDebuffMult = Math.max(0, 1 - (debuffPercent / 100)); // Минимум 0 (не может быть отрицательным)
  }
  // Spider Buff не обнуляет доход от зданий
  const totalPPS = buildingPPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult * clickDebuffMult;
  return totalPPS * timeAwaySeconds;
}

// Calculate offline earnings for uber building
function calculateUberOfflineEarnings(timeAwaySeconds) {
  if (!save || timeAwaySeconds <= 0 || !save.uber.unlocked) return 0;
  
  const uberPPS = uberIncomeAt(save.uber.level);
  
  // Apply modifiers
  const spiderMult = save.modifiers.spiderUntil > now() ? save.modifiers.spiderMult : 1.0;
  const achievementMult = getAchievementBonus();
  const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > now() ? 11 : 1.0;
  const act = save.treasury?.actions;
  const passiveBoostMult = (act && act.passiveBoostUntil > now() && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
  const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > now() ? 0.5 : 1.0;
  const kingDebuffMult = save.modifiers.kingDebuffUntil > now() ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
  // Click debuff: -0.1% пассивного дохода за каждый клик (накопительно, максимум -100%)
  // Обновляем дебаф перед вычислением (восстановление за прошедшее время)
  // Восстановление дебафа происходит только в tick() для плавности
  let clickDebuffMult = 1.0;
  if (save.modifiers.clickDebuffLevel > 0) {
    // Ограничиваем дебаф максимумом -100%
    const debuffPercent = Math.min(100, save.modifiers.clickDebuffLevel);
    clickDebuffMult = Math.max(0, 1 - (debuffPercent / 100)); // Минимум 0 (не может быть отрицательным)
  }
  // Spider Buff не обнуляет доход от uber здания
  const totalPPS = uberPPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult * clickDebuffMult;
  return totalPPS * timeAwaySeconds;
}

// Format time away as "X hours Y minutes Z seconds"
function formatTimeAway(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  
  return parts.join(' ');
}

// Show away message with earnings in modal
function showAwayMessage(timeAwaySeconds, buildingEarnings, uberEarnings) {
  const timeStr = formatTimeAway(timeAwaySeconds);
  const buildingEarningsStr = fmt(buildingEarnings);
  const uberEarningsStr = fmt(uberEarnings);
  
  const modal = document.getElementById('offline-earnings-modal');
  const body = document.getElementById('offline-earnings-body');
  
  if (!modal || !body) return;
  
  let html = `<p><strong>You were away:</strong> ${timeStr}</p>`;
  html += `<p><strong>During this time your buildings earned:</strong> ${buildingEarningsStr}</p>`;
  if (uberEarnings > 0) {
    html += `<p><strong>Uber building earned:</strong> ${uberEarningsStr}</p>`;
  }
  
  body.innerHTML = html;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.remove('hidden');
  // Block body scroll when modal is open
  document.body.classList.add('modal-open');
}

// Check and process offline earnings
// Always show modal on page reload if time away > 0
// Note: lastActivityTime is updated in beforeunload, not here
function checkOfflineEarnings() {
  if (!save) return;
  
  const currentTime = now();
  // Only check if lastActivityTime was already set (not first load)
  if (!save.lastActivityTime) {
    // First load - set activity time but don't show modal
    save.lastActivityTime = currentTime;
    return;
  }
  
  const lastActivity = save.lastActivityTime;
  const timeAwayMs = currentTime - lastActivity;
  
  // Minimum threshold: 3 minutes (180000 ms)
  const MIN_AWAY_TIME_MS = 3 * 60 * 1000; // 3 minutes
  // Maximum offline time: 99999 minutes
  const MAX_OFFLINE_TIME_SECONDS = 99999 * 60; // 99999 minutes in seconds
  
  // Show message if time away > 3 minutes (on page reload)
  if (timeAwayMs > MIN_AWAY_TIME_MS) {
    let timeAwaySeconds = timeAwayMs / 1000;
    
    // Cap the time at maximum offline time
    if (timeAwaySeconds > MAX_OFFLINE_TIME_SECONDS) {
      timeAwaySeconds = MAX_OFFLINE_TIME_SECONDS;
    }
    
    // Calculate offline earnings
    const buildingEarnings = calculateBuildingOfflineEarnings(timeAwaySeconds);
    const uberEarnings = calculateUberOfflineEarnings(timeAwaySeconds);
    const totalEarnings = buildingEarnings + uberEarnings;
    
    // Add earnings to points
    if (totalEarnings > 0) {
      addPoints(totalEarnings);
    }
    
    // Show modal with a small delay to ensure DOM is ready
    setTimeout(() => {
      showAwayMessage(timeAwaySeconds, buildingEarnings, uberEarnings);
    }, 100);
  }
  
  // Don't update lastActivityTime here - it will be updated when user clicks OK or on beforeunload
}

function canBuyNextBuilding(i) {
  if (i === 0) return true;
  // "Cannot upgrade next building until previous is level 67"
  return save.buildings[i-1].level >= 67;
}

function canProgressSegment(entityLevel, segUpgrades) {
  // Если segUpgrades не передан или null/undefined, значит апгрейды не требуются (например, для uber)
  // ВАЖНО: typeof null === 'object' в JavaScript (это баг языка), поэтому нужна явная проверка на null
  if (segUpgrades === null || segUpgrades === undefined) {
    return true; // Для убер здания и других объектов без апгрейдов всегда разрешаем прогресс
  }
  // If level is at boundary where next segment starts, require previous segment upgrade
  const seg = segmentIndex(entityLevel);
  const within = withinSegment(entityLevel);
  if (within === 0 && seg > 0) {
    // entering a new segment (levels 10k -> 10k+1), ensure previous segment upgrade exists
    // Проверяем, что segUpgrades существует и содержит нужный элемент
    return segUpgrades && !!segUpgrades[seg-1];
  }
  // If within segment, free to progress (unless we cross boundary)
  return true;
}

function totalOpenedBuildingLevels() {
  if (!save || !save.buildings) return 0;
  return save.buildings.reduce((acc,b)=> acc + (b.level > 0 ? b.level : 0), 0);
}


function allBuildingsAtLeastLevel10() {
  if (!save || !save.buildings || save.buildings.length !== 50) return false;
  return save.buildings.every(b => b.level >= 10);
}

function spendPoints(amount) {
  if (save.points < amount) return false;
  save.points -= amount;
  return true;
}

function spendTreasury(amount) {
  if (!save.treasury) return false;
  if (save.treasury.value < amount) return false;
  save.treasury.value -= amount;
  return true;
}

function gainTreasury(delta) {
  if (!save.treasury) return;
  const baseMax = save.treasury.max || 1000;
  save.treasury.value = clamp(save.treasury.value + delta, 0, baseMax);
}

// Вычисляет максимальное количество уровней, которое можно добавить до следующего апгрейда
// Король добавляет все возможные уровни до уровня кратного 10 (включительно), где нужен апгрейд, в пределах награды
// Король останавливается НА уровне кратного 10 (10, 20, 30...), если нужен апгрейд
function maxLevelsBeforeUpgrade(currentLevel, levelsToAdd, segUpgrades, maxLevel) {
  // Проверяем текущий уровень - если он уже на границе и нужен апгрейд, не можем добавить ничего
  const currentSeg = segmentIndex(currentLevel);
  const currentWithin = withinSegment(currentLevel);
  const currentPrevSegBought = currentSeg === 0 ? true : !!segUpgrades[currentSeg-1];
  const currentNeedUpgrade = currentWithin === 0 && currentSeg > 0 && !currentPrevSegBought;
  
  if (currentNeedUpgrade) {
    return 0; // Уже на границе, нужен апгрейд
  }
  
  // Идем по уровням один за другим, проверяя каждый следующий уровень
  // Можем дойти ДО уровня кратного 10 (включительно), если нужен апгрейд, но не дальше
  let added = 0;
  let current = currentLevel;
  
  for (let i = 0; i < levelsToAdd && current < maxLevel; i++) {
    const nextLevel = current + 1;
    const seg = segmentIndex(nextLevel);
    const within = withinSegment(nextLevel);
    const prevSegBought = seg === 0 ? true : !!segUpgrades[seg-1];
    const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
    
    // Если нужен апгрейд на следующем уровне, можем добавить этот уровень (чтобы остановиться на нем)
    // но не можем идти дальше после него
    if (needUpgrade) {
      added++; // Добавляем уровень кратный 10, чтобы остановиться на нем
      break; // Останавливаемся после добавления уровня кратного 10
    }
    
    added++;
    current = nextLevel;
  }
  
  return added;
}

// ======= Rendering =======
// Кэш для отформатированных значений (избегаем повторного форматирования)
let _cachedPointsText = null;
let _cachedPPSText = null;
let _cachedPPCText = null;
let _cachedPoints = null;
let _cachedPPSValue = null;
let _cachedPPCValue = null;
let _lastTreasuryPctForColor = null;

function renderTopStats() {
  if (!save) return;
  
  // Оптимизация: обновляем только если значение изменилось
  if (pointsEl) {
    if (_cachedPoints !== save.points) {
      const newText = fmt(save.points);
      if (_cachedPointsText !== newText) {
        pointsEl.textContent = newText;
        _cachedPointsText = newText;
      }
      _cachedPoints = save.points;
    }
  }
  
  if (ppsEl) {
    const pps = totalPPS();
    if (_cachedPPSValue !== pps) {
      const newText = fmt(pps);
      if (_cachedPPSText !== newText) {
        ppsEl.textContent = newText;
        _cachedPPSText = newText;
      }
      _cachedPPSValue = pps;
    }
  }
  
  if (ppcEl) {
    const ppc = totalPPC();
    if (_cachedPPCValue !== ppc) {
      const newText = fmt(ppc);
      if (_cachedPPCText !== newText) {
        ppcEl.textContent = newText;
        _cachedPPCText = newText;
      }
      _cachedPPCValue = ppc;
    }
  }

  // Treasury UI
  if (save.treasury && treasuryValueEl && treasuryFillEl && treasuryRegenEl) {
    const { value } = save.treasury;
    const baseMax = save.treasury.max || 1000;
    const baseRegen = save.treasury.regenPerSec || 1;
    
    // Оптимизация: обновляем только если значение изменилось
    const newTreasuryText = `${fmt(value)} / ${fmt(baseMax)}`;
    if (treasuryValueEl.textContent !== newTreasuryText) {
      treasuryValueEl.textContent = newTreasuryText;
    }
    
    // XP Bar
    if (typeof renderXPBar === 'function') {
      renderXPBar();
    }
    
    const newRegenText = `+${baseRegen.toFixed(0)} /s`;
    if (treasuryRegenEl.textContent !== newRegenText) {
      treasuryRegenEl.textContent = newRegenText;
    }
    
    const pct = Math.max(0, Math.min(100, (value / baseMax) * 100));
    const newWidth = `${pct}%`;
    if (treasuryFillEl.style.width !== newWidth) {
      treasuryFillEl.style.width = newWidth;
    }
    
    // Изменяем цвет текста в зависимости от того, находится ли за ним заполненная часть шкалы
    // Оптимизация: обновляем цвета только если процент изменился значительно (более 2%)
    const lastPct = _lastTreasuryPctForColor || 0;
    const pctChanged = Math.abs(pct - lastPct) > 2;
    
    if (pctChanged) {
      _lastTreasuryPctForColor = pct;
      const overlayEl = treasuryValueEl.closest('.treasury-overlay');
      const progressEl = treasuryFillEl.closest('.treasury-progress');
      if (overlayEl && progressEl) {
        // Кэшируем getBoundingClientRect - вызываем только раз в кадре
        const progressRect = progressEl.getBoundingClientRect();
        const progressWidth = progressRect.width;
        const fillWidth = (progressWidth * pct) / 100;
        
        const labelEl = overlayEl.querySelector('.treasury-label');
        const amountEl = overlayEl.querySelector('.treasury-amount');
        const regenEl = overlayEl.querySelector('.treasury-regen');
        
        // Проверяем каждый элемент (оптимизация: кэшируем вычисления)
        if (labelEl) {
          const labelRect = labelEl.getBoundingClientRect();
          const labelCenterX = labelRect.left + labelRect.width / 2 - progressRect.left;
          const newColor = labelCenterX < fillWidth ? '#1a0a00' : 'var(--poe-orange)';
          if (labelEl.style.color !== newColor) {
            labelEl.style.color = newColor;
          }
        }
        if (amountEl) {
          const amountRect = amountEl.getBoundingClientRect();
          const amountCenterX = amountRect.left + amountRect.width / 2 - progressRect.left;
          const newColor = amountCenterX < fillWidth ? '#1a0a00' : 'var(--poe-orange)';
          if (amountEl.style.color !== newColor) {
            amountEl.style.color = newColor;
          }
        }
        if (regenEl) {
          const regenRect = regenEl.getBoundingClientRect();
          const regenCenterX = regenRect.left + regenRect.width / 2 - progressRect.left;
          const newColor = regenCenterX < fillWidth ? '#1a0a00' : 'var(--poe-orange)';
          if (regenEl.style.color !== newColor) {
            regenEl.style.color = newColor;
          }
        }
      }
    }
  }
}

// Talent functions removed

// ======= Treasury actions =======
let _lazyClickInterval = null;

function reduceAllRepairs(percent) {
  const baseMs = 164000 * percent;
  save.buildings.forEach(b => {
    if (b.blockedUntil > now()) {
      b.blockedUntil = Math.max(now(), b.blockedUntil - baseMs);
    }
  });
  // Обновляем визуальное отображение зданий
  // Сбрасываем кэш состояния зданий для принудительного обновления
  _lastBuildingsState = null;
  _lastSortMode = -1;
  // Инвалидируем кэш PPS/PPC при изменении уровней зданий
  _cachedPPS = null;
  _cachedPPC = null;
  renderBuildings();
  // Немедленно обновляем таймеры
  _updateBuildingCountdowns();
}

function breakRandomBuildings(count, durationMs) {
  const opened = save.buildings.map((b, i) => ({b,i})).filter(x => x.b.level > 0);
  if (opened.length === 0) return;
  const tNow = now();
  const repairTimeMult = save.modifiers.repairTimeMult || 1;
  // Fast Repair debuff: +50% времени ремонта сломанным зданиям
  const fastRepairDebuffMult = save.modifiers.fastRepairDebuffRepairMult || 1.0;
  for (let k=0;k<count;k++){
    const pickIdx = Math.floor(Math.random()*opened.length);
    const {b} = opened[pickIdx];
    const newDurationMs = durationMs * repairTimeMult * fastRepairDebuffMult;
    // Если здание уже сломано, прибавляем время к оставшемуся
    if (b.blockedUntil > tNow) {
      b.blockedUntil = b.blockedUntil + newDurationMs;
    } else {
      b.blockedUntil = tNow + newDurationMs;
    }
  }
}

function startLazyClick(level = 1) {
  if (save.modifiers.lazyClickUntil > now()) {
    toast('Lazy click already active.', 'warn');
    return;
  }
  
  const lazyClickLevels = [
    { lvl: 1, clicks: 200, durationMs: 20000, multiplier: 1.5, cost: 300, clickReq: 589, breakDuration: 0 },
    { lvl: 2, clicks: 400, durationMs: 25000, multiplier: 2.0, cost: 0, clickReq: 1488, breakDuration: 164000 },
    { lvl: 3, clicks: 1000, durationMs: 30000, multiplier: 5.0, cost: 0, clickReq: 3564, breakDuration: 389000 },
    { lvl: 4, clicks: 2000, durationMs: 50000, multiplier: 10.0, cost: 0, clickReq: 9999, breakDuration: 606000 }
  ];
  
  const levelData = lazyClickLevels.find(l => l.lvl === level) || lazyClickLevels[0];
  const durationMs = levelData.durationMs;
  const totalClicks = levelData.clicks;
  const multiplier = levelData.multiplier;
  const intervalMs = durationMs / totalClicks;
  let done = 0;
  save.modifiers.lazyClickUntil = now() + durationMs;
  save.modifiers.lazyClickCount = 0;
  // Lazy Click debuff: пассивный доход -10-20% во время эффекта (зависит от уровня)
  const lazyClickDebuffPercent = level === 1 ? 10 : level === 2 ? 15 : 20;
  save.modifiers.lazyClickDebuffPPSMult = 1.0 - (lazyClickDebuffPercent / 100);
  if (_lazyClickInterval) clearInterval(_lazyClickInterval);
  _lazyClickInterval = setInterval(() => {
    if (done >= totalClicks || now() >= save.modifiers.lazyClickUntil) {
      clearInterval(_lazyClickInterval);
      _lazyClickInterval = null;
      return;
    }
    const ppc = totalPPC() * multiplier;
    addPoints(ppc);
    done += 1;
    save.modifiers.lazyClickCount = done;
  }, intervalMs);
}

function applyEngineer(durationMs) {
  save.treasury.actions.engineerUntil = now() + durationMs;
  // Обновляем визуальное отображение зданий, чтобы показать изменения
  renderBuildings();
  // Немедленно обновляем таймеры
  _updateBuildingCountdowns();
}

function applyClickMadness(durationMs) {
  save.treasury.actions.clickMadnessUntil = now() + durationMs;
  // Disable golden/broken transitions handled in click handler
  // Инвалидируем кэш при активации (влияет на PPC)
  _cachedPPC = null;
}

function applyProfitWithoutTax(durationMs) {
  save.treasury.actions.profitWithoutTaxUntil = now() + durationMs;
  // Обновляем отслеживание сразу при активации
  _lastProfitWithoutTaxUntil = save.treasury.actions.profitWithoutTaxUntil;
  _wasProfitWithoutTaxActive = true; // Баф только что активирован
  // Инвалидируем кэш при активации (влияет на PPS)
  _cachedPPS = null;
}

function renderTreasuryActions() {
  if (!treasuryActionsEl || !save || !save.treasury) return;
  const act = save.treasury.actions;
  const totalLvls = totalOpenedBuildingLevels();
  const totalClicks = save.achievements?.stats?.totalClicks || 0;

  const buttons = [];

  const nowTs = now();
  const mkBtn = (id, label, desc, enabled, onClick, cooldownUntil, canUpgrade = false, buffUntil = 0, upgradeOnClick = null) => {
    buttons.push({ id, label, desc, enabled, onClick, cooldownUntil, canUpgrade, buffUntil, upgradeOnClick });
  };

  // Casino - доступна с самого начала, должна быть первой
  {
    const cdUntil = act.casinoCd || 0;
    const ready = nowTs >= cdUntil;
    const desc = {
      header: 'CASINO LOSEWIN-LINE',
      effect: 'Bet 10%, 20%, 30%, 40%, 50%, or 100% of current points.',
      details: 'Choose a dice face (1-6). Equal chance for all faces.',
      win: 'Win: stake x3 is returned.',
      lose: 'Lose: stake x1.2 is lost (can result in negative points if 100% is bet).',
      cost: 5,
      cooldown: 3
    };
    mkBtn('casino','Casino LoseWin-line', desc, ready && save.treasury.value >= 5, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (save.treasury.value < 5) { toast('Not enough treasury.', 'warn'); return; }
      openCasinoModal();
    }, cdUntil);
  }

  // Repair button - одна кнопка с 4 уровнями апгрейда
  const repairLevels = [
    { lvl: 1, percent: 0.09, cost: 100, cdSec: 39, lvlReq: 3987, upgradeCost: 0 },
    { lvl: 2, percent: 0.27, cost: 300, cdSec: 39, lvlReq: 10063, upgradeCost: 10000000 },
    { lvl: 3, percent: 0.46, cost: 450, cdSec: 39, lvlReq: 16827, upgradeCost: 1000000707 },
    { lvl: 4, percent: 0.63, cost: 650, cdSec: 39, lvlReq: 28212, upgradeCost: 10000005055 }
  ];
  
  let currentRepairLevel = 0;
  let nextRepairLevelToUpgrade = 0;
  let repairUpgradeOnClick = null;
  
  for (let i = 0; i < repairLevels.length; i++) {
    const r = repairLevels[i];
    if (totalLvls >= r.lvlReq) {
      const upgradeFlag = i === 0 ? null : `repair${r.lvl}Upgraded`;
      const upgraded = !upgradeFlag || !!act[upgradeFlag];
      if (upgraded) {
        currentRepairLevel = r.lvl;
      } else {
        // Можно апгрейдить
        nextRepairLevelToUpgrade = r.lvl;
        const upgradeCost = Math.max(save.points, r.upgradeCost);
        repairUpgradeOnClick = () => {
          if (!spendPoints(upgradeCost)) { toast('Not enough points.', 'warn'); return; }
          act[upgradeFlag] = true;
          toast(`Repair upgraded to Level ${r.lvl}!`, 'good');
          renderTreasuryActions();
        };
        break;
      }
    } else {
      break;
    }
  }
  
  if (nextRepairLevelToUpgrade > 0) {
    // Показываем кнопку с текущим уровнем, но с возможностью апгрейда через плюсик
    const currentR = repairLevels[nextRepairLevelToUpgrade - 2]; // Текущий уровень (на 1 меньше следующего)
    const nextR = repairLevels[nextRepairLevelToUpgrade - 1]; // Следующий уровень для апгрейда
    const upgradeCost = Math.max(save.points, nextR.upgradeCost);
    const canUpgrade = save.points >= upgradeCost;
    const cdUntil = act.repairCd || 0;
    const ready = nowTs >= cdUntil;
    const canUse = ready && save.treasury.value >= currentR.cost;
    const desc = {
      header: `REPAIR LEVEL ${nextRepairLevelToUpgrade - 1}`,
      effect: `Accelerate all building repairs by ${Math.round(currentR.percent*100)}% of original time.`,
      details: `This is your current repair level. Use it to speed up building repairs.`,
      duringWarning: `Building costs +25% for ${currentR.cdSec} seconds.`,
      afterWarning: `Passive income -15% for 45 seconds.`,
      cost: currentR.cost,
      cooldown: currentR.cdSec,
      upgradeCost: upgradeCost
    };
    mkBtn('repair', 'Repair', desc, canUse, () => {
      // Клик на кнопку использует текущий уровень
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(currentR.cost)) { toast('Not enough treasury.', 'warn'); return; }
      reduceAllRepairs(currentR.percent);
      act.repairCd = now() + currentR.cdSec*1000;
      // Repair debuff: стоимость зданий +25% во время эффекта
      save.modifiers.repairDebuffCostMult = 1.25;
      toast(`Repair Level ${nextRepairLevelToUpgrade - 1} applied!`, 'good');
      renderTreasuryActions();
    }, cdUntil, true, cdUntil, repairUpgradeOnClick);
  } else if (currentRepairLevel > 0) {
    const r = repairLevels[currentRepairLevel - 1];
    const cdUntil = act.repairCd || 0;
    const ready = nowTs >= cdUntil;
    const canUse = ready && save.treasury.value >= r.cost;
    const desc = {
      header: `REPAIR LEVEL ${currentRepairLevel}`,
      effect: `Accelerate all building repairs by ${Math.round(r.percent*100)}% of original time.`,
      details: `This is your current repair level. Use it to speed up building repairs.`,
      duringWarning: `Building costs +25% for ${r.cdSec} seconds.`,
      afterWarning: `Passive income -15% for 45 seconds.`,
      cost: r.cost,
      cooldown: r.cdSec
    };
    mkBtn('repair', 'Repair', desc, canUse, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(r.cost)) { toast('Not enough treasury.', 'warn'); return; }
      reduceAllRepairs(r.percent);
      act.repairCd = now() + r.cdSec*1000;
      // Repair debuff: стоимость зданий +25% во время эффекта
      save.modifiers.repairDebuffCostMult = 1.25;
      toast(`Repair Level ${currentRepairLevel} applied!`, 'good');
      renderTreasuryActions();
    }, cdUntil, false, cdUntil);
  }

  // Lazy click - одна кнопка с 4 уровнями апгрейда
  const lazyClickLevels = [
    { lvl: 1, clicks: 2000, durationMs: 20000, multiplier: 1.5, cost: 300, clickReq: 589, breakDuration: 0 },
    { lvl: 2, clicks: 4000, durationMs: 25000, multiplier: 2.0, cost: 0, clickReq: 1488, breakDuration: 164000 },
    { lvl: 3, clicks: 10000, durationMs: 30000, multiplier: 5.0, cost: 0, clickReq: 3564, breakDuration: 389000 },
    { lvl: 4, clicks: 20000, durationMs: 50000, multiplier: 10.0, cost: 0, clickReq: 9999, breakDuration: 606000 }
  ];
  
  // Кнопка показывается только если есть минимум 589 кликов
  if (totalClicks < 589) {
    // Не показываем кнопку, если кликов недостаточно
  } else {
    let currentLazyClickLevel = act.lazyClickLevel || 1;
    let nextLazyClickLevelToUpgrade = 0;
    let lazyClickUpgradeOnClick = null;
    
    // Определяем текущий уровень и следующий для апгрейда
    // Первый уровень всегда доступен при 589+ кликах
    if (totalClicks >= 589) {
      currentLazyClickLevel = Math.max(currentLazyClickLevel, 1);
    }
    
    // Проверяем возможность апгрейда
    if (act.lazyClickLevel === 1 && totalClicks >= 1488) {
      nextLazyClickLevelToUpgrade = 2;
    } else if (act.lazyClickLevel === 2 && totalClicks >= 3564) {
      nextLazyClickLevelToUpgrade = 3;
    } else if (act.lazyClickLevel === 3 && totalClicks >= 9999) {
      nextLazyClickLevelToUpgrade = 4;
    }
    
    // Если можно апгрейдить
    if (nextLazyClickLevelToUpgrade > 0) {
      const currentLevelData = lazyClickLevels[currentLazyClickLevel - 1];
      const nextLevelData = lazyClickLevels[nextLazyClickLevelToUpgrade - 1];
      const canUpgrade = totalClicks >= nextLevelData.clickReq;
      const lazyClickUntil = save.modifiers?.lazyClickUntil || 0;
      const active = lazyClickUntil > nowTs;
      const cdUntil = act.lazyClickCd || 0;
      const ready = nowTs >= cdUntil;
      const canUse = ready && save.treasury.value >= currentLevelData.cost && !active;
      const breakDurationText = currentLevelData.breakDuration > 0 ? ` for ${currentLevelData.breakDuration/1000}s` : '';
      const desc = {
        header: `LAZY CLICK LEVEL ${currentLazyClickLevel}`,
        effect: `Performs ${currentLevelData.clicks} passive clicks with x${currentLevelData.multiplier} multiplier over ${currentLevelData.durationMs/1000} seconds.`,
        details: `This is your current lazy click level.`,
        duringWarning: `Passive income -${currentLazyClickLevel === 1 ? 10 : currentLazyClickLevel === 2 ? 15 : 20}%.`,
        afterWarning: `Click income -25% for 60 seconds.`,
        cost: currentLevelData.cost,
        cooldown: 54,
        upgradeCost: nextLevelData.breakDuration
      };
      lazyClickUpgradeOnClick = () => {
        if (totalClicks < nextLevelData.clickReq) {
          toast(`Need ${nextLevelData.clickReq} total clicks to unlock.`, 'warn');
          return;
        }
        // Кнопка больше не может сломаться
        act.lazyClickLevel = nextLazyClickLevelToUpgrade;
        toast(`Lazy Click upgraded to Level ${nextLazyClickLevelToUpgrade}!`, 'good');
        renderClick();
        renderTreasuryActions();
      };
      mkBtn('lazyClick', 'Lazy click', desc, canUse, () => {
        // Клик на кнопку использует текущий уровень
        if (!ready) { toast('On cooldown.', 'warn'); return; }
        if (!spendTreasury(currentLevelData.cost)) { toast('Not enough treasury.', 'warn'); return; }
        startLazyClick(currentLazyClickLevel);
        act.lazyClickCd = now() + 54000;
        toast(`Lazy Click Level ${currentLazyClickLevel} activated!`, 'good');
        renderTreasuryActions();
      }, cdUntil, true, lazyClickUntil, lazyClickUpgradeOnClick);
  } else if (currentLazyClickLevel > 0) {
    const l = lazyClickLevels[currentLazyClickLevel - 1];
    const lazyClickUntil = save.modifiers?.lazyClickUntil || 0;
    const active = lazyClickUntil > nowTs;
    const cdUntil = act.lazyClickCd || 0;
    const ready = nowTs >= cdUntil;
    const canUse = ready && save.treasury.value >= l.cost && !active;
    const breakDurationText = l.breakDuration > 0 ? ` for ${l.breakDuration/1000}s` : '';
    const desc = {
      header: `LAZY CLICK LEVEL ${currentLazyClickLevel}`,
      effect: `Performs ${l.clicks} passive clicks with x${l.multiplier} multiplier over ${l.durationMs/1000} seconds.`,
      note: `These clicks do not count towards your total clicks.`,
      duringWarning: `Passive income -${currentLazyClickLevel === 1 ? 10 : currentLazyClickLevel === 2 ? 15 : 20}%.`,
      afterWarning: `Click income -25% for 60 seconds.`,
      cost: l.cost,
      cooldown: 54,
      duration: l.durationMs / 1000
    };
    mkBtn('lazyClick', 'Lazy click', desc, canUse, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(l.cost)) { toast('Not enough treasury.', 'warn'); return; }
      startLazyClick(currentLazyClickLevel);
      act.lazyClickCd = now() + 54000;
      toast(`Lazy Click Level ${currentLazyClickLevel} activated!`, 'good');
      renderTreasuryActions();
    }, cdUntil, false, lazyClickUntil);
    }
  }

  // Profit without taxes
  if (allBuildingsAtLeastLevel10()) {
    const cdUntil = act.taxFreeCd || 0;
    const ready = nowTs >= cdUntil;
    const profitUntil = act.profitWithoutTaxUntil || 0;
    const active = profitUntil > nowTs;
    const desc = {
      header: 'PROFIT WITHOUT TAXES',
      effect: 'All building income x11 for 32 seconds.',
      afterWarning: 'Passive income -30% for 60 seconds. Five random buildings break for 936 seconds.',
      cost: 200,
      cooldown: 32,
      duration: 32
    };
    mkBtn('taxfree','Profit without taxes', desc, ready && save.treasury.value >= 200, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(200)) { toast('Not enough treasury.', 'warn'); return; }
      applyProfitWithoutTax(32000);
      // Здания будут сломаны по окончании бафа, а не сразу
      act.taxFreeCd = now() + 32000;
      act.profitWithoutTaxUntil = now() + 32000;
      // Обновляем отслеживание сразу при активации (на случай если applyProfitWithoutTax не обновил)
      _lastProfitWithoutTaxUntil = act.profitWithoutTaxUntil;
      _wasProfitWithoutTaxActive = true; // Баф только что активирован
      toast('Profit without taxes activated.', 'good');
      renderTreasuryActions();
    }, cdUntil, false, profitUntil);
  }

  // Engineer
  if (totalLvls >= 36233) {
    const cdUntil = act.engineerCd || 0;
    const ready = nowTs >= cdUntil;
    const engineerUntil = act.engineerUntil || 0;
    const active = engineerUntil > nowTs;
    const desc = {
      header: 'CHIEF ENGINEER',
      effect: 'Buildings break 66% less often.',
      duringWarning: 'Repair time x2.',
      afterWarning: 'Passive income -25% for 90 seconds.',
      cost: 1000,
      duration: 216
    };
    mkBtn('engineer','Chief Engineer', desc, ready && save.treasury.value >= 1000, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
      applyEngineer(216*1000);
      act.engineerCd = now() + 216*1000;
      act.engineerUntil = now() + 216*1000;
      toast('Chief Engineer activated.', 'good');
      renderTreasuryActions();
    }, cdUntil, false, engineerUntil);
  }

  // Click Madness
  if (totalClicks >= 123) {
    const cdUntil = act.clickMadnessCd || 0;
    const ready = nowTs >= cdUntil;
    const clickMadnessUntil = act.clickMadnessUntil || 0;
    const active = clickMadnessUntil > nowTs;
    const desc = {
      header: 'CLICK MADNESS!',
      effect: 'Click income x99.9999.',
      duringWarning: 'There is a chance to lose 3 Click levels per click.',
      afterWarning: 'Click income -50% for 120 seconds. 3-5 random buildings break for 180 seconds.',
      cost: 350,
      cooldown: 36,
      duration: 36
    };
    mkBtn('clickMadness','Click Madness!', desc, ready && save.treasury.value >= 350 && !active, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(350)) { toast('Not enough treasury.', 'warn'); return; }
      applyClickMadness(36000);
      act.clickMadnessCd = now() + 36000;
      act.clickMadnessUntil = now() + 36000;
      _cachedPPC = null;
      toast('Click Madness activated!', 'good');
      renderTreasuryActions();
    }, cdUntil, false, clickMadnessUntil);
  }

  // Иконки для кнопок (пути к изображениям)
  const icons = {
    'repair': 'icons/repair.png',
    'lazyClick': 'icons/lazy_click.png',
    'taxfree': 'icons/profit.png',
    'engineer': 'icons/engineer.png',
    'clickMadness': 'icons/click_madnes.png',
    'casino': 'icons/kazino.png'
  };

  // Удаляем старые tooltip перед созданием новых
  hideTreasuryTooltip();
  
  treasuryActionsEl.innerHTML = '';
  // Кнопки уже в правильном порядке (казино первая, так как создается первой)
  buttons.forEach(btn => {
    const el = document.createElement('button');
    el.className = 'btn treasury-action-btn';
    const iconPath = icons[btn.id];
    el.setAttribute('data-btn-id', btn.id); // Сохраняем ID для обновления
    el.disabled = !btn.enabled;
    
    // Добавляем иконку как изображение
    if (iconPath) {
      const iconImg = document.createElement('img');
      iconImg.src = iconPath;
      iconImg.style.width = '60px';
      iconImg.style.height = '60px';
      iconImg.style.objectFit = 'contain'; // Масштабируем с сохранением пропорций, но с четким рендерингом
      iconImg.style.objectPosition = 'center'; // Центрируем изображение
      iconImg.style.pointerEvents = 'none';
      iconImg.style.userSelect = 'none';
      iconImg.setAttribute('draggable', 'false');
      // Используем правильные свойства для четкого рендеринга без размытия (в правильном порядке)
      // Применяем свойства для четкого рендеринга пиксельной графики
      // Важно: применяем в правильном порядке для максимальной совместимости
      iconImg.style.imageRendering = 'crisp-edges';
      iconImg.style.imageRendering = 'pixelated';
      iconImg.style.imageRendering = '-moz-crisp-edges';
      iconImg.style.imageRendering = '-webkit-optimize-contrast';
      iconImg.style.msInterpolationMode = 'nearest-neighbor';
      // Дополнительные свойства для четкости и производительности
      iconImg.style.backfaceVisibility = 'hidden';
      iconImg.style.transform = 'translateZ(0)';
      iconImg.style.willChange = 'transform, opacity';
      // Принудительно отключаем сглаживание
      iconImg.style.webkitFontSmoothing = 'none';
      iconImg.style.mozOsxFontSmoothing = 'unset';
      // Отключаем фильтры, которые могут размывать изображение
      iconImg.style.filter = 'none';
      iconImg.style.webkitFilter = 'none';
      el.appendChild(iconImg);
    } else {
      // Fallback на эмодзи если иконки нет
      el.setAttribute('data-icon', '?');
    }
    
    // Tooltip в стиле PoE
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.setAttribute('data-treasury-tooltip', 'true');
    
    const header = document.createElement('div');
    header.className = 'tooltip-header';
    header.textContent = typeof btn.desc === 'string' ? btn.desc.split('\n')[0] : (btn.desc.header || btn.label);
    tooltip.appendChild(header);
    
    const body = document.createElement('div');
    body.className = 'tooltip-body';
    
    if (typeof btn.desc === 'object') {
      if (btn.desc.effect) {
        const effectLine = document.createElement('div');
        effectLine.className = 'tooltip-line';
        effectLine.innerHTML = `<div style="color:#d4b24a;font-weight:bold;margin-bottom:4px;">${btn.desc.effect}</div>`;
        body.appendChild(effectLine);
      }
      
      if (btn.desc.details) {
        const detailsLine = document.createElement('div');
        detailsLine.className = 'tooltip-stat';
        detailsLine.innerHTML = `<span class="tooltip-stat-label">${btn.desc.details}</span>`;
        body.appendChild(detailsLine);
      }
      
      if (btn.desc.note) {
        const noteLine = document.createElement('div');
        noteLine.style.color = '#a08f70';
        noteLine.style.fontStyle = 'italic';
        noteLine.style.marginTop = '4px';
        noteLine.textContent = btn.desc.note;
        body.appendChild(noteLine);
      }
      
      if (btn.desc.duringWarning) {
        const duringWarningLine = document.createElement('div');
        duringWarningLine.style.color = '#ff6b6b';
        duringWarningLine.style.marginTop = '6px';
        duringWarningLine.textContent = `During effect: ${btn.desc.duringWarning}`;
        body.appendChild(duringWarningLine);
      }
      
      if (btn.desc.afterWarning) {
        const afterWarningLine = document.createElement('div');
        afterWarningLine.style.color = '#ff6b6b';
        afterWarningLine.style.marginTop = btn.desc.duringWarning ? '4px' : '6px';
        afterWarningLine.textContent = `After effect: ${btn.desc.afterWarning}`;
        body.appendChild(afterWarningLine);
      }
      
      // Старый формат warning для обратной совместимости
      if (btn.desc.warning && !btn.desc.duringWarning && !btn.desc.afterWarning) {
        const warningLine = document.createElement('div');
        warningLine.style.color = '#ff6b6b';
        warningLine.style.marginTop = '6px';
        warningLine.textContent = btn.desc.warning;
        body.appendChild(warningLine);
      }
      
      if (btn.desc.win) {
        const winLine = document.createElement('div');
        winLine.style.color = '#4ade80';
        winLine.style.marginTop = '4px';
        winLine.textContent = `✓ ${btn.desc.win}`;
        body.appendChild(winLine);
      }
      
      if (btn.desc.lose) {
        const loseLine = document.createElement('div');
        loseLine.style.color = '#ff6b6b';
        loseLine.style.marginTop = '4px';
        loseLine.textContent = `✗ ${btn.desc.lose}`;
        body.appendChild(loseLine);
      }
      
      // Разделитель перед стоимостью
      const separator = document.createElement('div');
      separator.className = 'tooltip-line';
      body.appendChild(separator);
      
      if (btn.desc.cost) {
        const costLine = document.createElement('div');
        costLine.className = 'tooltip-stat';
        costLine.innerHTML = `<span class="tooltip-stat-label">Cost:</span> <span class="tooltip-stat-value tooltip-cost">${btn.desc.cost} Treasury</span>`;
        body.appendChild(costLine);
      }
      
      // Убираем upgradeCost из основного tooltip - он будет в tooltip плюсика
      
      if (btn.desc.cooldown) {
        const cdLine = document.createElement('div');
        cdLine.className = 'tooltip-stat';
        const cdRemaining = btn.cooldownUntil && btn.cooldownUntil > nowTs ? ` (${Math.ceil((btn.cooldownUntil - nowTs)/1000)}s)` : '';
        cdLine.innerHTML = `<span class="tooltip-stat-label">Cooldown:</span> <span class="tooltip-stat-value tooltip-cooldown">${btn.desc.cooldown}s${cdRemaining}</span>`;
        body.appendChild(cdLine);
      }
      
      if (btn.desc.duration) {
        const durLine = document.createElement('div');
        durLine.className = 'tooltip-stat';
        const durRemaining = btn.buffUntil && btn.buffUntil > nowTs ? ` (${Math.ceil((btn.buffUntil - nowTs)/1000)}s)` : '';
        durLine.innerHTML = `<span class="tooltip-stat-label">Duration:</span> <span class="tooltip-stat-value">${btn.desc.duration}s${durRemaining}</span>`;
        body.appendChild(durLine);
      }
    } else {
      // Старый формат строки
      const lines = btn.desc.split('\n').filter(l => l.trim());
      lines.slice(1).forEach(line => {
        const lineEl = document.createElement('div');
        lineEl.textContent = line;
        body.appendChild(lineEl);
      });
    }
    
    tooltip.appendChild(body);
    
    // Tooltip логика - используем ту же логику, что и для талантов
    let tooltipWidth = null;
    let tooltipHeight = null;
    
    const showTreasuryTooltip = (ev) => {
      hideTreasuryTooltip();
      _treasuryTooltipEl = tooltip;
      document.body.appendChild(tooltip);
      
      // Устанавливаем размер один раз на основе реального содержимого
      if (tooltipWidth === null || tooltipHeight === null) {
        tooltip.style.position = 'fixed';
        tooltip.style.display = 'block';
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
        tooltip.style.top = '-9999px';
        tooltip.style.left = '-9999px';
        
        // Получаем реальные размеры
        tooltipWidth = tooltip.offsetWidth || 300;
        tooltipHeight = tooltip.offsetHeight || 200;
        
        // Сохраняем размеры для этого tooltip
        tooltip._width = tooltipWidth;
        tooltip._height = tooltipHeight;
      } else {
        // Используем сохраненные размеры
        tooltipWidth = tooltip._width || tooltipWidth;
        tooltipHeight = tooltip._height || tooltipHeight;
      }
      
      moveTreasuryTooltip(ev);
    };
    
    const moveTreasuryTooltip = (ev) => {
      if (!_treasuryTooltipEl) return;
      const pad = 12;
      const w = tooltipWidth || 300;
      const h = tooltipHeight || 200;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Позиция относительно курсора
      let left = ev.clientX + 16;
      let top = ev.clientY + 16;
      
      // Проверяем правую границу
      if (left + w + pad > vw) {
        left = vw - w - pad;
        if (left < pad) left = pad;
      }
      
      // Проверяем нижнюю границу
      if (top + h + pad > vh) {
        top = vh - h - pad;
        if (top < pad) top = pad;
      }
      
      // Проверяем левую границу
      if (left < pad) left = pad;
      
      // Проверяем верхнюю границу
      if (top < pad) top = pad;
      
      _treasuryTooltipEl.style.position = 'fixed';
      _treasuryTooltipEl.style.width = w + 'px';
      _treasuryTooltipEl.style.height = h + 'px';
      _treasuryTooltipEl.style.left = `${left}px`;
      _treasuryTooltipEl.style.top = `${top}px`;
      _treasuryTooltipEl.style.zIndex = '2147483647';
      _treasuryTooltipEl.style.display = 'block';
      _treasuryTooltipEl.style.visibility = 'visible';
      _treasuryTooltipEl.style.opacity = '1';
    };
    
    el.addEventListener('mouseenter', (e) => {
      showTreasuryTooltip(e);
    });
    
    el.addEventListener('mousemove', (e) => {
      if (_treasuryTooltipEl === tooltip) {
        moveTreasuryTooltip(e);
      }
    });
    
    el.addEventListener('mouseleave', () => {
      if (_treasuryTooltipEl === tooltip) {
        hideTreasuryTooltip();
      }
    });
    
    // Cooldown overlay
    if (btn.cooldownUntil && btn.cooldownUntil > nowTs) {
      const remaining = Math.ceil((btn.cooldownUntil - nowTs)/1000);
      el.setAttribute('data-cooldown', remaining);
      el.disabled = true;
    }
    
    // Upgrade badge (кликабельный) с tooltip
    if (btn.canUpgrade && btn.upgradeOnClick) {
      el.setAttribute('data-can-upgrade', 'true');
      const upgradeBadge = document.createElement('div');
      upgradeBadge.className = 'upgrade-badge';
      upgradeBadge.textContent = '+';
      
      // Tooltip для плюсика
      const upgradeTooltip = document.createElement('div');
      upgradeTooltip.className = 'tooltip upgrade-tooltip';
      upgradeTooltip.setAttribute('data-treasury-tooltip', 'true');
      
      const upgradeHeader = document.createElement('div');
      upgradeHeader.className = 'tooltip-header';
      upgradeHeader.textContent = 'UPGRADE AVAILABLE';
      upgradeTooltip.appendChild(upgradeHeader);
      
      const upgradeBody = document.createElement('div');
      upgradeBody.className = 'tooltip-body';
      
      if (typeof btn.desc === 'object' && btn.desc.upgradeCost) {
        const upgradeLine = document.createElement('div');
        upgradeLine.className = 'tooltip-line';
        let levelTextFromHeader = '';
        let nextLevelNum = '';
        
        // Определяем следующий уровень
        if (btn.desc.header) {
          if (btn.desc.header.includes('REPAIR LEVEL')) {
            levelTextFromHeader = btn.desc.header.replace('REPAIR LEVEL ', '');
            nextLevelNum = levelTextFromHeader ? parseInt(levelTextFromHeader) + 1 : '';
          } else if (btn.desc.header.includes('LAZY CLICK LEVEL')) {
            levelTextFromHeader = btn.desc.header.replace('LAZY CLICK LEVEL ', '');
            nextLevelNum = levelTextFromHeader ? parseInt(levelTextFromHeader) + 1 : '';
          }
        }
        
        upgradeLine.innerHTML = `<div style="color:#d4b24a;font-weight:bold;margin-bottom:4px;">UP to Level  ${nextLevelNum}</div>`;
        upgradeBody.appendChild(upgradeLine);
        
        // Для Lazy Click upgradeCost - это breakDuration в миллисекундах
        const isLazyClick = btn.desc.header && btn.desc.header.includes('LAZY CLICK');
        if (isLazyClick) {
          const breakSec = btn.desc.upgradeCost / 1000;
          const costLine = document.createElement('div');
          costLine.className = 'tooltip-stat';
          costLine.innerHTML = `<span class="tooltip-stat-label">UP Cost:</span> <span class="tooltip-stat-value">Free upgrade</span>`;
          upgradeBody.appendChild(costLine);
        } else {
          const costLine = document.createElement('div');
          costLine.className = 'tooltip-stat';
          costLine.innerHTML = `<span class="tooltip-stat-label">UP Cost:</span> <span class="tooltip-stat-value">${fmt(btn.desc.upgradeCost)} Points</span>`;
          upgradeBody.appendChild(costLine);
        }
        
        // Показываем что даст прокачка - берем эффект следующего уровня
        const currentLevelNum = levelTextFromHeader ? parseInt(levelTextFromHeader) : 0;
        const targetLevelNum = currentLevelNum + 1;
        
        if (isLazyClick) {
          // Данные для Lazy Click
          const lazyClickLevelsData = [
            { lvl: 1, clicks: 200, durationMs: 20000, multiplier: 1.5, cost: 300, clickReq: 589, breakDuration: 0 },
            { lvl: 2, clicks: 400, durationMs: 25000, multiplier: 2.0, cost: 0, clickReq: 1488, breakDuration: 164000 },
            { lvl: 3, clicks: 1000, durationMs: 30000, multiplier: 5.0, cost: 0, clickReq: 3564, breakDuration: 389000 },
            { lvl: 4, clicks: 2000, durationMs: 50000, multiplier: 10.0, cost: 0, clickReq: 9999, breakDuration: 606000 }
          ];
          
          const nextLevelData = lazyClickLevelsData.find(l => l.lvl === targetLevelNum);
          if (nextLevelData) {
            const effectLine = document.createElement('div');
            effectLine.className = 'tooltip-stat';
            effectLine.style.marginTop = '8px';
            effectLine.innerHTML = `<span class="tooltip-stat-label">Effect after UP:</span> <span class="tooltip-stat-value">Performs ${nextLevelData.clicks} passive clicks with x${nextLevelData.multiplier} multiplier over ${nextLevelData.durationMs/1000} seconds.</span>`;
            upgradeBody.appendChild(effectLine);
            
            // Показываем стоимость использования после прокачки
            const useCostLine = document.createElement('div');
            useCostLine.className = 'tooltip-stat';
            useCostLine.style.marginTop = '8px';
            useCostLine.innerHTML = `<span class="tooltip-stat-label">Usage Cost:</span> <span class="tooltip-stat-value">${nextLevelData.cost} Treasury</span>`;
            upgradeBody.appendChild(useCostLine);
            
            // Показываем перезарядку после прокачки
            const cdLine = document.createElement('div');
            cdLine.className = 'tooltip-stat';
            cdLine.innerHTML = `<span class="tooltip-stat-label">Cooldown:</span> <span class="tooltip-stat-value">54s</span>`;
            upgradeBody.appendChild(cdLine);
          }
        } else {
          // Данные для Repair
          const repairLevelsData = [
            { lvl: 1, percent: 0.09, cost: 100, cdSec: 39, lvlReq: 3987, upgradeCost: 0 },
            { lvl: 2, percent: 0.27, cost: 300, cdSec: 39, lvlReq: 10063, upgradeCost: 10000000 },
            { lvl: 3, percent: 0.46, cost: 450, cdSec: 39, lvlReq: 16827, upgradeCost: 1000000707 },
            { lvl: 4, percent: 0.63, cost: 650, cdSec: 39, lvlReq: 28212, upgradeCost: 10000005055 }
          ];
          
          const nextLevelData = repairLevelsData.find(r => r.lvl === targetLevelNum);
          if (nextLevelData) {
            const effectLine = document.createElement('div');
            effectLine.className = 'tooltip-stat';
            effectLine.style.marginTop = '8px';
            effectLine.innerHTML = `<span class="tooltip-stat-label">Effect after UP:</span> <span class="tooltip-stat-value">Accelerate all building repairs by ${Math.round(nextLevelData.percent*100)}% of original time.</span>`;
            upgradeBody.appendChild(effectLine);
            
            // Показываем стоимость использования после прокачки
            const useCostLine = document.createElement('div');
            useCostLine.className = 'tooltip-stat';
            useCostLine.style.marginTop = '8px';
            useCostLine.innerHTML = `<span class="tooltip-stat-label">Usage Cost:</span> <span class="tooltip-stat-value">${nextLevelData.cost} Treasury</span>`;
            upgradeBody.appendChild(useCostLine);
            
            // Показываем перезарядку после прокачки
            const cdLine = document.createElement('div');
            cdLine.className = 'tooltip-stat';
            cdLine.innerHTML = `<span class="tooltip-stat-label">Cooldown:</span> <span class="tooltip-stat-value">${nextLevelData.cdSec}s</span>`;
            upgradeBody.appendChild(cdLine);
          }
        }
      }
      
      upgradeTooltip.appendChild(upgradeBody);
      
      // Tooltip для плюсика - используем ту же логику, что и для кнопок
      let upgradeTooltipWidth = null;
      let upgradeTooltipHeight = null;
      
      const showUpgradeTooltip = (ev) => {
        if (_treasuryTooltipEl === tooltip) {
          hideTreasuryTooltip(); // Скрываем tooltip кнопки
        }
        if (_treasuryTooltipEl === upgradeTooltip) {
          hideTreasuryTooltip(); // Если уже показывается, скрываем
        }
        _treasuryTooltipEl = upgradeTooltip;
        document.body.appendChild(upgradeTooltip);
        
        // Устанавливаем размер один раз на основе реального содержимого
        if (upgradeTooltipWidth === null || upgradeTooltipHeight === null) {
          upgradeTooltip.style.position = 'fixed';
          upgradeTooltip.style.display = 'block';
          upgradeTooltip.style.visibility = 'hidden';
          upgradeTooltip.style.opacity = '0';
          upgradeTooltip.style.top = '-9999px';
          upgradeTooltip.style.left = '-9999px';
          
          // Получаем реальные размеры
          upgradeTooltipWidth = upgradeTooltip.offsetWidth || 250;
          upgradeTooltipHeight = upgradeTooltip.offsetHeight || 150;
          
          // Сохраняем размеры
          upgradeTooltip._width = upgradeTooltipWidth;
          upgradeTooltip._height = upgradeTooltipHeight;
        } else {
          upgradeTooltipWidth = upgradeTooltip._width || upgradeTooltipWidth;
          upgradeTooltipHeight = upgradeTooltip._height || upgradeTooltipHeight;
        }
        
        moveUpgradeTooltip(ev);
      };
      
      const moveUpgradeTooltip = (ev) => {
        if (!_treasuryTooltipEl || _treasuryTooltipEl !== upgradeTooltip) return;
        const pad = 12;
        const w = upgradeTooltipWidth || 250;
        const h = upgradeTooltipHeight || 150;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        let left = ev.clientX + 16;
        let top = ev.clientY + 16;
        
        if (left + w + pad > vw) {
          left = vw - w - pad;
          if (left < pad) left = pad;
        }
        if (top + h + pad > vh) {
          top = vh - h - pad;
          if (top < pad) top = pad;
        }
        if (left < pad) left = pad;
        if (top < pad) top = pad;
        
        upgradeTooltip.style.position = 'fixed';
        upgradeTooltip.style.width = w + 'px';
        upgradeTooltip.style.height = h + 'px';
        upgradeTooltip.style.left = `${left}px`;
        upgradeTooltip.style.top = `${top}px`;
        upgradeTooltip.style.zIndex = '2147483647';
        upgradeTooltip.style.display = 'block';
        upgradeTooltip.style.visibility = 'visible';
        upgradeTooltip.style.opacity = '1';
      };
      
      upgradeBadge.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        showUpgradeTooltip(e);
      });
      
      upgradeBadge.addEventListener('mousemove', (e) => {
        e.stopPropagation();
        if (_treasuryTooltipEl === upgradeTooltip) {
          moveUpgradeTooltip(e);
        }
      });
      
      upgradeBadge.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        if (_treasuryTooltipEl === upgradeTooltip) {
          hideTreasuryTooltip();
        }
      });
      
      // Сохраняем ссылку на upgradeTooltip для очистки
      el._upgradeTooltip = upgradeTooltip;
      
      upgradeBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Скрываем tooltip при клике
        if (_treasuryTooltipEl === upgradeTooltip) {
          hideTreasuryTooltip();
        }
        if (btn.upgradeOnClick) {
          // Эффект "мина салюта" вокруг плюсика
          createFireworksEffect(upgradeBadge);
          btn.upgradeOnClick();
        }
      }, true); // Используем capture phase
      el.appendChild(upgradeBadge);
    }
    
    // Buff timer под кнопкой
    if (btn.buffUntil && btn.buffUntil > nowTs) {
      const timerEl = document.createElement('div');
      timerEl.className = 'buff-timer';
      timerEl.setAttribute('data-buff-until', btn.buffUntil); // Сохраняем время окончания
      const updateTimer = () => {
        const remaining = Math.ceil((btn.buffUntil - now())/1000);
        if (remaining > 0) {
          timerEl.textContent = `${remaining}s`;
          setTimeout(updateTimer, 1000);
        } else {
          timerEl.textContent = '';
          renderTreasuryActions();
        }
      };
      updateTimer();
      el.appendChild(timerEl);
    }
    
    // Обработчик клика - активация по одному нажатию (используем capture для надежности)
    el.addEventListener('click', (e) => {
      // Проверяем, не кликнули ли на плюсик
      if (e.target.classList.contains('upgrade-badge') || e.target.closest('.upgrade-badge')) {
        return; // Плюсик обрабатывает свой клик сам
      }
      // Скрываем tooltip при клике
      if (_treasuryTooltipEl === tooltip) {
        hideTreasuryTooltip();
      }
      
      if (btn.onClick && !el.disabled) {
        e.preventDefault();
        e.stopPropagation();
        // Эффект волны при клике
        el.classList.add('clicked');
        setTimeout(() => {
          el.classList.remove('clicked');
        }, 600);
        btn.onClick();
      }
    }, true); // Используем capture phase для более раннего перехвата
    treasuryActionsEl.appendChild(el);
  });
  
  // Second row for Uber mode buffs (108 seconds duration, cost treasury coins)
  const isInUberMode = save.uber && save.uber.max !== 19;
  if (isInUberMode) {
    const secondRowButtons = [];
    const hourMs = 108000; // 108 seconds
    
    // Check if any buff is currently active - if so, disable all buttons
    const anyBuffActive = (act.noGoldenUntil > nowTs) || 
                          (act.alwaysGoldenUntil > nowTs) || 
                          (act.fastRepairUntil > nowTs) || 
                          (act.passiveBoostUntil > nowTs) || 
                          (act.spiderBuffUntil > nowTs) ||
                          (act.noBreakUntil > nowTs);
    
    // Buff 1: Click can't become golden, can't break, -83% income (17% of original)
    {
      const active = act.noGoldenUntil > nowTs;
      const desc = {
        header: 'NO GOLDEN CLICK',
        effect: 'Click button cannot become golden.',
        duringWarning: 'Click income -83%.',
        afterWarning: '2-3 random buildings break for 120 seconds.',
        cost: 1000,
        duration: 108
      };
      secondRowButtons.push({
        id: 'noGolden',
        label: 'No Golden',
        desc,
        enabled: !anyBuffActive && save.treasury.value >= 1000,
        onClick: () => {
          if (anyBuffActive) { toast('Another buff is already active.', 'warn'); return; }
          if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
          act.noGoldenUntil = now() + hourMs;
          toast('No Golden Click activated for 108 seconds.', 'good');
          renderTreasuryActions();
        },
        buffUntil: act.noGoldenUntil
      });
    }
    
    // Buff 2: Click always golden, breaks 9x more often
    {
      const active = act.alwaysGoldenUntil > nowTs;
      const desc = {
        header: 'ALWAYS GOLDEN',
        effect: 'Click button is always golden.',
        afterWarning: 'Click button cannot become golden for 120 seconds. Click income -35% for 90 seconds.',
        cost: 1000,
        duration: 108
      };
      secondRowButtons.push({
        id: 'alwaysGolden',
        label: 'Always Golden',
        desc,
        enabled: !anyBuffActive && save.treasury.value >= 1000,
        onClick: () => {
          if (anyBuffActive) { toast('Another buff is already active.', 'warn'); return; }
          if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
          act.alwaysGoldenUntil = now() + hourMs;
          save.click.goldenUntil = now() + hourMs; // Set golden immediately
          toast('Always Golden Click activated for 108 seconds.', 'good');
          
          // Воспроизводим звук золотой кнопки
          playSound('clickGold');
          renderTreasuryActions();
        },
        buffUntil: act.alwaysGoldenUntil
      });
    }
    
    // Buff 3: Buildings repair 2x faster, break 9x more often
    {
      const active = act.fastRepairUntil > nowTs;
      const desc = {
        header: 'FAST REPAIR',
        effect: 'Buildings repair 2 times faster.',
        duringWarning: 'Buildings break 9x more often.',
        afterWarning: 'Repair time +50%. 3-4 random buildings break for 150 seconds.',
        cost: 1000,
        duration: 108
      };
      secondRowButtons.push({
        id: 'fastRepair',
        label: 'Fast Repair',
        desc,
        enabled: !anyBuffActive && save.treasury.value >= 1000,
        onClick: () => {
          if (anyBuffActive) { toast('Another buff is already active.', 'warn'); return; }
          if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
          act.fastRepairUntil = now() + hourMs;
          // Уменьшаем время восстановления для уже сломанных зданий в 2 раза
          const nowTs = now();
          save.buildings.forEach(b => {
            if (b.blockedUntil > nowTs) {
              const remaining = b.blockedUntil - nowTs;
              b.blockedUntil = nowTs + (remaining * 0.5); // Уменьшаем оставшееся время в 2 раза
            }
          });
          toast('Fast Repair activated for 108 seconds.', 'good');
          renderTreasuryActions();
        },
        buffUntil: act.fastRepairUntil
      });
    }
    
    // Buff 4: Passive income boost (1% every 7 seconds, up to 56%, resets on various actions)
    {
      const active = act.passiveBoostUntil > nowTs;
      const currentBoost = Math.min(act.passiveBoostLevel || 0, 56);
      const desc = {
        header: 'PASSIVE BOOST',
        effect: `Passive income increases by 1% every 7 seconds (current: +${currentBoost}%).`,
        note: 'Clicking click button, spider, king, barmatun, elf, buying click levels, or upgrading click resets this bonus.',
        afterWarning: 'Passive income -30% for 120 seconds. Click income -25% for 90 seconds. 2-3 random buildings break for 180 seconds.',
        cost: 1000,
        duration: 108
      };
      secondRowButtons.push({
        id: 'passiveBoost',
        label: 'Passive Boost',
        desc,
        enabled: !anyBuffActive && save.treasury.value >= 1000,
        onClick: () => {
          if (anyBuffActive) { toast('Another buff is already active.', 'warn'); return; }
          if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
          act.passiveBoostUntil = now() + hourMs;
          act.passiveBoostLevel = 0;
          act.passiveBoostLastTick = now();
          _cachedPPS = null;
          toast('Passive Boost activated for 108 seconds.', 'good');
          renderTreasuryActions();
        },
        buffUntil: act.passiveBoostUntil
      });
    }
    
    // Buff 6: Buildings can't break, but cost 7x more (including upgrades)
    {
      const active = act.noBreakUntil > nowTs;
      const desc = {
        header: 'MASTER BUILDER',
        effect: 'Buildings cannot break.',
        duringWarning: 'Buildings and upgrades cost 7x more.',
        afterWarning: 'Passive income -40% for 120 seconds. Click income -30% for 90 seconds.',
        cost: 1000,
        duration: 108
      };
      secondRowButtons.push({
        id: 'noBreak',
        label: 'Master Builder',
        desc,
        enabled: !anyBuffActive && save.treasury.value >= 1000,
        onClick: () => {
          if (anyBuffActive) { toast('Another buff is already active.', 'warn'); return; }
          if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
          act.noBreakUntil = now() + hourMs;
          toast('Master Builder activated for 108 seconds.', 'good');
          renderTreasuryActions();
        },
        buffUntil: act.noBreakUntil
      });
    }
    
    // Buff 5: Spider buff + click gives treasury
    {
      const active = act.spiderBuffUntil > nowTs;
      const desc = {
        header: 'SPIDER BUFF',
        effect: 'Spider increases chance for positive effects and decreases negative effects. Buff duration: 4s, Debuff duration: 12s.',
        note: 'Each click gives 0.2 treasury coins. Treasury no longer fills passively. King mini-game requires one less crown to win.',
        afterWarning: 'Passive income -20% for 90 seconds. Click income -25% for 60 seconds. 2-3 random buildings break for 150 seconds.',
        cost: 1000,
        duration: 108
      };
      secondRowButtons.push({
        id: 'spiderBuff',
        label: 'Spider Buff',
        desc,
        enabled: !anyBuffActive && save.treasury.value >= 1000,
        onClick: () => {
          if (anyBuffActive) { toast('Another buff is already active.', 'warn'); return; }
          if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
          act.spiderBuffUntil = now() + hourMs;
          act.treasuryNoPassiveUntil = now() + hourMs;
          toast('Spider Buff activated for 108 seconds.', 'good');
          renderTreasuryActions();
        },
        buffUntil: act.spiderBuffUntil
      });
    }
    
    // Create second row container - place it under the notifications window
    const noticeBoard = document.querySelector('.notice-board');
    let secondRowEl = document.getElementById('treasury-actions-row2');
    if (!secondRowEl) {
      secondRowEl = document.createElement('div');
      secondRowEl.id = 'treasury-actions-row2';
      secondRowEl.className = 'treasury-actions-row';
      // Insert after notice-board (under notifications window in left column)
      if (noticeBoard && noticeBoard.parentNode) {
        noticeBoard.parentNode.insertBefore(secondRowEl, noticeBoard.nextSibling);
      } else {
        // Fallback: if notice-board not found, place after treasury actions
        treasuryActionsEl.parentNode.insertBefore(secondRowEl, treasuryActionsEl.nextSibling);
      }
    }
    secondRowEl.innerHTML = '';
    
    // Icons for second row buttons (Uber mode buffs)
    const uberIcons = {
      'noGolden': '🚫',
      'alwaysGolden': '✨',
      'fastRepair': '⚡',
      'passiveBoost': '📈',
      'spiderBuff': '🕷️',
      'noBreak': '🛡️'
    };
    
    // Render second row buttons (same structure as first row, but with Uber mode styling)
    secondRowButtons.forEach(btn => {
      const el = document.createElement('button');
      el.className = 'btn treasury-action-btn uber-mode-btn';
      const icon = uberIcons[btn.id] || '⭐';
      el.setAttribute('data-btn-id', btn.id);
      el.disabled = !btn.enabled;
      
      // Для второй строки пока оставляем эмодзи (там другие кнопки)
      el.setAttribute('data-icon', icon);
      
      // Tooltip (same structure as first row)
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.setAttribute('data-treasury-tooltip', 'true');
      
      const header = document.createElement('div');
      header.className = 'tooltip-header';
      header.textContent = btn.desc.header || btn.label;
      tooltip.appendChild(header);
      
      const body = document.createElement('div');
      body.className = 'tooltip-body';
      
      if (btn.desc.effect) {
        const effectLine = document.createElement('div');
        effectLine.className = 'tooltip-line';
        effectLine.innerHTML = `<div style="color:#d4b24a;font-weight:bold;margin-bottom:4px;">${btn.desc.effect}</div>`;
        body.appendChild(effectLine);
      }
      
      if (btn.desc.duringWarning) {
        const duringWarningLine = document.createElement('div');
        duringWarningLine.style.color = '#ff6b6b';
        duringWarningLine.style.marginTop = '6px';
        duringWarningLine.textContent = `During effect: ${btn.desc.duringWarning}`;
        body.appendChild(duringWarningLine);
      }
      
      if (btn.desc.afterWarning) {
        const afterWarningLine = document.createElement('div');
        afterWarningLine.style.color = '#ff6b6b';
        afterWarningLine.style.marginTop = btn.desc.duringWarning ? '4px' : '6px';
        afterWarningLine.textContent = `After effect: ${btn.desc.afterWarning}`;
        body.appendChild(afterWarningLine);
      }
      
      // Старый формат warning для обратной совместимости
      if (btn.desc.warning && !btn.desc.duringWarning && !btn.desc.afterWarning) {
        const warningLine = document.createElement('div');
        warningLine.style.color = '#ff6b6b';
        warningLine.style.marginTop = '6px';
        warningLine.textContent = btn.desc.warning;
        body.appendChild(warningLine);
      }
      
      if (btn.desc.note) {
        const noteLine = document.createElement('div');
        noteLine.style.color = '#a08f70';
        noteLine.style.fontStyle = 'italic';
        noteLine.style.marginTop = '4px';
        noteLine.textContent = btn.desc.note;
        body.appendChild(noteLine);
      }
      
      const separator = document.createElement('div');
      separator.className = 'tooltip-line';
      body.appendChild(separator);
      
      if (btn.desc.cost) {
        const costLine = document.createElement('div');
        costLine.className = 'tooltip-stat';
        costLine.innerHTML = `<span class="tooltip-stat-label">Cost:</span> <span class="tooltip-stat-value tooltip-cost">${btn.desc.cost} Treasury</span>`;
        body.appendChild(costLine);
      }
      
      if (btn.desc.duration) {
        const durLine = document.createElement('div');
        durLine.className = 'tooltip-stat';
        const durRemaining = btn.buffUntil && btn.buffUntil > nowTs ? ` (${Math.ceil((btn.buffUntil - nowTs)/1000)}s)` : '';
        durLine.innerHTML = `<span class="tooltip-stat-label">Duration:</span> <span class="tooltip-stat-value">${btn.desc.duration}s${durRemaining}</span>`;
        body.appendChild(durLine);
      }
      
      tooltip.appendChild(body);
      
      // Tooltip handlers (same as first row)
      let tooltipWidth = null;
      let tooltipHeight = null;
      
      const showTreasuryTooltip = (ev) => {
        hideTreasuryTooltip();
        _treasuryTooltipEl = tooltip;
        document.body.appendChild(tooltip);
        
        if (tooltipWidth === null || tooltipHeight === null) {
          tooltip.style.position = 'fixed';
          tooltip.style.display = 'block';
          tooltip.style.visibility = 'hidden';
          tooltip.style.opacity = '0';
          tooltip.style.top = '-9999px';
          tooltip.style.left = '-9999px';
          
          tooltipWidth = tooltip.offsetWidth || 300;
          tooltipHeight = tooltip.offsetHeight || 200;
          
          tooltip._width = tooltipWidth;
          tooltip._height = tooltipHeight;
        } else {
          tooltipWidth = tooltip._width || tooltipWidth;
          tooltipHeight = tooltip._height || tooltipHeight;
        }
        
        moveTreasuryTooltip(ev);
      };
      
      const moveTreasuryTooltip = (ev) => {
        if (!_treasuryTooltipEl) return;
        const pad = 12;
        const w = tooltipWidth || 300;
        const h = tooltipHeight || 200;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        let left = ev.clientX + 16;
        let top = ev.clientY + 16;
        
        if (left + w + pad > vw) {
          left = vw - w - pad;
          if (left < pad) left = pad;
        }
        if (top + h + pad > vh) {
          top = vh - h - pad;
          if (top < pad) top = pad;
        }
        if (left < pad) left = pad;
        if (top < pad) top = pad;
        
        _treasuryTooltipEl.style.position = 'fixed';
        _treasuryTooltipEl.style.width = w + 'px';
        _treasuryTooltipEl.style.height = h + 'px';
        _treasuryTooltipEl.style.left = `${left}px`;
        _treasuryTooltipEl.style.top = `${top}px`;
        _treasuryTooltipEl.style.zIndex = '2147483647';
        _treasuryTooltipEl.style.display = 'block';
        _treasuryTooltipEl.style.visibility = 'visible';
        _treasuryTooltipEl.style.opacity = '1';
      };
      
      el.addEventListener('mouseenter', (e) => {
        showTreasuryTooltip(e);
      });
      
      el.addEventListener('mousemove', (e) => {
        if (_treasuryTooltipEl === tooltip) {
          moveTreasuryTooltip(e);
        }
      });
      
      el.addEventListener('mouseleave', () => {
        if (_treasuryTooltipEl === tooltip) {
          hideTreasuryTooltip();
        }
      });
      
      // Buff timer под кнопкой (обновляется через updateTreasuryActions)
      if (btn.buffUntil && btn.buffUntil > nowTs) {
        const timerEl = document.createElement('div');
        timerEl.className = 'buff-timer';
        timerEl.setAttribute('data-buff-until', btn.buffUntil); // Сохраняем время окончания
        const remaining = Math.ceil((btn.buffUntil - nowTs)/1000);
        timerEl.textContent = remaining > 0 ? `${remaining}s` : '';
        el.appendChild(timerEl);
      }
      
      el.addEventListener('click', (e) => {
        if (_treasuryTooltipEl === tooltip) {
          hideTreasuryTooltip();
        }
        
        if (btn.onClick && !el.disabled) {
          e.preventDefault();
          e.stopPropagation();
          el.classList.add('clicked');
          setTimeout(() => {
            el.classList.remove('clicked');
          }, 600);
          btn.onClick();
        }
      }, true);
      
      secondRowEl.appendChild(el);
    });
  } else {
    // Remove second row if not in Uber mode
    const secondRowEl = document.getElementById('treasury-actions-row2');
    if (secondRowEl) {
      secondRowEl.remove();
    }
  }
  
}

// Оптимизированное обновление кнопок treasury - только данные, без пересоздания DOM
let _lastTreasuryFullRender = 0;
function updateTreasuryActions() {
  if (!treasuryActionsEl || !save || !save.treasury) return;
  
  const nowTs = now();
  
  // Полный перерендер раз в 1.5 секунды или если кнопок нет (оптимизация)
  if (treasuryActionsEl.children.length === 0 || (nowTs - _lastTreasuryFullRender) >= 1500) {
    renderTreasuryActions();
    _lastTreasuryFullRender = nowTs;
    return;
  }
  
  // Быстрое обновление только данных
  const act = save.treasury.actions;
  const buttons = treasuryActionsEl.querySelectorAll('.treasury-action-btn');
  
  buttons.forEach((el) => {
    const btnId = el.getAttribute('data-btn-id');
    if (!btnId) return;
    
    // Обновляем cooldown
    let cooldownUntil = 0;
    if (btnId === 'casino') {
      cooldownUntil = act.casinoCd || 0;
    } else if (btnId === 'repair') {
      cooldownUntil = act.repairCd || 0;
    } else if (btnId === 'lazyClick') {
      cooldownUntil = act.lazyClickCd || 0;
    } else if (btnId === 'taxfree') {
      cooldownUntil = act.taxFreeCd || 0;
    } else if (btnId === 'engineer') {
      cooldownUntil = act.engineerCd || 0;
    } else if (btnId === 'clickMadness') {
      cooldownUntil = act.clickMadnessCd || 0;
    }
    
    if (cooldownUntil && cooldownUntil > nowTs) {
      const remaining = Math.ceil((cooldownUntil - nowTs)/1000);
      el.setAttribute('data-cooldown', remaining);
      if (!el.disabled) {
        el.setAttribute('data-cooldown-disabled', 'true');
      }
      el.disabled = true;
    } else {
      el.removeAttribute('data-cooldown');
      // Обновляем disabled только для cooldown, остальное обновляется при полном рендере
      if (el.hasAttribute('data-cooldown-disabled')) {
        el.disabled = false;
        el.removeAttribute('data-cooldown-disabled');
      }
    }
    
    // Обновляем buff timer
    const timerEl = el.querySelector('.buff-timer');
    if (timerEl) {
      const buffUntil = parseFloat(timerEl.getAttribute('data-buff-until') || 0);
      if (buffUntil > nowTs) {
        const remaining = Math.ceil((buffUntil - nowTs)/1000);
        timerEl.textContent = remaining > 0 ? `${remaining}s` : '';
      } else if (buffUntil > 0 && buffUntil <= nowTs) {
        timerEl.textContent = '';
        // Если таймер истек, пересоздаем кнопки
        renderTreasuryActions();
        _lastTreasuryFullRender = nowTs;
      }
    }
  });
  
  // Обновляем таймеры для кнопок второго ряда (Uber mode)
  const secondRowEl = document.getElementById('treasury-actions-row2');
  if (secondRowEl) {
    const secondRowButtons = secondRowEl.querySelectorAll('.btn');
    secondRowButtons.forEach((el) => {
      const timerEl = el.querySelector('.buff-timer');
      if (timerEl) {
        const buffUntil = parseFloat(timerEl.getAttribute('data-buff-until') || 0);
        if (buffUntil > nowTs) {
          const remaining = Math.ceil((buffUntil - nowTs)/1000);
          timerEl.textContent = remaining > 0 ? `${remaining}s` : '';
        } else if (buffUntil > 0 && buffUntil <= nowTs) {
          timerEl.textContent = '';
          // Если таймер истек, пересоздаем кнопки
          renderTreasuryActions();
          _lastTreasuryFullRender = nowTs;
        }
      }
    });
  }
}

// Обновление уровней зданий в реальном времени (без пересоздания карточек)
let _lastBuildingLevelsUpdate = 0;
let _cachedModifiers = null;
let _lastModifiersUpdate = 0;

function updateBuildingLevels(forceImmediate = false) {
  if (!buildingsList || !save) return;
  
  const nowTs = now();
  // Обновляем уровни раз в 100мс для лучшей производительности (уменьшено для плавности)
  // Но если forceImmediate = true, обновляем немедленно БЕЗ дебаунсинга
  // Также обновляем немедленно при изменении bulk (проверяем через флаг)
  if (!forceImmediate) {
    if (nowTs - _lastBuildingLevelsUpdate < 100) return;
    _lastBuildingLevelsUpdate = nowTs;
  } else {
    // При forceImmediate обновляем timestamp сразу, чтобы следующее обновление не было заблокировано
    _lastBuildingLevelsUpdate = nowTs;
  }
  
  // Сбрасываем кэш модификаторов при принудительном обновлении, чтобы пересчитать все
  if (forceImmediate) {
    _cachedModifiers = null;
  }
  
  // Кэшируем модификаторы на 200мс (они меняются реже чем обновления уровней)
  if (!_cachedModifiers || (nowTs - _lastModifiersUpdate > 200)) {
    const tNow = now();
    _cachedModifiers = {
      spiderMult: save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0,
      achievementMult: getAchievementBonus(),
      taxMult: save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0,
      passiveBoostMult: (save.treasury?.actions && save.treasury.actions.passiveBoostUntil > tNow && save.treasury.actions.passiveBoostLevel > 0) 
        ? (1 + (save.treasury.actions.passiveBoostLevel / 100)) : 1.0,
      angryBarmatunIncomeReduction: save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0,
      kingDebuffMult: save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0,
      tNow: tNow
    };
    _lastModifiersUpdate = nowTs;
  }
  
  const cards = buildingsList.querySelectorAll('.building-card');
  cards.forEach((card) => {
    const buildingIndex = parseInt(card.dataset.buildingIndex);
    if (isNaN(buildingIndex) || buildingIndex >= save.buildings.length) return;
    
    // Пропускаем невидимые карточки (скрытые через display: none)
    if (card.style.display === 'none') return;
    
    const b = save.buildings[buildingIndex];
    const i = buildingIndex;
    
    // Обновляем уровень, доход и стоимость - находим элементы по порядку
    const infoContainer = card.querySelector('.building-info');
    if (!infoContainer) return; // Если нет контейнера, пропускаем
    
    const metaElements = Array.from(infoContainer.children);
    if (metaElements.length < 4) return; // Если недостаточно элементов, пропускаем
    
    // Элемент 0: name (не трогаем)
    // Элемент 1: Level
    const lvlEl = metaElements[1];
    if (lvlEl) {
      const newLevelText = `<strong>Level:</strong> <strong>${b.level}</strong> <strong>/</strong> <strong>${b.max}</strong>`;
      if (lvlEl.innerHTML !== newLevelText) {
        lvlEl.innerHTML = newLevelText;
      }
    }
    
    // Элемент 2: Income/sec - используем правильный объект здания из save.buildings
    const incEl = metaElements[2];
    if (incEl) {
      // Убеждаемся, что используем правильный объект здания по оригинальному индексу
      const buildingObj = save.buildings[buildingIndex];
      
      // Если уровень 0, показываем 0.0000, в скобках прирост при прокачке
      if (buildingObj.level < 1) {
        const mods = _cachedModifiers;
        const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
        const nextLevelBaseIncome = buildingIncomeAt(buildingObj, 1, buildingObj.upgradeBonus);
        const nextLevelRealIncome = nextLevelBaseIncome * mods.spiderMult * mods.achievementMult * mods.taxMult * mods.passiveBoostMult * mods.angryBarmatunIncomeReduction * mods.kingDebuffMult;
        const incomeIncrease = nextLevelRealIncome * Math.min(bulk, buildingObj.max);
        const newIncomeText = `<strong>Income/sec:</strong> <strong>0.0000</strong> <span style="color: var(--muted);"><strong>(+</strong><strong>${fmt(incomeIncrease)}</strong><strong>)</strong></span>`;
      if (incEl.innerHTML !== newIncomeText) {
        incEl.innerHTML = newIncomeText;
        }
      } else {
        const baseIncome = buildingIncomeAt(buildingObj, buildingObj.level, buildingObj.upgradeBonus);
        // Apply all modifiers to get real income - используем кэшированные модификаторы
        const mods = _cachedModifiers;
        const realIncome = baseIncome * mods.spiderMult * mods.achievementMult * mods.taxMult * mods.passiveBoostMult * mods.angryBarmatunIncomeReduction * mods.kingDebuffMult;
        
        // Проверяем, нужен ли апгрейд
        const seg = segmentIndex(buildingObj.level);
        const within = withinSegment(buildingObj.level);
        const prevSegBought = seg === 0 ? true : !!buildingObj.segUpgrades[seg-1];
        const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
        
        let incomeIncrease = 0;
        if (needUpgrade) {
          // Если нужен апгрейд, показываем прирост от апгрейда (+3%)
          const mods = _cachedModifiers;
          const baseIncomeAfterUpgrade = buildingIncomeAt(buildingObj, buildingObj.level, buildingObj.upgradeBonus + 1);
          const realIncomeAfterUpgrade = baseIncomeAfterUpgrade * mods.spiderMult * mods.achievementMult * mods.taxMult * mods.passiveBoostMult * mods.angryBarmatunIncomeReduction * mods.kingDebuffMult;
          incomeIncrease = realIncomeAfterUpgrade - realIncome;
        } else {
          // Calculate income increase for next level (considering bulk)
          const mods = _cachedModifiers;
          const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
          const nextLevelBaseIncome = buildingIncomeAt(buildingObj, buildingObj.level + 1, buildingObj.upgradeBonus);
          const nextLevelRealIncome = nextLevelBaseIncome * mods.spiderMult * mods.achievementMult * mods.taxMult * mods.passiveBoostMult * mods.angryBarmatunIncomeReduction * mods.kingDebuffMult;
          const incomeIncreasePerLevel = nextLevelRealIncome - realIncome;
          incomeIncrease = incomeIncreasePerLevel * bulk;
        }
        
        const newIncomeText = `<strong>Income/sec:</strong> <strong>${fmt(realIncome)}</strong> <span style="color: var(--muted);"><strong>(+</strong><strong>${fmt(incomeIncrease)}</strong><strong>)</strong></span>`;
        if (incEl.innerHTML !== newIncomeText) {
          incEl.innerHTML = newIncomeText;
        }
      }
    }
    
    // Элемент 3: Next Cost
    const costEl = metaElements[3];
    if (costEl) {
      const nextCost = computeBulkCostForBuilding(i, save.bulk);
      const seg = segmentIndex(b.level);
      const within = withinSegment(b.level);
      const prevSegBought = seg === 0 ? true : !!b.segUpgrades[seg-1];
      const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
      
      let newCostText;
      if (needUpgrade) {
        let upgradeCost = (b.pendingSegmentCost[seg-1] || 0) * 0.77;
            // Buff 6: Master Builder - upgrades cost 7x more
            const act = save.treasury?.actions;
            const noBreakActive = act && act.noBreakUntil > now();
            if (noBreakActive) {
              upgradeCost *= 7;
            }
        newCostText = `<strong>Next Cost:</strong> <strong>${fmt(upgradeCost)}</strong> <strong>(UP)</strong>`;
      } else {
        newCostText = `<strong>Next Cost:</strong> <strong>${fmt(nextCost.totalCost)}</strong> <strong>(${save.bulk === 'max' ? 'max' : 'x'+save.bulk})</strong>`;
      }
      
      // Всегда обновляем цену, чтобы она менялась при изменении bulk
      costEl.innerHTML = newCostText;
    }
    
    
    // Обновляем кнопки (Buy/Upgrade переключение)
    const actionSlot = card.querySelector('.building-action-slot');
    if (actionSlot) {
      // Находим кнопки более надежным способом по тексту
      const allButtons = actionSlot.querySelectorAll('.btn.small');
      let buyBtn = null;
      let segBtn = null;
      
      allButtons.forEach(btn => {
        if (btn.textContent.includes('Buy')) {
          buyBtn = btn;
        } else if (btn.textContent.includes('UP')) {
          segBtn = btn;
        }
      });
      
      if (buyBtn && segBtn) {
        const isInUberMode = save.uber && save.uber.max !== 19;
        const shouldHideButtons = b.level >= 1000 && !isInUberMode;
        
        if (shouldHideButtons) {
          // Скрываем обе кнопки
          if (!buyBtn.classList.contains('hidden')) {
            buyBtn.classList.add('hidden');
            buyBtn.setAttribute('aria-hidden', 'true');
          }
          if (!segBtn.classList.contains('hidden')) {
            segBtn.classList.add('hidden');
            segBtn.setAttribute('aria-hidden', 'true');
          }
        } else {
          const seg = segmentIndex(b.level);
          const within = withinSegment(b.level);
          const prevSegBought = seg === 0 ? true : !!b.segUpgrades[seg-1];
          const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
          
          if (needUpgrade) {
            // Показываем Upgrade, скрываем Buy
            let prevCost = (b.pendingSegmentCost[seg-1] || 0) * 0.77;
            // Buff 6: Master Builder - upgrades cost 7x more
            const act = save.treasury?.actions;
            const noBreakActive = act && act.noBreakUntil > now();
            if (noBreakActive) {
              prevCost *= 2;
            }
            const newText = `Upgrade\n(${fmt(prevCost)})`;
            if (segBtn.textContent !== newText.replace('\n', ' ')) {
              segBtn.innerHTML = `UP<br>(${fmt(prevCost)})`;
            }
            segBtn.disabled = save.points < prevCost;
            
            // Убеждаемся, что обработчик установлен (удаляем старый если есть)
            const oldHandler = segBtn._upgradeHandler;
            if (oldHandler) {
              segBtn.removeEventListener('click', oldHandler);
            }
            const newHandler = () => buyBuildingSegUpgrade(i, seg-1);
            segBtn.addEventListener('click', newHandler);
            segBtn._upgradeHandler = newHandler;
            
            if (!buyBtn.classList.contains('hidden')) {
              buyBtn.classList.add('hidden');
              buyBtn.setAttribute('aria-hidden', 'true');
            }
            if (segBtn.classList.contains('hidden')) {
              segBtn.classList.remove('hidden');
              segBtn.setAttribute('aria-hidden', 'false');
            }
            // Делаем кнопку primary, как у клика
            if (!segBtn.classList.contains('primary')) {
              segBtn.classList.add('primary');
            }
            
            // Подсвечиваем карточку здания при наличии апгрейда
            if (!card.classList.contains('has-upgrade')) {
              card.classList.add('has-upgrade');
            }
            
            // Обновляем текст в costEl (элемент 3 - Next Cost, Income остается на месте)
            const infoContainer = card.querySelector('.building-info');
            if (infoContainer) {
              const metaElements = Array.from(infoContainer.children);
              // Элемент 0: name, Элемент 1: Level, Элемент 2: Income/sec, Элемент 3: Next Cost
              const costEl = metaElements[3];
              if (costEl) {
                let upgradeCost = (b.pendingSegmentCost[seg-1] || 0) * 0.77;
                const act = save.treasury?.actions;
                const noBreakActive = act && act.noBreakUntil > now();
                if (noBreakActive) {
                  upgradeCost *= 7;
                }
                costEl.innerHTML = `<strong>Next Cost:</strong> <strong>${fmt(upgradeCost)}</strong> <strong>(UP)</strong>`;
              }
            }
          } else {
            // Показываем Buy, скрываем Upgrade
            const nextCost = computeBulkCostForBuilding(i, save.bulk);
            buyBtn.disabled = now() < b.blockedUntil || !canBuyNextBuilding(i) || (save.points < nextCost.totalCost);
            
            // Убеждаемся, что обработчик установлен (удаляем старый если есть)
            const oldBuyHandler = buyBtn._buyHandler;
            if (oldBuyHandler) {
              buyBtn.removeEventListener('click', oldBuyHandler);
            }
            const newBuyHandler = () => buyBuildingLevels(i);
            buyBtn.addEventListener('click', newBuyHandler);
            buyBtn._buyHandler = newBuyHandler;
            
            if (!segBtn.classList.contains('hidden')) {
              segBtn.classList.add('hidden');
              segBtn.setAttribute('aria-hidden', 'true');
            }
            if (buyBtn.classList.contains('hidden')) {
              buyBtn.classList.remove('hidden');
              buyBtn.setAttribute('aria-hidden', 'false');
            }
            
            // Убираем primary с кнопки апгрейда
            if (segBtn.classList.contains('primary')) {
              segBtn.classList.remove('primary');
            }
            
            // Убираем подсветку, если апгрейд не нужен
            if (card.classList.contains('has-upgrade')) {
              card.classList.remove('has-upgrade');
            }
            
            // Обновляем текст в costEl (элемент 3 - Next Cost, Income остается на месте)
            const infoContainer = card.querySelector('.building-info');
            if (infoContainer) {
              const metaElements = Array.from(infoContainer.children);
              // Элемент 0: name, Элемент 1: Level, Элемент 2: Income/sec, Элемент 3: Next Cost
              const costEl = metaElements[3];
              if (costEl) {
                const nextCost = computeBulkCostForBuilding(i, save.bulk);
                const seg = segmentIndex(b.level);
                const within = withinSegment(b.level);
                const prevSegBought = seg === 0 ? true : !!b.segUpgrades[seg-1];
                const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
                
                let newCostText;
                if (needUpgrade) {
                  let upgradeCost = (b.pendingSegmentCost[seg-1] || 0) * 0.77;
                  // Buff 6: Master Builder - upgrades cost 7x more
                  const act = save.treasury?.actions;
                  const noBreakActive = act && act.noBreakUntil > now();
                  if (noBreakActive) {
                    upgradeCost *= 7;
                  }
                  newCostText = `<strong>Next Cost:</strong> <strong>${fmt(upgradeCost)}</strong> <strong>(UP)</strong>`;
                } else {
                  // Пересчитываем цену с учетом текущего bulk
                  const nextCostForDisplay = computeBulkCostForBuilding(i, save.bulk);
                  newCostText = `<strong>Next Cost:</strong> <strong>${fmt(nextCostForDisplay.totalCost)}</strong> <strong>(${save.bulk === 'max' ? 'max' : 'x'+save.bulk})</strong>`;
                }
                costEl.innerHTML = newCostText;
              }
            }
          }
        }
      }
    }
    
    // Обновляем или создаем note элемент с временем блокировки
    if (nowTs < b.blockedUntil) {
      // Здание сломано - нужно показать таймер
      let note = card.querySelector('.building-note.building-downnote');
      if (!note) {
        // Создаем новый таймер, если его нет
        // Ищем divider или action-slot, чтобы вставить note перед ними
        const divider = card.querySelector('.building-card-divider');
        const actionSlot = card.querySelector('.building-action-slot');
        const insertBefore = divider || actionSlot;
        
        if (insertBefore) {
          note = document.createElement('div');
          note.className = 'building-note building-downnote';
          insertBefore.parentNode.insertBefore(note, insertBefore);
        } else {
          // Если нет divider и action-slot, добавляем в конец карточки
          note = document.createElement('div');
          note.className = 'building-note building-downnote';
          card.appendChild(note);
        }
      }
      if (note) {
        note.dataset.blockedUntil = String(b.blockedUntil);
        const remain = Math.ceil((b.blockedUntil - nowTs) / 1000);
        note.textContent = `Under repair: ${remain}s`;
      }
    } else {
      // Время истекло - удаляем note если есть
      const note = card.querySelector('.building-note.building-downnote');
      if (note) {
        note.remove();
      }
    }
  });
  
  // Если это принудительное обновление, также обновляем состояние всех кнопок
  if (forceImmediate) {
    updateButtonStates();
  }
}

function renderClick() {
  if (!save || !clickBtn) return;
  
  // Обновляем перегрев перед рендером
  updateClickHeat();
  
  const act = save.treasury?.actions;
  const alwaysGoldenActive = act && act.alwaysGoldenUntil > now();
  // Buff 2: Always golden - force golden state
  let goldenActive = save.click.goldenUntil > now();
  if (alwaysGoldenActive) {
    goldenActive = true;
    // Extend golden until buff ends
    if (save.click.goldenUntil < act.alwaysGoldenUntil) {
      save.click.goldenUntil = act.alwaysGoldenUntil;
    }
  }
  
  const overheated = isClickOverheated();
  const clickSpeed = getClickSpeed();
  const heat = save.click.heat || 0;

  // Явно удаляем и добавляем классы для гарантированного обновления
  // Кнопка больше не может сломаться - убираем класс broken
  clickBtn.classList.remove('broken');
  clickBtn.classList.remove('overheated');
  
  if (overheated) {
    clickBtn.classList.add('overheated');
    clickBtn.disabled = true;
  } else {
    clickBtn.disabled = false;
  }
  
  if (goldenActive && !overheated) {
    clickBtn.classList.add('golden');
  } else {
    clickBtn.classList.remove('golden');
  }
  
  // Обновляем статус
  if (overheated) {
    const remaining = Math.ceil((save.click.cooldownUntil - now()) / 1000);
    clickStatus.textContent = `Overheated (${remaining}s)`;
  } else {
    clickStatus.textContent = goldenActive ? 'Golden' : 'Ready';
  }
  
  // Обратный таймер вверху кнопки
  let timerEl = clickBtn.querySelector('.click-timer');
  if (!timerEl) {
    timerEl = document.createElement('div');
    timerEl.className = 'click-timer';
    clickBtn.appendChild(timerEl);
  }
  
  if (overheated) {
    const remaining = Math.ceil((save.click.cooldownUntil - now()) / 1000);
    timerEl.textContent = `${remaining}s`;
    timerEl.style.display = 'block';
  } else if (goldenActive) {
    const remaining = Math.ceil((save.click.goldenUntil - now()) / 1000);
    timerEl.textContent = `${remaining}s`;
    timerEl.style.display = 'block';
  } else {
    timerEl.style.display = 'none';
  }
  
  // Прогресс-бар перегрева (показывает скорость кликов, а не heat)
  let heatBar = clickBtn.querySelector('.heat-bar');
  if (!heatBar) {
    heatBar = document.createElement('div');
    heatBar.className = 'heat-bar';
    clickBtn.appendChild(heatBar);
  }
  
  // Вычисляем процент для отображения (максимум 21+ кликов/сек = 100%)
  const maxSpeed = 21;
  const speedPercent = Math.min(100, (clickSpeed / maxSpeed) * 100);
  
  // Плавное изменение ширины с помощью transition (уже есть в CSS)
  heatBar.style.width = `${speedPercent}%`;
  
  // Изменяем цвет в зависимости от скорости кликов (с плавными переходами)
  const targetColor = getHeatBarColor(clickSpeed);
  heatBar.style.backgroundColor = targetColor;
  
  // Если скорость 21+ и идет накопление перегрева, показываем heat как дополнительный индикатор
  if (clickSpeed >= 21 && heat > 0) {
    const heatPercent = Math.min(100, heat);
    // Плавное изменение прозрачности при накоплении перегрева
    heatBar.style.opacity = heatPercent >= 100 ? '1' : (0.6 + (heatPercent / 250));
  } else {
    heatBar.style.opacity = '1';
  }

  // Обновляем информацию в формате building-info (как у зданий)
  const clickInfoContainer = document.querySelector('.click-area .building-info');
  if (clickInfoContainer) {
    const metaElements = Array.from(clickInfoContainer.querySelectorAll('.building-meta'));
    
    // Элемент 0: Level - обновляем также HTML элементы для совместимости
    if (metaElements[0]) {
      const newLevelText = `<strong>Level:</strong> ${save.click.level} / ${save.click.max}`;
      if (metaElements[0].innerHTML !== newLevelText) {
        metaElements[0].innerHTML = newLevelText;
      }
    }
    // Также обновляем отдельные HTML элементы если они существуют
    if (clickLevelEl) clickLevelEl.textContent = save.click.level;
    if (clickMaxEl) clickMaxEl.textContent = save.click.max;
    
    // Элемент 1: Income/click - показываем реальный доход с модификаторами
    if (metaElements[1]) {
      // Если уровень 0, показываем 0.0000, в скобках прирост при прокачке
      if (save.click.level < 1) {
        const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
        const baseIncomeNextLevel = clickIncomeAt(1, save.click.upgradeBonus);
        const tNow = now();
        const goldenActive = save.click.goldenUntil > tNow;
        const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
        const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
        const achievementMult = getAchievementBonus();
        const streakMult = save.streak ? save.streak.multiplier : 1.0;
        const act = save.treasury?.actions;
        const noGoldenMult = (act && act.noGoldenUntil > tNow) ? 0.17 : 1.0;
        const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
        const elfArcherMult = save.modifiers.elfArcherUntil > tNow ? save.modifiers.elfArcherMult : 1.0;
        const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
        const madnessMult = (act && act.clickMadnessUntil > tNow) ? 99.9999 : 1.0;
        const realPPCNextLevel = baseIncomeNextLevel * madnessMult * goldenMult * spiderMult * achievementMult * streakMult * noGoldenMult * angryBarmatunIncomeReduction * elfArcherMult * kingDebuffMult;
        const incomeIncrease = realPPCNextLevel * Math.min(bulk, save.click.max);
        const newIncomeText = `<strong>Income/click:</strong> 0.0000 <span style="color: var(--muted);">(+${fmt(incomeIncrease)})</span>`;
      if (metaElements[1].innerHTML !== newIncomeText) {
        metaElements[1].innerHTML = newIncomeText;
      }
        if (clickIncomeEl) {
          clickIncomeEl.innerHTML = `0.0000 <span style="color: var(--muted); font-size: 0.9em;">(+${fmt(incomeIncrease)})</span>`;
        }
      } else {
        const realPPC = totalPPC();
        // Вычисляем базовый PPC без бонуса перелива для корректного расчета прироста
        // Бонус перелива не зависит от уровня клика, поэтому его нужно исключить при расчете прироста
        let basePPCWithoutTransfer = realPPC;
        if (save.modifiers.incomeTransferLevel > 0) {
          const tNow = now();
          let basePPS = 0;
          for (const b of save.buildings) {
            if (tNow < b.blockedUntil) continue;
            if (b.level < 1) continue;
            basePPS += buildingIncomeAt(b, b.level, b.upgradeBonus);
          }
          if (save.uber.unlocked) {
            basePPS += uberIncomeAt(save.uber.level);
          }
          const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
          const achievementMult = getAchievementBonus();
          const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
          const act = save.treasury?.actions;
          const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
          const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
          const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
          // ВАЖНО: clickDebuffMult НЕ применяется к переливу, так как дебаф влияет только на пассивный доход зданий
          const basePPSWithMods = basePPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
          const transferPercent = Math.min(100, save.modifiers.incomeTransferLevel);
          const transferedIncome = basePPSWithMods * (transferPercent / 100);
          const incomeTransferBonus = transferedIncome * 0.05;
          basePPCWithoutTransfer = realPPC - incomeTransferBonus;
        }
        
        // Calculate income increase for next level or upgrade
        const seg = segmentIndex(save.click.level);
        const within = withinSegment(save.click.level);
        const prevSegBought = seg === 0 ? true : !!save.click.segUpgrades[seg-1];
        const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
        
        let incomeIncrease = 0;
        if (needUpgrade) {
        // Calculate income after upgrade (+3%)
        const baseIncomeAfterUpgrade = clickIncomeAt(save.click.level, save.click.upgradeBonus + 1);
        const tNow = now();
        const goldenActive = save.click.goldenUntil > tNow;
        const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
        const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
        const achievementMult = getAchievementBonus();
        const streakMult = save.streak ? save.streak.multiplier : 1.0;
        const act = save.treasury?.actions;
        const noGoldenMult = (act && act.noGoldenUntil > tNow) ? 0.17 : 1.0;
        const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
        const elfArcherMult = save.modifiers.elfArcherUntil > tNow ? save.modifiers.elfArcherMult : 1.0;
        const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
        const madnessMult = (act && act.clickMadnessUntil > tNow) ? 99.9999 : 1.0;
        const realPPCAfterUpgrade = baseIncomeAfterUpgrade * madnessMult * goldenMult * spiderMult * achievementMult * streakMult * noGoldenMult * angryBarmatunIncomeReduction * elfArcherMult * kingDebuffMult;
        incomeIncrease = realPPCAfterUpgrade - basePPCWithoutTransfer;
      } else {
        // Calculate income increase for next level (considering bulk)
        const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
        const baseIncomeNextLevel = clickIncomeAt(save.click.level + 1, save.click.upgradeBonus);
        const tNow = now();
        const goldenActive = save.click.goldenUntil > tNow;
        const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
        const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
        const achievementMult = getAchievementBonus();
        const streakMult = save.streak ? save.streak.multiplier : 1.0;
        const act = save.treasury?.actions;
        const noGoldenMult = (act && act.noGoldenUntil > tNow) ? 0.17 : 1.0;
        const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
        const elfArcherMult = save.modifiers.elfArcherUntil > tNow ? save.modifiers.elfArcherMult : 1.0;
        const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
        const madnessMult = (act && act.clickMadnessUntil > tNow) ? 99.9999 : 1.0;
        const realPPCNextLevel = baseIncomeNextLevel * madnessMult * goldenMult * spiderMult * achievementMult * streakMult * noGoldenMult * angryBarmatunIncomeReduction * elfArcherMult * kingDebuffMult;
          const incomeIncreasePerLevel = realPPCNextLevel - basePPCWithoutTransfer;
          incomeIncrease = incomeIncreasePerLevel * bulk;
        }
        
        const newIncomeText = `<strong>Income/click:</strong> ${fmt(realPPC)} <span style="color: var(--muted);">(+${fmt(incomeIncrease)})</span>`;
        if (metaElements[1].innerHTML !== newIncomeText) {
          metaElements[1].innerHTML = newIncomeText;
        }
        // Также обновляем отдельный HTML элемент если он существует
        if (clickIncomeEl) {
          clickIncomeEl.innerHTML = `${fmt(realPPC)} <span style="color: var(--muted); font-size: 0.9em;">(+${fmt(incomeIncrease)})</span>`;
        }
      }
    }
  }
  
  const bulk = save.bulk;
  const { totalCost, totalLevels } = computeBulkCostForClick(bulk);

  // Hide buttons if level >= 1000 and not in Uber Mode yet
  const isInUberMode = save.uber && save.uber.max !== 19;
  const shouldHideButtons = save.click.level >= 1000 && !isInUberMode;

  if (shouldHideButtons) {
    // Hide both buy and upgrade buttons when level >= 1000 and not in Uber Mode
    clickBuyBtn.classList.add('hidden');
    clickBuyBtn.setAttribute('aria-hidden', 'true');
    clickSegBtn.classList.add('hidden');
    clickSegBtn.setAttribute('aria-hidden', 'true');
    if (clickSegInfo) clickSegInfo.textContent = 'Reach Uber Mode to continue';
  } else {
    // Segment upgrade visibility for Click
    const seg = segmentIndex(save.click.level);
    const within = withinSegment(save.click.level);
    const prevSegBought = seg === 0 ? true : !!save.click.segUpgrades[seg-1];
    const needUpgrade = within === 0 && seg > 0 && !prevSegBought;

    if (needUpgrade) {
      // Показываем апгрейд вместо покупки
      const prevCostSum = save.click.pendingSegmentCost[seg-1] || 0;
      const upgradeCost = prevCostSum * 0.77;
      // Обновляем Next Cost в формате building-meta (Income остается на месте)
      const clickInfoContainer = document.querySelector('.click-area .building-info');
      if (clickInfoContainer) {
        const metaElements = Array.from(clickInfoContainer.querySelectorAll('.building-meta'));
        // Элемент 1: Income/click - показываем реальный доход с модификаторами
        if (metaElements[1]) {
          const realPPC = totalPPC();
          // Вычисляем базовый PPC без бонуса перелива для корректного расчета прироста
          let basePPCWithoutTransfer = realPPC;
          if (save.modifiers.incomeTransferLevel > 0) {
            const tNow = now();
            let basePPS = 0;
            for (const b of save.buildings) {
              if (tNow < b.blockedUntil) continue;
              if (b.level < 1) continue;
              basePPS += buildingIncomeAt(b, b.level, b.upgradeBonus);
            }
            if (save.uber.unlocked) {
              basePPS += uberIncomeAt(save.uber.level);
            }
            const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
            const achievementMult = getAchievementBonus();
            const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
            const act = save.treasury?.actions;
            const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
            const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
            const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
            // ВАЖНО: clickDebuffMult НЕ применяется к переливу, так как дебаф влияет только на пассивный доход зданий
            const basePPSWithMods = basePPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
            const transferPercent = Math.min(100, save.modifiers.incomeTransferLevel);
            const transferedIncome = basePPSWithMods * (transferPercent / 100);
            const incomeTransferBonus = transferedIncome * 0.05;
            basePPCWithoutTransfer = realPPC - incomeTransferBonus;
          }
          // Calculate income after upgrade (+3%)
          const baseIncomeAfterUpgrade = clickIncomeAt(save.click.level, save.click.upgradeBonus + 1);
          const tNow = now();
          const goldenActive = save.click.goldenUntil > tNow;
          const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
          const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
          const achievementMult = getAchievementBonus();
          const streakMult = save.streak ? save.streak.multiplier : 1.0;
          const act = save.treasury?.actions;
          const noGoldenMult = (act && act.noGoldenUntil > tNow) ? 0.17 : 1.0;
          const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
          const elfArcherMult = save.modifiers.elfArcherUntil > tNow ? save.modifiers.elfArcherMult : 1.0;
          const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
          const madnessMult = (act && act.clickMadnessUntil > tNow) ? 99.9999 : 1.0;
          const realPPCAfterUpgrade = baseIncomeAfterUpgrade * madnessMult * goldenMult * spiderMult * achievementMult * streakMult * noGoldenMult * angryBarmatunIncomeReduction * elfArcherMult * kingDebuffMult;
          const incomeIncrease = realPPCAfterUpgrade - basePPCWithoutTransfer;
          const incomeText = `<strong>Income/click:</strong> ${fmt(realPPC)} <span style="color: var(--muted);">(+${fmt(incomeIncrease)})</span>`;
          if (metaElements[1].innerHTML !== incomeText) {
            metaElements[1].innerHTML = incomeText;
          }
          // Также обновляем отдельный HTML элемент если он существует
          if (clickIncomeEl) {
            clickIncomeEl.innerHTML = `${fmt(realPPC)} <span style="color: var(--muted); font-size: 0.9em;">(+${fmt(incomeIncrease)})</span>`;
          }
        }
        // Элемент 2: Next Cost - обновляем стоимость апгрейда
        if (metaElements[2]) {
          metaElements[2].innerHTML = `<strong>Next Cost:</strong> ${fmt(upgradeCost)} (UP)`;
          // Также обновляем отдельный HTML элемент если он существует
          if (clickCostEl) clickCostEl.textContent = fmt(upgradeCost);
        }
        
        // Элемент 3 или создаем новый: Income Transfer - отображение перелива дохода
        // Обновляем перелив перед отображением
        updateIncomeTransfer();
        
        let transferElement = metaElements[3];
        const hasTransfer = save.modifiers && save.modifiers.incomeTransferLevel > 0;
        
        if (hasTransfer) {
          if (!transferElement) {
            // Создаем новый элемент если его нет
            transferElement = document.createElement('div');
            transferElement.className = 'building-meta';
            clickInfoContainer.appendChild(transferElement);
          }
          
          // Вычисляем текущие значения для отображения
          const transferPercent = Math.min(100, save.modifiers.incomeTransferLevel);
          
          // Вычисляем базовый доход для расчета перелитого дохода
          let basePPS = 0;
          const tNow = now();
          for (const b of save.buildings) {
            if (tNow < b.blockedUntil) continue;
            if (b.level < 1) continue;
            basePPS += buildingIncomeAt(b, b.level, b.upgradeBonus);
          }
          if (save.uber.unlocked) {
            basePPS += uberIncomeAt(save.uber.level);
          }
          
          // Применяем модификаторы (кроме перелива)
          const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
          const achievementMult = getAchievementBonus();
          const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
          const act = save.treasury?.actions;
          const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
          const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
          const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
          const clickDebuffMult = save.modifiers.clickDebuffLevel > 0 ? Math.max(0, 1 - (Math.min(100, save.modifiers.clickDebuffLevel) / 100)) : 1.0;
          const basePPSWithMods = basePPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
          
          const transferedIncome = basePPSWithMods * (transferPercent / 100);
          const clickBonus = transferedIncome * 0.05;
          
          // Отображаем процент с округлением до 4 знаков после запятой, бонус с буквенными сокращениями
          const transferPercentDisplay = transferPercent.toFixed(4);
          const clickBonusDisplay = fmt(clickBonus);
          
          transferElement.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px 14px;
              background: linear-gradient(135deg, rgba(74, 158, 255, 0.18), rgba(74, 158, 255, 0.08));
              border: 1px solid rgba(74, 158, 255, 0.5);
              border-radius: 8px;
              box-shadow: 0 0 12px rgba(74, 158, 255, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.15);
              margin-top: 4px;
            ">
              <span style="color: #4a9eff; font-weight: 600; font-size: 1.1em; text-shadow: 0 0 8px rgba(74, 158, 255, 0.6);">⚡</span>
              <span style="color: #4a9eff; font-weight: 600; text-shadow: 0 0 6px rgba(74, 158, 255, 0.4);">-${transferPercentDisplay}%</span>
              <span style="color: var(--muted); font-size: 0.95em;">buildings</span>
              <span style="color: var(--muted); font-size: 1.2em;">→</span>
              <span style="color: #ffd700; font-weight: 700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.4);">+${clickBonusDisplay}</span>
              <span style="color: var(--muted); font-size: 0.9em;">per click</span>
            </div>
          `;
          transferElement.style.display = '';
        } else {
          // Скрываем элемент если перелив не активен
          if (transferElement) {
            transferElement.style.display = 'none';
          }
        }
      }
      if (clickSegInfo) clickSegInfo.textContent = 'Segment UP required to progress';
      clickBuyBtn.classList.add('hidden');
      clickBuyBtn.setAttribute('aria-hidden', 'true');

      clickSegBtn.classList.remove('hidden');
      clickSegBtn.removeAttribute('aria-hidden');
      clickSegBtn.innerHTML = `UP<br>(${fmt(upgradeCost)})`;
      clickSegBtn.disabled = save.points < upgradeCost;
      // Убираем primary класс когда disabled, чтобы кнопка была серой (как у зданий)
      if (clickSegBtn.disabled) {
        clickSegBtn.classList.remove('primary');
      } else {
        clickSegBtn.classList.add('primary');
      }
    } else {
      // Показываем покупку, скрываем апгрейд
      // Обновляем Next Cost в формате building-meta (Income остается на месте)
      const clickInfoContainer = document.querySelector('.click-area .building-info');
      if (clickInfoContainer) {
        const metaElements = Array.from(clickInfoContainer.querySelectorAll('.building-meta'));
        // Элемент 1: Income/click - показываем реальный доход с модификаторами
        if (metaElements[1]) {
          const realPPC = totalPPC();
          // Вычисляем базовый PPC без бонуса перелива для корректного расчета прироста
          let basePPCWithoutTransfer = realPPC;
          if (save.modifiers.incomeTransferLevel > 0) {
            const tNow = now();
            let basePPS = 0;
            for (const b of save.buildings) {
              if (tNow < b.blockedUntil) continue;
              if (b.level < 1) continue;
              basePPS += buildingIncomeAt(b, b.level, b.upgradeBonus);
            }
            if (save.uber.unlocked) {
              basePPS += uberIncomeAt(save.uber.level);
            }
            const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
            const achievementMult = getAchievementBonus();
            const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
            const act = save.treasury?.actions;
            const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
            const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
            const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
            // ВАЖНО: clickDebuffMult НЕ применяется к переливу, так как дебаф влияет только на пассивный доход зданий
            const basePPSWithMods = basePPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
            const transferPercent = Math.min(100, save.modifiers.incomeTransferLevel);
            const transferedIncome = basePPSWithMods * (transferPercent / 100);
            const incomeTransferBonus = transferedIncome * 0.05;
            basePPCWithoutTransfer = realPPC - incomeTransferBonus;
          }
          // Calculate income increase for next level (considering bulk)
          const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
          const baseIncomeNextLevel = clickIncomeAt(save.click.level + 1, save.click.upgradeBonus);
          const tNow = now();
          const goldenActive = save.click.goldenUntil > tNow;
          const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
          const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
          const achievementMult = getAchievementBonus();
          const streakMult = save.streak ? save.streak.multiplier : 1.0;
          const act = save.treasury?.actions;
          const noGoldenMult = (act && act.noGoldenUntil > tNow) ? 0.17 : 1.0;
          const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
          const elfArcherMult = save.modifiers.elfArcherUntil > tNow ? save.modifiers.elfArcherMult : 1.0;
          const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
          const madnessMult = (act && act.clickMadnessUntil > tNow) ? 99.9999 : 1.0;
          const realPPCNextLevel = baseIncomeNextLevel * madnessMult * goldenMult * spiderMult * achievementMult * streakMult * noGoldenMult * angryBarmatunIncomeReduction * elfArcherMult * kingDebuffMult;
          const incomeIncreasePerLevel = realPPCNextLevel - basePPCWithoutTransfer;
          const incomeIncrease = incomeIncreasePerLevel * bulk;
          const incomeText = `<strong>Income/click:</strong> ${fmt(realPPC)} <span style="color: var(--muted);">(+${fmt(incomeIncrease)})</span>`;
          if (metaElements[1].innerHTML !== incomeText) {
            metaElements[1].innerHTML = incomeText;
          }
          // Также обновляем отдельный HTML элемент если он существует
          if (clickIncomeEl) {
            clickIncomeEl.innerHTML = `${fmt(realPPC)} <span style="color: var(--muted); font-size: 0.9em;">(+${fmt(incomeIncrease)})</span>`;
          }
        }
        // Элемент 2: Next Cost - обновляем стоимость покупки
        if (metaElements[2]) {
          metaElements[2].innerHTML = `<strong>Next Cost:</strong> ${fmt(totalCost)} (${save.bulk === 'max' ? 'max' : 'x'+save.bulk})`;
          // Также обновляем отдельный HTML элемент если он существует
          if (clickCostEl) clickCostEl.textContent = fmt(totalCost);
        }
        
        // Элемент 3 или создаем новый: Income Transfer - отображение перелива дохода
        // Обновляем перелив перед отображением
        updateIncomeTransfer();
        
        let transferElement = metaElements[3];
        const hasTransfer = save.modifiers && save.modifiers.incomeTransferLevel > 0;
        
        if (hasTransfer) {
          if (!transferElement) {
            // Создаем новый элемент если его нет
            transferElement = document.createElement('div');
            transferElement.className = 'building-meta';
            clickInfoContainer.appendChild(transferElement);
          }
          
          // Вычисляем текущие значения для отображения
          const transferPercent = Math.min(100, save.modifiers.incomeTransferLevel);
          
          // Вычисляем базовый доход для расчета перелитого дохода
          let basePPS = 0;
          const tNow = now();
          for (const b of save.buildings) {
            if (tNow < b.blockedUntil) continue;
            if (b.level < 1) continue;
            basePPS += buildingIncomeAt(b, b.level, b.upgradeBonus);
          }
          if (save.uber.unlocked) {
            basePPS += uberIncomeAt(save.uber.level);
          }
          
          // Применяем модификаторы (кроме перелива)
          const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
          const achievementMult = getAchievementBonus();
          const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
          const act = save.treasury?.actions;
          const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
          const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
          const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
          const clickDebuffMult = save.modifiers.clickDebuffLevel > 0 ? Math.max(0, 1 - (Math.min(100, save.modifiers.clickDebuffLevel) / 100)) : 1.0;
          const basePPSWithMods = basePPS * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
          
          const transferedIncome = basePPSWithMods * (transferPercent / 100);
          const clickBonus = transferedIncome * 0.05;
          
          // Отображаем процент с округлением до 4 знаков после запятой, бонус с буквенными сокращениями
          const transferPercentDisplay = transferPercent.toFixed(4);
          const clickBonusDisplay = fmt(clickBonus);
          
          transferElement.innerHTML = `
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px 14px;
              background: linear-gradient(135deg, rgba(74, 158, 255, 0.18), rgba(74, 158, 255, 0.08));
              border: 1px solid rgba(74, 158, 255, 0.5);
              border-radius: 8px;
              box-shadow: 0 0 12px rgba(74, 158, 255, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.15);
              margin-top: 4px;
            ">
              <span style="color: #4a9eff; font-weight: 600; font-size: 1.1em; text-shadow: 0 0 8px rgba(74, 158, 255, 0.6);">⚡</span>
              <span style="color: #4a9eff; font-weight: 600; text-shadow: 0 0 6px rgba(74, 158, 255, 0.4);">-${transferPercentDisplay}%</span>
              <span style="color: var(--muted); font-size: 0.95em;">buildings</span>
              <span style="color: var(--muted); font-size: 1.2em;">→</span>
              <span style="color: #ffd700; font-weight: 700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.4);">+${clickBonusDisplay}</span>
              <span style="color: var(--muted); font-size: 0.9em;">per click</span>
            </div>
          `;
          transferElement.style.display = '';
        } else {
          // Скрываем элемент если перелив не активен
          if (transferElement) {
            transferElement.style.display = 'none';
          }
        }
      }
      clickSegBtn.classList.add('hidden');
      clickSegBtn.setAttribute('aria-hidden', 'true');
      clickSegBtn.classList.remove('primary');

      clickBuyBtn.classList.remove('hidden');
      clickBuyBtn.removeAttribute('aria-hidden');
      clickBuyBtn.disabled = (totalLevels === 0) || (save.points < totalCost);
      if (clickSegInfo) clickSegInfo.textContent = 'Buy 10 levels to unlock';
    }
  }
}


function computeBulkCostForClick(bulk) {
  // Используем универсальную функцию
  return computeBulkCostForBlock('click', bulk);
}

// Building sort state
// 0 = default (original order), 1 = level desc, 2 = level asc, 3 = income desc, 4 = income asc
let buildingSortMode = 0;
let sortButtonInitialized = false;
const SORT_MODES = [
  { name: 'Default', sortFn: null },
  { name: 'Level ↓', sortFn: (a, b) => b.level - a.level },
  { name: 'Level ↑', sortFn: (a, b) => a.level - b.level },
  { name: 'Income ↓', sortFn: (a, b) => {
    const incomeA = buildingIncomeAt(a, a.level, a.upgradeBonus);
    const incomeB = buildingIncomeAt(b, b.level, b.upgradeBonus);
    return incomeB - incomeA;
  }},
  { name: 'Income ↑', sortFn: (a, b) => {
    const incomeA = buildingIncomeAt(a, a.level, a.upgradeBonus);
    const incomeB = buildingIncomeAt(b, b.level, b.upgradeBonus);
    return incomeA - incomeB;
  }}
];

function getSortedBuildings() {
  if (!save || !save.buildings) return [];
  
  // Create array with original indices
  const buildingsWithIndex = save.buildings.map((b, i) => ({ building: b, originalIndex: i }));
  
  // Apply sorting if needed
  if (buildingSortMode > 0 && SORT_MODES[buildingSortMode].sortFn) {
    buildingsWithIndex.sort((a, b) => SORT_MODES[buildingSortMode].sortFn(a.building, b.building));
  }
  
  return buildingsWithIndex;
}

// Кэш для отслеживания состояния зданий (для оптимизации рендеринга)
let _lastBuildingsState = null;

// Виртуальный скроллинг - отслеживание видимых зданий
let _buildingsObserver = null;
let _visibleBuildings = new Set(); // Индексы видимых зданий
const BUILDING_CARD_ESTIMATED_HEIGHT = 150; // Примерная высота карточки здания
let _lastSortMode = -1;

function renderBuildings() {
  if (!buildingsList) return;
  
  const sortedBuildings = getSortedBuildings();
  if (!sortedBuildings || sortedBuildings.length === 0) {
    buildingsList.innerHTML = '';
    return;
  }
  
  // Проверяем, нужно ли пересоздавать карточки
  // Пересоздаем если: изменился режим сортировки, изменилось количество зданий, или это первый рендер
  const currentState = sortedBuildings.map(({ building: b, originalIndex }) => ({
    index: originalIndex,
    level: b.level,
    blockedUntil: b.blockedUntil || 0,
    sortMode: buildingSortMode
  })).join('|');
  
  const needsFullRender = !_lastBuildingsState || 
                          _lastBuildingsState !== currentState ||
                          _lastSortMode !== buildingSortMode;
  
  if (!needsFullRender) {
    // Если структура не изменилась, обновляем только данные через updateBuildingLevels
    // Это уже делается в tick(), так что просто выходим
    return;
  }
  
  // Сохраняем новое состояние
  _lastBuildingsState = currentState;
  _lastSortMode = buildingSortMode;
  
  // Полная перерисовка нужна - используем DocumentFragment для оптимизации
  const fragment = document.createDocumentFragment();
  
  sortedBuildings.forEach(({ building: b, originalIndex }) => {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.dataset.buildingIndex = originalIndex;

    // Верх: иконка слева, действие справа
    const header = document.createElement('div');
    header.className = 'building-card-header';

    // Используем изображение для здания
    const pixel = document.createElement('img');
    pixel.className = 'building-pixel';
    const imageName = getBuildingImage(originalIndex);
    pixel.src = `icons/${imageName}.png`;
    pixel.style.width = '64px';
    pixel.style.height = '64px';
    pixel.style.imageRendering = 'pixelated';
    pixel.style.imageRendering = '-moz-crisp-edges';
    pixel.style.imageRendering = 'crisp-edges';
    pixel.style.display = 'block';

    // Контейнер действий (одна зона, кнопки сменяются)
    const actionSlot = document.createElement('div');
    actionSlot.className = 'building-action-slot';

    // Buy button
    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn primary small';
    buyBtn.textContent = 'Buy levels';

    // Segment upgrade button
    const segBtn = document.createElement('button');
    segBtn.className = 'btn small seg-upgrade-btn';

    const info = document.createElement('div');
    info.className = 'building-info';
    const nameEl = document.createElement('div');
    nameEl.className = 'building-name';
    nameEl.textContent = b.name;
    const lvlEl = document.createElement('div');
    lvlEl.innerHTML = `<strong>Level:</strong> <strong>${b.level}</strong> <strong>/</strong> <strong>${b.max}</strong>`;
    const incEl = document.createElement('div');
    // Calculate base income
    const baseIncome = buildingIncomeAt(b, b.level, b.upgradeBonus);
    // Apply all modifiers to get real income
    const tNow = now();
    const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
    const achievementMult = getAchievementBonus();
    const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
    const act = save.treasury?.actions;
    const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
    const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
    const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
    const realIncome = baseIncome * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
    
    // Calculate income increase for next level (considering bulk)
    const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
    const nextLevelBaseIncome = buildingIncomeAt(b, b.level + 1, b.upgradeBonus);
    const nextLevelRealIncome = nextLevelBaseIncome * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
    const incomeIncreasePerLevel = nextLevelRealIncome - realIncome;
    const incomeIncrease = incomeIncreasePerLevel * bulk;
    incEl.innerHTML = `<strong>Income/sec:</strong> <strong>${fmt(realIncome)}</strong> <span style="color: var(--muted);"><strong>(+</strong><strong>${fmt(incomeIncrease)}</strong><strong>)</strong></span>`;
    const nextCost = computeBulkCostForBuilding(originalIndex, save.bulk);
    const seg = segmentIndex(b.level);
    const within = withinSegment(b.level);
    const prevSegBought = seg === 0 ? true : !!b.segUpgrades[seg-1];
    const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
    
    const costEl = document.createElement('div');
    if (needUpgrade) {
      // Показываем цену апгрейда в строке стоимости (как у клика)
      let upgradeCost = (b.pendingSegmentCost[seg-1] || 0) * 0.77;
            // Buff 6: Master Builder - upgrades cost 7x more
            const act = save.treasury?.actions;
            const noBreakActive = act && act.noBreakUntil > now();
            if (noBreakActive) {
              upgradeCost *= 7;
            }
      costEl.innerHTML = `<strong>Next Cost:</strong> <strong>${fmt(upgradeCost)}</strong>`;
    } else {
      // Показываем обычную стоимость покупки
      costEl.innerHTML = `<strong>Next Cost:</strong> <strong>${fmt(nextCost.totalCost)}</strong> <strong>(${save.bulk === 'max' ? 'max' : 'x'+save.bulk})</strong>`;
    }
    
    info.appendChild(nameEl);
    info.appendChild(lvlEl);
    info.appendChild(incEl);
    info.appendChild(costEl);

    // Hide buttons if level >= 1000 and not in Uber Mode yet
    const isInUberMode = save.uber && save.uber.max !== 19;
    const shouldHideButtons = b.level >= 1000 && !isInUberMode;

    if (shouldHideButtons) {
      // Hide both buy and upgrade buttons when level >= 1000 and not in Uber Mode
      buyBtn.classList.add('hidden');
      buyBtn.setAttribute('aria-hidden', 'true');
      segBtn.classList.add('hidden');
      segBtn.setAttribute('aria-hidden', 'true');
    } else if (needUpgrade) {
      // Требуется сегментный апгрейд — показываем только segBtn (как у клика)
      let prevCost = (b.pendingSegmentCost[seg-1] || 0) / 2;
      // Buff 6: Master Builder - upgrades cost 7x more
      const act = save.treasury?.actions;
      const noBreakActive = act && act.noBreakUntil > now();
      if (noBreakActive) {
        prevCost *= 2;
      }
      segBtn.innerHTML = `UP<br>(${fmt(prevCost)})`;
      segBtn.disabled = save.points < prevCost;
      
      // Удаляем старый обработчик если есть
      const oldUpgradeHandler = segBtn._upgradeHandler;
      if (oldUpgradeHandler) {
        segBtn.removeEventListener('click', oldUpgradeHandler);
      }
      
      const upgradeHandler = () => buyBuildingSegUpgrade(originalIndex, seg-1);
      segBtn.addEventListener('click', upgradeHandler);
      segBtn._upgradeHandler = upgradeHandler;

      // Скрываем buyBtn, показываем segBtn с классом primary
      buyBtn.classList.add('hidden');
      buyBtn.setAttribute('aria-hidden', 'true');
      segBtn.classList.remove('hidden');
      segBtn.classList.add('primary'); // Делаем кнопку primary, как у клика
      segBtn.setAttribute('aria-hidden', 'false');
      
      // Подсвечиваем карточку здания при наличии апгрейда
      card.classList.add('has-upgrade');
    } else {
      // Обычное состояние — показываем покупку, скрываем segBtn
      buyBtn.disabled = now() < b.blockedUntil || !canBuyNextBuilding(originalIndex) || (save.points < nextCost.totalCost);
      
      // Удаляем старый обработчик если есть
      const oldBuyHandler = buyBtn._buyHandler;
      if (oldBuyHandler) {
        buyBtn.removeEventListener('click', oldBuyHandler);
      }
      
      const buyHandler = () => buyBuildingLevels(originalIndex);
      buyBtn.addEventListener('click', buyHandler);
      buyBtn._buyHandler = buyHandler;

      // Скрываем segBtn, показываем buyBtn
      segBtn.classList.add('hidden');
      segBtn.classList.remove('primary'); // Убираем primary, когда апгрейд не нужен
      segBtn.setAttribute('aria-hidden', 'true');
      buyBtn.classList.remove('hidden');
      buyBtn.setAttribute('aria-hidden', 'false');
      
      // Убираем подсветку, если апгрейд не нужен
      card.classList.remove('has-upgrade');
    }

    actionSlot.appendChild(buyBtn);
    actionSlot.appendChild(segBtn);

    header.appendChild(pixel);
    header.appendChild(actionSlot);

    card.appendChild(header);
    card.appendChild(info);

    // Тонкая черта
    const divider = document.createElement('div');
    divider.className = 'building-card-divider';
    card.appendChild(divider);

    // Создаем note элемент только если нужно показать сообщение
    const note = document.createElement('div');
    note.className = 'building-note';
    let hasNote = false;
    
    if (shouldHideButtons) {
      note.textContent = 'Reach Uber Mode to continue';
      hasNote = true;
    } else if (!canBuyNextBuilding(originalIndex)) {
      note.textContent = 'Locked: previous building must reach level 67.';
      hasNote = true;
    } else if (now() < b.blockedUntil) {
      // Здание заблокировано - показываем время ремонта
      note.classList.add('building-downnote');
      note.dataset.blockedUntil = String(b.blockedUntil);
      const remain = Math.ceil((b.blockedUntil - now()) / 1000);
      note.textContent = `Under repair: ${remain}s`;
      hasNote = true;
    }
    
    if (hasNote) {
      card.appendChild(note);
    }

    fragment.appendChild(card);
  });
  
  // Добавляем все карточки одним операцией (оптимизация DOM)
  buildingsList.innerHTML = '';
  buildingsList.appendChild(fragment);
  
  // После добавления в DOM, проверяем видимость и скрываем невидимые, затем подключаем observer
  if (_buildingsObserver) {
    requestAnimationFrame(() => {
      const cards = buildingsList.querySelectorAll('.building-card');
      const containerRect = buildingsList.getBoundingClientRect();
      
      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const isVisible = cardRect.bottom >= containerRect.top - 300 && 
                         cardRect.top <= containerRect.bottom + 300;
        
        if (!isVisible) {
          card.style.display = 'none';
        } else {
          const buildingIndex = parseInt(card.dataset.buildingIndex);
          if (!isNaN(buildingIndex)) {
            _visibleBuildings.add(buildingIndex);
          }
        }
        // Подключаем observer для всех карточек
        _buildingsObserver.observe(card);
      });
    });
  }
}

function triggerUpgradeEffect(targetEl, text = 'UP!') {
  if (!targetEl) return;
  targetEl.classList.add('upgrade-flash');
  setTimeout(() => targetEl.classList.remove('upgrade-flash'), 400);

  const rect = targetEl.getBoundingClientRect();
  const popup = document.createElement('div');
  popup.className = 'upgrade-popup';
  popup.textContent = text;
  popup.style.left = `${rect.left + rect.width / 2}px`;
  popup.style.top = `${rect.top + 12}px`;
  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.classList.add('active');
    setTimeout(() => popup.classList.add('fade-out'), 550);
    setTimeout(() => popup.remove(), 900);
  });
}

function triggerBuildingUpgradeEffect(index, text = 'UP!') {
  if (!buildingsList) return;
  const card = buildingsList.querySelector(`[data-building-index="${index}"]`);
  triggerUpgradeEffect(card, text);
}

// Приводим layout Uber-карточки к виду обычных зданий
function normalizeUberCardLayout() {
  if (!uberCard) return;
  const pixel = document.getElementById('uber-pixel');
  const info = uberCard.querySelector('.building-info');
  const actions = document.getElementById('uber-actions');
  if (!pixel || !info || !actions) return;

  actions.classList.add('building-action-slot');

  let header = uberCard.querySelector('.building-card-header');
  if (!header) {
    header = document.createElement('div');
    header.className = 'building-card-header';
  }
  // Очистим header и сложим нужные элементы
  header.innerHTML = '';
  header.appendChild(pixel);
  header.appendChild(actions);

  let divider = uberCard.querySelector('.building-card-divider');
  if (!divider) {
    divider = document.createElement('div');
    divider.className = 'building-card-divider';
  }

  let note = uberCard.querySelector('.building-note');
  if (!note) {
    note = document.createElement('div');
    note.className = 'building-note';
  }

  // Собираем карточку заново в нужном порядке
  uberCard.innerHTML = '';
  uberCard.appendChild(header);
  uberCard.appendChild(info);
  uberCard.appendChild(divider);
  uberCard.appendChild(note);
}


function computeBulkCostForBuilding(i, bulk) {
  // Используем универсальную функцию
  return computeBulkCostForBlock('building', bulk, i);
  const b = save.buildings[i];
  let needLevels = 0;
  if (bulk === 'max') {
    needLevels = b.max - b.level;
  } else {
    // Ensure bulk is a number
    needLevels = typeof bulk === 'number' ? bulk : parseInt(bulk, 10);
    if (isNaN(needLevels) || needLevels < 1) {
      needLevels = 1;
    }
  }
  let allowed = 0;
  for (let k = 0; k < needLevels; k++) {
    const lvl = b.level + k;
    if (!canProgressSegment(lvl, b.segUpgrades)) break;
    allowed++;
  }
  let totalCost = 0;
  for (let k = 0; k < allowed; k++) {
    totalCost += buildingLevelCostAt(b, b.level + k);
  }
  return { totalCost, totalLevels: allowed };
}

function renderUber() {
  if (!save) return;
  normalizeUberCardLayout();
  
  // Убеждаемся, что max = 19 до перехода в убер мод (не трогаем если уже в убер моде - 1881)
  // НЕ изменяем max если он уже установлен в 1881 (убер мод активен)
  if (save.uber.max !== 9999 && save.uber.max !== 19 && save.uber.max !== 1881) {
    save.uber.max = 19;
  }
  
  uberLevelEl.textContent = save.uber.level;
  uberMaxEl.textContent = save.uber.max;
  
  // Показываем реальный доход с модификаторами и прирост в скобках
  const baseIncome = uberIncomeAt(save.uber.level);
  const tNow = now();
  const spiderMult = save.modifiers.spiderUntil > tNow ? save.modifiers.spiderMult : 1.0;
  const achievementMult = getAchievementBonus();
  const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > tNow ? 11 : 1.0;
  const act = save.treasury?.actions;
  const passiveBoostMult = (act && act.passiveBoostUntil > tNow && act.passiveBoostLevel > 0) ? (1 + (act.passiveBoostLevel / 100)) : 1.0;
  const angryBarmatunIncomeReduction = save.modifiers.angryBarmatunIncomeReduction > tNow ? 0.5 : 1.0;
  const kingDebuffMult = save.modifiers.kingDebuffUntil > tNow ? (save.modifiers.kingDebuffMult || 0.23) : 1.0;
  const realIncome = baseIncome * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
  
  // Если уровень 0, показываем 0.0000, в скобках прирост при прокачке
  if (save.uber.level < 1) {
    const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
    const nextLevelBaseIncome = uberIncomeAt(1);
    const nextLevelRealIncome = nextLevelBaseIncome * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
    const incomeIncrease = nextLevelRealIncome * Math.min(bulk, save.uber.max);
    uberIncomeEl.innerHTML = `0.0000 <span style="color: var(--muted); font-size: 0.9em;">(+${fmt(incomeIncrease)})</span>`;
  } else {
    // Calculate income increase for next level (considering bulk)
    const bulk = save.bulk === 'max' ? 1 : (typeof save.bulk === 'number' ? save.bulk : parseInt(save.bulk, 10) || 1);
    const nextLevelBaseIncome = uberIncomeAt(save.uber.level + 1);
    const nextLevelRealIncome = nextLevelBaseIncome * spiderMult * achievementMult * taxMult * passiveBoostMult * angryBarmatunIncomeReduction * kingDebuffMult;
    const incomeIncreasePerLevel = nextLevelRealIncome - realIncome;
    const incomeIncrease = incomeIncreasePerLevel * Math.min(bulk, save.uber.max - save.uber.level);
    uberIncomeEl.innerHTML = `${fmt(realIncome)} <span style="color: var(--muted); font-size: 0.9em;">(+${fmt(incomeIncrease)})</span>`;
  }

  // Обновляем состояние блокировки карточки
  uberCard.classList.toggle('locked', !save.uber.unlocked);

  const note = uberCard.querySelector('.building-note');
  const lockNote = uberCard.querySelector('.uber-lock-note');
  
  // Если не разблокировано, показываем текст блокировки
  if (!save.uber.unlocked) {
    if (note) {
      note.textContent = 'Locked: reach level ≥ 800 on all buildings and the Click.';
    }
    if (lockNote) {
      lockNote.style.display = '';
    }
    if (uberBuyBtn) {
      uberBuyBtn.disabled = true;
    uberBuyBtn.classList.add('hidden');
    uberBuyBtn.setAttribute('aria-hidden', 'true');
    }
    // Показываем стоимость покупки даже если не разблокировано
    const bulk = save.bulk || 1;
    const bulkCost = computeBulkCostForBlock('uber', bulk);
    const bulkText = bulk === 1 ? '' : ` (x${bulk})`;
    uberCostEl.textContent = `${fmt(bulkCost.totalCost)}${bulkText}`;
    // Draw pixel citadel даже если не разблокировано
    drawCitadelPixel(document.getElementById('uber-pixel'));
    return; // Не показываем остальную информацию, если не разблокировано
  } else {
    // Если Убер здание открыто, убираем текст описания условия для открытия
    if (note) {
      note.textContent = '';
    }
    // Скрываем элемент с текстом блокировки из HTML
    if (lockNote) {
      lockNote.style.display = 'none';
    }
  }

  // Если достигнут максимальный уровень (19 до убер мода, 1881 в убер моде), скрываем кнопку покупки
  const maxLevel = save.uber.max === 9999 ? 9999 : (save.uber.max === 1881 ? 1881 : 19);
  if (save.uber.level >= maxLevel) {
    if (note) note.textContent = 'Max level reached.';
    if (uberBuyBtn) {
      uberBuyBtn.classList.add('hidden');
      uberBuyBtn.setAttribute('aria-hidden', 'true');
    }
    // Показываем стоимость (0, так как достигнут максимум)
    uberCostEl.textContent = '0.0000';
    // Обновляем состояние кнопок завершения игры и убер мода
    updateEndgameButtons();
  } else {
    if (note) note.textContent = '';
    // Показываем стоимость покупки с учетом bulk (используем общий save.bulk)
    const bulk = save.bulk || 1;
    const bulkCost = computeBulkCostForBlock('uber', bulk);
    const bulkText = bulk === 1 ? '' : ` (x${bulk})`;
    uberCostEl.textContent = `${fmt(bulkCost.totalCost)}${bulkText}`;
    
    if (uberBuyBtn) {
    uberBuyBtn.classList.remove('hidden');
    uberBuyBtn.removeAttribute('aria-hidden');
      // Кнопка активна только если разблокировано И достаточно поинтов
      uberBuyBtn.disabled = save.points < bulkCost.totalCost || bulkCost.totalLevels === 0;
      // Обновляем текст кнопки с учетом bulk
      if (bulk === 1) {
        uberBuyBtn.textContent = 'Buy levels';
      } else {
        uberBuyBtn.textContent = `Buy x${bulk}`;
      }
    }
    // Скрываем кнопки завершения игры, если уровень < 19
    updateEndgameButtons();
  }

  // Draw pixel citadel
  drawCitadelPixel(document.getElementById('uber-pixel'));
}


// Старая функция renderEffects удалена - используется оптимизированная версия ниже


// Рисует пиксельную иконку для достижения
function drawAchievementPixel(canvas, ach) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Размер пикселя для сетки 12x12
  const px = 4;
  const size = 48; // 12x12 пикселей по 4px
  
  // Палитра (средневековые тона)
  const unlockedColors = {
    bg: '#3b322b',
    primary: '#d4b24a',
    secondary: '#2a4b7a',
    accent: '#b8893d',
    dark: '#1f1b1a'
  };
  
  const lockedColors = {
    bg: '#2a1f1a',
    primary: '#4a4a4a',
    secondary: '#3a3a3a',
    accent: '#2a2a2a',
    dark: '#1a1a1a'
  };
  
  const isUnlocked = save && save.achievements && save.achievements.unlocked[ach.id];
  const colors = isUnlocked ? unlockedColors : lockedColors;
  
  // Фон
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, size, size);
  
  // Рисуем иконку в зависимости от типа достижения
  ctx.fillStyle = colors.primary;
  
  // Простые пиксельные паттерны для разных типов
  if (ach.type === 'clicks') {
    // Иконка клика - стрелка вверх
    ctx.fillRect(px * 5, px * 2, px * 2, px * 3);
    ctx.fillRect(px * 4, px * 5, px * 4, px * 2);
    ctx.fillRect(px * 3, px * 7, px * 6, px);
  } else if (ach.type === 'first_building' || ach.type === 'buildings_level') {
    // Иконка здания - простой домик
    ctx.fillRect(px * 4, px * 6, px * 4, px * 4);
    ctx.fillRect(px * 3, px * 4, px * 6, px * 2);
    ctx.fillRect(px * 5, px * 7, px * 2, px * 2);
  } else if (ach.type === 'uber_unlock' || ach.type === 'uber_level') {
    // Иконка замка - башни
    ctx.fillRect(px * 2, px * 4, px * 2, px * 6);
    ctx.fillRect(px * 5, px * 3, px * 2, px * 7);
    ctx.fillRect(px * 8, px * 4, px * 2, px * 6);
    ctx.fillRect(px * 3, px * 3, px * 6, px);
  } else if (ach.type === 'destructions') {
    // Иконка разрушения - крест/взрыв
    ctx.fillRect(px * 4, px * 2, px * 4, px);
    ctx.fillRect(px * 4, px * 9, px * 4, px);
    ctx.fillRect(px * 2, px * 4, px, px * 4);
    ctx.fillRect(px * 9, px * 4, px, px * 4);
    ctx.fillRect(px * 5, px * 5, px * 2, px * 2);
  } else if (ach.type === 'playtime') {
    // Иконка времени - часы
    ctx.fillRect(px * 3, px * 3, px * 6, px * 6);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(px * 4, px * 4, px * 4, px * 4);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(px * 5, px * 5, px * 2, px);
    ctx.fillRect(px * 6, px * 5, px, px * 2);
  } else {
    // Дефолтная иконка - звезда
    ctx.fillRect(px * 5, px * 2, px * 2, px);
    ctx.fillRect(px * 4, px * 3, px * 4, px);
    ctx.fillRect(px * 3, px * 4, px * 6, px);
    ctx.fillRect(px * 5, px * 5, px * 2, px * 4);
    ctx.fillRect(px * 3, px * 9, px * 6, px);
  }
  
  // Обводка
  ctx.strokeStyle = colors.dark;
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, size, size);
  
  // Если заблокировано, применяем grayscale эффект через CSS
  if (!isUnlocked) {
    canvas.style.filter = 'grayscale(100%)';
    canvas.style.opacity = '0.6';
  } else {
    canvas.style.filter = 'none';
    canvas.style.opacity = '1';
  }
}

function renderAchievements() {
  const container = document.getElementById('achievements-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Если save еще не загружен или achievements не инициализированы, показываем все как заблокированные
  const achievements = save && save.achievements ? save.achievements : null;
  
  // Разделяем достижения на полученные и неполученные
  const unlocked = [];
  const locked = [];
  
  ACHIEVEMENTS.forEach(ach => {
    const isUnlocked = achievements && achievements.unlocked[ach.id] || false;
    if (isUnlocked) {
      unlocked.push(ach);
    } else {
      locked.push(ach);
    }
  });
  
  // Обновляем счетчик открытых достижений
  const countElement = document.getElementById('achievements-count');
  if (countElement) {
    const unlockedCount = achievements ? Object.keys(achievements.unlocked || {}).length : 0;
    const totalCount = ACHIEVEMENTS.length;
    countElement.textContent = `${unlockedCount} / ${totalCount}`;
  }
  
  // Сортируем: сначала полученные, потом неполученные
  const sorted = [...unlocked, ...locked];
  
  sorted.forEach(ach => {
    const isUnlocked = achievements && achievements.unlocked[ach.id] || false;
    const item = document.createElement('div');
    item.className = 'achievement-item' + (isUnlocked ? ' unlocked' : ' locked');
    item.title = `${ach.name} (+${(ach.reward * 100).toFixed(0)}% income)`;
    
    // Используем canvas для пиксельной иконки
    const icon = document.createElement('canvas');
    icon.width = 48;
    icon.height = 48;
    icon.className = 'achievement-icon';
    drawAchievementPixel(icon, ach);
    
    const info = document.createElement('div');
    info.className = 'achievement-info';
    const name = document.createElement('div');
    name.className = 'achievement-name';
    name.textContent = ach.name;
    const reward = document.createElement('div');
    reward.className = 'achievement-reward';
    reward.textContent = `+${(ach.reward * 100).toFixed(0)}%`;
    
    info.appendChild(name);
    info.appendChild(reward);
    
    item.appendChild(icon);
    item.appendChild(info);
    container.appendChild(item);
  });
}

// ======= Season Functions =======
// Seasonal theme management
const SEASONAL_THEME_KEY = 'mpi_seasonal_theme';
let seasonalThemeEnabled = true; // По умолчанию включено

// Opacity management (объявлено здесь, так как используется в updateSeason)
const OPACITY_KEY = 'mpi_opacity';
let opacity = 0; // Default 0% (стартовая прозрачность из CSS)
let opacityChanged = false; // Флаг, что прозрачность была изменена пользователем

function loadSeasonalTheme() {
  const stored = localStorage.getItem(SEASONAL_THEME_KEY);
  if (stored !== null) {
    seasonalThemeEnabled = stored === 'true';
  }
  return seasonalThemeEnabled;
}

function saveSeasonalTheme() {
  localStorage.setItem(SEASONAL_THEME_KEY, String(seasonalThemeEnabled));
}

function updateSeason() {
  // Проверяем, включена ли сезонная тема
  if (!seasonalThemeEnabled) {
    // Если отключена, удаляем все сезонные классы
    document.body.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
    // Применяем прозрачность заново, так как сезон отключен
    if (opacityChanged) {
      applyOpacity();
    }
    return;
  }
  
  // Применяем сезон даже если save еще не загружен
  const month = new Date().getMonth(); // 0-11
  let season = null;
  
  // Декабрь, Январь, Февраль - зима
  if (month === 11 || month === 0 || month === 1) {
    season = 'winter';
  }
  // Март, Апрель, Май - весна
  else if (month >= 2 && month <= 4) {
    season = 'spring';
  }
  // Июнь, Июль, Август - лето
  else if (month >= 5 && month <= 7) {
    season = 'summer';
  }
  // Сентябрь, Октябрь, Ноябрь - осень
  else {
    season = 'autumn';
  }
  
  if (save) {
    save.season = season;
  }
  
  // Применяем сезонный класс к body
  document.body.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
  if (season) {
    document.body.classList.add(`season-${season}`);
  }
  
  // Применяем прозрачность заново, так как сезон изменился
  if (opacityChanged) {
    applyOpacity();
  }
}

// Функция для принудительного переключения сезонов (для дебага)
function cycleSeason() {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  
  // Получаем текущий сезон из body
  let currentSeason = null;
  for (const s of seasons) {
    if (document.body.classList.contains(`season-${s}`)) {
      currentSeason = s;
      break;
    }
  }
  
  // Если сезон не найден в body, проверяем save
  if (!currentSeason && save && save.season) {
    currentSeason = save.season;
    // Применяем сезон из save к body, если его там нет
    document.body.classList.add(`season-${currentSeason}`);
  }
  
  // Если сезон все еще не найден, определяем по текущей дате
  if (!currentSeason) {
    const month = new Date().getMonth();
    if (month === 11 || month === 0 || month === 1) {
      currentSeason = 'winter';
    } else if (month >= 2 && month <= 4) {
      currentSeason = 'spring';
    } else if (month >= 5 && month <= 7) {
      currentSeason = 'summer';
    } else {
      currentSeason = 'autumn';
    }
    // Применяем определенный сезон к body
    document.body.classList.add(`season-${currentSeason}`);
  }
  
  // Определяем следующий сезон
  const currentIndex = seasons.indexOf(currentSeason);
  if (currentIndex === -1) {
    console.error('Invalid season:', currentSeason);
    currentSeason = 'spring';
  }
  const nextIndex = (currentIndex + 1) % seasons.length;
  const nextSeason = seasons[nextIndex];
  
  // Применяем следующий сезон
  document.body.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
  document.body.classList.add(`season-${nextSeason}`);
  
  if (save) {
    save.season = nextSeason;
  }
  
  console.log('Season cycled:', { 
    currentSeason, 
    nextSeason, 
    bodyClasses: document.body.className,
    hasClass: document.body.classList.contains(`season-${nextSeason}`)
  });
  toast(`Season changed to: ${nextSeason.charAt(0).toUpperCase() + nextSeason.slice(1)}`, 'info');
}

// ======= Performance Optimizations =======

// Кэширование вычислений для оптимизации производительности
let _cachedPPS = null;
let _cachedPPC = null;
let _cachedPPSTime = 0;
let _cachedPPCTime = 0;
const CACHE_TTL = 200; // Кэш на 200мс для лучшей производительности

// Кэширование вычислений для оптимизации производительности

// Дебаунсинг для частых обновлений UI
let _debounceStatsTimeout = null;
let _debounceClickTimeout = null;
let _lastStatsUpdate = 0;
let _lastClickUpdate = 0;

function debouncedRenderTopStats() {
  const nowTs = now();
  // Обновляем не чаще чем раз в 300мс для лучшей производительности
  if (nowTs - _lastStatsUpdate < 300) {
    if (!_debounceStatsTimeout) {
      _debounceStatsTimeout = requestAnimationFrame(() => {
        renderTopStats();
        _lastStatsUpdate = now();
        _debounceStatsTimeout = null;
      });
    }
    return;
  }
  renderTopStats();
  _lastStatsUpdate = nowTs;
}

function debouncedRenderClick() {
  const nowTs = now();
  // Обновляем не чаще чем раз в 300мс для лучшей производительности
  if (nowTs - _lastClickUpdate < 300) {
    if (!_debounceClickTimeout) {
      _debounceClickTimeout = requestAnimationFrame(() => {
        renderClick();
        _lastClickUpdate = now();
        _debounceClickTimeout = null;
      });
    }
    return;
  }
  renderClick();
  _lastClickUpdate = nowTs;
}

// Оптимизация рендеринга - отложенный вызов для производительности
let _renderTimeout = null;
let _pendingRenderFlags = {
  click: false,
  buildings: false,
  treasury: false,
  uber: false,
  effects: false,
  achievements: false,
  topStats: false
};

function scheduleRender(flags = {}) {
  // Объединяем флаги с уже запланированными
  Object.keys(flags).forEach(key => {
    if (flags[key]) _pendingRenderFlags[key] = true;
  });
  
  if (_renderTimeout) return; // Уже запланирован
  _renderTimeout = requestAnimationFrame(() => {
    // Рендерим только то, что нужно
    if (_pendingRenderFlags.topStats) {
      renderTopStats();
      _pendingRenderFlags.topStats = false;
    }
    if (_pendingRenderFlags.click) {
      renderClick();
      _pendingRenderFlags.click = false;
    }
    if (_pendingRenderFlags.buildings) {
      renderBuildings();
      _pendingRenderFlags.buildings = false;
    }
    if (_pendingRenderFlags.treasury) {
      renderTreasuryActions();
      _pendingRenderFlags.treasury = false;
    }
    if (_pendingRenderFlags.uber) {
      checkUberUnlock();
      renderUber();
      _pendingRenderFlags.uber = false;
    }
    if (_pendingRenderFlags.effects) {
      renderEffects();
      _pendingRenderFlags.effects = false;
    }
    if (_pendingRenderFlags.achievements) {
      renderAchievements();
      _pendingRenderFlags.achievements = false;
    }
    
    updateBulkButtons();
    updateSeason();
    startAutosave();
    updateEndgameButtons();
    
    _renderTimeout = null;
  });
}

function renderAll() {
  renderTopStats();
  renderClick();
  renderTreasuryActions();
  renderBuildings();
  // Сначала проверяем разблокировку Uber здания, потом рендерим
  checkUberUnlock(); // Проверяем разблокировку Uber здания
  renderUber(); // Рендерим Uber здание (после проверки разблокировки)
  renderEffects();
  renderAchievements();
  updateBulkButtons(); // Обновляем активное состояние кнопок bulk (работают для всех)
  updateSeason(); // Обновляем сезонную тему
  startAutosave();
  
  // XP Bar
  if (typeof renderXPBar === 'function') {
    renderXPBar();
  }

  updateEndgameButtons();
}

// ======= Actions =======
function addPoints(n) {
  save.points += n;
  
  // Инвалидируем кэш PPS/PPC при изменении поинтов
  _cachedPPS = null;
  _cachedPPC = null;
  _cachedPoints = null; // Инвалидируем кэш отформатированных поинтов
  
  // Обновляем статистику
  if (save.achievements && save.achievements.stats) {
    save.achievements.stats.totalPointsEarned += n;
    const currentPPS = totalPPS();
    const currentPPC = totalPPC();
    if (currentPPS > save.achievements.stats.highestPPS) {
      save.achievements.stats.highestPPS = currentPPS;
    }
    if (currentPPC > save.achievements.stats.highestPPC) {
      save.achievements.stats.highestPPC = currentPPC;
    }
  }
  // Обновляем состояние кнопок после изменения поинтов
  updateButtonStates();
}

// Дебаунсинг для updateButtonStates
let _debounceButtonStatesTimeout = null;
let _lastButtonStatesUpdate = 0;

// Обновляет состояние disabled для всех кнопок покупки/апгрейда
// Вызывается автоматически при изменении поинтов и в игровом цикле
function updateButtonStates() {
  if (!save) return;
  
  const nowTs = now();
  // Обновляем не чаще чем раз в 300мс для лучшей производительности
  if (nowTs - _lastButtonStatesUpdate < 300) {
    if (!_debounceButtonStatesTimeout) {
      _debounceButtonStatesTimeout = requestAnimationFrame(() => {
        _updateButtonStatesInternal();
        _lastButtonStatesUpdate = now();
        _debounceButtonStatesTimeout = null;
      });
    }
    return;
  }
  
  _updateButtonStatesInternal();
  _lastButtonStatesUpdate = nowTs;
}

function _updateButtonStatesInternal() {
  if (!save) return;

  // Кэшируем now() для всех проверок - оптимизация производительности
  const tNow = now();

  // Check if buttons should be hidden (level >= 1000 and not in Uber Mode)
  const isInUberMode = save.uber && save.uber.max !== 19;
  const clickShouldHide = save.click.level >= 1000 && !isInUberMode;

  // Обновляем кнопки Click
  if (!clickShouldHide) {
    const seg = segmentIndex(save.click.level);
    const within = withinSegment(save.click.level);
    const prevSegBought = seg === 0 ? true : !!save.click.segUpgrades[seg-1];
    const needUpgrade = within === 0 && seg > 0 && !prevSegBought;

    if (needUpgrade) {
      const prevCostSum = save.click.pendingSegmentCost[seg-1] || 0;
      const upgradeCost = prevCostSum * 0.77;
      if (clickSegBtn && !clickSegBtn.classList.contains('hidden')) {
        clickSegBtn.disabled = save.points < upgradeCost;
        // Убираем primary класс когда disabled, чтобы кнопка была серой
        if (clickSegBtn.disabled) {
          clickSegBtn.classList.remove('primary');
        } else {
          clickSegBtn.classList.add('primary');
        }
      }
    } else {
      const { totalCost, totalLevels } = computeBulkCostForClick(save.bulk);
      if (clickBuyBtn && !clickBuyBtn.classList.contains('hidden')) {
        clickBuyBtn.disabled = (totalLevels === 0) || (save.points < totalCost);
      }
    }
  }

  // Обновляем кнопки зданий
  // Используем data-buildingIndex вместо индекса массива, так как здания могут быть отсортированы
  // Оптимизация: обновляем только видимые карточки
  const visibleCards = buildingsList?.querySelectorAll('.building-card');
  if (!visibleCards || visibleCards.length === 0) return;
  
  visibleCards.forEach((card) => {
    const buildingIndex = parseInt(card.dataset.buildingIndex);
    if (isNaN(buildingIndex) || buildingIndex >= save.buildings.length) return;
    
    const b = save.buildings[buildingIndex];
    const i = buildingIndex;

    // Ищем кнопки: buyBtn - всегда primary, segBtn - может быть primary или нет
    const actionSlot = card.querySelector('.building-action-slot');
    if (!actionSlot) return;
    const allBtns = actionSlot.querySelectorAll('.btn');
    // Ищем кнопки по тексту
    const buyBtn = Array.from(allBtns).find(btn => btn.textContent.includes('Buy'));
    const segBtn = Array.from(allBtns).find(btn => btn.textContent.includes('UP'));
    
    // Check if buttons should be hidden (level >= 1000 and not in Uber Mode)
    const buildingShouldHide = b.level >= 1000 && !isInUberMode;
    
    if (!buildingShouldHide) {
      const buildingSeg = segmentIndex(b.level);
      const buildingWithin = withinSegment(b.level);
      const buildingPrevSegBought = buildingSeg === 0 ? true : !!b.segUpgrades[buildingSeg-1];
      const buildingNeedUpgrade = buildingWithin === 0 && buildingSeg > 0 && !buildingPrevSegBought;

      if (buildingNeedUpgrade) {
        const prevCost = (b.pendingSegmentCost[buildingSeg-1] || 0) * 0.77;
        if (segBtn && !segBtn.classList.contains('hidden')) {
          segBtn.disabled = save.points < prevCost;
          // Делаем кнопку primary, как у клика
          if (!segBtn.classList.contains('primary')) {
            segBtn.classList.add('primary');
          }
        }
        // Подсвечиваем карточку здания при наличии апгрейда
        if (!card.classList.contains('has-upgrade')) {
          card.classList.add('has-upgrade');
        }
      } else {
        // Убираем подсветку, если апгрейд не нужен
        if (card.classList.contains('has-upgrade')) {
          card.classList.remove('has-upgrade');
        }
        // Убираем primary с кнопки апгрейда
        if (segBtn && segBtn.classList.contains('primary')) {
          segBtn.classList.remove('primary');
        }
        const nextCost = computeBulkCostForBuilding(i, save.bulk);
        if (buyBtn && !buyBtn.classList.contains('hidden')) {
          buyBtn.disabled = (tNow < b.blockedUntil) || !canBuyNextBuilding(i) || (save.points < nextCost.totalCost);
        }
      }
    }
  });

  // Обновляем кнопки Uber
  if (save.uber.unlocked && save.uber.level < save.uber.max) {
    const uberCost = uberCostAt(save.uber.level);
    if (uberBuyBtn && !uberBuyBtn.classList.contains('hidden')) {
      uberBuyBtn.disabled = save.points < uberCost;
    }
  }
}

function buyBulkLevels(entity, computeFn, applyFn, buildingIndex) {
  const { totalCost, totalLevels } = computeFn(save.bulk);
  if (totalLevels === 0) {
    const requestedBulk = save.bulk === 'max' ? 'max' : save.bulk;
    toast(`Cannot progress: segment upgrade required. (Requested: ${requestedBulk}, Available: 0)`, 'warn');
    return false;
  }
  // Warn if fewer levels available than requested
  if (save.bulk !== 'max' && typeof save.bulk === 'number' && totalLevels < save.bulk) {
    toast(`Only ${totalLevels} level(s) available (requested ${save.bulk}). Segment upgrade may be required.`, 'info');
  }
  if (save.points < totalCost) {
    toast('Not enough points.', 'warn');
    return false;
  }

  // Apply
  save.points -= totalCost;

  // Track segment cost sum
  // For buildings: apply one level at a time and stop if building breaks
  // Master Builder can make some levels free (refund points)
  if (entity === 'building') {
    let appliedLevels = 0;
    let freeLevelsCost = 0;
    const b = save.buildings[buildingIndex];
    let startLevel = b.level;
    
    for (let j = 0; j < totalLevels; j++) {
      const result = applyFn();
      if (result === false) {
        // Building broke, stop applying more levels
        break;
      }
      appliedLevels++;
      
      // Check if this level was free (Master Builder)
      // Result is the cost to refund if free, or true if paid
      if (typeof result === 'number') {
        freeLevelsCost += result;
      }
    }
    
    // Refund points for free levels (Master Builder)
    if (freeLevelsCost > 0) {
      save.points += freeLevelsCost;
    }
    
    // Refund unused points if we stopped early (building broke)
    if (appliedLevels < totalLevels) {
      // Recalculate cost for remaining levels and refund
      const remainingLevels = totalLevels - appliedLevels;
      const currentLevel = b.level;
      let remainingCost = 0;
      for (let k = 0; k < remainingLevels; k++) {
        remainingCost += buildingLevelCostAt(b, currentLevel + k);
      }
      save.points += remainingCost;
    }
  } else {
    // For click: apply all levels at once (no breaks)
    for (let j = 0; j < totalLevels; j++) applyFn();
  }

  // After buy, update critical elements immediately, defer heavy rendering
  // Сбрасываем кэш состояния зданий для принудительного обновления
  _lastBuildingsState = null;
  _lastSortMode = -1;
  // Инвалидируем кэш PPS/PPC при изменении уровней зданий
  _cachedPPS = null;
  _cachedPPC = null;
  
  // Критичные обновления сразу (синхронно) - для мгновенного отображения изменений
  renderTopStats();
  if (entity === 'click') {
    renderClick();
  } else if (entity === 'building') {
    // Для зданий обновляем описания и уровни сразу (синхронно)
    // Это обновит текст "UP" в описании зданий без задержки
    updateBuildingLevels(true);
    renderClick(); // Обновляем кнопку клика (может показывать информацию о зданиях)
    // Также обновляем состояние кнопок сразу для плавности
    updateButtonStates();
  }
  
  // Тяжелые операции откладываем на следующий кадр для плавности
  requestAnimationFrame(() => {
    if (entity === 'building') {
      // Для зданий обновляем только измененные элементы
      _lastBuildingsState = null; // Принудительно пересоздаем при следующем рендере
      scheduleRender({ buildings: true });
    } else {
      scheduleRender({ click: true });
    }
    // Обновляем состояние кнопок асинхронно
    updateButtonStates();
    // Проверяем разблокировку Uber здания асинхронно
    checkUberUnlock();
  });
  
  return true;
}

// Helper function to reset passive boost
function resetPassiveBoost() {
  const act = save.treasury?.actions;
  if (act && act.passiveBoostUntil > now()) {
    const hadBoost = (act.passiveBoostLevel || 0) > 0;
    act.passiveBoostLevel = 0;
    act.passiveBoostLastTick = now();
    if (hadBoost) {
      renderTopStats();
      const isInUberMode = save.uber && save.uber.max !== 19;
      if (isInUberMode) {
        const passiveBoostBtn = document.querySelector('#treasury-actions-row2 .btn[data-btn-id="passiveBoost"]');
        if (passiveBoostBtn) {
          const tooltip = passiveBoostBtn.querySelector('.tooltip');
          if (tooltip) {
            const effectLine = tooltip.querySelector('.tooltip-line > div');
            if (effectLine) {
              effectLine.textContent = `Passive income increases by 1% every 7 seconds (current: +0%).`;
            }
          }
        }
      }
    }
  }
}

function buyClickLevels() {
  resetPassiveBoost(); // Reset passive boost when buying click levels
  
  // Инвалидируем кэш перед покупкой
  _cachedPPC = null;
  const segStartLevel = save.click.level;
  const bought = buyBulkLevels('click', computeBulkCostForClick, () => {
    const lvl = save.click.level;
    const cost = clickLevelCostAt(lvl);
    const seg = segmentIndex(lvl);
    save.click.pendingSegmentCost[seg] = (save.click.pendingSegmentCost[seg] || 0) + cost;

    // Golden click chance on continuous clicks (handled in clicking, not leveling)
    // Level up gating check (3% fail chance for buildings only, not for click)
    save.click.level = Math.min(save.click.level + 1, save.click.max);
  });
  if (bought) {
    triggerUpgradeEffect(clickBtn, 'Level Up!');
    // XP за покупку уровня клика
    if (typeof addXPForClickLevel === 'function') {
      addXPForClickLevel(save.click.level);
    }
    // Обновляем только критичные элементы сразу, остальное через scheduleRender
    renderClick();
    renderTopStats();
  }
}

function buyClickSegmentUpgrade(segIndex) {
  resetPassiveBoost(); // Reset passive boost when upgrading click
  
  // Инвалидируем кэш перед покупкой
  _cachedPPC = null;
  let costSum = (save.click.pendingSegmentCost[segIndex] || 0) * 0.77;
      // Buff 6: Master Builder - upgrades cost 7x more
      const act = save.treasury?.actions;
      const noBreakActive = act && act.noBreakUntil > now();
      if (noBreakActive) {
        costSum *= 7;
      }
  if (save.points < costSum) {
    toast('Not enough points for segment upgrade.', 'warn');
    return;
  }
  save.points -= costSum;
  if (save.achievements && save.achievements.stats) {
    save.achievements.stats.totalPointsSpent += costSum;
  }
  save.click.segUpgrades[segIndex] = true;
  save.click.upgradeBonus += 1; // 3% per upgrade (count stack)
  toast('Click segment upgraded: +3% income.', 'good');
  triggerUpgradeEffect(clickBtn, 'Upgrade!');
  
  // XP за сегментный апгрейд клика
  if (typeof addXPForClickUpgrade === 'function') {
    addXPForClickUpgrade(segIndex);
  }
  
  // Обновляем только критичные элементы сразу
  renderClick();
  renderTopStats();
  // Остальное откладываем на следующий кадр (если нужно)
  scheduleRender({ click: true, topStats: true });
}

clickBuyBtn.addEventListener('click', buyClickLevels);
clickSegBtn.addEventListener('click', () => {
  const seg = segmentIndex(save.click.level);
  const within = withinSegment(save.click.level);
  const targetSeg = within === 0 ? seg-1 : seg;
  buyClickSegmentUpgrade(targetSeg);
});

function buyBuildingLevels(i) {
  const b = save.buildings[i];
  if (now() < b.blockedUntil) {
    toast('This building is under repair.', 'warn');
    return;
  }
  if (!canBuyNextBuilding(i)) {
    toast('Previous building must reach level 67.', 'warn');
    return;
  }
  const computeFn = (bulk) => computeBulkCostForBuilding(i, bulk);
  const applyFn = () => {
    const lvl = b.level;
    const cost = buildingLevelCostAt(b, lvl);
    const seg = segmentIndex(lvl);
    
    // Track segment cost
    b.pendingSegmentCost[seg] = (b.pendingSegmentCost[seg] || 0) + cost;

    // Good luck mode (debug): buildings can't break
    if (save.modifiers.goodLuckMode) {
      // Apply level without break check
      b.level = Math.min(b.level + 1, b.max);
      return true; // Success, continue buying
    }

    // Buff 6: Master Builder - buildings can't break
    const act = save.treasury?.actions;
    const noBreakActive = act && act.noBreakUntil > now();
    if (noBreakActive) {
      // Apply level without break check
      b.level = Math.min(b.level + 1, b.max);
      return true; // Success, continue buying
    }

    // Random chance to fail and trigger downtime (affected by modifiers)
    // Break can happen on any level, not just levels ending in 9
    const baseFailChance = 0.01; // 1% base chance on any level
    const breakChanceMult = save.modifiers.breakChanceMult || 1;
    // Buff 3: Buildings break 9x more often
    const fastRepairActive = act && act.fastRepairUntil > now();
    const breakMult = fastRepairActive ? 3 : 1;
    const adjustedFailChance = baseFailChance * breakChanceMult * breakMult;
    const baseRepairMs = 164000;
    // Buff 3: Buildings repair 2x faster (x0.5 repair time)
    // Не используем repairMult здесь, так как он может конфликтовать с другими модификаторами
    const repairTimeMult = fastRepairActive ? 0.5 : 1;
    const adjustedRepairMs = baseRepairMs * repairTimeMult;
    
    // Apply level
    b.level = Math.min(b.level + 1, b.max);
    
    // Check if break happens (random chance on any level)
    if (randChance(adjustedFailChance)) {
      b.blockedUntil = now() + adjustedRepairMs;
      toast(`${b.name} construction failed. Repairs for ${(adjustedRepairMs/1000).toFixed(0)}s.`, 'bad');
      // Отслеживаем разрушения для достижений
      if (save.achievements) {
        save.achievements.stats.totalDestructions += 1;
        checkAchievements();
      }
      return false; // Signal that building broke, stop buying more levels
    }
    
    // Отслеживаем покупку первого здания (когда любое здание достигает уровня 1)
    if (save.achievements && !save.achievements.stats.firstBuildingBought && b.level >= 1) {
      save.achievements.stats.firstBuildingBought = true;
      checkAchievements();
    }
    
    // Return true to indicate level was successfully applied
    // (Master Builder free levels are handled elsewhere if needed)
    return true;
  };
  const bought = buyBulkLevels('building', computeFn, applyFn, i);
  if (bought) {
    triggerBuildingUpgradeEffect(i, 'Level Up!');
    // XP за покупку уровня здания
    if (typeof addXPForBuildingLevel === 'function') {
      addXPForBuildingLevel(b.level);
    }
  }
  // Проверяем достижения и разблокировку асинхронно (не блокируем рендеринг)
  requestAnimationFrame(() => {
    checkAchievements();
    checkUberUnlock();
  });
}

function buyBuildingSegUpgrade(i, segIndex) {
  // Инвалидируем кэш перед покупкой
  _cachedPPS = null;
  const b = save.buildings[i];
  let costSum = (b.pendingSegmentCost[segIndex] || 0) * 0.77;
      // Buff 6: Master Builder - upgrades cost 7x more
      const act = save.treasury?.actions;
      const noBreakActive = act && act.noBreakUntil > now();
      if (noBreakActive) {
        costSum *= 7;
      }
  if (save.points < costSum) {
    toast('Not enough points for segment upgrade.', 'warn');
    return;
  }
  save.points -= costSum;
  if (save.achievements && save.achievements.stats) {
    save.achievements.stats.totalPointsSpent += costSum;
  }
  b.segUpgrades[segIndex] = true;
  b.upgradeBonus += 1;
    toast(`${b.name} segment UP: +3% income.`, 'good');
  triggerBuildingUpgradeEffect(i, 'Upgrade!');
  
  // XP за сегментный апгрейд здания
  if (typeof addXPForBuildingUpgrade === 'function') {
    addXPForBuildingUpgrade(segIndex);
  }
  // Сбрасываем кэш состояния зданий для принудительного обновления
  _lastBuildingsState = null;
  _lastSortMode = -1;
  // Инвалидируем кэш PPS/PPC при изменении уровней зданий
  _cachedPPS = null;
  _cachedPPC = null;
  
  // Критичные обновления сразу (синхронно) - для мгновенного отображения изменений
  renderTopStats();
  updateBuildingLevels(true); // Обновляем описания зданий сразу
  renderClick(); // Обновляем кнопку клика
  
  // Тяжелые операции откладываем на следующий кадр
  requestAnimationFrame(() => {
    scheduleRender({ buildings: true });
  });
}

// ======= Clicking mechanics =======
// Функция для создания визуального эффекта при клике (пульсация контура)
function createClickParticles(event, value) {
  if (!clickBtn) return;
  
  const rect = clickBtn.getBoundingClientRect();
  const computedStyle = getComputedStyle(clickBtn);
  
  // Создаем новый элемент волны для каждого клика
  const wave = document.createElement('div');
  wave.className = 'click-pulse-wave';
  
  // Позиционируем волну точно по границам кнопки
  wave.style.position = 'fixed';
  wave.style.left = `${rect.left}px`;
  wave.style.top = `${rect.top}px`;
  wave.style.width = `${rect.width}px`;
  wave.style.height = `${rect.height}px`;
  wave.style.borderRadius = computedStyle.borderRadius || '4px';
  wave.style.boxSizing = 'border-box';
  
  document.body.appendChild(wave);
  
  // Удаляем волну после завершения анимации (уменьшено до 400мс)
  setTimeout(() => {
    if (wave.parentNode) {
      wave.remove();
    }
  }, 400);
}

// Функция для показа критического урона над курсором
function showCritDamage(multiplier, event) {
  const critEl = document.createElement('div');
  critEl.className = 'crit-damage';
  critEl.textContent = `x${multiplier.toFixed(2)}`;
  
  // Определяем размер и яркость в зависимости от множителя
  let size = 24;
  let brightness = 1.0;
  if (multiplier >= 1.10) {
    size = 48;
    brightness = 1.5;
    critEl.classList.add('crit-max');
  } else if (multiplier >= 1.06) {
    size = 40;
    brightness = 1.3;
    critEl.classList.add('crit-high');
  } else if (multiplier >= 1.03) {
    size = 32;
    brightness = 1.15;
    critEl.classList.add('crit-medium');
  } else {
    size = 28;
    brightness = 1.05;
    critEl.classList.add('crit-low');
  }
  
  critEl.style.fontSize = `${size}px`;
  critEl.style.filter = `brightness(${brightness})`;
  
  // Позиционируем над курсором
  const x = event.clientX || window.innerWidth / 2;
  const y = event.clientY || window.innerHeight / 2;
  critEl.style.left = `${x}px`;
  critEl.style.top = `${y - 50}px`;
  
  document.body.appendChild(critEl);
  
  // Анимация появления и исчезновения
  requestAnimationFrame(() => {
    critEl.classList.add('active');
  });
  
  setTimeout(() => {
    critEl.classList.add('fade-out');
    setTimeout(() => {
      critEl.remove();
    }, 500);
  }, 1500);
}

// Функция для показа множителя Angry Barmatun над кнопкой Click
// Числа разлетаются влево и вправо по очереди
let _angryBarmatunMultiplierCounter = 0; // Счетчик для чередования направления
function showAngryBarmatunMultiplier(multiplier) {
  if (!clickBtn) return;
  
  const rect = clickBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top;
  
  // Чередуем направление: четные - влево, нечетные - вправо
  const goLeft = (_angryBarmatunMultiplierCounter % 2 === 0);
  _angryBarmatunMultiplierCounter++;
  
  const multEl = document.createElement('div');
  multEl.className = 'angry-barmatun-multiplier';
  multEl.textContent = `x${multiplier.toFixed(2)}`;
  
  // Определяем размер и цвет в зависимости от множителя
  if (multiplier >= 50) {
    multEl.classList.add('mult-very-high');
  } else if (multiplier >= 10) {
    multEl.classList.add('mult-high');
  } else if (multiplier >= 1) {
    multEl.classList.add('mult-medium');
  } else {
    multEl.classList.add('mult-low');
  }
  
  // Начальная позиция (над кнопкой)
  multEl.style.left = `${centerX}px`;
  multEl.style.top = `${centerY - 20}px`;
  multEl.style.opacity = '0';
  multEl.style.transform = 'translate(-50%, 0) scale(1)';
  
  // Направление разлета: влево или вправо
  const angle = goLeft ? Math.PI * 0.75 : Math.PI * 0.25; // 135° влево или 45° вправо
  const distance = 120 + Math.random() * 60;
  const deltaX = Math.cos(angle) * distance;
  const deltaY = -80 - Math.random() * 40;
  
  document.body.appendChild(multEl);
  
  // Анимация: сначала появляемся, затем разлетаемся
  // Используем setTimeout для надежности
  setTimeout(() => {
    multEl.style.opacity = '1';
    // Небольшая задержка перед разлетом
    setTimeout(() => {
      multEl.style.transform = `translate(calc(-50% + ${deltaX}px), ${deltaY}px) scale(0.5)`;
      multEl.style.opacity = '0';
    }, 100);
  }, 10);
  
  // Удаляем элемент после анимации
  setTimeout(() => {
    if (multEl.parentNode) {
      multEl.remove();
    }
  }, 1200);
}

// Функция для создания эффекта "мина салюта" вокруг плюсика
function createFireworksEffect(element) {
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Создаем множество частиц для эффекта салюта
  const particleCount = 20;
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#95e1d3', '#f38181', '#ffd93d'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'fireworks-particle';
    
    // Случайный цвет
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.backgroundColor = color;
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.position = 'fixed';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '10001';
    particle.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
    
    // Случайное направление и расстояние
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
    const distance = 40 + Math.random() * 30;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;
    
    // Анимация
    particle.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    particle.style.opacity = '1';
    particle.style.transform = 'translate(0, 0) scale(1)';
    
    document.body.appendChild(particle);
    
    // Запускаем анимацию
    requestAnimationFrame(() => {
      particle.style.left = `${endX}px`;
      particle.style.top = `${endY}px`;
      particle.style.opacity = '0';
      particle.style.transform = `translate(${Math.cos(angle) * 20}px, ${Math.sin(angle) * 20}px) scale(0.3)`;
    });
    
    // Удаляем частицу после анимации
    setTimeout(() => {
      particle.remove();
    }, 600);
  }
}

// Функция для создания большого салюта (для заголовка)
function createBigFireworks(element) {
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Создаем больше частиц для более эффектного салюта
  const particleCount = 50;
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#95e1d3', '#f38181', '#ffd93d', '#ff8c00', '#ff1493', '#00ff00', '#00bfff'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'fireworks-particle';
    
    // Случайный цвет
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.backgroundColor = color;
    const size = 6 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.borderRadius = '50%';
    particle.style.position = 'fixed';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '10001';
    particle.style.boxShadow = `0 0 8px ${color}, 0 0 16px ${color}`;
    
    // Случайное направление и расстояние
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
    const distance = 80 + Math.random() * 60;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;
    
    // Анимация
    particle.style.transition = 'all 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    particle.style.opacity = '1';
    particle.style.transform = 'translate(0, 0) scale(1)';
    
    document.body.appendChild(particle);
    
    // Запускаем анимацию
    requestAnimationFrame(() => {
      particle.style.left = `${endX}px`;
      particle.style.top = `${endY}px`;
      particle.style.opacity = '0';
      particle.style.transform = `translate(${Math.cos(angle) * 30}px, ${Math.sin(angle) * 30}px) scale(0.2)`;
    });
    
    // Удаляем частицу после анимации
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
}

// Обработчик клика на заголовок игры
if (gameTitleEl) {
  gameTitleEl.style.cursor = 'pointer';
  gameTitleEl.addEventListener('click', () => {
    if (!save || !save.achievements) return;
    
    // Проверяем, не разблокировано ли уже достижение
    const achievementId = 'honored_player';
    if (!save.achievements.unlocked[achievementId]) {
      // Разблокируем достижение
      save.achievements.unlocked[achievementId] = true;
      
      // Запускаем салют
      createBigFireworks(gameTitleEl);
      
      // Показываем уведомление
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement) {
        toast(`Achievement unlocked: ${achievement.name} (+${(achievement.reward * 100).toFixed(0)}% income)!`, 'good');
      }
      
      // Обновляем отображение достижений
      renderAchievements();
      
      // Обновляем статистику дохода
      renderTopStats();
    }
  });
}

clickBtn.addEventListener('click', (event) => {
  const ts = now();
  
  // Проверка перегрева - блокируем клики если кнопка перегрета
  if (isClickOverheated()) {
    const remaining = Math.ceil((save.click.cooldownUntil - ts) / 1000);
    toast(`Click button is overheated! Wait ${remaining}s.`, 'warn');
    renderClick();
    return;
  }
  
  // Добавляем клик в историю и обрабатываем перегрев на основе скорости
  addClickToHistory();
  
  // Дебаф от кликов: -0.1% пассивного дохода за каждый клик (накопительно)
  // Восстанавливается визуально по 0.01% за раз, логика 0.25% в секунду, начинается через 5 секунд
  if (save.modifiers.clickDebuffLevel === undefined) {
    save.modifiers.clickDebuffLevel = 0;
  }
  if (save.modifiers.clickDebuffLastClickTs === undefined) {
    save.modifiers.clickDebuffLastClickTs = 0;
  }
  if (save.modifiers.clickDebuffRecoveryAccumulator === undefined) {
    save.modifiers.clickDebuffRecoveryAccumulator = 0;
  }
  if (save.modifiers.clickDebuffRecoveryAccumulator === undefined) {
    save.modifiers.clickDebuffRecoveryAccumulator = 0;
  }
  
  // Обновляем дебаф перед добавлением нового (восстановление за прошедшее время)
  updateClickDebuff();
  
  // Увеличиваем уровень дебафа на 0.1% за каждый клик (максимум -100%)
  // Восстановление дебафа происходит только в tick() для плавности
  const oldClickDebuffLevel = save.modifiers.clickDebuffLevel;
  save.modifiers.clickDebuffLevel = Math.min(100, save.modifiers.clickDebuffLevel + 0.1);
  
  // Инвалидируем кэш если дебаф изменился (влияет на PPS)
  if (oldClickDebuffLevel !== save.modifiers.clickDebuffLevel) {
    _cachedPPS = null;
  }
  
  // Обновляем время последнего клика для дебафа (используется тот же таймер что и перелив)
  // Таймер обновляется в системе перелива дохода (incomeTransferLastClickTs)
  
  // Система перелива дохода: при клике отнимается 1% от дохода зданий
  // Инициализируем если нужно
  if (save.modifiers.incomeTransferLevel === undefined) {
    save.modifiers.incomeTransferLevel = 0;
  }
  if (save.modifiers.incomeTransferLastClickTs === undefined) {
    save.modifiers.incomeTransferLastClickTs = 0;
  }
  
  // Увеличиваем уровень перелива на 1% за клик (максимум 100%)
  const oldIncomeTransferLevel = save.modifiers.incomeTransferLevel;
  save.modifiers.incomeTransferLevel = Math.min(100, save.modifiers.incomeTransferLevel + 1);
  
  // Инвалидируем кэш если перелив изменился (влияет на PPS и PPC)
  if (oldIncomeTransferLevel !== save.modifiers.incomeTransferLevel) {
    _cachedPPS = null;
    _cachedPPC = null;
  }
  
  // Обновляем таймер (5 секунд до начала возврата)
  save.modifiers.incomeTransferLastClickTs = ts;
  
  // Streak logic - разрыв стрика при паузе более 1 секунды
  if (ts - save.streak.lastClickTs <= 1000) {
    save.streak.count += 1;
  } else {
    save.streak.count = 1;
    save.streak.multiplier = 1.0; // Сбрасываем множитель при разрыве стрика
  }
  save.streak.lastClickTs = ts;

  // Проверяем пороги стрика и обновляем множитель
  let newMultiplier = save.streak.multiplier;
  if (save.streak.count === 59) {
    newMultiplier = 1.01;
    save.streak.multiplier = newMultiplier;
    showCritDamage(newMultiplier, event);
  } else if (save.streak.count === 103) {
    newMultiplier = 1.03;
    save.streak.multiplier = newMultiplier;
    showCritDamage(newMultiplier, event);
  } else if (save.streak.count === 148) {
    newMultiplier = 1.06;
    save.streak.multiplier = newMultiplier;
    showCritDamage(newMultiplier, event);
  } else if (save.streak.count === 202) {
    newMultiplier = 1.10;
    save.streak.multiplier = newMultiplier;
    showCritDamage(newMultiplier, event);
  }

  // Apply points
  const madnessActive = save.treasury?.actions?.clickMadnessUntil > now();
  const basePpc = totalPPC();
  
  // Angry Barmatun: Random click multiplier (x0.1 to x100) - generated per click
  let angryBarmatunClickMult = 1.0;
  const angryBarmatunActive = save.modifiers.angryBarmatunUntil > now();
  if (angryBarmatunActive) {
    // Generate random multiplier between 0.1 and 100 for this click
    const minMult = 0.001;
    const maxMult = 100.0;
    // Use logarithmic distribution for more interesting range
    const logMin = Math.log10(minMult);
    const logMax = Math.log10(maxMult);
    const randomLog = logMin + Math.random() * (logMax - logMin);
    const randomMult = Math.pow(10, randomLog);
    angryBarmatunClickMult = randomMult;
    // Store for potential UI display
    save.modifiers.angryBarmatunMult = randomMult;
    // Show multiplier above click button (flies left/right alternately)
    showAngryBarmatunMultiplier(randomMult);
  }
  
  const gain = basePpc * angryBarmatunClickMult;
  addPoints(gain);
  
  // Создаем частицы при клике
  createClickParticles(event, gain);

  // Отслеживаем клики для достижений
  if (save.achievements) {
    save.achievements.stats.totalClicks += 1;
    checkAchievements();
  }
  
  // XP за клики
  if (typeof addXPForClicks === 'function') {
    addXPForClicks(1);
  }

  // Клик Безумия: шанс потерять уровни
  if (madnessActive && randChance(0.005)) {
    save.click.level = Math.max(0, save.click.level - 3);
    toast('Click Madness backlash: -3 Click levels!', 'warn');
    // Обновляем UI после изменения уровня клика
    renderClick();
    updateButtonStates();
  }

  // Buff 4: Reset passive boost on click
  resetPassiveBoost();
  
  // Buff 5: Click gives 0.2 treasury coins
  const act = save.treasury?.actions;
  if (act && act.spiderBuffUntil > now()) {
    gainTreasury(0.2);
  }
  
  // Buff 2: Always golden (handled in renderClick, but ensure it stays golden)
  const alwaysGoldenActive = act && act.alwaysGoldenUntil > now();
  
  // 0.5% шанс на золотую или сломанную кнопку при каждом клике (отключено в Click Madness)
  // Buff 1: Can't become golden, can't break - skip both chances
  // Buff 2: Always golden - кнопка всегда золотая, но может сломаться в 9 раз чаще
  if (!madnessActive) {
    const noGoldenActive = act && act.noGoldenUntil > now();
    // Always Golden debuff: кнопка не может стать золотой на 120 сек по окончании
    const alwaysGoldenNoGoldenDebuff = save.modifiers.alwaysGoldenNoGoldenUntil > now();
    // Buff 1: Skip all golden/break chances if noGolden is active
    if (!noGoldenActive && !alwaysGoldenNoGoldenDebuff) {
      // Проверяем, активна ли обычная золотая кнопка (не от alwaysGolden баффа)
      // Обычная золотая кнопка определяется как: goldenUntil > now() И это не от alwaysGolden баффа
      const goldenUntilFromBuff = alwaysGoldenActive ? act.alwaysGoldenUntil : 0;
      const normalGoldenActive = save.click.goldenUntil > now() && 
                                 save.click.goldenUntil !== goldenUntilFromBuff &&
                                 !alwaysGoldenActive;
      
      // Кнопка больше не может сломаться - оставляем только логику золотой кнопки
        if (alwaysGoldenActive) {
        // При alwaysGolden баффе: кнопка всегда золотая
        // Поломка отключена
      } else if (!normalGoldenActive) {
          // Обычная логика: шанс на золотую кнопку (без поломки)
          const roll = Math.random();
          const goldenChance = 0.005; // 0.5% base chance (только золотая, без поломки)
          if (roll < goldenChance) {
              // Золотая кнопка
            const goldenEndTime = now() + 8000;
            save.click.goldenUntil = goldenEndTime;
              
              // Отслеживаем активацию golden click
              if (save.achievements && save.achievements.stats) {
                save.achievements.stats.goldenClicksActivated++;
                save.achievements.stats.goldenClickActivations++; // для совместимости
              }
              
              // Воспроизводим звук золотой кнопки
              playSound('clickGold');
              
              save.streak.count = 0;
              save.streak.multiplier = 1.0;
              toast('Click button turned golden for 8s (x1.5 PPC).', 'good');
              renderClick();
              
              // Золотая кнопка просто заканчивается
              setTimeout(() => {
              // Проверяем, что это та же золотая кнопка (не была перезаписана)
              if (save.click.goldenUntil === goldenEndTime) {
                save.click.goldenUntil = 0;
                toast('Golden effect ended.', 'warn');
                renderClick();
              }
              }, 8000);
          }
        }
        // Если normalGoldenActive = true, ничего не делаем (обычная золотая кнопка активна)
    }
  }

  // Обновляем верхние показатели и статус кнопки
  renderTopStats();
  renderClick();
});

// Сбрасываем стрик при клике на любой элемент кроме кнопки Click
document.addEventListener('click', (event) => {
  if (!save || !save.streak) return;
  
  // Проверяем, что клик был не на кнопке Click
  const target = event.target;
  const clickedOnClickBtn = target === clickBtn || clickBtn.contains(target);
  
  if (!clickedOnClickBtn) {
    // Сбрасываем стрик при клике на что угодно кроме кнопки Click
    save.streak.count = 0;
    save.streak.multiplier = 1.0;
    save.streak.lastClickTs = 0;
  }
}, true); // Используем capture phase, чтобы сработало до других обработчиков

// ======= Bulk controls =======
function updateBulkButtons() {
  if (!save) return;
  
  // Инициализируем bulk, если его нет
  if (save.bulk === undefined || save.bulk === null) {
    save.bulk = 1;
  }
  
  // Пересоздаем массив кнопок на случай, если DOM изменился
  const buttons = Array.from(document.querySelectorAll('#bulk-buttons .bulk'));
  if (!buttons || buttons.length === 0) return;
  
  // Нормализуем save.bulk к правильному типу
  // Если bulk не установлен или некорректный, используем значение по умолчанию 1
  let currentBulk;
  if (save.bulk === 'max') {
    currentBulk = 'max';
  } else {
    const parsed = parseInt(save.bulk, 10);
    currentBulk = isNaN(parsed) ? 1 : parsed;
    // Обновляем save.bulk на нормализованное значение
    save.bulk = currentBulk;
  }
  
  // Сначала убираем active со всех кнопок
  buttons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Затем добавляем active только к нужной кнопке
  buttons.forEach(btn => {
    const btnBulk = btn.dataset.bulk === 'max' ? 'max' : parseInt(btn.dataset.bulk, 10);
    if (btnBulk === currentBulk) {
      btn.classList.add('active');
    }
  });
}

bulkButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    save.bulk = btn.dataset.bulk === 'max' ? 'max' : parseInt(btn.dataset.bulk, 10);
    updateBulkButtons();
    renderClick(); // Обновляем Click сразу
    renderAll();
    // Принудительно обновляем цены зданий при изменении bulk
    updateBuildingLevels(true);
  });
});

// ======= Spider events (behavior fixed only) =======
// Only spider behavior is changed here. All other logic, timings and click outcomes remain the same.

// helper: random integer inclusive
function _randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// internal movement state
const _spiderState = {
  moveTimer: null,
  moving: false,
  aliveUntil: 0,
  escapeTimer: null, // id таймера, который отвечает за сообщение "сполз/убежал"
  cachedSize: { w: 64, h: 64 }, // Кэшированный размер для избежания getBoundingClientRect()
  imgCreated: false // Флаг создания img элемента
};

// Инициализация img элемента для паука (один раз при загрузке)
function _initSpiderImage() {
  if (!spiderEl || _spiderState.imgCreated) return;
  const img = document.createElement('img');
  img.src = 'icons/spider.png';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.imageRendering = 'pixelated';
  img.style.imageRendering = '-moz-crisp-edges';
  img.style.imageRendering = 'crisp-edges';
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  spiderEl.appendChild(img);
  _spiderState.imgCreated = true;
  
  // Устанавливаем transition один раз (вместо проверки getComputedStyle при каждом spawn)
  spiderEl.style.transition = 'left 0.9s cubic-bezier(.22,.9,.35,1), top 0.9s cubic-bezier(.22,.9,.35,1), transform 0.25s ease';
  // GPU ускорение
  spiderEl.style.willChange = 'transform, left, top';
  spiderEl.style.backfaceVisibility = 'hidden';
  spiderEl.style.transform = 'translateZ(0)';
  
  // Кэшируем размер после создания элемента
  requestAnimationFrame(() => {
    if (spiderEl) {
      const r = spiderEl.getBoundingClientRect();
      _spiderState.cachedSize = { w: Math.max(1, r.width || 64), h: Math.max(1, r.height || 64) };
    }
  });
}

// compute spider size safely (использует кэш)
function _getSpiderSize() {
  return _spiderState.cachedSize;
}

// place spider at a random position within viewport
function _placeSpiderRandom() {
  if (!spiderEl) return;
  const { w, h } = _getSpiderSize();
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);
  spiderEl.style.left = _randInt(0, maxLeft) + 'px';
  spiderEl.style.top = _randInt(0, maxTop) + 'px';
  spiderEl.style.transform = `rotate(${_randInt(-12,12)}deg)`;
}

// move spider once to a new random point (avoid tiny hops)
function _moveSpiderOnce() {
  if (!spiderEl || spiderEl.classList.contains('hidden')) return;
  const { w, h } = _getSpiderSize();
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);

  // Используем сохраненную позицию вместо getBoundingClientRect()
  const curLeft = parseInt(spiderEl.style.left || '0', 10);
  const curTop = parseInt(spiderEl.style.top || '0', 10);
  let nx, ny, attempts = 0;
  do {
    nx = _randInt(0, maxLeft);
    ny = _randInt(0, maxTop);
    attempts++;
  } while (attempts < 8 && Math.hypot(nx - curLeft, ny - curTop) < Math.max(w,h) * 0.5);

  // apply new position with smooth CSS transitions
  spiderEl.style.left = nx + 'px';
  spiderEl.style.top = ny + 'px';
  spiderEl.style.transform = `rotate(${_randInt(-18,18)}deg)`;
  // gently reset rotation after a short time so it doesn't stay tilted forever
  setTimeout(()=> {
    if (!spiderEl.classList.contains('hidden')) spiderEl.style.transform = 'rotate(0deg)';
  }, 900);
}

// start periodic movement while spider visible
function _startSpiderMovement() {
  if (_spiderState.moving) return;
  _spiderState.moving = true;
  const schedule = () => {
    if (!_spiderState.moving) return;
    const delay = _randInt(1200, 3200);
    _spiderState.moveTimer = setTimeout(() => {
      _moveSpiderOnce();
      schedule();
    }, delay);
  };
  schedule();
}

// stop movement and clear timers
function _stopSpiderMovement() {
  _spiderState.moving = false;
  if (_spiderState.moveTimer) {
    clearTimeout(_spiderState.moveTimer);
    _spiderState.moveTimer = null;
  }
}

// spawn scheduling preserved, but spawn now places spider randomly and starts movement
// Случайный интервал от 4 до 10 минут (240000-600000 мс)
let nextSpiderTs = now() + _randInt(240000, 600000);
function maybeSpawnSpider() {
  const t = now();
  if (t >= nextSpiderTs) {
    spawnSpider();
    // Случайный интервал от 4 до 10 минут для следующего появления
    nextSpiderTs = t + _randInt(240000, 600000);
  }
}

//0001

// ======= King: behavior + mini-game =======

const kingEl = document.getElementById('king');
const kingModal = document.getElementById('king-modal');
const kingArena = document.getElementById('king-arena');
const kingTimerEl = document.getElementById('king-game-timer');
const kingStatusEl = document.getElementById('king-game-status');
const kingCloseBtn = document.getElementById('king-game-close');

let _kingState = {
  spawnTimer: null,
  visibleUntil: 0,
  escapeTimer: null,
  miniGame: null, // { timerId, remaining, clickedCount, crowns: [] }
  cachedSize: { w: 64, h: 64 }, // Кэшированный размер
  imgCreated: false // Флаг создания img элемента
};

// Инициализация img элемента для короля (один раз при загрузке)
function _initKingImage() {
  if (!kingEl || _kingState.imgCreated) return;
  const img = document.createElement('img');
  img.src = 'icons/king.png';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.imageRendering = 'pixelated';
  img.style.imageRendering = '-moz-crisp-edges';
  img.style.imageRendering = 'crisp-edges';
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  kingEl.appendChild(img);
  _kingState.imgCreated = true;
  
  // GPU ускорение
  kingEl.style.willChange = 'transform, opacity';
  kingEl.style.backfaceVisibility = 'hidden';
  kingEl.style.transform = 'translateZ(0)';
  
  // Кэшируем размер после создания элемента
  requestAnimationFrame(() => {
    if (kingEl) {
      const w = kingEl.offsetWidth || 64;
      const h = kingEl.offsetHeight || 64;
      _kingState.cachedSize = { w, h };
    }
  });
}

// helper: schedule next king spawn in 3..10 minutes
function scheduleNextKing() {
  if (_kingState.spawnTimer) clearTimeout(_kingState.spawnTimer);
  const ms = _randInt(3 * 60 * 1000, 7 * 60 * 1000); // 3..7 minutes
  _kingState.spawnTimer = setTimeout(spawnKing, ms);
}

// place king randomly (reuses spider placement logic)
function _placeKingRandom() {
  if (!kingEl) return;
  const { w, h } = _kingState.cachedSize;
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);
  kingEl.style.left = _randInt(0, maxLeft) + 'px';
  kingEl.style.top = _randInt(0, maxTop) + 'px';
  kingEl.style.transform = `rotate(${_randInt(-12,12)}deg)`;
}

function drawKing(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  
  const skinColor = '#f5d5a3';
  const crownColor = '#ffd700';
  const crownDark = '#b8860b';
  const robeColor = '#2a4b7a';
  const robeDark = '#1a2f4a';
  const beardColor = '#8b7355';
  
  // Body/robe
  ctx.fillStyle = robeColor;
  ctx.fillRect(16, 40, 32, 24);
  ctx.fillStyle = robeDark;
  ctx.fillRect(18, 42, 28, 20);
  
  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(32, 32, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a0f0a';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Crown base
  ctx.fillStyle = crownColor;
  ctx.fillRect(20, 18, 24, 6);
  ctx.fillRect(22, 16, 20, 2);
  
  // Crown jewels
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(24, 20, 4, 4);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(30, 20, 4, 4);
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(36, 20, 4, 4);
  
  // Crown spikes
  ctx.fillStyle = crownDark;
  ctx.fillRect(22, 14, 3, 4);
  ctx.fillRect(28, 12, 3, 6);
  ctx.fillRect(34, 14, 3, 4);
  ctx.fillRect(39, 16, 3, 2);
  
  // Eyes
  ctx.fillStyle = '#000000';
  ctx.fillRect(28, 30, 2, 2);
  ctx.fillRect(34, 30, 2, 2);
  
  // Nose
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(31, 33, 2, 3);
  
  // Mouth
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(32, 38, 3, 0, Math.PI);
  ctx.stroke();
  
  // Beard
  ctx.fillStyle = beardColor;
  ctx.beginPath();
  ctx.arc(32, 40, 10, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#1a0f0a';
  ctx.stroke();
  
  // Beard details
  ctx.fillStyle = '#6b5a45';
  ctx.fillRect(28, 38, 2, 4);
  ctx.fillRect(34, 38, 2, 4);
  
  // Robe collar
  ctx.fillStyle = '#d4b24a';
  ctx.fillRect(24, 40, 16, 4);
  ctx.fillRect(26, 38, 12, 2);
}

// spawn king: show for 23s unless clicked
function spawnKing() {
  if (!kingEl) return;
  
  // Проверяем условие: минимум 25 зданий с уровнем 50
  if (!save || !save.buildings) {
    scheduleNextKing();
    return;
  }
  const buildingsWithLevel50 = save.buildings.filter(b => b.level >= 50).length;
  if (buildingsWithLevel50 < 25) {
    // Условие не выполнено - переносим появление короля
    scheduleNextKing();
    return;
  }
  
  // Инициализируем img элемент один раз (если еще не создан)
  _initKingImage();
  
  _placeKingRandom();
  kingEl.classList.add('show');
  kingEl.title = 'King — click to start the mini-game';
  _kingState.visibleUntil = now() + 23000;
  
  // Воспроизводим звук появления короля
  playSound('king');
  // auto-escape after 23s
  if (_kingState.escapeTimer) clearTimeout(_kingState.escapeTimer);
  _kingState.escapeTimer = setTimeout(() => {
    if (kingEl.classList.contains('show')) {
      kingEl.classList.remove('show');
      toast('The King has fled.', 'warn');
      scheduleNextKing();
    }
  }, 23000);
}

// hide king and clear timers
function hideKing() {
  if (!kingEl) return;
  kingEl.classList.remove('show');
  if (_kingState.escapeTimer) { clearTimeout(_kingState.escapeTimer); _kingState.escapeTimer = null; }
  _kingState.visibleUntil = 0;
  scheduleNextKing();
}

// click on king -> open mini-game
kingEl.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!kingEl.classList.contains('show')) return;
  resetPassiveBoost(); // Reset passive boost when clicking king
  // open mini-game
  openKingMiniGame();
  // hide king from screen while mini-game is active
  kingEl.classList.remove('show');
  if (_kingState.escapeTimer) { clearTimeout(_kingState.escapeTimer); _kingState.escapeTimer = null; }
});

// Mini-game implementation
function openKingMiniGame() {
  // initialize state
  const durationMs = 8000;
  // Buff 5: Spider Buff - requires one less crown to win
  const act = save.treasury?.actions;
  const spiderBuffActive = act && act.spiderBuffUntil > now();
  const baseTarget = 12;
  const target = spiderBuffActive ? (baseTarget - 1) : baseTarget;
  kingModal.classList.add('show');
  kingModal.setAttribute('aria-hidden', 'false');
  kingArena.innerHTML = '';
  kingStatusEl.textContent = `Click ${target} crowns in ${durationMs/1000} seconds. Clicking the background is an instant miss.`;
  let clicked = 0;
  const crowns = [];

  // spawn crowns randomly inside arena; ensure crowns don't overlap more than 50%
  function spawnCrowns() {
    const rect = kingArena.getBoundingClientRect();
    const crownWidth = 56;
    const crownHeight = 40;
    const maxOverlap = 0.5; // max 50% overlap allowed
    const minDistanceX = crownWidth * (1 - maxOverlap);
    const minDistanceY = crownHeight * (1 - maxOverlap);
    const margin = 15;
    const placedCrowns = [];
    
    for (let i = 0; i < target; i++) {
      let attempts = 0;
      let x, y;
      let validPosition = false;
      
      // Try to find a valid position (max 100 attempts)
      while (!validPosition && attempts < 100) {
        x = _randInt(margin, Math.max(margin, rect.width - crownWidth - margin));
        y = _randInt(margin, Math.max(margin, rect.height - crownHeight - margin));
        
        // Check if this position overlaps too much with existing crowns
        validPosition = true;
        for (const placed of placedCrowns) {
          const dx = Math.abs(x - placed.x);
          const dy = Math.abs(y - placed.y);
          if (dx < minDistanceX && dy < minDistanceY) {
            validPosition = false;
            break;
          }
        }
        attempts++;
      }
      
      const c = document.createElement('div');
      c.className = 'king-crown';
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      c.dataset.index = String(i);
      c.title = 'Click!';
      placedCrowns.push({ x, y });
      // click handler
      c.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (!kingModal.classList.contains('show')) return;
        // mark crown as collected and increment count
        if (!c.classList.contains('collected')) {
          c.classList.add('collected');
          c.style.opacity = '0.35';
          clicked++;
          kingStatusEl.textContent = `Caught: ${clicked} / ${target}`;
          // success check
          if (clicked >= target) {
            endKingMiniGame('success', { clicked, target });
          }
        }
      });
      kingArena.appendChild(c);
      crowns.push(c);
    }
  }

  // clicking on arena background = miss -> immediate heavy penalty
  function onArenaClick(e) {
    // if click target is arena itself (not a crown), it's a miss
    if (e.target === kingArena) {
      endKingMiniGame('miss', { clicked, target });
    }
  }
  kingArena.addEventListener('click', onArenaClick);

  // timer tick
  let remaining = durationMs;
  kingTimerEl.textContent = (remaining/1000).toFixed(1) + 's';
  const tickInterval = 100; // update every 100ms
  const timerId = setInterval(() => {
    remaining -= tickInterval;
    kingTimerEl.textContent = Math.max(0, (remaining/1000)).toFixed(1) + 's';
    if (remaining <= 0) {
      clearInterval(timerId);
      endKingMiniGame('timeout', { clicked, target });
    }
  }, tickInterval);

  // store miniGame state for cleanup if needed
  _kingState.miniGame = { timerId, crowns, onArenaClick, clicked, target };

  // spawn crowns and focus
  spawnCrowns();
  kingArena.focus();
}

// end mini-game with outcome: 'success' | 'timeout' | 'miss'
function endKingMiniGame(outcome, info = {}) {
  // cleanup listeners/timers
  if (!_kingState.miniGame) return;
  const { timerId, crowns, onArenaClick } = _kingState.miniGame;
  clearInterval(timerId);
  kingArena.removeEventListener('click', onArenaClick);
  _kingState.miniGame = null;

  // hide modal
  kingModal.classList.remove('show');
  kingModal.setAttribute('aria-hidden', 'true');
  kingTimerEl.textContent = '15.0s';

  // apply effects based on outcome
  const clicked = info.clicked || 0;
  // Use target from info if provided, otherwise from miniGame state, otherwise default
  const target = info.target || (_kingState.miniGame && _kingState.miniGame.target) || 15;

  if (outcome === 'success') {
    // reward: +2 levels to each opened Building, +1 Click, +5% points
    // Король добавляет максимально возможное количество уровней до следующего апгрейда
    let openedCount = 0;
    let totalLevelsAdded = 0;
    save.buildings.forEach(b => {
      if (b.level > 0) {
        const maxAddable = maxLevelsBeforeUpgrade(b.level, 2, b.segUpgrades, b.max);
        if (maxAddable > 0) {
          b.level = Math.min(b.max, b.level + maxAddable);
        openedCount++;
          totalLevelsAdded += maxAddable;
        }
      }
    });
    
    // Для Click также применяем ограничение по апгрейдам
    const clickMaxAddable = maxLevelsBeforeUpgrade(save.click.level, 1, save.click.segUpgrades, save.click.max);
    if (clickMaxAddable > 0) {
      save.click.level = Math.min(save.click.max, save.click.level + clickMaxAddable);
    }
    
    // +5% points
    save.points = save.points * 1.05;
    toast(`Success! The King rewarded you: +${totalLevelsAdded} levels to buildings (${openedCount} buildings), +${clickMaxAddable} to Click, +5% points.`, 'good');
    
    // Воспроизводим звук выигрыша в мини-игру короля
    playSound('kingBuff');
    
    // XP за успешное прохождение короля
    if (typeof addXPForKing === 'function') {
      addXPForKing();
    }
    
    // Принудительно обновляем уровни зданий после награды короля (немедленно)
    updateBuildingLevels(true);
    // Обновляем состояние кнопок
    updateButtonStates();
  } else if (outcome === 'timeout') {
    // not enough crowns in time -> penalty: -13 levels each opened building, -13 click, 23% passive income for 48s
    save.buildings.forEach(b => {
      if (b.level > 0) b.level = Math.max(0, b.level - 13);
    });
    save.click.level = Math.max(0, save.click.level - 13);
    // Apply 23% passive income debuff for 48 seconds
    save.modifiers.kingDebuffUntil = now() + 48000;
    save.modifiers.kingDebuffMult = 0.23;
    _cachedPPS = null;
    _cachedPPC = null;
    toast(`Time's up. The King punished you: -13 levels Building, -13 Click. Passive income reduced to 23% for 48s.`, 'bad');
    
    // Воспроизводим звук дебафа от короля
    playSound('debuff');
    
    // Принудительно обновляем уровни зданий после наказания (немедленно)
    updateBuildingLevels(true);
    // Обновляем состояние кнопок
    updateButtonStates();
  } else if (outcome === 'miss') {
    // immediate heavy penalty: -13 each building, -13 click, -30% points, 23% passive income for 48s
    save.buildings.forEach(b => {
      b.level = Math.max(0, b.level - 13);
    });
    save.click.level = Math.max(0, save.click.level - 13);
    save.points = Math.max(0, save.points * 0.7);
    // Apply 23% passive income debuff for 48 seconds
    save.modifiers.kingDebuffUntil = now() + 48000;
    save.modifiers.kingDebuffMult = 0.23;
    _cachedPPS = null;
    _cachedPPC = null;
    toast(`Miss! The King is furious: -13 levels Buildings, -13 Click, -30% points. Passive income reduced to 23% for 48s.`, 'bad');
    
    // Воспроизводим звук дебафа от короля
    playSound('debuff');
    
    // Принудительно обновляем уровни зданий после наказания (немедленно)
    updateBuildingLevels(true);
    // Обновляем состояние кнопок
    updateButtonStates();
  }

  // render and schedule next king
  renderAll();
  scheduleNextKing();
}

// allow closing mini-game manually (counts as timeout)
kingCloseBtn.addEventListener('click', () => {
  if (_kingState.miniGame) {
    const act = save.treasury?.actions;
    const spiderBuffActive = act && act.spiderBuffUntil > now();
    const baseTarget = 15;
    const target = spiderBuffActive ? (baseTarget - 1) : baseTarget;
    endKingMiniGame('timeout', { clicked: (_kingState.miniGame && _kingState.miniGame.clicked) || 0, target });
  } else {
    kingModal.classList.remove('show');
    kingModal.setAttribute('aria-hidden', 'true');
    scheduleNextKing();
  }
});

// If modal is open and user presses Escape -> cancel (timeout)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && kingModal.classList.contains('show')) {
    if (_kingState.miniGame) {
      const act = save.treasury?.actions;
      const spiderBuffActive = act && act.spiderBuffUntil > now();
      const baseTarget = 15;
      const target = spiderBuffActive ? (baseTarget - 1) : baseTarget;
      endKingMiniGame('timeout', { clicked:0, target });
    }
  }
});

// Start initial schedule on load
scheduleNextKing();


function drawSpider(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  
  // Purple/violet colors for spider
  const bodyColor = '#4a2a5a';
  const legColor = '#2a1a3a';
  const eyeColor = '#ff00ff';
  const highlight = '#6a4a7a';
  
  // Body (oval) with purple glow
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#8b4a9a';
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(32, 36, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1a0a2a';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Head (smaller oval) with purple glow
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#8b4a9a';
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(32, 20, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1a0a2a';
  ctx.stroke();
  
  // Legs - 8 legs total
  ctx.strokeStyle = legColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  
  // Front left legs
  ctx.beginPath();
  ctx.moveTo(24, 22);
  ctx.lineTo(12, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(26, 28);
  ctx.lineTo(14, 20);
  ctx.stroke();
  
  // Front right legs
  ctx.beginPath();
  ctx.moveTo(40, 22);
  ctx.lineTo(52, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(38, 28);
  ctx.lineTo(50, 20);
  ctx.stroke();
  
  // Back left legs
  ctx.beginPath();
  ctx.moveTo(22, 40);
  ctx.lineTo(10, 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(24, 46);
  ctx.lineTo(12, 56);
  ctx.stroke();
  
  // Back right legs
  ctx.beginPath();
  ctx.moveTo(42, 40);
  ctx.lineTo(54, 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(40, 46);
  ctx.lineTo(52, 56);
  ctx.stroke();
  
  // Eyes (8 eyes - 2 rows)
  ctx.fillStyle = eyeColor;
  ctx.fillRect(28, 18, 2, 2);
  ctx.fillRect(34, 18, 2, 2);
  ctx.fillRect(26, 20, 2, 2);
  ctx.fillRect(36, 20, 2, 2);
  
  // Body pattern
  ctx.fillStyle = highlight;
  ctx.fillRect(30, 34, 4, 2);
  ctx.fillRect(28, 38, 8, 2);
}

function spawnSpider() {
  if (!spiderEl) return;

  // Инициализируем img элемент один раз (если еще не создан)
  _initSpiderImage();

  // ensure spider is visible and positioned inside viewport
  _placeSpiderRandom();
  spiderEl.classList.remove('hidden');

  // mark alive window
  _spiderState.aliveUntil = now() + 30000; // 30s
  _startSpiderMovement();
  toast('A spider appears...', 'warn');
  
  // Воспроизводим звук появления паука
  playSound('spider');

  // очистим старый таймер, если он есть
  if (_spiderState.escapeTimer) {
    clearTimeout(_spiderState.escapeTimer);
    _spiderState.escapeTimer = null;
  }

  // создаём новый таймер, но перед показом сообщения дополнительно проверяем,
  // что паук всё ещё видим (не скрыт и не пойман)
  _spiderState.escapeTimer = setTimeout(() => {
    _spiderState.escapeTimer = null; // сбросим ссылку сразу
    // если паук уже скрыт или пойман — ничего не делаем
    if (!spiderEl || spiderEl.classList.contains('hidden')) return;
    // дополнительная проверка по времени на случай рассинхронизации
    if (now() < _spiderState.aliveUntil) return;
    // скрываем паука и останавливаем движение, затем показываем сообщение
    spiderEl.classList.add('hidden');
    _stopSpiderMovement();
    _spiderState.aliveUntil = 0;
    toast('The spider slips away.', 'info');
  }, 30000);
}



// keep original click outcomes but ensure movement stops and spider hides
if (spiderEl) {
  // Инициализируем img элемент и стили один раз при загрузке
  _initSpiderImage();

  spiderEl.addEventListener('click', () => {
    resetPassiveBoost(); // Reset passive boost when clicking spider
    // отменяем таймер "убежал", если он есть
    if (_spiderState.escapeTimer) {
      clearTimeout(_spiderState.escapeTimer);
      _spiderState.escapeTimer = null;
    }
    // пометим, что паук больше не "жив" в плане таймера
    _spiderState.aliveUntil = 0;

    // Сбрасываем streak при клике на паука, чтобы предотвратить случайную активацию золотого состояния
    save.streak.count = 0;
    save.streak.lastClickTs = 0;
    save.streak.multiplier = 1.0;

    const act = save.treasury?.actions;
    const spiderBuffActive = act && act.spiderBuffUntil > now();
    
    const roll = Math.random();
    if (spiderBuffActive) {
      // Buff 5: Increased chance for positive, decreased for negative
      // Positive: 75% chance (was 25%), Negative: 5% chance (was 25%), No effect: 20% (was 50%)
      if (roll < 0.75) {
        // Positive effect - shorter duration (4s instead of 7s)
        save.modifiers.spiderMult = 11.0;
        save.modifiers.spiderUntil = now() + 4000;
        _cachedPPS = null;
        _cachedPPC = null;
        toast('Spider blessing! All income x11 for 4s.', 'good');
        
        // Воспроизводим звук баффа от паука
        playSound('spiderBuff');
      } else if (roll < 0.80) {
                // Negative effect - shorter duration (12s instead of 36s)
                save.modifiers.spiderMult = 0.0001;
                save.modifiers.spiderUntil = now() + 12000;
                _cachedPPS = null;
                _cachedPPC = null;
                toast('Spider curse! All income x0.0001 for 12s.', 'bad');
                // Воспроизводим звук дебафа от паука
                playSound('debuff');
      } else {
        toast('Squished! No effect.', 'info');
        // Воспроизводим звук раздавленного паука
        playSound('spiderSquish');
      }
    } else {
      // Normal spider behavior
      if (roll < 0.25) {
        save.modifiers.spiderMult = 0.0001;
        save.modifiers.spiderUntil = now() + 36000;
        _cachedPPS = null;
        _cachedPPC = null;
        toast('Spider curse! All income x0.0001 for 36s.', 'bad');
        // Воспроизводим звук дебафа от паука
        playSound('debuff');
      } else if (roll < 0.50) {
        save.modifiers.spiderMult = 11.0;
        save.modifiers.spiderUntil = now() + 7000;
        _cachedPPS = null;
        _cachedPPC = null;
        toast('Spider blessing! All income x11 for 7s.', 'good');
        
        // Воспроизводим звук баффа от паука
        playSound('spiderBuff');
      } else {
        toast('Squished! No effect.', 'info');
        // Воспроизводим звук раздавленного паука
        playSound('spiderSquish');
      }
    }

    // Скрываем паука и останавливаем движение
    spiderEl.classList.add('hidden');
    _stopSpiderMovement();
    
    // XP за событие паука
    if (typeof addXPForSpider === 'function') {
      addXPForSpider();
    }
  });
}


// ensure spider stays inside viewport on resize
window.addEventListener('resize', () => {
  if (!spiderEl || spiderEl.classList.contains('hidden')) return;
  const { w, h } = _getSpiderSize();
  const left = parseInt(spiderEl.style.left || 0, 10);
  const top = parseInt(spiderEl.style.top || 0, 10);
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);
  if (left > maxLeft) spiderEl.style.left = maxLeft + 'px';
  if (top > maxTop) spiderEl.style.top = maxTop + 'px';
});

// ======= Angry Barmatun (similar to spider) =======
const _angryBarmatunState = {
  moveTimer: null,
  moving: false,
  aliveUntil: 0,
  escapeTimer: null,
  cachedSize: { w: 64, h: 64 }, // Кэшированный размер
  imgCreated: false // Флаг создания img элемента
};

// Инициализация img элемента для барматуна (один раз при загрузке)
function _initAngryBarmatunImage() {
  if (!angryBarmatunEl || _angryBarmatunState.imgCreated) return;
  const img = document.createElement('img');
  img.src = 'icons/barmatun.png';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.imageRendering = 'pixelated';
  img.style.imageRendering = '-moz-crisp-edges';
  img.style.imageRendering = 'crisp-edges';
  img.style.display = 'block';
  img.style.pointerEvents = 'none';
  angryBarmatunEl.appendChild(img);
  _angryBarmatunState.imgCreated = true;
  
  // Устанавливаем transition один раз
  angryBarmatunEl.style.transition = 'left 0.9s cubic-bezier(.22,.9,.35,1), top 0.9s cubic-bezier(.22,.9,.35,1), transform 0.25s ease';
  // GPU ускорение
  angryBarmatunEl.style.willChange = 'transform, left, top';
  angryBarmatunEl.style.backfaceVisibility = 'hidden';
  angryBarmatunEl.style.transform = 'translateZ(0)';
  
  // Кэшируем размер после создания элемента
  requestAnimationFrame(() => {
    if (angryBarmatunEl) {
      const r = angryBarmatunEl.getBoundingClientRect();
      _angryBarmatunState.cachedSize = { w: Math.max(1, r.width || 64), h: Math.max(1, r.height || 64) };
    }
  });
}

// compute angry barmatun size safely (использует кэш)
function _getAngryBarmatunSize() {
  return _angryBarmatunState.cachedSize;
}

// place angry barmatun at a random position within viewport
function _placeAngryBarmatunRandom() {
  if (!angryBarmatunEl) return;
  const { w, h } = _getAngryBarmatunSize();
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);
  angryBarmatunEl.style.left = _randInt(0, maxLeft) + 'px';
  angryBarmatunEl.style.top = _randInt(0, maxTop) + 'px';
  angryBarmatunEl.style.transform = `rotate(${_randInt(-12,12)}deg)`;
}

// move angry barmatun once to a new random point
function _moveAngryBarmatunOnce() {
  if (!angryBarmatunEl || angryBarmatunEl.classList.contains('hidden')) return;
  const { w, h } = _getAngryBarmatunSize();
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);

  // Используем сохраненную позицию вместо getBoundingClientRect()
  const curLeft = parseInt(angryBarmatunEl.style.left || '0', 10);
  const curTop = parseInt(angryBarmatunEl.style.top || '0', 10);
  let nx, ny, attempts = 0;
  do {
    nx = _randInt(0, maxLeft);
    ny = _randInt(0, maxTop);
    attempts++;
  } while (attempts < 8 && Math.hypot(nx - curLeft, ny - curTop) < Math.max(w,h) * 0.5);

  angryBarmatunEl.style.left = nx + 'px';
  angryBarmatunEl.style.top = ny + 'px';
  angryBarmatunEl.style.transform = `rotate(${_randInt(-18,18)}deg)`;
  setTimeout(()=> {
    if (!angryBarmatunEl.classList.contains('hidden')) angryBarmatunEl.style.transform = 'rotate(0deg)';
  }, 900);
}

// start periodic movement while angry barmatun visible
function _startAngryBarmatunMovement() {
  if (_angryBarmatunState.moving) return;
  _angryBarmatunState.moving = true;
  const schedule = () => {
    if (!_angryBarmatunState.moving) return;
    const delay = _randInt(1200, 3200);
    _angryBarmatunState.moveTimer = setTimeout(() => {
      _moveAngryBarmatunOnce();
      schedule();
    }, delay);
  };
  schedule();
}

// stop movement and clear timers
function _stopAngryBarmatunMovement() {
  _angryBarmatunState.moving = false;
  if (_angryBarmatunState.moveTimer) {
    clearTimeout(_angryBarmatunState.moveTimer);
    _angryBarmatunState.moveTimer = null;
  }
}

// draw angry barmatun (evil Satan face - pixel art style)
function drawAngryBarmatun(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  
  // Pixel art style - use imageSmoothingEnabled = false for crisp pixels
  ctx.imageSmoothingEnabled = false;
  
  // Dark red/demonic colors
  const skinDark = '#4a1a1a';
  const skinMid = '#6b2a2a';
  const skinLight = '#8b3a3a';
  const eyeGlow = '#ff0000';
  const eyeCore = '#ff6666';
  const hornColor = '#2a1a1a';
  const hornHighlight = '#4a3a3a';
  const mouthDark = '#1a0000';
  const mouthRed = '#cc0000';
  const shadow = '#2a0a0a';
  
  // Face shape (slightly angular, demonic)
  // Head base
  ctx.fillStyle = skinDark;
  ctx.fillRect(16, 12, 32, 40);
  
  // Face contour (wider at top, narrower at chin)
  ctx.fillStyle = skinMid;
  ctx.fillRect(18, 14, 28, 36);
  ctx.fillRect(20, 16, 24, 32);
  
  // Forehead/cheeks
  ctx.fillStyle = skinLight;
  ctx.fillRect(22, 18, 20, 8);
  ctx.fillRect(20, 26, 24, 6);
  
  // Horns (Satan's horns)
  ctx.fillStyle = hornColor;
  // Left horn
  ctx.fillRect(14, 8, 6, 12);
  ctx.fillRect(12, 10, 4, 8);
  ctx.fillRect(16, 6, 4, 6);
  // Right horn
  ctx.fillRect(44, 8, 6, 12);
  ctx.fillRect(48, 10, 4, 8);
  ctx.fillRect(44, 6, 4, 6);
  // Horn highlights
  ctx.fillStyle = hornHighlight;
  ctx.fillRect(15, 9, 3, 5);
  ctx.fillRect(45, 9, 3, 5);
  
  // Angry eyebrows (thick, angled down)
  ctx.fillStyle = '#1a0000';
  // Left eyebrow
  ctx.fillRect(18, 20, 8, 3);
  ctx.fillRect(20, 18, 6, 2);
  // Right eyebrow
  ctx.fillRect(38, 20, 8, 3);
  ctx.fillRect(38, 18, 6, 2);
  
  // Evil eyes (glowing red)
  // Left eye
  ctx.fillStyle = eyeGlow;
  ctx.fillRect(20, 26, 8, 10);
  ctx.fillStyle = eyeCore;
  ctx.fillRect(22, 28, 4, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(23, 29, 2, 2); // White highlight
  // Right eye
  ctx.fillStyle = eyeGlow;
  ctx.fillRect(36, 26, 8, 10);
  ctx.fillStyle = eyeCore;
  ctx.fillRect(38, 28, 4, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(39, 29, 2, 2); // White highlight
  
  // Nose (angular, demonic)
  ctx.fillStyle = skinDark;
  ctx.fillRect(30, 32, 4, 8);
  ctx.fillRect(28, 34, 8, 4);
  // Nostrils
  ctx.fillStyle = shadow;
  ctx.fillRect(29, 36, 2, 2);
  ctx.fillRect(33, 36, 2, 2);
  
  // Mouth (evil grin with sharp teeth)
  ctx.fillStyle = mouthDark;
  ctx.fillRect(24, 42, 16, 6);
  ctx.fillStyle = mouthRed;
  ctx.fillRect(26, 44, 12, 4);
  // Teeth (sharp)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(28, 42, 2, 3);
  ctx.fillRect(32, 42, 2, 3);
  ctx.fillRect(36, 42, 2, 3);
  
  // Facial shadows/contours
  ctx.fillStyle = shadow;
  ctx.fillRect(20, 30, 2, 4);
  ctx.fillRect(42, 30, 2, 4);
  ctx.fillRect(28, 40, 2, 2);
  ctx.fillRect(34, 40, 2, 2);
  
  // Chin/jawline
  ctx.fillStyle = skinDark;
  ctx.fillRect(22, 48, 20, 4);
  
  // Re-enable smoothing for other elements if needed
  ctx.imageSmoothingEnabled = true;
}

// spawn angry barmatun
function spawnAngryBarmatun() {
  if (!angryBarmatunEl) return;

  // Инициализируем img элемент один раз (если еще не создан)
  _initAngryBarmatunImage();

  // ensure angry barmatun is visible and positioned inside viewport
  _placeAngryBarmatunRandom();
  angryBarmatunEl.classList.remove('hidden');

  // mark alive window
  _angryBarmatunState.aliveUntil = now() + 30000; // 30s
  _startAngryBarmatunMovement();
  toast('Angry Barmatun appears...', 'warn');
  
  // Воспроизводим звук появления барматуна
  playSound('barmatun');

  // clear old timer if exists
  if (_angryBarmatunState.escapeTimer) {
    clearTimeout(_angryBarmatunState.escapeTimer);
    _angryBarmatunState.escapeTimer = null;
  }

  // create new timer
  _angryBarmatunState.escapeTimer = setTimeout(() => {
    _angryBarmatunState.escapeTimer = null;
    if (!angryBarmatunEl || angryBarmatunEl.classList.contains('hidden')) return;
    if (now() < _angryBarmatunState.aliveUntil) return;
    angryBarmatunEl.classList.add('hidden');
    _stopAngryBarmatunMovement();
    _angryBarmatunState.aliveUntil = 0;
    toast('Angry Barmatun left in anger!', 'info');
  }, 30000);
}

// spawn scheduling - same as spider (4-10 minutes)
let nextAngryBarmatunTs = now() + _randInt(240000, 600000);
function maybeSpawnAngryBarmatun() {
  const t = now();
  // Angry Barmatun can only spawn if click level is 250 or higher
  if (t >= nextAngryBarmatunTs && save && save.click && save.click.level >= 250) {
    spawnAngryBarmatun();
    nextAngryBarmatunTs = t + _randInt(240000, 600000);
  }
}

// click handler for angry barmatun
if (angryBarmatunEl) {
  // Инициализируем img элемент и стили один раз при загрузке
  _initAngryBarmatunImage();
  
  angryBarmatunEl.addEventListener('click', () => {
    resetPassiveBoost(); // Reset passive boost when clicking angry barmatun
    // cancel escape timer
    if (_angryBarmatunState.escapeTimer) {
      clearTimeout(_angryBarmatunState.escapeTimer);
      _angryBarmatunState.escapeTimer = null;
    }
    _angryBarmatunState.aliveUntil = 0;

    // Reset streak
    save.streak.count = 0;
    save.streak.lastClickTs = 0;
    save.streak.multiplier = 1.0;

    const roll = Math.random();
    if (roll < 0.5) {
      // 50% chance: Angry - reduce all income by 50% for 36 seconds (3x original)
      save.modifiers.angryBarmatunIncomeReduction = now() + 36000;
      _cachedPPS = null;
      _cachedPPC = null;
      toast('Angry Barmatun is furious! All income reduced by 50% for 36s.', 'bad');
      
      // Воспроизводим звук дебафа от барматуна
      playSound('debuff');
    } else {
      // 50% chance: Power of anger - activates random click multiplier effect
      // Each click will get a random multiplier (x0.1 to x100) for 12 seconds
      save.modifiers.angryBarmatunUntil = now() + 18000; // 18 seconds (уменьшено в 2 раза)
      save.modifiers.angryBarmatunMult = 1.0; // Reset, will be generated per click
      toast('Angry Barmatun grants his wrath! Each click gets a random multiplier (x0.001 to x100) for 18s.', 'good');
      
      // Воспроизводим звук положительного баффа от барматуна
      playSound('barmatunBuff');
    }

    // Hide angry barmatun and stop movement
    angryBarmatunEl.classList.add('hidden');
    _stopAngryBarmatunMovement();
    
    // XP за событие барматуна
    if (typeof addXPForBarmatun === 'function') {
      addXPForBarmatun();
    }
  });
}

// ensure angry barmatun stays inside viewport on resize
window.addEventListener('resize', () => {
  if (!angryBarmatunEl || angryBarmatunEl.classList.contains('hidden')) return;
  const { w, h } = _getAngryBarmatunSize();
  const left = parseInt(angryBarmatunEl.style.left || 0, 10);
  const top = parseInt(angryBarmatunEl.style.top || 0, 10);
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);
  if (left > maxLeft) angryBarmatunEl.style.left = maxLeft + 'px';
  if (top > maxTop) angryBarmatunEl.style.top = maxTop + 'px';
});

// ======= Elf Archer =======
const _elfArcherState = {
  moving: false,
  aliveUntil: 0,
  shooting: false,
  position: 'entering', // 'entering', 'positioned', 'shooting', 'leaving'
  shootTimer: null,
  escapeTimer: null
};

// Update elf archer image based on state
// state: 'entering' (elf_go.png), 'shooting' (elf_f.png), 'leaving' (elf_go.png mirrored)
function updateElfArcherImage(state = 'entering') {
  if (!elfArcherEl) return;
  
  let img = elfArcherEl.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.imageRendering = 'pixelated';
    img.style.imageRendering = '-moz-crisp-edges';
    img.style.imageRendering = 'crisp-edges';
    img.style.display = 'block';
    elfArcherEl.innerHTML = '';
    elfArcherEl.appendChild(img);
  }
  
  if (state === 'shooting') {
    img.src = 'icons/elf_f.png';
    img.style.transform = 'scaleX(1)'; // Normal orientation
  } else if (state === 'leaving') {
    img.src = 'icons/elf_go.png';
    img.style.transform = 'scaleX(-1)'; // Mirrored horizontally
  } else {
    // entering or moving
    img.src = 'icons/elf_go.png';
    img.style.transform = 'scaleX(1)'; // Normal orientation
  }
}

// Draw elf archer (pixel art) - DEPRECATED, use updateElfArcherImage instead
// pose: 'standing', 'walking1', 'walking2', 'kneeling'
function drawElfArcher(canvas, pose = 'standing') {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  ctx.imageSmoothingEnabled = false;
  
  const skinColor = '#f5d5a3';
  const hairColor = '#8b7355';
  const tunicColor = '#4a8a4a';
  const tunicDark = '#2a5a2a';
  const bowColor = '#8b4513';
  const arrowColor = '#d4a574';
  
  if (pose === 'kneeling') {
    // Kneeling position (on one knee)
    // Body (tunic)
    ctx.fillStyle = tunicColor;
    ctx.fillRect(20, 30, 24, 28);
    ctx.fillStyle = tunicDark;
    ctx.fillRect(22, 32, 20, 24);
    
    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(32, 20, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(32, 18, 11, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(24, 18, 16, 4);
    
    // Pointed ears
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(24, 18);
    ctx.lineTo(22, 14);
    ctx.lineTo(24, 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 18);
    ctx.lineTo(42, 14);
    ctx.lineTo(40, 16);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(28, 20, 2, 2);
    ctx.fillRect(34, 20, 2, 2);
    
    // Bow (held) - draw as curved arc, not circle
    ctx.strokeStyle = bowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Draw bow arc (curved shape)
    ctx.arc(48, 25, 12, Math.PI * 0.3, Math.PI * 0.7, false);
    ctx.stroke();
    // Bow grip in center
    ctx.fillStyle = bowColor;
    ctx.fillRect(46, 23, 4, 4);
    // Bowstring (line from top to bottom of bow)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48 + 12 * Math.cos(Math.PI * 0.3), 25 - 12 * Math.sin(Math.PI * 0.3));
    ctx.lineTo(48 + 12 * Math.cos(Math.PI * 0.7), 25 - 12 * Math.sin(Math.PI * 0.7));
    ctx.stroke();
    
    // Arrow
    ctx.fillStyle = arrowColor;
    ctx.fillRect(36, 22, 12, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(36, 22, 2, 2);
    
    // Legs (kneeling)
    ctx.fillStyle = tunicColor;
    ctx.fillRect(22, 50, 8, 12);
    ctx.fillRect(34, 50, 8, 12);
    ctx.fillStyle = tunicDark;
    ctx.fillRect(24, 52, 4, 8);
    ctx.fillRect(36, 52, 4, 8);
  } else if (pose === 'walking1') {
    // Walking pose 1 - left leg forward
    // Body (tunic)
    ctx.fillStyle = tunicColor;
    ctx.fillRect(20, 25, 24, 30);
    ctx.fillStyle = tunicDark;
    ctx.fillRect(22, 27, 20, 26);
    
    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(32, 15, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(32, 13, 11, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(24, 13, 16, 4);
    
    // Pointed ears
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(24, 13);
    ctx.lineTo(22, 9);
    ctx.lineTo(24, 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 13);
    ctx.lineTo(42, 9);
    ctx.lineTo(40, 11);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(28, 15, 2, 2);
    ctx.fillRect(34, 15, 2, 2);
    
    // Bow (held) - draw as curved arc, not circle
    ctx.strokeStyle = bowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Draw bow arc (curved shape)
    ctx.arc(48, 20, 12, Math.PI * 0.3, Math.PI * 0.7, false);
    ctx.stroke();
    // Bow grip in center
    ctx.fillStyle = bowColor;
    ctx.fillRect(46, 18, 4, 4);
    // Bowstring (line from top to bottom of bow)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48 + 12 * Math.cos(Math.PI * 0.3), 20 - 12 * Math.sin(Math.PI * 0.3));
    ctx.lineTo(48 + 12 * Math.cos(Math.PI * 0.7), 20 - 12 * Math.sin(Math.PI * 0.7));
    ctx.stroke();
    
    // Arrow
    ctx.fillStyle = arrowColor;
    ctx.fillRect(36, 17, 12, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(36, 17, 2, 2);
    
    // Legs - left forward, right back
    ctx.fillStyle = tunicColor;
    ctx.fillRect(20, 48, 8, 14); // Left leg forward
    ctx.fillRect(36, 50, 8, 12); // Right leg back
    ctx.fillStyle = tunicDark;
    ctx.fillRect(22, 50, 4, 10);
    ctx.fillRect(38, 52, 4, 8);
  } else if (pose === 'walking2') {
    // Walking pose 2 - right leg forward
    // Body (tunic)
    ctx.fillStyle = tunicColor;
    ctx.fillRect(20, 25, 24, 30);
    ctx.fillStyle = tunicDark;
    ctx.fillRect(22, 27, 20, 26);
    
    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(32, 15, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(32, 13, 11, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(24, 13, 16, 4);
    
    // Pointed ears
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(24, 13);
    ctx.lineTo(22, 9);
    ctx.lineTo(24, 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 13);
    ctx.lineTo(42, 9);
    ctx.lineTo(40, 11);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(28, 15, 2, 2);
    ctx.fillRect(34, 15, 2, 2);
    
    // Bow (held) - draw as curved arc, not circle
    ctx.strokeStyle = bowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Draw bow arc (curved shape)
    ctx.arc(48, 20, 12, Math.PI * 0.3, Math.PI * 0.7, false);
    ctx.stroke();
    // Bow grip in center
    ctx.fillStyle = bowColor;
    ctx.fillRect(46, 18, 4, 4);
    // Bowstring (line from top to bottom of bow)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48 + 12 * Math.cos(Math.PI * 0.3), 20 - 12 * Math.sin(Math.PI * 0.3));
    ctx.lineTo(48 + 12 * Math.cos(Math.PI * 0.7), 20 - 12 * Math.sin(Math.PI * 0.7));
    ctx.stroke();
    
    // Arrow
    ctx.fillStyle = arrowColor;
    ctx.fillRect(36, 17, 12, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(36, 17, 2, 2);
    
    // Legs - right forward, left back
    ctx.fillStyle = tunicColor;
    ctx.fillRect(36, 48, 8, 14); // Right leg forward
    ctx.fillRect(20, 50, 8, 12); // Left leg back
    ctx.fillStyle = tunicDark;
    ctx.fillRect(38, 50, 4, 10);
    ctx.fillRect(22, 52, 4, 8);
  } else {
    // Standing position
    // Body (tunic)
    ctx.fillStyle = tunicColor;
    ctx.fillRect(20, 25, 24, 30);
    ctx.fillStyle = tunicDark;
    ctx.fillRect(22, 27, 20, 26);
    
    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(32, 15, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(32, 13, 11, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(24, 13, 16, 4);
    
    // Pointed ears
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(24, 13);
    ctx.lineTo(22, 9);
    ctx.lineTo(24, 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 13);
    ctx.lineTo(42, 9);
    ctx.lineTo(40, 11);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(28, 15, 2, 2);
    ctx.fillRect(34, 15, 2, 2);
    
    // Bow (held) - draw as curved arc, not circle
    ctx.strokeStyle = bowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Draw bow arc (curved shape)
    ctx.arc(48, 20, 12, Math.PI * 0.3, Math.PI * 0.7, false);
    ctx.stroke();
    // Bow grip in center
    ctx.fillStyle = bowColor;
    ctx.fillRect(46, 18, 4, 4);
    // Bowstring (line from top to bottom of bow)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48 + 12 * Math.cos(Math.PI * 0.3), 20 - 12 * Math.sin(Math.PI * 0.3));
    ctx.lineTo(48 + 12 * Math.cos(Math.PI * 0.7), 20 - 12 * Math.sin(Math.PI * 0.7));
    ctx.stroke();
    
    // Arrow
    ctx.fillStyle = arrowColor;
    ctx.fillRect(36, 17, 12, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(36, 17, 2, 2);
    
    // Legs
    ctx.fillStyle = tunicColor;
    ctx.fillRect(22, 48, 8, 14);
    ctx.fillRect(34, 48, 8, 14);
    ctx.fillStyle = tunicDark;
    ctx.fillRect(24, 50, 4, 10);
    ctx.fillRect(36, 50, 4, 10);
  }
  
  ctx.imageSmoothingEnabled = true;
}

// Spawn elf archer
function spawnElfArcher() {
  if (!elfArcherEl || !clickBtn) return;
  
  // Create/update img for elf
  updateElfArcherImage('entering');
  
  // Start from right side of screen
  elfArcherEl.style.left = window.innerWidth + 'px';
  elfArcherEl.style.top = (window.innerHeight - 64) + 'px';
  elfArcherEl.classList.remove('hidden');
  
  // Воспроизводим звук появления эльфа лучника
  playSound('archer');
  
  // Set transition for smooth movement (устанавливаем один раз, не проверяем каждый раз)
  if (!elfArcherEl.style.transition || !elfArcherEl.style.transition.includes('left')) {
    elfArcherEl.style.transition = 'left 2s ease-out, top 2s ease-out, transform 0.3s ease';
  }
  
  // Move to position with walking animation
  _elfArcherState.position = 'entering';
  _elfArcherState.moving = true;
  _elfArcherState.aliveUntil = now() + 20000; // 20s total
  
  // Get uber card position - используем один requestAnimationFrame вместо двойного
  requestAnimationFrame(() => {
    let targetX, targetY;
    const card = document.getElementById('uber-card');
    if (card) {
      // Кэшируем getBoundingClientRect() результат
      const cardRect = card.getBoundingClientRect();
      // Check if card is visible (has dimensions and is in viewport)
      if (cardRect.width > 0 && cardRect.height > 0 && 
          cardRect.top < window.innerHeight && cardRect.bottom > 0) {
        // Position elf at the bottom edge of the uber card, centered horizontally
        targetX = cardRect.left + (cardRect.width / 2) - 32; // Center of card minus half elf width
        targetY = cardRect.bottom - 32; // Bottom edge of card, kneeling position
      } else {
        // Card exists but not visible, use default position (center bottom)
        targetX = window.innerWidth / 2 - 32; // Center horizontally
        targetY = window.innerHeight - 100; // Near bottom
      }
    } else {
      // Default position if uber card doesn't exist (center bottom)
      targetX = window.innerWidth / 2 - 32; // Center horizontally
      targetY = window.innerHeight - 100; // Near bottom
    }
    
    elfArcherEl.style.left = targetX + 'px';
    elfArcherEl.style.top = targetY + 'px';
    
    // After reaching position, prepare to shoot
    setTimeout(() => {
      if (!elfArcherEl || elfArcherEl.classList.contains('hidden')) return;
      _elfArcherState.position = 'positioned';
      
      // Wait a moment, then shoot
      setTimeout(() => {
        if (!elfArcherEl || elfArcherEl.classList.contains('hidden')) return;
        _elfArcherState.position = 'shooting';
        updateElfArcherImage('shooting');
        _shootArrow();
      }, 1000);
    }, 2000);
  });
  
  toast('An elf archer appears...', 'info');
}

// Shoot arrow at click button
function _shootArrow() {
  if (!elfArcherEl || !clickBtn || elfArcherEl.classList.contains('hidden')) return;
  
  _elfArcherState.shooting = true;
  
  // Create arrow element
  const arrow = document.createElement('div');
  arrow.style.position = 'fixed';
  arrow.style.width = '20px';
  arrow.style.height = '2px';
  arrow.style.backgroundColor = '#d4a574';
  arrow.style.zIndex = '10000';
  arrow.style.pointerEvents = 'none';
  arrow.style.borderLeft = '4px solid #000000';
  
  const elfRect = elfArcherEl.getBoundingClientRect();
  const clickRect = clickBtn.getBoundingClientRect();
  
  const startX = elfRect.left + elfRect.width / 2;
  const startY = elfRect.top + elfRect.height / 2;
  const endX = clickRect.left + clickRect.width / 2;
  const endY = clickRect.top + clickRect.height / 2;
  
  arrow.style.left = startX + 'px';
  arrow.style.top = startY + 'px';
  
  const angle = Math.atan2(endY - startY, endX - startX);
  arrow.style.transform = `rotate(${angle}rad)`;
  arrow.style.transformOrigin = 'left center';
  
  document.body.appendChild(arrow);
  
  // Animate arrow
  arrow.style.transition = 'left 0.8s linear, top 0.8s linear';
  setTimeout(() => {
    arrow.style.left = endX + 'px';
    arrow.style.top = endY + 'px';
  }, 10);
  
  // Check hit after animation
  setTimeout(() => {
    arrow.remove();
    _elfArcherState.shooting = false;
    
    // 15% chance to hit (increased from 5% - 3x increase)
    const hit = Math.random() < 0.15;
    
    if (hit) {
      // Hit! Apply x13.2 multiplier for 11 seconds (reduced from x33 - 2.5x decrease: 33/2.5 = 13.2)
      save.modifiers.elfArcherMult = 13.2;
      save.modifiers.elfArcherUntil = now() + 11000;
      _cachedPPC = null;
      toast('Elf archer hit! Click income x13.2 for 11 seconds!', 'good');
      renderTopStats(); // Update income display
    } else {
      toast('Elf archer missed!', 'info');
    }
    
    // Elf leaves after shooting
    setTimeout(() => {
      if (!elfArcherEl || elfArcherEl.classList.contains('hidden')) return;
      _elfArcherState.position = 'leaving';
      updateElfArcherImage('leaving');
      elfArcherEl.style.transition = 'left 2s ease-in';
      elfArcherEl.style.left = window.innerWidth + 'px';
      
      setTimeout(() => {
        if (elfArcherEl) {
          elfArcherEl.classList.add('hidden');
          _elfArcherState.moving = false;
          _elfArcherState.aliveUntil = 0;
        }
      }, 2000);
    }, 500);
  }, 800);
}

// Spawn scheduling (every 5-10 minutes)
let nextElfArcherTs = now() + _randInt(300000, 600000);
function maybeSpawnElfArcher() {
  const t = now();
  if (t >= nextElfArcherTs) {
    spawnElfArcher();
    nextElfArcherTs = t + _randInt(300000, 600000);
  }
}

// Click handler for elf archer - просто отпугиваем его
if (elfArcherEl) {
  elfArcherEl.addEventListener('click', () => {
    if (_elfArcherState.shooting) return; // Can't interact while shooting
    resetPassiveBoost(); // Reset passive boost when clicking elf archer
    
    // Cancel any timers
    if (_elfArcherState.shootTimer) {
      clearTimeout(_elfArcherState.shootTimer);
      _elfArcherState.shootTimer = null;
    }
    if (_elfArcherState.escapeTimer) {
      clearTimeout(_elfArcherState.escapeTimer);
      _elfArcherState.escapeTimer = null;
    }
    
    toast('Elf archer scared away!', 'info');
    
    // XP за событие эльфа
    if (typeof addXPForElfArcher === 'function') {
      addXPForElfArcher();
    }
    
    _elfArcherState.aliveUntil = 0;
    _elfArcherState.moving = false;
    _elfArcherState.position = 'leaving';
    
    // Update image to leaving state (mirrored)
    updateElfArcherImage('leaving');
    
    // Elf disappears
    elfArcherEl.style.transition = 'left 1.5s ease-in';
    elfArcherEl.style.left = window.innerWidth + 'px';
    
    setTimeout(() => {
      if (elfArcherEl) {
        elfArcherEl.classList.add('hidden');
      }
    }, 1500);
  });
}

// ======= Ticker =======
let _lastAchievementCheck = 0;
let _lastProfitWithoutTaxUntil = 0; // Отслеживаем окончание бафа Profit Without Tax
let _wasProfitWithoutTaxActive = false; // Флаг активности бафа в предыдущем тике
let _wasRepairActive = false; // Флаг активности Repair бафа
let _wasLazyClickActive = false; // Флаг активности Lazy Click бафа
let _wasEngineerActive = false; // Флаг активности Engineer бафа
let _wasClickMadnessActive = false; // Флаг активности Click Madness бафа
let _wasNoGoldenActive = false; // Флаг активности No Golden бафа
let _wasAlwaysGoldenActive = false; // Флаг активности Always Golden бафа
let _wasFastRepairActive = false; // Флаг активности Fast Repair бафа
let _wasPassiveBoostActive = false; // Флаг активности Passive Boost бафа
let _wasMasterBuilderActive = false; // Флаг активности Master Builder бафа
let _wasSpiderBuffActive = false; // Флаг активности Spider Buff бафа
function tick() {
  if (!save) return;
  const t = now(); // Кэшируем now() один раз для всего тика
  const dt = (t - (save.lastTick || t)) / 1000; // seconds
  save.lastTick = t;
  
  // Защита от накопления событий после пробуждения компьютера/браузера
  // Если прошло больше 5 минут с последнего тика, сбрасываем таймеры спавна
  const MAX_DT_FOR_SPAWN = 300; // 5 минут в секундах
  if (dt > MAX_DT_FOR_SPAWN) {
    // Сбрасываем таймеры спавна, чтобы не спавнить все события сразу
    const resetDelay = _randInt(60000, 180000); // 1-3 минуты задержка
    nextSpiderTs = t + resetDelay;
    nextAngryBarmatunTs = t + resetDelay + _randInt(60000, 120000); // Разносим по времени
    nextElfArcherTs = t + resetDelay + _randInt(120000, 180000);
    // Король использует setTimeout, поэтому его таймер уже должен быть сброшен при пробуждении
    // Но на всякий случай пересоздадим его
    if (_kingState.spawnTimer) {
      clearTimeout(_kingState.spawnTimer);
      scheduleNextKing();
    }
    // Сбрасываем таймер генерала
    if (typeof scheduleNextGeneral === 'function' && save.battlefield) {
      const resetDelay = _randInt(60000, 180000);
      save.battlefield.nextGeneralSpawn = t + resetDelay;
    }
    console.log('Large time gap detected, reset spawn timers to prevent simultaneous events');
    return; // Пропускаем проверки спавна в этом тике
  }

  // Treasury regen
  if (save.treasury) {
    const act = save.treasury.actions;
    // Buff 5: Treasury doesn't fill passively
    const noPassiveRegen = act && act.treasuryNoPassiveUntil > t;
    if (!noPassiveRegen) {
      const dtreasury = (t - (save.treasury.lastTs || t)) / 1000;
      save.treasury.lastTs = t;
      if (dtreasury > 0) {
        const baseRegen = save.treasury.regenPerSec || 1;
        const actualRegen = baseRegen;
        gainTreasury(actualRegen * dtreasury);
      }
    }
    
    // Buff 4: Passive income boost (1% every 7 seconds, up to 56%)
    let passiveBoostChanged = false;
    if (act && act.passiveBoostUntil > t) {
      const sevenSecMs = 7000; // 7 seconds
      const lastTick = act.passiveBoostLastTick || t;
      const oldLevel = act.passiveBoostLevel || 0;
      if (t - lastTick >= sevenSecMs) {
        act.passiveBoostLevel = Math.min((act.passiveBoostLevel || 0) + 1, 56);
        act.passiveBoostLastTick = t;
        if (act.passiveBoostLevel !== oldLevel) {
          passiveBoostChanged = true;
          // Инвалидируем кэш при изменении уровня пассивного буста (влияет на PPS)
          _cachedPPS = null;
        }
      }
    } else if (act) {
      const oldLevel = act.passiveBoostLevel || 0;
      act.passiveBoostLevel = 0;
      if (oldLevel !== 0) {
        passiveBoostChanged = true;
        // Инвалидируем кэш при сбросе пассивного буста (влияет на PPS)
        _cachedPPS = null;
      }
    }
    
    // Update UI immediately if passive boost changed
    if (passiveBoostChanged) {
      renderTopStats(); // Update PPS display immediately
      // Update button description if in Uber mode
      const isInUberMode = save.uber && save.uber.max !== 19;
      if (isInUberMode) {
        const passiveBoostBtn = document.querySelector('#treasury-actions-row2 .btn[data-btn-id="passiveBoost"]');
        if (passiveBoostBtn) {
          const tooltip = passiveBoostBtn.querySelector('.tooltip');
          if (tooltip) {
            const effectLine = tooltip.querySelector('.tooltip-line > div');
            if (effectLine) {
              const currentBoost = Math.min(act.passiveBoostLevel || 0, 56);
              effectLine.textContent = `Passive income increases by 1% every 7 minutes (current: +${currentBoost}%).`;
            }
          }
        }
      }
    }
    
    // Profit Without Tax: ломаем здания по окончании бафа
    const currentProfitUntil = act.profitWithoutTaxUntil || 0;
    const isActive = currentProfitUntil > t; // Активно сейчас
    
    // Проверяем момент перехода: если в предыдущем тике баф был активен (_wasProfitWithoutTaxActive),
    // а сейчас не активен (!isActive), значит баф только что закончился
    if (_wasProfitWithoutTaxActive && !isActive) {
      // Баф только что закончился - ломаем здания
      breakRandomBuildings(5, 936000);
      // Обновляем UI чтобы показать таймеры сразу
      renderAll();
    }
    
    // Обновляем флаг активности для следующего тика (ВАЖНО: после проверки!)
    _wasProfitWithoutTaxActive = isActive;
    
    // Profit Without Tax debuff: пассивный доход -30% на 60 сек по окончании
    if (_wasProfitWithoutTaxActive && !isActive) {
      save.modifiers.profitWithoutTaxDebuffPPSUntil = t + 60000;
      _cachedPPS = null;
    }

    // Buff 3: Fast Repair - ускоряет восстановление зданий в 2 раза
    const fastRepairActive = act && act.fastRepairUntil > t;
    if (fastRepairActive) {
      save.modifiers.breakChanceMult = 9.0; // Breaks 9x more often
      // Ускоряем восстановление уже сломанных зданий в 2 раза
      // За каждую секунду реального времени проходит 2 секунды времени восстановления
      // Это означает, что за dt секунд реального времени должно пройти dt * 2 секунд времени восстановления
      // Время естественным образом проходит (now() увеличивается на dt * 1000 мс)
      // Мы дополнительно уменьшаем blockedUntil на dt * 1000 мс, чтобы ускорить в 2 раза
      if (dt > 0 && dt < 10) { // Проверяем, что dt разумный (не слишком большой)
        const fastRepairSpeed = dt * 1000; // Дополнительное уменьшение времени за этот тик (в миллисекундах)
        save.buildings.forEach(b => {
          if (b.blockedUntil > t) {
            // Уменьшаем blockedUntil на fastRepairSpeed миллисекунд дополнительно
            // Время естественным образом проходит: now() увеличивается на dt * 1000
            // Мы дополнительно уменьшаем blockedUntil на dt * 1000
            // Итого: оставшееся время уменьшается на dt * 2000 мс за dt секунд реального времени
            // Это означает, что за 1 секунду реального времени проходит 2 секунды времени восстановления
            const oldBlockedUntil = b.blockedUntil;
            b.blockedUntil = Math.max(t, b.blockedUntil - fastRepairSpeed);
            // Отладочная информация (можно убрать позже)
            // if (oldBlockedUntil !== b.blockedUntil) {
            //   console.log(`Fast Repair: reduced repair time by ${fastRepairSpeed}ms`);
            // }
          }
        });
      }
    }
    
    // Engineer effect
    const engineerActive = save.treasury.actions.engineerUntil > t;
    if (engineerActive) {
      if (!fastRepairActive) {
        save.modifiers.breakChanceMult = 0.34; // -66%
        save.modifiers.repairTimeMult = 2.0;
      }
    } else {
      if (!fastRepairActive) {
        save.modifiers.breakChanceMult = 1.0;
        save.modifiers.repairTimeMult = 1.0;
      }
      // Engineer debuff: пассивный доход -25% на 90 сек по окончании
      if (_wasEngineerActive && !engineerActive) {
        save.modifiers.engineerDebuffPPSUntil = t + 90000;
        _cachedPPS = null;
      }
    }
    _wasEngineerActive = engineerActive;
    
    // Repair debuff tracking
    const repairActive = act && act.repairCd > t;
    if (!repairActive && _wasRepairActive) {
      // Repair debuff: пассивный доход -15% на 45 сек по окончании
      save.modifiers.repairDebuffPPSUntil = t + 45000;
      save.modifiers.repairDebuffCostMult = 1.0; // Сбрасываем модификатор стоимости
      _cachedPPS = null;
    } else if (repairActive) {
      save.modifiers.repairDebuffCostMult = 1.25; // Стоимость +25% во время эффекта
    } else {
      save.modifiers.repairDebuffCostMult = 1.0;
    }
    _wasRepairActive = repairActive;
    
    // Lazy Click debuff tracking
    const lazyClickActive = save.modifiers.lazyClickUntil > t;
    if (!lazyClickActive && _wasLazyClickActive) {
      // Lazy Click debuff: доход за клик -25% на 60 сек по окончании
      save.modifiers.lazyClickDebuffPPCUntil = t + 60000;
      save.modifiers.lazyClickDebuffPPSMult = 1.0; // Сбрасываем модификатор пассивного дохода
      _cachedPPC = null;
      _cachedPPS = null;
    } else if (!lazyClickActive) {
      save.modifiers.lazyClickDebuffPPSMult = 1.0;
    }
    _wasLazyClickActive = lazyClickActive;
    
    // Click Madness debuff tracking
    const clickMadnessActive = act && act.clickMadnessUntil > t;
    if (!clickMadnessActive && _wasClickMadnessActive) {
      // Click Madness debuff: доход за клик -50% на 120 сек + 3-5 зданий ломаются на 180 сек
      save.modifiers.clickMadnessDebuffPPCUntil = t + 120000;
      const breakCount = 3 + Math.floor(Math.random() * 3); // 3-5 зданий
      breakRandomBuildings(breakCount, 180000);
      _cachedPPC = null;
      renderAll();
    }
    _wasClickMadnessActive = clickMadnessActive;
    
    // No Golden debuff tracking (Uber mode)
    const noGoldenActive = act && act.noGoldenUntil > t;
    if (!noGoldenActive && _wasNoGoldenActive) {
      // No Golden debuff: 2-3 здания ломаются на 120 сек по окончании
      const breakCount = 2 + Math.floor(Math.random() * 2); // 2-3 здания
      breakRandomBuildings(breakCount, 120000);
      renderAll();
    }
    _wasNoGoldenActive = noGoldenActive;
    
    // Always Golden debuff tracking (Uber mode)
    const alwaysGoldenActive = act && act.alwaysGoldenUntil > t;
    if (!alwaysGoldenActive && _wasAlwaysGoldenActive) {
      // Always Golden debuff: кнопка не может стать золотой на 120 сек + доход за клик -35% на 90 сек
      save.modifiers.alwaysGoldenNoGoldenUntil = t + 120000;
      save.modifiers.alwaysGoldenDebuffPPCUntil = t + 90000;
      _cachedPPC = null;
    }
    _wasAlwaysGoldenActive = alwaysGoldenActive;
    
    // Fast Repair debuff tracking (Uber mode)
    if (!fastRepairActive && _wasFastRepairActive) {
      // Fast Repair debuff: +50% времени ремонта сломанным зданиям + 3-4 здания ломаются на 150 сек
      save.modifiers.fastRepairDebuffRepairMult = 1.5; // +50% времени ремонта
      const breakCount = 3 + Math.floor(Math.random() * 2); // 3-4 здания
      breakRandomBuildings(breakCount, 150000);
      save.modifiers.fastRepairDebuffBuildingsUntil = t + 150000;
      renderAll();
    } else if (fastRepairActive) {
      save.modifiers.fastRepairDebuffRepairMult = 1.0; // Сбрасываем во время бафа
    } else {
      // Применяем +50% времени ремонта только если есть сломанные здания и дебаф активен
      if (save.modifiers.fastRepairDebuffBuildingsUntil > t) {
        save.modifiers.fastRepairDebuffRepairMult = 1.5;
      } else {
        save.modifiers.fastRepairDebuffRepairMult = 1.0;
      }
    }
    _wasFastRepairActive = fastRepairActive;
    
    // Passive Boost debuff tracking (Uber mode)
    const passiveBoostActive = act && act.passiveBoostUntil > t;
    if (!passiveBoostActive && _wasPassiveBoostActive) {
      // Passive Boost debuff: пассивный доход -30% на 120 сек + доход за клик -25% на 90 сек + 2-3 здания ломаются на 180 сек
      save.modifiers.passiveBoostDebuffPPSUntil = t + 120000;
      save.modifiers.passiveBoostDebuffPPCUntil = t + 90000;
      const breakCount = 2 + Math.floor(Math.random() * 2); // 2-3 здания
      breakRandomBuildings(breakCount, 180000);
      _cachedPPS = null;
      _cachedPPC = null;
      renderAll();
    }
    _wasPassiveBoostActive = passiveBoostActive;
    
    // Master Builder debuff tracking (Uber mode)
    const masterBuilderActive = act && act.noBreakUntil > t;
    if (!masterBuilderActive && _wasMasterBuilderActive) {
      // Master Builder debuff: пассивный доход -40% на 120 сек + доход за клик -30% на 90 сек
      save.modifiers.masterBuilderDebuffPPSUntil = t + 120000;
      save.modifiers.masterBuilderDebuffPPCUntil = t + 90000;
      _cachedPPS = null;
      _cachedPPC = null;
    }
    _wasMasterBuilderActive = masterBuilderActive;
    
    // Spider Buff debuff tracking (Uber mode)
    const spiderBuffActive = act && act.spiderBuffUntil > t;
    if (!spiderBuffActive && _wasSpiderBuffActive) {
      // Spider Buff debuff: пассивный доход -20% на 90 сек + доход за клик -25% на 60 сек + 2-3 здания ломаются на 150 сек
      save.modifiers.spiderBuffDebuffPPSUntil = t + 90000;
      save.modifiers.spiderBuffDebuffPPCUntil = t + 60000;
      const breakCount = 2 + Math.floor(Math.random() * 2); // 2-3 здания
      breakRandomBuildings(breakCount, 150000);
      _cachedPPS = null;
      _cachedPPC = null;
      renderAll();
    }
    _wasSpiderBuffActive = spiderBuffActive;
  }

  // Обновляем перегрев кнопки клика
  updateClickHeat();
  
  // Обновляем дебаф от кликов (плавное восстановление каждые 200мс)
  // Передаем dt для плавного восстановления без рывков
  updateClickDebuff(dt);
  
  // Обновляем систему перелива дохода (возврат после 5 секунд без кликов)
  updateIncomeTransfer(dt);
  
  // Real-time income
  const pps = totalPPS();
  addPoints(pps * dt);

  // Отслеживаем время игры для достижений
  if (save.achievements && save.achievements.stats) {
    save.achievements.stats.totalPlayTime += dt * 1000; // в миллисекундах
    
    // Отслеживаем longest session
    if (save.statistics && save.statistics.sessionStartTime) {
      const sessionTime = t - save.statistics.sessionStartTime;
      if (sessionTime > (save.achievements.stats.longestSessionTime || 0)) {
        save.achievements.stats.longestSessionTime = sessionTime;
        save.achievements.stats.longestSession = sessionTime; // для совместимости
      }
    }
    
    // Проверяем достижения раз в секунду (не каждый тик)
    if (t - _lastAchievementCheck >= 1000) {
      checkAchievements();
      _lastAchievementCheck = t;
    }
  }

  // Spider spawn check
  maybeSpawnSpider();
  
  // Angry Barmatun spawn check
  maybeSpawnAngryBarmatun();
  
  // Elf Archer spawn check
  maybeSpawnElfArcher();
  
  // Проверка спавна генерала
  if (typeof checkGeneralSpawn === 'function') {
    checkGeneralSpawn();
  }
  
  // Обновление бафов
  if (typeof updateBuffModifiers === 'function') {
    updateBuffModifiers();
  }

  // Update UI (с дебаунсингом для производительности)
  // НЕ инвалидируем кэш PPS/PPC каждый тик - кэш будет инвалидирован только при реальных изменениях
  // Это значительно улучшает производительность, так как totalPPS/PPC вызываются часто
  debouncedRenderTopStats();
  debouncedRenderClick(); // Обновляем кнопку Click для автоматического снятия баффов/дебаффов
  renderEffects(); // Теперь с дебаунсингом внутри
  updateTreasuryActions(); // Оптимизированное обновление - только данные, без пересоздания DOM
  updateBuildingLevels(); // Обновляем уровни зданий в реальном времени (с дебаунсингом внутри)
  // Обновляем состояние кнопок (disabled/enabled) в зависимости от поинтов (с дебаунсингом внутри)
  updateButtonStates();
  
  // Update Passive Boost button description in real-time if active
  const isInUberMode = save.uber && save.uber.max !== 19;
  const act = save.treasury?.actions;
  if (isInUberMode && act && act.passiveBoostUntil > t) {
    const passiveBoostBtn = document.querySelector('#treasury-actions-row2 .btn[data-btn-id="passiveBoost"]');
    if (passiveBoostBtn) {
      const tooltip = passiveBoostBtn.querySelector('.tooltip');
      if (tooltip) {
        const effectLine = tooltip.querySelector('.tooltip-line > div');
        if (effectLine) {
          const currentBoost = Math.min(act.passiveBoostLevel || 0, 56);
          effectLine.textContent = `Passive income increases by 1% every 7 seconds (current: +${currentBoost}%).`;
        }
      }
    }
  }

  // Render some parts less often
}
setInterval(tick, 350); // ~2.86x per second - оптимизировано для производительности и плавности

// ======= FPS & Performance Monitor =======
let _fpsMonitor = {
  frameCount: 0,
  lastTime: performance.now(),
  fps: 0,
  frameTime: 0,
  samples: [] // для сглаживания
};

function updateFPSMonitor() {
  const now = performance.now();
  const delta = now - _fpsMonitor.lastTime;
  
  // Измеряем время кадра
  _fpsMonitor.frameTime = delta;
  
  // Добавляем в массив для сглаживания (последние 10 кадров)
  _fpsMonitor.samples.push(delta);
  if (_fpsMonitor.samples.length > 10) {
    _fpsMonitor.samples.shift();
  }
  
  // Вычисляем средний FPS за последние кадры
  const avgFrameTime = _fpsMonitor.samples.reduce((a, b) => a + b, 0) / _fpsMonitor.samples.length;
  _fpsMonitor.fps = Math.round(1000 / avgFrameTime);
  
  // Обновляем UI
  const fpsValueEl = document.getElementById('fps-value');
  const frameTimeValueEl = document.getElementById('frame-time-value');
  
  if (fpsValueEl && frameTimeValueEl) {
    // Обновляем FPS
    fpsValueEl.textContent = _fpsMonitor.fps;
    
    // Определяем цвет в зависимости от FPS
    fpsValueEl.className = 'fps-value';
    if (_fpsMonitor.fps >= 55) {
      fpsValueEl.classList.add('fps-excellent');
    } else if (_fpsMonitor.fps >= 45) {
      fpsValueEl.classList.add('fps-good');
    } else if (_fpsMonitor.fps >= 30) {
      fpsValueEl.classList.add('fps-warning');
    } else {
      fpsValueEl.classList.add('fps-bad');
    }
    
    // Обновляем время кадра
    const frameTime = Math.round(avgFrameTime * 10) / 10; // округляем до 0.1 мс
    frameTimeValueEl.textContent = frameTime.toFixed(1);
    
    // Определяем цвет в зависимости от времени кадра
    frameTimeValueEl.className = 'fps-value';
    if (frameTime < 18) {
      frameTimeValueEl.classList.add('fps-excellent');
    } else if (frameTime < 25) {
      frameTimeValueEl.classList.add('fps-good');
    } else if (frameTime < 35) {
      frameTimeValueEl.classList.add('fps-warning');
    } else {
      frameTimeValueEl.classList.add('fps-bad');
    }
  }
  
  _fpsMonitor.lastTime = now;
  requestAnimationFrame(updateFPSMonitor);
}

// Запускаем монитор FPS после загрузки страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    _fpsMonitor.lastTime = performance.now();
    requestAnimationFrame(updateFPSMonitor);
  });
} else {
  _fpsMonitor.lastTime = performance.now();
  requestAnimationFrame(updateFPSMonitor);
}

// ======= Endgame & caps =======
function checkUberUnlock() {
  if (!save) return;
  
  // Если уже разблокировано, просто обновляем состояние кнопки
  if (save.uber.unlocked) {
    if (uberBuyBtn && !uberBuyBtn.classList.contains('hidden')) {
      const uberCost = uberCostAt(save.uber.level);
      uberBuyBtn.disabled = save.points < uberCost;
    }
    return;
  }
  
  // Проверяем, что массив зданий существует и не пустой
  if (!save.buildings || save.buildings.length === 0) return;
  
  // Проверяем, что все здания достигли уровня 800 и Click тоже
  // Важно: every() возвращает true для пустого массива, поэтому проверяем length > 0
  let allBuildings800 = true;
  for (let i = 0; i < save.buildings.length; i++) {
    const b = save.buildings[i];
    if (!b || typeof b.level !== 'number' || b.level < 800) {
      allBuildings800 = false;
      break;
    }
  }
  
  const click800 = save.click && typeof save.click.level === 'number' && save.click.level >= 800;
  
  if (allBuildings800 && click800) {
    save.uber.unlocked = true;
    toast('Uber Turbo Building unlocked!', 'good');
    
    // XP за разблокировку Uber здания
    if (typeof addXPForUberUnlock === 'function') {
      addXPForUberUnlock();
    }
    checkAchievements(); // Проверяем достижения после разблокировки Uber
    // renderUber() будет вызван после этой функции в renderAll()
  }
}
function updateEndgameButtons() {
  // When uber reaches level 19 (and not in uber mode yet), show endgame buttons
  // Кнопки показываются только если уровень >= 19 и max === 19 (еще не в убер моде)
  if (save && save.uber.unlocked && save.uber.level >= 19 && save.uber.max === 19) {
    if (endgameBtn) endgameBtn.classList.remove('hidden');
    if (uberModeBtn) uberModeBtn.classList.remove('hidden');
  } else {
    // Скрываем кнопки во всех остальных случаях (уровень < 19, или уже в убер моде)
    if (endgameBtn) endgameBtn.classList.add('hidden');
    if (uberModeBtn) uberModeBtn.classList.add('hidden');
  }
}
uberBuyBtn.addEventListener('click', () => {
  if (!save.uber.unlocked) return;
  if (save.uber.level >= save.uber.max) return;
  
  // Используем общий bulk для покупки
  const bulk = save.bulk || 1;
  const bulkCost = computeBulkCostForBlock('uber', bulk);
  
  if (bulkCost.totalLevels === 0) {
    // Для убер здания не должно быть проверки на апгрейд
    if (save.uber.level >= save.uber.max) {
      toast('Cannot buy more levels. Max level reached.', 'warn');
    } else {
      toast('Cannot buy more levels.', 'warn');
    }
    return;
  }
  
  if (save.points < bulkCost.totalCost) {
    toast('Not enough points.', 'warn');
    return;
  }
  
  save.points -= bulkCost.totalCost;
  if (save.achievements && save.achievements.stats) {
    save.achievements.stats.totalPointsSpent += bulkCost.totalCost;
  }
  const oldUberLevel = save.uber.level;
  save.uber.level = Math.min(save.uber.level + bulkCost.totalLevels, save.uber.max);
  
  // XP за покупку уровня Uber здания
  if (typeof addXPForUberLevel === 'function') {
    addXPForUberLevel(oldUberLevel);
  }
  
  if (bulkCost.totalLevels === 1) {
  toast('Citadel level increased.', 'good');
  } else {
    toast(`Citadel level increased by ${bulkCost.totalLevels}.`, 'good');
  }
  
  // Инвалидируем кэш PPS/PPC при изменении уровня Uber здания
  _cachedPPS = null;
  _cachedPPC = null;
  
  // Критичные обновления сразу (синхронно) - для мгновенного отображения изменений
  renderTopStats();
  renderUber(); // Обновляем Uber здание сразу (включая уровень, доход, стоимость)
  renderClick(); // Обновляем кнопку клика (может показывать информацию о Uber здании)
  updateButtonStates(); // Обновляем состояние кнопок сразу для плавности
  
  // Тяжелые операции откладываем на следующий кадр для плавности
  requestAnimationFrame(() => {
    scheduleRender({ click: true, buildings: true });
    // Проверяем достижения и разблокировку асинхронно (не блокируем рендеринг)
    checkAchievements();
    checkUberUnlock();
  });
});

if (endgameBtn) {
endgameBtn.addEventListener('click', () => {
  // Показываем модальное окно подтверждения
  showConfirmModal(
    'The game will be completely reset. Are you sure?',
    () => {
      // Полный сброс игры
      const username = save ? save.meta.username : 'Player';
      save = newSave(username);
      initBuildings(save);
      toast('Game completely reset.', 'info');
      updateEndgameButtons(); // Скрываем кнопки после сброса
  renderAll();
    }
  );
});
}

if (uberModeBtn) {
uberModeBtn.addEventListener('click', () => {
  // Показываем модальное окно подтверждения
  showConfirmModal(
    'Enter Uber Mode?',
    () => {
      // Переход в убер мод - увеличиваем max до 9999 для зданий и клика, до 1881 для убер здания
      save.buildings.forEach(b => {
        b.max = Math.max(b.max, 9999); // Увеличиваем максимальный уровень до 9999
      });
      save.click.max = Math.max(save.click.max, 9999); // Увеличиваем максимальный уровень клика до 9999
      save.uber.max = Math.max(save.uber.max, 1881); // Увеличиваем максимум для убер здания до 1881
      
      // XP за вход в Uber Mode
      if (typeof addXPForUberMode === 'function') {
        addXPForUberMode();
      }
      
      toast('Entered Uber Mode!', 'good');
      saveNow(); // Сохраняем состояние убер мода немедленно
      updateEndgameButtons(); // Скрываем кнопки после перехода в убер мод
  renderAll();
    }
  );
});
}

// ======= Pixel art drawing (procedural) =======
// Generate building image sequence (1-15) for 50 buildings without consecutive duplicates
function generateBuildingImageSequence() {
  // Create array of image numbers from 1 to 15
  const images = [];
  for (let i = 1; i <= 15; i++) {
    images.push(i.toString());
  }
  
  const sequence = [];
  let lastImage = null;
  
  // Use a seeded random for consistency
  let seed = 12345; // Fixed seed for consistent sequence
  
  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  
  // Count how many times each image should be used (50 / 15 ≈ 3.33)
  // Some images will be used 3 times, some 4 times
  const imageCounts = {};
  images.forEach(img => imageCounts[img] = 0);
  
  // Target count per image
  const baseCount = Math.floor(50 / 15); // 3
  const extraCount = 50 % 15; // 5 images will be used 4 times
  
  // Mark which images will be used 4 times
  const extraImages = [];
  for (let i = 0; i < extraCount; i++) {
    extraImages.push(images[i]);
  }
  
  for (let i = 0; i < 50; i++) {
    // Build available images list (exclude last used, and only include images that haven't reached their limit)
    let availableImages = images.filter(img => {
      // Exclude last image to avoid consecutive duplicates
      if (lastImage !== null && img === lastImage) {
        return false;
      }
      // Check if this image can still be used
      const maxCount = extraImages.includes(img) ? baseCount + 1 : baseCount;
      return imageCounts[img] < maxCount;
    });
    
    // If no available images (shouldn't happen, but safety check)
    if (availableImages.length === 0) {
      // Fallback: use any image except last
      availableImages = images.filter(img => img !== lastImage);
    }
    
    // Randomly select from available images
    const randomIndex = Math.floor(seededRandom() * availableImages.length);
    const selectedImage = availableImages[randomIndex];
    
    sequence.push(selectedImage);
    imageCounts[selectedImage]++;
    lastImage = selectedImage;
  }
  
  return sequence;
}

// Cache the building image sequence
const BUILDING_IMAGE_SEQUENCE = generateBuildingImageSequence();

// Get building image for a specific building index
function getBuildingImage(buildingIndex) {
  if (buildingIndex < 0 || buildingIndex >= BUILDING_IMAGE_SEQUENCE.length) {
    return '1'; // Default fallback
  }
  return BUILDING_IMAGE_SEQUENCE[buildingIndex];
}

function drawHousePixel(canvas, seed) {
  canvas.style.imageRendering = 'pixelated';
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'crisp-edges';
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  // Улучшенная палитра с большим разнообразием
  const palettes = [
    { wall: '#7b4f1c', roof: '#8b5a2a', door: '#3a2a1a', window: '#c9d8ff', trim: '#d6b557', shadow: '#2a1f14', ground: '#3a2f26' },
    { wall: '#6a4420', roof: '#7a4f1f', door: '#2b1f14', window: '#d4e4ff', trim: '#cfa25a', shadow: '#1f1a12', ground: '#2f2520' },
    { wall: '#5e3a19', roof: '#6d4a1d', door: '#2a1b12', window: '#b8d0ff', trim: '#c59752', shadow: '#1a1510', ground: '#2a2018' },
    { wall: '#8b6a3d', roof: '#9b7a4d', door: '#4a3a2a', window: '#e0f0ff', trim: '#e6c677', shadow: '#3a2f24', ground: '#4a3f36' },
    { wall: '#9a7a4d', roof: '#aa8a5d', door: '#5a4a3a', window: '#f0f8ff', trim: '#f6d697', shadow: '#4a3f34', ground: '#5a4f46' }
  ];
  const pal = palettes[seed % palettes.length];

  // Ground shadow
  ctx.fillStyle = pal.ground;
  ctx.fillRect(0, 50, 56, 6);
  
  // Main building base
  ctx.fillStyle = pal.shadow;
  ctx.fillRect(12, 32, 32, 20);
  
  // Walls with texture
  ctx.fillStyle = pal.wall;
  ctx.fillRect(10, 28, 36, 24);
  
  // Wall texture pattern
  ctx.fillStyle = pal.shadow;
  for (let y = 30; y < 50; y += 4) {
    for (let x = 12; x < 44; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  
  // Roof - треугольная крыша
  ctx.fillStyle = pal.roof;
  // Левая часть крыши
  ctx.beginPath();
  ctx.moveTo(8, 24);
  ctx.lineTo(28, 10);
  ctx.lineTo(48, 24);
  ctx.lineTo(8, 24);
  ctx.fill();
  
  // Правая часть крыши
  ctx.beginPath();
  ctx.moveTo(28, 10);
  ctx.lineTo(48, 24);
  ctx.lineTo(48, 28);
  ctx.lineTo(28, 14);
  ctx.lineTo(8, 28);
  ctx.lineTo(8, 24);
  ctx.fill();
  
  // Roof trim
  ctx.fillStyle = pal.trim;
  ctx.fillRect(8, 24, 40, 2);
  ctx.fillRect(28, 10, 2, 14);
  
  // Door
  ctx.fillStyle = pal.door;
  ctx.fillRect(24, 38, 10, 14);
  ctx.fillStyle = pal.shadow;
  ctx.fillRect(26, 40, 6, 10);
  // Door handle
  ctx.fillStyle = pal.trim;
  ctx.fillRect(32, 44, 2, 2);
  
  // Windows
  ctx.fillStyle = pal.window;
  ctx.fillRect(14, 34, 6, 8);
  ctx.fillRect(36, 34, 6, 8);
  // Window frames
  ctx.fillStyle = pal.trim;
  ctx.strokeStyle = pal.trim;
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 34, 6, 8);
  ctx.strokeRect(36, 34, 6, 8);
  // Window cross
  ctx.fillRect(16, 37, 2, 8);
  ctx.fillRect(14, 38, 6, 2);
  ctx.fillRect(38, 37, 2, 8);
  ctx.fillRect(36, 38, 6, 2);
  
  // Outline
  ctx.strokeStyle = '#0b0c15';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 28, 36, 24);
  // Roof outline
  ctx.beginPath();
  ctx.moveTo(8, 24);
  ctx.lineTo(28, 10);
  ctx.lineTo(48, 24);
  ctx.stroke();
}

function drawCitadelPixel(el) {
  if (!el) return;
  
  // Create/update img for Citadel
  let img = el.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.imageRendering = 'pixelated';
    img.style.imageRendering = '-moz-crisp-edges';
    img.style.imageRendering = 'crisp-edges';
    img.style.display = 'block';
    el.innerHTML = '';
    el.appendChild(img);
  }
  
  img.src = 'icons/Cita.png';
  
  // Old canvas drawing code removed - using image instead
  return;
  
  // Legacy canvas code (kept for reference, but not executed)
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  canvas.style.imageRendering = 'pixelated';
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'crisp-edges';
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,64,64);

  const stoneDark = '#2f364d';
  const stoneMid = '#3b4563';
  const stoneLight = '#586287';
  const stoneHighlight = '#7a8ba8';
  const gateDark = '#5a3a1a';
  const gateLight = '#7b4f1c';
  const gateTrim = '#9a6a3d';
  const shadow = '#1a1f2d';
  const ground = '#2a2f3d';

  // Ground
  ctx.fillStyle = ground;
  ctx.fillRect(0, 58, 64, 6);
  
  // Main base shadow
  ctx.fillStyle = shadow;
  ctx.fillRect(8, 40, 48, 18);
  
  // Main base
  ctx.fillStyle = stoneDark;
  ctx.fillRect(6, 38, 52, 20);
  
  // Stone texture on base
  ctx.fillStyle = stoneMid;
  for (let x = 8; x < 56; x += 6) {
    for (let y = 40; y < 56; y += 4) {
      if ((x + y) % 12 === 0) {
        ctx.fillRect(x, y, 4, 2);
      }
    }
  }
  
  // Left tower
  ctx.fillStyle = stoneDark;
  ctx.fillRect(4, 20, 14, 18);
  ctx.fillStyle = stoneMid;
  ctx.fillRect(6, 22, 10, 14);
  // Tower texture
  ctx.fillStyle = stoneLight;
  for (let y = 24; y < 34; y += 3) {
    ctx.fillRect(8, y, 6, 1);
  }
  
  // Right tower
  ctx.fillStyle = stoneDark;
  ctx.fillRect(46, 20, 14, 18);
  ctx.fillStyle = stoneMid;
  ctx.fillRect(48, 22, 10, 14);
  // Tower texture
  ctx.fillStyle = stoneLight;
  for (let y = 24; y < 34; y += 3) {
    ctx.fillRect(50, y, 6, 1);
  }
  
  // Center tower (higher)
  ctx.fillStyle = stoneDark;
  ctx.fillRect(26, 14, 12, 24);
  ctx.fillStyle = stoneMid;
  ctx.fillRect(28, 16, 8, 20);
  // Tower texture
  ctx.fillStyle = stoneLight;
  for (let y = 18; y < 34; y += 3) {
    ctx.fillRect(30, y, 4, 1);
  }
  
  // Battlements on left tower
  ctx.fillStyle = stoneLight;
  ctx.fillRect(6, 18, 4, 2);
  ctx.fillRect(12, 18, 4, 2);
  ctx.fillRect(8, 18, 2, 2);
  
  // Battlements on right tower
  ctx.fillRect(48, 18, 4, 2);
  ctx.fillRect(54, 18, 4, 2);
  ctx.fillRect(50, 18, 2, 2);
  
  // Battlements on center tower
  ctx.fillRect(28, 12, 3, 2);
  ctx.fillRect(33, 12, 3, 2);
  ctx.fillRect(30, 12, 1, 2);
  
  // Main wall battlements
  ctx.fillStyle = stoneLight;
  for (let i = 10; i <= 54; i += 8) {
    ctx.fillRect(i, 36, 4, 2);
  }
  
  // Gate arch
  ctx.fillStyle = stoneDark;
  ctx.fillRect(28, 44, 8, 2);
  ctx.fillRect(30, 46, 4, 2);
  
  // Gate door
  ctx.fillStyle = gateDark;
  ctx.fillRect(30, 46, 8, 12);
  ctx.fillStyle = gateLight;
  ctx.fillRect(32, 48, 4, 8);
  // Gate trim
  ctx.fillStyle = gateTrim;
  ctx.fillRect(30, 46, 8, 2);
  ctx.fillRect(30, 56, 8, 2);
  ctx.fillRect(30, 48, 2, 8);
  ctx.fillRect(36, 48, 2, 8);
  // Gate details
  ctx.fillStyle = gateDark;
  ctx.fillRect(33, 50, 2, 4);
  
  // Tower windows
  ctx.fillStyle = '#c9d8ff';
  ctx.fillRect(9, 28, 4, 4);
  ctx.fillRect(51, 28, 4, 4);
  ctx.fillRect(30, 24, 4, 4);
  // Window frames
  ctx.fillStyle = stoneDark;
  ctx.strokeStyle = stoneDark;
  ctx.lineWidth = 1;
  ctx.strokeRect(9, 28, 4, 4);
  ctx.strokeRect(51, 28, 4, 4);
  ctx.strokeRect(30, 24, 4, 4);
  
  // Highlights
  ctx.fillStyle = stoneHighlight;
  ctx.fillRect(8, 22, 2, 6);
  ctx.fillRect(50, 22, 2, 6);
  ctx.fillRect(28, 18, 2, 4);
  
  // Outline
  ctx.strokeStyle = '#0b0c15';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 38, 52, 20);
  ctx.strokeRect(4, 20, 14, 18);
  ctx.strokeRect(46, 20, 14, 18);
  ctx.strokeRect(26, 14, 12, 24);

  el.innerHTML = '';
  el.appendChild(canvas);
}

// ======= Game logic =======
function showGame() {
  gameScreen.classList.remove('hidden');
  // Display username from save
  const displayName = save.meta?.username || 'Player';
  if (usernameDisplay) usernameDisplay.textContent = displayName;
  // Инициализируем bulk, если его нет
  if (save.bulk === undefined || save.bulk === null) {
    save.bulk = 1;
  }
  // Убеждаемся, что bulk нормализован перед рендером
  if (save.bulk !== 'max') {
    const parsed = parseInt(save.bulk, 10);
    save.bulk = isNaN(parsed) ? 1 : parsed;
  }
  renderAll();
  
  // Initialize sort button
  initSortButton();
  
  // Initialize and start background music if volume > 0
  initBackgroundMusic();
  if (musicVolume > 0) {
    startBackgroundMusic();
  }
  
  // Initialize hints system
  setTimeout(() => {
    initHints();
  }, 1000);
  
  // Инициализируем таймер короля при входе в игру
  scheduleNextKing();
  
  // Инициализируем таймер генерала при входе в игру
  if (typeof scheduleNextGeneral === 'function') {
    // Проверяем, не установлен ли уже nextGeneralSpawn
    if (!save.battlefield || !save.battlefield.nextGeneralSpawn || save.battlefield.nextGeneralSpawn === 0) {
      scheduleNextGeneral();
    }
  }
  
  
  // Блокируем контекстное меню (ПКМ) на игровом экране
  if (gameScreen) {
    gameScreen.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }
  
  // Инициализируем UI для магазина и опыта после показа игры
  setTimeout(() => {
    if (typeof initMerchantUI === 'function') {
      initMerchantUI();
    }
    if (typeof initXPUI === 'function') {
      initXPUI();
    }
  }, 200);
}
// Offline earnings modal handler
const offlineEarningsModal = document.getElementById('offline-earnings-modal');
const offlineEarningsOkBtn = document.getElementById('offline-earnings-ok');

if (offlineEarningsOkBtn) {
  offlineEarningsOkBtn.addEventListener('click', () => {
    if (offlineEarningsModal) {
      offlineEarningsModal.classList.add('hidden');
      offlineEarningsModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      // Update lastActivityTime when user closes the modal
      if (save) {
        save.lastActivityTime = now();
      }
    }
  });
}

// Validation helper functions
function showFieldError(field, errorElement, message) {
  if (field) field.classList.add('error');
  if (field) field.classList.remove('valid');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function showFieldValid(field, errorElement) {
  if (field) field.classList.remove('error');
  if (field) field.classList.add('valid');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
}

function clearFieldError(field, errorElement) {
  if (field) field.classList.remove('error', 'valid');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
  }
}


function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  return { valid: true, message: '' };
}



// Local save handlers
if (localLoadBtn) {
  localLoadBtn.addEventListener('click', () => {
    const stored = load();
    if (!stored || !stored.data) {
      toast('No local save found.', 'warn');
      return;
    }
    save = stored.data || stored; // Support both formats
    if (!save) {
      toast('Invalid save file.', 'warn');
      return;
    }
    
    // If buildings missing, init
    if (!save.buildings || save.buildings.length === 0) initBuildings(save);
    // Initialize achievements if missing
    if (!save.achievements) {
      save.achievements = {
        unlocked: {},
        stats: {
          totalClicks: 0,
          totalPlayTime: 0,
          totalDestructions: 0,
          firstBuildingBought: false,
        }
      };
    }
    // Normalize bulk
    if (save.bulk === undefined || save.bulk === null) {
      save.bulk = 1;
    }
    if (save.bulk !== 'max') {
      const parsed = parseInt(save.bulk, 10);
      save.bulk = isNaN(parsed) ? 1 : parsed;
    }
    // Migrate streak
    if (!save.streak) {
      save.streak = { count: 0, lastClickTs: 0, multiplier: 1.0 };
    } else if (save.streak.multiplier === undefined) {
      save.streak.multiplier = 1.0;
    }
    migrateAchievements();
    // Migrate uber.max
    if (save.uber && save.uber.max !== 9999 && save.uber.max !== 19 && save.uber.max !== 1881) {
      save.uber.max = 19;
    }
    // Initialize lastActivityTime
    if (!save.lastActivityTime) {
      save.lastActivityTime = now();
    }
    // Load saved sort mode
    if (save.buildingSortMode !== undefined) {
      buildingSortMode = save.buildingSortMode;
      if (buildingSortMode < 0 || buildingSortMode >= SORT_MODES.length) {
        buildingSortMode = 0;
      }
    }
    checkOfflineEarnings();
    startAutosave();
    toast('Local save loaded.', 'good');
    showGame();
  });
}

if (localDownloadBtn) {
  localDownloadBtn.addEventListener('click', () => {
    if (!save) {
      toast('No save data to download.', 'warn');
      return;
    }
    const saveData = {
      data: save,
      exported: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medieval-pixel-idle-save-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Save file downloaded.', 'good');
  });
}

if (localUploadBtn && localUploadInput) {
  localUploadBtn.addEventListener('click', () => {
    const file = localUploadInput.files[0];
    if (!file) {
      toast('Please select a save file.', 'warn');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const saveData = JSON.parse(e.target.result);
        if (!saveData.data) {
          toast('Invalid save file format.', 'bad');
          return;
        }
        
        // Load save
        save = saveData.data || saveData;
        if (!save) {
          toast('Invalid save file format.', 'bad');
          return;
        }
        
        // Initialize missing data
        if (!save.buildings || save.buildings.length === 0) initBuildings(save);
        if (!save.achievements) {
          save.achievements = {
            unlocked: {},
            stats: {
              totalClicks: 0,
              totalPlayTime: 0,
              totalDestructions: 0,
              firstBuildingBought: false,
            }
          };
        }
        if (save.bulk === undefined || save.bulk === null) {
          save.bulk = 1;
        }
        if (save.bulk !== 'max') {
          const parsed = parseInt(save.bulk, 10);
          save.bulk = isNaN(parsed) ? 1 : parsed;
        }
        if (!save.streak) {
          save.streak = { count: 0, lastClickTs: 0, multiplier: 1.0 };
        } else if (save.streak.multiplier === undefined) {
          save.streak.multiplier = 1.0;
        }
        migrateAchievements();
        if (save.uber && save.uber.max !== 9999 && save.uber.max !== 19 && save.uber.max !== 1881) {
          save.uber.max = 19;
        }
        if (!save.lastActivityTime) {
          save.lastActivityTime = now();
        }
        // Load saved sort mode
        if (save.buildingSortMode !== undefined) {
          buildingSortMode = save.buildingSortMode;
          if (buildingSortMode < 0 || buildingSortMode >= SORT_MODES.length) {
            buildingSortMode = 0;
          }
        }
        checkOfflineEarnings();
        startAutosave();
        toast('Save file loaded successfully!', 'good');
        showGame();
      } catch (error) {
        console.error('Load error:', error);
        toast('Failed to load save file. Invalid format.', 'bad');
      }
    };
    reader.onerror = () => {
      toast('Failed to read file.', 'bad');
    };
    reader.readAsText(file);
});
}


// Инициализация обработчика кнопки статистики
function initStatsButton() {
  const btn = document.getElementById('stats-btn');
  const modal = document.getElementById('stats-modal');
  const body = document.getElementById('stats-body');
  const close = document.getElementById('stats-close');
  
  if (!btn) {
    console.error('Stats button not found');
    return;
  }
  if (!modal) {
    console.error('Stats modal not found');
    return;
  }
  if (!body) {
    console.error('Stats body not found');
    return;
  }
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Stats button clicked');
    openStatsModal();
  });
  
  if (close) {
    close.addEventListener('click', () => {
      closeStatsModal();
    });
  }
  
  // Закрытие при клике на фон
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) {
      closeStatsModal();
    }
  });
}

// Вызываем инициализацию после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStatsButton);
} else {
  initStatsButton();
}

if (statsClose) {
statsClose.addEventListener('click', () => {
  closeStatsModal();
});
}

// Закрытие статистики при клике на фон
if (statsModal) {
statsModal.addEventListener('click', (ev) => {
  if (ev.target === statsModal) closeStatsModal();
});
}

// Talent event handlers removed

// ======= Security & Anti-Tampering System =======
// Защита от редактирования кода через браузер

// Простая функция хеширования (не криптографически стойкая, но достаточная для защиты от простого обхода)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Хеш правильного пароля (1488)
const DEBUG_PASSWORD_HASH = simpleHash('1488' + 'salt_mpi_debug_2024');
const DEBUG_AUTH_TOKEN = 'debug_auth_' + Date.now() + '_' + Math.random().toString(36);

// Флаг авторизации (хранится в замыкании, недоступен извне)
let _debugAuthorized = false;
let _debugAuthTime = 0;
const DEBUG_AUTH_TIMEOUT = 30 * 60 * 1000; // 30 минут

// Проверка пароля с хешированием
function verifyDebugPassword(input) {
  const inputHash = simpleHash(input + 'salt_mpi_debug_2024');
  return inputHash === DEBUG_PASSWORD_HASH;
}

// Проверка авторизации
function isDebugAuthorized() {
  if (!_debugAuthorized) return false;
  // Проверяем таймаут (30 минут)
  if (Date.now() - _debugAuthTime > DEBUG_AUTH_TIMEOUT) {
    _debugAuthorized = false;
    return false;
  }
  return true;
}

// Установка авторизации
function setDebugAuthorized(authorized) {
  _debugAuthorized = authorized;
  _debugAuthTime = Date.now();
}

// Проверка целостности debug панели
function verifyDebugPanelIntegrity() {
  if (!debugLock || !debugTools) return false;
  
  // Проверяем, что элементы не были изменены через консоль
  const lockHidden = debugLock.classList.contains('hidden');
  const toolsVisible = !debugTools.classList.contains('hidden');
  
  // Если tools видимы, но нет авторизации - это обход защиты
  if (toolsVisible && !isDebugAuthorized()) {
    // Блокируем доступ
    debugLock.classList.remove('hidden');
    debugTools.classList.add('hidden');
    setDebugAuthorized(false);
    if (debugPass) debugPass.value = '';
    toast('Security violation detected. Access denied.', 'bad');
    return false;
  }
  
  return true;
}

// Защита от изменения DOM элементов через консоль
function protectDebugElements() {
  if (!debugLock || !debugTools) return;
  
  // Сохраняем оригинальные методы
  const originalLockAdd = debugLock.classList.add.bind(debugLock.classList);
  const originalLockRemove = debugLock.classList.remove.bind(debugLock.classList);
  const originalToolsAdd = debugTools.classList.add.bind(debugTools.classList);
  const originalToolsRemove = debugTools.classList.remove.bind(debugTools.classList);
  
  // Переопределяем методы с проверкой авторизации
  debugLock.classList.add = function(...args) {
    if (args.includes('hidden') && !isDebugAuthorized()) {
      console.warn('Security: Unauthorized attempt to hide debug lock');
      return;
    }
    return originalLockAdd(...args);
  };
  
  debugLock.classList.remove = function(...args) {
    if (!args.includes('hidden') && !isDebugAuthorized()) {
      // Разрешаем удаление других классов, но проверяем при удалении 'hidden'
      return originalLockRemove(...args);
    }
    return originalLockRemove(...args);
  };
  
  debugTools.classList.add = function(...args) {
    if (!args.includes('hidden') && !isDebugAuthorized()) {
      // Если пытаются добавить класс (кроме hidden) без авторизации - блокируем
      if (debugTools.classList.contains('hidden')) {
        console.warn('Security: Unauthorized attempt to modify debug tools');
        return;
      }
    }
    return originalToolsAdd(...args);
  };
  
  debugTools.classList.remove = function(...args) {
    if (args.includes('hidden') && !isDebugAuthorized()) {
      console.warn('Security: Unauthorized attempt to show debug tools');
      return;
    }
    return originalToolsRemove(...args);
  };
  
  // Периодическая проверка целостности (каждую секунду)
  setInterval(() => {
    verifyDebugPanelIntegrity();
  }, 1000);
}

// Защита критичных функций от переопределения
function protectCriticalFunctions() {
  // Защищаем функцию addPoints
  const originalAddPoints = window.addPoints;
  if (originalAddPoints) {
    Object.defineProperty(window, 'addPoints', {
      value: originalAddPoints,
      writable: false,
      configurable: false
    });
  }
  
  // Защищаем объект save от полного переопределения (но не от изменения свойств)
  if (window.save) {
    Object.seal(window.save);
  }
}

// Защита от открытия DevTools (обнаружение через размеры окна)
function detectDevTools() {
  let devtools = false;
  const threshold = 160; // Порог для определения открытия DevTools
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools) {
        devtools = true;
        // Если DevTools открыты и debug панель разблокирована без авторизации - блокируем
        if (debugTools && !debugTools.classList.contains('hidden') && !isDebugAuthorized()) {
          setDebugAuthorized(false);
          if (debugLock) debugLock.classList.remove('hidden');
          if (debugTools) debugTools.classList.add('hidden');
          toast('Security: DevTools detected. Debug panel locked.', 'warn');
        }
      }
    } else {
      devtools = false;
    }
  }, 500);
}

// Дополнительная защита: проверка целостности кода через проверку функций
function verifyCodeIntegrity() {
  // Проверяем, что критичные функции не были переопределены
  if (typeof addPoints !== 'function') {
    console.error('Security: addPoints function integrity check failed');
    return false;
  }
  
  // Проверяем, что элементы debug панели существуют и не были изменены
  if (!debugLock || !debugTools || !debugPass) {
    console.error('Security: Debug panel elements integrity check failed');
    return false;
  }
  
  return true;
}

// Инициализация защиты
function initSecuritySystem() {
  // Проверяем наличие элементов перед защитой
  if (!debugLock || !debugTools || !debugPass) {
    console.warn('Security: Debug panel elements not found, retrying...');
    setTimeout(initSecuritySystem, 500);
    return;
  }
  
  protectDebugElements();
  protectCriticalFunctions();
  detectDevTools();
  
  // Проверка целостности при загрузке
  setTimeout(() => {
    verifyDebugPanelIntegrity();
    verifyCodeIntegrity();
  }, 100);
  
  // Периодическая проверка целостности кода
  setInterval(() => {
    if (!verifyCodeIntegrity()) {
      // Если целостность нарушена, блокируем debug панель
      setDebugAuthorized(false);
      if (debugLock) debugLock.classList.remove('hidden');
      if (debugTools) debugTools.classList.add('hidden');
    }
  }, 2000);
}

// ======= Debug panel =======
debugOpen.addEventListener('click', () => {
  // Проверяем целостность перед открытием
  if (!verifyDebugPanelIntegrity()) {
    debugModal.classList.add('hidden');
    return;
  }
  debugModal.classList.remove('hidden');
  // Сбрасываем авторизацию при открытии модального окна
  if (!isDebugAuthorized()) {
    setDebugAuthorized(false);
    if (debugLock) debugLock.classList.remove('hidden');
    if (debugTools) debugTools.classList.add('hidden');
    if (debugPass) debugPass.value = '';
  }
});

debugClose.addEventListener('click', () => {
  debugModal.classList.add('hidden');
  // Не сбрасываем авторизацию при закрытии, чтобы можно было открыть снова
});

debugUnlockBtn.addEventListener('click', () => {
  if (!debugPass || !verifyDebugPanelIntegrity()) {
    toast('Security error.', 'bad');
    return;
  }
  
  const input = debugPass.value;
  if (verifyDebugPassword(input)) {
    setDebugAuthorized(true);
    debugLock.classList.add('hidden');
    debugTools.classList.remove('hidden');
    debugPass.value = '';
    toast('Debug panel unlocked.', 'good');
  } else {
    toast('Wrong password.', 'bad');
    debugPass.value = '';
  }
});
debugTools.addEventListener('click', (e) => {
  const action = e.target.dataset.debug;
  if (!action) return;
  
  // КРИТИЧЕСКАЯ ПРОВЕРКА: Проверяем авторизацию при каждом действии
  if (!verifyDebugPanelIntegrity() || !isDebugAuthorized()) {
    toast('Unauthorized access. Please unlock debug panel first.', 'bad');
    // Блокируем доступ
    if (debugLock) debugLock.classList.remove('hidden');
    if (debugTools) debugTools.classList.add('hidden');
    setDebugAuthorized(false);
    return;
  }
  
  if (!save) { toast('Not logged in.', 'warn'); return; }
  switch(action) {
    case 'addPoints': addPoints(10000); toast('Added 10000 points.', 'good'); break;
    case 'addAllBuildingLevels':
      save.buildings.forEach((b,i)=>{
        for (let k=0;k<100;k++){
          if (b.level >= b.max) break; // Не превышаем максимум
          const seg = segmentIndex(b.level);
          const cost = buildingLevelCostAt(b, b.level);
          b.pendingSegmentCost[seg] = (b.pendingSegmentCost[seg]||0)+cost;
          b.level = Math.min(b.level+1, b.max);
        }
      });
      toast('Added 100 levels to all buildings.', 'good');
      // Полностью пересоздаем UI
      _lastBuildingsState = null;
      _lastSortMode = -1;
      _cachedPPS = null;
      _cachedPPC = null;
      renderBuildings();
      updateBuildingLevels(true);
      updateButtonStates();
      renderAll();
      break;
    case 'addClickLevels':
      for (let k=0;k<100;k++){
        if (save.click.level >= save.click.max) break; // Не превышаем максимум
        const seg = segmentIndex(save.click.level);
        const cost = clickLevelCostAt(save.click.level);
        save.click.pendingSegmentCost[seg]=(save.click.pendingSegmentCost[seg]||0)+cost;
        save.click.level = Math.min(save.click.level+1, save.click.max);
      }
      _cachedPPC = null;
      renderClick();
      toast('Added 100 levels to Click.', 'good');
      break;
    case 'clickIncomeBoost':
      save.ppcBase *= 1000;
      toast('Click income x1000 base applied.', 'good');
      break;
    case 'spawnSpider':
      spawnSpider(); break;
    case 'spawnAngryBarmatun':
      spawnAngryBarmatun(); break;
    case 'spawnElfArcher':
      spawnElfArcher(); break;
    case 'spawnKing':
      spawnKing(); break;
    case 'addUberLevels':
      if (save.uber.unlocked) {
        for (let i = 0; i < 10; i++) {
          if (save.uber.level < save.uber.max) {
            save.uber.level = Math.min(save.uber.level + 1, save.uber.max);
          }
        }
        renderUber();
        toast('Added 10 levels to Citadel.', 'good');
      } else {
        toast('Citadel is locked.', 'warn');
      }
      break;
    case 'addMillionPoints':
      addPoints(1000000);
      toast('Added 1,000,000 points.', 'good');
      break;
    case 'setPoints':
      const input = prompt('Enter points amount (can be 0 or any large number):', save.points.toString());
      if (input !== null) {
        // Парсим ввод, поддерживая очень большие числа
        let pointsValue;
        const trimmedInput = input.trim();
        if (trimmedInput === '') {
          toast('Invalid input.', 'bad');
          break;
        }
        // Проверяем, является ли ввод валидным числом (может быть очень большим)
        // Удаляем пробелы и проверяем формат
        const cleanInput = trimmedInput.replace(/\s/g, '');
        // Пытаемся распарсить как число
        const parsed = Number(cleanInput);
        if (isNaN(parsed)) {
          toast('Invalid number format.', 'bad');
          break;
        }
        // Если число слишком большое для безопасного представления, используем максимальное безопасное значение
        if (!isFinite(parsed) || parsed > Number.MAX_SAFE_INTEGER) {
          pointsValue = Number.MAX_SAFE_INTEGER;
          toast('Number too large, set to maximum safe integer.', 'warn');
        } else if (parsed < 0) {
          pointsValue = 0;
          toast('Negative numbers not allowed, set to 0.', 'warn');
        } else {
          pointsValue = Math.floor(parsed); // Используем целое число
        }
        // Устанавливаем поинты напрямую
        save.points = pointsValue;
        // Инвалидируем кэш
        _cachedPPS = null;
        _cachedPPC = null;
        _cachedPoints = null;
        // Обновляем UI
        updateButtonStates();
        renderAll();
        toast(`Points set to ${fmt(pointsValue)}.`, 'good');
      }
      break;
    case 'cycleSeason':
      cycleSeason();
      break;
    case 'breakClick':
      // Кнопка больше не может сломаться
      toast('Click button cannot break anymore.', 'info'); break;
    case 'goldenClick':
      save.click.goldenUntil = now() + 8000;
      toast('Click button golden.', 'good'); break;
    case 'goodLuck':
      // Toggle режим, где здания не могут ломаться
      if (!save.modifiers.goodLuckMode) {
        save.modifiers.goodLuckMode = true;
        toast('Good luck mode ON: Buildings cannot break.', 'good');
      } else {
        save.modifiers.goodLuckMode = false;
        toast('Good luck mode OFF: Buildings can break again.', 'warn');
      }
      break;
    case 'resetUberBuffs':
      // Сбросить все активные uber-баффы
      const act = save.treasury?.actions;
      if (act) {
        act.noGoldenUntil = 0;
        act.alwaysGoldenUntil = 0;
        act.fastRepairUntil = 0;
        act.passiveBoostUntil = 0;
        act.passiveBoostLevel = 0;
        act.passiveBoostLastTick = 0;
        act.spiderBuffUntil = 0;
        act.noBreakUntil = 0;
        act.treasuryNoPassiveUntil = 0;
        toast('All uber-buffs reset.', 'good');
        renderTreasuryActions();
      } else {
        toast('No treasury actions to reset.', 'warn');
      }
      break;
    case 'addTreasury':
      if (save.treasury) {
        gainTreasury(1000);
        toast('Added 1000 treasury coins.', 'good');
      } else {
        toast('Treasury not available.', 'warn');
      }
      break;
    case 'resetAll':
      const uname = save.meta.username;
      save = newSave(uname);
      initBuildings(save);
      // Полностью сбрасываем кэш и состояние
      _lastBuildingsState = null;
      _lastSortMode = -1;
      _cachedPPS = null;
      _cachedPPC = null;
      _cachedPoints = null;
      _cachedPointsText = null;
      // Полностью перерисовываем все
      renderAll();
      toast('Reset complete.', 'warn');
      break;
  }
  renderAll();
});


/////////

// ======= Effects system =======

// Добавление эффекта
function addEffect(type, durationMs, mult=1.0) {
  save.modifiers.activeEffects = save.modifiers.activeEffects || [];
  const until = now() + durationMs;
  save.modifiers.activeEffects.push({ type, until, mult });
}

// Рендер панели эффектов - оптимизированная версия с дебаунсингом и кэшированием
let _lastEffectsState = '';
let _lastEffectsUpdate = 0;
let _effectsDebounceTimeout = null;

// Инициализируем переменные сразу, чтобы избежать ошибок при раннем вызове
if (typeof _lastEffectsUpdate === 'undefined') {
  _lastEffectsUpdate = 0;
}
if (typeof _effectsDebounceTimeout === 'undefined') {
  _effectsDebounceTimeout = null;
}

function renderEffects() {
  const nowTs = now();
  // Обновляем не чаще чем раз в 600мс для производительности
  if (nowTs - _lastEffectsUpdate < 600) {
    if (!_effectsDebounceTimeout) {
      _effectsDebounceTimeout = requestAnimationFrame(() => {
        _renderEffectsInternal();
        _lastEffectsUpdate = now();
        _effectsDebounceTimeout = null;
      });
    }
    return;
  }
  
  _renderEffectsInternal();
  _lastEffectsUpdate = nowTs;
}

function _renderEffectsInternal() {
  const list = document.getElementById('effects-list');
  if (!list) {
    return;
  }
  
  if (!save || !save.modifiers) {
    if (list.children.length > 0) {
      list.innerHTML = '';
    }
    return;
  }
  
  const tNow = now();
  let html = '';
  
  // Golden click
  if (save.click && save.click.goldenUntil > tNow) {
    const remain = Math.ceil((save.click.goldenUntil - tNow) / 1000);
    html += `<div class="effect good">Golden click: ${remain}s</div>`;
  }
  
  // Spider buff/debuff
  if (save.modifiers.spiderUntil > tNow) {
    const remain = Math.ceil((save.modifiers.spiderUntil - tNow) / 1000);
    const mult = save.modifiers.spiderMult || 1.0;
    const type = mult > 1 ? 'good' : 'bad';
    html += `<div class="effect ${type}">Spider ${mult>1?'blessing':'curse'}: ${remain}s</div>`;
  }
  
  // Click debuff
  if (save.modifiers.clickDebuffLevel > 0) {
    const debuffPercent = Math.min(100, save.modifiers.clickDebuffLevel).toFixed(4);
    html += `<div class="effect bad">Click debuff: -${debuffPercent}% passive income</div>`;
  }
  
  // Убираем просроченные эффекты из activeEffects
  if (save.modifiers.activeEffects) {
    save.modifiers.activeEffects = save.modifiers.activeEffects.filter(e => e.until > tNow);
    
    // Добавляем активные эффекты
    save.modifiers.activeEffects.forEach(e => {
      const secondsLeft = ((e.until - tNow)/1000).toFixed(1);
      const effectClass = (
        e.type.toLowerCase().includes('buff') || e.type.toLowerCase().includes('golden')
          ? 'good'
          : e.type.toLowerCase().includes('debuff') || e.type.toLowerCase().includes('broken')
          ? 'bad'
          : 'info'
      );
      html += `<div class="effect ${effectClass}">${e.type} — ${secondsLeft}s left</div>`;
    });
  }
  
  // Обновляем только если изменилось
  if (list.innerHTML !== html) {
    list.innerHTML = html;
    _lastEffectsState = html;
  }
  
  if (!html) {
    _lastEffectsState = '';
  }
}


// Обновляет все заметки ремонта каждую секунду
function _updateBuildingCountdowns() {
  const nodes = document.querySelectorAll('.building-downnote');
  const t = now();
  nodes.forEach(node => {
    const blockedUntil = parseInt(node.dataset.blockedUntil || '0', 10);
    if (!blockedUntil || t >= blockedUntil) {
      // время истекло — удаляем ноту (или можно заменить текст)
      node.remove();
      // при желании можно перерендерить здания целиком, чтобы восстановить кнопки и т.д.
      renderAll();
      return;
    }
    const remain = Math.ceil((blockedUntil - t) / 1000);
    node.textContent = `Under repair: ${remain}s`;
  });
}

// ===== Updates modal logic =====
// Редактируйте этот массив — добавляйте/удаляйте апдейты.
// Каждый элемент: { title: 'Заголовок', date: '2025-12-05', body: 'Текст апдейта' }
const GAME_UPDATES = [
  {
    title: 'Patch Alpha 0.1b',
    date: '2025-12-07',
    body: 'Fixed Uber building card.\n\nBuilding cards no longer break after opening/closing the Updates window.\n\nNumbers now use abbreviations like: k, M, B, etc.\n\nRemoved the word "cost" during any upgrade operations.'
  },

  {
     title: 'Patch Alpha 0.1a',
    date: '2025-12-05',
    body: 'Hotfix: Building downtime.\n\nFixed a bug with building repair timers; buttons now correctly become active again.\n\nAdded Updates button.\n\nBuilding repair downtime increased from 82s to 164s.'
  }
];


const updatesBtn = document.getElementById('updates-btn');
const updatesModal = document.getElementById('updates-modal');
const updatesBody = document.getElementById('updates-body');
const updatesClose = document.getElementById('updates-close');
const updatesClose2 = document.getElementById('updates-close-2');

// Confirmation modal elements
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');
let confirmCallback = null;

// Рендер списка апдейтов в модалке
function _renderUpdatesList() {
  if (!updatesBody) return;
  updatesBody.innerHTML = '';
  if (!GAME_UPDATES || GAME_UPDATES.length === 0) {
    updatesBody.innerHTML = '<div class="update-item"><div class="u-body">No updates yet.</div></div>';
    return;
  }
  GAME_UPDATES.forEach(u => {
    const node = document.createElement('div');
    node.className = 'update-item';
    const title = document.createElement('div');
    title.className = 'u-title';
    title.textContent = u.title || 'Update';
    if (u.date) {
      const d = document.createElement('span');
      d.className = 'u-date';
      d.textContent = u.date;
      title.appendChild(d);
    }
    const body = document.createElement('div');
    body.className = 'u-body';
    // сохраняем переносы строк в <pre> подобном виде для читаемости
    body.textContent = u.body || '';
    node.appendChild(title);
    node.appendChild(body);
    updatesBody.appendChild(node);
  });
}

/*
  Открытие/закрытие модалки — аккуратно, чтобы не ломать layout:
  - используем CSS-класс .open на модалке (в CSS уже есть #updates-modal.open { display:flex; })
  - добавляем класс body.modal-open для блокировки скролла
  - компенсируем ширину скролла (padding-right) при появлении модалки, чтобы не дергался layout
  - при закрытии восстанавливаем исходные значения
*/
let _savedBodyPaddingRight = '';
let _savedGameColumnsWidth = null;
let _savedGameColumnsWidthStats = null;

function _getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function openUpdatesModal() {
  _renderUpdatesList();

  // Пометка aria
  updatesModal.setAttribute('aria-hidden', 'false');

  // КРИТИЧНО: Сохраняем реальную ширину grid ДО любых изменений layout
  const gameColumns = document.querySelector('.game-columns');
  if (gameColumns) {
    const rect = gameColumns.getBoundingClientRect();
    _savedGameColumnsWidth = rect.width;
  }

  // ВАЖНО: Сначала вычисляем ширину скроллбара ДО любых изменений layout
  // Сохраняем текущий padding-right тела
  _savedBodyPaddingRight = document.body.style.paddingRight || '';
  const sbw = _getScrollbarWidth();
  
  // Применяем компенсацию скроллбара ПЕРЕД блокировкой прокрутки
  if (sbw > 0) {
    document.body.style.paddingRight = `${sbw}px`;
  }

  // Блокируем прокрутку страницы через класс (CSS: body.modal-open { overflow: hidden; })
  document.body.classList.add('modal-open');

  // ВАЖНО: Восстанавливаем сохраненную ширину grid как фиксированное значение в пикселях
  // Используем requestAnimationFrame для синхронизации с браузерным рендерингом
  if (gameColumns && _savedGameColumnsWidth !== null) {
    requestAnimationFrame(() => {
      if (gameColumns && _savedGameColumnsWidth !== null) {
        gameColumns.style.width = `${_savedGameColumnsWidth}px`;
        gameColumns.style.minWidth = `${_savedGameColumnsWidth}px`;
        gameColumns.style.maxWidth = `${_savedGameColumnsWidth}px`;
      }
    });
  }

  // Показываем модалку ПОСЛЕ компенсации скроллбара (CSS управляет display)
  updatesModal.classList.add('open');

  // Фокусируем кнопку закрытия для доступности
  if (updatesClose && typeof updatesClose.focus === 'function') updatesClose.focus();

  // Слушатель клавиши Escape для закрытия
  document.addEventListener('keydown', _updatesKeyHandler);
}

function closeUpdatesModal() {
  // Скрываем модалку
  updatesModal.classList.remove('open');
  updatesModal.setAttribute('aria-hidden', 'true');

  // Восстанавливаем padding-right ПЕРЕД удалением overflow: hidden
  document.body.style.paddingRight = _savedBodyPaddingRight || '';

  // Убираем блокировку прокрутки
  document.body.classList.remove('modal-open');

  // ВАЖНО: Восстанавливаем исходную ширину grid ПОСЛЕ того, как браузер пересчитал layout
  // Используем двойной requestAnimationFrame для гарантии, что layout пересчитан
  const gameColumns = document.querySelector('.game-columns');
  if (gameColumns && _savedGameColumnsWidth !== null) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Теперь безопасно удаляем фиксированные значения
        if (gameColumns) {
          gameColumns.style.width = '';
          gameColumns.style.minWidth = '';
          gameColumns.style.maxWidth = '';
        }
        _savedGameColumnsWidth = null;
      });
    });
  }

  // Возвращаем фокус на кнопку Updates
  if (updatesBtn && typeof updatesBtn.focus === 'function') updatesBtn.focus();

  // Удаляем обработчик Escape
  document.removeEventListener('keydown', _updatesKeyHandler);
}

function _updatesKeyHandler(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeUpdatesModal();
  }
}

// Подключаем обработчики кликов
if (updatesBtn) {
  updatesBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    openUpdatesModal();
  });
}
if (updatesClose) updatesClose.addEventListener('click', closeUpdatesModal);
if (updatesClose2) updatesClose2.addEventListener('click', closeUpdatesModal);

// Закрытие при клике по фону модалки (но не по внутренней карточке)
if (updatesModal) {
  updatesModal.addEventListener('click', (ev) => {
    // если кликнули именно по модалке (фон), а не по .modal-card или его потомкам
    if (ev.target === updatesModal) closeUpdatesModal();
  });
}

// Инициализация: рендерим список заранее (необязательно, но удобно)
_renderUpdatesList();

// ===== Confirmation modal logic =====
function showConfirmModal(message, onConfirm) {
  if (!confirmModal || !confirmMessage) return;
  
  confirmMessage.textContent = message;
  confirmCallback = onConfirm;
  
  // Пометка aria
  confirmModal.setAttribute('aria-hidden', 'false');
  
  // Сохраняем реальную ширину grid ДО любых изменений layout
  const gameColumns = document.querySelector('.game-columns');
  if (gameColumns) {
    const rect = gameColumns.getBoundingClientRect();
    _savedGameColumnsWidth = rect.width;
  }
  
  // Вычисляем ширину скроллбара ДО любых изменений layout
  _savedBodyPaddingRight = document.body.style.paddingRight || '';
  const sbw = _getScrollbarWidth();
  
  // Применяем компенсацию скроллбара ПЕРЕД блокировкой прокрутки
  if (sbw > 0) {
    document.body.style.paddingRight = `${sbw}px`;
  }
  
  // Блокируем прокрутку страницы
  document.body.classList.add('modal-open');
  
  // Восстанавливаем сохраненную ширину grid
  if (gameColumns && _savedGameColumnsWidth !== null) {
    requestAnimationFrame(() => {
      if (gameColumns && _savedGameColumnsWidth !== null) {
        gameColumns.style.width = `${_savedGameColumnsWidth}px`;
        gameColumns.style.minWidth = `${_savedGameColumnsWidth}px`;
        gameColumns.style.maxWidth = `${_savedGameColumnsWidth}px`;
      }
    });
  }
  
  // Показываем модалку
  confirmModal.classList.add('open');
  
  // Фокусируем кнопку "No" для доступности
  if (confirmNo && typeof confirmNo.focus === 'function') confirmNo.focus();
  
  // Слушатель клавиши Escape для закрытия
  document.addEventListener('keydown', _confirmKeyHandler);
}

function closeConfirmModal() {
  if (!confirmModal) return;
  
  // Скрываем модалку
  confirmModal.classList.remove('open');
  confirmModal.setAttribute('aria-hidden', 'true');
  
  // Дополнительная проверка: убеждаемся, что модалка скрыта
  if (confirmModal.classList.contains('open')) {
    // Если класс все еще есть, принудительно удаляем его
    confirmModal.classList.remove('open');
  }
  
  // Восстанавливаем padding-right ПЕРЕД удалением overflow: hidden
  document.body.style.paddingRight = _savedBodyPaddingRight || '';
  
  // Убираем блокировку прокрутки
  document.body.classList.remove('modal-open');
  
  // Восстанавливаем исходную ширину grid
  const gameColumns = document.querySelector('.game-columns');
  if (gameColumns && _savedGameColumnsWidth !== null) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (gameColumns && _savedGameColumnsWidth !== null) {
          gameColumns.style.width = '';
          gameColumns.style.minWidth = '';
          gameColumns.style.maxWidth = '';
        }
        _savedGameColumnsWidth = null;
      });
    });
  }
  
  // Удаляем обработчик Escape
  document.removeEventListener('keydown', _confirmKeyHandler);
  
  // Очищаем callback
  confirmCallback = null;
}

function _confirmKeyHandler(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeConfirmModal();
  }
}

// Подключаем обработчики для модального окна подтверждения
if (confirmYes) {
  confirmYes.addEventListener('click', () => {
    // Выполняем callback, если он есть
    if (confirmCallback) {
      try {
        confirmCallback();
      } catch (e) {
        console.error('Error in confirm callback:', e);
      }
    }
    // Всегда закрываем модальное окно после выполнения callback
    closeConfirmModal();
  });
}

if (confirmNo) {
  confirmNo.addEventListener('click', () => {
    closeConfirmModal();
  });
}

// Закрытие при клике по фону модалки
if (confirmModal) {
  confirmModal.addEventListener('click', (ev) => {
    if (ev.target === confirmModal) closeConfirmModal();
  });
}

// Дополнительный обработчик Escape (как резервный, если основной не сработает)
// Основной обработчик добавляется в openUpdatesModal через _updatesKeyHandler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && updatesModal.classList.contains('open')) {
    closeUpdatesModal();
  }
});


// ======= Boot =======
(function boot() {
  const stored = load();
  if (stored) {
    save = stored;
    if (!save.buildings || save.buildings.length === 0) initBuildings(save);
    ensureTreasury(save);
    // Инициализируем флаги активности бафов
    const act = save.treasury?.actions;
    const t = now();
    _wasProfitWithoutTaxActive = act && act.profitWithoutTaxUntil > t;
    _wasRepairActive = act && act.repairCd > t;
    _wasLazyClickActive = save.modifiers && save.modifiers.lazyClickUntil > t;
    _wasEngineerActive = act && act.engineerUntil > t;
    _wasClickMadnessActive = act && act.clickMadnessUntil > t;
    _wasNoGoldenActive = act && act.noGoldenUntil > t;
    _wasAlwaysGoldenActive = act && act.alwaysGoldenUntil > t;
    _wasFastRepairActive = act && act.fastRepairUntil > t;
    _wasPassiveBoostActive = act && act.passiveBoostUntil > t;
    _wasMasterBuilderActive = act && act.noBreakUntil > t;
    _wasSpiderBuffActive = act && act.spiderBuffUntil > t;
    
    // Инициализируем img элементы для всех объектов (один раз при загрузке)
    _initSpiderImage();
    _initKingImage();
    _initAngryBarmatunImage();
    
    // Инициализируем достижения, если их нет
    if (!save.achievements) {
      save.achievements = {
        unlocked: {},
        stats: {
          totalClicks: 0,
          totalPlayTime: 0,
          totalDestructions: 0,
          firstBuildingBought: false,
        }
      };
    }
    // Инициализируем bulk, если его нет (для старых сохранений)
    if (save.bulk === undefined || save.bulk === null) {
      save.bulk = 1;
    }
    // Нормализуем bulk при загрузке (может быть строкой из localStorage)
    if (save.bulk !== 'max') {
      const parsed = parseInt(save.bulk, 10);
      save.bulk = isNaN(parsed) ? 1 : parsed;
    }
    // Мигрируем streak.multiplier для старых сохранений
    if (!save.streak) {
      save.streak = { count: 0, lastClickTs: 0, multiplier: 1.0 };
    } else if (save.streak.multiplier === undefined) {
      save.streak.multiplier = 1.0;
    }
    // Мигрируем старые сохранения: восстанавливаем статистику и разблокируем достижения
    migrateAchievements();
    // Мигрируем uber.max: если не в убер моде и не в убер мод (1881), устанавливаем 19
    // НЕ изменяем max если он уже установлен в 1881 (убер мод активен)
    if (save.uber && save.uber.max !== 9999 && save.uber.max !== 19 && save.uber.max !== 1881) {
      save.uber.max = 19;
    }
    // Загружаем сохраненный режим сортировки
    if (save.buildingSortMode !== undefined) {
      buildingSortMode = save.buildingSortMode;
      if (buildingSortMode < 0 || buildingSortMode >= SORT_MODES.length) {
        buildingSortMode = 0;
      }
    }
  } else {
    // Create new save if none exists
    save = newSave('Player');
    initBuildings(save);
    ensureTreasury(save);
  }
  startAutosave();
// ... после загрузки save и первого рендера
// Рендерим достижения всегда, даже если игра не загружена
renderAchievements();
if (save) {
  ensureTreasury(save);
  // Инициализируем _lastProfitWithoutTaxUntil и флаг активности при загрузке игры
  if (save.treasury && save.treasury.actions) {
    const profitUntil = save.treasury.actions.profitWithoutTaxUntil || 0;
    _lastProfitWithoutTaxUntil = profitUntil;
    _wasProfitWithoutTaxActive = profitUntil > now();
  }
  // Убеждаемся, что bulk инициализирован
  if (save.bulk === undefined || save.bulk === null) {
    save.bulk = 1;
  }
    // Нормализуем bulk
    if (save.bulk !== 'max') {
      const parsed = parseInt(save.bulk, 10);
      save.bulk = isNaN(parsed) ? 1 : parsed;
    }
    // Инициализируем статистику для старых сохранений
    if (!save.statistics) {
      save.statistics = {
        sessionStartTime: now(),
        lastSessionTime: 0,
      };
    }
    // Инициализируем статистики достижений
    if (save.achievements && save.achievements.stats) {
      if (save.achievements.stats.totalPointsEarned === undefined) {
        save.achievements.stats.totalPointsEarned = save.points || 0;
      }
      if (save.achievements.stats.totalPointsSpent === undefined) {
        save.achievements.stats.totalPointsSpent = 0;
      }
      if (save.achievements.stats.highestPPS === undefined) {
        save.achievements.stats.highestPPS = 0;
      }
      if (save.achievements.stats.highestPPC === undefined) {
        save.achievements.stats.highestPPC = 0;
      }
    }
    // Определяем и применяем сезон
    // Загружаем настройку сезонной темы перед обновлением сезона
    loadSeasonalTheme();
    updateSeason();
  }
  if (save) {
    // Check for offline earnings on page load
    // This will set lastActivityTime if missing, or show modal if time away > 0
    checkOfflineEarnings();
    renderAll();
    // Show game immediately
    showGame();
    // Блокируем контекстное меню (ПКМ) на игровом экране при автозагрузке
    if (gameScreen) {
      gameScreen.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
    }
  }
  
  // Дополнительно обновляем кнопки bulk после полной загрузки DOM
  setTimeout(() => {
    if (save) updateBulkButtons();
  }, 100);
})();

// ======= Statistics Functions =======
function renderStatistics() {
  const body = document.getElementById('stats-body');
  if (!body) {
    console.error('Stats body element not found');
    return;
  }
  if (!save) {
    console.error('Save not loaded');
    return;
  }
  // Инициализируем save.statistics для sessionStartTime (не связано с достижениями)
  if (!save.statistics) {
    save.statistics = {
      sessionStartTime: now(),
      lastSessionTime: 0,
    };
  }
  
  // Мигрируем статистики достижений из save.statistics в save.achievements.stats (для старых сохранений)
  if (save.achievements && save.achievements.stats) {
    if (save.statistics.totalPointsEarned !== undefined && save.achievements.stats.totalPointsEarned === 0) {
      save.achievements.stats.totalPointsEarned = save.statistics.totalPointsEarned || save.points || 0;
    }
    if (save.statistics.totalPointsSpent !== undefined) {
      save.achievements.stats.totalPointsSpent = save.statistics.totalPointsSpent || 0;
    }
    if (save.statistics.highestPPS !== undefined) {
      save.achievements.stats.highestPPS = save.statistics.highestPPS || 0;
    }
    if (save.statistics.highestPPC !== undefined) {
      save.achievements.stats.highestPPC = save.statistics.highestPPC || 0;
    }
    // Синхронизируем старые и новые имена полей
    if (save.achievements.stats.goldenClickActivations > 0 && save.achievements.stats.goldenClicksActivated === 0) {
      save.achievements.stats.goldenClicksActivated = save.achievements.stats.goldenClickActivations;
    }
    if (save.achievements.stats.brokenClickEvents > 0 && save.achievements.stats.brokenClicksEncountered === 0) {
      save.achievements.stats.brokenClicksEncountered = save.achievements.stats.brokenClickEvents;
    }
    if (save.achievements.stats.longestSession > 0 && save.achievements.stats.longestSessionTime === 0) {
      save.achievements.stats.longestSessionTime = save.achievements.stats.longestSession;
    }
  }
  
  const stats = save.achievements && save.achievements.stats ? save.achievements.stats : {};
  const achievements = save.achievements;
  const currentPPS = totalPPS();
  const currentPPC = totalPPC();
  const sessionStartTime = save.statistics && save.statistics.sessionStartTime ? save.statistics.sessionStartTime : now();
  const sessionTime = now() - sessionStartTime;
  const totalPlayTime = achievements ? achievements.stats.totalPlayTime : 0;
  
  // Calculate additional statistics
  const totalBuildingLevels = save.buildings.reduce((sum, b) => sum + b.level, 0);
  const maxBuildingLevel = Math.max(...save.buildings.map(b => b.level), 0);
  const unlockedBuildings = save.buildings.filter(b => b.level > 0).length;
  const unlockedAchievements = achievements ? Object.keys(achievements.unlocked || {}).length : 0;
  const tNow = now();
  const clickGolden = save.click.goldenUntil > tNow;
  const streakCount = save.streak ? save.streak.count : 0;
  const streakMult = save.streak ? save.streak.multiplier : 1.0;
  const treasuryValue = save.treasury ? save.treasury.value : 0;
  const treasuryMax = save.treasury ? save.treasury.max : 1000;
  const treasuryRegen = save.treasury ? save.treasury.regenPerSec : 1;
  const treasuryPercent = treasuryMax > 0 ? Math.round((treasuryValue / treasuryMax) * 100) : 0;
  const clickUpgradeBonus = save.click.upgradeBonus || 0;
  const clickUpgradePercent = clickUpgradeBonus * 3; // Each upgrade is 3%
  
  body.innerHTML = `
    <div class="stat-section">
      <div class="stat-section-title">Points & Economy</div>
      <div class="stat-row">
        <span class="stat-label">Current Points:</span>
        <span class="stat-value">${fmt(save.points)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Points Earned:</span>
        <span class="stat-value">${fmt(stats.totalPointsEarned)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Points Spent:</span>
        <span class="stat-value">${fmt(stats.totalPointsSpent)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Net Points (Earned - Spent):</span>
        <span class="stat-value">${fmt(stats.totalPointsEarned - stats.totalPointsSpent)}</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Income Performance</div>
      <div class="stat-row">
        <span class="stat-label">Current Points Per Second:</span>
        <span class="stat-value">${fmt(currentPPS)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Highest Points Per Second:</span>
        <span class="stat-value">${fmt(stats.highestPPS)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Current Points Per Click:</span>
        <span class="stat-value">${fmt(currentPPC)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Highest Points Per Click:</span>
        <span class="stat-value">${fmt(stats.highestPPC)}</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Click Button</div>
      <div class="stat-row">
        <span class="stat-label">Click Button Level:</span>
        <span class="stat-value">${save.click.level} / ${save.click.max}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Click UP Bonuses:</span>
        <span class="stat-value">${clickUpgradeBonus} (+${clickUpgradePercent}%)</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Click Status:</span>
        <span class="stat-value">${clickGolden ? 'Golden' : 'Ready'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Current Streak:</span>
        <span class="stat-value">${streakCount} clicks (x${streakMult.toFixed(2)})</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Treasury</div>
      <div class="stat-row">
        <span class="stat-label">Treasury Coins:</span>
        <span class="stat-value">${fmt(treasuryValue)} / ${fmt(treasuryMax)} (${treasuryPercent}%)</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Treasury Regeneration:</span>
        <span class="stat-value">${fmt(treasuryRegen)} coins/sec</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Buildings</div>
      <div class="stat-row">
        <span class="stat-label">Unlocked Buildings:</span>
        <span class="stat-value">${unlockedBuildings} / ${save.buildings.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Building Levels:</span>
        <span class="stat-value">${totalBuildingLevels}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Average Building Level:</span>
        <span class="stat-value">${unlockedBuildings > 0 ? (totalBuildingLevels / unlockedBuildings).toFixed(2) : '0'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Highest Building Level:</span>
        <span class="stat-value">${maxBuildingLevel}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Buildings at Max Level:</span>
        <span class="stat-value">${save.buildings.filter(b => b.level >= b.max).length}</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Citadel (Uber Building)</div>
      <div class="stat-row">
        <span class="stat-label">Citadel Status:</span>
        <span class="stat-value">${save.uber.unlocked ? 'Unlocked' : 'Locked'}</span>
      </div>
      ${save.uber.unlocked ? `
      <div class="stat-row">
        <span class="stat-label">Citadel Level:</span>
        <span class="stat-value">${save.uber.level} / ${save.uber.max}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Activity & Time</div>
      <div class="stat-row">
        <span class="stat-label">Total Clicks:</span>
        <span class="stat-value">${achievements ? achievements.stats.totalClicks.toLocaleString() : '0'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Play Time:</span>
        <span class="stat-value">${formatTime(totalPlayTime)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Current Session Time:</span>
        <span class="stat-value">${formatTime(sessionTime)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Building Destructions:</span>
        <span class="stat-value">${achievements ? achievements.stats.totalDestructions : '0'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">First Building Bought:</span>
        <span class="stat-value">${achievements && achievements.stats.firstBuildingBought ? 'Yes' : 'No'}</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Achievements</div>
      <div class="stat-row">
        <span class="stat-label">Unlocked Achievements:</span>
        <span class="stat-value">${unlockedAchievements}</span>
      </div>
    </div>
  `;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function openStatsModal() {
  // Получаем элементы заново на случай, если они не были инициализированы
  const modal = document.getElementById('stats-modal');
  const body = document.getElementById('stats-body');
  
  console.log('openStatsModal called', { 
    modal: !!modal, 
    body: !!body, 
    save: !!save 
  });
  
  if (!modal) {
    console.error('Stats modal element not found');
    toast('Statistics modal not found.', 'bad');
    return;
  }
  if (!body) {
    console.error('Stats body element not found');
    toast('Statistics body not found.', 'bad');
    return;
  }
  if (!save) {
    console.error('Save not loaded');
    toast('Please log in first.', 'warn');
    return;
  }
  // Инициализируем статистику, если её нет
  if (!save.statistics) {
    save.statistics = {
      sessionStartTime: now(),
      lastSessionTime: 0,
    };
  }
  // Инициализируем статистики достижений
  if (save.achievements && save.achievements.stats) {
    if (save.achievements.stats.totalPointsEarned === undefined) {
      save.achievements.stats.totalPointsEarned = save.points || 0;
    }
    if (save.achievements.stats.totalPointsSpent === undefined) {
      save.achievements.stats.totalPointsSpent = 0;
    }
    if (save.achievements.stats.highestPPS === undefined) {
      save.achievements.stats.highestPPS = 0;
    }
    if (save.achievements.stats.highestPPC === undefined) {
      save.achievements.stats.highestPPC = 0;
    }
  }
  
  // КРИТИЧНО: Сохраняем реальную ширину grid ДО любых изменений layout
  const gameColumns = document.querySelector('.game-columns');
  if (gameColumns) {
    const rect = gameColumns.getBoundingClientRect();
    _savedGameColumnsWidthStats = rect.width;
  }
  
  try {
    renderStatistics();
    
    // Пометка aria
    modal.setAttribute('aria-hidden', 'false');
    
    // Компенсируем ширину скроллбара
    const scrollbarWidth = _getScrollbarWidth();
    if (scrollbarWidth > 0) {
      _savedBodyPaddingRight = document.body.style.paddingRight || '';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    // Добавляем класс для блокировки скролла
    document.body.classList.add('modal-open');
    
    // Фиксируем ширину grid после того, как overflow: hidden применен
    requestAnimationFrame(() => {
      if (gameColumns && _savedGameColumnsWidthStats !== null) {
        gameColumns.style.width = `${_savedGameColumnsWidthStats}px`;
        gameColumns.style.minWidth = `${_savedGameColumnsWidthStats}px`;
        gameColumns.style.maxWidth = `${_savedGameColumnsWidthStats}px`;
      }
    });
    
    modal.classList.add('open');
    console.log('Stats modal opened successfully');
  } catch (error) {
    console.error('Error opening stats modal:', error);
    toast('Error opening statistics: ' + error.message, 'bad');
  }
}

function closeStatsModal() {
  const modal = document.getElementById('stats-modal');
  if (!modal) return;
  
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  
  // Восстанавливаем padding-right
  if (_savedBodyPaddingRight !== '') {
    document.body.style.paddingRight = _savedBodyPaddingRight;
    _savedBodyPaddingRight = '';
  } else {
    document.body.style.paddingRight = '';
  }
  
  // Убираем класс для блокировки скролла
  document.body.classList.remove('modal-open');
  
  // Восстанавливаем ширину grid после того, как overflow: hidden убран
  const gameColumns = document.querySelector('.game-columns');
  if (gameColumns && _savedGameColumnsWidthStats !== null) {
    // Используем двойной requestAnimationFrame для гарантии, что браузер завершил пересчет layout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (gameColumns) {
          gameColumns.style.width = '';
          gameColumns.style.minWidth = '';
          gameColumns.style.maxWidth = '';
        }
        _savedGameColumnsWidthStats = null;
      });
    });
  }
}

startCountdownLoop();

// ======= Casino Modal =======
let selectedStakePercent = null;
let selectedDiceFace = null;

let _casinoResultTimeout = null;

function hideCasinoResultImmediate() {
  const resultOverlay = document.getElementById('casino-result-overlay');
  if (resultOverlay) {
    resultOverlay.style.display = 'none';
    resultOverlay.style.opacity = '0';
    resultOverlay.style.visibility = 'hidden';
    resultOverlay.classList.add('hidden');
    resultOverlay.classList.remove('win', 'lose');
  }
  if (_casinoResultTimeout) {
    clearTimeout(_casinoResultTimeout);
    _casinoResultTimeout = null;
  }
}

function openCasinoModal() {
  selectedStakePercent = null;
  selectedDiceFace = null;
  updateCasinoUI();
  if (casinoModal) {
    hideCasinoResultImmediate();
    casinoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
}

function closeCasinoModal() {
  if (casinoModal) {
    casinoModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  hideCasinoResultImmediate();
  selectedStakePercent = null;
  selectedDiceFace = null;
}

function updateCasinoUI() {
  if (!casinoStakePercentEl || !casinoStakeAmountEl || !casinoFaceSelectedEl || !casinoRollBtn) return;
  
  // Обновляем информацию о ставке
  if (selectedStakePercent) {
    casinoStakePercentEl.textContent = `${selectedStakePercent}%`;
    const stake = save.points * (selectedStakePercent / 100);
    casinoStakeAmountEl.textContent = fmt(stake);
  } else {
    casinoStakePercentEl.textContent = '-';
    casinoStakeAmountEl.textContent = '-';
  }
  
  // Обновляем информацию о грани
  if (selectedDiceFace) {
    casinoFaceSelectedEl.textContent = selectedDiceFace;
  } else {
    casinoFaceSelectedEl.textContent = '-';
  }
  
  // Обновляем состояние кнопки Roll - нельзя делать ставку при отрицательном балансе
  const canBet = selectedStakePercent && selectedDiceFace && save.points > 0;
  casinoRollBtn.disabled = !canBet;
  
  // Обновляем выделение кнопок
  document.querySelectorAll('.casino-bet-btn').forEach(btn => {
    const percent = parseInt(btn.dataset.percent);
    btn.classList.toggle('selected', percent === selectedStakePercent);
  });
  
  document.querySelectorAll('.casino-dice-btn').forEach(btn => {
    const face = parseInt(btn.dataset.face);
    btn.classList.toggle('selected', face === selectedDiceFace);
  });
}

function rollCasinoDice() {
  if (!selectedStakePercent || !selectedDiceFace) {
    toast('Please select bet percentage and dice face.', 'warn');
    return;
  }
  
  if (save.treasury.value < 5) {
    toast('Not enough treasury.', 'warn');
    closeCasinoModal();
    return;
  }
  
  // Проверяем, что баланс положительный
  if (save.points <= 0) {
    toast('Cannot bet with negative or zero balance.', 'warn');
    return;
  }
  
  const stake = save.points * (selectedStakePercent / 100);
  spendTreasury(5);
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Отключаем кнопку Roll
  casinoRollBtn.disabled = true;
  
  // Показываем результат поверх модального окна
  const resultOverlay = document.getElementById('casino-result-overlay');
  const resultDiceEl = document.getElementById('casino-result-dice');
  const resultTextEl = document.getElementById('casino-result-text');
  const resultAmountEl = document.getElementById('casino-result-amount');
  
  // Перед показом результата очищаем предыдущий таймер
  hideCasinoResultImmediate();

  const showResult = (isWin, amount, rollValue) => {
    resultOverlay.style.display = 'flex';
    resultOverlay.style.opacity = '1';
    resultOverlay.style.visibility = 'visible';
    resultOverlay.classList.remove('hidden', 'win', 'lose');
    resultOverlay.classList.add(isWin ? 'win' : 'lose');
    resultDiceEl.textContent = `🎲 ${rollValue}`;
    resultTextEl.textContent = isWin ? 'YOU WIN!' : 'YOU LOSE!';
    resultTextEl.style.color = isWin ? '#4ade80' : '#ff6b6b';
    resultAmountEl.textContent = `${isWin ? '+' : '-'}${fmt(amount)} points`;
    resultAmountEl.style.color = isWin ? '#4ade80' : '#ff6b6b';
  };

  if (roll === selectedDiceFace) {
    const gain = stake * 3;
    addPoints(gain);
    showResult(true, gain, roll);
    toast(`🎲 Dice ${roll}. You win +${fmt(gain)} points!`, 'good');
  } else {
    const loss = stake * 1.2;
    save.points -= loss;
    showResult(false, loss, roll);
    toast(`🎲 Dice ${roll}. You lose -${fmt(loss)} points.`, 'bad');
  }
  
  act.casinoCd = now() + 3000;
  renderTreasuryActions();
  renderTopStats();
  
  // Скрываем результат через 3 секунды, но оставляем модальное окно открытым
  _casinoResultTimeout = setTimeout(() => {
    hideCasinoResultImmediate();
    // Сбрасываем выбор и обновляем UI
    selectedStakePercent = null;
    selectedDiceFace = null;
    updateCasinoUI();
    // Включаем кнопку Roll обратно
    if (casinoRollBtn) {
      casinoRollBtn.disabled = false;
    }
  }, 3000);
}

// Casino modal event handlers
if (casinoCloseBtn) {
  casinoCloseBtn.addEventListener('click', closeCasinoModal);
}

if (casinoCancelBtn) {
  casinoCancelBtn.addEventListener('click', closeCasinoModal);
}

if (casinoRollBtn) {
  casinoRollBtn.addEventListener('click', rollCasinoDice);
}

// Bet percentage buttons
document.querySelectorAll('.casino-bet-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedStakePercent = parseInt(btn.dataset.percent);
    updateCasinoUI();
  });
});

// Dice face buttons
document.querySelectorAll('.casino-dice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedDiceFace = parseInt(btn.dataset.face);
    updateCasinoUI();
  });
});

// Close modal on background click
if (casinoModal) {
  casinoModal.addEventListener('click', (e) => {
    if (e.target === casinoModal) {
      closeCasinoModal();
    }
  });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && casinoModal && casinoModal.getAttribute('aria-hidden') === 'false') {
    closeCasinoModal();
  }
});

// ======= Sort Event Handlers =======
function initSortButton() {
  const btn = document.getElementById('sort-buildings-btn');
  if (!btn || sortButtonInitialized) return;
  
  // Load saved sort mode if available
  if (save && save.buildingSortMode !== undefined) {
    buildingSortMode = save.buildingSortMode;
    // Ensure it's within valid range
    if (buildingSortMode < 0 || buildingSortMode >= SORT_MODES.length) {
      buildingSortMode = 0;
    }
  }
  
  function updateSortButton() {
    const currentBtn = document.getElementById('sort-buildings-btn');
    if (currentBtn) {
      currentBtn.textContent = `Sort: ${SORT_MODES[buildingSortMode].name}`;
      currentBtn.title = `Current: ${SORT_MODES[buildingSortMode].name}. Click to cycle.`;
    }
  }
  
  updateSortButton();
  
  btn.addEventListener('click', () => {
    buildingSortMode = (buildingSortMode + 1) % SORT_MODES.length;
    // Save sort mode to save object
    if (save) {
      save.buildingSortMode = buildingSortMode;
      saveNow();
    }
    updateSortButton();
    renderBuildings();
  });
  
  sortButtonInitialized = true;
}

// Music control menu
const musicVolumeSlider = document.getElementById('music-volume-slider');
const musicVolumeDisplay = document.getElementById('music-volume-display');
const soundEffectsVolumeSlider = document.getElementById('sound-effects-volume-slider');
const soundEffectsVolumeDisplay = document.getElementById('sound-effects-volume-display');
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsMenu = document.getElementById('settings-menu');
const opacitySlider = document.getElementById('opacity-slider');
const opacityDisplay = document.getElementById('opacity-display');

// Opacity management (переменные объявлены выше в секции Season Functions)

function loadOpacity() {
  const stored = localStorage.getItem(OPACITY_KEY);
  if (stored !== null) {
    const val = parseInt(stored, 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      opacity = val;
      // Если значение не равно 0, применяем сохраненную прозрачность
      if (opacity > 0) {
        opacityChanged = true;
      }
      return true; // Возвращаем true, если значение было загружено
    }
  }
  // Если прозрачность не была сохранена, используем значения по умолчанию из CSS (0%)
  return false;
}

function saveOpacity() {
  localStorage.setItem(OPACITY_KEY, String(opacity));
}

function applyOpacity() {
  if (!document.body) return; // Защита от выполнения до загрузки DOM
  if (!opacityChanged) {
    // Если прозрачность не была изменена, удаляем все динамические стили
    const existingStyle = document.getElementById('dynamic-opacity-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    return;
  }
  
  // Шкала от 0% до 100%:
  // 0% = стартовая прозрачность (0.85 для основных, 0.8 для панелей)
  // 100% = полностью непрозрачно (1.0)
  // Интерполируем между этими значениями
  const minOpacity = 0.85; // Стартовая прозрачность для основных элементов
  const minPanelOpacity = 0.8; // Стартовая прозрачность для панелей
  const maxOpacity = 1.0; // Максимальная (полностью непрозрачно)
  
  // Интерполяция: progress = opacity / 100 (от 0 до 1)
  const progress = opacity / 100; // От 0 до 1
  // При opacity = 0%: progress = 0, результат = minOpacity
  // При opacity = 100%: progress = 1, результат = maxOpacity (1.0) - полностью непрозрачно
  const bgOpacity = Math.min(minOpacity + (maxOpacity - minOpacity) * progress, 1.0);
  const panelOpacity = Math.min(minPanelOpacity + (maxOpacity - minPanelOpacity) * progress, 1.0);
  
  // Гарантируем, что при значении 100% все становится полностью непрозрачным
  const finalBgOpacity = opacity === 100 ? 1.0 : bgOpacity;
  const finalPanelOpacity = opacity === 100 ? 1.0 : panelOpacity;
  
  // Проверяем, есть ли сезонные эффекты
  const hasSeason = document.body.classList.contains('season-spring') || 
                    document.body.classList.contains('season-summer') ||
                    document.body.classList.contains('season-autumn') ||
                    document.body.classList.contains('season-winter');
  
  // Обновляем стили для основных элементов
  let style = document.getElementById('dynamic-opacity-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'dynamic-opacity-styles';
    document.head.appendChild(style);
  }
  
  if (hasSeason) {
    // Если есть сезонные эффекты, изменяем альфа-канал в градиентах
    // Зима: linear-gradient(180deg, rgba(176, 224, 230, 0.05) 0%, rgba(59, 58, 54, 0.95) 100%)
    // Весна: linear-gradient(180deg, rgba(144, 238, 144, 0.05) 0%, rgba(59, 58, 54, 0.95) 100%)
    // Лето: linear-gradient(180deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 58, 54, 0.95) 100%)
    // Осень: linear-gradient(180deg, rgba(210, 105, 30, 0.06) 0%, rgba(59, 58, 54, 0.95) 100%)
    // Изменяем только последний rgba (0.95) на нужную прозрачность
    // Интерполируем от 0.95 (при opacity=0%) до 1.0 (при opacity=100%)
    const seasonMinOpacity = 0.95;
    const seasonMaxOpacity = 1.0;
    const seasonProgress = opacity / 100; // От 0 до 1
    // При opacity = 100%: seasonProgress = 1, seasonEndOpacity = 1.0 (полностью непрозрачно)
    const seasonEndOpacity = opacity === 100 ? 1.0 : Math.min(seasonMinOpacity + (seasonMaxOpacity - seasonMinOpacity) * seasonProgress, 1.0);
    
    // При значении 100% делаем весь градиент полностью непрозрачным (оба значения = 1.0)
    // Для начала градиента: интерполируем от 0.05 до 1.0
    const seasonStartMinOpacity = 0.05;
    const seasonStartMaxOpacity = 1.0;
    const seasonStartProgress = opacity / 100; // От 0 до 1
    const seasonStartOpacity = opacity === 100 ? 1.0 : Math.min(seasonStartMinOpacity + (seasonStartMaxOpacity - seasonStartMinOpacity) * seasonStartProgress, 1.0);
    
    // При значении 100% оба значения градиента должны быть 1.0
    const finalSeasonStartOpacity = opacity === 100 ? 1.0 : seasonStartOpacity;
    const finalSeasonEndOpacity = opacity === 100 ? 1.0 : seasonEndOpacity;
    
    style.textContent = `
      body.season-spring .auth-card,
      body.season-spring .game-title,
      body.season-spring .stats-bar,
      body.season-spring .panel,
      body.season-spring .click-area,
      body.season-spring .building-card,
      body.season-spring .achievements-container,
      body.season-spring #uber-card,
      body.season-spring .uber-building-card,
      body.season-spring .notice-board,
      body.season-spring .effects-board { 
        background: linear-gradient(180deg, rgba(144, 238, 144, ${finalSeasonStartOpacity}) 0%, rgba(59, 58, 54, ${finalSeasonEndOpacity}) 100%) !important; 
      }
      body.season-summer .auth-card,
      body.season-summer .game-title,
      body.season-summer .stats-bar,
      body.season-summer .panel,
      body.season-summer .click-area,
      body.season-summer .building-card,
      body.season-summer .achievements-container,
      body.season-summer #uber-card,
      body.season-summer .uber-building-card,
      body.season-summer .notice-board,
      body.season-summer .effects-board { 
        background: linear-gradient(180deg, rgba(255, 215, 0, ${finalSeasonStartOpacity}) 0%, rgba(59, 58, 54, ${finalSeasonEndOpacity}) 100%) !important; 
      }
      body.season-autumn .auth-card,
      body.season-autumn .game-title,
      body.season-autumn .stats-bar,
      body.season-autumn .panel,
      body.season-autumn .click-area,
      body.season-autumn .building-card,
      body.season-autumn .achievements-container,
      body.season-autumn #uber-card,
      body.season-autumn .uber-building-card,
      body.season-autumn .notice-board,
      body.season-autumn .effects-board { 
        background: linear-gradient(180deg, rgba(210, 105, 30, ${finalSeasonStartOpacity}) 0%, rgba(59, 58, 54, ${finalSeasonEndOpacity}) 100%) !important; 
      }
      body.season-winter .auth-card,
      body.season-winter .game-title,
      body.season-winter .stats-bar,
      body.season-winter .panel,
      body.season-winter .click-area,
      body.season-winter .building-card,
      body.season-winter .achievements-container,
      body.season-winter #uber-card,
      body.season-winter .uber-building-card,
      body.season-winter .notice-board,
      body.season-winter .effects-board { 
        background: linear-gradient(180deg, rgba(176, 224, 230, ${finalSeasonStartOpacity}) 0%, rgba(59, 58, 54, ${finalSeasonEndOpacity}) 100%) !important; 
      }
      .btn.secondary { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .btn.icon { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .click-row #click-btn { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .building-pixel { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .uber-pixel { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .btn { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .btn.primary { background: rgba(58, 42, 26, ${finalPanelOpacity}) !important; }
    `;
  } else {
    // Если нет сезонных эффектов, применяем через background
    style.textContent = `
      .auth-card { background: rgba(26, 26, 26, ${finalBgOpacity}) !important; }
      .game-title { background: rgba(26, 26, 26, ${finalBgOpacity}) !important; }
      .stats-bar { background: rgba(26, 26, 26, ${finalBgOpacity}) !important; }
      .panel { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      .click-area { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      .building-card { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      .achievements-container { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      #uber-card { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      .uber-building-card { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      .notice-board { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      .effects-board { background: rgba(26, 26, 26, ${finalPanelOpacity}) !important; }
      .btn.secondary { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .btn.icon { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .click-row #click-btn { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .building-pixel { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .uber-pixel { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .btn { background: rgba(42, 42, 42, ${finalPanelOpacity}) !important; }
      .btn.primary { background: rgba(58, 42, 26, ${finalPanelOpacity}) !important; }
    `;
  }
}

function setOpacity(value) {
  opacity = Math.max(0, Math.min(100, value)); // От 0% до 100%
  opacityChanged = true; // Отмечаем, что прозрачность изменена
  saveOpacity();
  applyOpacity();
  if (opacityDisplay) {
    opacityDisplay.textContent = opacity;
  }
  if (opacitySlider) {
    opacitySlider.value = opacity;
  }
}

// Инициализация настроек - выполняется после загрузки DOM
function initSettingsMenu() {
  // Перепроверяем элементы, так как они могут быть еще не загружены
  const btn = document.getElementById('settings-toggle-btn');
  const menu = document.getElementById('settings-menu');
  const musicSlider = document.getElementById('music-volume-slider');
  const musicDisplay = document.getElementById('music-volume-display');
  const soundSlider = document.getElementById('sound-effects-volume-slider');
  const soundDisplay = document.getElementById('sound-effects-volume-display');
  const opSlider = document.getElementById('opacity-slider');
  const opDisplay = document.getElementById('opacity-display');
  
  if (!btn || !menu) {
    // Элементы еще не загружены, попробуем позже
    setTimeout(initSettingsMenu, 100);
    return;
  }
  
  try {
    // Загружаем значение прозрачности
    const opacityLoaded = loadOpacity();
    
    // Если прозрачность была загружена и не равна 0, применяем её
    if (opacityLoaded && opacity > 0) {
      // Небольшая задержка, чтобы DOM был полностью готов
      setTimeout(() => {
        applyOpacity();
      }, 100);
    } else {
      // Если прозрачность не была сохранена или равна 0, удаляем динамические стили
      const existingOpacityStyle = document.getElementById('dynamic-opacity-styles');
      if (existingOpacityStyle) {
        existingOpacityStyle.remove();
      }
      opacityChanged = false;
    }
    
    // Обновляем отображения
    if (musicDisplay) musicDisplay.textContent = musicVolume;
    if (musicSlider) musicSlider.value = musicVolume;
    if (soundDisplay) soundDisplay.textContent = soundEffectsVolume;
    if (soundSlider) soundSlider.value = soundEffectsVolume;
    if (opDisplay) opDisplay.textContent = opacity;
    if (opSlider) opSlider.value = opacity;
    
    // Toggle menu on button click
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });
    
    // Music volume slider handler
    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        const newVolume = parseInt(e.target.value, 10);
        setMusicVolume(newVolume);
        if (musicDisplay) musicDisplay.textContent = newVolume;
      });
    }
    
    // Sound effects volume slider handler
    if (soundSlider) {
      soundSlider.addEventListener('input', (e) => {
        const newVolume = parseInt(e.target.value, 10);
        soundEffectsVolume = Math.max(0, Math.min(100, newVolume));
        saveSoundEffectsVolume();
        updateSoundEffectsVolume();
        if (soundDisplay) soundDisplay.textContent = newVolume;
      });
    }
    
    // Opacity slider handler
    if (opSlider) {
      opSlider.addEventListener('input', (e) => {
        const newOpacity = parseInt(e.target.value, 10);
        setOpacity(newOpacity);
      });
    }
    
    // Seasonal theme checkbox handler
    const seasonalCheckbox = document.getElementById('seasonal-theme-checkbox');
    if (seasonalCheckbox) {
      // Загружаем сохраненное значение
      loadSeasonalTheme();
      seasonalCheckbox.checked = seasonalThemeEnabled;
      
      seasonalCheckbox.addEventListener('change', (e) => {
        seasonalThemeEnabled = e.target.checked;
        saveSeasonalTheme();
        updateSeason(); // Обновляем сезон (включить/выключить)
      });
    }
  } catch (e) {
    console.error('Error initializing settings menu:', e);
  }
}

// Запускаем инициализацию настроек после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettingsMenu);
} else {
  setTimeout(initSettingsMenu, 100);
}

// Backward compatibility for old sound-toggle-btn
if (soundToggleBtn) {
  function updateMusicButtonIcon() {
    soundToggleBtn.textContent = musicVolume > 0 ? '🔊' : '🔇';
    soundToggleBtn.title = 'Audio settings';
  }
  
  updateMusicButtonIcon();
  
  soundToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (musicMenu) {
      musicMenu.classList.toggle('hidden');
    }
  });
  
  document.addEventListener('click', (e) => {
    if (musicMenu && !musicMenu.contains(e.target) && !soundToggleBtn.contains(e.target)) {
      musicMenu.classList.add('hidden');
    }
  });
  
  if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener('input', (e) => {
      const newVolume = parseInt(e.target.value, 10);
      setMusicVolume(newVolume);
      updateMusicButtonIcon();
    });
  }
}

// ======= Hints System =======
const HINTS_ENABLED_KEY = 'mpi_hints_enabled';
let hintsEnabled = true;

// Загружаем настройку подсказок из localStorage
function loadHintsSetting() {
  const stored = localStorage.getItem(HINTS_ENABLED_KEY);
  if (stored !== null) {
    hintsEnabled = stored === 'true';
  }
}

// Сохраняем настройку подсказок
function saveHintsSetting() {
  localStorage.setItem(HINTS_ENABLED_KEY, String(hintsEnabled));
}

// Инициализация подсказок при загрузке
loadHintsSetting();

// Система подсказок
const hints = {
  'click-btn': {
    title: 'Click Button',
    text: 'Click this button to earn points! Each click gives you points based on your Click level and upgrades. Try to maintain a streak for bonus multipliers!'
  },
  'click-buy': {
    title: 'Buy Click Levels',
    text: 'Purchase levels for your Click button to increase points per click. Higher levels cost more but provide better income. Use bulk buttons (x1, x10) to buy multiple levels at once.'
  },
  'click-seg-upgrade': {
    title: 'Click UP',
    text: 'UP your Click button to gain +3% income bonus! UPs are available every 10 levels. Each UP permanently increases your click income. UP costs 77% of previous segment cost.'
  },
  'sort-buildings-btn': {
    title: 'Sort Buildings',
    text: 'Sort your buildings by level or income. Click to cycle through: Default → Level ↓ → Level ↑ → Income ↓ → Income ↑. This helps you find the most important buildings quickly.'
  },
  'treasury-actions': {
    title: 'Treasury Actions',
    text: 'Use treasury coins to activate powerful buffs and abilities! Treasury regenerates over time. Each action has a cooldown and unique effects. Hover over buttons to see details.'
  },
  'buildings-list': {
    title: 'Buildings',
    text: 'Buildings generate passive income every second! Buy levels to increase income. Buildings can break during construction - use repair actions to fix them faster. Each building has segment UPs every 10 levels.'
  },
  'uber-card': {
    title: 'Citadel (Uber Building)',
    text: 'The Citadel is unlocked when all buildings reach level 800. It provides massive income but is very expensive. Level it up to unlock Uber Mode with new challenges and rewards!'
  },
  'stats-btn': {
    title: 'Statistics',
    text: 'View detailed statistics about your game progress: total points earned/spent, highest PPS/PPC, play time, clicks, and more. Track your progress and optimize your strategy!'
  },
  'bulk-buttons': {
    title: 'Bulk Purchase',
    text: 'Use bulk buttons (x1, x10) to buy multiple levels at once. This saves time and can be more efficient.'
  }
};

// Показываем подсказку для элемента
function showHint(elementId, hintData) {
  if (!hintsEnabled || !hintData) return;
  
  const element = document.getElementById(elementId) || document.querySelector(`[data-hint="${elementId}"]`);
  if (!element) return;
  
  // Проверяем, не показывали ли уже подсказку для этого элемента
  if (element.dataset.hintShown === 'true') return;
  
  // Проверяем, виден ли элемент на экране
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.left < 0) {
    return; // Элемент не виден
  }
  
  // Создаем элемент подсказки
  const hintEl = document.createElement('div');
  hintEl.className = 'game-hint';
  hintEl.innerHTML = `
    <div class="hint-header">
      <span class="hint-icon">💡</span>
      <span class="hint-title">${hintData.title}</span>
      <button class="hint-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="hint-body">${hintData.text}</div>
  `;
  
  // Позиционируем подсказку рядом с элементом
  hintEl.style.position = 'fixed';
  
  // Пытаемся разместить подсказку снизу от элемента
  let top = rect.bottom + 10;
  let left = rect.left;
  
  // Если подсказка не помещается снизу, размещаем сверху
  if (top + 150 > window.innerHeight) {
    top = rect.top - 150;
  }
  
  // Если подсказка не помещается справа, сдвигаем влево
  if (left + 400 > window.innerWidth) {
    left = window.innerWidth - 420;
  }
  
  // Если подсказка не помещается слева, сдвигаем вправо
  if (left < 10) {
    left = 10;
  }
  
  hintEl.style.top = `${Math.max(10, top)}px`;
  hintEl.style.left = `${left}px`;
  hintEl.style.zIndex = '10000';
  
  document.body.appendChild(hintEl);
  
  // Помечаем, что подсказка была показана
  element.dataset.hintShown = 'true';
  
  // Автоматически скрываем через 12 секунд
  const autoHideTimeout = setTimeout(() => {
    if (hintEl.parentNode) {
      hintEl.style.animation = 'hintFadeOut 0.3s ease-out';
      setTimeout(() => {
        if (hintEl.parentNode) {
          hintEl.remove();
        }
      }, 300);
    }
  }, 12000);
  
  // Закрываем при клике на кнопку закрытия
  const closeBtn = hintEl.querySelector('.hint-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoHideTimeout);
      hintEl.style.animation = 'hintFadeOut 0.3s ease-out';
      setTimeout(() => {
        if (hintEl.parentNode) {
          hintEl.remove();
        }
      }, 300);
    });
  }
  
  // Закрываем при клике вне подсказки (с небольшой задержкой, чтобы не закрывать сразу)
  setTimeout(() => {
    const closeOnClickOutside = (e) => {
      if (!hintEl.contains(e.target) && !element.contains(e.target)) {
        clearTimeout(autoHideTimeout);
        hintEl.style.animation = 'hintFadeOut 0.3s ease-out';
        setTimeout(() => {
          if (hintEl.parentNode) {
            hintEl.remove();
          }
        }, 300);
        document.removeEventListener('click', closeOnClickOutside);
      }
    };
    document.addEventListener('click', closeOnClickOutside, { once: true });
  }, 500);
}

// Инициализация подсказок для элементов при первом показе
function initHints() {
  if (!hintsEnabled) return;
  
  // Подсказка для кнопки клика (показываем сразу при входе в игру, только для новых игроков)
  if (clickBtn && !clickBtn.dataset.hintShown && save && save.achievements && save.achievements.stats.totalClicks < 10) {
    setTimeout(() => {
      showHint('click-btn', hints['click-btn']);
    }, 2000);
  }
  
  // Подсказка для зданий (показываем когда появляется первое здание)
  if (buildingsList && buildingsList.children.length > 0 && !buildingsList.dataset.hintShown) {
    const hasBuildings = save && save.buildings && save.buildings.some(b => b.level > 0);
    if (hasBuildings) {
      setTimeout(() => {
        showHint('buildings-list', hints['buildings-list']);
      }, 5000);
    }
  }
  
  // Подсказка для казны (показываем при первом взаимодействии)
  if (treasuryActionsEl && !treasuryActionsEl.dataset.hintShown) {
    const observer = new MutationObserver(() => {
      if (treasuryActionsEl.children.length > 0 && !treasuryActionsEl.dataset.hintShown) {
        setTimeout(() => {
          showHint('treasury-actions', hints['treasury-actions']);
        }, 3000);
        observer.disconnect();
      }
    });
    observer.observe(treasuryActionsEl, { childList: true });
  }
  
  // Подсказка для сортировки (показываем когда есть несколько зданий)
  if (sortBuildingsBtn && !sortBuildingsBtn.dataset.hintShown && save && save.buildings) {
    const buildingCount = save.buildings.filter(b => b.level > 0).length;
    if (buildingCount >= 3) {
      setTimeout(() => {
        showHint('sort-buildings-btn', hints['sort-buildings-btn']);
      }, 8000);
    }
  }
  
  // Подсказка для Citadel (когда разблокирован)
  if (save && save.uber && save.uber.unlocked && !document.getElementById('uber-card')?.dataset.hintShown) {
    setTimeout(() => {
      const uberCard = document.getElementById('uber-card');
      if (uberCard) {
        showHint('uber-card', hints['uber-card']);
      }
    }, 10000);
  }
}

// Обновление иконки кнопки подсказок
function updateHintsButtonIcon() {
  if (hintsToggleBtn) {
    hintsToggleBtn.textContent = hintsEnabled ? '💡' : '💡';
    hintsToggleBtn.title = hintsEnabled ? 'Hints enabled (click to disable)' : 'Hints disabled (click to enable)';
    hintsToggleBtn.style.opacity = hintsEnabled ? '1' : '0.5';
  }
}

// Инициализация кнопки подсказок
if (hintsToggleBtn) {
  updateHintsButtonIcon();
  
  hintsToggleBtn.addEventListener('click', () => {
    hintsEnabled = !hintsEnabled;
    saveHintsSetting();
    updateHintsButtonIcon();
    
    if (hintsEnabled) {
      toast('Hints enabled', 'good');
      // Показываем подсказки для видимых элементов
      initHints();
    } else {
      toast('Hints disabled', 'info');
      // Удаляем все активные подсказки
      document.querySelectorAll('.game-hint').forEach(hint => hint.remove());
    }
  });
}

// ======= Periodic checks ===++___-----++====
setInterval(() => {
  checkUberUnlock();
  renderUber();
}, 1000);

// ======= Инициализация системы защиты =======
// Запускаем защиту после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSecuritySystem, 100);
  });
} else {
  setTimeout(initSecuritySystem, 100);
}


