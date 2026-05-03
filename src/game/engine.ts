import { GameState, Player, Obstacle, PowerUp, Platform, GameLevel, PowerUpState } from './types';
import { CollisionJS } from '../utils/collision';
import { PRESET_LEVELS, getLevelById } from './levels';

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private obstacles: Obstacle[] = [];
    private powerUps: PowerUp[] = [];
    private platforms: Platform[] = [];
    private gameState: GameState;
    private currentLevel: GameLevel;
    private lastTime: number = 0;
    private animationId: number = 0;
    private groundHeight: number = 50;
    private cameraX: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.currentLevel = PRESET_LEVELS[0];
        this.player = this.createPlayer();
        this.gameState = this.createInitialGameState();
        this.initLevel(this.currentLevel);
        this.bindControls();
    }

    private createPlayer(): Player {
        return {
            x: 100,
            y: 0,
            width: 40,
            height: 60,
            velocity: { x: 0, y: 0 },
            active: true,
            isJumping: false,
            jumpForce: -15,
            gravity: 0.6,
            groundY: 0,
            powerUps: {
                speedBoost: false,
                speedBoostTimer: 0,
                magnet: false,
                magnetTimer: 0,
                magnetRange: 100
            }
        };
    }

    private createInitialGameState(): GameState {
        return {
            currentLevel: 1,
            score: 0,
            highScore: this.loadHighScore(),
            isPlaying: false,
            isPaused: false,
            gameOver: false,
            distance: 0
        };
    }

    private initLevel(level: GameLevel): void {
        this.currentLevel = level;
        this.obstacles = level.obstacles.map(o => ({
            ...o,
            x: o.x,
            y: o.type === 'pit' ? 0 : (o.y || 0),
            height: o.type === 'wall' ? (o.height || 60) : 0,
            width: o.width,
            velocity: { x: -level.speed, y: 0 },
            active: true,
            gapY: o.type === 'pit' ? 0 : undefined
        }));

        this.powerUps = level.powerUps.map(p => ({
            ...p,
            x: p.x,
            y: p.y,
            width: 30,
            height: 30,
            velocity: { x: -level.speed, y: 0 },
            active: true,
            duration: 5000
        }));

        this.platforms = level.platforms.map(p => ({
            ...p,
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            velocity: { x: -level.speed, y: 0 },
            active: true
        }));

        this.groundHeight = 50;
        this.player.groundY = this.canvas.height - this.groundHeight - this.player.height;
        this.player.x = 100;
        this.player.y = this.player.groundY;
        this.player.velocity = { x: 0, y: 0 };
        this.player.isJumping = false;
        this.player.powerUps = {
            speedBoost: false,
            speedBoostTimer: 0,
            magnet: false,
            magnetTimer: 0,
            magnetRange: 100
        };

        this.cameraX = 0;
        this.gameState.distance = 0;
    }

    private bindControls(): void {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameState.isPaused && !this.gameState.gameOver) {
                e.preventDefault();
                this.jump();
            }
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });

        this.canvas.addEventListener('click', () => {
            if (!this.gameState.isPlaying && !this.gameState.gameOver) {
                this.startGame();
            } else if (!this.gameState.gameOver && !this.gameState.isPaused) {
                this.jump();
            }
        });
    }

    private jump(): void {
        if (!this.player.isJumping && this.gameState.isPlaying) {
            this.player.velocity.y = this.player.jumpForce;
            this.player.isJumping = true;
        }
    }

    private togglePause(): void {
        if (this.gameState.isPlaying && !this.gameState.gameOver) {
            this.gameState.isPaused = !this.gameState.isPaused;
        }
    }

    public startGame(): void {
        this.gameState.isPlaying = true;
        this.gameState.gameOver = false;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.distance = 0;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    public loadLevel(levelId: number): void {
        const level = getLevelById(levelId);
        if (level) {
            this.initLevel(level);
            this.gameState.currentLevel = levelId;
            this.gameState.isPlaying = false;
            this.gameState.gameOver = false;
            this.gameState.isPaused = false;
        }
    }

    public selectLevel(levelId: number): void {
        this.loadLevel(levelId);
    }

    private gameLoop = (): void => {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (!this.gameState.isPaused && !this.gameState.gameOver) {
            this.update(deltaTime);
        }

        this.render();

        if (this.gameState.isPlaying && !this.gameState.gameOver) {
            this.animationId = requestAnimationFrame(this.gameLoop);
        }
    };

    private update(deltaTime: number): void {
        const speed = this.player.powerUps.speedBoost ? this.currentLevel.speed * 1.5 : this.currentLevel.speed;
        this.gameState.distance += speed * deltaTime * 10;
        this.gameState.score = Math.floor(this.gameState.distance);

        this.updatePlayer(deltaTime);
        this.updateObstacles(speed);
        this.updatePowerUps(speed);
        this.updatePlatforms(speed);
        this.checkCollisions();
        this.checkPowerUpCollisions();
        this.updatePowerUpTimers(deltaTime);

        if (this.cameraX > this.obstacles[this.obstacles.length - 1]?.x + 500) {
            this.nextLevel();
        }
    }

    private updatePlayer(deltaTime: number): void {
        this.player.velocity.y += this.player.gravity;
        this.player.y += this.player.velocity.y;

        const groundY = this.canvas.height - this.groundHeight - this.player.height;
        let onGround = false;

        if (this.player.y >= groundY) {
            this.player.y = groundY;
            this.player.velocity.y = 0;
            this.player.isJumping = false;
            onGround = true;
        }

        for (const platform of this.platforms) {
            if (platform.active && this.checkPlatformCollision(platform)) {
                const platformTop = platform.y;
                if (this.player.y + this.player.height <= platformTop + 10 &&
                    this.player.velocity.y > 0) {
                    this.player.y = platformTop - this.player.height;
                    this.player.velocity.y = 0;
                    this.player.isJumping = false;
                    onGround = true;
                }
            }
        }

        if (!onGround) {
            this.player.isJumping = true;
        }

        if (this.player.powerUps.magnet) {
            this.applyMagnetEffect();
        }
    }

    private checkPlatformCollision(platform: Platform): boolean {
        return CollisionJS.checkAABBCollision(
            this.player.x, this.player.y, this.player.width, this.player.height,
            platform.x - this.cameraX, platform.y, platform.width, platform.height
        );
    }

    private updateObstacles(speed: number): void {
        for (const obstacle of this.obstacles) {
            if (obstacle.active) {
                obstacle.x -= speed;
                if (obstacle.x + obstacle.width < -100) {
                    obstacle.active = false;
                }
            }
        }
    }

    private updatePowerUps(speed: number): void {
        for (const powerUp of this.powerUps) {
            if (powerUp.active) {
                powerUp.x -= speed;
                if (powerUp.x + powerUp.width < -100) {
                    powerUp.active = false;
                }
            }
        }
    }

    private updatePlatforms(speed: number): void {
        for (const platform of this.platforms) {
            if (platform.active) {
                platform.x -= speed;
                if (platform.x + platform.width < -100) {
                    platform.active = false;
                }
            }
        }
    }

    private checkCollisions(): void {
        for (const obstacle of this.obstacles) {
            if (!obstacle.active) continue;

            if (obstacle.type === 'pit') {
                if (this.checkPitCollision(obstacle)) {
                    this.gameOver();
                    return;
                }
            } else {
                if (this.checkWallCollision(obstacle)) {
                    this.gameOver();
                    return;
                }
            }
        }
    }

    private checkPitCollision(pit: Obstacle): boolean {
        const playerBottom = this.player.y + this.player.height;
        const groundLevel = this.canvas.height - this.groundHeight;

        if (playerBottom >= groundLevel && !this.player.isJumping) {
            const pitStart = pit.x - this.cameraX;
            const pitEnd = pitStart + pit.width;

            if (this.player.x + this.player.width > pitStart && this.player.x < pitEnd) {
                return true;
            }
        }
        return false;
    }

    private checkWallCollision(wall: Obstacle): boolean {
        return CollisionJS.checkAABBCollision(
            this.player.x, this.player.y, this.player.width, this.player.height,
            wall.x - this.cameraX, this.canvas.height - this.groundHeight - wall.height,
            wall.width, wall.height
        );
    }

    private checkPowerUpCollisions(): void {
        for (const powerUp of this.powerUps) {
            if (!powerUp.active) continue;

            if (CollisionJS.checkAABBCollision(
                this.player.x, this.player.y, this.player.width, this.player.height,
                powerUp.x - this.cameraX, powerUp.y, powerUp.width, powerUp.height
            )) {
                this.activatePowerUp(powerUp);
                powerUp.active = false;
            }
        }
    }

    private activatePowerUp(powerUp: PowerUp): void {
        if (powerUp.type === 'speed') {
            this.player.powerUps.speedBoost = true;
            this.player.powerUps.speedBoostTimer = powerUp.duration;
        } else if (powerUp.type === 'magnet') {
            this.player.powerUps.magnet = true;
            this.player.powerUps.magnetTimer = powerUp.duration;
        }
    }

    private applyMagnetEffect(): void {
        for (const powerUp of this.powerUps) {
            if (!powerUp.active) continue;

            const dx = (powerUp.x - this.cameraX) - this.player.x;
            const dy = powerUp.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.player.powerUps.magnetRange) {
                const force = (this.player.powerUps.magnetRange - distance) / this.player.powerUps.magnetRange;
                powerUp.x -= force * 2;
            }
        }
    }

    private updatePowerUpTimers(deltaTime: number): void {
        if (this.player.powerUps.speedBoost) {
            this.player.powerUps.speedBoostTimer -= deltaTime * 1000;
            if (this.player.powerUps.speedBoostTimer <= 0) {
                this.player.powerUps.speedBoost = false;
            }
        }

        if (this.player.powerUps.magnet) {
            this.player.powerUps.magnetTimer -= deltaTime * 1000;
            if (this.player.powerUps.magnetTimer <= 0) {
                this.player.powerUps.magnet = false;
            }
        }
    }

    private gameOver(): void {
        this.gameState.gameOver = true;
        this.gameState.isPlaying = false;

        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
            this.saveHighScore(this.gameState.highScore);
        }

        this.saveScoreToServer();
    }

    private nextLevel(): void {
        const nextLevelId = this.gameState.currentLevel + 1;
        const nextLevelData = getLevelById(nextLevelId);

        if (nextLevelData) {
            this.initLevel(nextLevelData);
            this.gameState.currentLevel = nextLevelId;
        } else {
            this.gameOver();
        }
    }

    private saveHighScore(score: number): void {
        try {
            localStorage.setItem(`highScore_level${this.gameState.currentLevel}`, score.toString());
        } catch (e) {
            console.warn('Could not save high score to localStorage');
        }
    }

    private loadHighScore(): number {
        try {
            const saved = localStorage.getItem(`highScore_level${this.gameState.currentLevel}`);
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    private async saveScoreToServer(): Promise<void> {
        try {
            await fetch('http://localhost:3000/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerName: 'Player',
                    score: this.gameState.score,
                    levelId: this.gameState.currentLevel
                })
            });
        } catch (e) {
            console.warn('Could not save score to server');
        }
    }

    public async loadLeaderboard(levelId: number): Promise<any[]> {
        try {
            const response = await fetch(`http://localhost:3000/api/scores/${levelId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.warn('Could not load leaderboard from server');
        }
        return [];
    }

    private render(): void {
        this.ctx.fillStyle = this.currentLevel.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderGround();
        this.renderPlatforms();
        this.renderObstacles();
        this.renderPowerUps();
        this.renderPlayer();
        this.renderUI();
    }

    private renderGround(): void {
        this.ctx.fillStyle = this.currentLevel.groundColor;
        const groundY = this.canvas.height - this.groundHeight;

        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'pit' && obstacle.active) {
                const pitStart = obstacle.x - this.cameraX;
                const pitEnd = pitStart + obstacle.width;

                this.ctx.fillRect(0, groundY, pitStart, this.groundHeight);
                this.ctx.fillRect(pitEnd, groundY, this.canvas.width - pitEnd, this.groundHeight);
            }
        }

        const allPits = this.obstacles.filter(o => o.type === 'pit');
        let lastEnd = 0;
        for (const pit of allPits) {
            if (pit.active) {
                const pitStart = pit.x - this.cameraX;
                if (pitStart > lastEnd) {
                    this.ctx.fillRect(lastEnd, groundY, pitStart - lastEnd, this.groundHeight);
                }
                lastEnd = pitStart + pit.width;
            }
        }
        if (lastEnd < this.canvas.width) {
            this.ctx.fillRect(lastEnd, groundY, this.canvas.width - lastEnd, this.groundHeight);
        }
    }

    private renderPlatforms(): void {
        this.ctx.fillStyle = '#8B4513';
        for (const platform of this.platforms) {
            if (platform.active) {
                const screenX = platform.x - this.cameraX;
                if (screenX > -platform.width && screenX < this.canvas.width) {
                    this.ctx.fillRect(screenX, platform.y, platform.width, platform.height);
                }
            }
        }
    }

    private renderObstacles(): void {
        for (const obstacle of this.obstacles) {
            if (!obstacle.active) continue;

            const screenX = obstacle.x - this.cameraX;
            if (screenX > -obstacle.width && screenX < this.canvas.width) {
                if (obstacle.type === 'wall') {
                    this.ctx.fillStyle = '#654321';
                    this.ctx.fillRect(
                        screenX,
                        this.canvas.height - this.groundHeight - obstacle.height,
                        obstacle.width,
                        obstacle.height
                    );
                }
            }
        }
    }

    private renderPowerUps(): void {
        for (const powerUp of this.powerUps) {
            if (!powerUp.active) continue;

            const screenX = powerUp.x - this.cameraX;
            if (screenX > -powerUp.width && screenX < this.canvas.width) {
                if (powerUp.type === 'speed') {
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.beginPath();
                    this.ctx.moveTo(screenX + powerUp.width / 2, powerUp.y);
                    this.ctx.lineTo(screenX + powerUp.width, powerUp.y + powerUp.height);
                    this.ctx.lineTo(screenX, powerUp.y + powerUp.height);
                    this.ctx.closePath();
                    this.ctx.fill();
                } else if (powerUp.type === 'magnet') {
                    this.ctx.fillStyle = '#FF1493';
                    this.ctx.beginPath();
                    this.ctx.arc(screenX + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    private renderPlayer(): void {
        this.ctx.fillStyle = this.player.powerUps.speedBoost ? '#FF6347' : '#4169E1';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        if (this.player.powerUps.magnet) {
            this.ctx.strokeStyle = 'rgba(255, 20, 147, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.powerUps.magnetRange,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }
    }

    private renderUI(): void {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`分数: ${this.gameState.score}`, 10, 30);
        this.ctx.fillText(`最高分: ${this.gameState.highScore}`, 10, 60);
        this.ctx.fillText(`关卡: ${this.currentLevel.name}`, 10, 90);

        if (this.player.powerUps.speedBoost) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText('⚡ 加速中', this.canvas.width - 120, 30);
        }

        if (this.player.powerUps.magnet) {
            this.ctx.fillStyle = '#FF1493';
            this.ctx.fillText('🧲 磁铁中', this.canvas.width - 120, 60);
        }

        if (!this.gameState.isPlaying && !this.gameState.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击或按空格开始', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('按 ESC 暂停', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.textAlign = 'left';
        }

        if (this.gameState.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('按 ESC 继续', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.textAlign = 'left';
        }

        if (this.gameState.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.font = '25px Arial';
            this.ctx.fillText(`最终分数: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('点击重新开始', this.canvas.width / 2, this.canvas.height / 2 + 60);
            this.ctx.textAlign = 'left';
        }
    }

    public getGameState(): GameState {
        return { ...this.gameState };
    }

    public getCurrentLevel(): GameLevel {
        return { ...this.currentLevel };
    }
}
