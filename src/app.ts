import express from 'express';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import rideRouter from './api/router/rideRouter';
import helmet from 'helmet';
import rateLimit from "express-rate-limit";
import ERROR_MESSAGE from './constant/errorMessage'

const app = express();
const swaggerDoc = YAML.load('./docs/swagger.yml');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per windowsMs for each IP
  message: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
  skip: (req) => {
    const addr = req.socket.remoteAddress;

    // permit requests from localhost.
    return addr ? ['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(addr) : false;
  },
});

export default () => {
  app.use(helmet());
  app.use('/documentation', limiter, swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  app.use('/rides', limiter, rideRouter);
  app.get('/health', (_req, res) => res.send('Healthy'));

  return app;
};
