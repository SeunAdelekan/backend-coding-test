import {ISqlite} from "sqlite";

export interface RideRequest {
    start_lat: number,
    start_long: number,
    end_lat: number,
    end_long: number,
    rider_name: string,
    driver_name: string,
    driver_vehicle: string
}

export interface Ride {
    rideID: number,
    startLat: number,
    startLong: number,
    endLat: number,
    endLong: number,
    riderName: string,
    driverName: string,
    driverVehicle: string
    created: string
}

export type DBManager = { cleanup: () => Promise<ISqlite.RunResult>; setup: () => Promise<void> };

export type Seeder = { seedRides: (rides: Ride[]) => Promise<void>; };
