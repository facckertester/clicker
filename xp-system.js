/* ======= XP & Level System =======
 * Отдельный модуль для системы опыта и уровней
 * Версия: 1.0
 */

// ======= Константы =======
const XP_CLICKS_THRESHOLD = 20; // Каждые 20 кликов дают XP

// ======= Формула XP для уровня =======
function getXPForLevel(level) {
  // Более крутая формула для замедления прокачки
  // XP_for_level(N) = 100 + (N * 10) + (N² * 0.5)
  return 100 + (level * 10) + (level * level * 0.5);
}

// ======= Масштабирование XP =======
function getXPMultiplier() {
  if (!save || !save.player) return 1.0;
  const playerLevel = save.player.level || 1;
  // XP_multiplier = 1 + (playerLevel / 200)
  return 1 + (playerLevel / 200);
}

// ======= Инициализация системы XP =======
function initXPSystem(saveObj) {
  if (!saveObj.player) {
    saveObj.player = {
      level: 1,
      xp: 0,
      xpForNextLevel: getXPForLevel(1), // XP для уровня 2
      totalXP: 0,
      clicksForXP: 0 // Счетчик кликов для начисления XP
    };
  } else {
    // Миграция: убеждаемся что все поля существуют
    if (saveObj.player.level === undefined) saveObj.player.level = 1;
    if (saveObj.player.xp === undefined) saveObj.player.xp = 0;
    if (saveObj.player.totalXP === undefined) saveObj.player.totalXP = 0;
    if (saveObj.player.clicksForXP === undefined) saveObj.player.clicksForXP = 0;
    // Пересчитываем xpForNextLevel если нужно
    if (saveObj.player.xpForNextLevel === undefined) {
      saveObj.player.xpForNextLevel = getXPForLevel(saveObj.player.level);
    }
  }
}

// ======= Добавление XP =======
function addXP(amount, source = 'unknown') {
  if (!save || !save.player) {
    initXPSystem(save);
    if (!save || !save.player) return;
  }
  
  if (amount <= 0) return;
  
  const multiplier = getXPMultiplier();
  const finalAmount = amount * multiplier;
  
  save.player.xp += finalAmount;
  save.player.totalXP += finalAmount;
  
  // Проверяем повышение уровня
  checkLevelUp();
  
  // Обновляем UI
  renderXPBar();
}

// ======= Проверка повышения уровня =======
function checkLevelUp() {
  if (!save || !save.player) return;
  
  let leveledUp = false;
  while (save.player.xp >= save.player.xpForNextLevel) {
    // Повышаем уровень
    save.player.xp -= save.player.xpForNextLevel;
    save.player.level += 1;
    leveledUp = true;
    
    // Вычисляем XP для следующего уровня
    save.player.xpForNextLevel = getXPForLevel(save.player.level);
    
    // Уведомление
    toast(`Level Up! You are now level ${save.player.level}!`, 'good');
    if (typeof playSound === 'function') {
      playSound('kingBuff'); // Используем существующий звук для level up
    }
  }
  
  // Анимация level up
  if (leveledUp) {
    const xpProgressEl = document.querySelector('.xp-progress');
    if (xpProgressEl) {
      xpProgressEl.classList.add('level-up');
    }
  }
}

// ======= Получение XP за действия =======

// 1. Клики (накопление)
function addXPForClicks(clickCount) {
  if (!save || !save.player) return;
  
  save.player.clicksForXP += clickCount;
  
  // Каждые 20 кликов даем XP (увеличено до 50 для замедления)
  const threshold = 50; // Было 20
  while (save.player.clicksForXP >= threshold) {
    const clickLevel = save.click ? save.click.level : 0;
    const xpAmount = 0.02 * (1 + clickLevel / 300); // Уменьшено с 0.05 и увеличено делитель
    addXP(xpAmount, 'clicks');
    save.player.clicksForXP -= threshold;
  }
}

// 2. Покупка уровня клика
function addXPForClickLevel(clickLevel) {
  // Уменьшаем XP за покупку уровней в начале
  const xpAmount = 1 + (clickLevel / 100); // Было 2 + (clickLevel / 50)
  addXP(xpAmount, 'click_level');
}

// 3. Покупка уровня здания
function addXPForBuildingLevel(buildingLevel) {
  // Уменьшаем XP за покупку уровней в начале
  const xpAmount = 0.5 + (buildingLevel / 120); // Было 1.5 + (buildingLevel / 60)
  addXP(xpAmount, 'building_level');
}

// 4. Завершение ремонта здания
function addXPForRepair(buildingLevel) {
  const xpAmount = 10 + (buildingLevel * 0.3);
  addXP(xpAmount, 'repair');
}

// 5. Успешное охлаждение после перегрева
function addXPForCooldown() {
  addXP(25, 'cooldown');
}

// 6. Покупка уровня Uber здания
function addXPForUberLevel(uberLevel) {
  const xpAmount = 15 + (uberLevel * 1.5);
  addXP(xpAmount, 'uber_level');
}

// 7. Сегментный апгрейд клика (UP)
function addXPForClickUpgrade(segmentIndex) {
  const xpAmount = 50 + (segmentIndex * 5);
  addXP(xpAmount, 'click_upgrade');
}

// 8. Сегментный апгрейд здания (UP)
function addXPForBuildingUpgrade(segmentIndex) {
  const xpAmount = 40 + (segmentIndex * 4);
  addXP(xpAmount, 'building_upgrade');
}

// 9. События
function addXPForSpider() {
  addXP(30, 'spider_event');
}

function addXPForBarmatun() {
  addXP(45, 'barmatun_event');
}

function addXPForElfArcher() {
  addXP(60, 'elf_archer_event');
}

function addXPForKing() {
  addXP(120, 'king_event');
}

// 10. Достижения
function addXPForAchievement(tier = 0, achievementValue = 0) {
  // tier: 0 = простые, 1 = средние, 2 = сложные, 3 = очень сложные
  // Уменьшаем XP за достижения, особенно простые
  let baseXP = 0;
  
  if (tier === 0) {
    // Простые достижения: 5-15 XP в зависимости от значения
    if (achievementValue <= 100) baseXP = 5; // Очень простые (1-100 кликов)
    else if (achievementValue <= 1000) baseXP = 8; // Простые (100-1000)
    else baseXP = 12; // Средне-простые (1000+)
  } else if (tier === 1) {
    // Средние достижения: 15-25 XP
    baseXP = 15 + Math.min(10, achievementValue / 10000);
  } else if (tier === 2) {
    // Сложные достижения: 30-50 XP
    baseXP = 30 + Math.min(20, achievementValue / 100000);
  } else {
    // Очень сложные: 50-100 XP
    baseXP = 50 + Math.min(50, achievementValue / 1000000);
  }
  
  // Дополнительное уменьшение XP за достижения на низких уровнях
  // (чтобы не было слишком быстрой прокачки в начале)
  const playerLevel = save && save.player ? (save.player.level || 1) : 1;
  if (playerLevel < 10) {
    // На уровнях 1-9 даем еще меньше XP за достижения
    baseXP = baseXP * 0.5;
  } else if (playerLevel < 25) {
    // На уровнях 10-24 даем 75% XP
    baseXP = baseXP * 0.75;
  }
  
  addXP(baseXP, 'achievement');
}

// 11. Разблокировка Uber здания
function addXPForUberUnlock() {
  addXP(300, 'uber_unlock');
}

// 12. Вход в Uber Mode
function addXPForUberMode() {
  addXP(500, 'uber_mode');
}

// 13. Достижение максимального уровня
function addXPForMaxClickLevel() {
  addXP(1000, 'max_click_level');
}

function addXPForMaxBuildingsLevel() {
  addXP(2000, 'max_buildings_level');
}

// ======= Рендеринг полоски XP =======
function renderXPBar() {
  // Убеждаемся что элемент виден ВСЕГДА (независимо от состояния инвентаря)
  const xpRow = document.getElementById('xp-row');
  if (xpRow) {
    // Принудительно убираем класс hidden
    xpRow.classList.remove('hidden');
    // Принудительно устанавливаем стили через !important
    xpRow.style.setProperty('display', 'flex', 'important');
    xpRow.style.setProperty('visibility', 'visible', 'important');
    xpRow.style.setProperty('opacity', '1', 'important');
    xpRow.style.setProperty('z-index', '9999', 'important');
    xpRow.style.setProperty('position', 'fixed', 'important');
    xpRow.style.setProperty('bottom', '0', 'important');
    xpRow.style.setProperty('left', '0', 'important');
    xpRow.style.setProperty('right', '0', 'important');
    xpRow.style.setProperty('width', '100%', 'important');
  }
  
  // Проверяем наличие save (может быть не определен на ранних этапах загрузки)
  const currentSave = window.save || (typeof save !== 'undefined' ? save : null);
  if (!currentSave || !currentSave.player) {
    // Показываем полоску даже если save еще не загружен
    const xpLevelEl = document.getElementById('xp-level');
    const xpValueEl = document.getElementById('xp-value');
    const xpPercentEl = document.getElementById('xp-percent');
    if (xpLevelEl) xpLevelEl.textContent = '1';
    if (xpValueEl) xpValueEl.textContent = '0 / 110 XP';
    if (xpPercentEl) xpPercentEl.textContent = '0.0%';
    return;
  }
  
  const xpBarEl = document.getElementById('xp-progress-fill');
  const xpValueEl = document.getElementById('xp-value');
  const xpLevelEl = document.getElementById('xp-level');
  const xpProgressEl = document.querySelector('.xp-progress');
  
  if (!xpBarEl || !xpValueEl || !xpLevelEl) return;
  
  const currentLevel = currentSave.player.level || 1;
  const currentXP = currentSave.player.xp || 0;
  const xpForNext = currentSave.player.xpForNextLevel || getXPForLevel(currentLevel);
  
  // Обновляем уровень
  xpLevelEl.textContent = currentLevel;
  
  // Обновляем текст XP
  xpValueEl.textContent = `${Math.floor(currentXP)} / ${Math.floor(xpForNext)} XP`;
  
  // Вычисляем процент заполнения
  const percent = Math.min(100, (currentXP / xpForNext) * 100);
  
  // Обновляем процент
  const xpPercentEl = document.getElementById('xp-percent');
  if (xpPercentEl) {
    xpPercentEl.textContent = `${percent.toFixed(1)}%`;
  }
  
  // Обновляем полоску прогресса
  xpBarEl.style.width = `${percent}%`;
  
  // Обновляем визуальные деления (10 делений по 10%)
  const divisions = document.querySelectorAll('.xp-division');
  divisions.forEach((div, index) => {
    const divisionPercent = (index + 1) * 10;
    if (percent >= divisionPercent) {
      div.classList.add('filled');
    } else {
      div.classList.remove('filled');
    }
  });
  
  // Анимация level up
  if (xpProgressEl && xpProgressEl.classList.contains('level-up')) {
    setTimeout(() => {
      xpProgressEl.classList.remove('level-up');
    }, 1000);
  }
}

// ======= Инициализация UI =======
function initXPUI() {
  const xpRow = document.getElementById('xp-row');
  if (xpRow) {
    // Проверяем, не находится ли XP row внутри скрытого родителя
    let parent = xpRow.parentElement;
    while (parent && parent !== document.body) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.display === 'none' || parent.classList.contains('hidden')) {
        // Перемещаем XP row в body
        document.body.appendChild(xpRow);
        break;
      }
      parent = parent.parentElement;
    }
    
    // Принудительно делаем видимым
    xpRow.classList.remove('hidden');
    xpRow.style.setProperty('display', 'flex', 'important');
    xpRow.style.setProperty('visibility', 'visible', 'important');
    xpRow.style.setProperty('opacity', '1', 'important');
    xpRow.style.setProperty('z-index', '9999', 'important');
    xpRow.style.setProperty('position', 'fixed', 'important');
    xpRow.style.setProperty('bottom', '0', 'important');
    xpRow.style.setProperty('left', '0', 'important');
    xpRow.style.setProperty('right', '0', 'important');
    xpRow.style.setProperty('width', '100%', 'important');
    xpRow.style.setProperty('height', 'auto', 'important');
    
    // Проверяем после применения стилей и исправляем размеры если нужно
    setTimeout(() => {
      const rect = xpRow.getBoundingClientRect();
      // Если размеры все еще 0, пытаемся принудительно установить их
      if (rect.width === 0 || rect.height === 0) {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        xpRow.style.setProperty('width', `${viewportWidth}px`, 'important');
        xpRow.style.setProperty('min-height', '50px', 'important');
      }
    }, 50);
    
    // Убеждаемся что все дочерние элементы тоже видимы
    const xpBar = xpRow.querySelector('.xp-bar');
    if (xpBar) {
      xpBar.style.setProperty('display', 'block', 'important');
      xpBar.style.setProperty('visibility', 'visible', 'important');
    }
    
    renderXPBar();
    
    // Обновляем каждую секунду
    if (!window.xpBarInterval) {
      window.xpBarInterval = setInterval(renderXPBar, 1000);
    }
  } else {
    setTimeout(initXPUI, 1000);
  }
}

// Инициализация при загрузке DOM
function initXPSystem() {
  // Сразу пытаемся инициализировать
  initXPUI();
  
  // Также инициализируем при полной загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initXPUI, 100);
    });
  } else {
    setTimeout(initXPUI, 100);
  }
}

// Запускаем инициализацию сразу
initXPSystem();

