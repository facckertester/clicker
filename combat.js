/* Combat System - General Event and Boss Fights */

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

// Weapon types
const WEAPON_TYPES = {
  SWORD: { name: 'Sword', hands: 1, attackSpeed: { min: 0.8, max: 1.0 }, effect: 'bleed', canDualWield: false, onlyRightHand: true },
  DAGGER: { name: 'Dagger', hands: 1, attackSpeed: { min: 1.2, max: 1.4 }, effect: 'poison', canDualWield: true, onlyRightHand: false },
  TWOHANDED_SWORD: { name: 'Two-Handed Sword', hands: 2, attackSpeed: { min: 0.8, max: 1.0 }, effect: 'bleed', canDualWield: false, onlyRightHand: false },
  WAND: { name: 'Wand', hands: 1, attackSpeed: { min: 0.9, max: 1.1 }, effect: 'shock', canDualWield: false, onlyRightHand: false },
  STAFF: { name: 'Staff', hands: 2, attackSpeed: { min: 0.8, max: 0.8 }, effect: 'frost', canDualWield: false, onlyRightHand: false },
  SHIELD: { name: 'Shield', hands: 1, attackSpeed: null, effect: null, canDualWield: false, onlyLeftHand: true }
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
    const weaponTypes = Object.keys(WEAPON_TYPES);
    const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
    const weaponData = WEAPON_TYPES[weaponType];
    
    const baseDamage = 5 + itemLevel * 2;
    const damage = Math.floor(baseDamage * rarityData.multiplier);
    
    const attackSpeed = weaponData.attackSpeed 
      ? weaponData.attackSpeed.min + (weaponData.attackSpeed.max - weaponData.attackSpeed.min) * (rarityData.multiplier / 5)
      : null;
    
    return {
      id: `weapon_${Date.now()}_${Math.random()}`,
      type: 'weapon',
      weaponType: weaponType,
      name: `${rarityData.name} ${weaponData.name}`,
      level: itemLevel,
      rarity: rarity,
      damage: damage,
      attackSpeed: attackSpeed,
      effect: weaponData.effect,
      hands: weaponData.hands,
      icon: getWeaponIcon(weaponType),
      stats: {
        damage: damage
      }
    };
  } else {
    // Generate armor
    const armorTypes = Object.keys(ARMOR_TYPES);
    const armorType = armorTypes[Math.floor(Math.random() * armorTypes.length)];
    
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
      id: `armor_${Date.now()}_${Math.random()}`,
      type: 'armor',
      armorType: armorType,
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
    shoulders: '🛡️',
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
    mana: 50 + level * 5,
    maxMana: 50 + level * 5,
    attackSpeed: 1.0
  };
  
  // Add small armor and dodge bonus per level (very small, as main stats come from items)
  baseStats.armor += level * 0.1; // 0.1 armor per level
  baseStats.dodgeChance += level * 0.05; // 0.05% dodge per level
  
  // Add stats from equipment
  const equipment = combatSystem.player.equipped;
  Object.values(equipment).forEach(item => {
    if (item && item.stats) {
      if (item.stats.hp) baseStats.maxHp += item.stats.hp;
      if (item.stats.armor) baseStats.armor += item.stats.armor;
      if (item.stats.dodge) baseStats.dodgeChance += item.stats.dodge;
      if (item.stats.hpRegen) baseStats.hpRegen += item.stats.hpRegen;
      if (item.stats.damage) baseStats.damage += item.stats.damage;
      if (item.attackSpeed) baseStats.attackSpeed = item.attackSpeed;
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
  combatSystem.player.maxMana = baseStats.maxMana;
  combatSystem.player.attackSpeed = baseStats.attackSpeed;
}

// Generate boss
function generateBoss(wave) {
  const baseHp = 500 + wave * 200;
  const baseDamage = 10 + wave * 5;
  const hp = Math.floor(baseHp * (1 + wave * 0.1));
  const damage = Math.floor(baseDamage * (1 + wave * 0.1));
  const attackSpeed = (1.5 - (wave * 0.02)) * 0.8; // Bosses attack faster as wave increases, but 10% slower overall
  const minAttackSpeed = 0.52; // Reduced by 10% (0.8 * 0.9)
  
  return {
    hp: hp,
    maxHp: hp,
    damage: damage,
    attackSpeed: Math.max(minAttackSpeed, attackSpeed),
    level: wave,
    name: `Boss Wave ${wave}`,
    effects: {
      stunned: 0,
      slowed: 0,
      poisoned: 0
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
    
    // Chance to drop item
    const dropChance = Math.min(0.7, 0.3 + combatSystem.bossWave * 0.05);
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
      
      toast(`Item dropped: ${item.name}!`, 'good');
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

// Equip item
function equipItem(item, slot) {
  if (!item) return;
  
  // Remove item from inventory
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
      
      // Shield can only be equipped with SWORD or WAND in right hand
      const rightWeapon = combatSystem.player.equipped.weaponRight;
      if (rightWeapon && (rightWeapon.weaponType === 'SWORD' || rightWeapon.weaponType === 'WAND')) {
        combatSystem.player.equipped.weaponLeft = item;
      } else if (!rightWeapon) {
        addItemToInventory(item);
        toast('Shield can only be equipped with Sword or Wand in right hand!', 'warn');
        return;
      } else {
        addItemToInventory(item);
        toast('Shield can only be equipped with Sword or Wand in right hand!', 'warn');
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
    // DAGGER - можно в обе руки, но нужно два кинжала
    else if (item.weaponType === 'DAGGER') {
      if (!slot) {
        // Auto-equip: try right first, then left
        if (!combatSystem.player.equipped.weaponRight) {
          combatSystem.player.equipped.weaponRight = item;
        } else if (!combatSystem.player.equipped.weaponLeft || combatSystem.player.equipped.weaponLeft.weaponType === 'SHIELD') {
          // Unequip left if it's a shield or empty
          if (combatSystem.player.equipped.weaponLeft) {
            addItemToInventory(combatSystem.player.equipped.weaponLeft);
          }
          combatSystem.player.equipped.weaponLeft = item;
        } else {
          // Both hands occupied, unequip right
          currentItem = combatSystem.player.equipped.weaponRight;
          if (currentItem) addItemToInventory(currentItem);
          combatSystem.player.equipped.weaponRight = item;
        }
      } else if (slot === 'weapon-right') {
        currentItem = combatSystem.player.equipped.weaponRight;
        if (currentItem) addItemToInventory(currentItem);
        combatSystem.player.equipped.weaponRight = item;
        // Remove shield from left if equipping dagger
        if (combatSystem.player.equipped.weaponLeft && combatSystem.player.equipped.weaponLeft.weaponType === 'SHIELD') {
          addItemToInventory(combatSystem.player.equipped.weaponLeft);
          combatSystem.player.equipped.weaponLeft = null;
        }
      } else if (slot === 'weapon-left') {
        currentItem = combatSystem.player.equipped.weaponLeft;
        if (currentItem && currentItem.weaponType !== 'SHIELD') {
          addItemToInventory(currentItem);
        }
        combatSystem.player.equipped.weaponLeft = item;
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
    currentItem = combatSystem.player.equipped[item.armorType];
    if (currentItem) {
      addItemToInventory(currentItem);
    }
    combatSystem.player.equipped[item.armorType] = item;
  }
  
  calculatePlayerStats();
  saveCombatState();
  renderCombat();
  if (window.experienceSystem && window.experienceSystem.inventory) {
    window.experienceSystem.inventory.render();
  }
  
  toast(`Equipped: ${item.name}`, 'good');
}

// Unequip item
function unequipItem(slot) {
  console.log('=== unequipItem START ===');
  console.log('Slot received:', slot);
  console.log('Type of slot:', typeof slot);
  console.log('Current equipped items:', combatSystem.player.equipped);
  console.log('Available slots:', Object.keys(combatSystem.player.equipped));
  
  if (!slot) {
    console.error('No slot provided!');
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
  
  console.log('Converted slot:', actualSlot);
  
  // Handle weapon slots
  if (slot === 'weapon-right' || slot === 'weapon-left') {
    const item = combatSystem.player.equipped[actualSlot];
    console.log('Weapon slot, item found:', item);
    
    if (!item) {
      console.log('No item in weapon slot:', actualSlot);
      toast('No item to unequip in this slot', 'warn');
      return;
    }
    
    console.log('Unequipping weapon:', item.name);
    
    // If it's a two-handed weapon, it occupies both slots
    if (item.hands === 2 && slot === 'weapon-right') {
      combatSystem.player.equipped.weaponRight = null;
      combatSystem.player.equipped.weaponLeft = null;
    } else {
      combatSystem.player.equipped[actualSlot] = null;
    }
    
    console.log('Item removed from equipped, adding to inventory...');
    addItemToInventory(item);
    calculatePlayerStats();
    saveCombatState();
    renderCombat();
    
    // Force inventory system to render (addItemToInventory already syncs)
    if (window.experienceSystem && window.experienceSystem.inventory && window.experienceSystem.inventory.render) {
      window.experienceSystem.inventory.render();
    }
    
    toast(`Unequipped: ${item.name}`, 'info');
    console.log('=== unequipItem END (weapon) ===');
    return;
  }
  
  // Handle armor slots
  console.log('Checking armor slot:', slot);
  const item = combatSystem.player.equipped[slot];
  console.log('Armor item found:', item);
  
  if (!item) {
    console.log('No item in armor slot:', slot);
    toast('No item to unequip in this slot', 'warn');
    return;
  }
  
  console.log('Unequipping armor:', item.name);
  
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
  console.log('=== unequipItem END (armor) ===');
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
  
  // Calculate damage
  let damage = combatSystem.player.damage;
  
  // Add weapon damage if equipped
  if (rightWeapon && rightWeapon.stats && rightWeapon.stats.damage) {
    damage += rightWeapon.stats.damage;
  }
  
  // Check for crit
  if (Math.random() * 100 < combatSystem.player.critChance) {
    damage *= combatSystem.player.critMultiplier;
    showCombatText('CRIT!', '#ffd700', combatSystem.boss);
  }
  
  // Apply damage
  combatSystem.boss.hp -= damage;
  combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp); // Ensure HP never goes below 0
  showCombatText(`-${Math.floor(damage)}`, '#ff6666', combatSystem.boss);
  
  // Apply weapon effects
  if (rightWeapon && rightWeapon.effect) {
    applyWeaponEffect(rightWeapon.effect);
  }
  
  if (combatSystem.boss.hp <= 0) {
    combatSystem.boss.hp = 0; // Ensure HP is exactly 0
    endCombat(true);
    return;
  }
  
  renderCombat();
  updateAttackButton();
}

// Apply weapon effect
function applyWeaponEffect(effect) {
  if (!combatSystem.boss) return;
  
  switch (effect) {
    case 'bleed':
      // Bleed: damage over time
      if (!combatSystem.boss.effects.bleed) {
        combatSystem.boss.effects.bleed = { duration: 5000, damage: combatSystem.player.damage * 0.1 };
      }
      break;
    case 'poison':
      // Poison: reduces boss damage
      combatSystem.boss.effects.poisoned = 3000;
      break;
    case 'shock':
      // Shock: stuns boss
      if (Math.random() < 0.2) {
        combatSystem.boss.effects.stunned = 2000;
        showCombatText('STUNNED!', '#00ffff', combatSystem.boss);
      }
      break;
    case 'frost':
      // Frost: slows boss
      combatSystem.boss.effects.slowed = 3000;
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
  
  // Apply poison effect (reduces boss damage)
  if (combatSystem.boss.effects.poisoned > 0) {
    damage *= 0.7;
  }
  
  combatSystem.player.hp -= damage;
  combatSystem.player.hp = Math.max(0, combatSystem.player.hp); // Ensure HP never goes below 0
  showCombatText(`-${Math.floor(damage)}`, '#ff0000', combatSystem.player);
  
  if (combatSystem.player.hp <= 0) {
    combatSystem.player.hp = 0; // Ensure HP is exactly 0
    endCombat(false);
    toast('You were defeated! Try again.', 'bad');
    return;
  }
  
  renderCombat();
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
  
  // Update effects
  if (combatSystem.boss) {
    // Update bleed
    if (combatSystem.boss.effects.bleed) {
      const bleed = combatSystem.boss.effects.bleed;
      if (bleed.duration > 0) {
        bleed.duration -= 16; // ~60fps
        if (bleed.duration % 1000 < 16) {
          combatSystem.boss.hp -= bleed.damage;
          combatSystem.boss.hp = Math.max(0, combatSystem.boss.hp); // Ensure HP never goes below 0
          showCombatText(`-${Math.floor(bleed.damage)}`, '#ff6666', combatSystem.boss);
          if (combatSystem.boss.hp <= 0) {
            combatSystem.boss.hp = 0; // Ensure HP is exactly 0
            endCombat(true);
            return;
          }
        }
        if (bleed.duration <= 0) {
          delete combatSystem.boss.effects.bleed;
        }
      }
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
    } else if (bossHpBar && bossHpText) {
      // During countdown or before combat
      bossHpBar.style.width = '100%';
      bossHpText.textContent = 'Ready...';
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
  
  Object.keys(combatSystem.player.equipped).forEach(slot => {
    save.inventory.equipment[slot] = combatSystem.player.equipped[slot];
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

// Export constants for use in other files
if (typeof window !== 'undefined') {
  window.combatSystem = window.combatSystem || {};
  window.combatSystem.ITEM_RARITY = ITEM_RARITY;
  window.combatSystem.WEAPON_TYPES = WEAPON_TYPES;
}

// Export functions
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
    calculateStats: calculatePlayerStats,
    getEquipped: getEquippedItems,
    getPlayerStats: getPlayerStats,
    getItemRarityColor: getItemRarityColor
  };
}

