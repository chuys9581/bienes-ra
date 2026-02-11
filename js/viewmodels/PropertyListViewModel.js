import { Property } from '../models/Property.js';
import { formatCurrency, getPlaceholderImage } from '../utils/Formatters.js';

export class PropertyListViewModel {
    constructor(apiService, modalComponent) {
        this.apiService = apiService;
        this.modal = modalComponent;
        this.properties = [];
        this.currentFilter = 'all';

        // DOM Elements
        this.gridElement = document.getElementById('propiedadesGrid');
        this.filterButtons = document.querySelectorAll('.filtro-btn');
    }

    async init() {
        this.initEventListeners();
        await this.loadProperties();
    }

    initEventListeners() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.closest('.filtro-btn').classList.add('active');

                this.currentFilter = e.target.closest('.filtro-btn').dataset.filter;
                this.render();
            });
        });
    }

    async loadProperties() {
        this._showLoading();
        try {
            const data = await this.apiService.getProperties();
            if (data.success && Array.isArray(data.data)) {
                this.properties = data.data.map(p => new Property(p));
            } else {
                // Fallback si la API falla o está vacía (para desarrollo)
                this.properties = this._getFallbackProperties();
            }
        } catch (error) {
            console.error(error);
            this.properties = this._getFallbackProperties();
        }
        this.render();
    }

    _showLoading() {
        if (this.gridElement) {
            this.gridElement.innerHTML = '<div class="loading">Cargando propiedades...</div>';
        }
    }

    render() {
        if (!this.gridElement) return;

        let filtered = this.properties;
        if (this.currentFilter !== 'all') {
            filtered = this.properties.filter(p => p.estado_propiedad === this.currentFilter);
        }

        if (filtered.length === 0) {
            this.gridElement.innerHTML = `
                <div class="loading">
                    <p style="color: var(--text-secondary);">No se encontraron propiedades</p>
                </div>`;
            return;
        }

        this.gridElement.innerHTML = filtered.map(p => this._createPropertyCard(p)).join('');

        // Re-attach click events to cards
        // Nota: Usamos delegación de eventos o añadimos listeners aquí. 
        // Por simplicidad y para evitar "onclick" en el HTML string que requiere funciones globales:
        this.gridElement.querySelectorAll('.propiedad-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const prop = this.properties.find(p => p.id == id);
                if (prop) this.modal.open(prop);
            });
        });
    }

    _createPropertyCard(propiedad) {
        const precio = formatCurrency(propiedad.precio);
        const imagen = propiedad.imagen_principal || getPlaceholderImage(propiedad.tipo_nombre);
        const destacadaHtml = propiedad.destacada
            ? '<div class="propiedad-destacada"><span class="material-icons">star</span>Destacada</div>'
            : '';

        return `
            <div class="propiedad-card" data-id="${propiedad.id}">
                <div class="propiedad-imagen">
                    <img src="${imagen}" alt="${propiedad.titulo}">
                    <div class="propiedad-badge">${propiedad.estado_propiedad}</div>
                    ${destacadaHtml}
                </div>
                <div class="propiedad-content">
                    <div class="propiedad-precio">$${precio}</div>
                    <h3 class="propiedad-titulo">${propiedad.titulo}</h3>
                    <div class="propiedad-ubicacion">
                        <span class="material-icons">location_on</span>
                        ${propiedad.ciudad}, ${propiedad.estado}
                    </div>
                    <div class="propiedad-detalles">
                        ${propiedad.habitaciones > 0 ? `
                            <div class="detalle">
                                <span class="material-icons">bed</span> ${propiedad.habitaciones}
                            </div>` : ''}
                        ${propiedad.banos > 0 ? `
                            <div class="detalle">
                                <span class="material-icons">bathtub</span> ${propiedad.banos}
                            </div>` : ''}
                        ${propiedad.metros_cuadrados > 0 ? `
                            <div class="detalle">
                                <span class="material-icons">square_foot</span> ${propiedad.metros_cuadrados}m²
                            </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    _getFallbackProperties() {
        return [
            new Property({
                id: 1,
                titulo: 'Casa Moderna (Demo)',
                precio: 3500000,
                direccion: 'Av. Demo 123',
                ciudad: 'CDMX',
                estado: 'CDMX',
                estado_propiedad: 'venta',
                habitaciones: 3,
                banos: 2,
                metros_cuadrados: 200,
                tipo_nombre: 'Casa'
            }),
            new Property({
                id: 2,
                titulo: 'Depto Lujo (Demo)',
                precio: 25000,
                precio_tipo: 'month',
                direccion: 'Calle 5',
                ciudad: 'GDL',
                estado: 'Jalisco',
                estado_propiedad: 'renta',
                habitaciones: 2,
                banos: 1,
                metros_cuadrados: 90,
                tipo_nombre: 'Departamento'
            })
        ];
    }
}
