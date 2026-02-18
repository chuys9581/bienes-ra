import { Property } from '../models/Property.js';
import { formatCurrency } from '../utils/Formatters.js';
import { ApiService } from '../services/ApiService.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

export class PropertyDetailViewModel {
    constructor() {
        this.apiService = new ApiService();
        this.property = null;
        this.images = [];
        this.currentImageIndex = 0;
        this.similarHomes = [];
        this.similarCurrentSlide = 0;
    }

    async init() {
        // Initialize Header & Footer
        new Header('main-header').render();
        new Footer('main-footer').render();

        // Get property ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');

        if (!propertyId) {
            this.showError('No se especificó una propiedad.');
            return;
        }

        await this.loadProperty(propertyId);
    }

    async loadProperty(id) {
        try {
            const response = await this.apiService.getPropertyById(id);
            
            if (response.success && response.data) {
                this.property = new Property(response.data);
                this.agent = response.data.agente || null;
                
                // Process images
                this.images = [];
                
                // Add main image first
                if (this.property.imagen_principal) {
                    this.images.push(this.property.imagen_principal);
                }
                
                // Add additional images
                if (response.data.imagenes && Array.isArray(response.data.imagenes)) {
                    response.data.imagenes.forEach(img => {
                        if (img.url_imagen && img.url_imagen !== this.property.imagen_principal) {
                            this.images.push(img.url_imagen);
                        }
                    });
                }

                // If no images at all, add a placeholder
                if (this.images.length === 0) {
                    this.images.push('https://via.placeholder.com/1200x800?text=Sin+Imagen');
                }

                this.render();
                this.setupEventListeners();
                await this.loadSimilarHomes();
            } else {
                this.showError('Propiedad no encontrada.');
            }
        } catch (error) {
            console.error('Error loading property:', error);
            this.showError('Error al cargar la propiedad.');
        }
    }

    render() {
        // Hide loading, show content
        document.getElementById('property-loading').style.display = 'none';
        document.getElementById('property-content').style.display = 'block';

        // Breadcrumb
        document.getElementById('breadcrumb-title').textContent = this.property.titulo;

        // Main Image
        document.getElementById('main-image').src = this.images[0];
        document.getElementById('main-image').alt = this.property.titulo;

        // Thumbnails
        this.renderThumbnails();

        // Badges
        this.renderBadges();

        // Title & Address
        document.getElementById('property-title').textContent = this.property.titulo;
        document.getElementById('property-address').textContent = this.property.fullAddress;

        // Price
        const precio = formatCurrency(this.property.precio);
        document.getElementById('property-price').textContent = `$${precio}`;
        
        const pricePeriod = this.property.isForRent ? ' / month' : '';
        document.getElementById('property-price-period').textContent = pricePeriod;

        // Description
        document.getElementById('property-description').textContent = 
            this.property.descripcion || 'No hay descripción disponible.';

        // Overview
        this.renderOverview();

        // Address Details
        this.renderAddressDetails();

        // Details
        this.renderDetails();

        // Features
        this.renderFeatures();

        // Floor Plans
        this.renderFloorPlans();

        // Video
        this.renderVideo();

        // Virtual Tour
        this.renderVirtualTour();

        // Location
        this.renderLocation();

        // Rating & Reviews
        this.renderReviews();

        // Agent
        this.renderAgent();

        // Update contact form textarea with property title
        const textarea = document.querySelector('#contact-form textarea');
        if (textarea) {
            textarea.value = `Hello, I am interested in [${this.property.titulo}]`;
        }
    }

    renderThumbnails() {
        const container = document.getElementById('gallery-thumbnails');
        container.innerHTML = '';

        this.images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumbnail' + (index === 0 ? ' active' : '');
            thumb.innerHTML = `<img src="${image}" alt="Thumbnail ${index + 1}">`;
            thumb.addEventListener('click', () => this.changeMainImage(index));
            container.appendChild(thumb);
        });
    }

    renderBadges() {
        const container = document.getElementById('property-badges');
        const badges = [];

        if (this.property.destacada) {
            badges.push('<span class="property-badge badge-featured">DESTACADA</span>');
        }

        const statusText = this.property.isForRent ? 'EN RENTA' : 'EN VENTA';
        const statusClass = this.property.isForRent ? 'badge-for-rent' : 'badge-for-sale';
        badges.push(`<span class="property-badge ${statusClass}">${statusText}</span>`);

        container.innerHTML = badges.join('');
    }

    renderOverview() {
        const container = document.getElementById('property-overview');
        const overview = [];

        overview.push(`
            <div class="overview-item">
                <span class="overview-icon material-icons">home</span>
                <div class="overview-content">
                    <div class="overview-label">ID</div>
                    <div class="overview-value">${this.property.id}</div>
                </div>
            </div>
        `);

        overview.push(`
            <div class="overview-item">
                <span class="overview-icon material-icons">apartment</span>
                <div class="overview-content">
                    <div class="overview-label">TYPE</div>
                    <div class="overview-value">${this.property.tipo_nombre || 'N/A'}</div>
                </div>
            </div>
        `);

        if (this.property.habitaciones > 0) {
            overview.push(`
                <div class="overview-item">
                    <span class="overview-icon material-icons">bed</span>
                    <div class="overview-content">
                        <div class="overview-label">BEDROOMS</div>
                        <div class="overview-value">${this.property.habitaciones}</div>
                    </div>
                </div>
            `);
        }

        if (this.property.banos > 0) {
            overview.push(`
                <div class="overview-item">
                    <span class="overview-icon material-icons">bathtub</span>
                    <div class="overview-content">
                        <div class="overview-label">BATHROOMS</div>
                        <div class="overview-value">${this.property.banos}</div>
                    </div>
                </div>
            `);
        }

        if (this.property.estacionamientos > 0) {
            overview.push(`
                <div class="overview-item">
                    <span class="overview-icon material-icons">garage</span>
                    <div class="overview-content">
                        <div class="overview-label">GARAGES</div>
                        <div class="overview-value">${this.property.estacionamientos}</div>
                    </div>
                </div>
            `);
        }

        if (this.property.metros_cuadrados > 0) {
            overview.push(`
                <div class="overview-item">
                    <span class="overview-icon material-icons">square_foot</span>
                    <div class="overview-content">
                        <div class="overview-label">SIZE</div>
                        <div class="overview-value">${this.property.metros_cuadrados} SqFt</div>
                    </div>
                </div>
            `);
        }

        container.innerHTML = overview.join('');
    }

    renderAddressDetails() {
        const container = document.getElementById('property-address-details');
        const details = [];

        details.push(`
            <div class="address-detail-row">
                <div class="address-detail-item">
                    <div class="address-detail-label">Address</div>
                    <div class="address-detail-value">${this.property.direccion}</div>
                </div>
            </div>
        `);

        details.push(`
            <div class="address-detail-row">
                <div class="address-detail-item">
                    <div class="address-detail-label">City/Town</div>
                    <div class="address-detail-value">${this.property.ciudad}</div>
                </div>
                <div class="address-detail-item">
                    <div class="address-detail-label">Province/State</div>
                    <div class="address-detail-value">${this.property.estado}</div>
                </div>
            </div>
        `);

        container.innerHTML = details.join('');
    }

    renderDetails() {
        const container = document.getElementById('property-details-grid');
        const details = [];

        // Row 1
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Property ID</div>
                <div class="detail-value">${this.property.id}</div>
            </div>
        `);

        const precio = formatCurrency(this.property.precio);
        const pricePeriod = this.property.isForRent ? ' / month' : '';
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Price</div>
                <div class="detail-value">$${precio}${pricePeriod}</div>
            </div>
        `);

        // Row 2
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Property Type</div>
                <div class="detail-value">${this.property.tipo_nombre || 'N/A'}</div>
            </div>
        `);

        const statusText = this.property.isForRent ? 'For Rent' : 'For Sale';
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Property Status</div>
                <div class="detail-value">${statusText}</div>
            </div>
        `);

        // Row 3
        const rooms = this.property.habitaciones > 0 ? this.property.habitaciones : 'N/A';
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Rooms</div>
                <div class="detail-value">${rooms}</div>
            </div>
        `);

        const bedrooms = this.property.habitaciones > 0 ? this.property.habitaciones : 'N/A';
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Bedrooms</div>
                <div class="detail-value">${bedrooms}</div>
            </div>
        `);

        // Row 4
        const bathrooms = this.property.banos > 0 ? this.property.banos : 'N/A';
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Bathrooms</div>
                <div class="detail-value">${bathrooms}</div>
            </div>
        `);

        details.push(`
            <div class="detail-item">
                <div class="detail-label">Year Built</div>
                <div class="detail-value">${this.property.ano_construccion || 'N/A'}</div>
            </div>
        `);

        // Row 5
        const size = this.property.metros_cuadrados > 0 ? `${this.property.metros_cuadrados} SqFt` : 'N/A';
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Size</div>
                <div class="detail-value">${size}</div>
            </div>
        `);

        details.push(`
            <div class="detail-item">
                <div class="detail-label">Land area</div>
                <div class="detail-value">N/A</div>
            </div>
        `);

        // Row 6
        const garages = this.property.estacionamientos > 0 ? this.property.estacionamientos : 'N/A';
        details.push(`
            <div class="detail-item">
                <div class="detail-label">Garages</div>
                <div class="detail-value">${garages}</div>
            </div>
        `);

        details.push(`
            <div class="detail-item">
                <div class="detail-label">Garage area</div>
                <div class="detail-value">N/A</div>
            </div>
        `);

        container.innerHTML = details.join('');
    }

    renderAgent() {
        if (!this.agent) {
            // Hide agent card if no agent assigned
            const agentCard = document.getElementById('agent-detail-card');
            if (agentCard) {
                agentCard.innerHTML = '<p style="text-align: center; padding: 2rem; color: #94A3B8;">No hay agente asignado a esta propiedad.</p>';
            }
            return;
        }

        // Agent Avatar
        const avatar = document.getElementById('agent-avatar');
        if (avatar) {
            avatar.src = this.agent.foto_perfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.agent.nombre + ' ' + this.agent.apellido) + '&size=200&background=4F46E5&color=fff';
            avatar.alt = `${this.agent.nombre} ${this.agent.apellido}`;
        }

        // Agent Name
        const nameEl = document.getElementById('agent-name');
        if (nameEl) {
            nameEl.textContent = `${this.agent.nombre} ${this.agent.apellido}`;
        }

        // Agent Email
        const emailEl = document.getElementById('agent-email');
        if (emailEl) {
            emailEl.textContent = this.agent.email || 'No disponible';
        }

        // Agent Phone
        const phoneEl = document.getElementById('agent-phone');
        if (phoneEl) {
            phoneEl.textContent = this.agent.telefono || '+00 0000 000 000';
        }

        // Social Links (if you have social media fields in agent table)
        const socialContainer = document.getElementById('agent-social');
        if (socialContainer) {
            socialContainer.innerHTML = `
                <a href="#" class="agent-social-link"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="agent-social-link"><i class="fab fa-twitter"></i></a>
                <a href="#" class="agent-social-link"><i class="fab fa-linkedin-in"></i></a>
                <a href="#" class="agent-social-link"><i class="fab fa-instagram"></i></a>
            `;
        }
    }

    renderFeatures() {
        const container = document.getElementById('property-features-grid');
        
        // List of common property amenities/features
        const amenityList = [
            'Gym',
            'Laundry',
            'Lawn',
            'Microwave',
            'Outdoor Shower',
            'Refrigerator',
            'Sauna',
            'Swimming Pool',
            'TV Cable',
            'Washer',
            'Wifi',
            'Window Coverings'
        ];

        const features = amenityList.map(amenity => `
            <div class="feature-item-check">
                <span class="feature-check-icon material-icons">check</span>
                <span class="feature-label">${amenity}</span>
            </div>
        `).join('');

        container.innerHTML = features;
    }

    renderFloorPlans() {
        const container = document.getElementById('floor-plans-accordion');
        
        // Hardcoded floor plan data
        const floorPlans = [
            {
                name: 'First Floor',
                size: 900,
                bedrooms: 2,
                bathrooms: 2,
                price: 800000,
                imageUrl: 'https://via.placeholder.com/800x600/f8fafc/64748b?text=First+Floor+Plan'
            },
            {
                name: 'Second Floor',
                size: 900,
                bedrooms: 2,
                bathrooms: 2,
                price: 600000,
                imageUrl: 'https://via.placeholder.com/800x600/f8fafc/64748b?text=Second+Floor+Plan'
            },
            {
                name: 'Third Floor',
                size: 900,
                bedrooms: 2,
                bathrooms: 2,
                price: 300000,
                imageUrl: 'https://via.placeholder.com/800x600/f8fafc/64748b?text=Third+Floor+Plan'
            }
        ];

        const floorPlansHtml = floorPlans.map((floor, index) => `
            <div class="floor-plan-item">
                <div class="floor-plan-header" data-floor-index="${index}">
                    <div class="floor-plan-title-section">
                        <h3 class="floor-plan-name">${floor.name}</h3>
                        <div class="floor-plan-info">
                            <span class="floor-info-item"><span class="floor-info-label">Size:</span> ${floor.size}</span>
                            <span class="floor-info-item"><span class="floor-info-label">Bedrooms:</span> ${floor.bedrooms}</span>
                            <span class="floor-info-item"><span class="floor-info-label">Bathrooms:</span> ${floor.bathrooms}</span>
                            <span class="floor-info-item"><span class="floor-info-label">Price:</span> $${formatCurrency(floor.price)}</span>
                        </div>
                    </div>
                    <button class="floor-plan-toggle" aria-label="Toggle floor plan">
                        <span class="material-icons">expand_more</span>
                    </button>
                </div>
                <div class="floor-plan-content">
                    <div class="floor-plan-image-wrapper">
                        <img src="${floor.imageUrl}" alt="${floor.name} plan" class="floor-plan-image">
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = floorPlansHtml;

        // Setup accordion functionality
        this.setupFloorPlanAccordion();
    }

    setupFloorPlanAccordion() {
        const headers = document.querySelectorAll('.floor-plan-header');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const content = item.querySelector('.floor-plan-content');
                const toggle = header.querySelector('.floor-plan-toggle span');
                const isActive = item.classList.contains('active');

                // Close all other items
                document.querySelectorAll('.floor-plan-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.floor-plan-content');
                        const otherToggle = otherItem.querySelector('.floor-plan-toggle span');
                        otherContent.style.maxHeight = null;
                        otherToggle.textContent = 'expand_more';
                    }
                });

                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                    content.style.maxHeight = null;
                    toggle.textContent = 'expand_more';
                } else {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    toggle.textContent = 'expand_less';
                }
            });
        });
    }

    renderVideo() {
        const container = document.getElementById('property-video-container');
        
        // Placeholder for video - will be populated from admin later
        const videoHtml = `
            <div class="video-placeholder">
                <div class="video-thumbnail">
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=675&fit=crop" 
                         alt="Property Video" 
                         class="video-thumbnail-img">
                    <div class="video-play-button">
                        <span class="material-icons">play_arrow</span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = videoHtml;
    }

    renderVirtualTour() {
        const container = document.getElementById('property-virtual-tour-container');
        
        // Placeholder for virtual tour - will be populated from admin later
        const tourHtml = `
            <div class="virtual-tour-placeholder">
                <div class="virtual-tour-thumbnail">
                    <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=675&fit=crop" 
                         alt="Virtual Tour" 
                         class="virtual-tour-thumbnail-img">
                    <div class="virtual-tour-overlay">
                        <h3 class="virtual-tour-title">${this.property.titulo}</h3>
                        <div class="virtual-tour-play-button">
                            <span class="material-icons">play_arrow</span>
                        </div>
                        <div class="virtual-tour-powered">
                            <span class="powered-text">POWERED BY</span>
                            <span class="powered-brand">Matterport®</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = tourHtml;
    }

    renderLocation() {
        const container = document.getElementById('property-location-map');
        
        // Create address for map
        const mapAddress = encodeURIComponent(this.property.fullAddress);
        
        // Google Maps embed URL
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapAddress}&zoom=15`;
        
        // For now, use a static map or placeholder
        // You can replace with actual Google Maps API key later from admin
        const locationHtml = `
            <div class="location-map-container">
                <div class="map-wrapper">
                    <iframe 
                        src="https://www.google.com/maps?q=${mapAddress}&output=embed&z=15" 
                        class="location-map-iframe"
                        frameborder="0" 
                        allowfullscreen="" 
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                    <div class="map-overlay">
                        <button class="btn-get-directions" id="btn-get-directions">
                            <span class="material-icons">navigation</span>
                            Get Directions
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = locationHtml;

        // Setup Get Directions button
        const directionsBtn = document.getElementById('btn-get-directions');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', () => {
                const address = encodeURIComponent(this.property.fullAddress);
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
            });
        }
    }

    renderReviews() {
        // Hardcoded sample data for now
        const reviews = [];
        
        // Calculate rating statistics
        const totalReviews = reviews.length;
        let averageRating = 0;
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        if (totalReviews > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            averageRating = (sum / totalReviews).toFixed(1);
            
            reviews.forEach(review => {
                ratingCounts[review.rating]++;
            });
        }

        // Render rating summary
        this.renderRatingSummary(averageRating, totalReviews, ratingCounts);

        // Render reviews list
        this.renderReviewsList(reviews, totalReviews);

        // Setup review form
        this.setupReviewForm();
    }

    renderRatingSummary(averageRating, totalReviews, ratingCounts) {
        const container = document.getElementById('rating-summary');
        
        // Generate star display
        const fullStars = Math.floor(averageRating);
        const starsHtml = Array(5).fill(0).map((_, i) => 
            `<div class="rating-star-box ${i < fullStars ? 'filled' : ''}">
                <span class="material-icons">star</span>
            </div>`
        ).join('');

        const summaryHtml = `
            <div class="average-rating-card">
                <h3 class="rating-card-title">Average User Rating</h3>
                <div class="rating-number">
                    <span class="rating-large">${totalReviews > 0 ? averageRating : '0'}</span>
                    <span class="rating-divider">/</span>
                    <span class="rating-total">5</span>
                </div>
                <div class="rating-stars-display">
                    ${starsHtml}
                </div>
            </div>

            <div class="rating-breakdown-card">
                <h3 class="rating-card-title">Rating Breakdown</h3>
                <div class="rating-breakdown-list">
                    ${[5, 4, 3, 2, 1].map(stars => {
                        const count = ratingCounts[stars] || 0;
                        const percentage = totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
                        return `
                            <div class="rating-breakdown-item">
                                <div class="breakdown-stars">
                                    ${Array(stars).fill('<span class="star-icon">★</span>').join('')}
                                    ${Array(5 - stars).fill('<span class="star-icon empty">★</span>').join('')}
                                </div>
                                <div class="breakdown-bar">
                                    <div class="breakdown-bar-fill" style="width: ${percentage}%"></div>
                                </div>
                                <div class="breakdown-percentage">${percentage}%</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        container.innerHTML = summaryHtml;
    }

    renderReviewsList(reviews, totalReviews) {
        const titleEl = document.getElementById('reviews-title');
        const listEl = document.getElementById('reviews-list');

        titleEl.textContent = totalReviews > 0 ? `${totalReviews} Review${totalReviews !== 1 ? 's' : ''}` : 'No Reviews';

        if (reviews.length === 0) {
            listEl.innerHTML = '<p class="no-reviews-message">Be the first to review this property!</p>';
            return;
        }

        const reviewsHtml = reviews.map(review => {
            const stars = Array(5).fill(0).map((_, i) => 
                `<span class="review-star ${i < review.rating ? 'filled' : ''}">★</span>`
            ).join('');

            return `
                <div class="review-item">
                    <div class="review-header">
                        <div class="review-avatar">
                            <img src="${review.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.name) + '&size=80&background=4F46E5&color=fff'}" 
                                 alt="${review.name}">
                        </div>
                        <div class="review-meta">
                            <h4 class="reviewer-name">${review.name}</h4>
                            <div class="review-stars">${stars}</div>
                        </div>
                    </div>
                    <p class="review-text">${review.text}</p>
                    <span class="review-date">${review.date}</span>
                </div>
            `;
        }).join('');

        listEl.innerHTML = reviewsHtml;
    }

    setupReviewForm() {
        const starInputs = document.querySelectorAll('.star-input');
        const ratingValue = document.getElementById('rating-value');
        let selectedRating = 0;

        // Star rating interaction
        starInputs.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                ratingValue.value = selectedRating;
                
                // Update visual state
                starInputs.forEach((s, index) => {
                    if (index < selectedRating) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });

            star.addEventListener('mouseenter', () => {
                const hoverRating = parseInt(star.dataset.rating);
                starInputs.forEach((s, index) => {
                    if (index < hoverRating) {
                        s.classList.add('hover');
                    } else {
                        s.classList.remove('hover');
                    }
                });
            });
        });

        document.getElementById('star-rating-input').addEventListener('mouseleave', () => {
            starInputs.forEach((s, index) => {
                s.classList.remove('hover');
            });
        });

        // Form submission
        const reviewForm = document.getElementById('review-form');
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (selectedRating === 0) {
                alert('Please select a rating');
                return;
            }

            const formData = {
                rating: selectedRating,
                name: document.getElementById('reviewer-name').value,
                email: document.getElementById('reviewer-email').value,
                text: document.getElementById('review-text').value,
                propertyId: this.property.id
            };

            // TODO: Send to API
            console.log('Review submitted:', formData);
            alert('Thank you for your review! It will be published after moderation.');
            
            // Reset form
            reviewForm.reset();
            selectedRating = 0;
            ratingValue.value = 0;
            starInputs.forEach(s => s.classList.remove('selected'));
        });
    }

    async loadSimilarHomes() {
        try {
            // Fetch all properties
            const response = await this.apiService.getAllProperties();
            
            if (response.success && response.data) {
                // Filter properties with same status, excluding current property
                const filtered = response.data.filter(prop => {
                    // Exclude current property
                    if (prop.id === this.property.id) {
                        return false;
                    }
                    
                    // Filter by same status (rent or sale)
                    // estatus: 'renta' or 'venta'
                    return prop.estatus === this.property.estatus;
                });

                // Take maximum 4 properties
                this.similarHomes = filtered.slice(0, 4);

                console.log('Similar homes found:', this.similarHomes.length, 'Status:', this.property.estatus);

                this.renderSimilarHomes();
            }
        } catch (error) {
            console.error('Error loading similar homes:', error);
        }
    }

    renderSimilarHomes() {
        const track = document.getElementById('similar-homes-track');
        const dotsContainer = document.getElementById('similar-dots');

        if (this.similarHomes.length === 0) {
            track.innerHTML = '<p style="text-align: center; padding: 2rem; color: #94A3B8;">No similar properties found.</p>';
            return;
        }

        // Render property cards
        const cardsHtml = this.similarHomes.map(prop => {
            const property = new Property(prop);
            const precio = formatCurrency(property.precio);
            const statusText = property.isForRent ? 'FOR RENT' : 'FOR SALE';
            const statusClass = property.isForRent ? 'badge-for-rent' : 'badge-for-sale';

            return `
                <div class="similar-property-card" data-property-id="${property.id}">
                    <div class="similar-property-image">
                        <img src="${property.imagen_principal}" alt="${property.titulo}">
                        <div class="similar-property-badges">
                            ${property.destacada ? '<span class="property-badge badge-featured">FEATURED</span>' : ''}
                            <span class="property-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div class="similar-property-content">
                        <h3 class="similar-property-title">${property.titulo}</h3>
                        <p class="similar-property-address">
                            <span class="material-icons">location_on</span>
                            ${property.direccion}, ${property.ciudad}
                        </p>
                        <div class="similar-property-price">
                            <span class="price-amount">$${precio}</span>
                            ${property.isForRent ? '<span class="price-period">/ month</span>' : ''}
                        </div>
                        <div class="similar-property-features">
                            ${property.habitaciones > 0 ? `
                                <div class="feature-item">
                                    <span class="material-icons">hotel</span>
                                    <span>${property.habitaciones} Br</span>
                                </div>
                            ` : ''}
                            ${property.banos > 0 ? `
                                <div class="feature-item">
                                    <span class="material-icons">bathtub</span>
                                    <span>${property.banos} Ba</span>
                                </div>
                            ` : ''}
                            ${property.metros_cuadrados > 0 ? `
                                <div class="feature-item">
                                    <span class="material-icons">square_foot</span>
                                    <span>${property.metros_cuadrados} SqFt</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        track.innerHTML = cardsHtml;

        // Setup click handlers
        document.querySelectorAll('.similar-property-card').forEach(card => {
            card.addEventListener('click', () => {
                const propertyId = card.dataset.propertyId;
                window.location.href = `property-detail.html?id=${propertyId}`;
            });
        });

        // Render dots (one dot for every 2 properties)
        const totalSlides = Math.ceil(this.similarHomes.length / 2);
        const dotsHtml = Array(totalSlides).fill(0).map((_, index) => 
            `<button class="carousel-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>`
        ).join('');
        dotsContainer.innerHTML = dotsHtml;

        // Setup carousel controls
        this.setupSimilarCarousel(totalSlides);
    }

    setupSimilarCarousel(totalSlides) {
        const track = document.getElementById('similar-homes-track');
        const prevBtn = document.getElementById('similar-prev');
        const nextBtn = document.getElementById('similar-next');
        const dots = document.querySelectorAll('#similar-dots .carousel-dot');

        const updateCarousel = () => {
            // Check if mobile view
            const isMobile = window.innerWidth <= 768;
            const cardsPerSlide = isMobile ? 1 : 2;
            const actualTotalSlides = Math.ceil(this.similarHomes.length / cardsPerSlide);
            
            // Adjust current slide if needed
            if (this.similarCurrentSlide >= actualTotalSlides) {
                this.similarCurrentSlide = actualTotalSlides - 1;
            }

            // Move track
            const slideWidth = isMobile ? 100 : 50;
            const offset = this.similarCurrentSlide * slideWidth * cardsPerSlide;
            track.style.transform = `translateX(-${offset}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.similarCurrentSlide);
            });

            // Update button states
            prevBtn.disabled = this.similarCurrentSlide === 0;
            nextBtn.disabled = this.similarCurrentSlide >= actualTotalSlides - 1;
        };

        // Previous button
        prevBtn.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 768;
            const cardsPerSlide = isMobile ? 1 : 2;
            const actualTotalSlides = Math.ceil(this.similarHomes.length / cardsPerSlide);
            
            if (this.similarCurrentSlide > 0) {
                this.similarCurrentSlide--;
                updateCarousel();
            }
        });

        // Next button
        nextBtn.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 768;
            const cardsPerSlide = isMobile ? 1 : 2;
            const actualTotalSlides = Math.ceil(this.similarHomes.length / cardsPerSlide);
            
            if (this.similarCurrentSlide < actualTotalSlides - 1) {
                this.similarCurrentSlide++;
                updateCarousel();
            }
        });

        // Dots
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.similarCurrentSlide = parseInt(dot.dataset.slide);
                updateCarousel();
            });
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateCarousel();
            }, 200);
        });

        // Initialize
        updateCarousel();
    }

    renderAmenities() {
        // This would be populated from property.caracteristicas if available
        const container = document.getElementById('property-amenities');
        const section = document.getElementById('property-amenities-section');

        if (!this.property.caracteristicas || this.property.caracteristicas.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        
        const amenities = this.property.caracteristicas.map(amenity => `
            <div class="amenity-item">
                <span class="material-icons">check_circle</span>
                <span>${amenity}</span>
            </div>
        `).join('');

        container.innerHTML = amenities;
    }

    changeMainImage(index) {
        this.currentImageIndex = index;
        document.getElementById('main-image').src = this.images[index];

        // Update active thumbnail
        document.querySelectorAll('.gallery-thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    setupEventListeners() {
        // View Photos button
        const viewPhotosBtn = document.getElementById('view-photos-btn');
        if (viewPhotosBtn) {
            viewPhotosBtn.addEventListener('click', () => this.openGalleryModal());
        }

        // Google Maps button
        const googleMapsBtn = document.getElementById('btn-google-maps');
        if (googleMapsBtn) {
            googleMapsBtn.addEventListener('click', () => {
                const address = encodeURIComponent(this.property.fullAddress);
                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
            });
        }

        // Call agent button
        const callBtn = document.getElementById('btn-call-agent');
        if (callBtn && this.agent && this.agent.telefono) {
            callBtn.addEventListener('click', () => {
                window.location.href = `tel:${this.agent.telefono}`;
            });
        }

        // Gallery modal
        const modal = document.getElementById('gallery-modal');
        const closeBtn = document.getElementById('gallery-modal-close');
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeGalleryModal());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateGallery(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateGallery(1));
        }

        // Close modal on background click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeGalleryModal();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeGalleryModal();
                } else if (e.key === 'ArrowLeft') {
                    this.navigateGallery(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigateGallery(1);
                }
            }
        });

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Formulario enviado. Esta funcionalidad se implementará en el futuro.');
            });
        }
    }

    openGalleryModal() {
        const modal = document.getElementById('gallery-modal');
        modal.classList.add('active');
        this.updateGalleryModal();
    }

    closeGalleryModal() {
        const modal = document.getElementById('gallery-modal');
        modal.classList.remove('active');
    }

    navigateGallery(direction) {
        this.currentImageIndex = (this.currentImageIndex + direction + this.images.length) % this.images.length;
        this.updateGalleryModal();
    }

    updateGalleryModal() {
        const img = document.getElementById('gallery-modal-image');
        const counter = document.getElementById('gallery-counter');
        
        img.src = this.images[this.currentImageIndex];
        counter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
    }

    showError(message) {
        const loadingDiv = document.getElementById('property-loading');
        loadingDiv.innerHTML = `
            <div class="error-message">
                <span class="material-icons" style="font-size: 48px; color: #e74c3c;">error</span>
                <h2>${message}</h2>
                <a href="index.html" class="btn-primary">Volver al inicio</a>
            </div>
        `;
    }
}

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const viewModel = new PropertyDetailViewModel();
    viewModel.init();
});
