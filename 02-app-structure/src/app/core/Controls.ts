import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three/webgpu";

export class ControlsManager {
  public controls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.controls = new OrbitControls(camera, domElement);
    this.setupControls();
  }

  public setupControls() {
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.dampingFactor = 0.25;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 100;
  }

  public update() {
    this.controls.update();
  }
}
