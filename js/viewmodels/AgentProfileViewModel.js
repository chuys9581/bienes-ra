
export class AgentProfileViewModel {
    constructor() {
        this.agentId = this.getAgentIdFromUrl();
        this.container = document.getElementById('agent-profile-content');

    }

    async init() {
        if (!this.agentId) {
            this.renderError('Agente no especificado.');
            return;
        }
        await this.loadAgentDetails();
        await this.loadAgentProperties();
    }

    getAgentIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async loadAgentDetails() {
        try {
            const response = await fetch(`./api/agentes.php?id=${this.agentId}`);
            const data = await response.json();

            if (data.success) {
                this.render(data.data);
            } else {
                this.renderError('Agente no encontrado.');
            }
        } catch (error) {
            console.error('Error loading agent details:', error);
            this.renderError('Error al cargar los detalles del agente.');
        }
    }

    render(agent) {
        if (!agent) return;

        // Update Breadcrumb
        const fullName = `${agent.nombre} ${agent.apellido}`;


        // Render Content
        const initials = `${(agent.nombre || '')[0] || ''}${(agent.apellido || '')[0] || ''}`.toUpperCase();
        const imageHtml = agent.imagen
            ? `<img src="${agent.imagen}" alt="${fullName}" class="profile-agent-photo">`
            : `<div class="profile-agent-photo-placeholder">${initials}</div>`;

        // Mock data for missing fields based on design
        const role = agent.cargo || 'Agente Inmobiliario';
        const company = 'Inmobiliaria Elite';
        const description = agent.descripcion || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse suscorém ipsum dolor sit ametcips um dolor sit t, consecte tur atetur cing elit. Suspe ndisse susco rem ipsum dolor sit ametcips um doloramet.';
        const mobile = agent.telefono || '+52 000 000 0000';
        const email = agent.email || 'correo@ejemplo.com';
        // const website = 'https://inmoelite.com/';
        // const office = '+52 111 222 3333';
        // const fax = '1-323 900 6800';

        const cleanPhone = mobile.replace(/\D/g, ''); // Remove non-numeric characters for links

        this.container.innerHTML = `
            <div class="agent-profile-left">
                <div class="profile-image-container">
                    ${imageHtml}
                </div>
            </div>
            <div class="agent-profile-right">
                <h1 class="profile-agent-name">${fullName}</h1>
                <p class="profile-agent-role">${role}</p>
                <p class="profile-agent-company">Agente en <strong>${company}</strong></p>
                
                <div class="profile-agent-description">
                    <p>${description}</p>
                </div>

                <div class="profile-contact-grid">
                    <div class="contact-item">
                        <span class="contact-label">Móvil</span>
                        <span class="contact-value"><a href="tel:${mobile}">${mobile}</a></span>
                    </div>
                    <div class="contact-item">
                        <span class="contact-label">Email</span>
                        <span class="contact-value"><a href="mailto:${email}">${email}</a></span>
                    </div>
                    <div class="contact-item" style="cursor: pointer;" onclick="window.open('https://wa.me/${cleanPhone}', '_blank')">
                        <span class="contact-label">WhatsApp</span>
                        <span class="contact-value" style="color: #25D366; font-weight: bold;"><i class="fab fa-whatsapp"></i> Enviar Mensaje</span>
                    </div>
                </div>
                
                <hr class="profile-divider">

                <div class="profile-footer-row">
                    <div class="agent-rating">
                        <i class="fas fa-star" style="color: #FFC107;"></i>
                        <i class="fas fa-star" style="color: #FFC107;"></i>
                        <i class="fas fa-star" style="color: #FFC107;"></i>
                        <i class="fas fa-star" style="color: #FFC107;"></i>
                        <i class="fas fa-star" style="color: #FFC107;"></i>
                        <span class="review-count">(1 review)</span>
                    </div>
                    <div class="profile-social-links">
                        <a href="#" class="profile-social-icon"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="profile-social-icon"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="profile-social-icon"><i class="fab fa-linkedin-in"></i></a>
                        <a href="#" class="profile-social-icon"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        `;

        // Update Contact Form Sidebar with Agent Details
        const formAgentName = document.getElementById('form-agent-name');
        const formAgentEmail = document.getElementById('form-agent-email');
        const formAgentPhone = document.getElementById('form-agent-phone');
        const formAgentPhotoContainer = document.getElementById('form-agent-photo-container');
        const btnCallAgent = document.getElementById('btn-call-agent');

        if (formAgentName) formAgentName.textContent = fullName;
        if (formAgentEmail) formAgentEmail.textContent = email;
        if (formAgentPhone) formAgentPhone.textContent = mobile;
        if (formAgentPhotoContainer) {
            const smallImageHtml = agent.imagen
                ? `<img src="${agent.imagen}" alt="${fullName}" style="width: 100%; height: 100%; object-fit: cover;">`
                : `<div style="width: 100%; height: 100%; background: #00B4D8; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${initials}</div>`;
            formAgentPhotoContainer.innerHTML = smallImageHtml;
        }

        if (btnCallAgent) {
            btnCallAgent.onclick = () => {
                window.location.href = `tel:${mobile}`;
            };
        }
    }

    async loadAgentProperties() {
        const container = document.getElementById('agent-properties-container');
        if (!container) return;

        try {
            const response = await fetch(`./api/agentes.php?action=get_assigned_properties&agente_id=${this.agentId}`);
            const data = await response.json();

            if (data.success) {
                this.properties = data.data; // Store all properties
                this.renderProperties(this.properties);
                this.initFilters(); // Initialize filters after loading
            } else {
                container.innerHTML = '<p>No se pudieron cargar las propiedades.</p>';
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            container.innerHTML = '<p>Error al cargar las propiedades.</p>';
        }

        // Load reviews after properties
        this.loadReviews();
    }

    initFilters() {
        const tabs = document.querySelectorAll('.listing-tabs .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active state
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.color = '#94A3B8';
                    t.style.borderBottom = 'none';
                });
                tab.classList.add('active');
                tab.style.color = '#1a1a1a';
                tab.style.borderBottom = '2px solid #00B4D8';

                // Filter logic
                const filter = tab.dataset.filter;
                this.filterProperties(filter);
            });
        });
    }

    filterProperties(filter) {
        if (!this.properties) return;

        let filtered = this.properties;
        if (filter !== 'all') {
            filtered = this.properties.filter(p => p.estado_propiedad.toLowerCase() === filter.toLowerCase());
        }
        this.renderProperties(filtered);
    }

    renderProperties(properties) {
        const container = document.getElementById('agent-properties-container');
        if (!container) return;

        if (!properties || properties.length === 0) {
            container.innerHTML = '<p>Este agente no tiene propiedades asignadas actualmente.</p>';
            return;
        }

        container.innerHTML = properties.map(p => this.createPropertyCard(p)).join('');
    }

    createPropertyCard(propiedad) {
        const precio = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(propiedad.precio);
        const imagen = propiedad.imagen_principal || 'assets/images/placeholder.jpg';

        return `
            <div class="propiedad-card" style="box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: white; cursor: pointer;" onclick="window.location.href='propiedad.html?id=${propiedad.id}'">
                <div class="propiedad-imagen" style="position: relative; height: 200px;">
                    <img src="${imagen}" alt="${propiedad.titulo}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="propiedad-badge" style="position: absolute; top: 10px; right: 10px; background: #00B4D8; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase;">${propiedad.estado_propiedad}</div>
                    ${propiedad.destacada == 1 ? '<div class="propiedad-tag" style="position: absolute; top: 10px; left: 10px; background: #FF6B35; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase;">DESTACADA</div>' : ''}
                </div>
                <div class="propiedad-content" style="padding: 20px;">
                    <h3 class="propiedad-titulo" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 5px; color: #1a1a1a;">${propiedad.titulo}</h3>
                    <p class="propiedad-ubicacion" style="color: #64748B; font-size: 0.9rem; margin-bottom: 15px;">${propiedad.direccion || propiedad.ciudad}</p>
                    
                    <div class="propiedad-precio" style="font-size: 1.2rem; font-weight: 800; color: #1a1a1a; margin-bottom: 15px;">
                        ${precio}
                    </div>

                    <div class="propiedad-detalles" style="display: flex; gap: 15px; color: #64748B; font-size: 0.9rem;">
                        <span><i class="fas fa-bed"></i> ${propiedad.habitaciones || '-'} Hab</span>
                        <span><i class="fas fa-bath"></i> ${propiedad.banos || '-'} Baños</span>
                        <span><i class="fas fa-ruler-combined"></i> ${propiedad.metros_cuadrados || '-'} m²</span>
                    </div>
                </div>
            </div>
        `;
    }

    // --- Reviews Logic ---

    async loadReviews() {
        const listContainer = document.getElementById('reviews-list');
        if (!listContainer) return;

        // Initialize form logic
        this.setupReviewForm();

        try {
            const response = await fetch(`./api/agentes.php?action=get_reviews&agente_id=${this.agentId}`);
            const data = await response.json();

            if (data.success) {
                this.renderReviews(data.data);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    renderReviews(data) {
        const { reviews, stats } = data;
        const listContainer = document.getElementById('reviews-list');
        const avgDisplay = document.querySelector('.average-rating h3');
        const countDisplay = document.getElementById('total-reviews-count');
        const starContainer = document.querySelector('.average-rating .rating-stars');

        // Update Stats
        const avg = parseFloat(stats.average_rating || 0).toFixed(1);
        if (avgDisplay) avgDisplay.textContent = avg;
        if (countDisplay) countDisplay.textContent = stats.total_reviews;

        // Render Stars Summary
        if (starContainer) {
            starContainer.innerHTML = this.getStarHtml(Math.round(avg));
        }

        // Render List
        if (reviews.length === 0) {
            listContainer.innerHTML = '<p style="color: #64748B;">No hay reseñas todavía. ¡Sé el primero en opinar!</p>';
            return;
        }

        listContainer.innerHTML = reviews.map(r => `
            <div class="review-item" style="border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
                <div class="review-header" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div class="reviewer-info">
                        <h4 style="margin: 0; color: #1a1a1a;">${r.user_name}</h4>
                        <span style="font-size: 0.8rem; color: #94A3B8;">${new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="review-stars" style="color: #FFC107;">
                        ${this.getStarHtml(r.rating)}
                    </div>
                </div>
                <p class="review-comment" style="color: #475569; line-height: 1.6;">${r.comment}</p>
            </div>
        `).join('');
    }

    getStarHtml(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    setupReviewForm() {
        const btnWrite = document.getElementById('btn-write-review');
        const formContainer = document.getElementById('write-review-form');
        const form = document.getElementById('review-form');
        const stars = document.querySelectorAll('.star-rating-input i');
        const ratingInput = document.getElementById('review-rating');

        if (btnWrite) {
            btnWrite.onclick = () => {
                formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
            };
        }

        // Star interaction
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = star.dataset.value;
                ratingInput.value = val;
                stars.forEach(s => {
                    s.classList.remove('fas');
                    s.classList.add('far');
                    s.style.color = '#ddd';
                    if (s.dataset.value <= val) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                        s.style.color = '#FFC107';
                    }
                });
            });
        });

        // Form Submit
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const name = document.getElementById('review-name').value;
                const comment = document.getElementById('review-comment').value;
                const rating = ratingInput.value;

                if (rating == 0) {
                    alert('Por favor selecciona una calificación');
                    return;
                }

                try {
                    const response = await fetch('./api/agentes.php?action=add_review', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            agente_id: this.agentId,
                            user_name: name,
                            comment: comment,
                            rating: rating
                        })
                    });
                    const result = await response.json();

                    if (result.success) {
                        alert('¡Reseña enviada!');
                        form.reset();
                        formContainer.style.display = 'none';
                        this.loadReviews(); // Reload
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    console.error(error);
                    alert('Error al enviar la reseña');
                }
            };
        }
    }

    renderError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="error-message text-center">${message}</div>`;
        }
    }
}
