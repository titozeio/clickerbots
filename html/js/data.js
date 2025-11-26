const GAME_DATA = {
    player: {
        hp: 100,
        maxHp: 100,
        energon: 0,
        weaponLevel: 1
    },
    enemyTypes: {
        basic: {
            name: "Titan Prime",
            image: "assets/enemy_robot.png",
            hp: 20,
            maxHp: 20,
            damage: 10,
            attackSpeed: 2000,
            energonReward: 10
        },
        boss: {
            name: "Omega Boss",
            image: "assets/boss_robot.png",
            hp: 50,
            maxHp: 50,
            damage: 10,
            attackSpeed: 1000, // Twice as fast as basic
            energonReward: 50
        }
    },
    waves: [
        {
            id: 1,
            enemies: [
                "basic", "basic", "basic", "basic", "basic",
                "basic", "basic", "basic", "basic", "boss"
            ]
        }
    ],
    upgrades: {
        weapon: {
            baseCost: 10,
            costMultiplier: 1.5
        }
    },
    allies: {
        bumblebee: {
            name: "Bumblebee",
            image: "assets/bumblebee.png",
            baseHp: 50,
            baseDamage: 5,
            baseAttackSpeed: 2000, // ms
            baseCost: 20,
            costMultiplier: 1.6,
            hpMultiplier: 1.2,
            damageMultiplier: 1.2
        }
    }
};
