# 05-compute - TSL Compute Shader Physics Simulation

> [日本語版はこちら](README.ja.md)

Implementation of particle physics simulation using Three.js TSL (Three.js Shading Language) compute shaders for real-time GPU-based calculations.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application with async compute
    ├── core/                     # Core managers (from previous projects)
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # Boundary container
    │   └── sph/
    │       ├── Particle.ts       # Particle system with compute shaders
    │       ├── SPHConfig.ts      # Simulation parameters
    │       └── calculate/
    │           └── integrate.ts   # TSL compute shader for physics
    └── types/
        ├── UniformType.ts        # TSL uniform types
        └── BufferType.ts         # Storage buffer types
```

## Key Features

### 🚀 TSL Compute Shaders

- **GPU Physics**: Real-time particle physics calculations on GPU
- **Parallel Processing**: 5,000 particles computed simultaneously
- **High Performance**: Leverages WebGPU compute capabilities

### ⚡ Physics Simulation

- **Gravity**: Realistic gravity force (-9.8 m/s²)
- **Boundary Collision**: Elastic collision with boundary walls
- **Velocity Integration**: Verlet-style position and velocity updates
- **Configurable Parameters**: Adjustable timestep and restitution

### 🔄 Async Compute Pipeline

- **Proper Synchronization**: `async/await` for GPU compute completion
- **Data Consistency**: Always render with latest computed positions
- **Stable Frame Rate**: Predictable animation loop timing

## Technical Implementation

### Compute Shader Physics

```typescript
// TSL compute shader for particle integration
const gravity = vec3(0, -9.8, 0);
const acceleration = gravity;
const newVel = vel.add(acceleration.mul(float(delta)));
const newPos = pos.add(newVel.mul(float(delta)));
```

### Boundary Collision Detection

```typescript
// Collision with boundary walls
If(abs(newPos.x).greaterThan(boxWidth.div(2)), () => {
  newPos.x.assign(boxWidth.div(2).mul(sign(newPos.x)));
  const dumpVel = newVel.x.mul(-1.0).mul(float(1.0 - restitution));
  newVel.x.assign(dumpVel);
});
```

### Async Compute Integration

```typescript
private animate = async (): Promise<void> => {
  await this.particles.compute(); // Wait for GPU compute completion
  this.rendererManager.render(scene, camera); // Render with new data
};
```

## Physics Parameters

### SPHConfig

- **mass**: Particle mass (0.4)
- **delta**: Time step (1/60 seconds)
- **restitution**: Collision elasticity (0.8)

### Simulation Behavior

- **Gravity**: Constant downward acceleration
- **Boundary Bouncing**: Elastic collisions with restitution
- **Real-time Updates**: 60 FPS physics simulation

## Key Components

### ParticleManager

- **Dual Buffers**: Separate position and velocity storage buffers
- **Compute Pipeline**: Async compute shader execution
- **Scene Integration**: InstancedMesh rendering with computed positions

### Compute Shader Functions

- **initializeParticlePositions**: Random particle placement
- **computeIntegrate**: Physics integration with collision detection
- **Boundary Constraints**: Wall collision and bouncing

### Async Animation Loop

- **Proper Synchronization**: GPU compute completion before rendering
- **Data Integrity**: Consistent particle positions across frames
- **Performance Optimization**: Efficient GPU utilization

## Performance Features

### GPU Compute Pipeline

- **Parallel Execution**: All particles computed simultaneously
- **Storage Buffers**: Efficient GPU memory management
- **Async Operations**: Non-blocking compute with proper synchronization

### Memory Management

- **Buffer Reuse**: Position and velocity data in GPU buffers
- **Instanced Rendering**: Single draw call for all particles
- **Efficient Updates**: Direct buffer manipulation via compute shaders
