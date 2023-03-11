import PgSQLService from '../services/pgsqlProvider';
import { ApiError } from '../errors/api.error';
import { ModelError, ModelErrorType } from '../errors/model.error';
import { pgsqlWrapper, pgsqlWrapperTransaction } from '../utils/model.util';
import { PoolClient } from 'pg';
import GroupMemberModel, { GroupMemberPrivilegeType, GroupMemberViewModel } from './groupMember.model';

export enum GroupVisibilityType {public, anyone_with_link, member_invite, admin_invite, owner_invite};
export enum GroupJoinType {public, member_approve, admin_approve, owner_approve};
export enum GroupStatusType {active, frozen};

export interface GroupDataModel {
  uuid: string,
  name: string,
  owner_uuid: string,
  latitude: number,
  longitude: number,
  description: string,
  max_members: number,
  cover_photo: string,
  thumbnail: string,
  visibility: GroupVisibilityType,
  join_type: GroupJoinType,
  status: GroupStatusType,
}

export interface GroupViewModel {
  uuid: string,
  name: string,
  owner_uuid: string,
  owner_name: string,
  joined: boolean,
  is_owner: boolean,
  latitude: number,
  longitude: number,
  description: string,
  max_members: number,
  cover_photo: string,
  thumbnail: string,
  visibility: GroupVisibilityType,
  join_type: GroupJoinType,
  status: GroupStatusType,
  members: GroupMemberViewModel[],
}

interface GroupModel {
  getOne(group_uuid: string, user_uuid: string): Promise<GroupViewModel>,
  getAllAccessibleByUser(uuid: string): Promise<GroupViewModel[]>,
  createGroup(group: GroupDataModel): Promise<string>,
  deleteGroup(uuid: string): Promise<string>,

}

let model: GroupModel = {
  getOne: async (group_uuid: string, user_uuid: string) => {
    return pgsqlWrapper<GroupViewModel>(async (client: PoolClient) => {
      const results = await client.query(`
        SELECT "group".uuid, name, owner_uuid, "user".user_name as owner_name, latitude, longitude, description, max_members, 
          cover_photo, thumbnail, visibility, join_type, "group".status
        FROM "group" JOIN "user" ON "group".owner_uuid = "user".uuid WHERE "group".uuid = $1`,
        [group_uuid]);
      if (results.rowCount == 0) throw new ModelError({
        message: "Group not found",
        type: ModelErrorType.NotFonud
      })
      let group = results.rows[0];

      let group_members: GroupMemberViewModel[] = await GroupMemberModel.getMembersOfGroup(group.uuid);
      group.members = group_members;
      group.joined = false;
      group.is_owner = false;

      if (user_uuid) {
        group.joined = group_members.find((m) => m.user_uuid == user_uuid) != undefined;
        group.is_owner = group.owner_uuid == user_uuid;
      }

      return group;
    });
  },
  getAllAccessibleByUser: async (uuid: string) => {
    //TODO: check user privilege
    return pgsqlWrapper<GroupViewModel[]>(async (client: PoolClient) => {
      const results = await client.query(`
        SELECT "group".uuid, name, owner_uuid, "user".user_name as owner_name, latitude, longitude, description, max_members, 
          cover_photo, thumbnail, visibility, join_type, "group".status
        FROM "group" JOIN "user" ON "group".owner_uuid = "user".uuid`,
        []);

      
      return results.rows;
    });
  },
  createGroup: async (group: GroupDataModel) => {
    return pgsqlWrapperTransaction<string>(async (client: PoolClient) => {
      const resultInsert = await client.query(
        `INSERT INTO "group" (
          name, owner_uuid, latitude,
          longitude, description, max_members, cover_photo,
          thumbnail, visibility, join_type, status
        ) 
        VALUES (
          $1, $2, $3,
          $4, $5, $6, $7,
          $8, $9, $10, $11 
        )
        RETURNING uuid`, 
        [group.name, group.owner_uuid, group.latitude,
          group.longitude, group.description, group.max_members, group.cover_photo,
          group.thumbnail, GroupVisibilityType[group.visibility], GroupJoinType[group.join_type], GroupStatusType[group.status],
        ]);

      if (resultInsert.rowCount == 0) throw new ModelError({
        message: "Group insert error",
        type: ModelErrorType.Default
      })

      const results = await client.query(
        `INSERT INTO group_member (group_uuid, user_uuid, joined_time, privilege) VALUES ($1, $2, to_timestamp($3), $4) 
        ON CONFLICT (group_uuid, user_uuid)
          DO NOTHING
        RETURNING group_uuid, user_uuid`, 
        [resultInsert.rows[0].uuid, group.owner_uuid, Date.now() / 1000.0, GroupMemberPrivilegeType[GroupMemberPrivilegeType.admin]]);

      if (results.rowCount == 0) throw new ModelError({
        message: "Unable to add owner to group",
        type: ModelErrorType.Default
      })

      return resultInsert.rows[0].uuid;
    });
  },
  deleteGroup: async (uuid: string) => {
    return pgsqlWrapperTransaction<string>(async (client: PoolClient) => {
      const results = await client.query(
        `SELECT uuid
        FROM "group"
        WHERE uuid = $1`, 
        [uuid]);

      if (results.rowCount == 0) throw new ModelError({
        message: "Group not found",
        type: ModelErrorType.NotFonud
      })

      return results.rows[0].uuid;
    });
  },
}

export default model;

