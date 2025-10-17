let waterLogged = 0;
let brushLogged = 0;
let breathingSessions = 0;
let brainHighScore = 0;
let moodScenariosCompleted = 0;
let affirmationsCreated = 0;
let currentBrainSequence = [];
let playerSequence = [];
let isPlayerTurn = false;
let sprintCurrentScore = 0;
let breathingInterval = null;
let breathingCycleInterval = null;
let currentMoodSession = null;
let affirmationWords = [];
let userAffirmation = [];
const WATER_GOAL = 8;

// No localStorage loading - all data comes from database via API

// Authentication state
let isAuthenticated = false;
let currentUser = null;

// Initialize authentication
async function initAuth() {
    console.log('initAuth called, checking authentication...');
    console.log('api.isAuthenticated():', api.isAuthenticated());
    
    if (api.isAuthenticated()) {
        try {
            console.log('User appears to be authenticated, fetching profile...');
            currentUser = await api.getUserProfile();
            isAuthenticated = true;
            console.log('Profile fetched successfully:', currentUser);
            
            hideAuthModal();
            showUserWelcome();
            updateAuthMenu();
            
            // Load user's existing wellness data from API
            console.log('Loading user wellness data...');
            await loadUserWellnessData();
        } catch (error) {
            console.error('Auth check failed:', error);
            api.logout();
            updateAuthMenu();
            showUserWelcome();
            // Update dashboard with 0 values when auth fails
            updateDashboard();
        }
    } else {
        console.log('User not authenticated');
        updateAuthMenu();
        showUserWelcome();
        // Update dashboard with 0 values when not authenticated
        updateDashboard();
    }
}

// Update authentication menu based on login status
function updateAuthMenu() {
    const authMenuBtn = document.getElementById('authMenuBtn');
    const authMenuIcon = document.getElementById('authMenuIcon');
    const authMenuText = document.getElementById('authMenuText');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.getElementById('profileBtn');

    if (isAuthenticated && currentUser) {
        // User is logged in
        authMenuIcon.textContent = '👤';
        authMenuText.textContent = currentUser.username;
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        profileBtn.style.display = 'block';
        
        // Remove pulse animation when logged in
        authMenuBtn.classList.remove('logged-out');
    } else {
        // User is not logged in
        authMenuIcon.textContent = '👤';
        authMenuText.textContent = 'Account';
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        profileBtn.style.display = 'none';
        
        // Add pulse animation when logged out to grab attention
        authMenuBtn.classList.add('logged-out');
    }
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function hideAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function showUserWelcome() {
    const mainScreenTitle = document.getElementById('main-screen-title');
    if (mainScreenTitle) {
        if (isAuthenticated && currentUser) {
            mainScreenTitle.textContent = `Welcome back, ${currentUser.username}!`;
        } else {
            mainScreenTitle.textContent = "Welcome to the Wellness Arcade!";
        }
    }
}


// Authentication menu dropdown functionality
function toggleAuthDropdown() {
    const dropdown = document.getElementById('authDropdown');
    const menuBtn = document.getElementById('authMenuBtn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        menuBtn.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        menuBtn.classList.add('active');
    }
}

function closeAuthDropdown() {
    const dropdown = document.getElementById('authDropdown');
    const menuBtn = document.getElementById('authMenuBtn');
    
    dropdown.classList.remove('show');
    menuBtn.classList.remove('active');
}

// Handle logout
async function handleLogout() {
    try {
        await api.logout();
        isAuthenticated = false;
        currentUser = null;
        updateAuthMenu();
        showUserWelcome(); // Reset welcome message
        closeAuthDropdown();
        showAuthStatus('Logged out successfully!', 'success');
        
        // Reset dashboard data
        waterLogged = 0;
        brushLogged = 0;
        breathingSessions = 0;
        moodScenariosCompleted = 0;
        affirmationsCreated = 0;
        updateDashboard();
    } catch (error) {
        console.error('Logout failed:', error);
        showAuthStatus('Logout failed: ' + error.message, 'error');
    }
}

const playSound = (emoji) => {
    
    console.log(emoji); 
};

function updateDashboard() {
    document.getElementById('waterCount').textContent = waterLogged;
    document.getElementById('brushingCount').textContent = brushLogged;
    document.getElementById('breathingCount').textContent = breathingSessions;
    document.getElementById('brainScore').textContent = brainHighScore;
    document.getElementById('moodCount').textContent = moodScenariosCompleted;
    document.getElementById('affirmationCount').textContent = affirmationsCreated;
    
    console.log('Dashboard updated:', {
        waterLogged,
        brushLogged,
        breathingSessions,
        brainHighScore,
        moodScenariosCompleted,
        affirmationsCreated,
        isAuthenticated
    });
}


const BACK_BUTTON_HTML = '<button id="backToDashboardBtn" class="back-button top-left">← Back to Dashboard</button>';

const gameTemplates = {
    hydration: `
        ${BACK_BUTTON_HTML}
        <h3 class="game-page-title">Hydration Hero 💧</h3>
        <div class="plant-container">
            <p id="plantStatus">Your little sprout is thirsty...</p>
            <div id="plant" class="plant-level-0"></div>
        </div>
        <button id="logWaterBtn">Log 1 Glass</button>
    `,
    smile: `
        ${BACK_BUTTON_HTML}
        <h3 class="game-page-title">Sparkle Smile 🦷</h3>
        <div class="character-container">
            <p id="smileStatus">Keep those teeth sparkling!</p>
            <div id="smile" class="smile-level-0"></div>
        </div>
        <button id="logBrushMorningBtn">Log Morning Brush</button>
        <button id="logBrushNightBtn">Log Evening Brush</button>
    `,
    breathe: `
        ${BACK_BUTTON_HTML}
        <h3 class="game-page-title">Breathe & Balance 🧘</h3>
        <div id="breathing-area">
            <div id="breathing-cue">Start</div>
            <div id="breathing-circle" class="breathing-paused"></div>
        </div>
        <p id="breathing-timer">Time: 0s</p>
        <button id="startBreathingBtn">Start 16s Exercise</button>
    `,
    brain: `
        ${BACK_BUTTON_HTML}
        <h3 class="game-page-title">Brain Sprint 🧠</h3>
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
        <button id="startSprintBtn">Start</button>
    `,
    mood: `
        ${BACK_BUTTON_HTML}
        <h3 class="game-page-title">Mood Watch 😊</h3>
        <div id="mood-area">
            <div id="mood-scenario">
                <p id="scenario-text">Loading scenario...</p>
            </div>
            <div id="mood-options">
                <button class="mood-option" data-mood="happy">😊 Happy</button>
                <button class="mood-option" data-mood="sad">😢 Sad</button>
                <button class="mood-option" data-mood="anxious">😰 Anxious</button>
                <button class="mood-option" data-mood="calm">😌 Calm</button>
                <button class="mood-option" data-mood="excited">🤩 Excited</button>
                <button class="mood-option" data-mood="frustrated">😤 Frustrated</button>
            </div>
            <div id="mood-tip" class="mood-tip hidden">
                <p id="tip-text"></p>
            </div>
        </div>
        <button id="nextMoodBtn">Next Scenario</button>
    `,
    affirmation: `
        ${BACK_BUTTON_HTML}
        <h3 class="game-page-title">Affirmation Builder ✨</h3>
        <div id="affirmation-area">
            <div id="word-bank">
                <h4>Word Bank:</h4>
                <div id="available-words"></div>
            </div>
            <div id="affirmation-builder">
                <h4>Your Affirmation:</h4>
                <div id="selected-words"></div>
                <button id="clear-affirmation">Clear</button>
            </div>
            <div id="generated-affirmation" class="hidden">
                <h4>Generated Affirmation:</h4>
                <p id="final-affirmation"></p>
            </div>
        </div>
        <button id="generate-affirmation">Generate Affirmation</button>
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
    if (breathingCycleInterval) {
        clearInterval(breathingCycleInterval);
        breathingCycleInterval = null;
    }
    
    // Show the game selection grid
    const gameSelectionGrid = document.querySelector('.game-selection-grid');
    if (gameSelectionGrid) {
        gameSelectionGrid.style.display = 'grid';
    }
    
    // Show the welcome text on main screen
    const mainScreenTitle = document.getElementById('main-screen-title');
    const mainScreenSubtitle = mainScreenTitle.nextElementSibling;
    if (mainScreenTitle) {
        mainScreenTitle.style.display = 'block';
        mainScreenTitle.textContent = "Welcome to the Wellness Arcade!";
    }
    if (mainScreenSubtitle) {
        mainScreenSubtitle.style.display = 'block';
    }
    
    mainContentArea.innerHTML = ``; 
    updateDashboard();
}


function loadGame(gameName) {
    // Clear any running breathing interval when switching pages
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    if (breathingCycleInterval) {
        clearInterval(breathingCycleInterval);
        breathingCycleInterval = null;
    }

    // Hide the game selection grid
    const gameSelectionGrid = document.querySelector('.game-selection-grid');
    if (gameSelectionGrid) {
        gameSelectionGrid.style.display = 'none';
    }

    // Hide the welcome text on main screen
    const mainScreenTitle = document.getElementById('main-screen-title');
    const mainScreenSubtitle = mainScreenTitle.nextElementSibling;
    if (mainScreenTitle) {
        mainScreenTitle.style.display = 'none';
    }
    if (mainScreenSubtitle) {
        mainScreenSubtitle.style.display = 'none';
    }

    mainContentArea.innerHTML = gameTemplates[gameName];

    // Attach back button listener
    const backBtn = document.getElementById('backToDashboardBtn');
    if (backBtn) {
        backBtn.addEventListener('click', loadDashboard);
    }

    // --- Hydration Hero Setup ---
    if (gameName === 'hydration') {
        document.getElementById('logWaterBtn').addEventListener('click', handleWaterLogWithAPI);
        updateHydrationView();
    }

    // --- Sparkle Smile Setup ---
    if (gameName === 'smile') {
        document.getElementById('logBrushMorningBtn').addEventListener('click', handleMorningBrushWithAPI);
        document.getElementById('logBrushNightBtn').addEventListener('click', handleNightBrushWithAPI);
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
        document.querySelectorAll('.sprint-tile').forEach(tile => {
            tile.addEventListener('click', handleTileClick);
            tile.disabled = true; // Initially disable tiles
            tile.classList.add('disabled');
        });
    }

    // --- Mood Watch Setup ---
    if (gameName === 'mood') {
        document.getElementById('nextMoodBtn').addEventListener('click', loadMoodScenario);
        document.querySelectorAll('.mood-option').forEach(option => 
            option.addEventListener('click', handleMoodSelection));
        loadMoodScenario();
    }

    // --- Affirmation Builder Setup ---
    if (gameName === 'affirmation') {
        document.getElementById('generate-affirmation').addEventListener('click', generateAffirmation);
        document.getElementById('clear-affirmation').addEventListener('click', clearAffirmation);
        loadAffirmationWords();
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

    // Plant grows with each water glass, with 8 levels (0-7, max level after 8 clicks)
    let level = Math.min(waterLogged, 7); 
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

    let count = brushLogged;
    
    let emoji = '😐';
    if (count >= 1) emoji = '😊';
    if (count >= 2) emoji = '😁';
    if (count >= 4) emoji = '🤩';
    smileElement.textContent = emoji;
    
    smileElement.style.borderColor = count >= 2 ? '#4CAF50' : (count >= 1 ? '#8cc63f' : '#ccc');
    smileElement.style.boxShadow = count >= 2 ? '0 0 15px #ffeb3b' : 'none'; 
    
    if (count >= 4) {
        statusDisplay.textContent = 'Ultimate Sparkle! Super clean teeth! 🌟';
        playSound('🌟');
    } else if (count >= 2) {
        statusDisplay.textContent = 'Maximum Sparkle! Teeth are happy!';
        playSound('🌟');
    } else if (count >= 1) {
        statusDisplay.textContent = 'Good start! Keep brushing for healthy teeth.';
    } else {
        statusDisplay.textContent = 'Time to brush and make those teeth happy!';
    }
    updateDashboard();
}

function handleMorningBrush() {
    brushLogged++;
    updateSmileView();
    alert("Morning routine complete! 😊");
}

function handleNightBrush() {
    brushLogged++;
    updateSmileView();
    alert("Night routine complete! Good night, Sparkle Hero! 🌙");
}

// --- 4. Brain Sprint Functions ---
function startGame() {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    currentBrainSequence = [];
    playerSequence = [];
    isPlayerTurn = false;
    sprintCurrentScore = 0;
    document.getElementById('sprint-current-score').textContent = sprintCurrentScore;
    document.getElementById('sprint-message').textContent = 'Watch the sequence...';
    document.getElementById('startSprintBtn').disabled = true;
    
    // Disable all tiles initially
    document.querySelectorAll('.sprint-tile').forEach(tile => {
        tile.disabled = true;
        tile.classList.add('disabled');
    });
    
    setTimeout(() => {
        addToSequence();
    }, 1000);
}

function addToSequence() {
    const newTile = Math.floor(Math.random() * 4) + 1;
    currentBrainSequence.push(newTile);
    
    showSequence();
}

function showSequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i < currentBrainSequence.length) {
            const tile = document.querySelector(`[data-id="${currentBrainSequence[i]}"]`);
            tile.classList.add('highlight');
            setTimeout(() => {
                tile.classList.remove('highlight');
            }, 500);
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                isPlayerTurn = true;
                document.getElementById('sprint-message').textContent = 'Your turn! Click the tiles in order.';
                // Enable tiles for player input
                document.querySelectorAll('.sprint-tile').forEach(tile => {
                    tile.disabled = false;
                    tile.classList.remove('disabled');
                });
            }, 500);
        }
    }, 600);
}

async function handleTileClick(event) {
    if (!isPlayerTurn) return;
    
    const clickedId = parseInt(event.target.dataset.id);
    playerSequence.push(clickedId);
    
    // Check if the sequence is correct so far
    const currentIndex = playerSequence.length - 1;
    if (playerSequence[currentIndex] !== currentBrainSequence[currentIndex]) {
        // Wrong sequence - Game Over
        isPlayerTurn = false;
        
        // Disable all tiles
        document.querySelectorAll('.sprint-tile').forEach(tile => {
            tile.disabled = true;
            tile.classList.add('disabled');
        });
        
        // Update high score if needed BEFORE showing popup
        if (sprintCurrentScore > brainHighScore) {
            brainHighScore = sprintCurrentScore;
            // Log puzzle result to API if authenticated
            if (isAuthenticated) {
                try {
                    await api.submitPuzzleResponse('brain_sprint', [], false); // Log game over
                    // Reload puzzle data from API to get updated high score
                    const puzzleStatus = await api.getPuzzleStatus();
                    brainHighScore = puzzleStatus.high_score_today;
                } catch (error) {
                    console.error('Failed to log puzzle result:', error);
                }
            }
            updateDashboard();
        }
        
        // Show game over popup with updated high score
        showGameOverPopup(sprintCurrentScore);
        
        document.getElementById('startSprintBtn').disabled = false;
        return;
    }
    
    // Check if sequence is complete
    if (playerSequence.length === currentBrainSequence.length) {
        sprintCurrentScore++;
        document.getElementById('sprint-current-score').textContent = sprintCurrentScore;
        document.getElementById('sprint-message').textContent = 'Correct! Next round...';
        playerSequence = [];
        isPlayerTurn = false;
        
        // Log correct answer to API if authenticated
        if (isAuthenticated) {
            try {
                await api.submitPuzzleResponse('brain_sprint', playerSequence, true);
            } catch (error) {
                console.error('Failed to log puzzle result:', error);
            }
        }
        
        // Disable tiles while showing next sequence
        document.querySelectorAll('.sprint-tile').forEach(tile => {
            tile.disabled = true;
            tile.classList.add('disabled');
        });
        
        setTimeout(() => {
            addToSequence();
        }, 1500);
    }
}

function showGameOverPopup(score) {
    // Create popup modal
    const popup = document.createElement('div');
    popup.className = 'game-over-popup';
    popup.innerHTML = `
        <div class="game-over-content">
            <h2>🧠 Game Over!</h2>
            <div class="score-display">
                <p class="final-score">Final Score: <span class="score-number">${score}</span></p>
                <p class="high-score">High Score: <span class="score-number">${brainHighScore}</span></p>
            </div>
            <div class="game-over-message">
                ${score > 0 ? 'Great job! You remembered the sequence!' : 'Better luck next time!'}
            </div>
            <button id="closeGameOverBtn" class="close-game-over-btn">Play Again</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(popup);
    
    // Add event listener for close button
    document.getElementById('closeGameOverBtn').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
    }, 5000);
}

// --- 5. Breathe & Balance Functions ---
function startBreathing() {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    const button = document.getElementById('startBreathingBtn');
    const circle = document.getElementById('breathing-circle');
    const cue = document.getElementById('breathing-cue');
    const timer = document.getElementById('breathing-timer');
    
    button.disabled = true;
    button.textContent = 'Breathing...';
    
    let currentTime = 0;
    let currentPhase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    
    // Set initial state - circle starts at normal size
    circle.className = 'breathing-paused';
    
    const updateTimer = async () => {
        timer.textContent = `Time: ${currentTime}s`;
        
        // Determine current phase based on current time (4 equal stages of 4 seconds each)
        if (currentTime >= 12) {
            // Stage 4: Hold breath (12-15 seconds) - stay at initial size after exhale
            currentPhase = 3;
            circle.className = 'breathing-hold-exhaled';
            cue.textContent = 'Hold breath';
        } else if (currentTime >= 8) {
            // Stage 3: Exhale (8-11 seconds) - shrink back to initial size
            currentPhase = 2;
            circle.className = 'breathing-out';
            cue.textContent = 'Exhale';
        } else if (currentTime >= 4) {
            // Stage 2: Hold breath (4-7 seconds) - stay at increased size after inhale
            currentPhase = 1;
            circle.className = 'breathing-hold-inhaled';
            cue.textContent = 'Hold breath';
        } else {
            // Stage 1: Inhale (0-3 seconds) - grow from initial size
            currentPhase = 0;
            circle.className = 'breathing-in';
            cue.textContent = 'Inhale';
        }
        
        currentTime++;
        
        if (currentTime > 15) {
            clearInterval(breathingInterval);
            breathingInterval = null;
            
            // Log to API if authenticated
            if (isAuthenticated) {
                try {
                    await api.logBreathing(16);
                    breathingSessions++;
                    updateDashboard();
                    showAuthStatus('Breathing session logged!', 'success');
                } catch (error) {
                    console.error('Failed to log breathing:', error);
                    breathingSessions++;
                    updateDashboard();
                }
            } else {
                breathingSessions++;
                updateDashboard();
            }
            
            circle.className = 'breathing-paused';
            cue.textContent = 'Completed!';
            button.disabled = false;
            button.textContent = 'Start 16s Exercise';
            timer.textContent = 'Time: 0s';
            return;
        }
    };
    
    breathingInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Start immediately
}

// --- 6. Mood Watch Functions ---
const moodScenarios = [
    "You missed the bus this morning and had to walk to work in the rain.",
    "Your friend surprised you with your favorite coffee.",
    "You received a compliment from your boss about your recent project.",
    "You're stuck in traffic and running late for an important meeting.",
    "You found a $20 bill on the sidewalk.",
    "Your favorite show was cancelled after one season.",
    "You successfully completed a difficult task you've been working on.",
    "You had a disagreement with a close friend.",
    "You discovered a new hobby that you really enjoy.",
    "You're feeling overwhelmed with too many responsibilities."
];

const moodTips = {
    happy: "It's wonderful to feel happy! Try to savor these positive moments and share your joy with others.",
    sad: "It's okay to feel sad sometimes. Consider talking to someone you trust or doing something that usually brings you comfort.",
    anxious: "Anxiety is a normal emotion. Try deep breathing exercises or grounding techniques to help manage these feelings.",
    calm: "Feeling calm is great for your well-being. This is a good time for reflection or mindfulness practices.",
    excited: "Excitement can be energizing! Channel this positive energy into productive activities or creative pursuits.",
    frustrated: "Frustration is a natural response. Try to identify what's causing it and take small steps to address the situation."
};

function loadMoodScenario() {
    const randomScenario = moodScenarios[Math.floor(Math.random() * moodScenarios.length)];
    document.getElementById('scenario-text').textContent = randomScenario;
    document.getElementById('mood-tip').classList.add('hidden');
    
    // Reset all mood buttons to default state
    document.querySelectorAll('.mood-option').forEach(btn => {
        btn.disabled = false;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    });
}

async function handleMoodSelection(event) {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    const selectedMood = event.target.dataset.mood;
    const tip = moodTips[selectedMood];
    
    document.getElementById('tip-text').textContent = tip;
    document.getElementById('mood-tip').classList.remove('hidden');
    
    // Disable all mood buttons
    document.querySelectorAll('.mood-option').forEach(btn => btn.disabled = true);
    
    // Highlight selected mood
    event.target.style.backgroundColor = '#4CAF50';
    event.target.style.color = 'white';
    
    // Log mood to API if authenticated
    if (isAuthenticated) {
        try {
            await api.logEmotion('current_scenario', selectedMood);
            // Reload mood data from API
            const moodStatus = await api.getEmotionStatus();
            moodScenariosCompleted = moodStatus.scenarios_today;
            updateDashboard();
        } catch (error) {
            console.error('Failed to log mood:', error);
            // Fallback to local increment
            moodScenariosCompleted++;
            updateDashboard();
        }
    } else {
        // Fallback to local increment when not authenticated
        moodScenariosCompleted++;
        updateDashboard();
    }
}

// --- 7. Affirmation Builder Functions ---
const affirmationWordBank = [
    "I", "am", "strong", "capable", "worthy", "loved", "brave", "confident", "peaceful", "grateful",
    "will", "can", "deserve", "choose", "believe", "create", "achieve", "grow", "heal", "thrive",
    "today", "always", "moment", "journey", "life", "future", "present", "now"
];

function loadAffirmationWords() {
    const wordContainer = document.getElementById('available-words');
    wordContainer.innerHTML = '';
    
    affirmationWordBank.forEach(word => {
        const wordButton = document.createElement('button');
        wordButton.textContent = word;
        wordButton.className = 'word-button';
        wordButton.addEventListener('click', () => addWordToAffirmation(word, wordButton));
        wordContainer.appendChild(wordButton);
    });
}

function addWordToAffirmation(word, button) {
    userAffirmation.push(word);
    updateAffirmationDisplay();
    button.disabled = true;
    button.style.opacity = '0.5';
}

function updateAffirmationDisplay() {
    const selectedWordsDiv = document.getElementById('selected-words');
    selectedWordsDiv.innerHTML = userAffirmation.join(' ');
}

function clearAffirmation() {
    userAffirmation = [];
    updateAffirmationDisplay();
    document.querySelectorAll('.word-button').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
    document.getElementById('generated-affirmation').classList.add('hidden');
}

async function generateAffirmation() {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    if (userAffirmation.length === 0) {
        alert('Please select some words first!');
        return;
    }
    
    const userText = userAffirmation.join(' ');
    const generatedText = `"${userText}." - You have the power to create positive change in your life.`;
    
    document.getElementById('final-affirmation').textContent = generatedText;
    document.getElementById('generated-affirmation').classList.remove('hidden');
    
    // Disable generate button and show restart button
    const generateBtn = document.getElementById('generate-affirmation');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generated!';
    
    // Create restart button if it doesn't exist
    if (!document.getElementById('restart-affirmation-btn')) {
        const restartBtn = document.createElement('button');
        restartBtn.id = 'restart-affirmation-btn';
        restartBtn.textContent = 'Start New Affirmation';
        restartBtn.className = 'restart-affirmation-btn';
        generateBtn.parentNode.insertBefore(restartBtn, generateBtn.nextSibling);
        
        restartBtn.addEventListener('click', restartAffirmation);
    }
    
    // Save affirmation to API if authenticated
    if (isAuthenticated) {
        try {
            await api.submitAffirmation(userAffirmation, generatedText);
            // Reload affirmation data from API
            const affirmationStatus = await api.getAffirmationStatus();
            affirmationsCreated = affirmationStatus.affirmations_today;
            updateDashboard();
            console.log('Affirmation saved to API');
        } catch (error) {
            console.error('Failed to save affirmation to API:', error);
            // Fallback to local increment
            affirmationsCreated++;
            updateDashboard();
        }
    } else {
        // Fallback to local increment when not authenticated
        affirmationsCreated++;
        updateDashboard();
    }
}

function restartAffirmation() {
    // Clear the affirmation
    clearAffirmation();
    
    // Hide generated affirmation
    document.getElementById('generated-affirmation').classList.add('hidden');
    
    // Reset generate button
    const generateBtn = document.getElementById('generate-affirmation');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Affirmation';
    
    // Remove restart button
    const restartBtn = document.getElementById('restart-affirmation-btn');
    if (restartBtn) {
        restartBtn.remove();
    }
}

// Authentication event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Update tab buttons
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tab + 'Tab').classList.add('active');
        });
    });

    // Authentication menu event handlers
    document.getElementById('authMenuBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleAuthDropdown();
    });

    document.getElementById('loginBtn').addEventListener('click', function() {
        showAuthModal();
        closeAuthDropdown();
        // Switch to login tab
        document.querySelector('[data-tab="login"]').click();
    });

    document.getElementById('registerBtn').addEventListener('click', function() {
        showAuthModal();
        closeAuthDropdown();
        // Switch to register tab
        document.querySelector('[data-tab="register"]').click();
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        handleLogout();
    });

    document.getElementById('profileBtn').addEventListener('click', function() {
        // For now, just show a simple alert. Could be expanded to show profile info
        alert(`Profile: ${currentUser.username}\nEmail: ${currentUser.email || 'Not provided'}`);
        closeAuthDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const authMenuContainer = document.querySelector('.auth-menu-container');
        if (!authMenuContainer.contains(e.target)) {
            closeAuthDropdown();
        }
    });

    // Close auth modal when clicking outside
    document.getElementById('authModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideAuthModal();
        }
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await api.login(username, password);
            currentUser = await api.getUserProfile();
            isAuthenticated = true;
            
            // Clear form fields
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            
            hideAuthModal();
            showUserWelcome();
            updateAuthMenu();
            
            // Load user's existing wellness data from API
            await loadUserWellnessData();
            
            showAuthStatus('Login successful!', 'success');
        } catch (error) {
            showAuthStatus('Login failed: ' + error.message, 'error');
        }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            await api.register(username, email, password);
            showAuthStatus('Registration successful! Please login.', 'success');
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
        } catch (error) {
            showAuthStatus('Registration failed: ' + error.message, 'error');
        }
    });

    // Make homepage title clickable
    document.getElementById('homepage-title').addEventListener('click', function() {
        loadDashboard();
    });

    // Reset stats button
    document.getElementById('resetStatsBtn').addEventListener('click', function() {
        handleResetStats();
    });

    // Initialize authentication (this will update dashboard after loading API data)
    initAuth();
});

function showAuthStatus(message, type) {
    const statusDiv = document.getElementById('authStatus');
    statusDiv.textContent = message;
    statusDiv.className = `auth-status ${type}`;
    
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'auth-status';
    }, 3000);
}

// Load user's wellness data from API
async function loadUserWellnessData() {
    if (!isAuthenticated) {
        console.log('Not authenticated, skipping API data load');
        return;
    }
    
    console.log('Loading user wellness data from API...');
    
    try {
        // Load hydration data
        const hydrationStatus = await api.getHydrationStatus();
        waterLogged = hydrationStatus.glasses_today;
        console.log('Hydration data loaded:', hydrationStatus);
        
        // Load brushing data
        const brushingStatus = await api.getBrushingStatus();
        brushLogged = brushingStatus.brushing_today;
        console.log('Brushing data loaded:', brushingStatus);
        
        // Load breathing data
        const breathingStatus = await api.getBreathingStatus();
        breathingSessions = breathingStatus.sessions_today;
        console.log('Breathing data loaded:', breathingStatus);
        
        // Load brain puzzle data
        const puzzleStatus = await api.getPuzzleStatus();
        brainHighScore = puzzleStatus.high_score_today;
        console.log('Puzzle data loaded:', puzzleStatus);
        
        // Load mood data
        const moodStatus = await api.getEmotionStatus();
        moodScenariosCompleted = moodStatus.scenarios_today;
        console.log('Mood data loaded:', moodStatus);
        
        // Load affirmation data
        const affirmationStatus = await api.getAffirmationStatus();
        affirmationsCreated = affirmationStatus.affirmations_today;
        console.log('Affirmation data loaded:', affirmationStatus);
        
        // Update dashboard with loaded data
        updateDashboard();
        
        console.log('User wellness data loaded from API:', {
            waterLogged,
            brushLogged,
            breathingSessions,
            brainHighScore,
            moodScenariosCompleted,
            affirmationsCreated
        });
    } catch (error) {
        console.error('Failed to load user wellness data:', error);
        // Reset to 0 if API fails
        waterLogged = 0;
        brushLogged = 0;
        breathingSessions = 0;
        moodScenariosCompleted = 0;
        affirmationsCreated = 0;
        updateDashboard();
    }
}

// Enhanced game functions with API integration
async function handleWaterLogWithAPI() {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    try {
        const response = await api.logHydration(1);
        waterLogged = response.total_today;
        updateHydrationView();
        showAuthStatus(`Logged water! Total today: ${waterLogged}`, 'success');
    } catch (error) {
        console.error('Failed to log water:', error);
        // Fallback to local update
        waterLogged++;
        updateHydrationView();
    }
}

async function handleMorningBrushWithAPI() {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    try {
        const response = await api.logBrushing('morning');
        brushLogged = response.total_today;
        updateSmileView();
        showAuthStatus(`Morning routine logged! Total today: ${brushLogged}`, 'success');
    } catch (error) {
        console.error('Failed to log brushing:', error);
        brushLogged++;
        updateSmileView();
    }
}

async function handleNightBrushWithAPI() {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    try {
        const response = await api.logBrushing('night');
        brushLogged = response.total_today;
        updateSmileView();
        showAuthStatus(`Night routine logged! Total today: ${brushLogged}`, 'success');
    } catch (error) {
        console.error('Failed to log brushing:', error);
        brushLogged++;
        updateSmileView();
    }
}

async function handleBreathingWithAPI() {
    if (!isAuthenticated) {
        alert('Please login to track your progress!');
        return;
    }
    
    try {
        await api.logBreathing(30);
        breathingSessions++;
        updateDashboard();
        showAuthStatus('Breathing session logged!', 'success');
    } catch (error) {
        console.error('Failed to log breathing:', error);
        // Still run the breathing exercise locally
    }
}

async function handleResetStats() {
    if (!isAuthenticated) {
        alert('Please login to reset your stats!');
        return;
    }
    
    const confirmed = confirm('Are you sure you want to reset all your wellness stats for today? This action cannot be undone.');
    if (!confirmed) {
        return;
    }
    
    try {
        await api.resetAllStats();
        
        // Reset local variables
        waterLogged = 0;
        brushLogged = 0;
        breathingSessions = 0;
        moodScenariosCompleted = 0;
        affirmationsCreated = 0;
        
        // Update dashboard
        updateDashboard();
        
        showAuthStatus('All stats have been reset!', 'success');
        console.log('All wellness stats reset successfully');
    } catch (error) {
        console.error('Failed to reset stats:', error);
        showAuthStatus('Failed to reset stats: ' + error.message, 'error');
    }
}

