import PgSQLService from '../services/pgsqlProvider';
import { ApiError } from '../errors/api.error';
import { ModelError, ModelErrorType } from '../errors/model.error';
import { pgsqlWrapper, pgsqlWrapperTransaction } from '../utils/model.util';
import { PoolClient } from 'pg';

interface User {
  id: string,
  name: string,
  firebase_uid: string,
}

interface UserModel {
  getOne(id: string): Promise<User>,
  registerUser(name: string, firebase_uid: string): Promise<number>,
  loginUser(firebase_uid: string): Promise<number>,
}

let model: UserModel = {
  getOne: async (id: string) => {
    return pgsqlWrapper<User>(async (client: PoolClient) => {
      const results = await client.query(`
        SELECT user_id, firebase_uid, user_name 
        FROM users WHERE user_id = $1`,
        [id]);
      if (results.rowCount == 0) throw new ModelError({
        message: "User not found",
        type: ModelErrorType.NotFonud
      })

      return {
        id: results.rows[0].user_id,
        firebase_uid: results.rows[0].firebase_uid,
        name: results.rows[0].name,
      }
    });
  },
  registerUser: async (name: string, firebase_uid: string) => {
    return pgsqlWrapperTransaction<number>(async (client: PoolClient) => {
      const resultInsert = await client.query(
        `INSERT INTO users (firebase_uid, user_name) VALUES ($1, $2) 
        ON CONFLICT (firebase_uid) 
          WHERE ((firebase_uid)::text = ($3)::text)
          DO NOTHING
        RETURNING user_id`, 
        [firebase_uid, name, firebase_uid]);

      if (resultInsert.rowCount == 0) throw new ModelError({
        message: "User already exists",
        type: ModelErrorType.AlreadyExists
      })

      return resultInsert.rows[0].user_id;
    });
  },
  loginUser: async (firebase_uid: string) => {
    return pgsqlWrapperTransaction<number>(async (client: PoolClient) => {
      const results = await client.query(
        `SELECT user_id
        FROM users
        WHERE firebase_uid = $1`, 
        [firebase_uid]);

      if (results.rowCount == 0) throw new ModelError({
        message: "User not found",
        type: ModelErrorType.NotFonud
      })

      return results.rows[0].user_id;
    });
  },
}

export default model;

