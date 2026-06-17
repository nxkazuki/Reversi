/**
 * Reversi Opening Book (Joseki) - 強化版 v2.0
 *
 * 表記規則：
 *   列は A〜H（左から）、行は 1〜8（上から）
 *   例) F5 = F列5行 = 標準的な第1手
 *
 * weight の意味：
 *   3 = 最善・主要定石（最優先で使用）
 *   2 = 標準変化・互角
 *   1 = 特殊・回避推奨（相手対策用）
 *
 * 手順はすべて大文字統一。
 * 対称変換（回転・鏡映）は reversi.js 側で処理されるため、
 * ここでは F5 始まりの代表形のみを収録する。
 *
 * 収録定石系統：
 *   縦取り系 (F5F6) : ローズ、Shrimp、Lollipop
 *   斜め取り系 (F5D6): 虎、牛、ローズD6、アイリッシュ、Bat
 *   横取り系 (F5E6) : 横取り基本形
 */

const joseki = [

  // ============================================================
  // ■ 縦取り（Parallel Opening）系  F5F6
  //   現代トップレベルで最も研究されている進行
  // ============================================================

  // --- ローズ進行 (Rose / Lollipop) ---
  // F5F6E6F4E3 共通幹
  { move: "F5F6E6F4E3C5", weight: 3 },
  { move: "F5F6E6F4E3C5C4", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6B5", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6B5C3", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6B5C3B4", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6B5C3B4A4", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6B5C3B4A4A5", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6B5C3B4A4A5A3", weight: 2 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6B5C3B4A4A5B3", weight: 2 },

  // G5 変化（Shrimp 幹）
  { move: "F5F6E6F4E3C5G5", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7C4", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7C4E2", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7C4E2D7", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7C4E2D7C6", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7C4E2D7C6C5", weight: 2 },
  { move: "F5F6E6F4E3C5G5D3D6F7C4E2C3B3", weight: 2 },
  { move: "F5F6E6F4E3C5G5D6G6H6F7D3", weight: 3 },
  { move: "F5F6E6F4E3C5G5D6G6H6F7D3C4", weight: 3 },
  { move: "F5F6E6F4E3C5G5D6G6H6F7D3C4B4", weight: 3 },
  { move: "F5F6E6F4E3C5G5D6G6H6F7D3C4B4C3", weight: 2 },
  { move: "F5F6E6F4E3C5G5G3G4F3", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4C3", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4C3B3", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4C3B3A3", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4C3B3A3A4", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4C3B3A3A4B5", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4C3B3A3A4B5B6", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6D6B4C3B3A3A4B5B6A6", weight: 3 },

  // --- Shrimp 進行 ---
  { move: "F5F6E6F4E3C5G5F3G4G6", weight: 3 },
  { move: "F5F6E6F4E3C5G5F3G4G6H5", weight: 3 },
  { move: "F5F6E6F4E3C5G5F3G4G6H5G3", weight: 3 },
  { move: "F5F6E6F4E3C5G5F3G4G6H5G3H4", weight: 2 },
  { move: "F5F6E6F4E3C5G5F3G4G6H6F7", weight: 3 },
  { move: "F5F6E6F4E3C5G5F3G4G6H6F7G7", weight: 3 },
  { move: "F5F6E6F4E3C5G5F3G4G6H6F7G7H7", weight: 2 },

  // --- C6 変化（縦取り後）---
  { move: "F5F6E6F4E3C5C6", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7G6", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7G6D3", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7G6D3C4", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7G6D3C4C3", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7G6D3C4C3B3", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7G6D3C4C3B3B4", weight: 2 },
  { move: "F5F6E6F4E3C5C6D6E7F7G6D3C4C3B3B4A4", weight: 2 },

  // --- 縦取り D3 変化 ---
  { move: "F5F6E6F4E3D3", weight: 2 },
  { move: "F5F6E6F4E3D3C4C5", weight: 2 },
  { move: "F5F6E6F4E3D3C4C5B4", weight: 2 },
  { move: "F5F6E6F4E3D3C4C5B4D6G5", weight: 2 },
  { move: "F5F6E6F4E3D3C4C5B4D6G5C3", weight: 2 },

  // --- 縦取り後 G4 変化 ---
  { move: "F5F6E6F4G4", weight: 2 },
  { move: "F5F6E6F4G4E3C5G5", weight: 2 },
  { move: "F5F6E6F4G4H5G3G5", weight: 2 },
  { move: "F5F6E6F4G4H5G3G5H3", weight: 2 },

  // ============================================================
  // ■ 斜め取り（Diagonal Opening）系  F5D6
  //   互角の研究が豊富な最重要進行
  // ============================================================

  // --- 虎進行（Tiger）幹：F5D6C3D3C4F4C5 ---
  { move: "F5D6C3D3C4F4C5", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7C7", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7C7E7", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7C7E7E8", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7C7E7E8B6", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7C7E7E8B6D8", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7C7E7E8B6D8F8", weight: 3 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3E6C6F6A5A4B5A6D7C7E7E8B6D8F8C8", weight: 3 },

  // 虎：B3からの分岐
  { move: "F5D6C3D3C4F4C5B3C2B4E3D2", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3D2C6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3D2C6F6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3D2C6F6G5", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2E6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2E6C6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2E6C6F6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2E6C6F6G6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2E6C6F6G6G5", weight: 2 },

  // 虎：E6 変化（早期 E6）
  { move: "F5D6C3D3C4F4C5E6", weight: 2 },
  { move: "F5D6C3D3C4F4C5E6F6G5", weight: 2 },
  { move: "F5D6C3D3C4F4C5E6F6G5G4", weight: 2 },
  { move: "F5D6C3D3C4F4C5E6F6G5G4H3", weight: 2 },
  { move: "F5D6C3D3C4F4C5E6F3G4G5H5", weight: 2 },
  { move: "F5D6C3D3C4F4C5E6F3G4G5H5H6", weight: 2 },

  // --- 虎 B3 系（Tiger B3 variation）---
  { move: "F5D6C3D3C4B3", weight: 3 },
  { move: "F5D6C3D3C4B3C6", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6F6", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6F6G6", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6F6G6G5", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6F6G6G5H5", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6F6G6G5H5H4", weight: 2 },
  { move: "F5D6C3D3C4B3C6F4E6C5B5G6", weight: 3 },
  { move: "F5D6C3D3C4B3C6F4E6C5B5G6F6", weight: 3 },
  { move: "F5D6C3D3C4B3C6F4E6C5B5G6F6G5", weight: 2 },
  { move: "F5D6C3D3C4B3C2B4A3A4", weight: 2 },
  { move: "F5D6C3D3C4B3C2B4A3A4B5", weight: 2 },

  // --- 牛進行（Buffalo / Cow）幹：F5D6C3D3C4F4F6 ---
  { move: "F5D6C3D3C4F4F6G5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5B4", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5B4C6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5B4C6H6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5B4C6H6H5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5B4C6H6H5H7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5B4C6H6H5H7G7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6D7E7C5B5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6D7E7C5B5C6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6D7E7C5B5C6B4", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6D7E7C5B5C6B4B3", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6D7E7C5B5C6B4B3A3", weight: 2 },
  { move: "F5D6C3D3C4F4F6G6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4C6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4C6B3", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4C6B3A3", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4C6B3A3B5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6B4", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6B4G5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6B4G5H5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6B4G5H5B3", weight: 2 },

  // 牛：F7 変化
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5G5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5G5H5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5G5H5G4", weight: 2 },

  // --- ローズ進行（D6系、Rose D6）---
  // F5D6C5F4E3C6 幹
  { move: "F5D6C5F4E3C6", weight: 3 },
  { move: "F5D6C5F4E3C6D3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4A3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4A3A4", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4A3A4B5", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4A3A4B5A5", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4A3A4B5A5A6", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4B3", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4B3B4", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4B3B4A3", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4B3B4A3A4", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4B3B4A3A4B5", weight: 2 },
  { move: "F5D6C5F4E3C6E6F6G5", weight: 2 },
  { move: "F5D6C5F4E3C6E6F6G5G4", weight: 2 },
  { move: "F5D6C5F4E3C6E6F6G5G4H3", weight: 2 },

  // --- アイリッシュ進行（Irish / C4 Opening）---
  { move: "F5D6C4", weight: 2 },
  { move: "F5D6C4D3", weight: 2 },
  { move: "F5D6C4D3C5", weight: 2 },
  { move: "F5D6C4D3C5B4", weight: 2 },
  { move: "F5D6C4D3C5B4C6", weight: 2 },
  { move: "F5D6C4D3C5B4C6E6", weight: 2 },
  { move: "F5D6C4D3C5B4C6E6F6", weight: 2 },
  { move: "F5D6C4D3C5B4C6E6F6G5", weight: 2 },
  { move: "F5D6C4D3C5B4C6E6F6G5B3", weight: 2 },
  { move: "F5D6C4D3C3C6", weight: 2 },
  { move: "F5D6C4D3C3C6E6", weight: 2 },
  { move: "F5D6C4D3C3C6E6F4", weight: 2 },
  { move: "F5D6C4D3C3C6E6F4F6", weight: 2 },
  { move: "F5D6C4D3C3C6E6F4F6G5", weight: 2 },
  { move: "F5D6C4E3", weight: 2 },
  { move: "F5D6C4E3F4", weight: 2 },
  { move: "F5D6C4E3F4C3", weight: 2 },
  { move: "F5D6C4E3F4C3D3", weight: 2 },
  { move: "F5D6C4E3F4C3D3C5", weight: 2 },
  { move: "F5D6C4E3F4C3D3C5B4", weight: 2 },

  // --- Bat Opening（E3 系）---
  { move: "F5D6E3", weight: 2 },
  { move: "F5D6E3F4", weight: 2 },
  { move: "F5D6E3F4C5", weight: 2 },
  { move: "F5D6E3F4C5D3", weight: 2 },
  { move: "F5D6E3F4C5D3C4", weight: 2 },
  { move: "F5D6E3F4C5D3C4C6", weight: 2 },
  { move: "F5D6E3F4C5D3C4C6D7", weight: 2 },
  { move: "F5D6E3F4C5D3C4C6D7E6", weight: 2 },
  { move: "F5D6E3F4C5D3C4C6D7E6F6", weight: 2 },
  { move: "F5D6E3F4D3C3", weight: 2 },
  { move: "F5D6E3F4D3C3C4", weight: 2 },
  { move: "F5D6E3F4D3C3C4C5", weight: 2 },
  { move: "F5D6E3F4D3C3C4C5B4", weight: 2 },
  { move: "F5D6E3F4D3C3C4C5B4B5", weight: 2 },

  // --- 斜め取り E6 変化（D6系 → E6）---
  { move: "F5D6E6F4", weight: 2 },
  { move: "F5D6E6F4C5D3", weight: 2 },
  { move: "F5D6E6F4C5D3C4", weight: 2 },
  { move: "F5D6E6F4C5D3C4C3", weight: 2 },
  { move: "F5D6E6F4C5D3C4C3B3", weight: 2 },
  { move: "F5D6E6F4F6G6G5", weight: 2 },
  { move: "F5D6E6F4F6G6G5H4", weight: 2 },

  // ============================================================
  // ■ 横取り（Perpendicular Opening）系  F5E6
  //   特殊進行・罠系が多い
  // ============================================================

  { move: "F5E6F4", weight: 2 },
  { move: "F5E6F4F6", weight: 2 },
  { move: "F5E6F4F6G5", weight: 2 },
  { move: "F5E6F4F6G5E7", weight: 2 },
  { move: "F5E6F4F6G5E7D6", weight: 2 },
  { move: "F5E6F4F6G5E7D6G4", weight: 2 },
  { move: "F5E6F4F6G5E7D6G4H3", weight: 2 },
  { move: "F5E6F4F6G5E7D6G4H3G6", weight: 2 },
  { move: "F5E6F4D6E7C6G4", weight: 2 },
  { move: "F5E6F4D6E7C6G4G5", weight: 2 },
  { move: "F5E6F4D6E7C6G4G5H4", weight: 2 },
  { move: "F5E6F4D3E3", weight: 2 },
  { move: "F5E6F4D3E3G4", weight: 2 },
  { move: "F5E6F4D3E3G4C3", weight: 2 },
  { move: "F5E6F4D3E3G4C3D2", weight: 2 },
  { move: "F5E6F6D6C5D3E3", weight: 2 },
  { move: "F5E6F6D6C5D3E3C3", weight: 2 },
  { move: "F5E6F6D6C5D3E3C3C4", weight: 2 },
  { move: "F5E6G5D6C5F4E3", weight: 2 },
  { move: "F5E6G5D6C5F4E3C6", weight: 2 },
  { move: "F5E6G5D6C5F4E3C6D3", weight: 2 },

  // ============================================================
  // ■ weight 1：特殊・回避推奨系
  //   定石ライン外への誘導、または明確に不利な変化
  //   相手の奇手・罠対策として収録
  // ============================================================

  // 古いギャンビット系・罠系
  { move: "F5D6C3D3C4F4C5B3C2E3D2C6B4A3", weight: 1 },
  { move: "F5D6C3D3C4F4C5F6", weight: 1 },
  { move: "F5F6E6F4E3C5C4E7G4G3G5F3G6D6E2H5F7", weight: 1 },
  { move: "F5D6C3C4D3C5B4", weight: 1 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3D2C6B4A3B5", weight: 1 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5B5", weight: 1 },
  { move: "F5D6E3F6G5D3C4C5B4", weight: 1 },

];
