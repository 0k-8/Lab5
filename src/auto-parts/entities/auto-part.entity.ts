/** Стан автозапчастини — літеральний union (варіант 7). */
export type PartCondition = 'new' | 'refurbished';

/** Сутність предметної області — автозапчастина. */
export interface AutoPartEntity {
  id: string;
  title: string;
  price: number;
  oemCode: string;
  condition: PartCondition;
  carBrand: string;
  /** URL-безпечний ідентифікатор, що генерується через SlugService. */
  slug: string;
}
