# 01setup - Three.js Minimal Setup

> [日本語版はこちら](README.ja.md)

A minimal Three.js project setup for fluid simulation development.

## Setup Steps

### 1. Initialize Project

```bash
npm create vite@latest . -- --template vanilla-ts
```

### 2. Clean Up Files

- Remove sample files generated initially
- Organize into minimal file structure

### 3. Install Three.js

```bash
# Three.js core
npm i three

# TypeScript type definitions
npm i --save-dev @types/three
```

## Final Setup

- ✅ Vite + TypeScript environment
- ✅ Three.js + type definitions
- ✅ Minimal file structure
- ✅ Development server ready

In the next section, we'll use this environment to create a basic Three.js scene.
