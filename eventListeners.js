function _setupPortraitListeners(allPortraitImages, archetypeData, statTooltipElement, onPortraitClickCallback) {
    allPortraitImages.forEach((imgElement) => {
        const archetypeIndex = parseInt(imgElement.dataset.index, 10);

        imgElement.addEventListener('click', () => {
            // The callback will handle updating selectedArchetypeIndex and visual .selected class
            onPortraitClickCallback(imgElement);
        });

        imgElement.addEventListener('mouseenter', (event) => {
            const stats = archetypeData[archetypeIndex];
            if (stats) {
                statTooltipElement.innerHTML = `
                    <strong>${stats.name}</strong><br>
                    Health: ${stats.health}<br>
                    Strength: ${stats.strength}<br>
                    Dexterity: ${stats.dexterity}<br>
                    Agility: ${stats.agility}<br>
                    Intelligence: ${stats.intelligence}<br>
                    Charisma: ${stats.charisma}`;
                statTooltipElement.style.left = (event.pageX + 15) + 'px';
                statTooltipElement.style.top = (event.pageY + 15) + 'px';
                statTooltipElement.style.display = 'block';
            }
        });

        imgElement.addEventListener('mouseleave', () => {
            statTooltipElement.style.display = 'none';
        });

        imgElement.addEventListener('mousemove', (event) => {
            if (statTooltipElement.style.display === 'block') {
                statTooltipElement.style.left = (event.pageX + 15) + 'px';
                statTooltipElement.style.top = (event.pageY + 15) + 'px';
            }
        });
    });
}

export function setupPreGameplayEventListeners({
    // DOM elements
    startButton,
    selectMaleButton,
    selectFemaleButton,
    confirmCharacterButton,
    allPortraitImages,
    statTooltip,
    // Data
    archetypeData,
    // Callbacks from main.js
    onStartGame,
    onGenderSelected,
    onPortraitClicked,
    onConfirmCharacterClicked
}) {
    if (startButton) {
        startButton.addEventListener('click', onStartGame);
    }

    if (selectMaleButton) {
        selectMaleButton.addEventListener('click', () => onGenderSelected('Male'));
    }

    if (selectFemaleButton) {
        selectFemaleButton.addEventListener('click', () => onGenderSelected('Female'));
    }

    if (confirmCharacterButton) {
        confirmCharacterButton.addEventListener('click', onConfirmCharacterClicked);
    }

    _setupPortraitListeners(
        allPortraitImages,
        archetypeData,
        statTooltip,
        onPortraitClicked
    );
}

export function setupGameplayEventListeners({
    commandInput,
    mapButton,
    inventoryButton,
    statsButton,
    helpButton,
    gameInstance // The fully initialized AdventureGame instance
}) {
    if (commandInput) {
        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && commandInput.value.trim() !== '') {
                gameInstance.processCommand(commandInput.value.trim().toLowerCase());
                commandInput.value = '';
            }
        });
    }
    if (mapButton) mapButton.addEventListener('click', () => gameInstance.displayManager.displayMap());
    if (inventoryButton) inventoryButton.addEventListener('click', () => gameInstance.displayManager.displayInventory());
    if (statsButton) statsButton.addEventListener('click', () => gameInstance.displayManager.displayStats());
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            // Directly get the help text from the action handler
            const helpText = gameInstance.actionHandler._handleHelp();
            // Display it as a system message, not a command response (no '>')
            gameInstance.displayMessage(helpText, false);
        });
    }
}