// Obtener parámetros de URL
const params = new URLSearchParams(window.location.search);
const idProducto = params.get("id");

// Actualizar og:url dinámico
document.querySelector("#og-url").setAttribute("content", window.location.href);

// ----------------------------
// Cargar producto desde JSON
// ----------------------------
async function cargarProducto() {
  try {
    const res = await fetch("/data/productos_proveedores.json");
    const productos = await res.json();

    const producto = productos.find(p => String(p.id) === String(idProducto));

    if (!producto) {
      alert("Producto no encontrado");
      return;
    }

    mostrarProducto(producto);

  } catch (err) {
    console.error("Error cargando producto:", err);
  }
}

// ----------------------------
// RENDERIZAR PRODUCTO
// ----------------------------
function mostrarProducto(p) {
  document.getElementById("producto-nombre").innerText = p.nombre;
  document.getElementById("producto-descripcion").innerText = p.descripcion;
  document.getElementById("producto-precio").innerText = p.precio;

  document.getElementById("producto-imagen").src = p.imagen;

  document.getElementById("proveedor-nombre").innerText = p.proveedorNombre || "";
  document.getElementById("proveedor-logo").src = p.proveedorLogo || "/img/logo.png";

  // botón comprar
  document.getElementById("btn-comprar").onclick = () => comprarProducto(p.id);

  // botón flotante
  document.getElementById("btn-ws-floating").onclick = () => comprarProducto(p.id);
}

// Ejecutar
cargarProducto();
