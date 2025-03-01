// Game State Management
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

// Musuh dan Kartu
const ENEMIES = [
    { name: "Goblin", hp: 50, attack: 8, special: 'stealEnergy' },
    { name: "Orc", hp: 80, attack: 12, special: 'breakArmor' }
];

const CARD_EFFECTS = {
    // Attack Cards
    'Slash': { cost: 1, type: 'attack', effect: (t) => dealDamage(6, t) },
    'Heavy Strike': { cost: 2, type: 'attack', effect: (t) => dealDamage(12, t) },
    'Block': { cost: 1, type: 'defense', effect: (u) => addArmor(6, u) },
    'Dodge': { cost: 1, type: 'defense', effect: (u) => addStatus(u, 'dodge', 1, 1) }
};

// Core Game Functions
function initGame() {
    // Inisialisasi Deck
    gameState.player.deck = ['Slash', 'Slash', 'Block', 'Dodge', 'Heavy Strike'];
    shuffleDeck();
    
    // Spawn musuh pertama
    spawnEnemy();
    
    // Mulai game
    startPlayerTurn();
    updateUI();
}

function spawnEnemy() {
    const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    gameState.currentEnemy = {
        ...enemy,
        hp: enemy.hp,
        armor: 0,
        statusEffects: []
    };
}

// Sistem Damage
function dealDamage(amount, target) {
    let finalDamage = amount;
    const armor = target === gameState.player ? gameState.player.armor : gameState.currentEnemy.armor;
    
    if(armor > 0) {
        const armorDamage = Math.min(armor, finalDamage);
        finalDamage -= armorDamage;
        target.armor -= armorDamage;
    }
    
    target.hp = Math.max(target.hp - finalDamage, 0);
    addLog(`${target === gameState.player ? 'Player' : 'Enemy'} took ${finalDamage} damage!`);
    
    checkDeath();
}

// Sistem Armor
function addArmor(amount, target) {
    target.armor += amount;
    addLog(`${target === gameState.player ? 'Player' : 'Enemy'} gained ${amount} armor!`);
}

// Sistem Turn
function startPlayerTurn() {
    gameState.isPlayerTurn = true;
    gameState.player.energy = 3;
    drawCards(3);
    updateUI();
}

function endPlayerTurn() {
    gameState.isPlayerTurn = false;
    discardHand();
    startEnemyTurn();
}

function startEnemyTurn() {
    const enemy = gameState.currentEnemy;
    
    // Serangan dasar musuh
    setTimeout(() => {
        dealDamage(enemy.attack, gameState.player);
        checkPlayerDeath();
        startPlayerTurn();
    }, 1000);
}

// Deck Management
function shuffleDeck() {
    for (let i = gameState.player.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.player.deck[i], gameState.player.deck[j]] = [gameState.player.deck[j], gameState.player.deck[i]];
    }
}

function drawCards(amount) {
    for(let i = 0; i < amount; i++) {
        if(gameState.player.hand.length >= 5) break;
        if(gameState.player.deck.length === 0) shuffleDiscardPile();
        gameState.player.hand.push(gameState.player.deck.pop());
    }
}

// UI Controller
function updateUI() {
    // Player stats
    document.getElementById('player-hp').textContent = gameState.player.hp;
    document.getElementById('player-energy').textContent = gameState.player.energy;
    document.getElementById('player-armor').textContent = gameState.player.armor;
    
    // Enemy stats
    document.getElementById('enemy-hp').textContent = gameState.currentEnemy.hp;
    document.getElementById('enemy-armor').textContent = gameState.currentEnemy.armor;
    
    // Render hand
    const handDiv = document.getElementById('hand');
    handDiv.innerHTML = '';
    
    gameState.player.hand.forEach(card => {
        const cardData = CARD_EFFECTS[card];
        const cardElement = document.createElement('div');
        cardElement.className = `card ${cardData.type}`;
        cardElement.innerHTML = `
            <div class="card-cost">${cardData.cost}</div>
            <h3>${card}</h3>
            <div class="card-type">${cardData.type}</div>
        `;
        cardElement.onclick = () => playCard(card);
        handDiv.appendChild(cardElement);
    });
}

// Event Listeners
document.getElementById('end-turn').addEventListener('click', endPlayerTurn);

// Start Game
initGame();
