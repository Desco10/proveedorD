

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

  <td>
  <strong>${c.nombre} ${c.apellido}</strong><br>
  <small>${c.telefono}</small>
</td>


  <td>
    <span class="estado-cliente ${c.estado}">
      ${c.estado}
    </span>
  </td>

  <td>
    <select
      class="estado-admin ${c.estado_admin}"
      onchange="cambiarEstado(${c.id}, this.value)"
    >
      ${["abierto","en_proceso","cerrado","cancelado"].map(e =>
        `<option value="${e}" ${e === c.estado_admin ? "selected" : ""}>${e}</option>`
      ).join("")}
    </select>
  </td>

  <td>$${c.total}</td>

  <td>${new Date(c.created_at).toLocaleString()}</td>

  <td>
    <button onclick="contactarCliente(${c.id}, '${c.telefono}', '${c.nombre}')">
      WhatsApp
    </button>
    <button onclick="verDetalle(${c.id})">
      Ver
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
// VER DETALLE CARRITO (ADMIN)
async function verDetalle(id) {
  const res = await fetch(`/api/admin/carritos/${id}/detalle`);
  const data = await res.json();

  if (!data.ok) {
    alert("No se pudo cargar el detalle");
    return;
  }

  document.getElementById("detalleCarritoId").textContent = id;
  document.getElementById("detalleTotal").textContent =
    `$${Number(data.total).toLocaleString("es-CO")}`;

  const tbody = document.getElementById("detalleItems");
  tbody.innerHTML = "";

  data.items.forEach(i => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.nombre_producto}</td>
      <td>${i.cantidad}</td>
      <td>$${Number(i.subtotal).toLocaleString("es-CO")}</td>
    `;
    tbody.appendChild(tr);
  });

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






function contactarCliente(carritoId, telefono, nombre) {
  if (!telefono) {
    alert("Este cliente no tiene teléfono registrado");
    return;
  }

  const mensaje = encodeURIComponent(
    `Hola ${nombre} 👋\n` +
    `Tienes un carrito pendiente en DescoApp (Carrito #${carritoId}).\n` +
    `¿Deseas finalizar tu pedido?`
  );

  window.open(`https://wa.me/57${telefono}?text=${mensaje}`, "_blank");
}


function logout() {
  localStorage.removeItem("adminAuth");
  window.location.href = "/admin/login.html";
}
