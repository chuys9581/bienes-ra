import { Property } from '../models/Property.js';
import { formatCurrency } from '../utils/Formatters.js';

export class BestRentPropertiesViewModel {
    constructor(apiService, modalComponent) {
        this.apiService = apiService;
        this.modal = modalComponent;
        this.properties = [];
        this.container = document.querySelector('.rent-properties-grid');
    }

    async init() {
        if (!this.container) return;

        // Mostrar loading
        this.container.innerHTML = '<div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: white;">Cargando mejores opciones en renta...</div>';

        await this.loadProperties();
    }

    async loadProperties() {
        try {
            // Obtenemos hasta 5 propiedades marcadas como "Mejor Renta"
            const data = await this.apiService.getBestRentProperties(5);

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                this.properties = data.data.map(p => new Property(p));
                this.render();
            } else {
                this.renderEmpty();
            }
        } catch (error) {
            console.error('Error loading best rent properties:', error);
            this.renderEmpty();
        }
    }

    renderEmpty() {
        this.container.innerHTML = `
            <div class="no-properties" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: white;">
                <p>No hay propiedades en renta destacadas por el momento.</p>
            </div>
        `;
    }

    render() {
        if (this.properties.length === 0) return;

        this.container.innerHTML = '';

        this.properties.forEach((prop, index) => {
            const isLarge = index === 2; // El tercer elemento (índice 2) es grande en el diseño original
            const cardHtml = this._createCard(prop, isLarge);
            this.container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Add click events
        this.container.querySelectorAll('.rent-property-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = card.dataset.id;
                const prop = this.properties.find(p => p.id == id);
                if (prop && this.modal) {
                    this.modal.open(prop);
                }
            });
        });
    }

    _createCard(prop, isLarge) {
        const precio = formatCurrency(prop.precio);
        const imagen = prop.imagen_principal || 'assets/images/placeholder.jpg';
        const largeClass = isLarge ? 'rent-property-large' : '';

        // Determinar badges
        let badgesHtml = '';
        if (prop.destacada == 1) {
            badgesHtml += '<span class="rent-badge badge-featured">DESTACADA</span>';
        }
        badgesHtml += '<span class="rent-badge badge-for-rent">EN RENTA</span>';

        // Recortar dirección si es muy larga
        const direccion = `${prop.direccion}, ${prop.ciudad}`;

        return `
            <div class="rent-property-card ${largeClass}" data-id="${prop.id}">
                <div class="rent-property-image">
                    <img src="${imagen}" alt="${prop.titulo}" loading="lazy">
                    <div class="rent-overlay"></div>
                    <div class="rent-badges">
                        ${badgesHtml}
                    </div>
                    <div class="rent-property-info">
                        <h3 class="rent-property-title">${prop.titulo}</h3>
                        <p class="rent-property-address">${direccion}</p>
                        <div class="rent-property-footer">
                            <span class="rent-property-price">$${precio} / mes</span>
                            <div class="rent-property-features">
                                <span><i class="material-icons">bed</i> ${prop.habitaciones}</span>
                                <span><i class="material-icons">bathtub</i> ${prop.banos}</span>
                                <span><i class="material-icons">square_foot</i> ${prop.metros_cuadrados}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
