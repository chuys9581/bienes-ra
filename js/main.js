import { ApiService } from './services/ApiService.js';
import { Modal } from './components/Modal.js';
import { CarouselViewModel } from './viewmodels/CarouselViewModel.js';
import { PropertyListViewModel } from './viewmodels/PropertyListViewModel.js';
import { FeaturedPropertiesViewModel } from './viewmodels/FeaturedPropertiesViewModel.js';
import { BestSellingPropertiesViewModel } from './viewmodels/BestSellingPropertiesViewModel.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar Servicios Base
    const apiService = new ApiService();

    // 2. Inicializar Componentes Globales
    const modal = new Modal('propiedadModal', 'modalOverlay', 'modalClose', 'modalBody');

    // 3. Inicializar ViewModels
    const carouselVM = new CarouselViewModel(apiService);
    const featuredVM = new FeaturedPropertiesViewModel(apiService, modal);
    const bestSellingVM = new BestSellingPropertiesViewModel(apiService, modal);
    const propertyListVM = new PropertyListViewModel(apiService, modal);

    // 4. Iniciar Lógica
    console.log('Inmobiliaria App Initializing...');

    // Ejecutar inicializaciones en paralelo
    await Promise.all([
        carouselVM.init(),
        featuredVM.init(),
        bestSellingVM.init(),
        propertyListVM.init()
    ]);

    // 5. Inicializar lógica auxiliar (menú, scroll) que no requiere mucha arquitectura
    initNavigation();
    initScrollEffects();
});

// --- Lógica Legacy Básica (UI) Mantenida Simple ---

function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer click en links en móvil
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navMenu?.classList.remove('active'));
    });
}

function initScrollEffects() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
}
