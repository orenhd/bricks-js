export const GAME_CONSTANTS = {
    BOARD_WIDTH: 384,
    BOARD_HEIGHT: 512,
    CLIENT_HEIGHT: 560,
    PADDLE_SPEED: 350,
    BALL_SPEED: 200,
    BONUS_SPEED: 150,
    PADDLE_NORMAL_SIZE: { width: 60, height: 20 } as const,
    PADDLE_SUPER_SIZE: { width: 90, height: 20 } as const,
    BRICK_SIZE: { width: 48, height: 24 } as const,
    BALL_RADIUS: 4.5,
    BONUS_SIZE: { width: 40, height: 16 } as const
} as const;

export enum GameState {
    Intro = 'Intro',
    HighScores = 'HighScores',
    Demo = 'Demo',
    Play = 'Play',
    Over = 'Over',
    Finish = 'Finish',
    NewScore = 'NewScore'
}

export enum SpriteState {
    Alive = 'Alive',
    Stunned = 'Stunned',
    Dead = 'Dead'
}

export enum BrickType {
    None = 'None',
    Regular = 'Regular',
    DoubleHit = 'DoubleHit'
}

export enum BonusType {
    None = 'None',
    ThreeBalls = 'ThreeBalls',
    SuperSize = 'SuperSize',
    SlowMotion = 'SlowMotion'
} 