export class GameEngine {
    constructor() {
        this.gameState = {
            isPlaying: true,
            currentLocation: null,
            inventory: [],
            score: 0,
            moves: 0
        };
    }
    
    updateGameState(newState) {
        Object.assign(this.gameState, newState);
    }
    
    getGameState() {
        return this.gameState;
    }
    
    processGameLogic(action, target) {
        this.gameState.moves++;
        
        // Game-wide logic processing
        switch(action) {
            case 'save':
                return this.saveGame();
            case 'load':
                return this.loadGame();
            case 'quit':
                return this.quitGame();
            case 'inventory':
                return this.showInventory();
            case 'score':
                return `Score: ${this.gameState.score} | Moves: ${this.gameState.moves}`;
            default:
                return null;
        }
    }
    
    saveGame() {
        try {
            localStorage.setItem('mysticalCaveAdventure', JSON.stringify(this.gameState));
            return 'Game saved successfully.';
        } catch (error) {
            return 'Failed to save game.';
        }
    }
    
    loadGame() {
        try {
            const savedState = localStorage.getItem('mysticalCaveAdventure');
            if (savedState) {
                this.gameState = JSON.parse(savedState);
                return 'Game loaded successfully.';
            }
            return 'No saved game found.';
        } catch (error) {
            return 'Failed to load game.';
        }
    }
    
    quitGame() {
        this.gameState.isPlaying = false;
        return 'Thanks for playing Mystical Cave Adventure!';
    }
    
    showInventory() {
        if (this.gameState.inventory.length === 0) {
            return 'Your inventory is empty.';
        }
        return 'Inventory: ' + this.gameState.inventory.map(item => item.name).join(', ');
    }
    
    addScore(points) {
        this.gameState.score += points;
    }
}