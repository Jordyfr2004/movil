import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsGateway } from './notifications.gateway';
import {Notification,NotificationType } from './entities/notification.entity';


@Injectable()
export class NotificationsService {
    constructor(

        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,

        private readonly notificationsGateway: NotificationsGateway,

    ) {}

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
