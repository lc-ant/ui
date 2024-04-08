import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonApp, IonicRouteStrategy, IonRouterOutlet, provideIonicAngular } from '@ionic/angular/standalone';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AUTH_CONFIG, AuthConfig, DATABASE_CONFIG, DatabaseConfig, HTTP_CONFIG, HttpConfig, I18N_CONFIG, I18nConfig, LcAntCoreModule, ROUTER_CONFIG, LcAntRouterConfig } from '@lc-ant/core';
import { LcAntNavigationModule } from '@lc-ant/navigation';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonApp,
    IonRouterOutlet,
    AppRoutingModule,
    LcAntCoreModule,
    LcAntNavigationModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_CONFIG, useClass: HttpConfig },
    { provide: AUTH_CONFIG, useClass: AuthConfig },
    { provide: I18N_CONFIG, useClass: I18nConfig },
    { provide: DATABASE_CONFIG, useClass: DatabaseConfig },
    { provide: ROUTER_CONFIG, useClass: LcAntRouterConfig },
    provideIonicAngular({ mode: 'md' }),
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
