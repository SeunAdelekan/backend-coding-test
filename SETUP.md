# Xendit Backend Coding Test
A RESTful API facilitating the creation and retrieval of rides.

## Getting Started
Install project dependencies via npm:
```bash
npm install
```

Start the application:
```bash
npm start
```

A postman collection for testing the API is available for download [here](https://www.getpostman.com/collections/39b0da8cfc6dac920ff8).

## Technologies used
* Javascript as implementation language.
* Express as a web API framework.
* Mocha and supertest for unit and integration tests.
* SQLite3 as a database.
* Swagger for API documentation.

## API Documentation
Swagger was utilized to thoroughly document the API's endpoints. The documentation can be accessed from a web browser via
http://localhost:8081/documentation. Prior to viewing it, ensure that all project dependencies have been installed,
especially `swagger-ui-express`. After installation of the project's dependencies, start the service and access the documentation
with your browser of choice.

In addition, a complete breakdown of the exposed API resources is available below.

### POST /rides
Creates a new ride.

*Request Parameters*

| Parameter   | Description                               | 
|-------------|-------------------------------------------|
| start_lat   | Starting latitude of the ride. |
| start_long   | Starting longitude of the ride.|
| end_lat   | Ending latitude of the ride.|
| end_long   | Ending longitude of the ride.|
| rider_name   | Name of the rider.|
| driver_name   | Name of the driver.|
| driver_vehicle   | Name of the driver's vehicle.|

Sample request:
```json
{
  "start_lat": 48.858222,
  "start_long": 2.2945,
  "end_lat": 48.861111,
  "end_long": 2.335833,
  "rider_name": "Dominic Toretto",
  "driver_name": "The Transporter",
  "driver_vehicle": "Audi A8 W12"
}
```

Sample response:
```json
[
  {
    "rideID": 1,
    "startLat": 48.858222,
    "startLong": 2.2945,
    "endLat": 48.861111,
    "endLong": 2.335833,
    "riderName": "Dominic Toretto",
    "driverName": "The Transporter",
    "driverVehicle": "Audi A8 W12",
    "created": "2021-09-18 23:38:06"
  }
]
```

### GET /rides
This endpoint gets a list of created rides from the backend.

*Query Parameters*

| Parameter   | Description                               | 
|-------------|-------------------------------------------|
| page   | Requested data page. Defaults to 1 if not given. |
| limit   | Max number of records to be retrieved per page. Defaults to 10 if not given. |

Sample response:
```json
[
  {
    "rideID": 1,
    "startLat": 48.858222,
    "startLong": 2.2945,
    "endLat": 48.861111,
    "endLong": 2.335833,
    "riderName": "Dominic Toretto",
    "driverName": "The Transporter",
    "driverVehicle": "Audi A8 W12",
    "created": "2021-09-18 23:38:06"
  },
  {
    "rideID": 2,
    "startLat": 1.858222,
    "startLong": 1.2945,
    "endLat": 3.861111,
    "endLong": 3.335833,
    "riderName": "M",
    "driverName": "James Bond",
    "driverVehicle": "Aston Martin DB5",
    "created": "2021-09-18 23:43:53"
  }
]
```

### GET /rides/{rideID}
This endpoint gets a ride by its ID.

Sample request:
`http://localhost:8081/rides/2`

Sample response:
```json
[
  {
    "rideID": 2,
    "startLat": 1.858222,
    "startLong": 1.2945,
    "endLat": 3.861111,
    "endLong": 3.335833,
    "riderName": "M",
    "driverName": "James Bond",
    "driverVehicle": "Aston Martin DB5",
    "created": "2021-09-18 23:43:53"
  }
]
```

Where:

| Parameter   | Description                               | 
|-------------|-------------------------------------------|
| rideID   | ID of the ride to get. |
| startLat   | Starting latitude of the ride. |
| startLong   | Starting longitude of the ride.|
| endLat   | Ending latitude of the ride.|
| endLong   | Ending longitude of the ride.|
| riderName   | Name of the rider.|
| driverName   | Name of the driver.|
| driverVehicle   | Name of the driver's vehicle.|
| created   | Date and time that the ride was created.|

### GET /health
Gets the health status of the service. Returns `Healthy` when the service is running appropriately. 

### Returned HTTP Status Codes
The following are the HTTP status codes that can be received from the server in response to transaction creation requests.

| Status Code | Description                               | 
|-------------|-------------------------------------------------|
| 200          | The server has completed the execution of the request.|

## Tests
Tests were written to verify the correctness of the system.
Unit and integration tests can be run with the following command:
```bash
npm test
```

### Load Testing
Load tests were written for the API to verify that it gives acceptable performance under load. The tools used for load testing
are:
* Artillery: An NPM load testing and functional testing library.
* start-server-and-test: Used to start the server, wait for it, run test command and shut it down.

> Important Note: Artillary's version `1.6.2` was used instead of a more recent `7.*.*` variant in order to ensure
compatibility with the specified Node.js runtime version, i.e `node (>8.6 and <= 10)`. This is because newer versions of
Artillary are incompatible with Node.js `10.0.0` and lower.

Load tests can be run with the command below:
```bash
npm run test:load
```

### Load test configurations
The configuration file and scenarios used to execute the test can be found in project's `./artillery` directory at
`./artillery/config.yml` and `./artillery/scenerios.yml` respectively. Requests were setup to execute at in initial rate
of `150rps` for `30s` after which they are ramped up to `1000rps` for `30s`. `p99` is under `50ms` for all endpoints.  

![Load test results](assets/images/load-test-summary-report.png?raw=true "")
