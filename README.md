# Практична робота №5 — рівень 1

**Тема:** модульна архітектура та ін'єкція залежностей у NestJS
**Варіант:** 7 — автозапчастини (`AutoPartsModule`, `AutoPartEntity`, `AutoPartsService`)
**Рівень:** 1 (базовий) — ізоляція feature-модуля, SharedModule та генерація slug

Робота містить лише рівень 1: каталог автозапчастин винесено в окремий `AutoPartsModule`, утилітарний `SlugService` — у `SharedModule`, а `AppModule` складається лише з імпортів модулів. `OrdersModule`, кастомні провайдери `STORE_CONFIG`/`FEE_CALCULATOR`, lifecycle hooks і scope-провайдери належать до рівнів 2–3 і не реалізовані.

---

## 1. Що реалізовано

| Пункт методички (рівень 1) | Де реалізовано |
| --- | --- |
| Генерація feature-модуля через CLI | `npx @nestjs/cli g mo auto-parts` → `src/auto-parts/auto-parts.module.ts` |
| Генерація спільного модуля через CLI | `npx @nestjs/cli g mo shared` → `src/shared/shared.module.ts` |
| Контролер і сервіс перенесені у feature-модуль | `controllers: [AutoPartsController]`, `providers: [AutoPartsService]` |
| `AppModule` містить лише імпорти модулів | `src/app.module.ts` |
| Генерація `SlugService` у `SharedModule` | `npx @nestjs/cli g s shared/slug --no-spec` |
| Метод `generateSlug(title: string): string` | `src/shared/slug/slug.service.ts` |
| `SlugService` у `exports` модуля `SharedModule` | `src/shared/shared.module.ts` |
| `SharedModule` у `imports` модуля `AutoPartsModule` | `src/auto-parts/auto-parts.module.ts` |
| Constructor injection `SlugService` у `AutoPartsService` | `src/auto-parts/auto-parts.service.ts` |
| Автоматичне збереження поля `slug` при створенні | `AutoPartsService.create()` |
| REST-ендпоінти для перевірки | `GET /auto-parts`, `GET /auto-parts/:id`, `POST /auto-parts` |

**Що не входить у рівень 1 (свідомо не реалізовано):** `OrdersModule` і міжмодульна взаємодія, `exports` сервісу каталогу, `STORE_CONFIG` (`useValue`), `FEE_CALCULATOR` (`useFactory`), `OnModuleInit`, `Scope.REQUEST`/`Scope.TRANSIENT`, обробка `404 Not Found`. Це завдання рівнів 2–3.

---

## 2. Структура проєкту

```text
Lab5/
├── package.json
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── .gitignore
├── requests.http                     # запити для VS Code REST Client
├── README.md
├── src/
│   ├── main.ts                       # точка входу, listen(3000)
│   ├── app.module.ts                 # лише imports: [AutoPartsModule, SharedModule]
│   ├── shared/
│   │   ├── shared.module.ts          # providers + exports: [SlugService]
│   │   └── slug/
│   │       ├── slug.service.ts       # generateSlug(title)
│   │       └── slug.service.spec.ts  # unit-тести
│   └── auto-parts/
│       ├── auto-parts.module.ts      # imports: [SharedModule]
│       ├── auto-parts.controller.ts  # HTTP-маршрути
│       ├── auto-parts.service.ts     # in-memory каталог + slug
│       ├── dto/
│       │   └── create-auto-part.dto.ts
│       └── entities/
│           └── auto-part.entity.ts
└── test/
    └── app.e2e-spec.ts               # e2e-перевірка модульної взаємодії
```

Проєкт створено командами NestJS CLI:

```bash
npx @nestjs/cli@latest new lab-5 --strict --package-manager npm --skip-git
npx @nestjs/cli g mo auto-parts
npx @nestjs/cli g mo shared
npx @nestjs/cli g s shared/slug --no-spec
npx @nestjs/cli g co auto-parts --no-spec
npx @nestjs/cli g s auto-parts --no-spec
```

Стандартні `AppController` та `AppService`, які CLI генерує для `GET /`, видалені: за вимогою рівня 1 у кореневому модулі не повинно бути нічого, крім імпортів модулів.

---

## 3. Запуск

Потрібен Node.js 18+ (у роботі — Node.js 24.17.0, npm 11.13.0).

```powershell
cd C:\Users\denys\Розробка WEB-застосувань\Lab5

npm install          # один раз
npm run start:dev    # режим розробки з перезапуском
```

Сервер: `http://localhost:3000`. Зупинка — `Ctrl+C`.

Додаткові команди:

```powershell
npm run build        # компіляція у dist/
npm run lint         # oxlint, без виводу = без зауважень
npm test             # unit-тести SlugService
npm run test:e2e     # e2e-тести AutoParts
```

Перевірка API — через `requests.http`, Postman або `curl`.

---

## 4. Фактичний результат виконання

### 4.1. Старт застосунку

```text
> lab-5@0.0.1 start
> nest start

[Nest] 15160  - 04.11.2026, 15:51:15     LOG [NestFactory] Starting Nest application...
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [InstanceLoader] AppModule dependencies initialized +6ms
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [InstanceLoader] SharedModule dependencies initialized +0ms
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [InstanceLoader] AutoPartsModule dependencies initialized +0ms
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [RoutesResolver] AutoPartsController {/auto-parts}: +5ms
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [RouterExplorer] Mapped {/auto-parts, GET} route +2ms
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [RouterExplorer] Mapped {/auto-parts/:id, GET} route +1ms
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [RouterExplorer] Mapped {/auto-parts, POST} route +0ms
[Nest] 15160  - 04.11.2026, 15:51:15     LOG [NestApplication] Nest application successfully started +1ms
```

`SharedModule` ініціалізується раніше за `AutoPartsModule`, бо `AutoPartsModule` його імпортує — це видно в логах `InstanceLoader`.

### 4.2. `GET /auto-parts` — початковий каталог зі slug

```http
GET /auto-parts HTTP/1.1
Host: localhost:3000
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":"part-001","title":"Гальмівні колодки Bosch, передні","price":1450,"oemCode":"0 986 494 654","condition":"new","carBrand":"Volkswagen","slug":"halmivni-kolodky-bosch-peredni"},{"id":"part-002","title":"Амортизатор KYB Excel-G, задній","price":2380,"oemCode":"343402","condition":"new","carBrand":"Volkswagen","slug":"amortyzator-kyb-excel-g-zadnii"},{"id":"part-003","title":"Масляний фільтр MANN W 712/95","price":320,"oemCode":"W 712/95","condition":"refurbished","carBrand":"Skoda","slug":"maslyanyi-filtr-mann-w-712-95"}]
```

Slug для початкових записів згенеровано тим самим `SlugService` у конструкторі сервісу, тому він завжди відповідає назві.

### 4.3. `GET /auto-parts/part-002`

```http
GET /auto-parts/part-002 HTTP/1.1
Host: localhost:3000
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":"part-002","title":"Амортизатор KYB Excel-G, задній","price":2380,"oemCode":"343402","condition":"new","carBrand":"Volkswagen","slug":"amortyzator-kyb-excel-g-zadnii"}
```

### 4.4. `POST /auto-parts` — створення з автоматичним slug

```http
POST /auto-parts HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Гальмівні диски Brembo, передні",
  "price": 2890,
  "oemCode": "09.A417.11",
  "condition": "new",
  "carBrand": "Volkswagen"
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":"part-004","title":"Гальмівні диски Brembo, передні","price":2890,"oemCode":"09.A417.11","condition":"new","carBrand":"Volkswagen","slug":"halmivni-dysky-brembo-peredni"}
```

Клієнт не передає ні `id`, ні `slug`: `id` формує сервіс (`part-004`), `slug` — `SlugService` із назви товару.

### 4.5. Каталог після створення

```json
[
  {"id":"part-001","title":"Гальмівні колодки Bosch, передні","price":1450,"oemCode":"0 986 494 654","condition":"new","carBrand":"Volkswagen","slug":"halmivni-kolodky-bosch-peredni"},
  {"id":"part-002","title":"Амортизатор KYB Excel-G, задній","price":2380,"oemCode":"343402","condition":"new","carBrand":"Volkswagen","slug":"amortyzator-kyb-excel-g-zadnii"},
  {"id":"part-003","title":"Масляний фільтр MANN W 712/95","price":320,"oemCode":"W 712/95","condition":"refurbished","carBrand":"Skoda","slug":"maslyanyi-filtr-mann-w-712-95"},
  {"id":"part-004","title":"Гальмівні диски Brembo, передні","price":2890,"oemCode":"09.A417.11","condition":"new","carBrand":"Volkswagen","slug":"halmivni-dysky-brembo-peredni"}
]
```

### 4.6. Перевірка збірки та тестів

```text
> npm run build
> nest build
(без помилок)

> npm run lint
> oxlint --type-aware src/ test/
(без зауважень)

> npm test
Test Files  1 passed (1)
     Tests  3 passed (3)

> npm run test:e2e
Test Files  1 passed (1)
     Tests  3 passed (3)
```

Unit-тести перевіряють транслітерацію, нижній регістр, заміну розділових знаків і обрізання зайвих дефісів. E2E-тести — початковий каталог, генерацію `id`/`slug` у `POST` і пошук за `id`.

---

## 5. Пояснення реалізації

### 5.1. Кореневий модуль

```ts
@Module({
  imports: [AutoPartsModule, SharedModule],
})
export class AppModule {}
```

`AppModule` більше не знає про `AutoPartsController` і `AutoPartsService` — він лише збирає модулі. Це і є модульна декомпозиція: кореневий модуль відповідає за композицію, а не за бізнес-логіку.

### 5.2. Feature-модуль каталогу

```ts
@Module({
  imports: [SharedModule],
  controllers: [AutoPartsController],
  providers: [AutoPartsService],
})
export class AutoPartsModule {}
```

- `imports: [SharedModule]` — дає доступ до експортованого `SlugService`;
- `controllers` — HTTP-маршрути каталогу;
- `providers` — сервіс каталогу, створений IoC-контейнером.

### 5.3. Shared-модуль

```ts
@Module({
  providers: [SlugService],
  exports: [SlugService],
})
export class SharedModule {}
```

Провайдер за замовчуванням приватний. Без `exports: [SlugService]` модуль `AutoPartsModule` не зміг би отримати цей сервіс, і NestJS під час старту кинув би помилку приблизно такого змісту:

```text
Nest can't resolve dependencies of the AutoPartsService (?).
Please make sure that the argument SlugService at index [0] is available
in the AutoPartsModule context.
```

Саме тому пара `exports` + `imports` є обов'язковою умовою міжмодульної ін'єкції.

### 5.4. Constructor injection

```ts
@Injectable()
export class AutoPartsService {
  constructor(private readonly slugService: SlugService) {}
}
```

NestJS читає тип параметра конструктора з метаданих (`emitDecoratorMetadata`) і передає готовий екземпляр `SlugService`. Сервіс не створює залежність через `new` — цим керує IoC-контейнер.

### 5.5. Генерація slug

```ts
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
```

Алгоритм:

1. усе переводиться в нижній регістр;
2. кожна українська літера замінюється латинським відповідником за таблицею (`г → h`, `ж → zh`, `ї → yi`, `ь → ''` тощо);
3. будь-яка послідовність символів, що не є латинською літерою або цифрою, замінюється одним дефісом;
4. дефіси на початку й у кінці прибираються.

Приклади:

| Вхід | Вихід |
| --- | --- |
| `Гальмівні колодки Bosch, передні` | `halmivni-kolodky-bosch-peredni` |
| `Pro Laptop 16` | `pro-laptop-16` |
| `--- Test ---` | `test` |

### 5.6. Сервіс каталогу

```ts
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

  findAll(): AutoPartEntity[] { return this.autoParts; }
  findOne(id: string): AutoPartEntity | undefined { /* ... */ }

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
```

Сховище — звичайний масив у пам'яті процесу. Після перезапуску сервера залишаються лише три початкові записи.

### 5.7. Контролер як тонкий шар

```ts
@Controller('auto-parts')
export class AutoPartsController {
  constructor(private readonly autoPartsService: AutoPartsService) {}

  @Get()
  findAll(): AutoPartEntity[] {
    return this.autoPartsService.findAll();
  }

  @Post()
  create(@Body() createAutoPartDto: CreateAutoPartDto): AutoPartEntity {
    return this.autoPartsService.create(createAutoPartDto);
  }
}
```

Контролер не працює з масивом безпосередньо: він лише приймає HTTP-запит і делегує роботу сервісу. Це дозволяє тестувати бізнес-логіку окремо від HTTP-шару.

---

## 6. Відповіді на контрольні питання

**1. Що таке Feature Module і Shared Module?**
Feature Module — це модуль, що інкапсулює одну предметну область: свої контролери, сервіси, DTO та, за потреби, власні провайдери. У роботі це `AutoPartsModule` (каталог автозапчастин). Shared Module — це модуль багаторазових утиліт або інфраструктури, який експортує провайдери для інших модулів; у роботі це `SharedModule` зі `SlugService`. Feature-модулів може бути багато і вони ізольовані, shared-модуль зазвичай один-два і містить те, що потрібно кільком feature-модулям.

**2. Як працює інкапсуляція провайдерів?**
Кожен провайдер за замовчуванням видимий лише в межах свого модуля. Щоб інший модуль міг його використати, модуль-власник має додати провайдера в `exports`, а модуль-споживач — імпортувати модуль-власник у `imports`. Якщо `exports` немає, NestJS не знайде залежність і під час старту кине `Nest can't resolve dependencies...`, вказуючи, який саме токен і в якому модулі не знайдено.

**3. Різниця між `useClass`, `useValue` і `useFactory`.**
`useClass` — стандартна стратегія: контейнер сам створює екземпляр класу (скорочений запис `providers: [MyService]`). `useValue` — реєструє готовий статичний об'єкт, конфігурацію або примітив під токеном; використовується для констант і налаштувань. `useFactory` — викликає фабричну функцію, яка може залежати від інших провайдерів через `inject`, і повертає значення або екземпляр динамічно. У роботі використано лише звичайний `useClass` (через скорочений запис); `useValue` і `useFactory` — теми рівня 2.

**4. Для чого `@Inject()`?**
NestJS автоматично визначає залежність за типом параметра конструктора, але це працює лише для класів, які збереглися в рантаймі. Якщо токен — рядок, `symbol`, інтерфейс або абстрактний клас, типу в конструкторі недостатньо: потрібно явно вказати токен через `@Inject('TOKEN')`. Наприклад:

```ts
constructor(@Inject('STORE_CONFIG') private readonly config: StoreConfig) {}
```

`@Inject()` також потрібен для кастомних провайдерів, необов'язкових залежностей (`@Optional()`) і ручного вибору реалізації.

**5. Як працює `inject` у `useFactory`?**
`inject` — це масив токенів, які NestJS розв'язує перед викликом фабрики й передає її аргументами в тому самому порядку:

```ts
{
  provide: 'FEE_CALCULATOR',
  useFactory: (config: StoreConfig) => ({
    calculateTax: (amount: number) => amount * (config.taxPercent / 100),
  }),
  inject: ['STORE_CONFIG'],
}
```

Перший елемент `inject` стає першим аргументом фабрики, другий — другим і т.д. Якщо порядок змінити, у параметр потрапить не той провайдер.

**6. Що таке життєвий цикл і коли спрацьовує `OnModuleInit`?**
NestJS проходить фази: створення модульного графа → інстанціювання провайдерів → виклик `onModuleInit()` → `onApplicationBootstrap()` → робота застосунку → `onModuleDestroy()`/`onApplicationShutdown()`. `OnModuleInit` викликається після того, як усі залежності поточного модуля розв'язано, але до початку приймання запитів. У ньому рекомендовано виконувати ініціалізацію: початкове наповнення in-memory сховища, прогрів кешу, перевірку з'єднань. У цій роботі хук не використовується — це рівень 3; початкові записи створюються в конструкторі сервісу.

**7. `Scope.DEFAULT` vs `Scope.REQUEST` vs `Scope.TRANSIENT`.**
`Scope.DEFAULT` — singleton: один екземпляр провайдера на весь застосунок. `Scope.REQUEST` — новий екземпляр на кожен HTTP-запит (і для кожного споживача в межах цього запиту); використовується, коли потрібні дані запиту. `Scope.TRANSIENT` — новий екземпляр для кожного споживача, який його інжектує, незалежно від запиту. Request-scoped провайдери дорожчі за продуктивністю, бо змушують частину графа створюватися на кожен запит. У роботі використано типовий singleton-скоуп; дослідження scope — рівень 3.

**8. Що таке циклічна залежність і як її вирішує `forwardRef()`?**
Це ситуація, коли модуль A імпортує B, а B імпортує A (або сервіси посилаються один на одного в конструкторах). NestJS не може побудувати граф і кидає помилку про circular dependency. `forwardRef()` відкладає розв'язання посилання до моменту, коли обидва класи вже визначені:

```ts
@Module({ imports: [forwardRef(() => OrdersModule)] })
export class AutoPartsModule {}

@Module({ imports: [forwardRef(() => AutoPartsModule)] })
export class OrdersModule {}
```

Для сервісів аналогічно: `@Inject(forwardRef(() => OtherService))`. Краще уникати циклів через винесення спільної логіки в третій модуль, але `forwardRef()` — штатний засіб, якщо цикл неминучий. У роботі циклів немає: залежність одностороння — `AutoPartsModule → SharedModule`.

---

## 7. Що залишилося зробити вручну

1. **Скриншоти** (вимога методички):
   - термінал зі стартом NestJS: `SharedModule` та `AutoPartsModule` у `InstanceLoader`, маршрути `/auto-parts`;
   - `GET /auto-parts` у браузері або Postman — видно поле `slug`;
   - `POST /auto-parts` у Postman/REST Client — `201 Created` і згенерований `slug`;
   - термінал із `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e` без помилок.
2. **Git-репозиторій:**

```powershell
cd C:\Users\denys\Розробка WEB-застосувань\Lab5
git init
git add .
git commit -m "Практична №5: рівень 1, варіант 7 (модулі NestJS, SharedModule, slug)"
git branch -M main
git remote add origin <URL_репозиторію>
git push -u origin main
```

`node_modules/`, `dist/` і `*.tsbuildinfo` уже в `.gitignore`.

---

## 8. Примітки

- Проєкт продовжує варіант 7 із практичної №4: та сама сутність автозапчастини (`title`, `price`, `oemCode`, `condition`, `carBrand`), тепер із полем `slug`.
- Використано NestJS 12, TypeScript 6, ESM (`"type": "module"`), тому імпорти мають розширення `.js`.
- `AppModule` містить лише `imports` — службові `AppController`/`AppService` видалені, тому `GET /` повертає `404`, а вся робота зосереджена на `/auto-parts`.
- `id` нових записів послідовний (`part-004`, `part-005`, …) і скидається після перезапуску разом з усім in-memory сховищем.
- `SlugService` не гарантує унікальності slug для однакових назв — на рівні 1 це не вимагається.
- Рівні 2–3 (замовлення, `useValue`/`useFactory`, `OnModuleInit`, scope, `404` для неіснуючого товару) не реалізовані — робота виконана лише на рівень 1.
