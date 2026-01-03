🎭 Jorge Bárcena - Portfolio Personal
Web personal y profesional de Jorge Bárcena, diseñada para mostrar las dos facetas principales del autor: Actor/Improvisador y Desarrollador Web.

El proyecto es una aplicación web moderna que combina un Frontend visualmente rico con efectos de parallax y glassmorphism, conectado a un Backend en Node.js para la gestión de contacto.

✨ Características Principales
🎨 Frontend & UI/UX
Diseño Responsivo: Adaptado perfectamente a móviles, tablets y escritorio.

Efecto Parallax: Navegación fluida con fondos dinámicos.

Galerías Dinámicas (JavaScript):

Big Gallery: Carga automática de imágenes desde un array JSON, con leyendas semitransparentes, navegación por flechas y "Lazy Loading" para optimización.

Card System: Tarjetas interactivas con sistema de Modals (Popups) para ver información detallada sin recargar la página.

Auto-Scroll Inteligente: Detección de dispositivos móviles para rotar automáticamente las galerías, con pausa táctil (touchstart).

Estilo Premium: Uso de Glassmorphism (efecto cristal desenfocado) en notificaciones y controles.

Notificaciones Toast: Sistema de alertas personalizado (sin alert() nativos) para feedback de formularios.

⚙️ Backend & Servidor
API REST (Node.js + Express): Servidor ligero para procesar el formulario de contacto.

Nginx Reverse Proxy: Configuración de servidor para servir archivos estáticos y redirigir peticiones API (/contacto) al backend de Node.js.

Seguridad: Configuración SSL/TLS y cabeceras de seguridad.

🛠️ Tecnologías Utilizadas
Frontend: HTML5, CSS3, JavaScript (ES6+), jQuery.

Backend: Node.js, Express.js.

Servidor: Nginx (Ubuntu/Linux).

Control de Versiones: Git.

🚀 Instalación y Despliegue Local
Sigue estos pasos para clonar y ejecutar el proyecto en tu máquina local:

Clonar el repositorio:

Bash

git clone https://github.com/tu-usuario/jorge-barcena-web.git
cd jorge-barcena-web
Instalar dependencias (Backend):

Bash

npm install
Configurar Variables de Entorno: Crea un archivo .env en la raíz (si es necesario para tus credenciales de correo):

Fragmento de código

PORT=3000
EMAIL_USER=tu@email.com
EMAIL_PASS=tu_password
Iniciar el servidor:

Bash

node app.js
# O para desarrollo con reinicio automático:
# nodemon app.js
Acceso: Abre tu navegador en http://localhost:3000.

🌐 Configuración del Servidor (Producción)
Para desplegar en un VPS con Nginx, asegúrate de configurar el bloque location para redirigir el formulario al backend:

Nginx

server {
    server_name geneolegacy.com;

    # Archivos Estáticos (Frontend)
    location / {
        alias /var/www/JorgeBarcenaActor/;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend (Node.js)
    location /contacto {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
📂 Estructura del Proyecto
Plaintext

/
├── images/             # Imágenes optimizadas y assets
├── assets/             # CSS, Webfonts y JS de terceros
├── main.js             # Lógica principal (Galerías, Scroll, Toast, API)
├── app.js              # Servidor Express (Backend)
├── index.html          # Estructura principal
├── package.json        # Dependencias de Node
└── README.md           # Documentación
👤 Autor
Jorge Bárcena

Actor & Improvisador

Full Stack Developer

Web: geneolegacy.com
Email: contacto@geneolegacy.com
GitHub: github.com/jorgebarcena

📝 Licencia
Este proyecto está bajo licencia MIT. Siéntete libre de usarlo, modificarlo y distribuirlo.

🤝 Contribuciones
Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

📞 Contacto
¿Preguntas o sugerencias? Envía un mensaje a través del formulario en la web o contacta directamente.

---
⭐ Si te gusta el proyecto, ¡no olvides darle una estrella en GitHub!