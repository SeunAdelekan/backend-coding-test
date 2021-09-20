import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import resolveDBManager from './dbManager';
import resolveSeeder from './seeder';
import rideFixtures from './fixtures/rides';
import { DBManager, Seeder } from '../src/types';
import RideDAO from '../src/dao/rideDAO';
import RideService from '../src/service/rideService';
import { parseRideDataForAssertion } from './util/objectUtil';
import { rideNotFoundError } from '../src/error/error';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('RideDAO tests', () => {
  let db: Database;
  let dbManager: DBManager;
  let seeder: Seeder;
  let rideService: RideService;

  before(async () => {
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    });

    RideDAO.injectDB(db);
    dbManager = resolveDBManager(db);
    seeder = resolveSeeder(db);
    rideService = new RideService();

    await dbManager.setup();
  });

  afterEach(() => dbManager.cleanup());

  describe('RideService.createRide', () => {
    afterEach(async () => {
      await dbManager.cleanup();
    });

    it('should create a ride', async () => {
      const res = await rideService.createRide({
        startLat: 2.858222,
        startLong: 2.2945,
        endLat: 7.861111,
        endLong: 2.335833,
        riderName: 'Jon Snow',
        driverName: 'The Wolf',
        driverVehicle: 'Dragon car',
      });

      expect(res.lastID).to.eql(1);
    });
  });

  describe('RideService.getRides', () => {
    it('should throw a RideNotFoundError when no ride exists', async () => {
      expect(rideService.getRides({ page: 4, limit: 4 }))
        .to.eventually.be.rejectedWith(rideNotFoundError);
    });

    it('should return a list of rides when rides exist', async () => {
      await seeder.seedRides(rideFixtures);
      const rides = await rideService.getRides({ page: 1, limit: 1 });

      expect(rides.length).to.eql(1);

      expect(parseRideDataForAssertion(rides[0])).to.eql(parseRideDataForAssertion(rideFixtures[0]));
    });

    it('should return a correct paginated list of rides', async () => {
      await seeder.seedRides(rideFixtures);
      const rides = await rideService.getRides({ page: 2, limit: 2 });

      expect(parseRideDataForAssertion(rides[0])).to.eql(parseRideDataForAssertion(rideFixtures[2]));
      expect(parseRideDataForAssertion(rides[0])).to.eql(parseRideDataForAssertion(rideFixtures[2]));
    });
  });

  describe('RideService.getRideByID', () => {
    it('should throw a RideNotFoundError when no ride matching the rideID exists', async () => {
      expect(rideService.getRideByID(1))
        .to.eventually.be.rejectedWith(rideNotFoundError);
    });

    it('should return a list of rides when rides exist', async () => {
      await seeder.seedRides([rideFixtures[0], rideFixtures[1]]);
      const rides = await rideService.getRideByID(2);

      expect(rides.length).to.eql(1);
      expect(parseRideDataForAssertion(rides[0])).to.eql(parseRideDataForAssertion(rideFixtures[1]));
    });
  });
});
