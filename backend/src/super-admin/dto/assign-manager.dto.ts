import { IsUUID } from "class-validator";



export class AssignManagerDto {
    @IsUUID()
    user_id!: string;

    @IsUUID()
    restaurant_id!: string;
}
