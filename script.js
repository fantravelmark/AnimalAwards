// Game Data Storage
let gameData = {
    animals: [],
    awards: [],
    relationships: {},
    selectedAnimals: { animal1: null, animal2: null }
};

// DOM Elements
const sections = document.querySelectorAll('.section');
const navButtons = document.querySelectorAll('.nav-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const animalsGrid = document.getElementById('animals-grid');
const battleLog = document.getElementById('battle-log');
const fightButton = document.getElementById('fight-btn');
const modal = document.getElementById('animal-modal');
const closeModal = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load all data
    Promise.all([
        fetch('earth_animals.json').then(res => res.json()),
        fetch('alien_animals.json').then(res => res.json()),
        fetch('awards.json').then(res => res.json()),
        fetch('attributes.json').then(res => res.json())
    ]).then(([earthData, alienData, awardsData, attributesData]) => {
        // Combine earth and alien animals
        gameData.animals = [...earthData.animals, ...alienData.animals];
        gameData.awards = awardsData.awards;
        
        // Convert relationships array to object for easier lookup
        attributesData.relationships.forEach(rel => {
            gameData.relationships[rel.attribute] = rel;
        });
        
        // Initialize the application
        initNavigation();
        renderAnimals();
        setupBattleArena();
        renderAwards();
        
        // Show home section by default
        showSection('home');
    }).catch(error => {
        console.error('Error loading game data:', error);
        alert('Failed to load game data. Please try again later.');
    });
    
    // Event listeners
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Start battle button in hero section
    document.getElementById('start-battle')?.addEventListener('click', () => {
        showSection('battle');
    });
});

// Navigation
function initNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Animals Section
function renderAnimals(filter = 'all') {
    animalsGrid.innerHTML = '';
    
    const filteredAnimals = gameData.animals.filter(animal => {
        return filter === 'all' || animal.type === filter;
    });
    
    filteredAnimals.forEach(animal => {
        const animalCard = document.createElement('div');
        animalCard.className = `animal-card ${animal.type}`;
        animalCard.innerHTML = `
            <div class="animal-image" style="background-color: ${getRandomColor()}">
                <span class="animal-type">${animal.type.toUpperCase()}</span>
            </div>
            <div class="animal-info">
                <h3>${animal.name}</h3>
                <p>${animal.description}</p>
                <div class="attributes">
                    ${animal.attributes.map(attr => `<span class="attribute-tag">${attr}</span>`).join('')}
                </div>
            </div>
        `;
        
        animalCard.addEventListener('click', () => showAnimalDetails(animal.id));
        animalsGrid.appendChild(animalCard);
    });
    
    // Set up filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-type');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderAnimals(filter);
        });
    });
}

// Animal Details Modal
function showAnimalDetails(animalId) {
    const animal = gameData.animals.find(a => a.id === animalId);
    if (!animal) return;
    
    const modalContent = document.getElementById('animal-details');
    modalContent.innerHTML = `
        <h2>${animal.name}</h2>
        <p class="animal-type-display ${animal.type}">${animal.type.toUpperCase()}</p>
        <div class="animal-detail-image" style="background-color: ${getRandomColor()}"></div>
        <p><strong>Habitat:</strong> ${animal.habitat}</p>
        <p><strong>Fun Fact:</strong> ${animal.fun_fact}</p>
        <h3>Attributes</h3>
        <div class="attributes">
            ${animal.attributes.map(attr => {
                const rel = gameData.relationships[attr] || {};
                return `
                    <div class="attribute-detail">
                        <strong>${attr}</strong>
                        ${rel.description ? `<p>${rel.description}</p>` : ''}
                        ${rel.beats?.length ? `<p><em>Beats:</em> ${rel.beats.join(', ')}</p>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
        ${animal.awards.length ? `
            <h3>Awards</h3>
            <div class="awards">
                ${animal.awards.map(awardId => {
                    const award = gameData.awards.find(a => a.id === awardId);
                    return award ? `<span class="award-badge">${award.name} (${award.year})</span>` : '';
                }).join('')}
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Battle Arena
function setupBattleArena() {
    const selector1 = document.getElementById('selector1');
    const selector2 = document.getElementById('selector2');
    
    // Populate animal selectors
    function populateSelectors() {
        selector1.innerHTML = '';
        selector2.innerHTML = '';
        
        gameData.animals.forEach(animal => {
            const option1 = createAnimalOption(animal, 'animal1');
            const option2 = createAnimalOption(animal, 'animal2');
            
            selector1.appendChild(option1);
            selector2.appendChild(option2.cloneNode(true));
        });
    }
    
    function createAnimalOption(animal, selectorId) {
        const div = document.createElement('div');
        div.className = 'animal-option';
        div.innerHTML = `
            <div class="animal-option-image" style="background-color: ${getRandomColor()}"></div>
            <span>${animal.name}</span>
        `;
        
        div.addEventListener('click', () => selectAnimal(animal.id, selectorId));
        return div;
    }
    
    function selectAnimal(animalId, selectorId) {
        const animal = gameData.animals.find(a => a.id === animalId);
        if (!animal) return;
        
        const container = document.getElementById(selectorId).closest('.battle-participant');
        if (!container) return;
        
        // Update selected animal
        const animalKey = container.id; // 'animal1' or 'animal2'
        gameData.selectedAnimals[animalKey] = animal;
        
        // Update UI
        container.innerHTML = `
            <h3>${animal.name}</h3>
            <div class="selected-animal">
                <div class="animal-option-image" style="background-color: ${getRandomColor()}"></div>
                <div class="animal-attributes">
                    ${animal.attributes.map(attr => `<span class="attribute-tag">${attr}</span>`).join('')}
                </div>
                <button class="change-animal" data-container="${container.id}">Change</button>
            </div>
        `;
        
        // Add event listener to change button
        container.querySelector('.change-animal')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const containerId = e.target.getAttribute('data-container');
            resetAnimalSelection(containerId);
        });
        
        // Enable/disable fight button
        fightButton.disabled = !(gameData.selectedAnimals.animal1 && gameData.selectedAnimals.animal2);
    }
    
    // New function to reset a single animal selection
    function resetAnimalSelection(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const selectorId = containerId === 'animal1' ? 'selector1' : 'selector2';
        const selector = document.getElementById(selectorId);
        
        // Clear the selection
        gameData.selectedAnimals[containerId] = null;
        
        // Reset the UI for this participant
        container.innerHTML = `
            <h3>Select ${containerId === 'animal1' ? 'Animal 1' : 'Animal 2'}</h3>
            <div class="animal-selector" id="${selectorId}"></div>
        `;
        
        // Re-populate the selector
        populateSelector(selectorId);
        
        // Disable fight button if needed
        fightButton.disabled = !(gameData.selectedAnimals.animal1 && gameData.selectedAnimals.animal2);
    }
    
    // Helper function to populate a single selector
    function populateSelector(selectorId) {
        const selector = document.getElementById(selectorId);
        if (!selector) return;
        
        selector.innerHTML = '';
        gameData.animals.forEach(animal => {
            const option = createAnimalOption(animal, selectorId);
            selector.appendChild(option);
        });
    }
    
    // Fight button click handler
    fightButton.addEventListener('click', startBattle);
    
    // Initial population
    populateSelectors();
}

function startBattle() {
    const { animal1, animal2 } = gameData.selectedAnimals;
    if (!animal1 || !animal2) return;
    
    // Simple battle logic - compare random attributes
    const attr1 = animal1.attributes[Math.floor(Math.random() * animal1.attributes.length)];
    const attr2 = animal2.attributes[Math.floor(Math.random() * animal2.attributes.length)];
    
    let result = '';
    
    // Check if attributes have a direct relationship
    const rel1 = gameData.relationships[attr1];
    const rel2 = gameData.relationships[attr2];
    
    if (rel1?.beats?.includes(attr2)) {
        result = `${animal1.name}'s ${attr1} beats ${animal2.name}'s ${attr2}!`;
    } else if (rel2?.beats?.includes(attr1)) {
        result = `${animal2.name}'s ${attr2} beats ${animal1.name}'s ${attr1}!`;
    } else {
        // No direct relationship, pick a random winner
        const winner = Math.random() > 0.5 ? animal1 : animal2;
        const winnerAttr = winner === animal1 ? attr1 : attr2;
        result = `No clear advantage! ${winner.name}'s ${winnerAttr} wins by default!`;
    }
    
    // Update battle log
    const battleEntry = document.createElement('div');
    battleEntry.className = 'battle-entry';
    battleEntry.innerHTML = `
        <p><strong>Battle:</strong> ${animal1.name} vs ${animal2.name}</p>
        <p><strong>${animal1.name} used:</strong> ${attr1}</p>
        <p><strong>${animal2.name} used:</strong> ${attr2}</p>
        <p class="battle-result">${result}</p>
        <hr>
    `;
    
    battleLog.prepend(battleEntry);
    
    // Auto-scroll to top of battle log
    battleLog.scrollTo({ top: 0, behavior: 'smooth' });
}

// Awards Section
function renderAwards() {
    const container = document.getElementById('awards-container');
    if (!container) return;
    
    container.innerHTML = gameData.awards.map(award => {
        const winners = gameData.animals.filter(animal => 
            animal.awards.includes(award.id)
        );
        
        return `
            <div class="award-card">
                <h3>${award.name} (${award.year})</h3>
                <p>${award.description}</p>
                <p><strong>Category:</strong> ${award.category}</p>
                ${winners.length ? `
                    <div class="award-winners">
                        <strong>Winners:</strong>
                        <div class="winner-list">
                            ${winners.map(winner => 
                                `<span class="winner-tag">${winner.name}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : '<p>No winners yet!</p>'}
            </div>
        `;
    }).join('');
}

// Helper Functions
function getRandomColor() {
    const colors = [
        '#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#5f27cd',
        '#54a0ff', '#00d2d3', '#f368e0', '#ff9f43', '#10ac84'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Any additional initialization code can go here
});
