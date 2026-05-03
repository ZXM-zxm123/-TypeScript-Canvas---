import { GameLevel, ObstacleConfig, PowerUpConfig, PlatformConfig } from '../game/types';

export class LevelEditor {
    private level: Partial<GameLevel>;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private selectedTool: 'obstacle' | 'powerup' | 'platform' | 'select' = 'select';
    private selectedType: 'pit' | 'wall' | 'speed' | 'magnet' = 'pit';
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private previewRect: { x: number; y: number; width: number; height: number } | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.level = this.createEmptyLevel();
        this.initEventListeners();
        this.render();
    }

    private createEmptyLevel(): Partial<GameLevel> {
        return {
            id: Date.now(),
            name: '自定义关卡',
            difficulty: 1,
            speed: 5,
            backgroundColor: '#87CEEB',
            groundColor: '#228B22',
            obstacles: [],
            powerUps: [],
            platforms: []
        };
    }

    private initEventListeners(): void {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

        document.getElementById('toolSelect')?.addEventListener('change', (e) => {
            this.selectedTool = (e.target as HTMLSelectElement).value as any;
        });

        document.getElementById('typeSelect')?.addEventListener('change', (e) => {
            this.selectedType = (e.target as HTMLSelectElement).value as any;
        });

        document.getElementById('levelName')?.addEventListener('input', (e) => {
            this.level.name = (e.target as HTMLInputElement).value;
        });

        document.getElementById('levelDifficulty')?.addEventListener('input', (e) => {
            this.level.difficulty = parseInt((e.target as HTMLInputElement).value);
        });

        document.getElementById('levelSpeed')?.addEventListener('input', (e) => {
            this.level.speed = parseInt((e.target as HTMLInputElement).value);
        });

        document.getElementById('bgColor')?.addEventListener('input', (e) => {
            this.level.backgroundColor = (e.target as HTMLInputElement).value;
            this.render();
        });

        document.getElementById('groundColor')?.addEventListener('input', (e) => {
            this.level.groundColor = (e.target as HTMLInputElement).value;
            this.render();
        });

        document.getElementById('saveLevel')?.addEventListener('click', () => this.saveLevel());
        document.getElementById('loadLevel')?.addEventListener('click', () => this.loadLevel());
        document.getElementById('clearLevel')?.addEventListener('click', () => this.clearLevel());
    }

    private onMouseDown(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.isDragging = true;
        this.dragStartX = x;

        if (this.selectedTool !== 'select') {
            this.previewRect = { x, y, width: 0, height: 0 };
        }
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.isDragging || !this.previewRect) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const minX = Math.min(this.dragStartX, x);
        const width = Math.abs(x - this.dragStartX);
        const height = this.selectedTool === 'obstacle' && this.selectedType === 'wall' ? 60 : 30;

        this.previewRect = {
            x: minX,
            y: this.selectedTool === 'obstacle' && this.selectedType === 'pit' ? this.canvas.height - 50 : y - height / 2,
            width,
            height: this.selectedTool === 'obstacle' && this.selectedType === 'pit' ? 50 : height
        };

        this.render();
    }

    private onMouseUp(e: MouseEvent): void {
        if (!this.isDragging || !this.previewRect) {
            this.isDragging = false;
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const endX = Math.max(this.dragStartX, x);

        if (endX - this.dragStartX > 10) {
            this.addObject(this.dragStartX, this.previewRect.y, endX - this.dragStartX, this.previewRect.height);
        }

        this.isDragging = false;
        this.previewRect = null;
        this.render();
    }

    private addObject(x: number, y: number, width: number, height: number): void {
        if (this.selectedTool === 'obstacle') {
            const obstacle: ObstacleConfig = {
                type: this.selectedType,
                x,
                width
            };
            if (this.selectedType === 'wall') {
                obstacle.y = y;
                obstacle.height = height;
            }
            this.level.obstacles!.push(obstacle);
        } else if (this.selectedTool === 'powerup') {
            const powerUp: PowerUpConfig = {
                type: this.selectedType as 'speed' | 'magnet',
                x,
                y
            };
            this.level.powerUps!.push(powerUp);
        } else if (this.selectedTool === 'platform') {
            const platform: PlatformConfig = {
                x,
                y,
                width,
                height
            };
            this.level.platforms!.push(platform);
        }
    }

    public render(): void {
        this.ctx.fillStyle = this.level.backgroundColor || '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = this.level.groundColor || '#228B22';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        for (const obstacle of this.level.obstacles || []) {
            if (obstacle.type === 'pit') {
                this.ctx.fillStyle = this.level.backgroundColor || '#87CEEB';
                this.ctx.fillRect(obstacle.x, this.canvas.height - 50, obstacle.width, 50);
            } else {
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(obstacle.x, obstacle.y || (this.canvas.height - 50 - (obstacle.height || 60)), obstacle.width, obstacle.height || 60);
            }
        }

        for (const powerUp of this.level.powerUps || []) {
            if (powerUp.type === 'speed') {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.moveTo(powerUp.x, powerUp.y);
                this.ctx.lineTo(powerUp.x + 30, powerUp.y + 30);
                this.ctx.lineTo(powerUp.x, powerUp.y + 30);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#FF1493';
                this.ctx.beginPath();
                this.ctx.arc(powerUp.x + 15, powerUp.y + 15, 15, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        for (const platform of this.level.platforms || []) {
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        if (this.previewRect) {
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
            this.ctx.fillRect(this.previewRect.x, this.previewRect.y, this.previewRect.width, this.previewRect.height);
        }

        this.updateStats();
    }

    private updateStats(): void {
        const statsEl = document.getElementById('levelStats');
        if (statsEl) {
            statsEl.innerHTML = `
                障碍物: ${this.level.obstacles?.length || 0} |
                道具: ${this.level.powerUps?.length || 0} |
                平台: ${this.level.platforms?.length || 0}
            `;
        }
    }

    public async saveLevel(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/api/levels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.level)
            });

            if (response.ok) {
                alert('关卡保存成功！');
            } else {
                alert('保存失败');
            }
        } catch (error) {
            console.error('Error saving level:', error);
            alert('保存失败: ' + error);
        }
    }

    public async loadLevel(): Promise<void> {
        const levelId = prompt('请输入关卡ID:');
        if (!levelId) return;

        try {
            const response = await fetch(`http://localhost:3000/api/levels/${levelId}`);
            if (response.ok) {
                const level = await response.json();
                this.level = level;
                this.updateFormFromLevel();
                this.render();
                alert('关卡加载成功！');
            } else {
                alert('关卡不存在');
            }
        } catch (error) {
            console.error('Error loading level:', error);
            alert('加载失败: ' + error);
        }
    }

    private updateFormFromLevel(): void {
        const nameEl = document.getElementById('levelName') as HTMLInputElement;
        const diffEl = document.getElementById('levelDifficulty') as HTMLInputElement;
        const speedEl = document.getElementById('levelSpeed') as HTMLInputElement;
        const bgEl = document.getElementById('bgColor') as HTMLInputElement;
        const groundEl = document.getElementById('groundColor') as HTMLInputElement;

        if (nameEl) nameEl.value = this.level.name || '';
        if (diffEl) diffEl.value = String(this.level.difficulty || 1);
        if (speedEl) speedEl.value = String(this.level.speed || 5);
        if (bgEl) bgEl.value = this.level.backgroundColor || '#87CEEB';
        if (groundEl) groundEl.value = this.level.groundColor || '#228B22';
    }

    public clearLevel(): void {
        this.level = this.createEmptyLevel();
        this.updateFormFromLevel();
        this.render();
    }

    public getLevel(): Partial<GameLevel> {
        return { ...this.level };
    }
}
