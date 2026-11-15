import type { PartCondition } from '../entities/auto-part.entity.js';

/**
 * DTO створення автозапчастини.
 *
 * `id` і `slug` формує сервер, тому в тілі запиту їх немає.
 */
export class CreateAutoPartDto {
  readonly title: string;
  readonly price: number;
  readonly oemCode: string;
  readonly condition: PartCondition;
  readonly carBrand: string;
}
