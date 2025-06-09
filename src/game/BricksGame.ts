import { GameEngine } from '../engine/GameEngine';
import { Ball } from './Ball';
import { Brick } from './Brick';
import { GameState, GAME_CONSTANTS, SpriteState, BonusType } from '../constants';
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
            if (brick.getState() !== SpriteState.Dead) {
                brick.draw(this.ctx);
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

        // Paddle collisions
        if (this.paddle.bounceLeftEdge(ball)) {
            // Adjust ball position and set fixed angle for left edge
            const newY = this.paddle.getLocation().y +
                (this.paddle.getLocation().x - ball.getLocation().x) -
                Math.sin(45) * ball.getRadius();
            ball.setLocation(new Vector2D(ball.getLocation().x, newY));
            ball.setRotation(Math.PI * 9 / 5);
        } else if (this.paddle.bounceRightEdge(ball)) {
            // Adjust ball position and set fixed angle for right edge
            const newY = this.paddle.getLocation().y +
                (ball.getLocation().x - this.paddle.getLocation().x - this.paddle.getSize().width) -
                Math.sin(45) * ball.getRadius();
            ball.setLocation(new Vector2D(ball.getLocation().x, newY));
            ball.setRotation(Math.PI * 6 / 5);
        } else if (this.paddle.bouncePaddle(ball)) {
            // Adjust ball position to top of paddle and calculate bounce angle
            ball.setLocation(new Vector2D(ball.getLocation().x, this.paddle.getLocation().y - ball.getRadius()));
            ball.setRotation(this.paddle.calculateBouncePaddle(ball));
        }

        // Brick collisions
        this.bricks.forEach(brick => {
            if (brick.getState() === SpriteState.Dead) return;

            const brickBounds = {
                left: brick.getLocation().x,
                right: brick.getLocation().x + brick.getSize().width,
                top: brick.getLocation().y,
                bottom: brick.getLocation().y + brick.getSize().height
            };

            const ballLoc = ball.getLocation();
            const radius = ball.getRadius();

            // Check if ball is near brick
            if (ballLoc.x + radius >= brickBounds.left &&
                ballLoc.x - radius <= brickBounds.right &&
                ballLoc.y + radius >= brickBounds.top &&
                ballLoc.y - radius <= brickBounds.bottom) {

                // Determine collision side and bounce
                const hitLeft = ballLoc.x < brickBounds.left;
                const hitRight = ballLoc.x > brickBounds.right;
                const hitTop = ballLoc.y < brickBounds.top;
                const hitBottom = ballLoc.y > brickBounds.bottom;

                if (hitLeft || hitRight) {
                    ball.setRotation(-ball.getRotation());
                } else if (hitTop || hitBottom) {
                    ball.setRotation(Math.PI - ball.getRotation());
                }

                // Handle brick hit
                brick.setState(SpriteState.Dead);
                this.score.addPoints(100);

                // Handle bonus
                const bonus = brick.getBonus();
                if (bonus) {
                    switch (bonus.getType()) {
                        case BonusType.ThreeBalls:
                            this.balls.forEach(b => {
                                if (b.getState() === SpriteState.Dead) {
                                    b.setState(SpriteState.Alive);
                                    b.setLocation(ball.getLocation().clone());
                                    b.setRotation(Math.random() * Math.PI * 2);
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
        });
    }
} 