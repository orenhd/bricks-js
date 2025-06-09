import { BonusType, BrickType, GAME_CONSTANTS } from '../constants';
import { Brick } from './Brick';
import { Bonus } from './Bonus';

export class LevelLoader {
    private static readonly ROWS = 8;
    private static readonly COLS = 8;
    private static allLevels: string[] | null = null;

    public static async loadLevel(levelNumber: number): Promise<Brick[]> {
        try {
            // Load all levels if not already loaded
            if (!this.allLevels) {
                const response = await fetch('/levels/levels.txt');
                if (!response.ok) throw new Error('Levels file not found');
                const text = await response.text();
                this.allLevels = text.trim().split('\n');
            }

            // Calculate starting line for the level, wrapping around if needed
            const startLine = ((levelNumber - 1) * this.ROWS) % this.allLevels.length;
            const levelData = this.allLevels.slice(startLine, startLine + this.ROWS);

            // If we don't have enough lines for a full level, wrap around to the beginning
            while (levelData.length < this.ROWS) {
                const remainingLines = this.ROWS - levelData.length;
                levelData.push(...this.allLevels.slice(0, remainingLines));
            }

            return this.parseLevel(levelData.join('\n'));
        } catch (error) {
            console.error('Error loading level:', error);
            return [];
        }
    }

    private static parseLevel(levelData: string): Brick[] {
        const bricks: Brick[] = [];
        const lines = levelData.trim().split('\n');

        for (let row = 0; row < this.ROWS; row++) {
            const line = lines[row];
            for (let col = 0; col < this.COLS; col++) {
                const brickChar = line[col * 2];
                const bonusChar = line[col * 2 + 1];

                const brickType = this.parseBrickType(brickChar);
                if (brickType === BrickType.None) continue;

                const x = col * GAME_CONSTANTS.BRICK_SIZE.width;
                const y = 48 + (row * GAME_CONSTANTS.BRICK_SIZE.height);
                const brick = new Brick(brickType, x, y);

                const bonusType = this.parseBonusType(bonusChar);
                if (bonusType !== BonusType.None) {
                    const bonus = new Bonus(
                        bonusType,
                        x + 4,
                        y + 4
                    );
                    brick.setBonus(bonus);
                }

                bricks.push(brick);
            }
        }

        return bricks;
    }

    private static parseBrickType(char: string): BrickType {
        switch (char.toUpperCase()) {
            case 'R': return BrickType.Regular;
            case 'D': return BrickType.DoubleHit;
            default: return BrickType.None;
        }
    }

    private static parseBonusType(char: string): BonusType {
        switch (char.toLowerCase()) {  // Note: C# uses lowercase for bonus types
            case 't': return BonusType.ThreeBalls;
            case 's': return BonusType.SuperSize;
            case 'm': return BonusType.SlowMotion;
            default: return BonusType.None;
        }
    }
} 