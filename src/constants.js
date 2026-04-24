export const HOLE_BASE_RADIUS = 0.20;
export const HOLE_SPEED = 3.0;
export const HOLE_SPEED_DECAY = 0.7;
export const SWALLOW_THRESHOLD = 0.7;
export const GRAVITY = 15;
export const COMBO_WINDOW = 0.5;
export const CAMERA_OFFSET = { x: 0, y: 7, z: 1.87 };
export const CAMERA_LERP = 0.06;
export const SWALLOW_TIP_DURATION = 0.15;
export const SWALLOW_FALL_DURATION = 0.25;
export const CASCADE_DELAY = 0.05;

export const SIZE_CATEGORIES = ['tiny', 'small', 'medium', 'large', 'huge', 'boss'];

export const SIZE_RADIUS = {
  tiny: 0.15,
  small: 0.25,
  medium: 0.45,
  large: 0.70,
  huge: 1.10,
  boss: 1.60,
};

export const XP_VALUES = {
  tiny: 1,
  small: 2,
  medium: 5,
  large: 10,
  huge: 20,
  boss: 50,
};

export const LEVEL_RADIUS = [0.20, 0.26, 0.34, 0.44, 0.56, 0.72, 0.92, 1.18, 1.50, 1.95];
export const GROWTH_THRESHOLDS = [0, 15, 40, 80, 140, 220, 320, 440, 580, 750];

export const BOMB_SHRINK = 0.15;

export const ITEM_NAMES = {
  cherry: '🍒 樱桃',
  macaron: '🧁 马卡龙',
  cookie: '🍪 曲奇',
  apple: '🍎 苹果',
  strawberry: '🍓 草莓',
  mushroom: '🍄 蘑菇',
  rose: '🌹 玫瑰',
  cupcake: '🧁 蛋糕',
  playingCard: '🃏 扑克牌',
  teaCup: '☕ 茶杯',
  pocketWatch: '⌚ 怀表',
  topHat: '🎩 礼帽',
  flamingo: '🦩 火烈鸟',
  hedgehog: '🦔 刺猬',
  cardSoldier: '♠ 扑克士兵',
  cheshireCat: '🐱 柴郡猫',
  teaTable: '🍽 茶桌',
  giantMushroom: '🍄 巨型蘑菇',
  roseBush: '🌹 玫瑰丛',
  queenOfHearts: '👑 红心皇后',
  bomb: '💣 炸弹',
};

export const COLORS = {
  background: 0xe8f4fd,
  groundLight: 0xfff8f0,
  groundDark: 0xf5e6d3,
  holeDark: 0x1a0a2e,
  holeRim: 0xdaa520,
  cardRed: 0xcc3333,
  cardBlack: 0x333333,
  roseRed: 0xe74c3c,
  roseWhite: 0xfafafa,
  mushroomCap: 0xe74c3c,
  mushroomStem: 0xfaf0e6,
  gold: 0xdaa520,
  teaBrown: 0x8b6914,
  flamingoPink: 0xff69b4,
  hedgehogBrown: 0x8b7355,
  cheshirePurple: 0x9b59b6,
  queenRed: 0xc0392b,
  gardenGreen: 0x27ae60,
  woodBrown: 0xa0522d,
  bombBlack: 0x222222,
  warningRed: 0xff0000,
  potionBlue: 0x3498db,
  cookieGold: 0xd4a547,
  chinaWhite: 0xf0f0ff,
  ribbonBlue: 0x2980b9,
};
