const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const warningMessage = document.getElementById('warningMessage');
const victoryMessage = document.getElementById('victoryMessage');
const gameOverMessage = document.getElementById('gameOverMessage');
const mainMenu = document.getElementById('mainMenu');
const gameContainer = document.getElementById('gameContainer');
const levelsContainer = document.getElementById('levelsContainer');
const startGameButton = document.getElementById('startGameButton');
const viewLevelsButton = document.getElementById('viewLevelsButton');
const backToMainMenuButton = document.getElementById('backToMainMenuButton');
const levelsList = document.getElementById('levelsList');
const volumeRange = document.getElementById('volumeRange');
const pauseButton = document.getElementById('pauseButton');
const backToMainMenuButtonGame = document.getElementById('backToMainMenuButtonGame');

const GRAVITY = 0.3;
const JUMP_FORCE = -8;
const DUCK_WIDTH = 60;
const DUCK_HEIGHT = 60;
const MAX_SIZE = 150;
const MIN_SIZE = 20;
const WIN_SCORE = 2000;
const WARNING_THRESHOLD = 100;

let currentLevel = 1;
const levelDisplay = document.createElement('div');
levelDisplay.style.position = 'absolute';
levelDisplay.style.top = '20px';
levelDisplay.style.left = '20px';
levelDisplay.style.fontSize = '1.5rem';
levelDisplay.style.fontWeight = 'bold';
levelDisplay.style.color = '#FF6B6B';
gameContainer.appendChild(levelDisplay);
const LEVELS = Array.from({ length: 10 }, (_, i) => ({
    winScore: 2000 * (i + 1),
    itemSpeed: 3 + i * 0.5,
    itemFrequency: 0.01 + i * 0.002
}));

const duckImg = new Image();
duckImg.src = 'https://i.imgur.com/bTLUxQ0.png';

const butterImg = new Image();
butterImg.src = 
    'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjIwMCIgd2lkdGg9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTAiIHk9IjcwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkZFNUI0IiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI2MCIgeTE9Ijg1IiB4Mj0iMTQwIiB5Mj0iODUiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjYwIiB5MT0iMTAwIiB4Mj0iMTQwIiB5Mj0iMTAwIiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI2MCIgeTE9IjExNSIgeDI9IjE0MCIgeTI9IjExNSIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';

const knifeImg = new Image();
knifeImg.src =
    'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjIwMCIgd2lkdGg9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMTIwIiB5PSI4MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIiBzdHJva2U9IiMwMDAiIHJ4PSI1Ii8+PHBvbHlnb24gcG9pbnRzPSI0MCA3MCAxMjAgODAgMTIwIDExMCA0MCAxMDAiIGZpbGw9IiNDMEMwQzAiIHN0cm9rZT0iIzAwMCIvPjxsaW5lIHgxPSI0NSIgeTE9Ijc1IiB4Mj0iMTE1IiB5Mj0iODMiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';

const warningSound = new Audio('https://www.fesliyanstudios.com/play-mp3/387');
const inflateSound = new Audio('https://www.fesliyanstudios.com/play-mp3/6555');
const cutSound = new Audio('https://www.fesliyanstudios.com/play-mp3/4565');
const victorySound = new Audio('https://freyafelix.github.io/game-assets/');
const menuBackgroundMusic = new Audio('https://www.bensound.com/bensound-music/bensound-sunny.mp3');

let duck = {
    x: 100,
    y: 200,
    width: DUCK_WIDTH,
    height: DUCK_HEIGHT,
    velocity: 0
};

let items = [];
let score = 0;
let isGameRunning = false;
let isPaused = false;
let backgroundMusic = new Audio('https://www.bensound.com/bensound-music/bensound-happyrock.mp3');
backgroundMusic.preload = 'auto';

menuBackgroundMusic.loop = true;
menuBackgroundMusic.volume = 0.5;
menuBackgroundMusic.play().catch(error => console.error('Error playing menu background music:', error));

function startGame() {
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    duck = {
        x: 100,
        y: 200,
        width: DUCK_WIDTH,
        height: DUCK_HEIGHT,
        velocity: 0
    };
    items = [];
    score = 0;
    isGameRunning = true;
    isPaused = false;
    startButton.style.display = 'none';
    warningMessage.style.display = 'none';
    victoryMessage.style.display = 'none';
    gameOverMessage.style.display = 'none';
    backgroundMusic.currentTime = 0;
    backgroundMusic.loop = true;
    backgroundMusic.volume = volumeRange.value;
    menuBackgroundMusic.pause();
    backgroundMusic.play().catch(error => console.error('Error playing background music:', error));
    requestAnimationFrame(gameLoop);
}

function createItem() {
    if (Math.random() < LEVELS[currentLevel - 1].itemFrequency) {
        const type = Math.random() < 0.5 ? 'butter' : 'knife';
        items.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 50),
            width: 40,
            height: 40,
            type: type
        });
    }
}

function drawDuck() {
    if (duck.width >= MAX_SIZE) {
        ctx.fillStyle = 'red';
        warningMessage.style.display = 'block';
        warningMessage.innerText = '⚠️ 小人过大，快吃刀子调整大小！';
    } else if (duck.width <= MIN_SIZE) {
        ctx.fillStyle = 'red';
        warningMessage.style.display = 'block';
        warningMessage.innerText = '⚠️ 小人过小，快吃黄油调整大小！';
    } else {
        ctx.fillStyle = 'white';
        warningMessage.style.display = 'none';
    }
    ctx.drawImage(duckImg, duck.x, duck.y, duck.width, duck.height);
}

function drawItems() {
    items.forEach(item => {
        if (item.type === 'butter') {
            ctx.drawImage(butterImg, item.x, item.y, item.width, item.height);
        } else {
            ctx.drawImage(knifeImg, item.x, item.y, item.width, item.height);
        }
    });
}

function updateGame() {
    levelDisplay.textContent = `关卡: ${currentLevel}`;
    if (isPaused) return;

    duck.velocity += GRAVITY;
    duck.y += duck.velocity;

    if (duck.y >= canvas.height - duck.height) {
        duck.y = canvas.height - duck.height;
        duck.velocity = 0;
    }

    items.forEach((item, index) => {
        item.x -= LEVELS[currentLevel - 1].itemSpeed;
        if (item.x + item.width < 0) {
            items.splice(index, 1);
        }

        if (checkCollision(duck, item)) {
            if (item.type === 'butter') {
                inflateSound.pause();
                inflateSound.currentTime = 0;
                inflateSound.play();
                duck.width += 15;
                duck.height += 15;
            } else {
                cutSound.pause();
                cutSound.currentTime = 0;
                cutSound.play();
                duck.width -= 15;
                duck.height -= 15;
            }
            items.splice(index, 1);
        }
    });

    createItem();
    score++;

    if (score >= LEVELS[currentLevel - 1].winScore) {
        if (currentLevel < LEVELS.length) {
            showVictoryMessage();
        } else {
            victorySound.play();
            endGame(true);
        }
    }
}

function showVictoryMessage() {
    isGameRunning = false;
    victorySound.play();
    victoryMessage.style.display = 'block';
    gameContainer.style.background = 'lightgreen';
    
    setTimeout(() => {
        victoryMessage.style.display = 'none';
        gameContainer.style.background = '';
        currentLevel++;
        startGame();
    }, 3000); // 3秒后进入下一关
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function drawFlag() {
    ctx.fillStyle = 'red';
    ctx.fillRect(canvas.width - 50, canvas.height - 100, 30, 70);
}

function gameLoop() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateGame();
    drawDuck();
    drawItems();

    if (score >= LEVELS[currentLevel - 1].winScore - 100) {
        drawFlag();
    }

    requestAnimationFrame(gameLoop);
}

function endGame(isVictory) {
    isGameRunning = false;
    backgroundMusic.pause();
    if (isVictory) {
        victorySound.play();
        victoryMessage.style.display = 'block';
        gameContainer.style.background = 'lightgreen';
    } else {
        gameOverMessage.style.display = 'block';
        gameContainer.style.background = 'gray';
    }
}

function handleJump() {
    if (isGameRunning && !isPaused) {
        duck.velocity = JUMP_FORCE;
    }
}

function pauseGame() {
    isPaused = !isPaused;
    if (isPaused) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play().catch(error => console.error('Error playing background music:', error));
        requestAnimationFrame(gameLoop);
    }
}

function returnToMainMenu() {
    isGameRunning = false;
    backgroundMusic.pause();
    gameContainer.style.display = 'none';
    mainMenu.style.display = 'flex';
    menuBackgroundMusic.play().catch(error => console.error('Error playing menu background music:', error));
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleJump();
    } else if (e.code === 'Escape') {
        pauseGame();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

startGameButton.addEventListener('click', startGame);
viewLevelsButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    levelsContainer.style.display = 'flex';
    levelsList.innerHTML = '';
    LEVELS.forEach((level, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `关卡 ${index + 1}: 得分目标 ${level.winScore}`;
        listItem.style.padding = '10px';
        listItem.style.fontWeight = 'bold';
        listItem.style.color = '#FF4500';
        levelsList.appendChild(listItem);
    });
});

backToMainMenuButton.addEventListener('click', () => {
    levelsContainer.style.display = 'none';
    mainMenu.style.display = 'flex';
});

pauseButton.addEventListener('click', pauseGame);
backToMainMenuButtonGame.addEventListener('click', returnToMainMenu);

volumeRange.addEventListener('input', () => {
    backgroundMusic.volume = volumeRange.value;
    menuBackgroundMusic.volume = volumeRange.value;
});