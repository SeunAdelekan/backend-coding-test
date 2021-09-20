import supertest from 'supertest';
import { expect, assert } from 'chai';
import sqlite3 from 'sqlite3';
import sinon from 'sinon';
import bootstrapApp from '../src/app';
import resolveDBManager from './dbManager';
import resolveSeeder from './seeder';
import ERROR_MESSAGE from '../src/constant/errorMessage';
import ERROR_CODE from '../src/constant/errorCode';
import rideFixtures from './fixtures/rides';
import { RideRequest } from '../src/types';

const db = new (sqlite3.verbose()).Database(':memory:');
const app = bootstrapApp(db);
const dbManager = resolveDBManager(db);
const seeder = resolveSeeder(db);

const request = supertest(app);

describe('API tests', () => {
  before(() => dbManager.setup());

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

      for (const props of data) {
        const res = await createRide({ ...payload, [props.key]: props.value });
        expect(res.body).to.eql({
          error_code: 'VALIDATION_ERROR', message: props.expectedMessage,
        });
      }
    });

    it('should return a server error when a DB insertion fails', async () => {
      sinon.stub(db, 'run').yields(dbConnectionError);

      const res = await createRide(payload);

      expect(res.body).to.eql({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    });

    it('should return a server error when a DB selection fails after insertion', async () => {
      sinon.stub(db, 'run').callsArgOnWith(2, { lastID: 1 }, false);
      sinon.stub(db, 'all').yields(dbConnectionError);

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
      sinon.stub(db, 'all').yields(dbConnectionError);

      const res = await getRides();

      expect(res.body).to.eql({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    });

    it('should return a validation error when invalid pagination params are used', async () => {
      const testData = [
        { key: 'page', value: 0, expectedMessage: ERROR_MESSAGE.INVALID_PAGE },
        { key: 'limit', value: -1, expectedMessage: ERROR_MESSAGE.INVALID_LIMIT },
      ];

      for (let data of testData) {
        const res = await getRides({ [data.key]: data.value });

        expect(res.body).to.eql({
          error_code: ERROR_CODE.VALIDATION_ERROR,
          message: data.expectedMessage,
        });
      }
    });

    it('should return a rides not found error when no rides have been created', async () => {
      sinon.stub(db, 'all').yields(false, []);
      const res = await getRides();

      expect(res.body).to.eql({
        error_code: ERROR_CODE.RIDES_NOT_FOUND,
        message: ERROR_MESSAGE.RIDES_NOT_FOUND,
      });
    });

    it('should return a list of created rides', async () => {
      sinon.stub(db, 'all').yields(false, rideFixtures);

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

  describe('GET /rides/:rideID', () => {
    afterEach(() => sinon.restore());

    const getRidesByID = async (rideID: Number) => request.get(`/rides/${rideID}`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/);

    it('should return a server error when retrieval from DB fails', async () => {
      sinon.stub(db, 'all').yields(dbConnectionError);

      const res = await getRidesByID(1);

      expect(res.body).to.eql({
        error_code: ERROR_CODE.SERVER_ERROR,
        message: ERROR_MESSAGE.UNKNOWN_ERROR,
      });
    });

    it('should return a rides not found error when no ride matching the rideID exists', async () => {
      sinon.stub(db, 'all').yields(false, []);
      const res = await getRidesByID(1);

      expect(res.body).to.eql({
        error_code: ERROR_CODE.RIDES_NOT_FOUND,
        message: ERROR_MESSAGE.RIDES_NOT_FOUND,
      });
    });

    it('should return a ride matching the rideID when it exists', async () => {
      sinon.stub(db, 'all').yields(false, [rideFixtures[0]]);
      const res = await getRidesByID(1);

      expect(res.body).to.eql([rideFixtures[0]]);
    });
  });
});
