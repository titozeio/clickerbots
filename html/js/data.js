const GAME_DATA = {
    player: {
        hp: 100,
        maxHp: 100,
        energon: 0,
        weaponLevel: 5
    },
    enemyTypes: {
        titan_prime: {
            name: "Titan Prime",
            image: "assets/enemy_robot.png",
            hp: 20,
            maxHp: 20,
            damage: 10,
            attackSpeed: 2000,
            energonReward: 10
        },
        omega_boss: {
            name: "Omega Boss",
            image: "assets/boss_robot.png",
            hp: 50,
            maxHp: 50,
            damage: 10,
            attackSpeed: 1000,
            energonReward: 50
        },
        bombshell: {
            name: "Bombshell",
            image: "assets/bombshell.png",
            hp: 20,
            maxHp: 20,
            damage: 10,
            attackSpeed: 2000,
            energonReward: 10
        },
        venom: {
            name: "Venom",
            image: "assets/venom.png",
            hp: 50,
            maxHp: 50,
            damage: 10,
            attackSpeed: 1000,
            energonReward: 50
        }
    },
    levelMultipliers: {
        hp: 1.5,
        damage: 1.2,
        energon: 1.5
    },
    waves: [
        {
            id: 1,
            enemies: [
                { type: "bombshell", level: 1 }, { type: "bombshell", level: 1 }, { type: "bombshell", level: 1 }, { type: "bombshell", level: 1 }, { type: "bombshell", level: 1 },
                { type: "bombshell", level: 1 }, { type: "bombshell", level: 1 }, { type: "bombshell", level: 1 }, { type: "bombshell", level: 1 }, { type: "venom", level: 1 }
            ]
        },
        {
            id: 2,
            enemies: [
                { type: "bombshell", level: 2 }, { type: "bombshell", level: 2 }, { type: "bombshell", level: 2 }, { type: "bombshell", level: 2 }, { type: "bombshell", level: 2 },
                { type: "bombshell", level: 2 }, { type: "bombshell", level: 2 }, { type: "bombshell", level: 2 }, { type: "bombshell", level: 2 }, { type: "venom", level: 2 }
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
            baseAttackSpeed: 1000, // ms
            baseCost: 10,
            costMultiplier: 1.6,
            hpMultiplier: 1.2,
            damageMultiplier: 1.2
        }
    }
};
