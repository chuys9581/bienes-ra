import { ApiService } from '../services/ApiService.js';

export class AgentsViewModel {
    constructor() {
        this.apiService = new ApiService();
        this.agents = [];
        this.container = document.querySelector('.agents-grid'); // Will need to add this to index.html
        this.loadingElement = document.getElementById('agents-loading'); // Placeholder
    }

    async init() {
        await this.loadAgents();
    }

    async loadAgents() {
        try {
            const response = await fetch('./api/agentes.php'); // Using relative path as ApiService might need adjustment for this specific endpoint or we can use ApiService if we add a method
            // Actually, let's use ApiService pattern if possible, but ApiService.js is tailored for properties.
            // Let's extend ApiService or just use fetch here for simplicity as it's a specific read.
            // Better: Add getAgents to ApiService? No, keep it simple here or update ApiService. 
            // Let's just use fetch for now or update ApiService. 
            // Checking ApiService.js... it has a generic getProperties. 
            // Let's just do a direct fetch since ApiService is Property-centric.

            const data = await response.json();

            if (data.success) {
                this.agents = data.data.filter(a => a.activo == 1);
                this.render();
            } else {
                this.renderError();
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            this.renderError();
        }
    }

    render() {
        const section = document.querySelector('.agents-section');
        if (!section) return;

        const container = section.querySelector('.agents-container');
        if (!container) return;

        if (this.agents.length === 0) {
            container.innerHTML = '<p class="text-center">No hay agentes disponibles en este momento.</p>';
            return;
        }

        // Logic: If > 5 agents, use carousel. If <= 5, use grid.
        // User said: "un maximo de 5, si son mas debe de conveftirse en un carousel manual, no automatico."

        let html = '';
        const useCarousel = this.agents.length > 5;

        if (useCarousel) {
            html = this.renderCarousel();
        } else {
            html = this.renderGrid();
        }

        container.innerHTML = html;

        if (useCarousel) {
            this.initCarouselEvents();
        }
    }

    renderAgentCard(agent) {
        const initials = `${(agent.nombre || '')[0] || ''}${(agent.apellido || '')[0] || ''}`.toUpperCase();
        const imageHtml = agent.imagen
            ? `<img src="${agent.imagen}" alt="${agent.nombre}" class="agent-photo">`
            : `<div class="agent-photo-placeholder">${initials}</div>`;

        return `
            <div class="agent-card-public" onclick="window.location.href='agent-profile.html?id=${agent.id}'" style="cursor: pointer;">
                <div class="agent-card-inner">
                    <div class="agent-image-wrapper">
                        ${imageHtml}
                    </div>
                    <div class="agent-info">
                        <h3 class="agent-name">${agent.nombre} ${agent.apellido}</h3>
                        <p class="agent-role">${agent.cargo || 'Agente Inmobiliario'}</p>
                    </div>
                    <div class="agent-hover-details">
                        <div class="agent-social" onclick="event.stopPropagation()">
                            <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="social-icon"><i class="fab fa-linkedin-in"></i></a>
                            <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                        </div>
                        <div class="agent-properties-link">
                            <span class="count">${agent.total_propiedades || 0}</span> Propiedades
                            <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderGrid() {
        return `
            <div class="agents-grid-view">
                ${this.agents.map(agent => this.renderAgentCard(agent)).join('')}
            </div>
        `;
    }

    renderCarousel() {
        return `
            <div class="agents-carousel-wrapper">
                <button class="carousel-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
                <div class="agents-carousel-track-container">
                    <ul class="agents-carousel-track">
                        ${this.agents.map(agent => `<li class="agents-carousel-slide">${this.renderAgentCard(agent)}</li>`).join('')}
                    </ul>
                </div>
                <button class="carousel-btn next-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
    }

    initCarouselEvents() {
        const track = document.querySelector('.agents-carousel-track');
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');

        // Configuration
        const slideWidth = slides[0].getBoundingClientRect().width;

        // Arrange slides next to one another
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });

        let currentSlideIndex = 0;
        const maxIndex = slides.length - 1; // Simplistic view, might need adjustment for visible items

        // Actually, for a multi-item carousel, it's slightly more complex. 
        // Let's assume scrolling by one card width.

        // Visible items calculation
        const containerWidth = document.querySelector('.agents-carousel-track-container').getBoundingClientRect().width;
        const visibleItems = Math.floor(containerWidth / slideWidth);

        const moveTrack = (amount) => {
            track.style.transform = `translateX(-${amount}px)`;
        }

        let currentPosition = 0;

        nextButton.addEventListener('click', () => {
            // Logic to slide next
            // This is a basic implementation, might need refinement for "manual carousel"
            // Let's scroll by one slide width
            const trackWidth = track.scrollWidth;
            const containerWidth = track.parentElement.clientWidth;
            const maxScroll = trackWidth - containerWidth;

            if (currentPosition < maxScroll) {
                currentPosition += slideWidth + 20; // + gap
                if (currentPosition > maxScroll) currentPosition = maxScroll;
                moveTrack(currentPosition);
            }
        });

        prevButton.addEventListener('click', () => {
            if (currentPosition > 0) {
                currentPosition -= slideWidth + 20;
                if (currentPosition < 0) currentPosition = 0;
                moveTrack(currentPosition);
            }
        });
    }

    renderError() {
        console.log('Error loading agents');
    }
}
