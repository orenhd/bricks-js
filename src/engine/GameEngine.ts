import { InputManager } from './InputManager';

export abstract class GameEngine {
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected lastTime: number = 0;
    protected gameTime: number = 0;
    protected isRunning: boolean = false;
    protected isPaused: boolean = false;
    protected input: InputManager;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = context;
        this.input = InputManager.getInstance();
    }

    public start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    public stop(): void {
        this.isRunning = false;
    }

    public togglePause(): void {
        this.isPaused = !this.isPaused;
    }

    private gameLoop(timestamp: number): void {
        if (!this.isRunning) return;

        const elapsedTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = timestamp;

        if (!this.isPaused) {
            this.gameTime += elapsedTime;
            this.update(this.gameTime, elapsedTime);
        }

        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    protected clearScreen(): void {
        this.ctx.fillStyle = 'darkblue';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    abstract update(gameTime: number, elapsedTime: number): void;
    abstract draw(): void;
} 