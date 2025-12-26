export enum ApiErrorCode {
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
    INVALID_REQUEST = 'INVALID_REQUEST',
    NONCE_NOT_FOUND = 'NONCE_NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ApiError {
    error: ApiErrorCode;
    message: string;
    status: number;
}
