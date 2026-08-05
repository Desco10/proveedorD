/*
=========================================================
 DescoApp
 Biblioteca de Mensajes Comerciales

 Archivo:
 frontend/js/mensajesComerciales.js

 Objetivo:
 Centralizar todos los mensajes comerciales que utiliza
 DescoApp.

 Este archivo será utilizado por:

 ✔ Dashboard
 ✔ Agente IA (n8n)
 ✔ Automatizaciones futuras

 NO contiene lógica de negocio.
 Solo construye mensajes.
=========================================================
*/

const MensajesComerciales = {

    // =====================================================
    // CARRITO ABANDONADO
    // =====================================================
    carritoAbandonado(nombre, urlRemision) {

        return `Hola *${nombre}*. 👋

Gracias por visitar *DescoApp*.

Mientras preparabas tu pedido generamos un resumen con los productos que seleccionaste.

🧾 *Así se vería tu pedido:*

${urlRemision}

Si deseas recibir este pedido tal como aparece en la remisión, solo responde este mensaje y con gusto continuaremos el proceso.

Si prefieres realizar un pedido diferente, también estaremos encantados de ayudarte a crear uno nuevo.

🤝 Estamos atentos para asesorarte.`;
    },

    // =====================================================
    // PEDIDO ENVIADO
    // =====================================================
    pedidoEnviado(nombre, urlRemision) {

        return `Hola *${nombre}*. 👋

Gracias por realizar tu pedido en *DescoApp*.

🧾 *Tu remisión ya se encuentra disponible:*

${urlRemision}

Si posteriormente deseas realizar un nuevo pedido o necesitas asesoría sobre otros productos, estaremos encantados de ayudarte.

⭐ Gracias por confiar en *DescoApp*.`;
    },

    // =====================================================
    // CLIENTE INACTIVO
    // =====================================================
    clienteInactivo(nombre) {

        return `Hola *${nombre}*. 👋

Hace algunos días no hemos recibido un nuevo pedido tuyo y queremos saludarte.

Esta semana tenemos promociones y novedades que pueden ayudarte a mantener tu negocio abastecido.

Si deseas conocerlas estaremos encantados de asesorarte.

🤝 Gracias por seguir confiando en *DescoApp*.`;
    },

    // =====================================================
    // PROMOCIONES
    // =====================================================
    promociones(nombre, urlCatalogo = "") {

        return `Hola *${nombre}*. 👋

Tenemos nuevas promociones disponibles en *DescoApp*.

Creemos que varios de estos productos pueden ser de interés para tu negocio.

${urlCatalogo}

Si deseas conocer nuestras ofertas estaremos encantados de ayudarte.`;
    },

    // =====================================================
    // REPOSICIÓN DE INVENTARIO
    // =====================================================
    reposicion(nombre) {

        return `Hola *${nombre}*. 👋

Es posible que algunos productos de tus pedidos anteriores ya estén próximos a agotarse.

Si deseas realizar un nuevo pedido estaremos encantados de ayudarte.

🏪 *DescoApp* siempre está disponible para atenderte.`;
    }

};

// =====================================================
// Exportar al navegador
// =====================================================

window.MensajesComerciales = MensajesComerciales;


// =====================================================
// Obtiene automáticamente el mensaje correcto
// =====================================================
async function obtenerMensajeComercial(carrito) {

    let urlRemision = "";

    try {

        const res = await fetch(
            `/api/admin/remision-de-carrito/${carrito.id}`
        );

        const data = await res.json();

        if (data.ok) {
            urlRemision = data.url;
        }

    } catch (e) {
        console.warn("No se pudo obtener la remisión");
    }

    const nombre =
        `${carrito.nombre} ${carrito.apellido || ""}`.trim();

    // Carrito abandonado
    if (carrito.fue_abandonado == 1) {
        return MensajesComerciales.carritoAbandonado(
            nombre,
            urlRemision
        );
    }

    // Pedido enviado
    if (carrito.estado === "enviado") {
        return MensajesComerciales.pedidoEnviado(
            nombre,
            urlRemision
        );
    }

    // Carrito abierto
    return `Hola *${nombre}*. 👋

Vimos que tienes un carrito abierto en *DescoApp*.

¿Deseas finalizar este pedido o prefieres crear uno nuevo?

Estaremos atentos para ayudarte. 🤝`;

}

// Hacerla global para dashboard.js
window.obtenerMensajeComercial = obtenerMensajeComercial;