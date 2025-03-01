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

const ENEMIES = [
    { name: "Goblin", hp: 50, attack: 8, special: 'stealEnergy' },
    { name: "Orc", hp: 80, attack: 12, special: 'breakArmor' },
    { name: "Skeleton Mage", hp: 60, attack: 10, special: 'applyPoison' },
    { name: "Dragon", hp: 120, attack: 15, special: 'applyBurn' }
];

const ALL_CARDS = [
    'Slash', 'Heavy Strike', 'Piercing Shot', 'Poison Dagger', 'Flaming Sword',
    'Backstab', 'Double Slash', 'Thunder Strike', 'Vampiric Bite', 'Explosive Arrow',
    'Blade Dance', 'Bloodletting Slash', 'Crippling Blow', 'Storm Blade', 'Toxic Shot',
    'Block', 'Reinforced Shield', 'Counter Stance', 'Dodge', 'Fortify',
    'Iron Wall', 'Reflective Barrier', 'Adaptive Shield', 'Sacred Blessing', 'Aegis',
    'Adrenaline Rush', 'Weaken', 'Enrage', 'Focus', 'Curse of Fatigue',
    'Bloodlust', 'Rage', 'Slow Time', 'Battle Trance', 'Power Surge',
    'Fireball', 'Ice Spike', 'Chain Lightning', 'Dark Ritual', 'Tornado',
    'Summon Golem', 'Meteor Strike', 'Mind Control', 'Time Warp', 'Necromancy',
    'Gamble', 'Echo', 'Sacrifice', 'Alchemist\'s Brew', 'Steal Essence',
    'Energy Burst', 'Divine Light', 'Explosive Trap', 'Cursed Pact', 'Phantom Step',
    'Dagger Throw', 'Shadow Strike', 'Last Stand', 'Mirror Image', 'Divine Judgment',
    'Soul Drain', 'Lightning Reflex', 'Ethereal Form', 'Blade Storm', 'Blood Pact',
    'Fatal Blow', 'Shield Bash', 'Evasive Maneuver', 'Reckless Charge', 'Frost Nova',
    'Dark Contract', 'Holy Smite', 'Vortex', 'Black Hole', 'Overload',
    'Arcane Blast', 'Lifesteal Slash', 'Whirlwind', 'Tainted Blood', 'Crushing Blow',
    'Curse of Weakness', 'Healing Surge', 'Shadow Veil', 'Arcane Echo', 'Meteor Rain',
    'Unstable Potion', 'Rewind Time', 'Corrupt Ritual', 'Holy Shield', 'Sudden Death',
    'Mind Blast', 'Blood Moon', 'Echo Strike', 'Berserker Mode', 'Soul Link',
    'Arcane Shield', 'Death Mark', 'Lightning Storm', 'Spirit Drain', 'Final Stand'
];

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
    'Piercing Shot': {
        cost: 2,
        type: 'attack',
        effect: (target) => pierceDamage(8, target)
    },
    'Poison Dagger': {
        cost: 1,
        type: 'attack',
        effect: (target) => { dealDamage(4, target); applyStatus(target, { type: 'poison', value: 2, duration: 3 }); }
    },
    'Flaming Sword': {
        cost: 2,
        type: 'attack',
        effect: (target) => { dealDamage(8, target); applyStatus(target, { type: 'burn', value: 3, duration: 2 }); }
    },
    // Defense Cards
    'Block': {
        cost: 1,
        type: 'defense',
        effect: (target) => addArmor(6, target)
    },
    'Reinforced Shield': {
        cost: 2,
        type: 'defense',
        effect: (target) => addArmor(12, target)
    },
    'Dodge': {
        cost: 1,
        type: 'defense',
        effect: (target) => applyStatus(target, { type: 'dodge', duration: 1 })
    }
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

function pierceDamage(amount, target) {
    target.hp = Math.max(target.hp - amount, 0);
    addLog(`${target === gameState.player ? 'Player' : 'Enemy'} took ${amount} piercing damage!`);
    checkDeath();
    return amount;
}

function addArmor(amount, target) {
    target.armor += amount;
    addLog(`${target === gameState.player ? 'Player' : 'Enemy'} gained ${amount} armor!`);
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
function initializeDeck() {
    gameState.player.deck = [
        'Slash', 'Slash', 'Block', 'Dodge',
        'Adrenaline Rush', 'Poison Dagger', 'Fireball'
    ];
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = gameState.player.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.player.deck[i], gameState.player.deck[j]] = [gameState.player.deck[j], gameState.player.deck[i]];
    }
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

function shuffleDiscardPile() {
    gameState.player.deck = [...gameState.player.discardPile];
    gameState.player.discardPile = [];
    shuffleDeck();
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
        const cardData = CARD_EFFECTS[card];
        if(!cardData) return; // Skip kartu yang tidak terdefinisi
        
        const cardElement = document.createElement('div');
        cardElement.className = `card ${cardData.type}`;
        cardElement.innerHTML = `
            <div class="card-cost">${cardData.cost}</div>
            <h3>${card}</h3>
            <div class="card-type">${cardData.type}</div>
        `;
        
        cardElement.onclick = () => {
            if(gameState.isPlayerTurn && gameState.player.energy >= cardData.cost) {
                playCard(card);
            }
        };
        
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
