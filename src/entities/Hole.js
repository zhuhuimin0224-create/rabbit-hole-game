import * as THREE from 'three';
import {
  HOLE_BASE_RADIUS, HOLE_SPEED, HOLE_SPEED_DECAY,
  GROWTH_THRESHOLDS, LEVEL_RADIUS, XP_VALUES, BOMB_SHRINK,
} from '../constants.js';

export class Hole {
  constructor() {
    this.radius = HOLE_BASE_RADIUS;
    this._targetRadius = HOLE_BASE_RADIUS;
    this.level = 1;
    this.itemsEaten = 0;
    this.totalXP = 0;
    this.group = new THREE.Group();
    this.position = this.group.position;
    this._bounds = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
    this._swirlAngle = 0;
    this._pulseTime = 0;
    this._velX = 0;
    this._velZ = 0;

    this._buildVisuals();
    this._updateScale();
  }

  _buildVisuals() {
    this._disc = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({ color: 0x1a0a3e })
    );
    this._disc.rotation.x = -Math.PI / 2;
    this._disc.position.y = 0.02;
    this.group.add(this._disc);

    this._swirlCanvas = document.createElement('canvas');
    this._swirlCanvas.width = 256;
    this._swirlCanvas.height = 256;
    this._swirlCtx = this._swirlCanvas.getContext('2d');
    this._swirlTex = new THREE.CanvasTexture(this._swirlCanvas);
    this._swirl = new THREE.Mesh(
      new THREE.CircleGeometry(0.95, 64),
      new THREE.MeshBasicMaterial({ map: this._swirlTex, transparent: true, opacity: 0.70 })
    );
    this._swirl.rotation.x = -Math.PI / 2;
    this._swirl.position.y = 0.025;
    this.group.add(this._swirl);

    this._rimInner = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 0.94, 64),
      new THREE.MeshStandardMaterial({
        color: 0x4466aa, metalness: 0.9, roughness: 0.1,
        emissive: 0x223366, emissiveIntensity: 0.5,
      })
    );
    this._rimInner.rotation.x = -Math.PI / 2;
    this._rimInner.position.y = 0.03;
    this.group.add(this._rimInner);

    this._rimOuter = new THREE.Mesh(
      new THREE.RingGeometry(0.94, 1.0, 64),
      new THREE.MeshStandardMaterial({
        color: 0xdaa520, metalness: 0.85, roughness: 0.15,
        emissive: 0x886611, emissiveIntensity: 0.4,
      })
    );
    this._rimOuter.rotation.x = -Math.PI / 2;
    this._rimOuter.position.y = 0.035;
    this.group.add(this._rimOuter);

    this._rimGlow = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.12, 64),
      new THREE.MeshBasicMaterial({
        color: 0xeebb44, transparent: true, opacity: 0.2,
      })
    );
    this._rimGlow.rotation.x = -Math.PI / 2;
    this._rimGlow.position.y = 0.015;
    this.group.add(this._rimGlow);

    this._teethCount = 8;
    this._teeth = [];
    for (let i = 0; i < this._teethCount; i++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.1, 4),
        new THREE.MeshStandardMaterial({
          color: 0xeeeeff, roughness: 0.3, metalness: 0.2,
        })
      );
      tooth.rotation.x = -Math.PI / 2;
      this.group.add(tooth);
      this._teeth.push(tooth);
    }
    this._updateTeeth();

    this._particles = [];
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 6, 6),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x8866ff : 0x44aaff,
          transparent: true, opacity: 0.6,
        })
      );
      p.position.y = 0.04;
      this.group.add(p);
      this._particles.push({
        mesh: p,
        angle: (i / 12) * Math.PI * 2,
        speed: 1.5 + Math.random() * 1.0,
        radiusOffset: 0.9 + Math.random() * 0.15,
      });
    }
  }

  _updateTeeth() {
    for (let i = 0; i < this._teethCount; i++) {
      const angle = (i / this._teethCount) * Math.PI * 2;
      const r = this.radius * 0.92;
      this._teeth[i].position.set(
        Math.cos(angle) * r,
        0.04,
        Math.sin(angle) * r
      );
      this._teeth[i].rotation.y = -angle;
      const s = this.radius * 0.6;
      this._teeth[i].scale.set(s, s, s);
    }
  }

  setMapBounds(minX, maxX, minZ, maxZ) {
    this._bounds = { minX, maxX, minZ, maxZ };
  }

  move(dx, dz, dt) {
    const speed = HOLE_SPEED / (0.7 + this.radius * HOLE_SPEED_DECAY);
    this.position.x += dx * speed * dt;
    this.position.z += dz * speed * dt;
    this.position.x = THREE.MathUtils.clamp(
      this.position.x, this._bounds.minX + this.radius, this._bounds.maxX - this.radius
    );
    this.position.z = THREE.MathUtils.clamp(
      this.position.z, this._bounds.minZ + this.radius, this._bounds.maxZ - this.radius
    );
  }

  canEat(itemRadius) {
    return itemRadius < this.radius * 0.85;
  }

  canPartiallyEat(itemRadius) {
    return itemRadius < this.radius * 1.15 && itemRadius >= this.radius * 0.85;
  }

  eat(sizeCategory) {
    this.itemsEaten++;
    const xp = XP_VALUES[sizeCategory] || 1;
    this.totalXP += xp;
    for (let i = GROWTH_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this.totalXP >= GROWTH_THRESHOLDS[i] && this.level < i + 1) {
        this.level = i + 1;
        this._targetRadius = LEVEL_RADIUS[i];
        break;
      }
    }
  }

  shrink() {
    this.radius = Math.max(HOLE_BASE_RADIUS, this.radius - BOMB_SHRINK);
    this._targetRadius = this.radius;
    for (let i = LEVEL_RADIUS.length - 1; i >= 0; i--) {
      if (this.radius >= LEVEL_RADIUS[i] * 0.95) {
        this.level = i + 1;
        break;
      }
    }
    this._updateScale();
    this._updateTeeth();
  }

  update(dt) {
    if (Math.abs(this.radius - this._targetRadius) > 0.001) {
      this.radius += (this._targetRadius - this.radius) * 3 * dt;
      this._updateScale();
      this._updateTeeth();
    }

    this._pulseTime += dt;
    const pulse = 1 + Math.sin(this._pulseTime * 2.5) * 0.04;
    this._rimGlow.scale.set(this.radius * pulse, this.radius * pulse, 1);

    for (const p of this._particles) {
      p.angle += p.speed * dt;
      const r = this.radius * p.radiusOffset;
      p.mesh.position.x = Math.cos(p.angle) * r;
      p.mesh.position.z = Math.sin(p.angle) * r;
      p.mesh.material.opacity = 0.3 + Math.sin(p.angle * 2) * 0.3;
    }

    this._swirlAngle += dt * 1.8;
    this._drawSwirl();
  }

  _updateScale() {
    this._disc.scale.set(this.radius, this.radius, 1);
    this._swirl.scale.set(this.radius, this.radius, 1);
    this._rimInner.scale.set(this.radius, this.radius, 1);
    this._rimOuter.scale.set(this.radius, this.radius, 1);
    this._rimGlow.scale.set(this.radius, this.radius, 1);
  }

  _drawSwirl() {
    const ctx = this._swirlCtx;
    const w = 256, cx = 128;
    ctx.clearRect(0, 0, w, w);

    const bg = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    bg.addColorStop(0, '#1a0a40');
    bg.addColorStop(0.3, '#200d50');
    bg.addColorStop(0.6, '#2a1865');
    bg.addColorStop(0.85, '#352078');
    bg.addColorStop(1, 'rgba(30, 21, 96, 0)');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cx, cx, 0, Math.PI * 2);
    ctx.fill();

    for (let a = 0; a < 6; a++) {
      const base = this._swirlAngle + (a * Math.PI * 2) / 6;
      const hue = 240 + a * 15;
      ctx.strokeStyle = `hsla(${hue}, 70%, 65%, ${0.25 + a * 0.04})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let r = 4; r < cx - 8; r += 2) {
        const angle = base + r * 0.08;
        const x = cx + Math.cos(angle) * r;
        const y = cx + Math.sin(angle) * r;
        r <= 6 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let a = 0; a < 3; a++) {
      const base = -this._swirlAngle * 0.7 + (a * Math.PI * 2) / 3;
      ctx.strokeStyle = `rgba(200, 150, 255, ${0.15 + a * 0.03})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let r = 10; r < cx - 15; r += 2.5) {
        const angle = base + r * 0.06;
        const x = cx + Math.cos(angle) * r;
        const y = cx + Math.sin(angle) * r;
        r <= 12.5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const cg = ctx.createRadialGradient(cx, cx, 0, cx, cx, 25);
    cg.addColorStop(0, 'rgba(140, 100, 255, 0.65)');
    cg.addColorStop(0.5, 'rgba(80, 40, 200, 0.2)');
    cg.addColorStop(1, 'rgba(80, 40, 200, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cx, 25, 0, Math.PI * 2);
    ctx.fill();

    const starCount = 20;
    for (let i = 0; i < starCount; i++) {
      const sa = this._swirlAngle * 0.3 + (i / starCount) * Math.PI * 2;
      const sr = 15 + (i * 5.7) % (cx - 20);
      const sx = cx + Math.cos(sa) * sr;
      const sy = cx + Math.sin(sa) * sr;
      const brightness = 0.45 + Math.sin(this._swirlAngle * 3 + i) * 0.35;
      ctx.fillStyle = `rgba(200, 180, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    this._swirlTex.needsUpdate = true;
  }

  reset() {
    this.radius = HOLE_BASE_RADIUS;
    this._targetRadius = HOLE_BASE_RADIUS;
    this.level = 1;
    this.itemsEaten = 0;
    this.totalXP = 0;
    this.position.set(0, 0, 0);
    this._velX = 0;
    this._velZ = 0;
    this._updateScale();
    this._updateTeeth();
  }
}
