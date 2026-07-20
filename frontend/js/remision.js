/* ==========================================
   REMISION DESCOAPP
   Generador PNG de remisión de compra
========================================== */


function generarNumeroRemision(){

    let numero = localStorage.getItem("numero_remision") || 0;

    numero++;

    localStorage.setItem(
        "numero_remision",
        numero
    );

    return "REM-" + String(numero).padStart(6,"0");
}



async function generarRemisionPNG(datos){


    const numero = generarNumeroRemision();


    const contenedor = document.createElement("div");

    contenedor.id="remisionTemporal";


    contenedor.style.width="420px";
    contenedor.style.padding="25px";
    contenedor.style.background="#fff";
    contenedor.style.fontFamily="Arial";
    contenedor.style.color="#222";


    let productosHTML="";


    datos.proveedores.forEach(prov=>{


        productosHTML += `
        <h3>${prov.proveedorNombre}</h3>
        `;


        prov.productos.forEach(p=>{


            productosHTML += `

            <div style="
            display:flex;
            justify-content:space-between;
            border-bottom:1px solid #ddd;
            padding:5px 0;
            ">

            <span>
            ${p.nombre} x${p.cantidad}
            </span>

            <strong>
            ${p.subtotalProducto}
            </strong>

            </div>

            `;


        });


    });



    contenedor.innerHTML=`

    <div style="text-align:center">

        <img 
        src="/img/plataforma/newdescoappsinf.png"
        style="width:180px"
        >

        <h2>
        REMISIÓN DE COMPRA
        </h2>


        <p>
        ${numero}
        </p>


        <p>
        ${new Date().toLocaleString()}
        </p>


    </div>


    <hr>


    <h3>CLIENTE</h3>

    <p>
    ${datos.cliente.nombre}
    </p>

    <p>
    Cédula:
    ${datos.cliente.cedula}
    </p>

    <p>
    Tel:
    ${datos.cliente.telefono}
    </p>


    <hr>


    <h3>PRODUCTOS</h3>

    ${productosHTML}


    <hr>


    <h2 style="text-align:right">

    TOTAL:
    ${formatearPrecio(datos.total)}

    </h2>


    <br>

    <p style="text-align:center">
    Gracias por comprar en DESCOAPP
    </p>


    `;



    document.body.appendChild(contenedor);



    const canvas = await html2canvas(contenedor);



    const imagen = canvas.toDataURL(
        "image/png"
    );



    const enlace=document.createElement("a");

    enlace.href=imagen;

    enlace.download=
    numero+".png";


    enlace.click();



    contenedor.remove();


}