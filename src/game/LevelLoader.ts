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

            // Find the start of the requested level
            let levelStart = -1;
            for (let i = 0; i < this.allLevels.length; i++) {
                if (this.allLevels[i].trim() === levelNumber.toString()) {
                    levelStart = i + 1; // Skip the level number line
                    break;
                }
            }

            if (levelStart === -1) {
                console.error('Level not found:', levelNumber);
                return [];
            }

            // Get the level data (8 rows)
            const levelData = this.allLevels.slice(levelStart, levelStart + this.ROWS);
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
            case '_': return BrickType.None;
            default: return BrickType.None;
        }
    }

    private static parseBonusType(char: string): BonusType {
        switch (char) {
            case '3': return BonusType.ThreeBalls;
            case '4': return BonusType.SuperSize;
            case '5': return BonusType.SlowMotion;
            case '-': return BonusType.None;
            default: return BonusType.None;
        }
    }
} 