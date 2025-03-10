// Define menu items with their options
const menuItems = [
    {
        id: 'tea',
        name: 'Tea',
        emoji: '🫖',
        hasOptions: true,
        options: [
            { name: 'sugar', label: 'Sugar', choices: ['No Sugar', 'Low Sugar', 'Medium Sugar'] }
        ]
    },
    {
        id: 'coffee',
        name: 'Coffee',
        emoji: '☕',
        hasOptions: true,
        options: [
            { name: 'strength', label: 'Strength', choices: ['Light', 'Regular', 'Strong'] },
            { name: 'sugar', label: 'Sugar', choices: ['No Sugar', 'Low Sugar', 'Medium Sugar'] }
        ]
    },
    {
        id: 'limeSoda',
        name: 'Lime Soda',
        emoji: '🥤',
        hasOptions: false
    },
    {
        id: 'water',
        name: 'Water Bottle',
        emoji: '💧',
        hasOptions: false
    },
    {
        id: 'juice',
        name: 'Juice',
        emoji: '🧃',
        hasOptions: true,
        options: [
            { name: 'type', label: 'Type', choices: ['Orange', 'Apple', 'Mixed Fruit'] }
        ]
    },
    {
        id: 'sandwich',
        name: 'Sandwich',
        emoji: '🥪',
        hasOptions: true,
        options: [
            { name: 'type', label: 'Type', choices: ['Veg', 'Cheese', 'Chicken'] }
        ]
    }
];

// App state
const state = {
    name: '',
    selectedItems: [],
    options: {},
    currentItem: null
};

// DOM Elements
const orderForm = document.getElementById('orderForm');
const orderConfirmation = document.getElementById('orderConfirmation');
const optionsModal = document.getElementById('optionsModal');
const menuItemsContainer = document.getElementById('menuItems');
const optionsContent = document.getElementById('optionsContent');
const optionsTitle = document.getElementById('optionsTitle');
const nameInput = document.getElementById('name');
const submitOrder = document.getElementById('submitOrder');
const newOrder = document.getElementById('newOrder');
const cancelOptions = document.getElementById('cancelOptions');
const saveOptions = document.getElementById('saveOptions');
const selectionError = document.getElementById('selectionError');
const confirmName = document.getElementById('confirmName');
const confirmItems = document.getElementById('confirmItems');

// Initialize the app
function init() {
    renderMenuItems();
    setupEventListeners();
    updateSubmitButton();
}

// Render menu items
function renderMenuItems() {
    menuItemsContainer.innerHTML = '';

    menuItems.forEach(item => {
        const itemElement = document.createElement('button');
        itemElement.id = `item-${item.id}`;
        itemElement.className = `menu-item flex flex-col items-center justify-center p-4 rounded-lg border ${state.selectedItems.includes(item.id) ? 'item-selected' : 'border-gray-200'
            } ${state.selectedItems.length >= 2 && !state.selectedItems.includes(item.id) ? 'opacity-50 cursor-not-allowed' : ''}`;
        itemElement.disabled = state.selectedItems.length >= 2 && !state.selectedItems.includes(item.id);
        itemElement.dataset.id = item.id;

        itemElement.innerHTML = `
            <div class="text-4xl mb-2">${item.emoji}</div>
            <span class="text-sm text-center">${item.name}</span>
            ${renderSelectedOptions(item)}
        `;

        menuItemsContainer.appendChild(itemElement);
    });
}

// Render selected options for an item
function renderSelectedOptions(item) {
    if (state.selectedItems.includes(item.id) && item.hasOptions && state.options[item.id]) {
        let optionsHtml = '<div class="selected-options">';
        for (const [key, value] of Object.entries(state.options[item.id])) {
            optionsHtml += `<span class="selected-option">${value}</span>`;
        }
        optionsHtml += '</div>';
        return optionsHtml;
    }
    return '';
}

// Render options for an item
function renderItemOptions(item) {
    optionsTitle.textContent = `Select options for ${item.name}`;
    optionsContent.innerHTML = '';

    item.options.forEach(option => {
        const optionContainer = document.createElement('div');
        optionContainer.className = 'mb-4';

        const optionLabel = document.createElement('label');
        optionLabel.className = 'block text-base font-medium text-gray-700 mb-2';
        optionLabel.textContent = option.label;

        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'grid grid-cols-3 gap-2';

        option.choices.forEach(choice => {
            const choiceButton = document.createElement('button');
            choiceButton.type = 'button';
            choiceButton.className = `option-button p-2 text-sm border rounded-md ${state.options[item.id]?.[option.name] === choice ? 'option-selected' : 'border-gray-300'
                }`;
            choiceButton.textContent = choice;
            choiceButton.dataset.option = option.name;
            choiceButton.dataset.choice = choice;

            choicesContainer.appendChild(choiceButton);
        });

        optionContainer.appendChild(optionLabel);
        optionContainer.appendChild(choicesContainer);
        optionsContent.appendChild(optionContainer);
    });
}

// Handle item selection
function handleItemSelect(itemId) {
    const item = menuItems.find(i => i.id === itemId);

    if (state.selectedItems.includes(itemId)) {
        // If item is already selected, remove it
        state.selectedItems = state.selectedItems.filter(id => id !== itemId);
        delete state.options[itemId];
    } else {
        // If item is not selected, add it if less than 2 items are selected
        if (state.selectedItems.length < 2) {
            state.selectedItems.push(itemId);

            // If item has options, show options modal
            if (item.hasOptions) {
                state.currentItem = item;
                renderItemOptions(item);
                optionsModal.classList.remove('hidden');
            }
        }
    }

    renderMenuItems();
    updateSubmitButton();
}

// Handle option selection
function handleOptionSelect(optionName, choice) {
    if (!state.options[state.currentItem.id]) {
        state.options[state.currentItem.id] = {};
    }

    state.options[state.currentItem.id][optionName] = choice;

    // Update the option buttons
    const optionButtons = optionsContent.querySelectorAll(`[data-option="${optionName}"]`);
    optionButtons.forEach(button => {
        if (button.dataset.choice === choice) {
            button.classList.add('option-selected');
        } else {
            button.classList.remove('option-selected');
        }
    });
}

// Handle form submission
function handleSubmit() {
    const name = nameInput.value.trim();

    if (name && state.selectedItems.length > 0) {
        state.name = name;
        showOrderConfirmation();
    } else {
        if (!name) {
            nameInput.classList.add('border-red-500');
        }

        if (state.selectedItems.length === 0) {
            selectionError.classList.remove('hidden');
        }
    }
}

// Show order confirmation
function showOrderConfirmation() {
    confirmName.textContent = state.name;
    confirmItems.innerHTML = '';

    state.selectedItems.forEach(itemId => {
        const item = menuItems.find(i => i.id === itemId);
        const itemElement = document.createElement('li');
        itemElement.className = 'mb-2';

        let itemHtml = `<div class="font-medium">${item.name}</div>`;

        if (state.options[itemId]) {
            itemHtml += '<ul class="list-none pl-2 text-sm text-gray-600">';
            for (const [key, value] of Object.entries(state.options[itemId])) {
                itemHtml += `<li>${value}</li>`;
            }
            itemHtml += '</ul>';
        }

        itemElement.innerHTML = itemHtml;
        confirmItems.appendChild(itemElement);
    });

    orderForm.classList.add('hidden');
    orderConfirmation.classList.remove('hidden');
    orderConfirmation.classList.add('fade-in');
}

// Reset order
function resetOrder() {
    state.name = '';
    state.selectedItems = [];
    state.options = {};
    state.currentItem = null;

    nameInput.value = '';
    nameInput.classList.remove('border-red-500');
    selectionError.classList.add('hidden');

    renderMenuItems();
    updateSubmitButton();

    orderConfirmation.classList.add('hidden');
    orderForm.classList.remove('hidden');
    orderForm.classList.add('fade-in');
}

// Close options modal
function closeOptionsModal() {
    optionsModal.classList.add('hidden');
    state.currentItem = null;
}

// Update submit button state
function updateSubmitButton() {
    if (nameInput.value.trim() && state.selectedItems.length > 0) {
        submitOrder.disabled = false;
        submitOrder.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        submitOrder.disabled = true;
        submitOrder.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Menu item selection
    menuItemsContainer.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem && !menuItem.disabled) {
            handleItemSelect(menuItem.dataset.id);
        }
    });

    // Option selection
    optionsContent.addEventListener('click', (e) => {
        const optionButton = e.target.closest('.option-button');
        if (optionButton) {
            handleOptionSelect(optionButton.dataset.option, optionButton.dataset.choice);
        }
    });

    // Form submission
    submitOrder.addEventListener('click', handleSubmit);

    // New order
    newOrder.addEventListener('click', resetOrder);

    // Cancel options
    cancelOptions.addEventListener('click', closeOptionsModal);

    // Save options
    saveOptions.addEventListener('click', () => {
        closeOptionsModal();
        renderMenuItems();
    });

    // Name input validation
    nameInput.addEventListener('input', () => {
        nameInput.classList.remove('border-red-500');
        updateSubmitButton();
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
