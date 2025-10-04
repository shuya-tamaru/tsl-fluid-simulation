# 06-density - SPH 密度計算

> [English version is here](README.md)

TSL コンピュートシェーダーを使用して SPH（Smoothed Particle Hydrodynamics）密度計算を実装し、圧力計算の準備を行うプロジェクトです。

## プロジェクト構造

```
src/
├── main.ts
└── app/
    ├── App.ts                    # 密度計算対応メインアプリケーション
    ├── core/                     # コアマネージャー（前のプロジェクトから）
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # 境界コンテナ
    │   └── sph/
    │       ├── Particle.ts       # 密度バッファ付きパーティクルシステム
    │       ├── SPHConfig.ts      # カーネル関数を含むSPHパラメータ
    │       └── calculate/
    │           ├── density.ts    # TSL密度計算コンピュートシェーダー
    │           └── integrate.ts  # 物理積分（前のプロジェクトから）
    └── types/
        ├── UniformType.ts        # TSLユニフォーム型
        └── BufferType.ts         # ストレージバッファ型
```

## 主な特徴

### 🔬 SPH 密度計算

- **Poly6 カーネル**: 密度補間用の平滑化カーネル
- **近傍探索**: 全対全パーティクル相互作用計算
- **GPU 並列化**: 5,000 パーティクルを同時計算
- **リアルタイム更新**: 毎フレーム密度を計算

### 📊 SPH パラメータ

- **平滑化長（h）**: 近傍影響用カーネル半径
- **Poly6 カーネル係数**: 正規化重み関数
- **質量**: 密度寄与用パーティクル質量
- **カーネルべき乗**: 効率性のための事前計算 h²、h³、h⁶、h⁹

### ⚡ コンピュートシェーダー実装

- **デュアルパスパイプライン**: 密度計算 → 物理積分
- **ストレージバッファ**: 位置、速度、密度データ
- **ループベース近傍探索**: 効率的な GPU 計算
- **非同期同期**: 適切な GPU コンピュート完了

## 技術実装

### SPH 密度公式

```typescript
// Poly6カーネルを使用したSPH密度計算
ρᵢ = Σⱼ mⱼ W(|rᵢ - rⱼ|, h)
```

### TSL コンピュートシェーダー

```typescript
// 各パーティクルの密度計算
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

### Poly6 カーネル関数

```typescript
// SPH Poly6平滑化カーネル
W(r, h) = (315 / (64πh⁹)) × (h² - r²)³  もし r < h
W(r, h) = 0                             もし r ≥ h
```

## SPH 設定

### SPHConfig パラメータ

- **mass**: パーティクル質量（0.4）
- **h**: 平滑化長（1.0）
- **delta**: タイムステップ（1/60 秒）
- **restitution**: 衝突弾性（0.8）

### カーネル計算

- **h², h³, h⁶, h⁹**: 事前計算されたカーネルべき乗
- **poly6Kernel**: 正規化 Poly6 係数（315/(64πh⁹)）

## コンピュートパイプライン

### デュアルパスシステム

```typescript
public async compute() {
  await this.computeDensity();    // パス1: 密度計算
  await this.computeIntegrate();  // パス2: 物理積分
}
```

### バッファ管理

- **positionsBuffer**: パーティクル位置（vec3 配列）
- **velocitiesBuffer**: パーティクル速度（vec3 配列）
- **densitiesBuffer**: 計算された密度（float 配列）

## パフォーマンス特徴

### GPU 最適化

- **並列密度計算**: 全パーティクルを同時計算
- **効率的近傍探索**: ループベース全対全計算
- **メモリコアレッシング**: 最適化されたバッファアクセスパターン
- **非同期コンピュート**: 非ブロッキング GPU 操作

### SPH 効率性

- **カーネル事前計算**: 数学定数を一度だけ計算
- **条件分岐**: 近傍パーティクルのみ計算
- **ベクトル化操作**: GPU 最適化された数学操作

## 次のステップ

この密度計算基盤により以下が可能になります：

- **圧力計算**: 計算された密度を使用した圧力勾配
- **粘性力**: 速度ベースパーティクル相互作用
- **表面張力**: 界面検出と表面力
- **高度なカーネル**: Spiky、Viscosity、カスタムカーネル関数
- **空間最適化**: O(n)近傍探索用の空間ハッシュ
