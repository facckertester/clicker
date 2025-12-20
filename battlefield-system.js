/* ======= Battlefield System =======
 * Система полей битвы с боссами
 * Версия: 1.0
 */

// ======= Константы =======
const BATTLE_LIVES = 1; // Количество жизней в битве
const GENERAL_SPAWN_MIN_DELAY = 30000; // 30 секунд минимум (для тестирования, можно вернуть 300000)
const GENERAL_SPAWN_MAX_DELAY = 60000; // 1 минута максимум (для тестирования, можно вернуть 600000)

// ======= Состояние битвы =======
let battleState = {
  active: false,
  bossLevel: 1,
  bossHP: 0,
  bossMaxHP: 0,
  playerLives: BATTLE_LIVES,
  playerHP: [],
  playerMaxHP: [],
  lastBossAttack: 0,
  bossAttackInterval: 3000, // 3 секунды между атаками
  battleStartTime: 0,
  lastPlayerAttack: 0,
  playerAttackCooldown: 1000 // 1 секунда между атаками игрока (базовое значение)
};

// ======= Инициализация системы битвы =======
function initBattlefieldSystem(saveObj) {
  if (!saveObj) return; // Защита от null
  
  if (!saveObj.battlefield) {
    saveObj.battlefield = {
      bossLevel: 1,
      victories: 0,
      defeats: 0,
      totalSoulsEarned: 0,
      lastGeneralSpawn: 0,
      nextGeneralSpawn: 0
    };
  } else {
    // Миграция
    if (saveObj.battlefield.bossLevel === undefined) saveObj.battlefield.bossLevel = 1;
    if (saveObj.battlefield.victories === undefined) saveObj.battlefield.victories = 0;
    if (saveObj.battlefield.defeats === undefined) saveObj.battlefield.defeats = 0;
    if (saveObj.battlefield.totalSoulsEarned === undefined) saveObj.battlefield.totalSoulsEarned = 0;
    if (saveObj.battlefield.lastGeneralSpawn === undefined) saveObj.battlefield.lastGeneralSpawn = 0;
    if (saveObj.battlefield.nextGeneralSpawn === undefined || saveObj.battlefield.nextGeneralSpawn === 0) {
      const currentTime = typeof now === 'function' ? now() : Date.now();
      const delay = typeof _randInt === 'function' 
        ? _randInt(GENERAL_SPAWN_MIN_DELAY, GENERAL_SPAWN_MAX_DELAY)
        : GENERAL_SPAWN_MIN_DELAY + Math.floor(Math.random() * (GENERAL_SPAWN_MAX_DELAY - GENERAL_SPAWN_MIN_DELAY));
      saveObj.battlefield.nextGeneralSpawn = currentTime + delay;
    }
  }
}

// ======= Получение HP одной жизни игрока =======
function getPlayerLifeHP() {
  if (!save || !save.player) return 50;
  const baseHP = 50;
  const levelBonus = (save.player.level || 1) * 5;
  
  // Бонус от экипировки
  let equipmentBonus = 0;
  if (typeof getEquipmentHPBonus === 'function') {
    equipmentBonus = getEquipmentHPBonus();
  }
  
  return baseHP + levelBonus + equipmentBonus;
}

// ======= Получение HP босса =======
function getBossHP(bossLevel) {
  return 500 + (bossLevel * 200);
}

// ======= Получение урона босса =======
function getBossDamage(bossLevel) {
  const baseDamage = 15;
  const levelDamage = bossLevel * 7;
  const randomVariation = Math.random() * 5; // ±2.5 урона
  return Math.floor(baseDamage + levelDamage + randomVariation);
}

// ======= Получение урона игрока =======
function getPlayerDamage() {
  if (!save) return 10;
  
  // Еще больше уменьшен базовый урон
  const baseDamage = 10; // Было 20
  const clickLevelBonus = (save.click ? save.click.level || 0 : 0) * 0.1; // Было 0.3
  const playerLevelBonus = (save.player ? (save.player.level || 1) : 1) * 0.2; // Было 0.5
  
  // Бонус от экипировки (если система экипировки существует)
  let equipmentBonus = 0;
  if (typeof getEquipmentDamageBonus === 'function') {
    equipmentBonus = getEquipmentDamageBonus();
  }
  
  // Бонус от бафов
  let buffMult = 1.0;
  if (save.modifiers && save.modifiers.soulBuffDamageMult) {
    buffMult = save.modifiers.soulBuffDamageMult;
  }
  
  const randomVariation = (Math.random() * 5) - 2.5; // ±2.5 урона (было ±5)
  let finalDamage = Math.max(3, Math.floor((baseDamage + clickLevelBonus + playerLevelBonus + equipmentBonus + randomVariation) * buffMult));
  
  // Применяем модификатор от щита
  if (typeof getShieldDamageModifier === 'function') {
    const shieldModifier = getShieldDamageModifier();
    finalDamage = Math.floor(finalDamage * shieldModifier);
  }
  
  return finalDamage;
}

// ======= Получение защиты игрока =======
function getPlayerDefense() {
  if (!save) return 0;
  
  let defense = 0;
  
  // Базовый бонус от уровня игрока (очень маленький: 0.15 за уровень)
  if (save.player && save.player.level) {
    defense += (save.player.level - 1) * 0.15; // Начиная со 2 уровня
  }
  
  // Бонус от экипировки (если система экипировки существует)
  if (typeof getEquipmentDefenseBonus === 'function') {
    defense += getEquipmentDefenseBonus();
  }
  
  // Бонус от бафов
  let buffMult = 1.0;
  if (save.modifiers && save.modifiers.soulBuffDefenseMult) {
    buffMult = save.modifiers.soulBuffDefenseMult;
  }
  
  return Math.floor(defense * buffMult);
}

// ======= Спавн генерала =======
function spawnGeneral() {
  const generalEl = document.getElementById('general');
  if (!generalEl) return;
  
  if (!save || !save.battlefield) {
    initBattlefieldSystem(save);
    if (!save || !save.battlefield) return;
  }
  
  // Проверяем условие: минимум уровень игрока 5
  const playerLevel = save.player ? (save.player.level || 1) : 1;
  if (playerLevel < 5) {
    // Для отладки: уменьшаем требование до уровня 1
    // scheduleNextGeneral();
    // return;
    console.log('General spawn: Player level is', playerLevel, '(minimum 5 required, but allowing for testing)');
  }
  
  // Проверяем, не идет ли уже битва
  if (battleState.active) {
    scheduleNextGeneral();
    return;
  }
  
  // Инициализируем изображение генерала
  _initGeneralImage();
  
  // Размещаем генерала случайно
  _placeGeneralRandom();
  generalEl.classList.remove('hidden');
  generalEl.classList.add('show');
  generalEl.title = 'General — click to enter the battlefield';
  save.battlefield.lastGeneralSpawn = (typeof now === 'function' ? now() : Date.now());
  
  console.log('General spawned!', generalEl.classList);
  
  // Воспроизводим звук появления генерала
  if (typeof playSound === 'function') {
    playSound('king'); // Используем звук короля как временный
  }
  
  // Уведомление
  if (typeof toast === 'function') {
    toast('The General has arrived! Click to enter the battlefield.', 'good');
  }
  
  // Автоматическое исчезновение через 45 секунд
  if (_generalState.escapeTimer) clearTimeout(_generalState.escapeTimer);
  _generalState.escapeTimer = setTimeout(() => {
    if (generalEl.classList.contains('show')) {
      generalEl.classList.remove('show');
      toast('The General has left.', 'warn');
      scheduleNextGeneral();
    }
  }, 45000);
}

// ======= Состояние генерала =======
let _generalState = {
  visibleUntil: 0,
  escapeTimer: null,
  spawnTimer: null,
  image: null
};

// ======= Инициализация изображения генерала =======
function _initGeneralImage() {
  if (_generalState.image) return;
  
  const generalEl = document.getElementById('general');
  if (!generalEl) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Рисуем генерала (похож на короля, но с военной атрибутикой)
  drawGeneral(ctx);
  
  _generalState.image = canvas.toDataURL();
  generalEl.style.backgroundImage = `url(${_generalState.image})`;
  generalEl.style.backgroundSize = 'contain';
  generalEl.style.backgroundRepeat = 'no-repeat';
  generalEl.style.backgroundPosition = 'center';
}

// ======= Рисование генерала =======
function drawGeneral(ctx) {
  // Тело (темно-синий/серый)
  ctx.fillStyle = '#2a3a5a';
  ctx.fillRect(20, 25, 24, 30);
  
  // Голова
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(24, 15, 16, 16);
  
  // Шлем
  ctx.fillStyle = '#4a5a7a';
  ctx.fillRect(22, 12, 20, 8);
  ctx.fillRect(26, 8, 12, 6);
  
  // Меч
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(44, 20, 4, 20);
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(44, 40, 4, 4);
  
  // Щит
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(14, 25, 8, 12);
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(15, 26, 6, 10);
  
  // Глаза
  ctx.fillStyle = '#000';
  ctx.fillRect(26, 19, 2, 2);
  ctx.fillRect(32, 19, 2, 2);
  
  // Усы
  ctx.fillStyle = '#654321';
  ctx.fillRect(24, 23, 16, 2);
}

// ======= Размещение генерала случайно =======
function _placeGeneralRandom() {
  const generalEl = document.getElementById('general');
  if (!generalEl) return;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const generalSize = 64;
  
  const maxX = viewportWidth - generalSize;
  const maxY = viewportHeight - generalSize;
  
  const x = Math.max(0, Math.min(maxX, Math.random() * maxX));
  const y = Math.max(0, Math.min(maxY, Math.random() * maxY));
  
  generalEl.style.left = `${x}px`;
  generalEl.style.top = `${y}px`;
}

// ======= Планирование следующего спавна генерала =======
function scheduleNextGeneral() {
  if (_generalState.spawnTimer) {
    clearTimeout(_generalState.spawnTimer);
  }
  
  if (!save || !save.battlefield) {
    initBattlefieldSystem(save);
    if (!save || !save.battlefield) return;
  }
  
  // Используем _randInt если доступен, иначе Math.random
  let delay;
  if (typeof _randInt === 'function') {
    delay = _randInt(GENERAL_SPAWN_MIN_DELAY, GENERAL_SPAWN_MAX_DELAY);
  } else {
    delay = GENERAL_SPAWN_MIN_DELAY + Math.floor(Math.random() * (GENERAL_SPAWN_MAX_DELAY - GENERAL_SPAWN_MIN_DELAY));
  }
  
  save.battlefield.nextGeneralSpawn = (typeof now === 'function' ? now() : Date.now()) + delay;
  
  _generalState.spawnTimer = setTimeout(() => {
    spawnGeneral();
  }, delay);
}

// ======= Начало битвы =======
function startBattle() {
  if (battleState.active) return;
  
  if (!save || !save.battlefield) {
    initBattlefieldSystem(save);
    if (!save || !save.battlefield) return;
  }
  
  const bossLevel = save.battlefield.bossLevel;
  const bossMaxHP = getBossHP(bossLevel);
  const lifeHP = getPlayerLifeHP();
  
  // Инициализация состояния битвы
  battleState.active = true;
  battleState.bossLevel = bossLevel;
  battleState.bossHP = bossMaxHP;
  battleState.bossMaxHP = bossMaxHP;
  battleState.playerLives = BATTLE_LIVES;
  battleState.playerHP = [];
  battleState.playerMaxHP = [];
  
  // Заполняем жизни игрока
  for (let i = 0; i < BATTLE_LIVES; i++) {
    battleState.playerHP.push(lifeHP);
    battleState.playerMaxHP.push(lifeHP);
  }
  
  const currentTime = typeof now === 'function' ? now() : Date.now();
  battleState.lastBossAttack = currentTime;
  battleState.battleStartTime = currentTime;
  
  // Скрываем генерала
  const generalEl = document.getElementById('general');
  if (generalEl) {
    generalEl.classList.remove('show');
  }
  
  // Открываем модальное окно битвы
  openBattleModal();
  
  // Устанавливаем кулдаун атаки в зависимости от оружия
  updatePlayerAttackCooldown();
  
  // Запускаем игровой цикл битвы
  startBattleLoop();
}

// ======= Обновление кулдауна атаки игрока в зависимости от оружия =======
function updatePlayerAttackCooldown() {
  if (!save || !save.inventory || !save.inventory.equipment) {
    battleState.playerAttackCooldown = 1000; // Базовый кулдаун 1 секунда
    return;
  }
  
  const weapon = save.inventory.equipment.weapon;
  if (!weapon) {
    battleState.playerAttackCooldown = 1000; // Базовый кулдаун
    return;
  }
  
  const weaponType = weapon.weaponType || 'sword'; // По умолчанию меч
  
  switch (weaponType) {
    case 'dagger':
      // Кинжал - быстрее, но меньше урон
      battleState.playerAttackCooldown = 500; // 0.5 секунды
      break;
    case 'sword':
      // Одноручный меч - стандарт
      battleState.playerAttackCooldown = 1000; // 1 секунда
      break;
    case 'twohanded':
      // Двуручный меч - медленнее, но больше урон
      battleState.playerAttackCooldown = 2000; // 2 секунды
      break;
    default:
      battleState.playerAttackCooldown = 1000;
  }
}

// ======= Открытие модального окна битвы =======
function openBattleModal() {
  const battleModal = document.getElementById('battle-modal');
  if (battleModal) {
    battleModal.classList.remove('hidden');
    battleModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    renderBattleUI();
    
    // Закрытие по клику на overlay
    battleModal.addEventListener('click', closeBattleOnOverlayClick);
    
    // Закрытие по Escape
    document.addEventListener('keydown', closeBattleOnEscape);
  }
}

function closeBattleOnOverlayClick(e) {
  const battleModal = document.getElementById('battle-modal');
  const battleCard = battleModal ? battleModal.querySelector('.battle-modal-card') : null;
  // Закрываем только если клик был на overlay, а не на содержимое модалки
  if (battleModal && e.target === battleModal && !battleCard?.contains(e.target)) {
    closeBattleModal();
  }
}

function closeBattleOnEscape(e) {
  if (e.key === 'Escape') {
    const battleModal = document.getElementById('battle-modal');
    if (battleModal && !battleModal.classList.contains('hidden')) {
      closeBattleModal();
    }
  }
}

// ======= Закрытие модального окна битвы =======
function closeBattleModal() {
  const battleModal = document.getElementById('battle-modal');
  if (battleModal) {
    battleModal.classList.add('hidden');
    battleModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    
    // Удаляем обработчики
    battleModal.removeEventListener('click', closeBattleOnOverlayClick);
    document.removeEventListener('keydown', closeBattleOnEscape);
  }
  battleState.active = false;
}

// ======= Рендеринг UI битвы =======
function renderBattleUI() {
  if (!battleState.active) return;
  
  // HP босса
  const bossHPEl = document.getElementById('battle-boss-hp');
  const bossHPBarEl = document.getElementById('battle-boss-hp-bar');
  const bossHPPercentEl = document.getElementById('battle-boss-hp-percent');
  
  if (bossHPEl) {
    bossHPEl.textContent = `${Math.floor(battleState.bossHP)} / ${battleState.bossMaxHP}`;
  }
  
  if (bossHPBarEl) {
    const percent = Math.max(0, (battleState.bossHP / battleState.bossMaxHP) * 100);
    bossHPBarEl.style.width = `${percent}%`;
  }
  
  if (bossHPPercentEl) {
    const percent = Math.max(0, (battleState.bossHP / battleState.bossMaxHP) * 100);
    bossHPPercentEl.textContent = `${percent.toFixed(1)}%`;
  }
  
  // Жизни игрока
  const playerLivesEl = document.getElementById('battle-player-lives');
  if (playerLivesEl) {
    playerLivesEl.innerHTML = '';
    for (let i = 0; i < BATTLE_LIVES; i++) {
      const lifeDiv = document.createElement('div');
      lifeDiv.className = 'battle-life';
      
      if (i < battleState.playerLives) {
        const currentHP = battleState.playerHP[i] || 0;
        const maxHP = battleState.playerMaxHP[i] || 1;
        const percent = Math.max(0, (currentHP / maxHP) * 100);
        
        lifeDiv.innerHTML = `
          <div class="battle-life-bar">
            <div class="battle-life-bar-fill" style="width: ${percent}%"></div>
          </div>
          <div class="battle-life-text">${Math.floor(currentHP)} / ${maxHP}</div>
        `;
        
        if (currentHP <= 0) {
          lifeDiv.classList.add('life-lost');
        }
      } else {
        lifeDiv.classList.add('life-lost');
        lifeDiv.innerHTML = '<div class="battle-life-text">Lost</div>';
      }
      
      playerLivesEl.appendChild(lifeDiv);
    }
  }
  
  // Уровень босса
  const bossLevelEl = document.getElementById('battle-boss-level');
  if (bossLevelEl) {
    bossLevelEl.textContent = `Level ${battleState.bossLevel}`;
  }
}

// ======= Игровой цикл битвы =======
let battleLoopInterval = null;

function startBattleLoop() {
  if (battleLoopInterval) {
    clearInterval(battleLoopInterval);
  }
  
  battleLoopInterval = setInterval(() => {
    if (!battleState.active) {
      stopBattleLoop();
      return;
    }
    
    const nowTime = typeof now === 'function' ? now() : Date.now();
    
    // Атака босса
    if (nowTime - battleState.lastBossAttack >= battleState.bossAttackInterval) {
      bossAttack();
      battleState.lastBossAttack = nowTime;
      
      // Ускоряем атаки при низком HP босса
      if (battleState.bossHP < battleState.bossMaxHP * 0.5) {
        battleState.bossAttackInterval = 2000; // 2 секунды
      }
    }
    
    // Обновляем кнопку атаки (кулдаун)
    updateAttackButton();
    
    // Обновляем кнопку атаки (кулдаун)
    updateAttackButton();
    
    // Обновляем UI
    renderBattleUI();
    
    // Проверяем условия победы/поражения
    checkBattleEnd();
  }, 100); // Обновление каждые 100мс
}

function stopBattleLoop() {
  if (battleLoopInterval) {
    clearInterval(battleLoopInterval);
    battleLoopInterval = null;
  }
}

// ======= Атака босса =======
function bossAttack() {
  if (!battleState.active || battleState.playerLives <= 0) return;
  
  const damage = getBossDamage(battleState.bossLevel);
  const defense = getPlayerDefense();
  let finalDamage = Math.max(1, damage - defense);
  
  // Щит снижает входящий урон на 50%
  if (save && save.inventory && save.inventory.equipment && save.inventory.equipment.shield) {
    finalDamage = Math.floor(finalDamage * 0.5);
  }
  
  // Находим текущую активную жизнь
  let currentLifeIndex = -1;
  for (let i = 0; i < battleState.playerHP.length; i++) {
    if (battleState.playerHP[i] > 0) {
      currentLifeIndex = i;
      break;
    }
  }
  
  if (currentLifeIndex === -1) {
    battleState.playerLives = 0;
    return;
  }
  
  // Применяем урон
  battleState.playerHP[currentLifeIndex] -= finalDamage;
  
  if (battleState.playerHP[currentLifeIndex] <= 0) {
    battleState.playerHP[currentLifeIndex] = 0;
    battleState.playerLives--;
    
    // Анимация потери жизни
    playSound('debuff');
    toast(`Life lost! ${battleState.playerLives} lives remaining.`, 'bad');
  }
  
  // Визуальный эффект урона
  showBattleDamage(finalDamage, 'boss');
}

// ======= Атака игрока =======
function playerAttack() {
  if (!battleState.active || battleState.bossHP <= 0) return;
  
  const currentTime = typeof now === 'function' ? now() : Date.now();
  
  // Проверяем кулдаун атаки
  if (currentTime - battleState.lastPlayerAttack < battleState.playerAttackCooldown) {
    return; // Еще не прошло время кулдауна
  }
  
  const damage = getPlayerDamage();
  battleState.bossHP -= damage;
  battleState.lastPlayerAttack = currentTime;
  
  if (battleState.bossHP < 0) {
    battleState.bossHP = 0;
  }
  
  // Визуальный эффект урона
  showBattleDamage(damage, 'player');
  
  // Звук атаки
  if (typeof playSound === 'function') {
    playSound('clickGold');
  }
  
  // Обновляем UI для отображения кулдауна
  updateAttackButton();
  
  // Проверяем победу
  checkBattleEnd();
}

// ======= Обновление кнопки атаки с учетом кулдауна =======
function updateAttackButton() {
  const attackBtn = document.getElementById('battle-attack-btn');
  if (!attackBtn) return;
  
  const currentTime = typeof now === 'function' ? now() : Date.now();
  const timeSinceLastAttack = currentTime - battleState.lastPlayerAttack;
  const cooldownRemaining = Math.max(0, battleState.playerAttackCooldown - timeSinceLastAttack);
  
  if (cooldownRemaining > 0) {
    attackBtn.disabled = true;
    attackBtn.textContent = `Attack (${(cooldownRemaining / 1000).toFixed(1)}s)`;
  } else {
    attackBtn.disabled = false;
    attackBtn.textContent = 'Attack';
  }
}

// ======= Показ урона =======
function showBattleDamage(amount, source) {
  const battleArena = document.getElementById('battle-arena');
  if (!battleArena) return;
  
  const damageEl = document.createElement('div');
  damageEl.className = `battle-damage battle-damage-${source}`;
  damageEl.textContent = `-${Math.floor(amount)}`;
  
  const x = source === 'player' ? '20%' : '80%';
  const y = source === 'player' ? '70%' : '30%';
  damageEl.style.left = x;
  damageEl.style.top = y;
  
  battleArena.appendChild(damageEl);
  
  setTimeout(() => {
    if (damageEl.parentNode) {
      damageEl.parentNode.removeChild(damageEl);
    }
  }, 1000);
}

// ======= Проверка окончания битвы =======
function checkBattleEnd() {
  if (!battleState.active) return;
  
  // Поражение
  if (battleState.playerLives <= 0) {
    endBattle(false);
    return;
  }
  
  // Победа
  if (battleState.bossHP <= 0) {
    endBattle(true);
    return;
  }
}

// ======= Окончание битвы =======
function endBattle(victory) {
  stopBattleLoop();
  battleState.active = false;
  
  if (!save || !save.battlefield) {
    initBattlefieldSystem(save);
    if (!save || !save.battlefield) return;
  }
  
  if (victory) {
    // Победа
    save.battlefield.victories++;
    save.battlefield.bossLevel++;
    
    // Награда душами
    let soulsReward = 10 + (battleState.bossLevel * 5);
    
    // Бонус от бафов
    if (save.modifiers && save.modifiers.soulBuffSoulsMult) {
      soulsReward = Math.floor(soulsReward * save.modifiers.soulBuffSoulsMult);
    }
    
    if (typeof addSouls === 'function') {
      addSouls(soulsReward, 'battle_victory');
    }
    save.battlefield.totalSoulsEarned += soulsReward;
    
    // XP за победу
    if (typeof addXP === 'function') {
      addXP(50 + (battleState.bossLevel * 10), 'battle_victory');
    }
    
    toast(`Victory! Earned ${soulsReward} Souls!`, 'good');
    playSound('kingBuff');
    
    // Показываем результат
    showBattleResult(true, soulsReward);
  } else {
    // Поражение
    save.battlefield.defeats++;
    toast('Defeat! The General will return...', 'bad');
    playSound('debuff');
    
    // Показываем результат
    showBattleResult(false, 0);
  }
  
  // Закрываем модальное окно через 3 секунды
  setTimeout(() => {
    closeBattleModal();
    scheduleNextGeneral();
  }, 3000);
}

// ======= Дроп предметов с босса =======
function tryDropItemFromBoss(bossLevel) {
  if (!save || !save.inventory) return;
  
  // Базовый шанс дропа: 15% + (уровень босса * 1%)
  const dropChance = 15 + (bossLevel * 1);
  const roll = Math.random() * 100;
  
  if (roll > dropChance) return; // Не выпал дроп
  
  // Определяем редкость в зависимости от уровня босса
  let rarity = 'common';
  if (bossLevel >= 20) {
    rarity = Math.random() < 0.3 ? 'legendary' : (Math.random() < 0.6 ? 'rare' : 'uncommon');
  } else if (bossLevel >= 10) {
    rarity = Math.random() < 0.4 ? 'rare' : 'uncommon';
  } else if (bossLevel >= 5) {
    rarity = Math.random() < 0.5 ? 'uncommon' : 'common';
  }
  
  // Получаем случайный предмет нужной редкости из merchant-system
  if (typeof getAllItems === 'function') {
    const allItems = getAllItems();
    const itemsOfRarity = allItems.filter(item => 
      item.rarity === rarity && item.type !== 'consumable'
    );
    
    if (itemsOfRarity.length === 0) return; // Нет предметов такой редкости
    
    const droppedItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
    
    // Добавляем предмет в инвентарь
    if (typeof addItemToInventory === 'function') {
      if (addItemToInventory(droppedItem.id, 1)) {
        if (typeof toast === 'function') {
          toast(`Item dropped: ${droppedItem.name}!`, 'good');
        }
        if (typeof playSound === 'function') {
          playSound('kingBuff'); // Используем звук для дропа
        }
      }
    }
  }
}

// ======= Показ результата битвы =======
function showBattleResult(victory, soulsReward) {
  const battleResultEl = document.getElementById('battle-result');
  if (!battleResultEl) return;
  
  if (victory) {
    battleResultEl.innerHTML = `
      <div class="battle-result-victory">
        <h2>VICTORY!</h2>
        <p>You earned ${soulsReward} Souls!</p>
        <p>Boss Level increased to ${save.battlefield.bossLevel}</p>
      </div>
    `;
    battleResultEl.classList.add('show');
  } else {
    battleResultEl.innerHTML = `
      <div class="battle-result-defeat">
        <h2>DEFEAT</h2>
        <p>You lost all your lives.</p>
        <p>The General will return soon...</p>
      </div>
    `;
    battleResultEl.classList.add('show');
  }
  
  setTimeout(() => {
    battleResultEl.classList.remove('show');
  }, 3000);
}

// ======= Проверка спавна генерала в tick =======
function checkGeneralSpawn() {
  if (!save || !save.battlefield) {
    initBattlefieldSystem(save);
    // Если nextGeneralSpawn не установлен, устанавливаем его
    if (save && save.battlefield && !save.battlefield.nextGeneralSpawn) {
      scheduleNextGeneral();
    }
    return;
  }
  
  // Если nextGeneralSpawn не установлен, устанавливаем его
  if (!save.battlefield.nextGeneralSpawn || save.battlefield.nextGeneralSpawn === 0) {
    scheduleNextGeneral();
    return;
  }
  
  // Если битва активна, не спавним
  if (battleState.active) return;
  
  // Если генерал уже виден, не спавним
  const generalEl = document.getElementById('general');
  if (generalEl && generalEl.classList.contains('show')) return;
  
  // Проверяем время следующего спавна
  const currentTime = typeof now === 'function' ? now() : Date.now();
  const timeUntilSpawn = save.battlefield.nextGeneralSpawn - currentTime;
  
  if (currentTime >= save.battlefield.nextGeneralSpawn) {
    console.log('General spawn time reached! Spawning...');
    spawnGeneral();
  } else if (timeUntilSpawn < 10000) {
    // Для отладки: логируем когда осталось меньше 10 секунд
    console.log('General will spawn in', Math.ceil(timeUntilSpawn / 1000), 'seconds');
  }
}

// Обработчик клика по генералу
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGeneralHandlers, 500);
  });
} else {
  setTimeout(initGeneralHandlers, 500);
}

function initGeneralHandlers() {
  const generalEl = document.getElementById('general');
  if (generalEl) {
    generalEl.addEventListener('click', () => {
      if (generalEl.classList.contains('show')) {
        startBattle();
      }
    });
  }
  
  const battleCloseBtn = document.getElementById('battle-close');
  if (battleCloseBtn) {
    battleCloseBtn.addEventListener('click', () => {
      if (battleState.active) {
        // Можно добавить подтверждение
        closeBattleModal();
      }
    });
  }
  
  const battleAttackBtn = document.getElementById('battle-attack-btn');
  if (battleAttackBtn) {
    battleAttackBtn.addEventListener('click', () => {
      if (battleState.active) {
        playerAttack();
      }
    });
  }
  
  // Инициализация табов торговца
  const merchantTabs = document.querySelectorAll('.merchant-tab');
  merchantTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      // Убираем active у всех табов
      merchantTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Показываем соответствующий контент
      const contents = document.querySelectorAll('.merchant-tab-content');
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `merchant-${tabName}`) {
          content.classList.add('active');
        }
      });
    });
  });
}

