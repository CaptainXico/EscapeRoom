// notification.js - VR-specific UI system using A-Frame entities

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in VR mode
    let isVR = false;
    const scene = document.querySelector('a-scene');
    
    scene.addEventListener('enter-vr', () => {
        isVR = true;
        console.log('Entered VR mode - using entity-based UI');
    });
    
    scene.addEventListener('exit-vr', () => {
        isVR = false;
        console.log('Exited VR mode - using DOM UI');
    });

    // VR UI Manager
    const VRUIManager = {
        // Create a text panel in VR space
        createTextPanel(title, content, buttons = []) {
            const panel = document.createElement('a-entity');
            panel.setAttribute('id', 'vr-panel');
            panel.setAttribute('position', '0 1.5 -2');
            panel.setAttribute('rotation', '0 0 0');
            
            // Background panel
            const background = document.createElement('a-plane');
            background.setAttribute('width', '3');
            background.setAttribute('height', '2');
            background.setAttribute('color', '#2a2a2a');
            background.setAttribute('material', 'roughness: 0.8; metalness: 0.2');
            background.setAttribute('position', '0 0 0.01');
            panel.appendChild(background);
            
            // Title
            const titleText = document.createElement('a-text');
            titleText.setAttribute('value', title);
            titleText.setAttribute('position', '0 0.8 0.02');
            titleText.setAttribute('align', 'center');
            titleText.setAttribute('color', '#ffd700');
            titleText.setAttribute('width', '2.5');
            panel.appendChild(titleText);
            
            // Content
            const contentText = document.createElement('a-text');
            contentText.setAttribute('value', content);
            contentText.setAttribute('position', '0 0 0.02');
            contentText.setAttribute('align', 'center');
            contentText.setAttribute('color', '#ffffff');
            contentText.setAttribute('width', '2.5');
            contentText.setAttribute('wrap-count', '30');
            panel.appendChild(contentText);
            
            // Buttons
            buttons.forEach((button, index) => {
                const buttonEntity = document.createElement('a-box');
                const yOffset = -0.5 - (index * 0.3);
                buttonEntity.setAttribute('position', `0 ${yOffset} 0.02`);
                buttonEntity.setAttribute('width', '0.8');
                buttonEntity.setAttribute('height', '0.2');
                buttonEntity.setAttribute('depth', '0.1');
                buttonEntity.setAttribute('color', button.color || '#00ff00');
                buttonEntity.setAttribute('class', 'interactive');
                
                // Button text
                const buttonText = document.createElement('a-text');
                buttonText.setAttribute('value', button.text);
                buttonText.setAttribute('position', '0 0 0.06');
                buttonText.setAttribute('align', 'center');
                buttonText.setAttribute('color', '#000000');
                buttonText.setAttribute('width', '0.7');
                buttonEntity.appendChild(buttonText);
                
                // Button click handler
                buttonEntity.addEventListener('click', () => {
                    if (button.onClick) button.onClick();
                    this.closePanel();
                });
                
                panel.appendChild(buttonEntity);
            });
            
            return panel;
        },
        
        // Show notification in VR
        showNotification(message, duration = 2000) {
            if (!isVR) return false; // Let DOM handle non-VR
            
            const notification = document.createElement('a-entity');
            notification.setAttribute('id', 'vr-notification');
            notification.setAttribute('position', '0 2 -3');
            
            // Background
            const bg = document.createElement('a-plane');
            bg.setAttribute('width', '2');
            bg.setAttribute('height', '0.5');
            bg.setAttribute('color', '#00ff00');
            bg.setAttribute('material', 'opacity: 0.9; transparent: true');
            bg.setAttribute('position', '0 0 0.01');
            notification.appendChild(bg);
            
            // Text
            const text = document.createElement('a-text');
            text.setAttribute('value', message);
            text.setAttribute('position', '0 0 0.02');
            text.setAttribute('align', 'center');
            text.setAttribute('color', '#000000');
            text.setAttribute('width', '1.8');
            notification.appendChild(text);
            
            scene.appendChild(notification);
            
            // Auto-remove after duration
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, duration);
            
            return true;
        },
        
        // Show riddle in VR
        showRiddle(riddleText) {
            if (!isVR) return false;
            
            const panel = this.createTextPanel(
                'Ancient Note',
                riddleText,
                [{ text: 'Close', color: '#ffd700', onClick: null }]
            );
            
            scene.appendChild(panel);
            return true;
        },
        
        // Show symbol selector in VR
        showSymbolSelector(symbols, currentInput) {
            if (!isVR) return false;
            
            const display = currentInput.map(s => s || '_').join(' ');
            const content = `Current: ${display}\n\nChoose next symbol:`;
            
            const buttons = symbols.map(symbol => ({
                text: symbol,
                color: '#00ff00',
                onClick: () => window.selectSymbol(symbol)
            }));
            
            buttons.push({ text: 'Clear', color: '#ff0000', onClick: window.clearSymbols });
            buttons.push({ text: 'Close', color: '#666666', onClick: window.closeSymbolSelector });
            
            const panel = this.createTextPanel('Choose Symbol', content, buttons);
            scene.appendChild(panel);
            return true;
        },
        
        // Show victory screen in VR
        showVictoryScreen() {
            if (!isVR) return false;
            
            const panel = this.createTextPanel(
                '🎉 ESCAPE ROOM COMPLETE! 🎉',
                'You solved the mystery and escaped!',
                [{ text: 'Play Again', color: '#00ff00', onClick: () => location.reload() }]
            );
            
            panel.setAttribute('position', '0 1.5 -1.5');
            panel.setAttribute('scale', '1.2 1.2 1.2');
            scene.appendChild(panel);
            return true;
        },
        
        // Close any VR panel
        closePanel() {
            const panel = document.querySelector('#vr-panel');
            if (panel) {
                panel.parentNode.removeChild(panel);
            }
        }
    };
    
    // Make VR UI manager globally available
    window.VRUIManager = VRUIManager;
    
    // Override DOM notification functions for VR
    const originalShowNotification = window.showNotification;
    window.showNotification = function(message, duration = 2000) {
        if (!VRUIManager.showNotification(message, duration)) {
            // Fallback to DOM for non-VR
            if (originalShowNotification) {
                originalShowNotification(message, duration);
            }
        }
    };
    
    console.log('VR Notification System Initialized');
});
