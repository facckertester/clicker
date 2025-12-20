/* ======= Inventory System =======
 * Система инвентаря в стиле MMORPG
 * Версия: 1.0
 */

// ======= Константы =======
const INVENTORY_SIZE = 30; // Количество слотов в инвентаре

// ======= Типы предметов =======
const ITEM_TYPES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  ACCESSORY: 'accessory',
  CONSUMABLE: 'consumable',
  MATERIAL: 'material'
};

// ======= Слоты экипировки =======
const EQUIPMENT_SLOTS = {
  WEAPON: 'weapon',
  HELMET: 'helmet',
  CHEST: 'chest',
  LEGS: 'legs',
  BOOTS: 'boots',
  RING: 'ring',
  AMULET: 'amulet'
};

// ======= Инициализация системы инвентаря =======
function initInventorySystem(saveObj) {
  if (!saveObj.inventory) {
    saveObj.inventory = {
      items: [], // Массив предметов [null, null, ...] или [{id, count, ...}, ...]
    equipment: {
      weapon: null,
      weapon2: null, // Второе оружие (только для кинжалов)
      shield: null,
      helmet: null,
      chest: null,
      legs: null,
      boots: null,
      ring: null,
      amulet: null
    }
    };
  } else {
    // Миграция
    if (!saveObj.inventory.items) {
      saveObj.inventory.items = new Array(INVENTORY_SIZE).fill(null);
    }
    if (!saveObj.inventory.equipment) {
      saveObj.inventory.equipment = {
        weapon: null,
        weapon2: null,
        shield: null,
        helmet: null,
        chest: null,
        legs: null,
        boots: null,
        ring: null,
        amulet: null
      };
    } else {
      // Миграция: добавляем слоты если их нет
      if (saveObj.inventory.equipment.shield === undefined) {
        saveObj.inventory.equipment.shield = null;
      }
      if (saveObj.inventory.equipment.weapon2 === undefined) {
        saveObj.inventory.equipment.weapon2 = null;
      }
    }
    
    // Убеждаемся что массив правильного размера
    while (saveObj.inventory.items.length < INVENTORY_SIZE) {
      saveObj.inventory.items.push(null);
    }
    while (saveObj.inventory.items.length > INVENTORY_SIZE) {
      saveObj.inventory.items.pop();
    }
  }
}

// ======= Добавление предмета в инвентарь =======
function addItemToInventory(itemId, count = 1) {
  if (!save || !save.inventory) {
    initInventorySystem(save);
    if (!save || !save.inventory) return false;
  }
  
  const itemData = getItemData(itemId);
  if (!itemData) return false;
  
  // Если предмет стакается
  if (itemData.stackable) {
    // Ищем существующий стак
    for (let i = 0; i < save.inventory.items.length; i++) {
      const item = save.inventory.items[i];
      if (item && item.id === itemId) {
        item.count += count;
        renderInventory();
        return true;
      }
    }
  }
  
  // Ищем свободный слот
  for (let i = 0; i < save.inventory.items.length; i++) {
    if (save.inventory.items[i] === null) {
      save.inventory.items[i] = {
        id: itemId,
        count: count,
        ...itemData
      };
      renderInventory();
      return true;
    }
  }
  
  // Инвентарь полон
  toast('Inventory is full!', 'warn');
  return false;
}

// ======= Удаление предмета из инвентаря =======
function removeItemFromInventory(slotIndex, count = 1) {
  if (!save || !save.inventory) return false;
  
  const item = save.inventory.items[slotIndex];
  if (!item) return false;
  
  if (item.count <= count) {
    save.inventory.items[slotIndex] = null;
  } else {
    item.count -= count;
  }
  
  renderInventory();
  return true;
}

// ======= Перемещение предмета =======
function moveInventoryItem(fromIndex, toIndex) {
  if (!save || !save.inventory) return false;
  
  const fromItem = save.inventory.items[fromIndex];
  const toItem = save.inventory.items[toIndex];
  
  // Простое перемещение
  save.inventory.items[fromIndex] = toItem;
  save.inventory.items[toIndex] = fromItem;
  
  renderInventory();
  return true;
}

// ======= Экипировка предмета в конкретный слот =======
function equipItemInSlot(slotIndex, targetSlot) {
  if (!save || !save.inventory) return false;
  
  const item = save.inventory.items[slotIndex];
  if (!item) return false;
  
  const itemData = getItemData(item.id);
  if (!itemData || !itemData.equipSlot) return false;
  
  // Проверяем что предмет можно экипировать в целевой слот
  if (targetSlot === 'weapon2' && itemData.weaponType !== 'dagger') {
    toast('Only daggers can be equipped in offhand slot!', 'warn');
    return false;
  }
  
  const equipSlot = targetSlot;
  
  // Проверка совместимости
  if (equipSlot === 'weapon2') {
    const mainWeapon = save.inventory.equipment.weapon;
    if (!mainWeapon || mainWeapon.weaponType !== 'dagger') {
      toast('Second dagger can only be equipped when first weapon is also a dagger!', 'warn');
      return false;
    }
    // Нельзя надеть кинжал во вторую руку если надет щит
    const currentShield = save.inventory.equipment.shield;
    if (currentShield) {
      toast('Cannot equip dagger in offhand when shield is equipped! Unequip shield first.', 'warn');
      return false;
    }
  }
  
  // Если слот уже занят, снимаем предмет
  if (save.inventory.equipment[equipSlot]) {
    const oldItem = save.inventory.equipment[equipSlot];
    if (!addItemToInventory(oldItem.id, oldItem.count || 1)) {
      toast('Cannot unequip: inventory full!', 'warn');
      return false;
    }
  }
  
  // Экипируем предмет
  save.inventory.equipment[equipSlot] = {
    id: item.id,
    count: item.count || 1,
    ...itemData
  };
  
  // Удаляем из инвентаря
  save.inventory.items[slotIndex] = null;
  
  // Обновляем кулдаун атаки
  if ((equipSlot === 'weapon' || equipSlot === 'weapon2') && typeof updatePlayerAttackCooldown === 'function') {
    updatePlayerAttackCooldown();
  }
  
  renderInventory();
  renderEquipment();
  toast(`Equipped ${itemData.name} in offhand!`, 'good');
  return true;
}

// ======= Экипировка предмета =======
function equipItem(slotIndex) {
  if (!save || !save.inventory) return false;
  
  const item = save.inventory.items[slotIndex];
  if (!item) return false;
  
  const itemData = getItemData(item.id);
  if (!itemData || !itemData.equipSlot) return false;
  
  const equipSlot = itemData.equipSlot;
  
  // Проверка совместимости оружия и щита
  if (equipSlot === 'weapon') {
    const currentShield = save.inventory.equipment.shield;
    if (currentShield && itemData.weaponType === 'twohanded') {
      toast('Cannot equip two-handed weapon with shield! Unequip shield first.', 'warn');
      return false;
    }
    // Одноручный меч нельзя надеть если уже есть оружие (кроме кинжала во втором слоте)
    if (itemData.weaponType === 'sword' && save.inventory.equipment.weapon && save.inventory.equipment.weapon.weaponType !== 'dagger') {
      toast('Cannot equip sword when another weapon is equipped!', 'warn');
      return false;
    }
    // Двуручный меч нельзя надеть если уже есть оружие
    if (itemData.weaponType === 'twohanded' && save.inventory.equipment.weapon) {
      toast('Cannot equip two-handed weapon when another weapon is equipped!', 'warn');
      return false;
    }
  }
  
  if (equipSlot === 'shield') {
    const currentWeapon = save.inventory.equipment.weapon;
    const currentWeapon2 = save.inventory.equipment.weapon2;
    if (currentWeapon && currentWeapon.weaponType === 'twohanded') {
      toast('Cannot equip shield with two-handed weapon! Unequip weapon first.', 'warn');
      return false;
    }
    // Нельзя надеть щит если во второй руке кинжал
    if (currentWeapon2 && currentWeapon2.weaponType === 'dagger') {
      toast('Cannot equip shield when dagger is in offhand! Unequip offhand weapon first.', 'warn');
      return false;
    }
  }
  
  // Если слот уже занят, снимаем предмет
  if (save.inventory.equipment[equipSlot]) {
    const oldItem = save.inventory.equipment[equipSlot];
    // Пытаемся вернуть в инвентарь
    if (!addItemToInventory(oldItem.id, oldItem.count || 1)) {
      toast('Cannot unequip: inventory full!', 'warn');
      return false;
    }
  }
  
  // Экипируем предмет
  save.inventory.equipment[equipSlot] = {
    id: item.id,
    count: item.count || 1,
    ...itemData
  };
  
  // Удаляем из инвентаря
  save.inventory.items[slotIndex] = null;
  
  // Обновляем кулдаун атаки если экипировали оружие
  if (equipSlot === 'weapon' && typeof updatePlayerAttackCooldown === 'function') {
    updatePlayerAttackCooldown();
  }
  
  renderInventory();
  renderEquipment();
  renderInventoryStats();
  toast(`Equipped ${itemData.name}!`, 'good');
  return true;
}

// ======= Снятие предмета =======
function unequipItem(equipSlot) {
  if (!save || !save.inventory) return false;
  
  const item = save.inventory.equipment[equipSlot];
  if (!item) return false;
  
  // Пытаемся добавить в инвентарь
  if (!addItemToInventory(item.id, item.count || 1)) {
    toast('Cannot unequip: inventory full!', 'warn');
    return false;
  }
  
  // Снимаем предмет
  save.inventory.equipment[equipSlot] = null;
  
  renderInventory();
  renderEquipment();
  renderInventoryStats();
  toast(`Unequipped ${item.name || 'item'}!`, 'info');
  return true;
}

// ======= Рендеринг инвентаря =======
function renderInventory() {
  const inventoryList = document.getElementById('inventory-list');
  if (!inventoryList) return;
  
  if (!save || !save.inventory) {
    initInventorySystem(save);
    if (!save || !save.inventory) return;
  }
  
  inventoryList.innerHTML = '';
  
  for (let i = 0; i < INVENTORY_SIZE; i++) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.dataset.slotIndex = i;
    
    const item = save.inventory.items[i];
    if (item) {
      const itemData = getItemData(item.id);
      if (itemData) {
        slot.classList.add('inventory-slot-filled');
        slot.innerHTML = `
          <div class="inventory-item-icon" style="background-color: ${itemData.rarityColor || '#888'}">${itemData.icon || '📦'}</div>
          <div class="inventory-item-name">${itemData.name || 'Unknown'}</div>
          ${item.count > 1 ? `<div class="inventory-item-count">${item.count}</div>` : ''}
        `;
        
        // Tooltip
        let tooltipText = `${itemData.name}\n${itemData.description || ''}`;
        if (itemData.equipSlot) {
          tooltipText += '\nRight-click to equip';
          // Для кинжалов добавляем возможность экипировать во второй слот
          if (itemData.weaponType === 'dagger') {
            tooltipText += '\nCtrl+Right-click to equip in offhand';
          }
        }
        if (itemData.type !== 'consumable') {
          tooltipText += '\nShift+Click to sell (1 Soul)';
        }
        // Обработчики событий
        slot.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          hideItemTooltip(); // Скрываем tooltip при клике
          if (itemData.equipSlot) {
            // Ctrl+Right-click для экипировки кинжала во второй слот
            if (e.ctrlKey && itemData.weaponType === 'dagger' && itemData.equipSlot === 'weapon') {
              equipItemInSlot(i, 'weapon2');
            } else {
              equipItem(i);
            }
          }
        });
        
        slot.addEventListener('mouseenter', (e) => {
          showItemTooltip(itemData, slot, e);
        });
        
        slot.addEventListener('mouseleave', () => {
          hideItemTooltip();
        });
        
        slot.addEventListener('mousemove', (e) => {
          if (currentTooltip) {
            updateTooltipPosition(currentTooltip, e);
          }
        });
        
        slot.addEventListener('click', (e) => {
          if (e.shiftKey && itemData.type !== 'consumable') {
            // Shift+Click для продажи
            hideItemTooltip(); // Скрываем tooltip при клике
            if (typeof sellItemToMerchant === 'function') {
              sellItemToMerchant(i);
            }
          }
        });
      }
    }
    
    inventoryList.appendChild(slot);
  }
}

// ======= Рендеринг экипировки =======
function renderEquipment() {
  if (!save || !save.inventory) return;
  
  const equipmentSlots = ['weapon', 'weapon2', 'shield', 'helmet', 'chest', 'legs', 'boots', 'ring', 'amulet'];
  
  equipmentSlots.forEach(slotName => {
    const slotEl = document.getElementById(`equipment-slot-${slotName}`);
    if (!slotEl) return;
    
    const item = save.inventory.equipment[slotName];
    if (item) {
      const itemData = getItemData(item.id);
      if (itemData) {
        slotEl.classList.add('equipment-slot-filled');
        slotEl.innerHTML = `
          <div class="equipment-item-icon" style="background-color: ${itemData.rarityColor || '#888'}">${itemData.icon || '📦'}</div>
          <div class="equipment-item-name">${itemData.name || 'Unknown'}</div>
        `;
        slotEl.addEventListener('mouseenter', (e) => {
          showItemTooltip(itemData, slotEl, e);
        });
        
        slotEl.addEventListener('mouseleave', () => {
          hideItemTooltip();
        });
        
        slotEl.addEventListener('mousemove', (e) => {
          if (currentTooltip) {
            updateTooltipPosition(currentTooltip, e);
          }
        });
        
        slotEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          hideItemTooltip();
          unequipItem(slotName);
        });
      }
    } else {
      slotEl.classList.remove('equipment-slot-filled');
      slotEl.innerHTML = `<div class="equipment-slot-label">${slotName}</div>`;
      slotEl.title = `Empty ${slotName} slot`;
    }
  });
}

// ======= Рендеринг статистики в инвентаре =======
function renderInventoryStats() {
  const statsContent = document.getElementById('inventory-stats-content');
  if (!statsContent) return;
  
  if (!save) {
    statsContent.innerHTML = '<div class="stat-item">No stats available</div>';
    return;
  }
  
  // Рассчитываем все параметры
  const stats = calculateBattleStats();
  
  let html = '';
  
  // HP
  html += `<div class="stat-item">
    <span class="stat-label">HP:</span>
    <span class="stat-value">${stats.hp}</span>
  </div>`;
  
  // Урон (мин-макс)
  html += `<div class="stat-item">
    <span class="stat-label">Damage:</span>
    <span class="stat-value">${stats.damageMin} - ${stats.damageMax}</span>
  </div>`;
  
  // Защита
  html += `<div class="stat-item">
    <span class="stat-label">Defense:</span>
    <span class="stat-value">${stats.defense}</span>
  </div>`;
  
  // Шанс крита
  html += `<div class="stat-item">
    <span class="stat-label">Critical Chance:</span>
    <span class="stat-value">${stats.critChance}%</span>
  </div>`;
  
  // Скорость атаки
  html += `<div class="stat-item">
    <span class="stat-label">Attack Speed:</span>
    <span class="stat-value">${stats.attackSpeed}s</span>
  </div>`;
  
  // Модификатор от щита
  if (stats.shieldModifier < 1.0) {
    const reduction = Math.round((1 - stats.shieldModifier) * 100);
    html += `<div class="stat-item stat-warning">
      <span class="stat-label">Shield Penalty:</span>
      <span class="stat-value">-${reduction}% damage</span>
    </div>`;
  }
  
  statsContent.innerHTML = html;
}

// ======= Расчет боевой статистики =======
function calculateBattleStats() {
  if (!save) {
    return {
      hp: 50,
      damageMin: 8,
      damageMax: 12,
      defense: 0,
      critChance: 0,
      attackSpeed: 1.0,
      shieldModifier: 1.0
    };
  }
  
  // HP - всегда показываем базовое значение
  let hp = 50; // Базовое HP
  if (save.player) {
    hp += (save.player.level || 1) * 5; // Бонус от уровня
  }
  
  // Бонус от экипировки
  if (typeof getEquipmentHPBonus === 'function') {
    hp += getEquipmentHPBonus();
  }
  
  // Базовый урон
  const baseDamage = 10;
  const clickLevelBonus = (save.click ? save.click.level || 0 : 0) * 0.1;
  const playerLevelBonus = (save.player ? (save.player.level || 1) : 1) * 0.2;
  
  // Бонус от экипировки
  let equipmentBonus = 0;
  if (typeof getEquipmentDamageBonus === 'function') {
    equipmentBonus = getEquipmentDamageBonus();
  }
  
  // Бонус от бафов
  let buffMult = 1.0;
  if (save.modifiers && save.modifiers.soulBuffDamageMult) {
    buffMult = save.modifiers.soulBuffDamageMult;
  }
  
  // Урон без случайной вариации
  const baseDamageTotal = baseDamage + clickLevelBonus + playerLevelBonus + equipmentBonus;
  const damageWithBuff = baseDamageTotal * buffMult;
  
  // Модификатор от щита
  let shieldModifier = 1.0;
  if (typeof getShieldDamageModifier === 'function') {
    shieldModifier = getShieldDamageModifier();
  }
  
  const damageAfterShield = damageWithBuff * shieldModifier;
  
  // Минимальный и максимальный урон (с учетом случайной вариации ±2.5)
  const damageMin = Math.max(3, Math.floor(damageAfterShield - 2.5));
  const damageMax = Math.floor(damageAfterShield + 2.5);
  
  // Защита - всегда показываем базовое значение
  let defense = 0;
  
  // Базовый бонус от уровня игрока (очень маленький: 0.15 за уровень)
  if (save.player && save.player.level) {
    defense += (save.player.level - 1) * 0.15; // Начиная со 2 уровня
  }
  
  // Бонус от экипировки и бафов
  if (typeof getPlayerDefense === 'function') {
    defense += getPlayerDefense();
  }
  
  // Шанс крита
  let critChance = 0;
  
  // Базовый бонус от уровня игрока (очень маленький: 0.05% за уровень)
  if (save.player && save.player.level) {
    critChance += (save.player.level - 1) * 0.05; // Начиная со 2 уровня
  }
  
  // Бонус от бафов
  if (save.buffs) {
    const currentTime = typeof now === 'function' ? now() : Date.now();
    for (const buffId in save.buffs) {
      const buff = save.buffs[buffId];
      if (buff.endTime > currentTime && buff.effect && buff.effect.type === 'crit_chance') {
        critChance += (buff.effect.value || 0) * 100; // Конвертируем в проценты
      }
    }
  }
  
  // Скорость атаки (кулдаун) - базовое значение 1.0 если нет оружия
  let attackSpeed = 1.0;
  if (save && save.inventory && save.inventory.equipment) {
    const weapon = save.inventory.equipment.weapon;
    if (weapon) {
      const weaponType = weapon.weaponType || 'sword';
      switch (weaponType) {
        case 'dagger':
          attackSpeed = 0.5;
          break;
        case 'sword':
          attackSpeed = 1.0;
          break;
        case 'twohanded':
          attackSpeed = 2.0;
          break;
        default:
          attackSpeed = 1.0;
      }
    }
  }
  
  return {
    hp: Math.floor(hp),
    damageMin: damageMin,
    damageMax: damageMax,
    defense: defense,
    critChance: critChance.toFixed(1),
    attackSpeed: attackSpeed.toFixed(1),
    shieldModifier: shieldModifier
  };
}

// ======= Показ подсказки предмета =======
let currentTooltip = null;

function showItemTooltip(itemData, element, event) {
  if (!itemData) return;
  
  // Удаляем предыдущий tooltip
  hideItemTooltip();
  
  // Создаем tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'item-tooltip';
  tooltip.id = 'item-tooltip';
  
  let html = '';
  
  // Название с цветом редкости
  html += `<div class="tooltip-header" style="color: ${itemData.rarityColor || '#9d9d9d'}">
    <span class="tooltip-icon">${itemData.icon || '📦'}</span>
    <span class="tooltip-name">${itemData.name}</span>
  </div>`;
  
  // Редкость
  html += `<div class="tooltip-rarity">${itemData.rarity ? itemData.rarity.charAt(0).toUpperCase() + itemData.rarity.slice(1) : 'Common'}</div>`;
  
  // Описание
  if (itemData.description) {
    html += `<div class="tooltip-description">${itemData.description}</div>`;
  }
  
  // Разделитель
  html += `<div class="tooltip-divider"></div>`;
  
  // Характеристики
  html += `<div class="tooltip-stats">`;
  
  if (itemData.damage) {
    html += `<div class="tooltip-stat">
      <span class="tooltip-stat-label">Damage:</span>
      <span class="tooltip-stat-value" style="color: #ff5555">+${itemData.damage}</span>
    </div>`;
  }
  
  if (itemData.defense) {
    html += `<div class="tooltip-stat">
      <span class="tooltip-stat-label">Defense:</span>
      <span class="tooltip-stat-value" style="color: #4ecdc4">+${itemData.defense}</span>
    </div>`;
  }
  
  if (itemData.hpBonus) {
    html += `<div class="tooltip-stat">
      <span class="tooltip-stat-label">HP Bonus:</span>
      <span class="tooltip-stat-value" style="color: #95e1d3">+${itemData.hpBonus}</span>
    </div>`;
  }
  
  // Тип оружия
  if (itemData.weaponType) {
    let weaponTypeText = '';
    switch (itemData.weaponType) {
      case 'dagger':
        weaponTypeText = 'Dagger - Fast attacks (0.5s)';
        break;
      case 'sword':
        weaponTypeText = 'One-handed Sword - Standard (1s)';
        break;
      case 'twohanded':
        weaponTypeText = 'Two-handed Sword - Slow (2s)';
        break;
    }
    if (weaponTypeText) {
      html += `<div class="tooltip-stat">
        <span class="tooltip-stat-label">Type:</span>
        <span class="tooltip-stat-value">${weaponTypeText}</span>
      </div>`;
    }
  }
  
  // Щит
  if (itemData.equipSlot === 'shield') {
    html += `<div class="tooltip-stat">
      <span class="tooltip-stat-label">Effect:</span>
      <span class="tooltip-stat-value" style="color: #ffaa44">-50% incoming damage</span>
    </div>`;
  }
  
  html += `</div>`;
  
  // Разделитель
  html += `<div class="tooltip-divider"></div>`;
  
  // Подсказки
  html += `<div class="tooltip-footer">`;
  if (itemData.equipSlot) {
    html += `<div class="tooltip-hint">Right-click to ${itemData.equipSlot === 'weapon' && itemData.weaponType === 'dagger' ? 'equip (Ctrl+Right-click for offhand)' : 'equip'}</div>`;
  }
  if (itemData.type !== 'consumable') {
    html += `<div class="tooltip-hint">Shift+Click to sell (1 Soul)</div>`;
  }
  html += `</div>`;
  
  tooltip.innerHTML = html;
  document.body.appendChild(tooltip);
  currentTooltip = tooltip;
  
  // Позиционируем tooltip
  updateTooltipPosition(tooltip, event);
  
  // Обновляем позицию при движении мыши
  const updatePosition = (e) => {
    updateTooltipPosition(tooltip, e);
  };
  
  element.addEventListener('mousemove', updatePosition);
  element.addEventListener('mouseleave', () => {
    element.removeEventListener('mousemove', updatePosition);
    hideItemTooltip();
  });
}

function updateTooltipPosition(tooltip, event) {
  if (!tooltip || !event) return;
  
  const rect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left = event.clientX + 15;
  let top = event.clientY + 15;
  
  // Проверяем границы экрана
  if (left + rect.width > viewportWidth) {
    left = event.clientX - rect.width - 15;
  }
  if (top + rect.height > viewportHeight) {
    top = event.clientY - rect.height - 15;
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideItemTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

// ======= Открытие/закрытие инвентаря =======
function toggleInventory() {
  const inventoryModal = document.getElementById('inventory-modal');
  if (!inventoryModal) return;
  
  if (inventoryModal.classList.contains('hidden')) {
    openInventoryModal();
  } else {
    closeInventoryModal();
  }
}

function openInventoryModal() {
  const inventoryModal = document.getElementById('inventory-modal');
  if (inventoryModal) {
    // Закрываем магазин если открыт
    const merchantModal = document.getElementById('merchant-modal');
    if (merchantModal && !merchantModal.classList.contains('hidden')) {
      if (typeof closeMerchantModal === 'function') {
        closeMerchantModal();
      }
    }
    
    inventoryModal.classList.remove('hidden');
    inventoryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    renderInventory();
    renderEquipment();
    renderInventoryStats();
    
    // Закрытие по клику на overlay
    inventoryModal.addEventListener('click', closeInventoryOnOverlayClick);
    
    // Закрытие по Escape
    document.addEventListener('keydown', closeInventoryOnEscape);
  }
}

function closeInventoryOnOverlayClick(e) {
  const inventoryModal = document.getElementById('inventory-modal');
  const inventoryCard = inventoryModal ? inventoryModal.querySelector('.inventory-modal-card') : null;
  // Закрываем только если клик был на overlay, а не на содержимое модалки
  if (inventoryModal && e.target === inventoryModal && !inventoryCard?.contains(e.target)) {
    closeInventoryModal();
  }
}

function closeInventoryOnEscape(e) {
  if (e.key === 'Escape') {
    const inventoryModal = document.getElementById('inventory-modal');
    if (inventoryModal && !inventoryModal.classList.contains('hidden')) {
      closeInventoryModal();
    }
  }
}

function closeInventoryModal() {
  const inventoryModal = document.getElementById('inventory-modal');
  if (inventoryModal) {
    inventoryModal.classList.add('hidden');
    inventoryModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    
    // Удаляем обработчики
    inventoryModal.removeEventListener('click', closeInventoryOnOverlayClick);
    document.removeEventListener('keydown', closeInventoryOnEscape);
  }
}

// ======= Инициализация UI =======
function initInventoryUI() {
  const inventoryBtn = document.getElementById('inventory-btn');
  if (inventoryBtn) {
    inventoryBtn.addEventListener('click', toggleInventory);
  }
  
  const inventoryCloseBtn = document.getElementById('inventory-close');
  if (inventoryCloseBtn) {
    inventoryCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Предотвращаем закрытие при клике на кнопку
      closeInventoryModal();
    });
  }
  
  // Инициализация при загрузке
  if (save && save.inventory) {
    renderInventory();
    renderEquipment();
  }
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initInventoryUI, 200);
  });
} else {
  setTimeout(initInventoryUI, 200);
}

