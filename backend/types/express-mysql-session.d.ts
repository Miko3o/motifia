import { Store } from 'express-session';

declare module 'express-mysql-session' {
  interface MySQLStoreOptions {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    clearExpired?: boolean;
    checkExpirationInterval?: number;
    expiration?: number;
  }

  class MySQLStore extends Store {
    constructor(options: MySQLStoreOptions);
    get(sid: string, callback: (err: any, session?: any) => void): void;
    set(sid: string, session: any, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    onReady(): Promise<void>;
    close(): Promise<void>;
  }

  export default function(session: any): typeof MySQLStore;
} 