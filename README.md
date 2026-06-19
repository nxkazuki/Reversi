🚀 Advanced Reversi Engine (Super Hard Mode)
A high-performance, algorithm-driven Reversi AI engine implemented in JavaScript.

概要
このプロジェクトは、単なるリバーシのゲームプログラムではありません。プロフェッショナルなAIアルゴリズムを駆使し、JavaScript環境において最大限のパフォーマンスを引き出すために設計された「技術志向」のリバーシエンジンです。

**「技術的な挑戦（Technical Challenge）」**として開発されており、チェスや将棋などの高度なゲームで用いられる探索アルゴリズムをリバーシに最適化して実装しています。

✨ 主な特徴
このエンジンは以下の5つのコア・テクノロジーによって構成されています。

1. ビットボード (Bitboard Representation)
盤面の状態を64ビットの整数（BigInt）として管理します。これにより、反転判定や有効手リストの生成といった複雑な計算を極めて高速なビット演算で処理しています。

2. 高度な探索アルゴリズム
Negamax法 & Alpha-Beta pruning: 広大な探索木から無駄な枝を効率的に刈り取り、短時間で質の高い手を選択します。
Transposition Table (置き換えテーブル): 一度計算した盤面の状態を記憶し、再計算を防ぐことで探索の深さを最大化します。

3. 高速化のための最適化
Zobrist Hashing: 複雑な盤面状態を一意の数値に変換し、高速なハッシュ管理を実現。
TypedArrayによるメモリ最適化: Uint8Array や BigUint64Array を用いて評価テーブルを構築。JavaScriptエンジンにおけるガベージコレクションの負荷を抑えつつ、CPUキャッシュ効率を向上させています。

4. 定式（Joseki）の動的統合
あらかじめ定義された**「定式データ（Opening Book）」**を搭載。序盤において、高度な戦略（Tiger, Buffalo, Rose等）に基づいた最適な布陣を選択し、人間が陥りやすい「序盤の罠」を回避します。

5. 多角的評価関数 (Advanced Evaluation Function)
単純な石の数だけでなく、以下の要素を組み合わせた動的なスコアリングを行います。

Mobility（機動力）: 自分の手数を確保しつつ、相手の手を制限する。

Stability（安定性）: 角や辺の占有状況を評価。

Potential Mobility: 未確定領域を含めた潜在的な動きの予測。

🎮 難易度設定
Level 0 (Easy): 完全なランダム（初心者向け・学習用）

Level 1 (Normal): 基本的な位置評価と機動力に基づいた選択

Level 2 (Hard/Expert): 定式解析 ＋ 深層探索 ＋ TypedArray加速を用いた「最強モード」

🛠 技術スタック
Language: JavaScript (ES6+)

Logic: Bitboard, Negamax, Alpha-Beta Pruning, Zobrist Hashing

Optimization: TypedArrays, Move Ordering, Opening Book.

🚀 セットアップと実行方法
リポジトリをクローンまたはダウンロードします。

index.html をブラウザで開くか、ローカルサーバー（Live Server等）を立ち上げてください。

設定から難易度を選択し、AIとの対戦を開始してください。

📂 ディレクトリ構成
reversi.js: ゲームエンジン本体（ロジック全般）
joseki.js: 定式データセット（戦略的な序盤の選択用）
