
// login.js
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btnSubmit = e.target.querySelector('.btn-login'); 

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            
           
            guardarSesion(data);
            
           
            if (data.rolId === 1) {
                window.location.href = './admin-dashboard.html';
            } else {
                window.location.href = './index.html';
            }
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error al conectar con Spring:', error);
        alert('Error al conectar con el servidor');
    }
});