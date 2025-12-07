/* Medieval Pixel Idle - core logic */

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
let currentUser = null;

function newSave(username) {
  return {
    meta: { username, created: now(), extendedCaps: false, endgameUnlocked: false },
    points: 0,
    ppcBase: 0.0111,
    click: {
      level: 0,
      max: 1000,
      segUpgrades: {}, // key: segmentIndex (0..), value: true when bought
      pendingSegmentCost: {}, // track sum cost of the 10 levels bought per segment
      brokenUntil: 0,
      goldenUntil: 0,
      goldenMult: 1.5,
      upgradeBonus: 0, // cumulative 13% bonuses applied count
    },
    bulk: 1, // 1,10,50,100,'max'
    buildings: [], // filled later
    uber: {
      unlocked: false,
      level: 0,
      max: 10,
      segUpgrades: {},
      pendingSegmentCost: {},
    },
    streak: { count: 0, lastClickTs: 0 },
    modifiers: {
      spiderMult: 1.0,
      spiderUntil: 0,
    },
    lastTick: now()
  };
}

const buildingNames = [
  "Hamlet","Cottage","Hut","Lodge","Cabin","Homestead","House","Manor","Villa","Hall",
  "Forge","Mill","Bakery","Tannery","Smithy","Granary","Barn","Stable","Barracks","Keep",
  "Tower","Chapel","Abbey","Market","Guild","Tavern","Inn","Workshop","Foundry","Mine",
  "Quarry","Harbor","Port","Farmstead","Pasture","Vineyard","Orchard","Garden","Sanctum","Library",
  "Archive","Courtyard","Outpost","Watch","Gatehouse","Parlor","Kitchen","Armory","Vault","Cloister"
];

function initBuildings(saveObj) {
  // Base cost/income for first building
  const baseCost = 1.2345;
  const baseIncome = 0.0123;
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
    return JSON.parse(raw);
  } catch(e) { return null; }
}

function saveNow() {
  if (!save || !currentUser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: currentUser, data: save }));
}

function autosaveLoop() {
  setInterval(saveNow, 1000);
}

// --- Autosave: надежный автосейв каждую секунду ---
const AUTOSAVE_INTERVAL_MS = 1000;
let _autosaveTimer = null;

function _storageKeyForUser(user) {
  return `${STORAGE_KEY}::${user}`;
}

function startAutosave() {
  if (_autosaveTimer) return;
  // Сохраняем сразу при старте
  try { if (save && currentUser) { save.lastTick = now(); localStorage.setItem(_storageKeyForUser(currentUser), JSON.stringify({ user: currentUser, data: save })); } } catch(e){}
  _autosaveTimer = setInterval(() => {
    try {
      if (!save || !currentUser) return;
      save.lastTick = now();
      localStorage.setItem(_storageKeyForUser(currentUser), JSON.stringify({ user: currentUser, data: save }));
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
    if (!save || !currentUser) return;
    save.lastTick = now();
    localStorage.setItem(_storageKeyForUser(currentUser), JSON.stringify({ user: currentUser, data: save }));
  } catch (e) {}
});

// Сохраняем при уходе вкладки в фон
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveNow();
});

let _countdownInterval = null;

// Обновляет все заметки ремонта каждую секунду и перерендеривает UI, если что-то закончилось
function _updateBuildingCountdowns() {
  const nodes = document.querySelectorAll('.building-downnote');
  const t = now();
  let removedAny = false;

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

  // Если хотя бы одна нота исчезла — перерендерим интерфейс, чтобы восстановить кнопки/статусы
  if (removedAny) {
    renderAll();
  }
}


function startCountdownLoop() {
  if (_countdownInterval) return;
  _countdownInterval = setInterval(() => {
    _updateBuildingCountdowns();
    renderEffects(); // обновляем эффекты (если там тоже есть оставшееся время)
    // при необходимости можно обновлять верхнюю панель:
    renderTopStats();
  }, 1000);
}
// Запускаем цикл
startCountdownLoop();

// ======= UI Elements =======
const authScreen = document.getElementById('auth-screen');
const gameScreen = document.getElementById('game-screen');
const usernameDisplay = document.getElementById('username-display');
const pointsEl = document.getElementById('points');
const ppsEl = document.getElementById('pps');
const ppcEl = document.getElementById('ppc');

const clickBtn = document.getElementById('click-btn');
const clickStatus = document.getElementById('click-status');
const clickLevelEl = document.getElementById('click-level');
const clickMaxEl = document.getElementById('click-max');
const clickIncomeEl = document.getElementById('click-income');
const clickCostEl = document.getElementById('click-cost');
const clickSegInfo = document.getElementById('click-seg-info');
const clickSegBtn = document.getElementById('click-seg-upgrade');
const clickBuyBtn = document.getElementById('click-buy');

const bulkButtons = Array.from(document.querySelectorAll('#bulk-buttons .bulk'));

const buildingsList = document.getElementById('buildings-list');

const endgameBtn = document.getElementById('endgame-btn');
const continueBtn = document.getElementById('continue-btn');

const uberCard = document.getElementById('uber-card');
const uberBuyBtn = document.getElementById('uber-buy');
const uberLevelEl = document.getElementById('uber-level');
const uberMaxEl = document.getElementById('uber-max');
const uberIncomeEl = document.getElementById('uber-income');
const uberCostEl = document.getElementById('uber-cost');
const uberSegInfo = document.getElementById('uber-seg-info');
const uberSegBtn = document.getElementById('uber-seg-upgrade');

const spiderEl = document.getElementById('spider');

const logoutBtn = document.getElementById('logout-btn');

// Debug
const debugOpen = document.getElementById('debug-open');
const debugModal = document.getElementById('debug-modal');
const debugClose = document.getElementById('debug-close');
const debugPass = document.getElementById('debug-pass');
const debugUnlockBtn = document.getElementById('debug-unlock-btn');
const debugLock = document.getElementById('debug-lock');
const debugTools = document.getElementById('debug-tools');

// Auth controls
const loginPanel = document.getElementById('login-panel');
const registerPanel = document.getElementById('register-panel');
const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));

const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');

const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');
const registerBtn = document.getElementById('register-btn');



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

// Level cost/income for Click
function clickLevelCostAt(level) {
  // base upgrade price for click is 7.772 for first level (level 0->1)
  const base = 0.0737;
  // smooth price growth
  return base * Math.pow(1.055, level);
}
function clickIncomeAt(level, upgradesCount) {
  const basePpc = save.ppcBase;
  const upgradeMult = Math.pow(1.13, upgradesCount || 0);
  // Smooth per-level ppc growth (gentle)
  return basePpc * Math.pow(1.03, level) * upgradeMult;
}

// Building cost/income per level
function buildingLevelCostAt(b, level) {
  // baseCost scales gently with level
  return b.baseCost * Math.pow(1.06, level);
}
function buildingIncomeAt(b, level, upgradesCount) {
  const upgradeMult = Math.pow(1.13, upgradesCount || 0);
  return b.baseIncome * Math.pow(1.045, level) * upgradeMult;
}

// Uber building
function uberCostAt(level) {
  // make it hefty
  const base = 3712345678901234567890.0999;
  return base * Math.pow(1.35, level);
}
function uberIncomeAt(level, upgradesCount) {
  const baseInc = 432109876543210.3333;
  const upgradeMult = Math.pow(1.13, upgradesCount || 0);
  return baseInc * Math.pow(1.22, level) * upgradeMult;
}

// ======= Game state helpers =======
function totalPPC() {
  let ppc = clickIncomeAt(save.click.level, save.click.upgradeBonus);
  // Golden modifier
  const goldenActive = save.click.goldenUntil > now();
  const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
  // Spider modifier
  const spiderMult = save.modifiers.spiderUntil > now() ? save.modifiers.spiderMult : 1.0;
  return ppc * goldenMult * spiderMult;
}

function totalPPS() {
  let pps = 0;
  for (const b of save.buildings) {
  if (now() < b.blockedUntil) continue; // downtime disabled
  if (b.level < 1) continue;            // no income if level < 1
  pps += buildingIncomeAt(b, b.level, b.upgradeBonus);
}

  // Uber income
  if (save.uber.unlocked) {
    pps += uberIncomeAt(save.uber.level, Object.keys(save.uber.segUpgrades).length || 0);
  }
  // Spider modifier
  const spiderMult = save.modifiers.spiderUntil > now() ? save.modifiers.spiderMult : 1.0;
  return pps * spiderMult;
}

function canBuyNextBuilding(i) {
  if (i === 0) return true;
  // "Cannot upgrade next building until previous is level 67"
  return save.buildings[i-1].level >= 67;
}

function canProgressSegment(entityLevel, segUpgrades) {
  // If level is at boundary where next segment starts, require previous segment upgrade
  const seg = segmentIndex(entityLevel);
  const within = withinSegment(entityLevel);
  if (within === 0 && seg > 0) {
    // entering a new segment (levels 10k -> 10k+1), ensure previous segment upgrade exists
    return !!segUpgrades[seg-1];
  }
  // If within segment, free to progress (unless we cross boundary)
  return true;
}

// ======= Rendering =======
function renderTopStats() {
  pointsEl.textContent = fmt(save.points);
  ppsEl.textContent = fmt(totalPPS());
  ppcEl.textContent = fmt(totalPPC());
}

function renderClick() {
  const brokenActive = save.click.brokenUntil > now();
  const goldenActive = save.click.goldenUntil > now();

  clickBtn.classList.toggle('broken', brokenActive);
  clickBtn.classList.toggle('golden', goldenActive);
  clickStatus.textContent = brokenActive ? 'Broken' : (goldenActive ? 'Golden' : 'Ready');

  clickLevelEl.textContent = save.click.level;
  clickMaxEl.textContent = save.click.max;
  clickIncomeEl.textContent = fmt(clickIncomeAt(save.click.level, save.click.upgradeBonus));
  const bulk = save.bulk;

  const { totalCost, totalLevels } = computeBulkCostForClick(bulk);
  clickCostEl.textContent = fmt(totalCost);

  // Segment upgrade visibility for Click
  const seg = segmentIndex(save.click.level);
  const within = withinSegment(save.click.level);
  const prevSegBought = seg === 0 ? true : !!save.click.segUpgrades[seg-1];
  const needUpgrade = within === 0 && seg > 0 && !prevSegBought;

  if (needUpgrade) {
    // Показываем апгрейд вместо покупки
    clickSegInfo.textContent = 'Segment upgrade required to progress';
    clickBuyBtn.classList.add('hidden');
    clickBuyBtn.setAttribute('aria-hidden', 'true');

    clickSegBtn.classList.remove('hidden');
    clickSegBtn.removeAttribute('aria-hidden');
    // Визуально сделать похожей на primary (если нужно)
    clickSegBtn.classList.add('primary');
    const prevCostSum = save.click.pendingSegmentCost[seg-1] || 0;
    clickSegBtn.textContent = `Upgrade (${fmt(prevCostSum/2)})`;
    clickSegBtn.disabled = save.points < (prevCostSum/2);
  } else {
    // Показываем покупку, скрываем апгрейд
    clickSegBtn.classList.add('hidden');
    clickSegBtn.setAttribute('aria-hidden', 'true');
    clickSegBtn.classList.remove('primary');

    clickBuyBtn.classList.remove('hidden');
    clickBuyBtn.removeAttribute('aria-hidden');
    clickBuyBtn.disabled = (totalLevels === 0) || (save.points < totalCost);
    clickSegInfo.textContent = 'Buy 10 levels to unlock';
  }
}


function computeBulkCostForClick(bulk) {
  let needLevels = 0;
  if (bulk === 'max') {
    needLevels = save.click.max - save.click.level;
  } else {
    needLevels = bulk;
  }
  let allowedLevels = 0;
  for (let i = 0; i < needLevels; i++) {
    const lvl = save.click.level + i;
    if (!canProgressSegment(lvl, save.click.segUpgrades)) break;
    allowedLevels++;
  }
  let totalCost = 0;
  for (let i = 0; i < allowedLevels; i++) {
    totalCost += clickLevelCostAt(save.click.level + i);
  }
  return { totalCost, totalLevels: allowedLevels };
}

function renderBuildings() {
  buildingsList.innerHTML = '';
  save.buildings.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'building-card';

    const pixel = document.createElement('canvas');
    pixel.width = 56; pixel.height = 56;
    pixel.className = 'building-pixel';
    drawHousePixel(pixel, i);

    const info = document.createElement('div');
    info.className = 'building-info';
    const nameEl = document.createElement('div');
    nameEl.className = 'building-name';
    nameEl.textContent = b.name;
    const lvlEl = document.createElement('div');
    lvlEl.innerHTML = `<strong>Level:</strong> ${b.level} / ${b.max}`;
    const incEl = document.createElement('div');
    incEl.innerHTML = `<strong>Income/sec:</strong> ${fmt(buildingIncomeAt(b, b.level, b.upgradeBonus))}`;
    const nextCost = computeBulkCostForBuilding(i, save.bulk);
    const costEl = document.createElement('div');
    costEl.innerHTML = `<strong>Next Cost:</strong> ${fmt(nextCost.totalCost)} (${save.bulk === 'max' ? 'max' : 'x'+save.bulk})`;
    const seg = segmentIndex(b.level);
    const within = withinSegment(b.level);
    const segInfo = document.createElement('div');
    segInfo.innerHTML = `<strong>Segment:</strong> ${seg}, within ${within}/9`;

    info.appendChild(nameEl);
    info.appendChild(lvlEl);
    info.appendChild(incEl);
    info.appendChild(costEl);
    info.appendChild(segInfo);

    const actions = document.createElement('div');
    actions.className = 'building-actions';

    // Buy button
    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn primary small';
    buyBtn.textContent = 'Buy levels';
    buyBtn.disabled = now() < b.blockedUntil || !canBuyNextBuilding(i);
    buyBtn.addEventListener('click', () => buyBuildingLevels(i));

    // Segment upgrade button
    const segBtn = document.createElement('button');
    segBtn.className = 'btn small';
    const prevSegBought = seg === 0 ? true : !!b.segUpgrades[seg-1];

    if (within === 0 && seg > 0 && !prevSegBought) {
      // Требуется сегментный апгрейд — показываем только segBtn
      const prevCost = (b.pendingSegmentCost[seg-1] || 0) / 2;
      segBtn.textContent = `Upgrade (${fmt(prevCost)})`;
      segBtn.classList.remove('hidden');
      segBtn.addEventListener('click', ()=> buyBuildingSegUpgrade(i, seg-1));

      // Скрываем кнопку покупки
      buyBtn.classList.add('hidden');
      buyBtn.setAttribute('aria-hidden', 'true');
    } else {
      // Обычное состояние — показываем покупку, скрываем segBtn
      segBtn.classList.add('hidden');
      segBtn.setAttribute('aria-hidden', 'true');
    }

    actions.appendChild(buyBtn);
    actions.appendChild(segBtn);

    card.appendChild(pixel);
    card.appendChild(info);
    card.appendChild(actions);

    // lock overlay if previous building not level 67
    if (!canBuyNextBuilding(i)) {
      const lockNote = document.createElement('small');
      lockNote.style.color = '#9aa3b2';
      lockNote.textContent = 'Locked: previous building must reach level 67.';
      info.appendChild(lockNote);
    }
    if (now() < b.blockedUntil) {
  const remain = Math.ceil((b.blockedUntil - now()) / 1000);
  const downNote = document.createElement('small');
  downNote.style.color = '#c23b3b';
  downNote.className = 'building-downnote';
  // сохраняем метку окончания в data-атрибуте, чтобы таймер мог обновлять текст
  downNote.dataset.blockedUntil = String(b.blockedUntil);
  downNote.textContent = `Under repair: ${remain}s`;
  info.appendChild(downNote);
}


    buildingsList.appendChild(card);
  });
}


function computeBulkCostForBuilding(i, bulk) {
  const b = save.buildings[i];
  let needLevels = 0;
  if (bulk === 'max') {
    needLevels = b.max - b.level;
  } else {
    needLevels = bulk;
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
  uberLevelEl.textContent = save.uber.level;
  uberMaxEl.textContent = save.uber.max;
  uberIncomeEl.textContent = fmt(uberIncomeAt(save.uber.level, Object.keys(save.uber.segUpgrades).length || 0));
  uberCostEl.textContent = fmt(uberCostAt(save.uber.level));

  uberBuyBtn.disabled = !save.uber.unlocked;
  uberCard.classList.toggle('locked', !save.uber.unlocked);

  const seg = segmentIndex(save.uber.level);
  const within = withinSegment(save.uber.level);

  // Determine if a segment upgrade is required (entering new segment or at boundary)
  const needSegUpgrade = (within === 0 && seg > 0 && !save.uber.segUpgrades[seg-1]) || (within === 9 && !save.uber.segUpgrades[seg]);

  if (needSegUpgrade) {
    uberSegInfo.textContent = 'Segment upgrade required to progress';
    uberBuyBtn.classList.add('hidden');
    uberBuyBtn.setAttribute('aria-hidden', 'true');

    uberSegBtn.classList.remove('hidden');
    uberSegBtn.removeAttribute('aria-hidden');
    const prevIndex = (within === 0 && seg > 0 && !save.uber.segUpgrades[seg-1]) ? seg-1 : seg;
    const prevCostSum = save.uber.pendingSegmentCost[prevIndex] || 0;
    uberSegBtn.textContent = `Upgrade (${fmt(prevCostSum/2)})`;
    uberSegBtn.disabled = save.points < (prevCostSum/2);
  } else {
    uberSegInfo.textContent = 'Buy 10 levels to unlock';
    uberSegBtn.classList.add('hidden');
    uberSegBtn.setAttribute('aria-hidden', 'true');

    uberBuyBtn.classList.remove('hidden');
    uberBuyBtn.removeAttribute('aria-hidden');
    uberBuyBtn.disabled = !save.uber.unlocked;
  }

  // Draw pixel citadel
  drawCitadelPixel(document.getElementById('uber-pixel'));
}


function renderEffects() {
  const list = document.getElementById('effects-list');
  if (!list) return;
  list.innerHTML = '';

  const t = now();

  // Broken click
  if (save.click.brokenUntil > t) {
    const remain = Math.ceil((save.click.brokenUntil - t) / 1000);
    list.innerHTML += `<div class="effect bad">Click broken: ${remain}s</div>`;
  }

  // Golden click
  if (save.click.goldenUntil > t) {
    const remain = Math.ceil((save.click.goldenUntil - t) / 1000);
    list.innerHTML += `<div class="effect good">Golden click: ${remain}s</div>`;
  }

  // Spider buff/debuff
  if (save.modifiers.spiderUntil > t) {
    const remain = Math.ceil((save.modifiers.spiderUntil - t) / 1000);
    const mult = save.modifiers.spiderMult;
    const type = mult > 1 ? 'good' : 'bad';
    list.innerHTML += `<div class="effect ${type}">Spider ${mult>1?'blessing':'curse'}: ${remain}s</div>`;
  }
}


function renderAll() {
  renderTopStats();
  renderClick();
  renderBuildings();
  renderUber();
  renderEffects();
  startAutosave();

  updateEndgameButtons();
}

// ======= Actions =======
function addPoints(n) {
  save.points += n;
}

function buyBulkLevels(entity, computeFn, applyFn) {
  const { totalCost, totalLevels } = computeFn(save.bulk);
  if (totalLevels === 0) {
    toast('Cannot progress: segment upgrade required.', 'warn');
    return;
  }
  if (save.points < totalCost) {
    toast('Not enough points.', 'warn');
    return;
  }

  // Apply
  save.points -= totalCost;

  // Track segment cost sum
  for (let i = 0; i < totalLevels; i++) applyFn();

  // After buy, re-render
  renderAll();
}

function buyClickLevels() {
  const segStartLevel = save.click.level;
  buyBulkLevels('click', computeBulkCostForClick, () => {
    const lvl = save.click.level;
    const cost = clickLevelCostAt(lvl);
    const seg = segmentIndex(lvl);
    save.click.pendingSegmentCost[seg] = (save.click.pendingSegmentCost[seg] || 0) + cost;

    // 66% break or 33% golden on 101st continuous click (handled in clicking, not leveling)
    // Level up gating check (3% fail chance for buildings only, not for click)
    save.click.level = Math.min(save.click.level + 1, save.click.max);
  });
}

function buyClickSegmentUpgrade(segIndex) {
  const costSum = (save.click.pendingSegmentCost[segIndex] || 0) / 2;
  if (save.points < costSum) {
    toast('Not enough points for segment upgrade.', 'warn');
    return;
  }
  save.points -= costSum;
  save.click.segUpgrades[segIndex] = true;
  save.click.upgradeBonus += 1; // 13% per upgrade (count stack)
  toast('Click segment upgraded: +13% income.', 'good');
  renderAll();
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
    b.pendingSegmentCost[seg] = (b.pendingSegmentCost[seg] || 0) + cost;

    // 1% chance to fail and trigger 164s downtime
    if (randChance(0.01)) {
      b.blockedUntil = now() + 164000;
      // Points already spent (kept), no level increase
      toast(`${b.name} construction failed. Repairs for 164s.`, 'bad');
    } else {
      b.level = Math.min(b.level + 1, b.max);
    }
  };
  buyBulkLevels('building', computeFn, applyFn);
}

function buyBuildingSegUpgrade(i, segIndex) {
  const b = save.buildings[i];
  const costSum = (b.pendingSegmentCost[segIndex] || 0) / 2;
  if (save.points < costSum) {
    toast('Not enough points for segment upgrade.', 'warn');
    return;
  }
  save.points -= costSum;
  b.segUpgrades[segIndex] = true;
  b.upgradeBonus += 1;
  toast(`${b.name} segment upgraded: +13% income.`, 'good');
  renderAll();
}

// ======= Clicking mechanics =======
clickBtn.addEventListener('click', () => {
  // Broken or golden states
  if (save.click.brokenUntil > now()) {
    toast('Click button is broken.', 'warn');
    renderClick(); // обновляем статус сразу
    return;
  }

  const ts = now();
  // Streak logic
  if (ts - save.streak.lastClickTs <= 2000) {
    save.streak.count += 1;
  } else {
    save.streak.count = 1;
  }
  save.streak.lastClickTs = ts;

  // Apply points
  const ppc = totalPPC();
  addPoints(ppc);

  // After >100 continuous, 101st click triggers outcomes
  if (save.streak.count === 101) {
    const roll = Math.random();
    if (roll < 0.66) {
      // Break for 26s
      save.click.brokenUntil = now() + 26000;
      toast('Click button broke for 26s.', 'bad');
      renderClick(); // обновляем статус сразу
    } else {
      // Golden for 8s then break for 11s
      save.click.goldenUntil = now() + 8000;
      toast('Click button turned golden for 8s (x1.5 PPC).', 'good');
      renderClick(); // обновляем статус сразу

      setTimeout(() => {
        save.click.brokenUntil = now() + 11000;
        save.click.goldenUntil = 0;
        toast('Golden ended. Button broke for 11s.', 'warn');
        renderClick(); // обновляем статус после окончания
      }, 8000);
    }
  }

  // Обновляем верхние показатели и статус кнопки
  renderTopStats();
  renderClick();
});


// ======= Bulk controls =======
bulkButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    bulkButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    save.bulk = btn.dataset.bulk === 'max' ? 'max' : parseInt(btn.dataset.bulk, 10);
    renderAll();
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
  escapeTimer: null // id таймера, который отвечает за сообщение "сполз/убежал"
};


// compute spider size safely
function _getSpiderSize() {
  if (!spiderEl) return { w: 64, h: 64 };
  const r = spiderEl.getBoundingClientRect();
  return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
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

  const cur = spiderEl.getBoundingClientRect();
  let nx, ny, attempts = 0;
  do {
    nx = _randInt(0, maxLeft);
    ny = _randInt(0, maxTop);
    attempts++;
  } while (attempts < 8 && Math.hypot(nx - cur.left, ny - cur.top) < Math.max(w,h) * 0.5);

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
let nextSpiderTs = now() + 180000; // 3 minutes
function maybeSpawnSpider() {
  const t = now();
  if (t >= nextSpiderTs) {
    spawnSpider();
    // small variation so schedule isn't rigid
    nextSpiderTs = t + 180000 + _randInt(-30000, 30000);
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
  miniGame: null // { timerId, remaining, clickedCount, crowns: [] }
};

// helper: schedule next king spawn in 3..10 minutes
function scheduleNextKing() {
  if (_kingState.spawnTimer) clearTimeout(_kingState.spawnTimer);
  const ms = _randInt(3 * 60 * 1000, 7 * 60 * 1000); // 3..7 minutes
  _kingState.spawnTimer = setTimeout(spawnKing, ms);
}

// place king randomly (reuses spider placement logic)
function _placeKingRandom() {
  if (!kingEl) return;
  const w = kingEl.offsetWidth || 64;
  const h = kingEl.offsetHeight || 64;
  const maxLeft = Math.max(0, window.innerWidth - w);
  const maxTop = Math.max(0, window.innerHeight - h);
  kingEl.style.left = _randInt(0, maxLeft) + 'px';
  kingEl.style.top = _randInt(0, maxTop) + 'px';
  kingEl.style.transform = `rotate(${_randInt(-12,12)}deg)`;
}

// spawn king: show for 23s unless clicked
function spawnKing() {
  if (!kingEl) return;
  _placeKingRandom();
  kingEl.classList.add('show');
  kingEl.title = 'King — click to start the mini-game';
  _kingState.visibleUntil = now() + 23000;
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
  // open mini-game
  openKingMiniGame();
  // hide king from screen while mini-game is active
  kingEl.classList.remove('show');
  if (_kingState.escapeTimer) { clearTimeout(_kingState.escapeTimer); _kingState.escapeTimer = null; }
});

// Mini-game implementation
function openKingMiniGame() {
  // initialize state
  const durationMs = 15000;
  const target = 12;
  kingModal.classList.add('show');
  kingModal.setAttribute('aria-hidden', 'false');
  kingArena.innerHTML = '';
  kingStatusEl.textContent = `Click ${target} crowns in ${durationMs/1000} seconds. Clicking the background is an instant miss.`;
  let clicked = 0;
  const crowns = [];

  // spawn crowns randomly inside arena; to avoid overlap we place them progressively
  function spawnCrowns() {
    const rect = kingArena.getBoundingClientRect();
    for (let i = 0; i < target; i++) {
      const c = document.createElement('div');
      c.className = 'king-crown';
      // random position within arena, leave margin
      const margin = 15;
      const x = _randInt(margin, Math.max(margin, rect.width - 48 - margin));
      const y = _randInt(margin, Math.max(margin, rect.height - 36 - margin));
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      c.dataset.index = String(i);
      c.title = 'Click!';
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
  _kingState.miniGame = { timerId, crowns, onArenaClick, clicked };

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
  const target = info.target || 15;

  if (outcome === 'success') {
    // reward: +4 levels to each opened Building, +3 Click, +5% points
    let openedCount = 0;
    save.buildings.forEach(b => {
      if (b.level > 0) {
        b.level = Math.min(b.max, b.level + 4);
        openedCount++;
      }
    });
    save.click.level = Math.min(save.click.max, save.click.level + 3);
    // +5% points
    save.points = save.points * 1.05;
    toast(`Success! The King rewarded you: +4 levels to open buildings (${openedCount}), +3 to Click, +5% points.`, 'good');
  } else if (outcome === 'timeout') {
    // not enough crowns in time -> penalty: -1 level each opened building, -2 click
    save.buildings.forEach(b => {
      if (b.level > 0) b.level = Math.max(0, b.level - 1);
    });
    save.click.level = Math.max(0, save.click.level - 2);
    toast(`Time's up. The King punished you: -1 level Building, -2 Click.`, 'bad');
  } else if (outcome === 'miss') {
    // immediate heavy penalty: -3 each building, -7 click, -30% points
    save.buildings.forEach(b => {
      b.level = Math.max(0, b.level - 3);
    });
    save.click.level = Math.max(0, save.click.level - 7);
    save.points = Math.max(0, save.points * 0.7);
    toast(`Miss! The King is furious: -3 levels Buildings, -7 Click, -30% points.`, 'bad');
  }

  // render and schedule next king
  renderAll();
  scheduleNextKing();
}

// allow closing mini-game manually (counts as timeout)
kingCloseBtn.addEventListener('click', () => {
  if (_kingState.miniGame) {
    endKingMiniGame('timeout', { clicked: (_kingState.miniGame && _kingState.miniGame.clicked) || 0, target:15 });
  } else {
    kingModal.classList.remove('show');
    kingModal.setAttribute('aria-hidden', 'true');
    scheduleNextKing();
  }
});

// If modal is open and user presses Escape -> cancel (timeout)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && kingModal.classList.contains('show')) {
    if (_kingState.miniGame) endKingMiniGame('timeout', { clicked:0, target:15 });
  }
});

// Start initial schedule on load
scheduleNextKing();


function spawnSpider() {
  if (!spiderEl) return;

  // ensure spider is visible and positioned inside viewport
  _placeSpiderRandom();
  spiderEl.classList.remove('hidden');

  // ensure CSS transitions exist for smooth movement
  const cs = getComputedStyle(spiderEl);
  if (!cs.transition || cs.transition.indexOf('left') === -1) {
    spiderEl.style.transition = 'left 0.9s cubic-bezier(.22,.9,.35,1), top 0.9s cubic-bezier(.22,.9,.35,1), transform 0.25s ease';
  }

  // mark alive window
  _spiderState.aliveUntil = now() + 30000; // 30s
  _startSpiderMovement();
  toast('A spider appears...', 'warn');

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
  // ensure smooth transitions exist; fallback to inline if not
  const cs = getComputedStyle(spiderEl);
  if (!cs.transition || cs.transition.indexOf('left') === -1) {
    spiderEl.style.transition = 'left 0.9s cubic-bezier(.22,.9,.35,1), top 0.9s cubic-bezier(.22,.9,.35,1), transform 0.25s ease';
  }

  spiderEl.addEventListener('click', () => {
    // отменяем таймер "убежал", если он есть
    if (_spiderState.escapeTimer) {
      clearTimeout(_spiderState.escapeTimer);
      _spiderState.escapeTimer = null;
    }
    // пометим, что паук больше не "жив" в плане таймера
    _spiderState.aliveUntil = 0;

    const roll = Math.random();
    if (roll < 0.25) {
      save.modifiers.spiderMult = 0.0001;
      save.modifiers.spiderUntil = now() + 36000;
      toast('Spider curse! All income x0.0001 for 36s.', 'bad');
    } else if (roll < 0.50) {
      save.modifiers.spiderMult = 100.0;
      save.modifiers.spiderUntil = now() + 7000;
      toast('Spider blessing! All income x100 for 7s.', 'good');
    } else {
      toast('Squished! No effect.', 'info');
    }

    // Скрываем паука и останавливаем движение
    spiderEl.classList.add('hidden');
    _stopSpiderMovement();
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

// ======= Ticker =======
function tick() {
  const t = now();
  const dt = (t - save.lastTick) / 1000; // seconds
  save.lastTick = t;

  // Real-time income
  const pps = totalPPS();
  addPoints(pps * dt);

  // Spider spawn check
  maybeSpawnSpider();

  // Update UI
  renderTopStats();
  renderEffects();

  // Render some parts less often
}
setInterval(tick, 100); // 10x per second for smoothness

// ======= Endgame & caps =======
function checkUberUnlock() {
  if (save.uber.unlocked) return;
  const all800 = save.buildings.every(b => b.level >= 800) && save.click.level >= 800;
  if (all800) {
    save.uber.unlocked = true;
    uberBuyBtn.disabled = false;
    toast('Uber Turbo Building unlocked!', 'good');
  }
}
function updateEndgameButtons() {
  // When uber reaches level 10, show endgame or continue
  if (save.uber.level >= 10 && !save.meta.extendedCaps) {
    endgameBtn.classList.remove('hidden');
    continueBtn.classList.remove('hidden');
  } else {
    endgameBtn.classList.add('hidden');
    continueBtn.classList.add('hidden');
  }
}
uberBuyBtn.addEventListener('click', () => {
  if (!save.uber.unlocked) return;
  // Respect segment gating
  const seg = segmentIndex(save.uber.level);
  const within = withinSegment(save.uber.level);
  if (within === 0 && seg > 0 && !save.uber.segUpgrades[seg-1]) {
    toast('Segment upgrade required to progress.', 'warn');
    return;
  }
  const cost = uberCostAt(save.uber.level);
  if (save.points < cost) {
    toast('Not enough points.', 'warn');
    return;
  }
  save.points -= cost;
  // Track segment cost
  save.uber.pendingSegmentCost[seg] = (save.uber.pendingSegmentCost[seg] || 0) + cost;
  save.uber.level = Math.min(save.uber.level + 1, save.uber.max);
  toast('Citadel level increased.', 'good');
  renderAll();
});
uberSegBtn.addEventListener('click', () => {
  const seg = segmentIndex(save.uber.level);
  const within = withinSegment(save.uber.level);
  const targetSeg = within === 0 ? seg-1 : seg;
  const costSum = (save.uber.pendingSegmentCost[targetSeg] || 0) / 2;
  if (save.points < costSum) {
    toast('Not enough points for segment upgrade.', 'warn');
    return;
  }
  save.points -= costSum;
  save.uber.segUpgrades[targetSeg] = true;
  toast('Citadel segment upgraded: +13% income.', 'good');
  renderAll();
});

endgameBtn.addEventListener('click', () => {
  save.meta.endgameUnlocked = true;
  toast('You completed the game! Take a victory pause.', 'good');
});
continueBtn.addEventListener('click', () => {
  save.meta.extendedCaps = true;
  toast('Extended caps unlocked. You may level Click/buildings to 9922, Citadel to 99.', 'good');
  save.click.max = 9922;
  save.buildings.forEach(b => b.max = 9922);
  save.uber.max = 99;
  renderAll();
});

// ======= Pixel art drawing (procedural) =======
function drawHousePixel(canvas, seed) {
  const ctx = canvas.getContext('2d');
  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // Pixel grid 14x14
  const px = 4;
  // Palette (medieval earth tones)
  const palettes = [
    ['#3a2a1a','#7b4f1c','#b8893d','#d6b557','#2a2f46'],
    ['#2b1f14','#6a4420','#a8732f','#cfa25a','#1f2538'],
    ['#2a1b12','#5e3a19','#9a6a2c','#c59752','#242a3f']
  ];
  const pal = palettes[seed % palettes.length];
  const base = pal[0], wood = pal[1], roof = pal[2], trim = pal[3], shadow = pal[4];

  // Ground
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 52, 56, 4);

  // Walls
  ctx.fillStyle = wood;
  ctx.fillRect(10, 28, 36, 22);

  // Roof
  ctx.fillStyle = roof;
  ctx.fillRect(6, 22, 44, 8);
  ctx.fillStyle = trim;
  ctx.fillRect(6, 30, 44, 2);

  // Door
  ctx.fillStyle = base;
  ctx.fillRect(26, 36, 8, 14);
  ctx.fillStyle = trim;
  ctx.fillRect(33, 43, 2, 2);

  // Window left
  ctx.fillStyle = '#c9d8ff';
  ctx.fillRect(14, 36, 6, 6);
  ctx.fillStyle = trim;
  ctx.fillRect(14, 39, 6, 2);

  // Window right
  ctx.fillStyle = '#c9d8ff';
  ctx.fillRect(36, 36, 6, 6);
  ctx.fillStyle = trim;
  ctx.fillRect(36, 39, 6, 2);

  // Outline
  ctx.strokeStyle = '#0b0c15';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 28, 36, 22);
  ctx.strokeRect(6, 22, 44, 8);
}

function drawCitadelPixel(el) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,64,64);

  // Base
  ctx.fillStyle = '#2f364d';
  ctx.fillRect(6, 36, 52, 22);
  // Towers
  ctx.fillStyle = '#3b4563';
  ctx.fillRect(6, 22, 12, 14);
  ctx.fillRect(46, 22, 12, 14);
  // Battlements
  ctx.fillStyle = '#586287';
  for (let i=8; i<=56; i+=10) ctx.fillRect(i, 18, 6, 4);
  // Gate
  ctx.fillStyle = '#7b4f1c';
  ctx.fillRect(30, 44, 8, 14);
  // Highlights
  ctx.fillStyle = '#a0aac8';
  ctx.fillRect(10, 28, 4, 6);
  ctx.fillRect(50, 28, 4, 6);

  el.innerHTML = '';
  el.appendChild(canvas);
}

// ======= Auth logic =======
function showGame() {
  authScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  usernameDisplay.textContent = save.meta.username;
  renderAll();
}
function showAuth() {
  gameScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
}

loginBtn.addEventListener('click', () => {
  const u = loginUsername.value.trim();
  const p = loginPassword.value;
  if (!u || !p) { toast('Please enter username and password.', 'warn'); return; }

  const stored = load();
  if (!stored || !stored.user || stored.user.username !== u || stored.user.password !== p) {
    toast('Invalid credentials.', 'bad');
    return;
  }
  currentUser = stored.user;
  save = stored.data;
  // If buildings missing (first run), init
  if (!save.buildings || save.buildings.length === 0) initBuildings(save);
  showGame();
});

registerBtn.addEventListener('click', () => {
  const u = registerUsername.value.trim();
  const p = registerPassword.value;
  if (!u || !p) { toast('Please enter username and password.', 'warn'); return; }

  // Overwrite for simplicity
  currentUser = { username: u, password: p };
  save = newSave(u);
  initBuildings(save);
  saveNow();
  toast('Account created.', 'good');
  showGame();
});

logoutBtn.addEventListener('click', () => {
  saveNow();
  currentUser = null;
  save = null;
  toast('Logged out.', 'info');
  showAuth();
});

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    if (tab === 'login') {
      loginPanel.classList.remove('hidden');
      registerPanel.classList.add('hidden');
    } else {
      registerPanel.classList.remove('hidden');
      loginPanel.classList.add('hidden');
    }
  });
});

// ======= Debug panel =======
debugOpen.addEventListener('click', () => debugModal.classList.remove('hidden'));
debugClose.addEventListener('click', () => debugModal.classList.add('hidden'));
debugUnlockBtn.addEventListener('click', () => {
  if (debugPass.value === '1488') {
    debugLock.classList.add('hidden');
    debugTools.classList.remove('hidden');
  } else {
    toast('Wrong password.', 'bad');
  }
});
debugTools.addEventListener('click', (e) => {
  const action = e.target.dataset.debug;
  if (!action) return;
  if (!save) { toast('Not logged in.', 'warn'); return; }
  switch(action) {
    case 'addPoints': addPoints(10000); toast('Added 10000 points.', 'good'); break;
    case 'addAllBuildingLevels':
      save.buildings.forEach((b,i)=>{
        for (let k=0;k<100;k++){
          const seg = segmentIndex(b.level);
          const cost = buildingLevelCostAt(b, b.level);
          b.pendingSegmentCost[seg] = (b.pendingSegmentCost[seg]||0)+cost;
          b.level = Math.min(b.level+1, b.max);
        }
      });
      toast('Added 100 levels to all buildings.', 'good');
      break;
    case 'addClickLevels':
      for (let k=0;k<100;k++){
        const seg = segmentIndex(save.click.level);
        const cost = clickLevelCostAt(save.click.level);
        save.click.pendingSegmentCost[seg]=(save.click.pendingSegmentCost[seg]||0)+cost;
        save.click.level = Math.min(save.click.level+1, save.click.max);
      }
      toast('Added 100 levels to Click.', 'good');
      break;
    case 'clickIncomeBoost':
      save.ppcBase *= 1000;
      toast('Click income x1000 base applied.', 'good');
      break;
    case 'spawnSpider':
      spawnSpider(); break;
    case 'breakClick':
      save.click.brokenUntil = now() + 26000;
      toast('Click button broken.', 'bad'); break;
    case 'goldenClick':
      save.click.goldenUntil = now() + 8000;
      toast('Click button golden.', 'good'); break;
    case 'resetAll':
      const uname = save.meta.username;
      save = newSave(uname); initBuildings(save);
      toast('Reset complete.', 'warn'); break;
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

// Рендер панели эффектов
function renderEffects() {
  const list = document.getElementById('effects-list');
  list.innerHTML = '';
  if (!save.modifiers.activeEffects) return;

  // Убираем просроченные эффекты
  save.modifiers.activeEffects = save.modifiers.activeEffects.filter(e => e.until > now());

  save.modifiers.activeEffects.forEach(e => {
    const item = document.createElement('div');
    item.className = 'effect-item ' + (
      e.type.toLowerCase().includes('buff') || e.type.toLowerCase().includes('golden')
        ? 'effect-good'
        : e.type.toLowerCase().includes('debuff') || e.type.toLowerCase().includes('broken')
        ? 'effect-bad'
        : 'effect-info'
    );

    const secondsLeft = ((e.until - now())/1000).toFixed(1);
    item.textContent = `${e.type} — ${secondsLeft}s left`;
    list.appendChild(item);
  });
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

// Дополнительный обработчик Escape (как резервный, если основной не сработает)
// Основной обработчик добавляется в openUpdatesModal через _updatesKeyHandler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && updatesModal.classList.contains('open')) {
    closeUpdatesModal();
  }
});


// Встраиваем в игровой цикл
function tick() {
  const t = now();
  const dt = (t - save.lastTick) / 1000;
  save.lastTick = t;

  // Реальный доход
  const pps = totalPPS();
  addPoints(pps * dt);

  // Проверка паука
  maybeSpawnSpider();

  // Обновление UI
  renderTopStats();
  renderEffects(); // <-- добавили сюда
}


// ======= Boot =======
(function boot() {
  const stored = load();
  if (stored && stored.user && stored.data) {
    // Keep saved for quick login
    currentUser = stored.user;
    save = stored.data;
    if (!save.buildings || save.buildings.length === 0) initBuildings(save);
    // Show auth; user can log in. Or auto-login? Keep manual per request.
  }
  autosaveLoop();
// ... после загрузки save и первого рендера
renderAll();
startCountdownLoop();

})();

// ======= Periodic checks ===++___-----++====
setInterval(() => {
  checkUberUnlock();
  renderUber();
}, 1000);
