# 07-pressure-force - SPH 圧力計算

> [English version is here](README.md)

TSL コンピュートシェーダーを使用して SPH（Smoothed Particle Hydrodynamics）圧力計算を実装し、SPH シミュレーションパイプラインを完成させたプロジェクトです。

## プロジェクト構造

```
src/
├── main.ts
└── app/
    ├── App.ts                    # 圧力計算対応メインアプリケーション
    ├── core/                     # コアマネージャー（前のプロジェクトから）
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # 境界コンテナ
    │   └── sph/
    │       ├── Particle.ts       # 完全なSPHパーティクルシステム
    │       ├── SPHConfig.ts      # 拡張されたSPHパラメータ
    │       └── calculate/
    │           ├── density.ts    # 密度計算（前のプロジェクトから）
    │           ├── pressure.ts   # 密度からの圧力計算
    │           ├── pressureForce.ts # 圧力勾配計算
    │           └── integrate.ts  # 力による物理積分
    └── types/
        ├── UniformType.ts        # TSLユニフォーム型
        └── BufferType.ts         # ストレージバッファ型
```

## 主な特徴

### 🧮 完全な SPH パイプライン

- **4 パス計算**: 密度 → 圧力 → 圧力 → 積分
- **Spiky カーネル**: Spiky カーネルを使用した圧力勾配計算
- **状態方程式**: 圧力計算用の理想気体の法則
- **力積分**: パーティクル運動に圧力を適用

### 📊 拡張された SPH パラメータ

- **静止密度**: 圧力計算用の参照密度
- **圧力剛性**: 圧縮性パラメータ（100）
- **Spiky カーネル**: 圧力勾配計算用の勾配カーネル
- **力バッファ**: 圧力用の専用ストレージ

### ⚡ 高度なコンピュートシェーダー

- **圧力計算**: 状態方程式の実装
- **力勾配**: Spiky カーネル勾配計算
- **マルチバッファパイプライン**: 完全な SPH 状態用の 5 つのストレージバッファ
- **非同期同期**: 適切な GPU コンピュート完了

## 技術実装

### SPH 圧力状態方程式

```typescript
// 圧力計算用の理想気体の法則
P = k × (ρ - ρ₀)
// ここで k = 圧力剛性、ρ₀ = 静止密度
```

### 圧力勾配

```typescript
// Spikyカーネル勾配を使用したSPH圧力
F_pressure = -m² × Σⱼ (Pᵢ/ρᵢ² + Pⱼ/ρⱼ²) × ∇W_spiky
```

### TSL コンピュートシェーダー

#### 圧力計算

```typescript
const pressure = float(pressureStiffness).mul(rho0.sub(restDensity));
pressure_i.assign(pressure);
```

#### 圧力計算

```typescript
const gradW = float(spiky).mul(t.mul(t)).mul(_dir);
const term = pressure_i
  .div(density_i.mul(density_i))
  .add(press_j.div(rhoj.mul(rhoj)));
const fi = float(mass).mul(float(mass)).mul(term).mul(gradW);
```

## SPH 設定

### 拡張された SPHConfig パラメータ

- **mass**: パーティクル質量（0.4）
- **h**: 平滑化長（1.0）
- **restDensity**: 参照密度（1.0）
- **pressureStiffness**: 圧縮性（100）
- **delta**: タイムステップ（1/60 秒）
- **restitution**: 衝突弾性（0.8）

### カーネル関数

- **Poly6 カーネル**: 密度計算（315/(64πh⁹)）
- **Spiky カーネル**: 圧力勾配（-45/(πh⁶)）

## 完全なコンピュートパイプライン

### 4 パス SPH システム

```typescript
public async compute() {
  await this.computeDensity();        // パス1: 密度計算
  await this.computePressure();       // パス2: 圧力計算
  await this.computePressureForce();  // パス3: 圧力計算
  await this.computeIntegrate();      // パス4: 力による積分
}
```

### バッファ管理

- **positionsBuffer**: パーティクル位置（vec3 配列）
- **velocitiesBuffer**: パーティクル速度（vec3 配列）
- **densitiesBuffer**: 計算された密度（float 配列）
- **pressuresBuffer**: 計算された圧力（float 配列）
- **pressureForcesBuffer**: 計算された圧力（vec3 配列）

## 物理実装

### 圧力物理

- **Spiky カーネル**: 滑らかな圧力勾配用の勾配カーネル
- **近傍相互作用**: 全対全パーティクル力計算
- **質量保存**: 力計算での適切な質量重み付け
- **数値安定性**: 除算安全性のための密度クランプ

### 力による積分

- **力蓄積**: 圧力がパーティクル加速度に追加
- **境界衝突**: 反発係数による弾性衝突
- **時間積分**: Verlet 形式の位置と速度更新

## パフォーマンス特徴

### GPU 最適化

- **5 バッファシステム**: GPU メモリ内の完全な SPH 状態
- **並列計算**: 全パーティクルを同時計算
- **効率的なカーネル**: 最適化された Spiky カーネル実装
- **メモリコアレッシング**: 最適化されたバッファアクセスパターン

### SPH 効率性

- **カーネル事前計算**: 数学定数を一度だけ計算
- **条件分岐**: 近傍パーティクルのみ計算
- **ベクトル化操作**: GPU 最適化された数学操作
- **非同期パイプライン**: 非ブロッキングマルチパス計算
