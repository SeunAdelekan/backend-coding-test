import { Request, Response, NextFunction } from 'express';
import { Schema } from '@hapi/joi';
import { ValidationType } from '../types';
import ERROR_CODE from '../constant/errorCode';

export default (schema: Schema, validationType: ValidationType) => (
  req: Request, res: Response, next: NextFunction,
) => {
  let data;

  if (validationType === ValidationType.Body) {
    data = req.body;
  } else if (validationType === ValidationType.Params) {
    data = req.params;
  } else {
    data = req.query;
  }

  const validationResult = schema.validate(data);

  if (!validationResult.error) {
    return next();
  }

  return res.send({
    error_code: ERROR_CODE.VALIDATION_ERROR,
    message: validationResult.error?.message,
  });
};
