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
            image: "assets/cards/enemies/enemy_robot.png",
            hp: 20,
            maxHp: 20,
            damage: 10,
            attackSpeed: 2000,
            energonReward: 10
        },
        omega_boss: {
            name: "Omega Boss",
            image: "assets/cards/bosses/boss_robot.png",
            hp: 50,
            maxHp: 50,
            damage: 10,
            attackSpeed: 1000,
            energonReward: 50
        },
        bombshell: {
            name: "Bombshell",
            image: "assets/cards/enemies/bombshell.jpg",
            hp: 20,
            maxHp: 20,
            damage: 10,
            attackSpeed: 2000,
            energonReward: 10
        },
        venom: {
            name: "Venom",
            image: "assets/cards/enemies/venom.jpg",
            hp: 50,
            maxHp: 50,
            damage: 10,
            attackSpeed: 1000,
            energonReward: 50
        }
        ,
        reflector: {
            name: "Reflector",
            image: "assets/cards/enemies/reflector.jpg",
            hp: 30,
            maxHp: 30,
            damage: 15,
            attackSpeed: 2000,
            energonReward: 15
        },
        runabout: {
            name: "Runabout & Runamuck",
            image: "assets/cards/enemies/runabout.jpg",
            hp: 40,
            maxHp: 40,
            damage: 10,
            attackSpeed: 1500,
            energonReward: 15
        }
        ,
        thrust: {
            name: "Thrust",
            image: "assets/cards/enemies/thrust.jpg",
            hp: 100,
            maxHp: 100,
            damage: 30,
            attackSpeed: 2000,
            energonReward: 75
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
        },
        {
            id: 3,
            enemies: [
                { type: "reflector", level: 1 }, { type: "runabout", level: 1 }, { type: "reflector", level: 1 }, { type: "runabout", level: 1 }, { type: "reflector", level: 1 },
                { type: "runabout", level: 1 }, { type: "reflector", level: 1 }, { type: "runabout", level: 1 }, { type: "reflector", level: 1 }, { type: "thrust", level: 1 }
            ]
        }
    ],
    upgrades: {
        weapon: {
            name: "Blaster",
            image: "assets/icons/weapon.png",
            baseCost: 10,
            costMultiplier: 1.5
        }
    },
    allies: {
        bumblebee: {
            name: "Bumblebee",
            image: "assets/cards/allies/bumblebee.jpg",
            baseHp: 50,
            baseDamage: 5,
            baseAttackSpeed: 1000, // ms
            baseCost: 10,
            costMultiplier: 1.6,
            hpMultiplier: 1.2,
            damageMultiplier: 1.2
        },
        wheeljack: {
            name: "Wheeljack",
            image: "assets/cards/allies/wheeljack.jpg",
            baseHp: 50,
            baseDamage: 50,
            baseAttackSpeed: 2000, // ms
            baseCost: 50,
            costMultiplier: 1.6,
            hpMultiplier: 1.2,
            damageMultiplier: 1.2
        }
    }
};
