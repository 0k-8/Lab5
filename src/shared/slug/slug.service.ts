import { Injectable } from '@nestjs/common';

/**
 * Таблиця транслітерації українських літер у латиницю.
 * Використовується для побудови URL-безпечних slug-рядків.
 */
const TRANSLITERATION: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'yi',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'yu',
  я: 'ya',
};

/** Спільний утилітарний сервіс генерації slug-рядків. */
@Injectable()
export class SlugService {
  /**
   * Перетворює назву товару на slug:
   * транслітерує кирилицю, нижній регістр, пробіли та розділові знаки — у дефіси.
   *
   * "Гальмівні колодки Bosch, передні" -> "halmivni-kolodky-bosch-peredni"
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .split('')
      .map((character) => TRANSLITERATION[character] ?? character)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }
}
