import * as THREE from 'three';
import { SIZE_RADIUS } from '../constants.js';
import {
  createPlayingCard, createRose, createMushroom, createCupcake,
  createApple, createStrawberry, createCherry, createMacaron, createCookie,
} from '../models/SmallItems.js';
import {
  createTeaCup, createPocketWatch, createFlamingo, createHedgehog,
  createCardSoldier, createTopHat,
} from '../models/MediumItems.js';
import {
  createCheshireCat, createTeaTable, createGiantMushroom, createRoseBush,
} from '../models/LargeItems.js';
import { createQueenOfHearts } from '../models/ExtraLargeItems.js';
import { createBomb } from '../models/Bomb.js';

const CREATORS = {
  cherry:        { fn: createCherry,        cat: 'tiny',   baseVis: 0.30 },
  macaron:       { fn: createMacaron,       cat: 'tiny',   baseVis: 0.20 },
  cookie:        { fn: createCookie,        cat: 'tiny',   baseVis: 0.26 },

  playingCard:   { fn: createPlayingCard,   cat: 'small',  baseVis: 0.40 },
  rose:          { fn: createRose,          cat: 'small',  baseVis: 0.20 },
  mushroom:      { fn: createMushroom,      cat: 'small',  baseVis: 0.34 },
  cupcake:       { fn: createCupcake,       cat: 'small',  baseVis: 0.22 },
  apple:         { fn: createApple,         cat: 'small',  baseVis: 0.26 },
  strawberry:    { fn: createStrawberry,    cat: 'small',  baseVis: 0.20 },

  teaCup:        { fn: createTeaCup,        cat: 'medium', baseVis: 0.50 },
  pocketWatch:   { fn: createPocketWatch,   cat: 'medium', baseVis: 0.36 },
  topHat:        { fn: createTopHat,        cat: 'medium', baseVis: 0.40 },

  flamingo:      { fn: createFlamingo,      cat: 'large',  baseVis: 0.40 },
  hedgehog:      { fn: createHedgehog,      cat: 'large',  baseVis: 0.36 },
  cardSoldier:   { fn: createCardSoldier,   cat: 'large',  baseVis: 0.50 },

  cheshireCat:   { fn: createCheshireCat,   cat: 'huge',   baseVis: 1.00 },
  teaTable:      { fn: createTeaTable,      cat: 'huge',   baseVis: 0.90 },
  giantMushroom: { fn: createGiantMushroom, cat: 'huge',   baseVis: 0.70 },
  roseBush:      { fn: createRoseBush,      cat: 'huge',   baseVis: 0.80 },

  queenOfHearts: { fn: createQueenOfHearts, cat: 'boss',   baseVis: 1.40 },
  bomb:          { fn: createBomb,          cat: 'tiny',   baseVis: 0.20 },
};

export class ItemFactory {
  static create(type, overrideCat) {
    const entry = CREATORS[type];
    if (!entry) return null;

    const model = entry.fn();
    const cat = overrideCat || entry.cat;
    const radius = SIZE_RADIUS[cat];

    const targetVis = radius * 2 * 0.9;
    const scale = targetVis / entry.baseVis;

    const wrapper = new THREE.Group();
    wrapper.add(model);
    if (Math.abs(scale - 1) > 0.05) {
      model.scale.multiplyScalar(scale);
    }

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.35, 10),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.06 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    wrapper.add(shadow);

    return {
      mesh: wrapper,
      data: { type, sizeCategory: cat, isTarget: type !== 'bomb', isBomb: type === 'bomb', radius },
    };
  }

  static getTinyTypes() {
    return ['cherry', 'macaron', 'cookie'];
  }

  static getSmallTypes() {
    return ['cupcake', 'apple', 'strawberry', 'mushroom', 'rose', 'playingCard'];
  }

  static getMediumTypes() {
    return ['teaCup', 'pocketWatch', 'topHat'];
  }

  static getLargeTypes() {
    return ['flamingo', 'hedgehog', 'cardSoldier'];
  }

  static getHugeTypes() {
    return ['cheshireCat', 'teaTable', 'giantMushroom', 'roseBush'];
  }

  static getBossTypes() {
    return ['queenOfHearts'];
  }
}
