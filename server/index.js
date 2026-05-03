const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SCORES_FILE = path.join(__dirname, 'scores.json');
const LEVELS_FILE = path.join(__dirname, 'custom_levels.json');

function loadScores() {
    try {
        if (fs.existsSync(SCORES_FILE)) {
            const data = fs.readFileSync(SCORES_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading scores:', error);
    }
    return [];
}

function saveScores(scores) {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
    } catch (error) {
        console.error('Error saving scores:', error);
    }
}

function loadCustomLevels() {
    try {
        if (fs.existsSync(LEVELS_FILE)) {
            const data = fs.readFileSync(LEVELS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading custom levels:', error);
    }
    return [];
}

function saveCustomLevels(levels) {
    try {
        fs.writeFileSync(LEVELS_FILE, JSON.stringify(levels, null, 2));
    } catch (error) {
        console.error('Error saving custom levels:', error);
    }
}

app.get('/', (req, res) => {
    res.json({ message: 'Parkour Runner API Server', version: '1.0.0' });
});

app.get('/api/scores/:levelId', (req, res) => {
    const levelId = parseInt(req.params.levelId);
    const scores = loadScores();

    const levelScores = scores
        .filter(s => s.levelId === levelId)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    res.json(levelScores);
});

app.get('/api/scores', (req, res) => {
    const scores = loadScores();
    const topScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    res.json(topScores);
});

app.post('/api/scores', (req, res) => {
    const { playerName, score, levelId } = req.body;

    if (!playerName || score === undefined || !levelId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newScore = {
        id: Date.now().toString(),
        playerName: playerName.substring(0, 50),
        score: parseInt(score),
        levelId: parseInt(levelId),
        timestamp: Date.now()
    };

    const scores = loadScores();
    scores.push(newScore);
    saveScores(scores);

    res.status(201).json(newScore);
});

app.get('/api/levels', (req, res) => {
    const customLevels = loadCustomLevels();
    res.json(customLevels);
});

app.get('/api/levels/:id', (req, res) => {
    const id = req.params.id;
    const customLevels = loadCustomLevels();
    const level = customLevels.find(l => l.id === id);

    if (!level) {
        return res.status(404).json({ error: 'Level not found' });
    }

    res.json(level);
});

app.post('/api/levels', (req, res) => {
    const { id, name, difficulty, speed, obstacles, powerUps, platforms, backgroundColor, groundColor } = req.body;

    if (!id || !name || difficulty === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLevel = {
        id,
        name,
        difficulty: parseInt(difficulty),
        speed: speed || 5,
        obstacles: obstacles || [],
        powerUps: powerUps || [],
        platforms: platforms || [],
        backgroundColor: backgroundColor || '#87CEEB',
        groundColor: groundColor || '#228B22',
        isCustom: true,
        createdAt: Date.now()
    };

    const customLevels = loadCustomLevels();

    const existingIndex = customLevels.findIndex(l => l.id === id);
    if (existingIndex >= 0) {
        customLevels[existingIndex] = newLevel;
    } else {
        customLevels.push(newLevel);
    }

    saveCustomLevels(customLevels);

    res.status(201).json(newLevel);
});

app.delete('/api/levels/:id', (req, res) => {
    const id = req.params.id;
    const customLevels = loadCustomLevels();
    const filteredLevels = customLevels.filter(l => l.id !== id);

    if (filteredLevels.length === customLevels.length) {
        return res.status(404).json({ error: 'Level not found' });
    }

    saveCustomLevels(filteredLevels);
    res.status(200).json({ message: 'Level deleted successfully' });
});

app.put('/api/scores/:id', (req, res) => {
    const { id } = req.params;
    const { playerName, score } = req.body;

    const scores = loadScores();
    const index = scores.findIndex(s => s.id === id);

    if (index < 0) {
        return res.status(404).json({ error: 'Score not found' });
    }

    if (playerName) scores[index].playerName = playerName.substring(0, 50);
    if (score !== undefined) scores[index].score = parseInt(score);

    saveScores(scores);
    res.json(scores[index]);
});

app.delete('/api/scores/:id', (req, res) => {
    const { id } = req.params;
    const scores = loadScores();
    const filteredScores = scores.filter(s => s.id !== id);

    if (filteredScores.length === scores.length) {
        return res.status(404).json({ error: 'Score not found' });
    }

    saveScores(filteredScores);
    res.status(200).json({ message: 'Score deleted successfully' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🏃 Parkour Runner API Server running on http://localhost:${PORT}`);
    console.log(`📊 Scores API: http://localhost:${PORT}/api/scores`);
    console.log(`🗺️  Levels API: http://localhost:${PORT}/api/levels`);
});

module.exports = app;
