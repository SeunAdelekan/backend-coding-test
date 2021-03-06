import { Request, Response } from 'express';

import { types } from 'util';
import { Database } from 'sqlite';
import logger from '../../util/logger';
import RideService from '../../service/rideService';
import ERROR_CODE from '../../constant/errorCode';
import ERROR_MESSAGE from '../../constant/errorMessage';

export default (db: Database) => {
  const rideService = new RideService(db);

  const createRide = async (req: Request, res: Response) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    try {
      const execResult = await rideService.createRide({
        startLat: startLatitude,
        startLong: startLongitude,
        endLat: endLatitude,
        endLong: endLongitude,
        riderName,
        driverName,
        driverVehicle,
      });

      const rides = await rideService.getRideByID(execResult.lastID as number);

      return res.send(rides);
    } catch (error: any) {
      if (types.isNativeError(error)) {
        logger.error(error.message);
      }

      if (error && error.errorCode && error.message) {
        return res.send({ error_code: error.errorCode, message: error.message });
      }

      return res.send({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    }
  };

  const getRides = async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    try {
      const rides = await rideService.getRides({ page, limit });

      return res.send(rides);
    } catch (error: any) {
      if (types.isNativeError(error)) {
        logger.error(error.message);
      }

      if (error && error.errorCode && error.message) {
        return res.send({ error_code: error.errorCode, message: error.message });
      }

      return res.send({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    }
  };

  const getRideByID = async (req: Request, res: Response) => {
    try {
      const rides = await rideService.getRideByID(Number(req.params.id));

      return res.send(rides);
    } catch (error: any) {
      if (types.isNativeError(error)) {
        logger.error(error.message);
      }

      if (error && error.errorCode && error.message) {
        return res.send({ error_code: error.errorCode, message: error.message });
      }

      return res.send({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    }
  };

  return { createRide, getRides, getRideByID };
};
