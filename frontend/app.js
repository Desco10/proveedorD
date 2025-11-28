document.addEventListener("DOMContentLoaded", () => {
  const proveedoresContainer = document.getElementById("proveedores");
  const productosContainer = document.getElementById("productos");
  const paginacionContainer = document.getElementById("paginacion");
  const seccionProveedores = document.getElementById("seccion-proveedores");
  const seccionProductos = document.getElementById("seccion-productos");
  const carrusel = document.querySelector(".carousel-inner");
  const btnVolver = document.getElementById("volverProveedores");

  let productos = [];
  let paginaActual = 1;
  const productosPorPagina = 12;

  // --- Cargar proveedores ---
  fetch("data/proveedores.json")
    .then((res) => res.json())
    .then((proveedores) => {
      proveedores.forEach((prov) => {
        const card = document.createElement("div");
        card.classList.add("proveedor-card");
        card.innerHTML = `
          <img src="${prov.logo}" alt="${prov.nombre}" class="proveedor-logo">
          <h3>${prov.nombre}</h3>
          <p>${prov.descripcion}</p>
        `;
        card.addEventListener("click", () => mostrarProductosProveedor(prov));
        proveedoresContainer.appendChild(card);
      });

      // Cargar ofertas destacadas al carrusel
      cargarCarrusel(proveedores);
    })
    .catch((err) => console.error("Error al cargar proveedores:", err));

  // --- Mostrar productos por proveedor ---
  function mostrarProductosProveedor(proveedor) {
    seccionProveedores.style.display = "none";
    seccionProductos.style.display = "block";
    btnVolver.style.display = "block";

    fetch(`data/productos_proveedor_${proveedor.id}.json`)
      .then((res) => res.json())
      .then((data) => {
        productos = data;
        paginaActual = 1;
        renderizarProductos();
      })
      .catch((err) => console.error("Error al cargar productos:", err));
  }

  // --- Renderizar productos por página ---
  function renderizarProductos() {
    productosContainer.innerHTML = "";
    paginacionContainer.innerHTML = "";

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    productosPagina.forEach((prod) => {
      const card = document.createElement("div");
      card.classList.add("producto-card");
      card.innerHTML = `
        <img src="${prod.imagen}" alt="${prod.nombre}" class="producto-img">
        <h4>${prod.nombre}</h4>
        <p class="precio">${prod.precio}</p>
        <button class="btn-comprar" data-nombre="${prod.nombre}" data-precio="${prod.precio}">Comprar</button>
      `;
      productosContainer.appendChild(card);
    });

    // Botones de paginación
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);

    if (paginaActual > 1) {
      const btnAnterior = document.createElement("button");
      btnAnterior.textContent = "← Anterior";
      btnAnterior.classList.add("btn-paginacion");
      btnAnterior.onclick = () => {
        paginaActual--;
        renderizarProductos();
        scrollToTop();
      };
      paginacionContainer.appendChild(btnAnterior);
    }

    if (paginaActual < totalPaginas) {
      const btnSiguiente = document.createElement("button");
      btnSiguiente.textContent = "Siguiente →";
      btnSiguiente.classList.add("btn-paginacion");
      btnSiguiente.onclick = () => {
        paginaActual++;
        renderizarProductos();
        scrollToTop();
      };
      paginacionContainer.appendChild(btnSiguiente);
    }

    // Acción de compra → WhatsApp
    document.querySelectorAll(".btn-comprar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const nombre = e.target.getAttribute("data-nombre");
        const precio = e.target.getAttribute("data-precio");
        const mensaje = `👋 Hola, estoy interesado en comprar *${nombre}* por ${precio}. ¿Está disponible?`;
        const url = `https://wa.me/573001112233?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
      });
    });
  }

  // --- Volver a la lista de proveedores ---
  btnVolver.addEventListener("click", () => {
    seccionProveedores.style.display = "flex";
    seccionProductos.style.display = "none";
    btnVolver.style.display = "none";
  });

  // --- Scroll al inicio ---
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- Carrusel de ofertas ---
  function cargarCarrusel(proveedores) {
    const ofertas = [
      {
        imagen: "img/oferta1.jpg",
        titulo: "Descuentos del 20% en productos Savital",
        texto: "Aprovecha las promociones del mes."
      },
      {
        imagen: "img/oferta2.jpg",
        titulo: "Promoción Advil Gripa",
        texto: "Lleva 3 y paga 2."
      },
      {
        imagen: "img/oferta3.jpg",
        titulo: "Nuevos productos Bonfiest",
        texto: "Más bienestar, menos malestar."
      }
    ];

    ofertas.forEach((oferta, i) => {
      const item = document.createElement("div");
      item.classList.add("carousel-item");
      if (i === 0) item.classList.add("active");

      item.innerHTML = `
        <img src="${oferta.imagen}" class="d-block w-100" alt="${oferta.titulo}">
        <div class="carousel-caption d-none d-md-block">
          <h5>${oferta.titulo}</h5>
          <p>${oferta.texto}</p>
        </div>
      `;
      carrusel.appendChild(item);
    });
  }
});
