// Все цены сайта — в одном месте. RU-страницы берут rub, EN-страницы — usd.
//
// Раньше цены были вписаны строками прямо в страницы и в public/llms.txt и
// расходились между собой. Теперь страницы читают их отсюда; llms.txt
// по-прежнему статичный — при изменении цен править и его.
//
// 9 ноября 2026: все рублёвые цены подняты в 2 раза. Долларовые — пересчёт
// новых рублёвых по курсу ЦБ 82,14 ₽/$ (07.11.2026) с округлением до $50.

export const prices = {
  // Создание сайтов (главная)
  landing: { rub: 70000, usd: 850 },
  businessCard: { rub: 74000, usd: 900 },
  corporate: { rub: 90000, usd: 1100 },
  company: { rub: 110000, usd: 1350 },

  // SEO и GEO продвижение, в месяц
  seoGeo: { rub: 100000, usd: 1200 },

  // Аудит, разово
  audit: { rub: 20000, usd: 250 },

  // Поддержка, в месяц
  supportBasic: { rub: 30000, usd: 350 },
  supportStandard: { rub: 40000, usd: 500 },
  supportPremium: { rub: 60000, usd: 750 },

  // Линкбилдинг, в месяц
  linksStart: { rub: 30000, usd: 350 },
  linksGrowth: { rub: 60000, usd: 750 },
} as const;

export type PriceKey = keyof typeof prices;

/** 70000 → «70 000 ₽» (обычный пробел, как было на сайте до выноса цен). */
export const rub = (key: PriceKey): string =>
  `${String(prices[key].rub).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;

/** 1350 → «$1,350». */
export const usd = (key: PriceKey): string => `$${prices[key].usd.toLocaleString('en-US')}`;
