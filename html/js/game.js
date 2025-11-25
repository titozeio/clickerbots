class Game {
    constructor() {
        this.player = { ...GAME_DATA.player };
        this.currentWaveIndex = 0;
        this.currentEnemyIndex = 0; // Index within the wave
        this.currentEnemy = null;
        this.lastAttackTime = 0;
        this.gameLoopId = null;
        this.isPlaying = false;

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
        this.restartBtn = document.getElementById('restart-btn');

        // New Elements
        this.energonCountEl = document.getElementById('energon-count');
        this.upgradeWeaponBtn = document.getElementById('upgrade-weapon-btn');
        this.weaponCostEl = document.getElementById('weapon-cost');
        this.weaponLevelEl = document.getElementById('weapon-level');
        this.weaponDamageInfoEl = document.getElementById('weapon-damage-info');

        // Bindings
        this.handleEnemyClick = this.handleEnemyClick.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.buyWeaponUpgrade = this.buyWeaponUpgrade.bind(this);
        this.loop = this.loop.bind(this);

        this.init();
    }

    init() {
        this.enemyCard.addEventListener('click', this.handleEnemyClick);
        this.restartBtn.addEventListener('click', this.restartGame);
        this.upgradeWeaponBtn.addEventListener('click', this.buyWeaponUpgrade);
        this.startGame();
    }

    startGame() {
        // Reset Player
        this.player = { ...GAME_DATA.player };
        this.currentWaveIndex = 0;
        this.currentEnemyIndex = 0;

        this.updatePlayerUI();
        this.updateUpgradeUI();

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
        const enemyTypeKey = wave.enemies[this.currentEnemyIndex];
        const enemyTemplate = GAME_DATA.enemyTypes[enemyTypeKey];

        // Deep copy
        this.currentEnemy = JSON.parse(JSON.stringify(enemyTemplate));

        // Update UI
        this.enemyNameEl.textContent = this.currentEnemy.name;
        this.enemyImageEl.src = this.currentEnemy.image;
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

    handleEnemyClick(e) {
        if (!this.isPlaying) return;

        // Damage Enemy
        const damage = this.player.weaponLevel; // 1 damage per level
        this.currentEnemy.hp -= damage;

        this.updateEnemyUI();
        this.triggerHitEffect(e.clientX, e.clientY, damage);
        this.triggerShake();

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

    triggerLevelUpAnimation() {
        // Add active class for text animation
        this.upgradeWeaponBtn.classList.remove('level-up-active');
        void this.upgradeWeaponBtn.offsetWidth; // force reflow
        this.upgradeWeaponBtn.classList.add('level-up-active');

        // Add glow effect
        this.upgradeWeaponBtn.classList.remove('level-up-glow');
        void this.upgradeWeaponBtn.offsetWidth;
        this.upgradeWeaponBtn.classList.add('level-up-glow');

        // Cleanup after animation duration (1.2s)
        setTimeout(() => {
            this.upgradeWeaponBtn.classList.remove('level-up-active');
            this.upgradeWeaponBtn.classList.remove('level-up-glow');
        }, 1200);
    }

    buyWeaponUpgrade() {
        const weaponData = GAME_DATA.upgrades.weapon;
        const cost = Math.floor(weaponData.baseCost * Math.pow(weaponData.costMultiplier, this.player.weaponLevel - 1));

        if (this.player.energon >= cost) {
            this.player.energon -= cost;
            this.player.weaponLevel++;
            // Trigger animation
            this.triggerLevelUpAnimation();
            this.updatePlayerUI();
            this.updateUpgradeUI();
        }
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
        this.player.hp -= this.currentEnemy.damage;
        if (this.player.hp < 0) this.player.hp = 0;

        this.updatePlayerUI();
        this.screenFlash.classList.add('flash-active');
        setTimeout(() => this.screenFlash.classList.remove('flash-active'), 100);

        if (this.player.hp <= 0) {
            this.gameOver(false);
        }
    }

    loop() {
        if (!this.isPlaying) return;

        const now = Date.now();
        const timeSinceAttack = now - this.lastAttackTime;

        // Update Attack Bar
        const attackProgress = Math.min((timeSinceAttack / this.currentEnemy.attackSpeed) * 100, 100);
        this.attackBar.style.width = `${attackProgress}%`;

        // Check Attack
        if (timeSinceAttack >= this.currentEnemy.attackSpeed) {
            this.triggerEnemyAttack();
            this.lastAttackTime = now;
        }

        this.gameLoopId = requestAnimationFrame(this.loop);
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
