import { Item } from './items.js';

export class ActionHandler {
    constructor(gameInstance) {
        this.game = gameInstance; // Provides access to game.player, game.currentRoom, game.battleSystem etc.
        this.mercurialDenStates = [
            {
                description: `You seem to be stood in the centre of a small island of calm. Here, an armchair, a side table, and a lamp rest on a worn rug, creating a single point of order in a room that has otherwise exploded into a chaos of costumes. Gowns, glittering jewellery, feather boas, and masks are strewn everywhere, spilling from wardrobes and covering every available surface in a colourful, cluttered mess.`,
                items: () => [
                    new Item('coin purse', 'A small, heavy leather purse.', false, false),
                    new Item('blue feather hand fan', 'An elegant hand fan made with large, deep blue feathers.', false, false),
                    new Item('medium health potion', 'A vial containing a swirling, red liquid.', true, true),
                    new Item('piece of candy', 'A piece of candy in a blue and purple wrapper.', true, true)
                ]
            },
            {
                // State 2: The Fungi Forest
                description: `The air grows damp and earthy as you push through a curtain of thick, hanging moss. You enter a cavern that glows with an eerie, beautiful light. The entire room is a forest of fungi, towering mushrooms, some as tall as trees, form a canopy of pulsating, bioluminescent caps in shades of deep blue, vibrant purple, and sickly green. The ground is a soft, springy carpet of white mycelium that muffles your footsteps. The air hums with a low, resonant frequency, and the only other sound is the slow drip-drip-drip of condensation falling from the giant caps onto smaller mushroom clusters below.
                In the centre of the room, a ring of flat-topped, waist-high toadstools are arranged like chairs around a single, petrified stump that serves as a table. Upon this stump sits a half-finished game of chess, but the pieces are carved from different-coloured mushrooms.
                Near the far wall, a small waterfall of phosphorescent slime trickles down the rock face into a crystal-clear pool, illuminating a skeleton lying at the bottom, its bony arms wrapped around a heavy-looking chest.`,
                items: () => [new Item('singing stone', 'A smooth, grey stone that vibrates gently.', true, true)]
            },
            {
                // State 3: The Geyser Powered Bathhouse
                description: `You are in a large, circular chamber filled with warm, humid steam. The room now seems to be a bathhouse, with walls and floors made of smooth, colorful tiles. In the center, a natural geyser is capped with an intricate bronze grille. Every minute or so, it erupts with a gentle whoosh, sending a plume of clean, hot water into a series of stone basins and pools around the room. The walls are covered in mosaics depicting krakens, mermen, and other aquatic creatures enjoying a spa day. The air smells of sulfur and lavender soap.`,
                items: () => []
            },
            {
                // State 4: The Goblin Casino
                description: `The room is a disaster. It was clearly once a makeshift, low-rent casino run by goblins. A roulette wheel made from a painted shield lies on its side, a card table is covered in crude, goblin-drawn cards depicting leering faces, and a "slot machine" built from scrap metal, gears, and a large bear trap for a lever stands in the corner. The floor is sticky with spilled grog, and the air smells of rust and disappointment.`,
                items: () => []
            },
            {
                // State 5: A Mini Metropolis
                description: `What a breathtaking sight! You are in a cavernous chamber, but you stand like a giant overlooking a miniature, bustling city that covers a massive, table-like plateau in the centre of the room. Tiny, perfect cobblestone streets, multi-story buildings, and a grand castle are all laid out below. The city is alive with the movement of thousands of tiny, inch-tall figures going about their day. A tiny river of actual, flowing water bisects the city, crossed by delicate arching bridges. The only sounds are the faint, collective hum of the city's mechanisms and the drip of water from a distant stalactite.`,
                items: () => []
            },
            {
                // State 6: The Hall of Living Memories
                description: `You enter a long, quiet hall lined with featureless, humanoid statues carved from pale, smooth stone. As you draw near a statue, it shimmers, and a memory plays out across its surface like a silent film projection: a soldier's tearful farewell, a scholar's moment of discovery, a thief's narrow escape. The memories are silent but emotionally potent. The air is still and carries the faint scent of dust and forgotten tears.`,
                items: () => []
            }
        ];
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

    _changeMercurialDen() {
        const den = this.game.worldMap['chamber'];
        const numStates = this.mercurialDenStates.length;
        if (numStates <= 1) return; // Cannot change state if there's only one or zero states.

        const currentStateIndex = this.game.gameStateFlags.mercurialDenStateIndex;

        let newStateIndex;
        do {
            newStateIndex = Math.floor(Math.random() * numStates);
        } while (newStateIndex === currentStateIndex); // Ensure the new state is different

        this.game.gameStateFlags.mercurialDenStateIndex = newStateIndex;
        const newState = this.mercurialDenStates[newStateIndex];

        // Update room description and items
        den.description = newState.description;
        den.items = []; // Clear old items
        newState.items().forEach(item => den.addItem(item)); // Use function to get new instances
    }

    _handleMovement(direction) {
        const allowedDirections = ['forward', 'back', 'left', 'right'];
        if (!allowedDirections.includes(direction)) {
            return `You can only move in these directions: forward, back, left, right.`;
        }

        let newRoom = null;
        const previousRoom = this.game.currentRoom;

        // Determine the new room
        if (direction === 'back') {
            if (this.game.roomHistory.length > 0) {
                newRoom = this.game.roomHistory.pop();
            } else {
                return "You can't go back any further.";
            }
        } else {
            newRoom = this.game.currentRoom.getExit(direction);
            if (newRoom && this.game.currentRoom.lockedExits[direction]) {
                return "That way is locked.";
            }
        }

        if (!newRoom) {
            return `You cannot go ${direction} from here.`;
        }

        // Add to history only for forward/left/right movements, not for 'back'
        if (direction !== 'back') {
            this.game.roomHistory.push(this.game.currentRoom);
        }

        // Update the current room
        this.game.currentRoom = newRoom;

        // --- Post-movement triggers ---

        const isEnteringMercurialDen = this.game.currentRoom.name === 'The Mercurial Den';
        // If the den has been activated (crystal taken), it should change state upon entry.
        if (isEnteringMercurialDen && this.game.gameStateFlags.mercurialDenActive) {
            this._changeMercurialDen();
        }

        // Dynamic Exit Logic for Forgotten Temple
        if (this.game.currentRoom.name === 'The Forgotten Temple' && previousRoom.name === 'Winding Passage') {
            const temple = this.game.currentRoom;
            const market = this.game.worldMap['market'];
            const scriptorium = this.game.worldMap['scriptorium'];

            temple.exits = {};
            temple.lockedExits = {};
            temple.setExit('left', market);
            temple.setExit('right', scriptorium);
            temple.setLockedExit('back', previousRoom, true);
        }

        // Generate response message
        const moveMessage = direction === 'back' ? 'You go back.' : `You move ${direction}.`;
        return `${moveMessage}\n\n${this.game.currentRoom.getDescription(this.game.player)}`;
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

        if (this.game.currentRoom.name === 'The Mercurial Den') {
            if (target.toLowerCase() === 'coin purse') {
                const purse = this.game.currentRoom.items.find(i => i.name.toLowerCase() === 'coin purse');
                if (purse) {
                    this.game.currentRoom.removeItem(purse);
                    this.game.currentRoom.addItem(new Item('4 gold coins', 'A small pile of four gold coins.', true, false));
                    return 'You open the purse and find four gold coins inside.';
                }
            }
            if (target.toLowerCase() === 'blue feather hand fan') {
                const fan = this.game.currentRoom.items.find(i => i.name.toLowerCase() === 'blue feather hand fan');
                if (fan) {
                    this.game.currentRoom.removeItem(fan);
                    // The blue feather acts as the new blue key
                    this.game.currentRoom.addItem(new Item('blue feather', 'A single, large feather that seems to have a faint blue glow about it. It feels strangely sturdy.', true, true));
                    return "You pick up the hand fan for a closer look. As you handle it, one of the feathers comes loose and falls onto the chair. It seems to have a faint blue glow about it. The rest of the fan feels mundane.";
                }
            }
        }

        // Special case for the fruit bowl in The Cabin
        if (this.game.currentRoom.name === 'The Cabin' && target.toLowerCase() === 'fruit bowl') {
            const fruitBowl = this.game.currentRoom.items.find(i => i.name.toLowerCase() === 'fruit bowl');
            if (fruitBowl) {
                this.game.currentRoom.removeItem(fruitBowl);
                // The apple is takeable and usable, the other fruits are just for flavor.
                const apple = new Item('red apple', 'A shiny red apple that emits a faint, warm glow.', true, true);
                this.game.currentRoom.addItem(apple);
                return 'you empty the fruit bowl on to the table. It holds 3 peaches, 2 bananas, a bushel of green grapes, 1 kiwi and a red apple that seems to have a faint glow about it.';
            }
        }

        // Special case for the cabin in Haven Shield
        if (this.game.currentRoom.name === 'Haven Shield' && target.toLowerCase() === 'cabin') {
            // If the forward exit is locked, unlock it upon inspection.
            if (this.game.currentRoom.lockedExits['forward'] === 'inspect_cabin') {
                this.game.currentRoom.unlockExit('forward');
            }
            return "You approach the rustic cabin. The wooden planks are weathered but sturdy. You notice the door is slightly ajar, inviting you to go forward.";
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

        if (!item) {
            return `There is no ${itemName} here.`;
        }

        // --- Special trigger for the crystal in The Mercurial Den ---
        if (item.name.toLowerCase() === 'crystal' && this.game.currentRoom.name === 'The Mercurial Den') {
            this.game.player.addItem(item);
            this.game.currentRoom.removeItem(item);
            this.game.gameStateFlags.mercurialDenActive = true;
            // Set state index to -1 so the first change can be to any state.
            this.game.gameStateFlags.mercurialDenStateIndex = -1;
            // This message hints at the new room behavior.
            return `You take the glowing crystal. As your fingers touch it, the air in the chamber hums and the other crystals on the walls flare with a blinding light. You feel a strange, disorienting energy wash over you. The room seems to settle, but you have a feeling it will not remain the same.`;
        }

        if (!item.canTake) {
            // Check for a custom "can't take" message
            if (item.onTakeFailMessage) {
                return item.onTakeFailMessage;
            }
            return `You cannot take the ${item.name}.`;
        }

        // Special handling for gold coins to be added directly to player's gold
        if (item.name.toLowerCase() === 'gold coins') {
            this.game.player.gold += 2; // The item's description implies 2 gold coins
            this.game.currentRoom.removeItem(item);
            return `You take the 2 gold coins and add them to your pouch. You now have ${this.game.player.gold} gold.`;
        }

        // Special handling for the 4 gold coins from the coin purse
        if (item.name.toLowerCase() === '4 gold coins') {
            this.game.player.gold += 4;
            this.game.currentRoom.removeItem(item);
            return `You take the 4 gold coins and add them to your pouch. You now have ${this.game.player.gold} gold.`;
        }

        // --- Special trigger for the Ornate Compass in the Treasure Room ---
        if (item.name.toLowerCase() === 'ornate compass' && this.game.currentRoom.name === 'The Treasure Room') {
            this.game.player.addItem(item);
            this.game.currentRoom.removeItem(item);
            this.game.gameStateFlags.hasOrnateCompassQuest = true; // This flag will be used later for new content
            return "You take the ornate compass. It feels warm to the touch and the needle spins wildly for a moment before settling. You feel a sense of new purpose, as if unseen paths are now open to you. The treasure can wait; adventure calls.";
        }

        // --- Special trigger for the Treasure Chest (Game End) ---
        if (item.name.toLowerCase() === 'treasure chest' && this.game.currentRoom.name === 'The Treasure Room') {
            const gameplayScreen = document.getElementById('gameplayScreen');
            const endGameScreen = document.getElementById('endGameScreen');
            const playAgainButton = document.getElementById('playAgainButton');

            if (gameplayScreen && endGameScreen && playAgainButton) {
                gameplayScreen.classList.remove('active');
                endGameScreen.classList.add('active');

                // Add a one-time event listener to the button to prevent multiple bindings.
                playAgainButton.addEventListener('click', () => {
                    location.reload(); // Reload the page to restart the game.
                }, { once: true });
            }
            return ' '; // Return a space to prevent "You take the..." message from appearing.
        }

        this.game.player.addItem(item); // Use player's addItem method
        this.game.currentRoom.removeItem(item);
        return `You take the ${itemName}.`;
    }

    _handleUse(itemName) {
        const player = this.game.player;
        const room = this.game.currentRoom;
        const item = player.getItem(itemName.toLowerCase());

        if (item) {
            // --- Special Case: Vault Puzzle ---
            if (room.name === 'The Vault') {
                if (item.name.toLowerCase() === 'red apple') {
                    // Check if door is locked and player has the other key
                    if (player.hasItem('blue feather') && room.lockedExits['forward'] === 'vault_puzzle') {
                        player.removeItem(item); // Consume the apple
                        this.game.gameStateFlags.vaultAppleUsed = true;
                        return "You notice the image changing, the fruits, now clearer, hanging on the tree are indeed big red apples.";
                    }
                }
                if (item.name.toLowerCase() === 'blue feather') {
                    // Check if apple has been used
                    if (this.game.gameStateFlags.vaultAppleUsed) {
                        player.removeItem(item); // Consume the feather
                        room.unlockExit('forward');
                        const newDescription = "You watch as a small blue bird flits from the nest. The door gives one final pulse of light, and begins to shift and spiral open from the center, towards its outer frame, revealing a single simple stained glass door.";
                        room.description = newDescription;
                        this.game.gameStateFlags.vaultAppleUsed = false; // Reset flag
                        return newDescription;
                    }
                }
            }
            // --- End Special Case ---

            const usageResult = item.use(player, room);

            if (item.isConsumed) {
                player.removeItem(item);
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