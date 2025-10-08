import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { withInMemoryScrolling } from '@angular/router';
import { provideNzIcons } from './icons-provider';
import { FormsModule } from '@angular/forms';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { CustomModalService } from './services/custom-modal.service';
import { ScrollToTopService } from './services/scroll-to-top.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Factory for modal scroll strategy
export function noopScrollStrategyFactory(options: ScrollStrategyOptions): ScrollStrategy {
  return options.noop();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withViewTransitions({
        skipInitialTransition: false,
        onViewTransitionCreated: () => {
          console.log('View transition created');
        }
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(),
    provideNzI18n(en_US),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    provideNzIcons(),
    FormsModule,
    NzModalService,
    NzMessageService,
    CustomModalService,
    ScrollToTopService
  ]
};
