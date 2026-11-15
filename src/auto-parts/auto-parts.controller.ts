import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AutoPartsService } from './auto-parts.service.js';
import { CreateAutoPartDto } from './dto/create-auto-part.dto.js';
import type { AutoPartEntity } from './entities/auto-part.entity.js';

/**
 * REST-контролер автозапчастин.
 *
 * Контролер не зберігає дані та не містить бізнес-логіки — він лише
 * делегує виклики AutoPartsService, який впроваджено через конструктор.
 */
@Controller('auto-parts')
export class AutoPartsController {
  constructor(private readonly autoPartsService: AutoPartsService) {}

  /** GET /auto-parts — список усіх автозапчастин. */
  @Get()
  findAll(): AutoPartEntity[] {
    return this.autoPartsService.findAll();
  }

  /** GET /auto-parts/:id — автозапчастина за ідентифікатором. */
  @Get(':id')
  findOne(@Param('id') id: string): AutoPartEntity | { message: string } {
    return (
      this.autoPartsService.findOne(id) ?? {
        message: `Автозапчастину з ID ${id} не знайдено`,
      }
    );
  }

  /** POST /auto-parts — створення автозапчастини зі згенерованим slug. */
  @Post()
  create(@Body() createAutoPartDto: CreateAutoPartDto): AutoPartEntity {
    return this.autoPartsService.create(createAutoPartDto);
  }
}
