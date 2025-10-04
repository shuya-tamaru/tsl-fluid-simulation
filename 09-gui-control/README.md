# 09-gui-control - Interactive SPH Parameter Control

> [日本語版はこちら](README.ja.md)

Interactive GUI control system for SPH fluid simulation using lil-gui, enabling real-time parameter adjustment and live simulation tuning.

## Project Structure

```
src/
├── main.ts
└── app/
    ├── App.ts                    # Main application with GUI integration
    ├── core/                     # Core managers (from previous projects)
    ├── simulation/
    │   ├── boundary/
    │   │   ├── BoundaryBox.ts    # Boundary container with dynamic sizing
    │   │   └── BoundaryConfig.ts # Boundary configuration with uniforms
    │   └── sph/
    │       ├── Particle.ts       # SPH system with dynamic particle count
    │       ├── SPHConfig.ts      # SPH parameters
    │       └── calculate/        # Compute shaders (from previous projects)
    ├── utils/
    │   └── ParamsControls.ts     # GUI control system
    └── types/
        ├── UniformType.ts        # TSL uniform types
        └── BufferType.ts         # Storage buffer types
```

## Key Features

### 🎛️ Interactive Parameter Control

- **Real-time Adjustment**: Live parameter modification during simulation
- **Boundary Control**: Dynamic boundary box sizing with GUI sliders
- **Particle Count Control**: Adjustable particle count with live updates
- **Smooth Integration**: Seamless GUI integration with existing SPH system

### 🖥️ User Interface

- **lil-gui Integration**: Modern, lightweight GUI library
- **Intuitive Controls**: Slider-based parameter adjustment
- **Live Updates**: Real-time simulation parameter changes
- **Responsive Design**: GUI adapts to different screen sizes

### ⚙️ Configuration Management

- **BoundaryConfig**: Centralized boundary parameter management
- **Uniform Integration**: TSL uniform nodes for dynamic values
- **State Synchronization**: GUI and simulation state consistency
- **Parameter Validation**: Range checking and value constraints

## Technical Implementation

### GUI Control System

```typescript
// Parameter control initialization
this.gui
  .add(this.boundaryConfig.width, "value", 10, 32, 0.2)
  .name("Box Width")
  .onChange(() => {
    this.boundaryBoxManager.updateSizes();
  });
```

### Dynamic Boundary Configuration

```typescript
// BoundaryConfig with TSL uniforms
export class BoundaryConfig {
  public width = uniform(16);
  public height = uniform(16);
  public depth = uniform(16);
}
```

### Real-time Parameter Updates

```typescript
// Live particle count adjustment
this.gui
  .add(this.sphConfig, "particleCount", 1000, 20000, 1000)
  .name("Particle Count")
  .onChange(async (count: number) => {
    await this.particleManager.updateParticleCount(count);
  });
```

## GUI Features

### Interactive Controls

- **Box Width**: Boundary box width adjustment (10-32 range)
- **Box Depth**: Boundary box depth adjustment (10-32 range)
- **Particle Count**: Dynamic particle count (1000-20000 range)

### Real-time Effects

- **Boundary Resizing**: Immediate visual feedback for boundary changes
- **Particle Scaling**: Live particle count adjustment with system reinitialization
- **Simulation Continuity**: Maintains simulation state during parameter changes

## Configuration Architecture

### BoundaryConfig

- **TSL Uniforms**: Direct integration with compute shaders
- **Dynamic Values**: Real-time parameter updates
- **Type Safety**: TypeScript integration for parameter validation

### SPHConfig Integration

- **Extended Parameters**: Additional GUI-controllable parameters
- **Live Updates**: Real-time simulation parameter modification
- **State Management**: Consistent parameter state across components

## Performance Features

### Efficient Updates

- **Minimal Reinitialization**: Only affected systems are updated
- **GPU Synchronization**: Proper async handling for compute shader updates
- **Memory Management**: Efficient buffer reallocation for particle count changes

### User Experience

- **Smooth Interaction**: Responsive GUI without simulation interruption
- **Visual Feedback**: Immediate visual changes for parameter adjustments
- **Parameter Persistence**: GUI state maintained across interactions

## Integration Benefits

### Development Workflow

- **Rapid Prototyping**: Quick parameter testing and adjustment
- **Visual Debugging**: Real-time visualization of parameter effects
- **User Testing**: Easy parameter exploration for different scenarios

### Simulation Tuning

- **Real-time Optimization**: Live parameter fine-tuning
- **Visual Analysis**: Immediate feedback on parameter changes
- **Performance Monitoring**: GUI-assisted performance optimization

## Usage

### Parameter Adjustment

1. **Boundary Control**: Use sliders to adjust boundary box dimensions
2. **Particle Scaling**: Modify particle count for different simulation scales
3. **Live Updates**: Changes apply immediately to the running simulation

### GUI Interaction

- **Slider Controls**: Intuitive range-based parameter adjustment
- **Real-time Feedback**: Immediate visual response to parameter changes
- **Continuous Simulation**: No interruption to simulation flow during adjustments
