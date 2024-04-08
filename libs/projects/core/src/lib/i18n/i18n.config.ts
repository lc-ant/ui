import { InjectionToken } from '@angular/core';

export class I18nConfig {
  public defaultLocale = 'en_US';
  public availableLocales: { [language: string]: { [country: string]: [string]}} = {
    'en': {},
    'fr': {}
  };

  public localizationFilesLocation = '/assets/i18n';
}

export const I18N_CONFIG = new InjectionToken<I18nConfig>('i18n config');

