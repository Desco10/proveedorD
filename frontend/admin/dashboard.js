
let IDS_ABANDONADOS = [];
let IDS_PENDIENTES = [];
let CARROS_TODOS = [];



if (!localStorage.getItem("adminLogged")) {
  window.location.href = "/admin/login.html";
}

const API_ADMIN = "/api/admin";

// ===============================
// RESUMEN (DESACTIVADO)
// ===============================
// ⚠️ Este resumen usaba IDs que ya no existen en el HTML
// Se deja comentado para no romper nada ni perder lógica futura

/*
async function cargarResumen() {
  const res = await fetch(`${API_ADMIN}/dashboard/resumen`);
  const data = await res.json();

  document.getElementById("carritosHoy").textContent = data.carritos_hoy;
  document.getElementById("totalVendido").textContent = "$" + data.total_vendido;
  document.getElementById("carritosActivos").textContent = data.carritos_activos;
  document.getElementById("carritosAbandonados").textContent = data.carritos_abandonados;
}

setInterval(cargarResumen, 30000);
*/

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

  CARROS_TODOS = data.carritos;


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
          ${["abierto","en_proceso","enviado","cerrado","cancelado"].map(e =>
            `<option value="${e}" ${e === c.estado_admin ? "selected" : ""}>
              ${e}
            </option>`
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



async function cargarCarritosFiltrados(tipo) {
  const res = await fetch(`${API_ADMIN}/carritos`);
  const data = await res.json();

  const ahora = Date.now();
  const tbody = document.getElementById("tablaCarritos");
  tbody.innerHTML = "";

  data.carritos.forEach(c => {

    const horas =
      (ahora - new Date(c.created_at).getTime()) / (1000 * 60 * 60);

    let mostrar = false;

    if (tipo === "todos") mostrar = true;

    if (tipo === "enviados") {
      mostrar = c.estado_admin === "enviado" || c.estado_admin === "cerrado";
    }

    if (tipo === "pendientes") {
      mostrar = c.estado_admin === "abierto" && horas < 8;
    }

    if (tipo === "abandonados") {
      mostrar = c.estado_admin === "abierto" && horas >= 12;
    }

    if (!mostrar) return;

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
          ${["abierto","en_proceso","enviado","cerrado","cancelado"].map(e =>
            `<option value="${e}" ${e === c.estado_admin ? "selected" : ""}>
              ${e}
            </option>`
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


function renderTablaCarritos(lista) {
  const tbody = document.getElementById("tablaCarritos");
  tbody.innerHTML = "";

  lista.forEach(c => {
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
          ${["abierto","en_proceso","enviado","cerrado","cancelado"].map(e =>
            `<option value="${e}" ${e === c.estado_admin ? "selected" : ""}>
              ${e}
            </option>`
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

    select.className = "estado-admin " + nuevoEstado;

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
}

// ===============================
// DETALLE DE CARRITO (ADMIN)
// ===============================
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

  if (!data.items || data.items.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="3" style="text-align:center; padding:10px;">
        Este carrito no tiene productos
      </td>
    `;
    tbody.appendChild(tr);
  } else {
    data.items.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i.nombre_producto}</td>
        <td>${i.cantidad}</td>
        <td>$${Number(i.subtotal).toLocaleString("es-CO")}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("modalDetalle").classList.remove("hidden");
}


function cerrarModal() {
  document.getElementById("modalDetalle").classList.add("hidden");
}

// ===============================
// MÉTRICAS VISUALES (ACTIVAS)
// ===============================
async function cargarMetricas() {
  const res = await fetch("/api/admin/dashboard/metricas");
  const data = await res.json();

  if (!data.ok) return;

  const { metricas } = data;

  document.getElementById("m-total").textContent = metricas.total;
  document.getElementById("m-enviados").textContent = metricas.enviados;
  document.getElementById("m-abandonados").textContent = metricas.abandonados;
  document.getElementById("m-pendientes").textContent = metricas.pendientes;
}



// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  cargarMetricas();
  cargarCarritos();
});

// ===============================
// WHATSAPP
// ===============================
function contactarCliente(carritoId, telefono, nombre) {
  if (!telefono) {
    alert("Este cliente no tiene teléfono registrado");
    return;
  }

  const mensaje = encodeURIComponent(
    `Hola ${nombre}\n` +
    `Tienes un carrito pendiente en DescoApp (Carrito #${carritoId}).\n` +
    `¿Deseas finalizar tu pedido?`
  );

  window.open(`https://wa.me/57${telefono}?text=${mensaje}`, "_blank");
}


function mostrarTodos() {
  renderTablaCarritos(CARROS_TODOS);
}

function mostrarEnviados() {
  renderTablaCarritos(
    CARROS_TODOS.filter(c =>
      c.estado_admin === "enviado" || c.estado_admin === "cerrado"
    )
  );
}

function mostrarPendientes() {
  const ahora = Date.now();

  renderTablaCarritos(
    CARROS_TODOS.filter(c => {
      if (c.estado_admin !== "abierto") return false;

      const horas =
        (ahora - new Date(c.created_at).getTime()) / (1000 * 60 * 60);

      return horas < 8;
    })
  );
}

function mostrarAbandonados() {
  const ahora = Date.now();

  renderTablaCarritos(
    CARROS_TODOS.filter(c => {
      if (c.estado_admin !== "abierto") return false;

      const horas =
        (ahora - new Date(c.created_at).getTime()) / (1000 * 60 * 60);

      return horas >= 12;
    })
  );
}
