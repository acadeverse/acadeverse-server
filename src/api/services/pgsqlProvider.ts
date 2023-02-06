import { PoolClient, Pool } from 'pg';
import config from '../../config/pgsql';

const pool = new Pool(config);

interface PgSQLService {
  getClient(): Promise<PoolClient>;
}

let service: PgSQLService = {
  getClient: async () => {
    return await pool.connect();
  }
}

export default service;