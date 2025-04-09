import Phaser from 'phaser';

// Emoji set for UI
const EMOJIS = {
  numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'],
  empty: '⬜',
  selected: '🟡',
  fixed: '⬛',
  correct: '✅',
  incorrect: '❌',
  restart: '🔄',
  check: '🔍',
  solve: '🧩',
  win: '🎉'
};

// UI Colors for better contrast
const COLORS = {
  background: 0x2c3e50,  // Dark blue-gray
  boardBg: 0x34495e,     // Slightly lighter blue-gray
  cellBg: 0xecf0f1,      // Light gray-white
  cellStroke: 0x2c3e50,  // Dark blue for border
  cellHighlight: 0x3498db, // Bright blue for highlights
  textColor: 0x000000,   // Black for text
  fixedCellBg: 0xbdc3c7, // Gray for fixed cells
  statusText: 0xffffff   // White text for status
};

export class SudokuScene extends Phaser.Scene {
  private board: number[][] = [];
  private solution: number[][] = [];
  private cells: Phaser.GameObjects.Text[][] = [];
  private selectedCell: { row: number; col: number } | null = null;
  private numberButtons: Phaser.GameObjects.Text[] = [];
  private difficultyLevel: number = 30; // Number of cells to reveal
  private statusText: Phaser.GameObjects.Text | null = null;
  private controlButtons: { [key: string]: Phaser.GameObjects.Text } = {};

  constructor() {
    super({ key: 'SudokuScene' });
  }

  preload() {
    // No image preloading needed as we're using emojis
  }

  create() {
    // Set the background color for better contrast
    this.cameras.main.setBackgroundColor(COLORS.background);

    // Add title with better contrast
    this.add.text(300, 30, '🎮 Emoji Sudoku 🎮', {
      fontSize: '32px',
      color: '#FFFFFF' // White text for better contrast
    }).setOrigin(0.5);

    this.generateSudoku();
    this.drawBoard();
    this.createNumberButtons();
    this.createControlButtons();
    
    // Status text with better contrast
    this.statusText = this.add.text(300, 590, '', {
      fontSize: '24px',
      color: '#FFFFFF' // White text for visibility
    }).setOrigin(0.5);
    
    this.updateStatus('Start playing! Select a cell and pick a number.');

    // Listen for keyboard input - safely check if keyboard exists first
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', this.handleKeyPress, this);
    }
  }

  private updateStatus(message: string) {
    if (this.statusText) {
      this.statusText.setText(message);
    }
  }

  private generateSudoku() {
    // Start with an empty board
    this.board = Array(9).fill(0).map(() => Array(9).fill(0));
    
    // Generate a solved board
    this.solution = Array(9).fill(0).map(() => Array(9).fill(0));
    this.solveSudoku(this.solution);
    
    // Copy the solution and remove some numbers based on difficulty
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        this.board[row][col] = this.solution[row][col];
      }
    }
    
    // Remove numbers to create the puzzle
    let cellsToRemove = 81 - this.difficultyLevel;
    while (cellsToRemove > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (this.board[row][col] !== 0) {
        this.board[row][col] = 0;
        cellsToRemove--;
      }
    }
  }

  private solveSudoku(board: number[][]) {
    const emptyCell = this.findEmptyCell(board);
    if (!emptyCell) return true; // No empty cells means the board is solved
    
    const [row, col] = emptyCell;
    
    // Try each number 1-9
    for (let num = 1; num <= 9; num++) {
      if (this.isValidPlacement(board, row, col, num)) {
        board[row][col] = num;
        
        if (this.solveSudoku(board)) {
          return true;
        }
        
        board[row][col] = 0; // Backtrack if this doesn't lead to a solution
      }
    }
    
    return false;
  }

  private findEmptyCell(board: number[][]): [number, number] | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null;
  }

  private isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[boxRow + r][boxCol + c] === num) return false;
      }
    }
    
    return true;
  }

  private drawBoard() {
    this.cells = [];
    const cellSize = 50;
    const boardSize = 9 * cellSize;
    const boardX = 300 - (boardSize / 2); // Center the board horizontally
    const boardY = 90;
    
    // Create a background for the board with better contrast
    this.add.rectangle(300, boardY + (boardSize / 2), boardSize + 10, boardSize + 10, COLORS.boardBg).setOrigin(0.5);
    
    for (let row = 0; row < 9; row++) {
      this.cells[row] = [];
      for (let col = 0; col < 9; col++) {
        const x = boardX + col * cellSize;
        const y = boardY + row * cellSize;
        
        // Add cell background with better contrast
        const cellBackground = this.add.rectangle(
          x + cellSize/2, 
          y + cellSize/2, 
          cellSize - 2, 
          cellSize - 2, 
          this.board[row][col] !== 0 ? COLORS.fixedCellBg : COLORS.cellBg
        ).setOrigin(0.5);
        
        cellBackground.setStrokeStyle(1, COLORS.cellStroke);
        
        // Add thicker borders for 3x3 boxes
        if (row % 3 === 0 && row !== 0) {
          this.add.line(0, y, boardX, y, boardX + cellSize * 9, y, 0x000000).setLineWidth(3);
        }
        if (col % 3 === 0 && col !== 0) {
          this.add.line(x, 0, x, boardY, x, boardY + cellSize * 9, 0x000000).setLineWidth(3);
        }
        
        // Add cell value with better contrast
        let cellText;
        if (this.board[row][col] !== 0) {
          // Original values displayed as emojis
          cellText = this.add.text(x + cellSize/2, y + cellSize/2, EMOJIS.numbers[this.board[row][col] - 1], {
            fontSize: '28px'
          }).setOrigin(0.5);
        } else {
          cellText = this.add.text(x + cellSize/2, y + cellSize/2, EMOJIS.empty, {
            fontSize: '28px'
          }).setOrigin(0.5);
        }
        
        this.cells[row][col] = cellText;
        
        // Make cells interactive
        cellBackground.setInteractive();
        cellBackground.on('pointerdown', () => this.selectCell(row, col));
      }
    }
  }

  private createNumberButtons() {
    const buttonY = 520;
    const boardWidth = 450;
    const buttonSpacing = boardWidth / 9;
    
    // Add a button container for better visibility
    this.add.rectangle(300, buttonY, boardWidth, 60, 0xecf0f1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x2c3e50);
    
    for (let i = 0; i < 9; i++) {
      const buttonX = 300 - (boardWidth / 2) + (buttonSpacing / 2) + (i * buttonSpacing);
      
      // Add button background for better interactions
      const buttonBg = this.add.circle(buttonX, buttonY, 25, 0x3498db);
      buttonBg.setInteractive();
      buttonBg.on('pointerdown', () => this.enterNumber(i + 1));
      
      // Add button text
      const button = this.add.text(buttonX, buttonY, EMOJIS.numbers[i], {
        fontSize: '32px'
      }).setOrigin(0.5);
      
      this.numberButtons.push(button);
    }
  }

  private createControlButtons() {
    // Create a control panel with better contrast
    const controlPanelY = 40;
    
    // Restart button with better positioning and contrast
    const restartBg = this.add.circle(100, controlPanelY, 25, 0x3498db);
    restartBg.setInteractive();
    restartBg.on('pointerdown', () => this.restartGame());
    
    this.controlButtons.restart = this.add.text(100, controlPanelY, EMOJIS.restart, {
      fontSize: '32px'
    }).setOrigin(0.5);
    
    // Check button with better positioning and contrast
    const checkBg = this.add.circle(460, controlPanelY, 25, 0x3498db);
    checkBg.setInteractive();
    checkBg.on('pointerdown', () => this.checkSolution());
    
    this.controlButtons.check = this.add.text(460, controlPanelY, EMOJIS.check, {
      fontSize: '32px'
    }).setOrigin(0.5);
    
    // Solve button with better positioning and contrast
    const solveBg = this.add.circle(520, controlPanelY, 25, 0x3498db);
    solveBg.setInteractive();
    solveBg.on('pointerdown', () => this.showSolution());
    
    this.controlButtons.solve = this.add.text(520, controlPanelY, EMOJIS.solve, {
      fontSize: '32px'
    }).setOrigin(0.5);

    // Add labels for the control buttons
    this.add.text(100, controlPanelY + 35, "Reset", {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    this.add.text(460, controlPanelY + 35, "Check", {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    this.add.text(520, controlPanelY + 35, "Solve", {
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
  }

  private selectCell(row: number, col: number) {
    // Clear previous selection
    if (this.selectedCell) {
      const { row: prevRow, col: prevCol } = this.selectedCell;
      if (this.board[prevRow][prevCol] === 0) {
        // Only update if it's not a fixed cell
        if (this.cells[prevRow][prevCol].text === EMOJIS.selected) {
          this.cells[prevRow][prevCol].setText(EMOJIS.empty);
        }
      }
    }
    
    // Don't allow selection of fixed cells
    if (this.isCellFixed(row, col)) {
      this.updateStatus('That cell is fixed! Try another one.');
      this.selectedCell = null;
      return;
    }
    
    // Set new selection with better visibility
    if (this.cells[row][col].text === EMOJIS.empty) {
      this.cells[row][col].setText(EMOJIS.selected);
    }
    
    this.selectedCell = { row, col };
  }

  private isCellFixed(row: number, col: number): boolean {
    // Fixed cells are the ones that were originally set in the puzzle
    return this.board[row][col] !== 0;
  }

  private enterNumber(num: number) {
    if (!this.selectedCell) {
      this.updateStatus('Select a cell first!');
      return;
    }
    
    const { row, col } = this.selectedCell;
    
    // Update the cell with the selected number
    this.cells[row][col].setText(EMOJIS.numbers[num - 1]);
    
    // Check if the move was correct
    if (num === this.solution[row][col]) {
      this.updateStatus('Correct move! 👍');
    } else {
      this.updateStatus('That might not be right... 🤔');
    }
    
    // Check if the game is complete
    if (this.checkCompletion()) {
      this.gameWon();
    }
  }

  private checkCompletion(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        // Skip fixed cells
        if (this.board[row][col] !== 0) continue;
        
        // Find the actual number from the emoji
        const cellText = this.cells[row][col].text;
        if (cellText === EMOJIS.empty || cellText === EMOJIS.selected) return false;
        
        const cellNum = EMOJIS.numbers.indexOf(cellText) + 1;
        if (cellNum === 0 || cellNum !== this.solution[row][col]) return false;
      }
    }
    
    return true;
  }

  private gameWon() {
    this.updateStatus(EMOJIS.win + ' Congratulations! You solved it! ' + EMOJIS.win);
    
    // Simplified particle effect to avoid TypeScript errors
    this.add.particles(300, 300, 'particle', {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      active: true,
      lifespan: 2000,
      gravityY: 300,
      quantity: 100
    });
  }

  private restartGame() {
    this.generateSudoku();
    
    // Update the board cells
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] !== 0) {
          this.cells[row][col].setText(EMOJIS.numbers[this.board[row][col] - 1]);
        } else {
          this.cells[row][col].setText(EMOJIS.empty);
        }
      }
    }
    
    this.selectedCell = null;
    this.updateStatus('Game restarted! Let\'s play again!');
  }

  private checkSolution() {
    let isCorrect = true;
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        // Skip empty cells and fixed cells
        if (this.board[row][col] !== 0) continue;
        if (this.cells[row][col].text === EMOJIS.empty || this.cells[row][col].text === EMOJIS.selected) continue;
        
        // Find the actual number from the emoji
        const cellText = this.cells[row][col].text;
        const cellNum = EMOJIS.numbers.indexOf(cellText) + 1;
        
        if (cellNum !== this.solution[row][col]) {
          isCorrect = false;
          // Highlight incorrect cells temporarily
          const originalText = this.cells[row][col].text;
          this.cells[row][col].setText(EMOJIS.incorrect);
          this.time.delayedCall(1000, () => {
            this.cells[row][col].setText(originalText);
          });
        }
      }
    }
    
    if (isCorrect) {
      this.updateStatus('Looking good so far! 👍');
    } else {
      this.updateStatus('There are some mistakes... 🔍');
    }
  }

  private showSolution() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] === 0) {
          this.cells[row][col].setText(EMOJIS.numbers[this.solution[row][col] - 1]);
        }
      }
    }
    
    this.updateStatus('Here\'s the solution! Try again from scratch?');
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (!this.selectedCell) return;
    
    if (event.key >= '1' && event.key <= '9') {
      const num = parseInt(event.key);
      this.enterNumber(num);
    }
  }
}