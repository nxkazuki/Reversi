/**
 * Reversi Opening Book (Joseki) - 大幅拡張版
 * weight: 3 = 最善・王道進行（強く優先）
 * weight: 2 = 標準・互角変化
 * weight: 1 = 特殊・罠回避用
 */

const joseki = [
  // ==================== 虎進行系 (Tiger) - 最頻出王道 ====================
  { move: "F5d6C3d3C4b3C6b6D7e8C2e6", weight: 3 },
  { move: "F5d6C3d3C4b3C6f4E6c5B5g6", weight: 3 },
  { move: "F5d6C3d3C4f4C5b3C2b4C6d2E6b5", weight: 3 },
  { move: "F5d6C3d3C4f4C5b3C2b4E3e6C6f6A5a4B5a6D7c7E7e8B6d8G3f7G5", weight: 3 },
  { move: "F5d6C3d3C4f4C5b3C2b4E3e6C6g4F6b6", weight: 3 },
  { move: "F5d6C3d3C4f4C5b3C2b4E3e6C6f6A5a4B5a6D7c7E7e8B6f8G3f7G5", weight: 3 },

  // 虎進行 追加分岐
  { move: "F5d6C3d3C4f4C5b3C2b4E3e6C6d7", weight: 3 },
  { move: "F5d6C3d3C4f4C5b3C2b4E3e6D7c6", weight: 2 },

  // ==================== 牛進行系 (Buffalo / Cow) ====================
  { move: "F5d6C3d3C4f4F6g6E6d7E7c5B4c6B3", weight: 3 },
  { move: "F5d6C3d3C4f4F6g6E6d7E7c5B5c6B4", weight: 3 },
  { move: "F5d6C3d3C4f4F6g6E6d7F3c5D2c6B4g5G4", weight: 3 },
  { move: "F5d6C3d3C4f4F6g6E6d7F3c5G5c6", weight: 3 },
  { move: "F5d6C3d3C4f4F6g5E6f7E7g6G4d7C5", weight: 3 },

  // ==================== 縦取り・Rose・Shrimp系 ====================
  { move: "F5f6E6f4E3c5C4e7G4f3G5d3", weight: 3 },
  { move: "F5f6E6f4E3c5C4e7G4g3D7h4F7g5F3", weight: 3 },
  { move: "F5f6E6f4E3c5C6d6E7", weight: 3 },
  { move: "F5f6E6f4E3c5G5d6G6h6F7d3E7d7", weight: 3 },
  { move: "F5f6E6f4E3c5G5f3G4g6G3d6F7h5E7h3", weight: 3 },
  { move: "F5f6E6f4E3c5G5g3G4f3C4c6", weight: 3 },

  // ==================== 新規追加：主要定石（長手順） ====================
  // Rose Opening
  { move: "F5d6C5f4E3c6D3e6F3d7C4c3B3b4A3a4", weight: 3 },
  { move: "F5d6C5f4E3c6D3e6F3d7C7b6", weight: 3 },

  // Heath / Tobidashi
  { move: "F5f6E6f4E3c5G5", weight: 3 },
  { move: "F5f6E6f4E3c5G5d3D6f7C4e2", weight: 3 },

  // Diagonal / Parallel 関連
  { move: "F5d6C3d3C4f4C5b3C2b4", weight: 3 },
  { move: "F5d6C3c4D3c5B4", weight: 2 },

  // その他有力進行
  { move: "F5d6C3d3C4f4F6g6E6d7E7c5B4c6B3d2", weight: 3 },
  { move: "F5f6E6f4E3c5C4e7G4f3G5d3D6c6", weight: 3 },
  { move: "F5d6C5f4E3c6D7e6F6d3C4b3", weight: 3 },
  { move: "F5d6C3d3C4b3C5f4E6c5B5g6F6", weight: 3 },

  // より長い手順例（中盤までカバー）
  { move: "F5d6C3d3C4f4C5b3C2b4E3e6C6f6A5a4B5a6D7c7E7e8B6d8G3f7G5f3", weight: 3 },
  { move: "F5f6E6f4E3c5G5g3G4f3G6d3F2h4E2h5F7g5", weight: 3 },
  { move: "F5d6C3d3C4f4F6g6E6d7F3c5D2c6B4g5H6g4G3f3", weight: 3 },

  // ==================== weight 2（標準変化） ====================
  { move: "F5d6C3d3C4f4C5b3C2e3D2c6B4a4", weight: 2 },
  { move: "F5d6C3d3C4f4C5b3C2e6C6f6", weight: 2 },
  { move: "F5f6E6f4E3c5G5d3D6f7C4e2E7", weight: 2 },

  // ==================== weight 1（避けるべきor特殊） ====================
  { move: "F5d6C3d3C4f4C5b3C2e3D2c6B4a3", weight: 1 }, // 古い奇襲
  { move: "F5f6E6f4E3c5C4e7G4g3G5f3G6d6E2h5F7", weight: 1 }
];