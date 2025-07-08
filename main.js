import { Room, createWorld } from './room.js'; // Import createWorld
import { Character, archetypeData } from './characters.js';
import { Monster } from './monsters.js';
import { Item } from './items.js';
import { ActionHandler } from './actions.js'; // Import ActionHandler
import { BattleSystem } from './battle.js'; // This file is not provided, but assumed to exist
import { DisplayManager } from './displayIt.js'; // Import DisplayManager
import { setupPreGameplayEventListeners } from './eventListeners.js'; // Import event listener setup functions

document.addEventListener('DOMContentLoaded', () => {
    const titleScreen = document.getElementById('titleScreen');
    const startButton = document.getElementById('startButton');
    const characterSelectionScreen = document.getElementById('characterSelectionScreen');
    const selectMaleButton = document.getElementById('selectMaleButton');
    const selectFemaleButton = document.getElementById('selectFemaleButton');
    const malePortraitsGrid = document.getElementById('malePortraits');
    const femalePortraitsGrid = document.getElementById('femalePortraits');
    const allPortraitImages = document.querySelectorAll('.portrait-img');
    const gameplayScreen = document.getElementById('gameplayScreen');
    const confirmCharacterButton = document.getElementById('confirmCharacterButton');
    const commandInput = document.getElementById('commandInput'); // For re-focusing

    // Create the tooltip element
    const statTooltip = document.createElement('div');
    statTooltip.id = 'statTooltip';
    statTooltip.classList.add('tooltip');
    // Append to body to avoid clipping issues with game-container's overflow:hidden
    // and to simplify positioning relative to the viewport/mouse.
    document.body.appendChild(statTooltip);

const gameOutput = document.getElementById('gameOutput');
const outputContainer = document.querySelector('.output-text-container'); // Get the container

function appendText(text) {
    // Replace all newline characters with <br> tags for proper HTML rendering
    const formattedText = text.replace(/\n/g, '<br>');
    gameOutput.innerHTML += `<p>${formattedText}</p>`; // Append as a paragraph

    // After adding text, scroll to the bottom
    outputContainer.scrollTop = outputContainer.scrollHeight; 
}

    let gameInstance = null; // To hold the AdventureGame instance
    let selectedCharacterType = 'Male'; // Default to Male as male portraits are shown first
    let selectedArchetypeIndex = 0;     // Default to the first portrait

    class AdventureGame {
        constructor(characterType) { // Accept characterType if needed for player setup
            this.currentRoom = null;
            this.worldMap = {}; // To store all rooms by ID
            this.roomHistory = []; // To track visited rooms for the 'back' command
            this.gameState = 'pre-start'; // Add game state: pre-start, intro, playing, ended
            this.interactionState = null; // For special interactions like RPS door
            this.gameStateFlags = {}; // For tracking special world states
            // Potentially use characterType to customize the player
            this.player = new Character(characterType || 'Player', 100, 10, 5);
            // If characterType is an archetype object, use its stats
            if (typeof characterType === 'object' && characterType !== null && characterType.name) {
                this.player = new Character(
                    characterType.name,
                    characterType.health,
                    characterType.strength, // strength maps to attack
                    characterType.dexterity, // dexterity maps to defense
                    25 // Starting gold
                );
            }
            this.battleSystem = new BattleSystem();
            
            // DOM elements guaranteed to exist if gameplayScreen is active
            this.commandInput = document.getElementById('commandInput');
            this.gameOutput = document.getElementById('gameOutput');
            this.mapButton = document.getElementById('mapButton');
            this.inventoryButton = document.getElementById('inventoryButton');
            this.statsButton = document.getElementById('statsButton');
            this.helpButton = document.getElementById('helpButton');
            
            this.actionHandler = new ActionHandler(this); // Initialize ActionHandler
            this.displayManager = new DisplayManager(this, appendText); // Initialize DisplayManager
            this.initializeGame();
            this.updateStatusBars(); // Initial update of status bars
        }
        
        initializeGame() {
            const world = createWorld();
            this.worldMap = world.rooms;
            this.currentRoom = world.startRoom;
            this.gameState = 'intro'; // Set state to intro

            // Initial message for the game start
            if (this.gameOutput) { // Ensure gameOutput is available
                // Use appendText for initial messages
                appendText("In the shadowed alleys of the local bazaar, amidst discarded trinkets and whispered secrets, you find it: a tattered journal, its leather cover cracked with age. The pages are brittle, stained, and filled with a frantic, faded script. It speaks of a place of legend, Adorellan's most ancient site—the Labyrinth of Lyre.");
                appendText("The author writes of unimaginable treasure and riches waiting in its depths, but also of a challenge that has broken all who came before. It is a legendary, dangerous place, where the very walls are said to test the sanity of those who walk them.");
                appendText("Beyond the promise of gold, the journal hints at a greater prize: the chance to uncover lost knowledge and solve a mystery buried for millennia. The final entries are a scrawl of fear and regret, a tale of an expedition lost to the darkness.");
                appendText("The last legible line is not a plea, but a direct challenge that seems to lift from the page and settle upon you:");
                appendText("<strong>Will you succeed where they have failed?</strong>");
                appendText("<em>Type 'venture forth' to begin your adventure, or 'give up' to walk away.</em>");
                this.updateStatusBars(); // Update bars after player is fully initialized
            }
        }
        
        processCommand(command) {
            let response = '';

            // --- Special Interaction State Handling ---
            if (this.interactionState === 'rps_prompt') {
                if (command === 'yes' || command === 'try my luck') {
                    this.interactionState = 'rps_choice';
                    response = "You decide to test your fate. What do you play? (rock, paper, or scissors)";
                } else if (command === 'no') {
                    this.interactionState = null;
                    // Use the action handler to move the player back.
                    response = this.actionHandler._handleMovement('back');
                } else {
                    response = "A simple 'yes' or 'no' will suffice.";
                }
                this.displayMessage(response);
                this.updateStatusBars();
                return;
            }

            if (this.interactionState === 'rps_choice') {
                if (['rock', 'paper', 'scissors'].includes(command)) {
                    response = this.actionHandler._handlePlay(command);
                    // If the door is now unlocked (player won), reset the interaction state.
                    if (response.includes("You win!")) {
                        this.interactionState = null;
                    }
                    // If it's a draw or loss, the state remains 'rps_choice' for another try.
                } else {
                    response = "That's not a valid move. Choose rock, paper, or scissors.";
                }
                this.displayMessage(response);
                this.updateStatusBars();
                return;
            }
            // --- End Special Interaction State Handling ---

            if (this.gameState === 'intro') {
                if (command === 'venture forth') {
                    this.gameState = 'playing';
                    response = `You steel your resolve and step towards the Labyrinth of Lyre.\n\n${this.currentRoom.getDescription(this.player)}`;
                } else if (command === 'give up') {
                    this.gameState = 'ended';
                    response = "You close the journal, the challenge unanswered. The Labyrinth will wait for another hero. You turn and walk away.";
                    this.commandInput.disabled = true;
                } else {
                    response = "The choice is before you. Will you 'venture forth' or 'give up'?"
                }
                this.displayMessage(response);
                this.updateStatusBars();
                return; // Exit early
            }

            const parts = command.split(' ');
            const verb = parts[0];
            const object = parts.slice(1).join(' ');

            if (this.battleSystem.inBattle) {
                if (this.battleSystem.currentEnemy) {
                    response = this.battleSystem.processBattleTurn(this.player, this.battleSystem.currentEnemy, verb, object);
                    // If battle ended and monster was defeated, remove it from the room
                    if (!this.battleSystem.inBattle && this.battleSystem.currentEnemy && !this.battleSystem.currentEnemy.isAlive) {
                        this.currentRoom.removeMonster(this.battleSystem.currentEnemy);
                        // The battle system's endBattle method already provides exp/loot messages.
                        // Optionally, append current room description if player is back to exploring.
                        // response += `\n\n${this.currentRoom.getDescription()}`; 
                    }
                } else {
                    response = "Error: In battle but no current enemy defined. Exiting battle mode.";
                    this.battleSystem.inBattle = false; // Reset battle state
                }
            } else if (this.gameState === 'ended') {
                // If game has ended, do nothing.
                response = "The adventure is over.";
            } else {
                // Not in battle, use ActionHandler for general commands
                response = this.actionHandler.processCommand(verb, object);
            }
            
            // After any command, check if the player has entered the RPS room
            // and if the door is still locked with the 'rps' condition.
            if (this.currentRoom.name === 'Short Corridor' && this.currentRoom.lockedExits['forward'] === 'rps') {
                this.interactionState = 'rps_prompt';
            }

            this.displayMessage(response);
            this.updateStatusBars(); // Update status bars after every command
        }
        
        // displayMessage now solely relies on appendText for output
        displayMessage(message, isCommandResponse = true) {
            if (this.gameOutput) {
                appendText(isCommandResponse ? `> ${message}` : message);            }
        }

        updateStatusBars() {
            if (!this.player) return;

            const healthFill = document.getElementById('healthBarFill');
            const healthText = document.getElementById('healthBarText');
            const expFill = document.getElementById('experienceBarFill');
            const expText = document.getElementById('experienceBarText');

            // Update Health Bar
            if (healthFill && healthText) {
                const healthPercent = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
                healthFill.style.width = `${healthPercent}%`;
                healthText.textContent = `${this.player.health} / ${this.player.maxHealth}`;
            }

            // Update Experience Bar
            if (expFill && expText) {
                const expAtStartOfLevel = (this.player.level - 1) * 100;
                const expForNextLevel = this.player.level * 100;
                const expGainedThisLevel = this.player.experience - expAtStartOfLevel;
                const expNeededThisLevel = expForNextLevel - expAtStartOfLevel;

                // This correctly calculates the percentage of progress within the current level.
                const expPercent = expNeededThisLevel > 0 ? Math.max(0, (expGainedThisLevel / expNeededThisLevel) * 100) : 0;
                expFill.style.width = `${expPercent}%`;
                expText.textContent = `${this.player.experience} / ${expForNextLevel}`;
            }
        }
    }

    function handleTransitionToGameplay(characterType) {
        // characterType is the selectedArchetype object
        console.log(characterType.name + " character selected.");
        
        if (characterSelectionScreen && gameplayScreen) {
            // Set the player display image on the gameplay screen
            const playerDisplayImgElement = document.getElementById('playerDisplayImage');
            // Find the selected portrait in the active grid
            const activeGrid = document.querySelector('.portrait-grid.active');
            const selectedPortrait = activeGrid.querySelector('.portrait-img.selected');

            if (playerDisplayImgElement && selectedPortrait) {
                // Just copy the src and alt directly! So much simpler.
                playerDisplayImgElement.src = selectedPortrait.src;
                playerDisplayImgElement.alt = selectedPortrait.alt;
            }

            characterSelectionScreen.classList.remove('active');
            gameplayScreen.classList.add('active');
        }
        
        // Initialize the game *after* transitioning to gameplay screen
        if (!gameInstance) { // Ensure game is initialized only once
            gameInstance = new AdventureGame(characterType);

            // --- Setup Gameplay Event Listeners ---
            // The original call to setupGameplayEventListeners is replaced with this inline implementation
            // to ensure the buttons and input field are correctly wired up.
            const commandInput = document.getElementById('commandInput');
            const inventoryButton = document.getElementById('inventoryButton');
            const statsButton = document.getElementById('statsButton');
            const helpButton = document.getElementById('helpButton');

            // Command Input Listener
            commandInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    const command = commandInput.value.trim().toLowerCase();
                    if (command) {
                        gameInstance.processCommand(command);
                        commandInput.value = '';
                    }
                }
            });

            // Sidebar Button Listeners
            inventoryButton.addEventListener('click', () => {
                gameInstance.processCommand('inventory');
            });
            statsButton.addEventListener('click', () => {
                gameInstance.processCommand('stats');
            });
            helpButton.addEventListener('click', () => {
                gameInstance.processCommand('help');
            });
        }

        if (commandInput) {
            commandInput.focus(); // Focus on the command input when gameplay starts
        }
    }
    
    // Callbacks for pre-gameplay event listeners
    const preGameplayCallbacks = {
        onStartGame: () => {
            if (titleScreen && characterSelectionScreen) {
                titleScreen.classList.remove('active');
                characterSelectionScreen.classList.add('active');
            }
        },
        onGenderSelected: (gender) => {
            selectedCharacterType = gender;
            // Remove 'selected' from all portraits
            allPortraitImages.forEach(img => img.classList.remove('selected'));

            if (gender === 'Male') {
                malePortraitsGrid.classList.add('active');
                femalePortraitsGrid.classList.remove('active');
                // Select the first male portrait
                if (malePortraitsGrid.children.length > 0) {
                    malePortraitsGrid.children[0].classList.add('selected');
                    selectedArchetypeIndex = 0;
                }
            } else { // Female
                malePortraitsGrid.classList.remove('active');
                femalePortraitsGrid.classList.add('active');
                // Select the first female portrait
                if (femalePortraitsGrid.children.length > 0) {
                    femalePortraitsGrid.children[0].classList.add('selected');
                    selectedArchetypeIndex = 0;
                }
            }
        },
        onPortraitClicked: (clickedImgElement) => {
            // Find all portraits in the currently active grid
            const activeGrid = clickedImgElement.parentElement;
            const activePortraits = activeGrid.querySelectorAll('.portrait-img');

            activePortraits.forEach(img => img.classList.remove('selected'));
            clickedImgElement.classList.add('selected');
            // Get the index from the data attribute
            selectedArchetypeIndex = parseInt(clickedImgElement.dataset.index, 10);
        },
        onConfirmCharacterClicked: () => {
            if (selectedArchetypeIndex !== null && archetypeData[selectedArchetypeIndex]) {
                const selectedArchetype = archetypeData[selectedArchetypeIndex];
                handleTransitionToGameplay(selectedArchetype);
            } else {
                alert("Please select a character.");
                console.error("No archetype selected or index out of bounds.");
            }
        }
    };

    // Setup pre-gameplay event listeners
    setupPreGameplayEventListeners({
        startButton,
        selectMaleButton,
        selectFemaleButton,
        confirmCharacterButton,
        allPortraitImages,
        statTooltip,
        archetypeData,
        ...preGameplayCallbacks
    });

    // Initial setup: select the first male portrait by default.
    // The 'active' class is already on the male grid in the HTML,
    // so we just need to handle the JS selection state.
    if (malePortraitsGrid.children.length > 0) {
        malePortraitsGrid.children[0].classList.add('selected');
        selectedArchetypeIndex = 0;
    }
});