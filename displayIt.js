export class DisplayManager {
    constructor(gameInstance, appendTextFunction) {
        this.game = gameInstance; // Access to game.player, game.currentRoom
        this.appendText = appendTextFunction; // Function to output messages
    }

    displayMap() {
        let mapInfo = "--- Location ---\n\n";
        mapInfo += `Your current location is the ${this.game.currentRoom.name}. `;
        const exits = Object.keys(this.game.currentRoom.exits);
        if (exits.length > 0) {
            const exitDescriptions = exits.map(direction => {
                const roomName = this.game.currentRoom.exits[direction].name;
                const isLocked = this.game.currentRoom.lockedExits[direction];
                return `${direction} to ${roomName}${isLocked ? ' (locked)' : ''}`;
            });
            mapInfo += "Exits: " + exitDescriptions.join(', ') + '\n';
        } else {
            mapInfo += "No obvious exits from here.\n";
        }
        this.appendText(mapInfo);
    }

    displayInventory() {
        let inventoryInfo = "--- Inventory ---\n\n";
        if (this.game.player.inventory.length === 0) {
            inventoryInfo += "Your inventory is empty.";
        } else {
            inventoryInfo += "You are carrying:\n";
            this.game.player.inventory.forEach(item => {
                inventoryInfo += `- ${item.name}: ${item.examine()}\n`;
            });
        }
        this.appendText(inventoryInfo);
    }

    displayStats() {
        const stats = this.game.player.getStats();
        const expForNextLevel = stats.level * 100;

        // Using a map makes the display logic more data-driven and easier to maintain.
        const statsMap = {
            'Name': stats.name,
            'Level': stats.level,
            'Health': `${stats.health} / ${stats.maxHealth}`,
            'Attack': stats.attack,
            'Defense': stats.defense,
            'Experience': `${stats.experience} / ${expForNextLevel}`,
            'Gold': stats.gold
        };

        const statsInfo = "--- Character Stats ---\n\n" + 
            Object.entries(statsMap)
                  .map(([label, value]) => `${label}: ${value}`)
                  .join('\n');

        this.appendText(statsInfo);
    }
}