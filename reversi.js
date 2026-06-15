/**
 * Reversi Game - 超・最高難易度版（定石優先度判定搭載ガチモード）
 */

class ReversiGame {
  // ゲーム定数
  static EMPTY = 0;
  static BLACK = 1;
  static WHITE = -1;
  
  // 置換表のサイズ（2^21 = 2,097,152エントリに拡張）
  static TT_SIZE = 2097152n; 

  // ノードのタイプ
  static EXACT = 0;
  static LOWERBOUND = 1;
  static UPPERBOUND = 2;

  // 10x10の番兵を含めた簡易評価テーブル（低難易度用）
  static CELL_POINTS = [
    [0, 0,     0,     0, 0, 0,     0,     0,    0, 0],
    [0, 1000, -1000,  1, 1, 1, 1, -1000, 1000, 0],
    [0, -1000, -1000, 1, 1, 1, 1, -1000, -1000, 0],
    [0, 1,     1,     1, 1, 1, 1, 1,     1,    0],
    [0, 1,     1,     1, 0, 0, 1, 1,     1,    0],
    [0, 1,     1,     1, 0, 0, 1, 1,     1,    0],
    [0, 1,     1,     1, 1, 1, 1, 1,     1,    0],
    [0, -1000, -1000, 1, 1, 1, 1, -1000, -1000, 0],
    [0, 1000, -1000,  1, 1, 1, 1, -1000, 1000, 0],
    [0, 0,     0,     0, 0, 0,     0,     0,    0, 0]
  ];

  // ビットボード用 64要素の評価テーブル（隅とその周囲を最適化）
  static CELL_POINTS_64 = [
     1200, -2000,  20,   5,   5,  20, -2000,  1200,
    -2000, -4000,  -5,  -5,  -5,  -5, -4000, -2000,
       20,    -5,  15,   3,   3,  15,    -5,    20,
        5,    -5,   3,   0,   0,   3,    -5,     5,
        5,    -5,   3,   0,   0,   3,    -5,     5,
       20,    -5,  15,   3,   3,  15,    -5,    20,
    -2000, -4000,  -5,  -5,  -5,  -5, -4000, -2000,
     1200, -2000,  20,   5,   5,  20, -2000,  1200
  ];

  // 高速化のための事前計算配列
  static POW2_64 = Array(64).fill(null).map((_, i) => 1n << BigInt(i));

  constructor() {
    this.board = Array(10).fill(null).map(() => Array(10).fill(ReversiGame.EMPTY));
    this.initializeBoard();
    this.currentTurn = ReversiGame.BLACK;
    this.difficulty = 2; 
    this.humanPlayer = ReversiGame.BLACK;
    this.gameActive = false;

    this.zobristTable = Array(64).fill(null).map(() => [this.getRandom64(), this.getRandom64()]);
    this.zobristPlayer = this.getRandom64();
    // constructor() 内で
    this.transpositionTable = new Array(Number(ReversiGame.TT_SIZE)).fill(null); 

    this.moveHistory = [];
    this.moveCount = 0;

    this.searchStartTime = 0;
    this.searchTimeout = false;
    this.MAX_SEARCH_TIME = 3500; // 最大考慮時間 (3.5秒)
    this.lastAIMove = null;        // 新規追加
  }

  getRandom64() {
    let low = BigInt(Math.floor(Math.random() * 0xffffffff));
    let high = BigInt(Math.floor(Math.random() * 0xffffffff));
    return (high << 32n) | low;
  }

  initializeBoard() {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.board[i][j] = ReversiGame.EMPTY;
      }
    }
    this.board[4][4] = ReversiGame.WHITE;
    this.board[5][5] = ReversiGame.WHITE;
    this.board[4][5] = ReversiGame.BLACK;
    this.board[5][4] = ReversiGame.BLACK;
  }

  initializeUI() {
    const boardGrid = document.getElementById('boardGrid');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');

    boardGrid.innerHTML = '';
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        const cell = document.createElement('button');
        cell.className = 'board-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => this.handleCellClick(r, c));
        boardGrid.appendChild(cell);
      }
    }

    startBtn.addEventListener('click', () => this.startGame());
    resetBtn.addEventListener('click', () => this.resetGame());

    // 以下の2つのリスナーを追加すると、チェックボックス切り替えが即座に反映されます
    document.getElementById('showLegalMoves').addEventListener('change', () => this.updateUI());
    const hintEl = document.getElementById('showAIHint');
    if (hintEl) hintEl.addEventListener('change', () => this.updateUI());

    this.updateUI();
  }

  startGame() {
    const selectedColor = document.querySelector('input[name="playerColor"]:checked').value;
    this.humanPlayer = (selectedColor === 'BLACK') ? ReversiGame.BLACK : ReversiGame.WHITE;
    this.difficulty = parseInt(document.getElementById('difficultyLevel').value);

    document.querySelectorAll('input[name="playerColor"]').forEach(el => el.disabled = true);
    document.getElementById('difficultyLevel').disabled = true;
    document.getElementById('startBtn').disabled = true;

    this.gameActive = true;
    this.updateUI();
    this.checkTurnActivity();
  }

  resetGame() {
    this.board = Array(10).fill(null).map(() => Array(10).fill(ReversiGame.EMPTY));
    this.initializeBoard();
    this.currentTurn = ReversiGame.BLACK;
    this.moveCount = 0;
    this.moveHistory = [];
    this.gameActive = false;

    document.querySelectorAll('input[name="playerColor"]').forEach(el => el.disabled = false);
    document.getElementById('difficultyLevel').disabled = false;
    document.getElementById('startBtn').disabled = false;

    this.updateUI();
    document.getElementById('statusMessage').textContent = '開始ボタンを押してください。';
  }

  handleCellClick(row, col) {
    if (!this.gameActive || this.currentTurn !== this.humanPlayer) return;
    if (this.canPlace(this.board, row, col, this.currentTurn)) {
      this.makeMove(row, col);
    }
  }

  makeMove(row, col) {
    this.placePiece(this.board, row, col, this.currentTurn);
    this.moveHistory.push({ row, col });
    this.moveCount++;

    // AIが打った手を記録
    if (this.currentTurn !== this.humanPlayer) {
      this.lastAIMove = { row, col };
    } else {
      this.lastAIMove = null; // 人間の手は強調しない
    }

    this.currentTurn = -this.currentTurn;
    this.updateUI();

    setTimeout(() => this.checkTurnActivity(), 50);
  }

  checkTurnActivity() {
    if (!this.gameActive) return;

    const currentMoves = this.getLegalMoves(this.board, this.currentTurn);
    const opponentMoves = this.getLegalMoves(this.board, -this.currentTurn);

    if (currentMoves.length === 0 && opponentMoves.length === 0) {
      this.endGame();
      return;
    }

    if (currentMoves.length === 0) {
      document.getElementById('statusMessage').textContent = 
        `${this.currentTurn === ReversiGame.BLACK ? '黒' : '白'}はパスします。`;
      this.currentTurn = -this.currentTurn;
      this.updateUI();
      setTimeout(() => this.checkTurnActivity(), 600);
      return;
    }

    if (this.currentTurn !== this.humanPlayer) {
      document.getElementById('statusMessage').textContent = 'AIが思考中です...';
      setTimeout(() => this.executeAIMove(), 30);
    } else {
      document.getElementById('statusMessage').textContent = 'あなたの番です。';
    }
  }

  executeAIMove() {
    if (!this.gameActive) return;
    const bestMove = this.selectBestMove(this.board, this.currentTurn);
    if (bestMove) {
      this.makeMove(bestMove.row, bestMove.col);
    }
  }

  endGame() {
    this.gameActive = false;
    let black = 0, white = 0;
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        if (this.board[r][c] === ReversiGame.BLACK) black++;
        if (this.board[r][c] === ReversiGame.WHITE) white++;
      }
    }

    let resultStr = `終局！ 黒:${black} vs 白:${white} で`;
    if (black === white) resultStr += '引き分けです。';
    else if (black > white) resultStr += '黒の勝ちです！';
    else resultStr += '白の勝ちです！';

    document.getElementById('statusMessage').textContent = resultStr;
  }

updateUI() {
    let blackCount = 0;
    let whiteCount = 0;
    const showLegal = document.getElementById('showLegalMoves').checked;
    const hintEl = document.getElementById('showAIHint');
    const showHint = hintEl ? hintEl.checked : false;
    
    const legalMoves = this.getLegalMoves(this.board, this.currentTurn);

    let aiBestMove = null;
    if (this.gameActive && this.currentTurn === this.humanPlayer && showHint && legalMoves.length > 0) {
      const savedTime = this.MAX_SEARCH_TIME;
      this.MAX_SEARCH_TIME = 800;
      aiBestMove = this.selectBestMove(this.board, this.currentTurn);
      this.MAX_SEARCH_TIME = savedTime;
    }

    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        const cell = document.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) continue;

        cell.innerHTML = '';
        cell.classList.remove('legal-move', 'ai-hint', 'last-ai-move'); // 強調クラスも削除

        const state = this.board[r][c];
        if (state === ReversiGame.BLACK) {
          blackCount++;
          const disc = document.createElement('div');
          disc.className = 'disc black';
          cell.appendChild(disc);
        } else if (state === ReversiGame.WHITE) {
          whiteCount++;
          const disc = document.createElement('div');
          disc.className = 'disc white';
          cell.appendChild(disc);
        }

        // === AIの最後の着手を強調 ===
        if (this.lastAIMove && this.lastAIMove.row === r && this.lastAIMove.col === c) {
          cell.classList.add('last-ai-move');
        }

        // プレイヤーの手番のアシスト表示は別途行う
        if (this.gameActive && this.currentTurn === this.humanPlayer) {
          if (aiBestMove && aiBestMove.row === r && aiBestMove.col === c) {
            cell.classList.add('ai-hint');
          } else if (showLegal) {
            const isLegal = legalMoves.some(m => m.row === r && m.col === c);
            if (isLegal) {
              cell.classList.add('legal-move');
            }
          }
        }
      }
    }

    document.getElementById('moveCount').textContent = this.moveCount;
    document.getElementById('blackCount').textContent = blackCount;
    document.getElementById('whiteCount').textContent = whiteCount;
  }

  getLegalMoves(board, color) {
    const moves = [];
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        if (this.canPlace(board, r, c, color)) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  canPlace(board, row, col, color) {
    if (board[row][col] !== ReversiGame.EMPTY) return false;
    const dr = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dc = [-1, 0, 1, -1, 1, -1, 0, 1];

    for (let i = 0; i < 8; i++) {
      let r = row + dr[i];
      let c = col + dc[i];
      let count = 0;
      while (r >= 1 && r <= 8 && c >= 1 && c <= 8 && board[r][c] === -color) {
        r += dr[i];
        c += dc[i];
        count++;
      }
      if (count > 0 && r >= 1 && r <= 8 && c >= 1 && c <= 8 && board[r][c] === color) {
        return true;
      }
    }
    return false;
  }

  placePiece(board, row, col, color) {
    board[row][col] = color;
    const dr = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dc = [-1, 0, 1, -1, 1, -1, 0, 1];

    for (let i = 0; i < 8; i++) {
      let r = row + dr[i];
      let c = col + dc[i];
      let count = 0;
      while (r >= 1 && r <= 8 && c >= 1 && c <= 8 && board[r][c] === -color) {
        r += dr[i];
        c += dc[i];
        count++;
      }
      if (count > 0 && r >= 1 && r <= 8 && c >= 1 && c <= 8 && board[r][c] === color) {
        let currR = row + dr[i];
        let currC = col + dc[i];
        while (currR !== r || currC !== c) {
          board[currR][currC] = color;
          currR += dr[i];
          currC += dc[i];
        }
      }
    }
  }

  moveToNotation(move) {
    const colChar = String.fromCharCode('A'.charCodeAt(0) + (move.col - 1));
    return colChar + move.row;
  }

  notationToMove(notation) {
    if (!notation || notation.length < 2) return null;
    const col = notation.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    const row = parseInt(notation[1], 10);
    if (row < 1 || row > 8 || col < 1 || col > 8) return null;
    return { row, col };
  }

  transformMove(move, transformName) {
    const { row, col } = move;
    switch (transformName) {
      case 'rot90': return { row: col, col: 9 - row };
      case 'rot180': return { row: 9 - row, col: 9 - col };
      case 'rot270': return { row: 9 - col, col: row };
      case 'mirrorV': return { row, col: 9 - col };
      case 'mirrorH': return { row: 9 - row, col };
      case 'diagMain': return { row: col, col: row };
      case 'diagAnti': return { row: 9 - col, col: 9 - row };
      case 'identity':
      default:
        return { row, col };
    }
  }

  getOpeningTransforms() {
    return [
      { name: 'identity', inverse: 'identity' },
      { name: 'rot90', inverse: 'rot270' },
      { name: 'rot180', inverse: 'rot180' },
      { name: 'rot270', inverse: 'rot90' },
      { name: 'mirrorV', inverse: 'mirrorV' },
      { name: 'mirrorH', inverse: 'mirrorH' },
      { name: 'diagMain', inverse: 'diagMain' },
      { name: 'diagAnti', inverse: 'diagAnti' }
    ];
  }

  getTransformedHistoryString(transformName) {
    return this.moveHistory
      .map(move => this.moveToNotation(this.transformMove(move, transformName)))
      .join('');
  }

  getOpeningMove() {
    if (typeof joseki === 'undefined' || !Array.isArray(joseki) || joseki.length === 0) {
      console.warn("[定石] joseki データが見つかりません");
      return null;
    }

    let bestWeight = -1;
    let bestLength = -1;
    let candidates = [];
    const seenCandidates = new Set();

    const originalHistoryStr = this.moveHistory.map(move => this.moveToNotation(move)).join('');
    console.log(`[定石検索] 現在手順: ${originalHistoryStr} (${this.moveHistory.length}手)`);

    for (const transform of this.getOpeningTransforms()) {
      const currentHistoryStr = this.getTransformedHistoryString(transform.name);
      const currentLen = currentHistoryStr.length;

      for (const item of joseki) {
        if (!item || typeof item.move !== 'string') continue;
        const line = item.move.toUpperCase();
        const weight = item.weight || 1;

        if (line.length <= currentLen) continue;
        if (line.substring(0, currentLen) !== currentHistoryStr) continue;

        const bookMoveStr = line.substring(currentLen, currentLen + 2);
        const bookMove = this.notationToMove(bookMoveStr);
        if (!bookMove) continue;

        const actualMove = this.transformMove(bookMove, transform.inverse);
        if (!this.canPlace(this.board, actualMove.row, actualMove.col, this.currentTurn)) continue;

        const key = `${actualMove.row},${actualMove.col}`;
        if (seenCandidates.has(key)) continue;
        seenCandidates.add(key);

        const matchLength = line.length;

        // 優先順位：weight > 手順の長さ
        const isBetter = 
          weight > bestWeight || 
          (weight === bestWeight && matchLength > bestLength);

        if (isBetter) {
          bestWeight = weight;
          bestLength = matchLength;
          candidates = [{ ...actualMove, weight, transform: transform.name, matchLength }];
        } else if (weight === bestWeight && matchLength === bestLength) {
          candidates.push({ ...actualMove, weight, transform: transform.name, matchLength });
        }
      }
    }

    if (candidates.length > 0) {
      // 重みと長さが同じ場合はランダム選択
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      console.log(`✅ [定石ヒット] ${originalHistoryStr} → ${this.moveToNotation(chosen)} ` +
                  `(weight:${chosen.weight}, length:${chosen.matchLength}, transform:${chosen.transform})`);
      return { row: chosen.row, col: chosen.col };
    }

    console.log(`❌ [定石未ヒット] 手順 "${originalHistoryStr}" にマッチする定石なし`);
    return null;
  }

  boardToBitboard(board, color) {
    let p = 0n;
    let o = 0n;
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        let idx = (r - 1) * 8 + (c - 1);
        if (board[r][c] === color) {
          p |= ReversiGame.POW2_64[idx];
        } else if (board[r][c] === -color) {
          o |= ReversiGame.POW2_64[idx];
        }
      }
    }
    return { p, o };
  }

  bitboardToCoords(mask) {
    for (let i = 0; i < 64; i++) {
      if ((mask & ReversiGame.POW2_64[i]) !== 0n) {
        return { row: Math.floor(i / 8) + 1, col: (i % 8) + 1 };
      }
    }
    return null;
  }

  bitboardToIdx(mask) {
    for (let i = 0; i < 64; i++) {
      if ((mask & ReversiGame.POW2_64[i]) !== 0n) return i;
    }
    return 0;
  }

  popcount(b) {
    let count = 0;
    let temp = b;
    while (temp > 0n) {
      if (temp & 1n) count++;
      temp >>= 1n;
    }
    return count;
  }

  getLegalMovesBitboard(P, O) {
    let legal = 0n;
    let empty = ~(P | O);

    const directions = [
      { shift: 1n,  mask: 0x7e7e7e7e7e7e7e7en },
      { shift: 7n,  mask: 0x007e7e7e7e7e7e00n },
      { shift: 8n,  mask: 0x00ffffffffffff00n },
      { shift: 9n,  mask: 0x007e7e7e7e7e7e00n }
    ];

    for (const d of directions) {
      let t = (P << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      legal |= (t << d.shift) & empty;

      t = (P >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      legal |= (t >> d.shift) & empty;
    }
    return legal;
  }

  getFlipBitboard(P, O, moveMask) {
    let flips = 0n;
    const directions = [
      { shift: 1n,  mask: 0x7e7e7e7e7e7e7e7en },
      { shift: 7n,  mask: 0x007e7e7e7e7e7e00n },
      { shift: 8n,  mask: 0x00ffffffffffff00n },
      { shift: 9n,  mask: 0x007e7e7e7e7e7e00n }
    ];

    for (const d of directions) {
      let t = (moveMask << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      t |= (t << d.shift) & O & d.mask;
      if (((t << d.shift) & P) !== 0n) flips |= t;

      t = (moveMask >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      t |= (t >> d.shift) & O & d.mask;
      if (((t >> d.shift) & P) !== 0n) flips |= t;
    }
    return flips;
  }

  getHash(P, O, isBlackTurn) {
    let h = 0n;
    for (let i = 0; i < 64; i++) {
      if ((P & ReversiGame.POW2_64[i]) !== 0n) h ^= this.zobristTable[i][0];
      else if ((O & ReversiGame.POW2_64[i]) !== 0n) h ^= this.zobristTable[i][1];
    }
    if (isBlackTurn) h ^= this.zobristPlayer;
    return h;
  }

  selectBestMove(board, color) {
    const legalMoves = this.getLegalMoves(board, color);
    if (legalMoves.length === 0) return null;
    
    if (this.difficulty === 0) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    if (this.difficulty === 1) {
      const scoredMoves = legalMoves.map(move => {
        const boardCopy = this.cloneBoard(board);
        this.placePiece(boardCopy, move.row, move.col, color);
        const score = ReversiGame.CELL_POINTS[move.row][move.col] 
                    + this.getLegalMoves(boardCopy, color).length 
                    - this.getLegalMoves(boardCopy, -color).length * 2;
        return { ...move, score };
      });
      scoredMoves.sort((a, b) => b.score - a.score);
      return scoredMoves[0];
    }

    if (this.difficulty === 2) {
      // 序盤20手目くらいまで定石を積極的に使用（余裕を持たせる）
      if (this.moveCount < 20) {
        const openingMove = this.getOpeningMove();
        if (openingMove) return openingMove;
      }

      // 定石が使えなかった場合は探索へ
      console.log(`[探索モード] moveCount=${this.moveCount} で定石未使用`);

      const { p, o } = this.boardToBitboard(board, color);
      const empty = 64 - this.popcount(p | o);
      
      const isPerfect = (empty <= 20);   // 17 → 20 に拡張
      const maxDepth = isPerfect ? empty : 60; 

      this.searchStartTime = Date.now();
      this.searchTimeout = false;
      this.transpositionTable.fill(null);

      const isBlackTurn = (color === ReversiGame.BLACK);
      let absoluteBestMoveMask = null;
      
      for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        let bestMoveMaskThisIteration = null;
        let maxScore = -Infinity;
        
        const currentHash = this.getHash(p, o, isBlackTurn);
        const ordered = this.getOrderedMovesBitboard(p, o, currentHash);

        for (const move of ordered) {
          const flips = this.getFlipBitboard(p, o, move.mask);
          const nextP = p | move.mask | flips;
          const nextO = o & ~flips;
          
          const score = -this.negamaxBitboard(
            nextO, nextP, currentDepth - 1, 
            -100000000, -maxScore, 
            isPerfect, this.moveCount + 1, !isBlackTurn
          );

          if (this.searchTimeout) break;

          if (score > maxScore) {
            maxScore = score;
            bestMoveMaskThisIteration = move.mask;
          }
        }

        if (this.searchTimeout) break; 

        if (bestMoveMaskThisIteration) {
          absoluteBestMoveMask = bestMoveMaskThisIteration;
        }

        if (Math.abs(maxScore) > 500000 || (Date.now() - this.searchStartTime) > (this.MAX_SEARCH_TIME / 2)) {
          break;
        }
      }

      if (absoluteBestMoveMask) {
        return this.bitboardToCoords(absoluteBestMoveMask);
      }
      return legalMoves[0];
    }

    return legalMoves[0];
  }

  negamaxBitboard(P, O, depth, alpha, beta, perfect, moveCount, isBlackTurn) {
    if ((moveCount % 512 === 0) && (Date.now() - this.searchStartTime > this.MAX_SEARCH_TIME)) {
      this.searchTimeout = true;
      return alpha;
    }

    const hash = this.getHash(P, O, isBlackTurn);
    const idx = Number(hash % ReversiGame.TT_SIZE);
    const cached = this.transpositionTable[idx];
    
    if (cached && cached.hash === hash && cached.depth >= depth) {
      if (cached.type === ReversiGame.EXACT) return cached.score;
      if (cached.type === ReversiGame.UPPERBOUND && cached.score <= alpha) return alpha;
      if (cached.type === ReversiGame.LOWERBOUND && cached.score >= beta) return beta;
    }

    let moves = this.getOrderedMovesBitboard(P, O, hash);

    if (moves.length === 0) {
      if (this.getLegalMovesBitboard(O, P) !== 0n) {
        // 深さを1減らして相手の探索へ（perfectフラグは維持）
        return -this.negamaxBitboard(O, P, depth - 1, -beta, -alpha, perfect, moveCount, !isBlackTurn);
      }
      // 両者パス（完全な終局）
      const stoneDiff = this.popcount(P) - this.popcount(O);
      return stoneDiff * 100000; // 確定した勝敗・石数差なので超巨大な値を返す
    }

    if (depth <= 0) {
      // 探索深さの上限に達した場合は、通常の評価関数を返す
      return this.searchEvaluatorBitboard(P, O, moveCount);
    }

    let bestScore = -Infinity;
    let originalAlpha = alpha;
    let bestMove = null;

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i].mask;
      const flipped = this.getFlipBitboard(P, O, move);
      const nextP = P | move | flipped;
      const nextO = O & ~flipped;

      const score = -this.negamaxBitboard(nextO, nextP, depth - 1, -beta, -alpha, perfect, moveCount + 1, !isBlackTurn);

      if (this.searchTimeout) return alpha;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (bestScore > alpha) {
        alpha = bestScore;
      }
      if (alpha >= beta) {
        break; 
      }
    }

    let type = ReversiGame.EXACT;
    if (bestScore <= originalAlpha) type = ReversiGame.UPPERBOUND;
    else if (bestScore >= beta) type = ReversiGame.LOWERBOUND;

    const existing = this.transpositionTable[idx];
    // 既存のデータがない、または新しいデータの方が深く探索している場合のみ上書き
    if (!existing || depth >= existing.depth) {
      this.transpositionTable[idx] = {
        hash: hash,
        score: bestScore,
        depth: depth,
        type: type,
        bestMove: bestMove
      };
    }

    return bestScore;
  }

  getOrderedMovesBitboard(P, O, currentHash) {
    const legal = this.getLegalMovesBitboard(P, O);
    const moves = [];
    
    let bestMoveMask = null;
    if (currentHash !== undefined) {
      const idx = Number(currentHash % ReversiGame.TT_SIZE);
      const entry = this.transpositionTable[idx];
      if (entry && entry.hash === currentHash) {
        bestMoveMask = entry.bestMove;
      }
    }
    
    let temp = legal;
    while (temp > 0n) {
      const move = temp & -temp;
      temp &= temp - 1n;
      
      const flatIdx = this.bitboardToIdx(move);
      const cellScore = ReversiGame.CELL_POINTS_64[flatIdx];
      
      const flipped = this.getFlipBitboard(P, O, move);
      const flipCount = this.popcount(flipped);
      
      let score = cellScore * 1.2 + flipCount * 450;  // 捕獲重視
      
      if (bestMoveMask && move === bestMoveMask) {
        score += 2000000;  // TT最善手を最優先
      } else {
        const nextP = P | move | flipped;
        const nextO = O & ~flipped;
        
        const myNextMob = this.popcount(this.getLegalMovesBitboard(nextP, nextO));
        const oppNextMob = this.popcount(this.getLegalMovesBitboard(nextO, nextP));
        
        score += myNextMob * 180 - oppNextMob * 650;
      }
      
      moves.push({ mask: move, score });
    }
    
    moves.sort((a, b) => b.score - a.score);
    return moves;
  }

// ==================== 強化された評価関数 ====================

  searchEvaluatorBitboard(P, O, moveCount) {
    const emptyCount = 64 - this.popcount(P | O);
    const isMidgame = emptyCount > 20;
    const isEndgame = emptyCount <= 14;  // より早めに石数重視に

    let score = 0;

    // 1. 位置評価（基本） - ウェイトを少し調整
    for (let i = 0; i < 64; i++) {
      if ((P & ReversiGame.POW2_64[i]) !== 0n) {
        score += ReversiGame.CELL_POINTS_64[i];
      } else if ((O & ReversiGame.POW2_64[i]) !== 0n) {
        score -= ReversiGame.CELL_POINTS_64[i] * 0.95; // 相手の悪い場所は少し軽減
      }
    }

    // 2. 機動力評価（中盤重視 → 終盤は弱く）
    const myMobility = this.popcount(this.getLegalMovesBitboard(P, O));
    const oppMobility = this.popcount(this.getLegalMovesBitboard(O, P));
    const mobilityWeight = isEndgame ? 120 : 380;
    score += myMobility * mobilityWeight;
    score += oppMobility * (isEndgame ? -250 : -720);

    // 3. 安定性評価（大幅強化）
    score += this.stabilityScore(P, O) * (isEndgame ? 2.2 : 1.3);
    score -= this.stabilityScore(O, P) * (isEndgame ? 2.2 : 1.3);

    // 4. 辺・壁の連鎖評価
    score += this.edgeStability(P, O) * (isEndgame ? 2.0 : 1.4);
    score -= this.edgeStability(O, P) * (isEndgame ? 2.0 : 1.4);

    // 5. 潜在的機動力（修正済み関数使用）
    score += this.potentialMobility(P, O) * (isMidgame ? 110 : 60);
    score -= this.potentialMobility(O, P) * (isMidgame ? 130 : 80);

    // 6. パリティ評価（終盤重要）
    if (emptyCount <= 16) {
      const parity = (emptyCount % 2 === 0) ? 2200 : -2200;
      score += (moveCount % 2 === 0) ? parity : -parity;
    }

    // 7. 石数評価（より早めに強く）
    if (emptyCount <= 18) {
      score += (this.popcount(P) - this.popcount(O)) * 320;
    }

    return Math.round(score);
  }

// 安定性評価（確定石・隅・辺の強固さ）
  stabilityScore(P, O) {
    let score = 0;
    const corners = [0, 7, 56, 63];

    corners.forEach(idx => {
      if ((P & ReversiGame.POW2_64[idx]) !== 0n) score += 3200;
      else if ((O & ReversiGame.POW2_64[idx]) !== 0n) score -= 3200;
    });

    // 辺の確定石（より多くの位置をカバー）
    const edges = [1,2,3,4,5,6, 8,16,24,32,40,48, 57,58,59,60,61,62, 15,23,31,39,47,55];
    edges.forEach(idx => {
      if ((P & ReversiGame.POW2_64[idx]) !== 0n) score += 720;
      else if ((O & ReversiGame.POW2_64[idx]) !== 0n) score -= 720;
    });

    return score;
  }

  // 辺・壁の連鎖評価
  edgeStability(P, O) {
    let score = 0;
    // 上辺・下辺・左辺・右辺の連続性を簡易評価
    const edgeMasks = [
      0x00000000000000ffn, // 上辺
      0xff00000000000000n, // 下辺
      0x0101010101010101n, // 左辺
      0x8080808080808080n  // 右辺
    ];

    edgeMasks.forEach(mask => {
      const myEdge = P & mask;
      const oppEdge = O & mask;
      if (myEdge) score += this.popcount(myEdge) * 180;
      if (oppEdge) score -= this.popcount(oppEdge) * 180;
    });

    return score;
  }

  // 潜在的機動力（空きマス周辺の影響）
  potentialMobility(P, O) {
    let score = 0;
    const empty = ~(P | O);

    // 簡易版：空きマスの隣接石を評価
    let temp = empty;
    while (temp > 0n) {
      const pos = temp & -temp;
      temp &= temp - 1n;

      // 簡易近傍チェック（周囲8方向に自分の石があればボーナス）
      const neighbors = this.getNeighborCount(P, pos);
      score += neighbors * 45;
    }
    return score;
  }

  // 近傍石カウント（potentialMobility用） - 修正版
  getNeighborCount(P, pos) {
    let count = 0;
    // 左右・上下・斜めの純粋なシフト量（すべて正の数）
    const leftShifts = [1n, 7n, 8n, 9n];
    const rightShifts = [1n, 7n, 8n, 9n];
    
    for (const s of leftShifts) {
      if (((pos << s) & P) !== 0n) count++;
    }
    for (const s of rightShifts) {
      if (((pos >> s) & P) !== 0n) count++;
    }
    return count;
  }


  cloneBoard(board) {
    return board.map(row => [...row]);
  }
}
