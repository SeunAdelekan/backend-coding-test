import { ISqlite } from 'sqlite';
import { Ride } from '../types';
import RideDAO from '../dao/rideDAO';
import {RideNotFoundError} from "../error/error";

export default class RiderService {
  async createRide(ride: Ride): Promise<ISqlite.RunResult> {
    return RideDAO.createRide(ride);
  }

  async getRideByID(rideID: number | string | undefined): Promise<Ride[]> {
    const rides = await RideDAO.getRideByID(rideID);

    if (rides.length === 0) {
      throw RideNotFoundError;
    }

    return rides;
  }

  async getRides({ page, limit } : { page: number, limit: number }): Promise<Ride[]> {
    const rides = await RideDAO.getRides({ page, limit });

    if (rides.length === 0) {
      throw RideNotFoundError;
    }

    return rides;
  }
}
