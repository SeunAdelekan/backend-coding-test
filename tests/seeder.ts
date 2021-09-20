import { Database } from 'sqlite';
import { Ride } from '../src/types';

export default (db: Database) => {
  const seedRides = async (rides: Ride[]) => {
    for (let i = 0; i < rides.length; i += 1) {
      const ride = rides[i];
      const values = [
        ride.rideID,
        ride.startLat,
        ride.startLong,
        ride.endLat,
        ride.endLong,
        ride.riderName,
        ride.driverName,
        ride.driverVehicle,
      ];

      // eslint-enable no-await-in-loop
      await db.run(
        'INSERT INTO Rides(rideID, startLat, startLong, endLat, endLong, '
                + 'riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        values,
      );
    }
  };

  return { seedRides };
};
