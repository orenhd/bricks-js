import { GAME_CONSTANTS } from './constants';
import { BricksGame } from './game/BricksGame';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = GAME_CONSTANTS.BOARD_WIDTH;
    canvas.height = GAME_CONSTANTS.BOARD_HEIGHT;
    document.body.appendChild(canvas);

    // Create and start game
    const game = new BricksGame(canvas);
    game.start();
}); 