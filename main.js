document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const productTableBody = document.querySelector('#product-table tbody');
    const cartTableBody = document.querySelector('#cart-table tbody');
    const amountPaidInput = document.getElementById('amount-paid');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const ticketOutput = document.getElementById('ticket-output');

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let cart = [];

    function updateProductTable(products) {
        productTableBody.innerHTML = '';
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.code}</td>
                <td>
                    <button class="add-to-cart-btn" data-index="${index}">Agregar al Carrito</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    }

    function updateCartTable() {
        cartTableBody.innerHTML = '';
        cart.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button class="quantity-btn quantity-decrease" data-index="${index}">-</button>
                    ${product.quantity}
                    <button class="quantity-btn quantity-increase" data-index="${index}">+</button>
                </td>
                <td>
                    <button class="remove-from-cart-btn" data-index="${index}">Eliminar</button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });
    }

    function updateTicket() {
        let total = 0;
        cart.forEach(product => {
            total += product.price * product.quantity;
        });

        let ticket = `<p><strong>Total:</strong> $${total.toFixed(2)}</p>`;
        ticket += '<h3>Detalles del Pedido:</h3>';
        ticket += '<ul>';
        cart.forEach(product => {
            ticket += `<li>${product.name} (${product.brand}) - $${product.price.toFixed(2)} x ${product.quantity}</li>`;
        });
        ticket += '</ul>';

        ticketOutput.innerHTML = ticket;
    }

    function printTicket(ticket) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Ticket</title>');
        printWindow.document.write('</head><body >');
        printWindow.document.write(ticket);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    productTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const index = event.target.getAttribute('data-index');
            const product = products[index];
            const cartProduct = cart.find(p => p.code === product.code);

            if (cartProduct) {
                cartProduct.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('products', JSON.stringify(products));
            updateCartTable();
            updateTicket();
        }
    });

    cartTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const index = event.target.getAttribute('data-index');
            cart.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            updateCartTable();
            updateTicket();
        } else if (event.target.classList.contains('quantity-decrease')) {
            const index = event.target.getAttribute('data-index');
            const cartProduct = cart[index];
            if (cartProduct.quantity > 1) {
                cartProduct.quantity--;
                const product = products.find(p => p.code === cartProduct.code);
                product.stock++;
                localStorage.setItem('products', JSON.stringify(products));
                updateCartTable();
                updateTicket();
            }
        } else if (event.target.classList.contains('quantity-increase')) {
            const index = event.target.getAttribute('data-index');
            const cartProduct = cart[index];
            const product = products.find(p => p.code === cartProduct.code);
            if (cartProduct.quantity < product.stock) {
                cartProduct.quantity++;
                product.stock--;
                localStorage.setItem('products', JSON.stringify(products));
                updateCartTable();
                updateTicket();
            } else {
                Swal.fire('Stock insuficiente', 'No hay suficiente stock para aumentar la cantidad de este producto.', 'error');
            }
        }
    });

    confirmOrderBtn.addEventListener('click', () => {
        const amountPaid = parseFloat(amountPaidInput.value);
        if (isNaN(amountPaid) || amountPaid < 0) {
            Swal.fire('Error', 'Por favor ingresa un monto válido.', 'error');
            return;
        }

        const total = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        const change = amountPaid - total;

        let ticket = `<p><strong>Total:</strong> $${total.toFixed(2)}</p>`;
        ticket += '<h3>Detalles del Pedido:</h3>';
        ticket += '<ul>';
        cart.forEach(product => {
            ticket += `<li>${product.name} (${product.brand}) - $${product.price.toFixed(2)} x ${product.quantity}</li>`;
        });
        ticket += '</ul>';
        ticket += `<p><strong>Cambio:</strong> $${change.toFixed(2)}</p>`;

        ticketOutput.innerHTML = ticket;

        Swal.fire({
            title: 'Confirmar Pedido',
            text: `¿Deseas imprimir el ticket?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, imprimir',
            cancelButtonText: 'No'
        }).then(result => {
            if (result.isConfirmed) {
                printTicket(ticket);
            }
            // Vaciar carrito después de confirmar pedido
            cart = [];
            localStorage.setItem('products', JSON.stringify(products));
            updateCartTable();
            updateTicket();
        });
    });

    searchInput.addEventListener('input', (event) => {
        const value = event.target.value.toLowerCase();
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(value) ||
            product.brand.toLowerCase().includes(value) ||
            product.code.toLowerCase().includes(value)
        );
        updateProductTable(filteredProducts);
    });

    updateProductTable(products);
    updateCartTable();
    updateTicket();
});
