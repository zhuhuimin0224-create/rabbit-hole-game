import * as THREE from 'three';
import { COLORS } from '../constants.js';

export function createTeaCup(color = COLORS.chinaWhite) {
  const group = new THREE.Group();

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.13, 0.2, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.05 })
  );
  cup.position.y = 0.1;
  group.add(cup);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.012, 8, 24),
    new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.8, roughness: 0.15 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.2;
  group.add(rim);

  const saucer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.22, 0.025, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.25 })
  );
  saucer.position.y = -0.01;
  group.add(saucer);

  const saucerRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.008, 6, 24),
    new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.8, roughness: 0.15 })
  );
  saucerRim.rotation.x = Math.PI / 2;
  saucerRim.position.y = 0.01;
  group.add(saucerRim);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.065, 0.018, 8, 12, Math.PI),
    new THREE.MeshStandardMaterial({ color, roughness: 0.25 })
  );
  handle.position.set(0.22, 0.1, 0);
  handle.rotation.y = Math.PI / 2;
  group.add(handle);

  const tea = new THREE.Mesh(
    new THREE.CircleGeometry(0.16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8b6914, roughness: 0.2, transparent: true, opacity: 0.8,
    })
  );
  tea.rotation.x = -Math.PI / 2;
  tea.position.y = 0.18;
  group.add(tea);

  return group;
}

export function createPocketWatch(color = COLORS.gold) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.05, 24),
    new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.12 })
  );
  body.rotation.x = Math.PI / 2;
  group.add(body);

  const faceC = document.createElement('canvas');
  faceC.width = 128; faceC.height = 128;
  const fctx = faceC.getContext('2d');
  fctx.fillStyle = '#fffff0';
  fctx.beginPath(); fctx.arc(64, 64, 60, 0, Math.PI * 2); fctx.fill();
  fctx.strokeStyle = '#888'; fctx.lineWidth = 2; fctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    fctx.fillStyle = '#333'; fctx.font = 'bold 14px serif'; fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
    fctx.fillText(i === 0 ? '12' : String(i), 64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46);
  }
  fctx.strokeStyle = '#222'; fctx.lineWidth = 3;
  fctx.beginPath(); fctx.moveTo(64, 64); fctx.lineTo(64, 28); fctx.stroke();
  fctx.lineWidth = 2;
  fctx.beginPath(); fctx.moveTo(64, 64); fctx.lineTo(88, 50); fctx.stroke();
  fctx.fillStyle = '#cc3333'; fctx.beginPath(); fctx.arc(64, 64, 3, 0, Math.PI * 2); fctx.fill();

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.16, 24),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(faceC), roughness: 0.35 })
  );
  face.position.z = 0.026;
  group.add(face);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.04, 8),
    new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.12 })
  );
  crown.position.y = 0.19;
  group.add(crown);

  const loop = new THREE.Mesh(
    new THREE.TorusGeometry(0.03, 0.008, 6, 12),
    new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.15 })
  );
  loop.position.y = 0.22;
  group.add(loop);

  return group;
}

export function createFlamingo(color = COLORS.flamingoPink) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, flatShading: true })
  );
  body.scale.set(0.8, 1, 0.7);
  body.position.y = 0.28;
  group.add(body);

  const neckPts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const y = 0.35 + t * 0.45;
    const z = Math.sin(t * Math.PI * 0.8) * 0.08;
    neckPts.push(new THREE.Vector3(0, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(neckPts);
  const neck = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 10, 0.028, 8, false),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  group.add(neck);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 10, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  );
  head.position.set(0, 0.8, 0.06);
  group.add(head);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.09, 6),
    new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.4 })
  );
  beak.position.set(0, 0.78, 0.1);
  beak.rotation.x = Math.PI / 2.5;
  group.add(beak);

  for (let side = -1; side <= 1; side += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    eye.position.set(side * 0.04, 0.82, 0.07);
    group.add(eye);
  }

  for (let i = -1; i <= 1; i += 2) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.012, 0.28, 6),
      new THREE.MeshStandardMaterial({ color: 0xff7f7f, roughness: 0.5 })
    );
    leg.position.set(i * 0.04, 0, 0);
    group.add(leg);
  }

  return group;
}

export function createHedgehog(color = COLORS.hedgehogBrown) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, flatShading: true })
  );
  body.scale.set(1.2, 0.75, 1);
  body.position.y = 0.13;
  group.add(body);

  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xfae6c8, roughness: 0.6 })
  );
  belly.position.set(0, 0.08, 0.08);
  belly.scale.set(1, 0.7, 1);
  group.add(belly);

  for (let i = 0; i < 24; i++) {
    const theta = Math.random() * Math.PI * 0.5 + 0.3;
    const phi = Math.random() * Math.PI * 2;
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.09, 4),
      new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 })
    );
    const bx = Math.sin(theta) * Math.cos(phi) * 0.17;
    const by = Math.cos(theta) * 0.12 + 0.13;
    const bz = Math.sin(theta) * Math.sin(phi) * 0.16;
    spike.position.set(bx, by, bz);
    spike.lookAt(new THREE.Vector3(bx * 2, by + 0.15, bz * 2));
    group.add(spike);
  }

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 })
  );
  nose.position.set(0, 0.11, 0.2);
  group.add(nose);

  for (let side = -1; side <= 1; side += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    eye.position.set(side * 0.065, 0.17, 0.13);
    group.add(eye);
  }

  return group;
}

export function createCardSoldier(color = COLORS.cardRed) {
  const group = new THREE.Group();
  const isRed = color === COLORS.cardRed || color === COLORS.queenRed;
  const suitColor = isRed ? 0xcc3333 : 0x333333;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.48, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.35 })
  );
  body.position.y = 0.28;
  group.add(body);

  const suitMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.06, isRed ? 12 : 3),
    new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.3, side: THREE.DoubleSide })
  );
  suitMesh.position.set(0, 0.28, 0.027);
  group.add(suitMesh);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd1a3, roughness: 0.5 })
  );
  head.position.y = 0.58;
  group.add(head);

  const helmet = new THREE.Mesh(
    new THREE.ConeGeometry(0.065, 0.09, 8),
    new THREE.MeshStandardMaterial({ color: suitColor, metalness: 0.5, roughness: 0.3 })
  );
  helmet.position.y = 0.66;
  group.add(helmet);

  const spear = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6 })
  );
  spear.position.set(0.19, 0.32, 0);
  group.add(spear);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.028, 0.07, 4),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.25 })
  );
  tip.position.set(0.19, 0.63, 0);
  group.add(tip);

  return group;
}

export function createTopHat(color = 0x222222) {
  const group = new THREE.Group();

  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.025, 20),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  group.add(brim);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.14, 0.32, 20),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  crown.position.y = 0.17;
  group.add(crown);

  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.145, 0.145, 0.04, 20),
    new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.7, roughness: 0.2 })
  );
  band.position.y = 0.04;
  group.add(band);

  const tag = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.05, 0.005),
    new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.6 })
  );
  tag.position.set(0.14, 0.06, 0);
  tag.rotation.z = -0.2;
  group.add(tag);

  return group;
}
