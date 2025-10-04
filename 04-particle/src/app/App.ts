import { CameraManager } from "./core/Camera";
import { ControlsManager } from "./core/Controls";
import { RendererManager } from "./core/Renderer";
import { SceneManager } from "./core/Scene";
import { BoundaryBoxManager } from "./simulation/boundary/BoundaryBox";
import { ParticleManager } from "./simulation/sph/Particle";

export class App {
  private sceneManager!: SceneManager;
  private cameraManager!: CameraManager;
  private rendererManager!: RendererManager;
  private controlsManager!: ControlsManager;
  private boundaryBoxManager!: BoundaryBoxManager;
  private particles!: ParticleManager;

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
    await this.initializeManagers();
    this.addObjectsToScene();
    this.setupEventListeners();
    this.startAnimation();
  }

  private async initializeManagers() {
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(this.aspect);
    this.rendererManager = new RendererManager(this.width, this.height);
    this.controlsManager = new ControlsManager(
      this.cameraManager.camera,
      this.rendererManager.renderer.domElement
    );

    this.boundaryBoxManager = new BoundaryBoxManager();
    const {
      width: widthNode,
      height: heightNode,
      depth: depthNode,
    } = this.boundaryBoxManager.getSizesNodes();

    this.particles = new ParticleManager(
      this.rendererManager.renderer,
      widthNode,
      heightNode,
      depthNode
    );

    await this.particles.initialize();
  }

  private addObjectsToScene(): void {
    this.boundaryBoxManager.addToScene(this.sceneManager.scene);
    this.particles.addToScene(this.sceneManager.scene);
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
