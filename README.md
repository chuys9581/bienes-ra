# Proyecto Inmobiliaria - Guía de Inicio

## 📋 Descripción
Proyecto completo de sitio web inmobiliario con base de datos MySQL, API REST en PHP, y frontend moderno con HTML, CSS y JavaScript.

## 🚀 Características
- ✅ Base de datos MySQL con esquema completo
- ✅ API REST con PHP para gestión de propiedades
- ✅ Frontend moderno con diseño dark mode
- ✅ Sistema de búsqueda y filtros
- ✅ Modal de detalles de propiedades
- ✅ Formulario de contacto
- ✅ Diseño totalmente responsive
- ✅ Animaciones y efectos visuales
- ✅ Docker Compose para MySQL y phpMyAdmin

## 📁 Estructura del Proyecto
```
inmobiliaria-project/
├── docker-compose.yml          # Configuración de Docker
├── database/
│   └── init.sql               # Script de inicialización de BD
├── api/
│   ├── config.php             # Configuración de conexión
│   ├── propiedades.php        # API de propiedades
│   └── consultas.php          # API de consultas
├── index.html                 # Página principal
├── styles.css                 # Estilos CSS
└── app.js                     # Lógica JavaScript
```

## 🛠️ Instalación

### 1. Iniciar Docker
```bash
cd C:\Users\JimenezJaimesJesús\Documents\inmobiliaria-project
docker-compose up -d
```

### 2. Verificar Contenedores
Los servicios estarán disponibles en:
- **MySQL**: `localhost:3306`
- **phpMyAdmin**: `http://localhost:8080`

### 3. Credenciales de Base de Datos
- **Host**: localhost
- **Puerto**: 3306
- **Base de datos**: inmobiliaria_db
- **Usuario**: inmobiliaria_user
- **Contraseña**: inmobiliaria_pass
- **Usuario root**: root / rootpassword

## 🌐 Uso del Proyecto

### Backend (PHP)
Para usar la API, necesitas un servidor PHP. Opciones:

1. **Con XAMPP/WAMP** (Recomendado para Windows):
   - Copia la carpeta del proyecto a `C:\xampp\htdocs\`
   - Accede a `http://localhost/inmobiliaria-project/`

2. **Con PHP Built-in Server**:
   ```bash
   cd C:\Users\JimenezJaimesJesús\Documents\inmobiliaria-project
   php -S localhost:8000
   ```

### Frontend
Abre `index.html` directamente en tu navegador o usa un servidor local:
```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server -p 8000
```

## 🔌 Endpoints de la API

### Propiedades
- `GET /api/propiedades.php` - Obtener todas las propiedades
- `GET /api/propiedades.php?id=1` - Obtener una propiedad
- `GET /api/propiedades.php?ciudad=CDMX` - Filtrar por ciudad
- `GET /api/propiedades.php?estado_propiedad=venta` - Filtrar por estado
- `POST /api/propiedades.php` - Crear nueva propiedad
- `PUT /api/propiedades.php` - Actualizar propiedad
- `DELETE /api/propiedades.php?id=1` - Eliminar propiedad

### Consultas
- `GET /api/consultas.php` - Obtener todas las consultas
- `POST /api/consultas.php` - Crear nueva consulta

## 📊 Base de Datos

### Tablas Principales
- **propiedades**: Información de las propiedades
- **tipo_propiedad**: Tipos (Casa, Departamento, etc.)
- **agentes**: Información de agentes
- **consultas**: Formularios de contacto
- **caracteristicas**: Características de propiedades
- **imagenes_propiedad**: Imágenes adicionales

### Datos de Ejemplo
La base de datos incluye:
- 6 tipos de propiedades
- 10 características comunes
- 3 propiedades de ejemplo
- 1 agente de ejemplo

## 🎨 Personalización

### Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary: #4F46E5;
    --secondary: #EC4899;
    --accent: #F59E0B;
}
```

### API URL
Modificar en `app.js`:
```javascript
const API_URL = 'http://localhost/inmobiliaria-project/api';
```

## 🐛 Solución de Problemas

### La API no funciona
1. Verifica que MySQL esté corriendo: `docker ps`
2. Verifica las credenciales en `api/config.php`
3. Revisa los logs de PHP

### No se cargan las propiedades
- El frontend tiene datos de ejemplo que se muestran si la API no está disponible
- Abre la consola del navegador para ver errores

### Error de CORS
- Asegúrate de que la API y el frontend estén en el mismo dominio
- Verifica los headers CORS en `api/config.php`

## 📝 Próximos Pasos
- [ ] Agregar sistema de autenticación
- [ ] Implementar subida de imágenes
- [ ] Crear panel de administración
- [ ] Agregar mapas interactivos
- [ ] Implementar chat en vivo

## 📄 Licencia
Proyecto de ejemplo para uso educativo y comercial.

---
**Desarrollado con ❤️ para Inmobiliaria Elite**
