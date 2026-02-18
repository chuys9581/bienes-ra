/**
 * Servicio para manejar todas las peticiones a la API.
 */
export class ApiService {
    constructor(baseUrl = './api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Obtiene propiedades con filtros opcionales.
     * @param {URLSearchParams|string} queryParams - Filtros para la búsqueda.
     * @returns {Promise<Object>} - Respuesta de la API.
     */
    async getProperties(queryParams = '') {
        try {
            const url = queryParams
                ? `${this.baseUrl}/propiedades.php?${queryParams}`
                : `${this.baseUrl}/propiedades.php`;

            const response = await fetch(url);

            // Verificamos si la respuesta es válida antes de procesar
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching properties:', error);
            // Retorna una estructura de error controlada
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene los detalles de una propiedad por ID.
     * @param {number} id - ID de la propiedad.
     * @returns {Promise<Object>} - Respuesta de la API.
     */
    async getPropertyById(id) {
        return this.getProperties(`id=${id}`);
    }

    /**
     * Obtiene propiedades para el carrusel principal.
     * @param {number} limit - Límite de propiedades.
     * @returns {Promise<Object>}
     */
    async getCarouselProperties(limit = 10) {
        return this.getProperties(`en_carousel=1&limit=${limit}`);
    }

    /**
     * Obtiene propiedades marcadas como "Mejor Venta".
     * @param {number} limit - Límite de propiedades.
     * @returns {Promise<Object>}
     */
    async getBestSellingProperties(limit = 3) {
        return this.getProperties(`mejor_venta=1&limit=${limit}`);
    }

    /**
     * Obtiene propiedades marcadas como "Mejor Renta".
     * @param {number} limit - Límite de propiedades.
     * @returns {Promise<Object>}
     */
    async getBestRentProperties(limit = 5) {
        return this.getProperties(`mejor_renta=1&limit=${limit}`);
    }

    /**
     * Obtiene propiedades destacadas para la sección "Propiedades Destacadas".
     * @param {number} limit - Límite de propiedades.
     * @returns {Promise<Object>}
     */
    async getDestacadaProperties(limit = 6) {
        return this.getProperties(`destacada=1&limit=${limit}`);
    }

    /**
     * Obtiene todas las propiedades sin filtros.
     * @param {number} limit - Límite opcional de propiedades.
     * @returns {Promise<Object>}
     */
    async getAllProperties(limit = null) {
        const limitParam = limit ? `limit=${limit}` : '';
        return this.getProperties(limitParam);
    }
}
