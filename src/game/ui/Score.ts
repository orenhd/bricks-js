import { GAME_CONSTANTS } from '../../constants';

export class Score {
    private points: number = 0;
    private readonly font = '20px Arial';
    private readonly textColor = 'white';
    private readonly x = 10;
    private readonly y = 30;

    public getPoints(): number {
        return this.points;
    }

    public setPoints(points: number): void {
        this.points = points;
    }

    public addPoints(points: number): void {
        this.points += points;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.font = this.font;
        ctx.fillStyle = this.textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${this.points}`, this.x, this.y);
        ctx.restore();
    }
} 