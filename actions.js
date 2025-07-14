import { Item } from './items.js';
import { MonsterFactory } from './monsters.js';

export class ActionHandler {
    constructor(gameInstance, gameItems) {
        this.game = gameInstance; // Provides access to game.player, game.currentRoom, game.battleSystem etc.
        this.randomEncounterChance = 0.25; // <-- Adjust this value for encounter rate (e.g., 0.1 for 10%, 0.5 for 50%)
        this.gameItems = gameItems; // Store reference to all game items
        this.mercurialDenStates = [
            {
                description: `You seem to be stood in the centre of a small island of calm. Here, an armchair, a side table, and a lamp rest on a worn rug, creating a single point of order in a room that has otherwise exploded into a chaos of costumes. Gowns, glittering jewellery, feather boas, and masks are strewn everywhere, spilling from wardrobes and covering every available surface in a colourful, cluttered mess.`,
                items: () => [
                    this.gameItems.coinPurse,
                    this.gameItems.blueFeatherHandFan,
                    this.gameItems.mediumHealthPotion,
                    this.gameItems.pieceOfCandy
                ]
            },
            {
                // State 2: The Fungi Forest
                description: `The air grows damp and earthy as you push through a curtain of thick, hanging moss. You enter a cavern that glows with an eerie, beautiful light. The entire room is a forest of fungi. Towering mushrooms, some as tall as trees, form a canopy of pulsating, bioluminescent caps in shades of deep blue, vibrant purple, and sickly green. The ground is a soft, springy carpet of white mycelium that muffles your footsteps. The air hums with a low, resonant frequency, and the only other sound is the slow drip-drip-drip of condensation falling from the giant caps onto smaller mushroom clusters below.
                In the centre of the room, a ring of flat-topped, waist-high toadstools are arranged like chairs around a single, petrified stump that serves as a table. Upon this stump sits a half-finished game of chess. On the mushroom chessboard: The "White King" a mejestic dragon is carved from a rare, imperial, bone-white jadeite.
                Near the far wall, a small waterfall of phosphorescent slime trickles down the rock face into a crystal-clear pool, illuminating a skeleton lying at the bottom, its bony arms wrapped around a heavy-looking chest.`,
                items: () => [
                    this.gameItems.singingStone,
                    this.gameItems.ironSkinFungi,
                    this.gameItems.whiteKing
                ]
            },
            {
                // State 3: The Geyser Powered Bathhouse
                description: `You are in a large, circular chamber filled with warm, humid steam. The room now seems to be a bathhouse, with walls and floors made of smooth, colorful tiles. In the center, a natural geyser is capped with an intricate bronze grille. Every minute or so, it erupts with a gentle whoosh, sending a plume of clean, hot water into a series of stone basins and pools around the room. The walls are covered in mosaics depicting krakens, mermen, and other aquatic creatures enjoying a spa day. The air smells of sulfur and lavender soap.`,
                items: () => []
            },
            {
                // State 4: The Goblin Casino
                description: `The room is a disaster. It was clearly once a makeshift, low-rent casino run by goblins. A roulette wheel made from a painted shield lies on its side, a card table is covered in crude, goblin-drawn cards depicting leering faces, and a "slot machine" built from scrap metal, gears, and a large bear trap for a lever stands in the corner. The floor is sticky with spilled grog, and the air smells of rust and disappointment.`,
                items: () => [
                    this.gameItems.largeHealthPotion,
                    this.gameItems.stickyLeatherPouch
                ]
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
            'inventory': this._handleInventory,
            'inv': this._handleInventory,
            'i': this._handleInventory,
            'stats': this._handleStats,
            'status': this._handleStats,
            'st': this._handleStats,
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

    _findInList(partialName, list) {
        if (!partialName || !list || list.length === 0) return null;
        const lowerCasePartialName = partialName.toLowerCase();

        // 1. Prioritize exact match.
        // This prevents 'use potion' from using a 'super potion' if a regular 'potion' also exists.
        let entity = list.find(e => e.name.toLowerCase() === lowerCasePartialName);
        if (entity) return entity;

        // 2. Fallback to partial match (finds the first one).
        // This allows 'inspect fan' to find 'blue feather hand fan'.
        return list.find(e => e.name.toLowerCase().includes(lowerCasePartialName));
    }

    _findItemStack(partialName, list) {
        if (!partialName || !list || list.length === 0) return null;
        const lowerCasePartialName = partialName.toLowerCase();

        // This function assumes `list` is an array of stacks: [{item, quantity}, ...]
        // It's designed to work with room and player inventories.

        // 1. Prioritize exact match on item name.
        let stack = list.find(s => s.item.name.toLowerCase() === lowerCasePartialName);
        if (stack) return stack;

        // 2. Fallback to partial match.
        return list.find(s => s.item.name.toLowerCase().includes(lowerCasePartialName));
    }

    _handleRandomEncounter() {
        // Find the ID of the current room.
        const currentRoomId = Object.keys(this.game.worldMap).find(key => this.game.worldMap[key] === this.game.currentRoom);

        // Define safe zones where encounters should not happen.
        const SAFE_ROOM_IDS = ['entrance', 'courtyard', 'grebs', 'safezone', 'cabin', 'treasureRoom', 'chamber'];

        // 1. Check if the room is a safe zone or already has monsters/NPCs.
        if (!currentRoomId || SAFE_ROOM_IDS.includes(currentRoomId) || this.game.currentRoom.monsters.length > 0 || this.game.currentRoom.npcs.length > 0) {
            return ''; // No encounter.
        }

        // 2. Roll for an encounter using the configurable chance.
        if (Math.random() < this.randomEncounterChance) {
            // 3. An encounter happens! Select a random monster factory function.
            const randomMonsterFactories = [
                MonsterFactory.createGoblin,
                MonsterFactory.createSpider,
                MonsterFactory.createGreyImp
            ];
            const monsterFactoryFunction = randomMonsterFactories[Math.floor(Math.random() * randomMonsterFactories.length)];
            const newMonster = monsterFactoryFunction();

            // 4. Add the monster to the room.
            this.game.currentRoom.addMonster(newMonster);

            // 5. Return a message to be appended to the room description.
            return `\n\nSuddenly, a wild ${newMonster.name} appears from the shadows!`;
        }

        return ''; // No encounter.
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
            const lockType = this.game.currentRoom.lockedExits[direction];

            if (newRoom && lockType) {
                // --- Special Lock Handling ---
                if (lockType === 'rps') {
                    this.game.interactionState = 'rps_prompt';
                    return "The door is locked with a game of chance. Do you want to try your luck? (yes/no)";
                }
                if (lockType === 'white_king') {
                    if (this.game.player.hasItem('White King')) {
                        // Player has the key, allow passage by not returning a locked message.
                    } else {
                        return "A secret passage is here, but it seems sealed by some ancient magic. A kingly artifact might be the key.";
                    }
                }
                // --- End Special Lock Handling ---
                return `That way is locked.`;
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

            // Non-destructive update: Clear the existing exit objects instead of replacing them.
            // This preserves the room object's integrity and fixes the item interaction bug.
            for (const prop in temple.exits) { delete temple.exits[prop]; }
            for (const prop in temple.lockedExits) { delete temple.lockedExits[prop]; }

            temple.setExit('left', market);
            temple.setExit('right', scriptorium);
            temple.setLockedExit('back', previousRoom, true);
        }

        // --- Random Encounter Trigger ---
        const encounterMessage = this._handleRandomEncounter();

        // Generate response message
        const moveMessage = direction === 'back' ? 'You go back.' : `You move ${direction}.`;
        const roomDescription = this.game.currentRoom.getDescription(this.game.player);

        return `${moveMessage}\n\n${roomDescription}${encounterMessage}`;
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

        // First, try to find an item in the room that matches the target.
        const itemStack = this._findItemStack(target, this.game.currentRoom.items);
        const item = itemStack ? itemStack.item : null;

        // If an item is found, check for special inspection logic.
        if (item) {
            const itemName = item.name.toLowerCase();
            const roomName = this.game.currentRoom.name;

            // --- Special Item Inspections ---

            // Mercurial Den Items
            if (roomName === 'The Mercurial Den') {
                if (itemName === this.gameItems.coinPurse.name.toLowerCase()) {
                    const goldCoinItem = this.gameItems.goldCoin;
                    this.game.currentRoom.removeItem(item);
                    this.game.currentRoom.addItem(goldCoinItem, 4);
                    return 'You open the purse and find four gold coins inside.';
                }
                if (itemName === this.gameItems.blueFeatherHandFan.name.toLowerCase()) {
                    this.game.currentRoom.removeItem(item);
                    // The blue feather acts as the new blue key
                    this.game.currentRoom.addItem(this.gameItems.blueFeather);
                    return "You pick up the hand fan for a closer look. As you handle it, one of the feathers comes loose and falls onto the chair. It seems to have a faint blue glow about it. The rest of the fan feels mundane.";
                }
                if (itemName === this.gameItems.stickyLeatherPouch.name.toLowerCase()) {
                    const goldCoinItem = this.gameItems.goldCoin;
                    this.game.currentRoom.removeItem(item);
                    this.game.currentRoom.addItem(goldCoinItem, 13);
                    return 'You untie the rotting twine on the greasy pouch. It falls apart in your hands, revealing 13 gold coins!';
                }
            }

            // Dented Helmet in Armoury
            if (roomName === 'Clinker\'s Armoury' && itemName === 'dented helmet') {
                if (!this.game.gameStateFlags.foundHelmetPotion) {
                    this.game.gameStateFlags.foundHelmetPotion = true; // Set flag to prevent finding it again
                    const potion = this.gameItems.mediumHealthPotion;
                    this.game.currentRoom.addItem(potion);
                    return 'You peer inside the dented helmet and find a medium health potion tucked away inside the padding. Lucky find!';
                } else {
                    return 'It\'s just an old, dented helmet. You\'ve already checked it.';
                }
            }

            // Writing Desk in Scriptorium
            if (roomName === 'The Scriptorium' && itemName === 'writing desk') {
                if (!this.game.gameStateFlags.foundDeskPotion) {
                    this.game.gameStateFlags.foundDeskPotion = true;
                    const potion = this.gameItems.mediumHealthPotion;
                    this.game.currentRoom.addItem(potion);
                    return 'You rummage through the drawers of the writing desk. Tucked away beneath some old parchments, you discover a medium health potion.';
                } else {
                    return 'A large, imposing writing desk. You\'ve already checked it.';
                }
            }

            // Fruit Bowl in Cabin
            if (roomName === 'The Cabin' && itemName === 'fruit bowl') {
                this.game.currentRoom.removeItem(item);
                const apple = this.gameItems.redApple;
                this.game.currentRoom.addItem(apple);
                return 'You look closer at the fruit bowl. Most of the fruit is mundane, but nestled among them is a single, perfect red apple that seems to have a faint glow about it. You take the apple, leaving the rest.';
            }

            // If no special logic matches, return the default description.
            return item.examine();
        }

        // --- Non-Item Inspections ---

        // Special case for the cabin in Haven Shield
        if (this.game.currentRoom.name === 'Haven Shield' && target.toLowerCase() === 'cabin') {
            if (this.game.currentRoom.lockedExits['forward'] === 'inspect_cabin') {
                this.game.currentRoom.unlockExit('forward');
            }
            return "You approach the rustic cabin. The wooden planks are weathered but sturdy. You notice the door is slightly ajar, inviting you to go forward.";
        }

        const monster = this._findInList(target, this.game.currentRoom.monsters);
        if (monster) {
            return monster.description;
        }

        const npc = this._findInList(target, this.game.currentRoom.npcs);
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
            const itemDescriptions = items.map(stack => {
                return stack.quantity > 1 ? `${stack.quantity}x ${stack.item.name}` : stack.item.name;
            });
            result += 'You find: ' + itemDescriptions.join(', ') + '\n';
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

    _handleTake(fullInput) {
        // Step 1: Parse input for quantity and item name
        if (!fullInput) {
            return "What do you want to take?";
        }

        let quantity = 1;
        let itemName = fullInput.trim();

        if (parts[0] === 'all') {
            quantity = 'all';
            itemName = parts.slice(1).join(' ').trim();
        } else if (!isNaN(parseInt(parts[0], 10))) {
            const num = parseInt(parts[0], 10);
            if (num <= 0) {
                return "You must take a positive number of items.";
            }
            quantity = num;
            itemName = parts.slice(1).join(' ').trim();
        }

        // After parsing, ensure an item name was actually provided.
        if (!itemName) {
            return "What do you want to take?";
        }

        // Step 2: Find the item stack in the room
        const roomItemStack = this._findItemStack(itemName, this.game.currentRoom.items);

        if (!roomItemStack) {
            return `There is no ${itemName} here.`;
        }

        // Step 3: Determine quantities and identify the item
        const item = roomItemStack.item;
        const availableQuantity = roomItemStack.quantity;
        const amountToTake = (quantity === 'all') ? availableQuantity : Math.min(quantity, availableQuantity);
        const itemNameLower = item.name.toLowerCase();
        const roomName = this.game.currentRoom.name;

        // Step 4: Handle special-case items BEFORE the generic logic
        // --- Special trigger for the crystal in The Mercurial Den ---
        if (itemNameLower === 'crystal' && roomName === 'The Mercurial Den') {
            this.game.player.addItem(item, 1); // It's a unique, single item
            this.game.currentRoom.items = this.game.currentRoom.items.filter(stack => stack !== roomItemStack);
            this.game.gameStateFlags.mercurialDenActive = true;
            this.game.gameStateFlags.mercurialDenStateIndex = -1; // Allows first change to be any state
            return `You take the glowing crystal. As your fingers touch it, the air in the chamber hums and the other crystals on the walls flare with a blinding light. You feel a strange, disorienting energy wash over you. The room seems to settle, but you have a feeling it will not remain the same.`;
        }

        // --- Special trigger for the Treasure Chest (Game End) ---
        if (itemNameLower === 'treasure chest' && roomName === 'The Treasure Room') {
            const gameplayScreen = document.getElementById('gameplayScreen');
            const endGameScreen = document.getElementById('endGameScreen');
            const playAgainButton = document.getElementById('playAgainButton');

            if (gameplayScreen && endGameScreen && playAgainButton) {
                const endGameTitle = document.getElementById('endGameTitle');
                const endGameMessage = document.getElementById('endGameMessage');

                if (endGameTitle && endGameMessage) {
                    endGameTitle.textContent = 'Congratulations!';
                    endGameMessage.textContent = 'You have beaten the Labyrinth of Lyre and claimed its legendary treasure!';
                }

                gameplayScreen.classList.remove('active');
                endGameScreen.classList.add('active');
                playAgainButton.addEventListener('click', () => location.reload(), { once: true });
            }
            return ' '; // Return a space to prevent "You take the..." message
        }

        // --- Special trigger for the Ornate Compass in the Treasure Room ---
        if (itemNameLower === 'ornate compass' && roomName === 'The Treasure Room') {
            this.game.player.addItem(item, 1);
            this.game.currentRoom.items = this.game.currentRoom.items.filter(stack => stack !== roomItemStack);
            this.game.gameStateFlags.hasOrnateCompassQuest = true;
            return "You take the ornate compass. It feels warm to the touch and the needle spins wildly for a moment before settling. You feel a sense of new purpose, as if unseen paths are now open to you. The treasure can wait; adventure calls.";
        }

        // Step 5: Handle generic take rules
        if (!item.canTake) {
            return item.onTakeFailMessage || `You cannot take the ${item.name}.`;
        }

        // Use an if/else block to clearly separate gold from other items.
        // This fixes a subtle bug where the logic for non-gold items was not being correctly executed.
        if (item.goldValue && item.goldValue > 0) {
            // --- Gold Handling ---
            this.game.player.addItem(item, amountToTake);
            roomItemStack.quantity -= amountToTake;
            if (roomItemStack.quantity <= 0) {
                this.game.currentRoom.items = this.game.currentRoom.items.filter(stack => stack !== roomItemStack);
            }
            return `You take ${amountToTake} ${item.name}(s). You now have ${this.game.player.getGold()} gold.`;
        } else {
            // --- Default Item Handling ---
            this.game.player.addItem(item, amountToTake);
            roomItemStack.quantity -= amountToTake;
            if (roomItemStack.quantity <= 0) {
                this.game.currentRoom.items = this.game.currentRoom.items.filter(stack => stack !== roomItemStack);
            }

            if (amountToTake > 1) {
                return `You take ${amountToTake} ${item.name}s.`;
            } else {
                return `You take the ${item.name}.`;
            }
        }
    }

    _handleUse(itemName) {
        const player = this.game.player;
        const room = this.game.currentRoom;
        // Find the item stack in the player's inventory.
        const itemStack = this._findItemStack(itemName, player.inventory);

        if (itemStack) {
            const item = itemStack.item;

            // Potion logic is now centralized in item.js.
            // We keep special contextual logic here, like for the Vault puzzle.

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
                player.removeItem(item, 1); // Explicitly remove one item from the stack
                this.game.updateStatusBars(); // Update UI if a consumable was used (e.g., potion)
            }
            return usageResult;
        }
        return `You don't have a ${itemName}.`;
    }

    _handleDrop(itemName) {
        // Find the item stack in the player's inventory.
        const itemStack = this._findItemStack(itemName, this.game.player.inventory);
        const item = itemStack ? itemStack.item : null;
        if (item) {
            this.game.player.removeItem(item, 1); // Remove one instance from player's inventory
            this.game.currentRoom.addItem(item, 1); // Add one instance to the current room's items
            return `You drop the ${itemName}.`;
        }
        return `You don't have a ${itemName} to drop.`;
    }

    _handleBattle(target) {
        let monster;
        if (target) {
            // Find monster by partial name
            monster = this._findInList(target, this.game.currentRoom.monsters);
        } else if (this.game.currentRoom.monsters.length > 0) {
            // If no target is specified, attack the first monster in the room.
            monster = this.game.currentRoom.monsters[0];
        }
        if (monster) {
            return this.game.battleSystem.startBattle(this.game.player, monster, this.game.currentRoom);
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

        // Allow for "talk to [npc]" by stripping "to " if it exists.
        let targetString = fullTarget.toLowerCase();
        if (targetString.startsWith('to ')) {
            targetString = targetString.substring(3).trim();
        }

        // Parse the input for a target and an optional topic
        const parts = targetString.split(' about ');
        const npcName = parts[0].trim();
        const topic = parts.length > 1 ? parts[1].trim() : 'default';

        // Find the NPC in the current room
        const npc = this._findInList(npcName, this.game.currentRoom.npcs);

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
        response += `\nYou have ${this.game.player.getGold()} gold.`;
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

        const lowerCaseItemName = itemName.toLowerCase();
        // Prioritize exact match
        let itemToBuy = shopkeeper.shopInventory.find(stock => stock.item.name.toLowerCase() === lowerCaseItemName);
        if (!itemToBuy) {
            // Fallback to partial match
            itemToBuy = shopkeeper.shopInventory.find(stock => stock.item.name.toLowerCase().includes(lowerCaseItemName));
        }

        if (!itemToBuy) {
            return `${shopkeeper.name} doesn't have a "${itemName}" for sale.`;
        }

        const playerGold = this.game.player.getGold();
        if (playerGold < itemToBuy.price) {
            return `You don't have enough gold. You need ${itemToBuy.price} gold, but you only have ${playerGold}.`;
        }

        if (this.game.player.spendGold(itemToBuy.price)) {
            this.game.player.addItem(itemToBuy.item);
            // Remove the purchased item from the shop's inventory
            shopkeeper.shopInventory = shopkeeper.shopInventory.filter(stock => stock.item.name.toLowerCase() !== itemToBuy.item.name.toLowerCase());
            return `You bought the ${itemToBuy.item.name} for ${itemToBuy.price} gold. You have ${this.game.player.getGold()} gold left.`;
        }
        return "An unknown error occurred during your purchase."; // Fallback
    }

    _handleInventory() {
        let inventoryText = this.game.player.getInventoryList();
        inventoryText += `\n\nGold: ${this.game.player.getGold()}`;
        return inventoryText;
    }

    _handleStats() {
        const player = this.game.player;
        const expForNextLevel = player.level * 100;
        let statsText = `<strong>--- ${player.name}'s Stats ---</strong>\n\n`;
        statsText += `Level: ${player.level}\n`;
        statsText += `Experience: ${player.experience}/${expForNextLevel}\n`;
        statsText += `Health: ${player.health}/${player.maxHealth}\n`;
        statsText += `Attack: ${player.attack}\n`;
        statsText += `Defense: ${player.defense}\n`;
        statsText += `Agility: ${player.agility}\n`;
        statsText += `Intelligence: ${player.intelligence}\n`;
        statsText += `Charisma: ${player.charisma}`;
        // Total gold is shown in the inventory, not in stats.
        // statsText += `\n\nGold: ${this.game.player.gold}`;
        return statsText;
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
            "<strong>inventory (or inv, i)</strong>: Check the items you are carrying.",
            "<strong>stats (or status, st)</strong>: Check your character's current stats.",
            "<strong>pick [direction]</strong>: Attempt to pick a locked door in a given direction (e.g., 'pick left'). This requires a 'lockpick' in your inventory.",
            "<strong>attack [monster]</strong>: Engage in combat with a monster.",
            "<strong>flee</strong>: Attempt to run away from a battle.",
            "<strong>play [choice]</strong>: Play a game of chance when prompted (e.g., 'play rock').",
            "<strong>talk to [person]</strong> or <strong>talk to [person] about [topic]</strong>: Speak to a friendly character.",
            "<strong>list</strong>: Shows items for sale if a shopkeeper is present.",
            "<strong>buy [item]</strong>: Purchase an item from a shopkeeper."
        ];
        return helpTitle + commands.join('\n\n');
    }
}