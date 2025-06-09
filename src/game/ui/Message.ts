import { GAME_CONSTANTS } from '../../constants';

export class Message {
    private text: string = '';
    private isVisible: boolean = false;
    private readonly font = '24px Arial';
    private readonly textColor = 'white';
    private readonly padding = 20;

    public show(text: string): void {
        this.text = text;
        this.isVisible = true;
    }

    public hide(): void {
        this.isVisible = false;
    }

    public isShown(): boolean {
        return this.isVisible;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible) return;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_CONSTANTS.BOARD_WIDTH, GAME_CONSTANTS.BOARD_HEIGHT);

        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = this.text.split('\n');
        const lineHeight = 60;
        const totalHeight = lines.length * lineHeight;
        const startY = (GAME_CONSTANTS.BOARD_HEIGHT - totalHeight) / 2;

        lines.forEach((line, i) => {
            ctx.fillText(line, GAME_CONSTANTS.BOARD_WIDTH / 2, startY + i * lineHeight);
        });

        ctx.restore();
    }
} 