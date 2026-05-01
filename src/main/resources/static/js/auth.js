// Switch between Login and Register tabs
function showTab(tab) {
    document.getElementById('loginTab').classList.add('hidden');
    document.getElementById('registerTab').classList.add('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tab + 'Tab').classList.remove('hidden');
    event.target.classList.add('active');
}

// Login function
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');

    errorDiv.textContent = '';

    if (!email || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Redirect based on role
            if (data.role === 'FARMER') {
                window.location.href = '/farmer.html';
            } else {
                window.location.href = '/consumer.html';
            }
        } else {
            errorDiv.textContent = data.message || 'Login failed';
        }

    } catch (error) {
        errorDiv.textContent = 'Server error. Please try again.';
    }
}

// Register function
async function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const role = document.getElementById('regRole').value;
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');

    errorDiv.textContent = '';
    successDiv.textContent = '';

    if (!name || !email || !password || !mobile || !address) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, mobile, address, role })
        });

        const data = await response.json();

        if (data.success) {
            successDiv.textContent = 'Registration successful! Please login.';
            setTimeout(() => showTab('login'), 1500);
        } else {
            errorDiv.textContent = data.message || 'Registration failed';
        }

    } catch (error) {
        errorDiv.textContent = 'Server error. Please try again.';
    }
}