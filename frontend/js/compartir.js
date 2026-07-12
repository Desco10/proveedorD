const Compartir = {

    crearSlug(texto) {

        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ñ/g, "n")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    },

    crearUrl(proveedor, producto) {

        return `${window.location.origin}/${proveedor.slug}/${this.crearSlug(producto.nombre)}`;

    },

    async copiar(proveedor, producto) {

        const url = this.crearUrl(proveedor, producto);

        await navigator.clipboard.writeText(url);

        alert("✅ Enlace copiado");

    },

    async compartir(proveedor, producto) {

        const url = this.crearUrl(proveedor, producto);

        if (navigator.share) {

            await navigator.share({

                title: producto.nombre,

                text: producto.descripcion,

                url

            });

        } else {

            this.copiar(proveedor, producto);

        }

    }

};