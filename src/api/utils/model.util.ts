import { PoolClient } from 'pg';
import { ApiError } from '../errors/api.error';
import { ModelError, ModelErrorType } from '../errors/model.error';
import PgSQLService from '../services/pgsqlProvider';
import httpStatus from 'http-status';

export async function pgsqlWrapper<T>(func: (client: PoolClient) => Promise<T>) {
  try {
    const pg = await PgSQLService.getClient();
    return func(pg);
  } 
  catch(e: any) {
    console.log(e.message);
    if (e instanceof ModelError) throw e;
    throw new ModelError({
      message: e.message,
      type: ModelErrorType.DatabaseError,
    })
  }
}

export async function pgsqlWrapperTransaction<T>(func: (client: PoolClient) => Promise<T>) {
  const pg = await PgSQLService.getClient();
  try {
    await pg.query('BEGIN');
    let result: T = await func(pg);
    await pg.query('COMMIT');
    return result;
  } 
  catch(e: any) {
    console.log(`PGSQL transaction error: ${e.message}`);
    await pg.query('ROLLBACK');
    if (e instanceof ModelError) throw e;
    throw new ModelError({
      message: e.message,
      type: ModelErrorType.DatabaseError,
    })
  }
  finally {
    pg.release();
  }
}

export function modelToApiError(e: ModelError): ApiError{
  let type: number = httpStatus.INTERNAL_SERVER_ERROR;

  switch (e.type) {
    case ModelErrorType.Default:
      type = httpStatus.INTERNAL_SERVER_ERROR;
      break;
    case ModelErrorType.NotFonud:
      type = httpStatus.INTERNAL_SERVER_ERROR;
      break;
    case ModelErrorType.AlreadyExists:
      type = httpStatus.INTERNAL_SERVER_ERROR;
      break;
    case ModelErrorType.DatabaseError:
      type = httpStatus.INTERNAL_SERVER_ERROR;
      break;
  }

  return new ApiError({
    message: e.message,
    status: type
  });
}