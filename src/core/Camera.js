import * as THREE from 'three';
import { CAMERA_OFFSET, CAMERA_LERP } from '../constants.js';

export class Camera {
  constructor(aspect) {
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 200);

    this.camera.position.set(
      CAMERA_OFFSET.x,
      CAMERA_OFFSET.y,
      CAMERA_OFFSET.z
    );

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this._fixedQuaternion = this.camera.quaternion.clone();

    this._targetPos = new THREE.Vector3();
    this._smoothPos = null;
    this._holeRadius = 0.20;
  }

  update(holePos, dt, holeRadius) {
    if (holeRadius !== undefined) this._holeRadius = holeRadius;

    const zoomY = 3.5 + this._holeRadius * 3.5;
    const zoomZ = CAMERA_OFFSET.z * (zoomY / CAMERA_OFFSET.y);

    this._targetPos.set(
      holePos.x + CAMERA_OFFSET.x,
      zoomY,
      holePos.z + zoomZ
    );

    if (!this._smoothPos) {
      this._smoothPos = this._targetPos.clone();
    }

    const f = 1 - Math.pow(1 - CAMERA_LERP, dt * 60);
    this._smoothPos.lerp(this._targetPos, f);
    this.camera.position.copy(this._smoothPos);

    this.camera.quaternion.copy(this._fixedQuaternion);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
