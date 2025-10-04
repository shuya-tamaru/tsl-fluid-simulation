# 03-boundary-box - Fluid Simulation Boundary Container

> [日本語版はこちら](README.ja.md)

A boundary box implementation for fluid particle simulation using Three.js TSL (Three.js Shading Language) for advanced shader effects.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application
    ├── core/                     # Core managers (from 02-app-structure)
    ├── simulation/
    │   └── boundary/
    │       └── BoundaryBox.ts    # Boundary box with TSL shaders
    └── types/
        └── UniformType.ts        # TypeScript type definitions
```

## Key Features

### 🎯 Three.js TSL Integration

- **Modern Shading Language**: Uses Three.js TSL for GPU-based calculations
- **Node-based Materials**: Visual shader programming with node materials
- **Real-time Shader Effects**: Dynamic opacity based on edge detection

### 📦 Boundary Box System

- **Configurable Dimensions**: Adjustable width, height, and depth
- **Edge-only Rendering**: Only box edges are visible (wireframe effect)
- **Uniform Integration**: TSL uniforms for dynamic parameter control

### 🎨 Advanced Shader Techniques

- **Edge Detection**: Mathematical edge detection in shader
- **Position-based Opacity**: Uses `positionLocal` for per-fragment calculations
- **Boolean Logic**: Complex shader logic with AND/OR operations

## Technical Implementation

### TSL Shader Code

```typescript
// Edge detection logic in TSL
const isXEdge = abs(positionLocal.x).greaterThan(
  this.widthNode.div(2).sub(edgeWidth)
);
const isYEdge = abs(positionLocal.y).greaterThan(
  this.heightNode.div(2).sub(edgeWidth)
);
const isZEdge = abs(positionLocal.z).greaterThan(
  this.depthNode.div(2).sub(edgeWidth)
);
```

### Boundary Box Features

- **Double-sided Rendering**: `side: THREE.DoubleSide`
- **Transparency Support**: `transparent: true`
- **Edge Width Control**: Configurable edge thickness
- **Uniform Access**: Public methods for size manipulation

## Usage

1. **Initialize**: Creates boundary box with default dimensions (32×16×16)
2. **Add to Scene**: Boundary box is automatically added to the scene
3. **Interactive**: Use OrbitControls to examine the boundary from all angles
4. **Configurable**: Access size uniforms for dynamic modifications

## Key Components

### BoundaryBoxManager

- **Geometry Creation**: BoxGeometry with TSL uniform dimensions
- **Material Setup**: TSL-based opacity shader
- **Scene Integration**: Seamless addition to Three.js scene
- **Size Management**: Getter methods for dimensions and uniform nodes

### TSL Uniforms

- **widthNode**: Box width (default: 32)
- **heightNode**: Box height (default: 16)
- **depthNode**: Box depth (default: 16)

## Next Steps

This boundary box serves as the foundation for fluid particle simulation:

- **Particle Containment**: Particles will be constrained within this boundary
- **Collision Detection**: Boundary walls will reflect particles
- **Volume Definition**: Defines the simulation space for fluid dynamics
- **Shader Integration**: Ready for particle system shader integration
