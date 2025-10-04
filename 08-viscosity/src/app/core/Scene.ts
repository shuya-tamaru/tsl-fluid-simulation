import * as THREE from "three/webgpu";

export class SceneManager {
  public scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
  }

  public add(object: THREE.Object3D) {
    this.scene.add(object);
  }

  public remove(object: THREE.Object3D) {
    this.scene.remove(object);
  }
}
