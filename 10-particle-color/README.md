# 10-particle-color - Velocity-Based Particle Coloring

> [日本語版はこちら](README.ja.md)

Dynamic particle coloring system that visualizes fluid velocity using TSL shaders, creating realistic water-like color transitions from deep blue to white foam based on particle speed.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application with velocity coloring
    ├── core/                     # Core managers (from previous projects)
    ├── simulation/
    │   ├── boundary/
    │   │   ├── BoundaryBox.ts    # Boundary container
    │   │   └── BoundaryConfig.ts # Boundary configuration
    │   └── sph/
    │       ├── Particle.ts       # SPH system with velocity coloring
    │       ├── SPHConfig.ts      # SPH parameters with maxSpeed
    │       └── calculate/        # Compute shaders (from previous projects)
    ├── utils/
    │   └── ParamsControls.ts     # GUI control system
    └── types/
        ├── UniformType.ts        # TSL uniform types
        └── BufferType.ts         # Storage buffer types
```

## Key Features

### 🎨 Dynamic Velocity Coloring

- **Speed-Based Colors**: Particle color changes based on velocity magnitude
- **Realistic Water Colors**: Deep blue → Mid blue → White foam transition
- **Smooth Interpolation**: TSL-based color mixing for natural transitions
- **Real-time Updates**: Colors update every frame with velocity changes

### 🌊 Visual Fluid Representation

- **Deep Water**: Slow-moving particles in deep blue (0.0, 0.05, 0.9)
- **Mid Water**: Medium-speed particles in mid blue (0.0, 0.6, 0.8)
- **White Foam**: High-speed particles in white (1.0, 1.0, 1.0)
- **Natural Progression**: Realistic water color physics simulation

### ⚡ TSL Shader Implementation

- **Velocity Calculation**: Real-time speed computation in shader
- **Color Interpolation**: Smooth color transitions using TSL mix function
- **Performance Optimized**: GPU-based color calculation for all particles
- **Dynamic Lighting**: Combined with ambient and diffuse lighting

## Technical Implementation

### Velocity-Based Color Function

```typescript
private getColorByVelocity = Fn(([speed]) => {
  const t = clamp(
    speed.div(float(this.sphConfig.maxSpeed)),
    float(0.0),
    float(1.0)
  ).toVar();

  const deep = vec3(0.0, 0.05, 0.9);    // Deep water blue
  const mid = vec3(0.0, 0.6, 0.8);      // Mid water blue
  const foam = vec3(1.0, 1.0, 1.0);     // White foam

  // Two-stage color interpolation
  If(t.lessThan(float(0.85)), () => {
    const k = t.div(float(0.85));
    color.assign(mix(deep, mid, k));
  }).Else(() => {
    const k = t.sub(float(0.85)).div(float(0.15));
    color.assign(mix(mid, foam, k));
  });
});
```

### Speed Calculation in Shader

```typescript
private updateMaterialColorNode() {
  this.sphereMaterial.colorNode = Fn(() => {
    // Calculate particle speed
    const speed = this.velocitiesBuffer
      .element(instanceIndex)
      .length();

    // Apply velocity-based coloring
    const baseColor = this.getColorByVelocity(speed).toVar();

    // Combine with lighting
    return baseColor.mul(ambient).add(baseColor.mul(diffuse));
  })();
}
```

### SPH Configuration

```typescript
export class SPHConfig {
  // ... existing parameters
  public maxSpeed = 10.0; // Maximum speed for color normalization
}
```

## Color Mapping System

### Speed-to-Color Mapping

- **0% - 85% Speed**: Deep blue → Mid blue transition
- **85% - 100% Speed**: Mid blue → White foam transition
- **Clamped Range**: Speed values normalized to 0-1 range
- **Smooth Interpolation**: TSL mix function for natural color blending

### Visual Effects

- **Slow Particles**: Deep, calm water appearance
- **Medium Particles**: Active water movement
- **Fast Particles**: Turbulent foam and splashing effects
- **Dynamic Lighting**: Ambient and diffuse lighting applied to all colors

## Performance Features

### GPU Optimization

- **Shader-Based Calculation**: All color computation on GPU
- **Real-time Updates**: Colors calculated every frame
- **Efficient Interpolation**: TSL mix function for smooth transitions
- **Memory Efficient**: No additional color buffers required

### Visual Quality

- **Smooth Transitions**: Natural color blending between speed ranges
- **Realistic Physics**: Colors represent actual fluid behavior
- **Dynamic Response**: Immediate color changes with velocity changes
- **Lighting Integration**: Proper ambient and diffuse lighting effects

## Integration Benefits

### Scientific Visualization

- **Flow Analysis**: Visual identification of high and low velocity regions
- **Turbulence Detection**: White foam indicates turbulent areas
- **Fluid Dynamics**: Real-time visualization of fluid behavior
- **Educational Value**: Clear visual representation of fluid physics

### Aesthetic Enhancement

- **Realistic Appearance**: Natural water-like color progression
- **Visual Appeal**: Dynamic, colorful particle system
- **Immersion**: Enhanced visual experience for fluid simulation
- **Professional Quality**: Production-ready visual effects

## Usage

### Visual Analysis

1. **Slow Regions**: Deep blue indicates calm, slow-moving fluid
2. **Active Regions**: Mid blue shows normal fluid movement
3. **Turbulent Regions**: White foam highlights high-velocity, turbulent areas
4. **Boundary Effects**: Color changes near boundaries show collision dynamics

### Parameter Tuning

- **maxSpeed**: Adjust maximum speed threshold for color normalization
- **Color Ranges**: Modify speed thresholds for different color transitions
- **Lighting**: Adjust ambient and diffuse lighting for desired appearance
