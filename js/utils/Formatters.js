/**
 * Formatea un número como moneda.
 * @param {number} precio - El precio a formatear.
 * @returns {string} - El precio formateado con comas (ej. 1,000,000).
 */
export function formatCurrency(precio) {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Genera una imagen placeholder basada en el tipo de propiedad.
 * @param {string} tipo - El tipo de propiedad (ej. 'Casa', 'Departamento').
 * @returns {string} - URL de la imagen placeholder.
 */
export function getPlaceholderImage(tipo) {
    const placeholders = {
        'Casa': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
        'Departamento': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        'Oficina': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'Terreno': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
    };
    return placeholders[tipo] || placeholders['Casa'];
}
