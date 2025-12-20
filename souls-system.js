/* ======= Souls System =======
 * Система душ - валюта за победы в битвах
 * Версия: 1.0
 */

// ======= Инициализация системы душ =======
function initSoulsSystem(saveObj) {
  if (!saveObj.souls) {
    saveObj.souls = {
      amount: 0,
      totalEarned: 0,
      totalSpent: 0
    };
  } else {
    // Миграция: убеждаемся что все поля существуют
    if (saveObj.souls.amount === undefined) saveObj.souls.amount = 0;
    if (saveObj.souls.totalEarned === undefined) saveObj.souls.totalEarned = 0;
    if (saveObj.souls.totalSpent === undefined) saveObj.souls.totalSpent = 0;
  }
}

// ======= Добавление душ =======
function addSouls(amount, source = 'unknown') {
  if (!save || !save.souls) {
    initSoulsSystem(save);
    if (!save || !save.souls) return;
  }
  
  if (amount <= 0) return;
  
  save.souls.amount += amount;
  save.souls.totalEarned += amount;
  
  // Обновляем UI
  renderSoulsDisplay();
  
  // Уведомление
  if (amount >= 10) {
    toast(`+${Math.floor(amount)} Souls earned!`, 'good');
  }
}

// ======= Трата душ =======
function spendSouls(amount) {
  if (!save || !save.souls) {
    initSoulsSystem(save);
    if (!save || !save.souls) return false;
  }
  
  if (save.souls.amount < amount) {
    return false;
  }
  
  save.souls.amount -= amount;
  save.souls.totalSpent += amount;
  
  // Обновляем UI
  renderSoulsDisplay();
  
  return true;
}

// ======= Получение количества душ =======
function getSouls() {
  if (!save || !save.souls) {
    initSoulsSystem(save);
    return 0;
  }
  return save.souls.amount || 0;
}

// ======= Рендеринг отображения душ =======
function renderSoulsDisplay() {
  if (!save || !save.souls) return;
  
  const soulsEl = document.getElementById('souls-amount');
  if (soulsEl) {
    // Форматируем число
    const amount = Math.floor(save.souls.amount);
    soulsEl.textContent = amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
}

// ======= Инициализация UI =======
function initSoulsUI() {
  // Проверяем существование элемента
  const soulsContainer = document.getElementById('souls-container');
  if (!soulsContainer) {
    // Пробуем еще раз через небольшую задержку
    setTimeout(() => {
      const soulsContainerRetry = document.getElementById('souls-container');
      if (!soulsContainerRetry) {
        console.warn('Souls container element not found');
        return;
      }
      renderSoulsDisplay();
    }, 100);
    return;
  }
  
  // Рендерим при загрузке
  renderSoulsDisplay();
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSoulsUI, 200);
  });
} else {
  setTimeout(initSoulsUI, 200);
}

