document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productIndexInput = document.getElementById('product-index');
    const nameInput = document.getElementById('name');
    const brandInput = document.getElementById('brand');
    const priceInput = document.getElementById('price');
    const stockInput = document.getElementById('stock');
    const codeInput = document.getElementById('code');
    const manageProductTableBody = document.querySelector('#manage-product-table tbody');

    // Cargar productos desde localStorage
    let products = JSON.parse(localStorage.getItem('products')) || [];

    // Manejar el envío del formulario
    productForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const product = {
            name: nameInput.value.trim(),
            brand: brandInput.value.trim(),
            price: parseFloat(priceInput.value),
            stock: parseInt(stockInput.value, 10),
            code: codeInput.value.trim()
        };

        const index = productIndexInput.value;
        if (index) {
            // Modificar producto existente
            products[index] = product;
        } else {
            // Agregar nuevo producto
            products.push(product);
        }

        localStorage.setItem('products', JSON.stringify(products));
        resetForm();
        updateManageProductTable();
    });

    // Manejar edición y eliminación de productos
    manageProductTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-product-btn')) {
            const index = event.target.getAttribute('data-index');
            const product = products[index];
            productIndexInput.value = index;
            nameInput.value = product.name;
            brandInput.value = product.brand;
            priceInput.value = product.price;
            stockInput.value = product.stock;
            codeInput.value = product.code;
        } else if (event.target.classList.contains('delete-product-btn')) {
            const index = event.target.getAttribute('data-index');
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            updateManageProductTable();
        }
    });

    function resetForm() {
        productIndexInput.value = '';
        nameInput.value = '';
        brandInput.value = '';
        priceInput.value = '';
        stockInput.value = '';
        codeInput.value = '';
    }

    function updateManageProductTable() {
        manageProductTableBody.innerHTML = '';
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${product.code}</td>
                <td>
                    <button class="edit-product-btn" data-index="${index}">Editar</button>
                    <button class="delete-product-btn" data-index="${index}">Eliminar</button>
                </td>
            `;
            manageProductTableBody.appendChild(row);
        });
    }

    updateManageProductTable();
});
