import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  applicationDefault,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import {
  BatchResponse,
  getMessaging,
  Messaging,
  Message,
} from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      FirebaseService.name,
    );

  private messaging!: Messaging;

  onModuleInit() {
    if (getApps().length === 0) {
      initializeApp({
        credential:
          applicationDefault(),
      });
    }

    this.messaging =
      getMessaging();

    this.logger.log(
      'Firebase Admin inicializado correctamente',
    );
  }

  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<
      string,
      string
    >,
  ): Promise<string> {
    return this.messaging.send({
      token,

      notification: {
        title,
        body,
      },

      data,

      android: {
        priority: 'high',

        notification: {
          channelId:
            'comedor_updates',

          sound: 'default',
        },
      },
    });
  }

  async sendToDevices(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<BatchResponse | null> {
    if (tokens.length === 0) {
      return null;
    }

    const messages: Message[] = tokens.map((token) => ({
      token,
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'comedor_updates',
          sound: 'default',
        },
      },
    }));

    return this.messaging.sendEach(messages);
  }
}