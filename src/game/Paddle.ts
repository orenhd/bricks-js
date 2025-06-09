import { GAME_CONSTANTS } from '../constants';
import { Sprite } from './Sprite';
import { Vector2D } from '../types/Vector2D';
import { Ball } from './Ball';

export enum PaddleResize {
    None = 'None',
    Grow = 'Grow',
    Shrink = 'Shrink',
    ReGrow = 'ReGrow'
}

type Size = {
    width: number;
    height: number;
};

export class Paddle extends Sprite {
    private size: Size = {
        width: GAME_CONSTANTS.PADDLE_NORMAL_SIZE.width,
        height: GAME_CONSTANTS.PADDLE_NORMAL_SIZE.height
    };
    private leftEdge: Vector2D[] = [new Vector2D(), new Vector2D(), new Vector2D()];
    private rightEdge: Vector2D[] = [new Vector2D(), new Vector2D(), new Vector2D()];
    private resizeState: PaddleResize = PaddleResize.None;

    static readonly ORIG_LOCATION = new Vector2D(
        (GAME_CONSTANTS.BOARD_WIDTH - GAME_CONSTANTS.PADDLE_NORMAL_SIZE.width) / 2,
        GAME_CONSTANTS.BOARD_HEIGHT - 80
    );

    constructor() {
        super(Paddle.ORIG_LOCATION.x, Paddle.ORIG_LOCATION.y, GAME_CONSTANTS.PADDLE_SPEED);
        this.buildEdges();
    }

    public getSize(): Size {
        return this.size;
    }

    public setSize(size: Size): void {
        this.size = size;
    }

    public getResizeState(): PaddleResize {
        return this.resizeState;
    }

    public setResizeState(state: PaddleResize): void {
        this.resizeState = state;
    }

    override update(_gameTime: number, elapsedTime: number): void {
        // Handle paddle resizing
        if (this.resizeState === PaddleResize.ReGrow) {
            if (this.size.width === GAME_CONSTANTS.PADDLE_SUPER_SIZE.width) {
                this.resizeState = PaddleResize.None;
            } else {
                const widthChange = (this.speed / 2) * elapsedTime;
                this.size.width += widthChange;
                this.location.x -= widthChange / 2;
                if (this.size.width >= GAME_CONSTANTS.PADDLE_SUPER_SIZE.width) {
                    this.size.width = GAME_CONSTANTS.PADDLE_SUPER_SIZE.width;
                }
            }
        } else if (this.resizeState === PaddleResize.Shrink || this.resizeState === PaddleResize.Grow) {
            if (this.size.width === GAME_CONSTANTS.PADDLE_NORMAL_SIZE.width) {
                this.resizeState = this.resizeState === PaddleResize.Shrink ? 
                    PaddleResize.None : PaddleResize.ReGrow;
            } else {
                const widthChange = (this.speed / 2) * elapsedTime;
                this.size.width -= widthChange;
                this.location.x += widthChange / 2;
                if (this.size.width <= GAME_CONSTANTS.PADDLE_NORMAL_SIZE.width) {
                    this.size.width = GAME_CONSTANTS.PADDLE_NORMAL_SIZE.width;
                }
            }
        }

        // Update position based on velocity
        this.location.x += this.velocity.x * elapsedTime;
        this.fixLocation();
        this.buildEdges();
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // Draw left edge
        ctx.fillStyle = 'lightcyan';
        ctx.beginPath();
        ctx.moveTo(this.leftEdge[0].x, this.leftEdge[0].y);
        ctx.lineTo(this.leftEdge[1].x, this.leftEdge[1].y);
        ctx.lineTo(this.leftEdge[2].x, this.leftEdge[2].y);
        ctx.closePath();
        ctx.fill();

        // Draw main paddle body
        ctx.fillStyle = 'lightpink';
        ctx.fillRect(this.location.x, this.location.y, this.size.width, this.size.height);

        // Draw right edge
        ctx.fillStyle = 'lightcyan';
        ctx.beginPath();
        ctx.moveTo(this.rightEdge[0].x, this.rightEdge[0].y);
        ctx.lineTo(this.rightEdge[1].x, this.rightEdge[1].y);
        ctx.lineTo(this.rightEdge[2].x, this.rightEdge[2].y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    private fixLocation(): void {
        if (this.location.x + this.size.width + this.size.height >= GAME_CONSTANTS.BOARD_WIDTH) {
            this.location.x = GAME_CONSTANTS.BOARD_WIDTH - this.size.width - this.size.height;
        } else if (this.location.x - this.size.height <= 0) {
            this.location.x = this.size.height;
        }
    }

    private buildEdges(): void {
        // Left edge triangle
        this.leftEdge[0] = this.location;
        this.leftEdge[1] = new Vector2D(this.location.x, this.location.y + this.size.height);
        this.leftEdge[2] = new Vector2D(this.location.x - this.size.height, this.location.y + this.size.height);

        // Right edge triangle
        this.rightEdge[0] = new Vector2D(this.location.x + this.size.width, this.location.y);
        this.rightEdge[1] = new Vector2D(this.location.x + this.size.width, this.location.y + this.size.height);
        this.rightEdge[2] = new Vector2D(this.location.x + this.size.width + this.size.height, this.location.y + this.size.height);
    }

    public bouncePaddle(ball: Ball): boolean {
        return ball.getLocation().x <= this.location.x + this.size.width &&
               ball.getLocation().x >= this.location.x &&
               ball.getLocation().y + ball.getRadius() >= this.location.y;
    }

    public calculateBouncePaddle(ball: Ball): number {
        // Calculate bounce angle based on where the ball hits the paddle
        const hitPosition = (ball.getLocation().x - this.location.x) / this.size.width;
        const angleOffset = (hitPosition - 0.5) * Math.PI / 2;
        return -ball.getRotation() - angleOffset;
    }

    public bounceLeftEdge(ball: Ball): boolean {
        return ball.getLocation().x < this.location.x &&
               ball.getLocation().x >= this.location.x - this.size.height &&
               ball.getLocation().y >= this.location.y +
               (this.location.x - ball.getLocation().x) -
               Math.sin(45) * ball.getRadius();
    }

    public bounceRightEdge(ball: Ball): boolean {
        return ball.getLocation().x <= this.location.x + this.size.width + this.size.height &&
               ball.getLocation().x > this.location.x + this.size.width &&
               ball.getLocation().y >= this.location.y +
               (ball.getLocation().x - this.location.x - this.size.width) -
               Math.sin(45) * ball.getRadius();
    }

    public reset(): void {
        this.location = Paddle.ORIG_LOCATION.clone();
        this.size = {
            width: GAME_CONSTANTS.PADDLE_NORMAL_SIZE.width,
            height: GAME_CONSTANTS.PADDLE_NORMAL_SIZE.height
        };
        this.velocity = new Vector2D(0, 0);
        this.resizeState = PaddleResize.None;
        this.buildEdges();
    }
} 