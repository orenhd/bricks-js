import { InputManager } from './InputManager';

export abstract class GameEngine {
    private static readonly TARGET_FPS = 60;
    private static readonly FRAME_TIME = 1000 / GameEngine.TARGET_FPS;
    private lastTime: number = 0;
    private running: boolean = false;
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
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
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    public stop(): void {
        this.running = false;
    }

    private gameLoop(currentTime: number): void {
        if (!this.running) return;

        const delta = currentTime - this.lastTime;
        
        // Only update if enough time has passed (frame limiting)
        if (delta >= GameEngine.FRAME_TIME) {
            this.lastTime = currentTime - (delta % GameEngine.FRAME_TIME);
            
            // Convert milliseconds to seconds for game logic
            const elapsedTime = delta / 1000;
            this.update(currentTime / 1000, elapsedTime);
            this.draw();
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    protected clearScreen(): void {
        this.ctx.fillStyle = 'darkblue';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    protected abstract update(gameTime: number, elapsedTime: number): void;
    protected abstract draw(): void;
} 