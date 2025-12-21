/* Combat System - General Event and Boss Fights */

// Unique ID counter for items (ensures truly unique IDs)
let itemIdCounter = Date.now();

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
  lastWaveDefeated: false // Track if last wave was defeated
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
    critMultiplierBase: 0.2, // Medium crit multiplier
    canDualWield: false, 
    onlyRightHand: true 
  },
  DAGGER: { 
    name: 'Dagger', 
    hands: 1, 
    attackSpeed: { min: 1.5, max: 2.0 }, 
    baseDamage: 3, // Level 1 common - much lower damage
    critChanceBase: 0.3, // Lower crit chance
    critMultiplierBase: 0.4, // Higher crit multiplier
    canDualWield: true, 
    onlyRightHand: false 
  },
  TWOHANDED_SWORD: { 
    name: 'Two-Handed Sword', 
    hands: 2, 
    attackSpeed: { min: 0.6, max: 0.8 }, 
    baseDamage: 15, // Level 1 common
    critChanceBase: 0.7, // Higher crit chance
    critMultiplierBase: 0.2, // Medium crit multiplier
    canDualWield: false, 
    onlyRightHand: false 
  },
  WAND: { 
    name: 'Wand', 
    hands: 1, 
    attackSpeed: { min: 1.0, max: 1.2 }, 
    baseDamage: 8, // Level 1 common
    critChanceBase: 0.5, // Medium crit chance
    critMultiplierBase: 0.2, // Medium crit multiplier
    canDualWield: false, 
    onlyRightHand: false 
  },
  STAFF: { 
    name: 'Staff', 
    hands: 2, 
    attackSpeed: { min: 0.5, max: 0.6 }, 
    baseDamage: 12, // Level 1 common
    critChanceBase: 0.3, // Lower crit chance
    critMultiplierBase: 0.2, // Medium crit multiplier
    canDualWield: false, 
    onlyRightHand: false 
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
    // Damage scales: baseDamage * (1 + itemLevel * 0.1) * rarity multiplier
    const damage = Math.floor(weaponData.baseDamage * (1 + itemLevel * 0.1) * rarityData.multiplier);
    
    // Attack speed based on weapon type (rarity slightly improves speed)
    const attackSpeed = weaponData.attackSpeed 
      ? weaponData.attackSpeed.min + (weaponData.attackSpeed.max - weaponData.attackSpeed.min) * (0.8 + (rarityData.multiplier - 1) * 0.05)
      : null;
    
    // Crit chance based on weapon type base and level scaling
    // Higher rarity = better crit chance
    const critChanceBase = weaponData.critChanceBase || 0.5;
    const critChance = Math.min(95, Math.floor((critChanceBase * (1 + itemLevel * 0.15) * rarityData.multiplier) * 10) / 10);
    
    // Crit multiplier based on weapon type base and level scaling
    const critMultiplierBase = weaponData.critMultiplierBase || 0.2;
    const critMultiplier = Math.floor((critMultiplierBase * (1 + itemLevel * 0.1) * rarityData.multiplier) * 100) / 100;
    
    // Random element (30-50% chance depending on rarity)
    let element = null;
    const elementChance = 0.3 + (rarityData.multiplier - 1) * 0.05;
    if (Math.random() < elementChance) {
      const elements = Object.keys(ELEMENT_TYPES);
      element = elements[Math.floor(Math.random() * elements.length)];
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
    
    const weaponStats = {
      damage: damage
    };
    
    // Add crit stats
    if (critChance > 0) {
      weaponStats.critChance = critChance;
    }
    if (critMultiplier > 0) {
      weaponStats.critMultiplier = critMultiplier;
    }
    
    // Add element damage for WAND and STAFF
    if (element && (weaponType === 'WAND' || weaponType === 'STAFF')) {
      const elementData = ELEMENT_TYPES[element];
      let elementDamage = Math.floor(damage * 0.3 * rarityData.multiplier); // 30% of base damage
      if (weaponType === 'STAFF') {
        elementDamage = Math.floor(elementDamage * 2); // Staff gets x2 element damage
      }
      if (elementDamage > 0) {
        weaponStats[`elementDamage_${element}`] = elementDamage;
      }
    }
    
    // For daggers, determine which hand it's for (left or right)
    let weaponHand = null;
    let daggerName = weaponData.name;
    if (weaponType === 'DAGGER') {
      weaponHand = Math.random() < 0.5 ? 'left' : 'right';
      daggerName = weaponHand === 'left' ? 'Left Dagger' : 'Right Dagger';
    }
    
    // Build weapon name with element
    let weaponName = weaponData.name;
    if (element) {
      const elementData = ELEMENT_TYPES[element];
      weaponName = `${elementData.name} ${weaponName}`;
    }
    if (weaponType === 'DAGGER') {
      weaponName = daggerName;
      if (element) {
        const elementData = ELEMENT_TYPES[element];
        weaponName = `${elementData.name} ${weaponName}`;
      }
    }
    
    const item = {
      id: generateUniqueItemId('weapon'),
      type: 'weapon',
      weaponType: weaponType,
      name: `${rarityData.name} ${weaponName}`,
      level: itemLevel,
      rarity: rarity,
      damage: damage,
      attackSpeed: attackSpeed,
      element: element, // Store element type
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
      hpRegen: Math.floor((0.1 + itemLevel * 0.05) * rarityData.multiplier)
    };
    
    // Randomly select 1-3 stats
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
    SHIELD: '🛡️'
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
  
  Object.keys(equipment).forEach(slot => {
    const item = equipment[slot];
    if (item && item.stats) {
      let statMultiplier = 1.0;
      
      // Both daggers give 100% stats, even when both are equipped
      // (removed 25% penalty for left dagger)
      
      // For shields, don't apply damage, critChance, or critMultiplier stats
      const isShield = item.weaponType === 'SHIELD';
      
      if (item.stats.hp) baseStats.maxHp += item.stats.hp * statMultiplier;
      if (item.stats.armor) baseStats.armor += item.stats.armor * statMultiplier;
      if (item.stats.dodge) baseStats.dodgeChance += item.stats.dodge * statMultiplier;
      if (item.stats.hpRegen) baseStats.hpRegen += item.stats.hpRegen * statMultiplier;
      if (!isShield) {
        // Shields cannot have damage, critChance, or critMultiplier
        if (item.stats.damage) baseStats.damage += item.stats.damage * statMultiplier;
        if (item.stats.critChance) baseStats.critChance += item.stats.critChance * statMultiplier;
        if (item.stats.critMultiplier) baseStats.critMultiplier += item.stats.critMultiplier * statMultiplier;
      }
      if (item.stats.blockChance) baseStats.blockChance += item.stats.blockChance * statMultiplier;
      if (item.stats.reflectChance) baseStats.reflectChance += item.stats.reflectChance * statMultiplier;
      if (item.stats.maxMana) baseStats.maxMana += item.stats.maxMana * statMultiplier;
      if (item.attackSpeed && slot === 'weaponRight') baseStats.attackSpeed = item.attackSpeed;
    }
  });
  
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
  combatSystem.player.attackSpeed = baseStats.attackSpeed;
}

// Generate boss
function generateBoss(wave) {
  // Bosses have much more HP (10-20x more), but attack slower and deal less damage
  const baseHp = (200 + wave * 5) * 15; // 15x more HP
  const baseDamage = (7 + wave * 2) * 0.5; // Increased from 0.3 to 0.5 (slightly more damage)
  const hp = Math.floor(baseHp * (1 + wave * 0.1));
  const damage = Math.floor(baseDamage * (1 + wave * 0.05)); // Slower damage scaling
  
  // Bosses attack much slower (2-3x slower)
  const baseAttackSpeed = 0.4 - (wave * 0.005); // Much slower base speed
  const minAttackSpeed = 0.25; // Minimum attack speed (very slow)
  const attackSpeed = Math.max(minAttackSpeed, baseAttackSpeed);
  
  // Boss armor and dodge chance
  const armor = Math.floor((5 + wave * 2) * (1 + wave * 0.05));
  const dodgeChance = Math.min(25, 2 + wave * 0.3); // Up to 25% dodge chance
  
  // 30% chance boss has an element
  let element = null;
  if (Math.random() < 0.3) {
    const elements = Object.keys(ELEMENT_TYPES);
    element = elements[Math.floor(Math.random() * elements.length)];
  }
  
  const bossName = element 
    ? `${ELEMENT_TYPES[element].name} Boss Wave ${wave}`
    : `Boss Wave ${wave}`;
  
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
function startCombat() {
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
  
  // Allow retry if player lost (boss exists but combat is not active)
  // Only block if combat is currently active
  if (combatSystem.active) {
    toast('Combat is already active!', 'warn');
    return;
  }
  
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

// Create developer sword (debug item)
function createDeveloperSword() {
  const devSword = {
    id: generateUniqueItemId('weapon'),
    type: 'weapon',
    weaponType: 'SWORD',
    name: 'Developer Sword',
    level: 999,
    rarity: 'LEGENDARY',
    damage: 100000,
    attackSpeed: 10.0,
    effect: 'bleed',
    hands: 1,
    icon: '⚔️',
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
  
  return devSword;
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
    // DAGGER - left dagger only in left hand, right dagger only in right hand
    else if (item.weaponType === 'DAGGER') {
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
  
  const now = Date.now();
  
  // Get attack speed from weapon or default to 1.0
  let attackSpeed = 1.0;
  const rightWeapon = combatSystem.player.equipped.weaponRight;
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
  
  // Calculate base damage
  let damage = combatSystem.player.damage;
  
  // Add weapon damage if equipped
  if (rightWeapon && rightWeapon.stats && rightWeapon.stats.damage) {
    damage += rightWeapon.stats.damage;
  }
  
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
    showCombatText('CRIT!', '#ffd700', combatSystem.boss);
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
  let bossArmor = combatSystem.boss.armor || 0;
  if (combatSystem.boss.effects && combatSystem.boss.effects.armorReduction) {
    bossArmor *= (1 - combatSystem.boss.effects.armorReduction);
  }
  if (bossArmor > 0) {
    damage = Math.max(1, damage - bossArmor * 0.5);
  }
  
  // Apply element damage for WAND and STAFF
  let elementDamage = 0;
  if (rightWeapon && rightWeapon.element) {
    const element = rightWeapon.element;
    const elementKey = `elementDamage_${element}`;
    if (rightWeapon.stats && rightWeapon.stats[elementKey]) {
      elementDamage = rightWeapon.stats[elementKey];
      // Element damage is not affected by crit or armor
      showCombatText(`-${Math.floor(elementDamage)} ${ELEMENT_TYPES[element].name}`, ELEMENT_TYPES[element].color, combatSystem.boss);
    }
  }
  
  // Apply physical damage
  combatSystem.boss.hp -= damage;
  combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
  showCombatText(`-${Math.floor(damage)}`, '#ff6666', combatSystem.boss);
  
  // Apply element damage
  if (elementDamage > 0) {
    combatSystem.boss.hp -= elementDamage;
    combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
  }
  
  // Apply weapon element effects
  if (rightWeapon && rightWeapon.element) {
    applyElementEffect(rightWeapon.element, isCrit, rightWeapon);
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
function applyElementEffect(element, isCrit, weapon) {
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
      // Base chance 15%, scales with rarity and level
      const burnChance = Math.min(0.95, 0.15 * effectChanceMultiplier);
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
        showCombatText('BURNING!', ELEMENT_TYPES.FIRE.color, combatSystem.boss);
      }
      break;
      
    case 'POISON':
      // Poison: extra poison damage, increases incoming damage, chance to poison (stacks up to 30)
      // Base chance 20%, scales with rarity and level
      // Duration: 15 seconds for boss (longer than player poison)
      const poisonChance = Math.min(0.95, 0.20 * effectChanceMultiplier);
      const poisonDuration = 15000; // 15 seconds for boss
      if (Math.random() < poisonChance) {
        const poisonDamage = Math.floor(combatSystem.player.damage * 0.02);
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
        showCombatText('POISONED!', ELEMENT_TYPES.POISON.color, combatSystem.boss);
      }
      break;
      
    case 'COLD':
      // Cold: extra cold damage, chance to slow (stacks up to 5 times), chance to freeze (3 seconds)
      // Base chances: slow 25%, freeze 8%, scales with rarity and level
      const slowChance = Math.min(0.95, 0.25 * effectChanceMultiplier);
      const freezeChance = Math.min(0.95, 0.08 * effectChanceMultiplier);
      
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
        showCombatText('SLOWED!', ELEMENT_TYPES.COLD.color, combatSystem.boss);
      }
      
      if (Math.random() < freezeChance) {
        combatSystem.boss.effects.frozen = now + 3000; // 3 seconds freeze
        showCombatText('FROZEN!', ELEMENT_TYPES.COLD.color, combatSystem.boss);
      }
      break;
      
    case 'LIGHTNING':
      // Lightning: extra lightning damage, chance to increase crit chance (stacks up to 5 times, 5 seconds)
      // Base chance 20%, scales with rarity and level
      const shockChance = Math.min(0.95, 0.20 * effectChanceMultiplier);
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
        showCombatText('SHOCKED!', ELEMENT_TYPES.LIGHTNING.color, combatSystem.boss);
      }
      break;
      
    case 'BLEED':
      // Bleed: no extra damage, chance to bleed (stacks up to 15 times, each stack breaks armor)
      // Base chance 25%, scales with rarity and level
      const bleedChance = Math.min(0.95, 0.25 * effectChanceMultiplier);
      if (Math.random() < bleedChance) {
        if (!combatSystem.boss.effects.bleeding) {
          combatSystem.boss.effects.bleeding = [];
        }
        const bleedDamage = Math.floor(combatSystem.player.damage * 0.08);
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
        showCombatText('BLEEDING!', ELEMENT_TYPES.BLEED.color, combatSystem.boss);
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
      // Fire: chance to burn player (stacks up to 30)
      if (Math.random() < 0.3) {
        const burnDamage = Math.floor(combatSystem.boss.damage * 0.1);
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
            showCombatText(`-${Math.floor(burn.damage)}`, ELEMENT_TYPES.FIRE.color, combatSystem.player);
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
            showCombatText(`-${Math.floor(poison.damage)}`, ELEMENT_TYPES.POISON.color, combatSystem.player);
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
            showCombatText(`-${Math.floor(bleed.damage)}`, ELEMENT_TYPES.BLEED.color, combatSystem.player);
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
            showCombatText(`-${Math.floor(burn.damage)}`, ELEMENT_TYPES.FIRE.color, combatSystem.boss);
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
          if (elapsed % 1000 < 16) {
            combatSystem.boss.hp -= poison.damage;
            combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp);
            showCombatText(`-${Math.floor(poison.damage)}`, ELEMENT_TYPES.POISON.color, combatSystem.boss);
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
            showCombatText(`-${Math.floor(bleed.damage)}`, ELEMENT_TYPES.BLEED.color, combatSystem.boss);
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

// Show combat text
function showCombatText(text, color, target) {
  const combatArena = document.querySelector('.combat-arena');
  if (!combatArena) return;
  
  const textEl = document.createElement('div');
  textEl.className = 'combat-floating-text';
  textEl.textContent = text;
  textEl.style.color = color;
  textEl.style.position = 'absolute';
  textEl.style.fontWeight = 'bold';
  textEl.style.fontSize = '1.2rem';
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
    textEl.style.top = `${rect.top + rect.height / 2}px`;
    textEl.style.transform = 'translate(-50%, -50%)';
    textEl.style.position = 'fixed';
    textEl.style.zIndex = '14000';
    
    // Append to combat screen or body to ensure it's above modal
    const combatScreen = document.getElementById('combat-screen');
    if (combatScreen && !combatScreen.classList.contains('hidden')) {
      combatScreen.appendChild(textEl);
    } else {
      document.body.appendChild(textEl);
    }
    
    // Animate
    requestAnimationFrame(() => {
      textEl.style.transition = 'all 1s ease-out';
      textEl.style.transform = 'translate(-50%, -150%)';
      textEl.style.opacity = '0';
      
      setTimeout(() => {
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
  
  if (timeSinceLastAttack < attackCooldown) {
    const remainingCooldown = ((attackCooldown - timeSinceLastAttack) / 1000).toFixed(1);
    attackBtn.disabled = true;
    attackBtn.textContent = `Attack (${remainingCooldown}s)`;
  } else {
    attackBtn.disabled = false;
    attackBtn.textContent = 'Attack';
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
        } else {
          bossElementContainer.style.display = 'none';
        }
      }
      
      // Update boss debuffs
      updateBossDebuffs();
      
      // Update player debuffs
      updatePlayerDebuffs();
    } else if (bossHpBar && bossHpText) {
      // During countdown or before combat
      bossHpBar.style.width = '100%';
      bossHpText.textContent = 'Ready...';
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
  
  bossDebuffsEl.innerHTML = debuffs.map(debuff => {
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
    
    return `<span class="boss-debuff" style="color: ${debuff.color};" data-debuff-name="${debuff.name}" data-debuff-info="${fullDescription.replace(/"/g, '&quot;')}">${debuff.name}${countText}${timerText}</span>`;
  }).join('');
  
  // Add event listeners to debuffs
  bossDebuffsEl.querySelectorAll('.boss-debuff').forEach(debuffEl => {
    debuffEl.addEventListener('mouseenter', (e) => showDebuffInfo(e.target, 'boss'));
    debuffEl.addEventListener('mouseleave', (e) => {
      // Check if mouse is moving to the info window
      const relatedTarget = e.relatedTarget;
      const infoWindow = document.getElementById('debuff-info-window');
      if (!relatedTarget || (infoWindow && !infoWindow.contains(relatedTarget))) {
        hideDebuffInfo('boss');
      }
    });
  });
  
  // Also hide when mouse leaves the info window
  const bossInfoWindow = document.getElementById('debuff-info-window');
  if (bossInfoWindow) {
    bossInfoWindow.addEventListener('mouseleave', () => hideDebuffInfo('boss'));
  }
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
  
  playerDebuffsEl.innerHTML = debuffs.map(debuff => {
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
    
    return `<span class="player-debuff" style="color: ${debuff.color};" data-debuff-name="${debuff.name}" data-debuff-info="${fullDescription.replace(/"/g, '&quot;')}">${debuff.name}${countText}${timerText}</span>`;
  }).join('');
  
  // Add event listeners to debuffs
  playerDebuffsEl.querySelectorAll('.player-debuff').forEach(debuffEl => {
    let hideTimeout;
    debuffEl.addEventListener('mouseenter', (e) => {
      clearTimeout(hideTimeout);
      showDebuffInfo(e.target, 'player');
    });
    debuffEl.addEventListener('mouseleave', (e) => {
      hideTimeout = setTimeout(() => {
        const infoWindow = document.getElementById('debuff-info-window-player');
        if (infoWindow && !infoWindow.matches(':hover')) {
          hideDebuffInfo('player');
        }
      }, 100);
    });
  });
  
  // Also hide when mouse leaves the info window
  const playerInfoWindow = document.getElementById('debuff-info-window-player');
  if (playerInfoWindow) {
    let hideTimeout;
    playerInfoWindow.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
    playerInfoWindow.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => hideDebuffInfo('player'), 100);
    });
  }
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
  setTimeout(() => {
    const windowRect = infoWindow.getBoundingClientRect();
    const containerRect = parentContainer.getBoundingClientRect();
    
    if (windowRect.right > containerRect.right) {
      infoWindow.style.left = `${rect.left - parentRect.left - infoWindow.offsetWidth - 8}px`;
    }
    if (windowRect.bottom > containerRect.bottom) {
      infoWindow.style.top = `${rect.top - parentRect.top - infoWindow.offsetHeight - 8}px`;
    }
    // Also check top boundary
    if (rect.top - parentRect.top - infoWindow.offsetHeight - 8 < 0) {
      infoWindow.style.top = `${rect.bottom - parentRect.top + 8}px`;
    }
  }, 0);
}

// Hide debuff info window
function hideDebuffInfo(type) {
  const windowId = type === 'boss' ? 'debuff-info-window' : 'debuff-info-window-player';
  const infoWindow = document.getElementById(windowId);
  if (infoWindow) {
    infoWindow.classList.add('hidden');
  }
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
      lastWaveDefeated: false
    };
  }
  
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
  window.combatSystem = {
    init: initCombatSystem,
    start: startCombat,
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
    createDeveloperSword: createDeveloperSword,
    addItemToInventory: addItemToInventory,
    ITEM_RARITY: ITEM_RARITY,
    WEAPON_TYPES: WEAPON_TYPES
  };
}

