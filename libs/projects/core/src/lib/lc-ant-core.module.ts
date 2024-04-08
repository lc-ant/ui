import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { TranslateDirective } from './i18n/translate.directive';
import { TranslatePipe } from './i18n/translate.pipe';
import { LocationStrategy } from '@angular/common';
import { PreserveQueryParamsLocationStrategy } from './router/preserve-query-params-location-strategy';
import { ThemeService } from './theme/theme.service';

@NgModule({
  declarations: [
    TranslateDirective,
    TranslatePipe,
  ],
  imports: [
    HttpClientModule
  ],
  exports: [
    TranslateDirective,
    TranslatePipe,
  ],
  providers: [
    { provide: LocationStrategy, useClass: PreserveQueryParamsLocationStrategy },
    { provide: APP_INITIALIZER, useFactory: () => () => {}, deps: [ThemeService], multi: true}
  ]
})
export class LcAntCoreModule { }
