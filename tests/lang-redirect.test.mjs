// Тесты автовыбора языка на главной: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, { decide, preferredOf } from '../netlify/edge-functions/lang-redirect.ts';

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

test('preferredOf: порядок и q-веса', () => {
  assert.equal(preferredOf('ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'), 'ru');
  assert.equal(preferredOf('en-US,en;q=0.9,ru;q=0.8'), 'en');
  assert.equal(preferredOf('en;q=0.5,ru;q=0.9'), 'ru');
  assert.equal(preferredOf('it-IT,it;q=0.9'), null);
  assert.equal(preferredOf('it-IT,ru;q=0.5'), 'ru');
  assert.equal(preferredOf(''), null);
  assert.equal(preferredOf('ru;q=0,en'), 'en');
});

test('иностранец уходит на /en/', () => {
  assert.equal(decide({ userAgent: CHROME, acceptLanguage: 'en-US,en;q=0.9', country: 'US' }), 'en');
  assert.equal(decide({ userAgent: IPHONE, acceptLanguage: 'it-IT,it;q=0.9', country: 'IT' }), 'en');
  assert.equal(decide({ userAgent: CHROME, acceptLanguage: 'de-DE', country: 'DE' }), 'en');
});

test('русскоязычный остаётся на русской версии', () => {
  // русский браузер за границей
  assert.equal(decide({ userAgent: CHROME, acceptLanguage: 'ru-RU,ru;q=0.9,en;q=0.8', country: 'ES' }), 'ru');
  // английский браузер, но из России
  assert.equal(decide({ userAgent: CHROME, acceptLanguage: 'en-US,en;q=0.9', country: 'RU' }), 'ru');
  assert.equal(decide({ userAgent: IPHONE, acceptLanguage: 'en-GB', country: 'kz' }), 'ru');
});

test('ручной выбор в переключателе важнее всего', () => {
  assert.equal(decide({ cookieLang: 'ru', userAgent: CHROME, acceptLanguage: 'en-US', country: 'US' }), 'ru');
  assert.equal(decide({ cookieLang: 'en', userAgent: CHROME, acceptLanguage: 'ru-RU', country: 'RU' }), 'en');
});

test('боты и пустой User-Agent никогда не уводятся с русской главной', () => {
  const bots = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'TelegramBot (like TwitterBot)',
    'facebookexternalhit/1.1',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'curl/8.7.1',
    '',
  ];
  for (const ua of bots) {
    assert.equal(decide({ userAgent: ua, acceptLanguage: 'en-US', country: 'US' }), 'ru', ua);
  }
});

test('страна не определилась — остаёмся на основной версии', () => {
  assert.equal(decide({ userAgent: CHROME, acceptLanguage: 'en-US', country: '' }), 'ru');
});

test('handler: 302 на /en/ с сохранением UTM, без кэширования', async () => {
  const next = async () => new Response('RU HOME', { status: 200 });
  const req = new Request('https://valoreagency.net/?utm_source=ads&utm_campaign=x', {
    headers: { 'user-agent': CHROME, 'accept-language': 'en-US,en;q=0.9' },
  });
  const res = await handler(req, { geo: { country: { code: 'GB' } }, next });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), '/en/?utm_source=ads&utm_campaign=x');
  assert.match(res.headers.get('cache-control'), /no-store/);
});

test('handler: русский посетитель и cookie lang=ru получают обычную главную', async () => {
  const next = async () => new Response('RU HOME', { status: 200 });
  const ru = new Request('https://valoreagency.net/', {
    headers: { 'user-agent': CHROME, 'accept-language': 'ru-RU,ru' },
  });
  assert.equal((await handler(ru, { geo: { country: { code: 'DE' } }, next })).status, 200);

  const chose = new Request('https://valoreagency.net/', {
    headers: { 'user-agent': CHROME, 'accept-language': 'en-US', cookie: 'foo=1; lang=ru' },
  });
  assert.equal((await handler(chose, { geo: { country: { code: 'US' } }, next })).status, 200);
});

test('handler: POST не трогаем', async () => {
  const next = async () => new Response('ok', { status: 200 });
  const req = new Request('https://valoreagency.net/', { method: 'POST', headers: { 'user-agent': CHROME } });
  assert.equal((await handler(req, { geo: { country: { code: 'US' } }, next })).status, 200);
});
