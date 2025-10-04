# 07-pressure-force - SPH Pressure Force Calculation

> [日本語版はこちら](README.ja.md)

Implementation of SPH (Smoothed Particle Hydrodynamics) pressure force calculation using TSL compute shaders, completing the core SPH simulation pipeline.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application with pressure force computation
    ├── core/                     # Core managers (from previous projects)
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # Boundary container
    │   └── sph/
    │       ├── Particle.ts       # Complete SPH particle system
    │       ├── SPHConfig.ts      # Extended SPH parameters
    │       └── calculate/
    │           ├── density.ts    # Density calculation (from previous)
    │           ├── pressure.ts   # Pressure calculation from density
    │           ├── pressureForce.ts # Pressure force gradient calculation
    │           └── integrate.ts  # Physics integration with forces
    └── types/
        ├── UniformType.ts        # TSL uniform types
        └── BufferType.ts         # Storage buffer types
```

## Key Features

### 🧮 Complete SPH Pipeline

- **4-Pass Computation**: Density → Pressure → Pressure Force → Integration
- **Spiky Kernel**: Pressure gradient calculation using Spiky kernel
- **State Equation**: Ideal gas law for pressure calculation
- **Force Integration**: Pressure forces applied to particle motion

### 📊 Extended SPH Parameters

- **Rest Density**: Reference density for pressure calculation
- **Pressure Stiffness**: Compressibility parameter (100)
- **Spiky Kernel**: Gradient kernel for pressure force calculation
- **Force Buffers**: Dedicated storage for pressure forces

### ⚡ Advanced Compute Shaders

- **Pressure Calculation**: State equation implementation
- **Force Gradient**: Spiky kernel gradient computation
- **Multi-buffer Pipeline**: 5 storage buffers for complete SPH state
- **Async Synchronization**: Proper GPU compute completion

## Technical Implementation

### SPH Pressure State Equation

```typescript
// Ideal gas law for pressure calculation
P = k × (ρ - ρ₀)
// where k = pressure stiffness, ρ₀ = rest density
```

### Pressure Force Gradient

```typescript
// SPH pressure force using Spiky kernel gradient
F_pressure = -m² × Σⱼ (Pᵢ/ρᵢ² + Pⱼ/ρⱼ²) × ∇W_spiky
```

### TSL Compute Shaders

#### Pressure Calculation

```typescript
const pressure = float(pressureStiffness).mul(rho0.sub(restDensity));
pressure_i.assign(pressure);
```

#### Pressure Force Calculation

```typescript
const gradW = float(spiky).mul(t.mul(t)).mul(_dir);
const term = pressure_i
  .div(density_i.mul(density_i))
  .add(press_j.div(rhoj.mul(rhoj)));
const fi = float(mass).mul(float(mass)).mul(term).mul(gradW);
```

## SPH Configuration

### Extended SPHConfig Parameters

- **mass**: Particle mass (0.4)
- **h**: Smoothing length (1.0)
- **restDensity**: Reference density (1.0)
- **pressureStiffness**: Compressibility (100)
- **delta**: Time step (1/60 seconds)
- **restitution**: Collision elasticity (0.8)

### Kernel Functions

- **Poly6 Kernel**: Density calculation (315/(64πh⁹))
- **Spiky Kernel**: Pressure gradient (-45/(πh⁶))

## Complete Compute Pipeline

### 4-Pass SPH System

```typescript
public async compute() {
  await this.computeDensity();        // Pass 1: Calculate densities
  await this.computePressure();       // Pass 2: Calculate pressures
  await this.computePressureForce();  // Pass 3: Calculate pressure forces
  await this.computeIntegrate();      // Pass 4: Integrate with forces
}
```

### Buffer Management

- **positionsBuffer**: Particle positions (vec3 array)
- **velocitiesBuffer**: Particle velocities (vec3 array)
- **densitiesBuffer**: Calculated densities (float array)
- **pressuresBuffer**: Calculated pressures (float array)
- **pressureForcesBuffer**: Calculated pressure forces (vec3 array)

## Physics Implementation

### Pressure Force Physics

- **Spiky Kernel**: Gradient kernel for smooth pressure gradients
- **Neighbor Interaction**: All-to-all particle force calculation
- **Mass Conservation**: Proper mass weighting in force calculation
- **Numerical Stability**: Density clamping for division safety

### Integration with Forces

- **Force Accumulation**: Pressure forces added to particle acceleration
- **Boundary Collision**: Elastic collision with restitution
- **Time Integration**: Verlet-style position and velocity updates

## Performance Features

### GPU Optimization

- **5-Buffer System**: Complete SPH state in GPU memory
- **Parallel Computation**: All particles computed simultaneously
- **Efficient Kernels**: Optimized Spiky kernel implementation
- **Memory Coalescing**: Optimized buffer access patterns

### SPH Efficiency

- **Kernel Precomputation**: Mathematical constants calculated once
- **Conditional Branching**: Only compute nearby particles
- **Vectorized Operations**: GPU-optimized mathematical operations
- **Async Pipeline**: Non-blocking multi-pass computation

## Next Steps

This completes the core SPH simulation. Future enhancements include:

- **Viscosity Forces**: Velocity-based particle interactions
- **Surface Tension**: Interface detection and surface forces
- **Spatial Optimization**: Spatial hashing for O(n) neighbor search
- **Advanced Kernels**: Custom kernel functions for specific effects
- **Multi-phase Fluids**: Different fluid types with varying properties
