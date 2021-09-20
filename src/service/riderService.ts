import { Ride } from '../types';
import RideDAO from '../dao/rideDAO';
import {ISqlite} from "sqlite";

export default class RiderService {
  async createRide(ride: Ride): Promise<ISqlite.RunResult> {
    return RideDAO.createRide(ride);
  }

  async getRideByID(rideID: number | string | undefined): Promise<Ride[]> {
    return RideDAO.getRideByID(rideID);
  }

  async getRides({ page, limit } : { page: number, limit: number }): Promise<Ride[]> {
    return RideDAO.getRides({ page, limit });
  }
}
