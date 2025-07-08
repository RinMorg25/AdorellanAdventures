export class Monster {
    constructor(name, health, attack, defense, description = '') {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.attack = attack;
        this.defense = defense;
        this.description = description;
        this.isAlive = true;
        this.experienceValue = Math.floor(health / 2) + attack;
        this.loot = [];
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        this.health = Math.max(0, this.health);
        
        if (this.health <= 0) {
            this.isAlive = false;
        }
        
        return actualDamage;
    }
    
    attackPlayer(player) {
        let damage;
        let isCritical = false;

        if (this.name === 'Goblin') {
            damage = Math.floor(Math.random() * 5) + 1; // Damage 1-5 for Goblin
            if (damage >= 4) { // 4 or 5 is critical for Goblin
                isCritical = true;
            }
        } else {
            // Default attack logic for other monsters
            damage = Math.floor(Math.random() * this.attack) + 1;
            // Future: Add critical hit logic for other monsters if needed
        }
        
        return { damage, isCritical };
    }
    
    getAttackMessage() {
        const messages = [
            `The ${this.name} lunges at you!`,
            `The ${this.name} strikes with fury!`,
            `The ${this.name} attacks viciously!`,
            `The ${this.name} bares its claws and attacks!`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    getDeathMessage() {
        const messages = [
            `The ${this.name} falls to the ground, defeated.`,
            `The ${this.name} lets out a final roar and collapses.`,
            `The ${this.name} crumbles into dust.`,
            `The ${this.name} retreats into the shadows, defeated.`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    addLoot(item) {
        this.loot.push(item);
    }
    
    dropLoot() {
        return this.loot;
    }
}

export class MonsterFactory {
    static createGoblin() {
        const goblin = new Monster(
            'Goblin',
            35,
            8,
            3,
            'A small, green creature with glowing red eyes and sharp claws.'
        );
        return goblin;
    }

    static createGreyImp() {
        const greyimp = new Monster(
            'Grey Imp',
            25,
            6,
            1,
            'A small, grey imp, almost rock like in appearance, with large ears, and little horns its head. You notice a shiny red gem in the middle of it forehead.'
        );
        return greyimp;
    }
    
    static createTroll() {
        const troll = new Monster(
            'Cave Troll',
            60,
            15,
            8,
            'A massive creature with stone-like skin that guards the cave depths.'
        );
        return troll;
    }
    
    static createBat() {
        const bat = new Monster(
            'Giant Bat',
            30,
            6,
            2,
            'A large bat with leathery wings and glowing eyes.'
        );
        return bat;
    }
    
    static createSpider() {
        const spider = new Monster(
            'Cave Spider',
            25,
            10,
            4,
            'A venomous spider the size of a small dog with eight glowing eyes.'
        );
        return spider;
    }
    
    static createDragon() {
        const dragon = new Monster(
            'Crystal Dragon',
            100,
            25,
            15,
            'An ancient dragon made of living crystal, guardian of the deepest treasures. It appears to be in a deep slumber.'
        );
        return dragon;
    }
}