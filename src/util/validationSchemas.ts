import Joi from '@hapi/joi';
import ERROR_MESSAGE from '../constant/errorMessage';

export default {
  createRide: Joi.object({
    start_lat: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .error(new Error(ERROR_MESSAGE.INVALID_START_COORDINATE)),
    start_long: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .error(new Error(ERROR_MESSAGE.INVALID_START_COORDINATE)),
    end_lat: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .error(new Error(ERROR_MESSAGE.INVALID_END_COORDINATE)),
    end_long: Joi.number()
      .min(-180)
      .max(180).required()
      .error(new Error(ERROR_MESSAGE.INVALID_END_COORDINATE)),
    rider_name: Joi.string()
      .min(1)
      .required()
      .error(new Error(ERROR_MESSAGE.INVALID_RIDER_NAME)),
    driver_name: Joi.string()
      .min(1)
      .required()
      .error(new Error(ERROR_MESSAGE.INVALID_DRIVER_NAME)),
    driver_vehicle: Joi.string()
      .min(1)
      .required()
      .error(new Error(ERROR_MESSAGE.INVALID_DRIVER_VEHICLE)),
  }),
  getRides: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .error(new Error(ERROR_MESSAGE.INVALID_PAGE)),
    limit: Joi.number()
      .integer()
      .min(1)
      .error(new Error(ERROR_MESSAGE.INVALID_LIMIT)),
  }),
};
