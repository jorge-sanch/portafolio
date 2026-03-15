document.addEventListener('DOMContentLoaded', () => {
    renderizarContenidoCarrito();
});

function renderizarContenidoCarrito() {
    const contenedor = document.getElementById('items-lista');
    const datosMem = localStorage.getItem('vittalium_cart');
    const carrito = JSON.parse(datosMem) || [];

    if (!contenedor) {
        console.error("ERROR: No se encontró el contenedor #items-lista en el HTML");
        return;
    }

    if (carrito.length === 0) {
        contenedor.innerHTML = `<p style="padding: 20px;">Tu carrito está vacío.</p>`;
        actualizarResumen(0);
        return;
    }

    // Inyectamos el HTML con los botones de control
    contenedor.innerHTML = carrito.map((item, index) => `
        <article class="item-carrito">
            <img src="${item.img}" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <div class="controles-cantidad">
                    <button class="btn-qty" onclick="actualizarCantidad(${index}, -1)">-</button>
                    <span class="qty-num">${item.quantity}</span>
                    <button class="btn-qty" onclick="actualizarCantidad(${index}, 1)">+</button>
                </div>
            </div>
            <div class="item-precio-eliminar">
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">
                <img src="/img/eliminar.png" alt="eliminar"></button>
                <p class="precio-unitario">$${item.price.toFixed(2)}</p>
                <p class="precio-total">Total: $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </article>
    `).join('');

    // Calculamos el subtotal real sumando cada producto
    const subtotalCalculado = carrito.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    actualizarResumen(subtotalCalculado);
}

function actualizarCantidad(index, cambio) {
    let carrito = JSON.parse(localStorage.getItem('vittalium_cart'));
    carrito[index].quantity += cambio;

    if (carrito[index].quantity <= 0) {
        carrito.splice(index, 1);
    }

    localStorage.setItem('vittalium_cart', JSON.stringify(carrito));
    renderizarContenidoCarrito(); // Re-renderiza todo

     if (window.actualizarContadorCarrito){
        window.actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(index) {
    // 1. Cargar los datos actuales
    let carrito = JSON.parse(localStorage.getItem('vittalium_cart')) || [];

    // 2. Eliminar el producto específico del arreglo
    carrito.splice(index, 1);

    // 3. Guardar el carrito actualizado en el "cerebro" (Storage)
    localStorage.setItem('vittalium_cart', JSON.stringify(carrito));

    // 4. Volver a dibujar la lista del carrito (lo que ves en pantalla)
    renderizarContenidoCarrito();

    // 5. ¡ESTA ES LA CLAVE! Actualizar el numerito del icono arriba
    if (window.actualizarContadorCarrito) {
        window.actualizarContadorCarrito();
    }
}

function actualizarResumen(subtotal) {
    const elSubtotal = document.getElementById('subtotal-val');
    const elTotal = document.getElementById('total-val');
    const elEnvio = document.getElementById('envio-val');
    
    if (elSubtotal && elTotal) {
        // Lógica: Envío gratis si supera los $50
        const costoEnvio = (subtotal > 50 || subtotal === 0) ? 0 : 10;
        const totalFinal = subtotal + costoEnvio;

        elSubtotal.innerText = `$${subtotal.toFixed(2)}`;
        elTotal.innerText = `$${totalFinal.toFixed(2)}`;
        if (elEnvio) {
            elEnvio.innerText = costoEnvio === 0 ? "GRATIS" : `$${costoEnvio.toFixed(2)}`;
        }
    } else {
        console.warn("No se pudieron actualizar los totales. Revisa los IDs en el HTML.");
    }
}