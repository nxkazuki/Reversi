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
    this.elements.startBtn.addEventListener('click', () => this.startGame());
    this.elements.resetBtn.addEventListener('click', () => location.reload());
    this.elements.showLegalMovesCheckbox.addEventListener('change', () => {
      this.showLegalMoves = this.elements.showLegalMovesCheckbox.checked;
      this.displayLegalMoves();
    });
    this.elements.difficultySelect.addEventListener('change', (e) => {
      this.difficulty = parseInt(e.target.value);
    });
  }

  /**
   * ゲーム開始
   */
  startGame() {
    // プレイヤー色の取得
    const selectedColor = document.querySelector('input[name="playerColor"]:checked').value;
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

    if (this.isValidMove(row, col, this.humanPlayer)) {
      this.makeMove(row, col, this.humanPlayer);
      this.updateDisplay();
      this.displayLegalMoves();

      // コンピュータのターン
      setTimeout(() => this.computerMove(), 500);
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
      const legalMoves = this.getLegalMoves(this.computerPlayer);
      if (legalMoves.length === 0) {
        const humanLegalMoves = this.getLegalMoves(this.humanPlayer);
        if (humanLegalMoves.length === 0) {
          this.endGame();
        } else {
          this.updateStatus('コンピュータ側はパスします');
          this.currentPlayer = this.humanPlayer;
        }
      } else {
        const move = this.selectBestMove(legalMoves);
        this.makeMove(move.row, move.col, this.computerPlayer);
        this.updateDisplay();
        this.displayLegalMoves();
      }
      this.computerThinking = false;
    }, 300);
  }

  /**
   * 最善手の選択
   */
  selectBestMove(legalMoves) {
    if (this.difficulty === 0) {
      // ランダム選択
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    } else {
      // 評価値が高いマスを選択
      const scoredMoves = legalMoves.map(move => ({
        ...move,
        score: this.evaluateMove(move)
      }));
      scoredMoves.sort((a, b) => b.score - a.score);
      return scoredMoves[0];
    }
  }

  /**
   * 手の評価
   */
  evaluateMove(move) {
    const boardCopy = this.cloneBoard(this.board);
    this.placePiece(boardCopy, move.row, move.col, this.computerPlayer);
    const diff = this.countDifference(boardCopy, this.computerPlayer);
    const corners = this.countCornersOwned(boardCopy, this.computerPlayer);
    return diff * 10 + corners * 50;
  }

  /**
   * コーナーの数を数える
   */
  countCornersOwned(board, color) {
    let count = 0;
    const corners = [[1, 1], [1, 8], [8, 1], [8, 8]];
    for (const [x, y] of corners) {
      if (board[x][y] === color) count++;
    }
    return count;
  }

  /**
   * 合法手を取得
   */
  getLegalMoves(color) {
    const moves = [];
    for (let x = 1; x < 9; x++) {
      for (let y = 1; y < 9; y++) {
        if (this.board[x][y] === ReversiGame.EMPTY && this.isValidMove(x, y, color)) {
          moves.push({ row: x, col: y });
        }
      }
    }
    return moves;
  }

  /**
   * 有効な手かチェック
   */
  isValidMove(row, col, color) {
    if (this.board[row][col] !== ReversiGame.EMPTY) return false;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (this.canFlip(row, col, color, dx, dy)) return true;
      }
    }
    return false;
  }

  /**
   * 挟める方向があるかチェック
   */
  canFlip(row, col, color, dx, dy) {
    let x = row + dx;
    let y = col + dy;

    if (this.board[x]?.[y] !== -color) return false;

    while (1 <= x && x <= 8 && 1 <= y && y <= 8) {
      if (this.board[x][y] === color) return true;
      if (this.board[x][y] === ReversiGame.EMPTY) return false;
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
    if (!this.showLegalMoves) return;

    const buttons = document.querySelectorAll('.board-cell');
    buttons.forEach(btn => btn.style.opacity = '1');

    const legalMoves = this.getLegalMoves(this.currentPlayer);
    for (const { row, col } of legalMoves) {
      const idx = (row - 1) * 8 + (col - 1);
      buttons[idx].style.opacity = '0.6';
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
          btn.innerHTML = '●';
          btn.style.color = '#000';
        } else if (piece === ReversiGame.WHITE) {
          btn.innerHTML = '●';
          btn.style.color = '#fff';
        }
      }
    }

    // 駒数更新
    const { blackCount, whiteCount } = this.countPieces();
    this.elements.blackCount.textContent = blackCount;
    this.elements.whiteCount.textContent = whiteCount;
    this.elements.moveCount.textContent = this.moveCount;
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
    this.elements.statusMessage.textContent = message;
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
    this.updateStatus(`ゲーム終了 ${winner}`);
  }
}
