// c:\Users\Owner\Desktop\software dev\Rin Games\Adorellan Adventures\AdorellanAdventures\actions.js

    _handleMovement(direction) {
        // ... (movement logic) ...

        // Update the current room
        this.game.currentRoom = newRoom;

        // --- Post-movement triggers ---

        const isEnteringMercurialDen = this.game.currentRoom.name === 'The Mercurial Den';
        // If the den has been activated (crystal taken), it should change state upon entry.
        if (isEnteringMercurialDen && this.game.gameStateFlags.mercurialDenActive) {
            this._changeMercurialDen();
        }

        // ... (other post-movement logic) ...
    }
