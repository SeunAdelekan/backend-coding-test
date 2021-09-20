import ERROR_MESSAGE from '../constant/errorMessage';
import ERROR_CODE from '../constant/errorCode';

class ServiceError extends Error {
    errorCode: string;

    constructor({ message, errorCode }: { message: string, errorCode: string }) {
        super(message);
        this.errorCode = errorCode;
    }
}

export const rideNotFoundError = new ServiceError({
    errorCode: ERROR_CODE.RIDES_NOT_FOUND,
    message: ERROR_MESSAGE.RIDES_NOT_FOUND,
});
