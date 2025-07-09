export class BattleSystem {
    constructor() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.currentRoom = null; // To hold the room where the battle occurs
        this.battleLog = [];
    }
    
    startBattle(player, monster, room) {
        this.inBattle = true;
        this.currentEnemy = monster;
        this.currentRoom = room;
        this.battleLog = [];
        
        let result = `\n=== BATTLE BEGINS ===\n`;
        result += `You face the ${monster.name}!\n`;
        result += `${monster.description}\n\n`;
        result += this.getBattleStatus(player, monster);
        result += `\nWhat will you do? (attack, flee, use [item])`;
        
        return result;
    }
    
    processBattleTurn(player, monster, action, target = null) {
        if (!this.inBattle) {
            return "You are not in battle.";
        }
        
        let result = '';
        
        switch(action) {
            case 'attack':
                result += this.playerAttack(player, monster);
                if (monster.isAlive) {
                    result += '\n' + this.monsterAttack(player, monster);
                }
                break;
            case 'flee':
                result += this.attemptFlee(player, monster);
                break;
            case 'use':
                result += this.useItemInBattle(player, target);
                if (monster.isAlive) {
                    result += '\n' + this.monsterAttack(player, monster);
                }
                break;
            default:
                result = "Invalid battle action. Try: attack, flee, or use [item]";
        }
        
        if (!monster.isAlive) {
            result += '\n' + this.endBattle(player, monster, 'victory');
        } else if (!player.isAlive) {
            result += '\n' + this.endBattle(player, monster, 'defeat');
        } else {
            result += '\n\n' + this.getBattleStatus(player, monster);
        }
        
        return result;
    }
    
    playerAttack(player, monster) {
        const CRIT_CHANCE = 0.20; // 20% chance to critically hit
        let finalDamageToApply;
        let isCritical = false;

        // Determine if the attack is a critical hit
        if (Math.random() < CRIT_CHANCE) {
            isCritical = true;
            // A critical hit deals the player's maximum possible damage
            finalDamageToApply = player.attack;
        } else {
            // A normal hit is a random roll from 1 to the player's attack value
            finalDamageToApply = Math.floor(Math.random() * player.attack) + 1;
        }

        const actualDamage = monster.takeDamage(finalDamageToApply);
        let result = '';
        
        if (isCritical) {
            result = `Critical Hit! You strike the ${monster.name} for ${actualDamage} damage!`;
        } else {
            result = `You strike the ${monster.name} for ${actualDamage} damage!`;
        }
        
        if (!monster.isAlive) {
            result += '\n' + monster.getDeathMessage();
        }
        
        return result;
    }
    
    monsterAttack(player, monster) {
        const attackDetails = monster.attackPlayer(player); // Returns { damage, isCritical }
        const actualDamage = player.takeDamage(attackDetails.damage);
        
        let result = monster.getAttackMessage();
        if (attackDetails.isCritical) {
            result += ` Critical Hit!`;
        }
        result += `\nThe ${monster.name} hits you for ${actualDamage} damage!`; // Clarified who hits
        
        if (!player.isAlive) {
            result += '\nYou have been defeated!';
        }
        
        return result;
    }
    
    attemptFlee(player, monster) {
        const fleeChance = Math.random();
        if (fleeChance > 0.3) {
            this.endBattle(player, monster, 'flee');
            return "You successfully flee from the battle!";
        } else {
            let result = "You failed to escape!";
            result += '\n' + this.monsterAttack(player, monster);
            return result;
        }
    }
    
    useItemInBattle(player, itemName) {
        const item = player.findItem(itemName);
        if (!item) {
            return `You don't have a ${itemName}.`;
        }
        
        let result = item.use(player, null);
        
        if (item.isConsumed) { // Assumes use() method sets this flag
            player.removeItem(item, 1);
        }
        
        return result;
    }
    
    getBattleStatus(player, monster) {
        let status = `--- Battle Status ---\n`;
        status += `Your Health: ${player.health}/${player.maxHealth}\n`;
        status += `${monster.name} Health: ${monster.health}/${monster.maxHealth}`;
        return status;
    }
    
    endBattle(player, monster, outcome) {
        this.inBattle = false;
        
        let result = '\n=== BATTLE END ===\n';
        
        switch(outcome) {
            case 'victory':
                const exp = monster.experienceValue;
                player.gainExperience(exp);
                result += `Victory! You gained ${exp} experience points.\n`;
                
                const loot = monster.dropLoot();
                if (loot.length > 0) {
                    const lootNames = [];
                    loot.forEach(lootStack => {
                        if (this.currentRoom) {
                            this.currentRoom.addItem(lootStack.item, lootStack.quantity);
                        }
                        lootNames.push(lootStack.quantity > 1 ? `${lootStack.quantity} ${lootStack.item.name}s` : lootStack.item.name);
                    });
                    result += `The defeated ${monster.name} dropped: ${lootNames.join(', ')}.`;
                }

                if (this.currentRoom) {
                    this.currentRoom.removeMonster(monster);
                }
                break;
            case 'defeat':
                result += 'You have been defeated! Game Over.';
                break;
            case 'flee':
                result += 'You escaped from the battle.';
                break;
        }

        this.currentEnemy = null;
        this.currentRoom = null;
        
        return result;
    }
}