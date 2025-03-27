# Sistema de Facturación Electrónica SaaS

Un software de facturación electrónica completo desarrollado con React, Express y MongoDB, diseñado con una interfaz Material UI futurista y totalmente responsive.

## Características

- Gestión de usuarios y roles
- Catálogo de productos y servicios
- Administración de clientes
- Emisión de facturas electrónicas
- Dashboard analítico
- Diseño responsive con Material UI futurista
- Documentación API con Swagger

## Estructura del Proyecto

```
fel/
├── public/              # Archivos estáticos
├── src/
│   ├── client/          # Frontend (React)
│   │   ├── assets/      # Imágenes, iconos, etc.
│   │   ├── components/  # Componentes reutilizables
│   │   ├── layouts/     # Layouts de la aplicación
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── services/    # Servicios para comunicación con API
│   │   ├── styles/      # Estilos CSS
│   │   ├── utils/       # Utilidades y helpers
│   │   ├── App.jsx      # Componente principal
│   │   └── main.jsx     # Punto de entrada
│   └── server/          # Backend (Express)
│       ├── config/      # Configuraciones
│       ├── controllers/ # Controladores
│       ├── models/      # Modelos de datos (MongoDB)
│       ├── routes/      # Rutas API
│       ├── services/    # Servicios de negocio
│       ├── utils/       # Utilidades
│       └── main.js      # Punto de entrada del servidor
└── package.json         # Dependencias y scripts
```

## Requisitos

- Node.js 14.x o superior
- MongoDB 4.x o superior

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

## Documentación API

La documentación de la API está disponible en `/api-docs` cuando el servidor está en ejecución.

## Licencia

MIT