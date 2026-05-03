import { GameEngine } from '../game/engine';
import { PRESET_LEVELS } from '../game/levels';

export class GameUI {
    private engine: GameEngine;
    private canvas: HTMLCanvasElement;
    private levelSelectVisible: boolean = false;
    private leaderboardVisible: boolean = false;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.engine = new GameEngine(this.canvas);
        this.initUI();
    }

    private initUI(): void {
        this.createLevelSelect();
        this.createLeaderboard();
        this.updateHighScoreDisplay();
    }

    private createLevelSelect(): void {
        const container = document.getElementById('levelSelect')!;
        container.innerHTML = '';

        for (const level of PRESET_LEVELS) {
            const button = document.createElement('button');
            button.className = 'level-btn';
            button.innerHTML = `
                <span class="level-name">${level.name}</span>
                <span class="level-difficulty">难度: ${'★'.repeat(level.difficulty)}</span>
            `;
            button.addEventListener('click', () => {
                this.engine.selectLevel(level.id);
                this.hideLevelSelect();
            });
            container.appendChild(button);
        }
    }

    private createLeaderboard(): void {
        const container = document.getElementById('leaderboard')!;
        container.innerHTML = '<h2>排行榜</h2><div id="leaderboardList"></div>';
    }

    public async showLeaderboard(levelId: number): Promise<void> {
        this.leaderboardVisible = true;
        const container = document.getElementById('leaderboard')!;
        const list = document.getElementById('leaderboardList')!;
        container.classList.add('visible');

        try {
            const scores = await this.engine.loadLeaderboard(levelId);
            list.innerHTML = '';

            if (scores.length === 0) {
                list.innerHTML = '<p class="no-scores">暂无分数记录</p>';
            } else {
                scores.forEach((score: any, index: number) => {
                    const item = document.createElement('div');
                    item.className = 'leaderboard-item';
                    item.innerHTML = `
                        <span class="rank">${index + 1}</span>
                        <span class="name">${score.playerName}</span>
                        <span class="score">${score.score}</span>
                    `;
                    list.appendChild(item);
                });
            }
        } catch (e) {
            list.innerHTML = '<p class="no-scores">加载失败</p>';
        }
    }

    public hideLeaderboard(): void {
        this.leaderboardVisible = false;
        document.getElementById('leaderboard')!.classList.remove('visible');
    }

    public showLevelSelect(): void {
        this.levelSelectVisible = true;
        document.getElementById('levelSelect')!.classList.add('visible');
    }

    public hideLevelSelect(): void {
        this.levelSelectVisible = false;
        document.getElementById('levelSelect')!.classList.remove('visible');
    }

    private updateHighScoreDisplay(): void {
        const highScore = localStorage.getItem('highScore_level1') || '0';
        const highScoreEl = document.getElementById('highScoreDisplay');
        if (highScoreEl) {
            highScoreEl.textContent = `最高分: ${highScore}`;
        }
    }

    public toggleLevelSelect(): void {
        if (this.levelSelectVisible) {
            this.hideLevelSelect();
        } else {
            this.showLevelSelect();
        }
    }
}

export function initGame(): void {
    const gameUI = new GameUI();

    document.getElementById('levelSelectBtn')?.addEventListener('click', () => {
        gameUI.toggleLevelSelect();
    });

    document.getElementById('leaderboardBtn')?.addEventListener('click', async () => {
        if (gameUI['leaderboardVisible']) {
            gameUI.hideLeaderboard();
        } else {
            await gameUI.showLeaderboard(1);
        }
    });

    document.getElementById('restartBtn')?.addEventListener('click', () => {
        location.reload();
    });
}
