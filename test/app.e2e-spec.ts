import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from './../src/app.module.js';

interface AutoPartResponse {
  id: string;
  title: string;
  slug: string;
}

describe('AutoParts (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /auto-parts повертає початковий каталог зі slug', async () => {
    const response = await request(app.getHttpServer())
      .get('/auto-parts')
      .expect(200);

    const body = response.body as AutoPartResponse[];

    expect(body).toHaveLength(3);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'part-001',
          slug: 'halmivni-kolodky-bosch-peredni',
        }),
      ]),
    );
  });

  it('POST /auto-parts присвоює id та генерує slug', async () => {
    const response = await request(app.getHttpServer())
      .post('/auto-parts')
      .send({
        title: 'Гальмівні диски Brembo, передні',
        price: 2890,
        oemCode: '09.A417.11',
        condition: 'new',
        carBrand: 'Volkswagen',
      })
      .expect(201);

    const body = response.body as AutoPartResponse;

    expect(body).toEqual(
      expect.objectContaining({
        id: 'part-004',
        slug: 'halmivni-dysky-brembo-peredni',
      }),
    );
  });

  it('GET /auto-parts/:id повертає знайдений запис', async () => {
    const response = await request(app.getHttpServer())
      .get('/auto-parts/part-002')
      .expect(200);

    const body = response.body as AutoPartResponse;

    expect(body.id).toBe('part-002');
    expect(body.slug).toBe('amortyzator-kyb-excel-g-zadnii');
  });
});
