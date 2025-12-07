import { Route } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { PropertyDetailsComponent } from './features/property-details/property-details.component';
import { AboutComponent } from './features/about/about.component';

export const appRoutes: Route[] = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'properties/:id', component: PropertyDetailsComponent },
    { path: 'about', component: AboutComponent },
    { path: '', component: HomeComponent },
];
