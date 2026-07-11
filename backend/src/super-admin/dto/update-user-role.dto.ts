import { IsEnum, IsUUID } from "class-validator";

export enum ManageableUserRole {
  STUDENT = 'STUDENT',
  MANAGER = 'MANAGER',
}


export class UpdateUserRoleDto {
    @IsUUID()
    user_id!: string;

    @IsEnum(ManageableUserRole)
    role!: ManageableUserRole;
}
