import { Database, ISqlite } from 'sqlite';
import { Ride } from '../types';

let db: Database;

export default class RideDAO {
  static injectDB(database: Database) {
    db = database;
  }

  static async createRide(ride: Ride): Promise<ISqlite.RunResult> {
    const values = [
      ride.startLat,
      ride.startLong,
      ride.endLat,
      ride.endLong,
      ride.riderName,
      ride.driverName,
      ride.driverVehicle,
    ];

    return db.run(
      'INSERT INTO Rides(startLat, startLong, endLat, endLong, '
            + 'riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
    );
  }

  static async getRides({ page, limit } : { page: number, limit: number }): Promise<Ride[]> {
    return db.all<Ride[]>(
      'SELECT * FROM Rides ORDER BY rideID ASC LIMIT ? OFFSET ?',
      [limit, (page * limit) - limit],
    );
  }

  static async getRideByID(rideID: number | string | undefined): Promise<Ride[]> {
    return db.all<Ride[]>(`SELECT * FROM Rides WHERE rideID='${rideID}'`);
  }
}
