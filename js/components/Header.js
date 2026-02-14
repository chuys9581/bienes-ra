export class Header {
    constructor(containerId) {
        this.containerId = containerId;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="container">
                <nav class="navbar">
                    <div class="logo">
                        <a href="index.html" style="text-decoration: none; display: flex; align-items: center; color: inherit;">
                            <span class="material-icons logo-icon">home</span>
                            <span class="logo-text">Inmobiliaria <span class="elite">Elite</span></span>
                        </a>
                    </div>
                    <ul class="nav-menu" id="navMenu">
                        <li><a href="index.html" class="nav-link">Inicio</a></li>
                        <li><a href="index.html#propiedades" class="nav-link">Propiedades</a></li>
                        <li><a href="index.html#servicios" class="nav-link">Servicios</a></li>
                        <li><a href="index.html#contacto" class="nav-link">Contacto</a></li>
                    </ul>
                    <button class="menu-toggle" id="menuToggle">
                        <span class="material-icons">menu</span>
                    </button>
                </nav>
            </div>
        `;

        this.initLogic();
    }

    initLogic() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');
        const header = document.getElementById(this.containerId);

        // Toggle Menú Móvil
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Cerrar menú al hacer click en links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navMenu?.classList.remove('active'));
        });

        // Efecto Scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}
