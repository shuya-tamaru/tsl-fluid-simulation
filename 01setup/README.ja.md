# 01setup - Three.js 最小構成

> [English version is here](README.md)

Three.js を使った流体シミュレーション開発のための最小構成プロジェクトです。

## セットアップ手順

### 1. プロジェクト初期化

```bash
npm create vite@latest . -- --template vanilla-ts
```

### 2. 不要ファイルのクリーンアップ

- 初期生成されたサンプルファイルを削除
- 必要最小限のファイル構成に整理

### 3. Three.js インストール

```bash
# Three.js本体
npm i three

# TypeScript型定義
npm i --save-dev @types/three
```

## 完成構成

- ✅ Vite + TypeScript 環境
- ✅ Three.js + 型定義
- ✅ 最小限のファイル構成
- ✅ 開発サーバー準備完了

次のセクションでは、この環境を使って基本的な Three.js シーンを作成します。
