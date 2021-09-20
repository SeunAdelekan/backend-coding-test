import { Ride } from '../../src/types';

const parseRideDataForAssertion = (ride: Ride) => ({
  rideID: ride.rideID,
  startLat: ride.startLat,
  startLong: ride.startLong,
  endLat: ride.endLat,
  endLong: ride.endLong,
  riderName: ride.riderName,
  driverName: ride.driverName,
  driverVehicle: ride.driverVehicle,
});

export default parseRideDataForAssertion;
