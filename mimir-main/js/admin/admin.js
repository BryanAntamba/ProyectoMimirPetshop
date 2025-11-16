document.addEventListener('DOMContentLoaded', () => {
    // 🔹 Verificar si el admin está logueado
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // ======================
    // SECCIÓN CLIENTES
    // ======================
    const clientesTableBody = document.getElementById('clientesTableBody');
    const btnAddCliente = document.getElementById('btnAddCliente');
    const clienteModal = document.getElementById('clienteModal');
    const clienteForm = document.getElementById('clienteForm');
    const modalClose = document.querySelector('.close');
    const btnLogout = document.getElementById('btnLogout');

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [
        { id: 1, nombre: 'Juan Pérez', email: 'juan@mail.com', telefono: '123-456-789' },
        { id: 2, nombre: 'María García', email: 'maria@mail.com', telefono: '987-654-321' }
    ];

    function mostrarClientes() {
        clientesTableBody.innerHTML = '';
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefono}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarCliente(${cliente.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                </td>
            `;
            clientesTableBody.appendChild(row);
        });
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }

    btnAddCliente.addEventListener('click', () => {
        clienteForm.reset();
        document.getElementById('clienteId').value = '';
        document.getElementById('modalTitle').textContent = 'Agregar Cliente';
        clienteModal.style.display = 'block';
    });

    modalClose.addEventListener('click', () => clienteModal.style.display = 'none');
    window.onclick = e => { if (e.target === clienteModal) clienteModal.style.display = 'none'; };

    clienteForm.addEventListener('submit', e => {
        e.preventDefault();
        const clienteId = document.getElementById('clienteId').value;
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono');

        // Clear previous custom validity
        nombreInput.setCustomValidity('');
        emailInput.setCustomValidity('');
        telefonoInput.setCustomValidity('');

        const nameRegex = /^[A-Za-zÀ-ÿ\s]{3,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const phoneRegex = /^\d{10}$/;

        // Validaciones con enfoque al primer inválido
        if (!nameRegex.test(nombreInput.value.trim())) {
            nombreInput.setCustomValidity('Nombre inválido: sólo letras y espacios (mín. 3 caracteres).');
            nombreInput.reportValidity();
            nombreInput.focus();
            return;
        }

        if (!emailRegex.test(emailInput.value.trim())) {
            emailInput.setCustomValidity('Introduce un correo electrónico válido (ej: user@dominio.com).');
            emailInput.reportValidity();
            emailInput.focus();
            return;
        }

        if (!phoneRegex.test(telefonoInput.value.trim())) {
            telefonoInput.setCustomValidity('Teléfono inválido: debe contener exactamente 10 dígitos.');
            telefonoInput.reportValidity();
            telefonoInput.focus();
            return;
        }

        const cliente = {
            nombre: nombreInput.value.trim(),
            email: emailInput.value.trim(),
            telefono: telefonoInput.value.trim()
        };
        if (clienteId) {
            cliente.id = parseInt(clienteId);
            const index = clientes.findIndex(c => c.id === cliente.id);
            clientes[index] = cliente;
        } else {
            cliente.id = clientes.length ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
            clientes.push(cliente);
        }
        mostrarClientes();
        clienteModal.style.display = 'none';
    });

    // Enforce digits-only for telefono while typing
    const telefonoField = document.getElementById('telefono');
    if (telefonoField) {
        telefonoField.addEventListener('input', () => {
            telefonoField.value = telefonoField.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }

    window.editarCliente = id => {
        const cliente = clientes.find(c => c.id === id);
        if (cliente) {
            document.getElementById('clienteId').value = cliente.id;
            document.getElementById('nombre').value = cliente.nombre;
            document.getElementById('email').value = cliente.email;
            document.getElementById('telefono').value = cliente.telefono;
            document.getElementById('modalTitle').textContent = 'Editar Cliente';
            clienteModal.style.display = 'block';
        }
    };

    window.eliminarCliente = id => {
        if (confirm('¿Eliminar este cliente?')) {
            clientes = clientes.filter(c => c.id !== id);
            mostrarClientes();
        }
    };

    // ======================
    // SECCIÓN PRODUCTOS
    // ======================
    const productosTableBody = document.getElementById('productosTableBody');
    const btnAddProducto = document.getElementById('btnAddProducto');
    const productoModal = document.getElementById('productoModal');
    const productoForm = document.getElementById('productoForm');
    const modalCloseProducto = document.querySelector('.close-producto');

    let productos = JSON.parse(localStorage.getItem('productos')) || [
        { id: 1, nombre: 'Croquetas Premium', precio: 15.99, categoria: 'Alimento' },
        { id: 2, nombre: 'Collar Antipulgas', precio: 8.5, categoria: 'Accesorios' }
    ];

    function mostrarProductos() {
        productosTableBody.innerHTML = '';
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${producto.categoria}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarProducto(${producto.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                </td>
            `;
            productosTableBody.appendChild(row);
        });
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    btnAddProducto.addEventListener('click', () => {
        productoForm.reset();
        document.getElementById('productoId').value = '';
        document.getElementById('modalTitleProducto').textContent = 'Agregar Producto';
        productoModal.style.display = 'block';
    });

    modalCloseProducto.addEventListener('click', () => productoModal.style.display = 'none');
    window.onclick = e => { if (e.target === productoModal) productoModal.style.display = 'none'; };

    productoForm.addEventListener('submit', e => {
        e.preventDefault();
        const productoId = document.getElementById('productoId').value;
        const nombreProductoInput = document.getElementById('nombreProducto');
        const precioProductoInput = document.getElementById('precioProducto');
        const categoriaProductoInput = document.getElementById('categoriaProducto');

        // Clear previous custom validity
        nombreProductoInput.setCustomValidity('');
        precioProductoInput.setCustomValidity('');
        categoriaProductoInput.setCustomValidity('');

        const prodNameRegex = /^[A-Za-zÀ-ÿ\s]{2,}$/;

        if (!prodNameRegex.test(nombreProductoInput.value.trim())) {
            nombreProductoInput.setCustomValidity('Nombre inválido: sólo letras y espacios (mín. 2 caracteres).');
            nombreProductoInput.reportValidity();
            nombreProductoInput.focus();
            return;
        }

        const precioVal = parseFloat(precioProductoInput.value);
        if (isNaN(precioVal) || precioVal <= 0) {
            precioProductoInput.setCustomValidity('Introduzca un precio válido mayor que 0.');
            precioProductoInput.reportValidity();
            precioProductoInput.focus();
            return;
        }

        if (!categoriaProductoInput.value || categoriaProductoInput.value.trim() === '') {
            categoriaProductoInput.setCustomValidity('Seleccione una categoría.');
            categoriaProductoInput.reportValidity();
            categoriaProductoInput.focus();
            return;
        }

        const producto = {
            nombre: nombreProductoInput.value.trim(),
            precio: precioVal,
            categoria: categoriaProductoInput.value.trim()
        };
        if (productoId) {
            producto.id = parseInt(productoId);
            const index = productos.findIndex(p => p.id === producto.id);
            productos[index] = producto;
        } else {
            producto.id = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
            productos.push(producto);
        }
        mostrarProductos();
        productoModal.style.display = 'none';
    });

    window.editarProducto = id => {
        const producto = productos.find(p => p.id === id);
        if (producto) {
            document.getElementById('productoId').value = producto.id;
            document.getElementById('nombreProducto').value = producto.nombre;
            document.getElementById('precioProducto').value = producto.precio;
            document.getElementById('categoriaProducto').value = producto.categoria;
            document.getElementById('modalTitleProducto').textContent = 'Editar Producto';
            productoModal.style.display = 'block';
        }
    };

    window.eliminarProducto = id => {
        if (confirm('¿Eliminar este producto?')) {
            productos = productos.filter(p => p.id !== id);
            mostrarProductos();
        }
    };

    // ======================
    // CAMBIO DE TABS
    // ======================
    const tabClientes = document.getElementById('tabClientes');
    const tabProductos = document.getElementById('tabProductos');
    const clientesSection = document.getElementById('clientesSection');
    const productosSection = document.getElementById('productosSection');

    tabClientes.addEventListener('click', () => {
        tabClientes.classList.add('active');
        tabProductos.classList.remove('active');
        clientesSection.classList.add('active');
        productosSection.classList.remove('active');
    });

    tabProductos.addEventListener('click', () => {
        tabProductos.classList.add('active');
        tabClientes.classList.remove('active');
        productosSection.classList.add('active');
        clientesSection.classList.remove('active');
    });

    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    });

    // Inicializar tablas
    mostrarClientes();
    mostrarProductos();
});
