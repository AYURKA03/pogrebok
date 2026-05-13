//ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ 
function showMessage(msg, isError = false) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = 'position:fixed; bottom:20px; right:20px; background:' + (isError ? '#e74c3c' : '#2ecc71') + '; color:white; padding:10px 20px; border-radius:8px; z-index:1000; font-size:0.85rem;';
    document.body.appendChild(div);
    setTimeout(function() { div.remove(); }, 3000);
}

async function apiRequest(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Ошибка запроса');
    }
    return res.json();
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function formatDate(dateString) {
    if (!dateString) return 'не указана';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return day + '.' + month + '.' + year;
}

function normalizeWord(word) {
    let w = word.toLowerCase().trim();
    if (w.endsWith('ы')) w = w.slice(0, -1);
    if (w.endsWith('и')) w = w.slice(0, -1);
    if (w.endsWith('а')) w = w.slice(0, -1);
    if (w.endsWith('я')) w = w.slice(0, -1);
    if (w.endsWith('ь')) w = w.slice(0, -1);
    
    const exceptions = {
        'яйцо': 'яйц', 'яйца': 'яйц', 'яиц': 'яйц',
        'молоко': 'молок', 'молока': 'молок',
        'масло': 'масл', 'масла': 'масл',
        'сыр': 'сыр', 'сыра': 'сыр',
        'соль': 'сол', 'сахар': 'сахар', 'мука': 'мук', 'муки': 'мук'
    };
    
    return exceptions[w] || w;
}

function isProbablySingular(word) {
    const singularEndings = ['ок', 'ек', 'ик', 'ец', 'ль', 'нь', 'рь', 'зь'];
    const lower = word.toLowerCase();
    for (var i = 0; i < singularEndings.length; i++) {
        if (lower.endsWith(singularEndings[i])) return true;
    }
    const singularExceptions = ['яйцо', 'молоко', 'масло', 'мясо', 'сало'];
    return singularExceptions.includes(lower);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

//МОДАЛЬНЫЕ ОКНА 
function showConfirmModal(message, onConfirm, onCancel) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmModalMessage');
    const titleEl = document.getElementById('confirmModalTitle');
    
    if (!modal) {
        if (confirm(message)) { if (onConfirm) onConfirm(); }
        else { if (onCancel) onCancel(); }
        return;
    }
    
    if (messageEl) messageEl.innerHTML = message;
    if (titleEl) titleEl.innerHTML = 'Подтверждение';
    
    const cancelBtn = document.getElementById('confirmModalCancel');
    const okBtn = document.getElementById('confirmModalOk');
    
    const closeModal = function() {
        modal.classList.remove('active');
    };
    
    const onOkClick = function() {
        closeModal();
        if (onConfirm) onConfirm();
    };
    
    const onCancelClick = function() {
        closeModal();
        if (onCancel) onCancel();
    };
    
    var newCancelBtn = cancelBtn.cloneNode(true);
    var newOkBtn = okBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    
    document.getElementById('confirmModalCancel').onclick = onCancelClick;
    document.getElementById('confirmModalOk').onclick = onOkClick;
    
    modal.classList.add('active');
}

function showInfoModal(message, title, onClose) {
    const modal = document.getElementById('infoModal');
    const messageEl = document.getElementById('infoModalMessage');
    const titleEl = document.getElementById('infoModalTitle');
    var finalTitle = title || 'Сообщение';
    
    if (!modal) {
        alert(message);
        if (onClose) onClose();
        return;
    }
    
    if (messageEl) messageEl.innerHTML = message;
    if (titleEl) titleEl.innerHTML = finalTitle;
    
    const okBtn = document.getElementById('infoModalOk');
    
    const closeModal = function() {
        modal.classList.remove('active');
        if (onClose) onClose();
    };
    
    var newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    document.getElementById('infoModalOk').onclick = closeModal;
    
    modal.classList.add('active');
}

// СПИСАНИЕ ПРОДУКТА 
let currentDecreaseId = null;
let currentDecreaseMaxQty = null;
let currentDecreaseName = null;

function openDecreaseModal(id, name, maxQty) {
    currentDecreaseId = id;
    currentDecreaseMaxQty = maxQty;
    currentDecreaseName = name;
    
    const modal = document.getElementById('decreaseModal');
    const nameSpan = document.getElementById('decreaseProductName');
    const amountInput = document.getElementById('decreaseAmount');
    
    if (nameSpan) nameSpan.innerHTML = name + '<br><span style="font-size:0.8rem;">Доступно: ' + maxQty + '</span>';
    if (amountInput) amountInput.value = '';
    if (modal) modal.classList.add('active');
}

function closeDecreaseModal() {
    const modal = document.getElementById('decreaseModal');
    if (modal) modal.classList.remove('active');
    currentDecreaseId = null;
    currentDecreaseMaxQty = null;
    currentDecreaseName = null;
}

async function confirmDecreaseAction() {
    const amountInput = document.getElementById('decreaseAmount');
    if (!amountInput) return;
    
    const amount = parseFloat(amountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showInfoModal('Введите корректное количество', 'Ошибка');
        return;
    }
    
    if (amount > currentDecreaseMaxQty) {
        showInfoModal('Нельзя списать больше, чем есть', 'Ошибка');
        return;
    }
    
    try {
        const products = await apiRequest('/api/products');
        const product = products.find(function(p) { return p.id === currentDecreaseId; });
        
        if (product && (product.unit === 'шт' || product.unit === 'упаковка')) {
            if (!Number.isInteger(amount)) {
                showInfoModal('Для продуктов в ' + (product.unit === 'шт' ? 'штуках' : 'упаковках') + ' можно списывать только целое количество', 'Ошибка');
                return;
            }
        }
        
        await apiRequest('/api/products/' + currentDecreaseId + '/decrease', {
            method: 'PUT',
            body: JSON.stringify({ quantity: amount })
        });
        showInfoModal('Списано ' + amount + ' ед. продукта "' + currentDecreaseName + '"', 'Успех');
        closeDecreaseModal();
        loadProducts();
        updateProductsStats();
    } catch (err) {
        showInfoModal(err.message, 'Ошибка');
    }
}

//УТИЛИЗАЦИЯ ПРОДУКТА 
let currentDeleteId = null;
let currentDeleteName = null;

function openDeleteModal(id, name) {
    currentDeleteId = id;
    currentDeleteName = name;
    
    const modal = document.getElementById('deleteModal');
    const nameSpan = document.getElementById('deleteProductName');
    
    if (nameSpan) nameSpan.innerHTML = name;
    if (modal) modal.classList.add('active');
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) modal.classList.remove('active');
    currentDeleteId = null;
    currentDeleteName = null;
}

async function confirmDeleteAction() {
    if (!currentDeleteId) return;
    
    try {
        await apiRequest('/api/products/' + currentDeleteId, { method: 'DELETE' });
        showInfoModal('Продукт "' + currentDeleteName + '" утилизирован', 'Успех');
        closeDeleteModal();
        loadProducts();
        updateProductsStats();
    } catch (err) {
        showInfoModal(err.message, 'Ошибка');
        closeDeleteModal();
    }
}

//ДОБАВЛЕНИЕ ИЗ СПИСКА ПОКУПОК 
let currentPurchasedId = null;
let currentPurchasedName = null;

function openPurchasedModal(id, name) {
    currentPurchasedId = id;
    currentPurchasedName = name;
    
    const modal = document.getElementById('addPurchasedModal');
    const nameSpan = document.getElementById('purchasedProductName');
    const qtyInput = document.getElementById('purchasedQuantity');
    
    if (nameSpan) nameSpan.innerHTML = name;
    if (qtyInput) qtyInput.value = '1';
    if (modal) modal.classList.add('active');
}

function closePurchasedModal() {
    const modal = document.getElementById('addPurchasedModal');
    if (modal) modal.classList.remove('active');
    currentPurchasedId = null;
    currentPurchasedName = null;
}

async function confirmAddPurchasedAction() {
    if (!currentPurchasedId) return;
    
    const quantity = parseFloat(document.getElementById('purchasedQuantity').value);
    const unit = document.getElementById('purchasedUnit').value;
    const categoryId = document.getElementById('purchasedCategory').value;
    const storage = document.getElementById('purchasedStorage').value;
    
    if (isNaN(quantity) || quantity <= 0) {
        showMessage('Введите корректное количество', true);
        return;
    }
    
    const categories = ['', 'Молочные продукты', 'Мясо и рыба', 'Овощи', 'Фрукты', 'Крупы', 'Консервы', 'Напитки', 'Специи', 'Соусы', 'Замороженные продукты', 'Хлебобулочные изделия', 'Другое'];
    const category = categories[parseInt(categoryId)];
    
    const defaultShelfLife = { 1: 5, 2: 3, 3: 5, 4: 5, 5: 365, 6: 730, 7: 180, 8: 365, 9: 180, 10: 180, 11: 3, 12: 30 };
    let shelfLifeDays = defaultShelfLife[parseInt(categoryId)] || 7;
    
    try {
        await apiRequest('/api/shopping-list/' + currentPurchasedId + '/purchase', { method: 'PUT' });
        
        await apiRequest('/api/products', {
            method: 'POST',
            body: JSON.stringify({
                name: currentPurchasedName,
                category: category,
                quantity: quantity,
                unit: unit === 'г' ? 'г' : unit,
                storage_location: storage,
                added_date: new Date().toISOString().slice(0,10),
                shelf_life_days: shelfLifeDays
            })
        });
        
        showMessage('"' + currentPurchasedName + '" добавлен в мои продукты');
        closePurchasedModal();
        loadShoppingList();
        loadProducts();
    } catch (err) {
        showMessage(err.message, true);
    }
}

// РУЧНОЕ ДОБАВЛЕНИЕ В СПИСОК ПОКУПОК 
function openManualModal() {
    const modal = document.getElementById('addManualModal');
    if (modal) modal.classList.add('active');
    
    const container = document.getElementById('manualItemsContainer');
    if (container) {
        container.innerHTML = '<div class="manual-item-row">' +
            '<input type="text" class="manual-product-name" placeholder="Название продукта" style="flex:2;">' +
            '<input type="text" class="manual-product-quantity" placeholder="Количество" value="1 шт" style="flex:1;">' +
            '<button type="button" class="btn-outline remove-manual-item" style="padding: 0.3rem 0.8rem;">✕</button>' +
            '</div>';
    }
}

function closeManualModal() {
    const modal = document.getElementById('addManualModal');
    if (modal) modal.classList.remove('active');
}

async function confirmManualAdd() {
    const rows = document.querySelectorAll('.manual-item-row');
    const items = [];
    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var name = row.querySelector('.manual-product-name').value.trim();
        var quantity = row.querySelector('.manual-product-quantity').value.trim();
        
        if (name) {
            items.push({ name: name, quantity: quantity || '1 шт' });
        }
    }
    
    if (items.length === 0) {
        showMessage('Введите хотя бы один продукт', true);
        return;
    }
    
    var successCount = 0;
    
    for (var j = 0; j < items.length; j++) {
        var item = items[j];
        try {
            await apiRequest('/api/shopping-list', {
                method: 'POST',
                body: JSON.stringify({ name: item.name, quantity: item.quantity })
            });
            successCount++;
        } catch (err) {
            showMessage('Ошибка при добавлении "' + item.name + '"', true);
        }
    }
    
    if (successCount > 0) {
        showMessage('Добавлено продуктов: ' + successCount);
        closeManualModal();
        loadShoppingList();
    }
}

// СТАТИСТИКА ПРОДУКТОВ
async function updateProductsStats() {
    try {
        const stats = await apiRequest('/api/products/stats');
        var totalEl = document.getElementById('statTotal');
        var freshEl = document.getElementById('statFresh');
        var expiringEl = document.getElementById('statExpiring');
        var expiredEl = document.getElementById('statExpired');
        
        if (totalEl) totalEl.innerHTML = stats.total || 0;
        if (freshEl) freshEl.innerHTML = stats.fresh || 0;
        if (expiringEl) expiringEl.innerHTML = stats.expiring || 0;
        if (expiredEl) expiredEl.innerHTML = stats.expired || 0;
    } catch (err) {
        console.error('Ошибка загрузки статистики продуктов:', err);
    }
}

//  ПРОДУКТЫ 
async function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    try {
        const products = await apiRequest('/api/products');
        
        if (products.length === 0) {
            container.innerHTML = '<div class="product-card empty-message">Нет продуктов. Добавьте первый!</div>';
            updateProductsStats();
            return;
        }
        
        var html = '';
        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            var statusText = p.status === 'green' ? 'свежий' : (p.status === 'yellow' ? 'скоро испортится' : 'просрочен');
            var badgeClass = p.status === 'green' ? 'badge-green' : (p.status === 'yellow' ? 'badge-yellow' : 'badge-red');
            var daysText = p.days_left > 0 ? 'осталось ' + p.days_left + ' дн.' : 'просрочен на ' + (-p.days_left) + ' дн.';
            
            html += '<div class="product-card">' +
                '<div class="product-name">' + escapeHtml(p.name) + '</div>' +
                '<div class="product-meta">' + p.quantity + ' ' + (p.unit === 'г' ? 'гр' : p.unit) + ', ' + p.category + '</div>' +
                '<div class="product-meta">место хранения: ' + p.storage_location + '</div>' +
                '<div class="product-meta">годен до ' + formatDate(p.expiry_date) + ' (' + daysText + ')</div>' +
                '<div class="product-meta"><span class="badge ' + badgeClass + '">' + statusText + '</span></div>' +
                '<div class="product-actions">' +
                '<button class="btn-outline btn-small" onclick="openDecreaseModal(' + p.id + ', \'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\', ' + p.quantity + ')">списать</button>' +
                '<button class="btn-outline btn-small" onclick="openDeleteModal(' + p.id + ', \'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\')">утилизировать</button>' +
                '</div></div>';
        }
        container.innerHTML = html;
        updateProductsStats();
    } catch (err) {
        showMessage(err.message, true);
    }
}

// ДОБАВЛЕНИЕ ПРОДУКТА 
function initAddProductForm() {
    const addProductForm = document.getElementById('addProductForm');
    if (!addProductForm) return;
    
    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const categoryId = document.getElementById('productCategory').value;
        let quantity = document.getElementById('productQuantity').value;
        const unit = document.getElementById('productUnit').value;
        const expiry = document.getElementById('productExpiry').value;
        const storage = document.getElementById('productStorage').value;
        
        if (!name) {
            showInfoModal('Введите название продукта', 'Ошибка');
            return;
        }
        
        if (unit === 'шт' || unit === 'упаковка') {
            if (!Number.isInteger(parseFloat(quantity)) || quantity.includes('.')) {
                showInfoModal('Для штук и упаковок количество должно быть целым числом', 'Ошибка');
                return;
            }
            quantity = Math.floor(parseFloat(quantity));
        } else {
            quantity = parseFloat(quantity);
        }
        
        const categories = ['', 'Молочные продукты', 'Мясо и рыба', 'Овощи', 'Фрукты', 'Крупы', 'Консервы', 'Напитки', 'Специи', 'Соусы', 'Замороженные продукты', 'Хлебобулочные изделия', 'Другое'];
        const category = categories[parseInt(categoryId)];
        
        const defaultShelfLife = { 1: 5, 2: 3, 3: 5, 4: 5, 5: 365, 6: 730, 7: 180, 8: 365, 9: 180, 10: 180, 11: 3, 12: 30 };
        let shelfLifeDays = defaultShelfLife[parseInt(categoryId)] || 7;
        
        if (expiry) {
            const addedDate = new Date().toISOString().slice(0,10);
            const diffTime = new Date(expiry) - new Date(addedDate);
            shelfLifeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (shelfLifeDays < 0) shelfLifeDays = 1;
        }
        
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, category, quantity, 
                    unit: unit === 'г' ? 'г' : unit, 
                    storage_location: storage, 
                    added_date: new Date().toISOString().slice(0,10), 
                    shelf_life_days: shelfLifeDays 
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                showInfoModal('Продукт добавлен', 'Успех');
                setTimeout(function() {
                    window.location.href = '/products';
                }, 1500);
            } else {
                showInfoModal(data.error || 'Ошибка добавления продукта', 'Ошибка');
            }
        } catch(err) {
            showInfoModal(err.message, 'Ошибка');
        }
    });
}

// РЕЦЕПТЫ
async function addMissingToShoppingListFromRecipe(recipeId, missingIngredients) {
    if (!missingIngredients || missingIngredients.length === 0) {
        showMessage('Все ингредиенты уже есть в наличии!');
        return;
    }
    
    var successCount = 0;
    
    for (var i = 0; i < missingIngredients.length; i++) {
        var ingredient = missingIngredients[i];
        try {
            var quantityText = '';
            if (ingredient.amount !== null && ingredient.amount !== undefined && ingredient.amount !== '') {
                quantityText = ingredient.amount + ' ' + ingredient.unit;
            } else {
                quantityText = ingredient.unit || '1 шт';
            }
            
            await apiRequest('/api/shopping-list', { 
                method: 'POST', 
                body: JSON.stringify({ 
                    name: ingredient.name, 
                    quantity: quantityText 
                }) 
            });
            successCount++;
        } catch (err) {
            console.error('Ошибка добавления:', ingredient.name, err);
        }
    }
    
    if (successCount > 0) {
        showMessage('Добавлено в список покупок: ' + successCount + ' позиций с указанным количеством');
    } else {
        showMessage('Не удалось добавить в список покупок', true);
    }
}

async function loadRecipes() {
    const container = document.getElementById('recipesContainer');
    if (!container) return;
    
    try {
        const userProducts = await apiRequest('/api/products');
        const freshProducts = userProducts.filter(function(p) { return p.status !== 'red'; });
        const userProductNames = freshProducts.map(function(p) { return p.name.toLowerCase().trim(); });
        
        const recipes = await apiRequest('/api/recipes');
        
        const recipesWithMatch = recipes.map(function(recipe) {
            var have = [];
            var missing = [];
            var missingIngredients = [];
            
            recipe.ingredients.forEach(function(ing) {
                var ingName = ing.name.toLowerCase().trim();
                var found = userProductNames.some(function(userProduct) {
                    return userProduct.includes(ingName) || ingName.includes(userProduct);
                });
                
                if (found) {
                    have.push(ing.name);
                } else {
                    missing.push(ing.name);
                    missingIngredients.push({
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit
                    });
                }
            });
            
            return { 
                ...recipe, 
                have: have, 
                missing: missing,
                missingIngredients: missingIngredients,
                matchCount: have.length
            };
        });
        
        recipesWithMatch.sort(function(a, b) { return b.matchCount - a.matchCount; });
        
        if (recipesWithMatch.length === 0) {
            container.innerHTML = '<div class="product-card empty-message">Нет рецептов</div>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < recipesWithMatch.length; i++) {
            var recipe = recipesWithMatch[i];
            var missingText = recipe.missing.join(', ') || 'все есть!';
            var haveText = recipe.have.join(', ') || 'нет в наличии';
            var matchPercent = 0;
            if (recipe.ingredients.length > 0) {
                matchPercent = Math.round((recipe.matchCount / recipe.ingredients.length) * 100);
            }
            var missingIngredientsJson = JSON.stringify(recipe.missingIngredients).replace(/"/g, '&quot;');
            var noProductsWarning = freshProducts.length === 0 ? '<div style="color: #C55555; font-size: 0.7rem; margin-top: 0.3rem;">Нет свежих продуктов (добавьте или проверьте сроки)</div>' : '';
            
            html += '<div class="recipe-card">' +
                '<div class="recipe-name" style="cursor: pointer;" onclick="window.location.href=\'/recipe-detail.html?id=' + recipe.id + '\'">' +
                escapeHtml(recipe.name) +
                '<span style="font-size: 0.7rem; color: #10B981; margin-left: 0.5rem;">совпадение ' + matchPercent + '%</span>' +
                '</div>' +
                '<div class="recipe-have">в наличии: ' + haveText + '</div>' +
                '<div class="recipe-missing">не хватает: ' + missingText + '</div>' +
                noProductsWarning +
                '<button class="btn-primary btn-full" onclick="addMissingToShoppingListFromRecipe(' + recipe.id + ', ' + missingIngredientsJson + ')">' +
                'добавить недостающее в список' +
                '</button></div>';
        }
        container.innerHTML = html;
        
    } catch (err) {
        console.error('Ошибка загрузки рецептов:', err);
        container.innerHTML = '<div class="product-card empty-message">Ошибка загрузки рецептов</div>';
    }
}

async function loadRecipeDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('id'));
    if (!recipeId) return;
    
    try {
        const recipe = await apiRequest('/api/recipes/' + recipeId);
        const userProducts = await apiRequest('/api/products');
        
        const freshProducts = userProducts.filter(function(p) { return p.status !== 'red'; });
        const userProductNames = freshProducts.map(function(p) { return p.name.toLowerCase().trim(); });
        
        var have = [];
        var missing = [];
        var missingIngredients = [];
        
        recipe.ingredients.forEach(function(ing) {
            var ingName = ing.name.toLowerCase().trim();
            var found = userProductNames.some(function(userProduct) {
                return userProduct.includes(ingName) || ingName.includes(userProduct);
            });
            
            if (found) {
                have.push(ing.name);
            } else {
                missing.push(ing.name);
                missingIngredients.push({
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit
                });
            }
        });
        
        document.getElementById('recipeTitle').innerHTML = escapeHtml(recipe.name);
        document.getElementById('haveItems').innerHTML = have.join(', ') || 'нет';
        document.getElementById('missingItems').innerHTML = missing.join(', ') || 'все есть!';
        document.getElementById('addMissingBtn').onclick = function() { addMissingToShoppingListFromRecipe(recipe.id, missingIngredients); };
        
        if (document.getElementById('ingredientsList')) {
            var ingredientsHtml = '';
            for (var i = 0; i < recipe.ingredients.length; i++) {
                var ing = recipe.ingredients[i];
                var displayText = '';
                if (ing.amount !== null && ing.amount !== undefined && ing.amount !== '') {
                    displayText = ing.amount + ' ' + ing.unit;
                } else if (ing.unit) {
                    displayText = ing.unit;
                }
                ingredientsHtml += '<li><span>' + escapeHtml(ing.name) + '</span><span>' + displayText + '</span></li>';
            }
            document.getElementById('ingredientsList').innerHTML = ingredientsHtml;
        }
        
        if (document.getElementById('instructions')) {
            document.getElementById('instructions').innerHTML = recipe.instructions;
        }
        
        if (freshProducts.length === 0) {
            var warningDiv = document.createElement('div');
            warningDiv.style.cssText = 'background: #FDF0F0; color: #BC3F3F; padding: 0.5rem; border-radius: 12px; margin-top: 0.5rem; font-size: 0.8rem; text-align: center;';
            warningDiv.innerHTML = 'Внимание: у вас нет свежих продуктов. Проверьте сроки годности или добавьте новые продукты.';
            var availabilityBox = document.querySelector('.availability-box');
            if (availabilityBox) availabilityBox.appendChild(warningDiv);
        }
        
    } catch (err) {
        showMessage(err.message, true);
    }
}

// СПИСОК ПОКУПОК 
async function loadShoppingList() {
    const container = document.getElementById('shoppingContainer');
    if (!container) return;
    try {
        const items = await apiRequest('/api/shopping-list');
        if (items.length === 0) {
            container.innerHTML = '<div class="product-card empty-message">Список покупок пуст</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            html += '<div class="product-card">' +
                '<div class="product-name">' + escapeHtml(item.name) + '</div>' +
                '<div class="product-meta">' + item.quantity + '</div>' +
                '<div class="product-actions">' +
                '<button class="btn-outline btn-small" onclick="openPurchasedModal(' + item.id + ', \'' + escapeHtml(item.name).replace(/'/g, "\\'") + '\')">куплено</button>' +
                '<button class="btn-outline btn-small" onclick="removeShoppingItem(' + item.id + ')">удалить</button>' +
                '</div></div>';
        }
        container.innerHTML = html;
    } catch (err) {
        showMessage(err.message, true);
    }
}

async function removeShoppingItem(id) {
    try {
        await apiRequest('/api/shopping-list/' + id, { method: 'DELETE' });
        showMessage('Удалено из списка');
        loadShoppingList();
    } catch (err) {
        showMessage(err.message, true);
    }
}

//  АНАЛИТИКА 
async function loadAnalytics() {
    try {
        const stats = await apiRequest('/api/stats');
        document.getElementById('analyticsTotal').innerHTML = stats.total;
        document.getElementById('analyticsExpired').innerHTML = stats.expired;
        document.getElementById('analyticsExpiring').innerHTML = stats.expiring;
        
        const products = await apiRequest('/api/products');
        var popular = [...products];
        popular.sort(function(a, b) { return b.quantity - a.quantity; });
        popular = popular.slice(0, 5);
        
        var popularHtml = '';
        for (var i = 0; i < popular.length; i++) {
            var p = popular[i];
            var qty = p.quantity;
            if (p.unit === 'шт' || p.unit === 'упаковка') {
                qty = Math.floor(qty);
            }
            popularHtml += '<li><span>' + p.name + '</span><span>' + qty + ' ' + (p.unit === 'г' ? 'гр' : p.unit) + '</span></li>';
        }
        document.getElementById('analyticsPopularList').innerHTML = popularHtml;
        
        var categoryCount = {};
        for (var j = 0; j < products.length; j++) {
            var cat = products[j].category;
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        }
        var categoryHtml = '';
        for (var key in categoryCount) {
            if (categoryCount.hasOwnProperty(key)) {
                categoryHtml += '<li><span>' + key + '</span><span>' + categoryCount[key] + '</span></li>';
            }
        }
        document.getElementById('analyticsByCategory').innerHTML = categoryHtml;
        
        const disposed = await apiRequest('/api/stats/disposed');
        document.getElementById('analyticsDisposedTotal').innerHTML = disposed.total || 0;
        if (disposed.top && disposed.top.length > 0) {
            var disposedHtml = '';
            for (var k = 0; k < disposed.top.length; k++) {
                disposedHtml += '<li><span>' + disposed.top[k].product_name + '</span><span>' + disposed.top[k].count + ' раза</span></li>';
            }
            document.getElementById('analyticsTopDisposed').innerHTML = disposedHtml;
        }
    } catch (err) {
        showMessage(err.message, true);
    }
}

// КАТЕГОРИИ ПРОДУКТОВ 
const categories = [
    { id: 1, name: 'Молочные продукты' }, { id: 2, name: 'Мясо и рыба' },
    { id: 3, name: 'Овощи' }, { id: 4, name: 'Фрукты' }, { id: 5, name: 'Крупы' },
    { id: 6, name: 'Консервы' }, { id: 7, name: 'Напитки' }, { id: 8, name: 'Специи' },
    { id: 9, name: 'Соусы' }, { id: 10, name: 'Замороженные продукты' },
    { id: 11, name: 'Хлебобулочные изделия' }, { id: 12, name: 'Другое' }
];

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    var html = '';
    for (var i = 0; i < categories.length; i++) {
        html += '<div class="product-card" style="cursor: pointer;" onclick="window.location.href=\'category-products.html?cat=' + categories[i].id + '\'">' +
            '<div class="product-name">' + categories[i].name + '</div></div>';
    }
    container.innerHTML = html;
}

async function loadCategoryProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const catId = parseInt(urlParams.get('cat'));
    const category = categories.find(function(c) { return c.id === catId; });
    if (!category) return;
    document.getElementById('categoryTitle').innerHTML = category.name;
    
    try {
        const products = await apiRequest('/api/products');
        const filtered = products.filter(function(p) { return p.category === category.name; });
        const container = document.getElementById('categoryProductsContainer');
        if (!container) return;
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="product-card empty-message">Нет продуктов в этой категории</div>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var p = filtered[i];
            var daysText = p.days_left > 0 ? 'осталось ' + p.days_left + ' дн.' : 'просрочен на ' + (-p.days_left) + ' дн.';
            var statusText = p.status === 'green' ? 'свежий' : (p.status === 'yellow' ? 'скоро испортится' : 'просрочен');
            var badgeClass = p.status === 'green' ? 'badge-green' : (p.status === 'yellow' ? 'badge-yellow' : 'badge-red');
            
            html += '<div class="product-card">' +
                '<div class="product-name">' + escapeHtml(p.name) + '</div>' +
                '<div class="product-meta">' + p.quantity + ' ' + (p.unit === 'г' ? 'гр' : p.unit) + '</div>' +
                '<div class="product-meta">годен до ' + formatDate(p.expiry_date) + ' (' + daysText + ')</div>' +
                '<div><span class="badge ' + badgeClass + '">' + statusText + '</span></div>' +
                '<div class="product-actions">' +
                '<button class="btn-outline btn-small" onclick="openDecreaseModal(' + p.id + ', \'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\', ' + p.quantity + ')">списать</button>' +
                '<button class="btn-outline btn-small" onclick="openDeleteModal(' + p.id + ', \'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\')">утилизировать</button>' +
                '</div></div>';
        }
        container.innerHTML = html;
    } catch (err) {
        showMessage(err.message, true);
    }
}

// АДМИН-ПАНЕЛЬ
async function loadAdminRecipes() {
    const container = document.getElementById('adminRecipesContainer');
    if (!container) return;
    try {
        const recipes = await apiRequest('/api/recipes');
        if (recipes.length === 0) {
            container.innerHTML = '<div class="product-card empty-message">Нет рецептов. Добавьте первый!</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < recipes.length; i++) {
            var recipe = recipes[i];
            html += '<div class="recipe-card">' +
                '<div class="recipe-name">' + escapeHtml(recipe.name) + '</div>' +
                '<div class="product-meta">Ингредиентов: ' + recipe.ingredients.length + '</div>' +
                '<div class="product-actions">' +
                '<button class="btn-outline btn-small" onclick="editRecipe(' + recipe.id + ', \'' + escapeHtml(recipe.name).replace(/'/g, "\\'") + '\')">редактировать</button>' +
                '<button class="btn-outline btn-small" onclick="deleteRecipe(' + recipe.id + ', \'' + escapeHtml(recipe.name).replace(/'/g, "\\'") + '\')">удалить</button>' +
                '</div></div>';
        }
        container.innerHTML = html;
    } catch (err) {
        showMessage(err.message, true);
    }
}

function editRecipe(id, name) {
    window.location.href = 'admin-edit-recipe.html?id=' + id;
}

function deleteRecipe(id, name) {
    showConfirmModal(
        'Удалить рецепт "' + name + '"?',
        async function() {
            try {
                await apiRequest('/api/recipes/' + id, { method: 'DELETE' });
                showInfoModal('Рецепт удалён', 'Успех');
                loadAdminRecipes();
            } catch (err) {
                showInfoModal(err.message, 'Ошибка');
            }
        }
    );
}

//АДМИН: ДОБАВЛЕНИЕ РЕЦЕПТА 
function addIngredientRow(name, amount, unit) {
    const container = document.getElementById('ingredientsContainer');
    if (!container) return;
    
    var finalName = name || '';
    var finalAmount = (amount !== undefined && amount !== null) ? amount : '';
    var finalUnit = unit || '';
    
    var row = document.createElement('div');
    row.className = 'ingredient-row';
    row.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center; flex-wrap: wrap;';
    
    row.innerHTML = '<input type="text" placeholder="Название ингредиента" value="' + escapeHtml(finalName) + '" style="flex: 2; min-width: 150px;">' +
        '<input type="number" step="0.1" placeholder="Количество" value="' + finalAmount + '" style="flex: 0.8; min-width: 80px;">' +
        '<select style="flex: 0.8; min-width: 100px;">' +
        '<option value="шт"' + (finalUnit === 'шт' ? ' selected' : '') + '>шт</option>' +
        '<option value="г"' + (finalUnit === 'г' ? ' selected' : '') + '>г</option>' +
        '<option value="кг"' + (finalUnit === 'кг' ? ' selected' : '') + '>кг</option>' +
        '<option value="мл"' + (finalUnit === 'мл' ? ' selected' : '') + '>мл</option>' +
        '<option value="л"' + (finalUnit === 'л' ? ' selected' : '') + '>л</option>' +
        '<option value="ст.л"' + (finalUnit === 'ст.л' ? ' selected' : '') + '>ст.л</option>' +
        '<option value="ч.л"' + (finalUnit === 'ч.л' ? ' selected' : '') + '>ч.л</option>' +
        '<option value="по вкусу"' + (finalUnit === 'по вкусу' ? ' selected' : '') + '>по вкусу</option>' +
        '</select>' +
        '<button type="button" class="btn-outline remove-ingredient-btn" style="padding: 0.3rem 0.8rem;">✕</button>';
    
    container.appendChild(row);
    
    var removeBtn = row.querySelector('.remove-ingredient-btn');
    removeBtn.onclick = function() { row.remove(); };
}

async function saveNewRecipe(e) {
    e.preventDefault();
    
    const name = document.getElementById('recipeName').value.trim();
    const instructions = document.getElementById('recipeInstructions').value.trim();
    
    if (!name) {
        showInfoModal('Введите название блюда', 'Ошибка');
        return;
    }
    
    if (!instructions) {
        showInfoModal('Введите инструкцию по приготовлению', 'Ошибка');
        return;
    }
    
    const rows = document.querySelectorAll('#ingredientsContainer .ingredient-row');
    var ingredients = [];
    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var inputs = row.querySelectorAll('input');
        var select = row.querySelector('select');
        var ingName = inputs[0].value.trim();
        var amount = inputs[1].value;
        var unit = select.value;
        
        if (ingName) {
            var amountValue = null;
            if (amount !== '' && !isNaN(parseFloat(amount))) {
                amountValue = parseFloat(amount);
            }
            ingredients.push({ 
                name: ingName, 
                amount: amountValue,
                unit: unit
            });
        }
    }
    
    if (ingredients.length === 0) {
        showInfoModal('Добавьте хотя бы один ингредиент', 'Ошибка');
        return;
    }
    
    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name, 
                instructions: instructions, 
                ingredients: ingredients 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка сохранения');
        }
        
        showInfoModal('Рецепт добавлен', 'Успех');
        setTimeout(function() {
            window.location.href = 'admin-recipes.html';
        }, 1500);
    } catch (err) {
        showInfoModal(err.message, 'Ошибка');
    }
}

// АДМИН: РЕДАКТИРОВАНИЕ РЕЦЕПТА
async function loadRecipeForEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('id'));
    
    if (!recipeId || isNaN(recipeId)) {
        window.location.href = 'admin-recipes.html';
        return;
    }
    
    try {
        const recipe = await apiRequest('/api/recipes/' + recipeId);
        
        document.getElementById('editRecipeId').value = recipe.id;
        document.getElementById('editRecipeName').value = recipe.name;
        document.getElementById('editRecipeInstructions').value = recipe.instructions || '';
        
        const container = document.getElementById('editIngredientsContainer');
        if (container) {
            container.innerHTML = '';
            
            if (recipe.ingredients && recipe.ingredients.length > 0) {
                for (var i = 0; i < recipe.ingredients.length; i++) {
                    var ing = recipe.ingredients[i];
                    var amountValue = (ing.amount !== null && ing.amount !== undefined) ? ing.amount : '';
                    var unitValue = ing.unit || '';
                    addEditIngredientRow(ing.name, amountValue, unitValue);
                }
            } else {
                addEditIngredientRow('', '', '');
            }
        }
    } catch (err) {
        showMessage(err.message, true);
    }
}

function addEditIngredientRow(name, amount, unit) {
    const container = document.getElementById('editIngredientsContainer');
    if (!container) return;
    
    var finalName = name || '';
    var finalAmount = (amount !== undefined && amount !== null) ? amount : '';
    var finalUnit = unit || '';
    
    var row = document.createElement('div');
    row.className = 'ingredient-row';
    row.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center; flex-wrap: wrap;';
    
    row.innerHTML = '<input type="text" placeholder="Название ингредиента" value="' + escapeHtml(finalName) + '" style="flex: 2; min-width: 150px;">' +
        '<input type="number" step="0.1" placeholder="Количество" value="' + finalAmount + '" style="flex: 0.8; min-width: 80px;">' +
        '<select style="flex: 0.8; min-width: 100px;">' +
        '<option value="шт"' + (finalUnit === 'шт' ? ' selected' : '') + '>шт</option>' +
        '<option value="г"' + (finalUnit === 'г' ? ' selected' : '') + '>г</option>' +
        '<option value="кг"' + (finalUnit === 'кг' ? ' selected' : '') + '>кг</option>' +
        '<option value="мл"' + (finalUnit === 'мл' ? ' selected' : '') + '>мл</option>' +
        '<option value="л"' + (finalUnit === 'л' ? ' selected' : '') + '>л</option>' +
        '<option value="ст.л"' + (finalUnit === 'ст.л' ? ' selected' : '') + '>ст.л</option>' +
        '<option value="ч.л"' + (finalUnit === 'ч.л' ? ' selected' : '') + '>ч.л</option>' +
        '<option value="по вкусу"' + (finalUnit === 'по вкусу' ? ' selected' : '') + '>по вкусу</option>' +
        '</select>' +
        '<button type="button" class="btn-outline remove-ingredient-btn" style="padding: 0.3rem 0.8rem;">✕</button>';
    
    container.appendChild(row);
    
    var removeBtn = row.querySelector('.remove-ingredient-btn');
    removeBtn.onclick = function() { row.remove(); };
}

async function saveEditedRecipe(e) {
    e.preventDefault();
    
    const id = document.getElementById('editRecipeId').value;
    const name = document.getElementById('editRecipeName').value.trim();
    const instructions = document.getElementById('editRecipeInstructions').value.trim();
    
    if (!name) {
        showInfoModal('Введите название блюда', 'Ошибка');
        return;
    }
    
    const rows = document.querySelectorAll('#editIngredientsContainer .ingredient-row');
    var ingredients = [];
    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var inputs = row.querySelectorAll('input');
        var select = row.querySelector('select');
        var ingName = inputs[0].value.trim();
        var amount = inputs[1].value;
        var unit = select.value;
        
        if (ingName) {
            var amountValue = null;
            if (amount !== '' && !isNaN(parseFloat(amount))) {
                amountValue = parseFloat(amount);
            }
            ingredients.push({ 
                name: ingName, 
                amount: amountValue,
                unit: unit
            });
        }
    }
    
    if (ingredients.length === 0) {
        showInfoModal('Добавьте хотя бы один ингредиент', 'Ошибка');
        return;
    }
    
    try {
        const response = await fetch('/api/recipes/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name, 
                instructions: instructions, 
                ingredients: ingredients 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка сохранения');
        }
        
        showInfoModal('Рецепт обновлён', 'Успех');
        setTimeout(function() {
            window.location.href = 'admin-recipes.html';
        }, 1500);
    } catch (err) {
        showInfoModal(err.message, 'Ошибка');
    }
}

async function deleteRecipeFromEdit() {
    const id = document.getElementById('editRecipeId').value;
    const name = document.getElementById('editRecipeName').value;
    
    showConfirmModal(
        'Удалить рецепт "' + name + '"?',
        async function() {
            try {
                await apiRequest('/api/recipes/' + id, { method: 'DELETE' });
                showInfoModal('Рецепт удалён', 'Успех');
                setTimeout(function() {
                    window.location.href = 'admin-recipes.html';
                }, 1500);
            } catch (err) {
                showInfoModal(err.message, 'Ошибка');
            }
        }
    );
}

// ПРОФИЛЬ 
let originalUserData = {};

async function loadProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
        const userData = await apiRequest('/api/users/' + currentUser.id);
        originalUserData = userData;
        
        document.getElementById('profileLastName').innerHTML = userData.last_name || '-';
        document.getElementById('profileFirstName').innerHTML = userData.first_name || '-';
        document.getElementById('profilePatronymic').innerHTML = userData.patronymic || '-';
        document.getElementById('profileEmail').innerHTML = userData.email;
        document.getElementById('profileRole').innerHTML = userData.role === 'admin' ? 'Администратор' : 'Пользователь';
        document.getElementById('profileDate').innerHTML = new Date(userData.created_at).toLocaleDateString('ru-RU');
    } catch (err) {
        showMessage(err.message, true);
    }
}

function showEditForm() {
    document.getElementById('editLastName').value = originalUserData.last_name || '';
    document.getElementById('editFirstName').value = originalUserData.first_name || '';
    document.getElementById('editPatronymic').value = originalUserData.patronymic || '';
    document.getElementById('editEmail').value = originalUserData.email || '';
    document.getElementById('editPassword').value = '';
    
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
}

function hideEditForm() {
    document.getElementById('profileView').style.display = 'block';
    document.getElementById('profileEdit').style.display = 'none';
}

async function saveProfileChanges(e) {
    e.preventDefault();
    
    const lastName = document.getElementById('editLastName').value.trim();
    const firstName = document.getElementById('editFirstName').value.trim();
    const patronymic = document.getElementById('editPatronymic').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const newPassword = document.getElementById('editPassword').value;
    
    if (!lastName || !firstName || !email) {
        showMessage('Фамилия, имя и email обязательны', true);
        return;
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Введите корректный email', true);
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
        var updateData = {
            last_name: lastName,
            first_name: firstName,
            patronymic: patronymic || null,
            email: email
        };
        
        if (newPassword) {
            if (newPassword.length < 6) {
                showMessage('Пароль должен содержать не менее 6 символов', true);
                return;
            }
            updateData.password = newPassword;
        }
        
        const result = await apiRequest('/api/users/' + currentUser.id, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        var updatedUser = { ...currentUser, ...result.user };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        showMessage('Профиль успешно обновлён');
        hideEditForm();
        loadProfile();
    } catch (err) {
        showMessage(err.message, true);
    }
}

//АВТОРИЗАЦИЯ 
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        document.getElementById('email_error').innerHTML = '';
        document.getElementById('password_error').innerHTML = '';
        document.getElementById('email').classList.remove('input-error');
        document.getElementById('password').classList.remove('input-error');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        var hasError = false;
        
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!email) {
            document.getElementById('email_error').innerHTML = 'Поле обязательно для заполнения';
            document.getElementById('email').classList.add('input-error');
            hasError = true;
        } else if (!emailRegex.test(email)) {
            document.getElementById('email_error').innerHTML = 'Поле заполнено некорректно';
            document.getElementById('email').classList.add('input-error');
            hasError = true;
        }
        if (!password) {
            document.getElementById('password_error').innerHTML = 'Поле обязательно для заполнения';
            document.getElementById('password').classList.add('input-error');
            hasError = true;
        }
        if (hasError) return;
        
        try {
            const data = await apiRequest('/api/login', { method: 'POST', body: JSON.stringify({ email: email, password: password }) });
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            if (data.user.role === 'admin') window.location.href = '/admin-recipes.html';
            else window.location.href = '/products.html';
        } catch (err) {
            document.getElementById('password_error').innerHTML = 'Неверный email или пароль';
            document.getElementById('password').classList.add('input-error');
            document.getElementById('email').classList.add('input-error');
        }
    });
}

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    function validateRussian(value) {
        return /^[а-яА-ЯёЁ]+$/.test(value);
    }
    
    function checkPasswordStrength(password) {
        if (password.length === 0) return 0;
        if (password.length < 6) return 1;
        if (password.length >= 6 && password.length < 8) return 2;
        return 3;
    }
    
    const passwordInput = document.getElementById('password');
    const strengthDiv = document.getElementById('passwordStrength');
    if (passwordInput && strengthDiv) {
        passwordInput.addEventListener('input', function() {
            var strength = checkPasswordStrength(passwordInput.value);
            strengthDiv.className = 'password-strength';
            if (strength === 1) strengthDiv.classList.add('strength-weak');
            else if (strength === 2) strengthDiv.classList.add('strength-medium');
            else if (strength === 3) strengthDiv.classList.add('strength-strong');
        });
    }
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        document.querySelectorAll('.error-message').forEach(function(el) { el.innerHTML = ''; });
        document.querySelectorAll('input').forEach(function(el) { el.classList.remove('input-error'); });
        
        const lastName = document.getElementById('last_name').value.trim();
        const firstName = document.getElementById('first_name').value.trim();
        const patronymic = document.getElementById('patronymic').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm_password').value;
        var hasError = false;
        
        if (!lastName) {
            document.getElementById('last_name_error').innerHTML = 'Поле обязательно для заполнения';
            document.getElementById('last_name').classList.add('input-error');
            hasError = true;
        } else if (!validateRussian(lastName)) {
            document.getElementById('last_name_error').innerHTML = 'Поле заполнено некорректно';
            document.getElementById('last_name').classList.add('input-error');
            hasError = true;
        }
        if (!firstName) {
            document.getElementById('first_name_error').innerHTML = 'Поле обязательно для заполнения';
            document.getElementById('first_name').classList.add('input-error');
            hasError = true;
        } else if (!validateRussian(firstName)) {
            document.getElementById('first_name_error').innerHTML = 'Поле заполнено некорректно';
            document.getElementById('first_name').classList.add('input-error');
            hasError = true;
        }
        if (patronymic && !validateRussian(patronymic)) {
            document.getElementById('patronymic_error').innerHTML = 'Поле заполнено некорректно';
            document.getElementById('patronymic').classList.add('input-error');
            hasError = true;
        }
        
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!email) {
            document.getElementById('email_error').innerHTML = 'Поле обязательно для заполнения';
            document.getElementById('email').classList.add('input-error');
            hasError = true;
        } else if (!emailRegex.test(email)) {
            document.getElementById('email_error').innerHTML = 'Поле заполнено некорректно';
            document.getElementById('email').classList.add('input-error');
            hasError = true;
        }
        if (!password) {
            document.getElementById('password_error').innerHTML = 'Поле обязательно для заполнения';
            document.getElementById('password').classList.add('input-error');
            hasError = true;
        } else if (password.length < 6) {
            document.getElementById('password_error').innerHTML = 'Пароль должен содержать не менее 6 символов';
            document.getElementById('password').classList.add('input-error');
            hasError = true;
        }
        if (password !== confirm) {
            document.getElementById('confirm_error').innerHTML = 'Пароли не совпадают';
            document.getElementById('confirm_password').classList.add('input-error');
            hasError = true;
        }
        
        if (hasError) return;
        
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ last_name: lastName, first_name: firstName, patronymic: patronymic || null, email: email, password: password })
            });
            const data = await res.json();
            if (res.ok) {
                showMessage('Регистрация прошла успешно! Теперь войдите.');
                setTimeout(function() { window.location.href = '/login'; }, 1500);
            } else {
                showMessage(data.error || 'Ошибка регистрации', true);
            }
        } catch (err) {
            showMessage('Ошибка сервера', true);
        }
    });
}

// ИНИЦИАЛИЗАЦИЯ СТРАНИЦ 
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = async function() {
            await apiRequest('/api/logout', { method: 'POST' });
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        };
    }
}

function initAddToShoppingList() {
    const addToShoppingListBtn = document.getElementById('addToShoppingListBtn');
    if (addToShoppingListBtn) {
        addToShoppingListBtn.onclick = openManualModal;
    }
}

function initManualModal() {
    const addManualItemBtn = document.getElementById('addManualItemBtn');
    if (addManualItemBtn) {
        addManualItemBtn.onclick = function() {
            const container = document.getElementById('manualItemsContainer');
            const newRow = document.createElement('div');
            newRow.className = 'manual-item-row';
            newRow.style.display = 'flex';
            newRow.style.gap = '0.5rem';
            newRow.style.marginBottom = '0.5rem';
            newRow.innerHTML = '<input type="text" class="manual-product-name" placeholder="Название продукта" style="flex:2;">' +
                '<input type="text" class="manual-product-quantity" placeholder="Количество" value="1 шт" style="flex:1;">' +
                '<button type="button" class="btn-outline remove-manual-item" style="padding: 0.3rem 0.8rem;">✕</button>';
            container.appendChild(newRow);
        };
    }
    
    const manualContainer = document.getElementById('manualItemsContainer');
    if (manualContainer) {
        manualContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-manual-item')) {
                e.target.closest('.manual-item-row').remove();
            }
        });
    }
    
    const cancelManualBtn = document.getElementById('cancelManualBtn');
    const confirmManualBtn = document.getElementById('confirmManualBtn');
    const manualModal = document.getElementById('addManualModal');
    
    if (cancelManualBtn) cancelManualBtn.onclick = closeManualModal;
    if (confirmManualBtn) confirmManualBtn.onclick = confirmManualAdd;
    if (manualModal) {
        manualModal.onclick = function(e) {
            if (e.target === manualModal) closeManualModal();
        };
    }
}

// ОБРАБОТЧИКИ МОДАЛЬНЫХ ОКОН 
function initModals() {
    const cancelDecreaseBtn = document.getElementById('cancelDecreaseBtn');
    const confirmDecreaseBtn = document.getElementById('confirmDecreaseBtn');
    const decreaseModal = document.getElementById('decreaseModal');
    
    if (cancelDecreaseBtn) cancelDecreaseBtn.onclick = closeDecreaseModal;
    if (confirmDecreaseBtn) confirmDecreaseBtn.onclick = confirmDecreaseAction;
    if (decreaseModal) {
        decreaseModal.onclick = function(e) {
            if (e.target === decreaseModal) closeDecreaseModal();
        };
    }
    
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteModal = document.getElementById('deleteModal');
    
    if (cancelDeleteBtn) cancelDeleteBtn.onclick = closeDeleteModal;
    if (confirmDeleteBtn) confirmDeleteBtn.onclick = confirmDeleteAction;
    if (deleteModal) {
        deleteModal.onclick = function(e) {
            if (e.target === deleteModal) closeDeleteModal();
        };
    }
    
    const cancelPurchasedBtn = document.getElementById('cancelPurchasedBtn');
    const confirmPurchasedBtn = document.getElementById('confirmPurchasedBtn');
    const purchasedModal = document.getElementById('addPurchasedModal');
    
    if (cancelPurchasedBtn) cancelPurchasedBtn.onclick = closePurchasedModal;
    if (confirmPurchasedBtn) confirmPurchasedBtn.onclick = confirmAddPurchasedAction;
    if (purchasedModal) {
        purchasedModal.onclick = function(e) {
            if (e.target === purchasedModal) closePurchasedModal();
        };
    }
}

function initProfile() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editProfileForm = document.getElementById('editProfileForm');
    
    if (editProfileBtn) editProfileBtn.onclick = showEditForm;
    if (cancelEditBtn) cancelEditBtn.onclick = hideEditForm;
    if (editProfileForm) editProfileForm.addEventListener('submit', saveProfileChanges);
}

function initAdminAddRecipe() {
    if (!window.location.pathname.includes('admin-add-recipe.html')) return;
    
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('ingredientsContainer');
        if (container) {
            container.innerHTML = '';
            addIngredientRow('', '', '');
        }
        
        const addBtn = document.getElementById('addIngredientBtn');
        const form = document.getElementById('adminAddRecipeForm');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (addBtn) addBtn.onclick = function() { addIngredientRow('', '', ''); };
        if (form) form.onsubmit = saveNewRecipe;
        if (cancelBtn) cancelBtn.onclick = function() { window.location.href = 'admin-recipes.html'; };
    });
}

function initAdminEditRecipe() {
    if (!window.location.pathname.includes('admin-edit-recipe.html')) return;
    
    document.addEventListener('DOMContentLoaded', function() {
        loadRecipeForEdit();
        
        const addBtn = document.getElementById('editAddIngredientBtn');
        const form = document.getElementById('adminEditRecipeForm');
        const deleteBtn = document.getElementById('deleteRecipeBtn');
        
        if (addBtn) addBtn.onclick = function() { addEditIngredientRow('', '', ''); };
        if (form) form.onsubmit = saveEditedRecipe;
        if (deleteBtn) deleteBtn.onclick = deleteRecipeFromEdit;
    });
}

// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ 
const currentPath = window.location.pathname;

initLogout();
initModals();
initManualModal();
initAddToShoppingList();
initLoginForm();
initRegisterForm();
initProfile();
initAdminAddRecipe();
initAdminEditRecipe();

if (currentPath === '/products' || currentPath === '/products.html') {
    loadProducts();
    updateProductsStats();
    initAddProductForm();
} else if (currentPath === '/shopping-list' || currentPath === '/shopping-list.html') {
    loadShoppingList();
} else if (currentPath === '/recipes' || currentPath === '/recipes.html') {
    loadRecipes();
} else if (currentPath === '/recipe-detail.html') {
    loadRecipeDetail();
} else if (currentPath === '/categories' || currentPath === '/categories.html') {
    renderCategories();
} else if (currentPath === '/category-products.html') {
    loadCategoryProducts();
} else if (currentPath === '/analytics' || currentPath === '/analytics.html') {
    loadAnalytics();
} else if (currentPath === '/admin-recipes.html' || currentPath === '/admin-recipes') {
    loadAdminRecipes();
} else if (currentPath === '/profile' || currentPath === '/profile.html') {
    loadProfile();
}

if (window.location.pathname === '/add-product' || window.location.pathname === '/add-product.html') {
    initAddProductForm();
}

console.log('main.js загружен');