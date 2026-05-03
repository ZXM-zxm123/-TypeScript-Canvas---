export interface Vector2D {
    x: number;
    y: number;
}

export interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    velocity: Vector2D;
    active: boolean;
}

export interface Player extends GameObject {
    isJumping: boolean;
    jumpForce: number;
    gravity: number;
    groundY: number;
    powerUps: PowerUpState;
}

export interface Obstacle extends GameObject {
    type: 'pit' | 'wall';
    gapY?: number;
}

export interface PowerUp extends GameObject {
    type: 'speed' | 'magnet';
    duration: number;
    active: boolean;
}

export interface PowerUpState {
    speedBoost: boolean;
    speedBoostTimer: number;
    magnet: boolean;
    magnetTimer: number;
    magnetRange: number;
}

export interface Platform extends GameObject {
    type: 'ground' | 'floating';
}

export interface GameLevel {
    id: number;
    name: string;
    difficulty: number;
    speed: number;
    obstacles: ObstacleConfig[];
    powerUps: PowerUpConfig[];
    platforms: PlatformConfig[];
    backgroundColor: string;
    groundColor: string;
}

export interface ObstacleConfig {
    type: 'pit' | 'wall';
    x: number;
    width: number;
    y?: number;
    height?: number;
}

export interface PowerUpConfig {
    type: 'speed' | 'magnet';
    x: number;
    y: number;
}

export interface PlatformConfig {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Score {
    playerName: string;
    score: number;
    levelId: number;
    timestamp: number;
}

export interface GameState {
    currentLevel: number;
    score: number;
    highScore: number;
    isPlaying: boolean;
    isPaused: boolean;
    gameOver: boolean;
    distance: number;
}

export interface CollisionResult {
    collided: boolean;
    side: number;
    overlap: number;
}
