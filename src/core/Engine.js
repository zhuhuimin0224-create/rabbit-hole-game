import * as THREE from 'three';
import { COLORS } from '../constants.js';

export class Engine {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x5ba3c9);
    this.renderer.sortObjects = true;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x5ba3c9, 30, 60);

    this._resizeCbs = [];
    this._setupLighting();
    window.addEventListener('resize', () => this._handleResize());
  }

  _setupLighting() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    this.scene.add(new THREE.HemisphereLight(0x87ceeb, 0x98fb98, 0.4));
    const dir = new THREE.DirectionalLight(0xfff5e6, 0.9);
    dir.position.set(8, 18, 8);
    this.scene.add(dir);
  }

  _handleResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this._resizeCbs.forEach(cb => cb());
  }

  onResize(cb) { this._resizeCbs.push(cb); }
  render(camera) { this.renderer.render(this.scene, camera); }
}
