import { AuthAccount } from "src/auth/entities/auth-account.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export enum UserRole {
    STUDENTS = 'STUDENTS',
    MANAGER = 'MANAGER',
}



@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENTS,
    })
    role: UserRole;

    @Column({type: 'varchar', length: 255})
    full_name: string;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @Column({ type: 'boolean', default: true})
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => AuthAccount, (authAccount) => authAccount.user)
    auth_accounts: AuthAccount[];
}
