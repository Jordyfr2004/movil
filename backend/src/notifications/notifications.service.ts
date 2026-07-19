import { Injectable, NotFoundException,Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationsGateway } from './notifications.gateway';
import {Notification,NotificationType } from './entities/notification.entity';
import { PushDeviceToken } from './entities/push-device-token.entity';
import { FirebaseService } from '../firebase/firebase.service';


@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    
    constructor(

        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,

        @InjectRepository(PushDeviceToken)
        private readonly pushDeviceTokenRepo: Repository<PushDeviceToken>,

        private readonly notificationsGateway: NotificationsGateway,

        private readonly firebaseService: FirebaseService,

    ) {}

    private async sendPushToUser(
        userId: string,
        title: string,
        body: string,
        data: Record<string, string> = {},
        ): Promise<void> {
        const devices = await this.pushDeviceTokenRepo.find({
            where: {
            user_id: userId,
            is_active: true,
            },
            order: {
            last_seen_at: 'DESC',
            },
        });

        if (devices.length === 0) {
            return;
        }

        try {
            const result = await this.firebaseService.sendToDevices(
            devices.map((device) => device.token),
            title,
            body,
            data,
            );

            if (!result) {
            return;
            }

            const invalidTokenIds = result.responses
            .map((response, index) => {
                const code = response.error?.code;

                const isInvalidToken =
                code === 'messaging/invalid-registration-token' ||
                code === 'messaging/registration-token-not-registered';

                if (response.success || !isInvalidToken) {
                return null;
                }

                return devices[index].id;
            })
            .filter((id): id is string => id !== null);

            if (invalidTokenIds.length === 0) {
            return;
            }

            await this.pushDeviceTokenRepo.update(
            {
                id: In(invalidTokenIds),
            },
            {
                is_active: false,
            },
            );
        } catch (error: unknown) {
            this.logger.error(
            'Error al enviar la notificación push',
            error instanceof Error ? error.stack : undefined,
            );
        }
    }

    async registerDeviceToken(
    userId: string,
    rawToken: string,
    ) {
        const token = rawToken.trim();

        let deviceToken =
            await this.pushDeviceTokenRepo.findOne({
            where: {
                token,
            },
            });

        if (deviceToken) {
            deviceToken.user_id =
            userId;

            deviceToken.platform =
            'android';

            deviceToken.is_active =
            true;

            deviceToken.last_seen_at =
            new Date();
        } else {
            deviceToken =
            this.pushDeviceTokenRepo.create({
                user_id: userId,
                token,
                platform: 'android',
                is_active: true,
                last_seen_at:
                new Date(),
            });
        }

        const savedToken =
            await this.pushDeviceTokenRepo.save(
            deviceToken,
            );

        return {
            message:
            'Dispositivo registrado para notificaciones push',

            data: {
            id: savedToken.id,
            platform:
                savedToken.platform,
            is_active:
                savedToken.is_active,
            last_seen_at:
                savedToken.last_seen_at,
            },
        };
    }


    notifyMenuAvailable( restaurant_id: string) {
        this.notificationsGateway.notifyMenuAvailable({
            restaurant_id: restaurant_id,
            message:'prueba el menu de hoy'
        });
    }

    notifyDishHidden(dish_id: string, restaurant_id: string,
    ) {
        this.notificationsGateway.notifyDishHidden({
            dish_id,
            restaurant_id,
        });
    }

    notifyDishAvailable(dish_id: string,restaurant_id: string        
    ) {
        this.notificationsGateway.notifyDishAvailable({
            dish_id,
            restaurant_id,
        });
    }

    notifyDishCreated(dish: any) {
        this.notificationsGateway.notifyDishCreated({ dish });
    }

    notifyDishUpdated(dish: any) {
        this.notificationsGateway.notifyDishUpdated({ dish });
    }

    notifyDishDeleted(dish_id: string, restaurant_id: string    
    ) {
        this.notificationsGateway.notifyDishDeleted({
            dish_id,
            restaurant_id,
        });
    }

    async notifyReservationDelivered(userId: string,payload: {
        reservation_id: string;
        status: string;
        delivery_status: string;
        delivered_at: Date;
        message: string;
    },
    ) {
    const notification = this.notificationRepo.create({
        user_id: userId,
        type: NotificationType.RESERVATION_DELIVERED,
        title: 'Reserva entregada',
        message: payload.message,
        reservation_id: payload.reservation_id,
        is_read: false,
        read_at: null,
    });

    const savedNotification =
        await this.notificationRepo.save(notification);

    this.notificationsGateway.notifyReservationDelivered(
        userId,
        {
        notification_id: savedNotification.id,
        reservation_id: payload.reservation_id,
        title: savedNotification.title,
        message: savedNotification.message,
        status: payload.status,
        delivery_status: payload.delivery_status,
        delivered_at: payload.delivered_at,
        is_read: savedNotification.is_read,
        created_at: savedNotification.created_at,
        },
    );

    await this.sendPushToUser(
        userId,
        savedNotification.title,
        savedNotification.message,
        {
            type: NotificationType.RESERVATION_DELIVERED,
            reservation_id: payload.reservation_id,
            status: payload.status,
            delivery_status: payload.delivery_status,
        },
    );

    return savedNotification;
    }

    async findMine(userId: string) {
        const notifications =
            await this.notificationRepo.find({
            where: {
                user_id: userId,
            },
            order: {
                created_at: 'DESC',
            },
            });

        return {
            data: notifications,
        };
    }
    

    async markAsRead(notificationId: string,userId: string,) {
        const notification =
            await this.notificationRepo.findOne({
            where: {
                id: notificationId,
                user_id: userId,
            },
            });

        if (!notification) {
            throw new NotFoundException(
            'Notificación no encontrada',
            );
        }

        if (!notification.is_read) {
            notification.is_read = true;
            notification.read_at = new Date();

            await this.notificationRepo.save(notification);
        }

        return {
            message: 'Notificación marcada como leída',
            data: notification,
        };
    }
}
