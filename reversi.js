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
    this.transpositionTable = Array(Number(ReversiGame.TT_SIZE)).fill(null);

    this.moveHistory = [];
    this.moveCount = 0;

    this.searchStartTime = 0;
    this.searchTimeout = false;
    this.MAX_SEARCH_TIME = 3500; // 最大考慮時間 (3.5秒)
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
    
    // ヒントのチェックボックス要素を取得（存在しない場合はfalse）
    const hintEl = document.getElementById('showAIHint');
    const showHint = hintEl ? hintEl.checked : false;
    
    const legalMoves = this.getLegalMoves(this.board, this.currentTurn);

    // 人間の手番かつヒント表示がONの場合、AIの最善手を計算
    let aiBestMove = null;
    if (this.gameActive && this.currentTurn === this.humanPlayer && showHint && legalMoves.length > 0) {
      // 難易度2（高）のロジックを使って、現在の盤面でのベストな1手を算出
      // （探索時間を一瞬にするため、一時的にMAX_SEARCH_TIMEを短く制御してもOKですが、現在の3.5秒以内でも非同期の隙間に計算可能です）
      const savedTime = this.MAX_SEARCH_TIME;
      this.MAX_SEARCH_TIME = 800; // ヒント計算用は0.8秒に制限してサクサク動かす
      aiBestMove = this.selectBestMove(this.board, this.currentTurn);
      this.MAX_SEARCH_TIME = savedTime; // 元に戻す
    }

    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        const cell = document.querySelector(`.board-cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) continue;

        cell.innerHTML = '';
        cell.classList.remove('legal-move');
        cell.classList.remove('ai-hint'); // 前のヒントクラスをクリア

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
        } else if (this.gameActive && this.currentTurn === this.humanPlayer) {
          // AIのヒント該当マスであれば青ドットを表示（着手可能ドットより優先）
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

  // 【大幅改修】定石を最高優先度（最大ウェイト）最優先で厳選するロジック
  getOpeningMove() {
    if (typeof joseki === 'undefined' || !Array.isArray(joseki)) return null;

    let currentHistoryStr = this.moveHistory.map(m => {
      const colStr = String.fromCharCode('a'.charCodeAt(0) + (m.col - 1));
      const rowStr = m.row.toString();
      return colStr.toUpperCase() + rowStr;
    }).join('');

    let bestWeight = -1;
    let candidates = [];

    for (const item of joseki) {
      const line = item.move;
      const weight = item.weight || 1; 

      if (line.toUpperCase().startsWith(currentHistoryStr.toUpperCase()) && line.length > currentHistoryStr.length) {
        let nextMoveStr = line.substr(currentHistoryStr.length, 2).toUpperCase();
        let col = nextMoveStr.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        let row = parseInt(nextMoveStr.charAt(1));

        if (this.canPlace(this.board, row, col, this.currentTurn)) {
          // より高い優先度（weight）を見つけたら、これまでの下位候補を破棄して更新
          if (weight > bestWeight) {
            bestWeight = weight;
            candidates = [{ row, col }];
          } 
          // 同等の最高ウェイトなら選択肢に追加（ランダムに分岐させゲーム性を維持）
          else if (weight === bestWeight) {
            candidates.push({ row, col });
          }
        }
      }
    }

    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
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
      // 序盤12手目までは厳選された最善定石を採用
      if (this.moveCount < 12) {
        const openingMove = this.getOpeningMove();
        if (openingMove) return openingMove;
      }

      const { p, o } = this.boardToBitboard(board, color);
      const empty = 64 - this.popcount(p | o);
      
      const isPerfect = (empty <= 17); 
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

    if (depth <= 0 || moves.length === 0) {
      if (moves.length === 0 && this.getLegalMovesBitboard(O, P) !== 0n) {
        return -this.negamaxBitboard(O, P, depth, -beta, -alpha, perfect, moveCount, !isBlackTurn);
      }
      if (perfect) {
        return (this.popcount(P) - this.popcount(O)) * 10000;
      }
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

    this.transpositionTable[idx] = {
      hash: hash,
      score: bestScore,
      depth: depth,
      type: type,
      bestMove: bestMove
    };

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
      
      let score;
      if (bestMoveMask && move === bestMoveMask) {
        score = 1000000;
      } else {
        const flipped = this.getFlipBitboard(P, O, move);
        const nextP = P | move | flipped;
        const nextO = O & ~flipped;
        
        // 相手の機動力を削ぎ落とす評価比率を維持
        score = cellScore
              + this.popcount(this.getLegalMovesBitboard(nextP, nextO)) * 200
              - this.popcount(this.getLegalMovesBitboard(nextO, nextP)) * 800;
      }
                  
      moves.push({ mask: move, score });
    }
    
    moves.sort((a, b) => b.score - a.score);
    return moves;
  }

// ==================== 強化された評価関数 ====================

  searchEvaluatorBitboard(P, O, moveCount) {
    const emptyCount = 64 - this.popcount(P | O);
    const isEndgame = emptyCount <= 20;

    let score = 0;

    // 1. 位置評価（基本）
    for (let i = 0; i < 64; i++) {
      if ((P & ReversiGame.POW2_64[i]) !== 0n) {
        score += ReversiGame.CELL_POINTS_64[i];
      } else if ((O & ReversiGame.POW2_64[i]) !== 0n) {
        score -= ReversiGame.CELL_POINTS_64[i];
      }
    }

    // 2. 機動力評価（中盤重視）
    const myMobility = this.popcount(this.getLegalMovesBitboard(P, O));
    const oppMobility = this.popcount(this.getLegalMovesBitboard(O, P));
    score += myMobility * 380;
    score += oppMobility * -720;

    // 3. 安定性評価（新機能）
    score += this.stabilityScore(P, O) * (isEndgame ? 1.8 : 1.2);
    score -= this.stabilityScore(O, P) * (isEndgame ? 1.8 : 1.2);

    // 4. 辺・壁の連鎖評価
    score += this.edgeStability(P, O) * 1.4;
    score -= this.edgeStability(O, P) * 1.4;

    // 5. 潜在的機動力
    score += this.potentialMobility(P, O) * 90;
    score -= this.potentialMobility(O, P) * 110;

    // 6. パリティ評価（終盤重要）
    if (emptyCount <= 12) {
      const parity = (emptyCount % 2 === 0) ? 1800 : -1800;
      score += (moveCount % 2 === 0) ? parity : -parity;
    }

    // 7. 終盤石数補正
    if (isEndgame) {
      score += (this.popcount(P) - this.popcount(O)) * 250;
    }

    return Math.round(score);
  }

// 安定性評価（確定石・隅・辺の強固さ）
  stabilityScore(P, O) {
    let score = 0;
    const corners = [0, 7, 56, 63]; // A1, H1, A8, H8

    // 隅の確定石
    corners.forEach(idx => {
      if ((P & ReversiGame.POW2_64[idx]) !== 0n) score += 2800;
      else if ((O & ReversiGame.POW2_64[idx]) !== 0n) score -= 2800;
    });

    // 辺の確定石（簡易版）
    const edges = [1,2,3,4,5,6, 8,16,24,32,40,48, 57,58,59,60,61,62, 15,23,31,39,47,55];
    edges.forEach(idx => {
      if ((P & ReversiGame.POW2_64[idx]) !== 0n) score += 650;
      else if ((O & ReversiGame.POW2_64[idx]) !== 0n) score -= 650;
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

  // 近傍石カウント（potentialMobility用）
  getNeighborCount(P, pos) {
    let count = 0;
    const dirs = [1n, 7n, 8n, 9n, -1n, -7n, -8n, -9n];
    for (const d of dirs) {
      const n = (pos << BigInt(d > 0 ? d : -d)) | (pos >> BigInt(d < 0 ? -d : d)); // 簡易
      if ((n & P) !== 0n) count++;
    }
    return count;
  }


  cloneBoard(board) {
    return board.map(row => [...row]);
  }
}