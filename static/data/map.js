document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('contact-map').setView([20, 0], 2);
    
    // Add tile layer (base map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Create a marker cluster group
    const markers = L.markerClusterGroup();
    
    // Custom icon function based on seniority
    function getMarkerIcon(seniority) {
        let iconClass = 'fas fa-user';
        let markerClass = 'manager';
        
        switch(seniority) {
            case 'C-level':
                iconClass = 'fas fa-user-tie';
                markerClass = 'c-level';
                break;
            case 'VP':
                iconClass = 'fas fa-user-tag';
                markerClass = 'vp';
                break;
            case 'Director':
                iconClass = 'fas fa-user-cog';
                markerClass = 'director';
                break;
            default:
                iconClass = 'fas fa-user';
                markerClass = 'manager';
        }
        
        return L.divIcon({
            html: `<div class="custom-marker ${markerClass}"><i class="${iconClass}"></i></div>`,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    }
    
    // Function to create popup content
    function createPopupContent(contact) {
        return `
            <div class="popup-content">
                <div class="popup-header">${contact.name}</div>
                <div class="popup-company">${contact.title}</div>
                <div>${contact.company}</div>
                <div>${contact.location}</div>
                <div class="mt-2 d-grid">
                    <button class="btn btn-sm btn-primary view-details" data-id="${contact.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }
    

// Function to create popup content
function createPopupContent(contact) {
    return `
        <div class="popup-content">
            <div class="popup-header">${contact.name}</div>
            <div class="popup-company">${contact.title}</div>
            <div>${contact.company}</div>
            <div>${contact.location}</div>
            <div class="mt-2 d-flex justify-content-between">
                <button class="btn btn-sm btn-primary view-details" data-id="${contact.id}">
                    View Details
                </button>
                <a href="${contact.linkedin}" target="_blank" class="btn btn-sm btn-linkedin">
                    <i class="fab fa-linkedin"></i>
                </a>
            </div>
        </div>
    `;
}



    // Function to show contact details

// Function to show contact details
function showContactDetails(contact) {
    const detailsContainer = document.getElementById('contact-details');
    
    detailsContainer.innerHTML = `
        <div class="contact-card">
            <div class="contact-header">
                <h5>${contact.name}</h5>
                <span class="badge ${getSeniorityBadgeClass(contact.seniority)}">${contact.seniority}</span>
            </div>
            <div class="contact-company">${contact.company}</div>
            <div class="contact-title">${contact.title}</div>
            <div class="contact-info">
                <p><i class="fas fa-globe"></i> ${contact.region} - ${contact.location}</p>
                <p><i class="fas fa-envelope"></i> <a href="mailto:${contact.email}">${contact.email}</a></p>
                <p><i class="fas fa-phone"></i> <a href="tel:${contact.phone}">${contact.phone}</a></p>
                <p><i class="fas fa-link"></i> <a href="https://${contact.domain}" target="_blank">${contact.domain}</a></p>
            </div>
            <hr>
            <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-address-card me-1"></i> Add to CRM
                </button>
                <a href="${contact.linkedin}" target="_blank" class="btn btn-sm btn-linkedin">
                    <i class="fab fa-linkedin me-1"></i> Connect on LinkedIn
                </a>
            </div>
        </div>
    `;
}
    
    // Helper function for badge colors
    function getSeniorityBadgeClass(seniority) {
        switch(seniority) {
            case 'C-level': return 'bg-danger';
            case 'VP': return 'bg-warning text-dark';
            case 'Director': return 'bg-info text-dark';
            default: return 'bg-secondary';
        }
    }
    
    // Add markers for each contact
    contactsData.forEach(contact => {
        const marker = L.marker(contact.latLng, {
            icon: getMarkerIcon(contact.seniority)
        });
        
        marker.bindPopup(createPopupContent(contact));
        marker.on('click', function() {
            showContactDetails(contact);
        });
        
        markers.addLayer(marker);
    });
    
    // Add the marker cluster group to the map
    map.addLayer(markers);
    
    // Filter contacts based on selection
    document.querySelectorAll('.filter').forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    // Filter function
    function applyFilters() {
        // Get filter values
        const companyFilter = document.getElementById('company-filter').value;
        const domainFilter = document.getElementById('domain-filter').value;
        const regionFilter = document.getElementById('region-filter').value;
        const functionFilter = document.getElementById('function-filter').value;
        const titleFilter = document.getElementById('title-filter').value;
        const seniorityFilter = document.getElementById('seniority-filter').value;
        
        // Remove all markers
        markers.clearLayers();
        
        // Filter contacts
        const filteredContacts = contactsData.filter(contact => {
            return (!companyFilter || contact.company.includes(companyFilter)) &&
                   (!domainFilter || contact.domain.includes(domainFilter)) &&
                   (!regionFilter || contact.region === regionFilter) &&
                   (!functionFilter || contact.function === functionFilter) &&
                   (!titleFilter || contact.title.includes(titleFilter)) &&
                   (!seniorityFilter || contact.seniority === seniorityFilter);
        });
        
        // Update contact count
        document.getElementById('contact-count').textContent = `${filteredContacts.length} Contacts`;
        
        // Add filtered markers back to the map
        filteredContacts.forEach(contact => {
            const marker = L.marker(contact.latLng, {
                icon: getMarkerIcon(contact.seniority)
            });
            
            marker.bindPopup(createPopupContent(contact));
            marker.on('click', function() {
                showContactDetails(contact);
            });
            
            markers.addLayer(marker);
        });
        
        // Update table (limited implementation for POC)
        // In a real implementation, this would dynamically update the table with filtered contacts
    }
    
    // Handle popup button clicks
    map.on('popupopen', function() {
        setTimeout(() => {
            document.querySelectorAll('.view-details').forEach(btn => {
                btn.addEventListener('click', function() {
                    const contactId = parseInt(this.getAttribute('data-id'));
                    const contact = contactsData.find(c => c.id === contactId);
                    if (contact) {
                        showContactDetails(contact);
                    }
                });
            });
        }, 100);
    });
    
    // Initialize with the first contact's details
    if (contactsData.length > 0) {
        showContactDetails(contactsData[0]);
    }
});

// LinkedIn modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const linkedinModal = new bootstrap.Modal(document.getElementById('linkedinConnectModal'));
    let currentContactId;
    
    // Open the LinkedIn modal when clicking the Connect button in contact details
    document.addEventListener('click', function(e) {
        if (e.target && e.target.closest('.btn-linkedin')) {
            if (!e.target.closest('a[target="_blank"]')) {
                e.preventDefault();
                const contactId = e.target.closest('[data-id]')?.getAttribute('data-id') || 
                                document.querySelector('.view-details')?.getAttribute('data-id');
                
                if (contactId) {
                    currentContactId = parseInt(contactId);
                    showLinkedInModal(currentContactId);
                }
            }
        }
    });
    
    // Function to show the LinkedIn modal with contact details
    function showLinkedInModal(contactId) {
        const contact = contactsData.find(c => c.id === contactId);
        if (contact) {
            const profileContainer = document.getElementById('linkedin-contact-profile');
            profileContainer.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <div class="flex-shrink-0">
                        <div class="contact-avatar">
                            <i class="fas fa-user-circle fa-2x"></i>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h5 class="mb-0">${contact.name}</h5>
                        <p class="mb-0 text-muted">${contact.title} at ${contact.company}</p>
                        <p class="mb-0 small">${contact.location}</p>
                    </div>
                </div>
                <div class="linkedin-profile-link mt-2">
                    <a href="${contact.linkedin}" target="_blank" class="d-block text-center">
                        View Full LinkedIn Profile <i class="fas fa-external-link-alt ms-1"></i>
                    </a>
                </div>
            `;
            linkedinModal.show();
        }
    }
    
    // Handle sending the connection request
    document.getElementById('send-connection-request').addEventListener('click', function() {
        // In a real app, this would send the connection request
        // For the POC, we'll just close the modal and show a success message
        linkedinModal.hide();
        
        // Show a success toast or alert
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
                    Connection request sent successfully!
                </div>
            </div>
        `;
        document.body.appendChild(toastContainer);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
            document.body.removeChild(toastContainer);
        }, 3000);
    });
});