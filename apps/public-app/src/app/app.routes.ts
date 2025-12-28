import { Route } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { PropertyDetailsComponent } from './features/property-details/property-details.component';
import { AboutComponent } from './features/about/about.component';
import { UserProfileComponent } from './features/user/user-profile/user-profile.component';
import { MyPropertiesComponent } from './features/properties/my-properties/my-properties.component';
import { CreatePropertyComponent } from './features/properties/create-property/create-property.component';

import { PropertiesListComponent } from './features/properties/properties-list/properties-list.component';

export const appRoutes: Route[] = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'properties', component: PropertiesListComponent },
    { path: 'properties/my-listings', component: MyPropertiesComponent },
    { path: 'properties/create', component: CreatePropertyComponent },
    { path: 'properties/edit/:id', component: CreatePropertyComponent },
    { path: 'properties/:id', component: PropertyDetailsComponent },
    { path: 'about', component: AboutComponent },
    { path: 'profile', component: UserProfileComponent },
    { path: 'my-reservations', loadComponent: () => import('./features/rentals/my-reservations/my-reservations.component').then(m => m.MyReservationsComponent) },
    { path: 'rentals/payment/:id', loadComponent: () => import('./features/rentals/payment/payment.component').then(m => m.PaymentComponent) },
    { path: '', component: HomeComponent },
];
