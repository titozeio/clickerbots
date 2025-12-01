const GAME_DATA = {
    player: {
        hp: 100,
        maxHp: 100,
        energon: 0,
        weaponLevel: 1
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
        kickback: {
            name: "Kickback",
            image: "assets/cards/enemies/kickback.jpg",
            hp: 18,
            maxHp: 18,
            damage: 6,
            attackSpeed: 1000,
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
                { type: "kickback", level: 1 }, { type: "bombshell", level: 1 }, { type: "kickback", level: 1 }, { type: "bombshell", level: 1 }, { type: "kickback", level: 1 },
                { type: "bombshell", level: 1 }, { type: "kickback", level: 1 }, { type: "bombshell", level: 1 }, { type: "kickback", level: 1 }, { type: "venom", level: 1 }
            ]
        },
        {
            id: 2,
            enemies: [
                { type: "reflector", level: 1 }, { type: "runabout", level: 1 }, { type: "reflector", level: 1 }, { type: "runabout", level: 1 }, { type: "reflector", level: 1 },
                { type: "runabout", level: 1 }, { type: "reflector", level: 1 }, { type: "runabout", level: 1 }, { type: "reflector", level: 1 }, { type: "thrust", level: 1 }
            ]
        },
        {
            id: 3,
            enemies: [
                { type: "bombshell", level: 2 }, { type: "kickback", level: 2 }, { type: "bombshell", level: 2 }, { type: "kickback", level: 2 }, { type: "bombshell", level: 2 },
                { type: "bombshell", level: 2 }, { type: "kickback", level: 2 }, { type: "bombshell", level: 2 }, { type: "kickback", level: 2 }, { type: "venom", level: 2 }
            ]
        },
    ],
    upgrades: {
        weapon: {
            name: "Blaster",
            image: "assets/icons/weapon.png",
            baseCost: 10,
            costMultiplier: 2
        }
    },
    allies: {
        bumblebee: {
            name: "Bumblebee",
            image: "assets/cards/allies/bumblebee.jpg",
            baseHp: 50,
            baseDamage: 5,
            baseAttackSpeed: 1000, // ms
            baseCost: 20,
            costMultiplier: 1.07,
            hpMultiplier: 1.2,
            damageMultiplier: 1.05
        },

        ratchet: {
            name: "Ratchet",
            image: "assets/cards/allies/ratchet.jpg",
            baseHp: 100,
            baseDamage: 60,
            baseAttackSpeed: 3000, // ms
            baseCost: 100,
            costMultiplier: 1.07,
            hpMultiplier: 1.2,
            damageMultiplier: 1.055
        },
        wheeljack: {
            name: "Wheeljack",
            image: "assets/cards/allies/wheeljack.jpg",
            baseHp: 200,
            baseDamage: 175,
            baseAttackSpeed: 2500, // ms
            baseCost: 400,
            costMultiplier: 1.07,
            hpMultiplier: 1.2,
            damageMultiplier: 1.057
        },
        blaster: {
            name: "Blaster",
            image: "assets/cards/allies/blaster.jpg",
            baseHp: 300,
            baseDamage: 400,
            baseAttackSpeed: 1500, // ms
            baseCost: 1500,
            costMultiplier: 1.07,
            hpMultiplier: 1.2,
            damageMultiplier: 1.06
        },
        grimlock: {
            name: "Grimlock",
            image: "assets/cards/allies/grimlock.jpg",
            baseHp: 500,
            baseDamage: 4000,
            baseAttackSpeed: 4000, // ms
            baseCost: 5000,
            costMultiplier: 1.07,
            hpMultiplier: 1.2,
            damageMultiplier: 1.06
        },
        optimus: {
            name: "Optimus Prime",
            image: "assets/cards/allies/optimus.jpg",
            baseHp: 1000,
            baseDamage: 8000,
            baseAttackSpeed: 2000, // ms
            baseCost: 20000,
            costMultiplier: 1.07,
            hpMultiplier: 1.2,
            damageMultiplier: 1.065
        }
    }
};
