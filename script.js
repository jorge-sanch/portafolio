// script.js
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'cyberpunk') {
        body.classList.add('cyberpunk-mode');
        themeToggle.title = 'Activar modo Claro';
    }

    // Función para cambiar el tema
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('cyberpunk-mode');
        
        // Actualizar el atributo title del botón
        const isCyberpunk = body.classList.contains('cyberpunk-mode');
        themeToggle.title = isCyberpunk ? 'Activar modo Claro' : 'Activar modo Cyberpunk';
        
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', isCyberpunk ? 'cyberpunk' : 'light');
    });

    // Efecto de hover mejorado para el botón power
    themeToggle.addEventListener('mouseenter', function() {
        if (!body.classList.contains('cyberpunk-mode')) {
            this.style.transform = 'scale(1.1)';
        }
    });

    themeToggle.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});



//-----------------------------Email-------------------------------------------------
// Inicializar EmailJS con tu Public Key
emailjs.init("zWzf0U5QIYxE7Cg5C"); // Reemplaza con tu Public Key

// Función para enviar el email
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevenir el envío normal del formulario
            
            // Mostrar indicador de carga (opcional)
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            // Enviar el formulario usando EmailJS
            emailjs.sendForm(
                'service_lpn3vqi',     // Reemplaza con tu Service ID
                'template_7fwwnn5',    // Reemplaza con tu Template ID
                this
            ).then(function() {
                // Éxito
                alert('¡Mensaje enviado con éxito! Te contactaré pronto.');
                contactForm.reset(); // Limpiar el formulario
            }, function(error) {
                // Error
                console.error('Error:', error);
                alert('Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o contáctame directamente por email.');
            }).finally(function() {
                // Restaurar el botón
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});