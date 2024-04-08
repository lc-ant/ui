import { InjectionToken } from '@angular/core';

export class DatabaseConfig {
  public databasePrefix = 'lc-ant_';
  public defaultDatabaseName = 'default';
}

export const DATABASE_CONFIG = new InjectionToken<DatabaseConfig>('database config');
