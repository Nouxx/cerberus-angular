import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { KeycloakService } from 'src/app/core/services/auth/keycloak.service';

if (environment.production) {
  enableProdMode();
}

KeycloakService.init()
  .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
  .catch(err => console.log(err));
