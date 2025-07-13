# RetailStock: Plataforma Global de Gestión de Inventario Minorista
RetailStock es una solución SaaS integral diseñada para minoristas globales que buscan optimizar la gestión de su inventario en múltiples ubicaciones y canales. Nuestra plataforma ofrece seguimiento en tiempo real, alertas automatizadas, gestión de productos y stock, y una integración fluida con plataformas de comercio electrónico líderes como Shopify y WooCommerce, todo ello a través de una interfaz intuitiva y escalable.

##  Características Clave
### Gestión de Inventario en Tiempo Real:

*   Registro y seguimiento detallado de productos (SKU, descripción, precio).
*   Control de niveles de stock por ubicación.
*   Registro de movimientos de stock (entradas/salidas manuales).
*   Ajuste manual de cantidades de stock.

### Dashboard de Visión General:

*   Métricas clave del inventario (total de SKUs, productos en bajo stock, desabastecidos).
*   Visualización de productos más y menos vendidos.
*   Alertas visuales instantáneas en el panel de control.

### Alertas Automatizadas:

*   Notificaciones de bajo stock para reposición proactiva.
*   Alertas de desabastecimiento inminente para evitar pérdidas de ventas.

### Integraciones con E-commerce:

*   **Shopify**: Conexión mediante OAuth y sincronización de ventas en tiempo real a través de webhooks.
*   **WooCommerce**: Conexión mediante claves API y sincronización periódica de ventas.
*   Visibilidad del estado de cada integración.

### Sistema de Autenticación y Gestión de Usuarios:

*   Registro seguro de minoristas con verificación de correo electrónico.
*   Inicio de sesión seguro con JWT (JSON Web Tokens).
*   Funcionalidad de restablecimiento de contraseña.
*   Control de acceso básico para proteger los datos del usuario.

## ️ Pila Tecnológica
RetailStock está construido con tecnologías modernas y robustas para asegurar escalabilidad, rendimiento y mantenibilidad.

### Backend
*   **Lenguaje**: Node.js
*   **Framework**: Express.js
*   **Lenguaje de Programación**: TypeScript
*   **Base de Datos**: PostgreSQL (para datos relacionales y transaccionales)
*   **Caché/Broker de Mensajes**: Redis (para caching y posible gestión de tareas en segundo plano como el polling de WooCommerce)
*   **Seguridad**: JWT para autenticación, Bcrypt para hashing de contraseñas, cifrado de datos sensibles de integración.
*   **Emailing**: Nodemailer (integrable con servicios como AWS SES, SendGrid, etc.)
*   **Contenedorización**: Docker

### Frontend
*   **Framework**: Next.js (React Framework)
*   **Lenguaje de Programación**: TypeScript
*   **Estilos**: Tailwind CSS
*   **Componentes UI**: Shadcn/UI
*   **Librería HTTP**: Axios
*   **Contenedorización**: Docker

### Infraestructura y Orquestación
*   **Contenedorización**: Docker
*   **Orquestación Local**: Docker Compose
*   **Servidor Web/Proxy Inverso**: Nginx

### Conceptos de Despliegue en la Nube (Visión a Futuro)
Aunque el `docker-compose.yml` es para un entorno local, la arquitectura está diseñada para un despliegue en la nube utilizando servicios como:

*   AWS RDS para PostgreSQL
*   AWS ElastiCache para Redis
*   AWS ECS/EC2 para los servicios de backend y frontend
*   AWS S3 para almacenamiento de archivos estáticos (si aplica en el futuro)
*   AWS WAF para seguridad a nivel de aplicación

##  Estructura del Proyecto
El repositorio está organizado en directorios lógicos para separar el backend, el frontend y la configuración de la infraestructura.

```
└── RetailStock/
    ├── backend/                 # Contiene el código fuente del servidor Node.js/Express
    │   ├── logs/                # Archivos de log del backend
    │   ├── src/                 # Código fuente principal del backend
    │   │   ├── api/             # Módulos de la API (alerts, auth, dashboard, integrations, locations, products, stock)
    │   │   ├── config/          # Configuraciones de la aplicación (base de datos, logger)
    │   │   ├── db/              # Scripts de inicialización de la base de datos
    │   │   ├── jobs/            # Tareas programadas (ej. sincronización de WooCommerce)
    │   │   ├── middlewares/     # Middlewares de Express (ej. autenticación)
    │   │   ├── types/           # Definiciones de tipos de TypeScript
    │   │   └── index.ts           # Punto de entrada del servidor
    │   ├── Dockerfile             # Dockerfile para construir la imagen del backend
    │   ├── package.json           # Dependencias y scripts del backend
    │   ├── pnpm-lock.yaml         # Archivo de bloqueo de dependencias (pnpm)
    │   └── tsconfig.json          # Configuración de TypeScript para el backend
    ├── frontend/                # Contiene el código fuente de la aplicación Next.js/React
    │   ├── app/                 # Rutas y páginas de Next.js
    │   ├── components/          # Componentes reutilizables (divididos por módulo y UI/Shadcn)
    │   ├── hooks/               # Custom React Hooks
    │   ├── lib/                 # Utilidades, clientes de API, contextos de estado global
    │   ├── public/              # Archivos estáticos
    │   ├── styles/              # Archivos de estilos (globales, específicos)
    │   ├── Dockerfile             # Dockerfile para construir la imagen del frontend
    │   ├── package.json           # Dependencias y scripts del frontend
    │   ├── pnpm-lock.yaml         # Archivo de bloqueo de dependencias (pnpm)
    │   └── README.md              # README específico del frontend (puede ser más detallado para dev frontend)
    ├── nginx/                   # Configuración del proxy inverso Nginx
    │   └── nginx.conf             # Archivo de configuración de Nginx
    └── docker-compose.yml         # Archivo para definir y ejecutar los servicios Docker
```

##  Cómo Empezar
Sigue estos pasos para levantar el proyecto RetailStock en tu entorno local.

### Requisitos Previos
Asegúrate de tener instalado lo siguiente:

*   **Git**: Para clonar el repositorio.
*   **Docker Desktop**: Incluye Docker Engine y Docker Compose.

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd RetailStock
```

### 2. Configuración de Variables de Entorno
Crea los siguientes archivos `.env` en las ubicaciones especificadas y rellénalos con tus valores.

#### `RetailStock/backend/.env`
```env
# Configuración de la Base de Datos PostgreSQL
DB_USER=retailstock_user
DB_PASSWORD=retailstock_password
DB_NAME=retailstock_db
DB_HOST=db # Nombre del servicio Docker de la base de datos
DB_PORT=5432

# Configuración JWT (JSON Web Token)
JWT_SECRET=tu_secreto_jwt_muy_seguro_y_largo_aqui # CAMBIAR ESTO EN PRODUCCIÓN
JWT_EXPIRES_IN=1d

# Configuración de Email (para verificación y restablecimiento de contraseña)
EMAIL_SERVICE_HOST=smtp.ejemplo.com # Ej. smtp.sendgrid.net, email-smtp.us-east-1.amazonaws.com
EMAIL_SERVICE_PORT=587
EMAIL_SERVICE_USER=tu_usuario_smtp
EMAIL_SERVICE_PASSWORD=tu_password_smtp
EMAIL_FROM=no-reply@retailstock.com

# Credenciales de Integración (Shopify)
SHOPIFY_API_KEY=tu_shopify_api_key
SHOPIFY_API_SECRET=tu_shopify_api_secret
SHOPIFY_REDIRECT_URI=http://localhost:3001/api/integrations/shopify/callback # Debe coincidir con la app de Shopify

# Credenciales de Integración (WooCommerce)
WOOCOMMERCE_API_URL=https://your-woocommerce-store.com # URL base de tu tienda WooCommerce
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clave de cifrado para datos sensibles en la DB (ej. tokens de integración)
ENCRYPTION_KEY=tu_clave_de_cifrado_aes_de_32_bytes # CAMBIAR ESTO EN PRODUCCIÓN
```

#### `RetailStock/frontend/.env.local`
```env
# URL del Backend API (debe coincidir con la configuración de Nginx y Docker Compose)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Levantar el Proyecto con Docker Compose
Desde el directorio raíz del proyecto (`RetailStock/`), ejecuta el siguiente comando:

```bash
docker-compose up --build -d
```

*   `--build`: Reconstruye las imágenes de Docker (necesario la primera vez o después de cambios en el código/Dockerfiles).
*   `-d`: Ejecuta los contenedores en modo "detached" (en segundo plano).

Esto construirá las imágenes del backend y frontend, configurará Nginx, y levantará los servicios de PostgreSQL y Redis.

### 4. Inicializar la Base de Datos
Una vez que el contenedor de PostgreSQL esté en funcionamiento, necesitas inicializar el esquema de la base de datos.

Puedes ejecutar el script `init.sql` manualmente dentro del contenedor `db` o a través de un cliente de base de datos.

```bash
# Acceder al contenedor de la base de datos (si necesitas hacerlo manualmente)
docker exec -it retailstock_db_1 psql -U retailstock_user -d retailstock_db

# Dentro del psql, ejecuta el contenido de RetailStock/backend/src/db/init.sql
# O, si tu backend tiene un script de migración/inicialización, asegúrate de que se ejecute al inicio.
```

**Nota**: El backend está diseñado para ejecutar migraciones automáticamente o para inicializar la base de datos al inicio si no se detecta la estructura. Verifica los logs del contenedor `backend` para confirmar que la base de datos se inicializó correctamente.

### 5. Acceder a la Aplicación
Una vez que todos los servicios estén levantados y la base de datos inicializada:

*   **Frontend**: Abre tu navegador y navega a `http://localhost:3000`
*   **Backend API**: La API estará disponible en `http://localhost:3001/api` (Nginx redirige las solicitudes).

##  Uso de la Aplicación
1.  **Registro**: Crea una nueva cuenta de minorista en la página de registro.
2.  **Verificación de Email**: Revisa la consola de tu backend o el servicio de email configurado para obtener el enlace de verificación.
3.  **Inicio de Sesión**: Accede a tu cuenta con tus credenciales.
4.  **Gestión de Inventario**: Navega a la sección de inventario para añadir productos, ver el stock y registrar movimientos.
5.  **Dashboard**: Explora el dashboard para obtener una visión general de tu inventario y las alertas.
6.  **Integraciones**: Conecta tus tiendas Shopify o WooCommerce para sincronizar automáticamente las ventas.

##  Contribución
¡Las contribuciones son bienvenidas! Si deseas contribuir a RetailStock, por favor, sigue estos pasos:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y commitea (`git commit -m 'feat: Añadir nueva funcionalidad X'`).
4.  Haz push a tu rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.

##  Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
