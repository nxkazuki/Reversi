/**
 * Reversi Game - モダンJavaScript版
 * Prototype.jsに依存しない純粋なJavaScriptで実装
 */

class ReversiGame {
  // ゲーム定数
  static EMPTY = 0;
  static BLACK = 1;
  static WHITE = -1;
  static EARLY_GAME = 0;
  static MID_GAME = 1;
  static END_GAME = 2;

  // 評価テーブル (10x10の番兵を含めたサイズ)
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

  constructor() {
    // ゲーム状態
    this.board = this.initializeBoard();
    this.currentPlayer = ReversiGame.BLACK;
    this.moveCount = 0;
    this.gameStatus = ReversiGame.EARLY_GAME;
    this.computerThinking = false;
    this.difficulty = 1;
    this.showLegalMoves = true;
    this.computerPlayer = ReversiGame.WHITE;
    this.humanPlayer = ReversiGame.BLACK;

    // ログ
    this.log = '';
    this.moveHistory = [];

    // DOM要素のキャッシュ
    this.elements = {
      boardGrid: document.getElementById('boardGrid'),
      statusMessage: document.getElementById('statusMessage'),
      blackCount: document.getElementById('blackCount'),
      whiteCount: document.getElementById('whiteCount'),
      moveCount: document.getElementById('moveCount'),
      startBtn: document.getElementById('startBtn'),
      resetBtn: document.getElementById('resetBtn'),
      showLegalMovesCheckbox: document.getElementById('showLegalMoves'),
      difficultySelect: document.getElementById('difficultyLevel'),
      playerColorRadios: document.querySelectorAll('input[name="playerColor"]')
    };
  }

  /**
   * ゲームボードの初期化
   */
  initializeBoard() {
    const board = Array(10).fill(null).map(() => Array(10).fill(ReversiGame.EMPTY));
    // 初期配置
    board[4][4] = ReversiGame.WHITE;
    board[4][5] = ReversiGame.BLACK;
    board[5][4] = ReversiGame.BLACK;
    board[5][5] = ReversiGame.WHITE;
    return board;
  }

  /**
   * UIの初期化
   */
  initializeUI() {
    this.createBoardUI();
    this.attachEventListeners();
    this.updateDisplay();
  }

  /**
   * ボード用UIの作成
   */
  createBoardUI() {
    if (!this.elements.boardGrid) return;
    this.elements.boardGrid.innerHTML = '';
    for (let row = 1; row < 9; row++) {
      for (let col = 1; col < 9; col++) {
        const button = document.createElement('button');
        button.className = 'board-cell';
        button.dataset.row = row;
        button.dataset.col = col;
        button.addEventListener('click', (e) => this.handleCellClick(e));
        this.elements.boardGrid.appendChild(button);
      }
    }
  }

  /**
   * イベントリスナーのアタッチ
   */
  attachEventListeners() {
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener('click', () => this.startGame());
    }
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => location.reload());
    }
    if (this.elements.showLegalMovesCheckbox) {
      this.elements.showLegalMovesCheckbox.addEventListener('change', () => {
        this.showLegalMoves = this.elements.showLegalMovesCheckbox.checked;
        this.displayLegalMoves();
      });
    }
    if (this.elements.difficultySelect) {
      this.elements.difficultySelect.addEventListener('change', (e) => {
        this.difficulty = parseInt(e.target.value);
      });
    }
  }

  /**
   * ゲーム開始
   */
  startGame() {
    // プレイヤー色の取得
    const selectedRadio = document.querySelector('input[name="playerColor"]:checked');
    const selectedColor = selectedRadio ? selectedRadio.value : 'BLACK';
    this.humanPlayer = selectedColor === 'BLACK' ? ReversiGame.BLACK : ReversiGame.WHITE;
    this.computerPlayer = -this.humanPlayer;

    // ゲーム状態をリセット
    this.board = this.initializeBoard();
    this.currentPlayer = ReversiGame.BLACK;
    this.moveCount = 0;
    this.gameStatus = ReversiGame.EARLY_GAME;
    this.log = '';
    this.moveHistory = [];

    this.updateDisplay();
    this.displayLegalMoves();

    // コンピュータが先行の場合
    if (this.humanPlayer === ReversiGame.WHITE) {
      this.computerMove();
    }
  }

  /**
   * セルクリックハンドラ
   */
  handleCellClick(event) {
    if (this.computerThinking) return;

    const row = parseInt(event.currentTarget.dataset.row);
    const col = parseInt(event.currentTarget.dataset.col);

    if (this.currentPlayer !== this.humanPlayer) return;

    if (this.isValidMove(this.board, row, col, this.humanPlayer)) {
      this.makeMove(row, col, this.humanPlayer);
      this.updateDisplay();
      this.displayLegalMoves();

      // 勝敗・パス判定
      const nextLegalMoves = this.getLegalMoves(this.board, this.currentPlayer);
      if (nextLegalMoves.length === 0) {
        // コンピュータに手番が回るが、コンピュータも置けない場合は終局
        const humanLegalMoves = this.getLegalMoves(this.board, this.humanPlayer);
        if (humanLegalMoves.length === 0) {
          this.endGame();
          return;
        } else {
          // コンピュータがパス、再び人間のターン
          this.updateStatus('コンピュータ側は置ける場所がないためパスします');
          this.currentPlayer = this.humanPlayer;
          this.displayLegalMoves();
        }
      } else {
        // コンピュータのターン
        setTimeout(() => this.computerMove(), 500);
      }
    } else {
      this.updateStatus('そのマスには置く事ができません');
    }
  }

  /**
   * コンピュータの手
   */
  computerMove() {
    this.computerThinking = true;
    this.updateStatus('コンピュータが思考中です...');

    setTimeout(() => {
      const legalMoves = this.getLegalMoves(this.board, this.computerPlayer);
      if (legalMoves.length === 0) {
        const humanLegalMoves = this.getLegalMoves(this.board, this.humanPlayer);
        if (humanLegalMoves.length === 0) {
          this.endGame();
        } else {
          this.updateStatus('コンピュータ側はパスします');
          this.currentPlayer = this.humanPlayer;
          this.displayLegalMoves();
        }
      } else {
        const move = this.selectBestMove(this.board, this.computerPlayer);
        this.makeMove(move.row, move.col, this.computerPlayer);
        this.updateDisplay();

        // 人間の番で置ける場所があるかチェック
        const humanMoves = this.getLegalMoves(this.board, this.humanPlayer);
        if (humanMoves.length === 0) {
          // 置けないならパスして再びコンピュータのターン
          const comMoves = this.getLegalMoves(this.board, this.computerPlayer);
          if (comMoves.length === 0) {
            this.endGame();
          } else {
            this.updateStatus('あなたが置けるマスがないのでパスします');
            this.currentPlayer = this.computerPlayer;
            setTimeout(() => this.computerMove(), 500);
          }
        } else {
          this.displayLegalMoves();
        }
      }
      this.computerThinking = false;
    }, 300);
  }

  /**
   * 最善手の選択
   */
  selectBestMove(board, color) {
    const legalMoves = this.getLegalMoves(board, color);
    
    // 難易度0 (Low): ランダム選択
    if (this.difficulty === 0) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    // 難易度1 (Medium): 評価テーブルベースの1手読み
    if (this.difficulty === 1) {
      const scoredMoves = legalMoves.map(move => {
        const boardCopy = this.cloneBoard(board);
        this.placePiece(boardCopy, move.row, move.col, color);
        // 評価テーブルスコア + 自分の着手可能数 - 相手の着手可能数 * 2
        const score = ReversiGame.CELL_POINTS[move.row][move.col] 
                    + this.getLegalMoves(boardCopy, color).length 
                    - this.getLegalMoves(boardCopy, -color).length * 2;
        return { ...move, score };
      });
      scoredMoves.sort((a, b) => b.score - a.score);
      return scoredMoves[0];
    }

    // 難易度2 (High): 定石＋Negamax探索
    if (this.difficulty === 2) {
      // 1. 序盤（〜12手）かつ定石がある場合
      if (this.moveCount < 12) {
        const openingMove = this.getOpeningMove();
        if (openingMove) {
          return openingMove;
        }
      }

      // 2. 中盤・終盤の探索
      const empty = this.countEmptyCells(board);
      const isPerfect = empty <= 16;
      const depth = isPerfect ? empty : 4; // 残り16マス以下なら完全読み切り、それ以外は4手先読み

      let bestMove = null;
      let maxScore = -100000000;
      
      const ordered = this.getOrderedMoves(board, color);
      for (const move of ordered) {
        const nextBoard = this.cloneBoard(board);
        this.placePiece(nextBoard, move.row, move.col, color);
        
        // 探索開始
        const score = -this.negamax(nextBoard, -color, -100000000, 100000000, depth - 1, isPerfect);
        if (score > maxScore) {
          maxScore = score;
          bestMove = move;
        }
      }
      return bestMove || legalMoves[0];
    }

    return legalMoves[0];
  }

  /**
   * Negamax探索 (アルファ・ベータ枝刈り)
   */
  negamax(board, color, alpha, beta, depth, perfect) {
    const moves = this.getOrderedMoves(board, color);
    const opponentMoves = this.getLegalMoves(board, -color);

    // 両者パス (終局)
    if (moves.length === 0 && opponentMoves.length === 0) {
      return this.countDifference(board, color) * 10000;
    }

    // パスの場合
    if (moves.length === 0) {
      return -this.negamax(board, -color, -beta, -alpha, depth - 1, perfect);
    }

    // 探索の深さ制限に到達
    if (depth <= 0 && !perfect) {
      return this.searchEvaluator(board, color);
    }

    let maxScore = -100000000;
    for (const move of moves) {
      const nextBoard = this.cloneBoard(board);
      this.placePiece(nextBoard, move.row, move.col, color);
      
      const score = -this.negamax(nextBoard, -color, -beta, -alpha, depth - 1, perfect);
      
      if (score > maxScore) {
        maxScore = score;
      }
      if (score > alpha) {
        alpha = score;
      }
      if (alpha >= beta) {
        break; // β枝刈り
      }
    }
    return maxScore;
  }

  /**
   * 探索順序の最適化
   */
  getOrderedMoves(board, color) {
    const moves = this.getLegalMoves(board, color);
    const scored = moves.map(move => {
      const nextBoard = this.cloneBoard(board);
      this.placePiece(nextBoard, move.row, move.col, color);
      const score = ReversiGame.CELL_POINTS[move.row][move.col]
                  + this.getLegalMoves(nextBoard, color).length
                  - this.getLegalMoves(nextBoard, -color).length * 2;
      return { ...move, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  /**
   * 探索末端の評価関数
   */
  searchEvaluator(board, color) {
    const empty = this.countEmptyCells(board);
    if (empty <= 12) {
      // 終盤残り12マス以下なら石の多さを最優先
      return this.countDifference(board, color) * 10000;
    }
    // 中盤は確定石、合法手数、開放度による総合評価
    return this.evaluateBoard(board, color) + this.countDifference(board, color) * (this.moveCount >= 44 ? 20 : -2);
  }

  /**
   * 総合盤面評価
   */
  evaluateBoard(board, color) {
    const wStable = 1000;
    const wMobility = 10;
    const wOppMobility = -10;
    const wOppLiberty = -100;

    const stable = this.countStableDiscs(board, color);
    const mobility = this.getLegalMoves(board, color).length;
    const oppMobility = this.getLegalMoves(board, -color).length;
    const oppLiberty = this.countLiberty(board, -color);

    return wStable * stable 
         + wMobility * mobility 
         + wOppMobility * oppMobility 
         + wOppLiberty * oppLiberty;
  }

  /**
   * 開放度 (石の周囲にある空きマスの総数)
   */
  countLiberty(board, color) {
    let count = 0;
    for (let x = 1; x < 9; x++) {
      for (let y = 1; y < 9; y++) {
        if (board[x][y] === color) {
          for (let tx = -1; tx <= 1; tx++) {
            for (let ty = -1; ty <= 1; ty++) {
              if (board[x + tx][y + ty] === ReversiGame.EMPTY) {
                count++;
              }
            }
          }
        }
      }
    }
    return count;
  }

  /**
   * 確定石 (隅から連続して繋がっている、絶対に返らない石)
   */
  countStableDiscs(board, color) {
    let cnt = 0;
    let cnt1 = 0; // 1行目
    let cnt2 = 0; // h列 (8列)
    let cnt3 = 0; // 8行目
    let cnt4 = 0; // a列 (1列)

    // 1. 1行目 (上辺)
    if (board[1][1] === color) {
      cnt1++;
      for (let i = 2; i < 8; i++) {
        if (board[1][i] === color) cnt1++;
        else break;
      }
    }
    if (board[1][8] === color) {
      for (let i = 1; i < 7; i++) {
        if (board[1][8 - i] === color) cnt1++;
        else break;
      }
    }
    if (board[1].slice(1, 9).every(c => c !== ReversiGame.EMPTY)) {
      cnt1 = board[1].slice(1, 9).filter(c => c === color).length;
    }

    // 2. h列 (右辺)
    if (board[1][8] === color) {
      cnt2++;
      for (let i = 2; i < 8; i++) {
        if (board[i][8] === color) cnt2++;
        else break;
      }
    }
    if (board[8][8] === color) {
      for (let i = 1; i < 7; i++) {
        if (board[8 - i][8] === color) cnt2++;
        else break;
      }
    }
    let rightEdgeFull = true;
    for (let i = 1; i < 9; i++) {
      if (board[i][8] === ReversiGame.EMPTY) rightEdgeFull = false;
    }
    if (rightEdgeFull) {
      cnt2 = 0;
      for (let i = 1; i < 9; i++) {
        if (board[i][8] === color) cnt2++;
      }
    }

    // 3. 8行目 (下辺)
    if (board[8][8] === color) {
      cnt3++;
      for (let i = 1; i < 7; i++) {
        if (board[8][8 - i] === color) cnt3++;
        else break;
      }
    }
    if (board[8][1] === color) {
      for (let i = 2; i < 8; i++) {
        if (board[8][i] === color) cnt3++;
        else break;
      }
    }
    if (board[8].slice(1, 9).every(c => c !== ReversiGame.EMPTY)) {
      cnt3 = board[8].slice(1, 9).filter(c => c === color).length;
    }

    // 4. a列 (左辺)
    if (board[8][1] === color) {
      cnt4++;
      for (let i = 1; i < 7; i++) {
        if (board[8 - i][1] === color) cnt4++;
        else break;
      }
    }
    if (board[1][1] === color) {
      for (let i = 2; i < 8; i++) {
        if (board[i][1] === color) cnt4++;
        else break;
      }
    }
    let leftEdgeFull = true;
    for (let i = 1; i < 9; i++) {
      if (board[i][1] === ReversiGame.EMPTY) leftEdgeFull = false;
    }
    if (leftEdgeFull) {
      cnt4 = 0;
      for (let i = 1; i < 9; i++) {
        if (board[i][1] === color) cnt4++;
      }
    }

    cnt = cnt1 + cnt2 + cnt3 + cnt4;
    return cnt;
  }

  /**
   * 定石から手を取得
   */
  getOpeningMove() {
    const logj = this.getNormalizedHistory();
    if (!window.joseki) return null;

    for (let i = 0; i < window.joseki.length; i++) {
      const pattern = window.joseki[i];
      if (pattern.startsWith(logj) && pattern.length > logj.length) {
        const next = pattern.substr(logj.length, 2);
        const colChar = next.charAt(0).toLowerCase();
        const rowNum = parseInt(next.charAt(1));

        const ry = colChar.charCodeAt(0) - 96; // 'a' -> 1, 'b' -> 2, etc.
        const rx = rowNum;

        // 逆変換
        const firstMove = this.moveHistory[0];
        const fpiece = firstMove.row;
        let nx, ny;

        switch (fpiece) {
          case 5:
            nx = rx;
            ny = ry;
            break;
          case 6:
            nx = ry;
            ny = rx;
            break;
          case 3:
            nx = 9 - ry;
            ny = 9 - rx;
            break;
          case 4:
            nx = 9 - rx;
            ny = 9 - ry;
            break;
          default:
            nx = rx;
            ny = ry;
        }

        if (this.isValidMove(this.board, nx, ny, this.computerPlayer)) {
          return { row: nx, col: ny };
        }
      }
    }
    return null;
  }

  /**
   * 正規化された棋譜履歴の取得
   */
  getNormalizedHistory() {
    if (this.moveHistory.length === 0) return '';

    const firstMove = this.moveHistory[0];
    const fpiece = firstMove.row; // 1手目の縦座標

    let logj = '';
    for (const move of this.moveHistory) {
      const { row: x, col: y, color } = move;
      let rx, ry;

      switch (fpiece) {
        case 5:
          rx = x;
          ry = y;
          break;
        case 6:
          rx = y;
          ry = x;
          break;
        case 3:
          rx = 9 - y;
          ry = 9 - x;
          break;
        case 4:
          rx = 9 - x;
          ry = 9 - y;
          break;
        default:
          rx = x;
          ry = y;
      }

      const colStr = String.fromCharCode(96 + ry);
      if (color === ReversiGame.BLACK) {
        logj += colStr.toUpperCase() + rx;
      } else {
        logj += colStr + rx;
      }
    }
    return logj;
  }

  /**
   * 空きマス数のカウント
   */
  countEmptyCells(board) {
    let empty = 0;
    for (let x = 1; x < 9; x++) {
      for (let y = 1; y < 9; y++) {
        if (board[x][y] === ReversiGame.EMPTY) empty++;
      }
    }
    return empty;
  }

  /**
   * 合法手を取得
   */
  getLegalMoves(board, color) {
    const moves = [];
    for (let x = 1; x < 9; x++) {
      for (let y = 1; y < 9; y++) {
        if (board[x][y] === ReversiGame.EMPTY && this.isValidMove(board, x, y, color)) {
          moves.push({ row: x, col: y });
        }
      }
    }
    return moves;
  }

  /**
   * 有効な手かチェック
   */
  isValidMove(board, row, col, color) {
    if (board[row][col] !== ReversiGame.EMPTY) return false;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (this.canFlip(board, row, col, color, dx, dy)) return true;
      }
    }
    return false;
  }

  /**
   * 挟める方向があるかチェック
   */
  canFlip(board, row, col, color, dx, dy) {
    let x = row + dx;
    let y = col + dy;

    if (board[x]?.[y] !== -color) return false;

    while (1 <= x && x <= 8 && 1 <= y && y <= 8) {
      if (board[x][y] === color) return true;
      if (board[x][y] === ReversiGame.EMPTY) return false;
      x += dx;
      y += dy;
    }
    return false;
  }

  /**
   * 駒を置く
   */
  makeMove(row, col, color) {
    this.placePiece(this.board, row, col, color);
    this.moveCount++;
    this.moveHistory.push({ row, col, color });
    this.log += color === ReversiGame.BLACK ? 'B' : 'W';
    this.currentPlayer = -color;

    // ゲーム進行状態の更新
    if (this.moveCount >= 46) {
      this.gameStatus = ReversiGame.END_GAME;
    } else if (this.moveCount >= 12) {
      this.gameStatus = ReversiGame.MID_GAME;
    }
  }

  /**
   * 盤面に駒を置き、挟まった駒を反転
   */
  placePiece(board, row, col, color) {
    board[row][col] = color;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        this.flipPieces(board, row, col, color, dx, dy);
      }
    }
  }

  /**
   * 駒を反転
   */
  flipPieces(board, row, col, color, dx, dy) {
    const toFlip = [];
    let x = row + dx;
    let y = col + dy;

    while (1 <= x && x <= 8 && 1 <= y && y <= 8) {
      if (board[x][y] === -color) {
        toFlip.push([x, y]);
      } else if (board[x][y] === color) {
        toFlip.forEach(([fx, fy]) => {
          board[fx][fy] = color;
        });
        return;
      } else {
        return;
      }
      x += dx;
      y += dy;
    }
  }

  /**
   * ボードのクローン
   */
  cloneBoard(board) {
    return board.map(row => [...row]);
  }

  /**
   * 駒数の差を計算
   */
  countDifference(board, color) {
    let blackCount = 0, whiteCount = 0;
    for (let x = 1; x < 9; x++) {
      for (let y = 1; y < 9; y++) {
        if (board[x][y] === ReversiGame.BLACK) blackCount++;
        else if (board[x][y] === ReversiGame.WHITE) whiteCount++;
      }
    }
    return color === ReversiGame.BLACK ? (blackCount - whiteCount) : (whiteCount - blackCount);
  }

  /**
   * 合法手を表示
   */
  displayLegalMoves() {
    const buttons = document.querySelectorAll('.board-cell');
    
    // 一旦全セルのヒント表示（legal-moveクラス）をクリア
    buttons.forEach(btn => {
      btn.classList.remove('legal-move');
    });

    if (!this.showLegalMoves || this.currentPlayer !== this.humanPlayer) return;

    const legalMoves = this.getLegalMoves(this.board, this.currentPlayer);
    for (const { row, col } of legalMoves) {
      const idx = (row - 1) * 8 + (col - 1);
      buttons[idx].classList.add('legal-move');
    }
  }

  /**
   * ディスプレイ更新
   */
  updateDisplay() {
    // ボード更新
    const buttons = document.querySelectorAll('.board-cell');
    for (let x = 1; x < 9; x++) {
      for (let y = 1; y < 9; y++) {
        const idx = (x - 1) * 8 + (y - 1);
        const btn = buttons[idx];
        btn.innerHTML = '';

        const piece = this.board[x][y];
        if (piece === ReversiGame.BLACK) {
          const disc = document.createElement('div');
          disc.className = 'disc black';
          btn.appendChild(disc);
        } else if (piece === ReversiGame.WHITE) {
          const disc = document.createElement('div');
          disc.className = 'disc white';
          btn.appendChild(disc);
        }
      }
    }

    // 駒数更新
    const { blackCount, whiteCount } = this.countPieces();
    if (this.elements.blackCount) this.elements.blackCount.textContent = blackCount;
    if (this.elements.whiteCount) this.elements.whiteCount.textContent = whiteCount;
    if (this.elements.moveCount) this.elements.moveCount.textContent = this.moveCount;

    // ステータスメッセージの更新
    if (this.currentPlayer === this.humanPlayer) {
      this.updateStatus('あなたの番です');
    } else {
      this.updateStatus('コンピュータの番です');
    }
  }

  /**
   * 駒数をカウント
   */
  countPieces() {
    let blackCount = 0, whiteCount = 0;
    for (let x = 1; x < 9; x++) {
      for (let y = 1; y < 9; y++) {
        if (this.board[x][y] === ReversiGame.BLACK) blackCount++;
        else if (this.board[x][y] === ReversiGame.WHITE) whiteCount++;
      }
    }
    return { blackCount, whiteCount };
  }

  /**
   * ステータス更新
   */
  updateStatus(message) {
    if (this.elements.statusMessage) {
      this.elements.statusMessage.textContent = message;
    }
  }

  /**
   * ゲーム終了
   */
  endGame() {
    const { blackCount, whiteCount } = this.countPieces();
    let winner;
    if (blackCount > whiteCount) {
      winner = this.humanPlayer === ReversiGame.BLACK ? 'あなたの勝ちです' : 'コンピュータの勝ちです';
    } else if (whiteCount > blackCount) {
      winner = this.humanPlayer === ReversiGame.WHITE ? 'あなたの勝ちです' : 'コンピュータの勝ちです';
    } else {
      winner = '引き分けです';
    }
    this.updateStatus(`ゲーム終了: ${winner} (黒: ${blackCount} - 白: ${whiteCount})`);
  }
}
