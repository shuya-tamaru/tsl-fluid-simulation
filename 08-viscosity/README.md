# 08-viscosity - SPH Viscosity Force Calculation

> [日本語版はこちら](README.ja.md)

Implementation of SPH (Smoothed Particle Hydrodynamics) viscosity force calculation using TSL compute shaders, adding fluid viscosity effects to complete the realistic fluid simulation.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application with viscosity computation
    ├── core/                     # Core managers (from previous projects)
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # Boundary container
    │   └── sph/
    │       ├── Particle.ts       # Complete SPH system with viscosity
    │       ├── SPHConfig.ts      # Extended SPH parameters with viscosity
    │       └── calculate/
    │           ├── density.ts    # Density calculation
    │           ├── pressure.ts   # Pressure calculation
    │           ├── pressureForce.ts # Pressure force calculation
    │           ├── viscosity.ts  # Viscosity force calculation
    │           └── integrate.ts  # Physics integration with all forces
    └── types/
        ├── UniformType.ts        # TSL uniform types
        └── BufferType.ts         # Storage buffer types
```

## Key Features

### 🌊 Complete SPH Fluid Simulation

- **5-Pass Computation**: Density → Pressure → Pressure Force → Viscosity → Integration
- **Viscosity Forces**: Velocity-based particle interactions for realistic fluid behavior
- **Laplacian Kernel**: Viscosity kernel for smooth velocity diffusion
- **Multi-force Integration**: Combined pressure and viscosity forces

### 📊 Extended SPH Parameters

- **Viscosity Coefficient (μ)**: Fluid viscosity parameter (0.12)
- **Viscosity Kernel**: Laplacian kernel for velocity smoothing
- **Force Buffers**: Dedicated storage for viscosity forces
- **Complete Physics**: All major SPH forces implemented

### ⚡ Advanced Compute Pipeline

- **Viscosity Calculation**: Velocity difference-based force computation
- **Laplacian Smoothing**: Kernel-based velocity diffusion
- **6-Buffer System**: Complete SPH state with viscosity forces
- **Async Synchronization**: Proper GPU compute completion

## Technical Implementation

### SPH Viscosity Force Formula

```typescript
// SPH viscosity force using Laplacian kernel
F_viscosity = μ × m × Σⱼ (vⱼ - vᵢ) × ∇²W_viscosity / ρ_avg
```

### Viscosity Kernel (Laplacian)

```typescript
// Viscosity kernel for velocity smoothing
∇²W_viscosity = (45 / (πh⁶)) × (h - r)  if r < h
∇²W_viscosity = 0                        if r ≥ h
```

### TSL Compute Shader Implementation

```typescript
// Viscosity force calculation
const lapW = float(viscosity).mul(float(h).sub(r));
const invRhoAvg = float(2.0).div(density_i.add(density_j));
viscosityForce_i.addAssign(
  float(viscosityMu)
    .mul(float(mass))
    .mul(vel_j.sub(vel_i))
    .mul(invRhoAvg)
    .mul(lapW)
);
```

## SPH Configuration

### Complete SPHConfig Parameters

- **mass**: Particle mass (0.4)
- **h**: Smoothing length (1.0)
- **restDensity**: Reference density (1.0)
- **pressureStiffness**: Compressibility (100)
- **viscosityMu**: Viscosity coefficient (0.12)
- **delta**: Time step (1/60 seconds)
- **restitution**: Collision elasticity (0.8)

### Complete Kernel Functions

- **Poly6 Kernel**: Density calculation (315/(64πh⁹))
- **Spiky Kernel**: Pressure gradient (-45/(πh⁶))
- **Viscosity Kernel**: Velocity smoothing (45/(πh⁶))

## Complete Compute Pipeline

### 5-Pass SPH System

```typescript
public async compute() {
  await this.computeDensity();        // Pass 1: Calculate densities
  await this.computePressure();       // Pass 2: Calculate pressures
  await this.computePressureForce();  // Pass 3: Calculate pressure forces
  await this.computeViscosity();      // Pass 4: Calculate viscosity forces
  await this.computeIntegrate();      // Pass 5: Integrate with all forces
}
```

### Buffer Management

- **positionsBuffer**: Particle positions (vec3 array)
- **velocitiesBuffer**: Particle velocities (vec3 array)
- **densitiesBuffer**: Calculated densities (float array)
- **pressuresBuffer**: Calculated pressures (float array)
- **pressureForcesBuffer**: Calculated pressure forces (vec3 array)
- **viscosityForcesBuffer**: Calculated viscosity forces (vec3 array)

## Physics Implementation

### Viscosity Physics

- **Velocity Diffusion**: Smooth velocity differences between particles
- **Laplacian Smoothing**: Kernel-based velocity field smoothing
- **Density Averaging**: Proper density weighting for force calculation
- **Numerical Stability**: Density clamping for division safety

### Multi-force Integration

- **Force Combination**: Pressure and viscosity forces combined
- **Realistic Fluid Behavior**: Viscous damping and smoothing effects
- **Boundary Collision**: Elastic collision with restitution
- **Time Integration**: Verlet-style position and velocity updates

## Performance Features

### GPU Optimization

- **6-Buffer System**: Complete SPH state in GPU memory
- **Parallel Computation**: All particles computed simultaneously
- **Efficient Kernels**: Optimized Laplacian kernel implementation
- **Memory Coalescing**: Optimized buffer access patterns

### SPH Efficiency

- **Kernel Precomputation**: Mathematical constants calculated once
- **Conditional Branching**: Only compute nearby particles
- **Vectorized Operations**: GPU-optimized mathematical operations
- **Async Pipeline**: Non-blocking multi-pass computation

## Fluid Simulation Effects

### Viscosity Effects

- **Velocity Smoothing**: Reduced velocity fluctuations
- **Fluid Damping**: Natural fluid resistance to motion
- **Boundary Layer**: Realistic fluid-wall interactions
- **Turbulence Damping**: Reduced particle clustering

### Complete Fluid Behavior

- **Pressure-driven Flow**: Density-based pressure forces
- **Viscous Damping**: Velocity-based resistance
- **Gravity Integration**: Natural fluid settling
- **Collision Response**: Realistic boundary interactions
