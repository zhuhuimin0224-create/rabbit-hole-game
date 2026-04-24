import * as THREE from 'three';
import { COLORS } from '../constants.js';

export function createBomb() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 10),
    new THREE.MeshStandardMaterial({ color: COLORS.bombBlack, roughness: 0.4, metalness: 0.2 })
  );
  body.position.y = 0.2;
  group.add(body);

  const skullC = document.createElement('canvas');
  skullC.width = 64; skullC.height = 64;
  const sctx = skullC.getContext('2d');
  sctx.fillStyle = '#ffffff';
  sctx.beginPath();
  sctx.arc(32, 28, 16, 0, Math.PI * 2);
  sctx.fill();
  sctx.fillRect(24, 38, 16, 10);
  sctx.fillStyle = '#222222';
  sctx.beginPath();
  sctx.arc(26, 26, 4, 0, Math.PI * 2);
  sctx.fill();
  sctx.beginPath();
  sctx.arc(38, 26, 4, 0, Math.PI * 2);
  sctx.fill();
  sctx.fillRect(28, 32, 3, 3);
  sctx.fillRect(33, 32, 3, 3);
  for (let i = 0; i < 4; i++) {
    sctx.fillRect(24 + i * 4, 42, 2, 6);
  }
  const skullTex = new THREE.CanvasTexture(skullC);

  const skull = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.18),
    new THREE.MeshBasicMaterial({ map: skullTex, transparent: true })
  );
  skull.position.set(0, 0.2, 0.201);
  group.add(skull);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.06, 8),
    new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.3 })
  );
  nozzle.position.y = 0.4;
  group.add(nozzle);

  const fuseCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.43, 0),
    new THREE.Vector3(0.05, 0.5, 0),
    new THREE.Vector3(-0.03, 0.55, 0.02),
    new THREE.Vector3(0.02, 0.58, 0)
  );
  const fuse = new THREE.Mesh(
    new THREE.TubeGeometry(fuseCurve, 8, 0.008, 6, false),
    new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 })
  );
  group.add(fuse);

  const spark = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 6, 6),
    new THREE.MeshStandardMaterial({
      color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 1.0, roughness: 0.3,
    })
  );
  spark.position.set(0.02, 0.58, 0);
  spark.name = 'spark';
  group.add(spark);

  const warningRing = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.28, 24),
    new THREE.MeshBasicMaterial({
      color: COLORS.warningRed, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
    })
  );
  warningRing.rotation.x = -Math.PI / 2;
  warningRing.position.y = 0.005;
  warningRing.name = 'warningRing';
  group.add(warningRing);

  return group;
}
