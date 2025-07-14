export class Item {
    constructor(name, description, canTake = true, stackable = false, isUsable = true, goldValue = 0) {
        this.name = name;
        this.description = description;
        this.canTake = canTake;
        this.stackable = stackable;
        this.isUsable = isUsable;
        this.isConsumed = false;
        this.goldValue = goldValue;
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
            case 'leather vest':
                return this.useLeatherVest(player, room);
            case 'piece of candy':
                return this.usePieceOfCandy(player, room);
            case 'red apple':
                return this.useRedApple(player, room);
            case 'large health potion':
                return this.useLargeHealthPotion(player, room);
            case 'medium health potion':
                return this.useMediumHealthPotion(player, room);
            case 'small health potion':
                return this.useSmallHealthPotion(player, room);
            case 'blue feather':
                return this.useBlueFeather(player, room);
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
        this.isConsumed = true; // The sword is "consumed" to provide a permanent stat boost
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

    useLeatherVest(player, room) {
        player.defense += 2;
        this.isConsumed = true; // The vest is "consumed" to provide a permanent stat boost
        return 'You put on the leather vest. It feels sturdy. Your defense increases!';
    }

    usePieceOfCandy(player, room) {
        const expGained = Math.floor(Math.random() * 20) + 4; // Random experience between 4 and 23
        player.gainExperience(expGained);
        this.isConsumed = true;
        return `You eat the piece of candy. It's surprisingly energizing! You gained ${expGained} experience points.`;
    }

    useRedApple(player, room) {
        if (room.name === 'The Vault') {
            return 'It seems to fit in the hollow of the tree carving on the vault door.';
        }
        return "You can't find a use for that here.";
    }

    useLargeHealthPotion(player, room) {
        const healthRestored = 35;
        const oldHealth = player.health;
        player.heal(healthRestored);
        const actualRestored = player.health - oldHealth;
        this.isConsumed = true;
        return `You drink the large health potion and feel a powerful surge of vitality, restoring ${actualRestored} health. You now have ${player.health}/${player.maxHealth} health.`;
    }

    useMediumHealthPotion(player, room) {
        const healthRestored = 20;
        const oldHealth = player.health;
        player.heal(healthRestored);
        const actualRestored = player.health - oldHealth;
        this.isConsumed = true;
        return `You drink the medium health potion, feeling a pleasant warmth spread through you. You restore ${actualRestored} health. You now have ${player.health}/${player.maxHealth} health.`;
    }

    useSmallHealthPotion(player, room) {
        const healthRestored = 15;
        const oldHealth = player.health;
        player.heal(healthRestored);
        const actualRestored = player.health - oldHealth;
        this.isConsumed = true;
        return `You drink the small health potion and restore ${actualRestored} health. You now have ${player.health}/${player.maxHealth} health.`;
    }

    useBlueFeather(player, room) {
        // The user said this is the "new blue key". It's a key item for the vault.
        // The actual unlock logic is likely handled by checking player inventory in the vault room description or a special command.
        if (room.name === 'The Vault') {
            return 'The feather seems to resonate with the empty nest carving on the vault door.';
        }
        return "You can't find a use for that here.";
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