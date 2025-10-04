# 05-compute - TSL コンピュートシェーダー物理シミュレーション

> [English version is here](README.md)

Three.js TSL（Three.js Shading Language）コンピュートシェーダーを使用して、リアルタイム GPU ベース計算によるパーティクル物理シミュレーションを実装したプロジェクトです。

## プロジェクト構造

```
src/
├── main.ts
└── app/
    ├── App.ts                    # 非同期コンピュート対応メインアプリ
    ├── core/                     # コアマネージャー（前のプロジェクトから）
    ├── simulation/
    │   ├── boundary/
    │   │   └── BoundaryBox.ts    # 境界コンテナ
    │   └── sph/
    │       ├── Particle.ts       # コンピュートシェーダー付きパーティクルシステム
    │       ├── SPHConfig.ts      # シミュレーションパラメータ
    │       └── calculate/
    │           └── integrate.ts   # 物理計算用TSLコンピュートシェーダー
    └── types/
        ├── UniformType.ts        # TSLユニフォーム型
        └── BufferType.ts         # ストレージバッファ型
```

## 主な特徴

### 🚀 TSL コンピュートシェーダー

- **GPU 物理計算**: リアルタイムパーティクル物理計算を GPU で実行
- **並列処理**: 5,000 パーティクルを同時計算
- **高性能**: WebGPU コンピュート機能を活用

### ⚡ 物理シミュレーション

- **重力**: 現実的な重力力（-9.8 m/s²）
- **境界衝突**: 境界壁との弾性衝突
- **速度積分**: Verlet 形式の位置と速度更新
- **設定可能パラメータ**: 調整可能なタイムステップと反発係数

### 🔄 非同期コンピュートパイプライン

- **適切な同期**: GPU コンピュート完了のための`async/await`
- **データ整合性**: 常に最新の計算位置でレンダリング
- **安定フレームレート**: 予測可能なアニメーションループタイミング

## 技術実装

### コンピュートシェーダー物理

```typescript
// パーティクル積分用TSLコンピュートシェーダー
const gravity = vec3(0, -9.8, 0);
const acceleration = gravity;
const newVel = vel.add(acceleration.mul(float(delta)));
const newPos = pos.add(newVel.mul(float(delta)));
```

### 境界衝突検出

```typescript
// 境界壁との衝突
If(abs(newPos.x).greaterThan(boxWidth.div(2)), () => {
  newPos.x.assign(boxWidth.div(2).mul(sign(newPos.x)));
  const dumpVel = newVel.x.mul(-1.0).mul(float(1.0 - restitution));
  newVel.x.assign(dumpVel);
});
```

### 非同期コンピュート統合

```typescript
private animate = async (): Promise<void> => {
  await this.particles.compute(); // GPUコンピュート完了まで待機
  this.rendererManager.render(scene, camera); // 新しいデータでレンダリング
};
```

## 物理パラメータ

### SPHConfig

- **mass**: パーティクル質量（0.4）
- **delta**: タイムステップ（1/60 秒）
- **restitution**: 衝突弾性（0.8）

### シミュレーション動作

- **重力**: 一定の下向き加速度
- **境界バウンス**: 反発係数による弾性衝突
- **リアルタイム更新**: 60FPS 物理シミュレーション

## 主要コンポーネント

### ParticleManager

- **デュアルバッファ**: 位置と速度の分離ストレージバッファ
- **コンピュートパイプライン**: 非同期コンピュートシェーダー実行
- **シーン統合**: 計算位置による InstancedMesh レンダリング

### コンピュートシェーダー関数

- **initializeParticlePositions**: ランダムパーティクル配置
- **computeIntegrate**: 衝突検出を含む物理積分
- **Boundary Constraints**: 壁衝突とバウンス

### 非同期アニメーションループ

- **適切な同期**: レンダリング前の GPU コンピュート完了
- **データ整合性**: フレーム間での一貫したパーティクル位置
- **パフォーマンス最適化**: 効率的な GPU 活用

## パフォーマンス特徴

### GPU コンピュートパイプライン

- **並列実行**: 全パーティクルを同時計算
- **ストレージバッファ**: 効率的な GPU メモリ管理
- **非同期操作**: 適切な同期による非ブロッキングコンピュート

### メモリ管理

- **バッファ再利用**: GPU バッファ内の位置と速度データ
- **インスタンスレンダリング**: 全パーティクル用の単一描画コール
- **効率的な更新**: コンピュートシェーダーによる直接バッファ操作
