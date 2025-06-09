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

    private static fixRotation(rotation: number): number {
        rotation = rotation % (Math.PI * 2);
        if (rotation < 0) rotation += Math.PI * 2;

        const PI_5 = Math.PI / 5;
        const PI_4_5 = Math.PI * 4 / 5;
        const PI_6_5 = Math.PI * 6 / 5;
        const PI_9_5 = Math.PI * 9 / 5;

        if (rotation >= 0 && rotation <= PI_5) {
            rotation = PI_5;
        } else if (rotation >= PI_4_5 && rotation <= Math.PI) {
            rotation = PI_4_5;
        } else if (rotation > Math.PI && rotation <= PI_6_5) {
            rotation = PI_6_5;
        } else if (rotation >= PI_9_5 && rotation < Math.PI * 2) {
            rotation = PI_9_5;
        }

        return rotation;
    }
} 