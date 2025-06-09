import { BrickType } from '../constants';
import { Sprite } from './Sprite';
import { Bonus } from './Bonus';
import { GAME_CONSTANTS } from '../constants';

export class Brick extends Sprite {
    private type: BrickType;
    private bonus: Bonus | null = null;
    private color: string;
    private borderColor: string | null = null;
    private readonly size = { 
        width: GAME_CONSTANTS.BRICK_SIZE.width, 
        height: GAME_CONSTANTS.BRICK_SIZE.height 
    };

    constructor(type: BrickType, x: number, y: number) {
        super(x, y, 0); // Bricks don't move
        this.type = type;
        this.color = this.generateRandomColor();
        
        if (type === BrickType.DoubleHit) {
            this.borderColor = this.generateRandomColor();
        }
    }

    public getType(): BrickType {
        return this.type;
    }

    public setType(type: BrickType): void {
        this.type = type;
    }

    public getBonus(): Bonus | null {
        return this.bonus;
    }

    public setBonus(bonus: Bonus | null): void {
        this.bonus = bonus;
    }

    public getSize(): { width: number; height: number } {
        return this.size;
    }

    override update(_gameTime: number, _elapsedTime: number): void {
        // Bricks don't move or animate
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Draw main brick
        ctx.fillStyle = this.color;
        ctx.fillRect(this.location.x, this.location.y, this.size.width, this.size.height);

        // Draw border for double-hit bricks
        if (this.type === BrickType.DoubleHit && this.borderColor) {
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 4;
            // Draw the stroke inside the brick's dimensions
            ctx.strokeRect(
                this.location.x + ctx.lineWidth/2,
                this.location.y + ctx.lineWidth/2,
                this.size.width - ctx.lineWidth,
                this.size.height - ctx.lineWidth
            );
        }

        ctx.restore();
    }

    private generateRandomColor(): string {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
    }
} 