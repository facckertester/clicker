// Pixel Medieval Clicker
// Author: assistant (full game logic)
// Save as script.js

/* ========= Utilities ========= */
const fmt = n => {
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
};
const rand = (a,b=0) => Math.random()*(a-b)+b;
const clamp = (v,mn,mx)=>Math.max(mn,Math.min(mx,v));

/* ========= Persistent accounts (localStorage) ========= */
const ACC_KEY = "pmc_accounts_v1";
const SAVE_PREFIX = "pmc_save_";

function loadAccounts(){
  try{
    return JSON.parse(localStorage.getItem(ACC_KEY) || "{}");
  }catch(e){ return {}; }
}
function saveAccounts(data){
  localStorage.setItem(ACC_KEY, JSON.stringify(data));
}

/* ========= Game definitions ========= */
const BUILDING_COUNT = 50;
const INITIAL_CLICK_VALUE = 0.1111;
const INITIAL_CLICK_COST = 7.7720;
const INITIAL_BUILD_COST = 44.0000;
const INITIAL_BUILD_PPS = 0.1234;
const BUILD_LEVELS_INIT = 1000;
const CLICK_LEVELS_INIT = 1000;
const UBER_UNLOCK_LEVEL = 800;
const UBER_INITIAL_LEVELS = 10;
const ENDGAME_ALLOW_MORE = 9922;

const DEFAULT_NAMES = [
"Farmstead","Granary","Millhouse","Blacksmith","Bakery","Stables","Tavern","Weavery","Caravan","Mansion",
"Manor","Watchtower","Chapel","Library","Foundry","Lighthouse","Guildhall","Harbor","Market","Orchard",
"Forge","Smithy","Barracks","Courtyard","Reservoir","Alchemist","Observatory","Monastery","Armory","Storehouse",
"Villa","Townhall","Innkeeper","Greenhouse","Beacon","Millpond","Portcullis","Granary2","Silo","Loom",
"Pottery","Bathhouse","Embassy","Dockyard","Carpenter","Weaver","Glassworks","Winery","Garden","Kiln"
];
// Remove digits and ensure unique & <=15 chars, no digits
const NAMES = DEFAULT_NAMES.slice(0, BUILDING_COUNT).map((n,i)=>{
  let s = n.replace(/\d+/g,"").slice(0,15);
  if(s.length===0) s = "Building"+(i+1);
  return s;
});

/* ========= Global runtime state (per account) ========= */
function createEmptyState(username){
  const buildings = [];
  for(let i=0;i<BUILDING_COUNT;i++){
    const baseCost = INITIAL_BUILD_COST * (1 + i*0.035 + i*0.002); // slightly increasing
    const basePPS = INITIAL_BUILD_PPS * (1 + i*0.02 + i*0.001);
    buildings.push({
      id:i,
      name:NAMES[i] || ("Building"+(i+1)),
      level:0,
      levelsMax: BUILD_LEVELS_INIT,
      baseCost: parseFloat(baseCost.toFixed(4)),
      basePPS: parseFloat(basePPS.toFixed(4)),
      upgradeCount:0, // number of 10-level upgrades bought
      disabledUntil:0, // timestamp if broken when building fails
      lockedUntilPrereq:false // additional lock logic
    });
  }
  return {
    user: username,
    points: 0,
    clickLevel: 0,
    clickLevelsMax: CLICK_LEVELS_INIT,
    clickBase: INITIAL_CLICK_VALUE,
    clickBaseCost: INITIAL_CLICK_COST,
    clickUpgradeCount:0,
    buyMultiplier:1,
    buildings: buildings,
    buffs: [], // active buffs/debuffs {id,type,mult,expires}
    lastTick: Date.now(),
    continuousClicks:0,
    lastClickTime:0,
    clickBrokenUntil:0,
    clickGoldenUntil:0,
    spiderNextAt: Date.now() + 180000,
    spiderTimer:180,
    paused:false,
    endgame:false,
    uber: { level:0, levelsMax: UBER_INITIAL_LEVELS, baseCost: 1e6, unlocked:false, levelsAfterEnd:99},
    created: Date.now()
  };
}

/* ========= Storage helpers ========= */
function loadSaveForUser(username){
  const data = localStorage.getItem(SAVE_PREFIX + username);
  if(!data) return null;
  try{
    return JSON.parse(data);
  }catch(e){ return null; }
}
function saveForUser(username, state){
  localStorage.setItem(SAVE_PREFIX + username, JSON.stringify(state));
}

/* ========= DOM refs ========= */
const authDiv = document.getElementById("auth");
const gameDiv = document.getElementById("game");
const loginBtn = document.getElementById("btn-login");
const showRegBtn = document.getElementById("btn-show-register");
const registerBox = document.getElementById("register-box");
const regBtn = document.getElementById("btn-register");
const cancelReg = document.getElementById("btn-cancel-register");
const authNotice = document.getElementById("auth-notice");
const loginUser = document.getElementById("login-username");
const loginPass = document.getElementById("login-password");
const regUser = document.getElementById("reg-username");
const regPass = document.getElementById("reg-password");

const playerNameSpan = document.getElementById("player-name");
const pointsSpan = document.getElementById("points");
const ppsSpan = document.getElementById("pps");
const notifArea = document.getElementById("notif-area");

const mainClickBtn = document.getElementById("main-click");
const clickValueSpan = document.getElementById("click-value");
const clickLevelSpan = document.getElementById("click-level");
const clickCostSpan = document.getElementById("click-cost");
const buyMultipliers = document.getElementById("buy-multipliers");

const buildingsList = document.getElementById("buildings-list");
const clickUpgradesDiv = document.getElementById("click-upgrades");

const buffList = document.getElementById("buff-list");
const spiderTimerSpan = document.getElementById("spider-timer");
const spiderCanvas = document.getElementById("spider-canvas");
const spiderCtx = spiderCanvas.getContext("2d");

const clickerCanvas = document.getElementById("clicker-pixel");
const clickerCtx = clickerCanvas.getContext("2d");
const uberCanvas = document.getElementById("uber-pixel");
const uberCtx = uberCanvas.getContext("2d");
const uberLevelSpan = document.getElementById("uber-level");
const uberCostSpan = document.getElementById("uber-cost");
const buyUberBtn = document.getElementById("buy-uber");

const logoutBtn = document.getElementById("btn-logout");
const resetBtn = document.getElementById("btn-reset");

/* ========= UI helpers and notifications ========= */
function notify(text){
  const el = document.createElement("div");
  el.className = "notice-item";
  el.textContent = text;
  notifArea.prepend(el);
  setTimeout(()=>{ el.style.opacity = "0"; el.style.transition="opacity 1s"; setTimeout(()=>el.remove(),1000); }, 6000);
}

function timeSecLeft(ms){
  return Math.ceil(ms/1000);
}

/* ========= Pixel art generator (simple blocky houses) ========= */
function drawPixelHouse(ctx, seed, pal="warm"){
  // 16x16 pixel art scaled to canvas
  const w = 16, h = 16;
  const scaleX = ctx.canvas.width / w;
  const scaleY = ctx.canvas.height / h;
  const rnd = (a,b=0)=> Math.floor(Math.abs(Math.sin(seed*1234 + a*97 + b*13))*10000)%256;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  // palette
  const palW = {
    bg:"#0b0b0b", roof:"#8b3b2a", roof2:"#6b2a17", wall:"#ceb69e", door:"#5b3a2a", window:"#86e0ff"
  };
  const palC = {
    bg:"#071017", roof:"#5c2e1f", roof2:"#7f3f2c", wall:"#d8c7b2", door:"#4a2f22", window:"#6fd7ff"
  };
  const P = (pal==="warm")?palW:palC;

  // simple shape: roof, wall, door, windows
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      let color = P.bg;
      if(y<6){
        // roof triangle
        if(x>=2 && x<w-2 && y < 6 - Math.abs((x - w/2)/3)) color = P.roof;
      } else {
        color = P.wall;
      }
      // door
      if(x>=7 && x<=8 && y>=10) color = P.door;
      // windows
      if((x===4||x===11) && y>=8 && y<=9) color = P.window;
      // random pixel details
      if(Math.random() < 0.02) color = P.roof2;
      ctx.fillStyle = color;
      ctx.fillRect(x*scaleX, y*scaleY, scaleX, scaleY);
    }
  }
}

/* ========= Core gameplay math ========= */

// price formula: baseCost * (1.06 ^ level) with slight multiplier
function costForLevel(baseCost, currentLevel, qty=1){
  // sum geometric: baseCost * rate^cur * (rate^qty -1)/(rate-1)
  const rate = 1.06;
  const start = Math.pow(rate, currentLevel);
  const sum = baseCost * start * (Math.pow(rate, qty)-1) / (rate-1);
  return sum;
}

function ppsForBuilding(b){
  // basePPS * level * (1.03 ^ upgradeCount) * possible buffs
  const base = b.basePPS * b.level;
  const upgradeMult = Math.pow(1.13, b.upgradeCount);
  return base * upgradeMult;
}

function clickValueFor(state){
  const base = state.clickBase * (state.clickLevel || 0 || 1);
  const clickLevelContribution = state.clickBase * state.clickLevel;
  // baseline interpretation: click value scaled by level (increases smoothly)
  const baseVal = state.clickBase * (1 + state.clickLevel * 0.01);
  const upgradeMult = Math.pow(1.13, state.clickUpgradeCount);
  return baseVal * upgradeMult;
}

function totalPPS(state){
  let total = 0;
  for(const b of state.buildings){
    // if disabled
    if(b.disabledUntil && Date.now() < b.disabledUntil) continue;
    total += ppsForBuilding(b);
  }
  // click passive doesn't count (click gives per click)
  // apply global multipliers from buffs
  total = applyBuffsToValue(state, total);
  return total;
}

function applyBuffsToValue(state, value){
  let mult = 1;
  for(const buff of state.buffs){
    if(buff.expires > Date.now()){
      mult *= buff.mult;
    }
  }
  // if click broken & this is click value handled separately
  return value * mult;
}

/* ========= Game logic ========= */
let currentUser = null;
let state = null;
let saveInterval = null;
let tickInterval = null;
let spiderInterval = null;

function showAuth(){
  authDiv.classList.remove("hidden");
  gameDiv.classList.add("hidden");
}
function showGame(){
  authDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");
}

function registerAccount(username, password){
  username = username.trim();
  if(!username || !password){ authNotice.textContent = "Enter username and password"; return; }
  const accs = loadAccounts();
  if(accs[username]) { authNotice.textContent = "Account exists"; return; }
  accs[username] = { password };
  saveAccounts(accs);
  // create save
  const s = createEmptyState(username);
  saveForUser(username, s);
  authNotice.textContent = "Account created. You can log in.";
}

function loginAccount(username, password){
  username = username.trim();
  const accs = loadAccounts();
  if(!accs[username] || accs[username].password !== password){
    authNotice.textContent = "Invalid credentials";
    return;
  }
  currentUser = username;
  let loaded = loadSaveForUser(username);
  if(!loaded){
    loaded = createEmptyState(username);
    saveForUser(username, loaded);
  }
  state = loaded;
  initGame();
  showGame();
}

function logout(){
  if(currentUser){
    saveForUser(currentUser, state);
    currentUser = null;
    state = null;
  }
  notify("Logged out");
  showAuth();
}

/* ========= UI rendering ========= */

function renderTop(){
  playerNameSpan.textContent = currentUser;
  pointsSpan.textContent = fmt(state.points);
  ppsSpan.textContent = fmt(totalPPS(state));
}

function renderClicker(){
  clickValueSpan.textContent = fmt(clickValueFor(state));
  clickLevelSpan.textContent = state.clickLevel;
  // cost to buy 'buyMultiplier' levels
  const qty = state.buyMultiplier==="max" ? Math.max(1, Math.floor(maxAffordableLevelsForClick())) : state.buyMultiplier;
  const cost = costForLevel(state.clickBaseCost, state.clickLevel, qty);
  clickCostSpan.textContent = fmt(cost);
  // upgrades every 10 levels
  clickUpgradesDiv.innerHTML = "";
  const next10 = Math.floor(state.clickLevel/10)*10 + 10;
  if(next10 <= state.clickLevelsMax){
    const sumCost = costForLevel(state.clickBaseCost, next10-10, 10);
    const btn = document.createElement("button");
    btn.className = "upgrade-btn";
    btn.textContent = `Click Upgrade Lv ${next10}: Cost ${fmt(sumCost)}`;
    btn.onclick = ()=>{
      if(state.points >= sumCost){
        state.points -= sumCost;
        state.clickUpgradeCount += 1;
        notify(`Click upgrade bought: +13% to click power.`);
      } else notify("Not enough points for click upgrade.");
    };
    clickUpgradesDiv.appendChild(btn);
  }
}

function maxAffordableLevelsForClick(){
  // find how many levels you can buy given points using rate 1.06
  const rate = 1.06;
  const baseCost = state.clickBaseCost;
  let level = state.clickLevel;
  let pts = state.points;
  let qty = 0;
  while(pts > 0 && level < state.clickLevelsMax && qty < 10000){
    const cost = baseCost * Math.pow(rate, level);
    if(cost <= pts){
      pts -= cost;
      level++; qty++;
    } else break;
  }
  return qty;
}

function renderBuildings(){
  buildingsList.innerHTML = "";
  state.buildings.forEach((b, idx)=>{
    const el = document.createElement("div");
    el.className = "building card";
    if(idx>0 && state.buildings[idx-1].level < 27) el.classList.add("locked");
    if(b.disabledUntil && Date.now()<b.disabledUntil) el.classList.add("disabled");
    const left = document.createElement("div");
    left.className = "build-left";
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 64;
    left.appendChild(canvas);
    const cctx = canvas.getContext("2d");
    drawPixelHouse(cctx, idx + b.level);
    const right = document.createElement("div");
    right.className = "build-right";
    const title = document.createElement("div");
    title.className = "build-title";
    title.textContent = `${b.name} (${b.level})`;
    const small = document.createElement("div");
    small.className = "small";
    small.innerHTML = `PPS: <strong>${fmt( ppsForBuilding(b) )}</strong> | Level cost: <span id="cost-${idx}">${fmt(costForLevel(b.baseCost, b.level, (state.buyMultiplier==="max"?Math.max(1, Math.floor(maxAffordableLevelsForBuilding(b))):state.buyMultiplier)))}</span>`;
    const row = document.createElement("div");
    row.className = "row";
    const buybtn = document.createElement("button");
    buybtn.textContent = "Buy/Upgrade";
    buybtn.onclick = ()=> buyBuilding(idx);
    const infoBtn = document.createElement("button");
    infoBtn.textContent = "Info";
    infoBtn.onclick = ()=> notify(`${b.name}: Level ${b.level}, PPS ${fmt(ppsForBuilding(b))}`);
    row.appendChild(buybtn); row.appendChild(infoBtn);

    // upgrade per 10 levels
    const upgRow = document.createElement("div");
    const next10 = Math.floor(b.level/10)*10 + 10;
    if(next10 <= b.levelsMax){
      const sumCost = costForLevel(b.baseCost, next10-10,10);
      const upgBtn = document.createElement("button");
      upgBtn.className = "upgrade-btn";
      upgBtn.textContent = `Upgrade ${next10}: Cost ${fmt(sumCost)} (+13%)`;
      upgBtn.onclick = ()=>{
        if(state.points >= sumCost){
          state.points -= sumCost;
          b.upgradeCount += 1;
          notify(`${b.name} special upgrade bought: +13% to its income.`);
        } else notify("Not enough points for building upgrade.");
      };
      upgRow.appendChild(upgBtn);
    }

    right.appendChild(title);
    right.appendChild(small);
    right.appendChild(row);
    right.appendChild(upgRow);
    el.appendChild(left);
    el.appendChild(right);
    buildingsList.appendChild(el);
  });
}

function maxAffordableLevelsForBuilding(b){
  // similar to click: count how many levels can be bought with current points
  const rate = 1.06;
  let level = b.level; let pts = state.points; let qty=0;
  while(pts>0 && level < b.levelsMax){
    const cost = b.baseCost * Math.pow(rate, level);
    if(cost <= pts){ pts -= cost; level++; qty++; }
    else break;
    if(qty>10000) break;
  }
  return qty;
}

function renderBuffs(){
  buffList.innerHTML = "";
  for(const buff of state.buffs){
    const el = document.createElement("div");
    el.textContent = `${buff.name}: x${buff.mult} — ${timeSecLeft(buff.expires - Date.now())}s`;
    el.className = "timer-badge";
    buffList.appendChild(el);
  }
}

function renderUber(){
  uberLevelSpan.textContent = state.uber.level;
  uberCostSpan.textContent = state.uber.level>=state.uber.levelsMax ? "—" : fmt(state.uber.baseCost * Math.pow(5, state.uber.level));
  buyUberBtn.disabled = !(state.uber.unlocked && state.uber.level < state.uber.levelsMax);
}

/* ========= Interactions: buying, clicking ========= */

function buyBuilding(idx){
  const b = state.buildings[idx];
  // check prereq: cannot buy next building until prev at 27
  if(idx>0 && state.buildings[idx-1].level < 27){
    notify("Previous building must reach level 27 first.");
    return;
  }
  // check locked until either building upgrade or click upgrade purchased
  // According to spec: "Нельзя прокачать здание, пока не прокачан апгрейд для этого здания или для клика."
  if(b.upgradeCount === 0 && state.clickUpgradeCount === 0 && b.level>0){ // if never had any upgrade
    notify("You need an upgrade for this building or for click to upgrade it.");
    return;
  }
  // compute qty chosen
  let qty = state.buyMultiplier==="max" ? Math.max(1, Math.floor(maxAffordableLevelsForBuilding(b))) : state.buyMultiplier;
  qty = Math.max(1, qty);
  if(b.level + qty > (state.endgame ? ENDGAME_ALLOW_MORE : b.levelsMax)) qty = (state.endgame ? ENDGAME_ALLOW_MORE : b.levelsMax) - b.level;
  if(qty<=0) { notify("Level cap reached."); return; }

  const cost = costForLevel(b.baseCost, b.level, qty);
  if(state.points < cost){ notify("Not enough points."); return; }

  // chance to fail at 3%
  if(Math.random() < 0.03){
    // fails: building broken for 41s
    b.disabledUntil = Date.now() + 41000;
    state.points -= cost*0.0; // spec unclear — I will still consume or not? It said "may not improve" — keep cost consumed.
    // spec: "При покупки улучшения здания, оно с шансом в 3% может не улучшится, это типа оно разрушилось" -> we'll consume cost but no level up
    state.points -= cost;
    notify(`${b.name} construction failed and is disabled for 41s.`);
    return;
  }

  // perform purchase
  state.points -= cost;
  b.level += qty;

  // every 10 levels create upgrade (we already have button)
  notify(`${b.name} upgraded by ${qty} levels.`);
  // unlock uber if conditions
  checkUberUnlock();
}

function buyClickLevels(){
  const qty = state.buyMultiplier==="max" ? Math.max(1, Math.floor(maxAffordableLevelsForClick())) : state.buyMultiplier;
  if(qty<=0) { notify("No levels affordable"); return; }
  let toBuy = qty;
  // ensure not exceed max
  const cap = state.endgame ? ENDGAME_ALLOW_MORE : state.clickLevelsMax;
  if(state.clickLevel + toBuy > cap) toBuy = cap - state.clickLevel;
  if(toBuy <= 0) { notify("Click level cap reached"); return; }
  const cost = costForLevel(state.clickBaseCost, state.clickLevel, toBuy);
  if(state.points < cost) { notify("Not enough points"); return; }

  state.points -= cost;
  state.clickLevel += toBuy;

  notify(`Click upgraded x${toBuy} levels.`);

  // chance to break? not for click upgrades; only continuous clicking break mechanic handled separately
  checkUberUnlock();
}

function checkUberUnlock(){
  if(state.uber.unlocked) return;
  const allAt = state.buildings.every(b=>b.level >= UBER_UNLOCK_LEVEL) && state.clickLevel >= UBER_UNLOCK_LEVEL;
  if(allAt){
    state.uber.unlocked = true;
    notify("Uber-Puper-Turbo is now unlocked!");
  }
}

/* ========= Click mechanics and special events ========= */

mainClickBtn.addEventListener("click", ()=> {
  if(!state) return;
  const now = Date.now();
  // reset continuousClicks if >2s gap
  if(now - state.lastClickTime > 2000) state.continuousClicks = 0;
  state.continuousClicks += 1;
  state.lastClickTime = now;

  // if button broken
  if(state.clickBrokenUntil && now < state.clickBrokenUntil){
    notify("Click button is broken.");
    return;
  }
  // compute click value with buffs
  let val = clickValueFor(state);
  val = applyBuffsToValue(state, val);
  // if golden
  if(state.clickGoldenUntil && now < state.clickGoldenUntil){
    val *= 1.5;
  }
  state.points += val;
  // continuous click break condition
  if(state.continuousClicks > 100 && state.continuousClicks % 101 === 0){
    const r = Math.random();
    if(r < 0.66){
      // break for 36s
      state.clickBrokenUntil = Date.now() + 36000;
      notify("Click button broke for 36 seconds.");
      // visual change handled in renderTick
    } else {
      // become golden for 8s then break for 9s
      state.clickGoldenUntil = Date.now() + 8000;
      notify("Click button became gold for 8 seconds!");
      setTimeout(()=>{ state.clickBrokenUntil = Date.now() + 9000; notify("Click button broke after gold for 9 seconds.");}, 8000);
    }
  }
});

buyMultipliers.addEventListener("click", (e)=>{
  if(e.target.classList.contains("mult")){
    const nodes = buyMultipliers.querySelectorAll(".mult");
    nodes.forEach(n=>n.classList.remove("active"));
    e.target.classList.add("active");
    state.buyMultiplier = e.target.dataset.mult==="max" ? "max" : parseInt(e.target.dataset.mult);
    notify(`Buy multiplier set to ${state.buyMultiplier}`);
  }
});

document.getElementById("btn-login").onclick = ()=> loginAccount(loginUser.value, loginPass.value);
document.getElementById("btn-show-register").onclick = ()=> { registerBox.style.display = "block"; };
document.getElementById("btn-cancel-register").onclick = ()=> { registerBox.style.display = "none"; };
document.getElementById("btn-register").onclick = ()=> registerAccount(regUser.value, regPass.value);

logoutBtn.onclick = ()=> { logout(); showAuth(); };
resetBtn.onclick = ()=>{
  if(!currentUser) return;
  localStorage.removeItem(SAVE_PREFIX + currentUser);
  notify("Account reset. Reloading.");
  setTimeout(()=> location.reload(), 400);
};

/* ========= Spider event ========= */
function scheduleSpider(){
  state.spiderNextAt = Date.now() + 180000; // 3 minutes
}

function spawnSpider(){
  // animate spider moving across canvas and apply effect
  notify("A spider appears!");
  // 50% debuff x0.001 for 36s; 25% bonus x100 for 11s; 25% nothing
  const r = Math.random();
  if(r < 0.5){
    // debuff
    const buff = { id: "spider-debuff-"+Date.now(), name:"Spider Debuff", mult:0.001, expires: Date.now()+36000};
    state.buffs.push(buff);
    notify("Spider inflicted a heavy debuff: all incomes x0.001 for 36s.");
  } else if(r < 0.75){
    const buff = { id: "spider-bonus-"+Date.now(), name:"Spider Bonus", mult:100, expires: Date.now()+11000};
    state.buffs.push(buff);
    notify("Spider provided a massive bonus: all incomes x100 for 11s.");
  } else {
    notify("Spider was crushed — nothing happened.");
  }
  scheduleSpider();
}

/* ========= Main tick: passive accrual, timers ========= */

function gameTick(){
  if(!state) return;
  const now = Date.now();
  const delta = (now - state.lastTick)/1000;
  if(delta <= 0){ state.lastTick = now; return; }
  // passive gain
  const pps = totalPPS(state);
  state.points += pps * delta;
  // clamp float precision
  state.points = parseFloat(state.points.toFixed(8));
  // update buffs (remove expired)
  state.buffs = state.buffs.filter(b => b.expires > now);

  // spider timer
  const until = Math.max(0, Math.ceil((state.spiderNextAt - now)/1000));
  spiderTimerSpan.textContent = until;
  // spider appear
  if(now >= state.spiderNextAt){
    spawnSpider();
  }

  // building disabled timeouts expire automatically by checking disabledUntil on usage

  state.lastTick = now;
}

function renderAll(){
  if(!state) return;
  renderTop();
  renderClicker();
  renderBuildings();
  renderBuffs();
  renderUber();
  drawClickerVisual();
  drawSpiderVisual();
}

/* ========= Visuals for clicker and spider and uber ========= */

function drawClickerVisual(){
  const ctx = clickerCtx;
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  // draw big button area
  ctx.fillStyle = "#271b10";
  ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
  // if broken
  if(state.clickBrokenUntil && Date.now() < state.clickBrokenUntil){
    ctx.fillStyle = "#522a2a";
    ctx.fillRect(10,10,140,140);
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px monospace";
    ctx.fillText("BROKEN", 30, 84);
  } else if(state.clickGoldenUntil && Date.now() < state.clickGoldenUntil){
    // golden look
    ctx.fillStyle = "#ffd67a";
    ctx.fillRect(10,10,140,140);
    ctx.fillStyle = "#6b3b00";
    ctx.font = "bold 18px monospace";
    ctx.fillText("GOLD", 46, 84);
  } else {
    // normal -- pixel heart
    ctx.fillStyle = "#8b3b2a";
    ctx.fillRect(10,10,140,140);
    ctx.fillStyle = "#FFEFD5";
    ctx.font = "bold 18px monospace";
    ctx.fillText("CLICK", 44, 84);
  }
}

let spiderPos = {x:0,y:40,dir:1};
function drawSpiderVisual(){
  const ctx = spiderCtx;
  ctx.clearRect(0,0,spiderCanvas.width,spiderCanvas.height);
  ctx.fillStyle = "#061018";
  ctx.fillRect(0,0,spiderCanvas.width,spiderCanvas.height);
  // move slowly across
  spiderPos.x += spiderPos.dir * 0.6;
  if(spiderPos.x > spiderCanvas.width-30) spiderPos.dir = -1;
  if(spiderPos.x < 0) spiderPos.dir = 1;
  // draw simple spider
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(spiderPos.x+15, spiderPos.y+15, 8,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(spiderPos.x+8, spiderPos.y+4, 2,2);
  ctx.fillRect(spiderPos.x+22, spiderPos.y+4, 2,2);
}

/* ========= Autosave and intervals ========= */

function initIntervals(){
  if(saveInterval) clearInterval(saveInterval);
  if(tickInterval) clearInterval(tickInterval);
  saveInterval = setInterval(()=> {
    if(!state || !currentUser) return;
    saveForUser(currentUser, state);
  }, 1000);

  tickInterval = setInterval(()=> {
    gameTick();
    renderAll();
  }, 200); // 5 times a second for responsive UI

  // spider scheduling is part of state.spiderNextAt, no separate interval needed
}

/* ========= Initialization and binding ========= */

function initGame(){
  // set UI initial values
  playerNameSpan.textContent = currentUser;
  // setup click-buy button handlers
  document.getElementById("click-cost").textContent = fmt(state.clickBaseCost);
  // buy click levels directly by clicking click cost or add a button?
  // we use main-click double-click or alt-click to buy
  mainClickBtn.addEventListener("dblclick", ()=> {
    // dblclick purchase click levels
    buyClickLevels();
  });

  // buildings render already uses buy building button
  // uber buy
  buyUberBtn.onclick = ()=>{
    if(!state.uber.unlocked){ notify("Uber locked"); return; }
    const lvlCap = state.uber.levelsMax;
    if(state.uber.level >= lvlCap) { notify("Uber maxed."); return; }
    const cost = state.uber.baseCost * Math.pow(5, state.uber.level);
    if(state.points < cost){ notify("Not enough points for Uber"); return; }
    state.points -= cost;
    state.uber.level += 1;
    notify("Uber building upgraded.");
    if(state.uber.level >= state.uber.levelsMax){
      // finish game choice
      notify("You finished the first phase. You may continue: all levels can be increased up to 9922 and Uber to 99.");
      state.endgame = true;
      // increase limits
      state.buildings.forEach(b=> b.levelsMax = ENDGAME_ALLOW_MORE);
      state.clickLevelsMax = ENDGAME_ALLOW_MORE;
      state.uber.levelsMax = 99;
    }
  };

  // draw pixel samples
  drawPixelHouse(clickerCtx, 1);
  drawPixelHouse(uberCtx, 999, "cool");

  initIntervals();
  renderAll();
  notify("Welcome back!");
}

/* ========= Initialization on load ========= */
window.addEventListener("load", ()=>{
  showAuth();
  // if a single account is saved, optionally auto-fill - but spec wants login flow
  // attach login on Enter
  [loginUser, loginPass].forEach(inp=> inp.addEventListener("keyup", (e)=> { if(e.key==="Enter") loginAccount(loginUser.value, loginPass.value); }));
  regPass.addEventListener("keyup", (e)=> { if(e.key==="Enter") registerAccount(regUser.value, regPass.value); });

  // periodic UI tick for timers display
  setInterval(()=> {
    if(!state) return;
    // update timers in UI
    renderAll();
  }, 1000);
});
