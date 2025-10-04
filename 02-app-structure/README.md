# 02-app-structure - Three.js Application Architecture

> [日本語版はこちら](README.ja.md)

A well-structured Three.js application using the Manager pattern for fluid simulation development.

## Project Structure

```
src/
├── main.ts              # Entry point
└── app/
    ├── App.ts           # Main application class
    └── core/
        ├── Camera.ts    # Camera management
        ├── Controls.ts  # OrbitControls wrapper
        ├── Renderer.ts  # WebGPU renderer management
        └── Scene.ts     # Scene management
```

## Key Features

### 🎯 Manager Pattern

- **Separation of Concerns**: Each component has a dedicated manager
- **Clean Architecture**: Easy to maintain and extend
- **Reusable Components**: Managers can be used across different projects

### 🚀 WebGPU Rendering

- **Modern Graphics**: Uses Three.js WebGPU renderer
- **High Performance**: Optimized for fluid simulations
- **Future-Proof**: Next-generation graphics API

### 🎮 Interactive Controls

- **OrbitControls**: Mouse/touch camera controls
- **Smooth Damping**: Natural camera movement
- **Responsive Design**: Adapts to window resizing

## Architecture Overview

### App Class

- **Central Controller**: Orchestrates all managers
- **Lifecycle Management**: Handles initialization and cleanup
- **Animation Loop**: Manages the render loop with proper cleanup

### Core Managers

#### SceneManager

- Manages Three.js scene
- Object addition/removal
- Background color setup

#### CameraManager

- Perspective camera setup
- Aspect ratio handling
- Position configuration

#### RendererManager

- WebGPU renderer initialization
- DOM element management
- Responsive resizing

#### ControlsManager

- OrbitControls configuration
- Damping and limits setup
- Update loop integration

## Usage

1. **Initialize**: Creates all managers and sets up the scene
2. **Add Objects**: Use `sceneManager.add()` to add 3D objects
3. **Animation**: Automatic render loop with controls update
4. **Cleanup**: Proper resource management with `cleanup()`

## Next Steps

This architecture provides a solid foundation for building complex fluid simulations. The manager pattern makes it easy to add new features like:

- Particle systems
- Shader materials
- Physics simulations
- Post-processing effects
