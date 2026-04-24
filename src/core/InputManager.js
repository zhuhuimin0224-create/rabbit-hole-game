import * as THREE from 'three';

export class InputManager {
  constructor(canvas) {
    this._dir = { x: 0, z: 0 };
    this._touchActive = false;
    this._touchOrigin = { x: 0, y: 0 };
    this._mouseActive = false;
    this._mouseOrigin = { x: 0, y: 0 };
    this._keys = new Set();
    this._sens = 0.008;
    this._dead = 5;

    canvas.addEventListener('touchstart', e => this._onTS(e), { passive: false });
    canvas.addEventListener('touchmove', e => this._onTM(e), { passive: false });
    canvas.addEventListener('touchend', () => this._onTE());
    canvas.addEventListener('touchcancel', () => this._onTE());
    canvas.addEventListener('mousedown', e => this._onMD(e));
    canvas.addEventListener('mousemove', e => this._onMM(e));
    canvas.addEventListener('mouseup', () => this._onMU());
    window.addEventListener('keydown', e => this._keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', e => this._keys.delete(e.key.toLowerCase()));
  }

  _onTS(e) {
    e.preventDefault();
    const t = e.touches[0];
    if (t.clientY > window.innerHeight * 0.3) {
      this._touchActive = true;
      this._touchOrigin = { x: t.clientX, y: t.clientY };
      this._dir = { x: 0, z: 0 };
    }
  }
  _onTM(e) {
    e.preventDefault();
    if (!this._touchActive) return;
    const t = e.touches[0];
    const dx = t.clientX - this._touchOrigin.x;
    const dy = t.clientY - this._touchOrigin.y;
    if (Math.sqrt(dx * dx + dy * dy) < this._dead) { this._dir = { x: 0, z: 0 }; return; }
    this._dir.x = THREE.MathUtils.clamp(dx * this._sens, -1, 1);
    this._dir.z = THREE.MathUtils.clamp(dy * this._sens, -1, 1);
  }
  _onTE() { this._touchActive = false; this._dir = { x: 0, z: 0 }; }

  _onMD(e) { this._mouseActive = true; this._mouseOrigin = { x: e.clientX, y: e.clientY }; this._dir = { x: 0, z: 0 }; }
  _onMM(e) {
    if (!this._mouseActive) return;
    const dx = e.clientX - this._mouseOrigin.x;
    const dy = e.clientY - this._mouseOrigin.y;
    if (Math.sqrt(dx * dx + dy * dy) < this._dead) { this._dir = { x: 0, z: 0 }; return; }
    this._dir.x = THREE.MathUtils.clamp(dx * this._sens, -1, 1);
    this._dir.z = THREE.MathUtils.clamp(dy * this._sens, -1, 1);
  }
  _onMU() { this._mouseActive = false; this._dir = { x: 0, z: 0 }; }

  getDirection() {
    let dx = this._dir.x, dz = this._dir.z;
    if (this._keys.has('w') || this._keys.has('arrowup')) dz -= 1;
    if (this._keys.has('s') || this._keys.has('arrowdown')) dz += 1;
    if (this._keys.has('a') || this._keys.has('arrowleft')) dx -= 1;
    if (this._keys.has('d') || this._keys.has('arrowright')) dx += 1;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 1) { dx /= len; dz /= len; }
    return { x: dx, z: dz };
  }
}
