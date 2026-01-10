import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { authInterceptor } from './features/auth/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
<<<<<<< HEAD
import { provideAnimations } from '@angular/platform-browser/animations';
=======


/**/
>>>>>>> 568124097e22afc0d72f8eb11dcf13495e9c362e
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ],
};
