# 08-viscosity - SPH 粘性力計算

> [English version is here](README.md)

TSL コンピュートシェーダーを使用して SPH（Smoothed Particle Hydrodynamics）粘性力計算を実装し、現実的な流体シミュレーションを完成させるために流体粘性効果を追加したプロジェクトです。

## プロジェクト構造

```
src/
├── main.ts
└── app/
    ├── App.ts                    # 粘性計算対応メインアプリケーション
    ├── core/                     # コアマネージャー（前のプロジェクトから）
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # 境界コンテナ
    │   └── sph/
    │       ├── Particle.ts       # 粘性付き完全SPHシステム
    │       ├── SPHConfig.ts      # 粘性を含む拡張SPHパラメータ
    │       └── calculate/
    │           ├── density.ts    # 密度計算
    │           ├── pressure.ts   # 圧力計算
    │           ├── pressureForce.ts # 圧力計算
    │           ├── viscosity.ts  # 粘性計算
    │           └── integrate.ts  # 全力による物理積分
    └── types/
        ├── UniformType.ts        # TSLユニフォーム型
        └── BufferType.ts         # ストレージバッファ型
```

## 主な特徴

### 🌊 完全な SPH 流体シミュレーション

- **5 パス計算**: 密度 → 圧力 → 圧力 → 粘性 → 積分
- **粘性力**: 現実的な流体動作のための速度ベースパーティクル相互作用
- **ラプラシアンカーネル**: 滑らかな速度拡散用の粘性カーネル
- **マルチ力積分**: 圧力と粘性の組み合わせ

### 📊 拡張された SPH パラメータ

- **粘性係数（μ）**: 流体粘性パラメータ（0.12）
- **粘性カーネル**: 速度平滑化用のラプラシアンカーネル
- **力バッファ**: 粘性用の専用ストレージ
- **完全な物理**: 主要な SPH 力すべてを実装

### ⚡ 高度なコンピュートパイプライン

- **粘性計算**: 速度差ベースの力計算
- **ラプラシアン平滑化**: カーネルベース速度拡散
- **6 バッファシステム**: 粘性を含む完全な SPH 状態
- **非同期同期**: 適切な GPU コンピュート完了

## 技術実装

### SPH 粘性力公式

```typescript
// ラプラシアンカーネルを使用したSPH粘性
F_viscosity = μ × m × Σⱼ (vⱼ - vᵢ) × ∇²W_viscosity / ρ_avg
```

### 粘性カーネル（ラプラシアン）

```typescript
// 速度平滑化用の粘性カーネル
∇²W_viscosity = (45 / (πh⁶)) × (h - r)  もし r < h
∇²W_viscosity = 0                        もし r ≥ h
```

### TSL コンピュートシェーダー実装

```typescript
// 粘性計算
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

## SPH 設定

### 完全な SPHConfig パラメータ

- **mass**: パーティクル質量（0.4）
- **h**: 平滑化長（1.0）
- **restDensity**: 参照密度（1.0）
- **pressureStiffness**: 圧縮性（100）
- **viscosityMu**: 粘性係数（0.12）
- **delta**: タイムステップ（1/60 秒）
- **restitution**: 衝突弾性（0.8）

### 完全なカーネル関数

- **Poly6 カーネル**: 密度計算（315/(64πh⁹)）
- **Spiky カーネル**: 圧力勾配（-45/(πh⁶)）
- **粘性カーネル**: 速度平滑化（45/(πh⁶)）

## 完全なコンピュートパイプライン

### 5 パス SPH システム

```typescript
public async compute() {
  await this.computeDensity();        // パス1: 密度計算
  await this.computePressure();       // パス2: 圧力計算
  await this.computePressureForce();  // パス3: 圧力計算
  await this.computeViscosity();      // パス4: 粘性計算
  await this.computeIntegrate();      // パス5: 全力による積分
}
```

### バッファ管理

- **positionsBuffer**: パーティクル位置（vec3 配列）
- **velocitiesBuffer**: パーティクル速度（vec3 配列）
- **densitiesBuffer**: 計算された密度（float 配列）
- **pressuresBuffer**: 計算された圧力（float 配列）
- **pressureForcesBuffer**: 計算された圧力（vec3 配列）
- **viscosityForcesBuffer**: 計算された粘性（vec3 配列）

## 物理実装

### 粘性物理

- **速度拡散**: パーティクル間の速度差を平滑化
- **ラプラシアン平滑化**: カーネルベース速度場平滑化
- **密度平均**: 力計算のための適切な密度重み付け
- **数値安定性**: 除算安全性のための密度クランプ

### マルチ力積分

- **力結合**: 圧力と粘性の組み合わせ
- **現実的な流体動作**: 粘性減衰と平滑化効果
- **境界衝突**: 反発係数による弾性衝突
- **時間積分**: Verlet 形式の位置と速度更新

## パフォーマンス特徴

### GPU 最適化

- **6 バッファシステム**: GPU メモリ内の完全な SPH 状態
- **並列計算**: 全パーティクルを同時計算
- **効率的なカーネル**: 最適化されたラプラシアンカーネル実装
- **メモリコアレッシング**: 最適化されたバッファアクセスパターン

### SPH 効率性

- **カーネル事前計算**: 数学定数を一度だけ計算
- **条件分岐**: 近傍パーティクルのみ計算
- **ベクトル化操作**: GPU 最適化された数学操作
- **非同期パイプライン**: 非ブロッキングマルチパス計算

## 流体シミュレーション効果

### 粘性効果

- **速度平滑化**: 速度変動の減少
- **流体減衰**: 運動に対する自然な流体抵抗
- **境界層**: 現実的な流体-壁相互作用
- **乱流減衰**: パーティクルクラスタリングの減少

### 完全な流体動作

- **圧力駆動流**: 密度ベース圧力
- **粘性減衰**: 速度ベース抵抗
- **重力統合**: 自然な流体沈降
- **衝突応答**: 現実的な境界相互作用
