import * as THREE from 'three';

export class Item {
  constructor(mesh, data) {
    this.mesh = mesh;
    this.data = data;
    this.isSwallowing = false;
    this.isSwallowed = false;
    this.swallowTimer = 0;
    this.swallowPhase = 'tip';
    this.swallowDir = new THREE.Vector3();
    this.groundY = mesh.position.y;
  }

  get position() { return this.mesh.position; }
}
