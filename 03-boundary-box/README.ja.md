# 03-boundary-box - 流体シミュレーション境界コンテナ

> [English version is here](README.md)

Three.js TSL（Three.js Shading Language）を使用して、高度なシェーダー効果で流体パーティクルシミュレーション用の境界ボックスを実装したプロジェクトです。

## プロジェクト構造

```
src/
├── main.ts
└── app/
    ├── App.ts                    # メインアプリケーション
    ├── core/                     # コアマネージャー（02-app-structureから）
    ├── simulation/
    │   └── boundary/
    │       └── BoundaryBox.ts    # TSLシェーダー付き境界ボックス
    └── types/
        └── UniformType.ts        # TypeScript型定義
```

## 主な特徴

### 🎯 Three.js TSL 統合

- **モダンシェーディング言語**: GPU ベースの計算に Three.js TSL を使用
- **ノードベースマテリアル**: ノードマテリアルによる視覚的シェーダープログラミング
- **リアルタイムシェーダー効果**: エッジ検出に基づく動的不透明度

### 📦 境界ボックスシステム

- **設定可能な寸法**: 幅、高さ、深さを調整可能
- **エッジのみレンダリング**: ボックスのエッジのみが表示（ワイヤーフレーム効果）
- **ユニフォーム統合**: 動的パラメータ制御用の TSL ユニフォーム

### 🎨 高度なシェーダーテクニック

- **エッジ検出**: シェーダー内での数学的エッジ検出
- **位置ベース不透明度**: フラグメントごとの計算に`positionLocal`を使用
- **論理演算**: AND/OR 演算を含む複雑なシェーダーロジック

## 技術実装

### TSL シェーダーコード

```typescript
// TSLでのエッジ検出ロジック
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

### 境界ボックスの特徴

- **両面レンダリング**: `side: THREE.DoubleSide`
- **透明度サポート**: `transparent: true`
- **エッジ幅制御**: 設定可能なエッジの厚さ
- **ユニフォームアクセス**: サイズ操作用のパブリックメソッド

## 使用方法

1. **初期化**: デフォルト寸法（32×16×16）で境界ボックスを作成
2. **シーン追加**: 境界ボックスが自動的にシーンに追加される
3. **インタラクティブ**: OrbitControls を使用してあらゆる角度から境界を観察
4. **設定可能**: 動的変更用のサイズユニフォームにアクセス可能

## 主要コンポーネント

### BoundaryBoxManager

- **ジオメトリ作成**: TSL ユニフォーム寸法を使用した BoxGeometry
- **マテリアルセットアップ**: TSL ベースの不透明度シェーダー
- **シーン統合**: Three.js シーンへのシームレスな追加
- **サイズ管理**: 寸法とユニフォームノード用のゲッターメソッド

### TSL ユニフォーム

- **widthNode**: ボックス幅（デフォルト: 32）
- **heightNode**: ボックス高さ（デフォルト: 16）
- **depthNode**: ボックス深さ（デフォルト: 16）

## 次のステップ

この境界ボックスは流体パーティクルシミュレーションの基盤として機能します：

- **パーティクル封じ込め**: パーティクルはこの境界内に制約される
- **衝突検出**: 境界壁がパーティクルを反射する
- **体積定義**: 流体力学のシミュレーション空間を定義
- **シェーダー統合**: パーティクルシステムシェーダー統合の準備完了
