import { Injectable } from '@nestjs/common';

import { SlugService } from '../shared/slug/slug.service.js';
import type { CreateAutoPartDto } from './dto/create-auto-part.dto.js';
import type { AutoPartEntity } from './entities/auto-part.entity.js';

/** Початкові тестові записи без slug (slug генерується сервісом). */
const INITIAL_AUTO_PARTS: ReadonlyArray<Omit<AutoPartEntity, 'slug'>> = [
  {
    id: 'part-001',
    title: 'Гальмівні колодки Bosch, передні',
    price: 1450,
    oemCode: '0 986 494 654',
    condition: 'new',
    carBrand: 'Volkswagen',
  },
  {
    id: 'part-002',
    title: 'Амортизатор KYB Excel-G, задній',
    price: 2380,
    oemCode: '343402',
    condition: 'new',
    carBrand: 'Volkswagen',
  },
  {
    id: 'part-003',
    title: 'Масляний фільтр MANN W 712/95',
    price: 320,
    oemCode: 'W 712/95',
    condition: 'refurbished',
    carBrand: 'Skoda',
  },
];

/**
 * Сервіс каталогу автозапчастин.
 *
 * Інкапсулює in-memory сховище та бізнес-логіку. SlugService
 * впроваджується через конструктор із SharedModule.
 */
@Injectable()
export class AutoPartsService {
  private readonly autoParts: AutoPartEntity[];
  private nextSequence = INITIAL_AUTO_PARTS.length + 1;

  constructor(private readonly slugService: SlugService) {
    this.autoParts = INITIAL_AUTO_PARTS.map((part) => ({
      ...part,
      slug: this.slugService.generateSlug(part.title),
    }));
  }

  /** Повертає всі автозапчастини каталогу. */
  findAll(): AutoPartEntity[] {
    return this.autoParts;
  }

  /** Знаходить автозапчастину за id або повертає undefined. */
  findOne(id: string): AutoPartEntity | undefined {
    return this.autoParts.find((part) => part.id === id);
  }

  /** Створює нову автозапчастину та генерує для неї slug. */
  create(dto: CreateAutoPartDto): AutoPartEntity {
    const entity: AutoPartEntity = {
      id: `part-${String(this.nextSequence).padStart(3, '0')}`,
      title: dto.title,
      price: dto.price,
      oemCode: dto.oemCode,
      condition: dto.condition,
      carBrand: dto.carBrand,
      slug: this.slugService.generateSlug(dto.title),
    };

    this.nextSequence += 1;
    this.autoParts.push(entity);
    return entity;
  }
}
