// Temporary file for new achievements array
// This will be inserted into script.js

const ACHIEVEMENTS = [
  // ===== EXISTING ACHIEVEMENTS (updated rewards to 0.005) =====
  // Clicks: 1, 46, 103, 542, 1084, 5844, 11111 (+0.5%)
  { id: 'clicks_1', type: 'clicks', value: 1, reward: 0.005, name: 'First Click', icon: '👆' },
  { id: 'clicks_46', type: 'clicks', value: 46, reward: 0.005, name: '46 Clicks', icon: '🖱️' },
  { id: 'clicks_103', type: 'clicks', value: 103, reward: 0.005, name: '103 Clicks', icon: '👆' },
  { id: 'clicks_542', type: 'clicks', value: 542, reward: 0.005, name: '542 Clicks', icon: '🖱️' },
  { id: 'clicks_1084', type: 'clicks', value: 1084, reward: 0.005, name: '1084 Clicks', icon: '👆' },
  { id: 'clicks_5844', type: 'clicks', value: 5844, reward: 0.005, name: '5844 Clicks', icon: '🖱️' },
  { id: 'clicks_11111', type: 'clicks', value: 11111, reward: 0.005, name: '11111 Clicks', icon: '👆' },
  // Clicks: 25678, 54321, 101101, 333333 (+0.5%)
  { id: 'clicks_25678', type: 'clicks', value: 25678, reward: 0.005, name: '25678 Clicks', icon: '⚡' },
  { id: 'clicks_54321', type: 'clicks', value: 54321, reward: 0.005, name: '54321 Clicks', icon: '⚡' },
  { id: 'clicks_101101', type: 'clicks', value: 101101, reward: 0.005, name: '101101 Clicks', icon: '⚡' },
  { id: 'clicks_333333', type: 'clicks', value: 333333, reward: 0.005, name: '333333 Clicks', icon: '⚡' },
  // Clicks: 666666, 1000011 (+0.5%)
  { id: 'clicks_666666', type: 'clicks', value: 666666, reward: 0.005, name: '666666 Clicks', icon: '🔥' },
  { id: 'clicks_1000011', type: 'clicks', value: 1000011, reward: 0.005, name: '1M Clicks', icon: '🔥' },
  // Clicks: 5553535, 10000000 (+0.5%)
  { id: 'clicks_5553535', type: 'clicks', value: 5553535, reward: 0.005, name: '5.5M Clicks', icon: '💎' },
  { id: 'clicks_10000000', type: 'clicks', value: 10000000, reward: 0.005, name: '10M Clicks', icon: '💎' },
  
  // Buildings: buy first (+0.5%)
  { id: 'building_first', type: 'first_building', value: 1, reward: 0.005, name: 'First Building', icon: '🏠' },
  
  // Buildings: level 10 (1, 7, 16, 37, 50 buildings) (+0.5%)
  { id: 'buildings_10_1', type: 'buildings_level', level: 10, count: 1, reward: 0.005, name: '1 Building Lv10', icon: '🏘️' },
  { id: 'buildings_10_7', type: 'buildings_level', level: 10, count: 7, reward: 0.005, name: '7 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_16', type: 'buildings_level', level: 10, count: 16, reward: 0.005, name: '16 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_37', type: 'buildings_level', level: 10, count: 37, reward: 0.005, name: '37 Buildings Lv10', icon: '🏘️' },
  { id: 'buildings_10_50', type: 'buildings_level', level: 10, count: 50, reward: 0.005, name: '50 Buildings Lv10', icon: '🏘️' },
  
  // Buildings: level 40 (+0.5%)
  { id: 'buildings_40_1', type: 'buildings_level', level: 40, count: 1, reward: 0.005, name: '1 Building Lv40', icon: '🏛️' },
  { id: 'buildings_40_7', type: 'buildings_level', level: 40, count: 7, reward: 0.005, name: '7 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_16', type: 'buildings_level', level: 40, count: 16, reward: 0.005, name: '16 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_37', type: 'buildings_level', level: 40, count: 37, reward: 0.005, name: '37 Buildings Lv40', icon: '🏛️' },
  { id: 'buildings_40_50', type: 'buildings_level', level: 40, count: 50, reward: 0.005, name: '50 Buildings Lv40', icon: '🏛️' },
  
  // Buildings: level 90 (+0.5%)
  { id: 'buildings_90_1', type: 'buildings_level', level: 90, count: 1, reward: 0.005, name: '1 Building Lv90', icon: '🏰' },
  { id: 'buildings_90_7', type: 'buildings_level', level: 90, count: 7, reward: 0.005, name: '7 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_16', type: 'buildings_level', level: 90, count: 16, reward: 0.005, name: '16 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_37', type: 'buildings_level', level: 90, count: 37, reward: 0.005, name: '37 Buildings Lv90', icon: '🏰' },
  { id: 'buildings_90_50', type: 'buildings_level', level: 90, count: 50, reward: 0.005, name: '50 Buildings Lv90', icon: '🏰' },
  
  // Buildings: level 170 (+0.5%)
  { id: 'buildings_170_1', type: 'buildings_level', level: 170, count: 1, reward: 0.005, name: '1 Building Lv170', icon: '🏯' },
  { id: 'buildings_170_7', type: 'buildings_level', level: 170, count: 7, reward: 0.005, name: '7 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_16', type: 'buildings_level', level: 170, count: 16, reward: 0.005, name: '16 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_37', type: 'buildings_level', level: 170, count: 37, reward: 0.005, name: '37 Buildings Lv170', icon: '🏯' },
  { id: 'buildings_170_50', type: 'buildings_level', level: 170, count: 50, reward: 0.005, name: '50 Buildings Lv170', icon: '🏯' },
  
  // Buildings: level 310 (+0.5%)
  { id: 'buildings_310_1', type: 'buildings_level', level: 310, count: 1, reward: 0.005, name: '1 Building Lv310', icon: '🗼' },
  { id: 'buildings_310_7', type: 'buildings_level', level: 310, count: 7, reward: 0.005, name: '7 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_16', type: 'buildings_level', level: 310, count: 16, reward: 0.005, name: '16 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_37', type: 'buildings_level', level: 310, count: 37, reward: 0.005, name: '37 Buildings Lv310', icon: '🗼' },
  { id: 'buildings_310_50', type: 'buildings_level', level: 310, count: 50, reward: 0.005, name: '50 Buildings Lv310', icon: '🗼' },
  
  // Buildings: level 520 (+0.5%)
  { id: 'buildings_520_1', type: 'buildings_level', level: 520, count: 1, reward: 0.005, name: '1 Building Lv520', icon: '🏗️' },
  { id: 'buildings_520_7', type: 'buildings_level', level: 520, count: 7, reward: 0.005, name: '7 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_16', type: 'buildings_level', level: 520, count: 16, reward: 0.005, name: '16 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_37', type: 'buildings_level', level: 520, count: 37, reward: 0.005, name: '37 Buildings Lv520', icon: '🏗️' },
  { id: 'buildings_520_50', type: 'buildings_level', level: 520, count: 50, reward: 0.005, name: '50 Buildings Lv520', icon: '🏗️' },
  
  // Buildings: level 800 (+0.5%)
  { id: 'buildings_800_1', type: 'buildings_level', level: 800, count: 1, reward: 0.005, name: '1 Building Lv800', icon: '🏛️' },
  { id: 'buildings_800_7', type: 'buildings_level', level: 800, count: 7, reward: 0.005, name: '7 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_16', type: 'buildings_level', level: 800, count: 16, reward: 0.005, name: '16 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_37', type: 'buildings_level', level: 800, count: 37, reward: 0.005, name: '37 Buildings Lv800', icon: '🏛️' },
  { id: 'buildings_800_50', type: 'buildings_level', level: 800, count: 50, reward: 0.005, name: '50 Buildings Lv800', icon: '🏛️' },
  
  // Buildings: level 1000 (+0.5%)
  { id: 'buildings_1000_1', type: 'buildings_level', level: 1000, count: 1, reward: 0.005, name: '1 Building Lv1000', icon: '👑' },
  { id: 'buildings_1000_7', type: 'buildings_level', level: 1000, count: 7, reward: 0.005, name: '7 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_16', type: 'buildings_level', level: 1000, count: 16, reward: 0.005, name: '16 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_37', type: 'buildings_level', level: 1000, count: 37, reward: 0.005, name: '37 Buildings Lv1000', icon: '👑' },
  { id: 'buildings_1000_50', type: 'buildings_level', level: 1000, count: 50, reward: 0.005, name: '50 Buildings Lv1000', icon: '👑' },
  
  // Uber: unlock (+0.5%)
  { id: 'uber_unlock', type: 'uber_unlock', value: 1, reward: 0.005, name: 'Citadel Unlocked', icon: '🏰' },
  // Uber: level 10 (+0.5%)
  { id: 'uber_level_10', type: 'uber_level', value: 10, reward: 0.005, name: 'Citadel Lv10', icon: '👑' },
  
  // Destructions: 1, 6, 26, 44, 72, 147, 502, 1033 (+0.5%)
  { id: 'destructions_1', type: 'destructions', value: 1, reward: 0.005, name: '1 Destruction', icon: '💥' },
  { id: 'destructions_6', type: 'destructions', value: 6, reward: 0.005, name: '6 Destructions', icon: '💥' },
  { id: 'destructions_26', type: 'destructions', value: 26, reward: 0.005, name: '26 Destructions', icon: '💥' },
  { id: 'destructions_44', type: 'destructions', value: 44, reward: 0.005, name: '44 Destructions', icon: '💥' },
  { id: 'destructions_72', type: 'destructions', value: 72, reward: 0.005, name: '72 Destructions', icon: '💥' },
  { id: 'destructions_147', type: 'destructions', value: 147, reward: 0.005, name: '147 Destructions', icon: '💥' },
  { id: 'destructions_502', type: 'destructions', value: 502, reward: 0.005, name: '502 Destructions', icon: '💥' },
  { id: 'destructions_1033', type: 'destructions', value: 1033, reward: 0.005, name: '1033 Destructions', icon: '💥' },
  
  // Playtime: 8, 17, 39, 189, 455, 987, 1337, 2025, 5050, 9999 minutes (+0.5%)
  { id: 'playtime_8', type: 'playtime', value: 8 * 60 * 1000, reward: 0.005, name: '8 Minutes', icon: '⏱️' },
  { id: 'playtime_17', type: 'playtime', value: 17 * 60 * 1000, reward: 0.005, name: '17 Minutes', icon: '⏱️' },
  { id: 'playtime_39', type: 'playtime', value: 39 * 60 * 1000, reward: 0.005, name: '39 Minutes', icon: '⏱️' },
  { id: 'playtime_189', type: 'playtime', value: 189 * 60 * 1000, reward: 0.005, name: '189 Minutes', icon: '⏱️' },
  { id: 'playtime_455', type: 'playtime', value: 455 * 60 * 1000, reward: 0.005, name: '455 Minutes', icon: '⏱️' },
  { id: 'playtime_987', type: 'playtime', value: 987 * 60 * 1000, reward: 0.005, name: '987 Minutes', icon: '⏱️' },
  { id: 'playtime_1337', type: 'playtime', value: 1337 * 60 * 1000, reward: 0.005, name: '1337 Minutes', icon: '⏱️' },
  { id: 'playtime_2025', type: 'playtime', value: 2025 * 60 * 1000, reward: 0.005, name: '2025 Minutes', icon: '⏱️' },
  { id: 'playtime_5050', type: 'playtime', value: 5050 * 60 * 1000, reward: 0.005, name: '5050 Minutes', icon: '⏱️' },
  { id: 'playtime_9999', type: 'playtime', value: 9999 * 60 * 1000, reward: 0.005, name: '9999 Minutes', icon: '⏱️' },
  
  // Special achievement: click on title (keep 0.03)
  { id: 'honored_player', type: 'manual', value: 1, reward: 0.03, name: 'Honored Player', icon: '⭐' },
  
  // ===== NEW ACHIEVEMENTS =====
  // Extended Clicks milestones
  { id: 'clicks_25000000', type: 'clicks', value: 25000000, reward: 0.005, name: '25M Clicks', icon: '💎' },
  { id: 'clicks_50000000', type: 'clicks', value: 50000000, reward: 0.005, name: '50M Clicks', icon: '💎' },
  { id: 'clicks_100000000', type: 'clicks', value: 100000000, reward: 0.005, name: '100M Clicks', icon: '💎' },
  { id: 'clicks_250000000', type: 'clicks', value: 250000000, reward: 0.005, name: '250M Clicks', icon: '💎' },
  { id: 'clicks_500000000', type: 'clicks', value: 500000000, reward: 0.005, name: '500M Clicks', icon: '💎' },
  { id: 'clicks_1000000000', type: 'clicks', value: 1000000000, reward: 0.005, name: '1B Clicks', icon: '💎' },
  { id: 'clicks_5000000000', type: 'clicks', value: 5000000000, reward: 0.005, name: '5B Clicks', icon: '💎' },
  { id: 'clicks_10000000000', type: 'clicks', value: 10000000000, reward: 0.005, name: '10B Clicks', icon: '💎' },
  { id: 'clicks_25000000000', type: 'clicks', value: 25000000000, reward: 0.005, name: '25B Clicks', icon: '💎' },
  { id: 'clicks_50000000000', type: 'clicks', value: 50000000000, reward: 0.005, name: '50B Clicks', icon: '💎' },
  { id: 'clicks_100000000000', type: 'clicks', value: 100000000000, reward: 0.005, name: '100B Clicks', icon: '💎' },
  
  // Click Button Level
  { id: 'click_level_10', type: 'click_level', value: 10, reward: 0.005, name: 'Click Lv10', icon: '👆' },
  { id: 'click_level_25', type: 'click_level', value: 25, reward: 0.005, name: 'Click Lv25', icon: '👆' },
  { id: 'click_level_50', type: 'click_level', value: 50, reward: 0.005, name: 'Click Lv50', icon: '👆' },
  { id: 'click_level_100', type: 'click_level', value: 100, reward: 0.005, name: 'Click Lv100', icon: '👆' },
  { id: 'click_level_250', type: 'click_level', value: 250, reward: 0.005, name: 'Click Lv250', icon: '👆' },
  { id: 'click_level_500', type: 'click_level', value: 500, reward: 0.005, name: 'Click Lv500', icon: '👆' },
  { id: 'click_level_750', type: 'click_level', value: 750, reward: 0.005, name: 'Click Lv750', icon: '👆' },
  { id: 'click_level_1000', type: 'click_level', value: 1000, reward: 0.005, name: 'Click Lv1000', icon: '👆' },
  
  // Click Upgrade Bonuses
  { id: 'click_upgrade_1', type: 'click_upgrade', value: 1, reward: 0.005, name: '1 Click Upgrade', icon: '⚡' },
  { id: 'click_upgrade_5', type: 'click_upgrade', value: 5, reward: 0.005, name: '5 Click Upgrades', icon: '⚡' },
  { id: 'click_upgrade_10', type: 'click_upgrade', value: 10, reward: 0.005, name: '10 Click Upgrades', icon: '⚡' },
  { id: 'click_upgrade_25', type: 'click_upgrade', value: 25, reward: 0.005, name: '25 Click Upgrades', icon: '⚡' },
  { id: 'click_upgrade_50', type: 'click_upgrade', value: 50, reward: 0.005, name: '50 Click Upgrades', icon: '⚡' },
  { id: 'click_upgrade_100', type: 'click_upgrade', value: 100, reward: 0.005, name: '100 Click Upgrades', icon: '⚡' },
  { id: 'click_upgrade_250', type: 'click_upgrade', value: 250, reward: 0.005, name: '250 Click Upgrades', icon: '⚡' },
  { id: 'click_upgrade_500', type: 'click_upgrade', value: 500, reward: 0.005, name: '500 Click Upgrades', icon: '⚡' },
  
  // Points Earned milestones
  { id: 'points_earned_1k', type: 'points_earned', value: 1000, reward: 0.005, name: '1K Points Earned', icon: '💰' },
  { id: 'points_earned_10k', type: 'points_earned', value: 10000, reward: 0.005, name: '10K Points Earned', icon: '💰' },
  { id: 'points_earned_100k', type: 'points_earned', value: 100000, reward: 0.005, name: '100K Points Earned', icon: '💰' },
  { id: 'points_earned_1m', type: 'points_earned', value: 1000000, reward: 0.005, name: '1M Points Earned', icon: '💰' },
  { id: 'points_earned_10m', type: 'points_earned', value: 10000000, reward: 0.005, name: '10M Points Earned', icon: '💰' },
  { id: 'points_earned_100m', type: 'points_earned', value: 100000000, reward: 0.005, name: '100M Points Earned', icon: '💰' },
  { id: 'points_earned_1b', type: 'points_earned', value: 1000000000, reward: 0.005, name: '1B Points Earned', icon: '💰' },
  { id: 'points_earned_10b', type: 'points_earned', value: 10000000000, reward: 0.005, name: '10B Points Earned', icon: '💰' },
  { id: 'points_earned_100b', type: 'points_earned', value: 100000000000, reward: 0.005, name: '100B Points Earned', icon: '💰' },
  { id: 'points_earned_1t', type: 'points_earned', value: 1000000000000, reward: 0.005, name: '1T Points Earned', icon: '💰' },
  
  // Points Spent milestones
  { id: 'points_spent_1k', type: 'points_spent', value: 1000, reward: 0.005, name: '1K Points Spent', icon: '💸' },
  { id: 'points_spent_10k', type: 'points_spent', value: 10000, reward: 0.005, name: '10K Points Spent', icon: '💸' },
  { id: 'points_spent_100k', type: 'points_spent', value: 100000, reward: 0.005, name: '100K Points Spent', icon: '💸' },
  { id: 'points_spent_1m', type: 'points_spent', value: 1000000, reward: 0.005, name: '1M Points Spent', icon: '💸' },
  { id: 'points_spent_10m', type: 'points_spent', value: 10000000, reward: 0.005, name: '10M Points Spent', icon: '💸' },
  { id: 'points_spent_100m', type: 'points_spent', value: 100000000, reward: 0.005, name: '100M Points Spent', icon: '💸' },
  { id: 'points_spent_1b', type: 'points_spent', value: 1000000000, reward: 0.005, name: '1B Points Spent', icon: '💸' },
  { id: 'points_spent_10b', type: 'points_spent', value: 10000000000, reward: 0.005, name: '10B Points Spent', icon: '💸' },
  
  // PPS Milestones (current)
  { id: 'pps_current_1', type: 'pps_current', value: 1, reward: 0.005, name: '1 PPS', icon: '📈' },
  { id: 'pps_current_10', type: 'pps_current', value: 10, reward: 0.005, name: '10 PPS', icon: '📈' },
  { id: 'pps_current_100', type: 'pps_current', value: 100, reward: 0.005, name: '100 PPS', icon: '📈' },
  { id: 'pps_current_1k', type: 'pps_current', value: 1000, reward: 0.005, name: '1K PPS', icon: '📈' },
  { id: 'pps_current_10k', type: 'pps_current', value: 10000, reward: 0.005, name: '10K PPS', icon: '📈' },
  { id: 'pps_current_100k', type: 'pps_current', value: 100000, reward: 0.005, name: '100K PPS', icon: '📈' },
  { id: 'pps_current_1m', type: 'pps_current', value: 1000000, reward: 0.005, name: '1M PPS', icon: '📈' },
  { id: 'pps_current_10m', type: 'pps_current', value: 10000000, reward: 0.005, name: '10M PPS', icon: '📈' },
  { id: 'pps_current_100m', type: 'pps_current', value: 100000000, reward: 0.005, name: '100M PPS', icon: '📈' },
  
  // PPS Milestones (highest)
  { id: 'pps_highest_1', type: 'pps_highest', value: 1, reward: 0.005, name: 'Highest 1 PPS', icon: '📊' },
  { id: 'pps_highest_10', type: 'pps_highest', value: 10, reward: 0.005, name: 'Highest 10 PPS', icon: '📊' },
  { id: 'pps_highest_100', type: 'pps_highest', value: 100, reward: 0.005, name: 'Highest 100 PPS', icon: '📊' },
  { id: 'pps_highest_1k', type: 'pps_highest', value: 1000, reward: 0.005, name: 'Highest 1K PPS', icon: '📊' },
  { id: 'pps_highest_10k', type: 'pps_highest', value: 10000, reward: 0.005, name: 'Highest 10K PPS', icon: '📊' },
  { id: 'pps_highest_100k', type: 'pps_highest', value: 100000, reward: 0.005, name: 'Highest 100K PPS', icon: '📊' },
  { id: 'pps_highest_1m', type: 'pps_highest', value: 1000000, reward: 0.005, name: 'Highest 1M PPS', icon: '📊' },
  { id: 'pps_highest_10m', type: 'pps_highest', value: 10000000, reward: 0.005, name: 'Highest 10M PPS', icon: '📊' },
  { id: 'pps_highest_100m', type: 'pps_highest', value: 100000000, reward: 0.005, name: 'Highest 100M PPS', icon: '📊' },
  
  // PPC Milestones (current)
  { id: 'ppc_current_1', type: 'ppc_current', value: 1, reward: 0.005, name: '1 PPC', icon: '👆' },
  { id: 'ppc_current_10', type: 'ppc_current', value: 10, reward: 0.005, name: '10 PPC', icon: '👆' },
  { id: 'ppc_current_100', type: 'ppc_current', value: 100, reward: 0.005, name: '100 PPC', icon: '👆' },
  { id: 'ppc_current_1k', type: 'ppc_current', value: 1000, reward: 0.005, name: '1K PPC', icon: '👆' },
  { id: 'ppc_current_10k', type: 'ppc_current', value: 10000, reward: 0.005, name: '10K PPC', icon: '👆' },
  { id: 'ppc_current_100k', type: 'ppc_current', value: 100000, reward: 0.005, name: '100K PPC', icon: '👆' },
  { id: 'ppc_current_1m', type: 'ppc_current', value: 1000000, reward: 0.005, name: '1M PPC', icon: '👆' },
  { id: 'ppc_current_10m', type: 'ppc_current', value: 10000000, reward: 0.005, name: '10M PPC', icon: '👆' },
  
  // PPC Milestones (highest)
  { id: 'ppc_highest_1', type: 'ppc_highest', value: 1, reward: 0.005, name: 'Highest 1 PPC', icon: '👆' },
  { id: 'ppc_highest_10', type: 'ppc_highest', value: 10, reward: 0.005, name: 'Highest 10 PPC', icon: '👆' },
  { id: 'ppc_highest_100', type: 'ppc_highest', value: 100, reward: 0.005, name: 'Highest 100 PPC', icon: '👆' },
  { id: 'ppc_highest_1k', type: 'ppc_highest', value: 1000, reward: 0.005, name: 'Highest 1K PPC', icon: '👆' },
  { id: 'ppc_highest_10k', type: 'ppc_highest', value: 10000, reward: 0.005, name: 'Highest 10K PPC', icon: '👆' },
  { id: 'ppc_highest_100k', type: 'ppc_highest', value: 100000, reward: 0.005, name: 'Highest 100K PPC', icon: '👆' },
  { id: 'ppc_highest_1m', type: 'ppc_highest', value: 1000000, reward: 0.005, name: 'Highest 1M PPC', icon: '👆' },
  { id: 'ppc_highest_10m', type: 'ppc_highest', value: 10000000, reward: 0.005, name: 'Highest 10M PPC', icon: '👆' },
  
  
  // Total Building Levels
  { id: 'total_building_levels_100', type: 'total_building_levels', value: 100, reward: 0.005, name: '100 Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_500', type: 'total_building_levels', value: 500, reward: 0.005, name: '500 Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_1k', type: 'total_building_levels', value: 1000, reward: 0.005, name: '1K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_5k', type: 'total_building_levels', value: 5000, reward: 0.005, name: '5K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_10k', type: 'total_building_levels', value: 10000, reward: 0.005, name: '10K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_25k', type: 'total_building_levels', value: 25000, reward: 0.005, name: '25K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_50k', type: 'total_building_levels', value: 50000, reward: 0.005, name: '50K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_100k', type: 'total_building_levels', value: 100000, reward: 0.005, name: '100K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_250k', type: 'total_building_levels', value: 250000, reward: 0.005, name: '250K Total Building Levels', icon: '🏗️' },
  { id: 'total_building_levels_500k', type: 'total_building_levels', value: 500000, reward: 0.005, name: '500K Total Building Levels', icon: '🏗️' },
  
  // Unlocked Buildings Count
  { id: 'unlocked_buildings_5', type: 'unlocked_buildings', value: 5, reward: 0.005, name: '5 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_10', type: 'unlocked_buildings', value: 10, reward: 0.005, name: '10 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_15', type: 'unlocked_buildings', value: 15, reward: 0.005, name: '15 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_20', type: 'unlocked_buildings', value: 20, reward: 0.005, name: '20 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_25', type: 'unlocked_buildings', value: 25, reward: 0.005, name: '25 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_30', type: 'unlocked_buildings', value: 30, reward: 0.005, name: '30 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_35', type: 'unlocked_buildings', value: 35, reward: 0.005, name: '35 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_40', type: 'unlocked_buildings', value: 40, reward: 0.005, name: '40 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_45', type: 'unlocked_buildings', value: 45, reward: 0.005, name: '45 Unlocked Buildings', icon: '🏠' },
  { id: 'unlocked_buildings_50', type: 'unlocked_buildings', value: 50, reward: 0.005, name: '50 Unlocked Buildings', icon: '🏠' },
  
  // Extended Citadel Levels
  { id: 'uber_level_1', type: 'uber_level', value: 1, reward: 0.005, name: 'Citadel Lv1', icon: '🏰' },
  { id: 'uber_level_2', type: 'uber_level', value: 2, reward: 0.005, name: 'Citadel Lv2', icon: '🏰' },
  { id: 'uber_level_3', type: 'uber_level', value: 3, reward: 0.005, name: 'Citadel Lv3', icon: '🏰' },
  { id: 'uber_level_4', type: 'uber_level', value: 4, reward: 0.005, name: 'Citadel Lv4', icon: '🏰' },
  { id: 'uber_level_5', type: 'uber_level', value: 5, reward: 0.005, name: 'Citadel Lv5', icon: '🏰' },
  { id: 'uber_level_6', type: 'uber_level', value: 6, reward: 0.005, name: 'Citadel Lv6', icon: '🏰' },
  { id: 'uber_level_7', type: 'uber_level', value: 7, reward: 0.005, name: 'Citadel Lv7', icon: '🏰' },
  { id: 'uber_level_8', type: 'uber_level', value: 8, reward: 0.005, name: 'Citadel Lv8', icon: '🏰' },
  { id: 'uber_level_9', type: 'uber_level', value: 9, reward: 0.005, name: 'Citadel Lv9', icon: '🏰' },
  { id: 'uber_level_11', type: 'uber_level', value: 11, reward: 0.005, name: 'Citadel Lv11', icon: '👑' },
  { id: 'uber_level_12', type: 'uber_level', value: 12, reward: 0.005, name: 'Citadel Lv12', icon: '👑' },
  { id: 'uber_level_13', type: 'uber_level', value: 13, reward: 0.005, name: 'Citadel Lv13', icon: '👑' },
  { id: 'uber_level_14', type: 'uber_level', value: 14, reward: 0.005, name: 'Citadel Lv14', icon: '👑' },
  { id: 'uber_level_15', type: 'uber_level', value: 15, reward: 0.005, name: 'Citadel Lv15', icon: '👑' },
  { id: 'uber_level_16', type: 'uber_level', value: 16, reward: 0.005, name: 'Citadel Lv16', icon: '👑' },
  { id: 'uber_level_17', type: 'uber_level', value: 17, reward: 0.005, name: 'Citadel Lv17', icon: '👑' },
  { id: 'uber_level_18', type: 'uber_level', value: 18, reward: 0.005, name: 'Citadel Lv18', icon: '👑' },
  { id: 'uber_level_19', type: 'uber_level', value: 19, reward: 0.005, name: 'Citadel Lv19', icon: '👑' },
  
  // Extended Destructions
  { id: 'destructions_2000', type: 'destructions', value: 2000, reward: 0.005, name: '2K Destructions', icon: '💥' },
  { id: 'destructions_5000', type: 'destructions', value: 5000, reward: 0.005, name: '5K Destructions', icon: '💥' },
  { id: 'destructions_10000', type: 'destructions', value: 10000, reward: 0.005, name: '10K Destructions', icon: '💥' },
  { id: 'destructions_25000', type: 'destructions', value: 25000, reward: 0.005, name: '25K Destructions', icon: '💥' },
  { id: 'destructions_50000', type: 'destructions', value: 50000, reward: 0.005, name: '50K Destructions', icon: '💥' },
  { id: 'destructions_100000', type: 'destructions', value: 100000, reward: 0.005, name: '100K Destructions', icon: '💥' },
  { id: 'destructions_250000', type: 'destructions', value: 250000, reward: 0.005, name: '250K Destructions', icon: '💥' },
  { id: 'destructions_500000', type: 'destructions', value: 500000, reward: 0.005, name: '500K Destructions', icon: '💥' },
  { id: 'destructions_1000000', type: 'destructions', value: 1000000, reward: 0.005, name: '1M Destructions', icon: '💥' },
  
  // Extended Playtime
  { id: 'playtime_10000', type: 'playtime', value: 10000 * 60 * 1000, reward: 0.005, name: '10K Minutes', icon: '⏱️' },
  { id: 'playtime_20000', type: 'playtime', value: 20000 * 60 * 1000, reward: 0.005, name: '20K Minutes', icon: '⏱️' },
  { id: 'playtime_50000', type: 'playtime', value: 50000 * 60 * 1000, reward: 0.005, name: '50K Minutes', icon: '⏱️' },
  { id: 'playtime_100000', type: 'playtime', value: 100000 * 60 * 1000, reward: 0.005, name: '100K Minutes', icon: '⏱️' },
  { id: 'playtime_200000', type: 'playtime', value: 200000 * 60 * 1000, reward: 0.005, name: '200K Minutes', icon: '⏱️' },
  { id: 'playtime_500000', type: 'playtime', value: 500000 * 60 * 1000, reward: 0.005, name: '500K Minutes', icon: '⏱️' },
  
  // Streak Count
  { id: 'streak_10', type: 'streak_count', value: 10, reward: 0.005, name: '10 Click Streak', icon: '🔥' },
  { id: 'streak_25', type: 'streak_count', value: 25, reward: 0.005, name: '25 Click Streak', icon: '🔥' },
  { id: 'streak_50', type: 'streak_count', value: 50, reward: 0.005, name: '50 Click Streak', icon: '🔥' },
  { id: 'streak_100', type: 'streak_count', value: 100, reward: 0.005, name: '100 Click Streak', icon: '🔥' },
  { id: 'streak_200', type: 'streak_count', value: 200, reward: 0.005, name: '200 Click Streak', icon: '🔥' },
  { id: 'streak_300', type: 'streak_count', value: 300, reward: 0.005, name: '300 Click Streak', icon: '🔥' },
  { id: 'streak_400', type: 'streak_count', value: 400, reward: 0.005, name: '400 Click Streak', icon: '🔥' },
  { id: 'streak_500', type: 'streak_count', value: 500, reward: 0.005, name: '500 Click Streak', icon: '🔥' },
  { id: 'streak_750', type: 'streak_count', value: 750, reward: 0.005, name: '750 Click Streak', icon: '🔥' },
  { id: 'streak_1000', type: 'streak_count', value: 1000, reward: 0.005, name: '1K Click Streak', icon: '🔥' },
  { id: 'streak_2000', type: 'streak_count', value: 2000, reward: 0.005, name: '2K Click Streak', icon: '🔥' },
  { id: 'streak_5000', type: 'streak_count', value: 5000, reward: 0.005, name: '5K Click Streak', icon: '🔥' },
  
  // Streak Multiplier
  { id: 'streak_mult_1_01', type: 'streak_multiplier', value: 1.01, reward: 0.005, name: '1.01x Streak', icon: '⚡' },
  { id: 'streak_mult_1_03', type: 'streak_multiplier', value: 1.03, reward: 0.005, name: '1.03x Streak', icon: '⚡' },
  { id: 'streak_mult_1_06', type: 'streak_multiplier', value: 1.06, reward: 0.005, name: '1.06x Streak', icon: '⚡' },
  { id: 'streak_mult_1_10', type: 'streak_multiplier', value: 1.10, reward: 0.005, name: '1.10x Streak', icon: '⚡' },
  { id: 'streak_mult_1_15', type: 'streak_multiplier', value: 1.15, reward: 0.005, name: '1.15x Streak', icon: '⚡' },
  { id: 'streak_mult_1_20', type: 'streak_multiplier', value: 1.20, reward: 0.005, name: '1.20x Streak', icon: '⚡' },
  { id: 'streak_mult_1_25', type: 'streak_multiplier', value: 1.25, reward: 0.005, name: '1.25x Streak', icon: '⚡' },
  { id: 'streak_mult_1_30', type: 'streak_multiplier', value: 1.30, reward: 0.005, name: '1.30x Streak', icon: '⚡' },
  
  // Building Segment Upgrades
  { id: 'segment_upgrades_1', type: 'segment_upgrades', value: 1, reward: 0.005, name: '1 Segment Upgrade', icon: '🔧' },
  { id: 'segment_upgrades_5', type: 'segment_upgrades', value: 5, reward: 0.005, name: '5 Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_10', type: 'segment_upgrades', value: 10, reward: 0.005, name: '10 Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_25', type: 'segment_upgrades', value: 25, reward: 0.005, name: '25 Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_50', type: 'segment_upgrades', value: 50, reward: 0.005, name: '50 Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_100', type: 'segment_upgrades', value: 100, reward: 0.005, name: '100 Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_250', type: 'segment_upgrades', value: 250, reward: 0.005, name: '250 Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_500', type: 'segment_upgrades', value: 500, reward: 0.005, name: '500 Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_1000', type: 'segment_upgrades', value: 1000, reward: 0.005, name: '1K Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_2500', type: 'segment_upgrades', value: 2500, reward: 0.005, name: '2.5K Segment Upgrades', icon: '🔧' },
  { id: 'segment_upgrades_5000', type: 'segment_upgrades', value: 5000, reward: 0.005, name: '5K Segment Upgrades', icon: '🔧' },
  
  // Golden Click Activations
  { id: 'golden_clicks_1', type: 'golden_clicks', value: 1, reward: 0.005, name: '1 Golden Click', icon: '✨' },
  { id: 'golden_clicks_5', type: 'golden_clicks', value: 5, reward: 0.005, name: '5 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_10', type: 'golden_clicks', value: 10, reward: 0.005, name: '10 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_25', type: 'golden_clicks', value: 25, reward: 0.005, name: '25 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_50', type: 'golden_clicks', value: 50, reward: 0.005, name: '50 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_100', type: 'golden_clicks', value: 100, reward: 0.005, name: '100 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_250', type: 'golden_clicks', value: 250, reward: 0.005, name: '250 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_500', type: 'golden_clicks', value: 500, reward: 0.005, name: '500 Golden Clicks', icon: '✨' },
  { id: 'golden_clicks_1000', type: 'golden_clicks', value: 1000, reward: 0.005, name: '1K Golden Clicks', icon: '✨' },
  
  // Broken Click Events
  { id: 'broken_clicks_1', type: 'broken_clicks', value: 1, reward: 0.005, name: '1 Broken Click', icon: '💔' },
  { id: 'broken_clicks_5', type: 'broken_clicks', value: 5, reward: 0.005, name: '5 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_10', type: 'broken_clicks', value: 10, reward: 0.005, name: '10 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_25', type: 'broken_clicks', value: 25, reward: 0.005, name: '25 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_50', type: 'broken_clicks', value: 50, reward: 0.005, name: '50 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_100', type: 'broken_clicks', value: 100, reward: 0.005, name: '100 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_250', type: 'broken_clicks', value: 250, reward: 0.005, name: '250 Broken Clicks', icon: '💔' },
  { id: 'broken_clicks_500', type: 'broken_clicks', value: 500, reward: 0.005, name: '500 Broken Clicks', icon: '💔' },
  
  // Casino Wins
  { id: 'casino_wins_1', type: 'casino_wins', value: 1, reward: 0.005, name: '1 Casino Win', icon: '🎰' },
  { id: 'casino_wins_5', type: 'casino_wins', value: 5, reward: 0.005, name: '5 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_10', type: 'casino_wins', value: 10, reward: 0.005, name: '10 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_25', type: 'casino_wins', value: 25, reward: 0.005, name: '25 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_50', type: 'casino_wins', value: 50, reward: 0.005, name: '50 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_100', type: 'casino_wins', value: 100, reward: 0.005, name: '100 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_250', type: 'casino_wins', value: 250, reward: 0.005, name: '250 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_500', type: 'casino_wins', value: 500, reward: 0.005, name: '500 Casino Wins', icon: '🎰' },
  { id: 'casino_wins_1000', type: 'casino_wins', value: 1000, reward: 0.005, name: '1K Casino Wins', icon: '🎰' },
  
  // Casino Losses
  { id: 'casino_losses_1', type: 'casino_losses', value: 1, reward: 0.005, name: '1 Casino Loss', icon: '🎲' },
  { id: 'casino_losses_5', type: 'casino_losses', value: 5, reward: 0.005, name: '5 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_10', type: 'casino_losses', value: 10, reward: 0.005, name: '10 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_25', type: 'casino_losses', value: 25, reward: 0.005, name: '25 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_50', type: 'casino_losses', value: 50, reward: 0.005, name: '50 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_100', type: 'casino_losses', value: 100, reward: 0.005, name: '100 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_250', type: 'casino_losses', value: 250, reward: 0.005, name: '250 Casino Losses', icon: '🎲' },
  { id: 'casino_losses_500', type: 'casino_losses', value: 500, reward: 0.005, name: '500 Casino Losses', icon: '🎲' },
  
  // Special Events
  { id: 'spider_encounter', type: 'spider_encounter', value: 1, reward: 0.005, name: 'Spider Encounter', icon: '🕷️' },
  { id: 'angry_barmatun_encounter', type: 'angry_barmatun_encounter', value: 1, reward: 0.005, name: 'Angry Barmatun Encounter', icon: '😠' },
  { id: 'elf_archer_encounter', type: 'elf_archer_encounter', value: 1, reward: 0.005, name: 'Elf Archer Encounter', icon: '🏹' },
  { id: 'king_encounter', type: 'king_encounter', value: 1, reward: 0.005, name: 'King Encounter', icon: '👑' },
  
  // Time-based Achievements
  { id: 'consecutive_days_1', type: 'consecutive_days', value: 1, reward: 0.005, name: '1 Day Streak', icon: '📅' },
  { id: 'consecutive_days_3', type: 'consecutive_days', value: 3, reward: 0.005, name: '3 Day Streak', icon: '📅' },
  { id: 'consecutive_days_7', type: 'consecutive_days', value: 7, reward: 0.005, name: '7 Day Streak', icon: '📅' },
  { id: 'consecutive_days_14', type: 'consecutive_days', value: 14, reward: 0.005, name: '14 Day Streak', icon: '📅' },
  { id: 'consecutive_days_30', type: 'consecutive_days', value: 30, reward: 0.005, name: '30 Day Streak', icon: '📅' },
  { id: 'consecutive_days_60', type: 'consecutive_days', value: 60, reward: 0.005, name: '60 Day Streak', icon: '📅' },
  { id: 'consecutive_days_90', type: 'consecutive_days', value: 90, reward: 0.005, name: '90 Day Streak', icon: '📅' },
  { id: 'consecutive_days_180', type: 'consecutive_days', value: 180, reward: 0.005, name: '180 Day Streak', icon: '📅' },
  { id: 'consecutive_days_365', type: 'consecutive_days', value: 365, reward: 0.005, name: '365 Day Streak', icon: '📅' },
  
  // Longest Session Achievements
  { id: 'longest_session_1h', type: 'longest_session', value: 60 * 60 * 1000, reward: 0.005, name: '1 Hour Session', icon: '⏰' },
  { id: 'longest_session_2h', type: 'longest_session', value: 2 * 60 * 60 * 1000, reward: 0.005, name: '2 Hour Session', icon: '⏰' },
  { id: 'longest_session_4h', type: 'longest_session', value: 4 * 60 * 60 * 1000, reward: 0.005, name: '4 Hour Session', icon: '⏰' },
  { id: 'longest_session_6h', type: 'longest_session', value: 6 * 60 * 60 * 1000, reward: 0.005, name: '6 Hour Session', icon: '⏰' },
  { id: 'longest_session_8h', type: 'longest_session', value: 8 * 60 * 60 * 1000, reward: 0.005, name: '8 Hour Session', icon: '⏰' },
  { id: 'longest_session_12h', type: 'longest_session', value: 12 * 60 * 60 * 1000, reward: 0.005, name: '12 Hour Session', icon: '⏰' },
  { id: 'longest_session_24h', type: 'longest_session', value: 24 * 60 * 60 * 1000, reward: 0.005, name: '24 Hour Session', icon: '⏰' },
  
  // Milestone Combinations - Clicks + Buildings
  { id: 'milestone_clicks_1m_buildings_10', type: 'milestone_combination', clicks: 1000000, buildings: 10, reward: 0.005, name: '1M Clicks + 10 Buildings', icon: '🎯' },
  { id: 'milestone_clicks_10m_buildings_25', type: 'milestone_combination', clicks: 10000000, buildings: 25, reward: 0.005, name: '10M Clicks + 25 Buildings', icon: '🎯' },
  { id: 'milestone_clicks_100m_buildings_50', type: 'milestone_combination', clicks: 100000000, buildings: 50, reward: 0.005, name: '100M Clicks + 50 Buildings', icon: '🎯' },
  { id: 'milestone_points_1m_time_1h', type: 'milestone_combination_points_time', points: 1000000, time: 60 * 60 * 1000, reward: 0.005, name: '1M Points in 1 Hour', icon: '⚡' },
  { id: 'milestone_points_10m_time_1h', type: 'milestone_combination_points_time', points: 10000000, time: 60 * 60 * 1000, reward: 0.005, name: '10M Points in 1 Hour', icon: '⚡' },
  { id: 'milestone_points_100m_time_1h', type: 'milestone_combination_points_time', points: 100000000, time: 60 * 60 * 1000, reward: 0.005, name: '100M Points in 1 Hour', icon: '⚡' },
  
  // Note: To reach 2000 achievements, we would need to add many more progressive achievements
  // for all 50 buildings (50 buildings × 10 milestones = 500 achievements)
  // and other combinations. For now, this provides a solid foundation.
];

