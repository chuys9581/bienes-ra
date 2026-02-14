import { ApiService } from './services/ApiService.js';
import { Modal } from './components/Modal.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { CarouselViewModel } from './viewmodels/CarouselViewModel.js';
import { PropertyListViewModel } from './viewmodels/PropertyListViewModel.js';
import { FeaturedPropertiesViewModel } from './viewmodels/FeaturedPropertiesViewModel.js';
import { BestSellingPropertiesViewModel } from './viewmodels/BestSellingPropertiesViewModel.js';
import { BestRentPropertiesViewModel } from './viewmodels/BestRentPropertiesViewModel.js';
import { AgentsViewModel } from './viewmodels/AgentsViewModel.js';
import { AgentProfileViewModel } from './viewmodels/AgentProfileViewModel.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar Servicios Base
    const apiService = new ApiService();

    // 2. Inicializar Componentes Globales
    const modal = new Modal('propiedadModal', 'modalOverlay', 'modalClose', 'modalBody');

    // Header & Footer
    new Header('main-header').render();
    new Footer('main-footer').render();

    // 3. Inicializar ViewModels
    const carouselVM = new CarouselViewModel(apiService);
    const featuredVM = new FeaturedPropertiesViewModel(apiService, modal);
    const bestSellingVM = new BestSellingPropertiesViewModel(apiService, modal);
    const bestRentVM = new BestRentPropertiesViewModel(apiService, modal);
    const propertyListVM = new PropertyListViewModel(apiService, modal);
    const agentsVM = new AgentsViewModel(apiService);

    // 4. Iniciar Lógica
    console.log('Inmobiliaria App Initializing...');

    // Ejecutar inicializaciones en paralelo
    await Promise.all([
        carouselVM.init(),
        featuredVM.init(),
        bestSellingVM.init(),
        bestRentVM.init(),
        propertyListVM.init(),
        agentsVM.init(),
        new AgentProfileViewModel().init()
    ]);
});
