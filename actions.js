export class ActionHandler {
    constructor(gameInstance) {
        this.game = gameInstance; // Provides access to game.player, game.currentRoom, game.battleSystem etc.
        this.commands = {
            'go': this._handleMovement,
            'look': this._handleLook,
            'inspect': this._handleInspect,
            'search': this._handleSearch,
            'take': this._handleTake,
            'use': this._handleUse,
            'drop': this._handleDrop,
            'attack': this._handleBattle,
            'fight': this._handleBattle,
            'battle': this._handleBattle,
            'flee': this._handleFlee,
            'left': this._handleMovement,
            'right': this._handleMovement,
            'forward': this._handleMovement,
            'back': this._handleMovement,
            'pick': this._handlePick,
            'help': this._handleHelp,
            'play': this._handlePlay,
            'talk': this._handleTalk,
            'list': this._handleList,
            'buy': this._handleBuy,
        };
    }

    processCommand(verb, object) {
        const handler = this.commands[verb];
        if (handler) {
            // For movement aliases like 'left', 'right', etc., the verb itself is the direction.
            if (['left', 'right', 'forward', 'back'].includes(verb)) {
                return handler.call(this, verb);
            }
            // For other commands, pass the object/target.
            return handler.call(this, object);
        }
        return "I don't understand that command. Try 'help' to see a list of available commands.";
    }

    _handleMovement(direction) {
        const allowedDirections = ['forward', 'back', 'left', 'right'];
        if (!allowedDirections.includes(direction)) {
            return `You can only move in these directions: forward, back, left, right.`;
        }

        // Handle the 'back' command dynamically
        if (direction === 'back') {
            if (this.game.roomHistory.length > 0) {
                // Pop the last room from history to go back
                this.game.currentRoom = this.game.roomHistory.pop();
                return `You go back.\n\n${this.game.currentRoom.getDescription(this.game.player)}`;
            } else {
                return "You can't go back any further.";
            }
        }

        // Handle all other directions
        const exit = this.game.currentRoom.getExit(direction);
        if (exit) {
            // CRITICAL: Check if the exit is locked before moving
            if (this.game.currentRoom.lockedExits[direction]) {
                return "That way is locked.";
            }

            // Add the current room to history before moving
            this.game.roomHistory.push(this.game.currentRoom);
            this.game.currentRoom = exit;
            return `You move ${direction}.\n\n${this.game.currentRoom.getDescription(this.game.player)}`;
        }
        return `You cannot go ${direction} from here.`;
    }

    _handleLook(target) {
        if (!target) {
            return this.game.currentRoom.getDescription(this.game.player);
        }

        // If a target is provided, guide the user to the new command.
        return `To examine something specific, try 'inspect ${target}'.`;
    }

    _handleInspect(target) {
        if (!target) {
            return "What do you want to inspect?";
        }

        const item = this.game.currentRoom.items.find(i => i.name.toLowerCase() === target.toLowerCase());
        if (item) {
            return item.examine(); // Use item.examine() for consistency
        }

        const monster = this.game.currentRoom.monsters.find(m => m.name.toLowerCase() === target.toLowerCase());
        if (monster) {
            return monster.description;
        }

        const npc = this.game.currentRoom.npcs.find(n => n.name.toLowerCase() === target.toLowerCase());
        if (npc) {
            return npc.description;
        }

        return `You don't see a ${target} here to inspect.`;
    }

    _handleSearch() {
        const items = this.game.currentRoom.items;
        const monsters = this.game.currentRoom.monsters;
        let result = 'You search the area carefully...\n\n';

        if (items.length > 0) {
            result += 'You find: ' + items.map(i => i.name).join(', ') + '\n';
        }
        if (monsters.length > 0) {
            result += 'You notice: ' + monsters.map(m => m.name).join(', ') + '\n';
        }
        const npcs = this.game.currentRoom.npcs;
        if (npcs.length > 0) {
            result += 'You see: ' + npcs.map(n => n.name).join(', ') + '\n';
        }
        if (items.length === 0 && monsters.length === 0 && npcs.length === 0) {
            result += 'You find nothing of interest.';
        }
        return result;
    }

    _handleTake(itemName) {
        const item = this.game.currentRoom.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (item && item.canTake) {
            this.game.player.addItem(item); // Use player's addItem method
            this.game.currentRoom.removeItem(item);
            return `You take the ${itemName}.`;
        } else if (item) {
            return `You cannot take the ${itemName}.`;
        }
        return `There is no ${itemName} here.`;
    }

    _handleUse(itemName) {
        const item = this.game.player.getItem(itemName.toLowerCase()); // Use player's getItem
        if (item) {
            const usageResult = item.use(this.game.player, this.game.currentRoom);
            if (item.isConsumed) {
                this.game.player.removeItem(item); // Use player's removeItem
            }
            return usageResult;
        }
        return `You don't have a ${itemName}.`;
    }

    _handleDrop(itemName) {
        const item = this.game.player.getItem(itemName.toLowerCase());
        if (item) {
            this.game.player.removeItem(item); // Remove from player's inventory
            this.game.currentRoom.addItem(item); // Add to the current room's items
            return `You drop the ${itemName}.`;
        }
        return `You don't have a ${itemName} to drop.`;
    }

    _handleBattle(target) {
        const monster = this.game.currentRoom.monsters.find(m => m.name.toLowerCase() === target.toLowerCase() || (target === '' && this.game.currentRoom.monsters.length > 0));
        if (monster) {
            return this.game.battleSystem.startBattle(this.game.player, monster);
        }
        return 'There is nothing to fight here, or no specific target mentioned.';
    }

    _handleFlee() {
        // This is for a general 'flee' command when not in battle.
        // If in battle, BattleSystem's flee logic is used.
        return 'You look around nervously, but there is no immediate danger to flee from.';
    }
    
    _handlePick(direction) {
        if (!direction) {
            return "Which exit do you want to try and pick?";
        }

        if (this.game.player.hasItem('lockpick')) {
            const exit = this.game.currentRoom.exits[direction];
            if (exit && this.game.currentRoom.lockedExits[direction]) {
                return this.game.currentRoom.unlockExit(direction);
            } else if (exit) {
                return "That exit isn't locked.";
            }
            return `There's no exit in that direction.`;
        }
        return "You don't have any lock picks!";
    }

    _handlePlay(playerChoice) {
        if (!playerChoice) {
            return "What do you want to play? Try 'play rock', 'play paper', or 'play scissors'.";
        }

        const choices = ['rock', 'paper', 'scissors'];
        const playerMove = playerChoice.toLowerCase();

        if (!choices.includes(playerMove)) {
            return `You can't play '${playerChoice}'. Try rock, paper, or scissors.`;
        }

        // Find a door to play against.
        let targetDirection = null;
        // Check all exits for an 'rps' lock
        for (const dir in this.game.currentRoom.lockedExits) {
            if (this.game.currentRoom.lockedExits[dir] === 'rps') {
                targetDirection = dir;
                break; // Assume only one RPS door per room for simplicity
            }
        }

        if (!targetDirection) {
            return "There's nothing here to play a game with.";
        }

        // Now play the game
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        let resultMessage = `You play ${playerMove}. The door seems to respond, projecting an image of a ${computerChoice}.\n\n`;

        if (playerMove === computerChoice) {
            resultMessage += "It's a draw! The door remains locked. Try again.";
        } else if (
            (playerMove === 'rock' && computerChoice === 'scissors') ||
            (playerMove === 'paper' && computerChoice === 'rock') ||
            (playerMove === 'scissors' && computerChoice === 'paper')
        ) {
            resultMessage += "You win! With a grinding sound, the lock on the door retracts.";
            this.game.currentRoom.unlockExit(targetDirection);
        } else {
            resultMessage += "You lose! The door remains stubbornly shut.";
        }

        return resultMessage;
    }

    _handleTalk(fullTarget) {
        if (!fullTarget) {
            return "Who do you want to talk to?";
        }

        // Parse the input for a target and an optional topic
        const parts = fullTarget.toLowerCase().split(' about ');
        const npcName = parts[0].trim();
        const topic = parts.length > 1 ? parts[1].trim() : 'default';

        // Find the NPC in the current room
        const npc = this.game.currentRoom.npcs.find(n => n.name.toLowerCase() === npcName);

        if (npc) {
            return npc.speak(topic);
        }

        return `There is no one named '${npcName}' here to talk to.`;
    }

    _handleList() {
        // Find an NPC with a shop in the current room. Assume only one for now.
        const shopkeeper = this.game.currentRoom.npcs.find(npc => npc.shopInventory && npc.shopInventory.length > 0);

        if (!shopkeeper) {
            return "There is no one here to buy from.";
        }

        if (shopkeeper.shopInventory.length === 0) {
            return `${shopkeeper.name} has nothing for sale right now.`;
        }

        let response = `<strong>--- ${shopkeeper.name}'s Wares ---</strong>\n\n`;
        shopkeeper.shopInventory.forEach(stock => {
            response += `- ${stock.item.name} (${stock.price} gold): ${stock.item.description}\n`;
        });
        response += `\nYou have ${this.game.player.gold} gold.`;
        response += `\n(Type 'buy [item name]' to purchase)`;

        return response;
    }

    _handleBuy(itemName) {
        if (!itemName) {
            return "What would you like to buy?";
        }

        const shopkeeper = this.game.currentRoom.npcs.find(npc => npc.shopInventory && npc.shopInventory.length > 0);

        if (!shopkeeper) {
            return "There is no one here to buy from.";
        }

        const itemToBuy = shopkeeper.shopInventory.find(stock => stock.item.name.toLowerCase() === itemName.toLowerCase());

        if (!itemToBuy) {
            return `${shopkeeper.name} doesn't have a "${itemName}" for sale.`;
        }

        if (this.game.player.gold < itemToBuy.price) {
            return `You don't have enough gold. You need ${itemToBuy.price} gold, but you only have ${this.game.player.gold}.`;
        }

        this.game.player.gold -= itemToBuy.price;
        this.game.player.addItem(itemToBuy.item);
        shopkeeper.shopInventory = shopkeeper.shopInventory.filter(stock => stock.item.name.toLowerCase() !== itemName.toLowerCase());
        return `You bought the ${itemToBuy.item.name} for ${itemToBuy.price} gold. You have ${this.game.player.gold} gold left.`;
    }

    _handleHelp() {
        const helpTitle = "<strong>--- Help: Available Commands ---</strong>\n\n";
        const commands = [
            "<strong>go [direction]</strong>: Move between rooms. Valid directions are 'forward', 'back', 'left', and 'right'. You can also type a direction by itself (e.g., 'left').",
            "<strong>look</strong>: Get a description of your current location.",
            "<strong>inspect [object/monster]</strong>: Examine a specific object or monster in the room.",
            "<strong>search</strong>: Search the room for any items or hidden things.",
            "<strong>take [item]</strong>: Add an item from the room to your inventory.",
            "<strong>drop [item]</strong>: Remove an item from your inventory and leave it in the room.",
            "<strong>use [item]</strong>: Use an item from your inventory. Some items have special effects.",
            "<strong>pick [direction]</strong>: Attempt to pick a locked door in a given direction (e.g., 'pick left'). This requires a 'lockpick' in your inventory.",
            "<strong>attack [monster]</strong>: Engage in combat with a monster.",
            "<strong>flee</strong>: Attempt to run away from a battle.",
            "<strong>play [choice]</strong>: Play a game of chance when prompted (e.g., 'play rock').",
            "<strong>talk [person]</strong> or <strong>talk [person] about [topic]</strong>: Speak to a friendly character.",
            "<strong>list</strong>: Shows items for sale if a shopkeeper is present.",
            "<strong>buy [item]</strong>: Purchase an item from a shopkeeper."
        ];
        return helpTitle + commands.join('\n\n');
    }
}