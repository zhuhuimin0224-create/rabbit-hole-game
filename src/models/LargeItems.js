import * as THREE from 'three';
import { COLORS } from '../constants.js';

export function createCheshireCat(color = COLORS.cheshirePurple) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 14, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, flatShading: true })
  );
  body.scale.set(1.1, 0.8, 0.9);
  body.position.y = 0.4;
  group.add(body);

  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.42 * (1 - i * 0.02), 0.02, 6, 24),
      new THREE.MeshStandardMaterial({ color: 0x7d3c98, roughness: 0.5 })
    );
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = 0.2 + i * 0.1;
    stripe.scale.set(1.1, 0.9, 1);
    group.add(stripe);
  }

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, flatShading: true })
  );
  head.scale.set(1.15, 0.95, 1);
  head.position.y = 0.8;
  group.add(head);

  for (let side = -1; side <= 1; side += 2) {
    const ear = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.14, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
    );
    ear.position.set(side * 0.17, 1.0, 0);
    ear.rotation.z = side * -0.25;
    group.add(ear);

    const innerEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.08, 6),
      new THREE.MeshStandardMaterial({ color: 0xdda0dd, roughness: 0.5 })
    );
    innerEar.position.set(side * 0.17, 0.98, 0.02);
    innerEar.rotation.z = side * -0.25;
    group.add(innerEar);

    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0x44ff88, emissive: 0x22cc44, emissiveIntensity: 0.6, roughness: 0.2,
      })
    );
    eye.position.set(side * 0.1, 0.83, 0.2);
    group.add(eye);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    pupil.position.set(side * 0.1, 0.83, 0.245);
    group.add(pupil);
  }

  const smileGeo = new THREE.TorusGeometry(0.1, 0.015, 6, 16, Math.PI);
  const smile = new THREE.Mesh(
    smileGeo,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  );
  smile.position.set(0, 0.72, 0.22);
  smile.rotation.x = -0.2;
  group.add(smile);

  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.02, 0.5, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  tail.position.set(-0.35, 0.5, -0.1);
  tail.rotation.z = 0.7;
  tail.rotation.x = -0.3;
  group.add(tail);

  return group;
}

export function createTeaTable(color = COLORS.woodBrown) {
  const group = new THREE.Group();

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 0.05, 20),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  top.position.y = 0.5;
  group.add(top);

  const cloth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.67, 0.6, 0.03, 20),
    new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.7 })
  );
  cloth.position.y = 0.52;
  group.add(cloth);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.045, 0.48, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    );
    leg.position.set(Math.cos(a) * 0.4, 0.24, Math.sin(a) * 0.4);
    group.add(leg);
  }

  const potBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf0f0ff, roughness: 0.25 })
  );
  potBody.scale.set(1, 0.85, 1);
  potBody.position.set(-0.15, 0.62, 0);
  group.add(potBody);

  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45),
    new THREE.MeshStandardMaterial({ color: 0xf0f0ff, roughness: 0.25 })
  );
  lid.position.set(-0.15, 0.7, 0);
  group.add(lid);

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 8, 8),
    new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.7, roughness: 0.2 })
  );
  knob.position.set(-0.15, 0.77, 0);
  group.add(knob);

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.04, 0.06, 10),
    new THREE.MeshStandardMaterial({ color: 0xf0f0ff, roughness: 0.25 })
  );
  cup.position.set(0.2, 0.56, 0.1);
  group.add(cup);

  return group;
}

export function createGiantMushroom(capColor = COLORS.mushroomCap) {
  const group = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 0.7, 12),
    new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.6, flatShading: true })
  );
  stem.position.y = 0.35;
  group.add(stem);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.45, flatShading: true })
  );
  cap.position.y = 0.72;
  group.add(cap);

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.random() * 0.2;
    const r = 0.28 + Math.random() * 0.18;
    const spotSize = 0.04 + Math.random() * 0.03;
    const spot = new THREE.Mesh(
      new THREE.CircleGeometry(spotSize, 10),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, side: THREE.DoubleSide })
    );
    spot.position.set(Math.cos(a) * r, 0.82 + Math.random() * 0.1, Math.sin(a) * r);
    spot.lookAt(new THREE.Vector3(0, 1.2, 0));
    group.add(spot);
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.02, 6, 16),
    new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.6, transparent: true, opacity: 0.7 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.6;
  group.add(ring);

  return group;
}

export function createRoseBush(color = COLORS.roseRed) {
  const group = new THREE.Group();

  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 12, 10),
    new THREE.MeshStandardMaterial({ color: COLORS.gardenGreen, roughness: 0.7, flatShading: true })
  );
  bush.scale.set(1.2, 0.85, 1);
  bush.position.y = 0.4;
  group.add(bush);

  const roseColors = [COLORS.roseRed, 0xff69b4, COLORS.roseWhite, 0xff4444, 0xffaacc, COLORS.roseRed];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const elev = 0.3 + Math.random() * 0.3;
    const r = 0.4 + Math.random() * 0.12;

    const rc = roseColors[i % roseColors.length];

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 6),
      new THREE.MeshStandardMaterial({ color: rc, roughness: 0.4 })
    );
    center.position.set(Math.cos(a) * r, elev + 0.15, Math.sin(a) * r);
    group.add(center);

    for (let p = 0; p < 5; p++) {
      const pa = (p / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 6, 4),
        new THREE.MeshStandardMaterial({ color: rc, roughness: 0.4, flatShading: true })
      );
      petal.position.set(
        Math.cos(a) * r + Math.cos(pa) * 0.035,
        elev + 0.12,
        Math.sin(a) * r + Math.sin(pa) * 0.035
      );
      group.add(petal);
    }
  }

  return group;
}
