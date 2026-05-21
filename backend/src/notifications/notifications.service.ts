import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
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
}
