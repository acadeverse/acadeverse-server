import PgSQLService from '../services/pgsqlProvider';
import { ApiError } from '../errors/api.error';
import { ModelError, ModelErrorType } from '../errors/model.error';
import { pgsqlWrapper, pgsqlWrapperTransaction } from '../utils/model.util';
import { PoolClient } from 'pg';

export interface User {
  uuid: string,
  name: string,
  firebase_uid: string,
}

interface UserModel {
  getOne(id: string): Promise<User>,
  getOneByFirebaseUID(id: string): Promise<User>,
  registerUser(name: string, firebase_uid: string): Promise<string>,
  loginUser(firebase_uid: string): Promise<string>,
}

let model: UserModel = {
  getOne: async (id: string) => {
    return pgsqlWrapper<User>(async (client: PoolClient) => {
      const results = await client.query(`
        SELECT uuid, firebase_uid, user_name 
        FROM "user" WHERE uuid = $1`,
        [id]);
      if (results.rowCount == 0) throw new ModelError({
        message: "User not found",
        type: ModelErrorType.NotFonud
      })

      return {
        uuid: results.rows[0].uuid,
        firebase_uid: results.rows[0].firebase_uid,
        name: results.rows[0].name,
      }
    });
  },
  getOneByFirebaseUID: async (id: string) => {
    return pgsqlWrapper<User>(async (client: PoolClient) => {
      const results = await client.query(`
        SELECT uuid, firebase_uid, user_name 
        FROM "user" WHERE firebase_uid = $1`,
        [id]);
      if (results.rowCount == 0) throw new ModelError({
        message: "User not found",
        type: ModelErrorType.NotFonud
      })

      return {
        uuid: results.rows[0].uuid,
        firebase_uid: results.rows[0].firebase_uid,
        name: results.rows[0].name,
      }
    });
  },
  registerUser: async (name: string, firebase_uid: string) => {
    return pgsqlWrapperTransaction<string>(async (client: PoolClient) => {
      const resultInsert = await client.query(
        `INSERT INTO "user" (firebase_uid, user_name) VALUES ($1, $2) 
        ON CONFLICT (firebase_uid) 
          WHERE ((firebase_uid)::text = ($3)::text)
          DO NOTHING
        RETURNING uuid`, 
        [firebase_uid, name, firebase_uid]);

      if (resultInsert.rowCount == 0) throw new ModelError({
        message: "User already exists",
        type: ModelErrorType.AlreadyExists
      })

      return resultInsert.rows[0].uuid;
    });
  },
  loginUser: async (firebase_uid: string) => {
    return pgsqlWrapperTransaction<string>(async (client: PoolClient) => {
      const results = await client.query(
        `SELECT uuid
        FROM "user"
        WHERE firebase_uid = $1`, 
        [firebase_uid]);

      if (results.rowCount == 0) throw new ModelError({
        message: "User not found",
        type: ModelErrorType.NotFonud
      })

      return results.rows[0].uuid;
    });
  },
}

export default model;

