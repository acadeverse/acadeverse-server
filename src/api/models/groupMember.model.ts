import PgSQLService from '../services/pgsqlProvider';
import { ApiError } from '../errors/api.error';
import { ModelError, ModelErrorType } from '../errors/model.error';
import { pgsqlWrapper, pgsqlWrapperTransaction } from '../utils/model.util';
import { PoolClient } from 'pg';

export interface GroupMemberViewModel {
  user_uuid: string;
  user_name: string;
  joined_time: number;
}

export enum GroupMemberPrivilegeType { owner, admin, member };

interface GroupMemberModel {
  getMembersOfGroup(id: string): Promise<GroupMemberViewModel[]>,
  joinGroup(group_uuid: string, user_uuid: string): Promise<void>,
  leaveGroup(group_uuid: string, user_uuid: string): Promise<void>,
}

let model: GroupMemberModel = {
  getMembersOfGroup: async (id: string) => {
    return pgsqlWrapper<GroupMemberViewModel[]>(async (client: PoolClient) => {
      const results = await client.query(`
        SELECT "user".uuid as user_uuid, "user".user_name as user_name, group_member.joined_time as joined_time
        FROM group_member JOIN "user" ON group_member.user_uuid = "user".uuid
        WHERE group_member.group_uuid = $1`,
        [id]);

      return results.rows;
    });
  },
  joinGroup: async (group_uuid: string, user_uuid: string) => {
    return pgsqlWrapperTransaction<void>(async (client: PoolClient) => {

      //TODO: Check user privilege before joining group.

      const results = await client.query(
        `INSERT INTO group_member (group_uuid, user_uuid, joined_time, privilege) VALUES ($1, $2, to_timestamp($3), $4) 
        ON CONFLICT (group_uuid, user_uuid)
          DO NOTHING
        RETURNING group_uuid, user_uuid`, 
        [group_uuid, user_uuid, Date.now() / 1000.0, 'member']);

      if (results.rowCount == 0) throw new ModelError({
        message: "User already joined group",
        type: ModelErrorType.AlreadyExists
      })
    });
  },

  leaveGroup: async (group_uuid: string, user_uuid: string) => {
    return pgsqlWrapperTransaction<void>(async (client: PoolClient) => {

      //TODO: Check if user is owner before leaving group.

      const results = await client.query(
        `DELETE FROM group_member
        WHERE group_uuid = $1 AND user_uuid = $2
        RETURNING *`, 
        [group_uuid, user_uuid]);

      if (results.rowCount == 0) throw new ModelError({
        message: "User is not in group",
        type: ModelErrorType.NotFonud
      })
    });
  },
}

export default model;

