import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, from, switchMap, catchError, BehaviorSubject, filter, take } from 'rxjs';
import { StorageUtils } from '../utils/storage.utils';
import { API_CONSTANTS } from '../../../core/constants/api.constants';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const router = inject(Router);
    const injector = inject(Injector);

    const token = StorageUtils.getAccessToken();
    let authReq = req;

    if (token) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/auth/metamask/refresh') && !req.url.includes('/auth/metamask/login')) {
                return handle401Error(authReq, next, router, injector);
            }
            return throwError(() => error);
        })
    );
};

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, router: Router, injector: Injector) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);
        const refreshToken = StorageUtils.getRefreshToken();

        if (refreshToken) {
            // Construction de l'URL avec le paramètre de requête en utilisant API_CONSTANTS
            const urlWithParams = `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.AUTH.REFRESH}?refreshToken=${encodeURIComponent(refreshToken)}`;

            return from(fetch(urlWithParams, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
                // Pas de corps (body) nécessaire si tout passe par l'URL
            }).then(res => {
                if (!res.ok) throw new Error('Refresh failed');
                return res.json();
            })).pipe(
                switchMap((data: any) => {
                    isRefreshing = false;
                    const { access_token, refresh_token } = data;
                    StorageUtils.setAccessToken(access_token);
                    if (refresh_token) StorageUtils.setRefreshToken(refresh_token);
                    refreshTokenSubject.next(access_token);

                    return next(request.clone({
                        setHeaders: { Authorization: `Bearer ${access_token}` }
                    }));
                }),
                catchError((err) => {
                    isRefreshing = false;
                    const authService = injector.get(AuthService);
                    authService.logout();
                    return throwError(() => err);
                })
            );
        } else {
            isRefreshing = false;
            const authService = injector.get(AuthService);
            authService.logout();
            return throwError(() => new Error('No refresh token'));
        }
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(token => {
                return next(request.clone({
                    setHeaders: { Authorization: `Bearer ${token}` }
                }));
            })
        );
    }
}
