import { Property } from '../models/Property.js';
import { formatCurrency, getPlaceholderImage } from '../utils/Formatters.js';

export class FeaturedPropertiesViewModel {
    constructor(apiService, modalComponent) {
        this.apiService = apiService;
        this.modal = modalComponent;
        this.properties = [];

        // DOM Elements
        this.container = document.getElementById('featuredGrid');
    }

    async init() {
        if (!this.container) return;

        this._showLoading();
        await this.loadProperties();
    }

    async loadProperties() {
        try {
            // Usamos el nuevo método para obtener solo las destacadas (no necesariamente carousel)
            const data = await this.apiService.getDestacadaProperties(4);

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                this.properties = data.data.map(p => new Property(p));
                this.render();
            } else {
                this.renderEmpty();
            }
        } catch (error) {
            console.error('Error loading featured properties:', error);
            this.renderEmpty();
        }
    }

    _showLoading() {
        this.container.innerHTML = '<div class="loading">Cargando destacadas...</div>';
    }

    renderEmpty() {
        this.container.innerHTML = `
            <div class="no-properties">
                <p>No hay propiedades destacadas en este momento.</p>
            </div>
        `;
    }

    render() {
        this.container.innerHTML = this.properties.map(p => this._createCard(p)).join('');

        // Add click events
        this.container.querySelectorAll('.featured-property-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const prop = this.properties.find(p => p.id == id);
                if (prop && this.modal) {
                    this.modal.open(prop);
                }
            });
        });
    }

    _createCard(propiedad) {
        const precio = formatCurrency(propiedad.precio);
        const imagen = propiedad.imagen_principal || getPlaceholderImage(propiedad.tipo_nombre);
        const tipoVenta = propiedad.estado_propiedad === 'renta' ? 'En Renta' : 'En Venta';
        const badgeClass = propiedad.estado_propiedad === 'renta' ? 'badge-for-rent' : 'badge-for-sale';
        const precioText = propiedad.estado_propiedad === 'renta'
            ? `$${precio} <span class="featured-property-price-period">/ mes</span>`
            : `$${precio}`;

        return `
            <div class="featured-property-card" data-id="${propiedad.id}">
                <div class="featured-property-image">
                    <img src="${imagen}" alt="${propiedad.titulo}" loading="lazy">
                    <div class="featured-badges">
                        <span class="featured-badge ${badgeClass}">${tipoVenta}</span>
                        ${propiedad.destacada == 1 ? '<span class="featured-badge badge-featured">DESTACADA</span>' : ''}
                    </div>
                </div>
                <div class="featured-property-content">
                    <h3 class="featured-property-title">${propiedad.titulo}</h3>
                    <p class="featured-property-location">
                        <span class="material-icons" style="font-size: 1rem; vertical-align: text-bottom;">location_on</span>
                        ${propiedad.direccion}, ${propiedad.ciudad}
                    </p>
                    <div class="featured-property-features">
                        ${propiedad.habitaciones > 0 ? `
                        <div class="featured-feature-item">
                            <span class="material-icons">bed</span> ${propiedad.habitaciones}
                        </div>` : ''}
                        ${propiedad.banos > 0 ? `
                        <div class="featured-feature-item">
                            <span class="material-icons">bathtub</span> ${propiedad.banos}
                        </div>` : ''}
                        ${propiedad.metros_cuadrados > 0 ? `
                        <div class="featured-feature-item">
                            <span class="material-icons">square_foot</span> ${propiedad.metros_cuadrados}m²
                        </div>` : ''}
                    </div>
                    <div class="featured-property-footer">
                        <div class="featured-property-price">${precioText}</div>
                        <div class="featured-property-actions">
                            <button class="featured-action-btn" title="Ver detalles">
                                <span class="material-icons">visibility</span>
                            </button>
                            <button class="featured-action-btn" title="Añadir a favoritos">
                                <span class="material-icons">favorite_border</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
