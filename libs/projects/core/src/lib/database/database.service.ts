import { Inject, Injectable } from '@angular/core';
import { DATABASE_CONFIG, DatabaseConfig } from './database.config';
import { Database } from './database';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private databases = new Map<string, Database>();

  constructor(
    @Inject(DATABASE_CONFIG) private config: DatabaseConfig
  ) {}

  public get(name?: string): Database {
    if (!name) name = this.config.defaultDatabaseName;
    name = this.config.databasePrefix + name;
    let db = this.databases.get(name);
    if (!db) {
      console.log('Opening database ', name);
      db = new Database(name);
      this.databases.set(name, db);
    }
    return db;
  }

}
