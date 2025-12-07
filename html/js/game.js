class Game {
    constructor() {
        this.player = { ...GAME_DATA.player };
        this.currentWaveIndex = 0;
        this.currentEnemyIndex = 0; // Index within the wave
        this.currentEnemy = null;
        this.lastAttackTime = 0;
        this.lastFrameTime = 0;
        this.gameLoopId = null;
        this.isPlaying = false;
        this.isBossSpawning = false;
        this.isWaveTransitioning = false;


        // Allies
        this.allies = {}; // { key: { level: 0, lastAttack: 0, skillCooldown: 0, skillActive: false, skillTimer: 0, ...data } }
        this.allyElements = {}; // { key: { card, hpBar, attackBar, image, ... } }

        // Audio
        this.sounds = {
            playerAttack: new Audio('assets/sfx/player_attack.wav'),
            allyAttack: new Audio('assets/sfx/ally_attack.wav'),
            enemyAttack: new Audio('assets/sfx/enemy_attack.wav'),
            bossAttack: new Audio('assets/sfx/boss_attack.wav')
        };
        // Volume
        this.sounds.playerAttack.volume = 0.4;
        this.sounds.allyAttack.volume = 0.3;
        this.sounds.enemyAttack.volume = 0.35;
        this.sounds.bossAttack.volume = 0.5;


        // DOM Elements
        this.enemyNameEl = document.getElementById('enemy-name');
        this.enemyImageEl = document.getElementById('enemy-image');
        this.cardFrameEl = document.getElementById('card-frame');
        this.enemyHpBar = document.getElementById('enemy-hp-fill');
        this.enemyHpText = document.getElementById('enemy-hp-text');
        this.attackBar = document.getElementById('attack-fill');

        this.playerHpBar = document.getElementById('player-hp-fill');
        this.playerHpText = document.getElementById('player-hp-text');

        this.enemyCard = document.getElementById('enemy-card');
        this.screenFlash = document.getElementById('screen-flash');
        this.bossWarningOverlay = document.getElementById('boss-warning-overlay');
        this.waveCompleteOverlay = document.getElementById('wave-complete-overlay');


        this.overlay = document.getElementById('game-overlay');
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
        this.weaponUpgradeIcon = document.getElementById('weapon-upgrade-icon');
        this.weaponNameEl = document.getElementById('upgrade-name');

        this.alliesContainer = document.getElementById('allies-container');

        // Dynamic Ally Shop Elements
        this.allyUpgradesList = document.getElementById('ally-upgrades-list');
        this.allyShopElements = {}; // Stores references to shop UI elements for each ally

        // Bindings
        this.handleEnemyClick = this.handleEnemyClick.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.buyWeaponUpgrade = this.buyWeaponUpgrade.bind(this);
        // this.buyAlly = this.buyAlly.bind(this); // Handled differently now

        this.loop = this.loop.bind(this);
        this.playSound = this.playSound.bind(this);

        this.init();
    }

    formatNumberAbbrev(num) {
        if (num < 1000) return Math.floor(num).toString();
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const tier = Math.floor(Math.log10(num) / 3);
        const suffix = tier < suffixes.length ? suffixes[tier] : 'E' + (tier * 3);
        const scaled = num / Math.pow(10, tier * 3);
        let formatted = scaled.toFixed(2).replace('.', ',');
        formatted = formatted.replace(',00', '').replace(/,(\d)0$/, ',$1');
        return formatted + suffix;
    }

    playSound(key) {
        const sound = this.sounds[key];
        if (sound) {
            // Clone node to allow overlapping sounds (rapid fire)
            const clone = sound.cloneNode();
            clone.volume = sound.volume;
            clone.play().catch(e => console.log("Audio play prevented:", e));
        }
    }


    init() {
        this.enemyCard.addEventListener('click', this.handleEnemyClick);
        this.restartBtn.addEventListener('click', this.restartGame);
        this.upgradeWeaponBtn.addEventListener('click', this.buyWeaponUpgrade);

        this.renderAllyUpgrades();
        this.startGame();
    }

    renderAllyUpgrades() {
        this.allyUpgradesList.innerHTML = '';
        this.allyShopElements = {};

        for (const [key, data] of Object.entries(GAME_DATA.allies)) {
            const btn = document.createElement('div'); // Div container instead of button to handle internal clicks
            btn.className = 'bot-upgrade';
            btn.id = `buy-ally-${key}-block`;

            // Prepare Skill Info text
            let skillName = "None";
            let skillDur = "0s";
            let skillCD = "0s";
            let skillDesc = "No skill available.";

            if (data.skill) {
                skillName = data.skill.name;
                skillDur = (data.skill.duration / 1000) + 's';

                // Cooldown: convert to seconds. 
                skillCD = (data.skill.cooldown / 1000) + 's';

                // Parse description for params
                let desc = data.skill.description;
                if (data.skill.param1) desc = desc.replace('%%Param1%%', data.skill.param1 + '%');
                // Extend for other params if needed
                skillDesc = desc;
            }


            btn.innerHTML = `
                <div class="upgrade-header">
                    <img src="${data.image}" class="bot-upgrade-image" alt="${data.name}">
                    <div class="upgrade-name-level">
                        <div class="upgrade-name">${data.name}</div>
                        <div class="upgrade-level">Lv 0</div>
                    </div>
                    
                    <!-- Restored Header Info -->
                    <div class="weapon-damage">
                        <div class="weapon-damage-label">HP</div>
                        <div class="weapon-damage-value hp-header">0</div>
                    </div>
                    <div class="weapon-speed">
                        <div class="weapon-speed-label">DMG</div>
                        <div class="weapon-speed-value dmg-header">0</div>
                    </div>
                    <div class="weapon-next">
                        <div class="next-label">Spd</div>
                        <div class="next-damage spd-header">0s</div>
                    </div>
                    <div class="upgrade-cost">
                        <img src="assets/icons/energon.png" class="upgrade-cost-icon" alt="Cost">
                        <span class="cost-amount cost-header">0</span>
                    </div>
                </div>

                <div class="upgrade-expanded-container">
                    <div class="upgrade-details-row">
                        <div class="upgrade-stats-block">
                             <div class="stat-row">Current DPS: <span class="stat-highlight dps-current">0</span></div>
                             <div class="stat-row">Next: <span class="stat-highlight dmg-next">0</span>, Speed <span class="stat-highlight spd-next">0s</span></div>
                        </div>
                        <div class="level-buttons">
                             <button class="lvl-btn btn-1x">
                                 +1
                                 <span class="btn-cost cost-1x">0</span>
                             </button>
                             <button class="lvl-btn btn-10x">
                                 +10
                                 <span class="btn-cost cost-10x">0</span>
                             </button>
                        </div>
                    </div>
                    <div class="skill-info-block">
                        <div class="skill-title">Transformation: ${skillName}</div>
                        <div class="skill-meta">Duration: ${skillDur} | Cooldown: ${skillCD}</div>
                        <div class="skill-desc">${skillDesc}</div>
                    </div>
                </div>
            `;

            // Handle Expand/Collapse
            btn.addEventListener('click', (e) => {
                // If clicked on buttons, don't toggle
                if (e.target.closest('.lvl-btn')) return;

                // Toggle expansion
                if (btn.classList.contains('expanded')) {
                    btn.classList.remove('expanded');
                } else {
                    // Collapse others? Optional, but cleaner.
                    document.querySelectorAll('.bot-upgrade.expanded').forEach(el => el.classList.remove('expanded'));
                    btn.classList.add('expanded');
                }
            });

            // Bind Buttons
            const btn1x = btn.querySelector('.btn-1x');
            const btn10x = btn.querySelector('.btn-10x');

            btn1x.addEventListener('click', (e) => {
                e.stopPropagation();
                this.buyAlly(key, 1);
            });

            btn10x.addEventListener('click', (e) => {
                e.stopPropagation();
                this.buyAlly(key, 10);
            });

            this.allyUpgradesList.appendChild(btn);

            // Store references
            this.allyShopElements[key] = {
                container: btn,
                level: btn.querySelector('.upgrade-level'),

                // Header Elements
                hpHeader: btn.querySelector('.hp-header'),
                dmgHeader: btn.querySelector('.dmg-header'),
                spdHeader: btn.querySelector('.spd-header'),
                costHeader: btn.querySelector('.cost-header'),

                // Expanded Elements
                dpsCurrent: btn.querySelector('.dps-current'),
                dmgNext: btn.querySelector('.dmg-next'),
                spdNext: btn.querySelector('.spd-next'),
                cost1x: btn.querySelector('.cost-1x'),
                cost10x: btn.querySelector('.cost-10x'),
                btn1x: btn1x,
                btn10x: btn10x
            };
        }
    }

    startGame() {
        // Reset Player
        this.player = { ...GAME_DATA.player };
        this.currentWaveIndex = 0;
        this.currentEnemyIndex = 0;

        // Reset flags
        this.isBossSpawning = false;
        this.isWaveTransitioning = false;

        // Reset Allies
        this.allies = {};
        this.alliesContainer.innerHTML = '';
        this.allyElements = {};

        this.updatePlayerUI();
        this.updateUpgradeUI();

        // Update all ally shop UIs
        Object.keys(GAME_DATA.allies).forEach(key => {
            this.updateAllyShopUI(key);
        });

        // Load Enemy
        this.loadCurrentEnemy();

        // State
        this.isPlaying = true;
        this.lastAttackTime = Date.now();
        this.lastFrameTime = Date.now();

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

        // Update card frame based on enemy level (1-6)
        const frameLevel = Math.min(enemyLevel, 6); // Cap at level 6
        this.cardFrameEl.src = `assets/frames/card frame ${frameLevel}.png`;

        this.waveNumEl.textContent = wave.id;
        this.roundNumEl.textContent = this.currentEnemyIndex + 1;
        this.enemyLevelEl.textContent = enemyLevel;

        this.updateEnemyUI();
    }

    updateEnemyUI() {
        const hpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        this.enemyHpBar.style.width = `${hpPercent}%`;
        this.enemyHpText.textContent = `${this.formatNumberAbbrev(Math.ceil(this.currentEnemy.hp))} / ${this.formatNumberAbbrev(this.currentEnemy.maxHp)}`;
    }

    updatePlayerUI() {
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        this.playerHpBar.style.width = `${hpPercent}%`;
        this.playerHpText.textContent = `${this.formatNumberAbbrev(Math.ceil(this.player.hp))} / ${this.formatNumberAbbrev(this.player.maxHp)}`;

        this.energonCountEl.textContent = this.formatNumberAbbrev(Math.floor(this.player.energon));
    }

    updateUpgradeUI() {
        const weaponData = GAME_DATA.upgrades.weapon;
        this.weaponUpgradeIcon.src = weaponData.image;
        this.weaponNameEl.textContent = weaponData.name;
        // Cost formula: base * (multiplier ^ (level - 1))
        const cost = Math.floor(weaponData.baseCost * Math.pow(weaponData.costMultiplier, this.player.weaponLevel - 1));

        this.weaponCostEl.textContent = this.formatNumberAbbrev(cost);
        this.weaponLevelEl.textContent = `Lv ${this.player.weaponLevel}`;

        // Damage Info
        const currentDmg = this.player.weaponLevel;
        const nextDmg = currentDmg + 1;
        this.weaponDamageInfoEl.textContent = this.formatNumberAbbrev(currentDmg);

        // Disable if not enough money
        if (this.player.energon < cost) {
            this.upgradeWeaponBtn.style.opacity = '0.5';
            this.upgradeWeaponBtn.style.pointerEvents = 'none';
        } else {
            this.upgradeWeaponBtn.style.opacity = '1';
            this.upgradeWeaponBtn.style.pointerEvents = 'all';
        }
    }

    // New helper to calculate cost for N levels
    calculateBulkCost(allyData, startLevel, count) {
        let totalCost = 0;
        for (let i = 0; i < count; i++) {
            totalCost += Math.floor(allyData.baseCost * Math.pow(allyData.costMultiplier, startLevel + i));
        }
        return totalCost;
    }

    updateAllyShopUI(allyKey) {
        const allyData = GAME_DATA.allies[allyKey];
        const currentAlly = this.allies[allyKey];
        const level = currentAlly ? currentAlly.level : 0;
        const elements = this.allyShopElements[allyKey];

        if (!elements) return;

        // Calculate Costs
        const cost1x = this.calculateBulkCost(allyData, level, 1);
        const cost10x = this.calculateBulkCost(allyData, level, 10);

        // Update Stats (Next Level)
        const nextLevel = level + 1;
        const nextHp = Math.floor(allyData.baseHp * Math.pow(allyData.hpMultiplier, nextLevel - 1));
        const nextDmg = Math.floor(allyData.baseDamage * Math.pow(allyData.damageMultiplier, nextLevel - 1)) + (nextLevel - 1);
        const nextSpeed = allyData.baseAttackSpeed / 1000;

        // Update Header (Showing "Next" stats)
        elements.level.textContent = `Lv ${level}`;
        if (elements.hpHeader) elements.hpHeader.textContent = this.formatNumberAbbrev(nextHp);
        if (elements.dmgHeader) elements.dmgHeader.textContent = this.formatNumberAbbrev(nextDmg);
        if (elements.spdHeader) elements.spdHeader.textContent = nextSpeed.toFixed(1) + 's';
        if (elements.costHeader) elements.costHeader.textContent = this.formatNumberAbbrev(cost1x);

        // Update Expanded Section
        elements.cost1x.textContent = this.formatNumberAbbrev(cost1x);
        elements.cost10x.textContent = this.formatNumberAbbrev(cost10x);

        let currentDps = 0;
        if (level > 0 && currentAlly) {
            const speedSec = currentAlly.attackSpeed / 1000;
            currentDps = currentAlly.damage / speedSec;
        }
        elements.dpsCurrent.textContent = this.formatNumberAbbrev(Math.round(currentDps));
        elements.dmgNext.textContent = this.formatNumberAbbrev(nextDmg);
        elements.spdNext.textContent = nextSpeed.toFixed(1) + 's';


        // Update Button States (1x)
        if (this.player.energon < cost1x) {
            elements.btn1x.classList.add('disabled');
        } else {
            elements.btn1x.classList.remove('disabled');
        }

        // Update Button States (10x)
        if (this.player.energon < cost10x) {
            elements.btn10x.classList.add('disabled');
        } else {
            elements.btn10x.classList.remove('disabled');
        }
    }

    handleEnemyClick(e) {
        if (!this.isPlaying || this.isBossSpawning || this.isWaveTransitioning) return;


        // Damage Enemy
        const damage = this.player.weaponLevel; // 1 damage per level
        this.damageEnemy(damage);



        this.triggerHitEffect(e.clientX, e.clientY, damage);
        this.triggerShake();
        this.playSound('playerAttack');
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

        // Update all ally shop UIs
        Object.keys(GAME_DATA.allies).forEach(key => {
            this.updateAllyShopUI(key);
        });

        // Progress
        this.currentEnemyIndex++;
        const currentWave = GAME_DATA.waves[this.currentWaveIndex];

        if (this.currentEnemyIndex >= currentWave.enemies.length) {
            // Wave Complete!
            this.isWaveTransitioning = true;
            this.currentWaveIndex++;
            this.currentEnemyIndex = 0;

            if (this.currentWaveIndex >= GAME_DATA.waves.length) {
                this.gameOver(true);
                return;
            }

            // Hide current enemy image during transition
            this.enemyImageEl.style.opacity = '0';

            // Reset bars visually
            this.enemyHpBar.style.width = '100%';
            this.attackBar.style.width = '0%';

            // Show wave complete animation
            this.showWaveComplete();
            setTimeout(() => {
                this.isWaveTransitioning = false;
                this.loadCurrentEnemy();
                this.enemyImageEl.style.opacity = '1';
                this.lastAttackTime = Date.now();
            }, 3000); // 3 seconds pause between waves
            return;
        }

        // Check if next enemy is the last one (Boss)
        const isLastEnemy = this.currentEnemyIndex === currentWave.enemies.length - 1;

        if (isLastEnemy) {
            this.isBossSpawning = true;
            this.attackBar.style.width = '0%';

            // 1. Load Boss immediately
            this.loadCurrentEnemy();

            // 2. Prepare Fade-In
            this.enemyImageEl.style.transition = 'none';
            this.enemyImageEl.style.opacity = '0';

            // 3. Show Warning
            this.showBossWarning();

            // 4. Start Fade-In
            requestAnimationFrame(() => {
                void this.enemyImageEl.offsetWidth; // force reflow
                this.enemyImageEl.style.transition = 'opacity 2s ease-in';
                this.enemyImageEl.style.opacity = '1';
            });

            // 5. Unlock after animation
            setTimeout(() => {
                this.isBossSpawning = false;
                this.lastAttackTime = Date.now();
            }, 2000);

            return;
        }

        // Load Next Enemy
        this.loadCurrentEnemy();
        // Reset attack timer for new enemy so they don't hit instantly
        this.lastAttackTime = Date.now();
    }

    showBossWarning() {
        this.bossWarningOverlay.classList.add('active');
        setTimeout(() => {
            this.bossWarningOverlay.classList.remove('active');
        }, 2000);
    }

    showWaveComplete() {
        this.waveCompleteOverlay.classList.add('active');
        setTimeout(() => {
            this.waveCompleteOverlay.classList.remove('active');
        }, 3000);
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

            // Update all ally shop UIs
            Object.keys(GAME_DATA.allies).forEach(key => {
                this.updateAllyShopUI(key);
            });
        }
    }

    buyAlly(allyKey, amount = 1) {
        const btnElement = this.allyShopElements[allyKey].btn1x; // default animation target
        const allyData = GAME_DATA.allies[allyKey];
        const currentAlly = this.allies[allyKey];
        const level = currentAlly ? currentAlly.level : 0;

        // Calculate total cost for N levels
        const cost = this.calculateBulkCost(allyData, level, amount);

        if (this.player.energon >= cost) {
            this.player.energon -= cost;

            for (let i = 0; i < amount; i++) {
                if (!this.allies[allyKey]) {
                    // First purchase
                    this.allies[allyKey] = {
                        level: 1,
                        lastAttack: Date.now(),
                        hp: allyData.baseHp,
                        maxHp: allyData.baseHp,
                        damage: allyData.baseDamage,
                        attackSpeed: allyData.baseAttackSpeed,
                        // Skill Props
                        skillCooldown: 0,
                        skillActive: false,
                        skillTimer: 0
                    };
                    this.spawnAllyCard(allyKey);
                } else {
                    // Upgrade
                    this.allies[allyKey].level++;

                    const newLevel = this.allies[allyKey].level;
                    this.allies[allyKey].maxHp = Math.floor(allyData.baseHp * Math.pow(allyData.hpMultiplier, newLevel - 1));
                    this.allies[allyKey].damage = Math.floor(allyData.baseDamage * Math.pow(allyData.damageMultiplier, newLevel - 1)) + (newLevel - 1);
                    this.allies[allyKey].hp = this.allies[allyKey].maxHp;
                }
            }

            this.triggerLevelUpAnimation(btnElement);
            this.updatePlayerUI();
            this.updateUpgradeUI();

            // Update all ally shop UIs
            Object.keys(GAME_DATA.allies).forEach(key => {
                this.updateAllyShopUI(key);
            });
        }
    }

    spawnAllyCard(allyKey) {
        const allyData = GAME_DATA.allies[allyKey];

        const card = document.createElement('div');
        card.className = 'ally-card';
        // Note: Using 'ally-hp-bar' class but it now represents skill bar
        card.innerHTML = `
            <img src="${allyData.image}" class="ally-image" alt="${allyData.name}">
            <div class="ally-hp-bar">
                <div class="ally-hp-fill" style="width: 0%;"></div>
            </div>
            <div class="ally-attack-bar">
                <div class="ally-attack-fill" style="width: 0%;"></div>
            </div>
        `;

        // Add skill activation click
        card.addEventListener('click', () => {
            this.handleAllyCardClick(allyKey);
        });

        this.alliesContainer.appendChild(card);

        // Store references
        this.allyElements[allyKey] = {
            card: card,
            hpBar: card.querySelector('.ally-hp-fill'), // This is the skill bar now
            attackBar: card.querySelector('.ally-attack-fill'),
            image: card.querySelector('.ally-image')
        };
    }

    handleAllyCardClick(allyKey) {
        const ally = this.allies[allyKey];
        if (!ally) return;

        const allyData = GAME_DATA.allies[allyKey];
        if (!allyData.skill) return;

        // Activate if Cooldown Ready
        if (!ally.skillActive && ally.skillCooldown >= allyData.skill.cooldown) {
            this.activateSkill(allyKey);
        }
    }

    activateSkill(allyKey) {
        const ally = this.allies[allyKey];
        const allyData = GAME_DATA.allies[allyKey];

        ally.skillActive = true;
        ally.skillTimer = allyData.skill.duration;
        ally.skillCooldown = 0;

        // Visuals
        const el = this.allyElements[allyKey];
        if (el) {
            // Change Image to Alt
            el.image.src = allyData.image.replace('.jpg', '_alt.jpg');
            el.card.classList.remove('skill-ready');
            el.card.classList.add('skill-active');
        }
    }

    deactivateSkill(allyKey) {
        const ally = this.allies[allyKey];
        const allyData = GAME_DATA.allies[allyKey];

        ally.skillActive = false;

        // Visuals
        const el = this.allyElements[allyKey];
        if (el) {
            // Revert Image
            el.image.src = allyData.image;
            el.card.classList.remove('skill-active');
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
        // Determine if boss (omega_boss or venom)
        const isBoss = this.currentEnemy.isBoss ||
            this.currentEnemy.name.toLowerCase().includes('boss') ||
            this.currentEnemy.name === 'Venom' ||
            this.currentEnemy.name === 'Omega Boss';

        // Play attack sound
        this.playSound(isBoss ? 'bossAttack' : 'enemyAttack');

        // Trigger Enemy Animation
        this.enemyCard.classList.add('enemy-attacking');
        setTimeout(() => this.enemyCard.classList.remove('enemy-attacking'), 300);

        // Delay damage to match impact (approx 150ms)
        setTimeout(() => {
            if (!this.isPlaying) return;

            let damage = this.currentEnemy.damage;

            // Apply Skill Mitigations
            // Check Bumblebee
            if (this.allies['bumblebee'] && this.allies['bumblebee'].skillActive) {
                const skillData = GAME_DATA.allies.bumblebee.skill;
                if (skillData && skillData.param1) {
                    const reduction = skillData.param1 / 100; // 50% -> 0.5
                    damage = Math.floor(damage * (1 - reduction));
                }
            }


            this.player.hp -= damage;
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
        const dt = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Skip enemy attack logic if boss is spawning or wave transitioning
        if (!this.isBossSpawning && !this.isWaveTransitioning) {
            const timeSinceAttack = now - this.lastAttackTime;

            // Update Attack Bar
            const attackProgress = Math.min((timeSinceAttack / this.currentEnemy.attackSpeed) * 100, 100);
            this.attackBar.style.width = `${attackProgress}%`;

            // Check Enemy Attack
            if (timeSinceAttack >= this.currentEnemy.attackSpeed) {
                this.triggerEnemyAttack();
                this.lastAttackTime = now;
            }
        }

        // Handle Allies
        for (const [key, ally] of Object.entries(this.allies)) {
            const allyData = GAME_DATA.allies[key];
            const timeSinceAllyAttack = now - ally.lastAttack;
            const allyElements = this.allyElements[key];

            // Update Ally Attack Bar
            const allyAttackProgress = Math.min((timeSinceAllyAttack / ally.attackSpeed) * 100, 100);
            if (allyElements) {
                allyElements.attackBar.style.width = `${allyAttackProgress}%`;
            }

            // --- SKILL LOGIC ---
            if (allyData.skill) {
                if (ally.skillActive) {
                    // Reduce Timer
                    ally.skillTimer -= dt;

                    if (allyElements) {
                        const pct = Math.max(0, (ally.skillTimer / allyData.skill.duration) * 100);
                        allyElements.hpBar.style.width = `${pct}%`;
                    }

                    if (ally.skillTimer <= 0) {
                        this.deactivateSkill(key);
                    }
                } else {
                    // Increase Cooldown
                    if (ally.skillCooldown < allyData.skill.cooldown) {
                        ally.skillCooldown += dt;
                        if (ally.skillCooldown > allyData.skill.cooldown) ally.skillCooldown = allyData.skill.cooldown;

                        if (allyElements) {
                            const pct = (ally.skillCooldown / allyData.skill.cooldown) * 100;
                            allyElements.hpBar.style.width = `${pct}%`;
                        }

                        // Trigger Ready Visuals if just reached
                        if (ally.skillCooldown >= allyData.skill.cooldown && allyElements) {
                            if (!allyElements.card.classList.contains('skill-ready')) {
                                allyElements.card.classList.add('skill-ready');
                            }
                        }
                    }
                }
            }


            // Check Ally Attack
            if (timeSinceAllyAttack >= ally.attackSpeed) {
                if (this.isBossSpawning || this.isWaveTransitioning) continue; // Wait for boss to spawn or wave to transition

                ally.lastAttack = now;

                // Trigger Ally Animation
                if (allyElements && allyElements.card) {
                    const card = allyElements.card;
                    card.classList.remove('attacking');
                    void card.offsetWidth; // Force reflow
                    card.classList.add('attacking');

                    this.playSound('allyAttack');

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
