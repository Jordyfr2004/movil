import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum AuthProvider {
    LOCAL = 'LOCAL',
    UNIVERSITY = 'UNIVERSITY',
}


@Entity('auth_accounts')
export class AuthAccount {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid'})
    user_id: string;

    @Column({
        type: 'enum',
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    })
    provider: AuthProvider;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type:'varchar'})
    password_hash: string;

    @Column({ type: 'boolean', default: false})
    is_verified: boolean;

    @Column({ type: 'timestamp', nullable: true})
    last_login_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => User, (user) => user.auth_accounts, { nullable: false })
    @JoinColumn({ name: 'user_id'})
    user: User;
}