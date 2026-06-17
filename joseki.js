/**
 * Reversi Opening Book (Joseki) - 整理・強化版
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
 * 手順はすべて大文字統一。各エントリの重複は排除。
 * 対称変換（回転・鏡映）は reversi.js 側で処理されるため、
 * ここでは F5 始まりの代表形のみを収録する。
 */

const joseki = [

  // ============================================================
  // ■ 縦取り（Parallel Opening）系
  //   1手目 F5、2手目 F6（縦取り）
  //   現代トップレベルで最も研究されている進行
  // ============================================================

  // --- ローズ進行（Rose / Lollipop）---
  // 縦取り後 E6 → F4 → E3 → C5 と進む主流形
  { move: "F5F6E6F4E3C5", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6", weight: 3 },
  { move: "F5F6E6F4E3C5C4E7G4F3G5D3D6C6", weight: 3 },
  { move: "F5F6E6F4E3C5G5", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7", weight: 3 },
  { move: "F5F6E6F4E3C5G5D3D6F7C4E2", weight: 3 },
  { move: "F5F6E6F4E3C5G5D6G6H6F7D3", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3", weight: 3 },
  { move: "F5F6E6F4E3C5G5G3G4F3C4C6", weight: 3 },

  // --- Shrimp（エビ）進行 ---
  // E6 → F4 → E3 → C5 → G5 の続き
  { move: "F5F6E6F4E3C5G5F3G4G6", weight: 3 },
  { move: "F5F6E6F4E3C5G5F3G4G6H5G3", weight: 2 },

  // --- 縦取り後 C6 変化 ---
  { move: "F5F6E6F4E3C5C6D6E7", weight: 3 },
  { move: "F5F6E6F4E3C5C6D6E7F7", weight: 2 },

  // ============================================================
  // ■ 斜め取り（Diagonal Opening）系
  //   1手目 F5、2手目 D6（斜め取り）
  //   互角の研究が豊富な最重要進行
  // ============================================================

  // --- 虎進行（Tiger）---
  // 最頻出の D6 → C3 → D3 → C4 → F4 → C5 形
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

  // 虎の主要分岐
  { move: "F5D6C3D3C4F4C5B3C2E6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2E6C6F6", weight: 2 },
  { move: "F5D6C3D3C4F4C5B3C2B4E3D2", weight: 2 },

  // --- 牛進行（Buffalo / Cow）---
  // D6 → C3 → D3 → C4 → F4 → F6 形
  { move: "F5D6C3D3C4F4F6G6E6D7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4C6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B4C6B3", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7E7C5B5C6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6B4", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5D2C6B4G5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G6E6D7F3C5G5", weight: 3 },

  // 牛の追加分岐
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5", weight: 3 },
  { move: "F5D6C3D3C4F4F6G5E6F7E7G6G4D7C5B4", weight: 2 },

  // --- ローズ進行（Rose / D6系）---
  // D6 → C5 → F4 → E3 → C6 形
  { move: "F5D6C5F4E3C6", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4A3", weight: 3 },
  { move: "F5D6C5F4E3C6D3E6F3D7C4C3B3B4A3A4", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4B3", weight: 3 },
  { move: "F5D6C5F4E3C6D7E6F6D3C4B3B4", weight: 2 },

  // --- 虎 B3 系（Tiger B3）---
  { move: "F5D6C3D3C4B3", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6", weight: 3 },
  { move: "F5D6C3D3C4B3C6B6D7E8C2E6F6", weight: 3 },
  { move: "F5D6C3D3C4B3C6F4E6C5B5G6", weight: 3 },
  { move: "F5D6C3D3C4B3C6F4E6C5B5G6F6", weight: 2 },

  // ============================================================
  // ■ 横取り（Perpendicular Opening）系
  //   1手目 F5、2手目 E6（横取り）
  //   特殊進行・罠系が多い
  // ============================================================

  // --- 横取り基本形 ---
  { move: "F5E6F4", weight: 2 },
  { move: "F5E6F4F6G5", weight: 2 },
  { move: "F5E6F4F6G5E7D6G4", weight: 2 },
  { move: "F5E6F4D6E7C6G4", weight: 2 },
  { move: "F5E6F4D3E3", weight: 2 },

  // ============================================================
  // ■ 斜め取り D6→C4 系（Irish Opening・アイリッシュ）
  //   近年注目される変化球系進行
  // ============================================================

  { move: "F5D6C4", weight: 2 },
  { move: "F5D6C4D3C5", weight: 2 },
  { move: "F5D6C4D3C5B4C6", weight: 2 },
  { move: "F5D6C4D3C3C6E6", weight: 2 },

  // ============================================================
  // ■ 斜め取り後 E3 系（Bat Opening）
  // ============================================================

  { move: "F5D6E3", weight: 2 },
  { move: "F5D6E3F4C5D3", weight: 2 },
  { move: "F5D6E3F4C5D3C4C6", weight: 2 },

  // ============================================================
  // ■ weight 1：特殊・回避推奨系
  //   定石ライン外への誘導、または明確に不利な変化
  //   相手の奇手・罠対策として収録
  // ============================================================

  // 古いギャンビット系
  { move: "F5D6C3D3C4F4C5B3C2E3D2C6B4A3", weight: 1 },
  { move: "F5D6C3D3C4F4C5F6", weight: 1 },
  { move: "F5F6E6F4E3C5C4E7G4G3G5F3G6D6E2H5F7", weight: 1 },
  { move: "F5D6C3C4D3C5B4", weight: 1 },

];
