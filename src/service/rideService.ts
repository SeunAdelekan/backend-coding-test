import { ISqlite } from 'sqlite';
import { Ride } from '../types';
import RideDAO from '../dao/rideDAO';
import { rideNotFoundError } from '../error/error';

export default class RideService {
  async createRide(ride: Ride): Promise<ISqlite.RunResult> {
    return RideDAO.createRide(ride);
  }

  async getRideByID(rideID: number): Promise<Ride[]> {
    const rides = await RideDAO.getRideByID(rideID);

    if (rides.length === 0) {
      throw rideNotFoundError;
    }

    return rides;
  }

  async getRides({ page, limit } : { page: number, limit: number }): Promise<Ride[]> {
    const rides = await RideDAO.getRides({ page, limit });

    if (rides.length === 0) {
      throw rideNotFoundError;
    }

    return rides;
  }
}
