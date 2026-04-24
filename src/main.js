import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { Camera } from './core/Camera.js';
import { InputManager } from './core/InputManager.js';
import { Hole } from './entities/Hole.js';
import { Item } from './entities/Item.js';
import { LEVELS } from './levels.js';
import {
  SWALLOW_TIP_DURATION, SWALLOW_FALL_DURATION, SIZE_RADIUS, CASCADE_DELAY,
  XP_VALUES,
} from './constants.js';

const canvas = document.getElementById('game-canvas');
const engine = new Engine(canvas);
const cam = new Camera(window.innerWidth / window.innerHeight);
const input = new InputManager(canvas);
engine.onResize(() => cam.handleResize());

let MAP_W = 14, MAP_D = 14;

let oceanMesh = null;
let groundGroup = null;

const hole = new Hole();
engine.scene.add(hole.group);
hole.position.set(0, 0, 0);

const items = [];
const stacks = [];

let Factory = null;
let currentLevel = 0;
let goalProgress = {};
let levelComplete = false;
let levelFailed = false;
let timeRemaining = 0;
let gamePaused = false;

let failReason = '';
let previousLevel = 0;
let pauseBtn = null;

async function init() {
  try {
    const mod = await import('./entities/ItemFactory.js');
    Factory = mod.ItemFactory;
  } catch (e) {
    console.warn('[GAME] ItemFactory failed:', e);
  }

  const homeScreen = document.getElementById('home-screen');
  const startBtn = document.getElementById('start-btn');
  if (homeScreen && startBtn) {
    gamePaused = true;
    startBtn.onclick = () => {
      homeScreen.style.transition = 'opacity 0.6s';
      homeScreen.style.opacity = '0';
      setTimeout(() => { homeScreen.style.display = 'none'; }, 600);
      gamePaused = false;
      loadLevel(0);
    };
  } else {
    loadLevel(0);
  }

  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);

    if (!levelComplete && !levelFailed && !gamePaused) {
      const dir = input.getDirection();
      hole.move(dir.x, dir.z, dt);

      timeRemaining -= dt;
      if (timeRemaining <= 0) {
        timeRemaining = 0;
        levelFailed = true;
        failReason = 'timeout';
        showLevelFailed();
      }
    }
    hole.update(dt);

    if (!gamePaused && !levelComplete && !levelFailed) {
      updateFleeingItems(dt);
    }
    processItems(dt);
    processStacks(dt);
    updateFloatingTexts(dt);
    updateBombFlash(dt);

    updateGoalUI();

    cam.update(hole.position, dt, hole.radius);
    engine.render(cam.camera);
  }

  loop();
}

init();

// ─── LEVEL MANAGEMENT ───

function loadLevel(idx) {
  for (let i = items.length - 1; i >= 0; i--) {
    engine.scene.remove(items[i].mesh);
  }
  items.length = 0;
  stacks.length = 0;
  floatingTexts.forEach(ft => { engine.scene.remove(ft.sprite); ft.mat.dispose(); });
  floatingTexts.length = 0;

  if (oceanMesh) engine.scene.remove(oceanMesh);
  if (groundGroup) engine.scene.remove(groundGroup);

  currentLevel = idx;
  const level = LEVELS[idx];
  MAP_W = level.mapW;
  MAP_D = level.mapD;

  oceanMesh = createOcean();
  engine.scene.add(oceanMesh);
  groundGroup = createIslandGround(MAP_W, MAP_D);
  engine.scene.add(groundGroup);

  hole.setMapBounds(-MAP_W / 2, MAP_W / 2, -MAP_D / 2, MAP_D / 2);
  hole.reset();
  if (level.holeStart) {
    hole.position.set(level.holeStart.x, 0, level.holeStart.z);
  } else {
    hole.position.set(0, 0, 0);
  }
  levelComplete = false;
  levelFailed = false;
  failReason = '';
  timeRemaining = level.timeLimit;

  goalProgress = {};
  for (const g of level.goals) {
    goalProgress[g.type] = { target: g.count, current: 0 };
  }

  level.spawn(addItem, {
    hexGrid: placeHexGrid,
    columnForest: placeColumnForest,
    pyramidStack: addPyramidStack,
    columnStack: addColumnStack,
    ring: placeRing,
    denseRow: placeDenseRow,
  });

  createGoalUI(level);
  createLevelTitle(level);
  createPauseButton();

  gamePaused = false;

  if (idx === 1 && previousLevel === 0) {
    gamePaused = true;
    setTimeout(() => showBombWarning(), 1600);
  }

  if (idx === LEVELS.length - 1) {
    gamePaused = true;
    playCinematicIntro();
  }

  previousLevel = idx;
}

function onItemEaten(itemType, sizeCategory) {
  if (itemType === 'bomb') {
    levelFailed = true;
    failReason = 'bomb';
    triggerBombFlash();
    setTimeout(() => showLevelFailed(), 400);
    return;
  }

  if (goalProgress[itemType]) {
    goalProgress[itemType].current++;
    spawnGoalFlyEffect(itemType);
  }

  const prevLevel = hole.level;
  hole.eat(sizeCategory);

  if (hole.level > prevLevel) {
    spawnLevelUpEffect();
  }

  let allDone = true;
  for (const key of Object.keys(goalProgress)) {
    if (goalProgress[key].current < goalProgress[key].target) {
      allDone = false;
      break;
    }
  }
  if (allDone && !levelComplete) {
    levelComplete = true;
    showLevelComplete();
  }
}

// ─── BOMB FLASH ───

let bombFlashTimer = 0;
let bombFlashOverlay = null;

function triggerBombFlash() {
  bombFlashTimer = 0.4;
  if (!bombFlashOverlay) {
    bombFlashOverlay = document.createElement('div');
    bombFlashOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.4);pointer-events:none;z-index:80;transition:opacity 0.3s;';
    document.body.appendChild(bombFlashOverlay);
  }
  bombFlashOverlay.style.opacity = '1';
}

function updateBombFlash(dt) {
  if (bombFlashTimer > 0) {
    bombFlashTimer -= dt;
    if (bombFlashTimer <= 0 && bombFlashOverlay) {
      bombFlashOverlay.style.opacity = '0';
    }
  }
}

// ─── GOAL FLY EFFECT ───

function spawnGoalFlyEffect(itemType) {
  const goalRow = goalContainer && goalContainer.querySelector(`.goal-row[data-type="${itemType}"]`);
  if (!goalRow) return;

  const rowRect = goalRow.getBoundingClientRect();
  const targetX = rowRect.left + 16;
  const targetY = rowRect.top + rowRect.height / 2;

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2 + 40;

  const icon = getItemIcon(itemType);
  const el = document.createElement('div');
  el.textContent = icon;
  el.style.cssText = `
    position:fixed;z-index:90;pointer-events:none;
    font-size:32px;
    left:${startX}px;top:${startY}px;
    transform:translate(-50%,-50%) scale(1.3);
    filter:drop-shadow(0 0 8px rgba(255,215,0,0.8));
    transition:all 0.5s cubic-bezier(0.2,0.8,0.3,1);
    opacity:1;
  `;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.left = targetX + 'px';
    el.style.top = targetY + 'px';
    el.style.transform = 'translate(-50%,-50%) scale(0.6)';
    el.style.opacity = '0.6';
  });

  setTimeout(() => {
    el.remove();
    if (goalRow) {
      goalRow.style.transition = 'transform 0.15s, background 0.15s';
      goalRow.style.transform = 'scale(1.08)';
      goalRow.style.background = 'rgba(218,165,32,0.15)';
      goalRow.style.borderRadius = '6px';
      setTimeout(() => {
        goalRow.style.transform = 'scale(1)';
        goalRow.style.background = 'transparent';
      }, 200);
    }
  }, 520);
}

// ─── LEVEL UP EFFECT ───

function spawnLevelUpEffect() {
  const div = document.createElement('div');
  div.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.5);
    z-index:70;pointer-events:none;text-align:center;
    font-family:'Georgia','Microsoft YaHei',serif;
    animation: levelUpAnim 1.8s ease-out forwards;
  `;
  div.innerHTML = `
    <div style="font-size:clamp(28px,6vw,48px);font-weight:bold;color:#ffd700;
      text-shadow:0 0 20px rgba(218,165,32,0.8),0 0 40px rgba(218,165,32,0.4),0 2px 8px rgba(0,0,0,0.5);
      letter-spacing:4px;">
      黑洞升级了！
    </div>
    <div style="font-size:clamp(14px,3vw,20px);color:rgba(255,255,255,0.8);margin-top:4px;
      text-shadow:0 1px 4px rgba(0,0,0,0.5);">
      Lv.${hole.level}
    </div>
  `;

  if (!document.getElementById('levelup-style')) {
    const style = document.createElement('style');
    style.id = 'levelup-style';
    style.textContent = `
      @keyframes levelUpAnim {
        0% { opacity:0; transform:translate(-50%,-50%) scale(0.5); }
        15% { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
        30% { transform:translate(-50%,-50%) scale(1.0); }
        70% { opacity:1; }
        100% { opacity:0; transform:translate(-50%,-60%) scale(1.0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

// ─── BOMB WARNING POPUP ───

function showBombWarning(callback) {
  gamePaused = true;
  const overlay = getOrCreateOverlay('bomb-warn-overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#1a3a2a,#1a3a2a);padding:30px 36px;border-radius:20px;
      text-align:center;font-family:'Georgia','Microsoft YaHei',serif;
      box-shadow:0 8px 40px rgba(0,0,0,0.6);border:2px solid rgba(218,165,32,0.3);max-width:340px;width:85%;">
      <div style="font-size:48px;margin-bottom:8px;">💣</div>
      <h2 style="margin:0 0 10px;color:#ffd700;font-size:22px;letter-spacing:2px;">小心炸弹!</h2>
      <p style="margin:0 0 18px;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;">
        从这一关开始，场地上会出现炸弹。<br>
        <span style="color:#e74c3c;font-weight:bold;">吃到炸弹会立刻出局哦！</span><br>
        <span style="color:rgba(255,255,255,0.6);font-size:13px;">（洞口太小时不会吃下炸弹，放心路过）</span>
      </p>
      <button class="overlay-btn" style="padding:12px 36px;font-size:18px;border:none;border-radius:12px;
        background:linear-gradient(135deg,#daa520,#f4c542);color:#1a3a2a;cursor:pointer;font-weight:bold;
        letter-spacing:1px;">
        我知道了
      </button>
    </div>
  `;
  overlay.querySelector('.overlay-btn').onclick = () => {
    overlay.style.display = 'none';
    gamePaused = false;
    if (callback) callback();
  };
}

// ─── CINEMATIC INTRO (FINAL LEVEL) ───

function playCinematicIntro() {
  const queenPos = { x: 0, z: 0 };
  const level = LEVELS[currentLevel];
  cam._smoothPos = null;

  cam.camera.position.set(queenPos.x + 3, 14, queenPos.z + 6);
  cam.camera.lookAt(new THREE.Vector3(queenPos.x, 0, queenPos.z));

  const label = document.createElement('div');
  label.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:70;
    pointer-events:none;text-align:center;font-family:'Georgia','Microsoft YaHei',serif;
    transition:opacity 1s;
  `;
  label.innerHTML = `
    <div style="font-size:clamp(20px,4vw,32px);color:#e74c3c;font-weight:bold;
      text-shadow:0 0 20px rgba(231,76,60,0.6),0 2px 8px rgba(0,0,0,0.5);
      letter-spacing:3px;">👑 红心皇后</div>
    <div style="font-size:clamp(14px,3vw,18px);color:rgba(255,255,255,0.7);margin-top:6px;">
      吞噬她，结束这一切</div>
  `;
  document.body.appendChild(label);

  setTimeout(() => { label.style.opacity = '0'; }, 2200);
  setTimeout(() => {
    label.remove();
    cam._smoothPos = null;
    gamePaused = false;
  }, 3500);
}

// ─── LEVEL COMPLETE / FAIL UI ───

function showLevelComplete() {
  const overlay = getOrCreateOverlay('level-overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#1a3a2a,#1a3a2a);padding:30px 50px;border-radius:20px;
      text-align:center;font-family:'Georgia','Microsoft YaHei',serif;
      box-shadow:0 8px 40px rgba(0,0,0,0.5);border:2px solid rgba(218,165,32,0.3);">
      <div style="font-size:48px;margin-bottom:5px;">🎉</div>
      <h2 style="margin:0 0 8px;color:#ffd700;font-size:26px;letter-spacing:2px;">过关成功！</h2>
      <p style="margin:0 0 18px;color:rgba(255,255,255,0.7);font-size:15px;">第 ${currentLevel + 1} 关完成</p>
      <button class="overlay-btn" style="padding:14px 40px;font-size:18px;border:none;border-radius:14px;
        background:linear-gradient(135deg,#daa520,#f4c542);color:#1a3a2a;cursor:pointer;font-weight:bold;letter-spacing:1px;">
        ${currentLevel + 1 < LEVELS.length ? '下一关 →' : '🏆 通关！'}
      </button>
    </div>
  `;
  const btn = overlay.querySelector('.overlay-btn');
  const nextIdx = currentLevel + 1;
  btn.onclick = () => {
    overlay.style.display = 'none';
    if (nextIdx < LEVELS.length) {
      loadLevel(nextIdx);
    } else {
      gamePaused = true;
      if (goalContainer) { goalContainer.remove(); goalContainer = null; }
      const homeScreen = document.getElementById('home-screen');
      if (homeScreen) {
        homeScreen.style.display = 'flex';
        homeScreen.style.opacity = '1';
      }
    }
  };
}

function showLevelFailed() {
  const isBomb = failReason === 'bomb';
  const overlay = getOrCreateOverlay('level-overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#1a3a2a,#1a3a2a);padding:30px 50px;border-radius:20px;
      text-align:center;font-family:'Georgia','Microsoft YaHei',serif;
      box-shadow:0 8px 40px rgba(0,0,0,0.5);border:2px solid rgba(${isBomb ? '231,76,60' : '218,165,32'},0.3);">
      <div style="font-size:56px;margin-bottom:5px;">${isBomb ? '💥' : '⏰'}</div>
      <h2 style="margin:0 0 8px;color:${isBomb ? '#e74c3c' : '#f39c12'};font-size:26px;letter-spacing:2px;">
        ${isBomb ? '被炸弹炸死了！' : '时间到！'}
      </h2>
      <p style="margin:0 0 18px;color:rgba(255,255,255,0.6);font-size:15px;">第 ${currentLevel + 1} 关失败</p>
      <button class="overlay-btn" style="padding:14px 40px;font-size:18px;border:none;border-radius:14px;
        background:linear-gradient(135deg,${isBomb ? '#e74c3c,#c0392b' : '#f39c12,#e67e22'});
        color:#fff;cursor:pointer;font-weight:bold;letter-spacing:1px;">重新挑战</button>
    </div>
  `;
  overlay.querySelector('.overlay-btn').onclick = () => {
    overlay.style.display = 'none';
    loadLevel(currentLevel);
  };
}

function getOrCreateOverlay(id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:100;flex-direction:column;';
    document.body.appendChild(el);
  }
  return el;
}

// ─── GOAL UI (Chinese + icons + timer) ───

let goalContainer = null;

function createGoalUI(level) {
  if (goalContainer) goalContainer.remove();
  goalContainer = document.createElement('div');
  goalContainer.id = 'goal-ui';
  goalContainer.style.cssText = `
    position:fixed;top:max(10px, env(safe-area-inset-top, 10px));left:max(8px, env(safe-area-inset-left, 8px));z-index:50;
    font-family:'Segoe UI','Microsoft YaHei',sans-serif;
    background:rgba(26,58,42,0.75);backdrop-filter:blur(10px);
    border:1px solid rgba(218,165,32,0.25);
    border-radius:14px;padding:12px 14px;min-width:160px;max-width:220px;
  `;

  // Level title
  const title = document.createElement('div');
  title.style.cssText = 'font-size:15px;color:#ffd700;font-weight:bold;margin-bottom:8px;letter-spacing:1px;';
  title.textContent = `第${level.id}关 · ${level.name}`;
  goalContainer.appendChild(title);

  // Timer
  const timer = document.createElement('div');
  timer.id = 'timer-display';
  timer.style.cssText = 'font-size:13px;color:#fff;margin-bottom:8px;';
  goalContainer.appendChild(timer);

  // Timer bar
  const barOuter = document.createElement('div');
  barOuter.style.cssText = 'width:100%;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;margin-bottom:8px;';
  const barInner = document.createElement('div');
  barInner.id = 'timer-bar';
  barInner.style.cssText = 'width:100%;height:100%;background:#2ecc71;border-radius:2px;transition:width 0.3s;';
  barOuter.appendChild(barInner);
  goalContainer.appendChild(barOuter);

  // Divider
  const divider = document.createElement('div');
  divider.style.cssText = 'border-top:1px solid rgba(255,255,255,0.15);margin-bottom:6px;';
  goalContainer.appendChild(divider);

  // Goal label
  const goalLabel = document.createElement('div');
  goalLabel.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;letter-spacing:2px;text-transform:uppercase;';
  goalLabel.textContent = '目标';
  goalContainer.appendChild(goalLabel);

  // Goal rows
  for (const g of level.goals) {
    const row = document.createElement('div');
    row.className = 'goal-row';
    row.dataset.type = g.type;
    row.style.cssText = 'font-size:14px;color:#fff;padding:4px 0;display:flex;align-items:center;gap:8px;';

    const icon = document.createElement('span');
    icon.textContent = getItemIcon(g.type);
    icon.style.fontSize = '18px';

    const name = document.createElement('span');
    name.className = 'goal-name';
    name.style.cssText = 'flex:1;';
    name.textContent = getItemName(g.type);

    const count = document.createElement('span');
    count.className = 'goal-count';
    count.style.cssText = 'font-weight:bold;';
    count.textContent = `0/${g.count}`;

    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(count);
    goalContainer.appendChild(row);
  }

  // XP display
  const xpRow = document.createElement('div');
  xpRow.id = 'xp-display';
  xpRow.style.cssText = 'font-size:12px;color:#aaa;margin-top:8px;border-top:1px solid rgba(255,255,255,0.15);padding-top:6px;';
  xpRow.textContent = 'Lv.1  XP:0';
  goalContainer.appendChild(xpRow);

  document.body.appendChild(goalContainer);
}

function getItemIcon(type) {
  const icons = {
    cherry: '🍒', macaron: '🧁', cookie: '🍪', apple: '🍎', strawberry: '🍓',
    mushroom: '🍄', rose: '🌹', cupcake: '🧁', playingCard: '🃏',
    teaCup: '☕', pocketWatch: '⌚', topHat: '🎩',
    flamingo: '🦩', hedgehog: '🦔', cardSoldier: '♠️',
    cheshireCat: '🐱', teaTable: '🍽️', giantMushroom: '🍄', roseBush: '🌹',
    queenOfHearts: '👑', bomb: '💣',
  };
  return icons[type] || '●';
}

function getItemName(type) {
  const names = {
    cherry: '樱桃', macaron: '马卡龙', cookie: '曲奇', apple: '苹果', strawberry: '草莓',
    mushroom: '蘑菇', rose: '玫瑰', cupcake: '蛋糕', playingCard: '扑克牌',
    teaCup: '茶杯', pocketWatch: '怀表', topHat: '礼帽',
    flamingo: '火烈鸟', hedgehog: '刺猬', cardSoldier: '扑克士兵',
    cheshireCat: '柴郡猫', teaTable: '茶桌', giantMushroom: '巨型蘑菇', roseBush: '玫瑰丛',
    queenOfHearts: '红心皇后', bomb: '炸弹',
  };
  return names[type] || type;
}

function updateGoalUI() {
  if (!goalContainer) return;
  const level = LEVELS[currentLevel];

  // Timer
  const timerEl = goalContainer.querySelector('#timer-display');
  if (timerEl) {
    const mins = Math.floor(timeRemaining / 60);
    const secs = Math.floor(timeRemaining % 60);
    timerEl.textContent = `⏱ ${mins}:${secs.toString().padStart(2, '0')}`;
    timerEl.style.color = timeRemaining < 15 ? '#e74c3c' : timeRemaining < 30 ? '#f39c12' : '#fff';
  }

  // Timer bar
  const bar = goalContainer.querySelector('#timer-bar');
  if (bar && level) {
    const pct = Math.max(0, (timeRemaining / level.timeLimit) * 100);
    bar.style.width = pct + '%';
    bar.style.background = pct < 15 ? '#e74c3c' : pct < 30 ? '#f39c12' : '#2ecc71';
  }

  // Goal rows
  const rows = goalContainer.querySelectorAll('.goal-row');
  for (const row of rows) {
    const type = row.dataset.type;
    const gp = goalProgress[type];
    if (!gp) continue;
    const done = gp.current >= gp.target;
    const countEl = row.querySelector('.goal-count');
    if (countEl) {
      countEl.textContent = `${Math.min(gp.current, gp.target)}/${gp.target}`;
      countEl.style.color = done ? '#2ecc71' : '#fff';
    }
    row.style.opacity = done ? '0.6' : '1';
    const nameEl = row.querySelector('.goal-name');
    if (nameEl) {
      nameEl.style.textDecoration = done ? 'line-through' : 'none';
    }
  }

  // XP
  const xpRow = goalContainer.querySelector('#xp-display');
  if (xpRow) {
    xpRow.textContent = `Lv.${hole.level}  XP:${hole.totalXP}`;
  }
}

function createLevelTitle(level) {
  const div = document.createElement('div');
  div.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:60;
    font-family:'Georgia','Microsoft YaHei',serif;text-align:center;pointer-events:none;
    transition:opacity 1.5s;
  `;
  div.innerHTML = `
    <div style="font-size:clamp(32px,7vw,48px);font-weight:bold;color:#ffd700;
      text-shadow:0 0 20px rgba(218,165,32,0.5),0 4px 12px rgba(0,0,0,0.6);
      letter-spacing:3px;">第${level.id}关</div>
    <div style="font-size:clamp(18px,4vw,28px);color:rgba(255,255,255,0.9);
      text-shadow:0 2px 8px rgba(0,0,0,0.5);margin-top:6px;letter-spacing:2px;">${level.name}</div>
  `;
  document.body.appendChild(div);
  setTimeout(() => { div.style.opacity = '0'; }, 1800);
  setTimeout(() => { div.remove(); }, 3500);
}

// ─── PAUSE ───

function createPauseButton() {
  if (pauseBtn) return;
  pauseBtn = document.createElement('button');
  pauseBtn.id = 'pause-btn';
  pauseBtn.textContent = '⏸';
  pauseBtn.style.cssText = `
    position:fixed;top:max(12px, env(safe-area-inset-top, 12px));right:max(12px, env(safe-area-inset-right, 12px));z-index:55;
    width:44px;height:44px;border:none;border-radius:12px;
    background:rgba(26,58,42,0.7);backdrop-filter:blur(8px);
    border:1px solid rgba(218,165,32,0.3);
    color:#ffd700;font-size:20px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:transform 0.15s;
  `;
  pauseBtn.onmouseenter = () => { pauseBtn.style.transform = 'scale(1.1)'; };
  pauseBtn.onmouseleave = () => { pauseBtn.style.transform = 'scale(1)'; };
  pauseBtn.onclick = () => {
    if (levelComplete || levelFailed) return;
    gamePaused = true;
    showPauseOverlay();
  };
  document.body.appendChild(pauseBtn);
}

function showPauseOverlay() {
  const overlay = getOrCreateOverlay('pause-overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#1a3a2a,#1a3a2a);padding:36px 44px;border-radius:20px;
      text-align:center;font-family:'Georgia','Microsoft YaHei',serif;
      box-shadow:0 8px 40px rgba(0,0,0,0.6);border:2px solid rgba(218,165,32,0.3);min-width:280px;">
      <div style="font-size:28px;color:#ffd700;font-weight:bold;margin-bottom:20px;letter-spacing:2px;">
        游戏暂停
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <button id="pause-resume" style="padding:14px 40px;font-size:18px;border:none;border-radius:14px;
          background:linear-gradient(135deg,#daa520,#f4c542);color:#1a3a2a;cursor:pointer;
          font-weight:bold;letter-spacing:1px;">
          继续游戏
        </button>
        <button id="pause-restart" style="padding:12px 40px;font-size:16px;border:none;border-radius:14px;
          background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);cursor:pointer;
          border:1px solid rgba(255,255,255,0.2);letter-spacing:1px;">
          重新开始
        </button>
        <button id="pause-home" style="padding:12px 40px;font-size:16px;border:none;border-radius:14px;
          background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);cursor:pointer;
          border:1px solid rgba(255,255,255,0.1);letter-spacing:1px;">
          返回首页
        </button>
      </div>
    </div>
  `;
  overlay.querySelector('#pause-resume').onclick = () => {
    overlay.style.display = 'none';
    gamePaused = false;
  };
  overlay.querySelector('#pause-restart').onclick = () => {
    overlay.style.display = 'none';
    loadLevel(currentLevel);
  };
  overlay.querySelector('#pause-home').onclick = () => {
    overlay.style.display = 'none';
    gamePaused = true;
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
      homeScreen.style.display = 'flex';
      homeScreen.style.opacity = '1';
    }
    if (goalContainer) { goalContainer.remove(); goalContainer = null; }
  };
}

// ─── OCEAN & GROUND ───

function createOcean() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#4a9bc4');
  grad.addColorStop(0.5, '#5bb3d9');
  grad.addColorStop(1, '#3d8ab8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const len = 30 + Math.random() * 40;
    ctx.strokeStyle = `rgba(255,255,255,${0.06 + Math.random() * 0.08})`;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.4, y - 3 - Math.random() * 3, x + len, y);
    ctx.stroke();
  }

  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 12 + Math.random() * 20, 4 + Math.random() * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, depthWrite: true })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.5;
  mesh.renderOrder = -2;
  return mesh;
}

function createIslandGround(w, d) {
  const group = new THREE.Group();
  const size = 512, sq = size / 16;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');

  // Base: soft green grass with subtle variation
  for (let r = 0; r < 16; r++) {
    for (let col = 0; col < 16; col++) {
      const base = (r + col) % 2 === 0;
      const h = 115 + Math.random() * 10;
      const s = 35 + Math.random() * 10;
      const l = base ? 78 + Math.random() * 4 : 74 + Math.random() * 4;
      ctx.fillStyle = `hsl(${h},${s}%,${l}%)`;
      ctx.fillRect(col * sq, r * sq, sq, sq);
    }
  }

  // Grass blades
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const h = 4 + Math.random() * 6;
    ctx.strokeStyle = `rgba(60,${130 + Math.random() * 40},40,${0.15 + Math.random() * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - h);
    ctx.stroke();
  }

  // Small flower dots
  const flowerColors = ['#ff9eaa', '#ffe066', '#ffffff', '#c8a2f8', '#ffb347'];
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Subtle path / dirt patches
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(200,180,140,${0.08 + Math.random() * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 15 + Math.random() * 20, 10 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w / 4, d / 4);

  const groundMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  groundMat.polygonOffset = true;
  groundMat.polygonOffsetFactor = 1;
  groundMat.polygonOffsetUnits = 1;

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(w, d), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.001;
  ground.renderOrder = -1;
  group.add(ground);

  // Edge walls — wooden fence look
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.7, metalness: 0.05 });
  const wallH = 0.4;

  const north = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, wallH, 0.3), edgeMat);
  north.position.set(0, -wallH / 2 + 0.001, -d / 2 - 0.15);
  group.add(north);

  const south = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, wallH, 0.3), edgeMat);
  south.position.set(0, -wallH / 2 + 0.001, d / 2 + 0.15);
  group.add(south);

  const west = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, d + 0.8), edgeMat);
  west.position.set(-w / 2 - 0.15, -wallH / 2 + 0.001, 0);
  group.add(west);

  const east = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, d + 0.8), edgeMat);
  east.position.set(w / 2 + 0.15, -wallH / 2 + 0.001, 0);
  group.add(east);

  // Decorative grass tufts along edges
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 0.8 });
  for (let i = 0; i < Math.floor(w * 2); i++) {
    const x = -w / 2 + Math.random() * w;
    const side = Math.random() > 0.5 ? -d / 2 - 0.05 : d / 2 + 0.05;
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.08 + Math.random() * 0.06, 0.15 + Math.random() * 0.1, 4),
      grassMat
    );
    tuft.position.set(x, 0.05, side);
    group.add(tuft);
  }
  for (let i = 0; i < Math.floor(d * 2); i++) {
    const z = -d / 2 + Math.random() * d;
    const side = Math.random() > 0.5 ? -w / 2 - 0.05 : w / 2 + 0.05;
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.08 + Math.random() * 0.06, 0.15 + Math.random() * 0.1, 4),
      grassMat
    );
    tuft.position.set(side, 0.05, z);
    group.add(tuft);
  }

  return group;
}

// ─── ITEM SPAWNING ───

function makeFallback(cat, color) {
  const r = SIZE_RADIUS[cat];
  let geom;
  if (cat === 'boss') geom = new THREE.BoxGeometry(r * 1.6, r * 1.6, r * 1.6);
  else if (cat === 'huge') geom = new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4);
  else if (cat === 'large') geom = new THREE.BoxGeometry(r * 1.2, r * 1.2, r * 1.2);
  else if (cat === 'medium') geom = new THREE.DodecahedronGeometry(r, 0);
  else geom = new THREE.SphereGeometry(r, 10, 8);

  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
    color: color || 0xff6b6b, roughness: 0.5, flatShading: true,
  })));

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(r * 0.35, 10),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.06 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -r + 0.006;
  grp.add(shadow);

  return { mesh: grp, data: { type: `fb_${cat}`, sizeCategory: cat, isTarget: true, radius: r } };
}

function addItem(x, z, type, cat, yOffset, opts) {
  let result = null;
  if (Factory && type) {
    try { result = Factory.create(type, cat); } catch (e) {}
  }
  if (!result) result = makeFallback(cat);

  const { mesh, data } = result;
  if (opts && opts.fleeing) {
    data.fleeing = true;
    data.fleeSpeed = opts.fleeSpeed || 1.2;
  }
  const y = (yOffset || 0) + data.radius;
  mesh.position.set(x, y, z);
  engine.scene.add(mesh);

  const it = new Item(mesh, data);
  it._stackY = yOffset || 0;
  items.push(it);
  return it;
}

// ─── LAYOUT HELPERS ───

function placeHexGrid(cx, cz, type, cat, width, depth, spacing) {
  const rowH = spacing * 0.866;
  const cols = Math.max(1, Math.floor(width / spacing));
  const rows = Math.max(1, Math.floor(depth / rowH));
  const ox = cx - (cols - 1) * spacing / 2;
  const oz = cz - (rows - 1) * rowH / 2;
  for (let r = 0; r < rows; r++) {
    const shift = (r % 2) * spacing * 0.5;
    for (let c = 0; c < cols; c++) {
      const x = ox + c * spacing + shift;
      const z = oz + r * rowH;
      if (Math.sqrt(x * x + z * z) < 0.5) continue;
      addItem(x, z, type, cat);
    }
  }
}

function placeColumnForest(cx, cz, type, cat, cols, rows, spacing, minH, maxH) {
  const ox = cx - (cols - 1) * spacing / 2;
  const oz = cz - (rows - 1) * spacing / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const h = minH + Math.floor(Math.random() * (maxH - minH + 1));
      addColumnStack(ox + c * spacing, oz + r * spacing, type, cat, h);
    }
  }
}

function placeDenseRow(cx, cz, type, cat, count, spacing, angle) {
  const dx = Math.cos(angle) * spacing;
  const dz = Math.sin(angle) * spacing;
  const sx = cx - dx * (count - 1) / 2;
  const sz = cz - dz * (count - 1) / 2;
  for (let i = 0; i < count; i++) {
    addItem(sx + dx * i, sz + dz * i, type, cat);
  }
}

function placeRing(cx, cz, type, cat, count, radius) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    addItem(cx + Math.cos(angle) * radius, cz + Math.sin(angle) * radius, type, cat);
  }
}

// ─── STACKING ───

function addPyramidStack(cx, cz, type, cat, layers) {
  const r = SIZE_RADIUS[cat];
  const spacing = r * 2 * 1.05;
  const stackItems = [];

  for (let layer = 0; layer < layers; layer++) {
    const size = layers - layer;
    const offset = -(size - 1) * spacing / 2;
    const y = layer * spacing;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const x = cx + offset + col * spacing;
        const z = cz + offset + row * spacing;
        const it = addItem(x, z, type, cat, y);
        it._stackIndex = stackItems.length;
        it._stackId = stacks.length;
        it._floatingY = it.position.y;
        stackItems.push(it);
      }
    }
  }

  stacks.push({
    x: cx, z: cz, items: stackItems, radius: layers * spacing / 2 + r,
    cascading: false, cascadeIndex: 0, cascadeTimer: 0,
  });
}

function addColumnStack(cx, cz, type, cat, height) {
  const r = SIZE_RADIUS[cat];
  const spacing = r * 2 * 1.05;
  const stackItems = [];

  for (let i = 0; i < height; i++) {
    const it = addItem(cx, cz, type, cat, i * spacing);
    it._stackIndex = i;
    it._stackId = stacks.length;
    it._floatingY = it.position.y;
    stackItems.push(it);
  }

  stacks.push({
    x: cx, z: cz, items: stackItems, radius: r * 1.5,
    cascading: false, cascadeIndex: 0, cascadeTimer: 0,
  });
}

// ─── STACK CASCADE ───

function processStacks(dt) {
  const hx = hole.position.x, hz = hole.position.z;
  const hr = hole.radius;

  for (const stack of stacks) {
    if (stack.cascading) {
      stack.cascadeTimer += dt;
      while (stack.cascadeTimer >= CASCADE_DELAY && stack.cascadeIndex < stack.items.length) {
        const it = stack.items[stack.cascadeIndex];
        if (it && !it.isSwallowed && !it.isSwallowing && it.position.y > it.data.radius + 0.05) {
          it._falling = true;
        }
        stack.cascadeIndex++;
        stack.cascadeTimer -= CASCADE_DELAY;
      }
      if (stack.cascadeIndex >= stack.items.length) stack.cascading = false;
      continue;
    }

    const dx = stack.x - hx;
    const dz = stack.z - hz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < hr + (stack.radius || 0.5)) {
      let hasFloating = false;
      for (const it of stack.items) {
        if (!it.isSwallowed && !it.isSwallowing && it.position.y > it.data.radius + 0.1) {
          hasFloating = true;
          break;
        }
      }
      if (hasFloating) {
        stack.cascading = true;
        stack.cascadeIndex = 0;
        stack.cascadeTimer = 0;
      }
    }
  }

  for (const it of items) {
    if (it._falling && !it.isSwallowed && !it.isSwallowing) {
      if (!it._scatterApplied) {
        it._scatterApplied = true;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2.5;
        it._fallVelX = Math.cos(angle) * speed;
        it._fallVelZ = Math.sin(angle) * speed;
      }
      it.position.x += it._fallVelX * dt;
      it.position.z += it._fallVelZ * dt;
      it._fallVelX *= 0.96;
      it._fallVelZ *= 0.96;
      it.position.y -= 8 * dt;
      const ground = it.data.radius;
      if (it.position.y <= ground) {
        it.position.y = ground;
        it._falling = false;
        it.mesh.rotation.x = (Math.random() - 0.5) * 0.4;
        it.mesh.rotation.z = (Math.random() - 0.5) * 0.4;
      }
    }
  }
}

// ─── FLOATING "+N" TEXT ───

const floatingTexts = [];

function spawnFloatingText(x, z, value, isNegative) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = isNegative ? '#e74c3c' : '#2ecc71';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  const txt = isNegative ? `${value}` : `+${value}`;
  ctx.strokeText(txt, 32, 24);
  ctx.fillText(txt, 32, 24);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.6, 0.3, 1);
  sprite.position.set(x, 0.8, z);
  engine.scene.add(sprite);
  floatingTexts.push({ sprite, mat, timer: 0 });
}

function updateFloatingTexts(dt) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.timer += dt;
    ft.sprite.position.y += dt * 1.5;
    ft.mat.opacity = 1 - ft.timer / 0.6;
    if (ft.timer >= 0.6) {
      engine.scene.remove(ft.sprite);
      ft.mat.dispose();
      floatingTexts.splice(i, 1);
    }
  }
}

// ─── FLEEING ITEMS ───

function updateFleeingItems(dt) {
  const hx = hole.position.x, hz = hole.position.z;
  const hr = hole.radius;

  for (const it of items) {
    if (!it.data.fleeing || it.isSwallowed || it.isSwallowing || it._falling) continue;
    if (it.position.y > it.data.radius + 0.15) continue;

    const dx = it.position.x - hx;
    const dz = it.position.z - hz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const fleeRange = hr * 6 + 2;
    if (dist < fleeRange) {
      const fleeSpeed = it.data.fleeSpeed || 1.2;
      const urgency = Math.max(0, 1 - dist / fleeRange);
      const speed = fleeSpeed * (0.3 + urgency * 0.7) * dt;

      let nx = dx / (dist || 1);
      let nz = dz / (dist || 1);

      if (!it._fleeWobble) it._fleeWobble = Math.random() * Math.PI * 2;
      it._fleeWobble += dt * 2.5;
      const wobble = Math.sin(it._fleeWobble) * 0.4;
      const wnx = nx * Math.cos(wobble) - nz * Math.sin(wobble);
      const wnz = nx * Math.sin(wobble) + nz * Math.cos(wobble);

      it.position.x += wnx * speed;
      it.position.z += wnz * speed;

      const halfW = MAP_W / 2 - it.data.radius;
      const halfD = MAP_D / 2 - it.data.radius;
      it.position.x = Math.max(-halfW, Math.min(halfW, it.position.x));
      it.position.z = Math.max(-halfD, Math.min(halfD, it.position.z));

      it.mesh.position.x = it.position.x;
      it.mesh.position.z = it.position.z;

      const moveAngle = Math.atan2(wnz, wnx);
      it.mesh.rotation.y = -moveAngle + Math.PI / 2;
      it.mesh.position.y = it.data.radius + Math.abs(Math.sin(it._fleeWobble * 3)) * 0.05;
    }
  }
}

// ─── COLLISION & SWALLOW ───

function processItems(dt) {
  if (levelComplete || levelFailed) return;

  const hx = hole.position.x, hz = hole.position.z;
  const hr = hole.radius;

  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (it.isSwallowed) continue;
    if (it.isSwallowing) { updateFalling(it, dt, i); continue; }

    if (it._falling) continue;
    if (it.position.y > it.data.radius + 0.15) continue;

    const dx = it.position.x - hx;
    const dz = it.position.z - hz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const ir = it.data.radius;

    if (dist < hr * 0.7 && hole.canEat(ir)) {
      it.isSwallowing = true;
      it.swallowTimer = 0;
      it.swallowPhase = 'fall';
      it.swallowDir.set(0, 0, 0);
    }
    else if (dist < hr && hole.canPartiallyEat(ir)) {
      const overlapFraction = 1 - (dist / hr);
      const wobbleAngle = Math.atan2(dx, dz);
      it.mesh.rotation.x = Math.sin(wobbleAngle) * overlapFraction * 0.5;
      it.mesh.rotation.z = -Math.cos(wobbleAngle) * overlapFraction * 0.5;

      if (dist < hr * 0.4) {
        it.isSwallowing = true;
        it.swallowTimer = 0;
        it.swallowPhase = 'tipAndFall';
        it.swallowDir.set(0, 0, 0);
      }
    }
    else if (dist < hr + ir * 0.5 && hole.canEat(ir)) {
      const rimFraction = 1 - ((dist - hr) / (ir * 0.5));
      const wobbleAngle = Math.atan2(dx, dz);
      it.mesh.rotation.x = Math.sin(wobbleAngle) * rimFraction * 0.25;
      it.mesh.rotation.z = -Math.cos(wobbleAngle) * rimFraction * 0.25;
    }
    else {
      it.mesh.rotation.x *= 0.93;
      it.mesh.rotation.z *= 0.93;
    }
  }
}

function updateFalling(it, dt, idx) {
  it.swallowTimer += dt;

  if (it.swallowPhase === 'tipAndFall') {
    const t = Math.min(it.swallowTimer / SWALLOW_TIP_DURATION, 1);
    it.mesh.rotation.x = t * 0.6;
    if (t >= 1) {
      it.swallowPhase = 'fall';
      it.swallowTimer = 0;
    }
    return;
  }

  const t = Math.min(it.swallowTimer / SWALLOW_FALL_DURATION, 1);
  const ease = t * t;

  it.position.y = it.groundY * (1 - ease) + (-2.5) * ease;

  const s = 1 - ease * 0.5;
  it.mesh.scale.set(s, s, s);
  it.mesh.rotation.x += dt * 2;

  if (t >= 1) {
    it.isSwallowed = true;
    engine.scene.remove(it.mesh);
    items.splice(idx, 1);
    const xp = XP_VALUES[it.data.sizeCategory] || 1;
    if (!it.data.isBomb) {
      spawnFloatingText(it.position.x, it.position.z, xp);
    }
    onItemEaten(it.data.type, it.data.sizeCategory);
  }
}
