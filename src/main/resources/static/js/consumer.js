let currentUser = null;
let allProducts = [];
let cart = [];

// Run on page load
window.onload = async function () {
    await checkSession();
    await loadProducts();
    await loadOrders();
};

// Check session
async function checkSession() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.success || data.role !== 'CONSUMER') {
            window.location.href = '/index.html';
            return;
        }

        currentUser = data;
        document.getElementById('consumerEmail').textContent = data.name;
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profileMobile').textContent = data.mobile || 'N/A';
        document.getElementById('profileAddress').textContent = data.address || 'N/A';

    } catch (error) {
        window.location.href = '/index.html';
    }
}

// Show/hide sections
function showSection(section) {
    document.getElementById('marketplaceSection').classList.add('hidden');
    document.getElementById('cartSection').classList.add('hidden');
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('profileSection').classList.add('hidden');

    document.querySelectorAll('.tab-nav-btn')
        .forEach(btn => btn.classList.remove('active'));

    document.getElementById(section + 'Section').classList.remove('hidden');
    event.target.classList.add('active');

    if (section === 'cart') renderCart();
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Filter products by category
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    if (category === 'All') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Render products
function renderProducts(products) {
    const container = document.getElementById('productsList');

    if (products.length === 0) {
        container.innerHTML = '<p class="empty-msg">No products found.</p>';
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.imagePath}" alt="${p.name}"
                 onerror="this.src='/images/placeholder.png'">
            <div class="product-card-body">
                <h3>${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <span class="product-category">${p.category}</span>
                <p class="product-farmer">👤 ${p.farmer.name}</p>
                <div class="product-footer">
                    <div>
                        <p class="product-price">₹${p.price}/kg</p>
                        <p class="product-stock">${p.quantity} kg available</p>
                    </div>
                </div>
                <button class="btn-add-cart" onclick="addToCart(${p.id})">
                    🛒 Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxQuantity: product.quantity
        });
    }

    updateCartCount();
    showCartNotification(product.name);
}

// Update cart count badge
function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = total;
}

// Show notification when item added
function showCartNotification(name) {
    const existing = document.getElementById('cartNotif');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.id = 'cartNotif';
    notif.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: #2e7d32; color: white;
        padding: 12px 20px; border-radius: 8px;
        font-size: 14px; z-index: 999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notif.textContent = `✓ ${name} added to cart`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// Render cart
function renderCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        summary.classList.add('hidden');
        return;
    }

    summary.classList.remove('hidden');

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price}/kg</p>
            </div>
            <div class="cart-item-right">
                <div class="qty-controls">
                    <button class="qty-btn"
                        onclick="changeQty(${index}, -1)">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn"
                        onclick="changeQty(${index}, 1)">+</button>
                </div>
                <span class="cart-item-price">
                    ₹${(item.price * item.quantity).toFixed(2)}
                </span>
                <button class="btn-remove"
                    onclick="removeFromCart(${index})">✕</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// Change quantity in cart
function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartCount();
    renderCart();
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

// Place order
async function placeOrder() {
    const address = document.getElementById('deliveryAddress').value.trim();
    const errorDiv = document.getElementById('orderError');
    const successDiv = document.getElementById('orderSuccess');

    errorDiv.textContent = '';
    successDiv.textContent = '';

    if (!address) {
        errorDiv.textContent = 'Please enter delivery address';
        return;
    }

    if (cart.length === 0) {
        errorDiv.textContent = 'Cart is empty';
        return;
    }

    const orderData = {
        deliveryAddress: address,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch('/api/orders/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (data.success) {
            successDiv.textContent = `Order #${data.orderId} placed successfully!`;
            cart = [];
            updateCartCount();
            await loadOrders();
            setTimeout(() => showSection('orders'), 1500);
        } else {
            errorDiv.textContent = data.message || 'Failed to place order';
        }

    } catch (error) {
        errorDiv.textContent = 'Server error. Please try again.';
    }
}

// Load my orders
async function loadOrders() {
    try {
        const response = await fetch('/api/orders/my');
        const orders = await response.json();
        const container = document.getElementById('ordersList');

        if (orders.length === 0) {
            container.innerHTML = '<p class="empty-msg">No orders placed yet.</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date"> · ${formatDate(order.createdAt)}</span>
                    </div>
                    <span class="status-badge status-${order.status}">
                        ${formatStatus(order.status)}
                    </span>
                </div>

                <table class="order-items-table">
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                    ${order.orderItems.map(item => `
                        <tr>
                            <td>${item.product.name}</td>
                            <td>${item.quantity} kg</td>
                            <td>₹${item.price}</td>
                        </tr>
                    `).join('')}
                </table>

                <div class="order-footer">
                    <div class="farmer-contact">
                        📞 Farmer Contact: ${order.orderItems[0]?.product?.farmer?.mobile || 'N/A'}
                        <br>
                        <small>Contact farmer directly for delivery</small>
                    </div>
                    <div>
                        <p style="font-size:13px;color:#777;">
                            📍 ${order.deliveryAddress}
                        </p>
                        <p style="font-size:13px;color:#777;">
                            💵 Payment: Cash on Delivery
                        </p>
                        <p class="order-total-text">Total: ₹${order.totalAmount}</p>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Logout
async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/index.html';
}

// Helper: format date
function formatDate(dateArray) {
    if (!dateArray) return '';
    if (Array.isArray(dateArray)) {
        const date = new Date(
            dateArray[0],
            dateArray[1] - 1,
            dateArray[2],
            dateArray[3] || 0,
            dateArray[4] || 0
        );
        return date.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        });
    }
    return new Date(dateArray).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

// Helper: format status
function formatStatus(status) {
    const map = {
        'ORDER_PLACED': 'Order Placed',
        'OUT_FOR_DELIVERY': 'Out for Delivery',
        'DELIVERED': 'Delivered'
    };
    return map[status] || status;
}