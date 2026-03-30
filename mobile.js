// mobile.js - Mobile-specific interaction system

document.addEventListener('DOMContentLoaded', function() {
    // Detect if user is on mobile device
    function isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                (window.innerWidth <= 768 && 'ontouchstart' in window));
    }

    // Only initialize mobile features on mobile devices
    if (!isMobile()) {
        return;
    }

    console.log('Mobile device detected - enabling touch controls');

    // Game state reference
    const gameState = window.gameState || {
        foundSymbols: [],
        correctSequence: ['🌙', '⭐', '🔥'],
        currentInput: [],
        doorUnlocked: false,
        noteRead: false,
        hoveredObject: null
    };

    // Mobile UI Manager
    const MobileUI = {
        // Create mobile-specific overlay
        createMobileOverlay() {
            const overlay = document.createElement('div');
            overlay.id = 'mobile-overlay';
            overlay.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px;
                border-radius: 10px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                z-index: 1000;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                max-width: 300px;
            `;

            overlay.innerHTML = `
                <div style="margin-bottom: 8px; font-weight: bold; color: #00ffff;">🧩 Escape Room:</div>
                <div style="margin-bottom: 4px;">👆 <strong>Tap</strong> to interact</div>
                <div style="margin-bottom: 4px;">📜 <strong>Goal:</strong> Find 3 symbols & escape!</div>
                <div style="margin-bottom: 4px; font-size: 12px; opacity: 0.8;">Look at objects and tap screen</div>
            `;

            document.body.appendChild(overlay);
            return overlay;
        },

        // Update hover hints for mobile
        updateHoverHints() {
            // Override the showHoverHint methods to use "tap" instead of "Press E"
            const originalShowHoverHint = window.showHoverHint;
            
            // Update note-puzzle component
            const noteElement = document.querySelector('[note-puzzle]');
            if (noteElement && noteElement.components['note-puzzle']) {
                const noteComponent = noteElement.components['note-puzzle'];
                noteComponent.showHoverHint = function() {
                    const hint = document.createElement('div');
                    hint.id = 'hover-hint';
                    hint.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0, 255, 0, 0.9);
                        color: black;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        font-weight: bold;
                        z-index: 1500;
                        pointer-events: none;
                    `;
                    hint.textContent = 'Tap to read note';
                    document.body.appendChild(hint);
                };
            }

            // Update gravestone-puzzle component
            const gravestoneElement = document.querySelector('[gravestone-puzzle]');
            if (gravestoneElement && gravestoneElement.components['gravestone-puzzle']) {
                const gravestoneComponent = gravestoneElement.components['gravestone-puzzle'];
                gravestoneComponent.showHoverHint = function() {
                    const hint = document.createElement('div');
                    hint.id = 'hover-hint';
                    hint.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0, 255, 0, 0.9);
                        color: black;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        font-weight: bold;
                        z-index: 1500;
                        pointer-events: none;
                    `;
                    hint.textContent = 'Tap to input symbols';
                    document.body.appendChild(hint);
                };
            }

            // Update escape-door component
            const doorElement = document.querySelector('[escape-door]');
            if (doorElement && doorElement.components['escape-door']) {
                const doorComponent = doorElement.components['escape-door'];
                doorComponent.showHoverHint = function() {
                    const message = gameState.doorUnlocked ? 'Tap to escape!' : 'Tap to try door';
                    const hint = document.createElement('div');
                    hint.id = 'hover-hint';
                    hint.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: ${gameState.doorUnlocked ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)'};
                        color: ${gameState.doorUnlocked ? 'black' : 'white'};
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        font-weight: bold;
                        z-index: 1500;
                        pointer-events: none;
                    `;
                    hint.textContent = message;
                    document.body.appendChild(hint);
                };
            }
        },

        // Handle touch interactions
        handleTouch(e) {
            e.preventDefault();
            
            // Get touch position
            const touch = e.touches[0] || e.changedTouches[0];
            const x = touch.clientX;
            const y = touch.clientY;

            // Check if we're hovering over an interactive object
            if (gameState.hoveredObject) {
                console.log('Mobile tap on object:', gameState.hoveredObject);
                
                // Call interact method if it exists
                const component = gameState.hoveredObject.components;
                if (component && component['puzzle-piece']) {
                    component['puzzle-piece'].interact();
                } else if (component && component['note-puzzle']) {
                    component['note-puzzle'].interact();
                } else if (component && component['gravestone-puzzle']) {
                    component['gravestone-puzzle'].interact();
                } else if (component && component['escape-door']) {
                    component['escape-door'].interact();
                }
            }
        }
    };

    // Initialize mobile features
    function initMobile() {
        // Create mobile overlay
        MobileUI.createMobileOverlay();

        // Update hover hints after a short delay to ensure components are loaded
        setTimeout(() => {
            MobileUI.updateHoverHints();
        }, 1000);

        // Add touch event listeners
        document.addEventListener('touchstart', MobileUI.handleTouch, { passive: false });
        document.addEventListener('touchend', MobileUI.handleTouch, { passive: false });

        // Disable default touch behaviors that might interfere
        document.addEventListener('touchmove', (e) => {
            // Allow default touchmove for camera look
        }, { passive: true });

        console.log('Mobile controls initialized');
    }

    // Wait for the game to load before initializing mobile features
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobile);
    } else {
        initMobile();
    }

    // Make MobileUI globally available
    window.MobileUI = MobileUI;
});
