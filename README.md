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


## error cuando se intenta guardar un nuevo cliente con datos repetidos en la base de datos, se debe verificar que no exista un cliente con los mismos datos. y mostrar un mensaje de error al usuario. similar a como funciona ajax.

### Funcionalidades Futuras

- Integración con la SAT (Superintendencia de Administración Tributaria) para validación automática de facturas electrónicas
- Módulo de reportes fiscales específicos para Guatemala (IVA, ISR)
- Sistema de cotizaciones que se puedan convertir fácilmente en facturas
- Gestión de inventario con alertas de stock mínimo
- Módulo de gastos para seguimiento de compras y pagos a proveedores
- Integración con pasarelas de pago locales guatemaltecas
- Exportación de reportes en formatos requeridos por la SAT
- Sistema de recordatorios para pagos pendientes de clientes
- Módulo de firma electrónica para cumplir con requisitos legales guatemaltecos
- Panel de KPIs financieros con métricas específicas para negocios guatemaltecos