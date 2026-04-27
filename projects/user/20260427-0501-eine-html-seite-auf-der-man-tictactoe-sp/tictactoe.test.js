// tictactoe.test.js
import {
  init,
  renderBoard,
  handleCellClick,
  checkWin,
  handleWin,
  handleDraw,
  updateStatus,
  resetGame
} from './tictactoe';

describe('TicTacToe', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="board" aria-label="Spielbrett"></section>
      <div id="status" aria-live="polite"></div>
      <button id="reset-btn" aria-label="Spiel zurücksetzen">Neues Spiel</button>
    `;
  });

  it('init', () => {
    init();
    expect(document.getElementById('status').textContent).toBe('Spieler X ist am Zug');
  });

  it('renderBoard', () => {
    renderBoard();
    expect(document.getElementById('board').childElementCount).toBe(9);
  });

  it('handleCellClick', () => {
    const cell = document.createElement('button');
    cell.dataset.index = '0';
    handleCellClick({ target: cell });
    expect(cell.textContent).toBe('X');
  });

  it('checkWin', () => {
    const board = ['X', 'X', 'X', null, null, null, null, null, null];
    expect(checkWin('X')).toBeTruthy();
  });

  it('handleWin', () => {
    const combo = [0, 1, 2];
    handleWin(combo);
    expect(document.getElementById('status').textContent).toBe('Spieler X gewinnt!');
  });

  it('handleDraw', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    handleDraw();
    expect(document.getElementById('status').textContent).toBe('Unentschieden!');
  });

  it('updateStatus', () => {
    updateStatus('Test');
    expect(document.getElementById('status').textContent).toBe('Test');
  });

  it('resetGame', () => {
    resetGame();
    expect(document.getElementById('status').textContent).toBe('Spieler X ist am Zug');
  });
});