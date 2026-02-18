// Toggle between login and registration forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user exists
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store current user session
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password!');
    }
}

// Handle Registration
function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Get existing users
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        fullName,
        email,
        username,
        password
    };
    
    // Add user to array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Registration successful! Please login.');
    toggleForms();
    
    // Clear form
    document.getElementById('regFullName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
}

// Check if user is already logged in
window.addEventListener('load', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
});
