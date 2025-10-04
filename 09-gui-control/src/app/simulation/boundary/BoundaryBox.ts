import { Fn } from "three/src/nodes/TSL.js";
import { abs, float, positionLocal } from "three/tsl";
import * as THREE from "three/webgpu";
import type { UniformTypeOf } from "../../types/UniformType";
import { BoundaryConfig } from "./BoundaryConfig";

export class BoundaryBoxManager {
  private widthNode!: UniformTypeOf<number>;
  private heightNode!: UniformTypeOf<number>;
  private depthNode!: UniformTypeOf<number>;
  private boundaryConfig!: BoundaryConfig;
  private material!: THREE.MeshBasicNodeMaterial;
  private mesh!: THREE.Mesh;

  constructor(boundaryConfig: BoundaryConfig) {
    this.boundaryConfig = boundaryConfig;
    this.widthNode = boundaryConfig.width;
    this.heightNode = boundaryConfig.height;
    this.depthNode = boundaryConfig.depth;
  }

  public createGeometry() {
    return new THREE.BoxGeometry(
      this.widthNode.value,
      this.heightNode.value,
      this.depthNode.value
    );
  }

  public createMaterial(): THREE.MeshBasicNodeMaterial {
    this.material = new THREE.MeshBasicNodeMaterial({
      color: 0xffffff,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.updateMaterialOpacityNode();

    return this.material;
  }

  private updateMaterialOpacityNode(): void {
    this.material.opacityNode = Fn(() => {
      const edgeWidth = float(0.05);
      const isXEdge = abs(positionLocal.x).greaterThan(
        this.widthNode.div(2).sub(edgeWidth)
      );
      const isYEdge = abs(positionLocal.y).greaterThan(
        this.heightNode.div(2).sub(edgeWidth)
      );
      const isZEdge = abs(positionLocal.z).greaterThan(
        this.depthNode.div(2).sub(edgeWidth)
      );
      const edgeXY = isXEdge.and(isYEdge);
      const edgeXZ = isXEdge.and(isZEdge);
      const edgeYZ = isYEdge.and(isZEdge);
      const isEdge = edgeXY.or(edgeXZ).or(edgeYZ);
      return isEdge.select(float(1.0), float(0));
    })();
  }

  public createMesh(): THREE.Mesh {
    this.mesh = new THREE.Mesh(this.createGeometry(), this.createMaterial());
    return this.mesh;
  }

  public addToScene(scene: THREE.Scene): void {
    scene.add(this.createMesh());
  }

  public updateSizes(): void {
    this.mesh.geometry.dispose();
    this.mesh.geometry = this.createGeometry();
  }
}
