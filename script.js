let waterLogged = 0;
let brushLogged = { morning: false, night: false };
let breathingSessions = 0;
let brainHighScore = 0;
let currentBrainSequence = [];
let playerSequence = [];
let isPlayerTurn = false;
let sprintCurrentScore = 0;
let breathingInterval = null;
const WATER_GOAL = 8;



const playSound = (emoji) => {
    
    console.log(emoji); 
};

function updateDashboard() {
    document.getElementById('waterCount').textContent = waterLogged;
    document.getElementById('brushingCount').textContent = `${(brushLogged.morning ? 1 : 0) + (brushLogged.night ? 1 : 0)}/2`;
    document.getElementById('breathingCount').textContent = breathingSessions;
    document.getElementById('brainScore').textContent = brainHighScore;

    localStorage.setItem('waterLogged', waterLogged);
    localStorage.setItem('brushMorning', brushLogged.morning);
    localStorage.setItem('brushNight', brushLogged.night);
    localStorage.setItem('breathingSessions', breathingSessions);
    localStorage.setItem('brainHighScore', brainHighScore);
}


const BACK_BUTTON_HTML = '<button id="backToDashboardBtn" class="back-button">← Back to Dashboard</button>';

const gameTemplates = {
    hydration: `
        <h3 class="game-page-title">Hydration Hero 💧</h3>
        <div class="scientific-advice">
            Scientific Advice: *Dehydration impacts cognitive function.* Maintaining fluid balance helps sustain energy levels and focus throughout the day.
        </div>
        <div class="plant-container">
            <p id="plantStatus">Your little sprout is thirsty...</p>
            <div id="plant" class="plant-level-0"></div>
        </div>
        <button id="logWaterBtn">Log 1 Glass (✨)</button>
        ${BACK_BUTTON_HTML}
    `,
    smile: `
        <h3 class="game-page-title">Sparkle Smile 🦷</h3>
        <div class="scientific-advice">
            Scientific Advice: *Oral hygiene is linked to heart health.* Regular brushing reduces chronic inflammation that can contribute to cardiovascular issues.
        </div>
        <div class="character-container">
            <p id="smileStatus">Keep those teeth sparkling!</p>
            <div id="smile" class="smile-level-0"></div>
        </div>
        <button id="logBrushMorningBtn">Log Morning Brush</button>
        <button id="logBrushNightBtn">Log Evening Brush</button>
        ${BACK_BUTTON_HTML}
    `,
    breathe: `
        <h3 class="game-page-title">Breathe & Balance 🧘</h3>
        <div class="scientific-advice">
            Scientific Advice: *Diaphragmatic breathing activates the vagus nerve*, which is key to stimulating the body's parasympathetic (rest and digest) system, lowering heart rate and cortisol.
        </div>
        <div id="breathing-area">
            <div id="breathing-cue">Start</div>
            <div id="breathing-circle" class="breathing-paused"></div>
        </div>
        <p id="breathing-timer">Time: 0s</p>
        <button id="startBreathingBtn">Start 30s Exercise (🎶)</button>
        ${BACK_BUTTON_HTML}
    `,
    brain: `
        <h3 class="game-page-title">Brain Sprint 🧠</h3>
        <div class="scientific-advice">
            Scientific Advice: *Cognitive stimulation supports neuroplasticity.* Short, focused memory tasks help maintain attention and enhance the brain's ability to form new neural connections.
        </div>
        <div id="sprint-area">
            <p>Current Score: <span id="sprint-current-score">0</span></p>
            <div id="sprint-board">
                <button class="sprint-tile" data-id="1"></button>
                <button class="sprint-tile" data-id="2"></button>
                <button class="sprint-tile" data-id="3"></button>
                <button class="sprint-tile" data-id="4"></button>
            </div>
            <p id="sprint-message">Press Start to begin!</p>
        </div>
        <button id="startSprintBtn">Start Sprint (▶️)</button>
        ${BACK_BUTTON_HTML}
    `
};


const mainContentArea = document.getElementById('game-content-area');
const mainScreenTitle = document.getElementById('main-screen-title');
const gameBoxes = document.querySelectorAll('.game-box');


function loadDashboard() {

    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    
    
    mainScreenTitle.textContent = "Welcome to the Wellness Arcade!";
    mainContentArea.innerHTML = `
        <img src="https://via.placeholder.com/200x150/f0f8ff/5a7d95?text=Cute+Forest" alt="Cute forest scene" class="welcome-image">
        <p>Your journey to mindful habits starts here!</p>
        <p>Pick a game from the left dashboard to get started and boost your wellness!</p>
    `; 
    updateDashboard();
}


function loadGame(gameName) {
    // Clear any running breathing interval when switching pages
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }


    mainContentArea.innerHTML = gameTemplates[gameName];
    const mainScreenTitle = document.getElementById('main-screen-title');
    mainScreenTitle.textContent = gameName.charAt(0).toUpperCase() + gameName.slice(1) + " Game";

    // Attach back button listener
    const backBtn = document.getElementById('backToDashboardBtn');
    if (backBtn) {
        backBtn.addEventListener('click', loadDashboard);
    }

    // --- Hydration Hero Setup ---
    if (gameName === 'hydration') {
        document.getElementById('logWaterBtn').addEventListener('click', handleWaterLog);
        updateHydrationView();
    }

    // --- Sparkle Smile Setup ---
    if (gameName === 'smile') {
        document.getElementById('logBrushMorningBtn').addEventListener('click', handleMorningBrush);
        document.getElementById('logBrushNightBtn').addEventListener('click', handleNightBrush);
        updateSmileView();
    }
    
    // --- Breathe & Balance Setup ---
    if (gameName === 'breathe') {
        document.getElementById('startBreathingBtn').addEventListener('click', startBreathing);
        document.getElementById('breathing-circle').className = 'breathing-paused';
        document.getElementById('breathing-cue').textContent = 'Start';
        document.getElementById('breathing-timer').textContent = 'Time: 0s';
    }

    // --- Brain Sprint Setup ---
    if (gameName === 'brain') {
        document.getElementById('startSprintBtn').addEventListener('click', startGame);
        sprintCurrentScore = 0; 
        document.getElementById('sprint-current-score').textContent = sprintCurrentScore;
        document.querySelectorAll('.sprint-tile').forEach(tile => tile.addEventListener('click', handleTileClick));
    }
}

// Add click listeners to the game selection boxes
gameBoxes.forEach(box => {
    box.addEventListener('click', () => {
        const gameName = box.dataset.game; 
        loadGame(gameName);
    });
});


// --- 2. Hydration Hero Functions ---
function updateHydrationView() {
    const plantElement = document.getElementById('plant');
    const plantStatusDisplay = document.getElementById('plantStatus');

    let level = Math.min(Math.floor(waterLogged / 2), 4); 
    plantElement.className = `plant-level-${level}`; 

    if (waterLogged >= WATER_GOAL) {
        plantStatusDisplay.textContent = "🥳 Fully Revived! You're a true Hydration Hero!";
        playSound('✨');
    } else if (waterLogged > 0) {
        plantStatusDisplay.textContent = `🌱 Growing stronger! Need ${WATER_GOAL - waterLogged} more.`;
    } else {
        plantStatusDisplay.textContent = "Your little sprout is thirsty...";
    }
    updateDashboard();
}

function handleWaterLog() {
    if (waterLogged < 12) { 
        waterLogged++;
        if (waterLogged === WATER_GOAL) {
             alert("Goal Reached! You fully revived the plant! 🏆");
        }
        playSound('💧');
    }
    updateHydrationView();
}


// --- 3. Sparkle Smile Functions ---
function updateSmileView() {
    const smileElement = document.getElementById('smile');
    const statusDisplay = document.getElementById('smileStatus');

    let count = (brushLogged.morning ? 1 : 0) + (brushLogged.night ? 1 : 0);
    
    let emoji = '😐';
    if (count === 1) emoji = '🙂';
    if (count === 2) emoji = '😁';
    smileElement.textContent = emoji;
    
    smileElement.style.borderColor = count === 2 ? '#4CAF50' : (count === 1 ? '#8cc63f' : '#ccc');
    smileElement.style.boxShadow = count === 2 ? '0 0 15px #ffeb3b' : 'none'; 
    
    if (count === 2) {
        statusDisplay.textContent = 'Maximum Sparkle! Teeth are happy!';
        playSound('🌟');
    } else if (count === 1) {
        statusDisplay.textContent = 'Halfway there! Log your next brush.';
    } else {
        statusDisplay.textContent = 'Time to brush and make those teeth happy!';
    }
    updateDashboard();
}

function handleMorningBrush() {
    if (!brushLogged.morning) {
        brushLogged.morning = true;
        updateSmileView();
        alert("Morning routine complete! 😊");
    }
}

function handleNightBrush() {
    if (!brushLogged.night) {
        brushLogged.night = true;
        updateSmileView();
        alert("Night routine complete! Good night, Sparkle Hero! 🌙");
    }
}

