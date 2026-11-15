import { Module } from '@nestjs/common';

import { SlugService } from './slug/slug.service.js';

/**
 * Спільний модуль утиліт.
 *
 * Експортує SlugService, щоб його могли використовувати feature-модулі
 * (AutoPartsModule тощо). Без запису в exports провайдер залишився б
 * приватним для цього модуля.
 */
@Module({
  providers: [SlugService],
  exports: [SlugService],
})
export class SharedModule {}
