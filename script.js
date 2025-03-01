// Inisialisasi Game
let gameState = {
    stage: 1,
    player: {
        hp: 100,
        maxHP: 100,
        energy: 3,
        armor: 0,
        deck: [],
        hand: [],
        statusEffects: [],
        discardPile: []
    },
    currentEnemy: null,
    turn: 0,
    log: []
};

const ENEMIES = [
    { name: "Goblin", hp: 50, attack: 8, special: 'Steal 1 energy' },
    { name: "Orc", hp: 80, attack: 12, special: 'Break 5 armor' },
    { name: "Skeleton Mage", hp: 60, attack: 10, special: 'Apply 2 poison' },
    { name: "Dragon", hp: 120, attack: 15, special: 'Burn for 3 turns' }
];

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
    // ... Tambahkan semua kartu lainnya dengan pola yang sama
};

// Fungsi Utama
function initGame() {
    initializePlayerDeck();
    spawnEnemy();
    drawHand();
    updateUI();
}

function initializePlayerDeck() {
    gameState.player.deck = [
        'Slash', 'Slash', 'Heavy Strike', 'Block',
        'Poison Dagger', 'Fireball', 'Dodge', 'Adrenaline Rush'
    ];
    shuffleDeck();
}

function spawnEnemy() {
    const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    gameState.currentEnemy = {
        ...enemy,
        hp: enemy.hp + (gameState.stage * 5),
        armor: 0,
        statusEffects: []
    };
}

// Sistem Pertarungan
function playCard(cardName, target) {
    const card = CARD_EFFECTS[cardName];
    if (gameState.player.energy < card.cost) return;
    
    gameState.player.energy -= card.cost;
    card.effect(target);
    
    // Pindahkan kartu ke discard pile
    const index = gameState.player.hand.indexOf(cardName);
    gameState.player.hand.splice(index, 1);
    gameState.player.discardPile.push(cardName);
    
    updateUI();
    enemyTurn();
}

function enemyTurn() {
    // Logika AI musuh sederhana
    setTimeout(() => {
        const baseDamage = gameState.currentEnemy.attack;
        dealDamageToPlayer(baseDamage);
        applyEnemySpecial();
        endTurn();
    }, 1000);
}

// Update UI
function updateUI() {
    // Update player
    document.getElementById('player-hp').textContent = gameState.player.hp;
    document.getElementById('player-energy').textContent = gameState.player.energy;
    document.getElementById('player-armor').textContent = gameState.player.armor;
    
    // Update enemy
    document.getElementById('enemy-hp').textContent = gameState.currentEnemy.hp;
    document.getElementById('enemy-armor').textContent = gameState.currentEnemy.armor;
    
    // Update hand
    const handElement = document.getElementById('hand');
    handElement.innerHTML = '';
    gameState.player.hand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${CARD_EFFECTS[card].type}`;
        cardElement.innerHTML = `
            <div class="card-cost">${CARD_EFFECTS[card].cost}</div>
            <h3>${card}</h3>
            <div class="card-type">${CARD_EFFECTS[card].type}</div>
        `;
        cardElement.onclick = () => playCard(card, gameState.currentEnemy);
        handElement.appendChild(cardElement);
    });
}

// Mulai game
initGame();
