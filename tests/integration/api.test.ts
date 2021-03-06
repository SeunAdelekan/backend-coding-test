import supertest from 'supertest';
import { expect, assert } from 'chai';
import sqlite3 from 'sqlite3';
import sinon from 'sinon';
import { Database, open } from 'sqlite';
import bootstrapApp from '../../src/app';
import resolveDBManager from '../dbManager';
import resolveSeeder from '../seeder';
import ERROR_MESSAGE from '../../src/constant/errorMessage';
import ERROR_CODE from '../../src/constant/errorCode';
import rideFixtures from '../fixtures/rides';
import { DBManager, RideRequest, Seeder } from '../../src/types';

describe('API tests', () => {
  let db: Database;
  let app;
  let dbManager: DBManager;
  let seeder: Seeder;
  let request: supertest.SuperTest<supertest.Test>;

  before(async () => {
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    });

    app = bootstrapApp(db);
    dbManager = resolveDBManager(db);
    seeder = resolveSeeder(db);

    request = supertest(app);
    await dbManager.setup();
  });

  after(() => dbManager.cleanup());

  const dbConnectionError = new Error('DB connection failed');

  describe('GET /health', () => {
    it('should return health', (done) => {
      request
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    afterEach(async () => {
      sinon.restore();
      await dbManager.cleanup();
    });

    const payload: RideRequest = {
      start_lat: 48.858222,
      start_long: 2.2945,
      end_lat: 48.861111,
      end_long: 2.335833,
      rider_name: 'Dominic Toretto',
      driver_name: 'The Transporter',
      driver_vehicle: 'Audi A8 W12',
    };

    const createRide = async (data: RideRequest) => request.post('/rides')
      .send(data)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    it('should create a ride', async () => {
      const res = await createRide(payload);

      assert.typeOf(res.body, 'array');
      expect(res.body.length).equals(1);

      const [createdRide] = res.body;
      expect(createdRide).to.have.property('rideID', 1);
      expect(createdRide).to.have.property('startLat', 48.858222);
      expect(createdRide).to.have.property('startLong', 2.2945);
      expect(createdRide).to.have.property('endLat', 48.861111);
      expect(createdRide).to.have.property('endLong', 2.335833);
      expect(createdRide).to.have.property('riderName', 'Dominic Toretto');
      expect(createdRide).to.have.property('driverName', 'The Transporter');
      expect(createdRide).to.have.property('driverVehicle', 'Audi A8 W12');
    });

    it('should throw a validation error when an invalid request parameter is provided', async () => {
      const data = [
        { key: 'start_lat', value: -190, expectedMessage: ERROR_MESSAGE.INVALID_START_COORDINATE },
        { key: 'start_long', value: 190, expectedMessage: ERROR_MESSAGE.INVALID_START_COORDINATE },
        { key: 'end_lat', value: 270, expectedMessage: ERROR_MESSAGE.INVALID_END_COORDINATE },
        { key: 'end_long', value: 290, expectedMessage: ERROR_MESSAGE.INVALID_END_COORDINATE },
        { key: 'rider_name', value: 1, expectedMessage: ERROR_MESSAGE.INVALID_RIDER_NAME },
        { key: 'rider_name', value: '', expectedMessage: ERROR_MESSAGE.INVALID_RIDER_NAME },
        { key: 'driver_name', value: 20, expectedMessage: ERROR_MESSAGE.INVALID_DRIVER_NAME },
        { key: 'driver_name', value: '', expectedMessage: ERROR_MESSAGE.INVALID_DRIVER_NAME },
        { key: 'driver_vehicle', value: [0, 0], expectedMessage: ERROR_MESSAGE.INVALID_DRIVER_VEHICLE },
        { key: 'driver_vehicle', value: '', expectedMessage: ERROR_MESSAGE.INVALID_DRIVER_VEHICLE },
      ];

      for (let i = 0; i < data.length; i += 1) {
        const props = data[i];
        const res = await createRide({ ...payload, [props.key]: props.value });
        expect(res.body).to.eql({
          error_code: 'VALIDATION_ERROR', message: props.expectedMessage,
        });
      }
    });

    it('should return a server error when a DB insertion fails', async () => {
      sinon.stub(db, 'run').rejects(dbConnectionError);

      const res = await createRide(payload);

      expect(res.body).to.eql({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    });

    it('should return a server error when a DB selection fails after insertion', async () => {
      sinon.stub(db, 'run').callsArgOnWith(2, { lastID: 1 }, false);
      sinon.stub(db, 'all').rejects(dbConnectionError);

      const res = await createRide(payload);

      expect(res.body).to.eql({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    });
  });

  describe('GET /rides', () => {
    afterEach(() => sinon.restore());

    const getRides = async (query = {}) => request.get('/rides')
      .query(query)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    it('should return a server error when retrieval from DB fails', async () => {
      sinon.stub(db, 'all').rejects(dbConnectionError);

      const res = await getRides();

      expect(res.body).to.eql({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    });

    it('should return a validation error when malicious SQL query strings are used', async () => {
      const maliciousSQLOne = '1\'); DELETE FROM Rides; --';
      const maliciousSQLTwo = '2\' OR \'j\'=\'j", "2\'); DELETE FROM Rides; --';

      const testData = [
        { key: 'page', value: maliciousSQLOne, expectedMessage: ERROR_MESSAGE.INVALID_PAGE },
        { key: 'limit', value: maliciousSQLTwo, expectedMessage: ERROR_MESSAGE.INVALID_LIMIT },
      ];

      for (let i = 0; i < testData.length; i += 1) {
        const data = testData[i];
        const res = await getRides({ [data.key]: data.value });

        expect(res.body).to.eql({
          error_code: ERROR_CODE.VALIDATION_ERROR,
          message: data.expectedMessage,
        });
      }
    });

    it('should return a validation error when invalid pagination params are used', async () => {
      const testData = [
        { key: 'page', value: 0, expectedMessage: ERROR_MESSAGE.INVALID_PAGE },
        { key: 'page', value: 0.1, expectedMessage: ERROR_MESSAGE.INVALID_PAGE },
        { key: 'limit', value: -1, expectedMessage: ERROR_MESSAGE.INVALID_LIMIT },
        { key: 'limit', value: 1.5, expectedMessage: ERROR_MESSAGE.INVALID_LIMIT },
      ];

      for (let i = 0; i < testData.length; i += 1) {
        const data = testData[i];
        const res = await getRides({ [data.key]: data.value });

        expect(res.body).to.eql({
          error_code: ERROR_CODE.VALIDATION_ERROR,
          message: data.expectedMessage,
        });
      }
    });

    it('should return a rides not found error when no rides have been created', async () => {
      sinon.stub(db, 'all').resolves([]);
      const res = await getRides();

      expect(res.body).to.eql({
        error_code: ERROR_CODE.RIDES_NOT_FOUND,
        message: ERROR_MESSAGE.RIDES_NOT_FOUND,
      });
    });

    it('should return a list of created rides', async () => {
      sinon.stub(db, 'all').resolves(rideFixtures);

      const res = await getRides();

      expect(res.body).to.eql(rideFixtures);
    });

    it('should return a correct result when HTTP request is paginated', async () => {
      await seeder.seedRides(rideFixtures);
      const res = await getRides({ page: 2, limit: 2 });

      expect(res.body.length).to.eql(2);

      delete res.body[0].created;
      delete res.body[1].created;

      const thirdRide = rideFixtures[2];
      const fourthRide = rideFixtures[3];

      expect(res.body).to.eql([
        {
          rideID: thirdRide.rideID,
          startLat: thirdRide.startLat,
          startLong: thirdRide.startLong,
          endLat: thirdRide.endLat,
          endLong: thirdRide.endLong,
          riderName: thirdRide.riderName,
          driverName: thirdRide.driverName,
          driverVehicle: thirdRide.driverVehicle,
        },
        {
          rideID: fourthRide.rideID,
          startLat: fourthRide.startLat,
          startLong: fourthRide.startLong,
          endLat: fourthRide.endLat,
          endLong: fourthRide.endLong,
          riderName: fourthRide.riderName,
          driverName: fourthRide.driverName,
          driverVehicle: fourthRide.driverVehicle,
        },
      ]);
    });
  });

  describe('GET /rides/:id', () => {
    afterEach(() => sinon.restore());

    const getRideByID = async (rideID: Number | string) => request.get(`/rides/${rideID}`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    it('should return a server error when retrieval from DB fails', async () => {
      sinon.stub(db, 'all').rejects(dbConnectionError);

      const res = await getRideByID(1);

      expect(res.body).to.eql({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    });

    it('should return a rides not found error when no ride matching the rideID exists', async () => {
      sinon.stub(db, 'all').resolves([]);
      const res = await getRideByID(1);

      expect(res.body).to.eql({
        error_code: ERROR_CODE.RIDES_NOT_FOUND,
        message: ERROR_MESSAGE.RIDES_NOT_FOUND,
      });
    });

    it('should return a validation error when an unacceptable ride ID is used', async () => {
      const maliciousIDOne = '1\'); DELETE FROM Rides; --';
      const maliciousIDTwo = '1\' OR \'a\'=\'a", "1\'); DELETE FROM items; --';
      const testIDs = ['hello world', -1, 0, maliciousIDOne, maliciousIDTwo];

      for (let i = 0; i < testIDs.length; i += 1) {
        const id = testIDs[i];
        const res = await getRideByID(id);

        expect(res.body).to.eql({
          error_code: ERROR_CODE.VALIDATION_ERROR,
          message: ERROR_MESSAGE.INVALID_RIDE_ID,
        });
      }
    });

    it('should return a ride matching the rideID when it exists', async () => {
      sinon.stub(db, 'all').resolves([rideFixtures[0]]);
      const res = await getRideByID(1);

      expect(res.body).to.eql([rideFixtures[0]]);
    });
  });
});
