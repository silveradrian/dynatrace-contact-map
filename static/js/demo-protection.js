/**
 * Ultra-Simple Demo Protection
 * @version 1.3.0
 */
(function() {
    console.log("Demo protection initializing...");

    // Force reset localStorage for testing
    localStorage.removeItem('cylvy-demo-access');
    console.log("Login credentials reset");

    // Create and display login screen
    function showLoginScreen() {
        console.log("Preparing login screen");
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'demo-login-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'linear-gradient(135deg, #E51848, #8806BF)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
        
        // Create login box
        const loginBox = document.createElement('div');
        loginBox.style.background = '#FFFFFF';
        loginBox.style.padding = '30px';
        loginBox.style.borderRadius = '8px';
        loginBox.style.width = '350px';
        loginBox.style.maxWidth = '90%';
        loginBox.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        loginBox.style.textAlign = 'center';
        
        // Add content to login box
        loginBox.innerHTML = `
            <div style="font-size: 32px; font-weight: 700; margin-bottom: 10px; color: #E51848;">cylvy</div>
            <div style="width: 40px; height: 4px; background: linear-gradient(to right, #E51848, #8806BF); margin: 0 auto 20px;"></div>
            
            <h2 style="margin-bottom: 20px; color: #333333; font-weight: 300;">Contact Map Demo</h2>
            <p style="margin-bottom: 30px; color: #666;">Enter the password to access the demo</p>
            
            <form id="demo-login-form">
                <div style="margin-bottom: 20px;">
                    <input type="password" id="demo-password" placeholder="Password" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;" autofocus>
                </div>
                
                <div id="password-error" style="color: #E51848; margin-bottom: 15px; display: none;">
                    Incorrect password. Please try again.
                </div>
                
                <button type="submit" style="background: linear-gradient(to right, #E51848, #8806BF); color: white; border: none; border-radius: 4px; padding: 12px 20px; font-size: 16px; cursor: pointer; width: 100%;">
                    Access Demo
                </button>
            </form>
            
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 13px; color: #999;">
                <p style="margin: 5px 0;">Last login: 2025-05-03 18:00:09 UTC</p>
                <p style="margin: 5px 0;">User: silveradrian</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                &copy; 2025 Cylvy. All rights reserved.
            </p>
        `;
        
        // Add overlay to page - wait for body to be available
        overlay.appendChild(loginBox);
        
        // Wait for document body to be available
        if (document.body) {
            document.body.appendChild(overlay);
            console.log("Login screen attached to document body");
            setupLoginForm();
        } else {
            console.log("Document body not available yet, waiting...");
            // Wait for the DOM to be ready
            document.addEventListener('DOMContentLoaded', function() {
                document.body.appendChild(overlay);
                console.log("Login screen attached to document body (delayed)");
                setupLoginForm();
            });
        }
    }
    
    // Setup login form event handlers
    function setupLoginForm() {
        setTimeout(() => {
            const form = document.getElementById('demo-login-form');
            if (form) {
                form.onsubmit = function(e) {
                    e.preventDefault();
                    const password = document.getElementById('demo-password').value;
                    
                    if (password === 'dynatracedemo') {
                        console.log("Login successful");
                        document.getElementById('demo-login-overlay').style.display = 'none';
                        
                        // Set login in localStorage
                        const expiry = new Date();
                        expiry.setHours(expiry.getHours() + 24);
                        localStorage.setItem('cylvy-demo-access', JSON.stringify({
                            expires: expiry.getTime(),
                            user: 'silveradrian',
                            lastLogin: new Date().toISOString()
                        }));
                        
                        // Set flag to prevent LinkedIn modal
                        window.preventLinkedInModal = true;
                        setTimeout(() => {
                            window.preventLinkedInModal = false;
                        }, 2000);
                    } else {
                        console.log("Login failed");
                        document.getElementById('password-error').style.display = 'block';
                        document.getElementById('demo-password').value = '';
                    }
                };
                console.log("Login form handler attached");
            } else {
                console.error("Login form not found in DOM");
            }
        }, 100);
    }
    
    // Patch LinkedIn integration to prevent auto-modal
    function patchLinkedIn() {
        window.preventLinkedInModal = true;
        
        const interval = setInterval(() => {
            if (window.LinkedInConnectionIntelligence) {
                console.log("Patching LinkedIn functionality");
                
                // Save original methods
                const originalAuth = window.LinkedInConnectionIntelligence.prototype.authenticate;
                const originalShowModal = window.LinkedInConnectionIntelligence.prototype.showLoginModal;
                
                // Override authenticate
                window.LinkedInConnectionIntelligence.prototype.authenticate = function() {
                    if (window.preventLinkedInModal) {
                        console.log("LinkedIn authentication prevented");
                        return;
                    }
                    return originalAuth.apply(this, arguments);
                };
                
                // Override showLoginModal
                if (originalShowModal) {
                    window.LinkedInConnectionIntelligence.prototype.showLoginModal = function() {
                        if (window.preventLinkedInModal) {
                            console.log("LinkedIn modal prevented");
                            return;
                        }
                        return originalShowModal.apply(this, arguments);
                    };
                }
                
                clearInterval(interval);
            }
        }, 500);
        
        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(interval), 10000);
    }
    
    // Call functions
    showLoginScreen();
    patchLinkedIn();
    
    // Add another safety check to make absolutely sure the login appears
    window.addEventListener('load', function() {
        if (!document.getElementById('demo-login-overlay')) {
            console.log("Safety check: Login screen not found, showing it now");
            showLoginScreen();
        } else {
            console.log("Safety check: Login screen already exists");
        }
    });
})();