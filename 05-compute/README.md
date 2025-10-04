# 04-particle - SPH Particle System Foundation

> [日本語版はこちら](README.ja.md)

A particle system foundation for SPH (Smoothed Particle Hydrodynamics) simulation using Three.js InstancedMesh and TSL compute shaders for random particle placement.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application with particle integration
    ├── core/                     # Core managers (from previous projects)
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # Boundary container
    │   └── sph/
    │       └── Particle.ts       # Particle system manager
    └── types/
        ├── UniformType.ts        # TSL uniform types
        └── BufferType.ts         # Storage buffer types
```

## Key Features

### 🎯 InstancedMesh Particle System

- **High Performance**: 5,000 particles rendered with single draw call
- **GPU Instancing**: Efficient rendering using Three.js InstancedMesh
- **Scalable**: Easy to increase particle count for complex simulations

### 🎲 Random Particle Placement

- **TSL Compute Shaders**: GPU-based random position generation
- **Hash-based Randomness**: Deterministic but pseudo-random distribution
- **Boundary Constraint**: Particles placed within boundary box dimensions

### 🎨 Advanced Shader Effects

- **Dynamic Lighting**: Per-particle lighting calculation in shader
- **Position-based Rendering**: TSL position nodes for instance positioning
- **Custom Color Nodes**: Ambient and diffuse lighting effects

## Technical Implementation

### Particle Initialization

```typescript
// TSL compute shader for random positioning
const x = hash(instanceIndex.mul(3)).sub(0.5).mul(float(this.boxWidth));
const y = hash(instanceIndex.mul(5)).sub(0.5).mul(float(this.boxHeight));
const z = hash(instanceIndex.mul(7)).sub(0.5).mul(float(this.boxDepth));
```

### InstancedMesh Setup

```typescript
this.sphereMesh = new THREE.InstancedMesh(
  this.sphereGeometry,
  this.sphereMaterial,
  this.particleCount // 5,000 instances
);
```

### Shader-based Lighting

```typescript
// Per-fragment lighting calculation
const diffuse = max(normal.dot(lightDir), float(0.0));
const baseColor = vec3(0.0, 0.0, 1.0);
return baseColor.mul(ambient).add(baseColor.mul(diffuse));
```

## Key Components

### ParticleManager

- **Buffer Management**: TSL storage buffers for particle positions
- **Geometry Creation**: Sphere geometry for individual particles
- **Material Setup**: TSL-based position and color nodes
- **Scene Integration**: Seamless addition to Three.js scene

### Particle Configuration

- **Count**: 5,000 particles (configurable)
- **Size**: Sphere radius 0.15 units
- **Geometry**: 10×10 sphere resolution
- **Color**: Blue particles with lighting effects

### Boundary Integration

- **Size Synchronization**: Particle bounds match boundary box dimensions
- **Constraint System**: Particles distributed within container
- **Uniform Sharing**: Boundary size uniforms used for particle placement

## Performance Features

### GPU Compute Pipeline

- **Async Initialization**: Non-blocking particle position generation
- **Storage Buffers**: Efficient GPU memory management
- **Single Draw Call**: All particles rendered in one pass

### Memory Optimization

- **Instanced Rendering**: Shared geometry across all particles
- **Buffer Reuse**: Position data stored in GPU buffers
- **Efficient Updates**: Direct buffer manipulation for future SPH updates

## Next Steps

This foundation prepares for SPH simulation implementation:

- **Physics Integration**: Add velocity and force calculations
- **Neighbor Search**: Implement spatial hashing for particle interactions
- **Density Calculation**: SPH density and pressure computations
- **Collision Detection**: Boundary collision and response
- **Time Integration**: Verlet or RK4 integration for particle movement
