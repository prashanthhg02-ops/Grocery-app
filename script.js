// Grocery App - Main Logic

// ===== State =====
let items = [];

// Element references
const itemForm = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
const itemQtyInput = document.getElementById('itemQuantity');
const itemCategorySelect = document.getElementById('itemCategory');
const itemList = document.getElementById('itemList');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const emptyState = document.getElementById('emptyState');

const totalCountEl = document.getElementById('totalCount');
const purchasedCountEl = document.getElementById('purchasedCount');
const remainingCountEl = document.getElementById('remainingCount');

// ===== Storage =====
const STORAGE_KEY = 'groceryItems';

function loadItems() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ===== Add Item =====
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const quantity = parseInt(itemQtyInput.value, 10) || 1;
    const category = itemCategorySelect.value;

    if (!name) return;

    const newItem = {
        id: Date.now().toString(),
        name,
        quantity: Math.max(1, quantity),
        category,
        purchased: false,
    };

    items.push(newItem);
    saveItems();
    render();

    // Reset form
    itemForm.reset();
    itemQtyInput.value = '1';
    itemNameInput.focus();
});

// ===== Render List =====
function render() {
    const query = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;

    // Filter items
    let filtered = items;

    if (filter === 'purchased') {
        filtered = filtered.filter((i) => i.purchased);
    } else if (filter === 'pending') {
        filtered = filtered.filter((i) => !i.purchased);
    }

    if (query) {
        filtered = filtered.filter((i) => i.name.toLowerCase().includes(query));
    }

    // Clear current list (keep empty state element)
    itemList.querySelectorAll('.item').forEach((el) => el.remove());

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.textContent = query || filter !== 'all'
            ? 'No matching items found.'
            : 'Your grocery list is empty. Add some items!';
    } else {
        emptyState.classList.add('hidden');

        filtered.forEach((item) => {
            const itemEl = createItemElement(item);
            itemList.appendChild(itemEl);
        });
    }

    updateStats();
}

function createItemElement(item) {
    const div = document.createElement('div');
    div.className = 'item' + (item.purchased ? ' selected' : '');
    div.dataset.id = item.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'item-checkbox';
    checkbox.checked = item.purchased;
    checkbox.addEventListener('change', () => togglePurchased(item.id, checkbox.checked));

    // Info
    const info = document.createElement('div');
    info.className = 'item-info';

    const name = document.createElement('div');
    name.className = 'item-name';
    name.textContent = item.name;

    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.innerHTML = `Qty: <strong>${item.quantity}</strong>`;

    const badge = document.createElement('span');
    badge.className = 'item-badge';
    badge.textContent = item.category;
    meta.appendChild(badge);

    info.appendChild(name);
    info.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon edit';
    editBtn.title = 'Edit item';
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => editItem(item.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon delete';
    deleteBtn.title = 'Delete item';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(checkbox);
    div.appendChild(info);
    div.appendChild(actions);

    return div;
}

// ===== Toggle Purchased =====
function togglePurchased(id, purchased) {
    const item = items.find((i) => i.id === id);
    if (item) {
        item.purchased = purchased;
        saveItems();
        render();
    }
}

// ===== Delete Item =====
function deleteItem(id) {
    items = items.filter((i) => i.id !== id);
    saveItems();
    render();
}

// ===== Edit Item =====
function editItem(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newName = prompt('Edit item name:', item.name);
    if (newName === null) return;
    if (newName.trim()) item.name = newName.trim();

    const newQty = prompt('Edit quantity:', item.quantity);
    if (newQty !== null) {
        const parsed = parseInt(newQty, 10);
        if (!isNaN(parsed) && parsed > 0) item.quantity = parsed;
    }

    const newCategory = prompt(
        'Edit category (Fruits / Vegetables / Dairy / Bakery / Meat / Beverages / Snacks / Other):',
        item.category
    );
    if (newCategory && newCategory.trim()) item.category = newCategory.trim();

    saveItems();
    render();
}

// ===== Stats =====
function updateStats() {
    const purchased = items.filter((i) => i.purchased).length;
    totalCountEl.textContent = items.length;
    purchasedCountEl.textContent = purchased;
    remainingCountEl.textContent = items.length - purchased;
}

// ===== Events for search & filter =====
searchInput.addEventListener('input', render);
filterSelect.addEventListener('change', render);

// ===== Init =====
items = loadItems();
render();

