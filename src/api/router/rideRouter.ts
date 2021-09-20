import { Router } from 'express';
import bodyParser from 'body-parser';
import { Database } from 'sqlite';
import RideController from '../controller/rideController';
import validate from '../../middleware/validator';
import { ValidationType } from '../../types';
import validationSchemas from '../../util/validationSchemas';

export default (db: Database) => {
  const router = Router();
  const controller = RideController(db);

  router.post(
    '/',
    bodyParser.json(),
    validate(validationSchemas.createRide, ValidationType.Body),
    controller.createRide,
  );
  router.get(
    '/',
    validate(validationSchemas.getRides, ValidationType.Query),
    controller.getRides,
  );
  router.get(
    '/:id',
    validate(validationSchemas.getRideByID, ValidationType.Params),
    controller.getRideByID,
  );

  return router;
};
