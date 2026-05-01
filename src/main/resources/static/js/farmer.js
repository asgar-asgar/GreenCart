let currentUser = null;

// Run on page load
window.onload = async function () {
    await checkSession();
    await loadProducts();
    await loadOrders();
};

// Check if user is logged in
async function checkSession() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.success || data.role !== 'FARMER') {
            window.location.href = '/index.html';
            return;
        }

        currentUser = data;
        document.getElementById('farmerEmail').textContent = data.name;
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
    document.getElementById('productsSection').classList.add('hidden');
    document.getElementById('addProductSection').classList.add('hidden');
    document.getElementById('ordersSection').classList.add('hidden');
    document.getElementById('profileSection').classList.add('hidden');

    document.querySelectorAll('.tab-nav-btn')
        .forEach(btn => btn.classList.remove('active'));

    document.getElementById(section + 'Section').classList.remove('hidden');
    event.target.classList.add('active');
}

// Load farmer's products
async function loadProducts() {
    try {
        const response = await fetch('/api/products/my');
        const products = await response.json();
        const container = document.getElementById('productsList');

        if (products.length === 0) {
            container.innerHTML = '<p class="empty-msg">No products added yet.</p>';
            return;
        }

        container.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.imagePath}" alt="${p.name}"
                     onerror="this.src='/images/placeholder.png'">
                <div class="product-card-body">
                    <h3>${p.name}</h3>
                    <span class="product-category">${p.category}</span>
                    <p class="product-price">₹${p.price}/kg</p>
                    <p class="product-stock">${p.quantity} kg available</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Add new product
async function addProduct() {
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const price = document.getElementById('prodPrice').value;
    const quantity = document.getElementById('prodQuantity').value;
    const description = document.getElementById('prodDescription').value.trim();
    const image = document.getElementById('prodImage').files[0];
    const availability = document.getElementById('prodAvailability').value;
    const errorDiv = document.getElementById('addProductError');
    const successDiv = document.getElementById('addProductSuccess');

    errorDiv.textContent = '';
    successDiv.textContent = '';

    if (!name || !price || !quantity || !description || !image) {
        errorDiv.textContent = 'Please fill in all fields and select an image';
        return;
    }

    // Use FormData because we are sending a file
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('availability', availability);

    try {
        const response = await fetch('/api/products/add', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            successDiv.textContent = 'Product added successfully!';
            // Clear form
            document.getElementById('prodName').value = '';
            document.getElementById('prodPrice').value = '';
            document.getElementById('prodQuantity').value = '';
            document.getElementById('prodDescription').value = '';
            document.getElementById('prodImage').value = '';
            // Reload products
            await loadProducts();
        } else {
            errorDiv.textContent = data.message || 'Failed to add product';
        }

    } catch (error) {
        errorDiv.textContent = 'Server error. Please try again.';
    }
}

// Load incoming orders
async function loadOrders() {
    try {
        const response = await fetch('/api/orders/incoming');
        const orders = await response.json();
        const container = document.getElementById('ordersList');
        const badge = document.getElementById('orderBadge');

        // Show badge if orders exist
        const pendingOrders = orders.filter(o => o.status !== 'DELIVERED');
        if (pendingOrders.length > 0) {
            badge.textContent = pendingOrders.length;
            badge.classList.remove('hidden');
        }

        if (orders.length === 0) {
            container.innerHTML = '<p class="empty-msg">No incoming orders yet.</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card" id="order-${order.id}">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-date"> · ${formatDate(order.createdAt)}</span>
                    </div>
                    <span class="status-badge status-${order.status}">
                        ${formatStatus(order.status)}
                    </span>
                </div>

                <div class="customer-info">
                    <p>👤 ${order.consumer.name}</p>
                    <p>📞 ${order.consumer.mobile}</p>
                    <p>📍 ${order.deliveryAddress}</p>
                </div>

                <div class="order-items">
                    <table>
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
                    <p class="order-total">Total: ₹${order.totalAmount}</p>
                </div>

                ${order.status === 'ORDER_PLACED' ? `
                    <button class="btn-out-delivery"
                        onclick="markOutForDelivery(${order.id}, this)">
                        🚚 Out for Delivery
                    </button>
                ` : order.status === 'OUT_FOR_DELIVERY' ? `
                    <button class="btn-deliver"
                        onclick="markDelivered(${order.id}, this)">
                        ✅ Mark as Delivered
                    </button>
                ` : `
                    <div class="delivered-stamp">✅ Delivered</div>
                `}
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Mark order as delivered
async function markDelivered(orderId, btn) {
    btn.disabled = true;
    btn.textContent = 'Updating...';
    try {
        const response = await fetch(`/api/orders/${orderId}/deliver`, {
            method: 'PUT'
        });
        const data = await response.json();
        if (data.success) {
            await loadOrders();
        } else {
            btn.disabled = false;
            btn.textContent = '✅ Mark as Delivered';
        }
    } catch (error) {
        btn.disabled = false;
        btn.textContent = '✅ Mark as Delivered';
    }
}


async function markOutForDelivery(orderId, btn) {
    btn.disabled = true;
    btn.textContent = 'Updating...';
    try {
        const response = await fetch(`/api/orders/${orderId}/out-for-delivery`, {
            method: 'PUT'
        });
        const data = await response.json();
        if (data.success) {
            await loadOrders();
        } else {
            btn.disabled = false;
            btn.textContent = '🚚 Out for Delivery';
        }
    } catch (error) {
        btn.disabled = false;
        btn.textContent = '🚚 Out for Delivery';
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