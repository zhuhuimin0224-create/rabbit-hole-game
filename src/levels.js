import { SIZE_RADIUS } from './constants.js';

export const LEVELS = [
  {
    id: 1,
    name: '甜品花园',
    mapW: 4.5,
    mapD: 4.5,
    timeLimit: 60,
    goals: [
      { type: 'cherry', count: 8 },
      { type: 'macaron', count: 5 },
      { type: 'cookie', count: 3 },
    ],
    spawn(add, helpers) {
      const { ring, columnStack } = helpers;
      const s = SIZE_RADIUS.tiny * 2 * 1.1;

      // Cherry ring around center
      ring(0, 0, 'cherry', 'tiny', 8, 0.8);

      // Cherry tower at center — 4-base, 3 layers
      columnStack(-0.15, -0.15, 'cherry', 'tiny', 3);
      columnStack(0.15, -0.15, 'cherry', 'tiny', 3);
      columnStack(-0.15, 0.15, 'cherry', 'tiny', 2);
      columnStack(0.15, 0.15, 'cherry', 'tiny', 2);

      // Macaron cluster — left
      ring(-1.3, 0, 'macaron', 'tiny', 6, 0.5);
      columnStack(-1.3, 0, 'macaron', 'tiny', 3);
      add(-1.3, -0.8, 'macaron', 'tiny');

      // Cookie cluster — right
      ring(1.3, 0, 'cookie', 'tiny', 5, 0.5);
      columnStack(1.3, 0, 'cookie', 'tiny', 2);
      add(1.3, 0.7, 'cookie', 'tiny');
      add(1.3, -0.7, 'cookie', 'tiny');

      // Extra cherries for XP
      add(0, 1.5, 'cherry', 'tiny');
      add(0, -1.5, 'cherry', 'tiny');
      add(-0.5, 1.4, 'macaron', 'tiny');
      add(0.5, -1.4, 'macaron', 'tiny');
    },
  },

  {
    id: 2,
    name: '蘑菇森林',
    mapW: 12,
    mapD: 12,
    timeLimit: 120,
    goals: [
      { type: 'mushroom', count: 20 },
      { type: 'apple', count: 15 },
      { type: 'teaCup', count: 3 },
    ],
    spawn(add, helpers) {
      const { hexGrid, columnForest, pyramidStack, ring, denseRow, columnStack } = helpers;
      const ts = SIZE_RADIUS.tiny * 2 * 1.05;
      const ss = SIZE_RADIUS.small * 2 * 1.05;

      // NW: mushroom forest
      columnForest(-3.5, -3.5, 'mushroom', 'small', 3, 3, ss * 2.5, 2, 5);
      hexGrid(-3.5, -1.5, 'mushroom', 'small', 4.0, 2.5, ss);

      // NE: apple orchard
      hexGrid(3.5, -3.5, 'apple', 'small', 4.0, 4.0, ss);
      hexGrid(3.5, -0.5, 'apple', 'small', 3.0, 2.0, ss);

      // Center: tiny items for early XP
      hexGrid(0, 0, 'cherry', 'tiny', 3.5, 3.5, ts);
      pyramidStack(-2.0, 1.5, 'macaron', 'tiny', 3);
      pyramidStack(2.0, 1.5, 'cookie', 'tiny', 3);

      // South: tea party
      add(0, 4.5, 'teaCup', 'medium');
      add(-1.8, 5.0, 'teaCup', 'medium');
      add(1.8, 5.0, 'teaCup', 'medium');
      ring(0, 4.5, 'cookie', 'tiny', 8, 1.5);

      // SE: strawberry + rose mix
      hexGrid(3.5, 3.5, 'strawberry', 'small', 3.0, 3.0, ss);
      hexGrid(-3.5, 3.5, 'rose', 'small', 3.0, 3.0, ss);

      columnStack(-5.0, 0, 'cupcake', 'small', 3);
      columnStack(5.0, 0, 'cupcake', 'small', 3);

      // Bombs — all tiny, in open lanes between zones (not corners, not near targets)
      add(-2.5, -3.5, 'bomb', 'tiny');
      add(2.5, -2.0, 'bomb', 'tiny');
      add(0, 2.5, 'bomb', 'tiny');
      add(-3.0, 1.0, 'bomb', 'tiny');
      add(3.5, 1.0, 'bomb', 'tiny');
    },
  },

  {
    id: 3,
    name: '皇后的花园',
    mapW: 18,
    mapD: 18,
    timeLimit: 180,
    goals: [
      { type: 'cherry', count: 80 },
      { type: 'playingCard', count: 12 },
      { type: 'teaCup', count: 5 },
    ],
    spawn(add, helpers) {
      const { hexGrid, columnForest, pyramidStack, ring, denseRow, columnStack } = helpers;
      const ts = SIZE_RADIUS.tiny * 2 * 1.05;
      const ss = SIZE_RADIUS.small * 2 * 1.05;

      // ── Cherry 4-base towers (2x2 column stacks, cascading) ──
      const tower4 = (cx, cz, h) => {
        const s = SIZE_RADIUS.tiny * 2 * 1.1;
        const off = s / 2;
        columnStack(cx - off, cz - off, 'cherry', 'tiny', h);
        columnStack(cx + off, cz - off, 'cherry', 'tiny', h);
        columnStack(cx - off, cz + off, 'cherry', 'tiny', h);
        columnStack(cx + off, cz + off, 'cherry', 'tiny', h);
      };
      tower4(0, 0, 6);
      tower4(-3.0, -3.0, 5);
      tower4(3.0, -3.0, 5);
      tower4(-3.0, 3.0, 4);
      tower4(3.0, 3.0, 4);
      tower4(-1.5, -1.5, 3);
      tower4(1.5, 1.5, 3);
      tower4(0, -5.0, 4);
      tower4(0, 5.0, 4);

      // ── Alternating cherry/macaron rings ──
      ring(0, 0, 'cherry', 'tiny', 10, 1.8);
      ring(0, 0, 'macaron', 'tiny', 8, 2.8);
      ring(0, 0, 'cherry', 'tiny', 14, 4.0);
      ring(0, 0, 'cookie', 'tiny', 10, 5.2);

      // NW & NE cherry scatter — loose, not hex grid
      ring(-5.0, -5.0, 'cherry', 'tiny', 8, 1.2);
      tower4(-5.0, -5.0, 3);
      ring(5.0, -5.0, 'cherry', 'tiny', 8, 1.2);
      tower4(5.0, -5.0, 3);

      // SW & SE cherry scatter
      ring(-5.0, 5.0, 'cherry', 'tiny', 6, 1.0);
      tower4(-5.0, 5.0, 3);
      ring(5.0, 5.0, 'cherry', 'tiny', 6, 1.0);
      tower4(5.0, 5.0, 3);

      // Macaron + cookie for variety
      ring(-6.5, 0, 'macaron', 'tiny', 8, 1.0);
      columnStack(-6.5, 0, 'macaron', 'tiny', 4);
      ring(6.5, 0, 'cookie', 'tiny', 8, 1.0);
      columnStack(6.5, 0, 'cookie', 'tiny', 4);

      // ── Playing cards in groups ──
      hexGrid(0, -7.5, 'playingCard', 'small', 4.0, 2.0, ss);
      hexGrid(7.5, 0, 'playingCard', 'small', 2.0, 4.0, ss);
      hexGrid(-7.5, 0, 'playingCard', 'small', 2.0, 4.0, ss);

      // Small items near playing cards
      hexGrid(0, -7.5, 'rose', 'small', 2.0, 1.5, ss * 1.5);
      hexGrid(7.5, 3.0, 'mushroom', 'small', 2.0, 3.0, ss);
      hexGrid(-7.5, -3.0, 'apple', 'small', 2.0, 3.0, ss);

      // ── Tea cups — grouped in south area ──
      add(0, 7.5, 'teaCup', 'medium');
      add(-1.2, 8.0, 'teaCup', 'medium');
      add(1.2, 8.0, 'teaCup', 'medium');
      add(-0.6, 8.5, 'teaCup', 'medium');
      add(0.6, 8.5, 'teaCup', 'medium');
      ring(0, 8.0, 'cookie', 'tiny', 10, 1.5);

      // Cupcake stacks for extra XP
      columnStack(-8.0, -7.0, 'cupcake', 'small', 3);
      columnStack(8.0, -7.0, 'cupcake', 'small', 3);
      hexGrid(-7.0, 6.0, 'strawberry', 'small', 3.0, 2.0, ss);
      hexGrid(7.0, 6.0, 'strawberry', 'small', 3.0, 2.0, ss);

      // Bombs — tiny, in open lanes (not corners, not near target clusters)
      add(-3.0, -7.0, 'bomb', 'tiny');
      add(3.0, -7.0, 'bomb', 'tiny');
      add(-6.0, -3.0, 'bomb', 'tiny');
      add(6.0, 3.0, 'bomb', 'tiny');
      add(0, -3.0, 'bomb', 'tiny');
      add(3.0, 6.0, 'bomb', 'tiny');
    },
  },

  {
    id: 4,
    name: '疯帽匠的茶会',
    mapW: 22,
    mapD: 22,
    timeLimit: 210,
    goals: [
      { type: 'mushroom', count: 30 },
      { type: 'topHat', count: 6 },
      { type: 'flamingo', count: 4 },
    ],
    spawn(add, helpers) {
      const { hexGrid, columnForest, pyramidStack, ring, denseRow, columnStack } = helpers;
      const ts = SIZE_RADIUS.tiny * 2 * 1.05;
      const ss = SIZE_RADIUS.small * 2 * 1.05;
      const ms = SIZE_RADIUS.medium * 2 * 1.05;

      // ── Center: cherry+macaron+cookie rings for starting XP ──
      ring(0, 0, 'cherry', 'tiny', 10, 1.5);
      ring(0, 0, 'macaron', 'tiny', 8, 2.5);
      ring(0, 0, 'cherry', 'tiny', 14, 3.8);
      ring(0, 0, 'cookie', 'tiny', 10, 5.0);

      // Cherry towers at center
      const tower4 = (cx, cz, h) => {
        const s = SIZE_RADIUS.tiny * 2 * 1.1;
        const off = s / 2;
        columnStack(cx - off, cz - off, 'cherry', 'tiny', h);
        columnStack(cx + off, cz - off, 'cherry', 'tiny', h);
        columnStack(cx - off, cz + off, 'cherry', 'tiny', h);
        columnStack(cx + off, cz + off, 'cherry', 'tiny', h);
      };
      tower4(-2.5, -2.5, 5);
      tower4(2.5, -2.5, 5);
      tower4(-2.5, 2.5, 4);
      tower4(2.5, 2.5, 4);
      tower4(0, 0, 4);

      // Extra tiny for XP
      hexGrid(-5.0, -5.0, 'macaron', 'tiny', 3.0, 3.0, ts);
      hexGrid(5.0, 5.0, 'cookie', 'tiny', 3.0, 3.0, ts);

      // ── Mushroom forests — target items ──
      columnForest(-7.0, -7.0, 'mushroom', 'small', 4, 3, ss * 2.2, 2, 5);
      hexGrid(-7.0, -5.0, 'mushroom', 'small', 4.0, 2.5, ss);
      columnForest(7.0, -7.0, 'mushroom', 'small', 3, 3, ss * 2.2, 2, 5);
      hexGrid(7.0, -5.0, 'mushroom', 'small', 3.5, 2.5, ss);
      hexGrid(0, 8.0, 'mushroom', 'small', 5.0, 3.0, ss);
      columnForest(0, 9.5, 'mushroom', 'small', 3, 2, ss * 2, 3, 6);

      // ── Top hats — grouped in tea party area (medium) ──
      add(-3.0, 8.0, 'topHat', 'medium');
      add(-1.5, 8.5, 'topHat', 'medium');
      add(0, 9.0, 'topHat', 'medium');
      add(1.5, 8.5, 'topHat', 'medium');
      add(3.0, 8.0, 'topHat', 'medium');
      add(0, 7.0, 'topHat', 'medium');
      ring(0, 8.5, 'teaCup', 'medium', 4, 2.5);
      ring(0, 8.5, 'cookie', 'tiny', 8, 1.5);

      // ── Flamingos — FLEEING! Cute animals that run away ──
      add(-8.5, 1.0, 'flamingo', 'large', 0, { fleeing: true, fleeSpeed: 1.4 });
      add(-9.0, 3.0, 'flamingo', 'large', 0, { fleeing: true, fleeSpeed: 1.2 });
      add(-8.0, 5.0, 'flamingo', 'large', 0, { fleeing: true, fleeSpeed: 1.3 });
      add(-9.5, 4.0, 'flamingo', 'large', 0, { fleeing: true, fleeSpeed: 1.5 });
      // Hedgehog companions — also flee!
      add(-7.5, 2.0, 'hedgehog', 'large', 0, { fleeing: true, fleeSpeed: 0.8 });
      add(-8.5, 4.5, 'hedgehog', 'large', 0, { fleeing: true, fleeSpeed: 0.9 });
      hexGrid(-8.5, 3.0, 'rose', 'small', 3.0, 5.0, ss);

      // Small + medium upgrade paths
      hexGrid(-7.0, 0, 'apple', 'small', 3.0, 3.0, ss);
      hexGrid(7.0, 0, 'cupcake', 'small', 3.0, 3.0, ss);
      hexGrid(-7.0, 5.0, 'strawberry', 'small', 3.0, 2.0, ss);
      hexGrid(7.0, 5.0, 'rose', 'small', 3.0, 2.0, ss);
      denseRow(-5.0, -8.0, 'pocketWatch', 'medium', 3, ms, 0);
      denseRow(5.0, -8.0, 'pocketWatch', 'medium', 3, ms, 0);

      // Playing card decorations
      hexGrid(8.0, -4.0, 'playingCard', 'small', 3.0, 3.0, ss);
      hexGrid(-8.0, -4.0, 'playingCard', 'small', 3.0, 3.0, ss);

      // Card soldiers for XP
      add(-5.0, -6.0, 'cardSoldier', 'large');
      add(5.0, -6.0, 'cardSoldier', 'large');

      // Bombs — tiny, in open lanes (away from corners/edges where animals flee)
      add(-3.5, -4.0, 'bomb', 'tiny');
      add(3.5, -4.0, 'bomb', 'tiny');
      add(0, -6.0, 'bomb', 'tiny');
      add(-4.0, 3.0, 'bomb', 'tiny');
      add(4.0, 3.0, 'bomb', 'tiny');
      add(7.0, 6.0, 'bomb', 'tiny');
      add(-3.0, 8.5, 'bomb', 'tiny');
      add(8.0, -7.0, 'bomb', 'tiny');
    },
  },

  {
    id: 5,
    name: '皇后的审判',
    mapW: 26,
    mapD: 26,
    timeLimit: 240,
    holeStart: { x: 10, z: 10 },
    goals: [
      { type: 'queenOfHearts', count: 1 },
    ],
    spawn(add, helpers) {
      const { hexGrid, columnForest, pyramidStack, ring, denseRow, columnStack } = helpers;
      const ts = SIZE_RADIUS.tiny * 2 * 1.05;
      const ss = SIZE_RADIUS.small * 2 * 1.05;
      const ms = SIZE_RADIUS.medium * 2 * 1.05;
      const ls = SIZE_RADIUS.large * 2 * 1.05;

      // Queen at center
      add(0, 0, 'queenOfHearts', 'boss');
      ring(0, 0, 'cardSoldier', 'large', 8, 4.0);
      ring(0, 0, 'playingCard', 'small', 16, 3.0);

      // NW: sweet XP zone — huge cherry field
      hexGrid(-9.0, -9.0, 'cherry', 'tiny', 6.0, 6.0, ts);
      pyramidStack(-9.0, -9.0, 'macaron', 'tiny', 5);
      columnForest(-9.0, -6.0, 'cookie', 'tiny', 4, 3, ts * 3, 3, 7);
      hexGrid(-7.0, -6.0, 'macaron', 'tiny', 3.0, 2.0, ts);

      // NE: mushroom + apple zone
      columnForest(9.0, -9.0, 'mushroom', 'small', 4, 3, ss * 2.5, 3, 7);
      hexGrid(9.0, -6.0, 'apple', 'small', 4.5, 3.0, ss);
      hexGrid(7.0, -9.0, 'strawberry', 'small', 3.0, 3.0, ss);

      // SW: rose + cupcake zone
      hexGrid(-9.0, 9.0, 'rose', 'small', 5.0, 5.0, ss);
      hexGrid(-9.0, 6.0, 'cupcake', 'small', 3.0, 3.0, ss);
      add(-10.0, 7.0, 'roseBush', 'huge');
      add(-7.0, 10.0, 'roseBush', 'huge');

      // SE: tea party zone
      add(9.0, 9.0, 'teaTable', 'huge');
      ring(9.0, 9.0, 'teaCup', 'medium', 6, 2.0);
      hexGrid(9.0, 7.0, 'cookie', 'tiny', 3.0, 2.0, ts);
      add(7.0, 9.0, 'topHat', 'medium');
      add(10.0, 7.0, 'pocketWatch', 'medium');

      // N: flamingo field
      add(-3.0, -10.0, 'flamingo', 'large');
      add(0, -11.0, 'flamingo', 'large');
      add(3.0, -10.0, 'flamingo', 'large');
      add(-1.5, -8.5, 'hedgehog', 'large');
      add(1.5, -8.5, 'hedgehog', 'large');
      hexGrid(0, -10.0, 'rose', 'small', 4.0, 2.0, ss);

      // S: huge items for endgame XP
      add(0, 11.0, 'giantMushroom', 'huge');
      add(-3.0, 10.0, 'cheshireCat', 'huge');
      add(3.0, 10.0, 'giantMushroom', 'huge');
      hexGrid(0, 9.0, 'mushroom', 'small', 4.0, 2.0, ss);

      // E/W medium corridors
      denseRow(-11.0, 0, 'topHat', 'medium', 4, ms, Math.PI / 2);
      denseRow(11.0, 0, 'pocketWatch', 'medium', 4, ms, Math.PI / 2);
      hexGrid(-11.0, -3.0, 'playingCard', 'small', 3.0, 3.0, ss);
      hexGrid(11.0, 3.0, 'playingCard', 'small', 3.0, 3.0, ss);

      // Large XP near center corridors
      add(-6.0, -4.0, 'cardSoldier', 'large');
      add(6.0, -4.0, 'cardSoldier', 'large');
      add(-6.0, 4.0, 'cardSoldier', 'large');
      add(6.0, 4.0, 'cardSoldier', 'large');

      // Extra tiny zones near spawn (hole starts at 10,10)
      hexGrid(10.0, 10.0, 'cherry', 'tiny', 4.0, 4.0, ts);
      hexGrid(8.0, 8.0, 'macaron', 'tiny', 3.0, 3.0, ts);

      // Extra tiny zones in other corners
      hexGrid(-4.0, -4.0, 'cherry', 'tiny', 4.0, 4.0, ts);
      hexGrid(4.0, -4.0, 'cookie', 'tiny', 4.0, 4.0, ts);
      hexGrid(-4.0, 4.0, 'macaron', 'tiny', 4.0, 4.0, ts);

      // Bombs — tiny, in transit lanes (not corners, not near Queen)
      add(-5.0, -8.0, 'bomb', 'tiny');
      add(5.0, -8.0, 'bomb', 'tiny');
      add(-8.0, 5.0, 'bomb', 'tiny');
      add(8.0, -5.0, 'bomb', 'tiny');
      add(-7.0, -2.0, 'bomb', 'tiny');
      add(7.0, 2.0, 'bomb', 'tiny');
      add(-2.0, 7.0, 'bomb', 'tiny');
      add(2.0, -7.0, 'bomb', 'tiny');
      add(-4.0, 6.0, 'bomb', 'tiny');
      add(5.0, 5.0, 'bomb', 'tiny');
    },
  },
];
