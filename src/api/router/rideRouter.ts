import { Router } from 'express';
import bodyParser from 'body-parser';
import { createRide, getRides, getRideByID } from '../controller/rideController';
import validate from '../../middleware/validator';
import { ValidationType } from '../../types';
import validationSchemas from '../../util/validationSchemas';

const router = Router();

router.post('/', bodyParser.json(), validate(validationSchemas.createRide, ValidationType.Body), createRide);
router.get('/', validate(validationSchemas.getRides, ValidationType.Query), getRides);
router.get('/:id', getRideByID);

export default router;
