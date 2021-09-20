import { Router } from 'express';
import bodyParser from 'body-parser';
import { createRide, getRides, getRideByID } from '../controller/rideController';

const router = Router();

router.post('/', bodyParser.json(), createRide);
router.get('/', getRides);
router.get('/:id', getRideByID);

export default router;
