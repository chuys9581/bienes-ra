export class Footer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <!-- Columna 1: Logo e Información -->
                <div class="footer-col footer-col-info">
                    <div class="footer-logo">
                        <span class="material-icons logo-icon">home</span>
                        <span class="logo-text">Inmobiliaria <span class="elite">Elite</span></span>
                    </div>
                    <div class="footer-contact">
                        <p class="footer-address">101 Howard Street #2 San Francisco</p>
                        <p class="footer-email">contact@inmoe.co</p>
                        <p class="footer-phone">(+91) 123 09870</p>
                        <p class="footer-website">www.inmobid.com</p>
                    </div>
                </div>

                <!-- Columna 2: Búsquedas Populares -->
                <div class="footer-col">
                    <h4>Búsquedas Populares</h4>
                    <ul>
                        <li><a href="#">Apartamento en Renta</a></li>
                        <li><a href="#">Apartamento Caro to Venta</a></li>
                        <li><a href="#">Oficinas en Compra</a></li>
                        <li><a href="#">Oficinas en Renta</a></li>
                    </ul>
                </div>

                <!-- Columna 3: Enlaces Rápidos -->
                <div class="footer-col">
                    <h4>Enlaces Rápidos</h4>
                    <ul>
                        <li><a href="#">Términos de Uso</a></li>
                        <li><a href="#">Política de Privacidad</a></li>
                        <li><a href="#">Precios</a></li>
                        <li><a href="#">Contacto de Soporte</a></li>
                        <li><a href="#">Carreras</a></li>
                        <li><a href="#">Preguntas Frecuentes</a></li>
                    </ul>
                </div>

                <!-- Columna 4: Newsletter -->
                <div class="footer-col footer-col-newsletter">
                    <h4>Regístrate para Nuestro Newsletter</h4>
                    <p class="newsletter-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi non
                        quis.</p>
                    <form class="newsletter-form">
                        <input type="email" placeholder="Tu correo" required>
                        <button type="submit">Suscribirse</button>
                    </form>
                    <div class="social-links">
                        <a href="#" class="social-link" aria-label="Twitter"><span
                                class="material-icons">tag_faces</span></a>
                        <a href="#" class="social-link" aria-label="Facebook"><span
                                class="material-icons">facebook</span></a>
                        <a href="#" class="social-link" aria-label="Instagram"><span
                                class="material-icons">photo_camera</span></a>
                        <a href="#" class="social-link" aria-label="LinkedIn"><span
                                class="material-icons">business</span></a>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <div class="footer-links">
                        <a href="#">Términos de Uso</a>
                        <span class="separator">-</span>
                        <a href="#">Política de Privacidad</a>
                    </div>
                    <p class="footer-copyright">© 2026 Inmobid. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
        `;
    }
}
