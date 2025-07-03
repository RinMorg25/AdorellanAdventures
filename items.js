export class Item {
    constructor(name, description, canTake = true, isUsable = true) {
        this.name = name;
        this.description = description;
        this.canTake = canTake;
        this.isUsable = isUsable;
        this.isConsumed = false;
    }
    
    use(player, room) {
        if (!this.isUsable) {
            return `The ${this.name} cannot be used.`;
        }
        
        switch(this.name) {
            case 'torch':
                return this.useTorch(player, room);
            case 'crystal':
                return this.useCrystal(player, room);
            case 'sword':
                return this.useSword(player, room);
            case 'key':
                return this.useKey(player, room);
            case 'potion':
                return this.usePotion(player, room);
            default:
                return `You use the ${this.name}, but nothing happens.`;
        }
    }
    
    useTorch(player, room) {
        return 'The torch illuminates the area, revealing hidden details in the shadows.';
    }
    
    useCrystal(player, room) {
        return 'The crystal pulses with energy, and you feel your strength renewed.';
    }
    
    useSword(player, room) {
        player.attack += 5;
        return 'You feel more confident with the sword in hand. Your attack power increases!';
    }
    
    useKey(player, room) {
        return 'The key fits perfectly into a hidden lock you discover on the wall.';
    }
    
    usePotion(player, room) {
        player.health = Math.min(player.maxHealth, player.health + 20);
        this.isConsumed = true;
        return 'You drink the potion and feel refreshed. Your health is restored!';
    }
    
    examine() {
        return this.description;
    }
}

export class ItemManager {
    constructor() {
        this.items = new Map();
        this.initializeItems();
    }
    
    initializeItems() {
        const itemData = [
            { name: 'torch', desc: 'A flickering torch that provides light.', take: true },
            { name: 'crystal', desc: 'A mystical crystal that glows with inner light.', take: true },
            { name: 'sword', desc: 'An ancient blade with mystical properties.', take: true },
            { name: 'key', desc: 'An ornate key that looks very old.', take: true },
            { name: 'potion', desc: 'A small vial containing a healing elixir.', take: true },
            { name: 'chest', desc: 'A heavy wooden chest bound with iron.', take: false },
            { name: 'statue', desc: 'An ancient statue covered in mysterious runes.', take: false }
        ];
        
        itemData.forEach(data => {
            this.items.set(data.name, new Item(data.name, data.desc, data.take));
        });
    }
    
    getItem(name) {
        return this.items.get(name);
    }
    
    createItem(name, description, canTake = true) {
        const item = new Item(name, description, canTake);
        this.items.set(name, item);
        return item;
    }
}