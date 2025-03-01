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
        statusEffects: []
    },
    currentEnemy: null,
    isPlayerTurn: true,
    log: []
};

const ENEMIES = [
    { name: "Goblin", hp: 50, attack: 8, special: 'stealEnergy' },
    { name: "Orc", hp: 80, attack: 12, special: 'breakArmor' },
    { name: "Skeleton Mage", hp: 60, attack: 10, special: 'applyPoison' },
    { name: "Dragon", hp: 120, attack: 15, special: 'applyBurn' }
];

const ALL_CARDS = [/* List of 100 card names */];

// Initialize Game
function initGame() {
    initializeDeck();
    spawnEnemy();
    startPlayerTurn();
    updateUI();
}

// Card System
const CARD_EFFECTS = {
    // Attack Cards
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
    // ... Add all other cards
};

// Battle System
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
    return finalDamage;
}

function applyStatus(target, status) {
    target.statusEffects.push(status);
    addLog(`${status.type} applied!`);
}

// Turn System
function startPlayerTurn() {
    gameState.isPlayerTurn = true;
    gameState.player.energy = 3;
    drawCards(3);
    processStatusEffects();
    updateUI();
}

function endPlayerTurn() {
    if(!gameState.isPlayerTurn) return;
    
    gameState.isPlayerTurn = false;
    discardHand();
    startEnemyTurn();
}

function startEnemyTurn() {
    const enemy = gameState.currentEnemy;
    const baseDamage = enemy.attack;
    
    // Enemy attack
    dealDamage(baseDamage, gameState.player);
    
    // Special ability
    if(Math.random() < 0.3) {
        switch(enemy.special) {
            case 'stealEnergy':
                gameState.player.energy = Math.max(gameState.player.energy - 1, 0);
                addLog('Enemy stole 1 energy!');
                break;
            case 'applyPoison':
                applyStatus(gameState.player, { type: 'poison', value: 2, duration: 3 });
                break;
        }
    }
    
    checkPlayerDeath();
    startPlayerTurn();
}

// Deck Management
function drawCards(amount) {
    for(let i = 0; i < amount; i++) {
        if(gameState.player.hand.length >= 5) break;
        if(gameState.player.deck.length === 0) shuffleDiscardPile();
        gameState.player.hand.push(gameState.player.deck.pop());
    }
}

function discardHand() {
    gameState.player.discardPile.push(...gameState.player.hand);
    gameState.player.hand = [];
}

// Stage System
function advanceStage() {
    gameState.stage++;
    showCardReward();
    spawnEnemy();
    updateUI();
}

function showCardReward() {
    const rewards = getRandomCards(3);
    const modal = document.getElementById('reward-modal');
    const cardsDiv = document.getElementById('reward-cards');
    
    cardsDiv.innerHTML = '';
    rewards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = card;
        cardElement.onclick = () => {
            gameState.player.deck.push(card);
            modal.style.display = 'none';
            startPlayerTurn();
        };
        cardsDiv.appendChild(cardElement);
    });
    
    modal.style.display = 'flex';
}

// UI Functions
function updateUI() {
    // Update player stats
    document.getElementById('player-hp').textContent = gameState.player.hp;
    document.getElementById('player-energy').textContent = gameState.player.energy;
    document.getElementById('player-armor').textContent = gameState.player.armor;
    
    // Update enemy stats
    document.getElementById('enemy-hp').textContent = gameState.currentEnemy.hp;
    document.getElementById('enemy-armor').textContent = gameState.currentEnemy.armor;
    
    // Update hand
    const handDiv = document.getElementById('hand');
    handDiv.innerHTML = '';
    
    gameState.player.hand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${CARD_EFFECTS[card].type}`;
        cardElement.innerHTML = `
            <div class="card-cost">${CARD_EFFECTS[card].cost}</div>
            <h3>${card}</h3>
        `;
        cardElement.onclick = () => playCard(card);
        handDiv.appendChild(cardElement);
    });
}

function addLog(message) {
    const logDiv = document.getElementById('log');
    logDiv.innerHTML += `<div>${message}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Initialize
document.getElementById('end-turn').addEventListener('click', endPlayerTurn);
initGame();
