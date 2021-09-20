import { Request, Response } from 'express';

import { types } from 'util';
import logger from '../../util/logger';
import RiderService from '../../service/riderService';
import ERROR_CODE from "../../constant/errorCode";
import ERROR_MESSAGE from "../../constant/errorMessage";

const rideService = new RiderService();

export const createRide = async (req: Request, res: Response) => {
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

    const rides = await rideService.getRideByID(execResult.lastID);

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

export const getRides = async (req: Request, res: Response) => {
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

export const getRideByID = async (req: Request, res: Response) => {
  try {
    const rides = await rideService.getRideByID(req.params.rideID);

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
