/* Combat System - General Event and Boss Fights */

// Unique ID counter for items (ensures truly unique IDs)
let itemIdCounter = Date.now();

// Damage types
const DAMAGE_TYPES = {
  PHYSICAL: {
    id: 'PHYSICAL',
    name: 'Physical',
    color: '#c0c0c0',
    description: 'Physical damage (bleeding effects)'
  },
  MAGICAL: {
    id: 'MAGICAL',
    name: 'Magical',
    color: '#9b59b6',
    description: 'Magical damage (elemental, poison, fire, cold, lightning)'
  },
  HOLY: {
    id: 'HOLY',
    name: 'Holy',
    color: '#f39c12',
    description: 'Holy damage'
  },
  DARK: {
    id: 'DARK',
    name: 'Dark',
    color: '#8e44ad',
    description: 'Dark damage'
  },
  PURE: {
    id: 'PURE',
    name: 'Pure',
    color: '#ffffff',
    description: 'Pure damage (universal, can be used by all classes)'
  }
};

// Character classes with bonuses and weapon restrictions
const CHARACTER_CLASSES = {
  WARRIOR: {
    id: 'WARRIOR',
    name: 'Warrior',
    description: 'Tank class with high defense and HP',
    damageType: 'PHYSICAL',
    bonuses: {
      hpMultiplier: 1.3,        // +30% HP
      armorMultiplier: 1.25,     // +25% armor from items
      blockChanceBonus: 15,      // +15% block chance
      reflectChanceBonus: 10     // +10% reflect chance
    },
    allowedWeapons: ['SWORD', 'TWOHANDED_SWORD', 'SHIELD', 'STONE']
  },
  MAGE: {
    id: 'MAGE',
    name: 'Mage',
    description: 'Magic damage dealer with elemental focus',
    damageType: 'MAGICAL',
    bonuses: {
      wandStaffDamageMultiplier: 1.4,  // +40% damage from wands and staffs
      elementDamageMultiplier: 1.5,    // +50% elemental damage
      maxManaMultiplier: 1.25,         // +25% max mana
      elementEffectChanceBonus: 20      // +20% chance to apply elemental effects
    },
    allowedWeapons: ['SWORD', 'WAND', 'STAFF', 'DAGGER', 'STONE']
  },
  ROGUE: {
    id: 'ROGUE',
    name: 'Rogue',
    description: 'High crit chance and dodge, fast attacks',
    damageType: 'PHYSICAL',
    bonuses: {
      critChanceBonus: 25,       // +25% crit chance
      critMultiplierBonus: 30,   // +30% crit multiplier
      dodgeChanceBonus: 20,      // +20% dodge chance
      attackSpeedMultiplier: 1.15 // +15% attack speed
    },
    allowedWeapons: ['DAGGER', 'STONE']
  },
  PALADIN: {
    id: 'PALADIN',
    name: 'Paladin',
    description: 'Balanced class with defense and HP regeneration',
    damageTypes: ['HOLY', 'PHYSICAL'], // Can use both Holy and Physical damage
    damageType: 'HOLY', // Primary type for backward compatibility
    bonuses: {
      hpMultiplier: 1.2,         // +20% HP
      armorMultiplier: 1.15,      // +15% armor from items
      hpRegenMultiplier: 1.5,     // +50% HP regeneration
      blockChanceBonus: 10        // +10% block chance
    },
    allowedWeapons: ['SWORD', 'MACE', 'SHIELD', 'STONE']
  },
  BERSERKER: {
    id: 'BERSERKER',
    name: 'Berserker',
    description: 'High damage, low defense glass cannon',
    damageType: 'PHYSICAL',
    bonuses: {
      damageMultiplier: 1.35,    // +35% damage
      attackSpeedMultiplier: 1.2, // +20% attack speed
      hpMultiplier: 0.85,        // -15% HP (penalty)
      critChanceBonus: 10        // +10% crit chance
    },
    allowedWeapons: ['SWORD', 'TWOHANDED_SWORD', 'MACE', 'SHIELD', 'STONE']
  },
  RANGER: {
    id: 'RANGER',
    name: 'Ranger',
    description: 'Ranged combat specialist with DoT effects',
    damageTypes: ['PHYSICAL', 'MAGICAL'], // Can use both Physical and Magical damage
    damageType: 'PHYSICAL', // Primary type for backward compatibility
    bonuses: {
      bowCrossbowDamageMultiplier: 1.3, // +30% damage from bows and crossbows
      dotDamageMultiplier: 1.25,        // +25% DoT damage (poison, bleed)
      dodgeChanceBonus: 15,              // +15% dodge chance
      dotDurationMultiplier: 1.2         // +20% DoT effect duration
    },
    allowedWeapons: ['BOW', 'CROSSBOW', 'STONE']
  },
  NECROMANCER: {
    id: 'NECROMANCER',
    name: 'Necromancer',
    description: 'DoT specialist with poison and bleed focus',
    damageTypes: ['DARK', 'MAGICAL'], // Can use Dark and Magical damage
    damageType: 'DARK', // Primary type for backward compatibility
    bonuses: {
      dotDamageMultiplier: 1.5,         // +50% DoT damage (poison, bleed)
      dotEffectChanceBonus: 30,         // +30% chance to apply DoT effects
      maxManaMultiplier: 1.25,          // +25% max mana
      hpRegenMultiplier: 1.15           // +15% HP regeneration
    },
    allowedWeapons: ['DAGGER', 'WAND', 'STAFF', 'SHIELD', 'STONE']
  }
};

// Generate unique ID for items
function generateUniqueItemId(type) {
  itemIdCounter++;
  return `${type}_${itemIdCounter}_${Math.random().toString(36).substr(2, 9)}`;
}

  // Combat system state
let combatSystem = {
  active: false,
  boss: null,
  player: {
    hp: 100,
    maxHp: 100,
    damage: 10,
    armor: 0,
    critChance: 5,
    critMultiplier: 2.0,
    dodgeChance: 0,
    hpRegen: 0,
    blockChance: 0,
    reflectChance: 0,
    mana: 50,
    maxMana: 50,
    attackSpeed: 1.0,
    equipped: {
      weaponRight: null,
      weaponLeft: null,
      helmet: null,
      shoulders: null,
      chest: null,
      gloves: null,
      legs: null,
      boots: null
    }
  },
  souls: 0,
  bossWave: 0,
  lastAttackTime: 0,
  lastBossAttackTime: 0,
  countdownTimer: null,
  countdownSeconds: 0,
  lastWaveDefeated: false, // Track if last wave was defeated
  highestWaveDefeated: 0 // Track highest wave defeated for replay system
};

// Item rarities
const ITEM_RARITY = {
  COMMON: { name: 'Common', color: '#9d9d9d', multiplier: 1.0 },
  UNCOMMON: { name: 'Uncommon', color: '#1eff00', multiplier: 1.5 },
  RARE: { name: 'Rare', color: '#0070dd', multiplier: 2.0 },
  EPIC: { name: 'Epic', color: '#a335ee', multiplier: 3.0 },
  LEGENDARY: { name: 'Legendary', color: '#ff8000', multiplier: 5.0 }
};

// Element types
const ELEMENT_TYPES = {
  FIRE: { name: 'Fire', color: '#ff4444', damageMultiplier: 1.0 },
  POISON: { name: 'Poison', color: '#44ff44', damageMultiplier: 1.0 },
  COLD: { name: 'Cold', color: '#44aaff', damageMultiplier: 1.0 },
  LIGHTNING: { name: 'Lightning', color: '#ffff44', damageMultiplier: 1.0 },
  BLEED: { name: 'Bleed', color: '#ff4444', damageMultiplier: 0.0 } // No extra damage, only DoT
};

// Weapon types with balanced stats
const WEAPON_TYPES = {
  SWORD: { 
    name: 'Sword', 
    hands: 1, 
    attackSpeed: { min: 0.8, max: 1.0 }, 
    baseDamage: 10, // Level 1 common
    critChanceBase: 0.5, // Medium crit chance
    critMultiplierBase: 0.1, // Reduced crit multiplier (was 0.2)
    canDualWield: false, 
    onlyRightHand: true 
  },
  DAGGER: { 
    name: 'Dagger', 
    hands: 1, 
    attackSpeed: { min: 1.5, max: 2.0 }, 
    baseDamage: 3, // Level 1 common - much lower damage
    critChanceBase: 0.3, // Lower crit chance
    critMultiplierBase: 0.2, // Reduced crit multiplier (was 0.4)
    canDualWield: true, 
    onlyRightHand: false 
  },
  TWOHANDED_SWORD: { 
    name: 'Two-Handed Sword', 
    hands: 2, 
    attackSpeed: { min: 0.6, max: 0.8 }, 
    baseDamage: 15, // Level 1 common
    critChanceBase: 0.7, // Higher crit chance
    critMultiplierBase: 0.1, // Reduced crit multiplier (was 0.2)
    canDualWield: false, 
    onlyRightHand: false 
  },
  WAND: { 
    name: 'Wand', 
    hands: 1, 
    attackSpeed: { min: 1.0, max: 1.2 }, 
    baseDamage: 8, // Level 1 common
    critChanceBase: 0.5, // Medium crit chance
    critMultiplierBase: 0.1, // Reduced crit multiplier (was 0.2)
    canDualWield: false, 
    onlyRightHand: false 
  },
  STAFF: { 
    name: 'Staff', 
    hands: 2, 
    attackSpeed: { min: 0.5, max: 0.6 }, 
    baseDamage: 12, // Level 1 common
    critChanceBase: 0.3, // Lower crit chance
    critMultiplierBase: 0.1, // Reduced crit multiplier (was 0.2)
    canDualWield: false, 
    onlyRightHand: false 
  },
  BOW: {
    name: 'Bow',
    hands: 2,
    attackSpeed: { min: 0.7, max: 0.9 },
    baseDamage: 11, // Level 1 common
    critChanceBase: 0.6, // Higher crit chance
    critMultiplierBase: 0.1, // Reduced crit multiplier
    canDualWield: false,
    onlyRightHand: false
  },
  CROSSBOW: {
    name: 'Crossbow',
    hands: 2,
    attackSpeed: { min: 0.5, max: 0.7 },
    baseDamage: 14, // Level 1 common - higher damage, slower
    critChanceBase: 0.5, // Medium crit chance
    critMultiplierBase: 0.12, // Slightly higher crit multiplier
    canDualWield: false,
    onlyRightHand: false
  },
  MACE: {
    name: 'Mace',
    hands: 1,
    attackSpeed: { min: 0.7, max: 0.9 },
    baseDamage: 12, // Level 1 common
    critChanceBase: 0.4, // Lower crit chance
    critMultiplierBase: 0.1, // Reduced crit multiplier
    canDualWield: false,
    onlyRightHand: true
  },
  SHIELD: { 
    name: 'Shield', 
    hands: 1, 
    attackSpeed: null, 
    effect: null, 
    canDualWield: false, 
    onlyLeftHand: true 
  }
};

// Armor types
const ARMOR_TYPES = {
  HELMET: 'helmet',
  SHOULDERS: 'shoulders',
  CHEST: 'chest',
  GLOVES: 'gloves',
  LEGS: 'legs',
  BOOTS: 'boots'
};

// Accessory types (rings and amulets)
const ACCESSORY_TYPES = {
  RING: 'ring',
  AMULET: 'amulet'
};

// Generate item based on boss level and rarity
function generateItem(bossLevel, rarity) {
  const rarityData = ITEM_RARITY[rarity];
  const itemLevel = Math.floor(bossLevel * (0.8 + Math.random() * 0.4));
  
  // Determine item type (70% armor, 30% weapon)
  const isWeapon = Math.random() < 0.3;
  
  if (isWeapon) {
    // Generate weapon
    const weaponTypes = Object.keys(WEAPON_TYPES).filter(w => w !== 'SHIELD');
    const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
    const weaponData = WEAPON_TYPES[weaponType];
    
    // Calculate damage based on weapon type base damage and level scaling
    // REBALANCE: Reduced damage scaling (proposal 8)
    // Damage scales: baseDamage * (1 + itemLevel * 0.08) * rarity multiplier (reduced from 0.1)
    const damage = Math.floor(weaponData.baseDamage * (1 + itemLevel * 0.08) * rarityData.multiplier);
    
    // Attack speed based on weapon type (rarity slightly improves speed)
    const attackSpeed = weaponData.attackSpeed 
      ? weaponData.attackSpeed.min + (weaponData.attackSpeed.max - weaponData.attackSpeed.min) * (0.8 + (rarityData.multiplier - 1) * 0.05)
      : null;
    
    // Crit chance based on weapon type base and level scaling
    // REBALANCE: Limited crit chance growth (proposal 5)
    // Higher rarity = better crit chance, but most items capped at 70%, only Legendary can reach 95%
    const critChanceBase = weaponData.critChanceBase || 0.5;
    const baseCritChance = Math.floor((critChanceBase * (1 + itemLevel * 0.15) * rarityData.multiplier) * 10) / 10;
    // Limit crit chance based on rarity: Common/Uncommon/Rare/Epic max 70%, Legendary max 95%
    const critChance = Math.min(rarity === 'LEGENDARY' ? 95 : 70, baseCritChance);
    
    // Crit multiplier based on weapon type base and level scaling
    // REBALANCE: Reduced crit multiplier scaling (was 0.1, now 0.05)
    const critMultiplierBase = weaponData.critMultiplierBase || 0.1;
    const critMultiplier = Math.floor((critMultiplierBase * (1 + itemLevel * 0.05) * rarityData.multiplier) * 100) / 100;
    
    // Determine weapon damage type based on weapon type FIRST
    // Default: SWORD, TWOHANDED_SWORD, DAGGER, BOW, CROSSBOW = PHYSICAL
    // WAND, STAFF = MAGICAL
    // MACE = HOLY or PHYSICAL (random, as only Paladin can use it)
    let weaponDamageType = 'PHYSICAL';
    if (weaponType === 'WAND' || weaponType === 'STAFF') {
      weaponDamageType = 'MAGICAL';
    } else if (weaponType === 'MACE') {
      // Mace can be HOLY or PHYSICAL (only Paladin can use it, who can use both)
      weaponDamageType = Math.random() < 0.5 ? 'HOLY' : 'PHYSICAL';
    }
    
    // Element logic:
    // - For PHYSICAL weapons: no primary element, only additional element damage (low chance to apply effect)
    // - For MAGICAL weapons (WAND/STAFF): can be pure magical (no element) or with primary element (high chance to apply effect)
    let primaryElement = null; // Primary element (only for magical weapons)
    let additionalElement = null; // Additional element (for physical weapons or secondary element for magical)
    
    // For magical weapons, determine if it has a primary element
    if (weaponType === 'WAND' || weaponType === 'STAFF') {
      // 50-70% chance to have a primary element (depending on rarity)
      const primaryElementChance = 0.5 + (rarityData.multiplier - 1) * 0.05;
      if (Math.random() < primaryElementChance) {
        const elements = Object.keys(ELEMENT_TYPES);
        primaryElement = elements[Math.floor(Math.random() * elements.length)];
      }
    }
    
    // For physical weapons, can have additional element damage (separate from primary element)
    // This is a secondary element that can be different from primary element (for magical weapons)
    if (weaponDamageType === 'PHYSICAL') {
      // 10-20% chance for additional element damage (depending on rarity)
      const additionalElementChance = 0.1 + (rarityData.multiplier - 1) * 0.02;
      if (Math.random() < additionalElementChance) {
        const elements = Object.keys(ELEMENT_TYPES);
        additionalElement = elements[Math.floor(Math.random() * elements.length)];
      }
    } else if (weaponType === 'WAND' || weaponType === 'STAFF') {
      // For magical weapons, can have additional element different from primary
      // 20-30% chance for additional element (if no primary element, higher chance)
      const additionalElementChance = primaryElement ? 0.2 : 0.4;
      if (Math.random() < additionalElementChance) {
        const elements = Object.keys(ELEMENT_TYPES);
        let candidateElement = elements[Math.floor(Math.random() * elements.length)];
        // Make sure additional element is different from primary
        while (candidateElement === primaryElement && primaryElement) {
          candidateElement = elements[Math.floor(Math.random() * elements.length)];
        }
        additionalElement = candidateElement;
      }
    }
    
    // For shields, use special stats (blockChance and reflectChance)
    // Shields cannot have damage, critChance, or critMultiplier
    if (weaponType === 'SHIELD') {
      // Base block chance: 5-15% per level, scaled by rarity
      const baseBlockChance = (5 + itemLevel * 0.5) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
      const blockChance = Math.floor(baseBlockChance * 10) / 10; // Round to 1 decimal
      
      // Base reflect chance: 2-8% per level, scaled by rarity
      const baseReflectChance = (2 + itemLevel * 0.3) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
      const reflectChance = Math.floor(baseReflectChance * 10) / 10; // Round to 1 decimal
      
      const weaponStats = {
        blockChance: blockChance,
        reflectChance: reflectChance
      };
      
      // Shields can also have defensive stats
      const hasHp = Math.random() < 0.7;
      const hasArmor = Math.random() < 0.7;
      const hasDodge = Math.random() < 0.5;
      const hasHpRegen = Math.random() < 0.5;
      
      if (hasHp) {
        weaponStats.hp = Math.floor((10 + itemLevel * 3) * rarityData.multiplier);
      }
      if (hasArmor) {
        weaponStats.armor = Math.floor((2 + itemLevel * 0.5) * rarityData.multiplier);
      }
      if (hasDodge) {
        weaponStats.dodge = Math.floor((0.5 + itemLevel * 0.1) * rarityData.multiplier * 10) / 10;
      }
      if (hasHpRegen) {
        weaponStats.hpRegen = Math.floor((0.1 + itemLevel * 0.05) * rarityData.multiplier * 10) / 10;
      }
      
      const item = {
        id: generateUniqueItemId('weapon'),
        type: 'weapon',
        weaponType: weaponType,
        name: `${rarityData.name} Shield`,
        level: itemLevel,
        rarity: rarity,
        attackSpeed: null,
        effect: null,
        hands: weaponData.hands,
        icon: getWeaponIcon(weaponType),
        stats: weaponStats
      };
      
      return item;
    }
    
    // DIABLO 3/POE STYLE: Generate random affixes based on rarity
    // Higher rarity = more affixes and better values
    const weaponStats = {
      damage: damage
    };
    
    // Always add crit stats (core stats)
    if (critChance > 0) {
      weaponStats.critChance = critChance;
    }
    if (critMultiplier > 0) {
      weaponStats.critMultiplier = critMultiplier;
    }
    
    // Random secondary affixes (like Diablo 3/PoE)
    // Affix count: Common 0-1, Uncommon 1-2, Rare 2-3, Epic 2-4, Legendary 3-5
    const affixCountRanges = {
      'COMMON': { min: 0, max: 1 },
      'UNCOMMON': { min: 1, max: 2 },
      'RARE': { min: 2, max: 3 },
      'EPIC': { min: 2, max: 4 },
      'LEGENDARY': { min: 3, max: 5 }
    };
    
    const affixRange = affixCountRanges[rarity] || { min: 0, max: 1 };
    const affixCount = affixRange.min + Math.floor(Math.random() * (affixRange.max - affixRange.min + 1));
    
    // Available secondary affixes for weapons
    const availableAffixes = ['hp', 'armor', 'dodge', 'hpRegen', 'maxMana'];
    const selectedAffixes = [];
    
    // Randomly select affixes without duplicates
    for (let i = 0; i < affixCount && availableAffixes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableAffixes.length);
      const affix = availableAffixes.splice(randomIndex, 1)[0];
      selectedAffixes.push(affix);
    }
    
    // Generate values for selected affixes (scaled by item level and rarity)
    selectedAffixes.forEach(affix => {
      let baseValue = 0;
      switch (affix) {
        case 'hp':
          baseValue = (10 + itemLevel * 2) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
          weaponStats.hp = Math.floor(baseValue);
          break;
        case 'armor':
          baseValue = (2 + itemLevel * 0.3) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
          weaponStats.armor = Math.floor(baseValue);
          break;
        case 'dodge':
          baseValue = (0.3 + itemLevel * 0.05) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
          weaponStats.dodge = Math.floor(baseValue * 10) / 10;
          break;
        case 'hpRegen':
          baseValue = (0.1 + itemLevel * 0.03) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
          weaponStats.hpRegen = Math.floor(baseValue * 10) / 10;
          break;
        case 'maxMana':
          baseValue = (5 + itemLevel * 2) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
          weaponStats.maxMana = Math.floor(baseValue);
          break;
      }
    });
    
    // Add primary element damage for WAND and STAFF (if has primary element)
    if (primaryElement && (weaponType === 'WAND' || weaponType === 'STAFF')) {
      // Staff gets 15% element damage, Wand gets 10%
      const elementDamagePercent = weaponType === 'STAFF' ? 0.15 : 0.1;
      let elementDamage = Math.floor(damage * elementDamagePercent * rarityData.multiplier);
      if (elementDamage > 0) {
        weaponStats[`elementDamage_${primaryElement}`] = elementDamage;
      }
    }
    
    // Add additional element damage (for physical weapons or secondary element for magical weapons)
    if (additionalElement) {
      // Additional element damage is 5-10% of base damage
      const elementDamagePercent = 0.05 + Math.random() * 0.05;
      let elementDamage = Math.floor(damage * elementDamagePercent * rarityData.multiplier);
      if (elementDamage > 0) {
        weaponStats[`elementDamage_${additionalElement}`] = elementDamage;
      }
    }
    
    // For daggers, determine which hand it's for (left or right)
    let weaponHand = null;
    let daggerName = weaponData.name;
    if (weaponType === 'DAGGER') {
      weaponHand = Math.random() < 0.5 ? 'left' : 'right';
      daggerName = weaponHand === 'left' ? 'Left Dagger' : 'Right Dagger';
      
      // Left dagger can only be used by Rogue, so it's always PHYSICAL
      if (weaponHand === 'left') {
        weaponDamageType = 'PHYSICAL';
      }
    }
    
    // Build weapon name with primary element (only for magical weapons with primary element)
    // Physical weapons don't show element in name (element is only additional damage)
    let weaponName = weaponData.name;
    if (weaponType === 'DAGGER') {
      weaponName = daggerName;
    }
    
    // Only add element to name if it's a primary element (for magical weapons)
    if (primaryElement && (weaponType === 'WAND' || weaponType === 'STAFF')) {
      const elementData = ELEMENT_TYPES[primaryElement];
      weaponName = `${elementData.name} ${weaponName}`;
    }
    
    const item = {
      id: generateUniqueItemId('weapon'),
      type: 'weapon',
      weaponType: weaponType,
      name: `${rarityData.name} ${weaponName}`,
      level: itemLevel,
      rarity: rarity,
      damage: damage,
      damageType: weaponDamageType, // Store damage type (PHYSICAL, MAGICAL, etc.)
      attackSpeed: attackSpeed,
      element: primaryElement, // Store primary element (only for magical weapons, null for physical)
      additionalElement: additionalElement, // Store additional element (for physical weapons or secondary element for magical)
      hands: weaponData.hands,
      icon: getWeaponIcon(weaponType),
      stats: weaponStats
    };
    
    // Add weaponHand property for daggers
    if (weaponHand) {
      item.weaponHand = weaponHand;
    }
    
    return item;
  } else {
    // Generate armor
    const armorTypeKeys = Object.keys(ARMOR_TYPES);
    const armorTypeKey = armorTypeKeys[Math.floor(Math.random() * armorTypeKeys.length)];
    const armorType = ARMOR_TYPES[armorTypeKey]; // Use the value, not the key
    
    const baseStats = {
      hp: Math.floor((10 + itemLevel * 3) * rarityData.multiplier),
      armor: Math.floor((2 + itemLevel * 0.5) * rarityData.multiplier),
      dodge: Math.floor((0.5 + itemLevel * 0.1) * rarityData.multiplier),
      hpRegen: Math.floor((0.1 + itemLevel * 0.05) * rarityData.multiplier),
      maxMana: Math.floor((5 + itemLevel * 2) * rarityData.multiplier),
      manaRegen: Math.floor((0.05 + itemLevel * 0.02) * rarityData.multiplier * 10) / 10
    };
    
    // Randomly select 1-3 stats (can include mana and mana regen)
    const statCount = 1 + Math.floor(Math.random() * 3);
    const availableStats = Object.keys(baseStats);
    const selectedStats = {};
    
    for (let i = 0; i < statCount && i < availableStats.length; i++) {
      const stat = availableStats[Math.floor(Math.random() * availableStats.length)];
      if (!selectedStats[stat]) {
        selectedStats[stat] = baseStats[stat];
      }
    }
    
    return {
      id: generateUniqueItemId('armor'),
      type: 'armor',
      armorType: armorType, // Now this will be 'boots', 'helmet', etc. (lowercase)
      name: `${rarityData.name} ${armorType.charAt(0).toUpperCase() + armorType.slice(1)}`,
      level: itemLevel,
      rarity: rarity,
      icon: getArmorIcon(armorType),
      stats: selectedStats
    };
  }
}

// Get weapon icon
function getWeaponIcon(weaponType) {
  const icons = {
    SWORD: '⚔️',
    DAGGER: '🗡️',
    TWOHANDED_SWORD: '⚔️',
    WAND: '🪄',
    STAFF: '🪄',
    BOW: '🏹',
    CROSSBOW: '🏹',
    MACE: '🔨',
    SHIELD: '🛡️',
    STONE: '🪨'
  };
  return icons[weaponType] || '⚔️';
}

// Get armor icon
function getArmorIcon(armorType) {
  const icons = {
    helmet: '⛑️',
    shoulders: '🎖️',
    chest: '🦺',
    gloves: '🧤',
    legs: '👖',
    boots: '👢'
  };
  return icons[armorType] || '📦';
}

// Calculate player stats from equipment and level
function calculatePlayerStats() {
  const level = window.experienceSystem ? window.experienceSystem.getLevel() : 1;
  
  // Get player class from save
  let playerClass = null;
  if (save && save.combat && save.combat.playerClass) {
    playerClass = CHARACTER_CLASSES[save.combat.playerClass];
  }
  
  const baseStats = {
    hp: 100 + level * 10,
    maxHp: 100 + level * 10,
    damage: 10 + level * 2,
    armor: 0,
    critChance: 5 + level * 0.1,
    critMultiplier: 2.0 + level * 0.01, // Reduced from 0.05 to 0.01 per level
    dodgeChance: 0,
    hpRegen: 0,
    blockChance: 0,
    reflectChance: 0,
    mana: 50 + level * 5,
    maxMana: 50 + level * 5,
    manaRegen: 0,
    attackSpeed: 1.0
  };
  
  // Add small armor and dodge bonus per level (very small, as main stats come from items)
  baseStats.armor += level * 0.1; // 0.1 armor per level
  baseStats.dodgeChance += level * 0.05; // 0.05% dodge per level
  
  // Add stats from equipment
  const equipment = combatSystem.player.equipped;
  const rightWeapon = equipment.weaponRight;
  const leftWeapon = equipment.weaponLeft;
  
  // Check if both daggers are equipped (left and right)
  const hasBothDaggers = leftWeapon && leftWeapon.weaponType === 'DAGGER' && 
                         (leftWeapon.weaponHand === 'left' || !leftWeapon.weaponHand) && // Left dagger (or old dagger without weaponHand)
                         rightWeapon && rightWeapon.weaponType === 'DAGGER' && 
                         (rightWeapon.weaponHand === 'right' || !rightWeapon.weaponHand); // Right dagger (or old dagger without weaponHand)
  
  // Track base armor before class multipliers (for class bonuses)
  let armorFromItems = 0;
  let damageFromWeapons = 0;
  let elementDamageFromWeapons = {};
  let wandStaffDamage = 0;
  let bowCrossbowDamage = 0;
  
  Object.keys(equipment).forEach(slot => {
    const item = equipment[slot];
    if (item && item.stats) {
      let statMultiplier = 1.0;
      
      // Both daggers give 100% stats, even when both are equipped
      // (removed 25% penalty for left dagger)
      
      // For shields, don't apply damage, critChance, or critMultiplier stats
      const isShield = item.weaponType === 'SHIELD';
      
      if (item.stats.hp) baseStats.maxHp += item.stats.hp * statMultiplier;
      if (item.stats.armor) {
        armorFromItems += item.stats.armor * statMultiplier;
        baseStats.armor += item.stats.armor * statMultiplier;
      }
      if (item.stats.dodge) baseStats.dodgeChance += item.stats.dodge * statMultiplier;
      if (item.stats.hpRegen) baseStats.hpRegen += item.stats.hpRegen * statMultiplier;
      if (!isShield) {
        // Shields cannot have damage, critChance, or critMultiplier
        if (item.stats.damage) {
          damageFromWeapons += item.stats.damage * statMultiplier;
          baseStats.damage += item.stats.damage * statMultiplier;
          
          // Track weapon type damage for class bonuses
          if (item.weaponType === 'WAND' || item.weaponType === 'STAFF') {
            wandStaffDamage += item.stats.damage * statMultiplier;
          }
          if (item.weaponType === 'BOW' || item.weaponType === 'CROSSBOW') {
            bowCrossbowDamage += item.stats.damage * statMultiplier;
          }
        }
        if (item.stats.critChance) baseStats.critChance += item.stats.critChance * statMultiplier;
        if (item.stats.critMultiplier) baseStats.critMultiplier += item.stats.critMultiplier * statMultiplier;
      }
      if (item.stats.blockChance) baseStats.blockChance += item.stats.blockChance * statMultiplier;
      if (item.stats.reflectChance) baseStats.reflectChance += item.stats.reflectChance * statMultiplier;
      if (item.stats.maxMana) baseStats.maxMana += item.stats.maxMana * statMultiplier;
      if (item.stats.manaRegen) baseStats.manaRegen += item.stats.manaRegen * statMultiplier;
      if (item.attackSpeed && slot === 'weaponRight') baseStats.attackSpeed = item.attackSpeed;
      
      // Track element damage for class bonuses
      if (item.stats) {
        Object.keys(item.stats).forEach(statKey => {
          if (statKey.startsWith('elementDamage_')) {
            const element = statKey.replace('elementDamage_', '');
            if (!elementDamageFromWeapons[element]) {
              elementDamageFromWeapons[element] = 0;
            }
            elementDamageFromWeapons[element] += item.stats[statKey] * statMultiplier;
          }
        });
      }
    }
  });
  
  // Apply class bonuses
  if (playerClass && playerClass.bonuses) {
    const bonuses = playerClass.bonuses;
    
    // HP multiplier
    if (bonuses.hpMultiplier) {
      baseStats.maxHp = Math.floor(baseStats.maxHp * bonuses.hpMultiplier);
    }
    
    // Armor multiplier (only from items)
    if (bonuses.armorMultiplier) {
      baseStats.armor = baseStats.armor - armorFromItems + Math.floor(armorFromItems * bonuses.armorMultiplier);
    }
    
    // Damage multipliers for specific weapon types
    if (bonuses.wandStaffDamageMultiplier && wandStaffDamage > 0) {
      baseStats.damage = baseStats.damage - wandStaffDamage + Math.floor(wandStaffDamage * bonuses.wandStaffDamageMultiplier);
    }
    if (bonuses.bowCrossbowDamageMultiplier && bowCrossbowDamage > 0) {
      baseStats.damage = baseStats.damage - bowCrossbowDamage + Math.floor(bowCrossbowDamage * bonuses.bowCrossbowDamageMultiplier);
    }
    
    // General damage multiplier
    if (bonuses.damageMultiplier) {
      baseStats.damage = Math.floor(baseStats.damage * bonuses.damageMultiplier);
    }
    
    // Element damage multiplier
    if (bonuses.elementDamageMultiplier) {
      Object.keys(elementDamageFromWeapons).forEach(element => {
        const elementDamage = elementDamageFromWeapons[element];
        baseStats.damage = baseStats.damage - elementDamage + Math.floor(elementDamage * bonuses.elementDamageMultiplier);
      });
    }
    
    // DoT damage multiplier (applied in combat, not here)
    
    // Stat bonuses
    if (bonuses.critChanceBonus) baseStats.critChance += bonuses.critChanceBonus;
    if (bonuses.critMultiplierBonus) baseStats.critMultiplier += bonuses.critMultiplierBonus / 100; // Convert % to multiplier
    if (bonuses.dodgeChanceBonus) baseStats.dodgeChance += bonuses.dodgeChanceBonus;
    if (bonuses.blockChanceBonus) baseStats.blockChance += bonuses.blockChanceBonus;
    if (bonuses.reflectChanceBonus) baseStats.reflectChance += bonuses.reflectChanceBonus;
    
    // Multipliers
    if (bonuses.attackSpeedMultiplier) baseStats.attackSpeed *= bonuses.attackSpeedMultiplier;
    if (bonuses.hpRegenMultiplier) baseStats.hpRegen *= bonuses.hpRegenMultiplier;
    if (bonuses.maxManaMultiplier) baseStats.maxMana = Math.floor(baseStats.maxMana * bonuses.maxManaMultiplier);
  }
  
  // Update player stats
  combatSystem.player.maxHp = baseStats.maxHp;
  if (combatSystem.player.hp > baseStats.maxHp) {
    combatSystem.player.hp = baseStats.maxHp;
  }
  combatSystem.player.damage = baseStats.damage;
  combatSystem.player.armor = baseStats.armor;
  combatSystem.player.critChance = Math.min(95, baseStats.critChance);
  combatSystem.player.critMultiplier = baseStats.critMultiplier;
  combatSystem.player.dodgeChance = Math.min(75, baseStats.dodgeChance);
  combatSystem.player.hpRegen = baseStats.hpRegen;
  combatSystem.player.blockChance = Math.min(95, baseStats.blockChance);
  combatSystem.player.reflectChance = Math.min(95, baseStats.reflectChance);
  combatSystem.player.maxMana = baseStats.maxMana;
  combatSystem.player.manaRegen = baseStats.manaRegen;
  combatSystem.player.attackSpeed = baseStats.attackSpeed;
  
  // DIABLO 3/POE STYLE: Calculate elemental resistances from equipment
  // Reset resistances first
  combatSystem.player.elementResistances = {
    FIRE: 0,
    POISON: 0,
    COLD: 0,
    LIGHTNING: 0,
    BLEED: 0
  };
  
  // Add resistances from equipment (items can have resistance affixes)
  Object.keys(equipment).forEach(slot => {
    const item = equipment[slot];
    if (item && item.stats) {
      // Check for resistance stats (e.g., fireResistance, poisonResistance, etc.)
      Object.keys(ELEMENT_TYPES).forEach(element => {
        const resistanceKey = `${element.toLowerCase()}Resistance`;
        if (item.stats[resistanceKey]) {
          combatSystem.player.elementResistances[element] += item.stats[resistanceKey];
          // Cap resistances at 75% (like Diablo 3)
          combatSystem.player.elementResistances[element] = Math.min(75, combatSystem.player.elementResistances[element]);
        }
      });
    }
  });
}

// Generate boss
function generateBoss(wave) {
  // Bosses have much more HP (10-20x more), but attack slower and deal less damage
  // REBALANCE: Increased HP growth (proposal 1)
  const baseHp = (200 + wave * 8) * 4; // Increased from * 3, wave * 5
  const hp = Math.floor(baseHp * (1 + wave * 0.03)); // Increased growth from 0.02 to 0.03
  
  // REBALANCE: Reduced damage growth (proposal 2)
  const baseDamage = (7 + wave * 1.5) * 0.5; // Reduced from wave * 2
  const damage = Math.floor(baseDamage * (1 + wave * 0.008)); // Reduced growth from 0.01 to 0.008
  
  // Bosses attack much slower (2-3x slower)
  const baseAttackSpeed = 0.4 - (wave * 0.005); // Much slower base speed
  const minAttackSpeed = 0.25; // Minimum attack speed (very slow)
  const attackSpeed = Math.max(minAttackSpeed, baseAttackSpeed);
  
  // Boss armor and dodge chance
  const armor = Math.floor((5 + wave * 0.4) * (1 + wave * 0.01)); // Reduced growth: 2 -> 0.4, 0.05 -> 0.01
  
  // REBALANCE: Increased dodge chance (proposal 4)
  const dodgeChance = Math.min(35, 2 + wave * 0.1); // Increased from 0.06 to 0.1, cap from 25 to 35
  
  // 30% chance boss has an element
  let element = null;
  if (Math.random() < 0.3) {
    const elements = Object.keys(ELEMENT_TYPES);
    element = elements[Math.floor(Math.random() * elements.length)];
  }
  
  const bossName = element 
    ? `${ELEMENT_TYPES[element].name} Boss Wave ${wave}`
    : `Boss Wave ${wave}`;
  
  // DIABLO 3/POE STYLE: Add elemental resistances for bosses
  // Bosses have random resistances to different elements (0-50%)
  // If boss has an element, it has 75% resistance to that element (strong against own element)
  const elementResistances = {};
  const elements = Object.keys(ELEMENT_TYPES);
  elements.forEach(elem => {
    if (element && elem === element) {
      // Boss is strong against its own element
      elementResistances[elem] = 75;
    } else {
      // Random resistance 0-50%
      elementResistances[elem] = Math.floor(Math.random() * 51);
    }
  });
  
  return {
    hp: hp,
    maxHp: hp,
    damage: damage,
    armor: armor,
    dodgeChance: dodgeChance,
    attackSpeed: attackSpeed,
    level: wave,
    name: bossName,
    element: element, // Boss element
    elementResistances: elementResistances, // Resistance to each element (0-100%)
    effects: {
      stunned: 0,
      slowed: 0,
      poisoned: 0,
      burning: [],
      frozen: 0,
      shocked: [],
      bleeding: [],
      poisonStacks: [],
      coldStacks: [],
      armorReduction: 0
    },
    playerEffects: {
      // Effects applied to player by boss
      burning: [],
      poisoned: [],
      frozen: 0,
      shocked: [],
      bleeding: []
    }
  };
}

// Start combat with countdown
// DIABLO 3/POE STYLE: Allow replaying previous bosses by specifying wave
function startCombat(waveNumber = null) {
  // Check if combat is already active
  if (combatSystem.active) {
    toast('Combat is already active! Finish the current battle first.', 'warn');
    return;
  }
  
  // Check if countdown is already running
  if (combatSystem.countdownTimer !== null) {
    toast('Countdown already in progress!', 'warn');
    return;
  }
  
  // If wave number is specified, use it (for replaying previous bosses)
  if (waveNumber !== null && waveNumber > 0) {
    // Check if player has defeated this wave before (for replay)
    if (waveNumber <= combatSystem.highestWaveDefeated + 1) {
      // Allow replaying any defeated wave or next wave
      combatSystem.bossWave = waveNumber;
      combatSystem.lastWaveDefeated = false; // Reset flag for replay
    } else {
      toast(`You must defeat wave ${combatSystem.highestWaveDefeated + 1} first!`, 'warn');
      return;
    }
  } else if (combatSystem.lastWaveDefeated) {
    // Normal progression - move to next wave
    combatSystem.bossWave++;
    combatSystem.lastWaveDefeated = false;
  } else if (combatSystem.bossWave === 0) {
    // First time starting combat - check if class is selected
    if (!save || !save.combat || !save.combat.playerClass) {
      // Show class selection modal
      showClassSelectionModal();
      return;
    }
    combatSystem.bossWave = 1;
  }
  // Otherwise, retry current wave (no change)
  
  // Start countdown
  startCombatCountdown();
}

// Start countdown before combat
function startCombatCountdown() {
  // Ensure combat is not active during countdown
  combatSystem.active = false;
  combatSystem.countdownSeconds = 3;
  
  // Show combat screen immediately
  const combatScreen = document.getElementById('combat-screen');
  if (combatScreen) {
    combatScreen.classList.remove('hidden');
  }
  
  // Update countdown display
  updateCountdownDisplay();
  
  // Start countdown interval
  combatSystem.countdownTimer = setInterval(() => {
    combatSystem.countdownSeconds--;
    
    if (combatSystem.countdownSeconds <= 0) {
      // Countdown finished, start actual combat
      clearInterval(combatSystem.countdownTimer);
      combatSystem.countdownTimer = null;
      startActualCombat();
    } else {
      updateCountdownDisplay();
      updateAttackButton();
      renderCombat();
    }
  }, 1000);
}

// Update countdown display
function updateCountdownDisplay() {
  const bossName = document.getElementById('boss-name');
  const bossWaveNumber = document.getElementById('boss-wave-number');
  const combatArena = document.querySelector('.combat-arena');
  
  if (bossName) {
    if (combatSystem.countdownSeconds > 0) {
      bossName.textContent = `Battle starts in ${combatSystem.countdownSeconds}...`;
    } else {
      bossName.textContent = combatSystem.boss ? combatSystem.boss.name : 'Boss';
    }
  }
  
  if (bossWaveNumber) {
    // Show current wave number
    bossWaveNumber.textContent = combatSystem.bossWave;
  }
  
  // Hide boss and player sections during countdown
  if (combatArena) {
    const bossSection = document.querySelector('.combat-boss');
    const playerSection = document.querySelector('.combat-player');
    if (bossSection) bossSection.style.opacity = combatSystem.countdownSeconds > 0 ? '0.3' : '1';
    if (playerSection) playerSection.style.opacity = combatSystem.countdownSeconds > 0 ? '0.3' : '1';
  }
}

// Start actual combat (after countdown)
function startActualCombat() {
  // Only increment wave if previous boss was defeated
  // If lastWaveDefeated is true, it means we can move to next wave
  // If boss exists, it means player lost and needs to retry same wave
  if (combatSystem.lastWaveDefeated) {
    // Previous boss was defeated, move to next wave
    combatSystem.bossWave++;
    combatSystem.lastWaveDefeated = false; // Reset flag
  } else if (combatSystem.bossWave === 0) {
    // First wave - start from wave 1
    combatSystem.bossWave = 1;
  }
  // Otherwise, keep same wave number for retry
  
  // Always generate new boss (even for retry, to reset HP)
  combatSystem.boss = generateBoss(combatSystem.bossWave);
  
  // Set active AFTER generating boss, but before starting loop
  combatSystem.active = true;
  combatSystem.lastAttackTime = Date.now();
  combatSystem.lastBossAttackTime = Date.now();
  
  calculatePlayerStats();
  combatSystem.player.hp = combatSystem.player.maxHp;
  combatSystem.player.hp = Math.max(0, Math.min(combatSystem.player.hp, combatSystem.player.maxHp)); // Ensure HP is valid
  
  renderCombat();
  
  // Start combat loop only if countdown is not running
  if (combatSystem.countdownTimer === null) {
    updateCombatLoop();
  }
}

// End combat
function endCombat(victory) {
  if (!combatSystem.active) return;
  
  combatSystem.active = false;
  
  const wasVictory = victory && combatSystem.boss;
  
  if (wasVictory) {
    // DIABLO 3/POE STYLE: Track highest wave defeated for replay system
    if (combatSystem.bossWave > combatSystem.highestWaveDefeated) {
      combatSystem.highestWaveDefeated = combatSystem.bossWave;
      // Save highest wave
      if (save && save.combat) {
        save.combat.highestWaveDefeated = combatSystem.highestWaveDefeated;
      }
    }
    
    // Calculate souls reward
    const soulsReward = Math.floor(10 + combatSystem.bossWave * 5);
    combatSystem.souls += soulsReward;
    
    // Save souls
    if (save && save.combat) {
      save.combat.souls = combatSystem.souls;
    }
    
    // Chance to drop items (can drop up to 3 items)
    const dropChance = Math.min(0.7, 0.3 + combatSystem.bossWave * 0.05);
    const maxDrops = 3;
    let dropCount = 0;
    
    // Try to drop items (up to 3)
    for (let i = 0; i < maxDrops; i++) {
      if (Math.random() < dropChance) {
        // Determine rarity based on wave
        let rarity = 'COMMON';
        const roll = Math.random();
        if (roll < 0.05) rarity = 'LEGENDARY';
        else if (roll < 0.15) rarity = 'EPIC';
        else if (roll < 0.35) rarity = 'RARE';
        else if (roll < 0.6) rarity = 'UNCOMMON';
        
        const item = generateItem(combatSystem.bossWave, rarity);
        addItemToInventory(item);
        dropCount++;
      }
    }
    
    if (dropCount > 0) {
      toast(`${dropCount} item${dropCount > 1 ? 's' : ''} dropped!`, 'good');
    }
    
    // Experience reward: 5% of current level's required experience
    if (window.experienceSystem && typeof window.experienceSystem.getExperienceToNext === 'function') {
      const experienceToNext = window.experienceSystem.getExperienceToNext();
      if (experienceToNext > 0) {
        const experienceReward = Math.floor(experienceToNext * 0.05);
        if (experienceReward > 0 && typeof window.experienceSystem.addExperience === 'function') {
          window.experienceSystem.addExperience(experienceReward, 'bossDefeat');
        }
      }
    }
    
    toast(`Boss defeated! +${soulsReward} Souls. You can now start the next wave.`, 'good');
    
    // Mark that this wave was defeated - allows next wave to start
    combatSystem.lastWaveDefeated = true;
    // Clear boss only on victory - this allows next wave to start
    combatSystem.boss = null;
  } else {
    // Player was defeated - boss remains, preventing next wave
    // Reset flag to prevent wave increment
    combatSystem.lastWaveDefeated = false;
    toast('You were defeated! Defeat the current boss to continue.', 'bad');
  }
  
  // Force update player HP display immediately after combat ends
  const playerHpBar = document.getElementById('player-hp-bar');
  const playerHpText = document.getElementById('player-hp-text');
  if (playerHpBar && playerHpText) {
    const currentHp = Math.max(0, Math.min(combatSystem.player.hp, combatSystem.player.maxHp));
    const playerHpPercent = Math.max(0, (currentHp / combatSystem.player.maxHp) * 100);
    playerHpBar.style.width = `${playerHpPercent}%`;
    playerHpText.textContent = `${Math.floor(currentHp)} / ${Math.floor(combatSystem.player.maxHp)}`;
  }
  
  renderCombat();
  updateAttackButton();
  saveCombatState();
}

// Add item to inventory
function addItemToInventory(item) {
  if (!item) return;
  
  // Initialize inventory if it doesn't exist
  if (!save) {
    console.error('Save object not available!');
    return;
  }
  
  if (!save.inventory) {
    save.inventory = {
      equipment: {},
      inventory: new Array(40).fill(null),
      stats: {
        hp: 100,
        maxHp: 100,
        damage: 10,
        armor: 0,
        critChance: 5,
        critMultiplier: 2.0,
        dodgeChance: 0,
        hpRegen: 0,
        mana: 50,
        maxMana: 50
      }
    };
  }
  
  if (!save.inventory.inventory) {
    save.inventory.inventory = new Array(40).fill(null);
  }
  
  const inventory = save.inventory.inventory;
  const emptySlot = inventory.findIndex(slot => slot === null);
  
  if (emptySlot !== -1) {
    inventory[emptySlot] = item;
    save.inventory.inventory = inventory;
    
    // Also update inventorySystem if it exists
    if (window.experienceSystem && window.experienceSystem.inventory) {
      const invSystem = window.experienceSystem.inventory;
      if (invSystem.getInventory) {
        // Sync with experience system inventory
        const expInventory = invSystem.getInventory();
        if (expInventory && emptySlot < expInventory.length) {
          expInventory[emptySlot] = item;
        }
      }
      if (invSystem.render) {
        invSystem.render();
      }
    }
    
    toast(`Added to inventory: ${item.name}`, 'info');
  } else {
    toast('Inventory is full!', 'warn');
  }
}

// Create developer stone (debug item)
function createDeveloperStone() {
  const devStone = {
    id: generateUniqueItemId('weapon'),
    type: 'weapon',
    weaponType: 'STONE',
    name: 'Developer Stone',
    level: 999,
    rarity: 'LEGENDARY',
    damage: 100000,
    damageType: 'PURE', // Pure damage type - universal, can be used by all classes
    attackSpeed: 10.0,
    effect: null, // No effect for stone
    hands: 1,
    icon: '🪨',
    stats: {
      hp: 100000,
      damage: 100000,
      armor: 500000,
      critChance: 100,
      critMultiplier: 100,
      dodge: 100,
      hpRegen: 1000,
      maxMana: 10000
    }
  };
  
  return devStone;
}

// Backward compatibility alias
function createDeveloperSword() {
  return createDeveloperStone();
}

// Equip item
function equipItem(item, slot) {
  if (!item) return;
  
  // CRITICAL: Check if this item is already equipped in any weapon slot FIRST
  // Prevent equipping the same item (by ID) in both hands
  const currentEquipped = combatSystem.player.equipped;
  if (item.id) {
    // Check if this item ID is already in right hand and we're trying to equip in left
    if (currentEquipped.weaponRight && currentEquipped.weaponRight.id === item.id && slot === 'weapon-left') {
      // Same item ID - use the same reference from right hand (don't create duplicate)
      // Remove item from inventory if it's there
      if (save && save.inventory && save.inventory.inventory) {
        const inventory = save.inventory.inventory;
        const itemIndex = inventory.findIndex(invItem => invItem && invItem.id === item.id);
        if (itemIndex !== -1) {
          inventory[itemIndex] = null;
        }
      }
      const currentItem = currentEquipped.weaponLeft;
      if (currentItem && currentItem.id !== item.id) {
        addItemToInventory(currentItem);
      }
      currentEquipped.weaponLeft = currentEquipped.weaponRight; // Use same reference
      calculatePlayerStats();
      saveCombatState();
      renderCombat();
      if (window.experienceSystem && window.experienceSystem.inventory && window.experienceSystem.inventory.render) {
        window.experienceSystem.inventory.render();
      }
      toast(`Equipped: ${item.name}`, 'good');
      return;
    }
    // Check if this item ID is already in left hand and we're trying to equip in right
    if (currentEquipped.weaponLeft && currentEquipped.weaponLeft.id === item.id && slot === 'weapon-right') {
      // Same item ID - use the same reference from left hand (don't create duplicate)
      // Remove item from inventory if it's there
      if (save && save.inventory && save.inventory.inventory) {
        const inventory = save.inventory.inventory;
        const itemIndex = inventory.findIndex(invItem => invItem && invItem.id === item.id);
        if (itemIndex !== -1) {
          inventory[itemIndex] = null;
        }
      }
      const currentItem = currentEquipped.weaponRight;
      if (currentItem && currentItem.id !== item.id) {
        addItemToInventory(currentItem);
      }
      currentEquipped.weaponRight = currentEquipped.weaponLeft; // Use same reference
      calculatePlayerStats();
      saveCombatState();
      renderCombat();
      if (window.experienceSystem && window.experienceSystem.inventory && window.experienceSystem.inventory.render) {
        window.experienceSystem.inventory.render();
      }
      toast(`Equipped: ${item.name}`, 'good');
      return;
    }
  }
  
  // Remove item from inventory (normal case - item is not already equipped)
  if (save && save.inventory && save.inventory.inventory) {
    const inventory = save.inventory.inventory;
    const itemIndex = inventory.findIndex(invItem => invItem && invItem.id === item.id);
    if (itemIndex !== -1) {
      inventory[itemIndex] = null;
    }
  }
  
  // Check if player class allows this weapon
  if (item.type === 'weapon' && item.weaponType !== 'SHIELD') {
    let playerClass = null;
    if (save && save.combat && save.combat.playerClass) {
      playerClass = CHARACTER_CLASSES[save.combat.playerClass];
    }
    
    if (playerClass && playerClass.allowedWeapons) {
      if (!playerClass.allowedWeapons.includes(item.weaponType)) {
        addItemToInventory(item);
        toast(`Your class (${playerClass.name}) cannot use ${item.weaponType.replace(/_/g, ' ')}!`, 'bad');
        return;
      }
    }
  }
  
  // Unequip current item in slot if exists
  let currentItem = null;
  if (item.type === 'weapon') {
    const weaponData = WEAPON_TYPES[item.weaponType];
    
    // SHIELD - только левая рука, совместим с SWORD или WAND
    if (item.weaponType === 'SHIELD') {
      if (slot && slot !== 'weapon-left') {
        addItemToInventory(item);
        toast('Shield can only be equipped in left hand!', 'warn');
        return;
      }
      
      currentItem = combatSystem.player.equipped.weaponLeft;
      if (currentItem) {
        addItemToInventory(currentItem);
      }
      
      // Shield can be equipped with SWORD, WAND, or without any weapon in right hand
      const rightWeapon = combatSystem.player.equipped.weaponRight;
      if (!rightWeapon || rightWeapon.weaponType === 'SWORD' || rightWeapon.weaponType === 'WAND') {
        // Can equip shield: no weapon, or compatible weapon (Sword/Wand)
        combatSystem.player.equipped.weaponLeft = item;
      } else {
        // Cannot equip shield with incompatible weapon (Dagger, Two-handed, etc.)
        addItemToInventory(item);
        toast('Shield cannot be equipped with this weapon type in right hand!', 'warn');
        return;
      }
    }
    // Двухручное оружие (TWOHANDED_SWORD, STAFF) - обе руки
    else if (item.hands === 2) {
      // Unequip both hands (including shield)
      currentItem = combatSystem.player.equipped.weaponRight;
      if (currentItem) addItemToInventory(currentItem);
      currentItem = combatSystem.player.equipped.weaponLeft;
      if (currentItem) addItemToInventory(currentItem); // Remove shield too
      combatSystem.player.equipped.weaponRight = item;
      combatSystem.player.equipped.weaponLeft = null; // Two-handed weapons occupy both hands
    }
    // SWORD - только правая рука
    else if (item.weaponType === 'SWORD') {
      if (slot && slot !== 'weapon-right') {
        addItemToInventory(item);
        toast('Sword can only be equipped in right hand!', 'warn');
        return;
      }
      
      currentItem = combatSystem.player.equipped.weaponRight;
      if (currentItem) addItemToInventory(currentItem);
      combatSystem.player.equipped.weaponRight = item;
      
      // Shield can stay in left hand
      // Remove incompatible left weapon
      if (combatSystem.player.equipped.weaponLeft && 
          combatSystem.player.equipped.weaponLeft.weaponType !== 'SHIELD') {
        addItemToInventory(combatSystem.player.equipped.weaponLeft);
        combatSystem.player.equipped.weaponLeft = null;
      }
    }
    // STONE - только правая рука (одноручное оружие)
    else if (item.weaponType === 'STONE') {
      if (slot && slot !== 'weapon-right') {
        addItemToInventory(item);
        toast('Stone can only be equipped in right hand!', 'warn');
        return;
      }
      
      currentItem = combatSystem.player.equipped.weaponRight;
      if (currentItem) addItemToInventory(currentItem);
      combatSystem.player.equipped.weaponRight = item;
      
      // Shield can stay in left hand
      // Remove incompatible left weapon
      if (combatSystem.player.equipped.weaponLeft && 
          combatSystem.player.equipped.weaponLeft.weaponType !== 'SHIELD') {
        addItemToInventory(combatSystem.player.equipped.weaponLeft);
        combatSystem.player.equipped.weaponLeft = null;
      }
    }
    // DAGGER - left dagger only in left hand, right dagger only in right hand
    else if (item.weaponType === 'DAGGER') {
      // Check if trying to equip dagger in left hand - only ROGUE can do this
      if (slot === 'weapon-left' || (!slot && combatSystem.player.equipped.weaponRight && combatSystem.player.equipped.weaponRight.weaponType === 'DAGGER')) {
        let playerClass = null;
        if (save && save.combat && save.combat.playerClass) {
          playerClass = CHARACTER_CLASSES[save.combat.playerClass];
        }
        
        // Only ROGUE can equip dagger in left hand
        if (!playerClass || playerClass.id !== 'ROGUE') {
          addItemToInventory(item);
          toast('Only Rogue can equip dagger in left hand! Other classes can only use dagger in right hand.', 'bad');
          return;
        }
      }
      
      // Check if item has weaponHand property (new system)
      if (item.weaponHand) {
        if (item.weaponHand === 'left' && slot !== 'weapon-left') {
          addItemToInventory(item);
          toast('Left Dagger can only be equipped in left hand!', 'warn');
          return;
        }
        if (item.weaponHand === 'right' && slot !== 'weapon-right') {
          addItemToInventory(item);
          toast('Right Dagger can only be equipped in right hand!', 'warn');
          return;
        }
      } else {
        // Backward compatibility: old daggers without weaponHand
        // Try to determine slot from context
        if (!slot) {
          // Auto-equip: try right first, then left (only if right has dagger)
          if (!combatSystem.player.equipped.weaponRight) {
            combatSystem.player.equipped.weaponRight = item;
          } else if (combatSystem.player.equipped.weaponRight.weaponType === 'DAGGER' && 
                     (!combatSystem.player.equipped.weaponLeft || combatSystem.player.equipped.weaponLeft.weaponType === 'SHIELD')) {
            if (combatSystem.player.equipped.weaponLeft) {
              addItemToInventory(combatSystem.player.equipped.weaponLeft);
            }
            combatSystem.player.equipped.weaponLeft = item;
          } else {
            currentItem = combatSystem.player.equipped.weaponRight;
            if (currentItem) addItemToInventory(currentItem);
            combatSystem.player.equipped.weaponRight = item;
            if (combatSystem.player.equipped.weaponLeft && combatSystem.player.equipped.weaponLeft.weaponType === 'SHIELD') {
              addItemToInventory(combatSystem.player.equipped.weaponLeft);
              combatSystem.player.equipped.weaponLeft = null;
            }
          }
        } else if (slot === 'weapon-right') {
          currentItem = combatSystem.player.equipped.weaponRight;
          if (currentItem) addItemToInventory(currentItem);
          combatSystem.player.equipped.weaponRight = item;
          if (combatSystem.player.equipped.weaponLeft && combatSystem.player.equipped.weaponLeft.weaponType === 'SHIELD') {
            addItemToInventory(combatSystem.player.equipped.weaponLeft);
            combatSystem.player.equipped.weaponLeft = null;
          }
        } else if (slot === 'weapon-left') {
          // Left dagger can be equipped regardless of what's in right hand
          // But only ROGUE can do this (check already done above)
          currentItem = combatSystem.player.equipped.weaponLeft;
          if (currentItem) {
            addItemToInventory(currentItem);
          }
          combatSystem.player.equipped.weaponLeft = item;
        }
        return;
      }
      
      // New system: equip based on weaponHand
      if (item.weaponHand === 'left' && slot === 'weapon-left') {
        // Left dagger can be equipped regardless of what's in right hand
        // But only ROGUE can do this (check already done above)
        currentItem = combatSystem.player.equipped.weaponLeft;
        if (currentItem) addItemToInventory(currentItem);
        combatSystem.player.equipped.weaponLeft = item;
      } else if (item.weaponHand === 'right' && slot === 'weapon-right') {
        currentItem = combatSystem.player.equipped.weaponRight;
        if (currentItem) addItemToInventory(currentItem);
        combatSystem.player.equipped.weaponRight = item;
        // Remove shield from left if equipping right dagger
        if (combatSystem.player.equipped.weaponLeft && combatSystem.player.equipped.weaponLeft.weaponType === 'SHIELD') {
          addItemToInventory(combatSystem.player.equipped.weaponLeft);
          combatSystem.player.equipped.weaponLeft = null;
        }
      }
    }
    // WAND - можно в правую ИЛИ левую, но только один жезл
    else if (item.weaponType === 'WAND') {
      // Check if wand is already equipped
      if (combatSystem.player.equipped.weaponRight && combatSystem.player.equipped.weaponRight.weaponType === 'WAND') {
        addItemToInventory(item);
        toast('Only one Wand can be equipped!', 'warn');
        return;
      }
      if (combatSystem.player.equipped.weaponLeft && combatSystem.player.equipped.weaponLeft.weaponType === 'WAND') {
        addItemToInventory(item);
        toast('Only one Wand can be equipped!', 'warn');
        return;
      }
      
      if (!slot || slot === 'weapon-right') {
        currentItem = combatSystem.player.equipped.weaponRight;
        if (currentItem) addItemToInventory(currentItem);
        combatSystem.player.equipped.weaponRight = item;
        // Shield can stay in left hand
        // Remove incompatible left weapon
        if (combatSystem.player.equipped.weaponLeft && 
            combatSystem.player.equipped.weaponLeft.weaponType !== 'SHIELD') {
          addItemToInventory(combatSystem.player.equipped.weaponLeft);
          combatSystem.player.equipped.weaponLeft = null;
        }
      } else if (slot === 'weapon-left') {
        currentItem = combatSystem.player.equipped.weaponLeft;
        if (currentItem) addItemToInventory(currentItem);
        combatSystem.player.equipped.weaponLeft = item;
        // Remove incompatible right weapon
        if (combatSystem.player.equipped.weaponRight && 
            combatSystem.player.equipped.weaponRight.weaponType !== 'SWORD') {
          addItemToInventory(combatSystem.player.equipped.weaponRight);
          combatSystem.player.equipped.weaponRight = null;
        }
      }
    }
  } else if (item.type === 'armor') {
    // Normalize armorType to lowercase to match slot names
    const normalizedArmorType = (item.armorType || '').toLowerCase();
    
    // Check if slot exists
    if (!combatSystem.player.equipped.hasOwnProperty(normalizedArmorType)) {
      addItemToInventory(item);
      toast(`Cannot equip ${item.name}: slot ${normalizedArmorType} not found!`, 'warn');
      return;
    }
    
    currentItem = combatSystem.player.equipped[normalizedArmorType];
    if (currentItem) {
      addItemToInventory(currentItem);
    }
    
    // Also update item.armorType to normalized value for consistency
    item.armorType = normalizedArmorType;
    combatSystem.player.equipped[normalizedArmorType] = item;
  }
  
  // CRITICAL: After equipping, check for duplicate weapons (same object in both hands)
  // This is a safety check to prevent duplicates when equipping daggers
  const equipped = combatSystem.player.equipped;
  if (equipped.weaponRight && equipped.weaponLeft && 
      equipped.weaponRight.hands !== 2 && equipped.weaponLeft.hands !== 2) {
    const sameByRef = equipped.weaponRight === equipped.weaponLeft;
    const sameById = equipped.weaponRight.id && equipped.weaponLeft.id && 
                     equipped.weaponRight.id === equipped.weaponLeft.id;
    
    // Only fix if they're different objects with same ID (duplicate)
    // Same reference is OK (intentional for same dagger), but different objects with same ID is a bug
    if (sameById && !sameByRef) {
      // Different objects with same ID - this is a duplicate! Use the same reference
      equipped.weaponLeft = equipped.weaponRight;
    }
  }
  
  calculatePlayerStats();
  saveCombatState();
  renderCombat();
  
  // Force inventory render to update equipment display
  if (window.experienceSystem && window.experienceSystem.inventory) {
    if (window.experienceSystem.inventory.render) {
      window.experienceSystem.inventory.render();
    }
  }
  
  toast(`Equipped: ${item.name}`, 'good');
}

// Unequip item
function unequipItem(slot) {
  if (!slot) {
    toast('Error: No slot specified', 'bad');
    return;
  }
  
  // Convert kebab-case to camelCase for weapon slots
  let actualSlot = slot;
  if (slot === 'weapon-right') {
    actualSlot = 'weaponRight';
  } else if (slot === 'weapon-left') {
    actualSlot = 'weaponLeft';
  }
  
  // Handle weapon slots
  if (slot === 'weapon-right' || slot === 'weapon-left') {
    const item = combatSystem.player.equipped[actualSlot];
    
    if (!item) {
      toast('No item to unequip in this slot', 'warn');
      return;
    }
    
    // If it's a two-handed weapon, it occupies both slots
    if (item.hands === 2 && slot === 'weapon-right') {
      combatSystem.player.equipped.weaponRight = null;
      combatSystem.player.equipped.weaponLeft = null;
    } else {
      combatSystem.player.equipped[actualSlot] = null;
    }
    
    addItemToInventory(item);
    calculatePlayerStats();
    saveCombatState();
    renderCombat();
    
    // Force inventory system to render (addItemToInventory already syncs)
    if (window.experienceSystem && window.experienceSystem.inventory && window.experienceSystem.inventory.render) {
      window.experienceSystem.inventory.render();
    }
    
    toast(`Unequipped: ${item.name}`, 'info');
    return;
  }
  
  // Handle armor slots
  const item = combatSystem.player.equipped[slot];
  
  if (!item) {
    toast('No item to unequip in this slot', 'warn');
    return;
  }
  
  combatSystem.player.equipped[slot] = null;
  addItemToInventory(item);
  calculatePlayerStats();
  saveCombatState();
  renderCombat();
  
  // Force inventory system to render (addItemToInventory already syncs)
  if (window.experienceSystem && window.experienceSystem.inventory && window.experienceSystem.inventory.render) {
    window.experienceSystem.inventory.render();
  }
  
  toast(`Unequipped: ${item.name}`, 'info');
}

// Player attack
function playerAttack() {
  if (!combatSystem.active || !combatSystem.boss) {
    toast('No active combat!', 'warn');
    return;
  }
  
  // Check if player has a weapon equipped
  const rightWeapon = combatSystem.player.equipped.weaponRight;
  if (!rightWeapon) {
    toast('You need a weapon to attack! Equip a weapon from inventory.', 'bad');
    return;
  }
  
  const now = Date.now();
  
  // Get attack speed from weapon or default to 1.0
  let attackSpeed = 1.0;
  if (rightWeapon && rightWeapon.attackSpeed) {
    attackSpeed = rightWeapon.attackSpeed;
  } else {
    attackSpeed = 1.0; // Default attack speed if no weapon
  }
  
  const attackCooldown = 1000 / attackSpeed;
  
  // Check cooldown
  if (now - combatSystem.lastAttackTime < attackCooldown) {
    const remainingCooldown = ((attackCooldown - (now - combatSystem.lastAttackTime)) / 1000).toFixed(1);
    toast(`Attack on cooldown! ${remainingCooldown}s remaining`, 'warn');
    return;
  }
  
  combatSystem.lastAttackTime = now;
  
  // Check if player is frozen (cannot attack)
  if (combatSystem.boss && combatSystem.boss.playerEffects && combatSystem.boss.playerEffects.frozen > 0) {
    if (now < combatSystem.boss.playerEffects.frozen) {
      toast('You are frozen!', 'warn');
      return;
    }
  }
  
  // Get player class damage types (can be array for classes with multiple types)
  // PURE damage is universal and always available to all classes
  let playerDamageTypes = ['PHYSICAL', 'PURE']; // Default (PURE is always available)
  if (save && save.combat && save.combat.playerClass) {
    const classData = CHARACTER_CLASSES[save.combat.playerClass];
    if (classData) {
      // Check if class has multiple damage types
      if (classData.damageTypes && Array.isArray(classData.damageTypes)) {
        playerDamageTypes = [...classData.damageTypes, 'PURE']; // Add PURE to all classes
      } else if (classData.damageType) {
        // Single damage type (backward compatibility)
        playerDamageTypes = [classData.damageType, 'PURE']; // Add PURE to all classes
      }
    }
  }
  
  // Calculate base damage from player stats (excluding weapon damage)
  // We need to subtract weapon damage that was already added in calculatePlayerStats
  let baseDamage = combatSystem.player.damage;
  
  // Subtract weapon damage if it was already included in player.damage
  if (rightWeapon && rightWeapon.stats && rightWeapon.stats.damage) {
    // Get original weapon damage (before any multipliers)
    const originalWeaponDamage = rightWeapon.stats.damage;
    
    // Check if class bonuses were applied (wand/staff/bow/crossbow multipliers)
    let weaponDamageMultiplier = 1.0;
    if (save && save.combat && save.combat.playerClass) {
      const classData = CHARACTER_CLASSES[save.combat.playerClass];
      if (classData && classData.bonuses) {
        if ((rightWeapon.weaponType === 'WAND' || rightWeapon.weaponType === 'STAFF') && 
            classData.bonuses.wandStaffDamageMultiplier) {
          weaponDamageMultiplier = classData.bonuses.wandStaffDamageMultiplier;
        } else if ((rightWeapon.weaponType === 'BOW' || rightWeapon.weaponType === 'CROSSBOW') && 
                   classData.bonuses.bowCrossbowDamageMultiplier) {
          weaponDamageMultiplier = classData.bonuses.bowCrossbowDamageMultiplier;
        } else if (classData.bonuses.damageMultiplier) {
          weaponDamageMultiplier = classData.bonuses.damageMultiplier;
        }
      }
    }
    
    // Subtract the weapon damage that was already added (with multipliers)
    const addedWeaponDamage = Math.floor(originalWeaponDamage * weaponDamageMultiplier);
    baseDamage = Math.max(0, baseDamage - addedWeaponDamage);
  }
  
  // Calculate weapon damage with type conversion
  let weaponDamage = 0;
  if (rightWeapon && rightWeapon.stats && rightWeapon.stats.damage) {
    weaponDamage = rightWeapon.stats.damage;
    
    // Get weapon damage type (default to PHYSICAL if not set for backward compatibility)
    const weaponDamageType = rightWeapon.damageType || 'PHYSICAL';
    
    // Convert damage if weapon type doesn't match any of player class types (10:1 conversion)
    // PURE damage type is universal and never needs conversion
    // If weapon type matches one of the class's damage types, no conversion needed
    const needsConversion = weaponDamageType !== 'PURE' && !playerDamageTypes.includes(weaponDamageType);
    if (needsConversion) {
      weaponDamage = Math.floor(weaponDamage / 10); // 10:1 conversion
    }
    
    // Apply class bonuses to converted weapon damage
    if (save && save.combat && save.combat.playerClass) {
      const classData = CHARACTER_CLASSES[save.combat.playerClass];
      if (classData && classData.bonuses) {
        if ((rightWeapon.weaponType === 'WAND' || rightWeapon.weaponType === 'STAFF') && 
            classData.bonuses.wandStaffDamageMultiplier) {
          weaponDamage = Math.floor(weaponDamage * classData.bonuses.wandStaffDamageMultiplier);
        } else if ((rightWeapon.weaponType === 'BOW' || rightWeapon.weaponType === 'CROSSBOW') && 
                   classData.bonuses.bowCrossbowDamageMultiplier) {
          weaponDamage = Math.floor(weaponDamage * classData.bonuses.bowCrossbowDamageMultiplier);
        } else if (classData.bonuses.damageMultiplier) {
          weaponDamage = Math.floor(weaponDamage * classData.bonuses.damageMultiplier);
        }
      }
    }
  }
  
  // Total damage = base damage (from stats, excluding weapon) + converted weapon damage
  let damage = baseDamage + weaponDamage;
  
  // Check for crit (shocked stacks on boss increase crit chance, shocked stacks on player reduce damage)
  let critChance = combatSystem.player.critChance;
  if (combatSystem.boss.effects.shocked && combatSystem.boss.effects.shocked.length > 0) {
    critChance += combatSystem.boss.effects.shocked.length * 5; // +5% crit per stack
  }
  
  // Apply shocked effect from boss (reduces player damage)
  let damageMultiplier = 1.0;
  if (combatSystem.boss && combatSystem.boss.playerEffects && combatSystem.boss.playerEffects.shocked) {
    const shockedStacks = combatSystem.boss.playerEffects.shocked.length;
    damageMultiplier = 1 - (shockedStacks * 0.1); // 10% damage reduction per stack
    damageMultiplier = Math.max(0.5, damageMultiplier); // Minimum 50% damage
  }
  
  let isCrit = false;
  if (Math.random() * 100 < critChance) {
    damage *= combatSystem.player.critMultiplier;
    isCrit = true;
    showCombatText('CRIT!', '#ffd700', combatSystem.boss, 'left', '1.5rem');
  }
  
  damage *= damageMultiplier;
  
  // Check boss dodge
  if (combatSystem.boss.dodgeChance && Math.random() * 100 < combatSystem.boss.dodgeChance) {
    showCombatText('MISS!', '#888888', combatSystem.boss);
    renderCombat();
    updateAttackButton();
    return;
  }
  
  // Apply boss armor reduction (bleed stacks reduce armor)
  // REBALANCE: Percentage-based armor reduction instead of linear (proposal 3)
  let bossArmor = combatSystem.boss.armor || 0;
  if (combatSystem.boss.effects && combatSystem.boss.effects.armorReduction) {
    bossArmor *= (1 - combatSystem.boss.effects.armorReduction);
  }
  if (bossArmor > 0) {
    // Percentage-based damage reduction (max 70% reduction)
    const damageReduction = Math.min(0.7, bossArmor / (bossArmor + 100));
    damage = Math.max(1, damage * (1 - damageReduction));
  }
  
  // Apply main damage (converted to player's damage type)
  // Damage is already the correct type (PHYSICAL, MAGICAL, HOLY, or DARK) based on class
  combatSystem.boss.hp -= damage;
  combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
  // Show crit damage larger and to the left, normal damage in center
  showCombatText(`-${Math.floor(damage)}`, '#ff6666', combatSystem.boss, isCrit ? 'left' : 'center', isCrit ? '1.5rem' : null);
  
  // Apply element damage (primary and additional)
  // DIABLO 3/POE STYLE: Apply elemental resistances
  if (rightWeapon && rightWeapon.stats) {
    // Process all element damage stats
    Object.keys(rightWeapon.stats).forEach(statKey => {
      if (statKey.startsWith('elementDamage_')) {
        const element = statKey.replace('elementDamage_', '');
        let elementDamage = rightWeapon.stats[statKey];
        
        // Apply elemental resistance (reduce damage by resistance percentage)
        if (combatSystem.boss.elementResistances && combatSystem.boss.elementResistances[element] !== undefined) {
          const resistance = combatSystem.boss.elementResistances[element];
          elementDamage = Math.floor(elementDamage * (1 - resistance / 100));
        }
        
        // Apply class element damage multiplier (Mage)
        if (save && save.combat && save.combat.playerClass) {
          const classData = CHARACTER_CLASSES[save.combat.playerClass];
          if (classData && classData.bonuses && classData.bonuses.elementDamageMultiplier) {
            elementDamage = Math.floor(elementDamage * classData.bonuses.elementDamageMultiplier);
          }
        }
        
        // Apply element damage
        if (elementDamage > 0) {
          combatSystem.boss.hp -= elementDamage;
          combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
          showCombatText(`-${Math.floor(elementDamage)} ${ELEMENT_TYPES[element].name}`, ELEMENT_TYPES[element].color, combatSystem.boss, 'right');
        }
      }
    });
  }
  
  // Apply weapon element effects
  // Primary element (for magical weapons) - high chance to apply effect
  if (rightWeapon && rightWeapon.element) {
    applyElementEffect(rightWeapon.element, isCrit, rightWeapon, true); // true = isPrimaryElement
  }
  
  // Additional element (for physical weapons or secondary element for magical) - low chance to apply effect
  if (rightWeapon && rightWeapon.additionalElement) {
    applyElementEffect(rightWeapon.additionalElement, isCrit, rightWeapon, false); // false = isPrimaryElement
  }
  
  if (combatSystem.boss.hp <= 0) {
    combatSystem.boss.hp = 0; // Ensure HP is exactly 0
    endCombat(true);
    return;
  }
  
  renderCombat();
  updateAttackButton();
}

// Apply element effect
// isPrimaryElement: true for primary element (high chance), false for additional element (low chance)
function applyElementEffect(element, isCrit, weapon, isPrimaryElement = true) {
  if (!combatSystem.boss) return;
  
  // Initialize effects object if needed
  if (!combatSystem.boss.effects) {
    combatSystem.boss.effects = {
      stunned: 0,
      slowed: 0,
      poisoned: 0,
      burning: [],
      frozen: 0,
      shocked: [],
      bleeding: []
    };
  }
  
  // Calculate effect chance based on weapon rarity and level
  // Primary element has much higher base chance than additional element
  let baseEffectChance = isPrimaryElement ? 0.15 : 0.05; // 15% for primary, 5% for additional
  let effectChanceMultiplier = 1.0;
  if (weapon) {
    // Base chance multiplier from rarity (1.0 for COMMON, up to 2.0 for LEGENDARY)
    const rarityMultipliers = {
      'COMMON': 1.0,
      'UNCOMMON': 1.2,
      'RARE': 1.4,
      'EPIC': 1.7,
      'LEGENDARY': 2.0
    };
    const rarityMultiplier = rarityMultipliers[weapon.rarity] || 1.0;
    
    // Level bonus: +2% per level (max +50% at level 25)
    const levelBonus = Math.min(0.5, (weapon.level || 1) * 0.02);
    
    effectChanceMultiplier = rarityMultiplier * (1 + levelBonus);
  }
  
  const now = Date.now();
  const effectDuration = 5000; // 5 seconds
  
  switch (element) {
    case 'FIRE':
      // Fire: extra fire damage, chance to burn (stacks up to 30)
      // Base chance scales with rarity and level, higher for primary element
      const burnChance = Math.min(0.95, baseEffectChance * effectChanceMultiplier);
      if (Math.random() < burnChance) {
        const burnDamage = Math.floor(combatSystem.player.damage * 0.05);
        if (!combatSystem.boss.effects.burning) {
          combatSystem.boss.effects.burning = [];
        }
        // Update timer and damage for all existing stacks
        if (combatSystem.boss.effects.burning.length > 0) {
          combatSystem.boss.effects.burning.forEach(burn => {
            burn.startTime = now;
            burn.damage = burnDamage; // Update damage to current damage
          });
        }
        // Add new stack if under limit (30 stacks)
        if (combatSystem.boss.effects.burning.length < 30) {
          combatSystem.boss.effects.burning.push({
            startTime: now,
            duration: effectDuration,
            damage: burnDamage
          });
        }
        showCombatText('BURNING!', ELEMENT_TYPES.FIRE.color, combatSystem.boss, 'center');
      }
      break;
      
    case 'POISON':
      // Poison: extra poison damage, increases incoming damage, chance to poison (stacks up to 30)
      // Base chance scales with rarity and level, higher for primary element
      // Duration: 15 seconds for boss (longer than player poison)
      const poisonChance = Math.min(0.95, baseEffectChance * effectChanceMultiplier);
      const poisonDuration = 15000; // 15 seconds for boss
      if (Math.random() < poisonChance) {
        let poisonDamage = Math.floor(combatSystem.player.damage * 0.02);
        // Apply class DoT multiplier (Necromancer, Ranger)
        if (save && save.combat && save.combat.playerClass) {
          const classData = CHARACTER_CLASSES[save.combat.playerClass];
          if (classData && classData.bonuses && classData.bonuses.dotDamageMultiplier) {
            poisonDamage = Math.floor(poisonDamage * classData.bonuses.dotDamageMultiplier);
          }
        }
        combatSystem.boss.effects.poisoned = Math.max(combatSystem.boss.effects.poisoned || 0, now + poisonDuration);
        // Poison increases incoming damage (handled in damage calculation)
        if (!combatSystem.boss.effects.poisonStacks) {
          combatSystem.boss.effects.poisonStacks = [];
        }
        // Update timer and damage for all existing stacks
        if (combatSystem.boss.effects.poisonStacks.length > 0) {
          combatSystem.boss.effects.poisonStacks.forEach(poison => {
            poison.startTime = now;
            poison.damage = poisonDamage; // Update damage to current damage
          });
        }
        // Add new stack if under limit (30 stacks)
        if (combatSystem.boss.effects.poisonStacks.length < 30) {
          combatSystem.boss.effects.poisonStacks.push({
            startTime: now,
            duration: poisonDuration, // 15 seconds for boss
            damage: poisonDamage
          });
        }
        showCombatText('POISONED!', ELEMENT_TYPES.POISON.color, combatSystem.boss, 'center');
      }
      break;
      
    case 'COLD':
      // Cold: extra cold damage, chance to slow (stacks up to 5 times), chance to freeze (3 seconds)
      // Base chances scale with rarity and level, higher for primary element
      const slowChance = Math.min(0.95, baseEffectChance * 1.67 * effectChanceMultiplier); // ~25% for primary, ~8% for additional
      const freezeChance = Math.min(0.95, baseEffectChance * 0.53 * effectChanceMultiplier); // ~8% for primary, ~2.5% for additional
      
      if (Math.random() < slowChance) {
        if (!combatSystem.boss.effects.coldStacks) {
          combatSystem.boss.effects.coldStacks = [];
        }
        // Update timer for all existing stacks
        if (combatSystem.boss.effects.coldStacks.length > 0) {
          combatSystem.boss.effects.coldStacks.forEach(cold => {
            cold.startTime = now;
          });
        }
        // Add new stack if under limit
        if (combatSystem.boss.effects.coldStacks.length < 5) {
          combatSystem.boss.effects.coldStacks.push({
            startTime: now,
            duration: effectDuration
          });
        }
        combatSystem.boss.effects.slowed = Math.max(combatSystem.boss.effects.slowed || 0, now + effectDuration);
        showCombatText('SLOWED!', ELEMENT_TYPES.COLD.color, combatSystem.boss, 'center');
      }
      
      if (Math.random() < freezeChance) {
        combatSystem.boss.effects.frozen = now + 3000; // 3 seconds freeze
        showCombatText('FROZEN!', ELEMENT_TYPES.COLD.color, combatSystem.boss, 'center');
      }
      break;
      
    case 'LIGHTNING':
      // Lightning: extra lightning damage, chance to increase crit chance (stacks up to 5 times, 5 seconds)
      // Base chance scales with rarity and level, higher for primary element
      const shockChance = Math.min(0.95, baseEffectChance * 1.33 * effectChanceMultiplier); // ~20% for primary, ~6.7% for additional
      if (Math.random() < shockChance) {
        if (!combatSystem.boss.effects.shocked) {
          combatSystem.boss.effects.shocked = [];
        }
        // Update timer for all existing stacks
        if (combatSystem.boss.effects.shocked.length > 0) {
          combatSystem.boss.effects.shocked.forEach(shock => {
            shock.startTime = now;
          });
        }
        // Add new stack if under limit
        if (combatSystem.boss.effects.shocked.length < 5) {
          combatSystem.boss.effects.shocked.push({
            startTime: now,
            duration: effectDuration
          });
        }
        showCombatText('SHOCKED!', ELEMENT_TYPES.LIGHTNING.color, combatSystem.boss, 'center');
      }
      break;
      
    case 'BLEED':
      // Bleed: no extra damage, chance to bleed (stacks up to 15 times, each stack breaks armor)
      // Base chance scales with rarity and level, higher for primary element
      const bleedChance = Math.min(0.95, baseEffectChance * 1.67 * effectChanceMultiplier); // ~25% for primary, ~8% for additional
      if (Math.random() < bleedChance) {
        if (!combatSystem.boss.effects.bleeding) {
          combatSystem.boss.effects.bleeding = [];
        }
        let bleedDamage = Math.floor(combatSystem.player.damage * 0.08);
        // Apply class DoT multiplier (Necromancer, Ranger)
        if (save && save.combat && save.combat.playerClass) {
          const classData = CHARACTER_CLASSES[save.combat.playerClass];
          if (classData && classData.bonuses && classData.bonuses.dotDamageMultiplier) {
            bleedDamage = Math.floor(bleedDamage * classData.bonuses.dotDamageMultiplier);
          }
        }
        // Update timer and damage for all existing stacks
        if (combatSystem.boss.effects.bleeding.length > 0) {
          combatSystem.boss.effects.bleeding.forEach(bleed => {
            bleed.startTime = now;
            bleed.damage = bleedDamage; // Update damage to current damage
          });
        }
        // Add new stack if under limit
        if (combatSystem.boss.effects.bleeding.length < 15) {
          combatSystem.boss.effects.bleeding.push({
            startTime: now,
            duration: effectDuration,
            damage: bleedDamage
          });
          // Each stack reduces armor by 2%
          if (!combatSystem.boss.effects.armorReduction) {
            combatSystem.boss.effects.armorReduction = 0;
          }
          combatSystem.boss.effects.armorReduction += 0.02;
        }
        showCombatText('BLEEDING!', ELEMENT_TYPES.BLEED.color, combatSystem.boss, 'center');
      }
      break;
  }
}

// Boss attack
function bossAttack() {
  if (!combatSystem.active || !combatSystem.boss) return;
  
  const now = Date.now();
  let attackCooldown = 1000 / combatSystem.boss.attackSpeed;
  
  // Apply slowed effect
  if (combatSystem.boss.effects.slowed > 0) {
    attackCooldown *= 1.5; // 50% slower
  }
  
  if (now - combatSystem.lastBossAttackTime < attackCooldown) return;
  if (combatSystem.boss.effects.stunned > 0) return; // Boss is stunned
  if (combatSystem.boss.effects.frozen > 0 && now < combatSystem.boss.effects.frozen) return; // Boss is frozen
  
  combatSystem.lastBossAttackTime = now;
  
  // Check for dodge
  if (Math.random() * 100 < combatSystem.player.dodgeChance) {
    showCombatText('DODGE!', '#00ff00', combatSystem.player);
    renderCombat();
    return;
  }
  
  // Calculate damage
  let damage = combatSystem.boss.damage;
  
  // Apply armor reduction
  damage = Math.max(1, damage - combatSystem.player.armor * 0.5);
  
  // Apply poison effect (reduces boss damage, more stacks = more reduction)
  if (combatSystem.boss.effects.poisonStacks && combatSystem.boss.effects.poisonStacks.length > 0) {
    const poisonReduction = 1 - (combatSystem.boss.effects.poisonStacks.length * 0.05); // 5% per stack
    damage *= Math.max(0.3, poisonReduction); // Minimum 30% damage
  }
  
  // Check for block chance (reduces damage by 50%)
  let blocked = false;
  if (combatSystem.player.blockChance > 0 && Math.random() * 100 < combatSystem.player.blockChance) {
    damage *= 0.5; // Block reduces damage by 50%
    blocked = true;
    showCombatText('BLOCKED!', '#00aaff', combatSystem.player);
  }
  
  // Check for reflect chance (reflects 10% of original damage back to boss)
  if (combatSystem.player.reflectChance > 0 && Math.random() * 100 < combatSystem.player.reflectChance) {
    const originalDamage = combatSystem.boss.damage;
    const reflectDamage = originalDamage * 0.1;
    combatSystem.boss.hp -= reflectDamage;
    combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
    showCombatText(`REFLECT! -${Math.floor(reflectDamage)}`, '#ffaa00', combatSystem.boss);
    
    if (combatSystem.boss.hp <= 0) {
      combatSystem.boss.hp = 0;
      endCombat(true);
      return;
    }
  }
  
  combatSystem.player.hp -= damage;
  combatSystem.player.hp = Math.max(0, combatSystem.player.hp); // Ensure HP never goes below 0
  if (!blocked) {
    showCombatText(`-${Math.floor(damage)}`, '#ff0000', combatSystem.player);
  }
  
  // Apply boss element effects to player
  if (combatSystem.boss.element) {
    applyBossElementToPlayer(combatSystem.boss.element, now);
  }
  
  if (combatSystem.player.hp <= 0) {
    combatSystem.player.hp = 0; // Ensure HP is exactly 0
    endCombat(false);
    toast('You were defeated! Try again.', 'bad');
    return;
  }
  
  renderCombat();
}

// Apply boss element effects to player
function applyBossElementToPlayer(element, now) {
  if (!combatSystem.boss || !combatSystem.boss.playerEffects) return;
  
  const effectDuration = 5000; // 5 seconds
  const elementData = ELEMENT_TYPES[element];
  if (!elementData) return;
  
  switch (element) {
    case 'FIRE':
      // DIABLO 3/POE STYLE: Apply elemental resistance to effect chance and damage
      // Resistance reduces both chance to apply effect and damage dealt
      const fireResistance = combatSystem.player.elementResistances ? combatSystem.player.elementResistances.FIRE || 0 : 0;
      const fireEffectChance = 0.3 * (1 - fireResistance / 100); // Reduced chance based on resistance
      
      if (Math.random() < fireEffectChance) {
        let burnDamage = Math.floor(combatSystem.boss.damage * 0.1);
        // Apply resistance to damage
        burnDamage = Math.floor(burnDamage * (1 - fireResistance / 100));
        
        if (!combatSystem.boss.playerEffects.burning) {
          combatSystem.boss.playerEffects.burning = [];
        }
        // Update timer and damage for all existing stacks
        if (combatSystem.boss.playerEffects.burning.length > 0) {
          combatSystem.boss.playerEffects.burning.forEach(burn => {
            burn.startTime = now;
            burn.damage = burnDamage; // Update damage to current damage
          });
        }
        // Add new stack if under limit (30 stacks)
        if (combatSystem.boss.playerEffects.burning.length < 30) {
          combatSystem.boss.playerEffects.burning.push({
            startTime: now,
            duration: effectDuration,
            damage: burnDamage
          });
        }
        showCombatText('BURNING!', elementData.color, combatSystem.player);
      }
      break;
      
    case 'POISON':
      // Poison: chance to poison player (5 seconds duration, stacks up to 30)
      if (Math.random() < 0.4) {
        const poisonDamage = Math.floor(combatSystem.boss.damage * 0.05);
        if (!combatSystem.boss.playerEffects.poisoned) {
          combatSystem.boss.playerEffects.poisoned = [];
        }
        // Update timer and damage for all existing stacks
        if (combatSystem.boss.playerEffects.poisoned.length > 0) {
          combatSystem.boss.playerEffects.poisoned.forEach(poison => {
            poison.startTime = now;
            poison.damage = poisonDamage; // Update damage to current damage
          });
        }
        // Add new stack if under limit (30 stacks)
        if (combatSystem.boss.playerEffects.poisoned.length < 30) {
          combatSystem.boss.playerEffects.poisoned.push({
            startTime: now,
            duration: effectDuration, // 5 seconds
            damage: poisonDamage
          });
        }
        showCombatText('POISONED!', elementData.color, combatSystem.player);
      }
      break;
      
    case 'COLD':
      // Cold: chance to freeze player
      if (Math.random() < 0.15) {
        combatSystem.boss.playerEffects.frozen = now + 2000; // 2 seconds freeze
        showCombatText('FROZEN!', elementData.color, combatSystem.player);
      }
      break;
      
    case 'LIGHTNING':
      // Lightning: chance to shock player (reduces player damage)
      if (Math.random() < 0.4) {
        if (!combatSystem.boss.playerEffects.shocked) {
          combatSystem.boss.playerEffects.shocked = [];
        }
        // Update timer for all existing stacks
        if (combatSystem.boss.playerEffects.shocked.length > 0) {
          combatSystem.boss.playerEffects.shocked.forEach(shock => {
            shock.startTime = now;
          });
        }
        // Add new stack if under limit
        if (combatSystem.boss.playerEffects.shocked.length < 5) {
          combatSystem.boss.playerEffects.shocked.push({
            startTime: now,
            duration: effectDuration
          });
        }
        showCombatText('SHOCKED!', elementData.color, combatSystem.player);
      }
      break;
      
    case 'BLEED':
      // Bleed: chance to bleed player
      if (Math.random() < 0.5) {
        const bleedDamage = Math.floor(combatSystem.boss.damage * 0.08);
        if (!combatSystem.boss.playerEffects.bleeding) {
          combatSystem.boss.playerEffects.bleeding = [];
        }
        // Update timer and damage for all existing stacks
        if (combatSystem.boss.playerEffects.bleeding.length > 0) {
          combatSystem.boss.playerEffects.bleeding.forEach(bleed => {
            bleed.startTime = now;
            bleed.damage = bleedDamage; // Update damage to current damage
          });
        }
        // Add new stack if under limit
        if (combatSystem.boss.playerEffects.bleeding.length < 15) {
          combatSystem.boss.playerEffects.bleeding.push({
            startTime: now,
            duration: effectDuration,
            damage: bleedDamage
          });
        }
        showCombatText('BLEEDING!', elementData.color, combatSystem.player);
      }
      break;
  }
}

// Auto-attack state
let autoAttackEnabled = false;

// Update combat loop
function updateCombatLoop() {
  // Don't update if combat is not active
  if (!combatSystem.active) {
    return;
  }
  
  // Don't update if countdown is running - stop the loop
  if (combatSystem.countdownTimer !== null) {
    return; // Stop the loop, don't schedule next frame
  }
  
  const now = Date.now();
  
  // Auto-attack if enabled
  if (autoAttackEnabled && combatSystem.boss && combatSystem.boss.hp > 0) {
    const rightWeapon = combatSystem.player.equipped.weaponRight;
    if (rightWeapon) {
      // Check if attack is off cooldown
      let attackSpeed = rightWeapon.attackSpeed || 1.0;
      const attackCooldown = 1000 / attackSpeed;
      if (now - combatSystem.lastAttackTime >= attackCooldown) {
        // Check if player is frozen
        if (!combatSystem.boss.playerEffects || !combatSystem.boss.playerEffects.frozen || now >= combatSystem.boss.playerEffects.frozen) {
          playerAttack();
        }
      }
    }
  }
  
  // Update player effects from boss
  if (combatSystem.boss && combatSystem.boss.playerEffects) {
    const playerEffects = combatSystem.boss.playerEffects;
    
    // Update burning effects on player
    if (playerEffects.burning && playerEffects.burning.length > 0) {
      playerEffects.burning = playerEffects.burning.filter(burn => {
        const elapsed = now - burn.startTime;
        if (elapsed < burn.duration) {
          if (elapsed % 1000 < 16) {
            combatSystem.player.hp -= burn.damage;
            combatSystem.player.hp = Math.max(0, combatSystem.player.hp);
            showCombatText(`-${Math.floor(burn.damage)}`, ELEMENT_TYPES.FIRE.color, combatSystem.player, 'right');
            if (combatSystem.player.hp <= 0) {
              combatSystem.player.hp = 0;
              endCombat(false);
              toast('You were defeated!', 'bad');
              return false;
            }
          }
          return true;
        }
        return false;
      });
    }
    
    // Update poison effects on player
    if (playerEffects.poisoned && playerEffects.poisoned.length > 0) {
      playerEffects.poisoned = playerEffects.poisoned.filter(poison => {
        const elapsed = now - poison.startTime;
        if (elapsed < poison.duration) {
          if (elapsed % 1000 < 16) {
            combatSystem.player.hp -= poison.damage;
            combatSystem.player.hp = Math.max(0, combatSystem.player.hp);
            showCombatText(`-${Math.floor(poison.damage)}`, ELEMENT_TYPES.POISON.color, combatSystem.player, 'right');
            if (combatSystem.player.hp <= 0) {
              combatSystem.player.hp = 0;
              endCombat(false);
              toast('You were defeated!', 'bad');
              return false;
            }
          }
          return true;
        }
        return false;
      });
    }
    
    // Update bleeding effects on player
    if (playerEffects.bleeding && playerEffects.bleeding.length > 0) {
      playerEffects.bleeding = playerEffects.bleeding.filter(bleed => {
        const elapsed = now - bleed.startTime;
        if (elapsed < bleed.duration) {
          if (elapsed % 1000 < 16) {
            combatSystem.player.hp -= bleed.damage;
            combatSystem.player.hp = Math.max(0, combatSystem.player.hp);
            showCombatText(`-${Math.floor(bleed.damage)}`, ELEMENT_TYPES.BLEED.color, combatSystem.player, 'right');
            if (combatSystem.player.hp <= 0) {
              combatSystem.player.hp = 0;
              endCombat(false);
              toast('You were defeated!', 'bad');
              return false;
            }
          }
          return true;
        }
        return false;
      });
    }
    
    // Update frozen effect on player
    if (playerEffects.frozen > 0 && now >= playerEffects.frozen) {
      playerEffects.frozen = 0;
    }
    
    // Update shocked effect on player (reduces player damage)
    if (playerEffects.shocked && playerEffects.shocked.length > 0) {
      playerEffects.shocked = playerEffects.shocked.filter(shock => {
        const elapsed = now - shock.startTime;
        return elapsed < shock.duration;
      });
    }
  }
  
  // Update effects
  if (combatSystem.boss && combatSystem.boss.effects) {
    // Update burning effects (Fire)
    if (combatSystem.boss.effects.burning && combatSystem.boss.effects.burning.length > 0) {
      combatSystem.boss.effects.burning = combatSystem.boss.effects.burning.filter(burn => {
        const elapsed = now - burn.startTime;
        if (elapsed < burn.duration) {
          // Apply damage every second
          if (elapsed % 1000 < 16) {
            combatSystem.boss.hp -= burn.damage;
            combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
            showCombatText(`-${Math.floor(burn.damage)}`, ELEMENT_TYPES.FIRE.color, combatSystem.boss, 'right');
            if (combatSystem.boss.hp <= 0) {
              combatSystem.boss.hp = 0;
              endCombat(true);
              return false;
            }
          }
          return true;
        }
        return false;
      });
    }
    
    // Update poison stacks (Poison)
    if (combatSystem.boss.effects.poisonStacks && combatSystem.boss.effects.poisonStacks.length > 0) {
      combatSystem.boss.effects.poisonStacks = combatSystem.boss.effects.poisonStacks.filter(poison => {
        const elapsed = now - poison.startTime;
        if (elapsed < poison.duration) {
          // Apply damage every second
          // Note: poison.damage already includes class bonuses from when it was applied
          if (elapsed % 1000 < 16) {
            combatSystem.boss.hp -= poison.damage;
            combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
            showCombatText(`-${Math.floor(poison.damage)}`, ELEMENT_TYPES.POISON.color, combatSystem.boss, 'right');
            if (combatSystem.boss.hp <= 0) {
              combatSystem.boss.hp = 0;
              endCombat(true);
              return false;
            }
          }
          return true;
        }
        return false;
      });
      // Update poisoned status
      const activePoison = combatSystem.boss.effects.poisonStacks.length > 0;
      if (activePoison) {
        combatSystem.boss.effects.poisoned = now + 1000;
      } else if (combatSystem.boss.effects.poisoned < now) {
        combatSystem.boss.effects.poisoned = 0;
      }
    }
    
    // Update bleeding effects (Bleed)
    if (combatSystem.boss.effects.bleeding && combatSystem.boss.effects.bleeding.length > 0) {
      combatSystem.boss.effects.bleeding = combatSystem.boss.effects.bleeding.filter(bleed => {
        const elapsed = now - bleed.startTime;
        if (elapsed < bleed.duration) {
          // Apply damage every second
          if (elapsed % 1000 < 16) {
            combatSystem.boss.hp -= bleed.damage;
            combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
            showCombatText(`-${Math.floor(bleed.damage)}`, ELEMENT_TYPES.BLEED.color, combatSystem.boss, 'right');
            if (combatSystem.boss.hp <= 0) {
              combatSystem.boss.hp = 0;
              endCombat(true);
              return false;
            }
          }
          return true;
        }
        return false;
      });
    }
    
    // Update frozen effect (Cold)
    if (combatSystem.boss.effects.frozen > 0 && now >= combatSystem.boss.effects.frozen) {
      combatSystem.boss.effects.frozen = 0;
    }
    
    // Update cold stacks (Cold)
    if (combatSystem.boss.effects.coldStacks && combatSystem.boss.effects.coldStacks.length > 0) {
      combatSystem.boss.effects.coldStacks = combatSystem.boss.effects.coldStacks.filter(cold => {
        const elapsed = now - cold.startTime;
        return elapsed < cold.duration;
      });
      // Update slowed status
      const activeCold = combatSystem.boss.effects.coldStacks.length > 0;
      if (activeCold) {
        const maxCold = combatSystem.boss.effects.coldStacks.reduce((max, cold) => {
          const elapsed = now - cold.startTime;
          const remaining = cold.duration - elapsed;
          return Math.max(max, now + remaining);
        }, now);
        combatSystem.boss.effects.slowed = maxCold;
      } else if (combatSystem.boss.effects.slowed < now) {
        combatSystem.boss.effects.slowed = 0;
      }
    }
    
    // Update shocked stacks (Lightning) - increases player crit chance
    if (combatSystem.boss.effects.shocked && combatSystem.boss.effects.shocked.length > 0) {
      combatSystem.boss.effects.shocked = combatSystem.boss.effects.shocked.filter(shock => {
        const elapsed = now - shock.startTime;
        return elapsed < shock.duration;
      });
    }
    
    // Update stunned
    if (combatSystem.boss.effects.stunned > 0) {
      combatSystem.boss.effects.stunned -= 16;
      if (combatSystem.boss.effects.stunned <= 0) {
        combatSystem.boss.effects.stunned = 0;
      }
    }
    
    // Update slowed
    if (combatSystem.boss.effects.slowed > 0) {
      combatSystem.boss.effects.slowed -= 16;
      if (combatSystem.boss.effects.slowed <= 0) {
        combatSystem.boss.effects.slowed = 0;
      }
    }
    
    // Update poisoned
    if (combatSystem.boss.effects.poisoned > 0) {
      combatSystem.boss.effects.poisoned -= 16;
      if (combatSystem.boss.effects.poisoned <= 0) {
        combatSystem.boss.effects.poisoned = 0;
      }
    }
    
    // Boss attack
    bossAttack();
  }
  
  // Player HP regen
  if (combatSystem.player.hpRegen > 0) {
    const regenAmount = combatSystem.player.hpRegen * (16 / 1000);
    combatSystem.player.hp = Math.min(combatSystem.player.maxHp, combatSystem.player.hp + regenAmount);
  }
  
  renderCombat();
  
  // Only continue loop if combat is active and countdown is not running
  if (combatSystem.active && combatSystem.countdownTimer === null) {
    requestAnimationFrame(updateCombatLoop);
  }
}

// Track active combat texts to prevent overlap
const activeCombatTexts = {
  boss: { left: [], center: [], right: [] },
  player: { left: [], center: [], right: [] }
};

// Show combat text
// direction: 'left' (for crits), 'right' (for element/debuff damage), 'center' (default)
// fontSize: optional custom font size (default 1.2rem, crit uses 1.5rem)
function showCombatText(text, color, target, direction = 'center', fontSize = null) {
  const combatArena = document.querySelector('.combat-arena');
  if (!combatArena) return;
  
  const targetKey = target === combatSystem.boss ? 'boss' : 'player';
  const textQueue = activeCombatTexts[targetKey][direction];
  
  // Clean up queue - remove elements that are no longer in DOM
  for (let i = textQueue.length - 1; i >= 0; i--) {
    const el = textQueue[i];
    if (!el || !el.parentNode || !document.body.contains(el)) {
      textQueue.splice(i, 1);
    }
  }
  
  // Calculate vertical offset based on ACTIVE queue length (larger spacing)
  const verticalOffset = textQueue.length * 50; // 50px spacing between texts (increased for better separation)
  
  const textEl = document.createElement('div');
  textEl.className = 'combat-floating-text';
  textEl.textContent = text;
  textEl.style.color = color;
  textEl.style.position = 'absolute';
  textEl.style.fontWeight = 'bold';
  textEl.style.fontSize = fontSize || '1.2rem';
  textEl.style.textShadow = `0 0 8px ${color}, 2px 2px 4px rgba(0,0,0,0.9)`;
  textEl.style.pointerEvents = 'none';
  textEl.style.zIndex = '10000';
  textEl.style.fontFamily = 'var(--mono-font)';
  
  const targetEl = target === combatSystem.boss 
    ? document.querySelector('.combat-boss')
    : document.querySelector('.combat-player');
  
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    textEl.style.left = `${rect.left + rect.width / 2}px`;
    textEl.style.top = `${rect.top + rect.height / 2 - verticalOffset}px`; // Offset for queue position
    textEl.style.transform = 'translate(-50%, -50%)';
    textEl.style.position = 'fixed';
    textEl.style.zIndex = '14000';
    
    // Add to queue
    textQueue.push(textEl);
    
    // Append to combat screen or body to ensure it's above modal
    const combatScreen = document.getElementById('combat-screen');
    if (combatScreen && !combatScreen.classList.contains('hidden')) {
      combatScreen.appendChild(textEl);
    } else {
      document.body.appendChild(textEl);
    }
    
    // Animate based on direction
    requestAnimationFrame(() => {
      textEl.style.transition = 'all 1s ease-out';
      
      let transformX = '-50%';
      if (direction === 'left') {
        transformX = '-150%'; // Move left
      } else if (direction === 'right') {
        transformX = '50%'; // Move right
      }
      
      textEl.style.transform = `translate(${transformX}, -150%)`;
      textEl.style.opacity = '0';
      
      setTimeout(() => {
        // Remove from queue
        const index = textQueue.indexOf(textEl);
        if (index > -1) {
          textQueue.splice(index, 1);
        }
        
        if (textEl.parentNode) {
          textEl.parentNode.removeChild(textEl);
        }
      }, 1000);
    });
  }
}

// Update attack button state
function updateAttackButton() {
  const attackBtn = document.getElementById('combat-attack-btn');
  if (!attackBtn) return;
  
  // Disable button during countdown
  if (combatSystem.countdownTimer !== null) {
    attackBtn.disabled = true;
    attackBtn.textContent = `Starting in ${combatSystem.countdownSeconds}...`;
    return;
  }
  
  if (!combatSystem.active || !combatSystem.boss) {
    attackBtn.disabled = true;
    attackBtn.textContent = 'Attack';
    return;
  }
  
  const now = Date.now();
  let attackSpeed = 1.0;
  const rightWeapon = combatSystem.player.equipped.weaponRight;
  if (rightWeapon && rightWeapon.attackSpeed) {
    attackSpeed = rightWeapon.attackSpeed;
  } else {
    attackSpeed = combatSystem.player.attackSpeed || 1.0;
  }
  
  const attackCooldown = 1000 / attackSpeed;
  const timeSinceLastAttack = now - combatSystem.lastAttackTime;
  
  // Check if player has a weapon equipped
  if (!rightWeapon) {
    attackBtn.disabled = true;
    attackBtn.textContent = 'No Weapon';
    attackBtn.title = 'Equip a weapon from inventory to attack';
    return;
  }
  
  if (timeSinceLastAttack < attackCooldown) {
    const remainingCooldown = ((attackCooldown - timeSinceLastAttack) / 1000).toFixed(1);
    attackBtn.disabled = true;
    attackBtn.textContent = `Attack (${remainingCooldown}s)`;
    attackBtn.title = '';
  } else {
    attackBtn.disabled = false;
    attackBtn.textContent = 'Attack';
    attackBtn.title = '';
  }
}

// Render combat UI
function renderCombat() {
  const combatScreen = document.getElementById('combat-screen');
  const bossHpBar = document.getElementById('boss-hp-bar');
  const bossHpText = document.getElementById('boss-hp-text');
  const bossName = document.getElementById('boss-name');
  const bossWaveNumber = document.getElementById('boss-wave-number');
  const playerHpBar = document.getElementById('player-hp-bar');
  const playerHpText = document.getElementById('player-hp-text');
  const soulsDisplay = document.getElementById('souls-display');
  const combatDamage = document.getElementById('combat-damage');
  const combatArmor = document.getElementById('combat-armor');
  const combatDodge = document.getElementById('combat-dodge');
  
  if (!combatScreen) return;
  
  // Update player class display (read-only in combat screen)
  const classDisplay = document.getElementById('player-class-name');
  if (classDisplay) {
    if (save && save.combat && save.combat.playerClass) {
      const classData = CHARACTER_CLASSES[save.combat.playerClass];
      if (classData) {
        classDisplay.textContent = classData.name;
      } else {
        classDisplay.textContent = 'Unknown Class';
      }
    } else {
      classDisplay.textContent = 'No Class';
    }
  }
  
  // Show screen if combat is active, boss exists, or countdown is running
  const shouldShowScreen = (combatSystem.active && combatSystem.boss) || combatSystem.countdownTimer !== null;
  
  if (shouldShowScreen) {
    combatScreen.classList.remove('hidden');
    
    // Update boss info
    if (bossName) {
      if (combatSystem.countdownTimer !== null && combatSystem.countdownSeconds > 0) {
        bossName.textContent = `Battle starts in ${combatSystem.countdownSeconds}...`;
      } else if (combatSystem.boss) {
        bossName.textContent = combatSystem.boss.name;
      }
    }
    
    if (bossWaveNumber) {
      // Always show current wave number (not next wave)
      bossWaveNumber.textContent = combatSystem.bossWave;
    }
    
    // Update boss HP (only if boss exists and combat is active)
    if (bossHpBar && bossHpText && combatSystem.boss && combatSystem.active) {
      const bossHpPercent = Math.max(0, (combatSystem.boss.hp / combatSystem.boss.maxHp) * 100);
      bossHpBar.style.width = `${bossHpPercent}%`;
      bossHpText.textContent = `${Math.floor(Math.max(0, combatSystem.boss.hp))} / ${Math.floor(combatSystem.boss.maxHp)}`;
      
      // Update boss damage
      const bossDamageEl = document.getElementById('boss-damage');
      if (bossDamageEl) {
        bossDamageEl.textContent = Math.floor(combatSystem.boss.damage || 0);
      }
      
      // Update boss armor
      const bossArmorEl = document.getElementById('boss-armor');
      if (bossArmorEl) {
        let bossArmor = combatSystem.boss.armor || 0;
        if (combatSystem.boss.effects && combatSystem.boss.effects.armorReduction) {
          bossArmor = Math.floor(bossArmor * (1 - combatSystem.boss.effects.armorReduction));
        }
        bossArmorEl.textContent = bossArmor;
      }
      
      // Update boss dodge
      const bossDodgeEl = document.getElementById('boss-dodge');
      if (bossDodgeEl) {
        bossDodgeEl.textContent = `${(combatSystem.boss.dodgeChance || 0).toFixed(1)}%`;
      }
      
      // Update boss HP regen (if exists)
      const bossHpRegenContainer = document.getElementById('boss-hp-regen-container');
      const bossHpRegenEl = document.getElementById('boss-hp-regen');
      if (bossHpRegenContainer && bossHpRegenEl) {
        const bossHpRegen = combatSystem.boss.hpRegen || 0;
        if (bossHpRegen > 0) {
          bossHpRegenContainer.style.display = 'flex';
          bossHpRegenEl.textContent = `${bossHpRegen.toFixed(1)}/s`;
        } else {
          bossHpRegenContainer.style.display = 'none';
        }
      }
      
      // Update boss element info (if boss has element)
      const bossElementContainer = document.getElementById('boss-element-container');
      const bossElementLabel = document.getElementById('boss-element-label');
      const bossElementInfo = document.getElementById('boss-element-info');
      if (bossElementContainer && bossElementLabel && bossElementInfo) {
        if (combatSystem.boss.element && ELEMENT_TYPES[combatSystem.boss.element]) {
          const elementData = ELEMENT_TYPES[combatSystem.boss.element];
          const elementChances = {
            'FIRE': '30%',
            'POISON': '40%',
            'COLD': '15%',
            'LIGHTNING': '40%',
            'BLEED': '50%'
          };
          const chance = elementChances[combatSystem.boss.element] || '?%';
          bossElementLabel.textContent = `${elementData.name}:`;
          bossElementLabel.style.color = elementData.color;
          bossElementInfo.textContent = `${chance} debuff`;
          bossElementInfo.style.color = elementData.color;
          bossElementContainer.style.display = 'flex';
          
          // Add event listeners for tooltip
          bossElementContainer.classList.add('boss-element-hoverable');
          bossElementContainer.setAttribute('data-boss-element', combatSystem.boss.element);
        } else {
          bossElementContainer.style.display = 'none';
          bossElementContainer.classList.remove('boss-element-hoverable');
          bossElementContainer.removeAttribute('data-boss-element');
        }
      }
      
      // Setup boss element tooltip (after setting up the container)
      setupBossElementTooltip();
      
      // Update boss debuffs
      updateBossDebuffs();
      
      // Update player debuffs
      updatePlayerDebuffs();
    } else if (bossHpBar && bossHpText) {
      // During countdown or before combat
      bossHpBar.style.width = '100%';
      bossHpText.textContent = 'Ready...';
      const bossDamageEl = document.getElementById('boss-damage');
      if (bossDamageEl) bossDamageEl.textContent = '0';
      const bossArmorEl = document.getElementById('boss-armor');
      if (bossArmorEl) bossArmorEl.textContent = '0';
      const bossDodgeEl = document.getElementById('boss-dodge');
      if (bossDodgeEl) bossDodgeEl.textContent = '0%';
      const bossHpRegenContainer = document.getElementById('boss-hp-regen-container');
      if (bossHpRegenContainer) bossHpRegenContainer.style.display = 'none';
      const bossElementContainer = document.getElementById('boss-element-container');
      if (bossElementContainer) bossElementContainer.style.display = 'none';
      const bossDebuffsEl = document.getElementById('boss-debuffs');
      if (bossDebuffsEl) bossDebuffsEl.innerHTML = '';
      const playerDebuffsEl = document.getElementById('player-debuffs');
      if (playerDebuffsEl) playerDebuffsEl.innerHTML = '';
    }
    
    // Update player HP - always update when screen is visible
    if (playerHpBar && playerHpText) {
      const currentHp = Math.max(0, Math.min(combatSystem.player.hp, combatSystem.player.maxHp)); // Clamp HP between 0 and maxHp
      const playerHpPercent = Math.max(0, (currentHp / combatSystem.player.maxHp) * 100);
      playerHpBar.style.width = `${playerHpPercent}%`;
      playerHpText.textContent = `${Math.floor(currentHp)} / ${Math.floor(combatSystem.player.maxHp)}`;
    }
    
    // Update combat stats (only if combat is active)
    if (combatSystem.active) {
      if (combatDamage) combatDamage.textContent = Math.floor(combatSystem.player.damage);
      if (combatArmor) combatArmor.textContent = Math.floor(combatSystem.player.armor);
      if (combatDodge) combatDodge.textContent = `${combatSystem.player.dodgeChance.toFixed(1)}%`;
    }
  } else {
    combatScreen.classList.add('hidden');
  }
  
  // Always update player HP, even if screen is hidden (for immediate update after combat ends)
  if (playerHpBar && playerHpText) {
    const currentHp = Math.max(0, Math.min(combatSystem.player.hp, combatSystem.player.maxHp));
    const playerHpPercent = Math.max(0, (currentHp / combatSystem.player.maxHp) * 100);
    playerHpBar.style.width = `${playerHpPercent}%`;
    playerHpText.textContent = `${Math.floor(currentHp)} / ${Math.floor(combatSystem.player.maxHp)}`;
  }
  
  // Update souls display
  if (soulsDisplay) {
    soulsDisplay.textContent = formatNumber(combatSystem.souls);
  }
  
  // Update attack button (during countdown or if combat is active)
  if (combatSystem.countdownTimer !== null || combatSystem.active) {
    updateAttackButton();
  }
}

// Update boss debuffs display
function updateBossDebuffs() {
  const bossDebuffsEl = document.getElementById('boss-debuffs');
  if (!bossDebuffsEl || !combatSystem.boss || !combatSystem.boss.effects) return;
  
  const effects = combatSystem.boss.effects;
  const debuffs = [];
  
  // Check for active debuffs
  const now = Date.now();
  
  if (effects.burning && effects.burning.length > 0) {
    const longestBurn = effects.burning.reduce((max, burn) => {
      const remaining = burn.duration - (now - burn.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestBurn / 1000);
    debuffs.push({ name: 'BURN', color: ELEMENT_TYPES.FIRE.color, count: effects.burning.length, timeLeft });
  }
  if (effects.poisonStacks && effects.poisonStacks.length > 0) {
    const longestPoison = effects.poisonStacks.reduce((max, poison) => {
      const remaining = poison.duration - (now - poison.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestPoison / 1000);
    debuffs.push({ name: 'POISON', color: ELEMENT_TYPES.POISON.color, count: effects.poisonStacks.length, timeLeft });
  }
  if (effects.frozen > 0 && now < effects.frozen) {
    const timeLeft = Math.ceil((effects.frozen - now) / 1000);
    debuffs.push({ name: 'FROZEN', color: ELEMENT_TYPES.COLD.color, timeLeft });
  }
  if (effects.shocked && effects.shocked.length > 0) {
    const longestShock = effects.shocked.reduce((max, shock) => {
      const remaining = shock.duration - (now - shock.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestShock / 1000);
    debuffs.push({ name: 'SHOCK', color: ELEMENT_TYPES.LIGHTNING.color, count: effects.shocked.length, timeLeft });
  }
  if (effects.bleeding && effects.bleeding.length > 0) {
    const longestBleed = effects.bleeding.reduce((max, bleed) => {
      const remaining = bleed.duration - (now - bleed.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestBleed / 1000);
    debuffs.push({ name: 'BLEED', color: ELEMENT_TYPES.BLEED.color, count: effects.bleeding.length, timeLeft });
  }
  if (effects.slowed > 0 && now < effects.slowed) {
    const timeLeft = Math.ceil((effects.slowed - now) / 1000);
    debuffs.push({ name: 'SLOW', color: ELEMENT_TYPES.COLD.color, timeLeft });
  }
  if (effects.stunned > 0 && now < effects.stunned) {
    const timeLeft = Math.ceil((effects.stunned - now) / 1000);
    debuffs.push({ name: 'STUN', color: '#00ffff', timeLeft });
  }
  
  // Render debuffs with timers and descriptions
  const debuffDescriptions = {
    'BURN': 'Fire damage over time. Each stack deals damage every second. Stacks up to 30 times.',
    'POISON': 'Poison damage over time. Increases incoming damage by 5% per stack. Stacks up to 30 times.',
    'FROZEN': 'Enemy cannot attack. Lasts 3 seconds.',
    'SHOCK': 'Increases player crit chance by 5% per stack. Stacks up to 5 times.',
    'BLEED': 'Bleed damage over time. Each stack reduces armor by 2%. Stacks up to 15 times.',
    'SLOW': 'Reduces attack speed by 50%. Applied by Cold stacks. Stacks up to 5 times.',
    'STUN': 'Enemy cannot attack. Duration varies.'
  };
  
  // Clear existing content
  bossDebuffsEl.innerHTML = '';
  
  debuffs.forEach(debuff => {
    const countText = debuff.count ? ` x${debuff.count}` : '';
    const timerText = debuff.timeLeft ? ` (${debuff.timeLeft}s)` : '';
    const description = debuffDescriptions[debuff.name] || '';
    
    // Calculate damage info for some debuffs
    let fullDescription = description;
    if (debuff.name === 'BURN' && effects.burning && effects.burning.length > 0) {
      const totalDamage = effects.burning.reduce((sum, burn) => sum + burn.damage, 0);
      fullDescription += ` Total damage per second: ${totalDamage}`;
    } else if (debuff.name === 'POISON' && effects.poisonStacks && effects.poisonStacks.length > 0) {
      const totalDamage = effects.poisonStacks.reduce((sum, poison) => sum + poison.damage, 0);
      fullDescription += ` Total damage per second: ${totalDamage}`;
    } else if (debuff.name === 'BLEED' && effects.bleeding && effects.bleeding.length > 0) {
      const totalDamage = effects.bleeding.reduce((sum, bleed) => sum + bleed.damage, 0);
      fullDescription += ` Total damage per second: ${totalDamage}`;
    }
    
    // Create element with tooltip support
    const debuffEl = document.createElement('span');
    debuffEl.className = 'boss-debuff';
    debuffEl.style.color = debuff.color;
    debuffEl.textContent = `${debuff.name}${countText}${timerText}`;
    debuffEl.setAttribute('data-debuff-name', debuff.name);
    debuffEl.setAttribute('data-debuff-info', fullDescription);
    
    // Add event listeners for tooltip
    debuffEl.addEventListener('mouseenter', (e) => {
      showDebuffInfo(debuffEl, 'boss');
    });
    debuffEl.addEventListener('mouseleave', () => {
      hideDebuffInfo('boss');
    });
    
    bossDebuffsEl.appendChild(debuffEl);
  });
}

// Update player debuffs display
function updatePlayerDebuffs() {
  const playerDebuffsEl = document.getElementById('player-debuffs');
  if (!playerDebuffsEl || !combatSystem.boss || !combatSystem.boss.playerEffects) return;
  
  const playerEffects = combatSystem.boss.playerEffects;
  const debuffs = [];
  
  // Check for active debuffs on player
  const now = Date.now();
  
  if (playerEffects.burning && playerEffects.burning.length > 0) {
    const longestBurn = playerEffects.burning.reduce((max, burn) => {
      const remaining = burn.duration - (now - burn.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestBurn / 1000);
    debuffs.push({ name: 'BURN', color: ELEMENT_TYPES.FIRE.color, count: playerEffects.burning.length, timeLeft });
  }
  if (playerEffects.poisoned && playerEffects.poisoned.length > 0) {
    const longestPoison = playerEffects.poisoned.reduce((max, poison) => {
      const remaining = poison.duration - (now - poison.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestPoison / 1000);
    debuffs.push({ name: 'POISON', color: ELEMENT_TYPES.POISON.color, count: playerEffects.poisoned.length, timeLeft });
  }
  if (playerEffects.frozen > 0 && now < playerEffects.frozen) {
    const timeLeft = Math.ceil((playerEffects.frozen - now) / 1000);
    debuffs.push({ name: 'FROZEN', color: ELEMENT_TYPES.COLD.color, timeLeft });
  }
  if (playerEffects.shocked && playerEffects.shocked.length > 0) {
    const longestShock = playerEffects.shocked.reduce((max, shock) => {
      const remaining = shock.duration - (now - shock.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestShock / 1000);
    debuffs.push({ name: 'SHOCK', color: ELEMENT_TYPES.LIGHTNING.color, count: playerEffects.shocked.length, timeLeft });
  }
  if (playerEffects.bleeding && playerEffects.bleeding.length > 0) {
    const longestBleed = playerEffects.bleeding.reduce((max, bleed) => {
      const remaining = bleed.duration - (now - bleed.startTime);
      return Math.max(max, remaining);
    }, 0);
    const timeLeft = Math.ceil(longestBleed / 1000);
    debuffs.push({ name: 'BLEED', color: ELEMENT_TYPES.BLEED.color, count: playerEffects.bleeding.length, timeLeft });
  }
  
  // Render debuffs with timers and descriptions
  const debuffDescriptions = {
    'BURN': 'Fire damage over time. Each stack deals damage every second. Stacks up to 30 times.',
    'POISON': 'Poison damage over time. Stacks up to 30 times.',
    'FROZEN': 'You cannot attack. Lasts 2 seconds.',
    'SHOCK': 'Reduces your damage by 10% per stack. Stacks up to 5 times.',
    'BLEED': 'Bleed damage over time. Stacks up to 15 times.'
  };
  
  // Clear existing content
  playerDebuffsEl.innerHTML = '';
  
  debuffs.forEach(debuff => {
    const countText = debuff.count ? ` x${debuff.count}` : '';
    const timerText = debuff.timeLeft ? ` (${debuff.timeLeft}s)` : '';
    const description = debuffDescriptions[debuff.name] || '';
    
    // Calculate damage info for some debuffs
    let fullDescription = description;
    if (debuff.name === 'BURN' && playerEffects.burning && playerEffects.burning.length > 0) {
      const totalDamage = playerEffects.burning.reduce((sum, burn) => sum + burn.damage, 0);
      fullDescription += ` Total damage per second: ${totalDamage}`;
    } else if (debuff.name === 'POISON' && playerEffects.poisoned && playerEffects.poisoned.length > 0) {
      const totalDamage = playerEffects.poisoned.reduce((sum, poison) => sum + poison.damage, 0);
      fullDescription += ` Total damage per second: ${totalDamage}`;
    } else if (debuff.name === 'BLEED' && playerEffects.bleeding && playerEffects.bleeding.length > 0) {
      const totalDamage = playerEffects.bleeding.reduce((sum, bleed) => sum + bleed.damage, 0);
      fullDescription += ` Total damage per second: ${totalDamage}`;
    }
    
    // Create element with tooltip support
    const debuffEl = document.createElement('span');
    debuffEl.className = 'player-debuff';
    debuffEl.style.color = debuff.color;
    debuffEl.textContent = `${debuff.name}${countText}${timerText}`;
    debuffEl.setAttribute('data-debuff-name', debuff.name);
    debuffEl.setAttribute('data-debuff-info', fullDescription);
    
    // Add event listeners for tooltip
    debuffEl.addEventListener('mouseenter', (e) => {
      showDebuffInfo(debuffEl, 'player');
    });
    debuffEl.addEventListener('mouseleave', () => {
      hideDebuffInfo('player');
    });
    
    playerDebuffsEl.appendChild(debuffEl);
  });
}

// Show debuff info window
function showDebuffInfo(debuffElement, type) {
  const debuffName = debuffElement.getAttribute('data-debuff-name');
  const debuffInfo = debuffElement.getAttribute('data-debuff-info');
  const windowId = type === 'boss' ? 'debuff-info-window' : 'debuff-info-window-player';
  const infoWindow = document.getElementById(windowId);
  
  if (!infoWindow || !debuffInfo) return;
  
  // Format the info text with line breaks
  const formattedInfo = debuffInfo.replace(/\. /g, '.\n');
  
  infoWindow.innerHTML = `
    <div class="debuff-info-header" style="color: ${debuffElement.style.color};">${debuffName}</div>
    <div class="debuff-info-content">${formattedInfo.replace(/\n/g, '<br>')}</div>
  `;
  
  infoWindow.classList.remove('hidden');
  
  // Position the window near the debuff (relative to parent container)
  const rect = debuffElement.getBoundingClientRect();
  const parentContainer = infoWindow.parentElement;
  const parentRect = parentContainer ? parentContainer.getBoundingClientRect() : { left: 0, top: 0 };
  
  // Calculate position relative to parent
  infoWindow.style.left = `${rect.left - parentRect.left + rect.width + 8}px`;
  infoWindow.style.top = `${rect.top - parentRect.top}px`;
  
  // Adjust if window goes outside parent container
  requestAnimationFrame(() => {
    const windowRect = infoWindow.getBoundingClientRect();
    const containerRect = parentContainer.getBoundingClientRect();
    
    let leftPos = parseFloat(infoWindow.style.left) || 0;
    let topPos = parseFloat(infoWindow.style.top) || 0;
    
    // Check right boundary
    if (windowRect.right > containerRect.right) {
      leftPos = rect.left - parentRect.left - windowRect.width - 8;
      if (leftPos < 8) {
        leftPos = 8;
      }
    }
    
    // Check bottom boundary
    if (windowRect.bottom > containerRect.bottom) {
      topPos = rect.top - parentRect.top - windowRect.height - 8;
      if (topPos < 8) {
        topPos = rect.bottom - parentRect.top + 8;
      }
    }
    
    // Check top boundary
    if (topPos < 8) {
      topPos = rect.bottom - parentRect.top + 8;
    }
    
    // Check left boundary
    if (leftPos < 8) {
      leftPos = rect.right - parentRect.left + 8;
      if (leftPos + windowRect.width > containerRect.width) {
        leftPos = containerRect.width - windowRect.width - 8;
      }
    }
    
    // Ensure position is within bounds
    leftPos = Math.max(8, Math.min(leftPos, containerRect.width - windowRect.width - 8));
    topPos = Math.max(8, Math.min(topPos, containerRect.height - windowRect.height - 8));
    
    if (!infoWindow.classList.contains('hidden')) {
      infoWindow.style.left = `${leftPos}px`;
      infoWindow.style.top = `${topPos}px`;
    }
  });
}

// Hide debuff info window
function hideDebuffInfo(type) {
  const windowId = type === 'boss' ? 'debuff-info-window' : 'debuff-info-window-player';
  const infoWindow = document.getElementById(windowId);
  if (infoWindow) {
    infoWindow.style.display = 'none'; // Force hide immediately
    infoWindow.classList.add('hidden');
    infoWindow.innerHTML = ''; // Clear content immediately
    infoWindow.style.left = '';
    infoWindow.style.top = '';
  }
}

// Setup boss element tooltip
let _bossElementTooltipSetup = false;

function setupBossElementTooltip() {
  const bossElementContainer = document.getElementById('boss-element-container');
  const infoWindow = document.getElementById('debuff-info-window');
  
  if (!bossElementContainer || !infoWindow) return;
  
  // Check if element is hoverable
  if (!bossElementContainer.classList.contains('boss-element-hoverable')) {
    // Remove listeners if element is no longer hoverable
    if (_bossElementTooltipSetup) {
      const newContainer = bossElementContainer.cloneNode(true);
      bossElementContainer.parentNode.replaceChild(newContainer, bossElementContainer);
      _bossElementTooltipSetup = false;
    }
    return;
  }
  
  const elementType = bossElementContainer.getAttribute('data-boss-element');
  if (!elementType) {
    // Remove listeners if no element type
    if (_bossElementTooltipSetup) {
      const newContainer = bossElementContainer.cloneNode(true);
      bossElementContainer.parentNode.replaceChild(newContainer, bossElementContainer);
      _bossElementTooltipSetup = false;
    }
    return;
  }
  
  // Only setup once, unless we need to update
  if (!_bossElementTooltipSetup) {
    bossElementContainer.addEventListener('mouseenter', () => {
      const currentElementType = bossElementContainer.getAttribute('data-boss-element');
      if (currentElementType) {
        showBossElementInfo(bossElementContainer, currentElementType);
      }
    });
    
    bossElementContainer.addEventListener('mouseleave', () => {
      hideDebuffInfo('boss');
    });
    
    _bossElementTooltipSetup = true;
  }
}

// Show boss element info
function showBossElementInfo(elementContainer, elementType) {
  const infoWindow = document.getElementById('debuff-info-window');
  if (!infoWindow || !ELEMENT_TYPES[elementType]) return;
  
  const elementData = ELEMENT_TYPES[elementType];
  
  // Get descriptions for boss element debuffs
  const bossElementDescriptions = {
    'FIRE': '30% chance to apply BURN on player. Fire damage over time. Each stack deals damage every second. Stacks up to 30 times.',
    'POISON': '40% chance to apply POISON on player. Poison damage over time. Stacks up to 30 times.',
    'COLD': '15% chance to FREEZE player. Frozen player cannot attack. Lasts 2 seconds.',
    'LIGHTNING': '40% chance to apply SHOCK on player. Reduces player damage by 10% per stack. Stacks up to 5 times.',
    'BLEED': '50% chance to apply BLEED on player. Bleed damage over time. Stacks up to 15 times.'
  };
  
  const description = bossElementDescriptions[elementType] || 'Unknown element effect.';
  
  // Set content first
  infoWindow.innerHTML = `
    <div class="debuff-info-header" style="color: ${elementData.color};">${elementData.name} Boss</div>
    <div class="debuff-info-content">${description}</div>
  `;
  
  // Make visible to get accurate measurements
  infoWindow.style.display = 'block'; // Force show immediately
  infoWindow.classList.remove('hidden');
  
  // Position immediately - use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    // Force a reflow to get accurate measurements after setting content
    void infoWindow.offsetWidth;
    
    // Position the window near the element container
    const rect = elementContainer.getBoundingClientRect();
    const parentContainer = infoWindow.parentElement;
    if (!parentContainer) return;
    
    const parentRect = parentContainer.getBoundingClientRect();
    
    // Get window dimensions after content is set
    const windowRect = infoWindow.getBoundingClientRect();
    const containerRect = parentContainer.getBoundingClientRect();
    
    // Calculate initial position (to the right of element)
    let leftPos = rect.left - parentRect.left + rect.width + 8;
    let topPos = rect.top - parentRect.top;
    
    // Adjust if window goes outside parent container (right edge)
    if (leftPos + windowRect.width > containerRect.width) {
      leftPos = rect.left - parentRect.left - windowRect.width - 8;
      // If still doesn't fit, position to the left
      if (leftPos < 0) {
        leftPos = 8;
      }
    }
    
    // Adjust if window goes outside parent container (bottom edge)
    if (topPos + windowRect.height > containerRect.height) {
      topPos = rect.bottom - parentRect.top - windowRect.height - 8;
      // If still doesn't fit, position above
      if (topPos < 0) {
        topPos = rect.top - parentRect.top - windowRect.height - 8;
      }
    }
    
    // Adjust if window goes outside parent container (top edge)
    if (topPos < 0) {
      topPos = rect.bottom - parentRect.top + 8;
    }
    
    // Adjust if window goes outside parent container (left edge)
    if (leftPos < 0) {
      leftPos = 8;
    }
    
    // Ensure position is within bounds
    leftPos = Math.max(8, Math.min(leftPos, containerRect.width - windowRect.width - 8));
    topPos = Math.max(8, Math.min(topPos, containerRect.height - windowRect.height - 8));
    
    // Apply calculated position only if window is still visible
    if (!infoWindow.classList.contains('hidden')) {
      infoWindow.style.left = `${leftPos}px`;
      infoWindow.style.top = `${topPos}px`;
    }
  });
}

// Format number for display
function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Math.floor(num).toString();
}

// Initialize combat system
function initCombatSystem() {
  if (!save) return;
  
  if (!save.combat) {
    save.combat = {
      souls: 0,
      bossWave: 0,
      lastWaveDefeated: false,
      highestWaveDefeated: 0
    };
  }
  
  // Load highest wave defeated for replay system
  combatSystem.highestWaveDefeated = save.combat.highestWaveDefeated || 0;
  
  // Initialize item ID counter based on existing items
  // Scan all items in inventory and equipped slots to find the highest ID number
  let maxIdNumber = Date.now();
  const scanItems = (items) => {
    if (!items) return;
    if (Array.isArray(items)) {
      items.forEach(item => {
        if (item && item.id) {
          const match = item.id.match(/_(\d+)_/);
          if (match) {
            const idNum = parseInt(match[1], 10);
            if (idNum > maxIdNumber) maxIdNumber = idNum;
          }
        }
      });
    } else if (typeof items === 'object') {
      Object.values(items).forEach(item => {
        if (item && item.id) {
          const match = item.id.match(/_(\d+)_/);
          if (match) {
            const idNum = parseInt(match[1], 10);
            if (idNum > maxIdNumber) maxIdNumber = idNum;
          }
        }
      });
    }
  };
  
  // Scan equipped items
  if (save.inventory && save.inventory.equipment) {
    scanItems(save.inventory.equipment);
  }
  if (combatSystem && combatSystem.player && combatSystem.player.equipped) {
    scanItems(combatSystem.player.equipped);
  }
  // Scan inventory
  if (save.inventory && save.inventory.inventory) {
    scanItems(save.inventory.inventory);
  }
  
  // Set counter to max found ID + 1 to ensure uniqueness
  itemIdCounter = maxIdNumber;
  
  combatSystem.souls = save.combat.souls || 0;
  combatSystem.bossWave = save.combat.bossWave || 0;
  combatSystem.lastWaveDefeated = save.combat.lastWaveDefeated || false;
  
  // Load player class
  if (save.combat.playerClass) {
    combatSystem.playerClass = save.combat.playerClass;
  }
  
  // Load equipped items from inventory system
  if (save.inventory && save.inventory.equipment) {
    Object.keys(combatSystem.player.equipped).forEach(slot => {
      if (save.inventory.equipment[slot]) {
        combatSystem.player.equipped[slot] = save.inventory.equipment[slot];
      }
    });
  }
  
  calculatePlayerStats();
  renderCombat();
  
  // Setup event listeners
  setupCombatEvents();
}

// Setup combat event listeners
function setupCombatEvents() {
  const generalBtn = document.getElementById('general-btn');
  const combatClose = document.getElementById('combat-close');
  const combatAttackBtn = document.getElementById('combat-attack-btn');
  const combatSelectWaveBtn = document.getElementById('combat-select-wave-btn');
  
  // DIABLO 3/POE STYLE: Add wave selection button for replaying bosses
  if (combatSelectWaveBtn) {
    combatSelectWaveBtn.addEventListener('click', () => {
      if (combatSystem.active) {
        toast('Cannot select wave during combat!', 'warn');
        return;
      }
      
      // Show wave selection dialog
      const maxWave = Math.max(1, combatSystem.highestWaveDefeated + 1);
      const waveInput = prompt(`Select wave to fight (1-${maxWave}):`, combatSystem.bossWave || 1);
      
      if (waveInput !== null) {
        const selectedWave = parseInt(waveInput, 10);
        if (isNaN(selectedWave) || selectedWave < 1 || selectedWave > maxWave) {
          toast(`Invalid wave number! Must be between 1 and ${maxWave}.`, 'bad');
          return;
        }
        
        startCombat(selectedWave);
      }
    });
  }
  
  if (generalBtn) {
    generalBtn.addEventListener('click', () => {
      if (!combatSystem.active) {
        startCombat();
      } else {
        toast('Combat is already active!', 'warn');
      }
    });
  }
  
  if (combatClose) {
    combatClose.addEventListener('click', () => {
      // Stop countdown if running
      if (combatSystem.countdownTimer !== null) {
        clearInterval(combatSystem.countdownTimer);
        combatSystem.countdownTimer = null;
        combatSystem.countdownSeconds = 0;
        const combatScreen = document.getElementById('combat-screen');
        if (combatScreen) {
          combatScreen.classList.add('hidden');
        }
        return;
      }
      
      if (combatSystem.active) {
        if (confirm('Leave combat? Progress will be lost.')) {
          endCombat(false);
        }
      } else {
        // Just close the screen if combat is not active
        const combatScreen = document.getElementById('combat-screen');
        if (combatScreen) {
          combatScreen.classList.add('hidden');
        }
      }
    });
  }
  
  if (combatAttackBtn) {
    combatAttackBtn.addEventListener('click', () => {
      playerAttack();
    });
  }
  
  // Setup auto-attack checkbox
  const autoAttackCheckbox = document.getElementById('combat-auto-attack');
  if (autoAttackCheckbox) {
    // Load saved auto-attack state
    if (save && save.combat && save.combat.autoAttack !== undefined) {
      autoAttackEnabled = save.combat.autoAttack;
      autoAttackCheckbox.checked = autoAttackEnabled;
    }
    
    autoAttackCheckbox.addEventListener('change', (e) => {
      autoAttackEnabled = e.target.checked;
      if (save && save.combat) {
        save.combat.autoAttack = autoAttackEnabled;
      }
      toast(autoAttackEnabled ? 'Auto-attack enabled' : 'Auto-attack disabled', 'info');
    });
  }
  
  // Update attack button cooldown display
  setInterval(() => {
    if (combatSystem.active) {
      updateAttackButton();
    }
  }, 100); // Update every 100ms
}

// Save combat state
function saveCombatState() {
  if (!save) return;
  
  if (!save.combat) {
    save.combat = {};
  }
  
  save.combat.souls = combatSystem.souls;
  save.combat.bossWave = combatSystem.bossWave;
  save.combat.lastWaveDefeated = combatSystem.lastWaveDefeated;
  save.combat.highestWaveDefeated = combatSystem.highestWaveDefeated;
  
  // Save equipped items to inventory system
  if (!save.inventory) {
    save.inventory = { equipment: {} };
  }
  if (!save.inventory.equipment) {
    save.inventory.equipment = {};
  }
  
  // Save all equipped items (weapons and armor)
  Object.keys(combatSystem.player.equipped).forEach(slot => {
    const equippedItem = combatSystem.player.equipped[slot];
    if (equippedItem) {
      save.inventory.equipment[slot] = equippedItem;
    } else {
      // Clear slot if no item
      save.inventory.equipment[slot] = null;
    }
  });
}

// Get equipped items
function getEquippedItems() {
  return combatSystem.player.equipped;
}

// Show class selection modal
// Class carousel state
let classCarouselState = {
  currentIndex: 0,
  classes: [],
  allowChange: false
};

function showClassSelectionModal(allowChange = false) {
  const modal = document.getElementById('class-selection-modal');
  const carousel = document.getElementById('class-carousel');
  const carouselWrapper = document.getElementById('class-carousel-wrapper');
  const prevBtn = document.getElementById('class-carousel-prev');
  const nextBtn = document.getElementById('class-carousel-next');
  const indicators = document.getElementById('class-carousel-indicators');
  const title = document.getElementById('class-selection-title');
  
  if (!modal || !carousel || !carouselWrapper) {
    console.error('Class selection modal elements not found!', { modal: !!modal, carousel: !!carousel });
    toast('Error: Class selection modal not found. Please refresh the page.', 'bad');
    return;
  }
  
  // Check if CHARACTER_CLASSES is defined
  if (typeof CHARACTER_CLASSES === 'undefined') {
    console.error('CHARACTER_CLASSES is not defined!');
    toast('Error: Character classes not loaded. Please refresh the page.', 'bad');
    return;
  }
  
  // Update title
  if (title) {
    title.textContent = allowChange ? 'Change Your Class (Cost: 15000 Souls)' : 'Select Your Class';
  }
  
  // Get current class
  const currentClassId = (save && save.combat && save.combat.playerClass) ? save.combat.playerClass : null;
  
  // Get all classes as array
  const classesArray = Object.values(CHARACTER_CLASSES);
  classCarouselState.classes = classesArray;
  classCarouselState.allowChange = allowChange;
  
  // Find current class index if exists
  if (currentClassId) {
    const currentIndex = classesArray.findIndex(c => c.id === currentClassId);
    if (currentIndex !== -1) {
      classCarouselState.currentIndex = currentIndex;
    }
  }
  
  // Clear carousel and indicators
  carousel.innerHTML = '';
  if (indicators) indicators.innerHTML = '';
  
  // Create class cards
  classesArray.forEach((classData, index) => {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.dataset.classId = classData.id;
    card.dataset.index = index;
    
    // Build bonuses text
    let bonusesText = '<div class="class-card-bonuses">';
    if (classData.bonuses.hpMultiplier) {
      bonusesText += `<strong>HP:</strong> ${classData.bonuses.hpMultiplier > 1 ? '+' : ''}${Math.round((classData.bonuses.hpMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.damageMultiplier) {
      bonusesText += `<strong>Damage:</strong> ${classData.bonuses.damageMultiplier > 1 ? '+' : ''}${Math.round((classData.bonuses.damageMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.armorMultiplier) {
      bonusesText += `<strong>Armor:</strong> +${Math.round((classData.bonuses.armorMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.critChanceBonus) {
      bonusesText += `<strong>Crit Chance:</strong> +${classData.bonuses.critChanceBonus}%<br>`;
    }
    if (classData.bonuses.critMultiplierBonus) {
      bonusesText += `<strong>Crit Multiplier:</strong> +${classData.bonuses.critMultiplierBonus}%<br>`;
    }
    if (classData.bonuses.dodgeChanceBonus) {
      bonusesText += `<strong>Dodge:</strong> +${classData.bonuses.dodgeChanceBonus}%<br>`;
    }
    if (classData.bonuses.wandStaffDamageMultiplier) {
      bonusesText += `<strong>Wand/Staff Damage:</strong> +${Math.round((classData.bonuses.wandStaffDamageMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.bowCrossbowDamageMultiplier) {
      bonusesText += `<strong>Bow/Crossbow Damage:</strong> +${Math.round((classData.bonuses.bowCrossbowDamageMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.elementDamageMultiplier) {
      bonusesText += `<strong>Elemental Damage:</strong> +${Math.round((classData.bonuses.elementDamageMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.dotDamageMultiplier) {
      bonusesText += `<strong>DoT Damage:</strong> +${Math.round((classData.bonuses.dotDamageMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.hpRegenMultiplier) {
      bonusesText += `<strong>HP Regen:</strong> +${Math.round((classData.bonuses.hpRegenMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.maxManaMultiplier) {
      bonusesText += `<strong>Max Mana:</strong> +${Math.round((classData.bonuses.maxManaMultiplier - 1) * 100)}%<br>`;
    }
    if (classData.bonuses.attackSpeedMultiplier) {
      bonusesText += `<strong>Attack Speed:</strong> +${Math.round((classData.bonuses.attackSpeedMultiplier - 1) * 100)}%<br>`;
    }
    bonusesText += '</div>';
    
    // Build allowed weapons text
    let weaponsText = '<div class="class-card-weapons">';
    weaponsText += '<strong>Weapons:</strong> ';
    if (classData.allowedWeapons && classData.allowedWeapons.length > 0) {
      weaponsText += classData.allowedWeapons.map(w => w.replace(/_/g, ' ')).join(', ');
    } else {
      weaponsText += 'All';
    }
    weaponsText += '</div>';
    
    const isCurrent = currentClassId === classData.id;
    
    card.innerHTML = `
      <div class="class-card-header">${classData.name}${isCurrent ? ' (Current)' : ''}</div>
      <div class="class-card-description">${classData.description}</div>
      ${bonusesText}
      ${weaponsText}
      <div style="margin-top: 20px; text-align: center;">
        <button class="btn primary" style="width: 100%;">Select This Class</button>
      </div>
    `;
    
    // Add click handler
    const selectBtn = card.querySelector('.btn');
    if (selectBtn) {
      selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectClass(classData.id, allowChange);
      });
    }
    
    card.addEventListener('click', (e) => {
      if (e.target !== selectBtn && !selectBtn.contains(e.target)) {
        selectClass(classData.id, allowChange);
      }
    });
    
    carousel.appendChild(card);
    
    // Create indicator
    if (indicators) {
      const indicator = document.createElement('div');
      indicator.className = 'class-carousel-indicator';
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => {
        goToClass(index);
      });
      indicators.appendChild(indicator);
    }
  });
  
  // Update carousel position
  updateClassCarousel();
  
  // Setup navigation buttons
  if (prevBtn) {
    prevBtn.onclick = () => navigateClassCarousel(-1);
  }
  if (nextBtn) {
    nextBtn.onclick = () => navigateClassCarousel(1);
  }
  
  // Setup keyboard navigation
  const handleKeyPress = (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') {
      navigateClassCarousel(-1);
    } else if (e.key === 'ArrowRight') {
      navigateClassCarousel(1);
    }
  };
  
  // Remove old listener if exists
  document.removeEventListener('keydown', classCarouselState.keyHandler);
  classCarouselState.keyHandler = handleKeyPress;
  document.addEventListener('keydown', handleKeyPress);
  
  // Setup touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };
  
  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        navigateClassCarousel(1); // Swipe left = next
      } else {
        navigateClassCarousel(-1); // Swipe right = prev
      }
    }
  };
  
  carouselWrapper.removeEventListener('touchstart', classCarouselState.touchStart);
  carouselWrapper.removeEventListener('touchend', classCarouselState.touchEnd);
  classCarouselState.touchStart = handleTouchStart;
  classCarouselState.touchEnd = handleTouchEnd;
  carouselWrapper.addEventListener('touchstart', handleTouchStart);
  carouselWrapper.addEventListener('touchend', handleTouchEnd);
  
  // Show modal - use same pattern as other modals (confirm-modal)
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    
    // Update carousel position after modal is shown (to get correct dimensions)
    setTimeout(() => {
      updateClassCarousel();
    }, 50);
  } else {
    console.error('Modal element not found!');
    toast('Error: Class selection modal not found. Please refresh the page.', 'bad');
  }
  
  // Close on outside click (disabled - user must select a class)
  modal.onclick = (e) => {
    if (e.target === modal) {
      if (!allowChange) {
        toast('You must select a class to continue!', 'warn');
        return;
      }
      closeClassSelectionModal();
    }
  };
}

// Navigate class carousel
function navigateClassCarousel(direction) {
  const totalClasses = classCarouselState.classes.length;
  if (totalClasses === 0) return;
  
  // Infinite loop: wrap around
  classCarouselState.currentIndex += direction;
  if (classCarouselState.currentIndex < 0) {
    classCarouselState.currentIndex = totalClasses - 1;
  } else if (classCarouselState.currentIndex >= totalClasses) {
    classCarouselState.currentIndex = 0;
  }
  
  updateClassCarousel();
}

// Go to specific class index
function goToClass(index) {
  if (index >= 0 && index < classCarouselState.classes.length) {
    classCarouselState.currentIndex = index;
    updateClassCarousel();
  }
}

// Update carousel position and active states
function updateClassCarousel() {
  const carousel = document.getElementById('class-carousel');
  const carouselWrapper = document.getElementById('class-carousel-wrapper');
  const indicators = document.getElementById('class-carousel-indicators');
  if (!carousel || !carouselWrapper) return;
  
  const currentIndex = classCarouselState.currentIndex;
  
  // Get the actual width of the wrapper (after all CSS is applied)
  const wrapperWidth = carouselWrapper.getBoundingClientRect().width;
  
  // Each card is 100% of wrapper width, so we move by wrapperWidth for each card
  const translateX = -currentIndex * wrapperWidth;
  carousel.style.transform = `translateX(${translateX}px)`;
  
  // Update active states
  const cards = carousel.querySelectorAll('.class-card');
  const indicatorEls = indicators ? indicators.querySelectorAll('.class-carousel-indicator') : [];
  
  cards.forEach((card, index) => {
    if (index === currentIndex) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
  
  indicatorEls.forEach((indicator, index) => {
    if (index === currentIndex) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
}

// Close class selection modal
function closeClassSelectionModal() {
  const modal = document.getElementById('class-selection-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  
  // Remove event listeners
  if (classCarouselState.keyHandler) {
    document.removeEventListener('keydown', classCarouselState.keyHandler);
    classCarouselState.keyHandler = null;
  }
  
  const carouselWrapper = document.getElementById('class-carousel-wrapper');
  if (carouselWrapper && classCarouselState.touchStart && classCarouselState.touchEnd) {
    carouselWrapper.removeEventListener('touchstart', classCarouselState.touchStart);
    carouselWrapper.removeEventListener('touchend', classCarouselState.touchEnd);
    classCarouselState.touchStart = null;
    classCarouselState.touchEnd = null;
  }
}

// Select class
function selectClass(classId, isChange = false) {
  if (!save) return;
  
  // Check if changing class (costs souls)
  if (isChange) {
    const cost = 15000;
    if (!combatSystem.souls || combatSystem.souls < cost) {
      toast(`Not enough souls! Need ${cost} souls to change class.`, 'bad');
      return;
    }
    
    // Deduct souls
    combatSystem.souls -= cost;
    if (save.combat) {
      save.combat.souls = combatSystem.souls;
    }
    toast(`Class changed! -${cost} souls.`, 'good');
  }
  
  // Set class
  if (!save.combat) {
    save.combat = {};
  }
  save.combat.playerClass = classId;
  combatSystem.playerClass = classId;
  
  // Unequip incompatible weapons
  const classData = CHARACTER_CLASSES[classId];
  if (classData && classData.allowedWeapons) {
    const equipped = combatSystem.player.equipped;
    let unequipped = false;
    
    if (equipped.weaponRight && !classData.allowedWeapons.includes(equipped.weaponRight.weaponType)) {
      addItemToInventory(equipped.weaponRight);
      equipped.weaponRight = null;
      unequipped = true;
    }
    
    if (equipped.weaponLeft && equipped.weaponLeft.weaponType !== 'SHIELD' && !classData.allowedWeapons.includes(equipped.weaponLeft.weaponType)) {
      addItemToInventory(equipped.weaponLeft);
      equipped.weaponLeft = null;
      unequipped = true;
    }
    
    if (unequipped) {
      toast('Some equipped weapons are incompatible with your new class and have been unequipped.', 'warn');
    }
  }
  
  // Give starting weapon if player doesn't have one equipped
  if (!isChange && !combatSystem.player.equipped.weaponRight) {
    const startingWeaponType = classData.allowedWeapons[0]; // Use first allowed weapon type
    if (startingWeaponType) {
      const weaponData = WEAPON_TYPES[startingWeaponType];
      if (weaponData) {
        // Determine damage type for starting weapon
        let startingWeaponDamageType = 'PHYSICAL';
        if (startingWeaponType === 'WAND' || startingWeaponType === 'STAFF') {
          startingWeaponDamageType = 'MAGICAL';
        }
        
        // Create a basic starting weapon (level 1, Common rarity)
        const startingWeapon = {
          id: generateUniqueItemId('weapon'),
          type: 'weapon',
          weaponType: startingWeaponType,
          name: `Starting ${weaponData.name}`,
          level: 1,
          rarity: 'COMMON',
          damageType: startingWeaponDamageType,
          attackSpeed: weaponData.attackSpeed ? weaponData.attackSpeed.min : null,
          effect: null,
          hands: weaponData.hands,
          icon: getWeaponIcon(startingWeaponType),
          stats: {
            damage: Math.floor(weaponData.baseDamage * 1.1) // Slightly better than base
          }
        };
        
        // Equip the starting weapon
        combatSystem.player.equipped.weaponRight = startingWeapon;
        
        // Update save equipment
        if (save && save.inventory) {
          if (!save.inventory.equipment) {
            save.inventory.equipment = {};
          }
          save.inventory.equipment.weaponRight = startingWeapon;
        }
        
        // Update inventory display if modal is open
        if (typeof renderInventory === 'function') {
          renderInventory();
        }
        
        toast(`Starting weapon equipped: ${startingWeapon.name}`, 'good');
      }
    }
  }
  
  // Recalculate stats
  calculatePlayerStats();
  renderCombat();
  saveCombatState();
  
  // Close modal
  closeClassSelectionModal();
  
  if (!isChange) {
    toast(`Class selected: ${CHARACTER_CLASSES[classId].name}`, 'good');
  }
}

// Change class (for existing players)
function changeClass() {
  if (!save || !save.combat || !save.combat.playerClass) {
    toast('You must select a class first!', 'warn');
    return;
  }
  
  showClassSelectionModal(true);
}

// Get player stats
function getPlayerStats() {
  calculatePlayerStats();
  return {
    hp: combatSystem.player.hp,
    maxHp: combatSystem.player.maxHp,
    damage: combatSystem.player.damage,
    armor: combatSystem.player.armor,
    critChance: combatSystem.player.critChance,
    critMultiplier: combatSystem.player.critMultiplier,
    dodgeChance: combatSystem.player.dodgeChance,
    hpRegen: combatSystem.player.hpRegen,
    mana: combatSystem.player.mana,
    maxMana: combatSystem.player.maxMana
  };
}

// Get item rarity color
function getItemRarityColor(rarity) {
  if (ITEM_RARITY[rarity]) {
    return ITEM_RARITY[rarity].color;
  }
  return '#9d9d9d';
}

// Export functions and constants
if (typeof window !== 'undefined') {
  // Create getter/setter for souls to allow direct access
  Object.defineProperty(window, 'combatSystem', {
    value: {
      init: initCombatSystem,
      start: startCombat,
      createDeveloperStone: createDeveloperStone,
      createDeveloperSword: createDeveloperSword, // Backward compatibility
      end: endCombat,
      attack: playerAttack,
      equip: equipItem,
      unequip: unequipItem,
      getSouls: () => combatSystem.souls,
      isActive: () => combatSystem.active,
      render: renderCombat,
      save: saveCombatState,
      ELEMENT_TYPES,
      calculateStats: calculatePlayerStats,
      getEquipped: getEquippedItems,
      getPlayerStats: getPlayerStats,
      getItemRarityColor: getItemRarityColor,
      createDeveloperStone: createDeveloperStone,
      createDeveloperSword: createDeveloperSword, // Backward compatibility
      addItemToInventory: addItemToInventory,
      ITEM_RARITY: ITEM_RARITY,
      WEAPON_TYPES: WEAPON_TYPES,
      changeClass: changeClass,
      showClassSelection: showClassSelectionModal,
      CHARACTER_CLASSES: CHARACTER_CLASSES,
      formatNumber: formatNumber,
      DAMAGE_TYPES: DAMAGE_TYPES,
      generateMerchantWeapon: generateMerchantWeapon,
      generateMerchantArmor: generateMerchantArmor,
      generateMerchantAccessory: generateMerchantAccessory,
      generateMerchantWeaponStats: generateMerchantWeaponStats,
      generateMerchantArmorStats: generateMerchantArmorStats,
      generateMerchantAccessoryStats: generateMerchantAccessoryStats,
      ARMOR_TYPES: ARMOR_TYPES,
      ACCESSORY_TYPES: ACCESSORY_TYPES,
      highestWaveDefeated: 0
    },
    writable: false,
    configurable: true
  });
  
  // Add souls getter/setter
  Object.defineProperty(window.combatSystem, 'souls', {
    get: () => combatSystem.souls,
    set: (value) => {
      combatSystem.souls = value;
      if (save && save.combat) {
        save.combat.souls = value;
      }
    },
    enumerable: true,
    configurable: true
  });
  
  // Add highestWaveDefeated getter/setter
  Object.defineProperty(window.combatSystem, 'highestWaveDefeated', {
    get: () => combatSystem.highestWaveDefeated,
    set: (value) => {
      combatSystem.highestWaveDefeated = value;
      if (save && save.combat) {
        save.combat.highestWaveDefeated = value;
      }
    },
    enumerable: true,
    configurable: true
  });
}

// ===== MERCHANT SYSTEM - Her Barrus =====

// Generate merchant weapon template (blank item, stats and rarity generated on purchase)
function generateMerchantWeapon(weaponType) {
  const weaponData = WEAPON_TYPES[weaponType];
  if (!weaponData) return null;
  
  // Rarity will be determined on purchase
  // Level will be determined on purchase based on highestWaveDefeated
  const currentWave = combatSystem.highestWaveDefeated || 0;
  const itemLevel = currentWave; // Will be recalculated on purchase
  
  // Build weapon name (simple name without elements, as stats will be generated on purchase)
  let weaponName = weaponData.name;
  if (weaponType === 'DAGGER') {
    // For daggers, randomly assign hand (will be finalized on purchase)
    weaponName = Math.random() < 0.5 ? 'Left Dagger' : 'Right Dagger';
  }
  
  // Create blank item template (stats and rarity will be generated on purchase)
  const item = {
    id: generateUniqueItemId('weapon'),
    type: 'weapon',
    weaponType: weaponType,
    name: weaponName, // No rarity prefix yet
    level: itemLevel, // Will be recalculated on purchase
    rarity: null, // Will be generated on purchase
    hands: weaponData.hands,
    icon: getWeaponIcon(weaponType),
    stats: {}, // Empty stats - will be generated on purchase
    isMerchantTemplate: true // Flag to indicate this is a template
  };
  
  return item;
}

// Generate stats for merchant weapon on purchase
function generateMerchantWeaponStats(item) {
  if (!item || !item.isMerchantTemplate) return item;
  
  const weaponData = WEAPON_TYPES[item.weaponType];
  if (!weaponData) return item;
  
  // Generate rarity on purchase: RARE, EPIC, or LEGENDARY
  const rarities = ['RARE', 'EPIC', 'LEGENDARY'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const rarityData = ITEM_RARITY[rarity];
  
  // Update item rarity
  item.rarity = rarity;
  
  // Get level based on highest wave defeated
  const highestWave = combatSystem.highestWaveDefeated || 0;
  const itemLevel = Math.max(1, highestWave); // Level = highest wave defeated (min 1)
  
  // Calculate damage
  const baseDamage = weaponData.baseDamage || 10;
  const damage = Math.floor(baseDamage * (1 + itemLevel * 0.1) * rarityData.multiplier);
  
  // Calculate attack speed
  let attackSpeed = 1.0;
  if (weaponData.attackSpeed) {
    const minSpeed = weaponData.attackSpeed.min || 0.5;
    const maxSpeed = weaponData.attackSpeed.max || 1.0;
    attackSpeed = minSpeed + Math.random() * (maxSpeed - minSpeed);
  }
  
  // Calculate crit stats
  const critChanceBase = weaponData.critChanceBase || 0.5;
  const baseCritChance = Math.floor((critChanceBase * (1 + itemLevel * 0.15) * rarityData.multiplier) * 10) / 10;
  const critChance = Math.min(item.rarity === 'LEGENDARY' ? 95 : 70, baseCritChance);
  
  const critMultiplierBase = weaponData.critMultiplierBase || 0.1;
  const critMultiplier = Math.floor((critMultiplierBase * (1 + itemLevel * 0.05) * rarityData.multiplier) * 100) / 100;
  
  // Determine weapon damage type
  let weaponDamageType = 'PHYSICAL';
  if (item.weaponType === 'WAND' || item.weaponType === 'STAFF') {
    weaponDamageType = 'MAGICAL';
  } else if (item.weaponType === 'MACE') {
    weaponDamageType = Math.random() < 0.5 ? 'HOLY' : 'PHYSICAL';
  }
  
  // For daggers, determine hand
  let weaponHand = null;
  if (item.weaponType === 'DAGGER') {
    // Check if name contains "Left" or "Right"
    if (item.name.includes('Left')) {
      weaponHand = 'left';
      weaponDamageType = 'PHYSICAL';
    } else {
      weaponHand = 'right';
    }
  }
  
  // Random element logic
  let primaryElement = null;
  let additionalElement = null;
  
  if (item.weaponType === 'WAND' || item.weaponType === 'STAFF') {
    const primaryElementChance = 0.5 + (rarityData.multiplier - 1) * 0.05;
    if (Math.random() < primaryElementChance) {
      const elements = Object.keys(ELEMENT_TYPES);
      primaryElement = elements[Math.floor(Math.random() * elements.length)];
    }
  }
  
  if (weaponDamageType === 'PHYSICAL') {
    const additionalElementChance = 0.1 + (rarityData.multiplier - 1) * 0.02;
    if (Math.random() < additionalElementChance) {
      const elements = Object.keys(ELEMENT_TYPES);
      additionalElement = elements[Math.floor(Math.random() * elements.length)];
    }
  } else if (item.weaponType === 'WAND' || item.weaponType === 'STAFF') {
    const additionalElementChance = primaryElement ? 0.2 : 0.4;
    if (Math.random() < additionalElementChance) {
      const elements = Object.keys(ELEMENT_TYPES);
      let candidateElement = elements[Math.floor(Math.random() * elements.length)];
      while (candidateElement === primaryElement && primaryElement) {
        candidateElement = elements[Math.floor(Math.random() * elements.length)];
      }
      additionalElement = candidateElement;
    }
  }
  
  // Generate weapon stats
  const weaponStats = {
    damage: damage
  };
  
  if (critChance > 0) {
    weaponStats.critChance = critChance;
  }
  if (critMultiplier > 0) {
    weaponStats.critMultiplier = critMultiplier;
  }
  
  // Random secondary affixes (2-5 for merchant items)
  const affixCount = 2 + Math.floor(Math.random() * 4);
  const availableAffixes = ['hp', 'armor', 'dodge', 'hpRegen', 'maxMana'];
  const selectedAffixes = [];
  
  for (let i = 0; i < affixCount && availableAffixes.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableAffixes.length);
    const affix = availableAffixes.splice(randomIndex, 1)[0];
    selectedAffixes.push(affix);
  }
  
  // Generate values for selected affixes
  selectedAffixes.forEach(affix => {
    let baseValue = 0;
    switch (affix) {
      case 'hp':
        baseValue = (10 + itemLevel * 2) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
        weaponStats.hp = Math.floor(baseValue);
        break;
      case 'armor':
        baseValue = (2 + itemLevel * 0.3) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
        weaponStats.armor = Math.floor(baseValue);
        break;
      case 'dodge':
        baseValue = (0.3 + itemLevel * 0.05) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
        weaponStats.dodge = Math.floor(baseValue * 10) / 10;
        break;
      case 'hpRegen':
        baseValue = (0.1 + itemLevel * 0.03) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
        weaponStats.hpRegen = Math.floor(baseValue * 10) / 10;
        break;
      case 'maxMana':
        baseValue = (5 + itemLevel * 2) * rarityData.multiplier * (0.8 + Math.random() * 0.4);
        weaponStats.maxMana = Math.floor(baseValue);
        break;
    }
  });
  
  // Add primary element damage for WAND and STAFF
  if (primaryElement && (item.weaponType === 'WAND' || item.weaponType === 'STAFF')) {
    const elementDamagePercent = item.weaponType === 'STAFF' ? 0.15 : 0.1;
    let elementDamage = Math.floor(damage * elementDamagePercent * rarityData.multiplier);
    if (elementDamage > 0) {
      weaponStats[`elementDamage_${primaryElement}`] = elementDamage;
    }
  }
  
  // Add additional element damage
  if (additionalElement) {
    const elementDamagePercent = 0.05 + Math.random() * 0.05;
    let elementDamage = Math.floor(damage * elementDamagePercent * rarityData.multiplier);
    if (elementDamage > 0) {
      weaponStats[`elementDamage_${additionalElement}`] = elementDamage;
    }
  }
  
  // Update item with generated stats
  item.level = itemLevel;
  item.damage = damage;
  item.damageType = weaponDamageType;
  item.attackSpeed = attackSpeed;
  item.element = primaryElement;
  item.additionalElement = additionalElement;
  item.stats = weaponStats;
  delete item.isMerchantTemplate; // Remove template flag
  
  // Update weapon name with rarity and element if applicable
  let finalName = item.name;
  if (primaryElement && (item.weaponType === 'WAND' || item.weaponType === 'STAFF')) {
    const elementData = ELEMENT_TYPES[primaryElement];
    finalName = `${elementData.name} ${finalName}`;
  }
  item.name = `${rarityData.name} ${finalName}`;
  
  if (weaponHand) {
    item.weaponHand = weaponHand;
  }
  
  return item;
}

// Generate merchant armor template (blank item, stats and rarity generated on purchase)
function generateMerchantArmor(armorType) {
  // Rarity will be determined on purchase
  // Level will be determined on purchase based on highestWaveDefeated
  const currentWave = combatSystem.highestWaveDefeated || 0;
  const itemLevel = currentWave; // Will be recalculated on purchase
  
  // Get armor type name
  const armorTypeNames = {
    helmet: 'Helmet',
    shoulders: 'Shoulders',
    chest: 'Chest',
    gloves: 'Gloves',
    legs: 'Legs',
    boots: 'Boots'
  };
  
  return {
    id: generateUniqueItemId('armor'),
    type: 'armor',
    armorType: armorType,
    name: armorTypeNames[armorType] || armorType, // No rarity prefix yet
    level: itemLevel, // Will be recalculated on purchase
    rarity: null, // Will be generated on purchase
    icon: getArmorIcon(armorType),
    stats: {}, // Empty stats - will be generated on purchase
    isMerchantTemplate: true // Flag to indicate this is a template
  };
}

// Generate stats for merchant armor on purchase
function generateMerchantArmorStats(item) {
  if (!item || !item.isMerchantTemplate) return item;
  
  // Generate rarity on purchase: RARE, EPIC, or LEGENDARY
  const rarities = ['RARE', 'EPIC', 'LEGENDARY'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const rarityData = ITEM_RARITY[rarity];
  
  // Update item rarity
  item.rarity = rarity;
  
  // Get level based on highest wave defeated
  const highestWave = combatSystem.highestWaveDefeated || 0;
  const itemLevel = Math.max(1, highestWave); // Level = highest wave defeated (min 1)
  
  // Random stat count: 3-6
  const statCount = 3 + Math.floor(Math.random() * 4);
  
  const baseStats = {
    hp: Math.floor((10 + itemLevel * 3) * rarityData.multiplier),
    armor: Math.floor((2 + itemLevel * 0.5) * rarityData.multiplier),
    dodge: Math.floor((0.5 + itemLevel * 0.1) * rarityData.multiplier),
    hpRegen: Math.floor((0.1 + itemLevel * 0.05) * rarityData.multiplier),
    maxMana: Math.floor((5 + itemLevel * 2) * rarityData.multiplier),
    manaRegen: Math.floor((0.05 + itemLevel * 0.02) * rarityData.multiplier * 10) / 10
  };
  
  const availableStats = Object.keys(baseStats);
  const selectedStats = {};
  
  for (let i = 0; i < statCount && i < availableStats.length; i++) {
    const stat = availableStats[Math.floor(Math.random() * availableStats.length)];
    if (!selectedStats[stat]) {
      selectedStats[stat] = baseStats[stat];
    } else {
      i--; // Try again if stat already selected
    }
  }
  
  // Update item with generated stats
  item.level = itemLevel;
  item.stats = selectedStats;
  delete item.isMerchantTemplate; // Remove template flag
  
  return item;
}

// Generate merchant accessory template (blank item, stats generated on purchase)
function generateMerchantAccessory(accessoryType) {
  // Random rarity: RARE, EPIC, or LEGENDARY
  const rarities = ['RARE', 'EPIC', 'LEGENDARY'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const rarityData = ITEM_RARITY[rarity];
  
  // Level will be determined on purchase based on highestWaveDefeated
  const currentWave = combatSystem.highestWaveDefeated || 0;
  const itemLevel = currentWave; // Will be recalculated on purchase
  
  const accessoryTypeNames = {
    ring: 'Ring',
    amulet: 'Amulet'
  };
  
  return {
    id: generateUniqueItemId('accessory'),
    type: 'accessory',
    accessoryType: accessoryType,
    name: `${rarityData.name} ${accessoryTypeNames[accessoryType] || accessoryType}`,
    level: itemLevel, // Will be recalculated on purchase
    rarity: rarity,
    icon: accessoryType === 'ring' ? '💍' : '📿',
    stats: {}, // Empty stats - will be generated on purchase
    isMerchantTemplate: true // Flag to indicate this is a template
  };
}

// Generate stats for merchant accessory on purchase
function generateMerchantAccessoryStats(item) {
  if (!item || !item.isMerchantTemplate) return item;
  
  const rarityData = ITEM_RARITY[item.rarity];
  
  // Get level based on highest wave defeated
  const highestWave = combatSystem.highestWaveDefeated || 0;
  const itemLevel = Math.max(1, highestWave); // Level = highest wave defeated (min 1)
  
  // Random stat count: 2-4 for accessories
  const statCount = 2 + Math.floor(Math.random() * 3);
  
  // Accessories can have all stats
  const baseStats = {
    hp: Math.floor((10 + itemLevel * 3) * rarityData.multiplier),
    armor: Math.floor((2 + itemLevel * 0.5) * rarityData.multiplier),
    dodge: Math.floor((0.5 + itemLevel * 0.1) * rarityData.multiplier),
    hpRegen: Math.floor((0.1 + itemLevel * 0.05) * rarityData.multiplier),
    maxMana: Math.floor((5 + itemLevel * 2) * rarityData.multiplier),
    manaRegen: Math.floor((0.05 + itemLevel * 0.02) * rarityData.multiplier * 10) / 10,
    critChance: Math.floor((0.5 + itemLevel * 0.1) * rarityData.multiplier * 10) / 10,
    critMultiplier: Math.floor((0.1 + itemLevel * 0.02) * rarityData.multiplier * 100) / 100
  };
  
  const availableStats = Object.keys(baseStats);
  const selectedStats = {};
  
  for (let i = 0; i < statCount && i < availableStats.length; i++) {
    const stat = availableStats[Math.floor(Math.random() * availableStats.length)];
    if (!selectedStats[stat]) {
      selectedStats[stat] = baseStats[stat];
    } else {
      i--; // Try again if stat already selected
    }
  }
  
  // Update item with generated stats
  item.level = itemLevel;
  item.stats = selectedStats;
  delete item.isMerchantTemplate; // Remove template flag
  
  return item;
}

