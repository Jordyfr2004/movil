import {Injectable,InternalServerErrorException,} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class StorageService {
  private readonly supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async uploadDishImage(file: UploadedFile, restaurantId: string) {
    const extension = file.originalname.split('.').pop();

    const fileName =`${randomUUID()}.${extension}`;

    const filePath =`restaurants/${restaurantId}/${fileName}`;

    const { error } =
      await this.supabase.storage
        .from('dishes')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo subir la imagen',
      );
    }

    const { data } =
      this.supabase.storage
        .from('dishes')
        .getPublicUrl(filePath);

    return {
      path: filePath,
      url: data.publicUrl,
    };
  }

  async deleteDishImage(filePath: string) {
    const { error } =
      await this.supabase.storage
        .from('dishes')
        .remove([filePath]);

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo eliminar la imagen',
      );
    }
  }

  async uploadRestaurantImage(file: UploadedFile,restaurantId: string,) {
    const extensionMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    const extension = extensionMap[file.mimetype];

    if (!extension) {
      throw new InternalServerErrorException(
        'Formato de imagen no permitido',
      );
    }

    const fileName = `${randomUUID()}.${extension}`;
    const filePath = `${restaurantId}/${fileName}`;

    const { error } = await this.supabase.storage
      .from('restaurants')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo subir la imagen del restaurante',
      );
    }

    const { data } = this.supabase.storage
      .from('restaurants')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: data.publicUrl,
    };
  }

  async deleteRestaurantImage(filePath: string) {
    const { error } = await this.supabase.storage
      .from('restaurants')
      .remove([filePath]);

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo eliminar la imagen anterior',
      );
    }
  }
}
