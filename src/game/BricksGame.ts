import { GameEngine } from '../engine/GameEngine';
import { Ball } from './Ball';
import { Brick } from './Brick';
import { GameState, GAME_CONSTANTS, SpriteState, BonusType, BrickType } from '../constants';
import { LevelLoader } from './LevelLoader';
import { Message } from './ui/Message';
import { Paddle, PaddleResize } from './Paddle';
import { Score } from './ui/Score';
import { Life } from './ui/Life';
import { Vector2D } from '../types/Vector2D';

export class BricksGame extends GameEngine {
    private gameState: GameState = GameState.Intro;
    private level: number = 1;
    private balls: Ball[] = [];
    private bricks: Brick[] = [];
    private paddle: Paddle;
    private lives: Life[] = [];
    private score: Score;
    private message: Message;
    private isSlowMotion: boolean = false;
    private slowMotionTime: number = 0;
    private readonly SLOW_MOTION_DURATION = 10; // seconds
    private isLevelComplete: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.paddle = new Paddle();
        this.score = new Score();
        this.message = new Message();
        this.setupGame();
    }

    private setupGame(): void {
        // Initialize balls
        this.balls = Array(3).fill(null).map(() => new Ball());
        this.balls[0].setState(SpriteState.Alive);

        // Initialize lives
        this.lives = Array(3).fill(null).map((_, i) => new Life(24 + i * 60));

        // Reset score
        this.score.setPoints(0);

        // Reset paddle to initial state
        this.paddle.reset();

        // Load first level
        this.loadLevel(1);
    }

    private async loadLevel(levelNum: number): Promise<void> {
        this.level = levelNum;
        this.bricks = await LevelLoader.loadLevel(levelNum);
        this.isLevelComplete = false;
        this.gameState = GameState.Intro;
        
        // Add an extra life
        for (let i = this.lives.length - 1; i >= 0; i--) {
            if (this.lives[i].getState() === SpriteState.Dead) {
                this.lives[i].setState(SpriteState.Alive);
                break;
            }
        }

        this.message.show(`Level ${levelNum}\n\n~ Get Ready ~\nPress SPACE to start`);
        this.resetBall();
    }

    private resetBall(): void {
        this.balls.forEach(ball => {
            ball.setLocation(Ball.ORIG_LOCATION.clone());
            ball.setRotation(Math.PI / 4 + Math.random() * Math.PI / 3);
            ball.setState(SpriteState.Dead);
        });
        this.balls[0].setState(SpriteState.Alive);
        
        this.paddle.reset();
    }

    override update(gameTime: number, elapsedTime: number): void {
        // Handle game state transitions
        if (this.gameState === GameState.Intro && this.input.isKeyDown('Space')) {
            this.gameState = GameState.Play;
            this.message.hide();
        } else if (this.gameState === GameState.Over && this.input.isKeyDown('Space')) {
            this.gameState = GameState.Play;
            this.setupGame();
            return;
        }

        if (this.gameState !== GameState.Play) return;

        // Apply slow motion if active
        if (this.isSlowMotion) {
            if (gameTime - this.slowMotionTime > this.SLOW_MOTION_DURATION) {
                this.isSlowMotion = false;
            }
            elapsedTime /= 2;
        }

        // Update paddle
        if (this.input.isKeyDown('ArrowLeft')) {
            this.paddle.setVelocity(new Vector2D(-this.paddle.getSpeed(), 0));
        } else if (this.input.isKeyDown('ArrowRight')) {
            this.paddle.setVelocity(new Vector2D(this.paddle.getSpeed(), 0));
        } else {
            this.paddle.setVelocity(new Vector2D(0, 0));
        }
        this.paddle.update(gameTime, elapsedTime);

        // Update balls
        this.balls.forEach(ball => {
            if (ball.getState() !== SpriteState.Alive) return;

            ball.update(gameTime, elapsedTime);
            this.checkCollisions(ball, gameTime);
        });

        // Update bonuses
        this.bricks.forEach(brick => {
            const bonus = brick.getBonus();
            if (bonus && (bonus.getState() === SpriteState.Alive || bonus.getState() === SpriteState.Stunned)) {
                bonus.update(gameTime, elapsedTime);

                // Check if bonus hit bottom of screen
                if (bonus.getLocation().y > GAME_CONSTANTS.BOARD_HEIGHT) {
                    bonus.setState(SpriteState.Dead);
                }
                // Check if bonus hit paddle
                else {
                    const paddleBounds = {
                        left: this.paddle.getLocation().x,
                        right: this.paddle.getLocation().x + this.paddle.getSize().width,
                        top: this.paddle.getLocation().y,
                        bottom: this.paddle.getLocation().y + this.paddle.getSize().height
                    };

                    if (bonus.getLocation().y + GAME_CONSTANTS.BONUS_SIZE.height >= paddleBounds.top &&
                        bonus.getLocation().x <= paddleBounds.right &&
                        bonus.getLocation().x + GAME_CONSTANTS.BONUS_SIZE.width >= paddleBounds.left) {
                        
                        // First set to Stunned state
                        if (bonus.getState() === SpriteState.Alive) {
                            bonus.setState(SpriteState.Stunned);
                        }
                        // Then activate and set to Dead state on next frame
                        else if (bonus.getState() === SpriteState.Stunned) {
                            bonus.setState(SpriteState.Dead);
                            this.score.addPoints(50);

                            // Apply bonus effect
                            switch (bonus.getType()) {
                                case BonusType.ThreeBalls:
                                    this.balls.forEach(b => {
                                        if (b.getState() === SpriteState.Dead) {
                                            b.setState(SpriteState.Alive);
                                            b.setLocation(Ball.ORIG_LOCATION.clone());
                                            b.setRotation(Math.PI / 4 + Math.random() * Math.PI / 3);
                                        }
                                    });
                                    break;
                                case BonusType.SuperSize:
                                    this.paddle.setResizeState(PaddleResize.Grow);
                                    break;
                                case BonusType.SlowMotion:
                                    this.isSlowMotion = true;
                                    this.slowMotionTime = gameTime;
                                    break;
                            }
                        }
                    }
                }
            }
        });

        // Check for level completion
        if (!this.isLevelComplete && this.bricks.every(brick => brick.getState() === SpriteState.Dead)) {
            this.isLevelComplete = true;
            this.gameState = GameState.Intro;
            this.message.show(`Level ${this.level} Complete!\n\n~ Get Ready ~\nPress SPACE to continue`);
            
            // Reset ball and paddle for next level
            this.resetBall();
            
            // Load next level when space is pressed (handled in state transition above)
            this.level++;
            this.loadLevel(this.level);
        }

        // Check for game over
        if (this.lives.every(life => life.getState() === SpriteState.Dead)) {
            this.gameState = GameState.Over;
            this.message.show('~ Game Over ~\nPress SPACE to restart');
        }
    }

    override draw(): void {
        this.clearScreen();

        // Draw game objects
        this.bricks.forEach(brick => {
            // Draw brick if not dead
            if (brick.getState() !== SpriteState.Dead) {
                brick.draw(this.ctx);
            }
            
            // Draw bonus if it exists and is active (regardless of brick state)
            const bonus = brick.getBonus();
            if (bonus && (bonus.getState() === SpriteState.Alive || bonus.getState() === SpriteState.Stunned)) {
                bonus.draw(this.ctx);
            }
        });

        this.paddle.draw(this.ctx);

        this.balls.forEach(ball => {
            if (ball.getState() === SpriteState.Alive) {
                ball.draw(this.ctx);
            }
        });

        // Draw UI
        this.lives.forEach(life => life.draw(this.ctx));
        this.score.draw(this.ctx);
        this.message.draw(this.ctx);
    }

    private checkCollisions(ball: Ball, gameTime: number): void {
        // Wall collisions
        if (ball.getLocation().x + ball.getRadius() >= GAME_CONSTANTS.BOARD_WIDTH) {
            ball.setLocation(new Vector2D(GAME_CONSTANTS.BOARD_WIDTH - ball.getRadius(), ball.getLocation().y));
            ball.setRotation(ball.getRotation() * -1 + Math.PI);
        } else if (ball.getLocation().x - ball.getRadius() <= 0) {
            ball.setLocation(new Vector2D(ball.getRadius(), ball.getLocation().y));
            ball.setRotation(ball.getRotation() * -1 + Math.PI);
        }

        if (ball.getLocation().y - ball.getRadius() <= 0) {
            ball.setLocation(new Vector2D(ball.getLocation().x, ball.getRadius()));
            ball.setRotation(ball.getRotation() * -1);
        }

        // Check for falling out of bottom
        if (ball.getLocation().y + ball.getRadius() >= GAME_CONSTANTS.BOARD_HEIGHT) {
            ball.setState(SpriteState.Dead);
            
            // If all balls are dead, lose a life
            if (this.balls.every(b => b.getState() === SpriteState.Dead)) {
                for (let i = this.lives.length - 1; i >= 0; i--) {
                    if (this.lives[i].getState() === SpriteState.Alive) {
                        this.lives[i].setState(SpriteState.Dead);
                        this.resetBall();
                        break;
                    }
                }
            }
            return;
        }

        // Paddle collision
        const paddleBounds = {
            left: this.paddle.getLocation().x,
            right: this.paddle.getLocation().x + this.paddle.getSize().width,
            top: this.paddle.getLocation().y,
            bottom: this.paddle.getLocation().y + this.paddle.getSize().height
        };

        // Left triangle collision
        const leftEdgeHeight = this.paddle.getSize().height;
        if (ball.getLocation().y + ball.getRadius() >= paddleBounds.top &&
            ball.getLocation().y - ball.getRadius() <= paddleBounds.bottom &&
            ball.getLocation().x >= paddleBounds.left - leftEdgeHeight &&
            ball.getLocation().x <= paddleBounds.left &&
            ball.getVelocity().y > 0) {
            
            ball.setLocation(new Vector2D(ball.getLocation().x, paddleBounds.top - ball.getRadius()));
            ball.setRotation(Math.PI * 9 / 5); // Fixed angle for left edge
            return;
        }

        // Right triangle collision
        if (ball.getLocation().y + ball.getRadius() >= paddleBounds.top &&
            ball.getLocation().y - ball.getRadius() <= paddleBounds.bottom &&
            ball.getLocation().x >= paddleBounds.right &&
            ball.getLocation().x <= paddleBounds.right + leftEdgeHeight &&
            ball.getVelocity().y > 0) {
            
            ball.setLocation(new Vector2D(ball.getLocation().x, paddleBounds.top - ball.getRadius()));
            ball.setRotation(Math.PI * 6 / 5); // Fixed angle for right edge
            return;
        }

        // Main paddle collision
        if (ball.getLocation().y + ball.getRadius() >= paddleBounds.top &&
            ball.getLocation().y - ball.getRadius() <= paddleBounds.bottom &&
            ball.getLocation().x >= paddleBounds.left &&
            ball.getLocation().x <= paddleBounds.right &&
            ball.getVelocity().y > 0) {
            
            ball.setLocation(new Vector2D(ball.getLocation().x, paddleBounds.top - ball.getRadius()));
            
            // Calculate new angle based on where the ball hit the paddle
            const hitPoint = (ball.getLocation().x - paddleBounds.left) / this.paddle.getSize().width;
            const newAngle = Math.PI * (1.8 - 0.6 * hitPoint); // This makes the ball go upward (π to 1.2π range)
            ball.setRotation(newAngle);
            return;
        }

        // Brick collisions
        let isBounce = false;
        let newRotation = ball.getRotation();

        this.bricks.forEach(brick => {
            if (brick.getState() === SpriteState.Dead) return;

            const brickBounds = {
                left: brick.getLocation().x,
                right: brick.getLocation().x + GAME_CONSTANTS.BRICK_SIZE.width,
                top: brick.getLocation().y,
                bottom: brick.getLocation().y + GAME_CONSTANTS.BRICK_SIZE.height
            };

            if (ball.getLocation().x - ball.getRadius() <= brickBounds.right &&
                ball.getLocation().x + ball.getRadius() >= brickBounds.left &&
                ball.getLocation().y - ball.getRadius() <= brickBounds.bottom &&
                ball.getLocation().y + ball.getRadius() >= brickBounds.top) {

                if (brick.getState() !== SpriteState.Stunned) {
                    isBounce = true;
                    
                    // Use last position to determine collision side (matching C#)
                    const lastPos = ball.getLastNoBrickLocation();
                    if (lastPos.y > brickBounds.bottom || lastPos.y < brickBounds.top) {
                        newRotation = ball.getRotation() * -1;
                    } else {
                        newRotation = ball.getRotation() * -1 + Math.PI;
                    }

                    // Handle brick hit based on type
                    if (brick.getType() === BrickType.Regular) {
                        brick.setState(SpriteState.Dead);
                        this.score.addPoints(100);

                        // Start bonus falling if it exists
                        const bonus = brick.getBonus();
                        if (bonus && bonus.getState() === SpriteState.Dead) {
                            bonus.setState(SpriteState.Alive);  // Just makes it start falling
                        }
                    } else if (brick.getType() === BrickType.DoubleHit) {
                        brick.setState(SpriteState.Stunned);
                        brick.setType(BrickType.Regular);
                    }
                }
            } else if (brick.getState() === SpriteState.Stunned) {
                brick.setState(SpriteState.Alive);
            }
        });

        if (!isBounce) {
            ball.setLastNoBrickLocation(ball.getLocation().clone());
        } else {
            ball.setRotation(newRotation);
        }
    }
} 