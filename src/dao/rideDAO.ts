import { Database, ISqlite } from 'sqlite';
import { Ride } from '../types';

export default class RideDAO {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  async createRide(ride: Ride): Promise<ISqlite.RunResult> {
    const values = [
      ride.startLat,
      ride.startLong,
      ride.endLat,
      ride.endLong,
      ride.riderName,
      ride.driverName,
      ride.driverVehicle,
    ];

    return this.db.run(
      'INSERT INTO Rides(startLat, startLong, endLat, endLong, '
            + 'riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
    );
  }

  async getRides({ page, limit } : { page: number, limit: number }): Promise<Ride[]> {
    return this.db.all<Ride[]>(
      'SELECT * FROM Rides ORDER BY rideID ASC LIMIT ? OFFSET ?',
      [limit, (page * limit) - limit],
    );
  }

  async getRideByID(rideID: number): Promise<Ride[]> {
    return this.db.all<Ride[]>(
      'SELECT * FROM Rides WHERE rideID = ?',
      [rideID],
    );
  }
}
