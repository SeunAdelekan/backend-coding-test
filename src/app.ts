import express from 'express';
import bodyParser from 'body-parser';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import { Database } from 'sqlite3';
import logger from './util/logger';
import ERROR_MESSAGE from './constant/errorMessage';
import ERROR_CODE from './constant/errorCode';

const app = express();
const jsonParser = bodyParser.json();

const swaggerDoc = YAML.load('./docs/swagger.yml');

export default (db: Database) => {
  app.use('/documentation', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
  app.get('/health', (_req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90
        || startLongitude < -180 || startLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180'
            + ' degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string',
      });
    }

    const values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle,
    ];

    return db.run(
      'INSERT INTO Rides(startLat, startLong, endLat, endLong, '
        + 'riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
      function onComplete(err: Error | null) {
        if (err) {
          logger.error(err.message);
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        return db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID,
          (error: Error | null, rows) => {
            if (error) {
              logger.error(error.message);
              return res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error',
              });
            }

            return res.send(rows);
          });
      },
    );
  });

  app.get('/rides', (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    if (isNaN(page) || page <= 0) {
      return res.send({
        error_code: ERROR_CODE.VALIDATION_ERROR,
        message: ERROR_MESSAGE.INVALID_PAGE,
      });
    }

    if (isNaN(skip) || skip < 0) {
      return res.send({
        error_code: ERROR_CODE.VALIDATION_ERROR,
        message: ERROR_MESSAGE.INVALID_SKIP,
      });
    }

    if (isNaN(limit) || limit <= 0) {
      return res.send({
        error_code: ERROR_CODE.VALIDATION_ERROR,
        message: ERROR_MESSAGE.INVALID_LIMIT,
      });
    }

    return db.all(`SELECT * FROM Rides ORDER BY rideID ASC LIMIT ? OFFSET ?`,
        [limit, (page * skip) - skip],
        (err, rows) => {
      if (err) {
        logger.error(err.message);
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      return res.send(rows);
    });
  });

  app.get('/rides/:id', (req, res) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
      if (err) {
        logger.error(err.message);
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      return res.send(rows);
    });
  });

  return app;
};
