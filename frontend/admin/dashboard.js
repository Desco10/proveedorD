

if (!localStorage.getItem("adminLogged")) {
  window.location.href = "/admin/login.html";
}


const API_ADMIN = "/api/admin";

// ===============================
// RESUMEN
// ===============================
async function cargarResumen() {
  const res = await fetch(`${API_ADMIN}/dashboard/resumen`);
  const data = await res.json();

  document.getElementById("carritosHoy").textContent = data.carritos_hoy;
  document.getElementById("totalVendido").textContent = "$" + data.total_vendido;
  document.getElementById("carritosActivos").textContent = data.carritos_activos;
  document.getElementById("carritosAbandonados").textContent = data.carritos_abandonados;
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminLogged");
  window.location.href = "/admin/login.html";
});

// ===============================
// LISTAR CARRITOS
// ===============================
async function cargarCarritos() {
  const res = await fetch(`${API_ADMIN}/carritos`);
  const data = await res.json();

  const tbody = document.getElementById("tablaCarritos");
  tbody.innerHTML = "";

  data.carritos.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.cliente_id}</td>
      <td>
  <span class="estado-cliente">${c.estado}</span>
</td>

<td>
  <select
    class="estado-admin"
    data-id="${c.id}"
    onchange="cambiarEstadoAdmin(this)"
  >
    <option value="abierto" ${c.estado_admin === "abierto" ? "selected" : ""}>Abierto</option>
    <option value="en_proceso" ${c.estado_admin === "en_proceso" ? "selected" : ""}>En proceso</option>
    <option value="cerrado" ${c.estado_admin === "cerrado" ? "selected" : ""}>Cerrado</option>
    <option value="cancelado" ${c.estado_admin === "cancelado" ? "selected" : ""}>Cancelado</option>
  </select>
</td>


      <td>$${c.total}</td>
      <td>${new Date(c.created_at).toLocaleString()}</td>
      <td>
        <button onclick="verDetalle(${c.id})">Ver</button>
        <button onclick="contactarCliente(${c.id}, ${c.cliente_id})">
  WhatsApp
</button>

      </td>
    `;

    tbody.appendChild(tr);
  });
}

setInterval(cargarResumen, 30000);

// ===============================
// SELECT HELPER
// ===============================
function opcionEstado(valor, actual) {
  return `<option value="${valor}" ${valor === actual ? "selected" : ""}>
    ${valor.replace("_", " ").toUpperCase()}
  </option>`;
}

// ===============================
// CAMBIAR ESTADO ADMIN
// ===============================
async function cambiarEstadoAdmin(select) {
  const carritoId = select.dataset.id;
  const nuevoEstado = select.value;

  try {
    const res = await fetch(`/api/admin/carritos/${carritoId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const data = await res.json();

    if (!data.ok) {
      alert("Error al actualizar estado");
      return;
    }

    // aplicar color sin recargar tabla
    select.className = "estado-admin " + nuevoEstado;

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
}


// ===============================
// ===============================
// DETALLE DE CARRITO (ADMIN)
// ===============================
// DETALLE DE CARRITO (ADMIN)
// ===============================
async function verDetalle(id) {
  const res = await fetch(`/api/admin/carritos/${id}/detalle`);
  const data = await res.json();

  if (!data.ok) {
    alert("No se pudo cargar el detalle del carrito");
    return;
  }

  // ID carrito
  document.getElementById("detalleCarritoId").textContent = id;

  const tbody = document.getElementById("detalleItems");
  tbody.innerHTML = "";

  let total = 0;

  data.items.forEach(item => {
    total += Number(item.subtotal);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nombre_producto}</td>
      <td>${item.cantidad}</td>
      <td>$${item.subtotal}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("detalleTotal").textContent = `$${total.toFixed(2)}`;

  // Mostrar modal
  document.getElementById("modalDetalle").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modalDetalle").classList.add("hidden");
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  cargarResumen();
  cargarCarritos();
});






function contactarCliente(carritoId, clienteId) {
  const mensaje = encodeURIComponent(
    `Hola 👋 Tienes un carrito pendiente en DescoApp.\nCarrito #${carritoId}\n¿Deseas finalizar tu pedido?`
  );

  // aquí luego usas teléfono real del cliente
  const telefono = "57XXXXXXXXXX";

  window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
}

function logout() {
  localStorage.removeItem("adminAuth");
  window.location.href = "/admin/login.html";
}
