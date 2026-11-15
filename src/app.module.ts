import { Module } from '@nestjs/common';

import { AutoPartsModule } from './auto-parts/auto-parts.module.js';
import { SharedModule } from './shared/shared.module.js';

/**
 * Кореневий модуль.
 *
 * На рівні 1 тут залишаються лише імпорти feature- та shared-модулів:
 * контролер і сервіс автозапчастин повністю ізольовані в AutoPartsModule.
 */
@Module({
  imports: [AutoPartsModule, SharedModule],
})
export class AppModule {}
