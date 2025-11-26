class Game {
    constructor() {
        this.player = { ...GAME_DATA.player };
        this.currentWaveIndex = 0;
        this.currentEnemyIndex = 0; // Index within the wave
        this.currentEnemy = null;
        this.lastAttackTime = 0;
        this.gameLoopId = null;
        this.isPlaying = false;

        // Allies
        this.allies = {}; // { key: { level: 0, lastAttack: 0, ...data } }
        this.allyElements = {}; // { key: { card, hpBar, attackBar, ... } }

        // DOM Elements
        this.enemyNameEl = document.getElementById('enemy-name');
        this.enemyImageEl = document.getElementById('enemy-image');
        this.enemyHpBar = document.getElementById('enemy-hp-fill');
        this.enemyHpText = document.getElementById('enemy-hp-text');
        this.attackBar = document.getElementById('attack-fill');

        this.playerHpBar = document.getElementById('player-hp-fill');
        this.playerHpText = document.getElementById('player-hp-text');

        this.enemyCard = document.getElementById('enemy-card');
        this.screenFlash = document.getElementById('screen-flash');

        this.overlay = document.getElementById('game-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayTitle = document.getElementById('overlay-title');
        this.restartBtn = document.getElementById('restart-btn');

        // Game Info Elements
        this.waveNumEl = document.getElementById('wave-num');
        this.roundNumEl = document.getElementById('round-num');
        this.enemyLevelEl = document.getElementById('enemy-level');

        // New Elements
        this.energonCountEl = document.getElementById('energon-count');
        this.upgradeWeaponBtn = document.getElementById('upgrade-weapon-btn');
        this.weaponCostEl = document.getElementById('weapon-cost');
        this.weaponLevelEl = document.getElementById('weapon-level');
        this.weaponDamageInfoEl = document.getElementById('weapon-damage-info');

        this.alliesContainer = document.getElementById('allies-container');

        // Ally Shop Elements (Bumblebee)
        this.buyBumblebeeBtn = document.getElementById('buy-ally-bumblebee-btn');
        this.bumblebeeCostEl = document.getElementById('ally-bumblebee-cost');
        this.bumblebeeLevelEl = document.getElementById('ally-bumblebee-level');
        this.bumblebeeHpEl = document.getElementById('ally-bumblebee-hp');
        this.bumblebeeDmgEl = document.getElementById('ally-bumblebee-dmg');
        this.bumblebeeSpeedEl = document.getElementById('ally-bumblebee-speed');

        // Bindings
        this.handleEnemyClick = this.handleEnemyClick.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.buyWeaponUpgrade = this.buyWeaponUpgrade.bind(this);
        this.buyBumblebee = this.buyBumblebee.bind(this);
        this.loop = this.loop.bind(this);

        this.init();
    }

    init() {
        this.enemyCard.addEventListener('click', this.handleEnemyClick);
        this.restartBtn.addEventListener('click', this.restartGame);
        this.upgradeWeaponBtn.addEventListener('click', this.buyWeaponUpgrade);
        this.buyBumblebeeBtn.addEventListener('click', this.buyBumblebee);
        this.startGame();
    }

    startGame() {
        // Reset Player
        this.player = { ...GAME_DATA.player };
        this.currentWaveIndex = 0;
        this.currentEnemyIndex = 0;

        // Reset Allies
        this.allies = {};
        this.alliesContainer.innerHTML = '';
        this.allyElements = {};

        this.updatePlayerUI();
        this.updateUpgradeUI();
        this.updateAllyShopUI('bumblebee');

        // Load Enemy
        this.loadCurrentEnemy();

        // State
        this.isPlaying = true;
        this.lastAttackTime = Date.now();

        // Hide Overlay
        this.overlay.classList.remove('active');

        // Start Loop
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
        this.loop();
    }

    loadCurrentEnemy() {
        const wave = GAME_DATA.waves[this.currentWaveIndex];
        const enemyDef = wave.enemies[this.currentEnemyIndex];

        let enemyTypeKey, enemyLevel;

        if (typeof enemyDef === 'string') {
            enemyTypeKey = enemyDef;
            enemyLevel = 1;
        } else {
            enemyTypeKey = enemyDef.type;
            enemyLevel = enemyDef.level;
        }

        const enemyTemplate = GAME_DATA.enemyTypes[enemyTypeKey];

        // Deep copy
        this.currentEnemy = JSON.parse(JSON.stringify(enemyTemplate));

        // Apply Level Multipliers
        if (enemyLevel > 1) {
            const multipliers = GAME_DATA.levelMultipliers;
            const power = enemyLevel - 1;
            this.currentEnemy.hp = Math.floor(this.currentEnemy.hp * Math.pow(multipliers.hp, power));
            this.currentEnemy.maxHp = this.currentEnemy.hp;
            this.currentEnemy.damage = Math.floor(this.currentEnemy.damage * Math.pow(multipliers.damage, power));
            this.currentEnemy.energonReward = Math.floor(this.currentEnemy.energonReward * Math.pow(multipliers.energon, power));
        }
        this.currentEnemy.level = enemyLevel;

        // Update UI
        this.enemyNameEl.textContent = this.currentEnemy.name;
        this.enemyImageEl.src = this.currentEnemy.image;
        this.waveNumEl.textContent = wave.id;
        this.roundNumEl.textContent = this.currentEnemyIndex + 1;
        this.enemyLevelEl.textContent = enemyLevel;

        this.updateEnemyUI();
    }

    updateEnemyUI() {
        const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        this.enemyHpBar.style.width = `${hpPercent}%`;
        this.enemyHpText.textContent = `${Math.ceil(this.currentEnemy.hp)} / ${this.currentEnemy.maxHp}`;
    }

    updatePlayerUI() {
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        this.playerHpBar.style.width = `${hpPercent}%`;
        this.playerHpText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

        this.energonCountEl.textContent = Math.floor(this.player.energon);
    }

    updateUpgradeUI() {
        const weaponData = GAME_DATA.upgrades.weapon;
        // Cost formula: base * (multiplier ^ (level - 1))
        const cost = Math.floor(weaponData.baseCost * Math.pow(weaponData.costMultiplier, this.player.weaponLevel - 1));

        this.weaponCostEl.textContent = cost;
        this.weaponLevelEl.textContent = `Lv ${this.player.weaponLevel}`;

        // Damage Info
        const currentDmg = this.player.weaponLevel;
        const nextDmg = currentDmg + 1;
        this.weaponDamageInfoEl.textContent = `Dmg: ${currentDmg} >> ${nextDmg}`;

        // Disable if not enough money
        if (this.player.energon < cost) {
            this.upgradeWeaponBtn.style.opacity = '0.5';
            this.upgradeWeaponBtn.style.pointerEvents = 'none';
        } else {
            this.upgradeWeaponBtn.style.opacity = '1';
            this.upgradeWeaponBtn.style.pointerEvents = 'all';
        }
    }

    updateAllyShopUI(allyKey) {
        const allyData = GAME_DATA.allies[allyKey];
        const currentAlly = this.allies[allyKey];
        const level = currentAlly ? currentAlly.level : 0;

        // Cost formula
        const cost = Math.floor(allyData.baseCost * Math.pow(allyData.costMultiplier, level));

        // Stats for next level (or current if level 0)
        const nextLevel = level + 1;
        const hp = Math.floor(allyData.baseHp * Math.pow(allyData.hpMultiplier, level));
        const dmg = Math.floor(allyData.baseDamage * Math.pow(allyData.damageMultiplier, level));
        // Attack speed doesn't change with level for now, or maybe it should? User didn't specify, assuming constant or base.
        // User said: "valores para el siguiente nivel". Let's assume HP and DMG scale.

        const nextHp = Math.floor(allyData.baseHp * Math.pow(allyData.hpMultiplier, nextLevel - 1));
        const nextDmg = Math.floor(allyData.baseDamage * Math.pow(allyData.damageMultiplier, nextLevel - 1));

        // Update DOM
        if (allyKey === 'bumblebee') {
            this.bumblebeeCostEl.textContent = cost;
            this.bumblebeeLevelEl.textContent = `Lv ${level}`;
            this.bumblebeeHpEl.textContent = `HP: ${hp} > ${nextHp}`;
            this.bumblebeeDmgEl.textContent = `Dmg: ${dmg} > ${nextDmg}`;
            this.bumblebeeSpeedEl.textContent = `Spd: ${(allyData.baseAttackSpeed / 1000).toFixed(1)}s`;

            if (this.player.energon < cost) {
                this.buyBumblebeeBtn.style.opacity = '0.5';
                this.buyBumblebeeBtn.style.pointerEvents = 'none';
            } else {
                this.buyBumblebeeBtn.style.opacity = '1';
                this.buyBumblebeeBtn.style.pointerEvents = 'all';
            }
        }
    }

    handleEnemyClick(e) {
        if (!this.isPlaying) return;

        // Damage Enemy
        const damage = this.player.weaponLevel; // 1 damage per level
        this.damageEnemy(damage);

        this.triggerHitEffect(e.clientX, e.clientY, damage);
        this.triggerShake();
    }

    damageEnemy(amount) {
        this.currentEnemy.hp -= amount;
        this.updateEnemyUI();

        // Check Death
        if (this.currentEnemy.hp <= 0) {
            this.onEnemyDefeated();
        }
    }

    onEnemyDefeated() {
        // Heal Player (10%)
        const healAmount = this.player.maxHp * 0.1;
        this.player.hp = Math.min(this.player.hp + healAmount, this.player.maxHp);

        // Reward Energon
        const reward = this.currentEnemy.energonReward;
        this.player.energon += reward;

        // Visuals
        this.triggerEnergonCollection(reward);
        this.updatePlayerUI();
        this.updateUpgradeUI();
        this.updateAllyShopUI('bumblebee');

        // Progress
        this.currentEnemyIndex++;
        const currentWave = GAME_DATA.waves[this.currentWaveIndex];

        if (this.currentEnemyIndex >= currentWave.enemies.length) {
            // Wave Complete
            this.currentWaveIndex++;
            this.currentEnemyIndex = 0;

            if (this.currentWaveIndex >= GAME_DATA.waves.length) {
                this.gameOver(true);
                return;
            }
        }

        // Load Next Enemy
        this.loadCurrentEnemy();
        // Reset attack timer for new enemy so they don't hit instantly
        this.lastAttackTime = Date.now();
    }

    triggerLevelUpAnimation(btn) {
        // Add active class for text animation
        btn.classList.remove('level-up-active');
        void btn.offsetWidth; // force reflow
        btn.classList.add('level-up-active');

        // Add glow effect
        btn.classList.remove('level-up-glow');
        void btn.offsetWidth;
        btn.classList.add('level-up-glow');

        // Cleanup after animation duration (1.2s)
        setTimeout(() => {
            btn.classList.remove('level-up-active');
            btn.classList.remove('level-up-glow');
        }, 1200);
    }

    buyWeaponUpgrade() {
        const weaponData = GAME_DATA.upgrades.weapon;
        const cost = Math.floor(weaponData.baseCost * Math.pow(weaponData.costMultiplier, this.player.weaponLevel - 1));

        if (this.player.energon >= cost) {
            this.player.energon -= cost;
            this.player.weaponLevel++;
            // Trigger animation
            this.triggerLevelUpAnimation(this.upgradeWeaponBtn);
            this.updatePlayerUI();
            this.updateUpgradeUI();
            this.updateAllyShopUI('bumblebee'); // Update ally shop too as energon changed
        }
    }

    buyBumblebee() {
        this.buyAlly('bumblebee', this.buyBumblebeeBtn);
    }

    buyAlly(allyKey, btnElement) {
        const allyData = GAME_DATA.allies[allyKey];
        const currentAlly = this.allies[allyKey];
        const level = currentAlly ? currentAlly.level : 0;
        const cost = Math.floor(allyData.baseCost * Math.pow(allyData.costMultiplier, level));

        if (this.player.energon >= cost) {
            this.player.energon -= cost;

            if (!currentAlly) {
                // First purchase
                this.allies[allyKey] = {
                    level: 1,
                    lastAttack: Date.now(),
                    hp: allyData.baseHp, // Current HP (for future use)
                    maxHp: allyData.baseHp,
                    damage: allyData.baseDamage,
                    attackSpeed: allyData.baseAttackSpeed
                };
                this.spawnAllyCard(allyKey);
            } else {
                // Upgrade
                this.allies[allyKey].level++;
                // Update stats
                const newLevel = this.allies[allyKey].level;
                this.allies[allyKey].maxHp = Math.floor(allyData.baseHp * Math.pow(allyData.hpMultiplier, newLevel - 1));
                this.allies[allyKey].damage = Math.floor(allyData.baseDamage * Math.pow(allyData.damageMultiplier, newLevel - 1));
                this.allies[allyKey].hp = this.allies[allyKey].maxHp; // Heal on upgrade? Sure.
            }

            this.triggerLevelUpAnimation(btnElement);
            this.updatePlayerUI();
            this.updateUpgradeUI(); // Update weapon shop as energon changed
            this.updateAllyShopUI(allyKey);
        }
    }

    spawnAllyCard(allyKey) {
        const allyData = GAME_DATA.allies[allyKey];

        const card = document.createElement('div');
        card.className = 'ally-card';
        card.innerHTML = `
            <img src="${allyData.image}" class="ally-image" alt="${allyData.name}">
            <div class="ally-bars">
                <div class="ally-bar-container ally-hp-bar">
                    <div class="bar-fill" style="width: 100%;"></div>
                </div>
                <div class="ally-bar-container ally-attack-bar">
                    <div class="bar-fill" style="width: 0%;"></div>
                </div>
            </div>
        `;

        this.alliesContainer.appendChild(card);

        // Store references
        this.allyElements[allyKey] = {
            card: card,
            hpBar: card.querySelector('.ally-hp-bar .bar-fill'),
            attackBar: card.querySelector('.ally-attack-bar .bar-fill')
        };
    }

    triggerHitEffect(x, y, damage) {
        const hit = document.createElement('div');
        hit.className = 'hit-effect';
        hit.textContent = `-${damage}`;
        hit.style.left = `${x}px`;
        hit.style.top = `${y}px`;
        document.body.appendChild(hit);
        setTimeout(() => hit.remove(), 500);
    }

    triggerShake() {
        this.enemyCard.classList.remove('shake');
        void this.enemyCard.offsetWidth;
        this.enemyCard.classList.add('shake');
    }

    triggerEnergonCollection(amount) {
        // Spawn flying cubes
        const rect = this.enemyImageEl.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        const targetRect = this.energonCountEl.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        for (let i = 0; i < 5; i++) {
            const energon = document.createElement('div');
            energon.className = 'flying-energon';

            // Randomize start slightly
            const randX = (Math.random() - 0.5) * 50;
            const randY = (Math.random() - 0.5) * 50;

            energon.style.left = `${startX + randX}px`;
            energon.style.top = `${startY + randY}px`;
            energon.style.transform = 'scale(3)'; // Empezar con tamaño triple

            document.body.appendChild(energon);

            // Animate
            setTimeout(() => {
                energon.style.transform = `translate(${targetX - startX - randX}px, ${targetY - startY - randY}px) scale(0.5)`;
                energon.style.opacity = '0';
            }, 50 + (i * 100));

            setTimeout(() => energon.remove(), 1200);
        }
    }

    triggerEnemyAttack() {
        // Trigger Enemy Animation
        this.enemyCard.classList.add('enemy-attacking');
        setTimeout(() => this.enemyCard.classList.remove('enemy-attacking'), 300);

        // Delay damage to match impact (approx 150ms)
        setTimeout(() => {
            if (!this.isPlaying) return;

            this.player.hp -= this.currentEnemy.damage;
            if (this.player.hp < 0) this.player.hp = 0;

            this.updatePlayerUI();

            // Player Hit Feedback
            const playerSection = document.querySelector('.player-section');
            if (playerSection) {
                playerSection.classList.remove('player-hit');
                void playerSection.offsetWidth;
                playerSection.classList.add('player-hit');
                setTimeout(() => playerSection.classList.remove('player-hit'), 400);
            }

            this.screenFlash.classList.add('flash-active');
            setTimeout(() => this.screenFlash.classList.remove('flash-active'), 100);

            if (this.player.hp <= 0) {
                this.gameOver(false);
            }
        }, 150);
    }

    loop() {
        if (!this.isPlaying) return;

        const now = Date.now();
        const timeSinceAttack = now - this.lastAttackTime;

        // Update Attack Bar
        const attackProgress = Math.min((timeSinceAttack / this.currentEnemy.attackSpeed) * 100, 100);
        this.attackBar.style.width = `${attackProgress}%`;

        // Check Enemy Attack
        if (timeSinceAttack >= this.currentEnemy.attackSpeed) {
            this.triggerEnemyAttack();
            this.lastAttackTime = now;
        }

        // Handle Allies
        for (const [key, ally] of Object.entries(this.allies)) {
            const timeSinceAllyAttack = now - ally.lastAttack;
            const allyElements = this.allyElements[key];

            // Update Ally Attack Bar
            const allyAttackProgress = Math.min((timeSinceAllyAttack / ally.attackSpeed) * 100, 100);
            if (allyElements) {
                allyElements.attackBar.style.width = `${allyAttackProgress}%`;
            }

            // Check Ally Attack
            if (timeSinceAllyAttack >= ally.attackSpeed) {
                ally.lastAttack = now;

                // Trigger Ally Animation
                if (allyElements && allyElements.card) {
                    const card = allyElements.card;
                    card.classList.remove('attacking');
                    void card.offsetWidth; // Force reflow
                    card.classList.add('attacking');

                    setTimeout(() => {
                        card.classList.remove('attacking');
                    }, 250);
                }

                // Schedule Hit at peak (125ms)
                setTimeout(() => {
                    if (!this.isPlaying) return;

                    this.damageEnemy(ally.damage);
                    this.triggerShake();

                    // Visual feedback
                    const rect = this.enemyCard.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    // Random offset
                    const offX = (Math.random() - 0.5) * 60;
                    const offY = (Math.random() - 0.5) * 60;

                    this.triggerHitEffect(centerX + offX, centerY + offY, ally.damage);
                    this.triggerComicHit(centerX + offX, centerY + offY);
                }, 125);
            }
        }

        this.gameLoopId = requestAnimationFrame(this.loop);
    }

    triggerComicHit(x, y) {
        const hit = document.createElement('div');
        hit.className = 'comic-hit';
        hit.style.left = `${x}px`;
        hit.style.top = `${y}px`;
        document.body.appendChild(hit);
        setTimeout(() => hit.remove(), 200);
    }

    gameOver(win) {
        this.isPlaying = false;
        cancelAnimationFrame(this.gameLoopId);

        this.overlayTitle.textContent = win ? "SECTOR CLEARED!" : "SYSTEM FAILURE";
        this.overlayTitle.className = "message-title " + (win ? "win-text" : "lose-text");
        this.overlay.classList.add('active');
    }

    restartGame() {
        this.startGame();
    }
}

// Start Game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
