import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module.js';
import { AutoPartsController } from './auto-parts.controller.js';
import { AutoPartsService } from './auto-parts.service.js';

/**
 * Feature-модуль каталогу автозапчастин.
 *
 * Імпортує SharedModule заради SlugService, реєструє власний
 * контролер і сервіс. Назовні сервіс поки не експортується —
 * це знадобиться на рівні 2 для OrdersModule.
 */
@Module({
  imports: [SharedModule],
  controllers: [AutoPartsController],
  providers: [AutoPartsService],
})
export class AutoPartsModule {}
