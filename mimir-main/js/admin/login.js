document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');

    // Credenciales simuladas
    const ADMIN_CREDENTIALS = {
        username: 'admin@email.com',
        password: 'admin123'
    };

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        // Clear previous custom validity
        usernameInput.setCustomValidity('');
        passwordInput.setCustomValidity('');

        // Validaciones cliente-lado
        if (username.length < 3) {
            usernameInput.setCustomValidity('El usuario debe tener al menos 3 caracteres.');
            usernameInput.reportValidity();
            return;
        }

        if (password.length < 6) {
            passwordInput.setCustomValidity('La contraseña debe tener al menos 6 caracteres.');
            passwordInput.reportValidity();
            return;
        }

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Guardar el estado de la sesión
            sessionStorage.setItem('adminLoggedIn', 'true');
            
            // Redirigir al panel
            window.location.href = 'panel.html';
        } else {
            // Credenciales incorrectas: mostrar mensaje y limpiar contraseña
            passwordInput.value = '';
            passwordInput.setCustomValidity('Credenciales incorrectas');
            passwordInput.reportValidity();
        }
    });
});