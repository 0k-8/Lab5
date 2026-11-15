import { SlugService } from './slug.service.js';

describe('SlugService', () => {
  const slugService = new SlugService();

  it('транслітерує українську назву у slug', () => {
    expect(slugService.generateSlug('Гальмівні колодки Bosch, передні')).toBe(
      'halmivni-kolodky-bosch-peredni',
    );
  });

  it('переводить у нижній регістр і замінює пробіли та знаки на дефіси', () => {
    expect(slugService.generateSlug('  Pro Laptop 16! ')).toBe('pro-laptop-16');
  });

  it('прибирає зайві дефіси на початку та в кінці', () => {
    expect(slugService.generateSlug('--- Test ---')).toBe('test');
  });
});
