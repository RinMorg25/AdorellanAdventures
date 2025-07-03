export class Character {
    constructor(name, health, attack, defense, gold = 0) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.attack = attack;
        this.defense = defense;
        this.inventory = [];
        this.experience = 0;
        this.level = 1;
        this.gold = gold;
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.health -= actualDamage;
        this.health = Math.max(0, this.health);
        return actualDamage;
    }
    
    heal(amount) {
        this.health += amount;
        this.health = Math.min(this.maxHealth, this.health);
    }
    
    isAlive() {
        return this.health > 0;
    }
    
    addItem(item) {
        this.inventory.push(item);
    }
    
    removeItem(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
        }
    }
    
    hasItem(itemName) {
        // Make comparison case-insensitive to handle variations in user input
        return this.inventory.some(item => item.name.toLowerCase() === itemName.toLowerCase());
    }
    
    getItem(itemName) {
        return this.inventory.find(item => item.name === itemName);
    }
    
    gainExperience(exp) {
        this.experience += exp;
        if (this.experience >= this.level * 100) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.maxHealth += 10;
        this.health = this.maxHealth;
        this.attack += 2;
        this.defense += 1;
        return `You reached level ${this.level}! Your stats have improved.`;
    }
    
    getStats() {
        return {
            name: this.name,
            level: this.level,
            health: this.health,
            maxHealth: this.maxHealth,
            attack: this.attack,
            defense: this.defense,
            experience: this.experience,
            gold: this.gold
        };
    }
}

export class NPC extends Character {
    constructor(name, health, attack, defense, description = '', responses = {}, shopInventory = []) {
        super(name, health, attack, defense);
        this.description = description;
        this.responses = responses; // e.g., { default: ["Hi"], shop: ["Want to buy?"] }
        this.isHostile = false;
        this.dialogueCounters = {}; // Tracks index for each topic, e.g., { default: 0, shop: 1 }
        this.shopInventory = shopInventory;
    }
    
    speak(topic = 'default') {
        const topicResponses = this.responses[topic] || this.responses['default'];

        if (!topicResponses || topicResponses.length === 0) {
            return `${this.name} has nothing to say.`;
        }

        // Initialize counter for this topic if it doesn't exist
        if (this.dialogueCounters[topic] === undefined) {
            this.dialogueCounters[topic] = 0;
        }

        // Get the current message and advance the counter for this topic
        const messageIndex = this.dialogueCounters[topic];
        const message = topicResponses[messageIndex];
        this.dialogueCounters[topic] = (messageIndex + 1) % topicResponses.length;

        return `${this.name} says: "${message}"`;
    }
    
    setHostile(hostile) {
        this.isHostile = hostile;
    }

    turnHostile() {
        this.isHostile = true;
        return `${this.name} becomes hostile!`;
    }
}

// Define base stats for the 6 character archetypes/portraits
export const archetypeData = [
    { name: "Warrior", health: 120, strength: 15, dexterity: 10, agility: 8, intelligence: 5, charisma: 7 },
    { name: "Rogue",   health: 90,  strength: 10, dexterity: 15, agility: 12, intelligence: 8, charisma: 10 },
    { name: "Ranger",  health: 100, strength: 12, dexterity: 14, agility: 10, intelligence: 7, charisma: 8 },
    { name: "Bard",    health: 85,  strength: 8,  dexterity: 12, agility: 9,  intelligence: 12, charisma: 15 },
    { name: "Healer",  health: 95,  strength: 7,  dexterity: 9,  agility: 7,  intelligence: 14, charisma: 12 },
    { name: "Mage",    health: 80,  strength: 6,  dexterity: 8,  agility: 6,  intelligence: 16, charisma: 9 }
];