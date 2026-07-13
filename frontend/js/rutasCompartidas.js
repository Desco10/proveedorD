/*=========================================================
    DESCOAPP
    RUTAS COMPARTIDAS
    FASE 2 - PASO 1
=========================================================*/

const RutasCompartidas = (() => {

    function obtenerSlugs() {

        // Elimina "/" inicial y final
        const path = window.location.pathname
            .replace(/^\/+|\/+$/g, "");

        if (!path) {
            return null;
        }

        const partes = path.split("/");

        if (partes.length < 2) {
            return null;
        }

        return {

            proveedorSlug: partes[0],

            productoSlug: partes[1]

        };

    }

    return{

    obtenerSlugs,

    obtenerProveedor

 };

})();


function obtenerProveedor(slug){

    if(!slug) return null;

    const cache =
        JSON.parse(localStorage.getItem("proveedores_cache")) || [];

    return cache.find(p =>
        p.slug === slug &&
        p.urlActiva === true
    ) || null;

}




document.addEventListener("descoapp:ready", () => {

    const ruta = RutasCompartidas.obtenerSlugs();

    if (!ruta) return;

    const proveedor =
        RutasCompartidas.obtenerProveedor(ruta.proveedorSlug);

    if (!proveedor) {

        console.warn("Proveedor no encontrado.");

        return;

    }

    console.log("Aplicación lista.");

    console.log("Proveedor encontrado:", proveedor);
    abrirProveedor(proveedor.id, proveedor.nombre);

});