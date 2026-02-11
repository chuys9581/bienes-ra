import { Property } from '../models/Property.js';
import { formatCurrency } from '../utils/Formatters.js';

export class BestSellingPropertiesViewModel {
    constructor(apiService, modalComponent) {
        this.apiService = apiService;
        this.modal = modalComponent;
        this.properties = [];

        // DOM Elements
        // La sección "Mejores Propiedades" tiene una estructura particular.
        // Asumiremos que el contenedor principal es '.best-properties-grid' dentro de '.best-properties-section'
        // Pero el HTML actual tiene los items "hardcoded". Necesitamos limpiar ese contenedor y llenarlo dinámicamente.
        this.container = document.querySelector('.best-properties-grid');
    }

    async init() {
        if (!this.container) return;

        // Mostrar loading (opcional, o dejar skeleton si existiera)
        this.container.innerHTML = '<div class="loading" style="width:100%; text-align:center; padding: 2rem;">Cargando mejores propiedades...</div>';

        await this.loadProperties();
    }

    async loadProperties() {
        try {
            // Obtenemos las 3 últimas propiedades marcadas como "Mejor Venta"
            const data = await this.apiService.getBestSellingProperties(3);

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                this.properties = data.data.map(p => new Property(p));
                this.render();
            } else {
                this.renderEmpty();
            }
        } catch (error) {
            console.error('Error loading best selling properties:', error);
            this.renderEmpty();
        }
    }

    renderEmpty() {
        this.container.innerHTML = `
            <div class="no-properties" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p>No hay propiedades destacadas en esta sección por el momento.</p>
            </div>
        `;
    }

    render() {
        if (this.properties.length === 0) return;

        // Limpiar contenedor
        this.container.innerHTML = '';

        // Estrategia de renderizado:
        // El diseño pide 1 tarjeta grande y 2 pequeñas.
        // Propiedad [0] -> Grande
        // Propiedad [1] y [2] -> Pequeñas (columna derecha)

        const mainProperty = this.properties[0];
        const secondaryProperties = this.properties.slice(1, 3);

        let html = '';

        // 1. Tarjeta Grande (Principal) - envuelta en best-property-main
        if (mainProperty) {
            html += '<div class="best-property-main">';
            html += this._createLargeCard(mainProperty);
            html += '</div>';
        }

        // 2. Columna Derecha (Tarjetas Pequeñas)
        if (secondaryProperties.length > 0) {
            html += '<div class="best-properties-secondary">';
            secondaryProperties.forEach(prop => {
                html += this._createSmallCard(prop);
            });
            html += '</div>';
        }

        this.container.innerHTML = html;

        // Add click events
        this.container.querySelectorAll('.best-property-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Evitar bubbling si hay botones específicos, pero por ahora toda la card
                const id = card.dataset.id;
                const prop = this.properties.find(p => p.id == id);
                if (prop && this.modal) {
                    this.modal.open(prop);
                }
            });
        });
    }

    _createLargeCard(prop) {
        const precio = formatCurrency(prop.precio);
        const imagen = prop.imagen_principal || 'assets/images/placeholder.jpg';
        const status = prop.estado_propiedad === 'renta' ? 'EN RENTA' : 'EN VENTA';
        const badgeClass = prop.estado_propiedad === 'renta' ? 'badge-for-rent' : 'badge-for-sale';

        // NOTE: Structure matches index.html exactly for correct styling
        return `
            <div class="best-property-card large-card" data-id="${prop.id}">
                <div class="best-property-image">
                    <img src="${imagen}" alt="${prop.titulo}" loading="lazy">
                    <div class="best-badges">
                        <span class="best-badge ${badgeClass}">${status}</span>
                        ${prop.destacada == 1 ? '<span class="best-badge badge-featured">DESTACADA</span>' : ''}
                    </div>
                    <div class="best-property-content">
                        <div class="best-content-left">
                            <p class="best-property-address">${prop.direccion}, ${prop.ciudad}</p>
                            <h3 class="best-property-title">${prop.titulo}</h3>
                        </div>
                        <div class="best-content-right">
                            <span class="best-property-price">$${precio}</span>
                            <div class="best-property-features">
                                <div class="best-feature-item">
                                    <span class="material-icons">bed</span>
                                    <span>${prop.habitaciones} Hab</span>
                                </div>
                                <div class="best-feature-item">
                                    <span class="material-icons">bathtub</span>
                                    <span>${prop.banos} Ba</span>
                                </div>
                                <div class="best-feature-item">
                                    <span class="material-icons">square_foot</span>
                                    <span>${prop.metros_cuadrados} m²</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _createSmallCard(prop) {
        const precio = formatCurrency(prop.precio);
        const imagen = prop.imagen_principal || 'assets/images/placeholder.jpg';
        const status = prop.estado_propiedad === 'renta' ? 'EN RENTA' : 'EN VENTA';

        // Truncate description for display
        const description = prop.descripcion ?
            (prop.descripcion.length > 100 ? prop.descripcion.substring(0, 100) + '...' : prop.descripcion)
            : '';

        return `
            <div class="best-property-card small-card" data-id="${prop.id}">
                <div class="best-property-small-inner">
                    <div class="best-property-image-small">
                        <img src="${imagen}" alt="${prop.titulo}" loading="lazy">
                        <div class="best-badges">
                            ${prop.destacada == 1 ? '<span class="best-badge badge-featured">DESTACADA</span>' : ''}
                        </div>
                    </div>
                    <div class="best-property-content-small">
                        <h4 class="best-property-title-small">${prop.titulo}</h4>
                        <p class="best-property-address-small">${prop.direccion}, ${prop.ciudad}</p>
                        <span class="best-property-status">${status}</span>
                        <p class="best-property-description">${description}</p>
                        <div class="best-property-footer-small">
                            <span class="best-property-price-small">$${precio}</span>
                            <div class="best-property-features-small">
                                <div class="best-feature-item-small">
                                    <span class="material-icons">bed</span> <span>${prop.habitaciones}</span>
                                </div>
                                <div class="best-feature-item-small">
                                    <span class="material-icons">bathtub</span> <span>${prop.banos}</span>
                                </div>
                                <div class="best-feature-item-small">
                                    <span class="material-icons">square_foot</span> <span>${prop.metros_cuadrados}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
