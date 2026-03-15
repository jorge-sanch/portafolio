// Este código solo corre en la página del carrito
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.querySelector('.items-lista');
    const carrito = JSON.parse(localStorage.getItem('vittalium_cart')) || [];

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
        return;
    }

    // Dibujamos cada producto guardado usando el diseño de Figma
    contenedor.innerHTML = carrito.map(item => `
        <article class="item-carrito">
            <img src="${item.img}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <div class="controles-cantidad">
                    <span>Cantidad: ${item.quantity}</span>
                </div>
            </div>
            <div class="item-precio-eliminar">
                <p class="precio-unitario">$${item.price.toFixed(2)}</p>
                <p class="precio-total">Total: $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </article>
    `).join('');
});