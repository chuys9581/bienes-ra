import { Property } from '../models/Property.js';
import { formatCurrency, getPlaceholderImage } from '../utils/Formatters.js';

export class CarouselViewModel {
    constructor(apiService) {
        this.apiService = apiService;
        this.properties = [];
        this.currentIndex = 0;
        this.interval = null;

        // DOM Elements
        this.slidesContainer = document.getElementById('carouselSlides');
        this.indicatorsContainer = document.getElementById('carouselIndicators');
        this.cardContainer = document.getElementById('carouselPropertyCard');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
    }

    async init() {
        await this.loadFeatured();
        this.initEvents();
        this.render();
        this.startAutoPlay();
    }

    async loadFeatured() {
        try {
            const data = await this.apiService.getCarouselProperties(10);
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                this.properties = data.data.map(p => new Property(p));
            } else {
                this.properties = this._getDemoProperties();
            }
        } catch (e) {
            console.warn('Carousel load failed, using fallback', e);
            this.properties = this._getDemoProperties();
        }
    }

    initEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.stopAutoPlay();
                this.prev();
                this.startAutoPlay();
            });
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.stopAutoPlay();
                this.next();
                this.startAutoPlay();
            });
        }
    }

    render() {
        if (this.properties.length === 0) return;

        // Render Slides
        if (this.slidesContainer) {
            this.slidesContainer.innerHTML = this.properties.map((p, index) => {
                const isActive = index === this.currentIndex ? 'active' : '';
                const img = p.imagen_principal || getPlaceholderImage(p.tipo_nombre);
                return `
                    <div class="carousel-slide ${isActive}">
                        <img src="${img}" alt="${p.titulo}">
                        <div class="carousel-overlay"></div>
                    </div>
                `;
            }).join('');
        }

        // Render Indicators
        if (this.indicatorsContainer) {
            this.indicatorsContainer.innerHTML = this.properties.map((_, index) => {
                const isActive = index === this.currentIndex ? 'active' : '';
                return `<div class="carousel-indicator ${isActive}" data-index="${index}"></div>`;
            }).join('');

            // Add click events to indicators
            this.indicatorsContainer.querySelectorAll('.carousel-indicator').forEach(ind => {
                ind.addEventListener('click', () => {
                    this.stopAutoPlay();
                    this.currentIndex = parseInt(ind.dataset.index);
                    this.updateState();
                    this.startAutoPlay();
                });
            });
        }

        this.updateCard();
    }

    updateState() {
        // Update Slide Classes
        const slides = this.slidesContainer?.querySelectorAll('.carousel-slide');
        slides?.forEach((slide, i) => {
            slide.classList.toggle('active', i === this.currentIndex);
        });

        // Update Indicator Classes
        const indicators = this.indicatorsContainer?.querySelectorAll('.carousel-indicator');
        indicators?.forEach((ind, i) => {
            ind.classList.toggle('active', i === this.currentIndex);
        });

        this.updateCard();
    }

    updateCard() {
        if (!this.cardContainer) return;
        const p = this.properties[this.currentIndex];
        if (!p) return;

        const precio = p.precio_tipo === 'month'
            ? `$${p.precio} / mes`
            : `$${formatCurrency(p.precio)}`;

        this.cardContainer.innerHTML = `
            <div class="carousel-card-badge">DESTACADA</div>
            <h2 class="carousel-card-title">${p.titulo}</h2>
            <div class="carousel-card-address">
                <span class="material-icons">location_on</span>
                ${p.direccion}
            </div>
            <div class="carousel-card-status">${p.estado_propiedad.toUpperCase()}</div>
            <div class="carousel-card-price">${precio}</div>
            <div class="carousel-card-features">
                 ${p.habitaciones > 0 ? `
                <div class="carousel-card-feature">
                    <span class="material-icons">bed</span>
                    <div><div class="carousel-card-feature-value">${p.habitaciones}</div></div>
                </div>` : ''}
                ${p.banos > 0 ? `
                <div class="carousel-card-feature">
                    <span class="material-icons">bathtub</span>
                    <div><div class="carousel-card-feature-value">${p.banos}</div></div>
                </div>` : ''}
            </div>
             <div class="carousel-card-actions">
                <button class="carousel-card-btn carousel-card-btn-primary" id="carouselDetailsBtn-${p.id}">
                    <span class="material-icons">visibility</span> Ver Detalles
                </button>
            </div>
        `;
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.properties.length;
        this.updateState();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.properties.length) % this.properties.length;
        this.updateState();
    }

    startAutoPlay() {
        this.interval = setInterval(() => this.next(), 5000);
    }

    stopAutoPlay() {
        if (this.interval) clearInterval(this.interval);
    }

    _getDemoProperties() {
        return [
            new Property({
                id: 1,
                titulo: 'Mansión de Lujo (Demo)',
                direccion: 'Hollywood Blvd',
                precio: 5000000,
                habitaciones: 5, banos: 4,
                imagen_principal: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop'
            }),
            new Property({
                id: 2,
                titulo: 'Penthouse Urbano',
                direccion: 'New York City',
                precio: 3500, precio_tipo: 'month', estado_propiedad: 'renta',
                habitaciones: 2, banos: 2,
                imagen_principal: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop'
            })
        ];
    }
}
