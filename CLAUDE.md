# CLAUDE.md — valore-agency

Сайт digital-агентства **valoreagency.net** (P0). Astro 4, статическая сборка,
Netlify. Общий контекст — в `~/Claude/CLAUDE.md`.

Репозиторий: `andreamaro322-svg/valore-agency` (публичный).

**Это единственный прямой источник дохода.** При конфликте приоритетов —
выигрывает всегда. Любая правка здесь требует особой аккуратности.

## Стек и структура

Astro 4.16.19 + `@astrojs/sitemap`. Никаких фреймворков, БД и SSR —
на выходе чистый статический HTML.

```
src/layouts/Layout.astro     общий каркас: meta, OG, Organization JSON-LD
src/components/Header.astro
src/components/Footer.astro
src/components/Breadcrumb.astro
src/components/ContactCta.astro   блок «Способы связи», используется на нескольких страницах
src/pages/index.astro
src/pages/o-nas.astro
src/pages/kontakty.astro
src/pages/portfolio.astro
src/pages/politika-konfidencialnosti.astro
src/pages/uslugi/*.astro          5 страниц услуг
public/llms.txt                   описание услуг и цен для LLM
public/robots.txt
public/_redirects                 301: удалённая страница логотипов, домен netlify.app
public/logos/                     6 SVG-логотипов
```

Всего 10 страниц. Цены и описания услуг продублированы в `public/llms.txt` —
**при изменении цен править оба места.** 31 августа 2026 `llms.txt` уже один раз
отстал: цену аудита поменяли на странице, а в нём осталась старая.

## Две языковые версии (с 9 ноября 2026)

Русская — в корне, английская — под `/en/` (20 страниц: 10 + 10).

```
src/i18n.ts                    таблица пар RU↔EN, тексты шапки/подвала/CTA
src/data/prices.ts             ВСЕ цены: rub и usd, хелперы rub() / usd()
src/pages/en/**                английские страницы, свои слаги (/en/services/website-audit/)
netlify/edge-functions/lang-redirect.ts   автовыбор языка на главной «/»
tests/lang-redirect.test.mjs   npm test
```

- Язык страницы `Layout.astro` берёт из URL. `hreflang` (ru, en, x-default → en)
  и переключатель RU/EN в шапке строятся по таблице `pairs` в `src/i18n.ts`.
  **Новая страница с парой на другом языке — добавить строку в `pairs`.**
- Цены страницы берут из `src/data/prices.ts`. Менять цену — только там и в
  `public/llms.txt` (в нём RU-блок и EN-блок). 09.11.2026 рублёвые цены подняты
  ×2, долларовые — пересчёт по курсу ЦБ 82,14 ₽/$ с округлением до $50.
- Стили страниц с `<style>` (главная, «О нас», создание сайтов, портфолио)
  скопированы в EN-версии один в один. Правишь вёрстку — правь в обеих.
- Edge Function работает только на `/`: cookie `lang` (ставит переключатель) →
  боты не трогаются → русский в Accept-Language → страна по IP
  (RU/BY/KZ/KG остаются, остальные — 302 на `/en/`). Ботов не уводить никогда:
  Googlebot ходит с US-IP и иначе потеряет русскую главную. Стоит как обычный
  запрос (2 кредита Netlify за 10 000).

## Команды

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run preview
```

```bash
npm test
```

Проверки: `npm test` (логика автовыбора языка) и `npm run build`
(20 страниц за ~0.5 с). Прогонять после каждой правки.

## Деплой

Netlify собирает из ветки `main` репозитория при каждом пуше.

**`netlify.toml` в репозитории нет** — команда сборки и каталог публикации
заданы в интерфейсе Netlify. Значит, настройки сборки не под контролем версий:
менять их можно только через панель, и они нигде не задокументированы.
Аккаунт — Google `andreamaro322@gmail.com`.

Домен на Netim или Namecheap (уточнить по реестру SEO HQ).

## Секреты

Секретов в проекте нет: статический сайт без API, форм и бекенда.
Ничего в `.env` не требуется.

## Известные проблемы

### 1. Контакты — исправлено 31 августа 2026

Заглушки `PLACEHOLDER` и `tel:+70000000000` убраны. Остались **два** канала:

```
https://t.me/Valoreagency
https://vk.ru/id1127659934
```

Телефон и WhatsApp удалены целиком — вместе с иконками, упоминаниями в текстах
и в `sameAs` у Organization JSON-LD. Добавлять их обратно только по прямой
просьбе пользователя.

Правится в четырёх местах: `src/components/ContactCta.astro`,
`src/components/Footer.astro`, `src/pages/index.astro`, `src/layouts/Layout.astro`.

### 2. Отсутствуют og-image.jpg и logo.svg

`Layout.astro` ссылается на `https://valoreagency.net/og-image.jpg` (в OG-метатегах
всех страниц) и `https://valoreagency.net/logo.svg` (в JSON-LD). Обоих файлов
нет ни в `public/`, ни на проде — отдают 404. Ссылка на сайт в мессенджерах и
соцсетях выглядит пустой карточкой.

### 3. Canonical не совпадает с sitemap

Все `canonical` в `src/pages/*` заданы **без** конечного слэша
(`https://valoreagency.net/kontakty`), а Netlify отвечает на такой URL
301-редиректом на версию **со** слэшем. Sitemap при этом перечисляет адреса
со слэшем. То есть каждая страница объявляет каноническим тот URL, который
редиректит.

Чинить: добавить слэш в 10 объявлений `canonical` — либо задать
`trailingSlash` в `astro.config.mjs` и привести всё к одному виду.

### 4. Astro 4 с открытыми advisories

`npm audit` показывает high-severity уязвимости в Astro ≤7.0.9, esbuild, vite,
sharp. **Практический риск низкий:** почти всё относится к dev-серверу и SSR,
а сайт статический — в проде Astro не выполняется. Реально затронут только
dev-сервер на машине разработчика.

**Не запускать `npm audit fix --force`** — он ставит Astro 7, это ломающее
обновление, сборку придётся чинить. Обновление до Astro 5+ планировать
отдельной задачей с проверкой всех 10 страниц.

## Подводные камни

- Портфолио на `/portfolio/` до 31 августа 2026 состояло из **десяти выдуманных
  проектов** («Дента+», «ПравоЩит», «СтройГрупп» и т.д.) с макетами в
  `public/mockups/`. Заменено на три реально запущенных сайта: gamedaily.ru,
  kasparova-osnovi.ru, psychologistdarya.online. Новые проекты добавлять в массив
  `works` в `src/pages/portfolio.astro` по тому же шаблону.
- Страницы `/uslugi/razrabotka-logotipov/` больше нет — услуга осталась текстом
  на главной и в «О нас», URL отдаёт 301 на `/uslugi/sozdanie-sajtov`
  (см. `public/_redirects`).
- На `/uslugi/sozdanie-sajtov/` **сознательно нет цен** — стоимость обсуждается
  индивидуально. На главной цены («от 35 000 ₽») пока остались, это расхождение
  между страницами.
- Локальная папка `~/Claude/Projects/Website creating Valore Agenct/Valore Agency - сайт агентства`
  — устаревший снимок от 5 июля 2026 **без git**. В нём другие макеты
  (auto-detailing, psychologist, construction, lawyer), заменённые 8 июля.
  Источник правды — этот репозиторий, снимок не использовать.
- История репозитория состоит из коммитов «Add files via upload» — файлы
  заливались через веб-интерфейс GitHub. Осмысленного diff между версиями нет.
- Цены живут в `src/data/prices.ts` и дублируются только в `public/llms.txt`.
