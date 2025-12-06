import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    }
];
