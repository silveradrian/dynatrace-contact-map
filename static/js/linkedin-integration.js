/**
 * LinkedIn Connection Intelligence Module
 * Front-end POC implementation for Dynatrace ABM Contact Map
 * @author silveradrian
 * @version 1.0.3
 */
class LinkedInConnectionIntelligence {
    constructor() {
        this.connectionData = {};
        this.accountManagerId = null;
        this.accountManagerName = "Adrian Howett"; // Default for demo
        this.isAuthenticated = false;
        
        console.log("LinkedIn Connection Intelligence initializing...");
        this.initUI();
    }
    
    initUI() {
        try {
            // Add LinkedIn sign-in button to navbar
            const navbarText = document.querySelector('.navbar-text');
            if (navbarText) {
                const linkedInAuthBtn = document.createElement('button');
                linkedInAuthBtn.className = 'btn btn-outline-light ms-3';
                linkedInAuthBtn.id = 'linkedin-auth-btn';
                linkedInAuthBtn.innerHTML = '<i class="fab fa-linkedin me-1"></i> Connect My LinkedIn';
                linkedInAuthBtn.onclick = (e) => {
                    e.preventDefault();
                    console.log("LinkedIn button clicked");
                    this.showCustomLoginDialog();
                };
                navbarText.insertAdjacentElement('afterend', linkedInAuthBtn);
                console.log("LinkedIn button added successfully");
            }
            
            // Add connection status indicator
            const filterRow = document.querySelector('.row.mb-4');
            if (filterRow) {
                const connectionStatusCol = document.createElement('div');
                connectionStatusCol.className = 'col-12 mt-3';
                connectionStatusCol.innerHTML = `
                    <div id="linkedin-connection-status" class="alert alert-secondary d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fab fa-linkedin me-2"></i>
                            <span id="connection-status-text">LinkedIn not connected</span>
                        </div>
                        <button id="view-connections-btn" class="btn btn-sm btn-outline-primary d-none">
                            View Connections
                        </button>
                    </div>
                `;
                filterRow.insertAdjacentElement('afterend', connectionStatusCol);
                
                // Add "View Connections" button handler
                document.getElementById('view-connections-btn').onclick = () => this.showConnectionsView();
            }
            
            // Add CSS styles
            this.addStyles();
            
            // Add connections view
            this.addConnectionsView();
        } catch (error) {
            console.error("Error in initUI:", error);
        }
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .btn-linkedin { background-color: #0077B5; color: white; border-color: #0077B5; }
            .btn-linkedin:hover { background-color: #006699; color: white; }
            .linkedin-icon { color: #0077B5; }
            .connection-level-1 { border: 3px solid #28a745 !important; z-index: 1000 !important; }
            .connection-level-2 { border: 3px solid #17a2b8 !important; z-index: 999 !important; }
            .connection-level-3 { border: 3px solid #6c757d !important; z-index: 998 !important; }
            .badge-connection-1 { background-color: #28a745; color: white; }
            .badge-connection-2 { background-color: #17a2b8; color: white; }
            .badge-connection-3 { background-color: #6c757d; color: white; }
            .custom-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background-color: rgba(0,0,0,0.5); display: flex;
                justify-content: center; align-items: center; z-index: 2000;
            }
            .custom-modal-content {
                background: white; border-radius: 5px; padding: 20px;
                width: 400px; max-width: 90%; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            .custom-modal-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 15px;
            }
            .custom-modal-close {
                background: none; border: none; font-size: 1.5rem; cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
    
    addConnectionsView() {
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.id = 'connectionsView';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="custom-modal-content" style="width: 800px; max-width: 95%;">
                <div class="custom-modal-header">
                    <h5><i class="fab fa-linkedin me-2"></i> LinkedIn Connection Intelligence</h5>
                    <button type="button" class="custom-modal-close">&times;</button>
                </div>
                <div class="alert alert-info">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong><i class="fas fa-user-circle me-2"></i> <span id="modal-account-manager-name">Account Manager</span></strong>
                        </div>
                        <div>
                            <span class="badge rounded-pill bg-primary me-1" id="modal-connection-count-1">0</span> 1st
                            <span class="badge rounded-pill bg-info me-1" id="modal-connection-count-2">0</span> 2nd
                            <span class="badge rounded-pill bg-secondary me-1" id="modal-connection-count-3">0</span> 3rd
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>Contact</th>
                                <th>Company</th>
                                <th>Connection</th>
                                <th>Path</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="connections-table-body"></tbody>
                    </table>
                </div>
                <div class="text-end mt-3">
                    <button type="button" class="btn btn-secondary me-2 close-modal-btn">Close</button>
                    <button type="button" class="btn btn-linkedin" id="refresh-connections-btn">
                        <i class="fas fa-sync-alt me-1"></i> Refresh Connections
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.custom-modal-close').onclick = () => modal.style.display = 'none';
        modal.querySelector('.close-modal-btn').onclick = () => modal.style.display = 'none';
        modal.querySelector('#refresh-connections-btn').onclick = () => {
            this.fetchConnectionData();
            this.showToast('Connections refreshed!');
        };
    }
    
    showToast(message) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '2001';
        toastContainer.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <i class="fab fa-linkedin me-2 text-primary"></i>
                    <strong class="me-auto">LinkedIn</strong>
                    <small>Just now</small>
                    <button type="button" class="btn-close" onclick="this.parentNode.parentNode.parentNode.remove()"></button>
                </div>
                <div class="toast-body">${message}</div>
            </div>
        `;
        document.body.appendChild(toastContainer);
        
        setTimeout(() => {
            if (document.body.contains(toastContainer)) {
                document.body.removeChild(toastContainer);
            }
        }, 3000);
    }
    
    // Simple custom dialog instead of Bootstrap Modal
    showCustomLoginDialog() {
        try {
            console.log("Creating custom login dialog...");
            
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';
            overlay.id = 'loginDialog';
            
            overlay.innerHTML = `
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h5><i class="fab fa-linkedin me-2" style="color: #0077B5;"></i> Sign in with LinkedIn</h5>
                        <button type="button" class="custom-modal-close">&times;</button>
                    </div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://brand.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Logo.svg.original.svg" 
                            alt="LinkedIn" width="120">
                    </div>
                    <form id="linkedin-login-form">
                        <div class="mb-3">
                            <label for="linkedin-email" class="form-label">Email or Phone</label>
                            <input type="email" class="form-control" id="linkedin-email" value="adrian.howett@example.com">
                        </div>
                        <div class="mb-3">
                            <label for="linkedin-password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="linkedin-password" value="********">
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-linkedin">Sign In</button>
                        </div>
                    </form>
                    <div class="mt-3 text-center">
                        <small class="text-muted">This is a simulation for the POC. No actual authentication occurs.</small>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Add event listeners
            overlay.querySelector('.custom-modal-close').onclick = () => document.body.removeChild(overlay);
            
            overlay.querySelector('#linkedin-login-form').onsubmit = (e) => {
                e.preventDefault();
                document.body.removeChild(overlay);
                this.handleSuccessfulAuth();
            };
            
            console.log("Custom login dialog created successfully");
        } catch (error) {
            console.error("Error showing login dialog:", error);
            alert("Could not open LinkedIn login dialog: " + error.message);
        }
    }
    
    handleSuccessfulAuth() {
        console.log("Authentication successful");
        this.isAuthenticated = true;
        this.accountManagerId = 'am_' + Math.floor(Math.random() * 10000);
        
        // Update UI
        const authBtn = document.getElementById('linkedin-auth-btn');
        if (authBtn) {
            authBtn.innerHTML = '<i class="fab fa-linkedin me-1"></i> LinkedIn Connected';
            authBtn.classList.remove('btn-outline-light');
            authBtn.classList.add('btn-success');
        }
        
        // Update connection status
        const statusAlert = document.getElementById('linkedin-connection-status');
        const statusText = document.getElementById('connection-status-text');
        const viewConnectionsBtn = document.getElementById('view-connections-btn');
        
        if (statusAlert && statusText && viewConnectionsBtn) {
            statusAlert.classList.remove('alert-secondary');
            statusAlert.classList.add('alert-success');
            statusText.innerHTML = `Connected as <strong>${this.accountManagerName}</strong>`;
            viewConnectionsBtn.classList.remove('d-none');
        }
        
        // Fetch connection data
        this.fetchConnectionData();
    }
    
    fetchConnectionData() {
        console.log("Fetching connection data...");
        
        // For the POC, generate random connection data
        this.connectionData = {};
        let count1 = 0, count2 = 0, count3 = 0;
        
        if (typeof contactsData === 'undefined' || !contactsData) {
            console.error("contactsData is not defined!");
            this.showToast("Error: Contact data not available");
            return;
        }
        
        contactsData.forEach(contact => {
            // Randomly assign connection level (1st, 2nd, 3rd, or none)
            const connectionLevel = Math.floor(Math.random() * 4); // 0-3, where 0 means no connection
            
            if (connectionLevel > 0) {
                this.connectionData[contact.id] = {
                    contactId: contact.id,
                    level: connectionLevel,
                    paths: this.generateSamplePaths(connectionLevel, contact)
                };
                
                // Update counts
                if (connectionLevel === 1) count1++;
                else if (connectionLevel === 2) count2++;
                else if (connectionLevel === 3) count3++;
            }
        });
        
        // Update connection counts in the modal
        document.getElementById('modal-account-manager-name').textContent = this.accountManagerName;
        document.getElementById('modal-connection-count-1').textContent = count1;
        document.getElementById('modal-connection-count-2').textContent = count2;
        document.getElementById('modal-connection-count-3').textContent = count3;
        
        // Enhance contacts with connection data
        this.enhanceContactsWithConnectionData();
        
        // Update connections table
        this.updateConnectionsTable();
        
        // Show a success message
        this.showToast(`LinkedIn data loaded: ${count1 + count2 + count3} connections found!`);
    }
    
    generateSamplePaths(level, contact) {
        const paths = [];
        const pathCount = Math.floor(Math.random() * 3) + 1; // 1-3 paths
        
        const companyProfessionals = {
            "Microsoft": ["Sarah Johnson (Product Manager)", "David Chen (VP Engineering)", "Emma Wilson (Director)"],
            "Amazon": ["Michael Rodriguez (Solutions Architect)", "Jennifer Lee (Technical PM)", "Robert Kim (VP)"],
            "Oracle": ["Lisa Patel (Customer Success)", "James Thompson (Sales Director)", "Olivia Martinez (CTO)"],
            "IBM": ["Thomas Baker (Cloud Specialist)", "Sofia Garcia (Director)", "William Davis (Senior Architect)"],
            "SAP": ["Anna Müller (Product Owner)", "Carlos Lopez (Implementation Lead)", "Natalie Wong (VP Sales)"]
        };
        
        // Get professionals from the contact's company or default list
        const professionals = companyProfessionals[contact.company] || [
            "Alex Taylor (IT Director)", "Maria Rodriguez (CIO)", "Kevin Johnson (VP Technology)"
        ];
        
        for (let i = 0; i < pathCount; i++) {
            let path = [];
            
            if (level === 1) {
                path = ['You'];
            } else if (level === 2) {
                path = ['You', professionals[i % professionals.length]];
            } else if (level === 3) {
                const intermediaries1 = professionals;
                const intermediaries2 = ["Thomas Anderson (Solutions Architect)", "Olivia Martinez (PM)", "James Wilson (Director)"];
                path = ['You', intermediaries1[i % intermediaries1.length], intermediaries2[i % intermediaries2.length]];
            }
            
            paths.push(path);
        }
        
        return paths;
    }
    
    showConnectionsView() {
        if (!this.isAuthenticated) return;
        
        // Update connections table
        this.updateConnectionsTable();
        
        // Show the connections view
        document.getElementById('connectionsView').style.display = 'flex';
    }
    
    updateConnectionsTable() {
        const tableBody = document.getElementById('connections-table-body');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // Sort connections by level (1st, then 2nd, then 3rd)
        const sortedContacts = Object.keys(this.connectionData)
            .map(id => {
                const contactId = parseInt(id);
                const contact = contactsData.find(c => c.id === contactId);
                return { contact, connection: this.connectionData[id] };
            })
            .filter(item => item.contact)
            .sort((a, b) => a.connection.level - b.connection.level);
        
        sortedContacts.forEach(({ contact, connection }) => {
            const row = document.createElement('tr');
            
            // Create badge for connection level
            const levelBadge = this.getConnectionLevelBadge(connection.level);
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div>
                            <strong>${contact.name}</strong><br>
                            <small class="text-muted">${contact.title}</small>
                        </div>
                    </div>
                </td>
                <td>${contact.company}</td>
                <td>${levelBadge}</td>
                <td>
                    <small>${this.formatConnectionPath(connection.paths[0])}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-contact-btn" data-id="${contact.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <a href="${contact.linkedin}" target="_blank" class="btn btn-sm btn-linkedin">
                        <i class="fab fa-linkedin"></i>
                    </a>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add click event to view contact
            row.querySelector('.view-contact-btn').onclick = () => {
                document.getElementById('connectionsView').style.display = 'none';
                this.highlightContact(contact.id);
            };
        });
    }
    
    enhanceContactsWithConnectionData() {
        // If we have the map initialized in the global scope
        if (typeof map !== 'undefined' && map && window.markers) {
            window.markers.forEach(marker => {
                const contactId = marker.options.contactId;
                const connection = this.connectionData[contactId];
                
                if (connection) {
                    // Add connection level class to marker
                    const markerElement = marker.getElement();
                    if (markerElement) {
                        markerElement.classList.remove('connection-level-1', 'connection-level-2', 'connection-level-3');
                        markerElement.classList.add(`connection-level-${connection.level}`);
                    }
                }
            });
        }
        
        // Update contact details if any are currently shown
        const detailsContainer = document.getElementById('contact-details');
        if (detailsContainer && !detailsContainer.querySelector('.text-center')) {
            const nameElement = detailsContainer.querySelector('.contact-header h5');
            if (nameElement) {
                const name = nameElement.textContent;
                const contact = contactsData.find(c => c.name === name);
                if (contact) {
                    this.renderContactDetails(contact);
                }
            }
        }
    }
    
    highlightContact(contactId) {
        const contact = contactsData.find(c => c.id === parseInt(contactId));
        if (!contact) return;
        
        // Center map on contact
        if (typeof map !== 'undefined' && map) {
            map.setView(contact.latLng, 6);
            
            // Find and open the marker popup
            if (window.markers) {
                window.markers.forEach(marker => {
                    if (marker.options.contactId === parseInt(contactId)) {
                        marker.openPopup();
                    }
                });
            }
        }
        
        // Show contact details
        this.renderContactDetails(contact);
    }
    
    renderContactDetails(contact) {
        const detailsContainer = document.getElementById('contact-details');
        if (!detailsContainer) return;
        
        const connection = this.connectionData[contact.id];
        
        // Connection information HTML
        let connectionHtml = '';
        if (connection) {
            const levelBadge = this.getConnectionLevelBadge(connection.level);
            
            connectionHtml = `
                <div class="connection-info mt-3">
                    <h6 class="border-bottom pb-2">LinkedIn Connection</h6>
                    <p>${levelBadge} connection to this contact</p>
                    <div class="connection-paths">
                        ${connection.paths.map(path => `
                            <div class="connection-path mb-2">
                                <small class="text-muted">Via: ${this.formatConnectionPath(path)}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        detailsContainer.innerHTML = `
            <div class="contact-card">
                <div class="contact-header">
                    <h5>${contact.name}</h5>
                    <span class="badge ${this.getSeniorityBadgeClass(contact.seniority)}">${contact.seniority}</span>
                </div>
                <div class="contact-company">${contact.company}</div>
                <div class="contact-title">${contact.title}</div>
                <div class="contact-info">
                    <p><i class="fas fa-globe"></i> ${contact.region} - ${contact.location}</p>
                    <p><i class="fas fa-envelope"></i> <a href="mailto:${contact.email}">${contact.email}</a></p>
                    <p><i class="fas fa-phone"></i> <a href="tel:${contact.phone}">${contact.phone}</a></p>
                    <p><i class="fas fa-link"></i> <a href="https://${contact.domain}" target="_blank">${contact.domain}</a></p>
                    <p><i class="fab fa-linkedin linkedin-icon"></i> <a href="${contact.linkedin}" target="_blank">View Profile</a></p>
                </div>
                ${connection ? connectionHtml : ''}
                <hr>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-address-card me-1"></i> Add to CRM
                    </button>
                    <a href="${contact.linkedin}" target="_blank" class="btn btn-sm btn-linkedin">
                        <i class="fab fa-linkedin me-1"></i> Connect
                    </a>
                </div>
            </div>
        `;
    }
    
    formatConnectionPath(path) {
        if (!path || path.length === 0) return '';
        
        return path.map((name, index) => {
            if (index === 0) return `<span class="text-primary">${name}</span>`;
            if (index === path.length - 1) return `<span class="text-success">${name}</span>`;
            return `<i class="fas fa-angle-right mx-1"></i><span>${name}</span>`;
        }).join(' ');
    }
    
    getConnectionLevelBadge(level) {
        const classes = {
            1: 'badge-connection-1',
            2: 'badge-connection-2',
            3: 'badge-connection-3'
        };
        
        return `<span class="badge ${classes[level] || 'bg-light text-dark'}">
            ${level}${this.getOrdinalSuffix(level)} degree
        </span>`;
    }
    
    getSeniorityBadgeClass(seniority) {
        switch(seniority) {
            case 'C-level': return 'bg-primary';
            case 'VP': return 'bg-success';
            case 'Director': return 'bg-info';
            case 'Manager': return 'bg-secondary';
            default: return 'bg-light text-dark';
        }
    }
    
    getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    }
}

// Initialize the LinkedIn Connection Intelligence module when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing LinkedIn Connection Intelligence");
    try {
        // Create an instance of the LinkedIn Connection Intelligence module
        window.linkedInIntelligence = new LinkedInConnectionIntelligence();
        
        // Override the showContactDetails function if it exists
        if (typeof window.showContactDetails === 'function') {
            const originalShowContactDetails = window.showContactDetails;
            window.showContactDetails = function(contact) {
                if (window.linkedInIntelligence && window.linkedInIntelligence.isAuthenticated) {
                    window.linkedInIntelligence.renderContactDetails(contact);
                } else {
                    originalShowContactDetails(contact);
                }
            };
        }
    } catch (error) {
        console.error("Error initializing LinkedIn Connection Intelligence:", error);
    }
});