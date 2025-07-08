import { Item } from './items.js';

// This data is inferred from the character selection screen setup in main.js
export const archetypeData = [
    { name: 'Valerius', health: 120, strength: 12, dexterity: 8, portrait: './assets/images/male_portrait_1.png', description: 'A stalwart warrior, trading speed for power and resilience.' },
    { name: 'Kaelan', health: 100, strength: 10, dexterity: 12, portrait: './assets/images/male_portrait_2.png', description: 'A balanced fighter, quick on his feet and sharp with his blade.' },
    { name: 'Seraphina', health: 90, strength: 8, dexterity: 15, portrait: './assets/images/female_portrait_1.png', description: 'A nimble rogue, whose swift strikes find any weakness.' },
    { name: 'Lyra', health: 110, strength: 14, dexterity: 9, portrait: './assets/images/female_portrait_2.png', description: 'A fierce combatant, relying on overwhelming force to vanquish foes.' }
];

export class Character {
    constructor(name, health, attack, defense) {
        this.name = name;
        this.maxHealth = health;
        this.health = health;
        this.attack = attack;
        this.defense = defense;
        this.inventory = []; // Will now store { item, quantity }
        this.level = 1;
        this.experience = 0;
        this.isAlive = true;
    }

    /**
     * Adds an item or a stack of items to the player's inventory.
     * @param {Item} item - The item object to add.
     * @param {number} quantity - The number of items to add.
     */
    addItem(item, quantity = 1) {
        if (!item.canTake) {
            return; // Should not happen if logic is correct, but a good safeguard.
        }

        // Non-stackable items are always added as a new stack of 1
        if (!item.stackable) {
            for (let i = 0; i < quantity; i++) {
                this.inventory.push({ item: item, quantity: 1 });
            }
            return;
        }

        // For stackable items, find an existing stack
        const existingStack = this.inventory.find(stack => stack.item.name === item.name);

        if (existingStack) {
            existingStack.quantity += quantity;
        } else {
            // If no stack exists, create a new one
            this.inventory.push({ item: item, quantity: quantity });
        }
    }

    /**
     * Removes an item or a quantity of items from a stack in the player's inventory.
     * @param {Item} item - The item object to remove.
     * @param {number} quantity - The number of items to remove.
     * @returns {boolean} - True if the item was successfully removed, false otherwise.
     */
    removeItem(item, quantity = 1) {
        const stackIndex = this.inventory.findIndex(stack => stack.item.name === item.name);

        if (stackIndex > -1) {
            const stack = this.inventory[stackIndex];
            stack.quantity -= quantity;

            // If the stack is empty, remove it from the array
            if (stack.quantity <= 0) {
                this.inventory.splice(stackIndex, 1);
            }
            return true; // Indicate success
        }
        return false; // Indicate item not found
    }

    /**
     * Checks if the player has at least one of a specific item.
     * @param {string} itemName - The name of the item to check for.
     * @returns {boolean} - True if the item is in the inventory.
     */
    hasItem(itemName) {
        return this.inventory.some(stack => stack.item.name.toLowerCase() === itemName.toLowerCase());
    }
    
    /**
     * Finds an item in the inventory by name.
     * @param {string} itemName - The name of the item to find.
     * @returns {Item|null} - The item object if found, otherwise null.
     */
    findItem(itemName) {
        const stack = this.inventory.find(stack => stack.item.name.toLowerCase() === itemName.toLowerCase());
        return stack ? stack.item : null;
    }

    /**
     * Generates a formatted string of the player's inventory for display.
     * @returns {string} - The formatted inventory list.
     */
    getInventoryList() {
        if (this.inventory.length === 0) {
            return 'Your inventory is empty.';
        }

        const itemDescriptions = this.inventory.map(stack => {
            return stack.quantity > 1 ? `${stack.item.name} (x${stack.quantity})` : stack.item.name;
        });

        return 'You are carrying:\n' + itemDescriptions.join('\n');
    }

    /**
     * Calculates the total amount of gold the character has.
     * @returns {number} The total gold amount.
     */
    getGold() {
        const goldStack = this.inventory.find(stack => stack.item.name === 'gold coin');
        return goldStack ? goldStack.quantity : 0;
    }

    /**
     * Spends a specified amount of gold from the character's inventory.
     * @param {number} amount - The amount of gold to spend.
     * @returns {boolean} - True if the gold was spent successfully, false otherwise.
     */
    spendGold(amount) {
        const goldStack = this.inventory.find(stack => stack.item.name === 'gold coin');
        if (!goldStack || goldStack.quantity < amount) {
            return false; // Not enough gold
        }
        goldStack.quantity -= amount;
        if (goldStack.quantity <= 0) {
            this.inventory = this.inventory.filter(stack => stack.item.name !== 'gold coin');
        }
        return true; // Success
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    takeDamage(amount) {
        const damageTaken = Math.max(0, amount - this.defense);
        this.health -= damageTaken;
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
        return damageTaken;
    }

    gainExperience(amount) {
        this.experience += amount;
        const expForNextLevel = this.level * 100;
        if (this.experience >= expForNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.maxHealth += 10;
        this.attack += 2;
        this.defense += 1;
        this.health = this.maxHealth; // Fully heal on level up
        // The actual display message for level up should be handled in the game logic.
    }
}

export class NPC extends Character {
    constructor(name, health, attack, defense, description, dialogue, shopInventory = []) {
        super(name, health, attack, defense);
        this.description = description;
        this.dialogue = dialogue; // e.g., { default: [...], keys: [...] }
        this.shopInventory = shopInventory; // e.g., [{ item, price }, ...]
    }

    /**
     * Returns a line of dialogue based on a given topic.
     * @param {string} topic - The topic of conversation.
     * @returns {string} - A line of dialogue.
     */
    speak(topic = 'default') {
        const lowerTopic = topic.toLowerCase();
        const lines = this.dialogue[lowerTopic] || this.dialogue['default'];

        if (lines && lines.length > 0) {
            return lines[Math.floor(Math.random() * lines.length)];
        }
        return `${this.name} doesn't seem to have anything to say about that.`;
    }
}