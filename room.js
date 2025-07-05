import { Item } from './items.js';
import { Monster } from './monsters.js';
import { NPC } from './characters.js';

export class Room {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.exits = {};
        this.items = [];
        this.monsters = [];
        this.npcs = [];
        this.visited = false;
        this.lockedExits = {}; // New property to store locked exits
    }
    
    setExit(direction, room) {
        this.exits[direction] = room;
    }
    
    setLockedExit(direction, room, keyName = 'lockpick') {
        this.exits[direction] = room;
        this.lockedExits[direction] = keyName;
    }

     addItem(item) {
        this.items.push(item);
    }
    
    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }
    
    addMonster(monster) {
        this.monsters.push(monster);
    }
    
    addNPC(npc) {
        this.npcs.push(npc);
    }

    removeMonster(monster) {
        const index = this.monsters.indexOf(monster);
        if (index > -1) {
            this.monsters.splice(index, 1);
        }
    }
    
    getDescription(player) { // Pass player to allow for dynamic descriptions
        this.visited = true;
        let baseDesc = this.description;

        // Dynamic description for the Vault based on player inventory
        if (this.name === 'The Vault' && player && player.hasItem('red apple') && player.hasItem('blue key')) {
            baseDesc = 'A massive, circular iron door dominates one wall of this room. It is sealed shut with no obvious handle or lock. Finely etched into its surface is the depiction of a great tree, its branches heavy with what look like round fruit. A small, empty nest is tucked among the boughs, and a dark, fist-sized hollow is visible in the trunk. The entire etching now emits a strong pulse, almost like a heartbeat, bathing the room in a rhythmic purple glow.';
        }

        let desc = `${this.name}\n${baseDesc}`;
        
        if (this.items.length > 0) {
            desc += `\n\nYou see: ${this.items.map(item => item.name).join(', ')}`;
        }
        
        if (this.monsters.length > 0) {
            desc += `\n\nCreatures present: ${this.monsters.map(monster => monster.name).join(', ')}`;
        }

        if (this.npcs.length > 0) {
            desc += `\n\nPeople here: ${this.npcs.map(npc => npc.name).join(', ')}`;
        }
        
        const exitList = Object.keys(this.exits);
        if (exitList.length > 0) {
            const formattedExits = exitList.map(direction => {
                if (this.lockedExits[direction]) {
                    return `${direction} (locked)`; // Keep template literal for consistency
                } else {
                    return direction;
                }
            });
            desc += `\n\nExits: ${formattedExits.join(', ')}`;
        }
        
        return desc;
    }
    
    hasExit(direction) {
        return this.exits.hasOwnProperty(direction);
    }
    
    getExit(direction) {
        return this.exits[direction];
    }

    unlockExit(direction) {
        if (this.lockedExits[direction]) {
            const destinationRoom = this.exits[direction];
            const exitName = destinationRoom.name;

            // Unlock this side
            delete this.lockedExits[direction];

            // Find and unlock the return path on the other side
            for (const returnDir in destinationRoom.exits) {
                if (destinationRoom.exits[returnDir] === this) {
                    if (destinationRoom.lockedExits[returnDir]) {
                        delete destinationRoom.lockedExits[returnDir];
                    }
                    break;
                }
            }

            return `You've unlocked the exit to the ${exitName}!`;
        }
        return `The exit to the ${this.exits[direction].name} wasn't locked.`;
    }
}

export function createWorld() {
    // --- 1. Define World Data ---
    const roomData = {
        'entrance': { name: 'The Glade', description: 'After what feels like an eternity of pushing through an unforgiving, dense forest, the trees finally part. You step into a secluded glade, a place that feels untouched by time. The air is crisp, filled with the scent of damp earth and decaying leaves. A circle of towering trees, their leaves a brilliant tapestry of gold, crimson, and amber, stands as silent sentinels, walling this place off from the outside world. It\'s clear why this glade has remained hidden for so long.\n\nBefore you stands the true prize of your journey: the entrance to The Labyrinth of Lyre, Adorellan\'s most ancient and storied site. The entrance is formidable. Tall, ancient stone walls, grey and weathered with age, rise up to meet the sky. Set within these walls are thick, heavy wrought-iron gates, their surface pitted with rust and age. A dense curtain of thick, dark green vines chokes the gates, weaving through the bars so completely that nothing of the labyrinth beyond can be seen. The silence here is profound, broken only by the rustle of leaves under your feet.' },
        'courtyard': { name: 'The Garden of Grie', description: 'With a final, desperate shove, the ancient iron gates groan in protest, their rusted hinges screaming as they reluctantly give way. You stumble forward, catching your balance on the cracked flagstones of a vast, open courtyard. The air here is still and heavy, carrying the scent of dust and forgotten time. With a brief look you notice the discarded remains of old camps and items that belonged to brave adventures long since forgotten.\n\nIn the centre of the courtyard, a once-grand fountain lies in ruins. Its stone basin shattered, and the statue that once stood proudly at its heart is now a toppled, moss-covered casualty of age. A trickle of dark, stagnant water weeps from a crack, pooling on the ground below.\n\nYour eyes are drawn to the far side of the courtyard. Dominating the wall is a massive, intricate circular carving, its ancient design a complex web of interlocking lines and symbols that seem to writhe just at the edge of your vision. Flanking this mysterious emblem are two arched exits.\n\nTo the left, a sturdy iron gate, similar to the one you just forced open, blocks the archway, promising another challenge. To the right, the archway is filled with the splintered remains of a wooden door, hanging precariously from a single hinge, offering a seemingly easier, though perhaps more treacherous, path forward.' },
        'bunkers': { name: 'Bunker\'s Bend', description: 'Rows of dusty, empty bunks line the walls of this large, cold room. It seems to have been abandoned long ago.' },
        'clinkers': { name: 'Clinker\'s Armoury', description: 'This chamber serves as a makeshift armoury. Racks of rusted weapons and dented armour line the walls. Most of it is useless, but some treasures may yet remain.' },
        'market': { name: 'The Sunken Market', description: 'You step into what was clearly once a bustling underground market. Broken stalls and scattered, worthless goods litter the floor. It seems you are the first to enter in a very long time.' },
        'marketCorridor': { name: 'Short Corridor', description: 'A short, narrow corridor. About halfway down, a sturdy-looking wooden door blocks the path forward. A strange inscription on the door depicts a hand, a stone, and some parchment. It seems to be a game of chance. Do you try your luck?' },
        'bunkerHallway': { name: 'Cluttered Hallway', description: 'This hallway is cluttered with scattered bits and bobs left behind by previous inhabitants - tattered clothes, worthless trinkets, and other debris. It continues forward towards Bunker\'s Bend.' },
        'armouryHallway': { name: 'Decrepit Hallway', description: 'The splintered remains of a wooden door lead into this short, dusty hallway. It continues forward, where you can see the entrance to another chamber.' },
        'vault': { name: 'The Vault', description: 'A massive, circular iron door dominates one wall of this room. It is sealed shut with no obvious handle or lock. Finely etched into its surface is the depiction of a great tree, its branches heavy with what look like round fruit. A small, empty nest is tucked among the boughs, and a dark, fist-sized hollow is visible in the trunk. The entire etching glows with a faint, otherworldly purple light.' },
        'vaultHallway': { name: 'Vault Hallway', description: 'A short, sterile hallway with smooth stone walls. A simple revolving iron gate stands behind you, leading back to the market. Ahead, the hallway ends at the massive circular door of The Vault.' },
        'zHallway': { name: 'Z-Shaped Hallway', description: 'A cramped, narrow hallway that takes a sharp turn before continuing. The stone is cold and damp to the touch. One way leads towards the market, while the path behind you returns to the bunkers.' },
        'temple': { name: 'The Forgotten Temple', description: 'An eerie silence hangs in this grand temple. Faded murals on the walls depict forgotten gods.' },
        'safezone': { name: 'Haven Shield', description: 'The narrow corridor opens into a breathtaking, sun-dappled glade that feels entirely separate from the labyrinth. The walls are lined with ancient, towering trees, their leaves forming a dense canopy overhead. In the center of the glade is a serene, crystal-clear lake. On the far side of the lake stands a single, rustic-looking cabin. There are signs of others who have made it this far: the remnants of abandoned campfires and a discarded waterskin near the cabin\'s entrance.' },
        'grebs': { name: 'Greb\'s Grotto', description: 'This small, surprisingly cozy cavern is a chaotic mess of discarded adventuring gear. Piles of dented helmets, mismatched boots, and chipped shields are stacked against the walls. A small, friendly-looking red imp with large, curious eyes tends to a makeshift counter made from a large, flat rock. He seems to be sorting through a pile of rusty keys.' },
        'scriptorium': { name: 'The Scriptorium', description: 'You enter a large, almost grand chamber that feels like a sanctuary of knowledge. The walls are lined from floor to ceiling with towering shelves, heavy with ancient books, leather-bound tomes, and countless scrolls. In the center of the room, a large, imposing, writing desk stands beside a shorter shelf stacked high with fresh parchments and pots of ink. The air is still, carrying the faint scent of old paper and wax. Flickering lamps mounted on the walls cast a warm, dancing light across the room, making the shadows themselves seem to hold forgotten secrets.' },
        'chamber': { name: 'The Mercurial Den', description: 'A vast, circular chamber where the walls shimmer with thousands of luminescent crystals, casting a beautiful, eerie light.' },
        'grottoHallway': { name: 'Cluttered Passageway', description: 'A short passageway littered with discarded items - a broken lantern, a tattered cloak, and other adventuring debris. It seems to be a well-traveled route.' },
        'bendyHallway': { name: 'Winding Corridor', description: 'A long, winding corridor that bends out of sight. The air feels strangely calm and quiet here.' },
        'rockCrevice': { name: 'Rock Crevice', description: 'A narrow crevice in the rock face, almost hidden by overgrown vines. It looks like a tight squeeze.' },
        'hiddenCavern': { name: 'Hidden Cavern', description: 'The crevice opens into a small, damp cavern. A crude, heavy wooden door is set into the far wall.' },
        'windingPassage': { name: 'Winding Passage', description: 'Beyond the door is a long, winding passage carved from the rock. It slopes gently downwards and ends at another door, which looks like it can only be opened from this side.' },
        'cabin': { name: 'The Cabin', description: 'The interior of the cabin is a single, cluttered room. Pots and pans hang from the low ceiling, and shelves are crammed with a mix of food supplies—some look recently gathered, while others are long past their prime, hinting at a hurried or inconsistent inhabitant. A small fireplace sits to the left as you enter, with a small space cleared before it, A likely place where past adventurers have slept in safety and warmth.\n\nA small wooden table with two chairs sits in the center of the room; a leather vest is slung carelessly over the back of one. A wall cabinet with a door hanging precariously from a single hinge reveals a surprisingly well-stocked fruit bowl. In the sink, a glint of something colorful inside a glass catches your eye.' }
    };

    const connectionData = [
        { from: 'entrance', to: 'courtyard', direction: 'forward', returnDirection: 'back' },
        // Path from courtyard to clinkers (right exit)
        { from: 'courtyard', to: 'armouryHallway', direction: 'right', returnDirection: 'back' },
        { from: 'armouryHallway', to: 'clinkers', direction: 'forward', returnDirection: 'back' },
        // Path from courtyard to bunkers (left exit, locked)
        { from: 'courtyard', to: 'bunkerHallway', direction: 'left', returnDirection: 'back', locked: true },
        { from: 'bunkerHallway', to: 'bunkers', direction: 'forward', returnDirection: 'back' },
        // Path from Clinker's to the Market (left exit, locked)
        { from: 'clinkers', to: 'marketCorridor', direction: 'left', returnDirection: 'back' },
        { from: 'marketCorridor', to: 'market', direction: 'forward', returnDirection: 'back', locked: 'rps' },
        // Path from the Market to the Temple
        { from: 'market', to: 'temple', direction: 'forward', returnDirection: 'back' },
        { from: 'temple', to: 'scriptorium', direction: 'left', returnDirection: 'back' },
        { from: 'scriptorium', to: 'chamber', direction: 'forward', returnDirection: 'back' },
        // Path from the Market to the Vault
        { from: 'market', to: 'vaultHallway', direction: 'right', returnDirection: 'back' },
        { from: 'vaultHallway', to: 'vault', direction: 'forward', returnDirection: 'back' },
        // Path from the Market to the Bunkers (via a locked door from Bunkers)
        { from: 'market', to: 'zHallway', direction: 'left', returnDirection: 'back' },
        { from: 'bunkers', to: 'zHallway', direction: 'forward', returnDirection: 'back', locked: true, twoWayLock: true },
        // Paths from the Mercurial Den
        { from: 'chamber', to: 'grottoHallway', direction: 'forward', returnDirection: 'back' },
        { from: 'grottoHallway', to: 'grebs', direction: 'forward', returnDirection: 'back' },
        { from: 'chamber', to: 'bendyHallway', direction: 'right', returnDirection: 'back' },
        { from: 'bendyHallway', to: 'safezone', direction: 'forward', returnDirection: 'back' },
        { from: 'safezone', to: 'cabin', direction: 'forward', returnDirection: 'back', locked: 'inspect_cabin' },
        // New one-way path from Haven Shield to the Temple
        { from: 'safezone', to: 'rockCrevice', direction: 'right', returnDirection: 'back' },
        { from: 'rockCrevice', to: 'hiddenCavern', direction: 'forward', returnDirection: 'back' },
        { from: 'hiddenCavern', to: 'windingPassage', direction: 'forward', returnDirection: 'back' },
        { from: 'windingPassage', to: 'temple', direction: 'forward', oneWay: true },
    ];

    const itemPlacement = {
        'courtyard': [new Item('torch', 'A flickering torch that provides light in dark places.', true)],
        'chamber': [new Item('crystal', 'A glowing blue crystal that pulses with mystical energy.', true)],
        'clinkers': [new Item('sword', 'An ancient sword with mysterious runes etched into the blade.', true)],
        'armouryHallway': [new Item('lockpick', 'A set of lock picks, half-hidden under some debris. Useful for opening locked doors.', true)],
        'market': [new Item('potion', 'A healing potion, left behind on a stall.', true)], // Added a reward for getting into the market
        'grottoHallway': [new Item('potion', 'A healing potion, dropped carelessly on the floor.', true)],
        'safezone': [new Item('waterskin', 'A discarded waterskin, still half-full of clean water.', true)],
        'cabin': [
            new Item('leather vest', 'A simple vest made of hardened leather.', true),
            new Item('piece of candy', 'A piece of candy in a blue and purple wrapper.', true),
            new Item('fruit bowl', 'A well-stocked fruit bowl. It looks delicious.', false),
            new Item('gold coins', 'Two shiny gold coins.', true, false)
        ]
    };



    const monsterPlacement = {
        'chamber': [new Monster('Goblin', 30, 8, 3, 'A small, green creature with glowing red eyes.')]
    };

    const npcPlacement = {
        'grebs': [new NPC('Grebgela', 50, 0, 5, 'A small red imp with large, curious eyes. He fidgets with a collection of shiny trinkets on his makeshift counter, a wide, toothy grin spreading across his face when he notices you.', 
        {
            'default': ["'Allo there, adventurer! Welcome to Greb's Grotto!", "See anything you like? Just bits and bobs I find, but one person's junk is another imp's treasure, eh?"],
            'keys': ["Ah, these old things?", "Just some rusty keys I found. None of 'em seem to fit anything important... yet!", "Maybe you'll have better luck with them than I did!"],
            'grotto': ["It ain't much, but it's home! And it's full of wonderful junk!", "A bit messy, I know. I call it 'organized chaos'!"],
            'shop': ["Everything here is for sale, friend! If you've got the coin, I've got the... well, the 'stuff'!", "Just 'list' what I've got, or 'buy [item name]' if you see something you fancy!"]
        },
        [ // Shop Inventory
            { item: new Item('blue key', 'A key made of sapphire, cool and smooth in your hand.', true), price: 25 },
            { item: new Item('skeleton key', 'A key made from bone, said to open any locked chest.', true), price: 50 },
            { item: new Item('potion', 'A healing potion, brewed by Grebgela himself. Smells faintly of swamp water.', true), price: 15 }
        ])],
    };

    // --- 2. Build the World from Data ---
    const rooms = {};

    // Create all room instances
    for (const id in roomData) {
        rooms[id] = new Room(roomData[id].name, roomData[id].description);
    }

    // Create all connections between rooms
    for (const conn of connectionData) {
        const fromRoom = rooms[conn.from];
        const toRoom = rooms[conn.to];

        if (conn.locked) {
            fromRoom.setLockedExit(conn.direction, toRoom, conn.locked);
        } else {
            fromRoom.setExit(conn.direction, toRoom);
        }

        // If the connection is not one-way, set the return path
        if (!conn.oneWay) {
            // If it's a two-way lock, lock the return path. Otherwise, set a normal exit.
            if (conn.twoWayLock) {
                toRoom.setLockedExit(conn.returnDirection, fromRoom, conn.locked);
            } else {
                toRoom.setExit(conn.returnDirection, fromRoom);
            }
        }
    }

    // Place items and monsters in rooms
    for (const roomId in itemPlacement) {
        itemPlacement[roomId].forEach(item => rooms[roomId].addItem(item));
    }
    for (const roomId in monsterPlacement) {
        monsterPlacement[roomId].forEach(monster => rooms[roomId].addMonster(monster));
    }
    for (const roomId in npcPlacement) {
        npcPlacement[roomId].forEach(npc => rooms[roomId].addNPC(npc));
    }

    // --- 3. Return the Starting Room ---
    return rooms['entrance'];
}