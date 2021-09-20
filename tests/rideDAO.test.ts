import { expect } from 'chai';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import resolveDBManager from './dbManager';
import resolveSeeder from './seeder';
import rideFixtures from './fixtures/rides';
import { DBManager, Ride, Seeder } from '../src/types';
import RideDAO from '../src/dao/rideDAO';
import {parseRideDataForAssertion} from "./util/objectUtil";

describe('RideDAO tests', () => {
  let db: Database;
  let dbManager: DBManager;
  let seeder: Seeder;

  before(async () => {
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    });

    RideDAO.injectDB(db);
    dbManager = resolveDBManager(db);
    seeder = resolveSeeder(db);

    await dbManager.setup();
  });

  afterEach(() => dbManager.cleanup());

  describe('RideDAO.createRide', () => {
    afterEach(async () => {
      await dbManager.cleanup();
    });

    it('should create a ride', async () => {
      const ride: Ride = {
        startLat: 48.858222,
        startLong: 2.2945,
        endLat: 48.861111,
        endLong: 2.335833,
        riderName: 'Dominic Toretto',
        driverName: 'The Transporter',
        driverVehicle: 'Audi A8 W12',
      };
      const res = await RideDAO.createRide(ride);

      expect(res.lastID).to.eql(1);
    });
  });

  describe('RideDAO.getRides', () => {
    it('should return an empty list when no ride exists', async () => {
      const res = await RideDAO.getRides({ page: 1, limit: 2 });

      expect(res.length).to.eql(0);
    });

    it('should return a list of rides when rides exist', async () => {
      await seeder.seedRides(rideFixtures);
      const rides = await RideDAO.getRides({ page: 1, limit: 10 });

      expect(rides.length).to.eql(5);

      for (let i = 0; i < rides.length; i++) {
        expect(parseRideDataForAssertion(rides[i])).to.eql(parseRideDataForAssertion(rideFixtures[i]));
      }
    });

    it('should return a correct paginated list of rides', async () => {
      await seeder.seedRides(rideFixtures);
      const rides = await RideDAO.getRides({ page: 2, limit: 2 });

      expect(parseRideDataForAssertion(rides[0])).to.eql(parseRideDataForAssertion(rideFixtures[2]));
      expect(parseRideDataForAssertion(rides[0])).to.eql(parseRideDataForAssertion(rideFixtures[2]));
    });
  });

  describe('RideDAO.getRideByID', () => {
    it('should return an empty list of rides when no ride matching the rideID exists', async () => {
      const res = await RideDAO.getRideByID(1);

      expect(res.length).to.eql(0);
    });

    it('should return a list of rides when rides exist', async () => {
      await seeder.seedRides([rideFixtures[0], rideFixtures[1]]);
      const rides = await RideDAO.getRideByID(2);

      expect(rides.length).to.eql(1);
      expect(parseRideDataForAssertion(rides[0])).to.eql(parseRideDataForAssertion(rideFixtures[1]));
    });
  });
});
