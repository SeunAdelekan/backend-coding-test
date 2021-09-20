import { Database, ISqlite } from 'sqlite';
import { Ride } from '../types';
import RideDAO from '../dao/rideDAO';
import { rideNotFoundError } from '../error/error';

export default class RideService {
  private rideDAO: RideDAO;

  constructor(db: Database) {
    this.rideDAO = new RideDAO(db);
  }

  async createRide(ride: Ride): Promise<ISqlite.RunResult> {
    return this.rideDAO.createRide(ride);
  }

  async getRideByID(rideID: number): Promise<Ride[]> {
    const rides = await this.rideDAO.getRideByID(rideID);

    if (rides.length === 0) {
      throw rideNotFoundError;
    }

    return rides;
  }

  async getRides({ page, limit } : { page: number, limit: number }): Promise<Ride[]> {
    const rides = await this.rideDAO.getRides({ page, limit });

    if (rides.length === 0) {
      throw rideNotFoundError;
    }

    return rides;
  }
}
