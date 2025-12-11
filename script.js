let _talentTooltipEl = null;
let _treasuryTooltipEl = null;

function showTalentTooltip(ev, def, lvl) {
  hideTalentTooltip();
  const el = document.createElement('div');
  el.className = 'talent-tooltip';
  const nextLvl = Math.min(lvl + 1, def.max);
  const hasNext = lvl < def.max;
  const nextText = buildTalentNextText(def, nextLvl);
  el.innerHTML = `
    <div class="tt-name">${def.name}</div>
    <div class="tt-current">Current: ${buildTalentLevelText(def, lvl)}</div>
    ${hasNext ? `<div class="tt-next">Next level: ${nextText}</div>` : `<div class="tt-next">Maximum level</div>`}
    ${!talentRequirementMet(def) ? `<div class="tt-req">Requires: ${buildTalentReqText(def)}</div>` : ''}
  `;
  document.body.appendChild(el);
  _talentTooltipEl = el;
  moveTalentTooltip(ev);
}

function moveTalentTooltip(ev) {
  if (!_talentTooltipEl) return;
  const pad = 12;
  const x = ev.clientX + 16;
  const y = ev.clientY + 16;
  const w = _talentTooltipEl.offsetWidth || 260;
  const h = _talentTooltipEl.offsetHeight || 120;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = x;
  let top = y;
  if (left + w + pad > vw) left = vw - w - pad;
  if (top + h + pad > vh) top = vh - h - pad;
  _talentTooltipEl.style.left = `${left}px`;
  _talentTooltipEl.style.top = `${top}px`;
}

function hideTalentTooltip() {
  if (_talentTooltipEl && _talentTooltipEl.parentNode) {
    _talentTooltipEl.parentNode.removeChild(_talentTooltipEl);
  }
  _talentTooltipEl = null;
}

function hideTreasuryTooltip() {
  if (_treasuryTooltipEl && _treasuryTooltipEl.parentNode) {
    _treasuryTooltipEl.parentNode.removeChild(_treasuryTooltipEl);
  }
  _treasuryTooltipEl = null;
}

function buildTalentLevelText(def, lvl) {
  if (def.id === 'income') {
    const table = ['0%', '+1%', '+3%', '+6%'];
    return `+${table[lvl] || '0%'} to all income`;
  }
  if (def.id === 'treasury') {
    const bonus = def.bonuses[lvl] || 0;
    return `+${bonus} to treasury maximum`;
  }
  if (def.id === 'taxes') {
    const bonus = def.bonuses[lvl] || 0;
    return `+${bonus} treasury per second`;
  }
  if (def.id === 'stateDiscounts') {
    const chance = (def.bonuses[lvl] || 0) * 100;
    return `${chance.toFixed(1)}% chance to buy abilities for 75% cost`;
  }
  if (def.id === 'crit') {
    const mult = def.multipliers[lvl] || 1;
    return `Critical multiplier x${mult.toFixed(1)}`;
  }
  if (def.id === 'critChance') {
    const base = 3;
    const extra = (def.bonuses[lvl] || 0) * 100;
    return `Critical chance ${(base+extra).toFixed(0)}%`;
  }
  if (def.id === 'doubleCrit') {
    const chance = (def.chances[lvl] || 0) * 100;
    return `Double critical chance ${chance.toFixed(0)}%`;
  }
  if (def.id === 'masterBuilder') {
    const chance = (def.chances[lvl] || 0) * 100;
    return `${chance.toFixed(1)}% chance for free building level purchase`;
  }
  if (def.id === 'highQualification') {
    const bonus = (def.bonuses[lvl] || 0) * 100;
    return `Reduce building break chance by ${bonus.toFixed(0)}%`;
  }
  if (def.id === 'secondTeam') {
    const bonus = (def.bonuses[lvl] || 0) / 1000;
    return `Reduce repair time by ${bonus.toFixed(0)}s`;
  }
  return '';
}

function buildTalentNextText(def, nextLvl) {
  return buildTalentLevelText(def, nextLvl);
}

function buildTalentReqText(def) {
  if (!def.requires || def.requires.length === 0) return '';
  const r = def.requires[0];
  const name = TALENT_DEFS[r.id]?.name || '';
  return `${name} ${r.level}/${TALENT_DEFS[r.id]?.max || r.level}`;
}
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
    },
    achievements: {
      unlocked: {}, // key: achievementId, value: true when unlocked
      stats: {
        totalClicks: 0,
        totalPlayTime: 0, // в миллисекундах
        totalDestructions: 0, // количество разрушений зданий
        firstBuildingBought: false,
      }
    },
    talents: {
      points: 5,
      nodes: {
        income: 0,
        crit: 0,
        critChance: 0,
        doubleCrit: 0,
      }
    },
    lastTick: now()
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
      };
    }
  }
  // Modifiers defaults
  if (!saveObj.modifiers) saveObj.modifiers = {};
  if (saveObj.modifiers.breakChanceMult === undefined) saveObj.modifiers.breakChanceMult = 1.0;
  if (saveObj.modifiers.repairTimeMult === undefined) saveObj.modifiers.repairTimeMult = 1.0;
  if (!saveObj.modifiers.activeEffects) saveObj.modifiers.activeEffects = [];
  if (saveObj.modifiers.lazyClickUntil === undefined) saveObj.modifiers.lazyClickUntil = 0;
  if (saveObj.modifiers.lazyClickCount === undefined) saveObj.modifiers.lazyClickCount = 0;
  if (saveObj.treasury && saveObj.treasury.actions && saveObj.treasury.actions.lazyClickLevel === undefined) {
    saveObj.treasury.actions.lazyClickLevel = 1;
  }
}

// Talents defaults / migration
function ensureTalents(saveObj) {
  if (!saveObj.talents) {
    saveObj.talents = { points: 5, nodes: {} };
  }
  if (saveObj.talents.points === undefined || saveObj.talents.points === null) {
    saveObj.talents.points = 0;
  }
  if (!saveObj.talents.nodes) saveObj.talents.nodes = {};
  const defaults = { income: 0, treasury: 0, taxes: 0, stateDiscounts: 0, crit: 0, critChance: 0, doubleCrit: 0, masterBuilder: 0, highQualification: 0, secondTeam: 0 };
  Object.keys(defaults).forEach(k => {
    if (saveObj.talents.nodes[k] === undefined || saveObj.talents.nodes[k] === null) {
      saveObj.talents.nodes[k] = defaults[k];
    }
  });
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
const treasuryValueEl = document.getElementById('treasury-value');
const treasuryRegenEl = document.getElementById('treasury-regen');
const treasuryFillEl = document.getElementById('treasury-progress-fill');
const treasuryActionsEl = document.getElementById('treasury-actions');

const clickBtn = document.getElementById('click-btn');
const clickStatus = document.getElementById('click-status');
const clickLevelEl = document.getElementById('click-level');
const clickMaxEl = document.getElementById('click-max');
const clickIncomeEl = document.getElementById('click-income');
const clickCostEl = document.getElementById('click-cost');
const clickSegInfo = document.getElementById('click-seg-info');
const clickSegBtn = document.getElementById('click-seg-upgrade');
const clickBuyBtn = document.getElementById('click-buy');

const talentsBtn = document.getElementById('talents-btn');
const talentsModal = document.getElementById('talents-modal');
const talentsClose = document.getElementById('talents-close');
const talentTreeEl = document.getElementById('talent-tree');
const talentPointsEl = document.getElementById('talent-points');
const talentsConfirm = document.getElementById('talents-confirm');
const talentsCancel = document.getElementById('talents-cancel');
const talentsResetAll = document.getElementById('talents-reset-all');

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

const endgameBtn = document.getElementById('endgame-btn');
const uberModeBtn = document.getElementById('uber-mode-btn');

const uberCard = document.getElementById('uber-card');
const uberBuyBtn = document.getElementById('uber-buy');
const uberLevelEl = document.getElementById('uber-level');
const uberMaxEl = document.getElementById('uber-max');
const uberIncomeEl = document.getElementById('uber-income');
const uberCostEl = document.getElementById('uber-cost');

const spiderEl = document.getElementById('spider');

const logoutBtn = document.getElementById('logout-btn');
const statsBtn = document.getElementById('stats-btn');

ensureTreasury(save || {});
ensureTalents(save || {});
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
function uberIncomeAt(level) {
  const baseInc = 432109876543210.3333;
  return baseInc * Math.pow(1.22, level);
}

// ======= Achievements system =======
const ACHIEVEMENTS = [
  // Клики: 1, 46, 103, 542, 1084, 5844, 11111 (+1%)
  { id: 'clicks_1', type: 'clicks', value: 1, reward: 0.01, name: 'First Click', icon: '👆' },
  { id: 'clicks_46', type: 'clicks', value: 46, reward: 0.01, name: '46 Clicks', icon: '🖱️' },
  { id: 'clicks_103', type: 'clicks', value: 103, reward: 0.01, name: '103 Clicks', icon: '👆' },
  { id: 'clicks_542', type: 'clicks', value: 542, reward: 0.01, name: '542 Clicks', icon: '🖱️' },
  { id: 'clicks_1084', type: 'clicks', value: 1084, reward: 0.01, name: '1084 Clicks', icon: '👆' },
  { id: 'clicks_5844', type: 'clicks', value: 5844, reward: 0.01, name: '5844 Clicks', icon: '🖱️' },
  { id: 'clicks_11111', type: 'clicks', value: 11111, reward: 0.01, name: '11111 Clicks', icon: '👆' },
  // Клики: 25678, 54321, 101101, 333333 (+1%)
  { id: 'clicks_25678', type: 'clicks', value: 25678, reward: 0.01, name: '25678 Clicks', icon: '⚡' },
  { id: 'clicks_54321', type: 'clicks', value: 54321, reward: 0.01, name: '54321 Clicks', icon: '⚡' },
  { id: 'clicks_101101', type: 'clicks', value: 101101, reward: 0.01, name: '101101 Clicks', icon: '⚡' },
  { id: 'clicks_333333', type: 'clicks', value: 333333, reward: 0.01, name: '333333 Clicks', icon: '⚡' },
  // Клики: 666666, 1000011 (+1%)
  { id: 'clicks_666666', type: 'clicks', value: 666666, reward: 0.01, name: '666666 Clicks', icon: '🔥' },
  { id: 'clicks_1000011', type: 'clicks', value: 1000011, reward: 0.01, name: '1M Clicks', icon: '🔥' },
  // Клики: 5553535, 10000000 (+1%)
  { id: 'clicks_5553535', type: 'clicks', value: 5553535, reward: 0.01, name: '5.5M Clicks', icon: '💎' },
  { id: 'clicks_10000000', type: 'clicks', value: 10000000, reward: 0.01, name: '10M Clicks', icon: '💎' },
  
  // Здания: купить первое (+1%)
  { id: 'building_first', type: 'first_building', value: 1, reward: 0.01, name: 'First Building', icon: '🏠' },
  
  // Здания: прокачать до 10 уровня (1, 7, 16, 37, 50 зданий) (+1%)
  { id: 'buildings_10_1', type: 'buildings_level', level: 10, count: 1, reward: 0.01, name: '1 Building Lv10', icon: '🏘️' },
  { id: 'buildings_10_7', type: 'buildings_level', level: 10, count: 7, reward: 0.01, name: '7 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_16', type: 'buildings_level', level: 10, count: 16, reward: 0.01, name: '16 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_37', type: 'buildings_level', level: 10, count: 37, reward: 0.01, name: '37 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_50', type: 'buildings_level', level: 10, count: 50, reward: 0.01, name: '50 Buildings Lv10', icon: '🏘️' },
  
  // Здания: прокачать до 40 уровня (+1%)
  { id: 'buildings_40_1', type: 'buildings_level', level: 40, count: 1, reward: 0.01, name: '1 Building Lv40', icon: '🏛️' },
  { id: 'buildings_40_7', type: 'buildings_level', level: 40, count: 7, reward: 0.01, name: '7 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_16', type: 'buildings_level', level: 40, count: 16, reward: 0.01, name: '16 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_37', type: 'buildings_level', level: 40, count: 37, reward: 0.01, name: '37 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_50', type: 'buildings_level', level: 40, count: 50, reward: 0.01, name: '50 Buildings Lv40', icon: '🏛️' },
  
  // Здания: прокачать до 90 уровня (+1%)
  { id: 'buildings_90_1', type: 'buildings_level', level: 90, count: 1, reward: 0.01, name: '1 Building Lv90', icon: '🏰' },
  { id: 'buildings_90_7', type: 'buildings_level', level: 90, count: 7, reward: 0.01, name: '7 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_16', type: 'buildings_level', level: 90, count: 16, reward: 0.01, name: '16 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_37', type: 'buildings_level', level: 90, count: 37, reward: 0.01, name: '37 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_50', type: 'buildings_level', level: 90, count: 50, reward: 0.01, name: '50 Buildings Lv90', icon: '🏰' },
  
  // Здания: прокачать до 170 уровня (+1%)
  { id: 'buildings_170_1', type: 'buildings_level', level: 170, count: 1, reward: 0.01, name: '1 Building Lv170', icon: '🏯' },
  { id: 'buildings_170_7', type: 'buildings_level', level: 170, count: 7, reward: 0.01, name: '7 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_16', type: 'buildings_level', level: 170, count: 16, reward: 0.01, name: '16 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_37', type: 'buildings_level', level: 170, count: 37, reward: 0.01, name: '37 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_50', type: 'buildings_level', level: 170, count: 50, reward: 0.01, name: '50 Buildings Lv170', icon: '🏯' },
  
  // Здания: прокачать до 310 уровня (+1%)
  { id: 'buildings_310_1', type: 'buildings_level', level: 310, count: 1, reward: 0.01, name: '1 Building Lv310', icon: '🗼' },
  { id: 'buildings_310_7', type: 'buildings_level', level: 310, count: 7, reward: 0.01, name: '7 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_16', type: 'buildings_level', level: 310, count: 16, reward: 0.01, name: '16 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_37', type: 'buildings_level', level: 310, count: 37, reward: 0.01, name: '37 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_50', type: 'buildings_level', level: 310, count: 50, reward: 0.01, name: '50 Buildings Lv310', icon: '🗼' },
  
  // Здания: прокачать до 520 уровня (+1%)
  { id: 'buildings_520_1', type: 'buildings_level', level: 520, count: 1, reward: 0.01, name: '1 Building Lv520', icon: '🏗️' },
  { id: 'buildings_520_7', type: 'buildings_level', level: 520, count: 7, reward: 0.01, name: '7 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_16', type: 'buildings_level', level: 520, count: 16, reward: 0.01, name: '16 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_37', type: 'buildings_level', level: 520, count: 37, reward: 0.01, name: '37 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_50', type: 'buildings_level', level: 520, count: 50, reward: 0.01, name: '50 Buildings Lv520', icon: '🏗️' },
  
  // Здания: прокачать до 800 уровня (+1%)
  { id: 'buildings_800_1', type: 'buildings_level', level: 800, count: 1, reward: 0.01, name: '1 Building Lv800', icon: '🏛️' },
  { id: 'buildings_800_7', type: 'buildings_level', level: 800, count: 7, reward: 0.01, name: '7 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_16', type: 'buildings_level', level: 800, count: 16, reward: 0.01, name: '16 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_37', type: 'buildings_level', level: 800, count: 37, reward: 0.01, name: '37 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_50', type: 'buildings_level', level: 800, count: 50, reward: 0.01, name: '50 Buildings Lv800', icon: '🏛️' },
  
  // Здания: прокачать до 1000 уровня (+1%)
  { id: 'buildings_1000_1', type: 'buildings_level', level: 1000, count: 1, reward: 0.01, name: '1 Building Lv1000', icon: '👑' },
  { id: 'buildings_1000_7', type: 'buildings_level', level: 1000, count: 7, reward: 0.01, name: '7 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_16', type: 'buildings_level', level: 1000, count: 16, reward: 0.01, name: '16 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_37', type: 'buildings_level', level: 1000, count: 37, reward: 0.01, name: '37 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_50', type: 'buildings_level', level: 1000, count: 50, reward: 0.01, name: '50 Buildings Lv1000', icon: '👑' },
  
  // Uber: открыть (+1%)
  { id: 'uber_unlock', type: 'uber_unlock', value: 1, reward: 0.01, name: 'Citadel Unlocked', icon: '🏰' },
  // Uber: уровень 10 (+1%)
  { id: 'uber_level_10', type: 'uber_level', value: 10, reward: 0.01, name: 'Citadel Lv10', icon: '👑' },
  
  // Разрушения: 1, 6, 26, 44, 72, 147, 502, 1033 (+1%)
  { id: 'destructions_1', type: 'destructions', value: 1, reward: 0.01, name: '1 Destruction', icon: '💥' },
  { id: 'destructions_6', type: 'destructions', value: 6, reward: 0.01, name: '6 Destructions', icon: '💥' },
  { id: 'destructions_26', type: 'destructions', value: 26, reward: 0.01, name: '26 Destructions', icon: '💥' },
  { id: 'destructions_44', type: 'destructions', value: 44, reward: 0.01, name: '44 Destructions', icon: '💥' },
  { id: 'destructions_72', type: 'destructions', value: 72, reward: 0.01, name: '72 Destructions', icon: '💥' },
  { id: 'destructions_147', type: 'destructions', value: 147, reward: 0.01, name: '147 Destructions', icon: '💥' },
  { id: 'destructions_502', type: 'destructions', value: 502, reward: 0.01, name: '502 Destructions', icon: '💥' },
  { id: 'destructions_1033', type: 'destructions', value: 1033, reward: 0.01, name: '1033 Destructions', icon: '💥' },
  
  // Время игры: 8, 17, 39, 189, 455, 987, 1337, 2025, 5050, 9999 минут (+1%)
  { id: 'playtime_8', type: 'playtime', value: 8 * 60 * 1000, reward: 0.01, name: '8 Minutes', icon: '⏱️' },
  { id: 'playtime_17', type: 'playtime', value: 17 * 60 * 1000, reward: 0.01, name: '17 Minutes', icon: '⏱️' },
  { id: 'playtime_39', type: 'playtime', value: 39 * 60 * 1000, reward: 0.01, name: '39 Minutes', icon: '⏱️' },
  { id: 'playtime_189', type: 'playtime', value: 189 * 60 * 1000, reward: 0.01, name: '189 Minutes', icon: '⏱️' },
  { id: 'playtime_455', type: 'playtime', value: 455 * 60 * 1000, reward: 0.01, name: '455 Minutes', icon: '⏱️' },
  { id: 'playtime_987', type: 'playtime', value: 987 * 60 * 1000, reward: 0.01, name: '987 Minutes', icon: '⏱️' },
  { id: 'playtime_1337', type: 'playtime', value: 1337 * 60 * 1000, reward: 0.01, name: '1337 Minutes', icon: '⏱️' },
  { id: 'playtime_2025', type: 'playtime', value: 2025 * 60 * 1000, reward: 0.01, name: '2025 Minutes', icon: '⏱️' },
  { id: 'playtime_5050', type: 'playtime', value: 5050 * 60 * 1000, reward: 0.01, name: '5050 Minutes', icon: '⏱️' },
  { id: 'playtime_9999', type: 'playtime', value: 9999 * 60 * 1000, reward: 0.01, name: '9999 Minutes', icon: '⏱️' },
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
  
  switch(ach.type) {
    case 'clicks':
      return save.achievements.stats.totalClicks >= ach.value;
    case 'first_building':
      return save.achievements.stats.firstBuildingBought;
    case 'buildings_level':
      const count = save.buildings.filter(b => b.level >= ach.level).length;
      return count >= ach.count;
    case 'uber_unlock':
      return save.uber.unlocked;
    case 'uber_level':
      return save.uber.level >= ach.value;
    case 'destructions':
      return save.achievements.stats.totalDestructions >= ach.value;
    case 'playtime':
      return save.achievements.stats.totalPlayTime >= ach.value;
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
// ======= Talents =======
const TALENT_DEFS = {
  income: {
    id: 'income',
    name: 'Income',
    max: 3,
    levels: ['+1% to all income', '+2% to all income', '+3% to all income'],
    requires: []
  },
  treasury: {
    id: 'treasury',
    name: 'Treasury',
    max: 5,
    requires: [{ id: 'income', level: 3 }],
    bonuses: [0, 100, 200, 300, 400, 500] // +100 per level to max treasury
  },
  taxes: {
    id: 'taxes',
    name: 'Taxes',
    max: 3,
    requires: [{ id: 'treasury', level: 5 }],
    bonuses: [0, 1, 2, 3] // +1 per level to treasury regen per second
  },
  stateDiscounts: {
    id: 'stateDiscounts',
    name: 'State Discounts',
    max: 3,
    requires: [{ id: 'taxes', level: 3 }],
    bonuses: [0, 0.005, 0.01, 0.015] // +0.5% per level chance to buy ability for 75% cost
  },
  crit: {
    id: 'crit',
    name: 'Critical Strike',
    max: 5,
    requires: [{ id: 'income', level: 3 }],
    multipliers: [0, 1.5, 1.7, 1.9, 2.1, 2.3]
  },
  critChance: {
    id: 'critChance',
    name: 'Critical Chance',
    max: 3,
    requires: [{ id: 'crit', level: 5 }],
    bonuses: [0, 0.01, 0.02, 0.03] // +to base 3%
  },
  doubleCrit: {
    id: 'doubleCrit',
    name: 'Double Critical',
    max: 3,
    requires: [{ id: 'crit', level: 5 }],
    chances: [0, 0.03, 0.05, 0.07]
  },
  masterBuilder: {
    id: 'masterBuilder',
    name: 'Master Builder',
    max: 5,
    requires: [{ id: 'income', level: 3 }],
    chances: [0, 0.011, 0.012, 0.013, 0.014, 0.015] // chance to get +1 extra level per level bought
  },
  highQualification: {
    id: 'highQualification',
    name: 'High Qualification',
    max: 4,
    requires: [{ id: 'masterBuilder', level: 5 }],
    bonuses: [0, 0.05, 0.10, 0.15, 0.20] // reduce break chance by X% of current chance
  },
  secondTeam: {
    id: 'secondTeam',
    name: 'Second Team',
    max: 5,
    requires: [{ id: 'masterBuilder', level: 5 }],
    bonuses: [0, 3000, 6000, 9000, 12000, 15000] // reduce repair time by X milliseconds
  }
};

let _pendingTalents = null; // session-local pending upgrades
let _talentZoom = 1.0;
let _talentPanX = 0;
let _talentPanY = 0;

function talentLevel(id) {
  return save?.talents?.nodes?.[id] || 0;
}

function talentPoints() {
  return save?.talents?.points || 0;
}

function _talentPendingNodes() {
  return _pendingTalents?.nodes || null;
}

function talentLevelUI(id) {
  const nodes = _talentPendingNodes() || (save?.talents?.nodes || {});
  return nodes[id] || 0;
}

function talentEarnedPoints() {
  // 1 очко за каждую 1000 уровней всех зданий
  const earned = Math.floor(totalOpenedBuildingLevels() / 1000);
  return Math.max(0, earned);
}

function talentSpent(nodes) {
  if (!nodes) return 0;
  return Object.values(nodes).reduce((a,b)=>a+(b||0),0);
}

function talentAvailablePoints() {
  const nodes = _talentPendingNodes() || (save?.talents?.nodes || {});
  const earned = talentEarnedPoints();
  const spent = talentSpent(nodes);
  const available = earned - spent;
  return Math.max(0, available);
}

function talentRequirementMet(node) {
  if (!node.requires || node.requires.length === 0) return true;
  const nodes = _talentPendingNodes() || (save?.talents?.nodes || {});
  return node.requires.every(req => (nodes[req.id] || 0) >= req.level);
}

function talentGlobalIncomeMult() {
  const lvl = talentLevelUI('income');
  const table = [0, 0.01, 0.03, 0.06];
  return 1 + (table[lvl] || 0);
}

function talentTreasuryMaxBonus() {
  const lvl = talentLevelUI('treasury');
  return TALENT_DEFS.treasury.bonuses[lvl] || 0;
}

function talentTreasuryRegenBonus() {
  const lvl = talentLevelUI('taxes');
  return TALENT_DEFS.taxes.bonuses[lvl] || 0;
}

function talentStateDiscountChance() {
  const lvl = talentLevelUI('stateDiscounts');
  return TALENT_DEFS.stateDiscounts.bonuses[lvl] || 0;
}

function talentCritData() {
  const critLvl = talentLevelUI('crit');
  if (critLvl <= 0) return { chance: 0, multiplier: 1, doubleChance: 0 };
  const baseChance = 0.03;
  const extraChance = (TALENT_DEFS.critChance.bonuses[talentLevelUI('critChance')] || 0);
  const chance = baseChance + extraChance;
  const multiplier = TALENT_DEFS.crit.multipliers[critLvl] || 1;
  const doubleChance = TALENT_DEFS.doubleCrit.chances[talentLevelUI('doubleCrit')] || 0;
  return { chance, multiplier, doubleChance };
}

function talentExpectedClickCritMultiplier() {
  const { chance, multiplier, doubleChance } = talentCritData();
  if (chance <= 0) return 1;
  return 1 + chance * (multiplier - 1) + (chance * doubleChance) * (multiplier - 1);
}

function rollTalentCrit() {
  const data = talentCritData();
  if (data.chance <= 0) return { rolled: false, multiplier: 1 };
  if (randChance(data.chance)) {
    let mult = data.multiplier;
    if (data.doubleChance > 0 && randChance(data.doubleChance)) {
      mult *= data.multiplier;
    }
    return { rolled: true, multiplier: mult };
  }
  return { rolled: false, multiplier: 1 };
}

function totalPPC() {
  let ppc = clickIncomeAt(save.click.level, save.click.upgradeBonus);
  // Madness modifier
  if (save.treasury?.actions?.clickMadnessUntil > now()) {
    ppc *= 1001;
  }
  // Golden modifier
  const goldenActive = save.click.goldenUntil > now();
  const goldenMult = goldenActive ? save.click.goldenMult : 1.0;
  // Spider modifier
  const spiderMult = save.modifiers.spiderUntil > now() ? save.modifiers.spiderMult : 1.0;
  // Achievement bonus
  const achievementMult = getAchievementBonus();
  // Streak multiplier
  const streakMult = save.streak ? save.streak.multiplier : 1.0;
  const talentMult = talentGlobalIncomeMult();
  return ppc * goldenMult * spiderMult * achievementMult * streakMult * talentMult;
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
    pps += uberIncomeAt(save.uber.level);
  }
  // Spider modifier
  const spiderMult = save.modifiers.spiderUntil > now() ? save.modifiers.spiderMult : 1.0;
  // Achievement bonus
  const achievementMult = getAchievementBonus();
  const taxMult = save.treasury?.actions?.profitWithoutTaxUntil > now() ? 101 : 1.0; // x101
  const talentMult = talentGlobalIncomeMult();
  return pps * spiderMult * achievementMult * taxMult * talentMult;
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

function totalOpenedBuildingLevels() {
  if (!save || !save.buildings) return 0;
  return save.buildings.reduce((acc,b)=> acc + (b.level > 0 ? b.level : 0), 0);
}

// Учёт очков талантов при изменении зданий
function _recalcTalentPointsCap() {
  if (!save || !save.talents) return;
  const earned = talentEarnedPoints();
  const spent = talentSpent(save.talents.nodes);
  const available = Math.max(0, earned - spent);
  save.talents.points = available;
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
  // Apply State Discounts talent
  const discountChance = talentStateDiscountChance();
  let finalAmount = amount;
  if (discountChance > 0 && randChance(discountChance)) {
    finalAmount = amount * 0.75; // 75% cost
  }
  if (save.treasury.value < finalAmount) return false;
  save.treasury.value -= finalAmount;
  return true;
}

function gainTreasury(delta) {
  if (!save.treasury) return;
  const baseMax = save.treasury.max || 1000;
  const talentMaxBonus = talentTreasuryMaxBonus();
  const actualMax = baseMax + talentMaxBonus;
  save.treasury.value = clamp(save.treasury.value + delta, 0, actualMax);
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
function renderTopStats() {
  if (!save) return;
  if (pointsEl) pointsEl.textContent = fmt(save.points);
  if (ppsEl) ppsEl.textContent = fmt(totalPPS());
  if (ppcEl) {
    const displayPpc = totalPPC() * talentExpectedClickCritMultiplier();
    ppcEl.textContent = fmt(displayPpc);
  }

  // Treasury UI
  if (save.treasury && treasuryValueEl && treasuryFillEl && treasuryRegenEl) {
    const { value } = save.treasury;
    const baseMax = save.treasury.max || 1000;
    const talentMaxBonus = talentTreasuryMaxBonus();
    const actualMax = baseMax + talentMaxBonus;
    const baseRegen = save.treasury.regenPerSec || 1;
    const talentRegenBonus = talentTreasuryRegenBonus();
    const actualRegen = baseRegen + talentRegenBonus;
    treasuryValueEl.textContent = `${fmt(value)} / ${fmt(actualMax)}`;
    treasuryRegenEl.textContent = `+${actualRegen.toFixed(0)} /s`;
    const pct = Math.max(0, Math.min(100, (value / actualMax) * 100));
    treasuryFillEl.style.width = `${pct}%`;
  }
}

function createTalentNode(def, x, y) {
  const node = document.createElement('div');
  node.className = 'talent-node';
  node.dataset.talentId = def.id;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  
  const lvl = talentLevelUI(def.id);
  const maxed = lvl >= def.max;
  const prereqMet = talentRequirementMet(def);
  const canUpgrade = !maxed && prereqMet && talentAvailablePoints() > 0;
  
  // Color coding
  if (def.id === 'income' || def.id === 'treasury' || def.id === 'taxes' || def.id === 'stateDiscounts') {
    node.classList.add('talent-gold');
  } else if (def.id === 'crit' || def.id === 'critChance' || def.id === 'doubleCrit') {
    node.classList.add('talent-green');
  } else if (def.id === 'masterBuilder' || def.id === 'highQualification' || def.id === 'secondTeam') {
    node.classList.add('talent-red');
  }
  
  // State classes
  if (lvl > 0) node.classList.add('talent-active');
  if (maxed) node.classList.add('talent-maxed');
  if (!prereqMet) node.classList.add('talent-locked');
  if (!canUpgrade && !maxed) node.classList.add('talent-disabled');
  
  // Level indicator
  if (lvl > 0) {
    const levelBadge = document.createElement('div');
    levelBadge.className = 'talent-level-badge';
    levelBadge.textContent = lvl;
    node.appendChild(levelBadge);
  }
  
  // Click handler
  if (canUpgrade) {
    node.style.cursor = 'pointer';
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      upgradeTalent(def.id);
    });
  }
  
  // Tooltip handlers
  node.addEventListener('mouseenter', (e) => {
    e.stopPropagation();
    showTalentTooltip(e, def, lvl);
  });
  node.addEventListener('mousemove', (e) => {
    e.stopPropagation();
    moveTalentTooltip(e);
  });
  node.addEventListener('mouseleave', (e) => {
    e.stopPropagation();
    hideTalentTooltip();
  });
  
  return node;
}

function renderTalents() {
  if (!talentTreeEl || !save) return;
  if (talentPointsEl) talentPointsEl.textContent = talentAvailablePoints();
  talentTreeEl.innerHTML = '';
  if (talentsConfirm) {
    const changed = _pendingTalents && JSON.stringify(_pendingTalents.nodes) !== JSON.stringify(save.talents.nodes);
    talentsConfirm.disabled = !changed;
  }

  // Create container for zoom/pan
  const container = document.createElement('div');
  container.className = 'talent-tree-container';
  container.style.transform = `translate(${_talentPanX}px, ${_talentPanY}px) scale(${_talentZoom})`;
  container.style.transformOrigin = 'center center';
  container.style.position = 'absolute';
  container.style.width = '100%';
  container.style.height = '100%';
  talentTreeEl.appendChild(container);

  // Create SVG for lines
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.className = 'talent-lines';
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '1';
  container.appendChild(svg);

  // Node positions (centered layout, larger canvas)
  const centerX = 600;
  const centerY = 400;
  const nodeRadius = 22.5; // Half of 45px
  const spacing = 180;
  
  // Income (bottom center)
  const incomeX = centerX;
  const incomeY = centerY + spacing;
  
  // Treasury (right of Income)
  const treasuryX = centerX + spacing;
  const treasuryY = centerY + spacing;
  
  // Taxes (right of Treasury)
  const taxesX = centerX + spacing * 2;
  const taxesY = centerY + spacing;
  
  // State Discounts (right of Taxes)
  const stateDiscountsX = centerX + spacing * 3;
  const stateDiscountsY = centerY + spacing;
  
  // Master Builder (down from Income - MIRRORED from Crit position)
  const masterBuilderX = centerX;
  const masterBuilderY = centerY + spacing * 2;
  
  // High Qualification (down left from Master Builder - MIRRORED from Crit Chance)
  const highQualificationX = centerX - spacing;
  const highQualificationY = centerY + spacing * 3;
  
  // Second Team (down right from Master Builder - MIRRORED from Double Crit)
  const secondTeamX = centerX + spacing;
  const secondTeamY = centerY + spacing * 3;
  
  // Crit (middle center)
  const critX = centerX;
  const critY = centerY;
  
  // Crit Chance (top left)
  const critChanceX = centerX - spacing;
  const critChanceY = centerY - spacing;
  
  // Double Crit (top right)
  const doubleCritX = centerX + spacing;
  const doubleCritY = centerY - spacing;
  
  // Draw lines
  const lineStyle = 'stroke:#888888;stroke-width:2;fill:none';
  const activeLineStyle = 'stroke:#d4b24a;stroke-width:3;fill:none';
  
  // Income to Master Builder - EXACTLY MIRRORED from Income to Crit (vertical down)
  const incomeLvlForBuilder = talentLevelUI('income');
  const lineMasterBuilder = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineMasterBuilder.setAttribute('x1', incomeX);
  lineMasterBuilder.setAttribute('y1', incomeY + nodeRadius);
  lineMasterBuilder.setAttribute('x2', masterBuilderX);
  lineMasterBuilder.setAttribute('y2', masterBuilderY - nodeRadius);
  lineMasterBuilder.setAttribute('style', incomeLvlForBuilder >= 3 ? activeLineStyle : lineStyle);
  svg.appendChild(lineMasterBuilder);
  
  // Master Builder to High Qualification - EXACTLY like Crit to Crit Chance, but mirrored down
  const masterBuilderLvl = talentLevelUI('masterBuilder');
  const line4 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line4.setAttribute('x1', masterBuilderX - nodeRadius);
  line4.setAttribute('y1', masterBuilderY - nodeRadius);
  line4.setAttribute('x2', highQualificationX + nodeRadius);
  line4.setAttribute('y2', highQualificationY + nodeRadius);
  line4.setAttribute('style', masterBuilderLvl >= 5 ? activeLineStyle : lineStyle);
  svg.appendChild(line4);
  
  // Master Builder to Second Team - EXACTLY like Crit to Double Crit, but mirrored down
  const line5 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line5.setAttribute('x1', masterBuilderX + nodeRadius);
  line5.setAttribute('y1', masterBuilderY - nodeRadius);
  line5.setAttribute('x2', secondTeamX - nodeRadius);
  line5.setAttribute('y2', secondTeamY + nodeRadius);
  line5.setAttribute('style', masterBuilderLvl >= 5 ? activeLineStyle : lineStyle);
  svg.appendChild(line5);
  
  // Income to Crit
  const incomeLvl = talentLevelUI('income');
  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', incomeX);
  line1.setAttribute('y1', incomeY - nodeRadius);
  line1.setAttribute('x2', critX);
  line1.setAttribute('y2', critY + nodeRadius);
  line1.setAttribute('style', incomeLvl >= 3 ? activeLineStyle : lineStyle);
  svg.appendChild(line1);
  
  // Income to Treasury
  const lineTreasury = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineTreasury.setAttribute('x1', incomeX + nodeRadius);
  lineTreasury.setAttribute('y1', incomeY);
  lineTreasury.setAttribute('x2', treasuryX - nodeRadius);
  lineTreasury.setAttribute('y2', treasuryY);
  lineTreasury.setAttribute('style', incomeLvl >= 3 ? activeLineStyle : lineStyle);
  svg.appendChild(lineTreasury);
  
  // Treasury to Taxes
  const treasuryLvl = talentLevelUI('treasury');
  const lineTaxes = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineTaxes.setAttribute('x1', treasuryX + nodeRadius);
  lineTaxes.setAttribute('y1', treasuryY);
  lineTaxes.setAttribute('x2', taxesX - nodeRadius);
  lineTaxes.setAttribute('y2', taxesY);
  lineTaxes.setAttribute('style', treasuryLvl >= 5 ? activeLineStyle : lineStyle);
  svg.appendChild(lineTaxes);
  
  // Taxes to State Discounts
  const taxesLvl = talentLevelUI('taxes');
  const lineDiscounts = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineDiscounts.setAttribute('x1', taxesX + nodeRadius);
  lineDiscounts.setAttribute('y1', taxesY);
  lineDiscounts.setAttribute('x2', stateDiscountsX - nodeRadius);
  lineDiscounts.setAttribute('y2', stateDiscountsY);
  lineDiscounts.setAttribute('style', taxesLvl >= 3 ? activeLineStyle : lineStyle);
  svg.appendChild(lineDiscounts);
  
  // Crit to Crit Chance
  const critLvl = talentLevelUI('crit');
  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', critX - nodeRadius);
  line2.setAttribute('y1', critY - nodeRadius);
  line2.setAttribute('x2', critChanceX + nodeRadius);
  line2.setAttribute('y2', critChanceY + nodeRadius);
  line2.setAttribute('style', critLvl >= 5 ? activeLineStyle : lineStyle);
  svg.appendChild(line2);
  
  // Crit to Double Crit
  const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line3.setAttribute('x1', critX + nodeRadius);
  line3.setAttribute('y1', critY - nodeRadius);
  line3.setAttribute('x2', doubleCritX - nodeRadius);
  line3.setAttribute('y2', doubleCritY + nodeRadius);
  line3.setAttribute('style', critLvl >= 5 ? activeLineStyle : lineStyle);
  svg.appendChild(line3);
  
  // Create nodes
  const incomeNode = createTalentNode(TALENT_DEFS.income, incomeX - nodeRadius, incomeY - nodeRadius);
  const masterBuilderNode = createTalentNode(TALENT_DEFS.masterBuilder, masterBuilderX - nodeRadius, masterBuilderY - nodeRadius);
  const highQualificationNode = createTalentNode(TALENT_DEFS.highQualification, highQualificationX - nodeRadius, highQualificationY - nodeRadius);
  const secondTeamNode = createTalentNode(TALENT_DEFS.secondTeam, secondTeamX - nodeRadius, secondTeamY - nodeRadius);
  const treasuryNode = createTalentNode(TALENT_DEFS.treasury, treasuryX - nodeRadius, treasuryY - nodeRadius);
  const taxesNode = createTalentNode(TALENT_DEFS.taxes, taxesX - nodeRadius, taxesY - nodeRadius);
  const stateDiscountsNode = createTalentNode(TALENT_DEFS.stateDiscounts, stateDiscountsX - nodeRadius, stateDiscountsY - nodeRadius);
  const critNode = createTalentNode(TALENT_DEFS.crit, critX - nodeRadius, critY - nodeRadius);
  const critChanceNode = createTalentNode(TALENT_DEFS.critChance, critChanceX - nodeRadius, critChanceY - nodeRadius);
  const doubleCritNode = createTalentNode(TALENT_DEFS.doubleCrit, doubleCritX - nodeRadius, doubleCritY - nodeRadius);
  
  container.appendChild(incomeNode);
  container.appendChild(masterBuilderNode);
  container.appendChild(highQualificationNode);
  container.appendChild(secondTeamNode);
  container.appendChild(treasuryNode);
  container.appendChild(taxesNode);
  container.appendChild(stateDiscountsNode);
  container.appendChild(critNode);
  container.appendChild(critChanceNode);
  container.appendChild(doubleCritNode);
}

function openTalents() {
  if (!talentsModal) return;
  _pendingTalents = { nodes: { ...save.talents.nodes } };
  _talentZoom = 1.0;
  _talentPanX = 0;
  _talentPanY = 0;
  talentsModal.setAttribute('aria-hidden', 'false');
  renderTalents();
  
  // Setup zoom on wheel
  const treeEl = document.getElementById('talent-tree');
  if (treeEl) {
    const wheelHandler = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      _talentZoom = Math.max(0.5, Math.min(2.0, _talentZoom * delta));
      renderTalents();
    };
    
    // Remove old handler if exists
    treeEl.removeEventListener('wheel', treeEl._wheelHandler);
    treeEl._wheelHandler = wheelHandler;
    treeEl.addEventListener('wheel', wheelHandler, { passive: false });
    
    // Pan on drag
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    const mouseDownHandler = (e) => {
      if (e.button === 0 && !e.target.closest('.talent-node')) {
        isDragging = true;
        startX = e.clientX - _talentPanX;
        startY = e.clientY - _talentPanY;
        treeEl.style.cursor = 'grabbing';
      }
    };
    
    const mouseMoveHandler = (e) => {
      if (isDragging) {
        _talentPanX = e.clientX - startX;
        _talentPanY = e.clientY - startY;
        renderTalents();
      }
    };
    
    const mouseUpHandler = () => {
      isDragging = false;
      treeEl.style.cursor = '';
    };
    
    treeEl.removeEventListener('mousedown', treeEl._mouseDownHandler);
    treeEl.removeEventListener('mousemove', treeEl._mouseMoveHandler);
    treeEl.removeEventListener('mouseup', treeEl._mouseUpHandler);
    treeEl.removeEventListener('mouseleave', treeEl._mouseUpHandler);
    
    treeEl._mouseDownHandler = mouseDownHandler;
    treeEl._mouseMoveHandler = mouseMoveHandler;
    treeEl._mouseUpHandler = mouseUpHandler;
    
    treeEl.addEventListener('mousedown', mouseDownHandler);
    treeEl.addEventListener('mousemove', mouseMoveHandler);
    treeEl.addEventListener('mouseup', mouseUpHandler);
    treeEl.addEventListener('mouseleave', mouseUpHandler);
  }
}

function closeTalents() {
  if (!talentsModal) return;
  talentsModal.setAttribute('aria-hidden', 'true');
  _pendingTalents = null;
}

function upgradeTalent(id) {
  if (!save) return;
  const def = TALENT_DEFS[id];
  if (!def) return;
  if (!_pendingTalents) _pendingTalents = { nodes: { ...save.talents.nodes } };
  const nodes = _pendingTalents.nodes;
  const lvl = nodes[id] || 0;
  if (lvl >= def.max) { toast('Talent is already at maximum level.', 'warn'); return; }
  if (!talentRequirementMet(def)) { toast('Requires previous talent to be fully upgraded.', 'warn'); return; }
  if (talentAvailablePoints() <= 0) { toast('Not enough talent points.', 'warn'); return; }
  nodes[id] = lvl + 1;
  renderTalents();
  if (talentsConfirm) talentsConfirm.disabled = false;
}

function confirmTalents() {
  if (!_pendingTalents) { closeTalents(); return; }
  save.talents.nodes = { ..._pendingTalents.nodes };
  _recalcTalentPointsCap();
  _pendingTalents = null;
  renderTalents();
  renderTopStats();
  renderClick();
  toast('Talents applied.', 'good');
  closeTalents();
}

function resetTalents() {
  if (!_pendingTalents) return;
  _pendingTalents.nodes = { ...save.talents.nodes };
  renderTalents();
  toast('Talent selections reset.', 'info');
}

function resetAllTalents() {
  if (!save || !save.talents) return;
  if (!confirm('Are you sure you want to reset ALL talents? This cannot be undone.')) return;
  
  // Reset all talent nodes to 0
  const defaults = { income: 0, treasury: 0, taxes: 0, stateDiscounts: 0, crit: 0, critChance: 0, doubleCrit: 0, masterBuilder: 0, highQualification: 0, secondTeam: 0 };
  save.talents.nodes = { ...defaults };
  
  // Reset pending talents
  if (_pendingTalents) {
    _pendingTalents.nodes = { ...defaults };
  }
  
  // Recalculate talent points
  _recalcTalentPointsCap();
  
  renderTalents();
  renderTopStats();
  renderClick();
  toast('All talents have been reset.', 'good');
}

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
  renderBuildings();
  // Немедленно обновляем таймеры
  _updateBuildingCountdowns();
}

function breakRandomBuildings(count, durationMs) {
  const opened = save.buildings.map((b, i) => ({b,i})).filter(x => x.b.level > 0);
  if (opened.length === 0) return;
  for (let k=0;k<count;k++){
    const pickIdx = Math.floor(Math.random()*opened.length);
    const {b} = opened[pickIdx];
    b.blockedUntil = Math.max(b.blockedUntil || 0, now() + durationMs * (save.modifiers.repairTimeMult || 1));
  }
}

function startLazyClick(level = 1) {
  if (save.modifiers.lazyClickUntil > now()) {
    toast('Lazy click already active.', 'warn');
    return;
  }
  
  const lazyClickLevels = [
    { lvl: 1, clicks: 1000, durationMs: 20000, multiplier: 1.5, cost: 300, clickReq: 589, breakDuration: 0 },
    { lvl: 2, clicks: 2000, durationMs: 25000, multiplier: 2.0, cost: 0, clickReq: 1488, breakDuration: 164000 },
    { lvl: 3, clicks: 5000, durationMs: 30000, multiplier: 5.0, cost: 0, clickReq: 3564, breakDuration: 389000 },
    { lvl: 4, clicks: 10000, durationMs: 50000, multiplier: 10.0, cost: 0, clickReq: 9999, breakDuration: 606000 }
  ];
  
  const levelData = lazyClickLevels.find(l => l.lvl === level) || lazyClickLevels[0];
  const durationMs = levelData.durationMs;
  const totalClicks = levelData.clicks;
  const multiplier = levelData.multiplier;
  const intervalMs = durationMs / totalClicks;
  let done = 0;
  save.modifiers.lazyClickUntil = now() + durationMs;
  save.modifiers.lazyClickCount = 0;
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
}

function applyProfitWithoutTax(durationMs) {
  save.treasury.actions.profitWithoutTaxUntil = now() + durationMs;
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
      toast(`Repair Level ${nextRepairLevelToUpgrade - 1} applied!`, 'good');
      renderTreasuryActions();
    }, cdUntil, true, 0, repairUpgradeOnClick);
  } else if (currentRepairLevel > 0) {
    const r = repairLevels[currentRepairLevel - 1];
    const cdUntil = act.repairCd || 0;
    const ready = nowTs >= cdUntil;
    const canUse = ready && save.treasury.value >= r.cost;
    const desc = {
      header: `REPAIR LEVEL ${currentRepairLevel}`,
      effect: `Accelerate all building repairs by ${Math.round(r.percent*100)}% of original time.`,
      details: `This is your current repair level. Use it to speed up building repairs.`,
      cost: r.cost,
      cooldown: r.cdSec
    };
    mkBtn('repair', 'Repair', desc, canUse, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(r.cost)) { toast('Not enough treasury.', 'warn'); return; }
      reduceAllRepairs(r.percent);
      act.repairCd = now() + r.cdSec*1000;
      toast(`Repair Level ${currentRepairLevel} applied!`, 'good');
      renderTreasuryActions();
    }, cdUntil);
  }

  // Lazy click - одна кнопка с 4 уровнями апгрейда
  const lazyClickLevels = [
    { lvl: 1, clicks: 10000, durationMs: 20000, multiplier: 1.5, cost: 300, clickReq: 589, breakDuration: 0 },
    { lvl: 2, clicks: 20000, durationMs: 25000, multiplier: 2.0, cost: 0, clickReq: 1488, breakDuration: 164000 },
    { lvl: 3, clicks: 50000, durationMs: 30000, multiplier: 5.0, cost: 0, clickReq: 3564, breakDuration: 389000 },
    { lvl: 4, clicks: 100000, durationMs: 50000, multiplier: 10.0, cost: 0, clickReq: 9999, breakDuration: 606000 }
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
      const desc = {
        header: `LAZY CLICK LEVEL ${currentLazyClickLevel}`,
        effect: `Performs ${currentLevelData.clicks} passive clicks with x${currentLevelData.multiplier} multiplier over ${currentLevelData.durationMs/1000} seconds.`,
        details: `This is your current lazy click level.`,
        cost: currentLevelData.cost,
        cooldown: 54,
        upgradeCost: nextLevelData.breakDuration
      };
      lazyClickUpgradeOnClick = () => {
        if (totalClicks < nextLevelData.clickReq) {
          toast(`Need ${nextLevelData.clickReq} total clicks to unlock.`, 'warn');
          return;
        }
        // Ломаем кнопку клика
        save.click.brokenUntil = now() + nextLevelData.breakDuration;
        act.lazyClickLevel = nextLazyClickLevelToUpgrade;
        toast(`Lazy Click upgraded to Level ${nextLazyClickLevelToUpgrade}! Click button broken for ${nextLevelData.breakDuration/1000}s.`, 'good');
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
    const desc = {
      header: `LAZY CLICK LEVEL ${currentLazyClickLevel}`,
      effect: `Performs ${l.clicks} passive clicks with x${l.multiplier} multiplier over ${l.durationMs/1000} seconds.`,
      note: 'These clicks do not count towards your total clicks.',
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
      effect: 'All building income x101 for 32 seconds.',
      warning: 'Five random buildings break for 936 seconds.',
      cost: 200,
      cooldown: 32,
      duration: 32
    };
    mkBtn('taxfree','Profit without taxes', desc, ready && save.treasury.value >= 200, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(200)) { toast('Not enough treasury.', 'warn'); return; }
      applyProfitWithoutTax(32000);
      breakRandomBuildings(5, 936000);
      act.taxFreeCd = now() + 32000;
      act.profitWithoutTaxUntil = now() + 32000;
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
      warning: 'Repair time increases x2.',
      cost: 1000,
      duration: 21666
    };
    mkBtn('engineer','Chief Engineer', desc, ready && save.treasury.value >= 1000, () => {
      if (!ready) { toast('On cooldown.', 'warn'); return; }
      if (!spendTreasury(1000)) { toast('Not enough treasury.', 'warn'); return; }
      applyEngineer(21666*1000);
      act.engineerCd = now() + 21666*1000;
      act.engineerUntil = now() + 21666*1000;
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
      effect: 'Click income x1001.',
      warning: 'There is a chance to lose 3 Click levels per click.',
      note: 'Click button cannot become golden or broken during effect.',
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
      toast('Click Madness activated!', 'good');
      renderTreasuryActions();
    }, cdUntil, false, clickMadnessUntil);
  }

  // Иконки для кнопок
  const icons = {
    'repair': '🔧',
    'lazyClick': '😴',
    'taxfree': '💰',
    'engineer': '👷',
    'clickMadness': '💥',
    'casino': '🎲'
  };

  // Удаляем старые tooltip перед созданием новых
  hideTreasuryTooltip();
  
  treasuryActionsEl.innerHTML = '';
  // Кнопки уже в правильном порядке (казино первая, так как создается первой)
  buttons.forEach(btn => {
    const el = document.createElement('button');
    el.className = 'btn treasury-action-btn';
    const icon = icons[btn.id] || '?';
    el.setAttribute('data-icon', icon);
    el.disabled = !btn.enabled;
    
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
      
      if (btn.desc.warning) {
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
        
        upgradeLine.innerHTML = `<div style="color:#d4b24a;font-weight:bold;margin-bottom:4px;">Upgrade to Level ${nextLevelNum}</div>`;
        upgradeBody.appendChild(upgradeLine);
        
        // Для Lazy Click upgradeCost - это breakDuration в миллисекундах
        const isLazyClick = btn.desc.header && btn.desc.header.includes('LAZY CLICK');
        if (isLazyClick) {
          const breakSec = btn.desc.upgradeCost / 1000;
          const costLine = document.createElement('div');
          costLine.className = 'tooltip-stat';
          costLine.innerHTML = `<span class="tooltip-stat-label">Upgrade Cost:</span> <span class="tooltip-stat-value">Break Click button for ${breakSec}s</span>`;
          upgradeBody.appendChild(costLine);
        } else {
          const costLine = document.createElement('div');
          costLine.className = 'tooltip-stat';
          costLine.innerHTML = `<span class="tooltip-stat-label">Upgrade Cost:</span> <span class="tooltip-stat-value">${fmt(btn.desc.upgradeCost)} Points</span>`;
          upgradeBody.appendChild(costLine);
        }
        
        // Показываем что даст прокачка - берем эффект следующего уровня
        const currentLevelNum = levelTextFromHeader ? parseInt(levelTextFromHeader) : 0;
        const targetLevelNum = currentLevelNum + 1;
        
        if (isLazyClick) {
          // Данные для Lazy Click
          const lazyClickLevelsData = [
            { lvl: 1, clicks: 1000, durationMs: 20000, multiplier: 1.5, cost: 300, clickReq: 589, breakDuration: 0 },
            { lvl: 2, clicks: 2000, durationMs: 25000, multiplier: 2.0, cost: 0, clickReq: 1488, breakDuration: 164000 },
            { lvl: 3, clicks: 5000, durationMs: 30000, multiplier: 5.0, cost: 0, clickReq: 3564, breakDuration: 389000 },
            { lvl: 4, clicks: 10000, durationMs: 50000, multiplier: 10.0, cost: 0, clickReq: 9999, breakDuration: 606000 }
          ];
          
          const nextLevelData = lazyClickLevelsData.find(l => l.lvl === targetLevelNum);
          if (nextLevelData) {
            const effectLine = document.createElement('div');
            effectLine.className = 'tooltip-stat';
            effectLine.style.marginTop = '8px';
            effectLine.innerHTML = `<span class="tooltip-stat-label">Effect after upgrade:</span> <span class="tooltip-stat-value">Performs ${nextLevelData.clicks} passive clicks with x${nextLevelData.multiplier} multiplier over ${nextLevelData.durationMs/1000} seconds.</span>`;
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
            effectLine.innerHTML = `<span class="tooltip-stat-label">Effect after upgrade:</span> <span class="tooltip-stat-value">Accelerate all building repairs by ${Math.round(nextLevelData.percent*100)}% of original time.</span>`;
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
  
}

function renderClick() {
  if (!save || !clickBtn) return;
  
  const brokenActive = save.click.brokenUntil > now();
  const goldenActive = save.click.goldenUntil > now();

  // Явно удаляем и добавляем классы для гарантированного обновления
  if (brokenActive) {
    clickBtn.classList.add('broken');
  } else {
    clickBtn.classList.remove('broken');
  }
  
  if (goldenActive) {
    clickBtn.classList.add('golden');
  } else {
    clickBtn.classList.remove('golden');
  }
  
  clickStatus.textContent = brokenActive ? 'Broken' : (goldenActive ? 'Golden' : 'Ready');
  
  // Обратный таймер внизу кнопки
  let timerEl = clickBtn.querySelector('.click-timer');
  if (!timerEl) {
    timerEl = document.createElement('div');
    timerEl.className = 'click-timer';
    clickBtn.appendChild(timerEl);
  }
  
  if (brokenActive) {
    const remaining = Math.ceil((save.click.brokenUntil - now()) / 1000);
    timerEl.textContent = `${remaining}s`;
    timerEl.style.display = 'block';
  } else if (goldenActive) {
    const remaining = Math.ceil((save.click.goldenUntil - now()) / 1000);
    timerEl.textContent = `${remaining}s`;
    timerEl.style.display = 'block';
  } else {
    timerEl.style.display = 'none';
  }

  clickLevelEl.textContent = save.click.level;
  clickMaxEl.textContent = save.click.max;
  clickIncomeEl.textContent = fmt(clickIncomeAt(save.click.level, save.click.upgradeBonus));
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
    clickSegInfo.textContent = 'Reach Uber Mode to continue';
  } else {
    // Segment upgrade visibility for Click
    const seg = segmentIndex(save.click.level);
    const within = withinSegment(save.click.level);
    const prevSegBought = seg === 0 ? true : !!save.click.segUpgrades[seg-1];
    const needUpgrade = within === 0 && seg > 0 && !prevSegBought;

    if (needUpgrade) {
      // Показываем апгрейд вместо покупки
      const prevCostSum = save.click.pendingSegmentCost[seg-1] || 0;
      const upgradeCost = prevCostSum / 2;
      clickCostEl.textContent = fmt(upgradeCost); // Показываем цену апгрейда в строке стоимости
      clickSegInfo.textContent = 'Segment upgrade required to progress';
      clickBuyBtn.classList.add('hidden');
      clickBuyBtn.setAttribute('aria-hidden', 'true');

      clickSegBtn.classList.remove('hidden');
      clickSegBtn.removeAttribute('aria-hidden');
      // Визуально сделать похожей на primary (если нужно)
      clickSegBtn.classList.add('primary');
      clickSegBtn.textContent = `Upgrade (${fmt(upgradeCost)})`;
      clickSegBtn.disabled = save.points < upgradeCost;
    } else {
      // Показываем покупку, скрываем апгрейд
      clickCostEl.textContent = fmt(totalCost); // Показываем обычную стоимость покупки
      clickSegBtn.classList.add('hidden');
      clickSegBtn.setAttribute('aria-hidden', 'true');
      clickSegBtn.classList.remove('primary');

      clickBuyBtn.classList.remove('hidden');
      clickBuyBtn.removeAttribute('aria-hidden');
      clickBuyBtn.disabled = (totalLevels === 0) || (save.points < totalCost);
      clickSegInfo.textContent = 'Buy 10 levels to unlock';
    }
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
    card.dataset.buildingIndex = i;

    // Верх: иконка слева, действие справа
    const header = document.createElement('div');
    header.className = 'building-card-header';

    // Используем пиксельную canvas-иконку
    const pixel = document.createElement('canvas');
    pixel.width = 56; pixel.height = 56;
    pixel.className = 'building-pixel';
    drawHousePixel(pixel, i);

    // Контейнер действий (одна зона, кнопки сменяются)
    const actionSlot = document.createElement('div');
    actionSlot.className = 'building-action-slot';

    // Buy button
    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn primary small';
    buyBtn.textContent = 'Buy levels';

    // Segment upgrade button
    const segBtn = document.createElement('button');
    segBtn.className = 'btn small';

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
    const seg = segmentIndex(b.level);
    const within = withinSegment(b.level);
    const prevSegBought = seg === 0 ? true : !!b.segUpgrades[seg-1];
    const needUpgrade = within === 0 && seg > 0 && !prevSegBought;
    
    const costEl = document.createElement('div');
    if (needUpgrade) {
      // Показываем цену апгрейда в строке стоимости
      const upgradeCost = (b.pendingSegmentCost[seg-1] || 0) / 2;
      costEl.innerHTML = `<strong>Next Cost:</strong> ${fmt(upgradeCost)} (upgrade)`;
    } else {
      // Показываем обычную стоимость покупки
      costEl.innerHTML = `<strong>Next Cost:</strong> ${fmt(nextCost.totalCost)} (${save.bulk === 'max' ? 'max' : 'x'+save.bulk})`;
    }
    
    const segInfo = document.createElement('div');
    segInfo.innerHTML = `<strong>Segment:</strong> ${seg}, within ${within}/9`;

    info.appendChild(nameEl);
    info.appendChild(lvlEl);
    info.appendChild(incEl);
    info.appendChild(costEl);
    info.appendChild(segInfo);

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
      // Требуется сегментный апгрейд — показываем только segBtn
      const prevCost = (b.pendingSegmentCost[seg-1] || 0) / 2;
      segBtn.textContent = `Upgrade (${fmt(prevCost)})`;
      segBtn.disabled = save.points < prevCost;
      segBtn.classList.remove('hidden');
      segBtn.addEventListener('click', ()=> buyBuildingSegUpgrade(i, seg-1));

      buyBtn.classList.add('hidden');
      buyBtn.setAttribute('aria-hidden', 'true');
      segBtn.classList.remove('hidden');
      segBtn.setAttribute('aria-hidden', 'false');
    } else {
      // Обычное состояние — показываем покупку, скрываем segBtn
      buyBtn.disabled = now() < b.blockedUntil || !canBuyNextBuilding(i) || (save.points < nextCost.totalCost);
      buyBtn.addEventListener('click', () => buyBuildingLevels(i));

      segBtn.classList.add('hidden');
      segBtn.setAttribute('aria-hidden', 'true');
      buyBtn.classList.remove('hidden');
      buyBtn.setAttribute('aria-hidden', 'false');
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

    // lock overlay if previous building not level 67
    const note = document.createElement('div');
    note.className = 'building-note';
    if (shouldHideButtons) {
      note.textContent = 'Reach Uber Mode to continue';
    } else if (!canBuyNextBuilding(i)) {
      note.textContent = 'Locked: previous building must reach level 67.';
    } else if (now() < b.blockedUntil) {
      const remain = Math.ceil((b.blockedUntil - now()) / 1000);
      note.classList.add('building-downnote');
      note.dataset.blockedUntil = String(b.blockedUntil);
      note.textContent = `Under repair: ${remain}s`;
    }
    card.appendChild(note);

    buildingsList.appendChild(card);
  });
}

function triggerUpgradeEffect(targetEl, text = 'Upgrade!') {
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

function triggerBuildingUpgradeEffect(index, text = 'Upgrade!') {
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
  if (!save) return;
  normalizeUberCardLayout();
  
  // Убеждаемся, что max = 19 до перехода в убер мод (не трогаем если уже в убер моде - 1881)
  // НЕ изменяем max если он уже установлен в 1881 (убер мод активен)
  if (save.uber.max !== 9999 && save.uber.max !== 19 && save.uber.max !== 1881) {
    save.uber.max = 19;
  }
  
  uberLevelEl.textContent = save.uber.level;
  uberMaxEl.textContent = save.uber.max;
  uberIncomeEl.textContent = fmt(uberIncomeAt(save.uber.level));

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
    // Обновляем состояние кнопок завершения игры и убер мода
    updateEndgameButtons();
  } else {
    if (note) note.textContent = '';
    // Показываем обычную стоимость покупки
    const uberCost = uberCostAt(save.uber.level);
    uberCostEl.textContent = fmt(uberCost);
    
    if (uberBuyBtn) {
    uberBuyBtn.classList.remove('hidden');
    uberBuyBtn.removeAttribute('aria-hidden');
      // Кнопка активна только если разблокировано И достаточно поинтов
      uberBuyBtn.disabled = save.points < uberCost;
    }
    // Скрываем кнопки завершения игры, если уровень < 19
    updateEndgameButtons();
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
function updateSeason() {
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

// Оптимизация рендеринга - отложенный вызов для производительности
let _renderTimeout = null;
function scheduleRender() {
  if (_renderTimeout) return; // Уже запланирован
  _renderTimeout = requestAnimationFrame(() => {
    renderAll();
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
  renderTalents();
  updateBulkButtons(); // Обновляем активное состояние кнопок bulk
  updateSeason(); // Обновляем сезонную тему
  startAutosave();

  updateEndgameButtons();
  _recalcTalentPointsCap();
}

// ======= Actions =======
function addPoints(n) {
  save.points += n;
  // Обновляем статистику
  if (save.statistics) {
    save.statistics.totalPointsEarned += n;
    const currentPPS = totalPPS();
    const currentPPC = totalPPC();
    if (currentPPS > save.statistics.highestPPS) {
      save.statistics.highestPPS = currentPPS;
    }
    if (currentPPC > save.statistics.highestPPC) {
      save.statistics.highestPPC = currentPPC;
    }
  }
  // Обновляем состояние кнопок после изменения поинтов
  updateButtonStates();
}

// Обновляет состояние disabled для всех кнопок покупки/апгрейда
// Вызывается автоматически при изменении поинтов и в игровом цикле
function updateButtonStates() {
  if (!save) return;

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
      if (clickSegBtn && !clickSegBtn.classList.contains('hidden')) {
        clickSegBtn.disabled = save.points < (prevCostSum/2);
      }
    } else {
      const { totalCost, totalLevels } = computeBulkCostForClick(save.bulk);
      if (clickBuyBtn && !clickBuyBtn.classList.contains('hidden')) {
        clickBuyBtn.disabled = (totalLevels === 0) || (save.points < totalCost);
      }
    }
  }

  // Обновляем кнопки зданий
  save.buildings.forEach((b, i) => {
    const card = buildingsList?.children[i];
    if (!card) return;

    const buyBtn = card.querySelector('.building-action-slot .btn.primary');
    const segBtn = card.querySelector('.building-action-slot .btn:not(.primary)');
    
    // Check if buttons should be hidden (level >= 1000 and not in Uber Mode)
    const buildingShouldHide = b.level >= 1000 && !isInUberMode;
    
    if (!buildingShouldHide) {
      const buildingSeg = segmentIndex(b.level);
      const buildingWithin = withinSegment(b.level);
      const buildingPrevSegBought = buildingSeg === 0 ? true : !!b.segUpgrades[buildingSeg-1];
      const buildingNeedUpgrade = buildingWithin === 0 && buildingSeg > 0 && !buildingPrevSegBought;

      if (buildingNeedUpgrade) {
        const prevCost = (b.pendingSegmentCost[buildingSeg-1] || 0) / 2;
        if (segBtn && !segBtn.classList.contains('hidden')) {
          segBtn.disabled = save.points < prevCost;
        }
      } else {
        const nextCost = computeBulkCostForBuilding(i, save.bulk);
        if (buyBtn && !buyBtn.classList.contains('hidden')) {
          buyBtn.disabled = (now() < b.blockedUntil) || !canBuyNextBuilding(i) || (save.points < nextCost.totalCost);
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
    toast('Cannot progress: segment upgrade required.', 'warn');
    return false;
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

  // After buy, re-render immediately for critical operations
  renderAll();
  // Проверяем разблокировку Uber здания после покупки уровней
  checkUberUnlock();
  return true;
}

function buyClickLevels() {
  const segStartLevel = save.click.level;
  const bought = buyBulkLevels('click', computeBulkCostForClick, () => {
    const lvl = save.click.level;
    const cost = clickLevelCostAt(lvl);
    const seg = segmentIndex(lvl);
    save.click.pendingSegmentCost[seg] = (save.click.pendingSegmentCost[seg] || 0) + cost;

    // 66% break or 33% golden on 101st continuous click (handled in clicking, not leveling)
    // Level up gating check (3% fail chance for buildings only, not for click)
    save.click.level = Math.min(save.click.level + 1, save.click.max);
  });
  if (bought) {
    triggerUpgradeEffect(clickBtn, 'Level Up!');
  }
}

function buyClickSegmentUpgrade(segIndex) {
  const costSum = (save.click.pendingSegmentCost[segIndex] || 0) / 2;
  if (save.points < costSum) {
    toast('Not enough points for segment upgrade.', 'warn');
    return;
  }
  save.points -= costSum;
  if (save.statistics) {
    save.statistics.totalPointsSpent += costSum;
  }
  save.click.segUpgrades[segIndex] = true;
  save.click.upgradeBonus += 1; // 13% per upgrade (count stack)
  toast('Click segment upgraded: +13% income.', 'good');
  triggerUpgradeEffect(clickBtn, 'Upgrade!');
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
    
    // Master Builder talent: chance for free purchase (before applying level)
    // Check Master Builder BEFORE applying level to determine if this purchase is free
    let isFree = false;
    const masterBuilderLvl = talentLevelUI('masterBuilder');
    if (masterBuilderLvl > 0) {
      const masterBuilderChance = TALENT_DEFS.masterBuilder.chances[masterBuilderLvl] || 0;
      if (randChance(masterBuilderChance)) {
        isFree = true;
        const nextLevel = lvl + 1;
        toast(`${b.name} Master Builder: Level ${nextLevel} is free! Refunded ${fmt(cost)} points.`, 'good');
      }
    }
    
    // Track segment cost (only if not free)
    if (!isFree) {
      b.pendingSegmentCost[seg] = (b.pendingSegmentCost[seg] || 0) + cost;
    }

    // Random chance to fail and trigger downtime (affected by modifiers and High Qualification talent)
    // Break can happen on any level, not just levels ending in 9
    const baseFailChance = 0.01; // 1% base chance on any level
    const breakChanceMult = save.modifiers.breakChanceMult || 1;
    const highQualLvl = talentLevelUI('highQualification');
    const highQualReduction = TALENT_DEFS.highQualification.bonuses[highQualLvl] || 0;
    const adjustedFailChance = baseFailChance * breakChanceMult * (1 - highQualReduction);
    const repairMult = (save.modifiers.repairTimeMult || 1);
    const baseRepairMs = 164000;
    const secondTeamLvl = talentLevelUI('secondTeam');
    const secondTeamReduction = TALENT_DEFS.secondTeam.bonuses[secondTeamLvl] || 0;
    const adjustedRepairMs = Math.max(0, baseRepairMs * repairMult - secondTeamReduction);
    
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
    
    // Return cost if Master Builder made this level free (for refund), otherwise return true
    return isFree ? cost : true;
  };
  const bought = buyBulkLevels('building', computeFn, applyFn, i);
  if (bought) {
    triggerBuildingUpgradeEffect(i, 'Level Up!');
  }
  // Проверяем достижения после покупки уровней зданий
  checkAchievements();
  // Проверяем разблокировку Uber здания
  checkUberUnlock();
}

function buyBuildingSegUpgrade(i, segIndex) {
  const b = save.buildings[i];
  const costSum = (b.pendingSegmentCost[segIndex] || 0) / 2;
  if (save.points < costSum) {
    toast('Not enough points for segment upgrade.', 'warn');
    return;
  }
  save.points -= costSum;
  if (save.statistics) {
    save.statistics.totalPointsSpent += costSum;
  }
  b.segUpgrades[segIndex] = true;
  b.upgradeBonus += 1;
  toast(`${b.name} segment upgraded: +13% income.`, 'good');
   triggerBuildingUpgradeEffect(i, 'Upgrade!');
  renderAll();
}

// ======= Clicking mechanics =======
// Функция для создания частиц при клике
function createClickParticles(event, value) {
  if (!clickBtn) return;
  
  const rect = clickBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Создаем 5-8 частиц
  const particleCount = 5 + Math.floor(Math.random() * 4);
  const formattedValue = fmt(value);
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'click-particle';
    particle.textContent = formattedValue;
    
    // Случайное направление и скорость
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
    const distance = 30 + Math.random() * 40;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;
    
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty('--end-x', `${endX}px`);
    particle.style.setProperty('--end-y', `${endY}px`);
    particle.style.setProperty('--delay', `${i * 0.05}s`);
    
    document.body.appendChild(particle);
    
    // Удаляем частицу после анимации
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
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

clickBtn.addEventListener('click', (event) => {
  // Broken or golden states
  if (save.click.brokenUntil > now()) {
    toast('Click button is broken.', 'warn');
    renderClick(); // обновляем статус сразу
    return;
  }

  const ts = now();
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
  const critRoll = rollTalentCrit();
  const gain = basePpc * (critRoll.multiplier || 1);
  addPoints(gain);
  if (critRoll.rolled) {
    showCritDamage(critRoll.multiplier, event);
  }
  
  // Создаем частицы при клике
  createClickParticles(event, gain);

  // Отслеживаем клики для достижений
  if (save.achievements) {
    save.achievements.stats.totalClicks += 1;
    checkAchievements();
  }

  // Клик Безумия: шанс потерять уровни
  if (madnessActive && randChance(0.005)) {
    save.click.level = Math.max(0, save.click.level - 3);
    toast('Click Madness backlash: -3 Click levels!', 'warn');
  }

  // 0.5% шанс на золотую или сломанную кнопку при каждом клике (отключено в Click Madness)
  if (!madnessActive) {
    const roll = Math.random();
  if (roll < 0.005) {
    // 0.5% шанс - определяем золотую или сломанную
      const brokenActive = save.click.brokenUntil > now();
      const goldenActive = save.click.goldenUntil > now();
      
      // Золотая кнопка не может сломаться, сломанная кнопка не может стать золотой
      if (!goldenActive && !brokenActive) {
    const outcomeRoll = Math.random();
    if (outcomeRoll < 0.66) {
      // 66% из 0.5% = сломанная кнопка (0.33% общий шанс)
      save.click.brokenUntil = now() + 26000;
      // Сбрасываем стрик при сломанной кнопке
      save.streak.count = 0;
      save.streak.multiplier = 1.0;
      toast('Click button broke for 26s.', 'bad');
      renderClick(); // обновляем статус сразу
    } else {
      // 34% из 0.5% = золотая кнопка (0.17% общий шанс)
      save.click.goldenUntil = now() + 8000;
      // Сбрасываем стрик при золотой кнопке
      save.streak.count = 0;
      save.streak.multiplier = 1.0;
      toast('Click button turned golden for 8s (x1.5 PPC).', 'good');
      renderClick(); // обновляем статус сразу

          // Золотая кнопка просто заканчивается без поломки
      setTimeout(() => {
        save.click.goldenUntil = 0;
            toast('Golden effect ended.', 'warn');
        renderClick(); // обновляем статус после окончания
      }, 8000);
        }
      }
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
  
  // Создаем canvas для короля, если его еще нет
  if (!kingEl.querySelector('canvas')) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = 'crisp-edges';
    kingEl.innerHTML = '';
    kingEl.appendChild(canvas);
    drawKing(canvas);
  } else {
    drawKing(kingEl.querySelector('canvas'));
  }
  
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
  const durationMs = 8000;
  const target = 12;
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
    // Король добавляет максимально возможное количество уровней до следующего апгрейда
    let openedCount = 0;
    let totalLevelsAdded = 0;
    save.buildings.forEach(b => {
      if (b.level > 0) {
        const maxAddable = maxLevelsBeforeUpgrade(b.level, 4, b.segUpgrades, b.max);
        if (maxAddable > 0) {
          b.level = Math.min(b.max, b.level + maxAddable);
        openedCount++;
          totalLevelsAdded += maxAddable;
        }
      }
    });
    
    // Для Click также применяем ограничение по апгрейдам
    const clickMaxAddable = maxLevelsBeforeUpgrade(save.click.level, 3, save.click.segUpgrades, save.click.max);
    if (clickMaxAddable > 0) {
      save.click.level = Math.min(save.click.max, save.click.level + clickMaxAddable);
    }
    
    // +5% points
    save.points = save.points * 1.05;
    toast(`Success! The King rewarded you: +${totalLevelsAdded} levels to buildings (${openedCount} buildings), +${clickMaxAddable} to Click, +5% points.`, 'good');
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


function drawSpider(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  
  const bodyColor = '#2a1f14';
  const legColor = '#1a0f0a';
  const eyeColor = '#ff0000';
  const highlight = '#3a2f24';
  
  // Body (oval)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(32, 36, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0a0500';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Head (smaller oval)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(32, 20, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0a0500';
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

  // Создаем canvas для паука, если его еще нет
  if (!spiderEl.querySelector('canvas')) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    spiderEl.innerHTML = '';
    spiderEl.appendChild(canvas);
    drawSpider(canvas);
  } else {
    drawSpider(spiderEl.querySelector('canvas'));
  }

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

    // Сбрасываем streak при клике на паука, чтобы предотвратить случайную активацию золотого состояния
    save.streak.count = 0;
    save.streak.lastClickTs = 0;
    save.streak.multiplier = 1.0;

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
let _lastAchievementCheck = 0;
function tick() {
  if (!save) return;
  const t = now();
  const dt = (t - (save.lastTick || t)) / 1000; // seconds
  save.lastTick = t;

  // Treasury regen
  if (save.treasury) {
    const dtreasury = (t - (save.treasury.lastTs || t)) / 1000;
    save.treasury.lastTs = t;
    if (dtreasury > 0) {
      const baseRegen = save.treasury.regenPerSec || 1;
      const talentRegenBonus = talentTreasuryRegenBonus();
      const actualRegen = baseRegen + talentRegenBonus;
      gainTreasury(actualRegen * dtreasury);
    }

    // Engineer effect
    if (save.treasury.actions.engineerUntil > t) {
      save.modifiers.breakChanceMult = 0.34; // -66%
      save.modifiers.repairTimeMult = 2.0;
    } else {
      save.modifiers.breakChanceMult = 1.0;
      save.modifiers.repairTimeMult = 1.0;
    }
  }

  // Real-time income
  const pps = totalPPS();
  addPoints(pps * dt);

  // Отслеживаем время игры для достижений
  if (save.achievements) {
    save.achievements.stats.totalPlayTime += dt * 1000; // в миллисекундах
    // Проверяем достижения раз в секунду (не каждый тик)
    if (t - _lastAchievementCheck >= 1000) {
      checkAchievements();
      _lastAchievementCheck = t;
    }
  }

  // Spider spawn check
  maybeSpawnSpider();

  // Update UI
  renderTopStats();
  renderClick(); // Обновляем кнопку Click для автоматического снятия баффов/дебаффов
  renderEffects();
  renderTreasuryActions();
  // Обновляем состояние кнопок (disabled/enabled) в зависимости от поинтов
  updateButtonStates();

  // Render some parts less often
}
setInterval(tick, 100); // 10x per second for smoothness

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
  
  const cost = uberCostAt(save.uber.level);
  if (save.points < cost) {
    toast('Not enough points.', 'warn');
    return;
  }
  save.points -= cost;
  if (save.statistics) {
    save.statistics.totalPointsSpent += cost;
  }
  save.uber.level = Math.min(save.uber.level + 1, save.uber.max);
  toast('Citadel level increased.', 'good');
  checkAchievements(); // Проверяем достижения после покупки уровня Uber
  renderAll();
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
      currentUser = { username, password: '' }; // Сохраняем пользователя для автологина
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
      toast('Entered Uber Mode!', 'good');
      saveNow(); // Сохраняем состояние убер мода немедленно
      updateEndgameButtons(); // Скрываем кнопки после перехода в убер мод
  renderAll();
    }
  );
});
}

// ======= Pixel art drawing (procedural) =======
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

// ======= Auth logic =======
function showGame() {
  authScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  usernameDisplay.textContent = save.meta.username;
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
}
function showAuth() {
  gameScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
}

if (loginBtn) {
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
  // Инициализируем достижения, если их нет в старом сохранении
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
  if (save.uber && save.uber.max !== 9999 && save.uber.max !== 19 && save.uber.max !== 1881) {
    save.uber.max = 19;
  }
  showGame();
});
}

if (registerBtn) {
registerBtn.addEventListener('click', () => {
  const u = registerUsername.value.trim();
  const p = registerPassword.value;
  if (!u || !p) { toast('Please enter username and password.', 'warn'); return; }

  // Overwrite for simplicity
  currentUser = { username: u, password: p };
  save = newSave(u);
  initBuildings(save);
  // Инициализируем достижения (уже есть в newSave, но на всякий случай)
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
  saveNow();
  toast('Account created.', 'good');
  showGame();
});
}

if (logoutBtn) {
logoutBtn.addEventListener('click', () => {
  saveNow();
  currentUser = null;
  save = null;
  toast('Logged out.', 'info');
  showAuth();
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

// Talents modal
if (talentsBtn) {
  talentsBtn.addEventListener('click', () => {
    openTalents();
  });
}
if (talentsClose) {
  talentsClose.addEventListener('click', () => {
    closeTalents();
  });
}
if (talentsModal) {
  talentsModal.addEventListener('click', (ev) => {
    if (ev.target === talentsModal) closeTalents();
  });
}
if (talentsConfirm) {
  talentsConfirm.addEventListener('click', confirmTalents);
}
if (talentsCancel) {
  talentsCancel.addEventListener('click', resetTalents);
}
if (talentsResetAll) {
  talentsResetAll.addEventListener('click', resetAllTalents);
}

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
    case 'cycleSeason':
      cycleSeason();
      break;
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
  if (!list) {
    // Элемент не найден - возможно, игра еще не загружена или элемент не существует
    return;
  }
  
  if (!save || !save.modifiers) {
    list.innerHTML = '';
    return;
  }
  
  list.innerHTML = '';
  
  if (!save.modifiers.activeEffects || save.modifiers.activeEffects.length === 0) {
    return;
  }

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
  if (stored && stored.user && stored.data) {
    // Keep saved for quick login
    currentUser = stored.user;
    save = stored.data;
    if (!save.buildings || save.buildings.length === 0) initBuildings(save);
    ensureTreasury(save);
    ensureTalents(save);
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
    // Show auth; user can log in. Or auto-login? Keep manual per request.
  }
  autosaveLoop();
// ... после загрузки save и первого рендера
// Рендерим достижения всегда, даже если игра не загружена
renderAchievements();
if (save) {
  ensureTreasury(save);
  ensureTalents(save);
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
        totalPointsEarned: save.points,
        totalPointsSpent: 0,
        highestPPS: 0,
        highestPPC: 0,
        sessionStartTime: now(),
        lastSessionTime: 0,
      };
    }
    // Определяем и применяем сезон
    updateSeason();
  }
  if (save) {
    renderAll();
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
  if (!save.statistics) {
    save.statistics = {
      totalPointsEarned: save.points,
      totalPointsSpent: 0,
      highestPPS: 0,
      highestPPC: 0,
      sessionStartTime: now(),
      lastSessionTime: 0,
    };
  }
  
  const stats = save.statistics;
  const achievements = save.achievements;
  const currentPPS = totalPPS();
  const currentPPC = totalPPC();
  const sessionTime = now() - stats.sessionStartTime;
  const totalPlayTime = achievements ? achievements.stats.totalPlayTime : 0;
  
  body.innerHTML = `
    <div class="stat-section">
      <div class="stat-section-title">Points</div>
      <div class="stat-row">
        <span class="stat-label">Total Earned:</span>
        <span class="stat-value">${fmt(stats.totalPointsEarned)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Spent:</span>
        <span class="stat-value">${fmt(stats.totalPointsSpent)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Current Balance:</span>
        <span class="stat-value">${fmt(save.points)}</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Performance</div>
      <div class="stat-row">
        <span class="stat-label">Current PPS:</span>
        <span class="stat-value">${fmt(currentPPS)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Highest PPS:</span>
        <span class="stat-value">${fmt(stats.highestPPS)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Current PPC:</span>
        <span class="stat-value">${fmt(currentPPC)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Highest PPC:</span>
        <span class="stat-value">${fmt(stats.highestPPC)}</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Activity</div>
      <div class="stat-row">
        <span class="stat-label">Total Clicks:</span>
        <span class="stat-value">${achievements ? achievements.stats.totalClicks.toLocaleString() : '0'}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Play Time:</span>
        <span class="stat-value">${formatTime(totalPlayTime)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Session Time:</span>
        <span class="stat-value">${formatTime(sessionTime)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Destructions:</span>
        <span class="stat-value">${achievements ? achievements.stats.totalDestructions : '0'}</span>
      </div>
    </div>
    
    <div class="stat-section">
      <div class="stat-section-title">Buildings</div>
      <div class="stat-row">
        <span class="stat-label">Total Buildings:</span>
        <span class="stat-value">${save.buildings.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Building Levels:</span>
        <span class="stat-value">${save.buildings.reduce((sum, b) => sum + b.level, 0)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Click Level:</span>
        <span class="stat-value">${save.click.level}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Citadel Level:</span>
        <span class="stat-value">${save.uber.unlocked ? save.uber.level : 'Locked'}</span>
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
      totalPointsEarned: save.points || 0,
      totalPointsSpent: 0,
      highestPPS: 0,
      highestPPC: 0,
      sessionStartTime: now(),
      lastSessionTime: 0,
    };
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

// ======= Periodic checks ===++___-----++====
setInterval(() => {
  checkUberUnlock();
  renderUber();
}, 1000);

