/* Experience and Leveling System */

// Experience system state
let experienceSystem = {
  level: 1,
  experience: 0,
  experienceToNextLevel: 100
};

// Experience rewards configuration (balanced system)
const EXPERIENCE_REWARDS = {
  // Click actions
  click: 0.1,                    // Per click
  clickLevelUp: 5,               // Per click level upgrade
  clickUpgrade: 10,              // Per click segment upgrade
  
  // Building actions
  buildingLevelUp: 3,            // Per building level upgrade
  buildingUpgrade: 8,            // Per building segment upgrade
  
  // Special events
  kingClick: 15,                  // Per king click
  spiderClick: 12,               // Per spider click
  elfClick: 10,                  // Per elf archer click
  barmatunClick: 18,             // Per angry barmatun click
  
  // Uber building
  uberUnlock: 50,                // When uber building is unlocked
  uberLevelUp: 20,               // Per uber level upgrade
  
  // Achievements
  achievement: 25                // Per achievement unlocked
};

// Calculate experience required for next level (balanced progression)
function calculateExperienceForLevel(level) {
  // Exponential growth with diminishing returns
  // Base: 100, multiplier: 1.15 per level
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

// Initialize experience system
function initExperienceSystem() {
  if (!save) return;
  
  // Initialize experience data if not exists
  if (!save.experience) {
    save.experience = {
      level: 1,
      experience: 0,
      experienceToNextLevel: 100
    };
  }
  
  experienceSystem = {
    level: save.experience.level || 1,
    experience: save.experience.experience || 0,
    experienceToNextLevel: save.experience.experienceToNextLevel || 100
  };
  
  // Ensure experienceToNextLevel is correct for current level
  experienceSystem.experienceToNextLevel = calculateExperienceForLevel(experienceSystem.level);
  
  renderExperienceBar();
}

// Add experience
function addExperience(amount, source = '') {
  if (!save || !save.experience) {
    initExperienceSystem();
  }
  
  if (amount <= 0) return;
  
  experienceSystem.experience += amount;
  save.experience.experience = experienceSystem.experience;
  
  // Check for level up
  let leveledUp = false;
  while (experienceSystem.experience >= experienceSystem.experienceToNextLevel) {
    experienceSystem.experience -= experienceSystem.experienceToNextLevel;
    experienceSystem.level++;
    experienceSystem.experienceToNextLevel = calculateExperienceForLevel(experienceSystem.level);
    leveledUp = true;
    
    // Save level up
    save.experience.level = experienceSystem.level;
    save.experience.experience = experienceSystem.experience;
    save.experience.experienceToNextLevel = experienceSystem.experienceToNextLevel;
    
    // Show level up notification
    toast(`Level Up! You are now level ${experienceSystem.level}!`, 'good');
  }
  
  // Save current experience
  save.experience.experience = experienceSystem.experience;
  
  // Update UI
  renderExperienceBar();
  
  return leveledUp;
}

// Render experience bar
function renderExperienceBar() {
  const barFill = document.getElementById('experience-bar-fill');
  const barText = document.getElementById('experience-bar-text');
  const levelText = document.getElementById('experience-level');
  
  if (!barFill || !barText || !levelText) return;
  
  const percentage = (experienceSystem.experience / experienceSystem.experienceToNextLevel) * 100;
  barFill.style.width = `${Math.min(100, percentage)}%`;
  
  // Update text with percentage
  levelText.textContent = `Level ${experienceSystem.level}`;
  const percentageText = percentage.toFixed(1);
  barText.textContent = `${formatNumber(experienceSystem.experience)} / ${formatNumber(experienceSystem.experienceToNextLevel)} XP (${percentageText}%)`;
  
  // Update segment markers (10 parts, 10% each)
  updateExperienceSegments(percentage);
}

// Update experience bar segments (10 parts, 10% each)
function updateExperienceSegments(percentage) {
  const segments = document.querySelectorAll('.experience-segment');
  segments.forEach((segment, index) => {
    const segmentThreshold = (index + 1) * 10;
    if (percentage >= segmentThreshold) {
      segment.classList.add('filled');
    } else {
      segment.classList.remove('filled');
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

// Experience hooks for game events

// Hook: Click action
function hookClickExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.click, 'click');
  }
}

// Hook: Click level upgrade
function hookClickLevelUpExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.clickLevelUp, 'clickLevelUp');
  }
}

// Hook: Click segment upgrade
function hookClickUpgradeExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.clickUpgrade, 'clickUpgrade');
  }
}

// Hook: Building level upgrade
function hookBuildingLevelUpExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.buildingLevelUp, 'buildingLevelUp');
  }
}

// Hook: Building segment upgrade
function hookBuildingUpgradeExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.buildingUpgrade, 'buildingUpgrade');
  }
}

// Hook: King click
function hookKingClickExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.kingClick, 'kingClick');
  }
}

// Hook: Spider click
function hookSpiderClickExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.spiderClick, 'spiderClick');
  }
}

// Hook: Elf click
function hookElfClickExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.elfClick, 'elfClick');
  }
}

// Hook: Barmatun click
function hookBarmatunClickExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.barmatunClick, 'barmatunClick');
  }
}

// Hook: Uber unlock
function hookUberUnlockExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.uberUnlock, 'uberUnlock');
  }
}

// Hook: Uber level upgrade
function hookUberLevelUpExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.uberLevelUp, 'uberLevelUp');
  }
}

// Hook: Achievement unlocked
function hookAchievementExperience() {
  if (typeof addExperience === 'function') {
    addExperience(EXPERIENCE_REWARDS.achievement, 'achievement');
  }
}

// ======= INVENTORY SYSTEM =======
let inventorySystem = {
  equipment: {
    helmet: null,
    shoulders: null,
    chest: null,
    gloves: null,
    ring1: null,
    ring2: null,
    accessory1: null,
    accessory2: null,
    accessory3: null,
    necklace: null,
    legs: null,
    boots: null,
    'weapon-right': null,
    'weapon-left': null
  },
  inventory: new Array(40).fill(null), // 10x4 grid
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

// Initialize inventory system
function initInventorySystem() {
  if (!save) return;
  
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
  
  inventorySystem.equipment = save.inventory.equipment || inventorySystem.equipment;
  inventorySystem.inventory = save.inventory.inventory || inventorySystem.inventory;
  inventorySystem.stats = save.inventory.stats || inventorySystem.stats;
  
  renderInventory();
}

// Equipment slot icons mapping
const equipmentIcons = {
  helmet: '⛑️',
  shoulders: '🛡️',
  chest: '🦺',
  gloves: '🧤',
  ring1: '💍',
  ring2: '💍',
  accessory1: '✨',
  accessory2: '✨',
  accessory3: '✨',
  necklace: '📿',
  legs: '👖',
  boots: '👢',
  'weapon-right': '⚔️',
  'weapon-left': '🛡️'
};

const equipmentLabels = {
  helmet: 'Head',
  shoulders: 'Shoulder',
  chest: 'Chest',
  gloves: 'Gloves',
  ring1: 'Ring',
  ring2: 'Ring',
  accessory1: 'Accessory',
  accessory2: 'Accessory',
  accessory3: 'Accessory',
  necklace: 'Necklace',
  legs: 'Legs',
  boots: 'Boots',
  'weapon-right': 'Weapon',
  'weapon-left': 'Shield'
};

// Generate item tooltip HTML
function getItemTooltipHTML(item) {
  if (!item) return '';
  
  const rarityColor = item.rarity && window.combatSystem && window.combatSystem.getItemRarityColor 
    ? window.combatSystem.getItemRarityColor(item.rarity) 
    : '#9d9d9d';
  const rarityName = item.rarity && window.combatSystem && window.combatSystem.ITEM_RARITY 
    ? window.combatSystem.ITEM_RARITY[item.rarity]?.name || item.rarity 
    : 'Common';
  
  let html = `
    <div class="tooltip-header" style="color: ${rarityColor}">
      ${item.name || 'Item'}
    </div>
    <div class="tooltip-body">
      <div class="tooltip-stat">
        <span class="tooltip-stat-label">Rarity:</span>
        <span class="tooltip-stat-value" style="color: ${rarityColor}">${rarityName}</span>
      </div>
      <div class="tooltip-stat">
        <span class="tooltip-stat-label">Level:</span>
        <span class="tooltip-stat-value">${item.level || 1}</span>
      </div>
  `;
  
  if (item.type === 'weapon') {
    if (item.damage) {
      html += `
        <div class="tooltip-line"></div>
        <div class="tooltip-stat">
          <span class="tooltip-stat-label">Damage:</span>
          <span class="tooltip-stat-value">+${item.damage}</span>
        </div>
      `;
    }
    if (item.attackSpeed) {
      html += `
        <div class="tooltip-stat">
          <span class="tooltip-stat-label">Attack Speed:</span>
          <span class="tooltip-stat-value">${item.attackSpeed.toFixed(2)}/s</span>
        </div>
      `;
    }
    if (item.effect) {
      const effectNames = {
        bleed: 'Bleeding',
        poison: 'Poison',
        shock: 'Shock',
        frost: 'Frost'
      };
      html += `
        <div class="tooltip-stat">
          <span class="tooltip-stat-label">Effect:</span>
          <span class="tooltip-stat-value">${effectNames[item.effect] || item.effect}</span>
        </div>
      `;
    }
  } else if (item.type === 'armor' && item.stats) {
    html += `<div class="tooltip-line"></div>`;
    if (item.stats.hp) {
      html += `
        <div class="tooltip-stat">
          <span class="tooltip-stat-label">HP:</span>
          <span class="tooltip-stat-value">+${item.stats.hp}</span>
        </div>
      `;
    }
    if (item.stats.armor) {
      html += `
        <div class="tooltip-stat">
          <span class="tooltip-stat-label">Armor:</span>
          <span class="tooltip-stat-value">+${item.stats.armor}</span>
        </div>
      `;
    }
    if (item.stats.dodge) {
      html += `
        <div class="tooltip-stat">
          <span class="tooltip-stat-label">Dodge:</span>
          <span class="tooltip-stat-value">+${item.stats.dodge.toFixed(1)}%</span>
        </div>
      `;
    }
    if (item.stats.hpRegen) {
      html += `
        <div class="tooltip-stat">
          <span class="tooltip-stat-label">HP Regen:</span>
          <span class="tooltip-stat-value">+${item.stats.hpRegen.toFixed(1)}/s</span>
        </div>
      `;
    }
  }
  
  // Add unequip hint for equipped items
  html += `
    <div class="tooltip-line"></div>
    <div class="tooltip-stat" style="color: var(--muted); font-size: 0.85rem; margin-top: 8px;">
      <span>Ctrl + Click to unequip</span>
    </div>
  `;
  
  html += `</div>`;
  return html;
}

// Show item tooltip
function showItemTooltip(event, item) {
  if (!item) return;
  
  const tooltip = document.createElement('div');
  tooltip.className = 'item-tooltip';
  tooltip.setAttribute('data-treasury-tooltip', 'true');
  tooltip.innerHTML = getItemTooltipHTML(item);
  document.body.appendChild(tooltip);
  
  const rect = event.target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  let top = rect.bottom + 10;
  
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }
  if (top + tooltipRect.height > window.innerHeight - 10) {
    top = rect.top - tooltipRect.height - 10;
  }
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.opacity = '1';
  tooltip.style.visibility = 'visible';
  tooltip.style.display = 'block';
  
  return tooltip;
}

// Hide item tooltip
function hideItemTooltip() {
  const tooltip = document.querySelector('.item-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Render inventory modal
function renderInventory() {
  // Get equipped items from combat system if available
  let equippedItems = inventorySystem.equipment;
  if (window.combatSystem && window.combatSystem.isActive && !window.combatSystem.isActive()) {
    // Use combat system equipment when not in combat
    const combatEquipped = window.combatSystem.getEquipped ? window.combatSystem.getEquipped() : null;
    if (combatEquipped) {
      equippedItems = {
        helmet: combatEquipped.helmet,
        shoulders: combatEquipped.shoulders,
        chest: combatEquipped.chest,
        gloves: combatEquipped.gloves,
        ring1: null, // Rings not in combat system
        ring2: null,
        accessory1: null,
        accessory2: null,
        accessory3: null,
        necklace: null,
        legs: combatEquipped.legs,
        boots: combatEquipped.boots,
        'weapon-right': combatEquipped.weaponRight,
        'weapon-left': combatEquipped.weaponLeft
      };
    }
  }
  
  // Render equipment slots
  const equipmentSlots = document.querySelectorAll('.equipment-slot');
  equipmentSlots.forEach(slot => {
    const slotName = slot.dataset.slot;
    const item = equippedItems[slotName];
    
    // Clear existing content and classes
    slot.innerHTML = '';
    slot.classList.remove('occupied');
    slot.style.borderColor = '';
    
    // Remove all event listeners by cloning
    const newSlot = slot.cloneNode(false);
    Array.from(slot.attributes).forEach(attr => {
      newSlot.setAttribute(attr.name, attr.value);
    });
    slot.parentNode.replaceChild(newSlot, slot);
    
    // Store slotName in dataset to ensure it's available
    newSlot.dataset.slot = slotName;
    // Also store as data attribute for easier access
    newSlot.setAttribute('data-slot-name', slotName);
    
    if (item) {
      newSlot.classList.add('occupied');
      const rarityColor = item.rarity && window.combatSystem && window.combatSystem.getItemRarityColor 
        ? window.combatSystem.getItemRarityColor(item.rarity) 
        : '#9d9d9d';
      newSlot.style.borderColor = rarityColor;
      newSlot.innerHTML = `
        <div class="equipment-slot-icon">${item.icon || equipmentIcons[slotName] || '📦'}</div>
        <div class="equipment-slot-label">${item.name || equipmentLabels[slotName] || 'Item'}</div>
      `;
      
      // Add tooltip and Ctrl+Click to unequip
      let tooltip = null;
      newSlot.addEventListener('mouseenter', (e) => {
        tooltip = showItemTooltip(e, item);
      });
      newSlot.addEventListener('mouseleave', () => {
        hideItemTooltip();
      });
      
      // Make equipped item draggable (for swapping)
      newSlot.draggable = true;
      
      newSlot.addEventListener('dragstart', (e) => {
        const dragData = { 
          type: 'equipped', 
          slot: slotName, 
          item: item 
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        newSlot.style.opacity = '0.5';
        // Store item globally for dragenter/dragover events
        window._currentDragItem = item;
      });
      
      newSlot.addEventListener('dragend', () => {
        newSlot.style.opacity = '1';
        window._currentDragItem = null;
        // Clear all highlight classes
        document.querySelectorAll('.equipment-slot, .inventory-slot').forEach(s => {
          s.classList.remove('drag-over-valid', 'drag-over-invalid');
        });
      });
      
      // Add drop handler for equipment slots (for swapping items)
      newSlot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Use global variable set in dragstart
        if (window._currentDragItem) {
          const draggedItem = window._currentDragItem;
          if (canEquipItemInSlot(draggedItem, slotName)) {
            newSlot.classList.remove('drag-over-invalid');
            newSlot.classList.add('drag-over-valid');
          } else {
            newSlot.classList.remove('drag-over-valid');
            newSlot.classList.add('drag-over-invalid');
          }
        }
      });
      
      newSlot.addEventListener('dragenter', (e) => {
        e.preventDefault();
        // Use global variable set in dragstart
        if (window._currentDragItem) {
          const draggedItem = window._currentDragItem;
          if (canEquipItemInSlot(draggedItem, slotName)) {
            newSlot.classList.remove('drag-over-invalid');
            newSlot.classList.add('drag-over-valid');
          } else {
            newSlot.classList.remove('drag-over-valid');
            newSlot.classList.add('drag-over-invalid');
          }
        }
      });
      
      newSlot.addEventListener('dragleave', () => {
        newSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
      });
      
      newSlot.addEventListener('drop', (e) => {
        e.preventDefault();
        newSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
        
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.type === 'equipped') {
            // Swapping equipped items - not implemented for now
            return;
          } else if (data.item) {
            // Dropping from inventory
            const draggedItem = data.item;
            if (canEquipItemInSlot(draggedItem, slotName)) {
              window.combatSystem.equip(draggedItem, slotName);
              hideItemTooltip();
            } else {
              toast('Cannot equip this item in this slot!', 'warn');
            }
          }
        } catch (err) {
          console.error('Error handling drop:', err);
        }
      });
      
      // Add Ctrl+Click handler to unequip - store slotName in closure
      const storedSlotName = slotName; // Store in closure
      const storedItem = item; // Store item reference
      
      newSlot.addEventListener('click', function(e) {
        console.log('Click event on equipment slot. Stored slot:', storedSlotName, 'Dataset slot:', this.dataset.slot, 'Ctrl:', e.ctrlKey, 'Meta:', e.metaKey);
        
        // Check for Ctrl (Windows/Linux) or Cmd (Mac)
        if (e.ctrlKey || e.metaKey) {
          console.log('Ctrl+Click detected! Attempting to unequip from slot:', storedSlotName);
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          hideItemTooltip();
          
          // Get slot name from multiple sources
          const currentSlotName = this.dataset.slot || this.getAttribute('data-slot-name') || storedSlotName;
          console.log('Final slot name to unequip:', currentSlotName);
          console.log('combatSystem available:', !!window.combatSystem);
          console.log('combatSystem object:', window.combatSystem);
          console.log('unequip function available:', !!(window.combatSystem && window.combatSystem.unequip));
          console.log('unequip function type:', typeof (window.combatSystem && window.combatSystem.unequip));
          
          // Try multiple ways to call unequip
          let unequipped = false;
          
          if (window.combatSystem) {
            if (window.combatSystem.unequip && typeof window.combatSystem.unequip === 'function') {
              console.log('Calling unequip via window.combatSystem.unequip...');
              try {
                window.combatSystem.unequip(currentSlotName);
                console.log('unequip called successfully');
                unequipped = true;
              } catch (error) {
                console.error('Error in unequip:', error);
              }
            } else {
              console.error('window.combatSystem.unequip is not a function!', window.combatSystem.unequip);
            }
          } else {
            console.error('window.combatSystem is not available!');
          }
          
          if (!unequipped) {
            console.error('Failed to unequip item!');
            toast('Failed to unequip item. Check console for details.', 'bad');
          }
          
          return false;
        }
      }, true); // Use capture phase
    } else {
      // Empty slot - add drag and drop handlers
      newSlot.draggable = false;
      
      // Add drag handlers for empty slots
      newSlot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Use global variable set in dragstart (getData doesn't work in dragover)
        if (window._currentDragItem) {
          const item = window._currentDragItem;
          if (canEquipItemInSlot(item, slotName)) {
            newSlot.classList.remove('drag-over-invalid');
            newSlot.classList.add('drag-over-valid');
          } else {
            newSlot.classList.remove('drag-over-valid');
            newSlot.classList.add('drag-over-invalid');
          }
        }
      });
      
      newSlot.addEventListener('dragenter', (e) => {
        e.preventDefault();
        // Use global variable set in dragstart
        if (window._currentDragItem) {
          const item = window._currentDragItem;
          if (canEquipItemInSlot(item, slotName)) {
            newSlot.classList.remove('drag-over-invalid');
            newSlot.classList.add('drag-over-valid');
          } else {
            newSlot.classList.remove('drag-over-valid');
            newSlot.classList.add('drag-over-invalid');
          }
        }
      });
      
      newSlot.addEventListener('dragleave', () => {
        newSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
      });
      
      newSlot.addEventListener('drop', (e) => {
        e.preventDefault();
        newSlot.classList.remove('drag-over-valid', 'drag-over-invalid');
        
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.item) {
            const draggedItem = data.item;
            if (canEquipItemInSlot(draggedItem, slotName)) {
              window.combatSystem.equip(draggedItem, slotName);
              hideItemTooltip();
            } else {
              toast('Cannot equip this item in this slot!', 'warn');
            }
          }
        } catch (err) {
          console.error('Error handling drop:', err);
        }
      });
      
      const icon = equipmentIcons[slotName] || '📦';
      const label = equipmentLabels[slotName] || 'Empty';
      newSlot.innerHTML = `
        <div class="equipment-slot-icon">${icon}</div>
        <div class="equipment-slot-label">${label}</div>
      `;
    }
  });
  
  // Render stats from combat system if available
  let stats = inventorySystem.stats;
  if (window.combatSystem && window.combatSystem.getPlayerStats) {
    const combatStats = window.combatSystem.getPlayerStats();
    if (combatStats) {
      stats = combatStats;
    }
  }
  
  document.getElementById('inv-hp').textContent = `${Math.floor(stats.hp)} / ${Math.floor(stats.maxHp)}`;
  document.getElementById('inv-damage').textContent = stats.damage.toFixed(1);
  document.getElementById('inv-armor').textContent = stats.armor.toFixed(1);
  document.getElementById('inv-crit-chance').textContent = `${stats.critChance.toFixed(1)}%`;
  document.getElementById('inv-crit-mult').textContent = `${stats.critMultiplier.toFixed(1)}x`;
  document.getElementById('inv-dodge').textContent = `${stats.dodgeChance.toFixed(1)}%`;
  document.getElementById('inv-hp-regen').textContent = `${stats.hpRegen.toFixed(1)} /s`;
  document.getElementById('inv-mana').textContent = `${Math.floor(stats.mana)} / ${Math.floor(stats.maxMana)}`;
  
  // Sync inventory from save if available
  if (save && save.inventory && save.inventory.inventory) {
    inventorySystem.inventory = save.inventory.inventory;
  }
  
  // Render inventory grid
  const inventoryGrid = document.getElementById('inventory-grid');
  if (inventoryGrid) {
    inventoryGrid.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.slot = i;
      
      const item = inventorySystem.inventory[i];
      if (item) {
        slot.classList.add('occupied');
        const rarityColor = item.rarity && window.combatSystem && window.combatSystem.getItemRarityColor 
          ? window.combatSystem.getItemRarityColor(item.rarity) 
          : '#9d9d9d';
        slot.style.borderColor = rarityColor;
        slot.innerHTML = `
          <div class="inventory-slot-item">${item.icon || '📦'}</div>
          ${item.count > 1 ? `<div class="inventory-slot-count">${item.count}</div>` : ''}
        `;
        
        // Add tooltip
        let tooltip = null;
        slot.addEventListener('mouseenter', (e) => {
          tooltip = showItemTooltip(e, item);
        });
        slot.addEventListener('mouseleave', () => {
          hideItemTooltip();
        });
        
        // Make item draggable
        slot.draggable = true;
        slot.dataset.itemIndex = i;
        
        // Drag start
        slot.addEventListener('dragstart', (e) => {
          const dragData = { itemIndex: i, item: item };
          e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
          e.dataTransfer.effectAllowed = 'move';
          slot.style.opacity = '0.5';
          // Store item globally for dragenter/dragover events
          window._currentDragItem = item;
        });
        
        slot.addEventListener('dragend', () => {
          slot.style.opacity = '1';
          window._currentDragItem = null;
          // Clear all highlight classes
          document.querySelectorAll('.equipment-slot, .inventory-slot').forEach(s => {
            s.classList.remove('drag-over-valid', 'drag-over-invalid');
          });
        });
        
        // Add click handler for equipping
        slot.addEventListener('click', () => {
          if (item.type === 'weapon') {
            if (item.weaponType === 'SHIELD') {
              window.combatSystem.equip(item, 'weapon-left');
            } else if (item.weaponType === 'SWORD') {
              // Sword - only right hand
              window.combatSystem.equip(item, 'weapon-right');
            } else if (item.weaponType === 'DAGGER') {
              // Dagger - can go in either hand, try right first
              if (!window.combatSystem.getEquipped().weaponRight) {
                window.combatSystem.equip(item, 'weapon-right');
              } else if (!window.combatSystem.getEquipped().weaponLeft || 
                         window.combatSystem.getEquipped().weaponLeft.weaponType === 'SHIELD') {
                window.combatSystem.equip(item, 'weapon-left');
              } else {
                window.combatSystem.equip(item, 'weapon-right');
              }
            } else if (item.weaponType === 'WAND') {
              // Wand - can go in either hand, but only one
              if (!window.combatSystem.getEquipped().weaponRight) {
                window.combatSystem.equip(item, 'weapon-right');
              } else if (!window.combatSystem.getEquipped().weaponLeft) {
                window.combatSystem.equip(item, 'weapon-left');
              } else {
                window.combatSystem.equip(item, 'weapon-right');
              }
            } else if (item.hands === 2) {
              // Two-handed weapons (TWOHANDED_SWORD, STAFF)
              window.combatSystem.equip(item, 'weapon-right');
            } else {
              window.combatSystem.equip(item, 'weapon-right');
            }
          } else if (item.type === 'armor') {
            window.combatSystem.equip(item, item.armorType);
          }
          hideItemTooltip();
        });
      } else {
        slot.style.borderColor = '';
      }
      
      inventoryGrid.appendChild(slot);
    }
  }
}

// Open inventory modal
function openInventoryModal() {
  const modal = document.getElementById('inventory-modal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    renderInventory();
  }
}

// Close inventory modal
function closeInventoryModal() {
  const modal = document.getElementById('inventory-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// Initialize inventory event listeners
function initInventoryEvents() {
  const inventoryBtn = document.getElementById('inventory-btn');
  const inventoryClose = document.getElementById('inventory-close');
  const inventoryModal = document.getElementById('inventory-modal');
  
  if (inventoryBtn) {
    inventoryBtn.addEventListener('click', openInventoryModal);
  }
  
  if (inventoryClose) {
    inventoryClose.addEventListener('click', closeInventoryModal);
  }
  
  if (inventoryModal) {
    inventoryModal.addEventListener('click', (e) => {
      if (e.target === inventoryModal) {
        closeInventoryModal();
      }
    });
  }
}

// Initialize inventory on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initInventoryEvents();
    });
  } else {
    initInventoryEvents();
  }
}

// Export functions for use in main script
if (typeof window !== 'undefined') {
  window.experienceSystem = {
    init: initExperienceSystem,
    addExperience: addExperience,
    renderExperienceBar: renderExperienceBar,
    getLevel: () => experienceSystem.level,
    getExperience: () => experienceSystem.experience,
    getExperienceToNext: () => experienceSystem.experienceToNextLevel,
    hooks: {
      click: hookClickExperience,
      clickLevelUp: hookClickLevelUpExperience,
      clickUpgrade: hookClickUpgradeExperience,
      buildingLevelUp: hookBuildingLevelUpExperience,
      buildingUpgrade: hookBuildingUpgradeExperience,
      kingClick: hookKingClickExperience,
      spiderClick: hookSpiderClickExperience,
      elfClick: hookElfClickExperience,
      barmatunClick: hookBarmatunClickExperience,
      uberUnlock: hookUberUnlockExperience,
      uberLevelUp: hookUberLevelUpExperience,
      achievement: hookAchievementExperience
    },
    inventory: {
      init: initInventorySystem,
      render: renderInventory,
      open: openInventoryModal,
      close: closeInventoryModal,
      getEquipment: () => inventorySystem.equipment,
      getInventory: () => inventorySystem.inventory,
      getStats: () => inventorySystem.stats
    }
  };
}

// Check if item can be equipped in a specific slot
function canEquipItemInSlot(item, slotName) {
  if (!item || !window.combatSystem) return false;
  
  // Armor items
  if (item.type === 'armor') {
    return item.armorType === slotName;
  }
  
  // Weapon items
  if (item.type === 'weapon') {
    const equipped = window.combatSystem.getEquipped();
    
    // Shield - only left hand, requires SWORD or WAND in right hand
    if (item.weaponType === 'SHIELD') {
      if (slotName !== 'weapon-left') return false;
      // Can equip shield if right hand has SWORD or WAND, or is empty (will check on equip)
      return !equipped.weaponRight || equipped.weaponRight.weaponType === 'SWORD' || equipped.weaponRight.weaponType === 'WAND';
    }
    
    // Sword - only right hand
    if (item.weaponType === 'SWORD') {
      return slotName === 'weapon-right';
    }
    
    // Dagger - can go in either hand
    if (item.weaponType === 'DAGGER') {
      return slotName === 'weapon-right' || slotName === 'weapon-left';
    }
    
    // Wand - can go in either hand, but only one wand total
    if (item.weaponType === 'WAND') {
      if (slotName !== 'weapon-right' && slotName !== 'weapon-left') return false;
      // Check if wand is already equipped
      if (equipped.weaponRight && equipped.weaponRight.weaponType === 'WAND') return false;
      if (equipped.weaponLeft && equipped.weaponLeft.weaponType === 'WAND') return false;
      return true;
    }
    
    // Two-handed weapons (TWOHANDED_SWORD, STAFF) - both hands
    if (item.hands === 2) {
      return slotName === 'weapon-right';
    }
  }
  
  return false;
}
