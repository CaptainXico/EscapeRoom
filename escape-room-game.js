// escape-room-game.js - Core escape room game logic

document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        foundSymbols: [],
        correctSequence: ['🌙', '⭐', '🔥'],
        currentInput: [],
        doorUnlocked: false,
        noteRead: false,
        cursorMode: 'vr' // Track current cursor mode
    };

    // UI Elements
    const gravestoneDisplay = document.getElementById('gravestone-display');
    const exitDoor = document.getElementById('exit-door');
    const camera = document.getElementById('camera');
    const desktopCursor = document.getElementById('desktop-cursor');

    // Cursor management functions
    function enableDesktopCursor() {
        if (camera && desktopCursor) {
            console.log('Enabling desktop cursor');
            
            // Disable pointer lock
            camera.setAttribute('look-controls', 'pointerLockEnabled: false');
            
            // Make cursor visible and interactive
            desktopCursor.setAttribute('visible', 'true');
            desktopCursor.setAttribute('raycaster', 'objects: .interactive, button, [class*="close-btn"]');
            
            // Force system cursor
            document.body.style.cursor = 'auto';
            document.querySelector('a-scene').style.cursor = 'auto';
            
            gameState.cursorMode = 'desktop';
            
            // Add a delay to ensure changes take effect
            setTimeout(() => {
                console.log('Desktop cursor enabled');
            }, 100);
        }
    }

    function enableVRCursor() {
        if (camera && desktopCursor) {
            console.log('Enabling VR cursor');
            
            // Enable pointer lock
            camera.setAttribute('look-controls', 'pointerLockEnabled: true');
            
            // Hide cursor
            desktopCursor.setAttribute('visible', 'false');
            desktopCursor.setAttribute('raycaster', 'objects: .interactive');
            
            // Hide system cursor
            document.body.style.cursor = 'none';
            document.querySelector('a-scene').style.cursor = 'none';
            
            gameState.cursorMode = 'vr';
            
            setTimeout(() => {
                console.log('VR cursor enabled');
            }, 100);
        }
    }

    function showUIWithCursor(uiElement, closeCallback) {
        console.log('Showing UI with cursor');
        
        // Make sure UI is on top and interactive
        uiElement.style.zIndex = '9999';
        uiElement.style.pointerEvents = 'auto';
        document.body.appendChild(uiElement);
        
        // Enable desktop cursor
        enableDesktopCursor();
        
        // Add close button handler
        const closeButtons = uiElement.querySelectorAll('button');
        closeButtons.forEach(button => {
            if (button.textContent.toLowerCase().includes('close') || 
                button.textContent.toLowerCase().includes('cancel')) {
                button.addEventListener('click', (e) => {
                    console.log('Close button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    uiElement.remove();
                    enableVRCursor();
                    if (closeCallback) closeCallback();
                });
            }
        });
        
        // Also close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                console.log('Escape key pressed');
                uiElement.remove();
                enableVRCursor();
                document.removeEventListener('keydown', escapeHandler);
                if (closeCallback) closeCallback();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Force cursor to be visible after a delay
        setTimeout(() => {
            enableDesktopCursor();
        }, 200);
    }

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
                <button class="close-btn" style="
                    background: #ffd700;
                    color: black;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Close</button>
            `;

            showUIWithCursor(riddleBox);
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

            // Show symbol selection interface
            this.showSymbolSelector();
        },

        showSymbolSelector() {
            // Remove existing selector if present
            const existing = document.getElementById('symbol-selector');
            if (existing) existing.remove();

            const selector = document.createElement('div');
            selector.id = 'symbol-selector';
            selector.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 30px;
                border-radius: 15px;
                z-index: 2000;
                border: 2px solid #00ff00;
            `;

            const symbols = gameState.foundSymbols;
            const currentDisplay = gameState.currentInput.map(s => s || '_').join(' ');
            
            selector.innerHTML = `
                <h3 style="margin-top: 0; color: #00ff00;">Choose Symbol</h3>
                <p style="margin-bottom: 20px;">Current: ${currentDisplay}</p>
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    ${symbols.map(symbol => `
                        <button onclick="selectSymbol('${symbol}')" style="
                            background: #333;
                            color: white;
                            border: 2px solid #00ff00;
                            padding: 15px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-size: 24px;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='#00ff00'; this.style.color='black'" 
                           onmouseout="this.style.background='#333'; this.style.color='white'">${symbol}</button>
                    `).join('')}
                </div>
                <button onclick="clearSymbols()" style="
                    background: #ff0000;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Clear</button>
                <button class="close-btn" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Close</button>
            `;

            showUIWithCursor(selector);
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
                enableVRCursor(); // Restore VR cursor after solving
            } else {
                this.showMessage('Wrong sequence! Try again.');
                gameState.currentInput = [];
                setTimeout(() => {
                    this.updateDisplay();
                    enableVRCursor(); // Restore VR cursor after showing message
                }, 1000);
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

    // Global functions for symbol selector
    window.selectSymbol = function(symbol) {
        if (gameState.currentInput.length < 3) {
            gameState.currentInput.push(symbol);
            
            // Update gravestone display
            const display = gameState.currentInput.map(s => s || '_').join(' ');
            gravestoneDisplay.setAttribute('value', display);
            
            // Update selector display
            const selector = document.getElementById('symbol-selector');
            if (selector) {
                const currentDisplay = gameState.currentInput.map(s => s || '_').join(' ');
                selector.querySelector('p').textContent = `Current: ${currentDisplay}`;
            }
            
            // Check if puzzle is solved
            if (gameState.currentInput.length === 3) {
                setTimeout(() => {
                    const gravestoneComponent = document.querySelector('[gravestone-puzzle]').components['gravestone-puzzle'];
                    gravestoneComponent.checkSolution();
                    closeSymbolSelector();
                }, 500);
            }
        }
    };

    window.clearSymbols = function() {
        gameState.currentInput = [];
        const display = gameState.currentInput.map(s => s || '_').join(' ');
        gravestoneDisplay.setAttribute('value', display);
        
        const selector = document.getElementById('symbol-selector');
        if (selector) {
            selector.querySelector('p').textContent = `Current: ${display}`;
        }
    };

    window.closeSymbolSelector = function() {
        const selector = document.getElementById('symbol-selector');
        if (selector) selector.remove();
        enableVRCursor();
    };

    // Game initialization
    console.log('Escape Room Game Initialized');
    console.log('Find 3 symbols and solve the gravestone puzzle to escape!');
    
    // Add manual cursor toggle for testing
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'c') {
            if (gameState.cursorMode === 'vr') {
                console.log('Manual: Switching to desktop cursor');
                enableDesktopCursor();
            } else {
                console.log('Manual: Switching to VR cursor');
                enableVRCursor();
            }
        }
    });
    
    // Start in VR mode
    enableVRCursor();
});
