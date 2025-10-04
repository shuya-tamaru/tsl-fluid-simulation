import { CameraManager } from "./core/Camera";
import { ControlsManager } from "./core/Controls";
import { RendererManager } from "./core/Renderer";
import { SceneManager } from "./core/Scene";
import * as THREE from "three/webgpu";

export class App {
  private sceneManager!: SceneManager;
  private cameraManager!: CameraManager;
  private rendererManager!: RendererManager;
  private controlsManager!: ControlsManager;

  private animationId?: number;

  private width: number;
  private height: number;
  private aspect: number;

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;

    this.initApp();
  }

  private async initApp() {
    await this.initializeInstances();
    this.addObjectsToScene();
    this.setupEventListeners();
    this.startAnimation();
  }

  private async initializeInstances() {
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(this.aspect);
    this.rendererManager = new RendererManager(this.width, this.height);
    this.controlsManager = new ControlsManager(
      this.cameraManager.camera,
      this.rendererManager.renderer.domElement
    );
  }

  private addObjectsToScene(): void {
    const box = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: "red",
      wireframe: true,
    });
    const mesh = new THREE.Mesh(box, material);
    this.sceneManager.add(mesh);
  }

  private handleResize = (): void => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.cameraManager.updateAspect(this.aspect);
    this.rendererManager.resize(this.width, this.height);
  };

  private setupEventListeners(): void {
    window.addEventListener("resize", this.handleResize);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controlsManager.update();
    this.rendererManager.render(
      this.sceneManager.scene,
      this.cameraManager.camera
    );
  };

  private startAnimation(): void {
    this.animate();
  }

  public cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener("resize", this.handleResize);
  }
}
