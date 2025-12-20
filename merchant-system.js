/* ======= Merchant System =======
 * Система торговца с предметами и бафами
 * Версия: 1.0
 */

// ======= Порядок редкости для разблокировки =======
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ======= База данных предметов =======
const ITEMS_DATABASE = {
  // Оружие - Кинжалы (быстрые, меньше урон)
  'dagger_rusty': {
    id: 'dagger_rusty',
    name: 'Rusty Dagger',
    description: 'Dagger - Fast attacks (0.5s), less damage',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'dagger',
    icon: '🗡️',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    damage: 5,
    price: { souls: 8, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null // Первый уровень - без требований
  },
  'dagger_iron': {
    id: 'dagger_iron',
    name: 'Iron Dagger',
    description: 'Dagger - Fast attacks (0.5s), less damage',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'dagger',
    icon: '🗡️',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    damage: 12,
    price: { souls: 25, treasury: 150, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common' // Требует покупки common предмета
  },
  'dagger_steel': {
    id: 'dagger_steel',
    name: 'Steel Dagger',
    description: 'Dagger - Fast attacks (0.5s), less damage',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'dagger',
    icon: '🗡️',
    rarity: 'rare',
    rarityColor: '#0070dd',
    damage: 25,
    price: { souls: 60, treasury: 400, pointsPercent: 2 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  'dagger_legendary': {
    id: 'dagger_legendary',
    name: 'Assassin\'s Blade',
    description: 'Dagger - Fast attacks (0.5s), less damage',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'dagger',
    icon: '🗡️',
    rarity: 'legendary',
    rarityColor: '#ff8000',
    damage: 50,
    price: { souls: 150, treasury: 1000, pointsPercent: 8 },
    stackable: false,
    unlockRequirement: 'rare'
  },
  
  // Оружие - Одноручные мечи (стандарт)
  'sword_basic': {
    id: 'sword_basic',
    name: 'Basic Sword',
    description: 'One-handed Sword - Standard attacks (1s), balanced',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'sword',
    icon: '⚔️',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    damage: 10,
    price: { souls: 10, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null
  },
  'sword_steel': {
    id: 'sword_steel',
    name: 'Steel Sword',
    description: 'One-handed Sword - Standard attacks (1s), balanced',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'sword',
    icon: '⚔️',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    damage: 20,
    price: { souls: 30, treasury: 200, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'sword_silver': {
    id: 'sword_silver',
    name: 'Silver Sword',
    description: 'One-handed Sword - Standard attacks (1s), balanced',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'sword',
    icon: '⚔️',
    rarity: 'rare',
    rarityColor: '#0070dd',
    damage: 40,
    price: { souls: 80, treasury: 600, pointsPercent: 3 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  'sword_legendary': {
    id: 'sword_legendary',
    name: 'Legendary Blade',
    description: 'One-handed Sword - Standard attacks (1s), balanced',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'sword',
    icon: '⚔️',
    rarity: 'legendary',
    rarityColor: '#ff8000',
    damage: 80,
    price: { souls: 200, treasury: 1000, pointsPercent: 10 },
    stackable: false,
    unlockRequirement: 'rare'
  },
  
  // Оружие - Двуручные мечи (медленные, больше урон)
  'greatsword_iron': {
    id: 'greatsword_iron',
    name: 'Iron Greatsword',
    description: 'Two-handed Sword - Slow attacks (2s), high damage. Cannot use shield.',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'twohanded',
    icon: '🗡️',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    damage: 35,
    price: { souls: 40, treasury: 300, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'greatsword_steel': {
    id: 'greatsword_steel',
    name: 'Steel Greatsword',
    description: 'Two-handed Sword - Slow attacks (2s), high damage. Cannot use shield.',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'twohanded',
    icon: '🗡️',
    rarity: 'rare',
    rarityColor: '#0070dd',
    damage: 70,
    price: { souls: 100, treasury: 800, pointsPercent: 4 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  'greatsword_legendary': {
    id: 'greatsword_legendary',
    name: 'Dragonslayer',
    description: 'Two-handed Sword - Slow attacks (2s), high damage. Cannot use shield.',
    type: 'weapon',
    equipSlot: 'weapon',
    weaponType: 'twohanded',
    icon: '🗡️',
    rarity: 'legendary',
    rarityColor: '#ff8000',
    damage: 150,
    price: { souls: 250, treasury: 1000, pointsPercent: 12 },
    stackable: false,
    unlockRequirement: 'rare'
  },
  
  // Щиты
  'shield_wooden': {
    id: 'shield_wooden',
    name: 'Wooden Shield',
    description: 'Shield - Reduces incoming damage by 50%',
    type: 'armor',
    equipSlot: 'shield',
    icon: '🛡️',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    defense: 10,
    price: { souls: 8, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null
  },
  'shield_iron': {
    id: 'shield_iron',
    name: 'Iron Shield',
    description: 'Shield - Reduces incoming damage by 50%',
    type: 'armor',
    equipSlot: 'shield',
    icon: '🛡️',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    defense: 25,
    price: { souls: 25, treasury: 180, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'shield_steel': {
    id: 'shield_steel',
    name: 'Steel Shield',
    description: 'Shield - Reduces incoming damage by 50%',
    type: 'armor',
    equipSlot: 'shield',
    icon: '🛡️',
    rarity: 'rare',
    rarityColor: '#0070dd',
    defense: 50,
    price: { souls: 70, treasury: 500, pointsPercent: 2 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  'shield_legendary': {
    id: 'shield_legendary',
    name: 'Aegis',
    description: 'Shield - Reduces incoming damage by 50%',
    type: 'armor',
    equipSlot: 'shield',
    icon: '🛡️',
    rarity: 'legendary',
    rarityColor: '#ff8000',
    defense: 100,
    price: { souls: 180, treasury: 1000, pointsPercent: 8 },
    stackable: false,
    unlockRequirement: 'rare'
  },
  
  // Броня - Шлем
  'helmet_leather': {
    id: 'helmet_leather',
    name: 'Leather Helmet',
    description: 'Basic protection for your head',
    type: 'armor',
    equipSlot: 'helmet',
    icon: '🪖',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    defense: 5,
    price: { souls: 3, treasury: 0, pointsPercent: 0 },
    stackable: false
  },
  'helmet_iron': {
    id: 'helmet_iron',
    name: 'Iron Helmet',
    description: 'Sturdy iron protection',
    type: 'armor',
    equipSlot: 'helmet',
    icon: '🪖',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    defense: 15,
    price: { souls: 12, treasury: 80, pointsPercent: 0 },
    stackable: false
  },
  
  // Броня - Нагрудник
  'chest_leather': {
    id: 'chest_leather',
    name: 'Leather Armor',
    description: 'Basic chest protection',
    type: 'armor',
    equipSlot: 'chest',
    icon: '🛡️',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    defense: 10,
    price: { souls: 10, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null
  },
  'chest_iron': {
    id: 'chest_iron',
    name: 'Iron Armor',
    description: 'Sturdy iron protection',
    type: 'armor',
    equipSlot: 'chest',
    icon: '🛡️',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    defense: 25,
    price: { souls: 30, treasury: 250, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'chest_plate': {
    id: 'chest_plate',
    name: 'Plate Armor',
    description: 'Heavy plate protection',
    type: 'armor',
    equipSlot: 'chest',
    icon: '🛡️',
    rarity: 'rare',
    rarityColor: '#0070dd',
    defense: 50,
    price: { souls: 70, treasury: 600, pointsPercent: 3 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  'chest_legendary': {
    id: 'chest_legendary',
    name: 'Dragon Scale Armor',
    description: 'Legendary chest protection',
    type: 'armor',
    equipSlot: 'chest',
    icon: '🛡️',
    rarity: 'legendary',
    rarityColor: '#ff8000',
    defense: 100,
    price: { souls: 150, treasury: 1000, pointsPercent: 10 },
    stackable: false,
    unlockRequirement: 'rare'
  },
  
  // Броня - Поножи
  'legs_leather': {
    id: 'legs_leather',
    name: 'Leather Leggings',
    description: 'Basic leg protection',
    type: 'armor',
    equipSlot: 'legs',
    icon: '👖',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    defense: 8,
    price: { souls: 8, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null
  },
  'legs_iron': {
    id: 'legs_iron',
    name: 'Iron Leggings',
    description: 'Sturdy leg protection',
    type: 'armor',
    equipSlot: 'legs',
    icon: '👖',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    defense: 20,
    price: { souls: 25, treasury: 200, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'legs_steel': {
    id: 'legs_steel',
    name: 'Steel Leggings',
    description: 'Heavy leg protection',
    type: 'armor',
    equipSlot: 'legs',
    icon: '👖',
    rarity: 'rare',
    rarityColor: '#0070dd',
    defense: 40,
    price: { souls: 60, treasury: 500, pointsPercent: 2 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  
  // Броня - Сапоги
  'boots_leather': {
    id: 'boots_leather',
    name: 'Leather Boots',
    description: 'Basic foot protection',
    type: 'armor',
    equipSlot: 'boots',
    icon: '👢',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    defense: 5,
    price: { souls: 6, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null
  },
  'boots_iron': {
    id: 'boots_iron',
    name: 'Iron Boots',
    description: 'Sturdy foot protection',
    type: 'armor',
    equipSlot: 'boots',
    icon: '👢',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    defense: 15,
    price: { souls: 20, treasury: 150, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'boots_steel': {
    id: 'boots_steel',
    name: 'Steel Boots',
    description: 'Heavy foot protection',
    type: 'armor',
    equipSlot: 'boots',
    icon: '👢',
    rarity: 'rare',
    rarityColor: '#0070dd',
    defense: 30,
    price: { souls: 50, treasury: 400, pointsPercent: 2 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  
  // Аксессуары - Кольцо
  'ring_iron': {
    id: 'ring_iron',
    name: 'Iron Ring',
    description: 'Increases damage',
    type: 'accessory',
    equipSlot: 'ring',
    icon: '💍',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    damage: 3,
    price: { souls: 8, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null
  },
  'ring_power': {
    id: 'ring_power',
    name: 'Ring of Power',
    description: 'Increases damage',
    type: 'accessory',
    equipSlot: 'ring',
    icon: '💍',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    damage: 8,
    price: { souls: 25, treasury: 180, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'ring_legendary': {
    id: 'ring_legendary',
    name: 'Ring of the Ancients',
    description: 'Greatly increases damage',
    type: 'accessory',
    equipSlot: 'ring',
    icon: '💍',
    rarity: 'rare',
    rarityColor: '#0070dd',
    damage: 20,
    price: { souls: 80, treasury: 700, pointsPercent: 3 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  
  // Аксессуары - Амулет
  'amulet_basic': {
    id: 'amulet_basic',
    name: 'Basic Amulet',
    description: 'Increases defense',
    type: 'accessory',
    equipSlot: 'amulet',
    icon: '🔮',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    defense: 5,
    price: { souls: 8, treasury: 0, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: null
  },
  'amulet_protection': {
    id: 'amulet_protection',
    name: 'Amulet of Protection',
    description: 'Increases defense',
    type: 'accessory',
    equipSlot: 'amulet',
    icon: '🔮',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    defense: 15,
    price: { souls: 25, treasury: 200, pointsPercent: 0 },
    stackable: false,
    unlockRequirement: 'common'
  },
  'amulet_legendary': {
    id: 'amulet_legendary',
    name: 'Amulet of the Guardian',
    description: 'Greatly increases defense',
    type: 'accessory',
    equipSlot: 'amulet',
    icon: '🔮',
    rarity: 'rare',
    rarityColor: '#0070dd',
    defense: 40,
    price: { souls: 80, treasury: 800, pointsPercent: 3 },
    stackable: false,
    unlockRequirement: 'uncommon'
  },
  
  // Расходуемые предметы
  'potion_heal': {
    id: 'potion_heal',
    name: 'Healing Potion',
    description: 'Restores 50 HP in battle',
    type: 'consumable',
    icon: '🧪',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    effect: 'heal',
    effectValue: 50,
    price: { souls: 3, treasury: 0, pointsPercent: 0 },
    stackable: true,
    unlockRequirement: null
  },
  'potion_heal_greater': {
    id: 'potion_heal_greater',
    name: 'Greater Healing Potion',
    description: 'Restores 150 HP in battle',
    type: 'consumable',
    icon: '🧪',
    rarity: 'uncommon',
    rarityColor: '#1eff00',
    effect: 'heal',
    effectValue: 150,
    price: { souls: 10, treasury: 50, pointsPercent: 0 },
    stackable: true,
    unlockRequirement: 'common'
  },
  'potion_mana': {
    id: 'potion_mana',
    name: 'Mana Potion',
    description: 'Restores energy',
    type: 'consumable',
    icon: '🧪',
    rarity: 'common',
    rarityColor: '#9d9d9d',
    effect: 'mana',
    effectValue: 30,
    price: { souls: 3, treasury: 0, pointsPercent: 0 },
    stackable: true,
    unlockRequirement: null
  }
};

// ======= Бафы за души =======
const SOUL_BUFFS = {
  'buff_damage_30min': {
    id: 'buff_damage_30min',
    name: 'Damage Boost',
    description: '+20% damage for 30 minutes',
    icon: '⚔️',
    cost: 15,
    duration: 1800000, // 30 минут
    effect: {
      type: 'damage_mult',
      value: 1.2
    }
  },
  'buff_defense_20min': {
    id: 'buff_defense_20min',
    name: 'Defense Boost',
    description: '+15% defense for 20 minutes',
    icon: '🛡️',
    cost: 12,
    duration: 1200000, // 20 минут
    effect: {
      type: 'defense_mult',
      value: 1.15
    }
  },
  'buff_hp_regen_15min': {
    id: 'buff_hp_regen_15min',
    name: 'HP Regeneration',
    description: '+5% HP regeneration per minute for 15 minutes',
    icon: '❤️',
    cost: 10,
    duration: 900000, // 15 минут
    effect: {
      type: 'hp_regen',
      value: 0.05
    }
  },
  'buff_crit_chance_25min': {
    id: 'buff_crit_chance_25min',
    name: 'Critical Strike',
    description: '+10% critical strike chance for 25 minutes',
    icon: '💥',
    cost: 18,
    duration: 1500000, // 25 минут
    effect: {
      type: 'crit_chance',
      value: 0.10
    }
  },
  'buff_souls_bonus_60min': {
    id: 'buff_souls_bonus_60min',
    name: 'Soul Collector',
    description: '+25% souls from battles for 60 minutes',
    icon: '👻',
    cost: 25,
    duration: 3600000, // 60 минут
    effect: {
      type: 'souls_mult',
      value: 1.25
    }
  }
};

// ======= Получение данных предмета =======
function getItemData(itemId) {
  return ITEMS_DATABASE[itemId] || null;
}

// ======= Получение всех предметов =======
function getAllItems() {
  return Object.values(ITEMS_DATABASE);
}

// ======= Получение всех бафов =======
function getAllBuffs() {
  return Object.values(SOUL_BUFFS);
}

// ======= Проверка разблокировки предмета =======
function isItemUnlocked(itemData) {
  if (!itemData || !itemData.unlockRequirement) return true; // Нет требований - разблокирован
  
  if (!save || !save.inventory) return false;
  
  // Проверяем, есть ли в инвентаре или экипировке предмет нужной редкости
  const requiredRarity = itemData.unlockRequirement;
  
  // Проверяем инвентарь (slots)
  if (save.inventory.slots) {
    for (let slot of save.inventory.slots) {
      if (slot && slot.rarity === requiredRarity) {
        return true;
      }
    }
  }
  
  // Проверяем экипировку
  if (save.inventory.equipment) {
    for (let slot in save.inventory.equipment) {
      const item = save.inventory.equipment[slot];
      if (item && item.rarity === requiredRarity) {
        return true;
      }
    }
  }
  
  // Также проверяем старую структуру (items) для совместимости
  if (save.inventory.items) {
    for (let item of save.inventory.items) {
      if (item && item.rarity === requiredRarity) {
        return true;
      }
    }
  }
  
  return false;
}

// ======= Покупка предмета =======
function buyItem(itemId) {
  if (!save) return false;
  
  const itemData = getItemData(itemId);
  if (!itemData) return false;
  
  // Проверяем разблокировку
  if (!isItemUnlocked(itemData)) {
    const requiredRarity = itemData.unlockRequirement;
    toast(`You need to own a ${requiredRarity} item first!`, 'warn');
    return false;
  }
  
  const price = itemData.price;
  let canAfford = true;
  
  // Проверяем души
  if (price.souls > 0) {
    if (typeof getSouls !== 'function' || getSouls() < price.souls) {
      canAfford = false;
    }
  }
  
  // Проверяем treasury
  if (price.treasury > 0) {
    if (!save.treasury || save.treasury.value < price.treasury) {
      canAfford = false;
    }
  }
  
  // Проверяем points (процент)
  if (price.pointsPercent > 0) {
    const pointsCost = (save.points || 0) * (price.pointsPercent / 100);
    if (pointsCost > (save.points || 0)) {
      canAfford = false;
    }
  }
  
  if (!canAfford) {
    toast('Cannot afford this item!', 'warn');
    return false;
  }
  
  // Платим
  if (price.souls > 0 && typeof spendSouls === 'function') {
    if (!spendSouls(price.souls)) {
      toast('Not enough souls!', 'warn');
      return false;
    }
  }
  
  if (price.treasury > 0) {
    if (save.treasury) {
      save.treasury.value = Math.max(0, save.treasury.value - price.treasury);
    }
  }
  
  if (price.pointsPercent > 0) {
    const pointsCost = (save.points || 0) * (price.pointsPercent / 100);
    save.points = Math.max(0, (save.points || 0) - pointsCost);
  }
  
  // Добавляем предмет в инвентарь
  if (typeof addItemToInventory === 'function') {
    if (addItemToInventory(itemId, 1)) {
      toast(`Purchased ${itemData.name}!`, 'good');
      renderMerchant();
      if (typeof renderAll === 'function') {
        renderAll();
      }
      return true;
    }
  }
  
  return false;
}

// ======= Продажа предмета торговцу =======
function sellItemToMerchant(slotIndex) {
  if (!save || !save.inventory) return false;
  
  const item = save.inventory.items[slotIndex];
  if (!item) return false;
  
  const itemData = getItemData(item.id);
  if (!itemData) return false;
  
  // Цена любого предмета - 1 душа
  const sellPrice = 1;
  
  // Удаляем предмет из инвентаря
  if (item.count > 1) {
    item.count -= 1;
  } else {
    save.inventory.items[slotIndex] = null;
  }
  
  // Даем награду
  if (typeof addSouls === 'function') {
    addSouls(sellPrice, 'item_sale');
  }
  
  // Обновляем UI
  if (typeof renderInventory === 'function') {
    renderInventory();
  }
  if (typeof renderMerchant === 'function') {
    renderMerchant();
  }
  if (typeof renderAll === 'function') {
    renderAll();
  }
  
  toast(`Sold ${itemData.name} for ${sellPrice} Soul!`, 'good');
  return true;
}

// ======= Покупка бафа =======
function buyBuff(buffId) {
  if (!save) return false;
  
  const buffData = SOUL_BUFFS[buffId];
  if (!buffData) return false;
  
  // Проверяем души
  if (typeof getSouls !== 'function' || getSouls() < buffData.cost) {
    toast('Not enough souls!', 'warn');
    return false;
  }
  
  // Платим
  if (typeof spendSouls === 'function') {
    if (!spendSouls(buffData.cost)) {
      return false;
    }
  }
  
  // Применяем баф
  applyBuff(buffData);
  
  toast(`Activated ${buffData.name}!`, 'good');
  renderMerchant();
  return true;
}

// ======= Применение бафа =======
function applyBuff(buffData) {
  if (!save) return false;
  
  // Инициализируем систему бафов если нужно
  if (!save.buffs) {
    save.buffs = {};
  }
  
  const currentTime = typeof now === 'function' ? now() : Date.now();
  const endTime = currentTime + buffData.duration;
  
  // Сохраняем баф
  save.buffs[buffData.id] = {
    endTime: endTime,
    effect: buffData.effect
  };
  
  // Обновляем модификаторы
  updateBuffModifiers();
}

// ======= Обновление модификаторов бафов =======
function updateBuffModifiers() {
  if (!save || !save.buffs) return;
  
  const t = typeof now === 'function' ? now() : Date.now();
  let damageMult = 1.0;
  let defenseMult = 1.0;
  let soulsMult = 1.0;
  
  // Проверяем активные бафы
  Object.keys(save.buffs).forEach(buffId => {
    const buff = save.buffs[buffId];
    if (buff.endTime > t) {
      const effect = buff.effect;
      if (effect.type === 'damage_mult') {
        damageMult *= effect.value;
      } else if (effect.type === 'defense_mult') {
        defenseMult *= effect.value;
      } else if (effect.type === 'souls_mult') {
        soulsMult *= effect.value;
      }
    } else {
      // Баф истек
      delete save.buffs[buffId];
    }
  });
  
  // Сохраняем в модификаторах (если нужно)
  if (!save.modifiers) save.modifiers = {};
  save.modifiers.soulBuffDamageMult = damageMult;
  save.modifiers.soulBuffDefenseMult = defenseMult;
  save.modifiers.soulBuffSoulsMult = soulsMult;
}

// ======= Рендеринг торговца =======
function renderMerchant() {
  const merchantItemsList = document.getElementById('merchant-items-list');
  const merchantBuffsList = document.getElementById('merchant-buffs-list');
  
  if (merchantItemsList) {
    merchantItemsList.innerHTML = '';
    
    const items = getAllItems();
    items.forEach(item => {
      const itemEl = document.createElement('div');
      const isUnlocked = isItemUnlocked(item);
      
      // Добавляем класс для заблокированных предметов
      if (!isUnlocked) {
        itemEl.className = 'merchant-item merchant-item-locked';
      } else {
        itemEl.className = 'merchant-item';
      }
      
      const priceText = [];
      if (item.price.souls > 0) priceText.push(`${item.price.souls} Souls`);
      if (item.price.treasury > 0) priceText.push(`${item.price.treasury} Treasury`);
      if (item.price.pointsPercent > 0) priceText.push(`${item.price.pointsPercent}% Points`);
      
      // Определяем требование для разблокировки
      let unlockText = '';
      if (!isUnlocked && item.unlockRequirement) {
        const requiredRarity = item.unlockRequirement.charAt(0).toUpperCase() + item.unlockRequirement.slice(1);
        unlockText = `<div class="merchant-item-locked-text">Requires: ${requiredRarity} item</div>`;
      }
      
      itemEl.innerHTML = `
        <div class="merchant-item-icon" style="background-color: ${item.rarityColor || '#888'}">${item.icon || '📦'}</div>
        <div class="merchant-item-info">
          <div class="merchant-item-name">${item.name}</div>
          <div class="merchant-item-description">${item.description}</div>
          ${item.damage ? `<div class="merchant-item-stat">Damage: +${item.damage}</div>` : ''}
          ${item.defense ? `<div class="merchant-item-stat">Defense: +${item.defense}</div>` : ''}
          ${item.hpBonus ? `<div class="merchant-item-stat">HP: +${item.hpBonus}</div>` : ''}
          <div class="merchant-item-price">${priceText.join(' + ')}</div>
          ${unlockText}
        </div>
        <button class="btn small merchant-buy-btn" data-item-id="${item.id}" ${!isUnlocked ? 'disabled' : ''}>
          ${!isUnlocked ? 'Locked' : 'Buy'}
        </button>
      `;
      
      const buyBtn = itemEl.querySelector('.merchant-buy-btn');
      if (isUnlocked) {
        buyBtn.addEventListener('click', () => {
          buyItem(item.id);
        });
      } else {
        buyBtn.addEventListener('click', () => {
          const requiredRarity = item.unlockRequirement;
          toast(`You need to own a ${requiredRarity} item first!`, 'warn');
        });
      }
      
      merchantItemsList.appendChild(itemEl);
    });
  }
  
  if (merchantBuffsList) {
    merchantBuffsList.innerHTML = '';
    
    const buffs = getAllBuffs();
    buffs.forEach(buff => {
      const buffEl = document.createElement('div');
      buffEl.className = 'merchant-buff';
      
      // Проверяем активен ли баф
      const currentTime = typeof now === 'function' ? now() : Date.now();
      const isActive = save && save.buffs && save.buffs[buff.id] && save.buffs[buff.id].endTime > currentTime;
      const timeLeft = isActive ? Math.ceil((save.buffs[buff.id].endTime - now()) / 1000 / 60) : 0;
      
      buffEl.innerHTML = `
        <div class="merchant-buff-icon">${buff.icon}</div>
        <div class="merchant-buff-info">
          <div class="merchant-buff-name">${buff.name}</div>
          <div class="merchant-buff-description">${buff.description}</div>
          ${isActive ? `<div class="merchant-buff-active">Active: ${timeLeft} min left</div>` : ''}
        </div>
        <button class="btn small merchant-buy-btn" data-buff-id="${buff.id}" ${isActive ? 'disabled' : ''}>
          ${isActive ? 'Active' : `Buy (${buff.cost} Souls)`}
        </button>
      `;
      
      if (!isActive) {
        const buyBtn = buffEl.querySelector('.merchant-buy-btn');
        buyBtn.addEventListener('click', () => {
          buyBuff(buff.id);
        });
      }
      
      merchantBuffsList.appendChild(buffEl);
    });
  }
}

// Защита от двойного вызова toggleMerchant
let _merchantToggleLock = false;

// ======= Открытие/закрытие торговца =======
function toggleMerchant() {
  // Защита от двойного вызова
  if (_merchantToggleLock) {
    return;
  }
  
  _merchantToggleLock = true;
  
  const merchantModal = document.getElementById('merchant-modal');
  if (!merchantModal) {
    _merchantToggleLock = false;
    return;
  }
  
  const hasHiddenClass = merchantModal.classList.contains('hidden');
  const ariaHidden = merchantModal.getAttribute('aria-hidden');
  const computedStyle = window.getComputedStyle(merchantModal);
  
  // Проверяем, видно ли модальное окно
  const isVisible = computedStyle.display !== 'none' && 
                    computedStyle.visibility !== 'hidden' && 
                    computedStyle.opacity !== '0' &&
                    computedStyle.opacity !== '' &&
                    !hasHiddenClass &&
                    ariaHidden !== 'true';
  
  if (!isVisible) {
    openMerchantModal();
  } else {
    closeMerchantModal();
  }
  
  // Разблокируем через небольшую задержку
  setTimeout(() => {
    _merchantToggleLock = false;
  }, 100);
}

function openMerchantModal() {
  const merchantModal = document.getElementById('merchant-modal');
  if (!merchantModal) {
    return;
  }
  
  // Проверяем, не находится ли модальное окно внутри скрытого родителя
  let parent = merchantModal.parentElement;
  while (parent && parent !== document.body) {
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === 'none' || parent.classList.contains('hidden')) {
      // Перемещаем модальное окно в body
      document.body.appendChild(merchantModal);
      break;
    }
    parent = parent.parentElement;
  }
  
  // Закрываем инвентарь если открыт
  const inventoryModal = document.getElementById('inventory-modal');
  if (inventoryModal && !inventoryModal.classList.contains('hidden')) {
    if (typeof closeInventoryModal === 'function') {
      closeInventoryModal();
    }
  }
  
  // Убираем класс hidden и устанавливаем aria-hidden
  merchantModal.classList.remove('hidden');
  merchantModal.setAttribute('aria-hidden', 'false');
  
  // Принудительно устанавливаем стили через JavaScript с !important
  merchantModal.style.setProperty('display', 'flex', 'important');
  merchantModal.style.setProperty('opacity', '1', 'important');
  merchantModal.style.setProperty('visibility', 'visible', 'important');
  merchantModal.style.setProperty('z-index', '12000', 'important');
  merchantModal.style.setProperty('position', 'fixed', 'important');
  merchantModal.style.setProperty('top', '0', 'important');
  merchantModal.style.setProperty('left', '0', 'important');
  merchantModal.style.setProperty('right', '0', 'important');
  merchantModal.style.setProperty('bottom', '0', 'important');
  merchantModal.style.setProperty('width', '100%', 'important');
  merchantModal.style.setProperty('height', '100%', 'important');
  
  document.body.classList.add('modal-open');
  
  // Проверяем после установки стилей и исправляем размеры если нужно
  setTimeout(() => {
    const rect = merchantModal.getBoundingClientRect();
    // Если размеры все еще 0, пытаемся принудительно установить их
    if (rect.width === 0 || rect.height === 0) {
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      merchantModal.style.setProperty('width', `${viewportWidth}px`, 'important');
      merchantModal.style.setProperty('height', `${viewportHeight}px`, 'important');
    }
  }, 50);
  
  renderMerchant();
  
  if (typeof updateBuffModifiers === 'function') {
    updateBuffModifiers();
  }
  
  // Закрытие по клику на overlay
  merchantModal.addEventListener('click', closeMerchantOnOverlayClick);
  
  // Закрытие по Escape
  document.addEventListener('keydown', closeMerchantOnEscape);
}

function closeMerchantOnOverlayClick(e) {
  const merchantModal = document.getElementById('merchant-modal');
  const merchantCard = merchantModal ? merchantModal.querySelector('.merchant-modal-card') : null;
  // Закрываем только если клик был на overlay, а не на содержимое модалки
  // И только если модальное окно действительно открыто
  if (merchantModal && 
      e.target === merchantModal && 
      !merchantCard?.contains(e.target) &&
      !merchantModal.classList.contains('hidden')) {
    closeMerchantModal();
  }
}

function closeMerchantOnEscape(e) {
  if (e.key === 'Escape') {
    const merchantModal = document.getElementById('merchant-modal');
    if (merchantModal && !merchantModal.classList.contains('hidden')) {
      closeMerchantModal();
    }
  }
}

function closeMerchantModal() {
  const merchantModal = document.getElementById('merchant-modal');
  if (merchantModal) {
    merchantModal.classList.add('hidden');
    merchantModal.setAttribute('aria-hidden', 'true');
    merchantModal.style.display = 'none';
    merchantModal.style.opacity = '0';
    merchantModal.style.visibility = 'hidden';
    document.body.classList.remove('modal-open');
    
    // Удаляем обработчики
    merchantModal.removeEventListener('click', closeMerchantOnOverlayClick);
    document.removeEventListener('keydown', closeMerchantOnEscape);
  }
}

// ======= Инициализация UI =======
function initMerchantUI() {
  const merchantBtn = document.getElementById('merchant-btn');
  if (merchantBtn) {
    // Удаляем старые обработчики если есть
    merchantBtn.onclick = null;
    merchantBtn.removeEventListener('click', toggleMerchant);
    
    // Добавляем новый обработчик с защитой от двойного клика
    let isToggling = false;
    merchantBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Защита от двойного клика
      if (isToggling) {
        return;
      }
      
      isToggling = true;
      toggleMerchant();
      
      // Разрешаем следующий клик через 300ms
      setTimeout(() => {
        isToggling = false;
      }, 300);
    });
  } else {
    setTimeout(initMerchantUI, 500);
    return;
  }
  
  const merchantCloseBtn = document.getElementById('merchant-close');
  if (merchantCloseBtn) {
    merchantCloseBtn.onclick = null;
    merchantCloseBtn.removeEventListener('click', closeMerchantModal);
    merchantCloseBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeMerchantModal();
    });
  }
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initMerchantUI, 100);
    // Повторная инициализация через больший интервал для надежности
    setTimeout(initMerchantUI, 1000);
  });
} else {
  setTimeout(initMerchantUI, 100);
  // Повторная инициализация через больший интервал для надежности
  setTimeout(initMerchantUI, 1000);
}

// Дополнительная инициализация merchant button - убеждаемся что обработчик установлен
(function ensureMerchantButton() {
  const merchantBtn = document.getElementById('merchant-btn');
  if (merchantBtn && !merchantBtn.onclick) {
    merchantBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof toggleMerchant === 'function') {
        toggleMerchant();
      } else if (typeof openMerchantModal === 'function') {
        openMerchantModal();
      }
    };
  }
  setTimeout(ensureMerchantButton, 2000);
})();

