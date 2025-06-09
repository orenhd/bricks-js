import { SpriteState } from '../../constants';
import { Vector2D } from '../../types/Vector2D';

export class Life {
    private readonly size = { width: 30, height: 10 };
    private readonly color = 'lightpink';
    private readonly edgeColor = 'lightcyan';
    private readonly x: number;
    private readonly y: number = 10;
    private state: SpriteState = SpriteState.Alive;
    private leftEdge: Vector2D[] = [];
    private rightEdge: Vector2D[] = [];

    constructor(x: number) {
        this.x = x;
        this.buildEdges();
    }

    private buildEdges(): void {
        // Left edge triangle points
        this.leftEdge = [
            new Vector2D(this.x, this.y),
            new Vector2D(this.x, this.y + this.size.height),
            new Vector2D(this.x - this.size.height, this.y + this.size.height)
        ];

        // Right edge triangle points
        this.rightEdge = [
            new Vector2D(this.x + this.size.width, this.y),
            new Vector2D(this.x + this.size.width, this.y + this.size.height),
            new Vector2D(this.x + this.size.width + this.size.height, this.y + this.size.height)
        ];
    }

    public getState(): SpriteState {
        return this.state;
    }

    public setState(state: SpriteState): void {
        this.state = state;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.state === SpriteState.Dead) return;

        ctx.save();

        // Draw left edge triangle
        ctx.fillStyle = this.edgeColor;
        ctx.beginPath();
        ctx.moveTo(this.leftEdge[0].x, this.leftEdge[0].y);
        ctx.lineTo(this.leftEdge[1].x, this.leftEdge[1].y);
        ctx.lineTo(this.leftEdge[2].x, this.leftEdge[2].y);
        ctx.closePath();
        ctx.fill();

        // Draw main body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size.width, this.size.height);

        // Draw right edge triangle
        ctx.fillStyle = this.edgeColor;
        ctx.beginPath();
        ctx.moveTo(this.rightEdge[0].x, this.rightEdge[0].y);
        ctx.lineTo(this.rightEdge[1].x, this.rightEdge[1].y);
        ctx.lineTo(this.rightEdge[2].x, this.rightEdge[2].y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
} 