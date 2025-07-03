export class DisplayManager {
    constructor(gameInstance, appendTextFunction) {
        this.game = gameInstance; // Access to game.player, game.currentRoom
        this.appendText = appendTextFunction; // Function to output messages
    }

    displayMap() {
        let mapInfo = "--- Location ---\n\n";
        mapInfo += `Your current location is the ${this.game.currentRoom.name}\n. `;
        const exits = Object.keys(this.game.currentRoom.exits);
        if (exits.length > 0) {
            mapInfo += "Exits: " + exits.map(exit => `${exit} to ${this.game.currentRoom.exits[exit].name}`).join(', ') + '\n';
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
        let statsInfo = "--- Character Stats ---\n\n";
        statsInfo += `Name: ${stats.name}\n`;
        statsInfo += `Level: ${stats.level}\n`;
        statsInfo += `Health: ${stats.health} / ${stats.maxHealth}\n`;
        statsInfo += `Attack: ${stats.attack}\n`;
        statsInfo += `Defense: ${stats.defense}\n`;
        statsInfo += `Experience: ${stats.experience} / ${stats.level * 100}\n`;
        statsInfo += `Gold: ${stats.gold}\n`;
        this.appendText(statsInfo);
    }

    displayHelp() {
        let helpInfo = "--- Help ---\n\n";
        helpInfo += "Available commands:\n";
        helpInfo += "- go [direction] (e.g., go forward, go left)\n";
        helpInfo += "- look (describes the room)\n";
        helpInfo += "- inspect [object/monster] (describes an item or monster)\n";
        helpInfo += "- search (finds items/monsters in the room)\n";
        helpInfo += "- take [item] (picks up an item)\n";
        helpInfo += "- use [item] (uses an item from your inventory)\n";
        helpInfo += "- attack [monster] / fight [monster] / battle [monster]\n";
        helpInfo += "- flee (attempts to escape from battle)\n";
        helpInfo += "\nSide Panel Buttons: Location, Inventory, Stats, Help.\n";
        this.appendText(helpInfo);
    }
}