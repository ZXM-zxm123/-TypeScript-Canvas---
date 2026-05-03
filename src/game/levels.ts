import { GameLevel } from './types';

export const PRESET_LEVELS: GameLevel[] = [
    {
        id: 1,
        name: "新手村",
        difficulty: 1,
        speed: 5,
        backgroundColor: "#87CEEB",
        groundColor: "#228B22",
        obstacles: [
            { type: 'pit', x: 400, width: 80 },
            { type: 'wall', x: 700, width: 40, height: 60 },
            { type: 'pit', x: 1000, width: 60 },
            { type: 'wall', x: 1300, width: 40, height: 80 },
            { type: 'pit', x: 1600, width: 70 },
        ],
        powerUps: [
            { type: 'speed', x: 550, y: 300 },
            { type: 'magnet', x: 1150, y: 300 },
        ],
        platforms: []
    },
    {
        id: 2,
        name: "森林探险",
        difficulty: 2,
        speed: 6,
        backgroundColor: "#2E8B57",
        groundColor: "#006400",
        obstacles: [
            { type: 'pit', x: 300, width: 100 },
            { type: 'wall', x: 500, width: 45, height: 70 },
            { type: 'pit', x: 750, width: 80 },
            { type: 'wall', x: 950, width: 50, height: 90 },
            { type: 'pit', x: 1200, width: 90 },
            { type: 'wall', x: 1400, width: 45, height: 100 },
            { type: 'pit', x: 1700, width: 100 },
        ],
        powerUps: [
            { type: 'speed', x: 420, y: 280 },
            { type: 'magnet', x: 850, y: 300 },
            { type: 'speed', x: 1550, y: 280 },
        ],
        platforms: [
            { x: 600, y: 350, width: 100, height: 20 },
            { x: 1100, y: 320, width: 120, height: 20 },
        ]
    },
    {
        id: 3,
        name: "沙漠遗迹",
        difficulty: 3,
        speed: 7,
        backgroundColor: "#F4A460",
        groundColor: "#D2691E",
        obstacles: [
            { type: 'pit', x: 250, width: 120 },
            { type: 'wall', x: 450, width: 50, height: 80 },
            { type: 'pit', x: 650, width: 100 },
            { type: 'wall', x: 850, width: 55, height: 100 },
            { type: 'pit', x: 1050, width: 110 },
            { type: 'wall', x: 1250, width: 50, height: 110 },
            { type: 'pit', x: 1500, width: 120 },
            { type: 'wall', x: 1750, width: 60, height: 90 },
        ],
        powerUps: [
            { type: 'speed', x: 350, y: 270 },
            { type: 'magnet', x: 750, y: 290 },
            { type: 'speed', x: 1350, y: 270 },
            { type: 'magnet', x: 1650, y: 290 },
        ],
        platforms: [
            { x: 550, y: 340, width: 80, height: 20 },
            { x: 950, y: 310, width: 100, height: 20 },
            { x: 1400, y: 330, width: 90, height: 20 },
        ]
    },
    {
        id: 4,
        name: "冰雪王国",
        difficulty: 4,
        speed: 8,
        backgroundColor: "#B0E0E6",
        groundColor: "#4169E1",
        obstacles: [
            { type: 'pit', x: 200, width: 130 },
            { type: 'wall', x: 400, width: 55, height: 90 },
            { type: 'pit', x: 600, width: 110 },
            { type: 'wall', x: 800, width: 60, height: 110 },
            { type: 'pit', x: 1000, width: 120 },
            { type: 'wall', x: 1200, width: 55, height: 120 },
            { type: 'pit', x: 1450, width: 130 },
            { type: 'wall', x: 1700, width: 65, height: 100 },
            { type: 'pit', x: 1950, width: 140 },
        ],
        powerUps: [
            { type: 'speed', x: 300, y: 260 },
            { type: 'magnet', x: 700, y: 280 },
            { type: 'speed', x: 1100, y: 260 },
            { type: 'magnet', x: 1570, y: 280 },
            { type: 'speed', x: 2050, y: 260 },
        ],
        platforms: [
            { x: 500, y: 330, width: 80, height: 20 },
            { x: 900, y: 300, width: 100, height: 20 },
            { x: 1300, y: 320, width: 90, height: 20 },
            { x: 1800, y: 310, width: 100, height: 20 },
        ]
    },
    {
        id: 5,
        name: "火山地狱",
        difficulty: 5,
        speed: 10,
        backgroundColor: "#8B0000",
        groundColor: "#FF4500",
        obstacles: [
            { type: 'pit', x: 180, width: 140 },
            { type: 'wall', x: 380, width: 60, height: 100 },
            { type: 'pit', x: 580, width: 120 },
            { type: 'wall', x: 780, width: 65, height: 120 },
            { type: 'pit', x: 980, width: 130 },
            { type: 'wall', x: 1180, width: 60, height: 130 },
            { type: 'pit', x: 1400, width: 140 },
            { type: 'wall', x: 1650, width: 70, height: 110 },
            { type: 'pit', x: 1900, width: 150 },
            { type: 'wall', x: 2150, width: 65, height: 120 },
            { type: 'pit', x: 2400, width: 160 },
        ],
        powerUps: [
            { type: 'speed', x: 280, y: 250 },
            { type: 'magnet', x: 680, y: 270 },
            { type: 'speed', x: 1080, y: 250 },
            { type: 'magnet', x: 1520, y: 270 },
            { type: 'speed', x: 2050, y: 250 },
            { type: 'magnet', x: 2520, y: 270 },
        ],
        platforms: [
            { x: 480, y: 320, width: 80, height: 20 },
            { x: 880, y: 290, width: 90, height: 20 },
            { x: 1280, y: 310, width: 100, height: 20 },
            { x: 1780, y: 300, width: 90, height: 20 },
            { x: 2250, y: 320, width: 100, height: 20 },
        ]
    }
];

export function getLevelById(id: number): GameLevel | undefined {
    return PRESET_LEVELS.find(level => level.id === id);
}

export function getNextLevel(currentId: number): GameLevel | undefined {
    const currentIndex = PRESET_LEVELS.findIndex(level => level.id === currentId);
    if (currentIndex >= 0 && currentIndex < PRESET_LEVELS.length - 1) {
        return PRESET_LEVELS[currentIndex + 1];
    }
    return undefined;
}
