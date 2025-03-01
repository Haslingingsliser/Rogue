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
    turn: 0,
    log: []
};

const ENEMIES = [
    { name: "Goblin", hp: 50, attack: 8, special: 'stealEnergy' },
    { name: "Orc", hp: 80, attack: 12, special: 'breakArmor' },
    { name: "Skeleton Mage", hp: 60, attack: 10, special: 'applyPoison' },
    { name: "Dragon", hp: 120, attack: 15, special: 'applyBurn' }
];

const CARD_EFFECTS = {
    // Attack Cards
    'Slash': { cost: 1, type: 'attack', effect: (t) => dealDamage(6, t) },
    'Heavy Strike': { cost: 2, type: 'attack', effect: (t) => dealDamage(12, t) },
    'Piercing Shot': { cost: 2, type: 'attack', effect: (t) => pierceDamage(8, t) },
    'Poison Dagger': { cost: 1, type: 'attack', effect: (t) => { dealDamage(4, t); addStatus(t, 'poison', 2, 3); }},
    'Flaming Sword': { cost: 2, type: 'attack', effect: (t) => { dealDamage(8, t); addStatus(t, 'burn', 3, 2); }},
    'Backstab': { cost: 1, type: 'attack', effect: (t) => gameState.turn === 0 ? dealDamage(10, t) : dealDamage(3, t) },
    'Double Slash': { cost: 2, type: 'attack', effect: (t) => { dealDamage(4, t); dealDamage(4, t); }},
    'Thunder Strike': { cost: 3, type: 'attack', effect: (t) => dealAoeDamage(6) },
    'Vampiric Bite': { cost: 2, type: 'attack', effect: (t) => { const dmg = dealDamage(5, t); heal(Math.floor(dmg/2)); }},
    'Explosive Arrow': { cost: 2, type: 'attack', effect: (t) => { dealDamage(7, t); dealAoeDamage(3); }},
    
    // Defense Cards
    'Block': { cost: 1, type: 'defense', effect: (u) => addArmor(6, u) },
    'Reinforced Shield': { cost: 2, type: 'defense', effect: (u) => addArmor(12, u) },
    'Counter Stance': { cost: 2, type: 'defense', effect: (u) => { addStatus(u, 'counter', 5, 1); addArmor(5, u); }},
    
    // Buff/Debuff Cards
    'Adrenaline Rush': { cost: 0, type: 'buff', effect: (u) => gainEnergy(2) },
    'Weaken': { cost: 1, type: 'debuff', effect: (t) => addStatus(t, 'weak', 3, 2) },
    
    // Magic Cards
    'Fireball': { cost: 3, type: 'magic', effect: (t) => dealAoeDamage(10) },
    'Ice Spike': { cost: 2, type: 'magic', effect: (t) => { dealDamage(6, t); addStatus(t, 'freeze', 1, 1); }},
    
    // ... (Tambahkan semua kartu lainnya di sini)
};

// Core Game Functions
function dealDamage(amount, target) {
    let finalDmg = amount;
    if(target.armor > 0) {
        const armorDamage = Math.min(target.armor, finalDmg);
        target.armor -= armorDamage;
        finalDmg -= armorDamage;
    }
    target.hp = Math.max(target.hp - finalDmg, 0);
    addToLog(`Dealt ${finalDmg} damage to ${target === gameState.player ? 'player' : 'enemy'}`);
    checkDeath();
    return finalDmg;
}

function addArmor(amount, target) {
    target.armor += amount;
    addToLog(`Gained ${amount} armor`);
}

function addStatus(target, type, value, duration) {
    target.statusEffects.push({ type, value, duration });
    addToLog(`${type.charAt(0).toUpperCase() + type.slice(1)} applied`);
}

function processStatusEffects() {
    processEntityStatus(gameState.player);
    processEntityStatus(gameState.currentEnemy);
}

function processEntityStatus(entity) {
    entity.statusEffects = entity.statusEffects.filter(effect => {
        effect.duration--;
        
        switch(effect.type) {
            case 'poison':
                dealDamage(effect.value, entity);
                break;
            case 'burn':
                dealDamage(effect.value, entity);
                break;
            case 'stun':
                if(effect.duration === 0) addToLog("Stun wore off");
                return effect.duration > 0;
        }
        
        return effect.duration > 0;
    });
}

// Enemy AI
function enemyTurn() {
    addToLog("Enemy's turn");
    
    // Simple attack
    const baseDmg = gameState.currentEnemy.attack;
    dealDamage(baseDmg, gameState.player);
    
    // Special ability
    if(Math.random() < 0.3) {
        switch(gameState.currentEnemy.special) {
            case 'stealEnergy':
                gameState.player.energy = Math.max(gameState.player.energy - 1, 0);
                addToLog("Enemy stole 1 energy");
                break;
            case 'applyPoison':
                addStatus(gameState.player, 'poison', 2, 3);
                break;
        }
    }
    
    endTurn();
}

// Turn System
function endTurn() {
    gameState.turn++;
    gameState.player.energy = 3;
    processStatusEffects();
    drawHand();
    updateUI();
}

// Deck Management
function drawHand() {
    while(gameState.player.hand.length < 5 && gameState.player.deck.length > 0) {
        gameState.player.hand.push(gameState.player.deck.pop());
    }
}

function shuffleDeck() {
    gameState.player.deck = gameState.player.deck
        .concat(gameState.player.discardPile)
        .sort(() => Math.random() - 0.5);
    gameState.player.discardPile = [];
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
    
    // Render hand
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
        cardElement.onclick = () => {
            if(gameState.player.energy >= CARD_EFFECTS[card].cost) {
                CARD_EFFECTS[card].effect(gameState.currentEnemy);
                gameState.player.energy -= CARD_EFFECTS[card].cost;
                gameState.player.hand.splice(gameState.player.hand.indexOf(card), 1);
                gameState.player.discardPile.push(card);
                updateUI();
            }
        };
        handElement.appendChild(cardElement);
    });
}

function addToLog(message) {
    const logElement = document.getElementById('log');
    gameState.log.push(message);
    logElement.innerHTML = gameState.log.slice(-10).join('<br>');
    logElement.scrollTop = logElement.scrollHeight;
}

// Initialization
function initGame() {
    gameState.player.deck = [
        'Slash', 'Slash', 'Block', 'Adrenaline Rush',
        'Poison Dagger', 'Fireball', 'Reinforced Shield'
    ];
    shuffleDeck();
    spawnEnemy();
    drawHand();
    updateUI();
}

function spawnEnemy() {
    const enemyTemplate = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    gameState.currentEnemy = {
        ...enemyTemplate,
        hp: enemyTemplate.hp * gameState.stage,
        armor: 0,
        statusEffects: []
    };
}

// Start Game
initGame();
