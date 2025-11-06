# Webfront - Sistema de Gestión de Agua

Frontend web ligero usando HTML, JavaScript vanilla y Bootstrap.

## Características

- ✅ HTML + JavaScript vanilla (sin frameworks pesados)
- ✅ Bootstrap 5.3 para UI
- ✅ Arquitectura modular y organizada
- ✅ Seguridad: sanitización, validación, manejo de tokens
- ✅ Paleta de colores personalizada
- ✅ Fácil de ejecutar (solo abrir HTML o usar servidor simple)

## Estructura

```
webfront/
├── index.html              # HTML principal
├── css/
│   └── styles.css          # Estilos con paleta personalizada
├── js/
│   ├── index.js            # Punto de entrada
│   ├── config.js           # Configuración base
│   ├── router.js           # Router simple
│   ├── services/
│   │   ├── api.js          # Servicio de API
│   │   └── auth.js         # Servicio de autenticación
│   ├── utils/
│   │   ├── security.js     # Utilidades de seguridad
│   │   └── dom.js          # Utilidades DOM
│   └── pages/
│       ├── login.js        # Página de login
│       ├── dashboard.js    # Dashboard
│       ├── users.js        # Usuarios
│       ├── payments.js     # Pagos
│       └── reports.js      # Reportes
└── README.md
```

## Cómo ejecutar

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

O usar un servidor simple:
```bash
# Python
python -m http.server 3000

# O Node.js (si tienes http-server instalado)
npx http-server -p 3000

# O PHP
php -S localhost:3000
```

### Despliegue en Railway

1. Conecta tu repositorio a Railway
2. Configura la variable de entorno `API_BASE_URL` con la URL de tu backend
3. Railway detectará automáticamente el `package.json` y desplegará la aplicación

El script `scripts/generate-env-config.js` se ejecutará automáticamente antes de iniciar el servidor para generar `js/env-config.js` con la variable de entorno `API_BASE_URL`.

## Configuración

Por defecto, la aplicación se conecta a `https://backend.aguaspl.site`.

Para cambiar la URL del backend:

- **En Railway**: Configura la variable de entorno `API_BASE_URL`
- **En desarrollo local**: Configura la variable de entorno antes de ejecutar:
  ```bash
  export API_BASE_URL=http://tu-backend-url:puerto
  npm start
  ```

El archivo `js/env-config.js` se genera automáticamente desde la variable de entorno `API_BASE_URL`.

## Paleta de colores

- **Primary**: `#3d5a80` (azul oscuro)
- **Secondary**: `#98c1d9` (azul claro)
- **Light**: `#e0fbfc` (celeste muy claro)
- **Accent**: `#ee6c4d` (naranja)
- **Dark**: `#293241` (gris oscuro)

## Seguridad

- Sanitización de entradas (previene XSS básico)
- Validación de formularios
- Tokens almacenados en localStorage
- Headers de autenticación automáticos
- Redirección automática si token expira (401)

## Arquitectura

El código está organizado en módulos:

1. **Config** (`config.js`): Configuración centralizada
2. **Services** (`api.js`, `auth.js`): Lógica de negocio y comunicación con API
3. **Utils** (`security.js`, `dom.js`): Utilidades reutilizables
4. **Pages** (`pages/*`): Páginas/vistas de la aplicación
5. **Router** (`router.js`): Enrutamiento y navegación

## Rutas

- `#login` - Inicio de sesión
- `#dashboard` - Panel principal
- `#users` - Lista de usuarios
- `#payments` - Lista de pagos
- `#reports` - Reportes

## Requisitos

- Backend ejecutándose en `https://backend.aguaspl.site` (o configurado)
- Navegador moderno con soporte para ES6 modules
- Servidor web simple (para evitar problemas de CORS)

