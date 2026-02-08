import express from 'express';
import cors from 'cors';
import indexRoutes from './routes';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CeiVoice Organization Service API',
      version: '1.0.0',
      description: 'Organization and member management service for CeiVoice platform',
    },
    servers: [
      {
        url: 'http://localhost:8001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/index.ts'],
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/organizations', indexRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'OrganizationService' });
});

export default app;