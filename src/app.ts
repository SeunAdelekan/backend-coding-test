import express from 'express';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import rideRouter from './api/router/rideRouter';
import helmet from 'helmet';

const app = express();

const swaggerDoc = YAML.load('./docs/swagger.yml');

export default () => {
  app.use(helmet());
  app.use('/documentation', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  app.use('/rides', rideRouter);
  app.get('/health', (_req, res) => res.send('Healthy'));

  return app;
};
