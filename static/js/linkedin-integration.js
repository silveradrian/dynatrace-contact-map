/**
 * LinkedIn Connection Intelligence Module
 * Front-end POC implementation for Dynatrace ABM Contact Map
 * @author silveradrian
 * @version 1.0.0
 */
class LinkedInConnectionIntelligence {
    constructor() {
        // Mock data store for connections
        this.connectionData = {};
        this.accountManagerId = null;
        this.accountManagerName = "Adrian Howett"; // Default for demo
        this.isAuthenticated = false;
        
        // Initialize the UI components
        this.initUI();
        
        // For demo purposes, pre-populate some connection data
        this.demoMode = true;
    }
    
    /**
     * Initialize UI components for LinkedIn integration
     */
    initUI() {
        // Add LinkedIn sign-in button to navbar
        const navbarText = document.querySelector('.navbar-text');
        if (navbarText) {
            const linkedInAuthBtn = document.createElement('button');
            linkedInAuthBtn.className = 'btn btn-outline-light ms-3';
            linkedInAuthBtn.id = 'linkedin-auth-btn';
            linkedInAuthBtn.innerHTML = '<i class="fab fa-linkedin me-1"></i> Connect My LinkedIn';
            linkedInAuthBtn.addEventListener('click', () => this.authenticate());
            navbarText.insertAdjacentElement('afterend', linkedInAuthBtn);
        }
        
        // Add connection status indicator to the filter panel
        const filterRow = document.querySelector('.row.mb-4');
        if (filterRow) {
            const connectionStatusCol = document.createElement('div');
            connectionStatusCol.className = 'col-12 mt-3';
            connectionStatusCol.innerHTML = `
                <div id="linkedin-connection-status" class="alert alert-secondary d-flex justify-content-between align-items-center" role="alert">
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
            
            // Add event listener to the "View Connections" button
            document.getElementById('view-connections-btn').addEventListener('click', () => this.showConnectionsModal());
        }
        
        // Add CSS for connection styling
        this.addStyles();
        
        // Add connection modal
        this.addConnectionsModal();
    }
    
    /**
     * Add CSS styles for LinkedIn integration
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .btn-linkedin {
                background-color: #0077B5;
                color: white;
                border-color: #0077B5;
            }
            
            .btn-linkedin:hover {
                background-color: #006699;
                color: white;
                border-color: #006699;
            }
            
            .fa-linkedin {
                color: inherit;
            }
            
            .linkedin-icon {
                color: #0077B5;
            }
            
            .connection-level-1 {
                border: 3px solid #28a745 !important;
                z-index: 1000 !important;
            }
            
            .connection-level-2 {
                border: 3px solid #17a2b8 !important;
                z-index: 999 !important;
            }
            
            .connection-level-3 {
                border: 3px solid #6c757d !important;
                z-index: 998 !important;
            }
            
            .badge-connection-1 {
                background-color: #28a745;
                color: white;
            }
            
            .badge-connection-2 {
                background-color: #17a2b8;
                color: white;
            }
            
            .badge-connection-3 {
                background-color: #6c757d;
                color: white;
            }
            
            .connection-path {
                font-size: 0.85rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Add connections modal to the page
     */
    addConnectionsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'connectionsModal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'connectionsModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="connectionsModalLabel">
                            <i class="fab fa-linkedin me-2"></i> LinkedIn Connection Intelligence
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="connection-summary mb-3">
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
                                <tbody id="connections-table-body">
                                    <!-- Connection data will be inserted here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-linkedin" id="refresh-connections-btn">
                            <i class="fas fa-sync-alt me-1"></i> Refresh Connections
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener to the refresh button
        document.getElementById('refresh-connections-btn').addEventListener('click', () => {
            this.fetchConnectionData();
            // Show a toast message
            this.showToast('Connections refreshed!');
        });
    }
    
    /**
     * Show a toast message
     */
    showToast(message) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '11';
        toastContainer.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <i class="fab fa-linkedin me-2 text-primary"></i>
                    <strong class="me-auto">LinkedIn</strong>
                    <small>Just now</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        document.body.appendChild(toastContainer);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
            document.body.removeChild(toastContainer);
        }, 3000);
    }
    
    /**
     * Simulate LinkedIn authentication
     * In a real app, this would use OAuth to authenticate with LinkedIn
     */
    authenticate() {
        // Show login modal
        this.showLoginModal();
    }
    
    /**
     * Show LinkedIn login modal
     */
    showLoginModal() {
        // Create a modal for LinkedIn login
        const modalHtml = `
            <div class="modal fade" id="linkedinLoginModal" tabindex="-1" aria-labelledby="linkedinLoginModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="linkedinLoginModalLabel">
                                <i class="fab fa-linkedin me-2" style="color: #0077B5;"></i> Sign in with LinkedIn
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <img src="https://brand.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Logo.svg.original.svg" alt="LinkedIn" width="120">
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
                                    <button type="submit" class="btn btn-primary btn-linkedin">Sign In</button>
                                </div>
                            </form>
                            <div class="mt-3 text-center">
                                <small class="text-muted">This is a simulation for the POC. No actual authentication occurs.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the document
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHtml;
        document.body.appendChild(modalElement.firstChild);
        
        // Show the modal
        const loginModal = new bootstrap.Modal(document.getElementById('linkedinLoginModal'));
        loginModal.show();
        
        // Add event listener to the form
        document.getElementById('linkedin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Hide the modal
            loginModal.hide();
            
            // Remove the modal element
            setTimeout(() => {
                document.getElementById('linkedinLoginModal').remove();
            }, 300);
            
            // Simulate successful authentication
            this.handleSuccessfulAuth();
        });
    }
    
    /**
     * Handle successful authentication
     */
    handleSuccessfulAuth() {
        this.isAuthenticated = true;
        this.accountManagerId = 'am_' + Math.floor(Math.random() * 10000);
        
        // Update UI
        const authBtn = document.getElementById('linkedin-auth-btn');
        authBtn.innerHTML = '<i class="fab fa-linkedin me-1"></i> LinkedIn Connected';
        authBtn.classList.remove('btn-outline-light');
        authBtn.classList.add('btn-success');
        
        // Update connection status
        const statusAlert = document.getElementById('linkedin-connection-status');
        const statusText = document.getElementById('connection-status-text');
        const viewConnectionsBtn = document.getElementById('view-connections-btn');
        
        statusAlert.classList.remove('alert-secondary');
        statusAlert.classList.add('alert-success');
        statusText.innerHTML = `Connected as <strong>${this.accountManagerName}</strong>`;
        viewConnectionsBtn.classList.remove('d-none');
        
        // Fetch connection data
        this.fetchConnectionData();
    }
    
    /**
     * Fetch (simulate) LinkedIn connection data
     */
    fetchConnectionData() {
        // For the POC, generate random connection data
        this.connectionData = {};
        let count1 = 0, count2 = 0, count3 = 0;
        
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
        
        // Update connections table in modal
        this.updateConnectionsTable();
        
        // Show a success message
        this.showToast(`LinkedIn data loaded: ${count1 + count2 + count3} connections found!`);
    }
    
    /**
     * Generate sample connection paths
     */
    generateSamplePaths(level, contact) {
        const paths = [];
        const pathCount = Math.floor(Math.random() * 3) + 1; // 1-3 paths
        
        // Get company-specific professionals for more realistic paths
        const companyProfessionals = {
            "Microsoft": ["Sarah Johnson (Product Manager)", "David Chen (VP Engineering)", "Emma Wilson (Director)"],
            "Amazon": ["Michael Rodriguez (Solutions Architect)", "Jennifer Lee (Technical PM)", "Robert Kim (VP)"],
            "Oracle": ["Lisa Patel (Customer Success)", "James Thompson (Sales Director)", "Olivia Martinez (CTO)"],
            "IBM": ["Thomas Baker (Cloud Specialist)", "Sofia Garcia (Director)", "William Davis (Senior Architect)"],
            "SAP": ["Anna Müller (Product Owner)", "Carlos Lopez (Implementation Lead)", "Natalie Wong (VP Sales)"]
        };
        
        // Get professionals from the contact's company or default list
        const professionals = companyProfessionals[contact.company] || [
            "Alex Taylor (IT Director)", 
            "Maria Rodriguez (CIO)", 
            "Kevin Johnson (VP Technology)"
        ];
        
        for (let i = 0; i < pathCount; i++) {
            let path = [];
            
            // For 1st-level connections, just one hop
            if (level === 1) {
                path = ['You'];
            }
            // For 2nd-level connections, add an intermediary
            else if (level === 2) {
                path = ['You', professionals[i % professionals.length]];
            }
            // For 3rd-level connections, add two intermediaries
            else if (level === 3) {
                const intermediaries1 = professionals;
                const intermediaries2 = [
                    "Thomas Anderson (Solutions Architect)",
                    "Olivia Martinez (Project Manager)",
                    "James Wilson (Director of Engineering)"
                ];
                path = [
                    'You', 
                    intermediaries1[i % intermediaries1.length],
                    intermediaries2[i % intermediaries2.length]
                ];
            }
            
            paths.push(path);
        }
        
        return paths;
    }
    
    /**
     * Show the connections modal
     */
    showConnectionsModal() {
        if (!this.isAuthenticated) return;
        
        // Make sure we have the latest data
        this.updateConnectionsTable();
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('connectionsModal'));
        modal.show();
    }
    
    /**
     * Update the connections table in the modal
     */
    updateConnectionsTable() {
        const tableBody = document.getElementById('connections-table-body');
        tableBody.innerHTML = '';
        
        // Sort connections by level (1st, then 2nd, then 3rd)
        const sortedContacts = Object.keys(this.connectionData)
            .map(id => {
                const contactId = parseInt(id);
                const contact = contactsData.find(c => c.id === contactId);
                const connection = this.connectionData[id];
                return { contact, connection };
            })
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
            row.querySelector('.view-contact-btn').addEventListener('click', () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('connectionsModal'));
                modal.hide();
                this.highlightContact(contact.id);
            });
        });
    }
    
    /**
     * Enhance contact data with connection information
     */
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
                        // Remove any existing connection level classes
                        markerElement.classList.remove('connection-level-1', 'connection-level-2', 'connection-level-3');
                        // Add the new connection level class
                        markerElement.classList.add(`connection-level-${connection.level}`);
                    }
                }
            });
        }
        
        // Update the contact details if any are currently shown
        const detailsContainer = document.getElementById('contact-details');
        if (detailsContainer && !detailsContainer.querySelector('.text-center')) {
            // There's a contact being displayed, find which one
            const nameElement = detailsContainer.querySelector('.contact-header h5');
            if (nameElement) {
                const name = nameElement.textContent;
                const contact = contactsData.find(c => c.name === name);
                if (contact) {
                    // Re-render the contact details with connection data
                    this.renderContactDetails(contact);
                }
            }
        }
    }
    
    /**
     * Highlight a contact on the map
     */
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
    
    /**
     * Render contact details with connection information
     */
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
    
    /**
     * Format a connection path for display
     */
    formatConnectionPath(path) {
        if (!path || path.length === 0) return '';
        
        return path.map((name, index) => {
            if (index === 0) return `<span class="text-primary">${name}</span>`;
            if (index === path.length - 1) return `<span class="text-success">${name}</span>`;
            return `<i class="fas fa-angle-right mx-1"></i><span>${name}</span>`;
        }).join(' ');
    }
    
    /**
     * Get HTML for connection level badge
     */
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
    
    /**
     * Get CSS badge class for seniority level
     */
    getSeniorityBadgeClass(seniority) {
        switch(seniority) {
            case 'C-level': return 'bg-primary';
            case 'VP': return 'bg-success';
            case 'Director': return 'bg-info';
            case 'Manager': return 'bg-secondary';
            default: return 'bg-light text-dark';
        }
    }
    
    /**
     * Get ordinal suffix (st, nd, rd, th)
     */
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
    // Create an instance of the LinkedIn Connection Intelligence module
    window.linkedInIntelligence = new LinkedInConnectionIntelligence();
    
    // Override the showContactDetails function to include connection information
    const originalShowContactDetails = window.showContactDetails;
    window.showContactDetails = function(contact) {
        if (window.linkedInIntelligence && window.linkedInIntelligence.isAuthenticated) {
            window.linkedInIntelligence.renderContactDetails(contact);
        } else {
            originalShowContactDetails(contact);
        }
    };
});