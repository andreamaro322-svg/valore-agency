// Две языковые версии сайта: русская в корне, английская под /en/.
//
// У страниц разные слаги (/uslugi/audit-sajtov/ ↔ /en/services/website-audit/),
// поэтому соответствие задано явной таблицей. По ней строятся hreflang в <head>
// и ссылка переключателя языка в шапке. Новая страница, у которой есть пара
// на другом языке, добавляется сюда — иначе у неё не будет ни hreflang,
// ни переключателя.

export type Lang = 'ru' | 'en';

export const SITE = 'https://valoreagency.net';

const pairs: Array<[ru: string, en: string]> = [
  ['/', '/en/'],
  ['/uslugi/sozdanie-sajtov/', '/en/services/web-development/'],
  ['/uslugi/seo-geo-prodvizhenie/', '/en/services/seo-geo/'],
  ['/uslugi/audit-sajtov/', '/en/services/website-audit/'],
  ['/uslugi/podderzhka-sajtov/', '/en/services/website-support/'],
  ['/uslugi/linkbilding/', '/en/services/link-building/'],
  ['/portfolio/', '/en/portfolio/'],
  ['/o-nas/', '/en/about/'],
  ['/kontakty/', '/en/contact/'],
  ['/politika-konfidencialnosti/', '/en/privacy-policy/'],
];

const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export function langOf(path: string): Lang {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'ru';
}

/** Пара страницы на обоих языках или null, если пары нет. */
export function alternates(path: string): { ru: string; en: string } | null {
  const p = withSlash(path);
  const pair = pairs.find(([ru, en]) => ru === p || en === p);
  return pair ? { ru: pair[0], en: pair[1] } : null;
}

export const ui = {
  ru: {
    htmlLang: 'ru',
    ogLocale: 'ru_RU',
    home: '/',
    contactId: 'zayavka',
    nav: [
      { href: '/uslugi/sozdanie-sajtov/', label: 'Создание сайтов' },
      { href: '/uslugi/seo-geo-prodvizhenie/', label: 'SEO / GEO' },
      { href: '/uslugi/audit-sajtov/', label: 'Аудит' },
      { href: '/portfolio/', label: 'Портфолио' },
      { href: '/o-nas/', label: 'О нас' },
    ],
    logoLabel: 'Valore Agency — на главную',
    navLabel: 'Основная навигация',
    headerCta: 'Обсудить проект',
    switchLabel: 'English version',
    switchText: 'EN',
    footerTagline: 'Digital-агентство полного цикла: сайты, продвижение в поиске и в нейросетях.',
    footerServicesTitle: 'Услуги',
    footerServices: [
      { href: '/uslugi/sozdanie-sajtov/', label: 'Создание сайтов' },
      { href: '/uslugi/audit-sajtov/', label: 'Аудит сайтов' },
      { href: '/uslugi/seo-geo-prodvizhenie/', label: 'SEO и GEO продвижение' },
      { href: '/uslugi/podderzhka-sajtov/', label: 'Поддержка сайтов' },
      { href: '/uslugi/linkbilding/', label: 'Услуги линкбилдинга' },
    ],
    footerCompanyTitle: 'Компания',
    footerCompany: [
      { href: '/o-nas/', label: 'О нас' },
      { href: '/portfolio/', label: 'Портфолио' },
      { href: '/kontakty/', label: 'Контакты' },
    ],
    footerContactsTitle: 'Контакты',
    vk: 'ВКонтакте',
    privacy: { href: '/politika-konfidencialnosti/', label: 'Политика конфиденциальности' },
    ctaTitle: 'Связаться с нами',
    ctaLead: 'Напишите удобным способом — ответим, зададим пару вопросов и предложим решение.',
    tgAria: 'Написать в Telegram',
    vkAria: 'Написать во ВКонтакте',
    breadcrumbLabel: 'Хлебные крошки',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    home: '/en/',
    contactId: 'contact',
    nav: [
      { href: '/en/services/web-development/', label: 'Web development' },
      { href: '/en/services/seo-geo/', label: 'SEO / GEO' },
      { href: '/en/services/website-audit/', label: 'Audit' },
      { href: '/en/portfolio/', label: 'Portfolio' },
      { href: '/en/about/', label: 'About' },
    ],
    logoLabel: 'Valore Agency — home page',
    navLabel: 'Main navigation',
    headerCta: 'Discuss a project',
    switchLabel: 'Русская версия',
    switchText: 'RU',
    footerTagline: 'Full-cycle digital agency: websites, search engine promotion and AI visibility.',
    footerServicesTitle: 'Services',
    footerServices: [
      { href: '/en/services/web-development/', label: 'Web development' },
      { href: '/en/services/website-audit/', label: 'Website audit' },
      { href: '/en/services/seo-geo/', label: 'SEO and GEO' },
      { href: '/en/services/website-support/', label: 'Website support' },
      { href: '/en/services/link-building/', label: 'Link building' },
    ],
    footerCompanyTitle: 'Company',
    footerCompany: [
      { href: '/en/about/', label: 'About' },
      { href: '/en/portfolio/', label: 'Portfolio' },
      { href: '/en/contact/', label: 'Contact' },
    ],
    footerContactsTitle: 'Contact',
    vk: 'VK',
    privacy: { href: '/en/privacy-policy/', label: 'Privacy policy' },
    ctaTitle: 'Get in touch',
    ctaLead: 'Message us wherever is convenient — we will reply, ask a couple of questions and suggest a solution.',
    tgAria: 'Message us on Telegram',
    vkAria: 'Message us on VK',
    breadcrumbLabel: 'Breadcrumbs',
  },
} as const;
