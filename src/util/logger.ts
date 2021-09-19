import * as winston from 'winston';

const logger: winston.Logger = winston.createLogger({
  defaultMeta: { service: 'ride-service' },
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
);

export default logger;
