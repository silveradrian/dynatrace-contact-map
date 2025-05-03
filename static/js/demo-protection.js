/**
 * Demo Access Protection with LinkedIn Modal Fix
 * Simple login screen to prevent unauthorized access to the Cylvy demo
 * @version 1.0.3
 * @author silveradrian
 */
class CylvyDemoProtection {
    constructor(options = {}) {
        this.options = {
            password: options.password || 'dynatracedemo', // Default password
            appContainerId: options.appContainerId || 'main-content', // ID of main content div
            loginExpiration: options.loginExpiration || 24, // Hours until login expires
            logoText: options.logoText || 'cylvy', // Cylvy logo text
            primaryColor: options.primaryColor || '#E51848', // Amaranth primary color
            secondaryColor: options.secondaryColor || '#8806BF', // Grape secondary color
            darkColor: options.darkColor || '#333333', // Dark color
            lightColor: options.lightColor || '#F7FFF7' // Light color
        };
        
        this.lastLogin = {
            date: "2025-05-03 17:31:58",
            user: "silveradrian"
        };
        
        // Set this flag BEFORE initializing
        window.cylvyPreventLinkedInModal = true;
        
        this.init();
    }
    
    init() {
        // Check if already logged in
        if (this.checkLogin()) {
            this.showApp();
            
            // Keep the prevention flag on for 2 seconds after showing app
            setTimeout(() => {
                window.cylvyPreventLinkedInModal = false;
                console.log("LinkedIn modals are now enabled");
            }, 2000);
            return;
        }
        
        // Hide the main app
        this.hideApp();
        
        // Create and show login screen
        this.createLoginScreen();
    }
    
    hideApp() {
        const appContainer = document.getElementById(this.options.appContainerId);
        if (!appContainer) {
            // If there's no specific container, hide everything in body except scripts
            Array.from(document.body.children).forEach(element => {
                if (element.tagName !== 'SCRIPT') {
                    element.style.display = 'none';
                }
            });
        } else {
            appContainer.style.display = 'none';
        }
    }
    
    showApp() {
        const appContainer = document.getElementById(this.options.appContainerId);
        if (!appContainer) {
            // Unhide everything that was hidden
            Array.from(document.body.children).forEach(element => {
                if (element.tagName !== 'SCRIPT' && element.id !== 'cylvy-login-overlay') {
                    element.style.display = '';
                }
            });
        } else {
            appContainer.style.display = '';
        }
        
        // Remove login overlay if it exists
        const loginOverlay = document.getElementById('cylvy-login-overlay');
        if (loginOverlay) {
            document.body.removeChild(loginOverlay);
        }
    }
    
    createLoginScreen() {
        const overlay = document.createElement('div');
        overlay.id = 'cylvy-login-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, ${this.options.primaryColor}, ${this.options.secondaryColor});
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        `;
        
        const loginBox = document.createElement('div');
        loginBox.style.cssText = `
            background-color: ${this.options.lightColor};
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            padding: 30px;
            width: 350px;
            max-width: 90%;
            text-align: center;
        `;
        
        loginBox.innerHTML = `
            <div style="font-size: 32px; font-weight: 700; margin-bottom: 10px; color: ${this.options.primaryColor};">
                ${this.options.logoText}
            </div>
            <div style="width: 40px; height: 4px; background: linear-gradient(to right, ${this.options.primaryColor}, ${this.options.secondaryColor}); margin: 0 auto 20px;"></div>
            
            <h2 style="margin-bottom: 20px; color: ${this.options.darkColor}; font-weight: 300;">Contact Map Demo</h2>
            <p style="margin-bottom: 30px; color: #666;">Enter the password to access the demo</p>
            
            <form id="cylvy-login-form">
                <div style="margin-bottom: 20px;">
                    <input type="password" id="cylvy-password" placeholder="Password" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 16px;
                        background-color: white;
                    " autofocus>
                </div>
                
                <div id="password-error" style="color: #E51848; margin-bottom: 15px; display: none;">
                    Incorrect password. Please try again.
                </div>
                
                <button type="submit" style="
                    background: linear-gradient(to right, ${this.options.primaryColor}, ${this.options.secondaryColor});
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 12px 20px;
                    font-size: 16px;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                    font-weight: 500;
                ">Access Demo</button>
            </form>
            
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 13px; color: #999;">
                <p style="margin: 5px 0;">Last login: ${this.lastLogin.date} UTC</p>
                <p style="margin: 5px 0;">User: ${this.lastLogin.user}</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                &copy; 2025 Cylvy. All rights reserved.
            </p>
        `;
        
        overlay.appendChild(loginBox);
        document.body.appendChild(overlay);
        
        // Add hover effect for button
        const submitButton = loginBox.querySelector('button[type="submit"]');
        submitButton.addEventListener('mouseover', () => {
            submitButton.style.transform = 'translateY(-2px)';
            submitButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        submitButton.addEventListener('mouseout', () => {
            submitButton.style.transform = 'translateY(0)';
            submitButton.style.boxShadow = 'none';
        });
        
        // Add form submission handler
        document.getElementById('cylvy-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('cylvy-password').value;
            
            if (password === this.options.password) {
                this.setLogin();
                
                // Keep the prevention flag active
                window.cylvyPreventLinkedInModal = true;
                this.showApp();
                
                // Keep the flag active for 2 seconds after app displayed 
                setTimeout(() => {
                    window.cylvyPreventLinkedInModal = false;
                    console.log("LinkedIn modals are now enabled");
                }, 2000);
            } else {
                document.getElementById('password-error').style.display = 'block';
                document.getElementById('cylvy-password').value = '';
            }
        });
    }
    
    setLogin() {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + this.options.loginExpiration);
        
        localStorage.setItem('cylvy-demo-access', JSON.stringify({
            expires: expiry.getTime(),
            user: this.lastLogin.user,
            lastLogin: new Date().toISOString()
        }));
    }
    
    checkLogin() {
        const loginData = localStorage.getItem('cylvy-demo-access');
        if (!loginData) return false;
        
        try {
            const data = JSON.parse(loginData);
            const now = new Date().getTime();
            
            // Update last login info if valid
            if (data.expires > now) {
                this.lastLogin.date = new Date(data.lastLogin).toISOString().replace('T', ' ').substring(0, 19);
                this.lastLogin.user = data.user;
                return true;
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }
    
    logout() {
        localStorage.removeItem('cylvy-demo-access');
        window.location.reload();
    }
}

// Add a logout function to the global scope
function logoutCylvyDemo() {
    if (window.cylvyDemoProtection) {
        window.cylvyDemoProtection.logout();
    }
}

// Monkey patch the LinkedInConnectionIntelligence.prototype
function monkeyPatchLinkedInIntegration() {
    // Wait a bit for LinkedIn script to be loaded
    setTimeout(() => {
        // Check if LinkedIn Integration exists
        if (typeof LinkedInConnectionIntelligence === 'undefined') {
            console.log("LinkedIn integration not found, will try again");
            monkeyPatchLinkedInIntegration();
            return;
        }

        console.log("Patching LinkedIn integration to prevent auto-modal");
        
        // Save original authenticate method
        const originalAuthenticate = LinkedInConnectionIntelligence.prototype.authenticate;
        
        // Override authenticate to check the prevention flag
        LinkedInConnectionIntelligence.prototype.authenticate = function() {
            if (window.cylvyPreventLinkedInModal) {
                console.log("LinkedIn authentication prevented by demo protection");
                return;
            }
            return originalAuthenticate.apply(this, arguments);
        };
        
        // Also patch the showLoginModal method
        const originalShowLoginModal = LinkedInConnectionIntelligence.prototype.showLoginModal;
        
        LinkedInConnectionIntelligence.prototype.showLoginModal = function() {
            if (window.cylvyPreventLinkedInModal) {
                console.log("LinkedIn login modal prevented by demo protection");
                return;
            }
            return originalShowLoginModal.apply(this, arguments);
        };
    }, 500);
}

// Initialize demo protection and patch login modal
document.addEventListener('DOMContentLoaded', function() {
    // Set the global prevention flag
    window.cylvyPreventLinkedInModal = true;
    
    // Initialize the demo protection
    window.cylvyDemoProtection = new CylvyDemoProtection({
        password: 'cylvy2025',
        primaryColor: '#E51848',  // Amaranth 
        secondaryColor: '#8806BF' // Grape
    });
    
    // Apply the monkey patch
    monkeyPatchLinkedInIntegration();
});