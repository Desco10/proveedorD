let IDS_ABANDONADOS = [];
let IDS_PENDIENTES = [];
let CARROS_TODOS = [];

if (!localStorage.getItem("adminLogged")) {
  window.location.href = "/admin/login.html";
}

const API_ADMIN = "/api/admin";

// ===============================
// LOGOUT
// ===============================
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

  renderCarritos(CARROS_TODOS);

  recalcularMetricasDesdeCarritos(); // ← CLAVE
}


function renderCarritos(lista) {
  const tbody = document.getElementById("tablaCarritos");
  tbody.innerHTML = "";

  if (!lista.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:15px">
          No hay carritos para este filtro
        </td>
      </tr>
    `;
    return;
  }

  lista.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${c.id}</td>
      <td>
        <strong>${c.nombre} ${c.apellido}</strong><br>
        <small>${c.telefono || "Sin teléfono"}</small>
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
            `<option value="${e}" ${e === c.estado_admin ? "selected" : ""}>${e}</option>`
          ).join("")}
        </select>
      </td>
      <td>$${Number(c.total).toLocaleString("es-CO")}</td>
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
// CAMBIAR ESTADO ADMIN (FIX REAL)
// ===============================
async function cambiarEstado(carritoId, nuevoEstado) {
  try {
    const res = await fetch(`/api/admin/carritos/${carritoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado_admin: nuevoEstado })
    });

    const data = await res.json();

    if (!data.ok) {
      alert("Error al actualizar estado");
      return;
    }

  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
  
  await cargarCarritos();

}

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


function recalcularMetricasDesdeCarritos() {
  const ahora = Date.now();

  let total = CARROS_TODOS.length;
  let enviados = 0;
  let abandonados = 0;
  let pendientes = 0;

  CARROS_TODOS.forEach(c => {
    const horas =
      (ahora - new Date(c.created_at).getTime()) / (1000 * 60 * 60);

    if (c.estado_admin === "enviado" || c.estado_admin === "cerrado") {
      enviados++;
    }

    if (c.estado_admin === "abierto" && horas >= 12) {
      abandonados++;
    }

    if (c.estado_admin === "abierto" && horas < 8) {
      pendientes++;
    }
  });

  document.getElementById("m-total").textContent = total;
  document.getElementById("m-enviados").textContent = enviados;
  document.getElementById("m-abandonados").textContent = abandonados;
  document.getElementById("m-pendientes").textContent = pendientes;
}


// ===============================
// DETALLE DE CARRITO
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

  if (!data.items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center">Sin productos</td>
      </tr>
    `;
  } else {
    data.items.forEach(i => {
      tbody.innerHTML += `
        <tr>
          <td>${i.nombre_producto}</td>
          <td>${i.cantidad}</td>
          <td>$${Number(i.subtotal).toLocaleString("es-CO")}</td>
        </tr>
      `;
    });
  }

  document.getElementById("modalDetalle").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modalDetalle").classList.add("hidden");
}

// ===============================
// WHATSAPP
// ===============================
function contactarCliente(carritoId, telefono, nombre) {
  if (!telefono) {
    alert("Este cliente no tiene teléfono registrado");
    return;
  }

  const mensaje = encodeURIComponent(
    `Hola ${nombre}, tienes un carrito pendiente en DescoApp (#${carritoId}). ¿Deseas finalizar tu pedido?`
  );

  window.open(`https://wa.me/57${telefono}?text=${mensaje}`, "_blank");
}

// ===============================
// FILTROS
// ===============================
function mostrarTodos() {
  renderCarritos(CARROS_TODOS);
}

function mostrarEnviados() {
  renderCarritos(
    CARROS_TODOS.filter(c =>
      c.estado_admin === "enviado" || c.estado_admin === "cerrado"
    )
  );
}

function mostrarPendientes() {
  const ahora = Date.now();
  renderCarritos(
    CARROS_TODOS.filter(c => {
      if (c.estado_admin !== "abierto") return false;
      const horas = (ahora - new Date(c.created_at)) / 36e5;
      return horas < 8;
    })
  );
}

function mostrarAbandonados() {
  const ahora = Date.now();
  renderCarritos(
    CARROS_TODOS.filter(c => {
      if (c.estado_admin !== "abierto") return false;
      const horas = (ahora - new Date(c.created_at)) / 36e5;
      return horas >= 12;
    })
  );
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  cargarCarritos();
});
