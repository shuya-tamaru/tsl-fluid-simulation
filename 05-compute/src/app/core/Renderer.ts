import * as THREE from "three/webgpu";

export class RendererManager {
  public renderer: THREE.WebGPURenderer;

  constructor(width: number, height: number) {
    this.renderer = new THREE.WebGPURenderer();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    document.body.appendChild(this.renderer.domElement);
  }

  public resize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  async render(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    await this.renderer.renderAsync(scene, camera);
  }
}
