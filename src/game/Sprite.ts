import { SpriteState } from '../constants';
import { Vector2D } from '../types/Vector2D';

export abstract class Sprite {
    protected rotation: number = 0;
    protected speed: number;
    protected velocity: Vector2D = new Vector2D(0, 0);
    protected location: Vector2D;
    protected shootTime: number = 0;
    protected state: SpriteState = SpriteState.Alive;

    constructor(x: number, y: number, speed: number) {
        this.location = new Vector2D(x, y);
        this.speed = speed;
    }

    public getState(): SpriteState {
        return this.state;
    }

    public setState(state: SpriteState): void {
        this.state = state;
    }

    public getLocation(): Vector2D {
        return this.location;
    }

    public setLocation(location: Vector2D): void {
        this.location = location;
    }

    public getRotation(): number {
        return this.rotation;
    }

    public setRotation(rotation: number): void {
        this.rotation = rotation;
    }

    public getVelocity(): Vector2D {
        return this.velocity;
    }

    public setVelocity(velocity: Vector2D): void {
        this.velocity = velocity;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
    }

    abstract update(gameTime: number, elapsedTime: number): void;
    abstract draw(ctx: CanvasRenderingContext2D): void;
} 