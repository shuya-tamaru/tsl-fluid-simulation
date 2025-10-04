import GUI from "lil-gui";
import type { BoundaryConfig } from "../simulation/boundary/BoundaryConfig";
import type { SPHConfig } from "../simulation/sph/SPHConfig";
import type { BoundaryBoxManager } from "../simulation/boundary/BoundaryBox";
import type { ParticleManager } from "../simulation/sph/Particle";

export class ParamsControls {
  private gui!: GUI;
  private boundaryConfig!: BoundaryConfig;
  private sphConfig!: SPHConfig;
  private boundaryBoxManager!: BoundaryBoxManager;
  private particleManager!: ParticleManager;

  constructor(
    boundaryBoxManager: BoundaryBoxManager,
    particleManager: ParticleManager,
    boundaryConfig: BoundaryConfig,
    sphConfig: SPHConfig
  ) {
    this.gui = new GUI();
    this.boundaryBoxManager = boundaryBoxManager;
    this.particleManager = particleManager;
    this.boundaryConfig = boundaryConfig;
    this.sphConfig = sphConfig;
    this.initialize();
  }

  private initialize() {
    this.gui
      .add(this.boundaryConfig.width, "value", 10, 32, 0.2)
      .name("Box Width")
      .onChange(() => {
        this.boundaryBoxManager.updateSizes();
      });
    this.gui
      .add(this.boundaryConfig.depth, "value", 10, 32, 0.2)
      .name("Box Depth")
      .onChange(() => {
        this.boundaryBoxManager.updateSizes();
      });

    this.gui
      .add(this.sphConfig, "particleCount", 1000, 20000, 1000)
      .name("Particle Count")
      .onChange(async (count: number) => {
        await this.particleManager.updateParticleCount(count);
      });
  }
}
