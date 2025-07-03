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
}