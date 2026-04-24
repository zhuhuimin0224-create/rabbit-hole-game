import * as THREE from 'three';
import { COLORS } from '../constants.js';

export function createQueenOfHearts() {
  const group = new THREE.Group();

  const skirt = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 1.0, 12),
    new THREE.MeshStandardMaterial({ color: COLORS.queenRed, roughness: 0.5, flatShading: true })
  );
  skirt.position.y = 0.5;
  group.add(skirt);

  const trimC = document.createElement('canvas');
  trimC.width = 128; trimC.height = 32;
  const tctx = trimC.getContext('2d');
  tctx.fillStyle = '#ffd700';
  tctx.fillRect(0, 0, 128, 8);
  for (let i = 0; i < 8; i++) {
    tctx.fillStyle = '#ffffff';
    tctx.font = 'bold 18px serif';
    tctx.fillText('♥', i * 16, 26);
  }
  const trimTex = new THREE.CanvasTexture(trimC);

  const trimRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.06, 12, 1, true),
    new THREE.MeshStandardMaterial({ map: trimTex, side: THREE.DoubleSide })
  );
  trimRing.position.y = 0.03;
  group.add(trimRing);

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.35, 0.4, 10),
    new THREE.MeshStandardMaterial({ color: COLORS.queenRed, roughness: 0.5 })
  );
  torso.position.y = 1.2;
  group.add(torso);

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.04, 8, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.4;
  group.add(collar);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd1a3, roughness: 0.6 })
  );
  head.position.y = 1.6;
  group.add(head);

  for (let side = -1; side <= 1; side += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    eye.position.set(side * 0.07, 1.63, 0.15);
    group.add(eye);
  }

  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.01, 6, 8, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 })
  );
  mouth.position.set(0, 1.54, 0.15);
  mouth.rotation.x = 0.3;
  group.add(mouth);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 0.12, 8),
    new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.8, roughness: 0.2 })
  );
  crown.position.y = 1.82;
  group.add(crown);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const point = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.06, 4),
      new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.8, roughness: 0.2 })
    );
    point.position.set(
      Math.cos(a) * 0.12,
      1.91,
      Math.sin(a) * 0.12
    );
    group.add(point);

    if (i % 2 === 0) {
      const gem = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 6, 6),
        new THREE.MeshStandardMaterial({ color: COLORS.queenRed, roughness: 0.2, metalness: 0.3 })
      );
      gem.position.set(
        Math.cos(a) * 0.14,
        1.84,
        Math.sin(a) * 0.14
      );
      group.add(gem);
    }
  }

  const scepter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.7, 6),
    new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.7, roughness: 0.2 })
  );
  scepter.position.set(0.35, 1.0, 0);
  scepter.rotation.z = -0.3;
  group.add(scepter);

  const heartGeom = new THREE.Shape();
  heartGeom.moveTo(0, 0);
  heartGeom.bezierCurveTo(0, -0.04, -0.06, -0.04, -0.06, 0);
  heartGeom.bezierCurveTo(-0.06, 0.03, 0, 0.06, 0, 0.08);
  heartGeom.bezierCurveTo(0, 0.06, 0.06, 0.03, 0.06, 0);
  heartGeom.bezierCurveTo(0.06, -0.04, 0, -0.04, 0, 0);

  const scepterTop = new THREE.Mesh(
    new THREE.ExtrudeGeometry(heartGeom, {
      depth: 0.02, bevelEnabled: true,
      bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2,
    }),
    new THREE.MeshStandardMaterial({ color: COLORS.queenRed, metalness: 0.3, roughness: 0.3 })
  );
  scepterTop.position.set(0.5, 1.3, -0.01);
  scepterTop.rotation.z = -0.3;
  scepterTop.scale.set(1.5, 1.5, 1.5);
  group.add(scepterTop);

  return group;
}
