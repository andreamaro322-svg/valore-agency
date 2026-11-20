// Автовыбор языка на главной valoreagency.net.
//
// Работает ТОЛЬКО на «/». Внутренние страницы не трогаем: туда приходят из
// поиска, а поисковик уже выбирает язык по hreflang.
//
// Порядок решения:
//   1. Человек сам выбрал язык переключателем в шапке → cookie `lang`, уважаем.
//   2. Бот (Googlebot, Яндекс, превью в Telegram и т.п.) → никогда не уводим.
//      Иначе Googlebot, который ходит с американских IP, увидит вместо
//      русской главной редирект на /en/, и русская главная выпадет из индекса.
//   3. Русский в языках браузера стоит раньше английского → русская версия.
//   4. Английский раньше русского, или русского нет вовсе → решает страна по IP:
//      Россия, Беларусь, Казахстан, Киргизия → русская версия, остальные → /en/.
//      Так русскоязычный в Москве с английским интерфейсом браузера остаётся
//      на русской версии, а иностранец — уходит на английскую.
//
// Стоимость на Netlify: вызов Edge Function считается обычным web request
// (2 кредита за 10 000 запросов), отдельной платы за вычисления нет.

const RU_COUNTRIES = new Set(['RU', 'BY', 'KZ', 'KG']);

const BOT_UA =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|vkshare|whatsapp|telegram|yandex|google|bing|lighthouse|headless|curl|wget|python|http-client|okhttp/i;

export type Decision = 'ru' | 'en';

export interface Signals {
  cookieLang?: string | null;
  userAgent?: string | null;
  acceptLanguage?: string | null;
  country?: string | null;
}

/** Какой из языков, ru или en, браузер ставит выше. null — ни одного нет. */
export function preferredOf(acceptLanguage: string): Decision | null {
  const langs = acceptLanguage
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { lang: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q.slice(2)) : 1, i };
    })
    .filter((l) => l.lang && !Number.isNaN(l.q) && l.q > 0)
    // по убыванию q, при равенстве — в порядке перечисления
    .sort((a, b) => b.q - a.q || a.i - b.i);

  for (const l of langs) {
    if (l.lang === 'ru' || l.lang === 'en') return l.lang;
  }
  return null;
}

/** Куда отправить посетителя главной. 'ru' — оставить на «/». */
export function decide(s: Signals): Decision {
  if (s.cookieLang === 'ru' || s.cookieLang === 'en') return s.cookieLang;

  const ua = s.userAgent ?? '';
  if (!ua || BOT_UA.test(ua)) return 'ru';

  if (preferredOf(s.acceptLanguage ?? '') === 'ru') return 'ru';

  const country = (s.country ?? '').toUpperCase();
  // Страну не определили — не рискуем, оставляем основную версию.
  if (!country) return 'ru';
  return RU_COUNTRIES.has(country) ? 'ru' : 'en';
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

// Минимальный тип контекста Netlify — без импорта пакета @netlify/edge-functions.
interface NetlifyContext {
  geo?: { country?: { code?: string } };
  next: () => Promise<Response>;
}

export default async (request: Request, context: NetlifyContext) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return context.next();

  const decision = decide({
    cookieLang: readCookie(request.headers.get('cookie'), 'lang'),
    userAgent: request.headers.get('user-agent'),
    acceptLanguage: request.headers.get('accept-language'),
    country: context.geo?.country?.code,
  });

  if (decision === 'ru') return context.next();

  // 302, а не 301: решение зависит от посетителя, кэшировать его нельзя.
  // UTM-метки и прочие параметры переносим как есть.
  const url = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      location: `/en/${url.search}`,
      'cache-control': 'private, no-store',
      vary: 'Accept-Language, Cookie',
    },
  });
};

export const config = { path: '/' };
