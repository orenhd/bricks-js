import { BonusType, GAME_CONSTANTS, SpriteState } from '../constants';
import { Sprite } from './Sprite';

export class Bonus extends Sprite {
    private type: BonusType;
    private readonly size = {
        width: GAME_CONSTANTS.BONUS_SIZE.width,
        height: GAME_CONSTANTS.BONUS_SIZE.height
    };
    private readonly rectangleColor: string;
    private readonly triangleColor: string;

    constructor(type: BonusType, x: number, y: number) {
        super(x, y, GAME_CONSTANTS.BONUS_SPEED);
        this.type = type;
        this.state = SpriteState.Dead; // Start in Dead state
        
        // Set colors based on bonus type
        switch (type) {
            case BonusType.ThreeBalls:
                this.rectangleColor = 'lightpink';
                this.triangleColor = 'palegreen';
                break;
            case BonusType.SuperSize:
                this.rectangleColor = 'cornflowerblue';
                this.triangleColor = 'lightsteelblue';
                break;
            case BonusType.SlowMotion:
                this.rectangleColor = 'slategray';
                this.triangleColor = 'mediumorchid';
                break;
            case BonusType.BadPoints:
                this.rectangleColor = '#1a1a1a'; // Almost black
                this.triangleColor = '#8b0000'; // Dark red
                break;
            default:
                this.rectangleColor = 'white';
                this.triangleColor = 'gray';
        }
    }

    public getType(): BonusType {
        return this.type;
    }

    public getSize(): { width: number; height: number } {
        return this.size;
    }

    override update(_gameTime: number, elapsedTime: number): void {
        // Bonus falls straight down
        this.location.y += this.speed * elapsedTime;
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // Draw rectangle
        ctx.fillStyle = this.rectangleColor;
        ctx.fillRect(this.location.x, this.location.y, this.size.width, this.size.height);

        // Draw triangle
        ctx.fillStyle = this.triangleColor;
        ctx.beginPath();
        ctx.moveTo(this.location.x, this.location.y);
        ctx.lineTo(this.location.x, this.location.y + this.size.height);
        ctx.lineTo(this.location.x + this.size.width, this.location.y + this.size.height);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
} 