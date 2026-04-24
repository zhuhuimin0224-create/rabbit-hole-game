import * as THREE from 'three';
import { COLORS } from '../constants.js';

export function createPlayingCard(color = COLORS.cardRed) {
  const group = new THREE.Group();
  const isRed = (color === COLORS.cardRed || color === 0xe74c3c || color === 0xcc3333);
  const cc = isRed ? 0xdd3333 : 0x333333;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.55, 0.035),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 })
  );
  group.add(body);

  const suit = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, isRed ? 12 : 4, 8),
    new THREE.MeshStandardMaterial({ color: cc, roughness: 0.3 })
  );
  suit.position.set(0, 0, 0.02);
  suit.scale.set(1, 1, 0.3);
  group.add(suit);

  group.rotation.x = -0.1 + Math.random() * 0.2;
  return group;
}

export function createRose(color = COLORS.roseRed) {
  const group = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.3, 6),
    new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.6 })
  );
  stem.position.y = 0;
  group.add(stem);

  const bud = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  bud.position.y = 0.18;
  group.add(bud);

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 6, 5),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4, flatShading: true })
    );
    petal.position.set(Math.cos(a) * 0.07, 0.15, Math.sin(a) * 0.07);
    petal.scale.set(1, 0.5, 1);
    group.add(petal);
  }

  return group;
}

export function createMushroom(capColor = COLORS.mushroomCap) {
  const group = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.2, 10),
    new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.6 })
  );
  stem.position.y = 0.1;
  group.add(stem);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.4, flatShading: true })
  );
  cap.position.y = 0.22;
  group.add(cap);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spot = new THREE.Mesh(
      new THREE.CircleGeometry(0.025, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, side: THREE.DoubleSide })
    );
    spot.position.set(Math.cos(a) * 0.11, 0.28, Math.sin(a) * 0.11);
    spot.lookAt(new THREE.Vector3(0, 0.5, 0));
    group.add(spot);
  }
  return group;
}

export function createCupcake(color = 0xff9ff3) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.08, 0.12, 12),
    new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.7 })
  );
  base.position.y = 0.06;
  group.add(base);

  const frosting = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, flatShading: true })
  );
  frosting.position.y = 0.14;
  group.add(frosting);

  const cherry = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3 })
  );
  cherry.position.y = 0.24;
  group.add(cherry);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const sprinkle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.02, 4),
      new THREE.MeshStandardMaterial({
        color: [0xff6b6b, 0x48dbfb, 0xffd93d, 0x6bcb77][i], roughness: 0.4,
      })
    );
    sprinkle.position.set(Math.cos(a) * 0.06, 0.2, Math.sin(a) * 0.06);
    sprinkle.rotation.z = Math.random() * Math.PI;
    group.add(sprinkle);
  }
  return group;
}

export function createApple(color = 0xff3333) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 12, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.35 })
  );
  body.scale.set(1, 0.9, 1);
  body.position.y = 0.12;
  group.add(body);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.015, 0.06, 6),
    new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.7 })
  );
  stem.position.y = 0.22;
  group.add(stem);

  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 5, 4),
    new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.5, flatShading: true })
  );
  leaf.position.set(0.03, 0.22, 0);
  leaf.scale.set(1.5, 0.3, 0.8);
  group.add(leaf);

  return group;
}

export function createStrawberry(color = 0xff2244) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.2, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  body.position.y = 0.1;
  body.rotation.x = Math.PI;
  group.add(body);

  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  top.position.y = 0.2;
  group.add(top);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    const lf = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.05, 4),
      new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.5 })
    );
    lf.position.set(Math.cos(a) * 0.04, 0.26, Math.sin(a) * 0.04);
    group.add(lf);
  }

  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2;
    const h = 0.05 + Math.random() * 0.15;
    const seed = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0xffdd44, roughness: 0.4 })
    );
    const r = 0.06 * (1 - h / 0.25);
    seed.position.set(Math.cos(a) * r, h + 0.03, Math.sin(a) * r);
    group.add(seed);
  }
  return group;
}

export function createCherry(color = 0xcc0033) {
  const group = new THREE.Group();

  for (let side = -1; side <= 1; side += 2) {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.3 })
    );
    ball.position.set(side * 0.07, 0.08, 0);
    group.add(ball);

    const highlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffaaaa, roughness: 0.2 })
    );
    highlight.position.set(side * 0.05, 0.12, 0.05);
    group.add(highlight);

    const stemCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 0.07, 0.16, 0),
      new THREE.Vector3(side * 0.03, 0.25, 0),
      new THREE.Vector3(0, 0.28, 0)
    );
    const stemMesh = new THREE.Mesh(
      new THREE.TubeGeometry(stemCurve, 6, 0.008, 6, false),
      new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.6 })
    );
    group.add(stemMesh);
  }

  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 5, 4),
    new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.5, flatShading: true })
  );
  leaf.position.set(0.02, 0.27, 0);
  leaf.scale.set(1.5, 0.3, 0.8);
  group.add(leaf);
  return group;
}

export function createMacaron(color = 0xffb6c1) {
  const group = new THREE.Group();

  const topShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color, roughness: 0.35 })
  );
  topShell.position.y = 0.06;
  group.add(topShell);

  const bottomShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color, roughness: 0.35 })
  );
  bottomShell.position.y = 0.04;
  group.add(bottomShell);

  const filling = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.025, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  filling.position.y = 0.05;
  group.add(filling);

  return group;
}

export function createCookie(color = COLORS.cookieGold) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.045, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true })
  );
  group.add(body);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const r = 0.05 + Math.random() * 0.03;
    const chip = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 5, 5),
      new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.6 })
    );
    chip.position.set(Math.cos(a) * r, 0.028, Math.sin(a) * r);
    group.add(chip);
  }
  return group;
}
