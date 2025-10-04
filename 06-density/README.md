# 06-density - SPH Density Calculation

> [日本語版はこちら](README.ja.md)

Implementation of SPH (Smoothed Particle Hydrodynamics) density calculation using TSL compute shaders, preparing for pressure force calculations.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application with density computation
    ├── core/                     # Core managers (from previous projects)
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # Boundary container
    │   └── sph/
    │       ├── Particle.ts       # Particle system with density buffers
    │       ├── SPHConfig.ts      # SPH parameters including kernel functions
    │       └── calculate/
    │           ├── density.ts    # TSL density calculation compute shader
    │           └── integrate.ts  # Physics integration (from previous project)
    └── types/
        ├── UniformType.ts        # TSL uniform types
        └── BufferType.ts         # Storage buffer types
```

## Key Features

### 🔬 SPH Density Calculation

- **Poly6 Kernel**: Smoothing kernel for density interpolation
- **Neighbor Search**: All-to-all particle interaction computation
- **GPU Parallelization**: 5,000 particles computed simultaneously
- **Real-time Updates**: Density calculated every frame

### 📊 SPH Parameters

- **Smoothing Length (h)**: Kernel radius for neighbor influence
- **Poly6 Kernel Coefficient**: Normalized weighting function
- **Mass**: Particle mass for density contribution
- **Kernel Powers**: Precomputed h², h³, h⁶, h⁹ for efficiency

### ⚡ Compute Shader Implementation

- **Dual Pass Pipeline**: Density calculation → Physics integration
- **Storage Buffers**: Position, velocity, and density data
- **Loop-based Neighbor Search**: Efficient GPU computation
- **Async Synchronization**: Proper GPU compute completion

## Technical Implementation

### SPH Density Formula

```typescript
// SPH density calculation using Poly6 kernel
ρᵢ = Σⱼ mⱼ W(|rᵢ - rⱼ|, h)
```

### TSL Compute Shader

```typescript
// Density calculation for each particle
const rho0 = float(0.0).toVar();
Loop(j.lessThan(particleCount), () => {
  If(j.notEqual(instanceIndex), () => {
    const r = pos_j.sub(pos_i);
    const r2 = r.dot(r);
    If(r2.lessThan(h2), () => {
      const w = float(poly6Kernel).mul(pow(t, 3));
      rho0.addAssign(w.mul(mass));
    });
  });
});
```

### Poly6 Kernel Function

```typescript
// SPH Poly6 smoothing kernel
W(r, h) = (315 / (64πh⁹)) × (h² - r²)³  if r < h
W(r, h) = 0                              if r ≥ h
```

## SPH Configuration

### SPHConfig Parameters

- **mass**: Particle mass (0.4)
- **h**: Smoothing length (1.0)
- **delta**: Time step (1/60 seconds)
- **restitution**: Collision elasticity (0.8)

### Kernel Calculations

- **h², h³, h⁶, h⁹**: Precomputed kernel powers
- **poly6Kernel**: Normalized Poly6 coefficient (315/(64πh⁹))

## Compute Pipeline

### Dual Pass System

```typescript
public async compute() {
  await this.computeDensity();    // Pass 1: Calculate densities
  await this.computeIntegrate();  // Pass 2: Physics integration
}
```

### Buffer Management

- **positionsBuffer**: Particle positions (vec3 array)
- **velocitiesBuffer**: Particle velocities (vec3 array)
- **densitiesBuffer**: Calculated densities (float array)

## Performance Features

### GPU Optimization

- **Parallel Density Calculation**: All particles computed simultaneously
- **Efficient Neighbor Search**: Loop-based all-to-all computation
- **Memory Coalescing**: Optimized buffer access patterns
- **Async Compute**: Non-blocking GPU operations

### SPH Efficiency

- **Kernel Precomputation**: Mathematical constants calculated once
- **Conditional Branching**: Only compute nearby particles
- **Vectorized Operations**: GPU-optimized mathematical operations
