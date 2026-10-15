import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appConfig } from './app/app.config';
import { routes } from './app/app.routes';
import { App } from './app/app';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    provideRouter(routes)
  ]
})
  .catch((err) => console.error(err));
