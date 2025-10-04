# 04-particle - SPH パーティクルシステム基盤

> [English version is here](README.md)

Three.js InstancedMesh と TSL コンピュートシェーダーを使用して、ランダムなパーティクル配置を行う SPH（Smoothed Particle Hydrodynamics）シミュレーション用のパーティクルシステム基盤です。

## プロジェクト構造

```
src/
├── main.ts
└── app/
    ├── App.ts                    # パーティクル統合メインアプリケーション
    ├── core/                     # コアマネージャー（前のプロジェクトから）
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # 境界コンテナ
    │   └── sph/
    │       └── Particle.ts       # パーティクルシステムマネージャー
    └── types/
        ├── UniformType.ts        # TSLユニフォーム型
        └── BufferType.ts         # ストレージバッファ型
```

## 主な特徴

### 🎯 InstancedMesh パーティクルシステム

- **高性能**: 単一の描画コールで 5,000 パーティクルをレンダリング
- **GPU インスタンシング**: Three.js InstancedMesh による効率的なレンダリング
- **スケーラブル**: 複雑なシミュレーション用にパーティクル数を簡単に増加可能

### 🎲 ランダムパーティクル配置

- **TSL コンピュートシェーダー**: GPU ベースのランダム位置生成
- **ハッシュベースランダム性**: 決定論的だが疑似ランダムな分布
- **境界制約**: 境界ボックス寸法内にパーティクルを配置

### 🎨 高度なシェーダー効果

- **動的ライティング**: シェーダー内でのパーティクルごとのライティング計算
- **位置ベースレンダリング**: インスタンス位置用の TSL 位置ノード
- **カスタムカラーノード**: 環境光と拡散光効果

## 技術実装

### パーティクル初期化

```typescript
// ランダム配置用TSLコンピュートシェーダー
const x = hash(instanceIndex.mul(3)).sub(0.5).mul(float(this.boxWidth));
const y = hash(instanceIndex.mul(5)).sub(0.5).mul(float(this.boxHeight));
const z = hash(instanceIndex.mul(7)).sub(0.5).mul(float(this.boxDepth));
```

### InstancedMesh セットアップ

```typescript
this.sphereMesh = new THREE.InstancedMesh(
  this.sphereGeometry,
  this.sphereMaterial,
  this.particleCount // 5,000インスタンス
);
```

### シェーダーベースライティング

```typescript
// フラグメントごとのライティング計算
const diffuse = max(normal.dot(lightDir), float(0.0));
const baseColor = vec3(0.0, 0.0, 1.0);
return baseColor.mul(ambient).add(baseColor.mul(diffuse));
```

## 主要コンポーネント

### ParticleManager

- **バッファ管理**: パーティクル位置用 TSL ストレージバッファ
- **ジオメトリ作成**: 個別パーティクル用球体ジオメトリ
- **マテリアルセットアップ**: TSL ベースの位置とカラーノード
- **シーン統合**: Three.js シーンへのシームレスな追加

### パーティクル設定

- **数**: 5,000 パーティクル（設定可能）
- **サイズ**: 球体半径 0.15 単位
- **ジオメトリ**: 10×10 球体解像度
- **色**: ライティング効果付きブルーパーティクル

### 境界統合

- **サイズ同期**: パーティクル境界が境界ボックス寸法と一致
- **制約システム**: コンテナ内にパーティクルを分布
- **ユニフォーム共有**: パーティクル配置用の境界サイズユニフォーム使用

## パフォーマンス特徴

### GPU コンピュートパイプライン

- **非同期初期化**: 非ブロッキングパーティクル位置生成
- **ストレージバッファ**: 効率的な GPU メモリ管理
- **単一描画コール**: 全パーティクルを 1 パスでレンダリング

### メモリ最適化

- **インスタンスレンダリング**: 全パーティクル間でのジオメトリ共有
- **バッファ再利用**: 位置データを GPU バッファに保存
- **効率的な更新**: 将来の SPH 更新用の直接バッファ操作

## 次のステップ

この基盤は SPH シミュレーション実装の準備をします：

- **物理統合**: 速度と力の計算を追加
- **近傍探索**: パーティクル相互作用用の空間ハッシュ実装
- **密度計算**: SPH 密度と圧力計算
- **衝突検出**: 境界衝突と応答
- **時間積分**: パーティクル移動用の Verlet または RK4 積分
