document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initNavigation();
    loadDoctors();
    setupChatbot();
    addAnimations();
});

// Add animations and enhanced UI effects
function addAnimations() {
    // Add loading indicators
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.innerHTML = 'Loading<span class="dot-animation">...</span>';
    });

    // Add typing animation to initial bot message
    const initialMessage = document.querySelector('.message.bot p');
    if (initialMessage) {
        const originalText = initialMessage.textContent;
        initialMessage.textContent = '';
        typeWriterEffect(initialMessage, originalText, 30);
    }

    // Add scroll animations
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
}

// Type writer effect for bot messages
function typeWriterEffect(element, text, speed) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Reveal elements on scroll
function revealOnScroll() {
    const elements = document.querySelectorAll('.doctor-card, .about-content, .doctors-header');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('revealed');
        }
    });
}

// Navigation between sections
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            link.parentElement.classList.add('active');
            
            // Show the corresponding section
            const targetSection = link.getAttribute('data-section');
            document.getElementById(targetSection).classList.add('active');
            
            // Smooth scroll to top of section
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

// Load doctors data
async function loadDoctors() {
    const doctorsList = document.getElementById('doctors-list');
    const specialtyFilter = document.getElementById('specialty-filter');
    
    try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
            throw new Error(`Failed to fetch doctors (${response.status})`);
        }
        
        const doctors = await response.json();
        
        // Clear loading message
        doctorsList.innerHTML = '';
        
        // Populate doctors list
        doctors.forEach(doctor => {
            const doctorCard = createDoctorCard(doctor);
            doctorsList.appendChild(doctorCard);
        });
        
        // Extract unique specialties for filter
        const specialties = [...new Set(doctors.map(doctor => doctor.specialization))].sort();
        
        // Populate specialty filter
        specialties.forEach(specialty => {
            const option = document.createElement('option');
            option.value = specialty;
            option.textContent = specialty;
            specialtyFilter.appendChild(option);
        });
        
        // Setup search and filter functionality
        setupDoctorSearch(doctors);
        
        // Add animation class to cards
        setTimeout(() => {
            const cards = document.querySelectorAll('.doctor-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('revealed');
                }, index * 100);
            });
        }, 300);
        
    } catch (error) {
        doctorsList.innerHTML = `<div class="error">Error loading doctors: ${error.message}</div>`;
        console.error('Error loading doctors:', error);
    }
}

// Create a doctor card element
function createDoctorCard(doctor) {
    const template = document.getElementById('doctor-card-template');
    const doctorCard = template.content.cloneNode(true);
    
    doctorCard.querySelector('.doctor-name').textContent = doctor.name;
    doctorCard.querySelector('.doctor-specialization span').textContent = doctor.specialization || 'N/A';
    doctorCard.querySelector('.doctor-experience span').textContent = doctor.experience || 'N/A';
    doctorCard.querySelector('.doctor-contact span').textContent = doctor.contact || 'N/A';
    
    // Add rating stars if available
    if (doctor.rating) {
        const rating = parseFloat(doctor.rating);
        const starsContainer = doctorCard.querySelector('.doctor-rating');
        starsContainer.innerHTML = '★'.repeat(Math.floor(rating)) + 
            (rating % 1 >= 0.5 ? '½' : '') + 
            '☆'.repeat(5 - Math.ceil(rating));
    }
    
    // Add extra data if available
    const card = doctorCard.querySelector('.doctor-card');
    if (doctor.hospital) {
        const hospitalElement = document.createElement('p');
        hospitalElement.innerHTML = `<i class="fas fa-hospital"></i> <span>${doctor.hospital}</span>`;
        card.querySelector('.doctor-info').insertBefore(hospitalElement, card.querySelector('.doctor-rating'));
    }
    
    if (doctor.availability) {
        const availabilityElement = document.createElement('p');
        availabilityElement.innerHTML = `<i class="fas fa-calendar"></i> <span>${doctor.availability}</span>`;
        card.querySelector('.doctor-info').insertBefore(availabilityElement, card.querySelector('.doctor-rating'));
    }
    
    // Setup book appointment button
    doctorCard.querySelector('.book-btn').addEventListener('click', () => {
        showBookingModal(doctor);
    });
    
    return doctorCard.querySelector('.doctor-card');
}

// Show booking modal
function showBookingModal(doctor) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>Book an Appointment</h3>
            <button class="close-modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <p>This is a demo feature. In a real application, you would be able to book an appointment with ${doctor.name} here.</p>
            <p class="success-message">Thank you for your interest in booking with ${doctor.name}.</p>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary cancel-btn">Cancel</button>
            <button class="btn-primary confirm-btn">Confirm Booking</button>
        </div>
    `;
    
    // Add modal to body
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    overlay.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    overlay.querySelector('.cancel-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    overlay.querySelector('.confirm-btn').addEventListener('click', () => {
        const successMessage = overlay.querySelector('.success-message');
        successMessage.style.display = 'block';
        overlay.querySelector('.modal-footer').style.display = 'none';
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 2000);
    });
    
    // Close on outside click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    
    // Add slide-in animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Setup doctor search and filter functionality
function setupDoctorSearch(allDoctors) {
    const searchInput = document.getElementById('doctor-search');
    const searchBtn = document.getElementById('search-btn');
    const specialtyFilter = document.getElementById('specialty-filter');
    const doctorsList = document.getElementById('doctors-list');
    
    // Add search icon animation
    searchInput.addEventListener('focus', () => {
        document.querySelector('.search-box i').classList.add('active');
    });
    
    searchInput.addEventListener('blur', () => {
        document.querySelector('.search-box i').classList.remove('active');
    });
    
    // Function to filter doctors
    function filterDoctors() {
        const searchTerm = searchInput.value.toLowerCase();
        const specialty = specialtyFilter.value;
        
        // Show loading indicator
        doctorsList.innerHTML = '<div class="loading">Searching doctors<span class="dot-animation">...</span></div>';
        
        // API endpoint with query parameters
        let url = '/api/doctors/search?';
        if (searchTerm) url += `q=${encodeURIComponent(searchTerm)}&`;
        if (specialty !== 'All Specialties') url += `specialty=${encodeURIComponent(specialty)}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Search failed (${response.status})`);
                }
                return response.json();
            })
            .then(filteredDoctors => {
                // Clear current list
                doctorsList.innerHTML = '';
                
                if (filteredDoctors.length === 0) {
                    doctorsList.innerHTML = `
                        <div class="no-results">
                            No doctors match your search criteria.
                            <button class="clear-search">Clear Search</button>
                        </div>
                    `;
                    
                    doctorsList.querySelector('.clear-search').addEventListener('click', () => {
                        searchInput.value = '';
                        specialtyFilter.value = 'All Specialties';
                        filterDoctors();
                    });
                    
                    return;
                }
                
                // Populate with filtered doctors
                filteredDoctors.forEach((doctor, index) => {
                    const doctorCard = createDoctorCard(doctor);
                    doctorsList.appendChild(doctorCard);
                    
                    // Add staggered animation
                    setTimeout(() => {
                        doctorCard.classList.add('revealed');
                    }, index * 100);
                });
            })
            .catch(error => {
                doctorsList.innerHTML = `<div class="error">Error searching doctors: ${error.message}</div>`;
                console.error('Error searching doctors:', error);
            });
    }
    
    // Event listeners for search and filter
    searchBtn.addEventListener('click', filterDoctors);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterDoctors();
    });
    specialtyFilter.addEventListener('change', filterDoctors);
}

// Setup chatbot functionality
function setupChatbot() {
    const chatMessages = document.getElementById('chat-messages');
    const symptomInput = document.getElementById('symptom-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user' : 'bot');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        if (typeof content === 'string') {
            messageContent.innerHTML = `<p>${content}</p>`;
        } else {
            messageContent.appendChild(content);
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add fade-in animation
        setTimeout(() => {
            messageDiv.classList.add('visible');
        }, 100);
    }
    
    // Function to create analysis results
    function createAnalysisResults(data) {
        const resultsContainer = document.createElement('div');
        resultsContainer.classList.add('analysis-results');
        
        // Add general advice
        const adviceDiv = document.createElement('div');
        adviceDiv.classList.add('general-advice');
        adviceDiv.textContent = data.general_advice;
        resultsContainer.appendChild(adviceDiv);
        
        // Add possible conditions
        if (data.possible_conditions && data.possible_conditions.length > 0) {
            const conditionsHeader = document.createElement('h3');
            conditionsHeader.textContent = 'Possible Conditions';
            resultsContainer.appendChild(conditionsHeader);
            
            data.possible_conditions.forEach(condition => {
                const conditionTemplate = document.getElementById('condition-template');
                const conditionCard = conditionTemplate.content.cloneNode(true);
                
                conditionCard.querySelector('.condition-name').textContent = condition.condition;
                
                const likelihoodSpan = conditionCard.querySelector('.condition-likelihood');
                likelihoodSpan.textContent = condition.likelihood;
                likelihoodSpan.classList.add(condition.likelihood.toLowerCase());
                
                // Add appropriate icon based on likelihood
                const iconClass = condition.likelihood === 'high' ? 'fa-exclamation-circle' :
                                condition.likelihood === 'medium' ? 'fa-exclamation' : 'fa-info-circle';
                                
                likelihoodSpan.innerHTML = `<i class="fas ${iconClass}"></i> ${condition.likelihood}`;
                
                conditionCard.querySelector('.condition-description').textContent = condition.description;
                conditionCard.querySelector('.condition-treatment span').textContent = condition.general_treatment;
                conditionCard.querySelector('.condition-specialist span').textContent = condition.recommended_specialist;
                
                resultsContainer.appendChild(conditionCard.querySelector('.condition-card'));
            });
        }
        
        // Add recommended doctors
        if (data.recommended_doctors && data.recommended_doctors.length > 0) {
            const doctorsTemplate = document.getElementById('recommended-doctors-template');
            const doctorsSection = doctorsTemplate.content.cloneNode(true);
            const doctorsGrid = doctorsSection.querySelector('.doctors-grid');
            
            data.recommended_doctors.forEach(doctor => {
                const doctorCard = createDoctorCard(doctor);
                doctorsGrid.appendChild(doctorCard);
            });
            
            resultsContainer.appendChild(doctorsSection.querySelector('.recommended-doctors'));
        }
        
        // Add disclaimer
        const disclaimerDiv = document.createElement('div');
        disclaimerDiv.classList.add('disclaimer-box');
        disclaimerDiv.textContent = data.disclaimer;
        resultsContainer.appendChild(disclaimerDiv);
        
        return resultsContainer;
    }
    
    // Function to handle sending a message
    async function sendMessage() {
        const symptoms = symptomInput.value.trim();
        
        if (!symptoms) return;
        
        // Add user message to chat
        addMessage(symptoms, true);
        
        // Clear input
        symptomInput.value = '';
        
        // Add loading message with typing animation
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot');
        loadingDiv.innerHTML = '<div class="message-content"><p>Analyzing your symptoms<span class="dot-animation">...</span></p></div>';
        chatMessages.appendChild(loadingDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Call API to analyze symptoms
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symptoms })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to analyze symptoms (${response.status})`);
            }
            
            const data = await response.json();
            
            // Remove loading message
            chatMessages.removeChild(loadingDiv);
            
            // Display results
            if (data.error) {
                addMessage(`<i class="fas fa-exclamation-triangle"></i> Error: ${data.error}`);
            } else {
                const resultsElement = createAnalysisResults(data);
                addMessage(resultsElement);
            }
            
        } catch (error) {
            // Remove loading message
            chatMessages.removeChild(loadingDiv);
            
            // Display error message
            addMessage(`<i class="fas fa-exclamation-triangle"></i> Error: ${error.message}`);
            console.error('Error analyzing symptoms:', error);
        }
    }
    
    // Enable/disable send button based on input
    symptomInput.addEventListener('input', () => {
        if (symptomInput.value.trim()) {
            sendBtn.classList.add('active');
        } else {
            sendBtn.classList.remove('active');
        }
    });
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    symptomInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Add focus to chat input
    setTimeout(() => {
        symptomInput.focus();
    }, 1000);
}

// Additional CSS for dynamic elements
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .doctor-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .doctor-card.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    .message {
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .message.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .dot-animation {
        display: inline-block;
        animation: dotAnimation 1.4s infinite;
    }
    
    @keyframes dotAnimation {
        0% { opacity: 0.2; }
        20% { opacity: 1; }
        100% { opacity: 0.2; }
    }
    
    .search-box i {
        transition: color 0.3s ease;
    }
    
    .search-box i.active {
        color: var(--primary-color);
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
    }
    
    .modal {
        background: white;
        border-radius: var(--border-radius);
        width: 90%;
        max-width: 500px;
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        transform: translateY(30px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .modal.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .modal-header {
        padding: 15px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--gradient-primary);
        color: white;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 15px 20px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    .btn-primary {
        background: var(--gradient-primary);
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 500;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
    }
    
    .btn-secondary {
        background: var(--light-color);
        color: var(--dark-color);
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 500;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
    }
    
    .success-message {
        color: var(--success-color);
        font-weight: 500;
        margin-top: 15px;
        padding: 10px;
        border-radius: var(--border-radius);
        background-color: rgba(64, 145, 108, 0.1);
        text-align: center;
        display: none;
    }
    
    .clear-search {
        background: var(--gradient-primary);
        color: white;
        padding: 8px 20px;
        border-radius: 30px;
        margin-top: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
    }
    
    .clear-search:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

document.head.appendChild(dynamicStyles); 