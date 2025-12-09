import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, from, switchMap, catchError, BehaviorSubject, filter, take } from 'rxjs';
import { StorageUtils } from '../utils/storage.utils';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const router = inject(Router);
    // We cannot inject AuthService here directly if AuthService depends on HttpClient which depends on this interceptor (Circular Dependency).
    // However, AuthService needs HttpClient to make calls.
    // To avoid circular dependency, we might need to extract the refresh logic or use a lower-level way to call refresh.
    // Or, we can inject AuthService but ensure AuthService doesn't trigger this interceptor for the refresh call itself.

    // Strategy: Manually fetch refresh token using fetch or a separate HttpClient instance if needed, 
    // OR rely on AuthService but ensure AuthService.refreshToken() uses a backend-only client or similar.
    // For simplicity, let's try injecting AuthService and see if we can handle the recursion by filtering the URL.

    // Actually, standard pattern is to inject AuthService. 
    // But AuthService uses HttpClient. HttpClient uses Interceptor. Interceptor uses AuthService. -> Cycle.
    // Solution: Move refresh logic to a separate helper or use `Injector` to get AuthService lazily?
    // Or simply implement the refresh call using `fetch` inside the interceptor to break the loop.

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
                return handle401Error(authReq, next, router);
            }
            return throwError(() => error);
        })
    );
};

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, router: Router) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);
        const refreshToken = StorageUtils.getRefreshToken();

        if (refreshToken) {
            // Use fetch to avoid circular dependency with HttpClient
            return from(fetch('http://localhost:8080/api/auth/metamask/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            }).then(res => {
                if (!res.ok) throw new Error('Refresh failed');
                return res.json();
            })).pipe(
                switchMap((data: any) => {
                    isRefreshing = false;
                    const { accessToken, refreshToken: newRefreshToken } = data;
                    StorageUtils.setAccessToken(accessToken);
                    if (newRefreshToken) StorageUtils.setRefreshToken(newRefreshToken);
                    refreshTokenSubject.next(accessToken);

                    return next(request.clone({
                        setHeaders: { Authorization: `Bearer ${accessToken}` }
                    }));
                }),
                catchError((err) => {
                    isRefreshing = false;
                    StorageUtils.clear();
                    router.navigate(['/auth/login']);
                    return throwError(() => err);
                })
            );
        } else {
            isRefreshing = false;
            StorageUtils.clear();
            router.navigate(['/auth/login']);
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
