import { LevelEditor } from './components/levelEditor';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
    if (canvas) {
        new LevelEditor(canvas);
    }
});
