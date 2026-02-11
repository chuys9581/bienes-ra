import { formatCurrency, getPlaceholderImage } from '../utils/Formatters.js';

export class Modal {
    constructor(modalId, overlayId, closeBtnId, bodyId) {
        this.element = document.getElementById(modalId);
        this.overlay = document.getElementById(overlayId);
        this.closeBtn = document.getElementById(closeBtnId);
        this.body = document.getElementById(bodyId);

        this.initEvents();
    }

    initEvents() {
        if (!this.element) return;

        this.overlay?.addEventListener('click', () => this.close());
        this.closeBtn?.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.close();
            }
        });
    }

    open(propiedad) {
        if (!this.element) return;
        this.renderContent(propiedad);
        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.element) return;
        this.element.classList.remove('active');
        document.body.style.overflow = '';
    }

    isVisible() {
        return this.element?.classList.contains('active');
    }

    renderContent(propiedad) {
        if (!this.body) return;

        const precioFormateado = formatCurrency(propiedad.precio);
        const imagen = propiedad.imagen_principal || getPlaceholderImage(propiedad.tipo_nombre);

        this.body.innerHTML = `
            <div class="propiedad-detalle">
                <div class="propiedad-imagen-grande">
                    <img src="${imagen}" alt="${propiedad.titulo}">
                </div>
                
                <div class="propiedad-info-detalle">
                    <div class="propiedad-header-detalle">
                        <h2>${propiedad.titulo}</h2>
                        <div class="propiedad-precio-grande">$${precioFormateado}</div>
                    </div>
                    
                    <div class="propiedad-ubicacion-detalle">
                        <span class="material-icons">location_on</span>
                        <span>${propiedad.direccion}, ${propiedad.ciudad}, ${propiedad.estado}</span>
                    </div>
                    
                    <div class="propiedad-detalles-grid">
                        ${this._renderDetailItem('bed', propiedad.habitaciones, 'Habitaciones')}
                        ${this._renderDetailItem('bathtub', propiedad.banos, 'Baños')}
                        ${this._renderDetailItem('square_foot', `${propiedad.metros_cuadrados}m²`, 'Superficie')}
                        ${this._renderDetailItem('directions_car', propiedad.estacionamientos, 'Estacionamientos')}
                    </div>
                    
                    ${propiedad.descripcion ? `
                        <div class="propiedad-descripcion">
                            <h3>Descripción</h3>
                            <p>${propiedad.descripcion}</p>
                        </div>
                    ` : ''}
                    
                    <div class="propiedad-acciones">
                        <button class="btn-primary" onclick="alert('Contactando por: ${propiedad.titulo}')">
                            <span class="material-icons">phone</span>
                            Contactar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    _renderDetailItem(icon, value, label) {
        // Solo renderizar si el valor es truthy (o 0 si es un número válido que queremos mostrar? En este caso > 0 es mejor)
        // Parseamos a int para asegurar comparación, aunque value puede ser string "250m²"
        const numValue = parseInt(value);
        if (!numValue || numValue <= 0) return '';

        return `
            <div class="detalle-item">
                <span class="material-icons">${icon}</span>
                <div>
                    <strong>${value}</strong>
                    <span>${label}</span>
                </div>
            </div>
        `;
    }
}
