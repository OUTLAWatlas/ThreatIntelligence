// Authentication utility functions
const API_URL = window.location.origin;

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

// Get stored token
function getToken() {
    return localStorage.getItem('token');
}

// Save token and user data
function saveAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Clear auth data
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Get current user data
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Show error message
function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }
}

// Show success message
function showSuccess(elementId, message) {
    const successDiv = document.getElementById(elementId);
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.remove('hidden');
        setTimeout(() => {
            successDiv.classList.add('hidden');
        }, 5000);
    }
}

// Show loading state
function showLoading(show) {
    const form = document.querySelector('form');
    const spinner = document.getElementById('loading-spinner');
    if (form && spinner) {
        if (show) {
            form.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            form.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            saveAuthData(data.token, data.user);
            showSuccess('success-message', 'Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showLoading(false);
            showError('error-message', data.message || 'Login failed');
        }
    } catch (error) {
        showLoading(false);
        showError('error-message', 'Network error. Please try again.');
        console.error('Login error:', error);
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError('error-message', 'Passwords do not match');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showError('error-message', 'Password must be at least 6 characters');
        return;
    }
    
    // Validate username length
    if (username.length < 3 || username.length > 30) {
        showError('error-message', 'Username must be between 3 and 30 characters');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            saveAuthData(data.token, data.user);
            showSuccess('success-message', 'Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showLoading(false);
            showError('error-message', data.message || 'Registration failed');
        }
    } catch (error) {
        showLoading(false);
        showError('error-message', 'Network error. Please try again.');
        console.error('Signup error:', error);
    }
}

// Handle logout
function handleLogout() {
    clearAuthData();
    window.location.href = '/login.html';
}

// Check authentication on protected pages
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Add authorization header to fetch requests
function authFetch(url, options = {}) {
    const token = getToken();
    
    if (!token) {
        window.location.href = '/login.html';
        return Promise.reject(new Error('No token found'));
    }
    
    const authOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };
    
    return fetch(url, authOptions)
        .then(response => {
            if (response.status === 401) {
                clearAuthData();
                window.location.href = '/login.html';
                throw new Error('Unauthorized');
            }
            return response;
        });
}

// Display user info in navbar
function displayUserInfo() {
    const user = getCurrentUser();
    if (user) {
        // Find elements to update with user info
        const userElements = document.querySelectorAll('[data-user-info]');
        userElements.forEach(el => {
            el.textContent = user.username;
        });
        
        // Show logout button if it exists
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.classList.remove('hidden');
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
}

// Initialize authentication based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    // Login page
    if (currentPage.includes('login.html')) {
        // Redirect if already logged in
        if (isAuthenticated()) {
            window.location.href = '/';
            return;
        }
        
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }
    
    // Signup page
    else if (currentPage.includes('signup.html')) {
        // Redirect if already logged in
        if (isAuthenticated()) {
            window.location.href = '/';
            return;
        }
        
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
        }
    }
    
    // Protected pages (dashboard, etc.)
    else if (!currentPage.includes('login.html') && !currentPage.includes('signup.html')) {
        if (requireAuth()) {
            displayUserInfo();
        }
    }
});

// Export functions for use in other scripts
window.authUtils = {
    isAuthenticated,
    getToken,
    getCurrentUser,
    authFetch,
    handleLogout,
    requireAuth,
    displayUserInfo
};
