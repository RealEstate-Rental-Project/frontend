import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ApiError } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Ignore 401 errors as they are handled by AuthInterceptor (redirect to login)
            if (error.status === 401) {
                return throwError(() => error);
            }

            let message = 'An unexpected error occurred';

            if (error.error && typeof error.error === 'object' && 'error' in error.error && 'message' in error.error) {
                // Standardized Backend Error
                const apiError = error.error as ApiError;
                message = apiError.message;
            } else if (error.status === 0) {
                message = 'Unable to connect to the server. Please check your internet connection.';
            } else if (error.message) {
                message = error.message;
            }

            toastService.show(message, 'error');

            return throwError(() => error);
        })
    );
};
