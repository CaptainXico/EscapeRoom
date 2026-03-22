// escape-room-game.js - Core escape room game logic

document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        foundSymbols: [],
        correctSequence: ['🌙', '⭐', '🔥'],
        currentInput: [],
        doorUnlocked: false,
        noteRead: false
    };

    // UI Elements
    const gravestoneDisplay = document.getElementById('gravestone-display');
    const exitDoor = document.getElementById('exit-door');

    // Register puzzle piece component
    AFRAME.registerComponent('puzzle-piece', {
        init() {
            this.el.addEventListener('click', () => this.collectSymbol());
        },

        collectSymbol() {
            const symbol = this.el.dataset.symbol;
            const found = this.el.dataset.found === 'true';

            if (!found && !gameState.foundSymbols.includes(symbol)) {
                gameState.foundSymbols.push(symbol);
                this.el.dataset.found = 'true';
                
                // Visual feedback
                this.el.setAttribute('animation', 'property: scale; to: 1.5 1.5 1.5; dur: 200; easing: easeInOutQuad');
                setTimeout(() => {
                    this.el.setAttribute('animation', 'property: scale; to: 1 1 1; dur: 200; easing: easeInOutQuad');
                }, 200);

                // Show symbol notification
                this.showNotification(`Symbol found: ${symbol}`);
                console.log(`Found symbol: ${symbol}`);
                console.log('All found symbols:', gameState.foundSymbols);
            }
        },

        showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 0, 0.9);
                color: black;
                padding: 20px;
                border-radius: 10px;
                font-size: 24px;
                font-weight: bold;
                z-index: 2000;
                animation: fadeInOut 2s ease-in-out;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 2000);
        }
    });

    // Register note puzzle component
    AFRAME.registerComponent('note-puzzle', {
        init() {
            this.el.addEventListener('click', () => this.readNote());
        },

        readNote() {
            if (!gameState.noteRead) {
                gameState.noteRead = true;
                this.showRiddle();
            }
        },

        showRiddle() {
            const riddleText = `When night meets day and stars burn bright,
Three symbols hold the key to light.
Find them all and speak their truth,
To escape the darkness of this roof.`;

            const riddleBox = document.createElement('div');
            riddleBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(139, 69, 19, 0.95);
                color: #f4e4c1;
                padding: 30px;
                border-radius: 15px;
                font-size: 18px;
                font-family: 'Georgia', serif;
                max-width: 400px;
                text-align: center;
                z-index: 2000;
                border: 3px solid #8B4513;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
            `;
            riddleBox.innerHTML = `
                <h3 style="margin-top: 0; color: #ffd700;">Ancient Note</h3>
                <p style="margin: 20px 0; line-height: 1.6;">${riddleText}</p>
                <button onclick="this.parentElement.remove()" style="
                    background: #ffd700;
                    color: black;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Close</button>
            `;
            document.body.appendChild(riddleBox);
        }
    });

    // Register gravestone puzzle component
    AFRAME.registerComponent('gravestone-puzzle', {
        init() {
            this.el.addEventListener('click', () => this.inputSymbol());
        },

        inputSymbol() {
            if (gameState.foundSymbols.length === 0) {
                this.showMessage('Find symbols first!');
                return;
            }

            // Cycle through found symbols
            const nextSymbol = this.getNextSymbol();
            gameState.currentInput.push(nextSymbol);

            // Update display
            this.updateDisplay();

            // Check if puzzle is solved
            if (gameState.currentInput.length === 3) {
                this.checkSolution();
            }
        },

        getNextSymbol() {
            const foundSymbols = gameState.foundSymbols;
            const currentIndex = foundSymbols.indexOf(gameState.currentInput[gameState.currentInput.length - 1]) || -1;
            return foundSymbols[(currentIndex + 1) % foundSymbols.length];
        },

        updateDisplay() {
            const display = gameState.currentInput.map(s => s || '_').join(' ');
            gravestoneDisplay.setAttribute('value', display);
        },

        checkSolution() {
            const isCorrect = gameState.currentInput.every((symbol, index) => 
                symbol === gameState.correctSequence[index]
            );

            if (isCorrect) {
                gameState.doorUnlocked = true;
                this.unlockDoor();
            } else {
                this.showMessage('Wrong sequence! Try again.');
                gameState.currentInput = [];
                setTimeout(() => this.updateDisplay(), 1000);
            }
        },

        unlockDoor() {
            exitDoor.setAttribute('color', '#00ff00');
            exitDoor.querySelector('a-text').setAttribute('value', 'UNLOCKED');
            exitDoor.querySelector('a-text').setAttribute('color', '#00ff00');
            
            this.showMessage('Door Unlocked! You escaped!');
            
            // Add celebration effect
            exitDoor.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 1000; easing: easeInOutQuad');
        },

        showMessage(message) {
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 20px;
                z-index: 2000;
                border: 2px solid #ff0000;
            `;
            messageBox.textContent = message;
            document.body.appendChild(messageBox);

            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 2000);
        }
    });

    // Register escape door component
    AFRAME.registerComponent('escape-door', {
        init() {
            this.el.addEventListener('click', () => this.tryExit());
        },

        tryExit() {
            if (gameState.doorUnlocked) {
                this.showVictoryScreen();
            } else {
                this.showMessage('The door is locked. Solve the puzzle first!');
            }
        },

        showVictoryScreen() {
            const victoryScreen = document.createElement('div');
            victoryScreen.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #00ff00, #0000ff);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 3000;
                font-family: Arial, sans-serif;
            `;
            victoryScreen.innerHTML = `
                <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🎉 ESCAPE ROOM COMPLETE! 🎉</h1>
                <p style="font-size: 24px; margin-bottom: 30px;">You solved the mystery and escaped!</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: black;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: bold;
                ">Play Again</button>
            `;
            document.body.appendChild(victoryScreen);
        },

        showMessage(message) {
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(139, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 20px;
                z-index: 2000;
            `;
            messageBox.textContent = message;
            document.body.appendChild(messageBox);

            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 2000);
        }
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);

    // Game initialization
    console.log('Escape Room Game Initialized');
    console.log('Find 3 symbols and solve the gravestone puzzle to escape!');
});
