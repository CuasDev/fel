import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './index.js';

// Opciones de configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Facturación Electrónica',
      version: '1.0.0',
      description: 'Documentación de la API del sistema de facturación electrónica',
      contact: {
        name: 'Soporte',
        email: 'soporte@fel.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/server/routes/*.js', './src/server/models/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Configura Swagger en la aplicación Express
 * @param {Object} app - Instancia de Express
 */
const setupSwagger = (app) => {
  // Ruta para la documentación de la API
  app.use(
    config.swaggerPrefix,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
  );

  // Endpoint para obtener el archivo swagger.json
  app.get(`${config.swaggerPrefix}.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Documentación de la API disponible en ${config.swaggerPrefix}`);
};

export default setupSwagger;