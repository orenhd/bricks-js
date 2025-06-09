import { SpriteState } from '../../constants';

export class Life {
    private readonly size = { width: 48, height: 24 };
    private readonly color = 'lightpink';
    private readonly x: number;
    private state: SpriteState = SpriteState.Alive;

    constructor(x: number) {
        this.x = x;
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
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, 10, this.size.width, this.size.height);
        ctx.restore();
    }
} 