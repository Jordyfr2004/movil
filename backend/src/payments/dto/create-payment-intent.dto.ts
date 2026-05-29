import { IsUUID } from "class-validator";




export class CreatePaymentIntentDto {
    @IsUUID()
    reservation_id!: string;
}