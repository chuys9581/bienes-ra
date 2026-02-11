/**
 * Modelo que representa una Propiedad inmobiliaria.
 * Encapsula la lógica de datos y validación básica.
 */
export class Property {
    constructor(data) {
        this.id = data.id;
        this.titulo = data.titulo || 'Sin título';
        this.descripcion = data.descripcion || '';
        this.direccion = data.direccion || 'Dirección no disponible';
        this.ciudad = data.ciudad || '';
        this.estado = data.estado || '';
        this.precio = Number(data.precio) || 0;
        this.precio_tipo = data.precio_tipo || 'sale'; // sale, month
        this.estado_propiedad = data.estado_propiedad || 'venta'; // venta, renta
        this.habitaciones = Number(data.habitaciones) || 0;
        this.banos = Number(data.banos) || 0;
        this.estacionamientos = Number(data.estacionamientos) || 0;
        this.metros_cuadrados = Number(data.metros_cuadrados) || 0;
        this.imagen_principal = data.imagen_principal;
        this.tipo_nombre = data.tipo_nombre || 'Propiedad';
        this.destacada = Boolean(data.destacada);
        this.caracteristicas = data.caracteristicas || [];
    }

    get fullAddress() {
        return `${this.direccion}, ${this.ciudad}, ${this.estado}`;
    }

    get isForRent() {
        return this.estado_propiedad === 'renta' || this.estado_propiedad === 'FOR RENT';
    }

    get formattedPrice() {
        // Importamos dinámicamente o usamos lógica simple para evitar dependencia circular extrema si no es necesario
        // Pero idealmente el ViewModel se encarga del formateo final para la vista. 
        // Aquí mantenemos datos puros.
        return this.precio;
    }
}
