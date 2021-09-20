import {Database} from "sqlite3";
import {Ride} from "../src/types";

export default (db: Database) => {
    const seedRides = async (rides: Ride[]) => {
        for (let ride of rides) {
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

            await db.run(
                'INSERT INTO Rides(rideID, startLat, startLong, endLat, endLong, '
                + 'riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                values
            );
        }
    }

    return { seedRides };
};
