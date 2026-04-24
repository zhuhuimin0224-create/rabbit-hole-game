import * as THREE from 'three';

export class InputManager {
  constructor(canvas) {
    this._dir = { x: 0, z: 0 };
    this._touchActive = false;
    this._touchOrigin = { x: 0, y: 0 };
    this._mouseActive = false;
    this._mouseOrigin = { x: 0, y: 0 };
    this._keys = new Set();

    this._touchDead = 14;
    this._touchMaxPx = 150;

    this._mouseDead = 12;
    this._mouseMaxPx = 160;

    this._joystick = null;
    this._joystickKnob = null;
    this._joystickArrows = null;
    this._buildJoystick();

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

  _buildJoystick() {
    const base = document.createElement('div');
    base.style.cssText = `
      position:fixed;z-index:40;pointer-events:none;display:none;
      width:120px;height:120px;border-radius:50%;
      border:2px solid rgba(255,255,255,0.25);
      background:radial-gradient(circle,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 70%,transparent 100%);
      transform:translate(-50%,-50%);
    `;

    const arrows = document.createElement('div');
    arrows.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    const tri = (t, l, r, b, dir) => {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;width:0;height:0;${t}${l}${r}${b}`;
      if (dir === 'up') d.style.cssText += 'border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:8px solid rgba(255,255,255,0.22);';
      if (dir === 'down') d.style.cssText += 'border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid rgba(255,255,255,0.22);';
      if (dir === 'left') d.style.cssText += 'border-top:6px solid transparent;border-bottom:6px solid transparent;border-right:8px solid rgba(255,255,255,0.22);';
      if (dir === 'right') d.style.cssText += 'border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:8px solid rgba(255,255,255,0.22);';
      return d;
    };
    arrows.appendChild(tri('top:8px;', 'left:50%;transform:translateX(-50%);', '', '', 'up'));
    arrows.appendChild(tri('', 'left:50%;transform:translateX(-50%);', '', 'bottom:8px;', 'down'));
    arrows.appendChild(tri('top:50%;transform:translateY(-50%);', 'left:10px;', '', '', 'left'));
    arrows.appendChild(tri('top:50%;transform:translateY(-50%);', '', 'right:10px;', '', 'right'));
    base.appendChild(arrows);

    const knob = document.createElement('div');
    knob.style.cssText = `
      position:absolute;top:50%;left:50%;
      width:40px;height:40px;border-radius:50%;
      background:radial-gradient(circle,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0.1) 100%);
      border:1.5px solid rgba(255,255,255,0.3);
      transform:translate(-50%,-50%);
      transition:width 0.1s,height 0.1s;
    `;
    base.appendChild(knob);

    document.body.appendChild(base);
    this._joystick = base;
    this._joystickKnob = knob;
    this._joystickArrows = arrows;
  }

  _showJoystick(cx, cy) {
    this._joystick.style.left = cx + 'px';
    this._joystick.style.top = cy + 'px';
    this._joystick.style.display = 'block';
    this._joystickKnob.style.left = '50%';
    this._joystickKnob.style.top = '50%';
  }

  _moveJoystickKnob(dx, dy) {
    const maxR = 40;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, maxR);
    const nx = dist > 0 ? (dx / dist) * clamped : 0;
    const ny = dist > 0 ? (dy / dist) * clamped : 0;
    this._joystickKnob.style.left = `calc(50% + ${nx}px)`;
    this._joystickKnob.style.top = `calc(50% + ${ny}px)`;
  }

  _hideJoystick() {
    this._joystick.style.display = 'none';
  }

  _onTS(e) {
    e.preventDefault();
    const t = e.touches[0];
    if (t.clientY > window.innerHeight * 0.25) {
      this._touchActive = true;
      this._touchOrigin = { x: t.clientX, y: t.clientY };
      this._dir = { x: 0, z: 0 };
      this._showJoystick(t.clientX, t.clientY);
    }
  }
  _onTM(e) {
    e.preventDefault();
    if (!this._touchActive) return;
    const t = e.touches[0];
    let dx = t.clientX - this._touchOrigin.x;
    let dy = t.clientY - this._touchOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this._moveJoystickKnob(dx, dy);

    if (dist < this._touchDead) { this._dir = { x: 0, z: 0 }; return; }

    this._dir.x = dx / dist;
    this._dir.z = dy / dist;

    if (dist > this._touchMaxPx * 1.3) {
      const pull = dist - this._touchMaxPx * 1.3;
      this._touchOrigin.x += (dx / dist) * pull * 0.4;
      this._touchOrigin.y += (dy / dist) * pull * 0.4;
      this._joystick.style.left = this._touchOrigin.x + 'px';
      this._joystick.style.top = this._touchOrigin.y + 'px';
    }
  }
  _onTE() {
    this._touchActive = false;
    this._dir = { x: 0, z: 0 };
    this._hideJoystick();
  }

  _onMD(e) { this._mouseActive = true; this._mouseOrigin = { x: e.clientX, y: e.clientY }; this._dir = { x: 0, z: 0 }; }
  _onMM(e) {
    if (!this._mouseActive) return;
    let dx = e.clientX - this._mouseOrigin.x;
    let dy = e.clientY - this._mouseOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this._mouseDead) { this._dir = { x: 0, z: 0 }; return; }

    this._dir.x = dx / dist;
    this._dir.z = dy / dist;

    if (dist > this._mouseMaxPx * 1.3) {
      const pull = dist - this._mouseMaxPx * 1.3;
      this._mouseOrigin.x += (dx / dist) * pull * 0.4;
      this._mouseOrigin.y += (dy / dist) * pull * 0.4;
    }
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
