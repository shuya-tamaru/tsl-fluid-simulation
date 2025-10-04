import * as THREE from "three/webgpu";
import type { UniformTypeOf } from "../../types/UniformType";
import type { StorageBufferType } from "../../types/BufferType";
import {
  float,
  Fn,
  hash,
  instancedArray,
  instanceIndex,
  max,
  normalLocal,
  positionLocal,
  vec3,
} from "three/tsl";
import { SPHConfig } from "./SPHConfig";
import { computeIntegratePass } from "./calculate/integrate";
import { computeDensityPass } from "./calculate/density";
import { computePressurePass } from "./calculate/pressure";
import { computePressureForcePass } from "./calculate/pressureForce";
import { computeViscosityPass } from "./calculate/viscosity";
import { BoundaryConfig } from "../boundary/BoundaryConfig";

export class ParticleManager {
  private renderer!: THREE.WebGPURenderer;
  private scene!: THREE.Scene;

  private boxWidth!: UniformTypeOf<number>;
  private boxHeight!: UniformTypeOf<number>;
  private boxDepth!: UniformTypeOf<number>;

  public particleCount!: number;
  private sphConfig!: SPHConfig;
  private boundaryConfig!: BoundaryConfig;

  private sphereGeometry!: THREE.SphereGeometry;
  private sphereMaterial!: THREE.MeshBasicNodeMaterial;
  private sphereMesh!: THREE.InstancedMesh;

  private positionsBuffer!: StorageBufferType;
  private velocitiesBuffer!: StorageBufferType;
  private densitiesBuffer!: StorageBufferType;
  private pressuresBuffer!: StorageBufferType;
  private pressureForcesBuffer!: StorageBufferType;
  private viscosityForcesBuffer!: StorageBufferType;

  constructor(
    renderer: THREE.WebGPURenderer,
    boundaryConfig: BoundaryConfig,
    sphConfig: SPHConfig
  ) {
    this.renderer = renderer;

    this.boundaryConfig = boundaryConfig;
    this.boxWidth = this.boundaryConfig.width;
    this.boxHeight = this.boundaryConfig.height;
    this.boxDepth = this.boundaryConfig.depth;

    this.particleCount = sphConfig.particleCount;
    this.sphConfig = sphConfig;
  }

  public async initialize() {
    this.initializeParticleBuffers();
    await this.initializeParticlePositions();
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
  }

  private initializeParticleBuffers() {
    this.positionsBuffer = instancedArray(this.particleCount, "vec3");
    this.velocitiesBuffer = instancedArray(this.particleCount, "vec3");
    this.densitiesBuffer = instancedArray(this.particleCount, "float");
    this.pressuresBuffer = instancedArray(this.particleCount, "float");
    this.pressureForcesBuffer = instancedArray(this.particleCount, "vec3");
    this.viscosityForcesBuffer = instancedArray(this.particleCount, "vec3");
  }

  private async initializeParticlePositions() {
    const init = Fn(() => {
      const pos = this.positionsBuffer.element(instanceIndex);
      const vel = this.velocitiesBuffer.element(instanceIndex);

      const x = hash(instanceIndex.mul(3)).sub(0.5).mul(float(this.boxWidth));
      const y = hash(instanceIndex.mul(5)).sub(0.5).mul(float(this.boxHeight));
      const z = hash(instanceIndex.mul(7)).sub(0.5).mul(float(this.boxDepth));

      const initialPosition = vec3(x, y, z);
      const initialVelocity = vec3(0.0, 0.0, 0.0);

      pos.assign(initialPosition);
      vel.assign(initialVelocity);
    });
    const initCompute = init().compute(this.particleCount);
    await this.renderer.computeAsync(initCompute);
  }

  private createGeometry() {
    this.sphereGeometry = new THREE.SphereGeometry(0.15, 10, 10);
  }

  private createMaterial() {
    this.sphereMaterial = new THREE.MeshBasicNodeMaterial({
      color: 0xff00ff,
      side: THREE.DoubleSide,
    });

    this.sphereMaterial.positionNode = positionLocal.add(
      this.positionsBuffer.toAttribute()
    );
    this.updateMaterialColorNode();
  }

  private updateMaterialColorNode() {
    this.sphereMaterial.colorNode = Fn(() => {
      const normal = normalLocal.toVar();
      const lightDir = vec3(0.3, 1.0, 0.5).normalize().toVar();
      const ambient = float(0.2).toVar();
      const diffuse = max(normal.dot(lightDir), float(0.0)).toVar();
      const baseColor = vec3(0.0, 0.0, 1.0).toVar();
      return baseColor.mul(ambient).add(baseColor.mul(diffuse));
    })();
  }

  private createMesh() {
    this.sphereMesh = new THREE.InstancedMesh(
      this.sphereGeometry,
      this.sphereMaterial,
      this.particleCount
    );
  }

  public addToScene(scene: THREE.Scene) {
    this.scene = scene;
    scene.add(this.sphereMesh);
  }

  public async updateParticleCount(count: number) {
    this.disposeParticleBuffers();
    this.disposeParticleMesh();

    this.particleCount = count;

    await this.initialize();

    if (this.scene) {
      this.scene.add(this.sphereMesh);
    }
  }

  private disposeParticleBuffers() {
    this.positionsBuffer.dispose();
    this.velocitiesBuffer.dispose();
    this.densitiesBuffer.dispose();
    this.pressuresBuffer.dispose();
    this.pressureForcesBuffer.dispose();
    this.viscosityForcesBuffer.dispose();
  }

  private disposeParticleMesh() {
    if (this.scene) {
      this.scene.remove(this.sphereMesh);
    }
    this.sphereMesh.dispose();
    this.sphereGeometry.dispose();
    this.sphereMaterial.dispose();
  }

  //compute functions
  private async computeDensity() {
    const integrateCompute = computeDensityPass(
      this.positionsBuffer,
      this.densitiesBuffer,
      this.particleCount,
      this.sphConfig.poly6Kernel,
      this.sphConfig.h2,
      this.sphConfig.h6,
      this.sphConfig.mass
    )().compute(this.particleCount);
    await this.renderer.computeAsync(integrateCompute);
  }

  private async computePressure() {
    const integrateCompute = computePressurePass(
      this.densitiesBuffer,
      this.pressuresBuffer,
      this.sphConfig.restDensity,
      this.sphConfig.pressureStiffness
    )().compute(this.particleCount);
    await this.renderer.computeAsync(integrateCompute);
  }

  private async computePressureForce() {
    const integrateCompute = computePressureForcePass(
      this.positionsBuffer,
      this.densitiesBuffer,
      this.pressuresBuffer,
      this.pressureForcesBuffer,
      this.particleCount,
      this.sphConfig.mass,
      this.sphConfig.h,
      this.sphConfig.spikyKernel
    )().compute(this.particleCount);
    await this.renderer.computeAsync(integrateCompute);
  }

  private async computeViscosity() {
    const viscosityCompute = computeViscosityPass(
      this.positionsBuffer,
      this.velocitiesBuffer,
      this.densitiesBuffer,
      this.viscosityForcesBuffer,
      this.particleCount,
      this.sphConfig.viscosityKernel,
      this.sphConfig.viscosityMu,
      this.sphConfig.h,
      this.sphConfig.mass
    )().compute(this.particleCount);
    await this.renderer.computeAsync(viscosityCompute);
  }

  private async computeIntegrate() {
    const integrateCompute = computeIntegratePass(
      this.positionsBuffer,
      this.velocitiesBuffer,
      this.pressureForcesBuffer,
      this.viscosityForcesBuffer,
      this.boxWidth,
      this.boxHeight,
      this.boxDepth,
      this.sphConfig.delta,
      this.sphConfig.restitution,
      this.sphConfig.mass
    )().compute(this.particleCount);
    await this.renderer.computeAsync(integrateCompute);
  }

  public async compute() {
    await this.computeDensity();
    await this.computePressure();
    await this.computePressureForce();
    await this.computeViscosity();
    await this.computeIntegrate();
  }
}
