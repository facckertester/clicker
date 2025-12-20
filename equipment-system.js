/* ======= Equipment System =======
 * Система экипировки и бонусов от предметов
 * Версия: 1.0
 */

// ======= Получение бонуса урона от экипировки =======
function getEquipmentDamageBonus() {
  if (!save || !save.inventory || !save.inventory.equipment) return 0;
  
  let bonus = 0;
  
  // Основное оружие
  const weapon = save.inventory.equipment.weapon;
  if (weapon && weapon.damage) {
    bonus += weapon.damage;
  }
  
  // Второе оружие (только для кинжалов) - наносит урон одновременно с основным
  const weapon2 = save.inventory.equipment.weapon2;
  if (weapon2 && weapon2.damage && weapon2.weaponType === 'dagger') {
    bonus += weapon2.damage; // Урон от второго кинжала добавляется к основному
  }
  
  // Кольцо
  const ring = save.inventory.equipment.ring;
  if (ring && ring.damage) {
    bonus += ring.damage;
  }
  
  // Амулет
  const amulet = save.inventory.equipment.amulet;
  if (amulet && amulet.damage) {
    bonus += amulet.damage;
  }
  
  return bonus;
}

// ======= Получение модификатора урона от щита =======
function getShieldDamageModifier() {
  if (!save || !save.inventory || !save.inventory.equipment) return 1.0;
  
  const shield = save.inventory.equipment.shield;
  if (!shield) return 1.0; // Нет щита - без модификатора
  
  const weapon = save.inventory.equipment.weapon;
  const weapon2 = save.inventory.equipment.weapon2;
  
  // Если кинжал + щит → -75% урона
  if (weapon && weapon.weaponType === 'dagger') {
    return 0.25; // 25% от урона = -75%
  }
  if (weapon2 && weapon2.weaponType === 'dagger') {
    return 0.25; // 25% от урона = -75%
  }
  
  // Если одноручный меч + щит → -50% урона
  if (weapon && weapon.weaponType === 'sword') {
    return 0.5; // 50% от урона = -50%
  }
  
  // Если только щит (без оружия или другое оружие) → -50% урона
  return 0.5; // 50% от урона = -50%
}

// ======= Проверка совместимости оружия и щита =======
function checkWeaponShieldCompatibility(weapon, shield) {
  if (!weapon || !shield) return true; // Нет конфликта если чего-то нет
  
  // Двуручное оружие несовместимо со щитом
  if (weapon.weaponType === 'twohanded' && shield) {
    return false;
  }
  
  return true;
}

// ======= Получение бонуса защиты от экипировки =======
function getEquipmentDefenseBonus() {
  if (!save || !save.inventory || !save.inventory.equipment) return 0;
  
  let defense = 0;
  
  // Шлем
  const helmet = save.inventory.equipment.helmet;
  if (helmet && helmet.defense) {
    defense += helmet.defense;
  }
  
  // Нагрудник
  const chest = save.inventory.equipment.chest;
  if (chest && chest.defense) {
    defense += chest.defense;
  }
  
  // Поножи
  const legs = save.inventory.equipment.legs;
  if (legs && legs.defense) {
    defense += legs.defense;
  }
  
  // Сапоги
  const boots = save.inventory.equipment.boots;
  if (boots && boots.defense) {
    defense += boots.defense;
  }
  
  // Кольцо
  const ring = save.inventory.equipment.ring;
  if (ring && ring.defense) {
    defense += ring.defense;
  }
  
  // Амулет
  const amulet = save.inventory.equipment.amulet;
  if (amulet && amulet.defense) {
    defense += amulet.defense;
  }
  
  // Щит
  const shield = save.inventory.equipment.shield;
  if (shield && shield.defense) {
    defense += shield.defense;
  }
  
  return defense;
}

// ======= Получение бонуса HP от экипировки =======
function getEquipmentHPBonus() {
  if (!save || !save.inventory || !save.inventory.equipment) return 0;
  
  let bonus = 0;
  
  // Проверяем все слоты экипировки
  const slots = ['weapon', 'shield', 'helmet', 'chest', 'legs', 'boots', 'ring', 'amulet'];
  slots.forEach(slot => {
    const item = save.inventory.equipment[slot];
    if (item && item.hpBonus) {
      bonus += item.hpBonus;
    }
  });
  
  return bonus;
}

// ======= Получение всех бонусов от экипировки =======
function getEquipmentBonuses() {
  return {
    damage: getEquipmentDamageBonus(),
    defense: getEquipmentDefenseBonus(),
    hp: getEquipmentHPBonus()
  };
}

// Экспортируем функцию для использования в других модулях
if (typeof window !== 'undefined') {
  window.getEquipmentHPBonus = getEquipmentHPBonus;
}

