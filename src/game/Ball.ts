import { GAME_CONSTANTS, SpriteState } from '../constants';
import { Sprite } from './Sprite';
import { Vector2D } from '../types/Vector2D';

export class Ball extends Sprite {
    private radius: number = GAME_CONSTANTS.BALL_RADIUS;
    private lastNoBrickLocation: Vector2D;
    private lastBrickTime: number = 0;
    
    static readonly ORIG_LOCATION = new Vector2D(
        GAME_CONSTANTS.BOARD_WIDTH / 2,
        GAME_CONSTANTS.BOARD_HEIGHT / 2
    );

    constructor() {
        super(Ball.ORIG_LOCATION.x, Ball.ORIG_LOCATION.y, GAME_CONSTANTS.BALL_SPEED);
        this.lastNoBrickLocation = this.location.clone();
    }

    public getRadius(): number {
        return this.radius;
    }

    public getLastNoBrickLocation(): Vector2D {
        return this.lastNoBrickLocation;
    }

    public setLastNoBrickLocation(location: Vector2D): void {
        this.lastNoBrickLocation = location;
    }

    public getLastBrickTime(): number {
        return this.lastBrickTime;
    }

    public setLastBrickTime(time: number): void {
        this.lastBrickTime = time;
    }

    override update(_gameTime: number, elapsedTime: number): void {
        if (this.state === SpriteState.Dead) return;
        
        // Update position based on rotation and speed
        this.location.x += Math.cos(this.rotation) * this.speed * elapsedTime;
        this.location.y += Math.sin(this.rotation) * this.speed * elapsedTime;
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = 'silver';
        ctx.beginPath();
        ctx.arc(this.location.x, this.location.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
} 