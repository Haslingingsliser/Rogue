// Game State
let gameState = {
    stage: 1,
    player: {
        hp: 100,
        maxHP: 100,
        energy: 3,
        armor: 0,
        deck: [],
        hand: [],
        discardPile: [],
        statusEffects: [],
        maxHandSize: 5
    },
    currentEnemy: null,
    isPlayerTurn: true,
    log: []
};

const ENEMIES = [/* Daftar musuh dengan scaling */];
const ALL_CARDS = [/* Daftar 100 kartu */];

// Inisialisasi Game
function initGame() {
    initializeStarterDeck();
    spawnEnemy();
    startPlayerTurn();
    updateUI();
}

// Sistem Turn
function startPlayerTurn() {
    gameState.isPlayerTurn = true;
    gameState.player.energy = 3;
    drawCards(3);
    processStatusEffects('start');
    updateUI();
}

function endPlayerTurn() {
    if(!gameState.isPlayerTurn) return;
    
    gameState.isPlayerTurn = false;
    discardHand();
    processStatusEffects('end');
    startEnemyTurn();
}

function startEnemyTurn() {
    enemyAction();
    checkEnemyDeath();
    startPlayerTurn();
}

// Manajemen Kartu
function initializeStarterDeck() {
    gameState.player.deck = [
        'Slash', 'Slash', 'Block', 'Dodge', 
        'Adrenaline Rush', 'Poison Dagger'
    ];
    shuffleDeck();
}

function drawCards(amount) {
    for(let i = 0; i < amount; i++) {
        if(gameState.player.hand.length >= gameState.player.maxHandSize) break;
        if(gameState.player.deck.length === 0) shuffleDiscardPile();
        gameState.player.hand.push(gameState.player.deck.pop());
    }
}

function discardHand() {
    gameState.player.discardPile.push(...gameState.player.hand);
    gameState.player.hand = [];
}

// Sistem Stage
function advanceStage() {
    gameState.stage++;
    showCardReward();
    spawnEnemy();
}

function showCardReward() {
    const rewards = getRandomCards(3);
    // Tampilkan UI untuk memilih kartu
    rewards.forEach(card => {
        // Tambahkan logika pemilihan
    });
}

// Implementasi Kartu (Contoh 20 kartu pertama)
const CARD_EFFECTS = {
    'Slash': {
        cost: 1,
        type: 'attack',
        effect: (target) => dealDamage(6, target)
    },
    'Heavy Strike': {
        cost: 2,
        type: 'attack',
        effect: (target) => dealDamage(12, target)
    },
    'Poison Dagger': {
        cost: 1,
        type: 'attack',
        effect: (target) => {
            dealDamage(4, target);
            applyStatus(target, 'poison', 2, 3);
        }
    },
    'Block': {
        cost: 1,
        type: 'defense',
        effect: () => addArmor(6, gameState.player)
    },
    'Dodge': {
        cost: 1,
        type: 'defense',
        effect: () => applyStatus(gameState.player, 'dodge', 1, 1)
    },
    'Adrenaline Rush': {
        cost: 0,
        type: 'buff',
        effect: () => gainEnergy(2)
    },
    'Fireball': {
        cost: 3,
        type: 'magic',
        effect: () => dealAoeDamage(10)
    },
    'Mind Control': {
        cost: 4,
        type: 'special',
        effect: () => stealEnemyCard()
    },
    // ... Tambahkan semua 100 kartu disini
};

// Sistem Pertarungan
function dealDamage(amount, target) {
    // Implementasi damage dengan armor
}

function enemyAction() {
    // AI musuh berdasarkan tipe
    const enemy = gameState.currentEnemy;
    
    if(enemy.type === 'BERSERKER') {
        dealDamageToPlayer(enemy.attack * 2);
    } else {
        dealDamageToPlayer(enemy.attack);
        applyRandomStatus();
    }
}

// UI Controller
function updateUI() {
    updatePlayerStats();
    updateEnemyStats();
    updateHandDisplay();
    updateStageDisplay();
    updateLog();
}

function updateHandDisplay() {
    const handElement = document.getElementById('hand');
    handElement.innerHTML = '';
    
    gameState.player.hand.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        handElement.appendChild(cardElement);
    });
}

function createCardElement(cardName, index) {
    const card = CARD_EFFECTS[cardName];
    const element = document.createElement('div');
    element.className = `card ${card.type}`;
    element.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <h3>${cardName}</h3>
        <div class="card-type">${card.type}</div>
    `;
    
    element.onclick = () => {
        if(canPlayCard(card)) {
            playCard(cardName);
        }
    };
    
    return element;
}

// Event Handlers
document.getElementById('end-turn-btn').addEventListener('click', endPlayerTurn);

// Inisialisasi
initGame();
